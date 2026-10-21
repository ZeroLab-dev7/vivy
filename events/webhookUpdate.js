const { AuditLogEvent } = require('discord.js');
const { SecuritySettings, GuildSettings } = require('../db/models');
const { isExecutorTrusted, punishExecutor, logSecurityEvent } = require('../utils/securityHelper');

module.exports = {
    name: 'webhooksUpdate',
    async execute(channel) {
        try {
            const guild = channel.guild;
            if (!guild) return;

            // Check if Anti-Webhook is enabled
            const settings = await SecuritySettings.findOne({ where: { guild_id: guild.id } });
            if (!settings || !settings.anti_webhook_enabled) return;

            // Fetch Audit Logs to see who created/updated/deleted the webhook
            const auditLogs = await guild.fetchAuditLogs({
                limit: 1,
                type: AuditLogEvent.WebhookCreate
            }).catch(() => null);

            const log = auditLogs?.entries.first();
            if (!log) return;

            // Check if the log is recent (within 8 seconds) to ensure it matches this event
            if (Date.now() - log.createdTimestamp > 8000) return;

            const executor = log.executor;
            if (!executor) return;

            // Check if executor is whitelisted/trusted
            const trusted = await isExecutorTrusted(guild, executor.id);
            if (trusted) return;

            // Executor is NOT trusted. Delete the webhook!
            const targetWebhook = log.target;
            if (targetWebhook) {
                const webhooks = await channel.fetchWebhooks().catch(() => null);
                const webhookToDelete = webhooks?.find(w => w.id === targetWebhook.id);

                if (webhookToDelete) {
                    await webhookToDelete.delete('Anti-Webhook: Unauthorized creation').catch(() => {});
                    console.log(`🗑️ Deleted unauthorized webhook created by ${executor.tag}`);

                    // Punish the executor
                    const punishmentResult = await punishExecutor(
                        guild,
                        executor.id,
                        settings.anti_webhook_punishment,
                        `Vivy Anti-Webhook: Unauthorized webhook creation in channel #${channel.name}`
                    );

                    // Log the event
                    await logSecurityEvent(guild, {
                        module: 'anti-webhook',
                        action: 'Webhook Created (Unauthorized)',
                        executor,
                        target: { id: targetWebhook.id, name: targetWebhook.name },
                        result: `Webhook deleted. Executor punished: ${punishmentResult}`,
                        logChannelId: settings.log_channel_id
                    });
                }
            }

        } catch (error) {
            console.error('Error in webhookUpdate event:', error);
        }
    },
};
