const EconomyService = require('../../services/economyService');
const UIManager = require('../../managers/uiManager');

module.exports = {
    name: 'transfer',
    aliases: ['pay', 'give'],
    description: 'Transfer money to another user',
    async execute(message, args) {
        const target = message.mentions.users.first();
        const amount = parseInt(args[1]);

        if (!target || isNaN(amount) || amount <= 0) {
            const errContainer = UIManager.createContainer({
                title: '⚠️ Usage Error',
                accentColor: UIManager.ACCENTS.AMBER
            });
            const sec = UIManager.createSection({
                title: 'Invalid Parameters',
                content: 'Usage: `?pay @user <amount>`',
                buttonLabel: 'Syntax',
                buttonId: 'pay_syntax_btn'
            });
            errContainer.addSectionComponents(sec);
            return message.reply(UIManager.toResponse(errContainer));
        }

        try {
            const res = await EconomyService.transfer(message.author.id, target.id, message.guild.id, amount);
            const container = UIManager.createContainer({
                title: '<:vivycoin:1533128699350749425> Transfer Executed',
                accentColor: UIManager.ACCENTS.EMERALD
            });
            const sec = UIManager.createSection({
                title: 'Payment Details',
                content: `Transferred: \`${res.amount.toLocaleString()}\` <:vivycoin:1533128699350749425> to ${target}\nYour Remaining Wallet: \`${Number(res.sender.balance).toLocaleString()}\` <:vivycoin:1533128699350749425>`,
                buttonLabel: 'Success',
                buttonId: 'pay_success_btn'
            });
            container.addSectionComponents(sec);
            return message.reply(UIManager.toResponse(container));
        } catch (err) {
            const errContainer = UIManager.createContainer({
                title: '❌ Transfer Failed',
                accentColor: UIManager.ACCENTS.ROSE
            });
            const sec = UIManager.createSection({
                title: 'Error',
                content: err.message,
                buttonLabel: 'Failed',
                buttonId: 'pay_err_btn'
            });
            errContainer.addSectionComponents(sec);
            return message.reply(UIManager.toResponse(errContainer));
        }
    }
};
