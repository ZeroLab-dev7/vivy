const Economy = require('../../db/models/Economy');
const UI = require('../../utils/ui');

module.exports = {
    name: 'transfer',
    aliases: ['pay'],
    description: 'Transfer money to another user',
    async execute(message, args) {
        const target = message.mentions.users.first();
        const amount = parseInt(args[1]);

        if (!target || isNaN(amount) || amount <= 0) {
            return message.reply({
                embeds: [UI.createEmbed({ type: 'warning', description: 'Usage: `$transfer @user <amount>`' })]
            });
        }

        if (target.id === message.author.id) return message.reply("You cannot pay yourself!");

        let sender = await Economy.findOne({ where: { user_id: message.author.id, guild_id: message.guild.id } });
        if (!sender || sender.balance < amount) {
            return message.reply({
                embeds: [UI.createEmbed({ type: 'error', description: 'You do not have enough money!' })]
            });
        }

        let receiver = await Economy.findOne({ where: { user_id: target.id, guild_id: message.guild.id } });
        if (!receiver) {
            receiver = await Economy.create({ user_id: target.id, guild_id: message.guild.id });
        }

        sender.balance -= amount;
        receiver.balance += amount;

        await sender.save();
        await receiver.save();

        message.reply({
            embeds: [UI.createEmbed({
                type: 'success',
                description: `Successfully transferred **$${amount}** to ${target}!`
            })]
        });
    },
};
