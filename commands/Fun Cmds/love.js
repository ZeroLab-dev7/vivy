const { MessageFlags } = require('discord.js');
const UI = require('../../utils/ui');

module.exports = {
    name: 'love',
    description: 'Calculates love percentage',
    async execute(message, args) {
        const target = message.mentions.users.first();

        if (!target) {
            return message.reply({
                embeds: [UI.createEmbed({ type: 'warning', description: 'Please mention someone to calculate love with!' })]
            });
        }

        const rate = Math.floor(Math.random() * 101);
        let messageText;

        if (rate < 20) messageText = "💔 Not a good match...";
        else if (rate < 50) messageText = "😐 Maybe just friends?";
        else if (rate < 80) messageText = "🧡 Looking good!";
        else messageText = "💖 It's meant to be!";

        const container = UI.createContainer({
            title: '❤️ Love Calculator',
            description: `**${message.author.username}** and **${target.username}** have a **${rate}%** match!`,
            footer: 'Calculated by the love machine'
        });

        message.reply({
            components: [container],
            flags: MessageFlags.IsComponentsV2
        });
    },
};
