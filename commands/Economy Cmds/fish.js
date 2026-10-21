const GatheringService = require('../../services/gatheringService');
const UIManager = require('../../managers/uiManager');

module.exports = {
    name: 'fish',
    description: 'Go fishing for sea treasures',
    async execute(message, args) {
        try {
            const res = await GatheringService.fish(message.author.id, message.guild.id);
            if (!res.success) {
                const unixTime = Math.floor(res.nextTime.getTime() / 1000);
                const errContainer = UIManager.createContainer({ title: '⏳ Fishing Cooldown Active', accentColor: UIManager.ACCENTS.AMBER });
                errContainer.addSectionComponents(UIManager.createSection({ title: 'Waiting for Bites', content: `Fish are sleeping! Try again <t:${unixTime}:R>`, buttonLabel: 'Cooldown', buttonId: 'fish_cd' }));
                return message.reply(UIManager.toResponse(errContainer));
            }

            const container = UIManager.createContainer({ title: '🎣 Fishing Expedition Complete', accentColor: UIManager.ACCENTS.CYAN });
            container.addSectionComponents(UIManager.createSection({
                title: `Caught: ${res.catchItem.emoji} ${res.catchItem.name}`,
                content: `Rarity: **${res.catchItem.rarity}** • Est Value: \`$${res.catchItem.sellPrice}\``,
                buttonLabel: 'Caught',
                buttonId: 'fish_catch'
            }));
            return message.reply(UIManager.toResponse(container));
        } catch (err) {
            const errContainer = UIManager.createContainer({ title: '❌ Error', accentColor: UIManager.ACCENTS.ROSE });
            errContainer.addSectionComponents(UIManager.createSection({ title: 'Failed', content: err.message, buttonLabel: 'Error', buttonId: 'gath_err' }));
            return message.reply(UIManager.toResponse(errContainer));
        }
    }
};
