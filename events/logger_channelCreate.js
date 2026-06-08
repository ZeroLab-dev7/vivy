const { Events, AuditLogEvent } = require('discord.js');
const { sendLog, getExecutor } = require('../utils/logManager');

module.exports = {
    name: Events.ChannelCreate,
    async execute(channel) {
        if (!channel.guild) return;

        const executor = await getExecutor(channel.guild, AuditLogEvent.ChannelCreate, channel.id);

        await sendLog(channel.guild, 'channels', {
            author: { name: 'Channel Created', iconURL: channel.guild.iconURL({ dynamic: true }) },
            fields: [
                { name: '<:ch:1492409201522114591> Channel:', value: `${channel}`, inline: true },
                { name: '<:userinfo:1492408642803204096> Channel id:', value: `\`${channel.id}\``, inline: true },
                { name: '<:timee:1492407654256218142> Created at:', value: `<t:${Math.floor(Date.now() / 1000)}:R>`, inline: true },
                { name: '🏷️ Type:', value: `\`${channel.type}\``, inline: true },
                { name: '📂 Category:', value: channel.parent ? `\`${channel.parent.name}\`` : 'None', inline: true },
                { name: '<:timee:1492407654256218142> Created by:', value: executor ? `${executor}` : 'Unknown', inline: true }
            ],
            color: 'Green'
        });
    }
};
