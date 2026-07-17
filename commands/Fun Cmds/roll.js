const { MessageFlags } = require('discord.js');
const UI = require('../../utils/ui');

module.exports = {
    name: 'roll',
    description: 'Roll a dice',
    async execute(message, args) {
        const roll = Math.floor(Math.random() * 6) + 1;

        const container = UI.createContainer({
            title: '🎲 Dice Roll',
            description: `You rolled a **${roll}**!`,
        });

        message.reply({
            components: [container],
            flags: MessageFlags.IsComponentsV2
        });
    },
};
