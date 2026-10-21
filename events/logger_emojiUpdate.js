const { Events, AuditLogEvent } = require('discord.js');
const { sendLog, getExecutor } = require('../utils/logManager');

module.exports = {
    name: Events.GuildEmojiUpdate,
    async execute(oldEmoji, newEmoji) {
        if (oldEmoji.name === newEmoji.name) return;

        const executor = await getExecutor(newEmoji.guild, AuditLogEvent.EmojiUpdate, newEmoji.id);

        await sendLog(newEmoji.guild, 'emojis', {
            author: { name: 'Emoji Updated', iconURL: newEmoji.guild.iconURL({ dynamic: true }) },
            fields: [
                { name: '😀 Emoji:', value: `${newEmoji}`, inline: true },
                { name: '<:userinfo:1492408642803204096> Emoji id:', value: `\`${newEmoji.id}\``, inline: true },
                { name: '<:timee:1492407654256218142> Updated at:', value: `<t:${Math.floor(Date.now() / 1000)}:R>`, inline: true },
                { name: '📝 Old Name:', value: `\`:${oldEmoji.name}:\``, inline: true },
                { name: '📝 New Name:', value: `\`:${newEmoji.name}:\``, inline: true },
                { name: '<:timee:1492407654256218142> Updated by:', value: executor ? `${executor}` : 'Unknown', inline: true }
            ],
            thumbnail: newEmoji.url,
            color: 'Orange'
        });
    }
};
