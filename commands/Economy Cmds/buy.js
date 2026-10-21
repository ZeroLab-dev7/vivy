const InventoryService = require('../../services/inventoryService');
const UIManager = require('../../managers/uiManager');

module.exports = {
    name: 'buy',
    description: 'Buy an item from the shop',
    async execute(message, args) {
        const itemId = args[0];
        const qty = parseInt(args[1]) || 1;

        if (!itemId) {
            const errContainer = UIManager.createContainer({ title: '⚠️ Usage Error', accentColor: UIManager.ACCENTS.AMBER });
            errContainer.addSectionComponents(UIManager.createSection({ title: 'Syntax', content: 'Usage: `?buy <item_id> [quantity]`', buttonLabel: 'Info', buttonId: 'buy_info' }));
            return message.reply(UIManager.toResponse(errContainer));
        }

        try {
            const res = await InventoryService.buyItem(message.author.id, message.guild.id, itemId, qty);
            const container = UIManager.createContainer({ title: '🛍️ Item Purchased', accentColor: UIManager.ACCENTS.EMERALD });
            container.addSectionComponents(UIManager.createSection({
                title: `${res.item.emoji} ${res.item.name}`,
                content: `Purchased: \`${res.quantity}x\` for \`$${res.totalPrice.toLocaleString()}\``,
                buttonLabel: 'Bought',
                buttonId: 'shop_buy_btn'
            }));
            return message.reply(UIManager.toResponse(container));
        } catch (err) {
            const errContainer = UIManager.createContainer({ title: '❌ Purchase Failed', accentColor: UIManager.ACCENTS.ROSE });
            errContainer.addSectionComponents(UIManager.createSection({ title: 'Error', content: err.message, buttonLabel: 'Failed', buttonId: 'shop_err_btn' }));
            return message.reply(UIManager.toResponse(errContainer));
        }
    }
};
