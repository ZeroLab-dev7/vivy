const EconomyService = require('../../services/economyService');
const UIManager = require('../../managers/uiManager');

module.exports = {
    name: 'daily',
    aliases: ['d'],
    description: 'Claim daily cash reward',
    async execute(message, args) {
        const res = await EconomyService.claimDaily(message.author.id, message.guild.id);

        if (!res.success) {
            const unixTime = Math.floor(res.nextClaim.getTime() / 1000);
            const errContainer = UIManager.createContainer({
                title: '⏳ Daily Cooldown Active',
                accentColor: UIManager.ACCENTS.AMBER
            });
            const sec = UIManager.createSection({
                title: 'Please Wait',
                content: `You have already claimed your daily reward today!\nNext claim available: <t:${unixTime}:R>`,
                buttonLabel: 'Cooldown',
                buttonId: 'daily_cd_btn'
            });
            errContainer.addSectionComponents(sec);
            return message.reply(UIManager.toResponse(errContainer));
        }

        const container = UIManager.createContainer({
            title: '🎁 Daily Reward Claimed!',
            accentColor: UIManager.ACCENTS.EMERALD
        });

        const rewardSec = UIManager.createSection({
            title: '<:vivycoin:1533128699350749425> Cash Reward Received',
            content: `Earned: \`+${res.reward.toLocaleString()}\` <:vivycoin:1533128699350749425>\nCurrent Streak: \`${res.streak} Days 🔥\``,
            buttonLabel: 'Claimed',
            buttonId: 'daily_reward_btn'
        });

        const bankTipSec = UIManager.createSection({
            title: '<:5526iconbank:1533131833338761297> Protect Your Rewards',
            content: 'Don\'t let robbers steal your cash! Click the button below to deposit your earnings into your Bank Vault.',
            buttonLabel: 'Deposit Now 🏦',
            buttonId: 'daily_bank_tip',
            disabled: false
        });

        UIManager.addSections(container, [rewardSec, bankTipSec]);
        return message.reply(UIManager.toResponse(container));
    }
};
