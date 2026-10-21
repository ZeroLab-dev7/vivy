const EconomyService = require('../../services/economyService');
const UIManager = require('../../managers/uiManager');

module.exports = {
    name: 'work',
    aliases: ['w', 'job'],
    description: 'Work your job shift to earn salary',
    async execute(message, args) {
        const res = await EconomyService.work(message.author.id, message.guild.id);

        if (!res.success) {
            const unixTime = Math.floor(res.nextWork.getTime() / 1000);
            const errContainer = UIManager.createContainer({
                title: '⏳ Shift Cooldown Active',
                accentColor: UIManager.ACCENTS.AMBER
            });
            const sec = UIManager.createSection({
                title: 'Resting',
                content: `You are exhausted from your last shift!\nNext shift available: <t:${unixTime}:R>`,
                buttonLabel: 'Cooldown',
                buttonId: 'work_cd_btn'
            });
            errContainer.addSectionComponents(sec);
            return message.reply(UIManager.toResponse(errContainer));
        }

        const container = UIManager.createContainer({
            title: `💼 Shift Completed as ${res.job}`,
            accentColor: UIManager.ACCENTS.CYAN
        });

        const rewardSec = UIManager.createSection({
            title: '<:vivycoin:1533128699350749425> Salary Payment',
            content: `Earned: \`+${res.earned.toLocaleString()}\` <:vivycoin:1533128699350749425>\nXP Gained: \`+50 XP ⚡\``,
            buttonLabel: 'Paid',
            buttonId: 'work_paid_btn'
        });

        container.addSectionComponents(rewardSec);
        return message.reply(UIManager.toResponse(container));
    }
};
