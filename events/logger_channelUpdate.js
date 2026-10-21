const { Events, AuditLogEvent } = require('discord.js');
const { sendLog, getExecutor } = require('../utils/logManager');

module.exports = {
    name: Events.ChannelUpdate,
    async execute(oldChannel, newChannel) {
        if (!newChannel.guild) return;
        if (oldChannel.name === newChannel.name && oldChannel.parentId === newChannel.parentId && oldChannel.permissionOverwrites.cache.size === newChannel.permissionOverwrites.cache.size) return;

        let changes = [];
        if (oldChannel.name !== newChannel.name) changes.push(`**Name:** \`${oldChannel.name}\` ➔ \`${newChannel.name}\``);
        if (oldChannel.parentId !== newChannel.parentId) changes.push(`**Category:** Moved`);

        if (changes.length === 0) return;

        const executor = await getExecutor(newChannel.guild, AuditLogEvent.ChannelUpdate, newChannel.id);

        await sendLog(newChannel.guild, 'channels', {
            author: { name: 'Channel Updated', iconURL: newChannel.guild.iconURL({ dynamic: true }) },
            fields: [
                { name: '<:ch:1492409201522114591> Channel:', value: `${newChannel}`, inline: true },
                { name: '<:userinfo:1492408642803204096> Channel id:', value: `\`${newChannel.id}\``, inline: true },
                { name: '<:timee:1492407654256218142> Updated at:', value: `<t:${Math.floor(Date.now() / 1000)}:R>`, inline: true },
                { name: '<:timee:1492407654256218142> Updated by:', value: executor ? `${executor}` : 'Unknown', inline: true },
                { name: '⚙️ Changes:', value: changes.join('\n'), inline: false }
            ],
            color: 'Orange'
        });
    }
};
