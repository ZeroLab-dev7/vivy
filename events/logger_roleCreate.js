const { Events, AuditLogEvent } = require('discord.js');
const { sendLog, getExecutor } = require('../utils/logManager');

module.exports = {
    name: Events.GuildRoleCreate,
    async execute(role) {
        if (!role.guild) return;

        const executor = await getExecutor(role.guild, AuditLogEvent.RoleCreate, role.id);

        await sendLog(role.guild, 'role-create', {
            author: { name: 'Role Created', iconURL: role.guild.iconURL({ dynamic: true }) },
            fields: [
                { name: '🎭 Role:', value: `${role}`, inline: true },
                { name: '<:userinfo:1492408642803204096> Role id:', value: `\`${role.id}\``, inline: true },
                { name: '<:timee:1492407654256218142> Created at:', value: `<t:${Math.floor(Date.now() / 1000)}:R>`, inline: true },
                { name: '<:timee:1492407654256218142> Created by:', value: executor ? `${executor}` : 'Unknown', inline: true }
            ],
            color: 'Green'
        });
    }
};
