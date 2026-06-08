const { AuditLogEvent } = require('discord.js');
const AntiWebhook = require('../db/models/AntiWebhook');
const { GuildSettings } = require('../db/models');

module.exports = {
    name: 'webhookUpdate',
    async execute(channel) {
        try {
            const guild = channel.guild;
            if (!guild) return;

            // Check if Anti-Webhook is enabled
            const antiWebhook = await AntiWebhook.findOne({ where: { guild_id: guild.id } });
            if (!antiWebhook || !antiWebhook.is_enabled) return;

            // Fetch Audit Logs to see who created/updated the webhook
            const auditLogs = await guild.fetchAuditLogs({
                limit: 1,
                type: AuditLogEvent.WebhookCreate
            });

            const log = auditLogs.entries.first();
            if (!log) return;

            // Check if the log is recent (within 5 seconds) to ensure it matches this event
            if (Date.now() - log.createdTimestamp > 5000) return;

            const executor = log.executor;
            if (!executor) return;

            // Executor Checks:
            // 1. Is it the bot itself?
            if (executor.id === guild.client.user.id) return;

            // 2. Is it the Server Owner?
            if (executor.id === guild.ownerId) return;

            // 3. Is it the Security Owner (via GuildSettings)?
            const settings = await GuildSettings.findOne({ where: { guild_id: guild.id } });
            if (settings && settings.owner_role_id) {
                const ownerRoleIds = settings.owner_role_id.split(',');
                const member = await guild.members.fetch(executor.id).catch(() => null);
                if (member && ownerRoleIds.some(id => member.roles.cache.has(id))) return;
            }

            // If none of the above, it's unauthorized. DELETE IT.
            const targetWebhook = log.target;
            if (targetWebhook) {
                // We need to fetch webhooks in the channel to find the object to delete, 
                // or use the target from audit log if it has delete method (it's a Part or Webhook structure).
                // Audit log target is "Webhook".

                // However, audit log target might not be fully functional. Fetching from channel is safer.
                const webhooks = await channel.fetchWebhooks();
                const webhookToDelete = webhooks.find(w => w.id === targetWebhook.id);

                if (webhookToDelete) {
                    await webhookToDelete.delete('Anti-Webhook: Unauthorized creation');
                    console.log(`🗑️ Deleted unauthorized webhook created by ${executor.tag}`);

                    // Log to configured channel
                    const settings = await GuildSettings.findOne({ where: { guild_id: guild.id } });
                    const logChannelId = antiWebhook.log_channel_id || settings?.log_channel;
                    const logChannel = logChannelId ? guild.channels.cache.get(logChannelId) : null;

                    if (logChannel) {
                        const UI = require('../utils/ui');
                        const logContainer = UI.createContainer({
                            title: '🛡️ Anti-Webhook Protection',
                            description: `**Unauthorized Webhook Deleted**\n\n**Executor:** ${executor.tag} (\`${executor.id}\`)\n**Channel:** ${channel}`,
                            color: 0xFF0000,
                            footer: 'Security System'
                        });

                        await logChannel.send({
                            components: [logContainer],
                            flags: 128 // MessageFlags.IsComponentsV2
                        });
                    }
                }
            }

        } catch (error) {
            console.error('Error in webhookUpdate event:', error);
        }
    },
};
