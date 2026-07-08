const { MessageFlags } = require('discord.js');
const UI = require('../../utils/ui');
const axios = require('axios');

module.exports = {
    name: 'smile',
    description: 'Show a smile',
    async execute(message, args) {
        const user = message.mentions.users.first() || message.author;

        try {
            const { data } = await axios.get('https://nekos.best/api/v2/smile');

            const container = UI.createContainer({
                description: `**${message.author.username}** is smiling! 😸`,
                image: data.results[0].url
            });

            message.reply({
                components: [container],
                flags: MessageFlags.IsComponentsV2
            });
        } catch (err) {
            console.error(err);
            message.reply("Failed to load GIF.");
        }
    },
};
