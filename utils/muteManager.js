const { Mute, MuteSetup } = require('../db/models');
const UI = require('./ui');

/**
 * Parses a duration string like "1h 30m 10s" into milliseconds.
 * @param {string} durationStr 
 * @returns {number|null} 
 */
function parseDuration(durationStr) {
    if (!durationStr) return null;

    const regex = /(\d+)\s*([smhdwy])/g;
    let totalMs = 0;
    let match;
    let found = false;

    while ((match = regex.exec(durationStr.toLowerCase())) !== null) {
        found = true;
        const value = parseInt(match[1]);
        const unit = match[2];

        switch (unit) {
            case 's': totalMs += value * 1000; break;
            case 'm': totalMs += value * 1000 * 60; break;
            case 'h': totalMs += value * 1000 * 60 * 60; break;
            case 'd': totalMs += value * 1000 * 60 * 60 * 24; break;
            case 'w': totalMs += value * 1000 * 60 * 60 * 24 * 7; break;
            case 'y': totalMs += value * 1000 * 60 * 60 * 24 * 365; break;
        }
    }

    return found ? totalMs : null;
}

/**
 * Mutes a user.
 */
async function muteUser(guild, targetMember, moderator, durationMs, reason) {
    const config = await MuteSetup.findOne({ where: { guild_id: guild.id } });
    if (!config || !config.mute_role_id) throw new Error('Mute system not set up.');

    const muteRole = guild.roles.cache.get(config.mute_role_id);
    if (!muteRole) throw new Error('Mute role not found.');

    const expiresAt = durationMs ? new Date(Date.now() + durationMs) : null;

    // Add role
    await targetMember.roles.add(muteRole, `Muted by ${moderator.tag}${reason ? ': ' + reason : ''}`);

    // Save to DB
    await Mute.upsert({
        guild_id: guild.id,
        user_id: targetMember.id,
        role_id: muteRole.id,
        expires_at: expiresAt
    });

    // Log
    const logChannelId = config.mute_logs_channel;
    if (logChannelId) {
        const logChannel = guild.channels.cache.get(logChannelId);
        if (logChannel) {
            const logEmbed = UI.createEmbed({
                type: 'info',
                title: 'User Muted',
                description: [
                    `**User:** ${targetMember} (${targetMember.user.tag})`,
                    `**Moderator:** ${moderator}`,
                    `**Duration:** ${durationMs ? formatMs(durationMs) : 'Permanent'}`,
                    `**Reason:** ${reason || 'No reason provided.'}`
                ].join('\n'),
                color: 'Orange'
            });
            await logChannel.send({ embeds: [logEmbed] }).catch(() => { });
        }
    }
}

/**
 * Unmutes a user.
 */
async function unmuteUser(guild, targetId, moderator = null) {
    const config = await MuteSetup.findOne({ where: { guild_id: guild.id } });
    if (!config || !config.mute_role_id) return;

    const member = await guild.members.fetch(targetId).catch(() => null);
    if (member) {
        const muteRole = guild.roles.cache.get(config.mute_role_id);
        if (muteRole && member.roles.cache.has(muteRole.id)) {
            await member.roles.remove(muteRole, moderator ? `Unmuted by ${moderator.tag}` : 'Mute expired');
        }
    }

    // Remove from DB
    await Mute.destroy({ where: { guild_id: guild.id, user_id: targetId } });

    // Log
    const logChannelId = config.mute_logs_channel;
    if (logChannelId) {
        const logChannel = guild.channels.cache.get(logChannelId);
        if (logChannel) {
            const logEmbed = UI.createEmbed({
                type: 'info',
                title: 'User Unmuted',
                description: [
                    `**User:** <@${targetId}> (${targetId})`,
                    `**Moderator:** ${moderator || 'System (Expiry)'}`
                ].join('\n'),
                color: 'Green'
            });
            await logChannel.send({ embeds: [logEmbed] }).catch(() => { });
        }
    }
}

function formatMs(ms) {
    const seconds = Math.floor((ms / 1000) % 60);
    const minutes = Math.floor((ms / (1000 * 60)) % 60);
    const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
    const days = Math.floor(ms / (1000 * 60 * 60 * 24));

    const parts = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    if (seconds > 0) parts.push(`${seconds}s`);

    return parts.join(' ') || '0s';
}

/**
 * Checks for expired mutes and processes them.
 */
async function checkExpiredMutes(client) {
    try {
        const expired = await Mute.findAll({
            where: {
                expires_at: {
                    [require('sequelize').Op.lt]: new Date()
                }
            }
        });

        for (const mute of expired) {
            const guild = client.guilds.cache.get(mute.guild_id);
            if (guild) {
                await unmuteUser(guild, mute.user_id);
            } else {
                // If guild not found, just cleanup DB
                await Mute.destroy({ where: { id: mute.id } });
            }
        }
    } catch (error) {
        console.error('Error checking expired mutes:', error);
    }
}

module.exports = {
    parseDuration,
    muteUser,
    unmuteUser,
    checkExpiredMutes,
    formatMs
};
