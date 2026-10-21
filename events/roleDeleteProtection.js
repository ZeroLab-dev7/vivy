const { Events, AuditLogEvent } = require('discord.js');
const { SecuritySettings } = require('../db/models');
const { isExecutorTrusted, punishExecutor, logSecurityEvent } = require('../utils/securityHelper');

module.exports = {
    name: Events.GuildRoleDelete,
    async execute(role) {
        if (!role.guild) return;

        try {
            // Check settings
            const settings = await SecuritySettings.findOne({ where: { guild_id: role.guild.id } });
            if (!settings || !settings.role_protection_enabled) return;

            // Fetch audit logs to identify the executor
            const auditLogs = await role.guild.fetchAuditLogs({
                limit: 1,
                type: AuditLogEvent.RoleDelete
            }).catch(() => null);

            const log = auditLogs?.entries.first();
            if (!log) return;

            // Ensure the log entry corresponds to this role and is recent (within 8 seconds)
            if (log.targetId !== role.id || Date.now() - log.createdTimestamp > 8000) return;

            const executor = log.executor;
            if (!executor) return;

            // Check if executor is whitelisted/trusted
            const trusted = await isExecutorTrusted(role.guild, executor.id);
            if (trusted) return;

            // Unauthorized action: RESTORE role
            const restoredRole = await role.guild.roles.create({
                name: role.name,
                color: role.color,
                hoist: role.hoist,
                permissions: role.permissions.bitfield,
                mentionable: role.mentionable,
                reason: 'Vivy Role Protection: Restoring deleted role'
            }).catch(console.error);

            // Punish the executor
            const punishmentResult = await punishExecutor(
                role.guild,
                executor.id,
                settings.role_protection_punishment,
                `Vivy Role Protection: Unauthorized deletion of role "${role.name}"`
            );

            // Log the action
            await logSecurityEvent(role.guild, {
                module: 'role-protection',
                action: 'Role Deleted (Unauthorized)',
                executor,
                target: role,
                result: `Role restored. Executor punished: ${punishmentResult}`,
                logChannelId: settings.log_channel_id
            });

        } catch (err) {
            console.error('[RoleDeleteProtection] Error:', err);
        }
    }
};
