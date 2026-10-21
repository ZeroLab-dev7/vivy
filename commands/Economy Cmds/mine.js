const GatheringService = require('../../services/gatheringService');
const UIManager = require('../../managers/uiManager');

module.exports = {
    name: 'mine',
    description: 'Mine subterranean ores',
    async execute(message, args) {
        try {
            const res = await GatheringService.mine(message.author.id, message.guild.id);
            if (!res.success) {
                const unixTime = Math.floor(res.nextTime.getTime() / 1000);
                const errContainer = UIManager.createContainer({ title: '⏳ Mining Cooldown Active', accentColor: UIManager.ACCENTS.AMBER });
                errContainer.addSectionComponents(UIManager.createSection({ title: 'Stamina Recharging', content: `Arms are tired! Next swing <t:${unixTime}:R>`, buttonLabel: 'Cooldown', buttonId: 'mine_cd' }));
                return message.reply(UIManager.toResponse(errContainer));
            }

            const container = UIManager.createContainer({ title: '⛏️ Mine Excavation Complete', accentColor: UIManager.ACCENTS.INDIGO });
            container.addSectionComponents(UIManager.createSection({
                title: `Extracted: ${res.ore.emoji} ${res.ore.name}`,
                content: `Rarity: **${res.ore.rarity}** • Market Value: \`$${res.ore.sellPrice}\``,
                buttonLabel: 'Mined',
                buttonId: 'mine_ore'
            }));
            return message.reply(UIManager.toResponse(container));
        } catch (err) {
            const errContainer = UIManager.createContainer({ title: '❌ Error', accentColor: UIManager.ACCENTS.ROSE });
            errContainer.addSectionComponents(UIManager.createSection({ title: 'Failed', content: err.message, buttonLabel: 'Error', buttonId: 'gath_err' }));
            return message.reply(UIManager.toResponse(errContainer));
        }
    }
};
