const { Economy, Inventory, UserPet, Transaction, UserAchievement, Marketplace, FarmPlot, Cooldown } = require('../db/models');
const { ITEMS } = require('../constants/economy');

class EconomyRepository {
    /**
     * Fetch or create global economy account for user
     */
    static async getOrCreateAccount(userId, guildId = 'global') {
        let account = await Economy.findOne({ where: { user_id: userId } });
        if (!account) {
            account = await Economy.create({
                user_id: userId,
                guild_id: 'global',
                balance: 1000,
                bank: 0,
                bank_capacity: 50000,
                net_worth: 1000,
                gems: 0,
                tokens: 0,
                xp: 0,
                level: 1
            });
        }
        return account;
    }

    /**
     * Calculate and update Net Worth (wallet + bank + inventory valuation)
     */
    static async calculateNetWorth(userId, guildId = 'global') {
        const account = await this.getOrCreateAccount(userId, guildId);
        const inventory = await Inventory.findAll({ where: { user_id: userId } });
        
        let itemValuation = 0;
        for (const invItem of inventory) {
            const def = Object.values(ITEMS).find(i => i.id === invItem.item_id);
            if (def && def.sellPrice) {
                itemValuation += def.sellPrice * invItem.quantity;
            }
        }

        const netWorth = BigInt(account.balance) + BigInt(account.bank) + BigInt(itemValuation);
        account.net_worth = netWorth;
        await account.save();
        return netWorth;
    }

    /**
     * Log transaction audit
     */
    static async logTransaction(userId, guildId = 'global', amount, type, source, reason = '') {
        return await Transaction.create({
            user_id: userId,
            guild_id: guildId || 'global',
            amount: BigInt(amount),
            type,
            source,
            reason
        });
    }

    /**
     * Fetch global leaderboard top accounts
     */
    static async getLeaderboard(guildId = 'global', limit = 10) {
        return await Economy.findAll({
            order: [['net_worth', 'DESC'], ['balance', 'DESC']],
            limit
        });
    }
}

module.exports = EconomyRepository;
