const { ITEMS } = require('../../constants/economy');
const UIManager = require('../../managers/uiManager');

module.exports = {
    name: 'shop',
    aliases: ['store'],
    description: 'Browse available shop items',
    async execute(message, args) {
        const container = UIManager.createContainer({ title: '🏪 Marketplace & Items Shop', accentColor: UIManager.ACCENTS.CYAN });
        const items = Object.values(ITEMS).filter(i => i.buyPrice > 0);

        const sections = items.slice(0, 5).map(item => UIManager.createSection({
            title: `${item.emoji} ${item.name} (\`${item.id}\`)`,
            content: `${item.description}\nPrice: \`${item.buyPrice.toLocaleString()}\` <:vivycoin:1533128699350749425> • Rarity: **${item.rarity}**`,
            buttonLabel: 'Buyable',
            buttonId: `shop_item_${item.id}`
        }));

        UIManager.addSections(container, sections);

        return message.reply(UIManager.toResponse(container));
    }
};
