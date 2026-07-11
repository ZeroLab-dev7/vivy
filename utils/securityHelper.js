const { TrustedEntity, SecurityLog, GuildSettings } = require('../db/models');
const { PermissionsBitField } = require('discord.js');
const UI = require('./ui');

/**
 * Checks if the given user executor ID is whitelisted or bypasses security checks.
 */
async function isExecutorTrusted(guild, executorId) {
    if (!guild || !executorId) return false;
    if (executorId === guild.ownerId) return true;
    if (executorId === guild.client.user.id) return true;
    
    const BOT_OWNER_ID = process.env.BOT_OWNER_ID;
    if (BOT_OWNER_ID && executorId === BOT_OWNER_ID) return true;

    // Check Security Owner Roles (comma separated from GuildSettings)
    const settings = await GuildSettings.findOne({ where: { guild_id: guild.id } });
    if (settings && settings.owner_role_id) {
        const ownerRoleIds = settings.owner_role_id.split(',').map(r => r.trim()).filter(Boolean);
        const member = await guild.members.fetch(executorId).catch(() => null);
        if (member && ownerRoleIds.some(id => member.roles.cache.has(id))) return true;
    }

    // Check directly whitelisted user
    const trustedUser = await TrustedEntity.findOne({
        where: {
            guild_id: guild.id,
            entity_id: executorId,
            type: 'user'
        }
    });
    if (trustedUser) return true;

    // Check if member has a whitelisted role
    const member = await guild.members.fetch(executorId).catch(() => null);
    if (member) {
        const trustedRoles = await TrustedEntity.findAll({
            where: {
                guild_id: guild.id,
                type: 'role'
            }
        });
        if (trustedRoles.some(r => member.roles.cache.has(r.entity_id))) return true;
    }

    return false;
}

/**
 * Punishes an executor user according to configuration.
 */
async function punishExecutor(guild, executorId, punishment, reason) {
    if (!punishment || punishment === 'none') return 'Logged only';
    
    // Check if the target is owner, developer or bot itself to avoid accidental self-lockouts
    if (executorId === guild.ownerId || executorId === guild.client.user.id || executorId === process.env.BOT_OWNER_ID) {
        return 'Bypassed (Owner/Dev/Bot)';
    }

    const member = await guild.members.fetch(executorId).catch(() => null);
    if (!member) return 'Failed (Member not in server)';

    // Verify bot permissions
    const me = guild.members.me;
    if (!me) return 'Failed (Bot member cached issue)';

    try {
        if (punishment === 'ban') {
            if (!me.permissions.has(PermissionsBitField.Flags.BanMembers) || !member.bannable) {
                return 'Failed (Missing Ban permissions)';
            }
            await member.ban({ reason });
            return 'Banned';
        } else if (punishment === 'kick') {
            if (!me.permissions.has(PermissionsBitField.Flags.KickMembers) || !member.kickable) {
                return 'Failed (Missing Kick permissions)';
            }
            await member.kick(reason);
            return 'Kicked';
        } else if (punishment === 'timeout') {
            if (!me.permissions.has(PermissionsBitField.Flags.ModerateMembers) || !member.moderatable) {
                return 'Failed (Missing Timeout permissions)';
            }
            await member.timeout(15 * 60 * 1000, reason); // Timeout for 15 minutes
            return 'Timed Out (15m)';
        }
    } catch (err) {
        console.error(`[PunishExecutor] Error executing ${punishment}:`, err);
        return `Failed (${err.message})`;
    }
    return 'None';
}

/**
 * Logs the security action in the database and sends a styled alert to the Discord log channel.
 */
async function logSecurityEvent(guild, { module, action, executor, target, oldValue, newValue, result, logChannelId }) {
    try {
        // Save to Database
        await SecurityLog.create({
            guild_id: guild.id,
            executor_id: executor?.id || null,
            executor_tag: executor?.tag || executor?.username || 'Unknown',
            target_id: target?.id || null,
            target_name: target?.name || target?.tag || 'Unknown',
            module,
            action,
            old_value: oldValue ? String(oldValue) : null,
            new_value: newValue ? String(newValue) : null,
            result
        });

        // Resolve logs channel
        let resolvedChannelId = logChannelId;
        if (!resolvedChannelId) {
            const settings = await GuildSettings.findOne({ where: { guild_id: guild.id } });
            resolvedChannelId = settings?.log_channel;
        }

        if (resolvedChannelId) {
            const channel = guild.channels.cache.get(resolvedChannelId);
            if (channel && channel.isTextBased()) {
                const embed = UI.createEmbed({
                    type: 'error',
                    title: `🛡️ Vivy Security Shield: ${module.toUpperCase()}`,
                    description: [
                        `**Event**: ${action}`,
                        `**Executor**: ${executor ? `${executor} (\`${executor.id}\`)` : 'Unknown'}`,
                        `**Target**: ${target?.name || target?.tag || target?.id || 'N/A'}`,
                        `**Status**: ${result}`,
                        oldValue ? `**Old State**: \`${oldValue}\`` : '',
                        newValue ? `**New State**: \`${newValue}\`` : ''
                    ].filter(Boolean).join('\n'),
                    color: 0x00FFFF
                });
                await channel.send({ embeds: [embed] }).catch(() => {});
            }
        }
    } catch (err) {
        console.error('[logSecurityEvent] Logging failed:', err);
    }
}

module.exports = { isExecutorTrusted, punishExecutor, logSecurityEvent };
