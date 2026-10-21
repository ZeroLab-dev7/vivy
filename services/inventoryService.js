const { Inventory } = require('../db/models');
const EconomyRepository = require('../repositories/economyRepository');
const { ITEMS } = require('../constants/economy');

class InventoryService {
    /**
     * Fetch user inventory items
     */
    static async getInventory(userId, guildId) {
        return await Inventory.findAll({ where: { user_id: userId, guild_id: guildId } });
    }

    /**
     * Buy item from shop
     */
    static async buyItem(userId, guildId, itemId, quantity = 1) {
        const itemDef = Object.values(ITEMS).find(i => i.id === itemId);
        if (!itemDef || !itemDef.buyPrice) throw new Error('Item is not available in the shop.');

        const totalPrice = BigInt(itemDef.buyPrice) * BigInt(quantity);
        const account = await EconomyRepository.getOrCreateAccount(userId, guildId);

        if (BigInt(account.balance) < totalPrice) {
            throw new Error(`Insufficient funds. You need $${totalPrice.toLocaleString()} to purchase this.`);
        }

        account.balance = BigInt(account.balance) - totalPrice;
        await account.save();

        let invItem = await Inventory.findOne({ where: { user_id: userId, guild_id: guildId, item_id: itemId } });
        if (invItem) {
            invItem.quantity += quantity;
            await invItem.save();
        } else {
            await Inventory.create({
                user_id: userId,
                guild_id: guildId,
                item_id: itemId,
                quantity,
                durability: itemDef.durability || null
            });
        }

        await EconomyRepository.logTransaction(userId, guildId, totalPrice, 'buy', 'shop_buy', `Bought ${quantity}x ${itemDef.name}`);
        await EconomyRepository.calculateNetWorth(userId, guildId);

        return { item: itemDef, quantity, totalPrice };
    }

    /**
     * Sell item from inventory
     */
    static async sellItem(userId, guildId, itemId, quantity = 1) {
        const itemDef = Object.values(ITEMS).find(i => i.id === itemId);
        if (!itemDef || !itemDef.sellPrice) throw new Error('This item cannot be sold.');

        const invItem = await Inventory.findOne({ where: { user_id: userId, guild_id: guildId, item_id: itemId } });
        if (!invItem || invItem.quantity < quantity) {
            throw new Error('You do not have enough of this item in your inventory.');
        }

        const totalEarned = BigInt(itemDef.sellPrice) * BigInt(quantity);
        const account = await EconomyRepository.getOrCreateAccount(userId, guildId);

        account.balance = BigInt(account.balance) + totalEarned;
        await account.save();

        if (invItem.quantity === quantity) {
            await invItem.destroy();
        } else {
            invItem.quantity -= quantity;
            await invItem.save();
        }

        await EconomyRepository.logTransaction(userId, guildId, totalEarned, 'sell', 'shop_sell', `Sold ${quantity}x ${itemDef.name}`);
        await EconomyRepository.calculateNetWorth(userId, guildId);

        return { item: itemDef, quantity, totalEarned };
    }
}

module.exports = InventoryService;
