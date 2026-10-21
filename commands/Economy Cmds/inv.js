const InventoryService = require('../../services/inventoryService');
const { ITEMS } = require('../../constants/economy');
const UIManager = require('../../managers/uiManager');

module.exports = {
    name: 'inventory',
    aliases: ['inv'],
    description: 'View user inventory',
    async execute(message, args) {
        const target = message.mentions.users.first() || message.author;
        const items = await InventoryService.getInventory(target.id, message.guild.id);

        const container = UIManager.createContainer({
            title: `🎒 ${target.username}'s Inventory`,
            accentColor: UIManager.ACCENTS.INDIGO
        });

        if (!items || items.length === 0) {
            container.addSectionComponents(UIManager.createSection({
                title: 'Empty Backpack',
                content: 'No items in inventory! Visit `?shop` to buy items.',
                buttonLabel: 'Empty',
                buttonId: 'inv_empty_btn'
            }));
            return message.reply(UIManager.toResponse(container));
        }

        const sections = [];
        items.forEach(invItem => {
            const def = Object.values(ITEMS).find(i => i.id === invItem.item_id);
            if (def) {
                sections.push(UIManager.createSection({
                    title: `${def.emoji} ${def.name} (\`${def.id}\`)`,
                    content: `Quantity: \`x${invItem.quantity}\` • Value: \`${((def.sellPrice || 0) * invItem.quantity).toLocaleString()}\` <:vivycoin:1533128699350749425>`,
                    buttonLabel: def.rarity,
                    buttonId: `inv_item_${def.id}`
                }));
            }
        });

        UIManager.addSections(container, sections);

        return message.reply(UIManager.toResponse(container));
    }
};
