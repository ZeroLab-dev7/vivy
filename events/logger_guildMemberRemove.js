const { Events, AuditLogEvent } = require('discord.js');
const { sendLog, getExecutor } = require('../utils/logManager');

module.exports = {
    name: Events.GuildMemberRemove,
    async execute(member) {
        try {
            const guild = member.guild;
            const user = member.user;

            // 1. Check if it was a Kick
            const kickExecutor = await getExecutor(guild, AuditLogEvent.MemberKick, user.id);

            if (kickExecutor) {
                await sendLog(guild, 'kick', {
                    author: { name: 'Member Kicked', iconURL: user.displayAvatarURL({ dynamic: true }) },
                    fields: [
                        { name: '<a:member:1366766051626582050> Target User:', value: `${user}`, inline: true },
                        { name: '<:userinfo:1492408642803204096> User id:', value: `\`${user.id}\``, inline: true },
                        { name: '<:timee:1492407654256218142> Kicked at:', value: `<t:${Math.floor(Date.now() / 1000)}:R>`, inline: true },
                        { name: '<:timee:1492407654256218142> Kicked by:', value: `${kickExecutor}`, inline: true }
                    ],
                    thumbnail: user.displayAvatarURL({ dynamic: true }),
                    color: 'Orange'
                });
                return;
            }

            // Leave log (kicks are handled above — same event fires for kicks)
            const joinedTimestamp = member.joinedTimestamp ? Math.floor(member.joinedTimestamp / 1000) : null;

            const roles = member.roles.cache
                .filter(role => role.name !== '@everyone')
                .map(role => role.toString())
                .join(', ') || 'None';

            const fields = [
                { name: '<a:member:1366766051626582050> Target User:', value: `${user}`, inline: true },
                { name: '<:userinfo:1492408642803204096> User id:', value: `\`${user.id}\``, inline: true },
                { name: '<:timee:1492407654256218142> Left at:', value: `<t:${Math.floor(Date.now() / 1000)}:R>`, inline: true },
                { name: '📥 Joined at:', value: joinedTimestamp ? `<t:${joinedTimestamp}:R>` : 'Unknown', inline: true },
                { name: '📊 Member Count:', value: `\`${guild.memberCount}\``, inline: true },
                { name: '🎭 Roles:', value: roles.length > 1024 ? roles.substring(0, 1021) + '...' : roles, inline: false }
            ];

            await sendLog(guild, 'leave', {
                author: { name: 'Member Left', iconURL: user.displayAvatarURL({ dynamic: true }) },
                fields: fields,
                thumbnail: user.displayAvatarURL({ dynamic: true }),
                color: 'Red'
            });
        } catch (error) {
            console.error('[LeaveLog] Error:', error);
        }
    }
};
