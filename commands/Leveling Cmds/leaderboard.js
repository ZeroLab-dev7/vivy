const LevelService = require('../../services/levelService');
const UI = require('../../utils/ui');
const { MessageFlags } = require('discord.js');

module.exports = {
    name: 'leaderboard',
    aliases: ['lb'],
    description: 'Show server leveling leaderboard.',
    async execute(message, args) {
        try {
            const filterType = args[0] ? args[0].toLowerCase() : 'total';
            const allowedFilters = ['total', 'messages', 'voice', 'daily', 'weekly', 'monthly'];

            if (args[0] && !allowedFilters.includes(filterType)) {
                return message.reply({
                    components: [UI.createContainer({
                        description: `<:no:1526496561188831244>Invalid filter. Allowed filters: \`${allowedFilters.join(', ')}\``
                    })]
                });
            }

            const leaderboard = await LevelService.getLeaderboard(message.guild.id, filterType, 10);

            if (leaderboard.length === 0) {
                return message.reply({
                    components: [UI.createContainer({
                        description: 'ℹ️ No leveling data recorded yet for this server.'
                    })]
                });
            }

            const typeLabel = {
                total: 'Total XP',
                messages: 'Messages Count',
                voice: 'Voice Activity',
                daily: 'Daily XP',
                weekly: 'Weekly XP',
                monthly: 'Monthly XP'
            }[filterType];

            const fields = [];
            for (let i = 0; i < leaderboard.length; i++) {
                const record = leaderboard[i];
                const user = await message.client.users.fetch(record.user_id).catch(() => null);
                const tag = user ? user.username : `Unknown User (\`${record.user_id}\`)`;

                let scoreText = '';
                if (filterType === 'messages') {
                    scoreText = `\`${record.messages_count}\` messages`;
                } else if (filterType === 'voice') {
                    scoreText = `\`${record.voice_time_min}\` mins active`;
                } else if (filterType === 'daily') {
                    scoreText = `\`${record.xp_today}\` XP today`;
                } else if (filterType === 'weekly') {
                    scoreText = `\`${record.xp_week}\` XP this week`;
                } else if (filterType === 'monthly') {
                    scoreText = `\`${record.xp_month}\` XP this month`;
                } else {
                    const config = await LevelService.getOrCreateConfig(message.guild.id);
                    const totalXP = LevelService.getTotalXP(record.level, record.xp, config);
                    scoreText = `Level \`${record.level}\` (Total: \`${totalXP}\` XP)`;
                }

                fields.push({
                    name: `#${i + 1} • ${tag}`,
                    value: scoreText,
                    inline: false
                });
            }

            const container = UI.createContainer({
                title: `🏆 Leveling Leaderboard (${typeLabel})`,
                description: `Here are the top active members in **${message.guild.name}**`,
                fields: fields,
                footer: `Filter used: ${filterType}`
            });

            await message.reply({
                components: [container],
                flags: MessageFlags.IsComponentsV2
            });

        } catch (error) {
            console.error('Error in leaderboard command:', error);
            await message.reply({
                components: [UI.createContainer({
                    description: '<:no:1526496561188831244>An error occurred while fetching the leaderboard.',
                    color: 0xff0000
                })]
            });
        }
    }
};
