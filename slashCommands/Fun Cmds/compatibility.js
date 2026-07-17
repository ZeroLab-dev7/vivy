const { SlashCommandBuilder } = require('discord.js');
const { handleInteraction, handleRating, handleSocial, handleRandom, handleAnimal, handleGame } = require('../../utils/funHelper');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('compatibility')
        .setDescription("General compatibility rate between two users")
        .addUserOption(option => option.setName('user1').setDescription('First user').setRequired(false))
        .addUserOption(option => option.setName('user2').setDescription('Second user').setRequired(false)),
    async execute(interaction) {
        
        const target = interaction.options.getUser('target') || interaction.options.getUser('user1') || null;
        const target2 = interaction.options.getUser('user2') || null;
        const query = interaction.options.getString('query') || '';

        
        
        
        await handleSocial(interaction, 'compatibility', target, target2);
        
        
        
        
    }
};
