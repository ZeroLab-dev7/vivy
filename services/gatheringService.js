const EconomyRepository = require('../repositories/economyRepository');
const { Inventory } = require('../db/models');
const { ITEMS, CRIMES } = require('../constants/economy');

class GatheringService {
    /**
     * Fishing minigame
     */
    static async fish(userId, guildId) {
        const account = await EconomyRepository.getOrCreateAccount(userId, guildId);
        const now = new Date();
        const cooldownMs = 2 * 60 * 1000;

        if (account.last_fish && (now - new Date(account.last_fish)) < cooldownMs) {
            const nextTime = new Date(new Date(account.last_fish).getTime() + cooldownMs);
            return { success: false, nextTime };
        }

        const rod = await Inventory.findOne({ where: { user_id: userId, guild_id: guildId, item_id: 'fishing_rod' } });
        const goldRod = await Inventory.findOne({ where: { user_id: userId, guild_id: guildId, item_id: 'golden_rod' } });
        const activeRod = goldRod || rod;

        if (!activeRod) {
            throw new Error('You need a Fishing Rod to go fishing! Purchase one in the `/shop`.');
        }

        const rand = Math.random();
        let catchItem = ITEMS.FISH_COMMON;
        if (rand > 0.95) catchItem = ITEMS.FISH_LEGEND;
        else if (rand > 0.70) catchItem = ITEMS.FISH_RARE;

        let invItem = await Inventory.findOne({ where: { user_id: userId, guild_id: guildId, item_id: catchItem.id } });
        if (invItem) {
            invItem.quantity += 1;
            await invItem.save();
        } else {
            await Inventory.create({ user_id: userId, guild_id: guildId, item_id: catchItem.id, quantity: 1 });
        }

        account.last_fish = now;
        account.xp += 20;
        await account.save();
        await EconomyRepository.calculateNetWorth(userId, guildId);

        return { success: true, catchItem };
    }

    /**
     * Mining minigame
     */
    static async mine(userId, guildId) {
        const account = await EconomyRepository.getOrCreateAccount(userId, guildId);
        const now = new Date();
        const cooldownMs = 3 * 60 * 1000;

        if (account.last_mine && (now - new Date(account.last_mine)) < cooldownMs) {
            const nextTime = new Date(new Date(account.last_mine).getTime() + cooldownMs);
            return { success: false, nextTime };
        }

        const pickaxe = await Inventory.findOne({ where: { user_id: userId, guild_id: guildId, item_id: 'pickaxe' } });
        const diamondPickaxe = await Inventory.findOne({ where: { user_id: userId, guild_id: guildId, item_id: 'diamond_pickaxe' } });

        if (!pickaxe && !diamondPickaxe) {
            throw new Error('You need a Pickaxe to mine ores! Purchase one in the `/shop`.');
        }

        const rand = Math.random();
        let ore = ITEMS.STONE;
        if (rand > 0.98) ore = ITEMS.RUBY;
        else if (rand > 0.90) ore = ITEMS.DIAMOND;
        else if (rand > 0.75) ore = ITEMS.GOLD_ORE;
        else if (rand > 0.40) ore = ITEMS.IRON_ORE;

        let invItem = await Inventory.findOne({ where: { user_id: userId, guild_id: guildId, item_id: ore.id } });
        if (invItem) {
            invItem.quantity += 1;
            await invItem.save();
        } else {
            await Inventory.create({ user_id: userId, guild_id: guildId, item_id: ore.id, quantity: 1 });
        }

        account.last_mine = now;
        account.xp += 30;
        await account.save();
        await EconomyRepository.calculateNetWorth(userId, guildId);

        return { success: true, ore };
    }

    /**
     * Crime minigame
     */
    static async crime(userId, guildId) {
        const account = await EconomyRepository.getOrCreateAccount(userId, guildId);
        const now = new Date();
        const cooldownMs = 5 * 60 * 1000;

        if (account.last_crime && (now - new Date(account.last_crime)) < cooldownMs) {
            const nextTime = new Date(new Date(account.last_crime).getTime() + cooldownMs);
            return { success: false, nextTime };
        }

        const crimeDef = CRIMES[Math.floor(Math.random() * CRIMES.length)];
        const success = Math.random() <= crimeDef.successRate;

        account.last_crime = now;

        if (success) {
            const reward = Math.floor(crimeDef.minReward + Math.random() * (crimeDef.maxReward - crimeDef.minReward));
            account.balance = BigInt(account.balance) + BigInt(reward);
            await account.save();
            await EconomyRepository.logTransaction(userId, guildId, reward, 'crime_success', 'crime', crimeDef.name);
            await EconomyRepository.calculateNetWorth(userId, guildId);
            return { success: true, crime: crimeDef.name, reward };
        } else {
            const fine = Math.min(Number(account.balance), crimeDef.fine);
            account.balance = BigInt(account.balance) - BigInt(fine);
            await account.save();
            await EconomyRepository.logTransaction(userId, guildId, fine, 'crime_fail', 'crime', crimeDef.name);
            await EconomyRepository.calculateNetWorth(userId, guildId);
            return { success: false, crime: crimeDef.name, fine };
        }
    }
}

module.exports = GatheringService;
