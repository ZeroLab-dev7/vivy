const { SlashCommandBuilder } = require('discord.js');
const { handleInteraction, handleRating, handleSocial, handleRandom, handleAnimal, handleGame } = require('../../utils/funHelper');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('laugh')
        .setDescription("Laugh out loud")
        .addUserOption(option => option.setName('target').setDescription('User to interact with').setRequired(false)),
    async execute(interaction) {
        
        const target = interaction.options.getUser('target') || interaction.options.getUser('user1') || null;
        const target2 = interaction.options.getUser('user2') || null;
        const query = interaction.options.getString('query') || '';

        await handleInteraction(interaction, 'laugh', target);
        
        
        
        
        
        
        
    }
};
