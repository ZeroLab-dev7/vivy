const { Events } = require('discord.js');
const { sendLog } = require('../utils/logManager');

module.exports = {
    name: Events.MessageUpdate,
    async execute(oldMessage, newMessage) {
        if (!newMessage.guild || !oldMessage.author || oldMessage.author.bot) return;
        if (oldMessage.content === newMessage.content) return;

        await sendLog(newMessage.guild, 'messages', {
            author: { name: 'Message Edited', iconURL: newMessage.author.displayAvatarURL({ dynamic: true }) },
            fields: [
                { name: '<a:member:1366766051626582050> Message Author:', value: `${newMessage.author}`, inline: true },
                { name: '<:userinfo:1492408642803204096> Message id:', value: `\`${newMessage.id}\``, inline: true },
                { name: '<:info:1492408830196318279> Created at:', value: `<t:${Math.floor(newMessage.createdTimestamp / 1000)}:R>`, inline: true },
                { name: '<:ch:1492409201522114591> Message Channel:', value: `${newMessage.channel}`, inline: true },
                { name: '🔗 Message Link:', value: `[Jump to message](${newMessage.url})`, inline: true },
                { name: '<:timee:1492407654256218142> Edited at:', value: `<t:${Math.floor(Date.now() / 1000)}:R>`, inline: true },
                { name: '📝 Old Content:', value: oldMessage.content ? (oldMessage.content.length > 1021 ? oldMessage.content.substring(0, 1021) + '...' : oldMessage.content) : '*No Text Content*', inline: false },
                { name: '📝 New Content:', value: newMessage.content ? (newMessage.content.length > 1021 ? newMessage.content.substring(0, 1021) + '...' : newMessage.content) : '*No Text Content*', inline: false }
            ],
            color: 'Blue'
        });
    }
};
