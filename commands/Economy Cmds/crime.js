const GatheringService = require('../../services/gatheringService');
const UIManager = require('../../managers/uiManager');

module.exports = {
    name: 'crime',
    description: 'Attempt high-stakes street crimes',
    async execute(message, args) {
        try {
            const res = await GatheringService.crime(message.author.id, message.guild.id);
            if (!res.success) {
                if (res.nextTime) {
                    const unixTime = Math.floor(res.nextTime.getTime() / 1000);
                    const errContainer = UIManager.createContainer({ title: '⏳ Crime Heat Active', accentColor: UIManager.ACCENTS.AMBER });
                    errContainer.addSectionComponents(UIManager.createSection({ title: 'Hiding from Cops', content: `Police are searching for you! Next crime <t:${unixTime}:R>`, buttonLabel: 'Wanted', buttonId: 'crime_cd' }));
                    return message.reply(UIManager.toResponse(errContainer));
                }
                const failContainer = UIManager.createContainer({ title: `🚨 Crime Busted: ${res.crime}`, accentColor: UIManager.ACCENTS.ROSE });
                failContainer.addSectionComponents(UIManager.createSection({
                    title: 'Arrested by Police',
                    content: `You were caught! Fined: \`-$${res.fine.toLocaleString()}\``,
                    buttonLabel: 'Fined',
                    buttonId: 'crime_fine'
                }));
                return message.reply(UIManager.toResponse(failContainer));
            }

            const container = UIManager.createContainer({ title: `🕵️ Crime Heist Successful: ${res.crime}`, accentColor: UIManager.ACCENTS.EMERALD });
            container.addSectionComponents(UIManager.createSection({
                title: 'Loot Secured',
                content: `Reward: \`+$${res.reward.toLocaleString()}\``,
                buttonLabel: 'Escaped',
                buttonId: 'crime_loot'
            }));
            return message.reply(UIManager.toResponse(container));
        } catch (err) {
            const errContainer = UIManager.createContainer({ title: '❌ Error', accentColor: UIManager.ACCENTS.ROSE });
            errContainer.addSectionComponents(UIManager.createSection({ title: 'Failed', content: err.message, buttonLabel: 'Error', buttonId: 'gath_err' }));
            return message.reply(UIManager.toResponse(errContainer));
        }
    }
};
