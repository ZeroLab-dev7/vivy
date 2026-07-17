const { SlashCommandBuilder } = require('discord.js');
const { handleInteraction, handleRating, handleSocial, handleRandom, handleAnimal, handleGame } = require('../../utils/funHelper');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('villain')
        .setDescription("Show villain rating of a user")
        .addUserOption(option => option.setName('target').setDescription('User to rate').setRequired(false)),
    async execute(interaction) {
        
        const target = interaction.options.getUser('target') || interaction.options.getUser('user1') || null;
        const target2 = interaction.options.getUser('user2') || null;
        const query = interaction.options.getString('query') || '';

        
        await handleRating(interaction, 'villain', target);
        
        
        
        
        
        
    }
};
