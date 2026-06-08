const { Events, EmbedBuilder } = require('discord.js');
const { sendLog } = require('../utils/logManager');

module.exports = {
    name: Events.GuildMemberAdd,
    async execute(member) {
        try {
            const guild = member.guild;
            const user = member.user;

            // Account age
            const createdTimestamp = Math.floor(user.createdTimestamp / 1000);

            // Inviter info (from guildMemberAdd.js logic)
            let inviterText = 'Unknown';
            if (member.inviterData) {
                inviterText = `${member.inviterData.inviter} (Code: \`${member.inviterData.code}\`, Uses: \`${member.inviterData.uses}\`)`;
            }

            const fields = [
                { name: '<a:member:1366766051626582050> Target User:', value: `${user}`, inline: true },
                { name: '<:userinfo:1492408642803204096> User id:', value: `\`${user.id}\``, inline: true },
                { name: '<:timee:1492407654256218142> Joined at:', value: `<t:${Math.floor(Date.now() / 1000)}:R>`, inline: true },
                { name: '📅 Account Created:', value: `<t:${createdTimestamp}:R>`, inline: true },
                { name: '🔗 Inviter:', value: inviterText, inline: true },
                { name: '📊 Member Count:', value: `\`${guild.memberCount}\``, inline: true }
            ];

            await sendLog(guild, 'welcome', {
                author: { name: 'Member Joined', iconURL: user.displayAvatarURL({ dynamic: true }) },
                fields: fields,
                thumbnail: user.displayAvatarURL({ dynamic: true }),
                color: 'Green'
            });
        } catch (error) {
            console.error('[WelcomeLog] Error:', error);
        }
    }
};
