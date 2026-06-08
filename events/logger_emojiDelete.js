const { Events, AuditLogEvent } = require('discord.js');
const { sendLog, getExecutor } = require('../utils/logManager');

module.exports = {
    name: Events.GuildEmojiDelete,
    async execute(emoji) {
        const executor = await getExecutor(emoji.guild, AuditLogEvent.EmojiDelete, emoji.id);

        await sendLog(emoji.guild, 'emojis', {
            author: { name: 'Emoji Deleted', iconURL: emoji.guild.iconURL({ dynamic: true }) },
            fields: [
                { name: '📝 Emoji Name:', value: `\`:${emoji.name}:\``, inline: true },
                { name: '<:userinfo:1492408642803204096> Emoji id:', value: `\`${emoji.id}\``, inline: true },
                { name: '<:timee:1492407654256218142> Deleted at:', value: `<t:${Math.floor(Date.now() / 1000)}:R>`, inline: true },
                { name: '<:timee:1492407654256218142> Deleted by:', value: executor ? `${executor}` : 'Unknown', inline: true }
            ],
            thumbnail: emoji.url,
            color: 'Red'
        });
    }
};
