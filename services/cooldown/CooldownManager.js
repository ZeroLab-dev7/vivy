const { PermissionsBitField } = require('discord.js');
const CooldownConfig = require('./CooldownConfig');
const CooldownStorage = require('./CooldownStorage');
const CooldownLogger = require('./CooldownLogger');
const SpamManager = require('./SpamManager');
const { isPremiumGuild } = require('../../utils/premiumHelper');
const { isDeveloper } = require('../../utils/developerHelper');
const { PremiumServer } = require('../../db/models');
const UI = require('../../utils/ui');

// Cache bot owners dynamically to prevent repeated fetches
let botOwnerIds = null;

async function getBotOwners(client) {
    if (botOwnerIds) return botOwnerIds;
    if (!client || !client.application) return [];
    try {
        const app = await client.application.fetch();
        if (app.owner) {
            if (app.owner.members) { // Team
                botOwnerIds = Array.from(app.owner.members.keys());
            } else { // Single owner
                botOwnerIds = [app.owner.id];
            }
        } else {
            botOwnerIds = [];
        }
    } catch (err) {
        console.error('[CooldownManager] Failed to fetch bot owner:', err);
        botOwnerIds = [];
    }
    return botOwnerIds;
}

async function isPremiumUser(userId) {
    try {
        const p = await PremiumServer.findOne({ where: { guild_id: userId, is_premium: true } });
        if (!p) return false;
        if (p.expires_at && new Date(p.expires_at) < new Date()) {
            await p.update({ is_premium: false });
            return false;
        }
        return true;
    } catch {
        return false;
    }
}

/**
 * Normalizes command category based on its folder or explicit category.
 */
function resolveCategory(command) {
    const rawCategory = command.category || 'Default';
    const folderToCategory = {
        'Admin Cmds': 'Moderation',
        'Admins Cmds': 'Moderation',
        'Economy Cmds': 'Economy',
        'Fun Cmds': 'Fun',
        'Games': 'Games',
        'Voice Cmds': 'Voice',
        'Security Cmds': 'Security',
        'Settings': 'Moderation',
        'Setup Apply': 'Moderation',
        'Setup Jail': 'Moderation',
        'Setup Mute': 'Moderation',
        'Setup Need Help': 'Moderation',
        'Setup Premium': 'Moderation',
        'Setup Verify': 'Moderation',
        'Setup Warn': 'Moderation',
        'Dev Cmds': 'Dev',
        'Owner Cmds': 'Owner',
        'Premium Cmds': 'Premium',
        'Leveling Cmds': 'Leveling',
        'Marriage Cmds': 'Marriage',
        'Member Cmds': 'Member',
        'Users Cmds': 'Member'
    };
    return folderToCategory[rawCategory] || rawCategory;
}

/**
 * Resolve the cooldown duration in milliseconds.
 */
async function resolveCooldownDuration(command, isPremium, category) {
    // 1. Check custom command-defined cooldown (e.g. cooldown: 3000 or cooldown: { default: 3000, premium: 1000 })
    if (command.cooldown !== undefined) {
        if (typeof command.cooldown === 'object') {
            if (isPremium && command.cooldown.premium !== undefined) {
                return command.cooldown.premium;
            }
            if (command.cooldown.default !== undefined) {
                return command.cooldown.default;
            }
        } else if (typeof command.cooldown === 'number') {
            return command.cooldown;
        }
    }

    // 2. Category level cooldowns from config
    const categoryKey = `cooldown_category_${category.toLowerCase()}`;
    const categoryCooldown = await CooldownConfig.get(categoryKey);
    if (categoryCooldown !== undefined) {
        return categoryCooldown;
    }

    // 3. Fallback to global defaults based on premium status
    if (isPremium) {
        return await CooldownConfig.get('cooldown_default_premium');
    }
    return await CooldownConfig.get('cooldown_default_normal');
}

/**
 * Handle replying to interactions or messages cleanly.
 */
async function sendAlert(context, embed) {
    if (context.author) { // Message (Prefix Command)
        return context.reply({ embeds: [embed] }).catch(() => {});
    } else if (typeof context.reply === 'function') { // Interaction (Slash Command / Buttons / etc.)
        if (context.replied || context.deferred) {
            return context.followUp({ embeds: [embed], ephemeral: true }).catch(() => {});
        }
        return context.reply({ embeds: [embed], ephemeral: true }).catch(() => {});
    }
}

/**
 * Core entry point for event handlers to check cooldowns and spam.
 * @param {object} context - Discord Message or Interaction
 * @param {object} command - The executed command object
 * @returns {Promise<object>} { blocked: boolean }
 */
async function check(context, command) {
    // Safety check for autocomplete interactions
    if (context && typeof context.isAutocomplete === 'function' && context.isAutocomplete()) {
        return { blocked: false };
    }

    const client = context.client;
    const guild = context.guild;
    const user = context.author || context.user;
    
    if (!user) return { blocked: false };
    
    const userId = user.id;
    const commandName = command.name || 'unknown';

    // 1. Owner Bypass
    const owners = await getBotOwners(client);
    if (owners.includes(userId)) {
        return { blocked: false };
    }

    // 2. Developer Bypass
    const isDev = await isDeveloper(userId, client);
    if (isDev) {
        return { blocked: false };
    }

    // 3. Permission Bypass
    if (guild && command.bypassPermissions && Array.isArray(command.bypassPermissions)) {
        const member = guild.members.cache.get(userId) || await guild.members.fetch(userId).catch(() => null);
        if (member) {
            const hasBypass = command.bypassPermissions.some(perm => member.permissions.has(perm));
            if (hasBypass) {
                return { blocked: false };
            }
        }
    }

    const now = Date.now();

    // 4. Check Active Punishments (e.g. Command Lock)
    const punishment = CooldownStorage.punishments.get(userId);
    if (punishment && punishment.expires > now) {
        if (punishment.type === 'command_lock' || punishment.type === 'command_mute') {
            const lockTimeLeft = Math.ceil((punishment.expires - now) / 1000);
            const lockEmbed = UI.createEmbed({
                title: '🚫 Access Limited',
                description: `You are sending commands too quickly.\nCommand access has been temporarily limited for **${lockTimeLeft} seconds**.`,
                color: '#FF3333'
            });
            await sendAlert(context, lockEmbed);
            
            // Log block event
            await CooldownLogger.logSpamEvent(client, {
                user,
                guild,
                command: commandName,
                category: resolveCategory(command),
                cooldown: 0,
                reason: `Blocked due to command_lock punishment (${lockTimeLeft}s left)`
            });
            
            return { blocked: true };
        }
    }

    // 5. Detect Premium Status
    const isGuildPremium = guild ? await isPremiumGuild(guild.id) : false;
    const isUserPremium = await isPremiumUser(userId);
    const isPremium = isGuildPremium || isUserPremium;

    // 6. Resolve Category & Cooldown Duration
    const category = resolveCategory(command);
    let cooldownDuration = await resolveCooldownDuration(command, isPremium, category);

    // Apply punishment multiplier if active
    if (punishment && punishment.expires > now && punishment.type === 'cooldown_increase') {
        const multiplier = punishment.multiplier || 3;
        cooldownDuration *= multiplier;
    }

    // 7. Resolve Cooldown Scope & Key
    const scope = command.cooldownScope || 'user'; // default, user, guild, global
    let cooldownKey = `user:${userId}:${commandName}`;
    if (scope === 'guild' && guild) {
        cooldownKey = `guild:${guild.id}:${commandName}`;
    } else if (scope === 'global') {
        cooldownKey = `global:${commandName}`;
    }

    // 8. Check Cooldown Expiration
    const expires = CooldownStorage.cooldowns.get(cooldownKey);
    if (expires && expires > now) {
        const timeLeft = (expires - now) / 1000;
        const cooldownEmbed = UI.createEmbed({
            title: '⏳ Slow Down!',
            description: `Please wait **${timeLeft.toFixed(1)}s** before using the \`${commandName}\` command again.`,
            color: '#FFFF33'
        });
        await sendAlert(context, cooldownEmbed);

        // Log cooldown hit
        await CooldownLogger.logSpamEvent(client, {
            user,
            guild,
            command: commandName,
            category,
            cooldown: cooldownDuration,
            reason: `Cooldown Active (${timeLeft.toFixed(1)}s left)`
        });

        return { blocked: true };
    }

    // 9. Update Anti-Spam scoring
    const spamCheck = await SpamManager.recordCommandAndCheckSpam(userId, client, guild, command, category);
    if (spamCheck.punished) {
        const lockTimeLeft = Math.ceil((spamCheck.punishment.expires - now) / 1000);
        const lockEmbed = UI.createEmbed({
            title: '🚫 Access Limited',
            description: `You are sending commands too quickly.\nCommand access has been temporarily limited for **${lockTimeLeft} seconds**.`,
            color: '#FF3333'
        });
        await sendAlert(context, lockEmbed);
        return { blocked: true };
    }

    // 10. Record new Cooldown entry
    if (cooldownDuration > 0) {
        CooldownStorage.cooldowns.set(cooldownKey, now + cooldownDuration);
    }

    return { blocked: false };
}

module.exports = {
    check
};
