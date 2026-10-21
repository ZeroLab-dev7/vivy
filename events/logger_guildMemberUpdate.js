const { Events, AuditLogEvent } = require('discord.js');
const { sendLog, getAuditLogEntry, getExecutor } = require('../utils/logManager');

function formatRoles(rolesCollection) {
    const rolesArray = rolesCollection.map(r => r.toString());
    const joined = rolesArray.join(', ');
    if (joined.length <= 1024) return joined;

    let result = rolesArray[0];
    for (let i = 1; i < rolesArray.length; i++) {
        const roleStr = rolesArray[i];
        const potentialNext = `${result}, ${roleStr}`;
        const remaining = rolesArray.length - (i + 1);
        const suffix = remaining > 0 ? `, ... and ${remaining} more` : '';
        
        if (potentialNext.length + suffix.length > 1024) {
            return result + `, ... and ${rolesArray.length - i} more`;
        }
        result = potentialNext;
    }
    return result;
}

module.exports = {
    name: Events.GuildMemberUpdate,
    async execute(oldMember, newMember) {
        const user = newMember.user;
        const guild = newMember.guild;

        // Nickname Change
        if (oldMember.nickname !== newMember.nickname) {
            await sendLog(guild, 'nickname', {
                author: { name: 'Nickname Changed', iconURL: user.displayAvatarURL({ dynamic: true }) },
                fields: [
                    { name: '<a:member:1366766051626582050> Target User:', value: `${newMember}`, inline: true },
                    { name: '<:userinfo:1492408642803204096> User id:', value: `\`${newMember.id}\``, inline: true },
                    { name: '<:timee:1492407654256218142> Changed at:', value: `<t:${Math.floor(Date.now() / 1000)}:R>`, inline: true },
                    { name: '📝 Old Nickname:', value: `\`${oldMember.nickname || 'None'}\``, inline: true },
                    { name: '📝 New Nickname:', value: `\`${newMember.nickname || 'None'}\``, inline: true }
                ],
                color: 'Blue'
            });
        }

        // Role Updates
        const addedRoles = newMember.roles.cache.filter(role => !oldMember.roles.cache.has(role.id));
        const removedRoles = oldMember.roles.cache.filter(role => !newMember.roles.cache.has(role.id));

        const getAttributedExecutor = async () => {
            const entry = await getAuditLogEntry(guild, AuditLogEvent.MemberRoleUpdate, newMember.id, (entry) => {
                return entry.changes.find(c => c.key === '$add' || c.key === '$remove');
            });

            if (!entry) return 'Unknown';

            if (entry.executor.bot && entry.reason && entry.reason.startsWith('By: ')) {
                return entry.reason.replace('By: ', '');
            }

            return `<@${entry.executor.id}>`;
        };

        if (addedRoles.size > 0) {
            const executorInfo = await getAttributedExecutor();
            await sendLog(guild, 'role-given', {
                author: { name: 'Role Given', iconURL: user.displayAvatarURL({ dynamic: true }) },
                fields: [
                    { name: '<a:member:1366766051626582050> Target User:', value: `${newMember}`, inline: true },
                    { name: '<:userinfo:1492408642803204096> User id:', value: `\`${newMember.id}\``, inline: true },
                    { name: '<:timee:1492407654256218142> Given at:', value: `<t:${Math.floor(Date.now() / 1000)}:R>`, inline: true },
                    { name: '<:timee:1492407654256218142> Given by:', value: executorInfo, inline: true },
                    { name: '🎭 Added Roles:', value: formatRoles(addedRoles), inline: false }
                ],
                color: 'Green'
            });
        }

        if (removedRoles.size > 0) {
            const executorInfo = await getAttributedExecutor();
            await sendLog(guild, 'role-remove', {
                author: { name: 'Role Removed', iconURL: user.displayAvatarURL({ dynamic: true }) },
                fields: [
                    { name: '<a:member:1366766051626582050> Target User:', value: `${newMember}`, inline: true },
                    { name: '<:userinfo:1492408642803204096> User id:', value: `\`${newMember.id}\``, inline: true },
                    { name: '<:timee:1492407654256218142> Removed at:', value: `<t:${Math.floor(Date.now() / 1000)}:R>`, inline: true },
                    { name: '<:timee:1492407654256218142> Removed by:', value: executorInfo, inline: true },
                    { name: '🎭 Removed Roles:', value: formatRoles(removedRoles), inline: false }
                ],
                color: 'Red'
            });
        }

        // Timeout (Communication Disabled)
        const oldTimedOut = oldMember.communicationDisabledUntilTimestamp;
        const newTimedOut = newMember.communicationDisabledUntilTimestamp;

        if (oldTimedOut !== newTimedOut) {
            if (newTimedOut && newTimedOut > Date.now()) {
                const executor = await getExecutor(guild, AuditLogEvent.MemberUpdate, newMember.id, entry => {
                    return entry.changes.some(c => c.key === 'communication_disabled_until');
                });

                await sendLog(guild, 'timeout', {
                    author: { name: 'Member Timed Out', iconURL: user.displayAvatarURL({ dynamic: true }) },
                    fields: [
                        { name: '<a:member:1366766051626582050> Target User:', value: `${newMember}`, inline: true },
                        { name: '<:userinfo:1492408642803204096> User id:', value: `\`${newMember.id}\``, inline: true },
                        { name: '<:timee:1492407654256218142> Timed out at:', value: `<t:${Math.floor(Date.now() / 1000)}:R>`, inline: true },
                        { name: '<:timee:1492407654256218142> Timed out by:', value: executor ? `${executor}` : 'Unknown', inline: true },
                        { name: '⏳ Expires:', value: `<t:${Math.floor(newTimedOut / 1000)}:R> (<t:${Math.floor(newTimedOut / 1000)}:F>)`, inline: false }
                    ],
                    thumbnail: user.displayAvatarURL({ dynamic: true }),
                    color: 'Orange'
                });
            } else if (oldTimedOut && (!newTimedOut || newTimedOut <= Date.now())) {
                const executor = await getExecutor(guild, AuditLogEvent.MemberUpdate, newMember.id, entry => {
                    return entry.changes.some(c => c.key === 'communication_disabled_until');
                });

                await sendLog(guild, 'timeout', {
                    author: { name: 'Timeout Removed', iconURL: user.displayAvatarURL({ dynamic: true }) },
                    fields: [
                        { name: '<a:member:1366766051626582050> Target User:', value: `${newMember}`, inline: true },
                        { name: '<:userinfo:1492408642803204096> User id:', value: `\`${newMember.id}\``, inline: true },
                        { name: '<:timee:1492407654256218142> Removed at:', value: `<t:${Math.floor(Date.now() / 1000)}:R>`, inline: true },
                        { name: '<:timee:1492407654256218142> Removed by:', value: executor ? `${executor}` : 'Unknown', inline: true }
                    ],
                    color: 'Green'
                });
            }
        }
    }
};
