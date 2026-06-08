const { MessageFlags } = require('discord.js');
const UI = require('../../utils/ui');

module.exports = {
    name: 'gender',
    description: 'Guess user gender',
    async execute(message, args) {
        const target = message.mentions.users.first() || message.author;
        const genres = ['Male ‍♂', 'Female ‍♀', 'Trapezoid', 'Attack Helicopter', 'Samsung Smart Fridge'];
        const random = genres[Math.floor(Math.random() * genres.length)];

        const container = UI.createContainer({
            title: 'Gender Guesser',
            description: `I think **${target.username}** is a **${random}**!`,
            footer: `Requested by ${message.author.tag}`
        });

        message.reply({
            components: [container],
            flags: MessageFlags.IsComponentsV2
        });
    },
};
