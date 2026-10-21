const { SlashCommandBuilder } = require('discord.js');
const InventoryService = require('../../services/inventoryService');
const { ITEMS } = require('../../constants/economy');
const UIManager = require('../../managers/uiManager');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('shop')
        .setDescription('Browse or purchase items from the economy shop')
        .addSubcommand(sub => sub.setName('list').setDescription('View available items in shop'))
        .addSubcommand(sub => sub
            .setName('buy')
            .setDescription('Buy an item')
            .addStringOption(opt => opt.setName('item').setDescription('Item ID').setRequired(true))
            .addIntegerOption(opt => opt.setName('quantity').setDescription('Quantity to buy').setRequired(false))
        )
        .addSubcommand(sub => sub
            .setName('sell')
            .setDescription('Sell an item')
            .addStringOption(opt => opt.setName('item').setDescription('Item ID').setRequired(true))
            .addIntegerOption(opt => opt.setName('quantity').setDescription('Quantity to sell').setRequired(false))
        ),

    async execute(interaction) {
        await interaction.deferReply();
        const subcommand = interaction.options.getSubcommand();

        if (subcommand === 'buy') {
            const itemId = interaction.options.getString('item');
            const qty = interaction.options.getInteger('quantity') || 1;

            try {
                const res = await InventoryService.buyItem(interaction.user.id, interaction.guild.id, itemId, qty);
                const container = UIManager.createContainer({ title: '🛍️ Item Purchased', accentColor: UIManager.ACCENTS.EMERALD });
                container.addSectionComponents(UIManager.createSection({
                    title: `${res.item.emoji} ${res.item.name}`,
                    content: `Purchased: \`${res.quantity}x\` for \`$${res.totalPrice.toLocaleString()}\``,
                    buttonLabel: 'Bought',
                    buttonId: 'shop_buy_btn'
                }));
                return interaction.editReply(UIManager.toResponse(container));
            } catch (err) {
                const errContainer = UIManager.createContainer({ title: '❌ Purchase Failed', accentColor: UIManager.ACCENTS.ROSE });
                errContainer.addSectionComponents(UIManager.createSection({ title: 'Error', content: err.message, buttonLabel: 'Failed', buttonId: 'shop_err_btn' }));
                return interaction.editReply(UIManager.toResponse(errContainer));
            }
        } else if (subcommand === 'sell') {
            const itemId = interaction.options.getString('item');
            const qty = interaction.options.getInteger('quantity') || 1;

            try {
                const res = await InventoryService.sellItem(interaction.user.id, interaction.guild.id, itemId, qty);
                const container = UIManager.createContainer({ title: '💰 Item Sold', accentColor: UIManager.ACCENTS.EMERALD });
                container.addSectionComponents(UIManager.createSection({
                    title: `${res.item.emoji} ${res.item.name}`,
                    content: `Sold: \`${res.quantity}x\` for \`+$${res.totalEarned.toLocaleString()}\``,
                    buttonLabel: 'Sold',
                    buttonId: 'shop_sell_btn'
                }));
                return interaction.editReply(UIManager.toResponse(container));
            } catch (err) {
                const errContainer = UIManager.createContainer({ title: '❌ Sale Failed', accentColor: UIManager.ACCENTS.ROSE });
                errContainer.addSectionComponents(UIManager.createSection({ title: 'Error', content: err.message, buttonLabel: 'Failed', buttonId: 'shop_err_btn' }));
                return interaction.editReply(UIManager.toResponse(errContainer));
            }
        }

        // List shop items
        const container = UIManager.createContainer({ title: '🏪 Marketplace & Items Shop', accentColor: UIManager.ACCENTS.CYAN });
        const items = Object.values(ITEMS).filter(i => i.buyPrice > 0);

        const sections = items.slice(0, 5).map(item => UIManager.createSection({
            title: `${item.emoji} ${item.name} (\`${item.id}\`)`,
            content: `${item.description}\nPrice: \`${item.buyPrice.toLocaleString()}\` <:vivycoin:1533128699350749425> • Rarity: **${item.rarity}**`,
            buttonLabel: 'Buyable',
            buttonId: `shop_item_${item.id}`
        }));

        UIManager.addSections(container, sections);

        return interaction.editReply(UIManager.toResponse(container));
    }
};
