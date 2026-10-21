const { Events, AuditLogEvent } = require('discord.js');
const { sendLog, getExecutor } = require('../utils/logManager');

module.exports = {
    name: Events.MessageDelete,
    async execute(message) {
        if (!message.guild || !message.author || message.author.bot) return;

        // Use getExecutor from logManager for consistency
        const executor = await getExecutor(message.guild, AuditLogEvent.MessageDelete, message.author.id);

        await sendLog(message.guild, 'messages', {
            author: { name: 'Message Deleted', iconURL: message.author.displayAvatarURL({ dynamic: true }) },
            fields: [
                { name: '<a:member:1366766051626582050> Message Author:', value: `${message.author}`, inline: true },
                { name: '<:userinfo:1492408642803204096> Message id:', value: `\`${message.id}\``, inline: true },
                { name: '<:info:1492408830196318279> Created at:', value: `<t:${Math.floor(message.createdTimestamp / 1000)}:R>`, inline: true },
                { name: '<:ch:1492409201522114591> Message Channel:', value: `${message.channel}`, inline: true },
                { name: '<:timee:1492407654256218142> Deleted by:', value: executor ? `${executor}` : `${message.author} (Self)`, inline: true },
                { name: '<:timee:1492407654256218142> Deleted at:', value: `<t:${Math.floor(Date.now() / 1000)}:R>`, inline: true },
                { name: '<:info:1492408830196318279> Reason:', value: '\`Not Provided\`', inline: true },
                { name: '📁 Includes files:', value: message.attachments.size > 0 ? '\`Yes\`' : '\`No\`', inline: true },
                { name: '<:msg:1492409768399343688> Message Content:', value: message.content ? (message.content.length > 1021 ? message.content.substring(0, 1021) + '...' : message.content) : '*No Text Content (Image/Embed)*', inline: false }
            ],
            color: 'Red'
        });
    }
};
