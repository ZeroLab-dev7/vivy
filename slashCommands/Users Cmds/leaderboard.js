const { SlashCommandBuilder } = require('discord.js');
const leaderboardCommand = require('../../commands/Leveling Cmds/leaderboard');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('leaderboard')
        .setDescription('View server leveling and XP leaderboard')
        .addStringOption(opt => opt
            .setName('filter')
            .setDescription('Leveling leaderboard filter (optional)')
            .setRequired(false)
            .addChoices(
                { name: '🏆 Total XP & Level', value: 'total' },
                { name: '💬 Text Messages Activity', value: 'messages' },
                { name: '🎙️ Voice Activity', value: 'voice' },
                { name: '📅 Daily XP', value: 'daily' },
                { name: '🗓️ Weekly XP', value: 'weekly' },
                { name: '📊 Monthly XP', value: 'monthly' }
            )
        ),

    async execute(interaction) {
        await interaction.deferReply();
        const filter = interaction.options.getString('filter') || 'total';
        return leaderboardCommand.sendLevelLeaderboard(interaction, filter);
    }
};
