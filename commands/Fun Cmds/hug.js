const { MessageFlags } = require('discord.js');
const UI = require('../../utils/ui');
const axios = require('axios');

module.exports = {
    name: 'hug',
    description: 'Hug a user',
    async execute(message, args) {
        const target = message.mentions.users.first();
        if (!target) return message.reply("You need to mention someone to hug!");

        try {
            const { data } = await axios.get('https://nekos.best/api/v2/hug');

            const container = UI.createContainer({
                description: `**${message.author.username}** hugs **${target.username}**! 🤗`,
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
