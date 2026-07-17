const { SlashCommandBuilder } = require('discord.js');
const { handleInteraction, handleRating, handleSocial, handleRandom, handleAnimal, handleGame } = require('../../utils/funHelper');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('duck')
        .setDescription("Get a random duck picture"),
    async execute(interaction) {
        
        const target = interaction.options.getUser('target') || interaction.options.getUser('user1') || null;
        const target2 = interaction.options.getUser('user2') || null;
        const query = interaction.options.getString('query') || '';

        
        
        
        
        
        await handleAnimal(interaction, 'duck');
        
        
    }
};
