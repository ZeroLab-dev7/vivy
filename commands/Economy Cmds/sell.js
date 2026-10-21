const InventoryService = require('../../services/inventoryService');
const UIManager = require('../../managers/uiManager');

module.exports = {
    name: 'sell',
    description: 'Sell an item from inventory',
    async execute(message, args) {
        const itemId = args[0];
        const qty = parseInt(args[1]) || 1;

        if (!itemId) {
            const errContainer = UIManager.createContainer({ title: '⚠️ Usage Error', accentColor: UIManager.ACCENTS.AMBER });
            errContainer.addSectionComponents(UIManager.createSection({ title: 'Syntax', content: 'Usage: `?sell <item_id> [quantity]`', buttonLabel: 'Info', buttonId: 'sell_info' }));
            return message.reply(UIManager.toResponse(errContainer));
        }

        try {
            const res = await InventoryService.sellItem(message.author.id, message.guild.id, itemId, qty);
            const container = UIManager.createContainer({ title: '💰 Item Sold', accentColor: UIManager.ACCENTS.EMERALD });
            container.addSectionComponents(UIManager.createSection({
                title: `${res.item.emoji} ${res.item.name}`,
                content: `Sold: \`${res.quantity}x\` for \`+$${res.totalEarned.toLocaleString()}\``,
                buttonLabel: 'Sold',
                buttonId: 'shop_sell_btn'
            }));
            return message.reply(UIManager.toResponse(container));
        } catch (err) {
            const errContainer = UIManager.createContainer({ title: '❌ Sale Failed', accentColor: UIManager.ACCENTS.ROSE });
            errContainer.addSectionComponents(UIManager.createSection({ title: 'Error', content: err.message, buttonLabel: 'Failed', buttonId: 'shop_err_btn' }));
            return message.reply(UIManager.toResponse(errContainer));
        }
    }
};
