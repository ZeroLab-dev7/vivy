const { Events, AuditLogEvent } = require('discord.js');
const { SecuritySettings } = require('../db/models');
const { isExecutorTrusted, punishExecutor, logSecurityEvent } = require('../utils/securityHelper');

module.exports = {
    name: Events.ChannelUpdate,
    async execute(oldChannel, newChannel) {
        if (!newChannel.guild) return;

        try {
            // Check settings
            const settings = await SecuritySettings.findOne({ where: { guild_id: newChannel.guild.id } });
            if (!settings || !settings.channel_protection_enabled) return;

            // Check if permission overwrites changed
            const oldOverwrites = oldChannel.permissionOverwrites.cache;
            const newOverwrites = newChannel.permissionOverwrites.cache;

            let changed = oldOverwrites.size !== newOverwrites.size;
            if (!changed) {
                for (const [id, ow] of oldOverwrites.entries()) {
                    const newOw = newOverwrites.get(id);
                    if (!newOw || newOw.allow.bitfield !== ow.allow.bitfield || newOw.deny.bitfield !== ow.deny.bitfield) {
                        changed = true;
                        break;
                    }
                }
            }

            if (!changed) return;

            // Fetch audit logs to identify the executor
            const auditLogs = await newChannel.guild.fetchAuditLogs({
                limit: 1,
                type: AuditLogEvent.ChannelUpdate
            }).catch(() => null);

            const log = auditLogs?.entries.first();
            if (!log) return;

            // Ensure the log entry corresponds to this channel and is recent (within 8 seconds)
            if (log.targetId !== newChannel.id || Date.now() - log.createdTimestamp > 8000) return;

            const executor = log.executor;
            if (!executor) return;

            // Check if executor is whitelisted/trusted
            const trusted = await isExecutorTrusted(newChannel.guild, executor.id);
            if (trusted) return;

            // Unauthorized action: REVERT permission overwrites
            await newChannel.permissionOverwrites.set(
                oldOverwrites.map(ow => ({
                    id: ow.id,
                    type: ow.type,
                    allow: ow.allow.bitfield,
                    deny: ow.deny.bitfield
                })),
                'Vivy Channel Protection: Reverting unauthorized permissions change'
            ).catch(console.error);

            // Punish the executor
            const punishmentResult = await punishExecutor(
                newChannel.guild,
                executor.id,
                settings.channel_protection_punishment,
                `Vivy Channel Protection: Unauthorized modification of channel overwrites on "${newChannel.name}"`
            );

            // Log the action
            await logSecurityEvent(newChannel.guild, {
                module: 'channel-protection',
                action: 'Channel Overwrites Modified (Unauthorized)',
                executor,
                target: newChannel,
                result: `Channel overwrites reverted. Executor punished: ${punishmentResult}`,
                logChannelId: settings.log_channel_id
            });

        } catch (err) {
            console.error('[ChannelUpdateProtection] Error:', err);
        }
    }
};
