const GamblingService = require('../../services/gamblingService');
const UIManager = require('../../managers/uiManager');

module.exports = {
    name: 'slots',
    aliases: ['slot'],
    description: 'Spin casino slot machine',
    async execute(message, args) {
        const bet = parseInt(args[0]);

        if (isNaN(bet) || bet <= 0) {
            const errContainer = UIManager.createContainer({ title: '⚠️ Usage Error', accentColor: UIManager.ACCENTS.AMBER });
            errContainer.addSectionComponents(UIManager.createSection({ title: 'Syntax', content: 'Usage: `?slots <bet>`', buttonLabel: 'Info', buttonId: 'slots_info' }));
            return message.reply(UIManager.toResponse(errContainer));
        }

        try {
            const res = await GamblingService.slots(message.author.id, message.guild.id, bet);
            const container = UIManager.createContainer({
                title: `🎰 Slots ${res.won ? 'JACKPOT' : 'NO MATCH'}`,
                accentColor: res.won ? UIManager.ACCENTS.EMERALD : UIManager.ACCENTS.ROSE
            });

            container.addSectionComponents(UIManager.createSection({
                title: `[ ${res.reels.join(' | ')} ]`,
                content: res.won
                    ? `Multiplier: \`${res.multiplier}x\` • Payout: \`+$${res.reward.toLocaleString()}\` 🎉`
                    : `Lost: \`-$${bet.toLocaleString()}\` 💸`,
                buttonLabel: res.won ? `${res.multiplier}x Payout` : 'No Match',
                buttonId: 'slots_res_btn'
            }));
            return message.reply(UIManager.toResponse(container));
        } catch (err) {
            const errContainer = UIManager.createContainer({ title: '❌ Gambling Error', accentColor: UIManager.ACCENTS.ROSE });
            errContainer.addSectionComponents(UIManager.createSection({ title: 'Error', content: err.message, buttonLabel: 'Failed', buttonId: 'gamble_err' }));
            return message.reply(UIManager.toResponse(errContainer));
        }
    }
};
