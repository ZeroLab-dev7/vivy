const EconomyService = require('../../services/economyService');
const UIManager = require('../../managers/uiManager');

module.exports = {
    name: 'withdraw',
    aliases: ['with'],
    description: 'Withdraw cash from bank vault',
    async execute(message, args) {
        const amountStr = args[0];
        if (!amountStr) {
            const errContainer = UIManager.createContainer({ title: '⚠️ Usage Error', accentColor: UIManager.ACCENTS.AMBER });
            errContainer.addSectionComponents(UIManager.createSection({ title: 'Syntax', content: 'Usage: `?withdraw <amount | all>`', buttonLabel: 'Info', buttonId: 'with_info' }));
            return message.reply(UIManager.toResponse(errContainer));
        }

        try {
            const res = await EconomyService.withdraw(message.author.id, message.guild.id, amountStr);
            const container = UIManager.createContainer({ title: '<:5526iconbank:1533131833338761297> Bank Withdrawal Successful', accentColor: UIManager.ACCENTS.CYAN });
            container.addSectionComponents(UIManager.createSection({
                title: 'Vault Status',
                content: `Withdrawn: \`-${Number(res.withdrawn).toLocaleString()}\` <:vivycoin:1533128699350749425>\nBank Balance: \`${Number(res.newBank).toLocaleString()}\` <:vivycoin:1533128699350749425>\nNew Wallet: \`${Number(res.newWallet).toLocaleString()}\` <:vivycoin:1533128699350749425>`,
                buttonLabel: 'Withdrawn',
                buttonId: 'bank_with_btn'
            }));
            return message.reply(UIManager.toResponse(container));
        } catch (err) {
            const errContainer = UIManager.createContainer({ title: '❌ Transaction Failed', accentColor: UIManager.ACCENTS.ROSE });
            errContainer.addSectionComponents(UIManager.createSection({ title: 'Error', content: err.message, buttonLabel: 'Failed', buttonId: 'bank_err_btn' }));
            return message.reply(UIManager.toResponse(errContainer));
        }
    }
};
