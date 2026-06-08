const Economy = require('../../db/models/Economy');
const UI = require('../../utils/ui');
const Emojis = require('../../utils/emojis');

module.exports = {
    name: 'bal',
    aliases: ['balance'],
    description: 'Check your balance',
    async execute(message, args) {
        const target = message.mentions.users.first() || message.author;

        let userEco = await Economy.findOne({ where: { user_id: target.id, guild_id: message.guild.id } });

        if (!userEco) {
            userEco = await Economy.create({ user_id: target.id, guild_id: message.guild.id });
        }

        const embed = UI.createEmbed({
            type: 'info',
            title: `${target.username}'s Balance`,
            description: `
**Wallet:** $${userEco.balance.toLocaleString()}
**Bank:** $${userEco.bank.toLocaleString()}
**Total:** $${(userEco.balance + userEco.bank).toLocaleString()}
            `,
            thumbnail: target.displayAvatarURL({ dynamic: true })
        });

        message.reply({ embeds: [embed] });
    },
};
