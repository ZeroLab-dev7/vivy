const { Events, AuditLogEvent, PermissionsBitField } = require('discord.js');
const { SecuritySettings } = require('../db/models');
const { isExecutorTrusted, punishExecutor, logSecurityEvent } = require('../utils/securityHelper');

const DANGEROUS_PERMISSIONS = [
    PermissionsBitField.Flags.Administrator,
    PermissionsBitField.Flags.ManageGuild,
    PermissionsBitField.Flags.ManageRoles,
    PermissionsBitField.Flags.ManageChannels,
    PermissionsBitField.Flags.BanMembers,
    PermissionsBitField.Flags.KickMembers,
    PermissionsBitField.Flags.ManageWebhooks
];

module.exports = {
    name: Events.GuildRoleUpdate,
    async execute(oldRole, newRole) {
        if (!newRole.guild) return;

        try {
            // Check settings
            const settings = await SecuritySettings.findOne({ where: { guild_id: newRole.guild.id } });
            if (!settings || !settings.role_protection_enabled) return;

            // Check if any dangerous permissions were newly added
            const gainedDangerous = DANGEROUS_PERMISSIONS.some(perm => 
                newRole.permissions.has(perm) && !oldRole.permissions.has(perm)
            );

            if (!gainedDangerous) return;

            // Fetch audit logs to identify the executor
            const auditLogs = await newRole.guild.fetchAuditLogs({
                limit: 1,
                type: AuditLogEvent.RoleUpdate
            }).catch(() => null);

            const log = auditLogs?.entries.first();
            if (!log) return;

            // Ensure the log entry corresponds to this role and is recent (within 8 seconds)
            if (log.targetId !== newRole.id || Date.now() - log.createdTimestamp > 8000) return;

            const executor = log.executor;
            if (!executor) return;

            // Check if executor is whitelisted/trusted
            const trusted = await isExecutorTrusted(newRole.guild, executor.id);
            if (trusted) return;

            // Unauthorized action: REVERT permissions
            await newRole.edit({
                permissions: oldRole.permissions.bitfield,
                reason: 'Vivy Role Protection: Reverting dangerous unauthorized permissions'
            }).catch(console.error);

            // Punish the executor
            const punishmentResult = await punishExecutor(
                newRole.guild,
                executor.id,
                settings.role_protection_punishment,
                `Vivy Role Protection: Unauthorized permissions upgrade on role "${newRole.name}"`
            );

            // Log the action
            await logSecurityEvent(newRole.guild, {
                module: 'role-protection',
                action: 'Role Permissions Modified (Dangerous & Unauthorized)',
                executor,
                target: newRole,
                oldValue: oldRole.permissions.bitfield.toString(),
                newValue: newRole.permissions.bitfield.toString(),
                result: `Permissions reverted. Executor punished: ${punishmentResult}`,
                logChannelId: settings.log_channel_id
            });

        } catch (err) {
            console.error('[RoleUpdateProtection] Error:', err);
        }
    }
};
