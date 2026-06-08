const { MessageFlags } = require('discord.js');
const UI = require('../../utils/ui');
const axios = require('axios');

module.exports = {
    name: 'dance',
    description: 'Dance time!',
    async execute(message, args) {
        try {
            const { data } = await axios.get('https://api.waifu.pics/sfw/dance');

            const container = UI.createContainer({
                description: `**${message.author.username}** is dancing! 💃🕺`,
                image: data.url
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
