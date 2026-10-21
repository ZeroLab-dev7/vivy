const { Events, AuditLogEvent } = require('discord.js');
const { sendLog, getExecutor } = require('../utils/logManager');

module.exports = {
    name: Events.GuildBanRemove,
    async execute(ban) {
        const executor = await getExecutor(ban.guild, AuditLogEvent.MemberBanRemove, ban.user.id);

        await sendLog(ban.guild, 'unban', {
            author: { name: 'Member Unbanned', iconURL: ban.user.displayAvatarURL({ dynamic: true }) },
            fields: [
                { name: '<a:member:1366766051626582050> Target User:', value: `${ban.user}`, inline: true },
                { name: '<:userinfo:1492408642803204096> User id:', value: `\`${ban.user.id}\``, inline: true },
                { name: '<:timee:1492407654256218142> Unbanned at:', value: `<t:${Math.floor(Date.now() / 1000)}:R>`, inline: true },
                { name: '<:timee:1492407654256218142> Unbanned by:', value: executor ? `${executor}` : 'Unknown', inline: true }
            ],
            thumbnail: ban.user.displayAvatarURL({ dynamic: true }),
            color: 'Green'
        });
    }
};
