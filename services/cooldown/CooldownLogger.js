const { GuildSettings } = require('../../db/models');
const UI = require('../../utils/ui');

/**
 * Log a spam or cooldown violation event.
 * @param {object} client - Discord client
 * @param {object} data - Event log metadata
 * @param {object} data.user - User object
 * @param {object} [data.guild] - Guild object (null for DMs)
 * @param {string} data.command - Command name
 * @param {string} data.category - Command category
 * @param {number} data.cooldown - Cooldown in ms
 * @param {string} data.reason - Reason for block (cooldown, command_lock, etc.)
 */
async function logSpamEvent(client, data) {
    const { user, guild, command, category, cooldown, reason } = data;
    const username = user?.tag || user?.username || 'Unknown User';
    const userId = user?.id || 'Unknown ID';
    const guildName = guild?.name || 'DM/Global';
    const guildId = guild?.id || 'N/A';
    
    // 1. Console warning
    console.warn(`[AntiSpam] User ${username} (${userId}) in ${guildName} (${guildId}) was blocked from using command "${command}" (Category: ${category}) - Reason: ${reason} - Cooldown: ${cooldown}ms`);

    // 2. Guild log channel execution
    if (guild && typeof guild.channels?.cache?.get === 'function') {
        try {
            const settings = await GuildSettings.findOne({ where: { guild_id: guild.id } });
            const logChannelId = settings?.log_channel;
            if (logChannelId) {
                const channel = guild.channels.cache.get(logChannelId);
                if (channel && typeof channel.send === 'function') {
                    const embed = UI.createEmbed({
                        title: '🛡️ Anti-Spam Notification',
                        color: '#FF3333',
                        fields: [
                            { name: 'User', value: `**${username}** (${userId})`, inline: true },
                            { name: 'Command', value: `\`${command}\``, inline: true },
                            { name: 'Category', value: `\`${category}\``, inline: true },
                            { name: 'Cooldown', value: `${(cooldown / 1000).toFixed(1)}s`, inline: true },
                            { name: 'Reason', value: `**${reason}**`, inline: true }
                        ],
                        footer: `Security Logging | Guild: ${guildName}`
                    });
                    await channel.send({ embeds: [embed] }).catch(() => {});
                }
            }
        } catch (err) {
            console.error('[CooldownLogger] Error sending spam log to guild channel:', err);
        }
    }
}

module.exports = {
    logSpamEvent
};
