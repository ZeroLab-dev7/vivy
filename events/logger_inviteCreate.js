const { Events } = require('discord.js');
const { sendLog } = require('../utils/logManager');

module.exports = {
    name: Events.InviteCreate,
    async execute(invite) {
        if (!invite.guild) return;

        await sendLog(invite.guild, 'invites', {
            author: { name: 'Invite Created', iconURL: invite.guild.iconURL({ dynamic: true }) },
            fields: [
                { name: '🔗 Invite Code:', value: `\`${invite.code}\``, inline: true },
                { name: '<a:member:1366766051626582050> Inviter:', value: `${invite.inviter}`, inline: true },
                { name: '<:timee:1492407654256218142> Created at:', value: `<t:${Math.floor(Date.now() / 1000)}:R>`, inline: true },
                { name: '<:ch:1492409201522114591> Channel:', value: `${invite.channel}`, inline: true },
                { name: '⏳ Expires:', value: invite.expiresAt ? `<t:${Math.floor(invite.expiresTimestamp / 1000)}:R>` : 'Never', inline: true },
                { name: '📊 Max Uses:', value: `\`${invite.maxUses === 0 ? 'Infinite' : invite.maxUses}\``, inline: true }
            ],
            color: 'Green'
        });
    }
};
