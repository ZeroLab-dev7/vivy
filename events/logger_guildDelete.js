const { Events, EmbedBuilder } = require('discord.js');
const { LogSettings } = require('../db/models');

module.exports = {
    name: Events.GuildDelete,
    async execute(guild) {
        if (!guild.available) return; // Ignore if the guild is unavailable (e.g. outage or startup caching)
        try {
            // Find global leave_log channel setup by Bot Owner
            const settings = await LogSettings.findAll();
            let logChannelId = null;
            let setupGuildId = null;
            
            for (const record of settings) {
                if (record.channels && record.channels.leave_log) {
                    logChannelId = record.channels.leave_log;
                    setupGuildId = record.guild_id;
                    break;
                }
            }

            if (!logChannelId) return;

            const devGuild = guild.client.guilds.cache.get(setupGuildId);
            if (!devGuild) return;

            const logChannel = devGuild.channels.cache.get(logChannelId);
            if (!logChannel) return;

            const embed = new EmbedBuilder()
                .setTitle('📤 Bot Left a Server')
                .setThumbnail(guild.iconURL({ dynamic: true }) || null)
                .setColor('Red')
                .addFields(
                    { name: '🏠 Server Name', value: guild.name || 'Unknown Server', inline: true },
                    { name: '🆔 Server ID', value: guild.id ? `\`${guild.id}\`` : 'Unknown', inline: true },
                    { name: '👥 Member Count', value: guild.memberCount ? `\`${guild.memberCount}\` members` : 'Unknown', inline: true }
                )
                .setFooter({ text: `Guild Delete Event | Server ID: ${guild.id}`, iconURL: guild.client.user.displayAvatarURL() })
                .setTimestamp();

            await logChannel.send({ embeds: [embed] });
        } catch (error) {
            console.error('[BotLeaveLog] Error:', error);
        }
    }
};
