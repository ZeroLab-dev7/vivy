const { Events, AuditLogEvent } = require('discord.js');
const { sendLog, getExecutor } = require('../utils/logManager');

module.exports = {
    name: Events.GuildRoleDelete,
    async execute(role) {
        if (!role.guild) return;

        const executor = await getExecutor(role.guild, AuditLogEvent.RoleDelete, role.id);

        await sendLog(role.guild, 'role-delete', {
            author: { name: 'Role Deleted', iconURL: role.guild.iconURL({ dynamic: true }) },
            fields: [
                { name: '🎭 Role Name:', value: `\`${role.name}\``, inline: true },
                { name: '<:userinfo:1492408642803204096> Role id:', value: `\`${role.id}\``, inline: true },
                { name: '<:timee:1492407654256218142> Deleted at:', value: `<t:${Math.floor(Date.now() / 1000)}:R>`, inline: true },
                { name: '<:timee:1492407654256218142> Deleted by:', value: executor ? `${executor}` : 'Unknown', inline: true }
            ],
            color: 'Red'
        });
    }
};
