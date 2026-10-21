const { Events, AuditLogEvent } = require('discord.js');
const { sendLog, getExecutor } = require('../utils/logManager');

module.exports = {
    name: Events.GuildEmojiCreate,
    async execute(emoji) {
        const executor = await getExecutor(emoji.guild, AuditLogEvent.EmojiCreate, emoji.id);

        await sendLog(emoji.guild, 'emojis', {
            author: { name: 'Emoji Created', iconURL: emoji.guild.iconURL({ dynamic: true }) },
            fields: [
                { name: '😀 Emoji:', value: `${emoji}`, inline: true },
                { name: '<:userinfo:1492408642803204096> Emoji id:', value: `\`${emoji.id}\``, inline: true },
                { name: '<:timee:1492407654256218142> Created at:', value: `<t:${Math.floor(Date.now() / 1000)}:R>`, inline: true },
                { name: '📝 Name:', value: `\`:${emoji.name}:\``, inline: true },
                { name: '<:timee:1492407654256218142> Created by:', value: executor ? `${executor}` : 'Unknown', inline: true }
            ],
            thumbnail: emoji.url,
            color: 'Green'
        });
    }
};
