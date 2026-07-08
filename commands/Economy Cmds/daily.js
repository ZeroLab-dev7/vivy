const Economy = require('../../db/models/Economy');
const UI = require('../../utils/ui');
const Emojis = require('../../utils/emojis');

const DAILY_AMOUNT = 500;
const ONE_DAY = 24 * 60 * 60 * 1000;

module.exports = {
    name: 'daily',
    description: 'Claim daily rewards',
    async execute(message, args) {
        let userEco = await Economy.findOne({ where: { user_id: message.author.id, guild_id: message.guild.id } });

        if (!userEco) {
            userEco = await Economy.create({ user_id: message.author.id, guild_id: message.guild.id });
        }

        const now = new Date();
        const lastDaily = userEco.last_daily ? new Date(userEco.last_daily) : new Date(0);

        if (now - lastDaily < ONE_DAY) {
            const timeLeft = ONE_DAY - (now - lastDaily);
            const hours = Math.floor(timeLeft / (1000 * 60 * 60));
            const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));

            return message.reply({
                embeds: [UI.createEmbed({
                    type: 'warning',
                    description: `You have already claimed your daily reward. Come back in **${hours}h ${minutes}m**.`
                })]
            });
        }

        userEco.balance += DAILY_AMOUNT;
        userEco.last_daily = now;
        await userEco.save();

        message.reply({
            embeds: [UI.createEmbed({
                type: 'success',
                description: `You claimed your daily reward of **$${DAILY_AMOUNT}**!`
            })]
        });
    },
};
