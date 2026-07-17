const { SlashCommandBuilder } = require('discord.js');
const { handleInteraction, handleRating, handleSocial, handleRandom, handleAnimal, handleGame } = require('../../utils/funHelper');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('cringecheck')
        .setDescription("Show cringe rating of a user")
        .addUserOption(option => option.setName('target').setDescription('User to rate').setRequired(false)),
    async execute(interaction) {
        
        const target = interaction.options.getUser('target') || interaction.options.getUser('user1') || null;
        const target2 = interaction.options.getUser('user2') || null;
        const query = interaction.options.getString('query') || '';

        
        await handleRating(interaction, 'cringecheck', target);
        
        
        
        
        
        
    }
};
