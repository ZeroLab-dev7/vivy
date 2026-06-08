const { Events, AuditLogEvent } = require('discord.js');
const { sendLog, getExecutor } = require('../utils/logManager');

module.exports = {
    name: Events.MessageBulkDelete,
    async execute(messages) {
        const firstMessage = messages.first();
        if (!firstMessage || !firstMessage.guild) return;

        const guild = firstMessage.guild;
        const channel = firstMessage.channel;
        const count = messages.size;

        // Try to find the executor in audit logs
        const executor = await getExecutor(guild, AuditLogEvent.MessageBulkDelete, channel.id);

        await sendLog(guild, 'messages', {
            author: { name: 'Messages Purged', iconURL: guild.iconURL({ dynamic: true }) },
            fields: [
                { name: '<:ch:1492409201522114591> Channel:', value: `${channel}`, inline: true },
                { name: '<:userinfo:1492408642803204096> Channel id:', value: `\`${channel.id}\``, inline: true },
                { name: '<:timee:1492407654256218142> Purged at:', value: `<t:${Math.floor(Date.now() / 1000)}:R>`, inline: true },
                { name: '<:info:1492408830196318279> Amount:', value: `\`${count} messages\``, inline: true },
                { name: '<:timee:1492407654256218142> Purged by:', value: executor ? `${executor}` : 'Not Found', inline: true }
            ],
            color: 'Red'
        });
    }
};
