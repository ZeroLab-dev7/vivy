const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { LogSettings } = require('../db/models');
const UI = require('./ui');

/**
 * Log Types Mapping:
 * - welcome
 * - leave
 * - ban
 * - unban
 * - kick
 * - timeout
 * - voice_join
 * - voice_leave
 * - voice_move
 * - voice_mute
 * - voice_deafen
 * - voice_disconnect
 * - message_delete
 * - message_edit
 * - channel_create
 * - channel_delete
 * - channel_update
 * - role_create
 * - role_delete
 * - role_update
 * - nickname_change
 * - emoji_create
 * - emoji_delete
 * - emoji_update
 * - invite_create
 * - invite_delete
 */

async function getLogChannel(guild, logType) {
    if (!guild) return null;
    try {
        const settings = await LogSettings.findOne({ where: { guild_id: guild.id } });
        if (!settings || !settings.channels) return null;

        // Safely handle channels JSON string or object
        let channels = settings.channels;
        if (typeof channels === 'string') {
            try {
                channels = JSON.parse(channels);
            } catch {}
        }
        if (!channels) return null;

        let channelId = channels[logType];

        // Group-based fallbacks for missing individual log channel configurations
        if (!channelId) {
            if (['unban', 'kick', 'timeout'].includes(logType)) {
                channelId = channels['ban'];
            } else if (['voice-leave', 'voice-move', 'voice-mute', 'voice-deafen', 'voice-disconnect'].includes(logType)) {
                channelId = channels['voice-join'];
            } else if (['role-create', 'role-delete'].includes(logType)) {
                channelId = channels['role-update'];
            }
        }

        if (!channelId) return null;

        const channel = guild.channels.cache.get(channelId);
        if (!channel) return null;

        // Check permissions
        const me = guild.members.me;
        if (!channel.permissionsFor(me).has([PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.EmbedLinks])) {
            console.warn(`[LogManager] Missing permissions in channel ${channel.name} (${channel.id}) for guild ${guild.id}`);
            return null;
        }

        return channel;
    } catch (error) {
        console.error(`Error fetching log channel for ${logType}:`, error);
        return null;
    }
}

async function sendLog(guild, logType, embedData) {
    const channel = await getLogChannel(guild, logType);
    if (!channel) return;

    // Use shared UI utility for consistent embeds if available, otherwise build here
    // Verify specific requirements: EmbedBuilder, Timestamp, User avatar, Footer with Server Name

    // Ensure embedData has defaults
    if (!embedData.color) embedData.color = "Blue";
    if (!embedData.timestamp) embedData.timestamp = new Date();

    const embed = new EmbedBuilder()
        .setColor(embedData.color)
        .setTimestamp(embedData.timestamp);

    if (embedData.footer && embedData.footer.text) {
        embed.setFooter({
            text: embedData.footer.text,
            iconURL: embedData.footer.iconURL ?? undefined,
        });
    } else {
        embed.setFooter({
            text: guild.name,
            iconURL: guild.iconURL({ size: 64 }) ?? undefined,
        });
    }

    if (embedData.title) embed.setTitle(embedData.title);
    if (embedData.description) embed.setDescription(embedData.description);
    if (embedData.author) embed.setAuthor(embedData.author);
    if (embedData.fields) {
        const safeFields = embedData.fields.map(field => {
            let value = field.value;
            if (typeof value === 'string' && value.length > 1024) {
                value = value.substring(0, 1011) + '...[truncated]';
            }
            return { ...field, value };
        });
        embed.setFields(safeFields);
    }
    if (embedData.thumbnail) embed.setThumbnail(embedData.thumbnail);
    if (embedData.image) embed.setImage(embedData.image);

    try {
        await channel.send({ embeds: [embed] });
    } catch (error) {
        console.error(`Failed to send ${logType} log:`, error);
    }
}

/**
 * Fetch an audit log entry with a retry mechanism.
 * @param {Guild} guild - The guild where the action happened
 * @param {number} type - The AuditLogEvent type (e.g., 25 for Role Update)
 * @param {string} targetId - The ID of the target (user/channel/role)
 * @param {Function} extraCheck - Optional callback for additional validation
 * @returns {Promise<AuditLogEntry|null>} The audit log entry or null
 */
async function getAuditLogEntry(guild, type, targetId, extraCheck = null) {
    // Wait a moment for audit logs to populate (Discord API race condition)
    await new Promise(r => setTimeout(r, 2000));

    try {
        const fetchedLogs = await guild.fetchAuditLogs({
            limit: 5,
            type: type,
        });

        const log = fetchedLogs.entries.find(entry => {
            const isRecent = entry.createdTimestamp > (Date.now() - 15000);
            if (!isRecent) return false;

            if (targetId != null) {
                const isTarget = entry.target && entry.target.id === targetId;
                if (!isTarget) return false;
            }

            if (extraCheck) return extraCheck(entry);

            return true;
        });

        return log || null;
    } catch (error) {
        return null;
    }
}

async function getExecutor(guild, type, targetId, extraCheck = null) {
    const entry = await getAuditLogEntry(guild, type, targetId, extraCheck);
    return entry ? entry.executor : null;
}

module.exports = {
    getLogChannel,
    sendLog,
    getExecutor,
    getAuditLogEntry
};
