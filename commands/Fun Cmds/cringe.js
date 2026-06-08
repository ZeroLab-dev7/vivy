const { MessageFlags } = require('discord.js');
const UI = require('../../utils/ui');

module.exports = {
    name: 'cringe',
    description: 'Rate how cringe something is',
    async execute(message, args) {
        const rate = Math.floor(Math.random() * 101);

        const container = UI.createContainer({
            title: '😬 Cringe Meter',
            description: `That's **${rate}%** cringe!`,
            footer: `Requested by ${message.author.tag}`
        });

        message.reply({
            components: [container],
            flags: MessageFlags.IsComponentsV2
        });
    },
};
