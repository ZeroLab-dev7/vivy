const { MessageFlags } = require('discord.js');
const UI = require('../../utils/ui');
const axios = require('axios'); // Ensure axios is installed or use fetch if node 18+

module.exports = {
    name: 'cat',
    description: 'Get a random cat image',
    async execute(message, args) {
        try {
            // Using a simple public API
            const response = await axios.get('https://api.thecatapi.com/v1/images/search');
            const catUrl = response.data[0].url;

            const container = UI.createContainer({
                title: '🐱 Meow!',
                image: catUrl,
                footer: `Requested by ${message.author.tag}`
            });

            message.reply({
                components: [container],
                flags: MessageFlags.IsComponentsV2
            });
        } catch (error) {
            console.error(error);
            message.reply({
                components: [UI.createContainer({
                    description: 'Could not fetch a cat image. Try again later.'
                })],
                flags: MessageFlags.IsComponentsV2
            });
        }
    },
};
