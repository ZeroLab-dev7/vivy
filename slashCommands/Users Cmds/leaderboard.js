const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const LevelService = require('../../services/levelService');
const UI = require('../../utils/ui');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('leaderboard')
        .setDescription('Show server leveling leaderboard.')
        .addStringOption(option =>
            option.setName('filter')
                .setDescription('Filter type for the leaderboard')
                .setRequired(false)
                .addChoices(
                    { name: 'Total XP', value: 'total' },
                    { name: 'Messages Count', value: 'messages' },
                    { name: 'Voice Active Time', value: 'voice' },
                    { name: 'Daily XP', value: 'daily' },
                    { name: 'Weekly XP', value: 'weekly' },
                    { name: 'Monthly XP', value: 'monthly' }
                )),

    async execute(interaction) {
        try {
            await interaction.deferReply();

            const filterType = interaction.options.getString('filter') || 'total';
            const leaderboard = await LevelService.getLeaderboard(interaction.guild.id, filterType, 10);

            if (leaderboard.length === 0) {
                return interaction.editReply({
                    components: [UI.createContainer({
                        description: 'ℹ️ No leveling data recorded yet for this server.'
                    })],
                    flags: MessageFlags.IsComponentsV2
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
                const user = await interaction.client.users.fetch(record.user_id).catch(() => null);
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
                    const config = await LevelService.getOrCreateConfig(interaction.guild.id);
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
                description: `Here are the top active members in **${interaction.guild.name}**`,
                fields: fields,
                footer: `Filter used: ${filterType}`
            });

            await interaction.editReply({
                components: [container],
                flags: MessageFlags.IsComponentsV2
            });

        } catch (error) {
            console.error('Error in slash leaderboard command:', error);
            await interaction.editReply({
                components: [UI.createContainer({
                    description: '<:no:1526496561188831244>An error occurred while fetching the leaderboard.',
                    color: 0xff0000
                })],
                flags: MessageFlags.IsComponentsV2
            });
        }
    }
};
