const GamblingService = require('../../services/gamblingService');
const UIManager = require('../../managers/uiManager');

module.exports = {
    name: 'coinflip',
    aliases: ['cf', 'flip'],
    description: 'Flip a coin against the house',
    async execute(message, args) {
        const bet = parseInt(args[0]);
        const side = (args[1] || 'heads').toLowerCase();

        if (isNaN(bet) || bet <= 0) {
            const errContainer = UIManager.createContainer({ title: '⚠️ Usage Error', accentColor: UIManager.ACCENTS.AMBER });
            errContainer.addSectionComponents(UIManager.createSection({ title: 'Syntax', content: 'Usage: `?cf <bet> <heads|tails>`', buttonLabel: 'Info', buttonId: 'cf_info' }));
            return message.reply(UIManager.toResponse(errContainer));
        }

        try {
            const res = await GamblingService.coinflip(message.author.id, message.guild.id, bet, side);
            const container = UIManager.createContainer({
                title: `<:vivycoin:1533128699350749425> Coinflip ${res.won ? 'VICTORY' : 'DEFEAT'}`,
                accentColor: res.won ? UIManager.ACCENTS.EMERALD : UIManager.ACCENTS.ROSE
            });

            container.addSectionComponents(UIManager.createSection({
                title: `Coin Result: ${res.result.toUpperCase()} (You chose ${side.toUpperCase()})`,
                content: res.won
                    ? `Won: \`+$${res.bet.toLocaleString()}\` 🎉\nWallet: \`$${Number(res.newBalance).toLocaleString()}\``
                    : `Lost: \`-$${res.bet.toLocaleString()}\` 💀\nWallet: \`$${Number(res.newBalance).toLocaleString()}\``,
                buttonLabel: res.won ? 'Winner' : 'Loser',
                buttonId: 'cf_res_btn'
            }));
            return message.reply(UIManager.toResponse(container));
        } catch (err) {
            const errContainer = UIManager.createContainer({ title: '❌ Gambling Error', accentColor: UIManager.ACCENTS.ROSE });
            errContainer.addSectionComponents(UIManager.createSection({ title: 'Error', content: err.message, buttonLabel: 'Failed', buttonId: 'gamble_err' }));
            return message.reply(UIManager.toResponse(errContainer));
        }
    }
};
