const { Events, AuditLogEvent } = require('discord.js');
const { sendLog, getExecutor } = require('../utils/logManager');

module.exports = {
    name: Events.InviteDelete,
    async execute(invite) {
        if (!invite.guild) return;

        const executor = await getExecutor(invite.guild, AuditLogEvent.InviteDelete, null, (entry) => {
            const codeMatch = entry.changes.some(c => c.key === 'code' && c.old === invite.code);
            if (codeMatch) return true;
            if (entry.createdTimestamp > (Date.now() - 5000)) return true;
            return false;
        });

        await sendLog(invite.guild, 'invites', {
            author: { name: 'Invite Deleted', iconURL: invite.guild.iconURL({ dynamic: true }) },
            fields: [
                { name: '🔗 Invite Code:', value: `\`${invite.code}\``, inline: true },
                { name: '<:ch:1492409201522114591> Channel:', value: `${invite.channel}`, inline: true },
                { name: '<:timee:1492407654256218142> Deleted at:', value: `<t:${Math.floor(Date.now() / 1000)}:R>`, inline: true },
                { name: '<:timee:1492407654256218142> Deleted by:', value: executor ? `${executor}` : 'Unknown', inline: true }
            ],
            color: 'Red'
        });
    }
};
