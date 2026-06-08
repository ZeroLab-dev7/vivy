const { Events, AuditLogEvent } = require('discord.js');
const { sendLog, getExecutor } = require('../utils/logManager');

module.exports = {
    name: Events.GuildRoleUpdate,
    async execute(oldRole, newRole) {
        if (!newRole.guild) return;
        if (oldRole.name === newRole.name && oldRole.color === newRole.color && oldRole.permissions.bitfield === newRole.permissions.bitfield && oldRole.hoist === newRole.hoist && oldRole.mentionable === newRole.mentionable) return;

        let changes = [];
        if (oldRole.name !== newRole.name) changes.push(`**Name:** \`${oldRole.name}\` ➔ \`${newRole.name}\``);
        if (oldRole.color !== newRole.color) changes.push(`**Color:** \`${oldRole.hexColor}\` ➔ \`${newRole.hexColor}\``);

        // Simple permission check summary
        if (oldRole.permissions.bitfield !== newRole.permissions.bitfield) {
            changes.push(`**Permissions:** Updated`);
        }

        if (changes.length === 0) return;

        const executor = await getExecutor(newRole.guild, AuditLogEvent.RoleUpdate, newRole.id);

        await sendLog(newRole.guild, 'role-update', {
            author: { name: 'Role Updated', iconURL: newRole.guild.iconURL({ dynamic: true }) },
            fields: [
                { name: '🎭 Role:', value: `${newRole}`, inline: true },
                { name: '<:userinfo:1492408642803204096> Role id:', value: `\`${newRole.id}\``, inline: true },
                { name: '<:timee:1492407654256218142> Updated at:', value: `<t:${Math.floor(Date.now() / 1000)}:R>`, inline: true },
                { name: '<:timee:1492407654256218142> Updated by:', value: executor ? `${executor}` : 'Unknown', inline: true },
                { name: '⚙️ Changes:', value: changes.join('\n'), inline: false }
            ],
            color: 'Orange'
        });
    }
};
