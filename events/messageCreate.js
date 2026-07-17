const UI = require('../utils/ui');
const Messages = require('../utils/messages');
const fs = require('fs');
const path = require('path');
const { getPrefix } = require('../db/prefix');
const { PermissionsBitField } = require('discord.js');
const AntiLink = require('../db/models/AntiLink');
const { GuildSettings } = require('../db/models');

const AutoModService = require('../services/autoModService');
const LevelService = require('../services/levelService');
const CustomCommandService = require('../services/customCommandService');
const GeneralService = require('../services/generalService');
const AiService = require('../services/aiService');

const musicSpamCache = new Map();

async function handleAntiLink(message, member) {
    const antiLinkSettings = await AntiLink.findOne({ where: { guild_id: message.guild.id } });
    if (!antiLinkSettings || !antiLinkSettings.is_enabled) return false;

    // Fetch Whitelisted Roles
    let whitelistedRoles = [];
    try {
        whitelistedRoles = JSON.parse(antiLinkSettings.whitelist_roles || '[]');
    } catch (e) { }

    const isServerOwner = message.author.id === message.guild.ownerId;
    const settings = await GuildSettings.findOne({ where: { guild_id: message.guild.id } });

    // Check for Security Owner Roles as well
    let ownerRoles = (settings?.owner_role_id || '').split(',').filter(Boolean);
    const hasOwnerRole = member.roles.cache.some(role => ownerRoles.includes(role.id));

    const hasWhitelistedRole = member.roles.cache.some(role => whitelistedRoles.includes(role.id));
    const isAdmin = member.permissions.has(PermissionsBitField.Flags.Administrator);

    // Absolute Bypass (Server Owner and Security Owner Roles bypass everything)
    if (isServerOwner || hasOwnerRole) return false;

    const linkRegex = /(https?:\/\/[^\s]+)/g;
    const links = message.content.match(linkRegex);
    if (!links) return false;

    let shouldDelete = false;
    let isMusicSpam = false;
    const musicDomains = ['spotify.com', 'spoti.fi', 'youtube.com', 'youtu.be', 'deezer.com', 'soundcloud.com', 'music.apple.com'];

    for (const link of links) {
        let url = '';
        try {
            const parsedUrl = new URL(link.toLowerCase().startsWith('http') ? link : `https://${link}`);
            url = parsedUrl.hostname.replace('www.', '');
        } catch (e) { continue; }

        // 1. Music Check (Allowed for everyone unless spam)
        if (musicDomains.some(d => url.includes(d))) {
            const now = Date.now();
            const userData = musicSpamCache.get(message.author.id) || { count: 0, lastTime: 0 };
            if (now - userData.lastTime < 10000) userData.count++;
            else userData.count = 1;
            userData.lastTime = now;
            musicSpamCache.set(message.author.id, userData);

            if (userData.count > 3 || links.length > 3) {
                isMusicSpam = true;
                shouldDelete = true;
                break;
            }
            continue;
        }

        // 2. Discord Invite Check (Applied to Whitelisted Roles and Admins too!)
        const discordRegex = /(discord\.(gg|io|me|li)|discordapp\.com\/invite)\/([a-zA-Z0-9-]{2,32})/i;
        const discordMatch = link.match(discordRegex);
        if (discordMatch) {
            const code = discordMatch[3];
            if (!code) {
                shouldDelete = true;
                break;
            }

            // Check Vanity (Allowed)
            if (message.guild.vanityURLCode && code.toLowerCase() === message.guild.vanityURLCode.toLowerCase()) continue;

            // Check InviteTracker Cache (Allowed)
            const tracker = message.client.inviteTracker;
            if (tracker) {
                const guildInvites = tracker.invites.get(message.guild.id);
                if (guildInvites && guildInvites.has(code)) continue;
            }

            // Final check: Fetch if missing (Allowed)
            try {
                const invite = await message.client.fetchInvite(code);
                if (invite && invite.guild?.id === message.guild.id) {
                    if (tracker && tracker.invites.has(message.guild.id)) {
                        tracker.invites.get(message.guild.id).set(invite.code, invite.uses || 0);
                    }
                    continue;
                }
            } catch (e) { }

            // External Discord Link -> DELETE even for Admins/Whitelisted
            shouldDelete = true;
            break;
        }

        // 3. Generic Links (Blocked only for regular users)
        if (!isAdmin && !hasWhitelistedRole) {
            shouldDelete = true;
            break;
        }
    }

    if (shouldDelete) {
        await message.delete().catch(() => { });
        const settings = await GuildSettings.findOne({ where: { guild_id: message.guild.id } });
        const logChannelId = settings?.log_channel;
        const logChannel = logChannelId ? message.guild.channels.cache.get(logChannelId) : null;

        if (logChannel) {
            const reason = isMusicSpam ? "Music Link Spam" : "Unauthorized Link Detected";
            await logChannel.send({
                components: [UI.createContainer({
                    color: 0xFF0000,
                    title: '🚫 Anti-Link Detection',
                    description: `**User:** ${message.author.tag} (\`${message.author.id}\`)\n**Channel:** ${message.channel}\n**Reason:** ${reason}\n**Content:** \`${message.content.substring(0, 100)}${message.content.length > 100 ? '...' : ''}\``,
                    footer: 'Security System'
                })],
                flags: 128
            });
        }
        return true;
    }
    return false;
}

module.exports = {
    name: 'messageCreate',
    async execute(message) {
        try {
            if (message.author.bot || !message.guild) return;
            const member = message.guild.members.cache.get(message.author.id);

            // Anti-Token Detection
            const suspiciousPatterns = /[\w\d]{24}\.[\w\d]{6}\.[\w\d-]{27}/g;
            if (suspiciousPatterns.test(message.content)) {
                await message.delete().catch(() => { });
                const settings = await GuildSettings.findOne({ where: { guild_id: message.guild.id } });
                const logChannelId = settings?.log_channel;
                if (logChannelId) {
                    const logChannel = message.guild.channels.cache.get(logChannelId);
                    if (logChannel) {
                        const container = UI.createContainer({
                            title: '☢️ Anti-Token Detection',
                            description: `**User:** ${message.author.tag}\n**Reason:** Token Leak Attempt\n**Action:** User Kicked`,
                            color: 0xFF0000
                        });
                        await logChannel.send({ components: [container], flags: 128 });
                    }
                }
                if (member) await member.kick('Token detected.').catch(() => { });
                return;
            }



            // AI Smart Moderation Check
            const smartModHandled = await AiService.checkSmartModeration(message);
            if (smartModHandled) return;

            // AI Auto-Reply Check
            const autoReplyHandled = await AiService.handleAutoReply(message);
            if (autoReplyHandled) return;

            // Custom Commands Check
            const customCmdHandled = await CustomCommandService.matchAndExecute(message);
            if (customCmdHandled) return;

            // Command Handling
            const prefix = await getPrefix(message.guild.id);
            const CustomAlias = require('../db/models/CustomAlias');
            const parts = message.content.trim().split(/ +/);
            const potentialAlias = parts[0].toLowerCase();

            const prefixlessAlias = await CustomAlias.findOne({
                where: { guild_id: message.guild.id, alias: potentialAlias, is_prefixless: true }
            });

            if (prefixlessAlias) {
                const cmd = message.client.commands.get(prefixlessAlias.command_name);
                if (cmd) {
                    const devHelper = require('../utils/developerHelper');
                    const check = await devHelper.checkMaintenanceAndDisabled(prefixlessAlias.command_name, message.author.id, message.client);
                    if (check.blocked) {
                        if (check.reason === 'maintenance') {
                            return message.reply({
                                components: [UI.createContainer({
                                    color: 0xFF9900,
                                    title: '🚧 Maintenance Mode Enabled',
                                    description: check.message
                                })]
                            }).catch(() => { });
                        } else if (check.reason === 'disabled') {
                            return message.reply({
                                components: [UI.createContainer({
                                    color: 0xFF0000,
                                    description: `<:no:1526496561188831244>**Command Disabled**\nThe \`${prefixlessAlias.command_name}\` command has been disabled globally by the developers.`
                                })]
                            }).catch(() => { });
                        }
                        return;
                    }
                    const CooldownManager = require('../services/cooldown/CooldownManager');
                    const cooldownCheck = await CooldownManager.check(message, cmd);
                    if (cooldownCheck.blocked) return;

                    await cmd.execute(message, parts.slice(1));
                    await devHelper.logCommand(prefixlessAlias.command_name, message.author.id, message.guild.id, 'prefix');
                    return;
                }
            }

            const isCommand = message.content.startsWith(prefix);

            // Leveling XP Update (ignore command calls to prevent cooldown hijacking)
            if (!isCommand) {
                await LevelService.addXP(message);
            }

            // Sticky Message Check
            await GeneralService.handleStickyMessage(message);

            if (!message.content.startsWith(prefix)) return;
            const args = message.content.slice(prefix.length).trim().split(/ +/);
            const commandName = args.shift().toLowerCase();
            let command = message.client.commands.get(commandName);

            if (!command) {
                for (const cmd of message.client.commands.values()) {
                    if (cmd.aliases && cmd.aliases.includes(commandName)) {
                        command = cmd;
                        break;
                    }
                }
            }

            if (!command) {
                const customAlias = await CustomAlias.findOne({
                    where: { guild_id: message.guild.id, alias: commandName, is_prefixless: false }
                });
                if (customAlias) command = message.client.commands.get(customAlias.command_name);
            }

            if (command) {
                const devHelper = require('../utils/developerHelper');
                const check = await devHelper.checkMaintenanceAndDisabled(command.name || commandName, message.author.id, message.client);
                if (check.blocked) {
                    if (check.reason === 'maintenance') {
                        return message.reply({
                            components: [UI.createContainer({
                                color: 0xFF9900,
                                title: '🚧 Maintenance Mode Enabled',
                                description: check.message
                            })]
                        }).catch(() => { });
                    } else if (check.reason === 'disabled') {
                        return message.reply({
                            components: [UI.createContainer({
                                color: 0xFF0000,
                                description: `<:no:1526496561188831244>**Command Disabled**\nThe \`${command.name || commandName}\` command has been disabled globally by the developers.`
                            })]
                        }).catch(() => { });
                    }
                    return;
                }
                const CooldownManager = require('../services/cooldown/CooldownManager');
                const cooldownCheck = await CooldownManager.check(message, command);
                if (cooldownCheck.blocked) return;

                await command.execute(message, args);
                await devHelper.logCommand(command.name || commandName, message.author.id, message.guild.id, 'prefix');
            }
        } catch (error) {
            console.error('Error processing message:', error);
            const errorEmbed = UI.createEmbed({
                description: Messages.error.generic()
            });
            await message.reply({ embeds: [errorEmbed] }).catch(() => { });
        }
    }
};
