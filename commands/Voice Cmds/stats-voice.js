const { ActivityType, MessageFlags } = require('discord.js');
const UI = require('../../utils/ui');

module.exports = {
    name: 'stats-voice',
    description: 'Displays the server voice and member stats',
    aliases: ['vc', 'voicestats'],
    async execute(message, args) {
        const guild = message.guild;

        // Members count
        const totalMembers = guild.memberCount;

        // Online: Filter by presence status (online, idle, dnd)
        // Note: Needs GuildPresences intent (which is enabled)
        const onlineAPI = guild.members.cache.filter(m => !m.user.bot && (m.presence?.status === 'online' || m.presence?.status === 'idle' || m.presence?.status === 'dnd')).size;

        // Streaming: Checks activities for Streaming type
        const streamingAPI = guild.members.cache.filter(m => m.presence?.activities.some(a => a.type === ActivityType.Streaming)).size;

        // In Voice
        const membersInVoice = guild.members.cache.filter(m => m.voice.channelId).size;

        // Boosts (Count)
        const boostCount = guild.premiumSubscriptionCount || 0;

        // Boosting Members (Distinct users)
        const boostingMembers = guild.members.cache.filter(m => m.premiumSince).size;

        // Emojis (using generic placeholders or keeping specific IDs if user insists, adhering to image style)
        // Image has generic looking colored icons. 
        // I'll stick to the user's previously provided IDs where matches, and common emojis for others.

        const container = UI.createContainer({
            title: `| ${guild.name} Stats!`,
            description: '<a:white:1366765876006879263>',
            fields: [
                {
                    name: `| <a:member:1366766051626582050> Members :`,
                    value: `\`${totalMembers}\``,
                    inline: false
                },
                {
                    name: `| 🟢 Online Members :`,
                    value: `\`${onlineAPI}\``,
                    inline: false
                },
                {
                    name: `| <a:voice:1366765217761071134> Members In Voice :`,
                    value: `\`${membersInVoice}\``,
                    inline: false
                },
                {
                    name: `| 🟣 Streaming Members :`,
                    value: `\`${streamingAPI}\``,
                    inline: false
                },
                {
                    name: `| <a:boost:1366892421635375167> Boosts :`,
                    value: `\`${boostingMembers}\` (Count: \`${boostCount}\`)`,
                    inline: false
                }
            ]
        });

        await message.channel.send({
            components: [container],
            flags: MessageFlags.IsComponentsV2
        });
    },
};
