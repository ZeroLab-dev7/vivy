const { Events, AuditLogEvent, ChannelType } = require('discord.js');
const { SecuritySettings } = require('../db/models');
const { isExecutorTrusted, punishExecutor, logSecurityEvent } = require('../utils/securityHelper');

module.exports = {
    name: Events.ChannelDelete,
    async execute(channel) {
        if (!channel.guild) return;

        try {
            // Check settings
            const settings = await SecuritySettings.findOne({ where: { guild_id: channel.guild.id } });
            if (!settings || !settings.channel_protection_enabled) return;

            // Fetch audit logs to identify the executor
            const auditLogs = await channel.guild.fetchAuditLogs({
                limit: 1,
                type: AuditLogEvent.ChannelDelete
            }).catch(() => null);

            const log = auditLogs?.entries.first();
            if (!log) return;

            // Ensure the log entry corresponds to this channel and is recent (within 8 seconds)
            if (log.targetId !== channel.id || Date.now() - log.createdTimestamp > 8000) return;

            const executor = log.executor;
            if (!executor) return;

            // Check if executor is whitelisted/trusted
            const trusted = await isExecutorTrusted(channel.guild, executor.id);
            if (trusted) return;

            // Unauthorized action: RESTORE channel
            const options = {
                name: channel.name,
                type: channel.type,
                parent: channel.parentId || null,
                permissionOverwrites: channel.permissionOverwrites.cache.map(ow => ({
                    id: ow.id,
                    type: ow.type,
                    allow: ow.allow.bitfield,
                    deny: ow.deny.bitfield
                })),
                reason: 'Vivy Channel Protection: Restoring deleted channel'
            };

            if (channel.type === ChannelType.GuildText || channel.type === ChannelType.GuildAnnouncement) {
                options.topic = channel.topic;
                options.nsfw = channel.nsfw;
            } else if (channel.type === ChannelType.GuildVoice || channel.type === ChannelType.GuildStageVoice) {
                options.bitrate = channel.bitrate;
                options.userLimit = channel.userLimit;
            }

            const restoredChannel = await channel.guild.channels.create(options).catch(console.error);

            // Punish the executor
            const punishmentResult = await punishExecutor(
                channel.guild,
                executor.id,
                settings.channel_protection_punishment,
                `Vivy Channel Protection: Unauthorized deletion of channel "${channel.name}"`
            );

            // Log the action
            await logSecurityEvent(channel.guild, {
                module: 'channel-protection',
                action: 'Channel Deleted (Unauthorized)',
                executor,
                target: channel,
                result: `Channel restored. Executor punished: ${punishmentResult}`,
                logChannelId: settings.log_channel_id
            });

        } catch (err) {
            console.error('[ChannelDeleteProtection] Error:', err);
        }
    }
};
