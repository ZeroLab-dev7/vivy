const EconomyService = require('../../services/economyService');
const UIManager = require('../../managers/uiManager');

module.exports = {
    name: 'balance',
    aliases: ['bal', 'money'],
    description: 'View user economy balance',
    async execute(message, args) {
        const target = message.mentions.users.first() || message.author;
        const account = await EconomyService.getAccount(target.id, message.guild.id);

        const container = UIManager.createContainer({
            title: `${target.username}'s Vault & Financial Overview`,
            accentColor: UIManager.ACCENTS.CYAN
        });

        const walletSec = UIManager.createSection({
            title: '<:vivycoin:1533128699350749425> Wallet Cash',
            content: `\`${Number(account.balance).toLocaleString()}\` <:vivycoin:1533128699350749425>`,
            buttonLabel: 'Cash',
            buttonId: 'bal_cash_btn'
        });

        const bankSec = UIManager.createSection({
            title: '<:5526iconbank:1533131833338761297> Bank Reserves',
            content: `\`${Number(account.bank).toLocaleString()}\` / \`${Number(account.bank_capacity).toLocaleString()}\` <:vivycoin:1533128699350749425>`,
            buttonLabel: 'Vault',
            buttonId: 'bal_bank_res_btn'
        });

        const netSec = UIManager.createSection({
            title: '💎 Net Worth & Gems',
            content: `Net Worth: \`${Number(account.net_worth).toLocaleString()}\` <:vivycoin:1533128699350749425>\nGems: \`${account.gems} 💎\``,
            buttonLabel: 'Assets',
            buttonId: 'bal_net_btn'
        });

        const tipSec = UIManager.createSection({
            title: '💡 Bank Protection Reminder',
            content: 'Keep your cash safe! Money in your **Wallet** can be stolen by robbers. Click the button below to deposit into your **Bank Vault**.',
            buttonLabel: 'Deposit Now 🏦',
            buttonId: 'bal_tip_dep_btn',
            disabled: false
        });

        UIManager.addSections(container, [walletSec, bankSec, netSec, tipSec]);

        return message.reply(UIManager.toResponse(container));
    }
};
