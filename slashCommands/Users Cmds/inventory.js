const { SlashCommandBuilder } = require('discord.js');
const InventoryService = require('../../services/inventoryService');
const { ITEMS } = require('../../constants/economy');
const UIManager = require('../../managers/uiManager');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('inventory')
        .setDescription('View your items and inventory holdings'),

    async execute(interaction) {
        await interaction.deferReply();
        const items = await InventoryService.getInventory(interaction.user.id, interaction.guild.id);

        const container = UIManager.createContainer({
            title: `🎒 ${interaction.user.username}'s Inventory`,
            accentColor: UIManager.ACCENTS.INDIGO
        });

        if (!items || items.length === 0) {
            container.addSectionComponents(UIManager.createSection({
                title: 'Empty Backpack',
                content: 'You do not own any items yet! Visit the `/shop` to buy items.',
                buttonLabel: 'Empty',
                buttonId: 'inv_empty_btn'
            }));
            return interaction.editReply(UIManager.toResponse(container));
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

        return interaction.editReply(UIManager.toResponse(container));
    }
};
