const { SlashCommandBuilder } = require('discord.js');
const { handleInteraction, handleRating, handleSocial, handleRandom, handleAnimal, handleGame } = require('../../utils/funHelper');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('divorce')
        .setDescription("Divorce from your partner (Slash Only)"),
    async execute(interaction) {
        
        // Delegate to existing marriage/divorce executors
        const marriageModule = require('../../commands/Marriage Cmds/divorce');
        // Mock a legacy message object to reuse the complex marriage collectors
        const mockMessage = {
            author: interaction.user,
            guild: interaction.guild,
            client: interaction.client,
            channel: interaction.channel,
            mentions: {
                users: {
                    first: () => interaction.options.getUser('target')
                }
            },
            reply: async (payload) => {
                if (interaction.replied || interaction.deferred) {
                    return interaction.followUp(payload);
                }
                return interaction.reply(payload);
            }
        };
        const args = interaction.options.getUser('target') ? [interaction.options.getUser('target').id] : [];
        await marriageModule.execute(mockMessage, args);
        
    }
};
