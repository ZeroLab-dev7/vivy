const EconomyService = require('../../services/economyService');
const UIManager = require('../../managers/uiManager');

module.exports = {
    name: 'deposit',
    aliases: ['dep'],
    description: 'Deposit cash into bank vault',
    async execute(message, args) {
        const amountStr = args[0];
        if (!amountStr) {
            const errContainer = UIManager.createContainer({ title: '⚠️ Usage Error', accentColor: UIManager.ACCENTS.AMBER });
            errContainer.addSectionComponents(UIManager.createSection({ title: 'Syntax', content: 'Usage: `?deposit <amount | all>`', buttonLabel: 'Info', buttonId: 'dep_info' }));
            return message.reply(UIManager.toResponse(errContainer));
        }

        try {
            const res = await EconomyService.deposit(message.author.id, message.guild.id, amountStr);
            const container = UIManager.createContainer({ title: '<:5526iconbank:1533131833338761297> Bank Deposit Successful', accentColor: UIManager.ACCENTS.EMERALD });
            container.addSectionComponents(UIManager.createSection({
                title: 'Vault Status',
                content: `Deposited: \`+${Number(res.deposited).toLocaleString()}\` <:vivycoin:1533128699350749425>\nBank Balance: \`${Number(res.newBank).toLocaleString()}\` <:vivycoin:1533128699350749425>\nRemaining Wallet: \`${Number(res.newWallet).toLocaleString()}\` <:vivycoin:1533128699350749425>`,
                buttonLabel: 'Deposited',
                buttonId: 'bank_dep_btn'
            }));
            return message.reply(UIManager.toResponse(container));
        } catch (err) {
            const errContainer = UIManager.createContainer({ title: '❌ Transaction Failed', accentColor: UIManager.ACCENTS.ROSE });
            errContainer.addSectionComponents(UIManager.createSection({ title: 'Error', content: err.message, buttonLabel: 'Failed', buttonId: 'bank_err_btn' }));
            return message.reply(UIManager.toResponse(errContainer));
        }
    }
};
