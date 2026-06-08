const { Events, AuditLogEvent } = require('discord.js');
const { sendLog, getExecutor } = require('../utils/logManager');

module.exports = {
    name: Events.GuildBanAdd,
    async execute(ban) {
        let reason = 'No reason provided';

        // Pass a custom check to extract the reason from the log entry if found
        const executor = await getExecutor(ban.guild, AuditLogEvent.MemberBanAdd, ban.user.id, (entry) => {
            if (entry.reason) reason = entry.reason;
            return true;
        });

        await sendLog(ban.guild, 'ban', {
            author: { name: 'Member Banned', iconURL: ban.user.displayAvatarURL({ dynamic: true }) },
            fields: [
                { name: '<a:member:1366766051626582050> Target User:', value: `${ban.user}`, inline: true },
                { name: '<:userinfo:1492408642803204096> User id:', value: `\`${ban.user.id}\``, inline: true },
                { name: '<:timee:1492407654256218142> Banned at:', value: `<t:${Math.floor(Date.now() / 1000)}:R>`, inline: true },
                { name: '<:timee:1492407654256218142> Banned by:', value: executor ? `${executor}` : 'Unknown', inline: true },
                { name: '<:info:1492408830196318279> Reason:', value: `\`${reason}\``, inline: true }
            ],
            thumbnail: ban.user.displayAvatarURL({ dynamic: true }),
            color: 'Red'
        });
    }
};
