const { MessageFlags } = require('discord.js');
const UI = require('../../utils/ui');

module.exports = {
    name: 'howgay',
    description: 'Calculates your gay rate',
    async execute(message, args) {
        const target = message.mentions.users.first() || message.author;
        const rate = Math.floor(Math.random() * 101);

        const container = UI.createContainer({
            title: '🏳️‍🌈 Gay Rate Machine',
            description: `${target} is **${rate}%** gay!`,
            thumbnail: target.displayAvatarURL({ dynamic: true })
        });

        message.reply({
            components: [container],
            flags: MessageFlags.IsComponentsV2
        });
    },
};
