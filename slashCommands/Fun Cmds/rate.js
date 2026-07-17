const { SlashCommandBuilder } = require('discord.js');
const { handleInteraction, handleRating, handleSocial, handleRandom, handleAnimal, handleGame } = require('../../utils/funHelper');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rate')
        .setDescription("Rate anything")
        .addStringOption(option => option.setName('query').setDescription('What to rate').setRequired(true)),
    async execute(interaction) {
        
        const target = interaction.options.getUser('target') || interaction.options.getUser('user1') || null;
        const target2 = interaction.options.getUser('user2') || null;
        const query = interaction.options.getString('query') || '';

        
        
        await handleRating(interaction, 'rate', target);
        
        
        
        
        
    }
};
