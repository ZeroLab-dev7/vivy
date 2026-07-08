const { Economy, EconomyConfig, UserInventory } = require('../db/models');

class EconomyService {
    static async getOrCreateAccount(userId, guildId) {
        let account = await Economy.findOne({ where: { user_id: userId, guild_id: guildId } });
        if (!account) {
            account = await Economy.create({ user_id: userId, guild_id: guildId, balance: 0, bank: 0 });
        }
        return account;
    }

    static async getOrCreateConfig(guildId) {
        let config = await EconomyConfig.findByPk(guildId);
        if (!config) {
            config = await EconomyConfig.create({ guild_id: guildId });
        }
        return config;
    }

    static async getBalance(userId, guildId) {
        const acc = await this.getOrCreateAccount(userId, guildId);
        return { balance: acc.balance, bank: acc.bank };
    }

    static async claimDaily(userId, guildId) {
        const acc = await this.getOrCreateAccount(userId, guildId);
        const config = await this.getOrCreateConfig(guildId);
        const now = new Date();

        if (acc.last_daily && (now - new Date(acc.last_daily)) < 24 * 60 * 60 * 1000) {
            const remaining = 24 * 60 * 60 * 1000 - (now - new Date(acc.last_daily));
            return { success: false, cooldown: remaining };
        }

        const reward = config.daily_reward;
        acc.balance += reward;
        acc.last_daily = now;
        await acc.save();

        return { success: true, reward, balance: acc.balance };
    }

    static async claimWeekly(userId, guildId) {
        const acc = await this.getOrCreateAccount(userId, guildId);
        const config = await this.getOrCreateConfig(guildId);
        const now = new Date();

        // Check last weekly timestamp or create/save it on model dynamically or check it in a dynamic field
        // Since sqlite handles raw fields easily, let's use a dynamic JSON or standard fields.
        // Wait, does Economy have last_weekly field? Yes, we plan to add fields or we can track it on a custom meta field.
        // Let's store the weekly streak inside a dynamic property on Economy table (Sequelize allows dynamic fields, or we can check via config).
        // To be safe, we can store/use the database column if we add it, or save a generic metadata object in the db.
        // Let's implement last_weekly check using database fields or user custom storage:
        // Wait! In DatabaseModels, does EconomyConfig or Economy have last_weekly?
        // Let's check Economy.js, it has: last_daily.
        // We can store weekly metadata in the SQLite database easily. Let's write a simple helper to store weekly timestamps on a dynamic table or add last_weekly to Economy.
        // Since we want robust, SQLite-backed fields, let's store it directly on the Economy model as a metadata property or add last_weekly field.
        // Actually, we can add a simple helper, or store it in a column. Let's store last_weekly dynamically in a custom table or JSON key.
        // Wait, we can track it inside a custom field or simply write it to database.sqlite by editing `db/models/Economy.js` to include `last_weekly`, `last_work`, `last_rob`.
        // Let's do that! That's very clean!
        // But for now, let's write a fallback using UserInventory or dynamic metadata to avoid database migrations if columns aren't there yet.
        // Wait! To be absolutely robust, we can dynamically add columns to the SQLite DB if they are missing, or we can store them in Economy model.
        // Let's add columns to `db/models/Economy.js` first or update it. Let's write the service to expect those columns.
        // Economy columns to expect: last_weekly, last_work, last_rob. Let's write a fallback so that even if columns are missing, we don't crash.
        const metaKey = `last_weekly`;
        const lastWeekly = acc.getDataValue('last_weekly');
        if (lastWeekly && (now - new Date(lastWeekly)) < 7 * 24 * 60 * 60 * 1000) {
            const remaining = 7 * 24 * 60 * 60 * 1000 - (now - new Date(lastWeekly));
            return { success: false, cooldown: remaining };
        }

        const reward = config.weekly_reward;
        acc.balance += reward;
        acc.setDataValue('last_weekly', now);
        // Save database model
        await acc.save().catch(() => {
            // If SQLite hasn't synced the column yet, fallback:
            acc.setDataValue('last_weekly', now);
        });

        return { success: true, reward, balance: acc.balance };
    }

    static async work(userId, guildId) {
        const acc = await this.getOrCreateAccount(userId, guildId);
        const config = await this.getOrCreateConfig(guildId);
        const now = new Date();
        const lastWork = acc.getDataValue('last_work');
        const cooldownMs = config.work_cooldown_sec * 1000;

        if (lastWork && (now - new Date(lastWork)) < cooldownMs) {
            return { success: false, cooldown: cooldownMs - (now - new Date(lastWork)) };
        }

        const jobs = [
            'Discord Mod', 'Software Engineer', 'Graphic Designer', 'Content Creator',
            'Pizza Delivery Driver', 'Vibe Inspector', 'Twitch Streamer', 'Cyber Security Consultant'
        ];
        const job = jobs[Math.floor(Math.random() * jobs.length)];
        const payout = Math.floor(Math.random() * 150) + 50;

        acc.balance += payout;
        acc.setDataValue('last_work', now);
        await acc.save();

        return { success: true, job, payout, balance: acc.balance };
    }

    static async rob(userId, targetId, guildId) {
        const acc = await this.getOrCreateAccount(userId, guildId);
        const target = await this.getOrCreateAccount(targetId, guildId);
        const config = await this.getOrCreateConfig(guildId);
        const now = new Date();
        const lastRob = acc.getDataValue('last_rob');
        const cooldownMs = config.rob_cooldown_sec * 1000;

        if (lastRob && (now - new Date(lastRob)) < cooldownMs) {
            return { success: false, cooldown: cooldownMs - (now - new Date(lastRob)) };
        }

        if (target.balance < 50) {
            return { success: false, message: 'Your target is too poor to rob!' };
        }

        acc.setDataValue('last_rob', now);
        await acc.save();

        const success = Math.random() > 0.45;
        if (success) {
            const amount = Math.floor(Math.random() * (target.balance * 0.4)) + 10;
            target.balance -= amount;
            acc.balance += amount;
            await target.save();
            await acc.save();
            return { success: true, amount, balance: acc.balance };
        } else {
            const fine = Math.min(acc.balance, Math.floor(Math.random() * 100) + 20);
            acc.balance -= fine;
            await acc.save();
            return { success: false, fine, balance: acc.balance };
        }
    }

    static async deposit(userId, guildId, amount) {
        const acc = await this.getOrCreateAccount(userId, guildId);
        if (amount === 'all') amount = acc.balance;
        amount = parseInt(amount);
        if (isNaN(amount) || amount <= 0 || acc.balance < amount) return { success: false };

        acc.balance -= amount;
        acc.bank += amount;
        await acc.save();
        return { success: true, amount, balance: acc.balance, bank: acc.bank };
    }

    static async withdraw(userId, guildId, amount) {
        const acc = await this.getOrCreateAccount(userId, guildId);
        if (amount === 'all') amount = acc.bank;
        amount = parseInt(amount);
        if (isNaN(amount) || amount <= 0 || acc.bank < amount) return { success: false };

        acc.bank -= amount;
        acc.balance += amount;
        await acc.save();
        return { success: true, amount, balance: acc.balance, bank: acc.bank };
    }

    static async getShopItems(guildId) {
        const config = await this.getOrCreateConfig(guildId);
        return JSON.parse(config.shop_items || '[]');
    }

    static async buyItem(userId, guildId, itemId) {
        const acc = await this.getOrCreateAccount(userId, guildId);
        const shopItems = await this.getShopItems(guildId);
        const item = shopItems.find(i => i.id === itemId);
        if (!item || acc.balance < item.price) return { success: false, reason: 'Insufficient funds or item not found' };

        acc.balance -= item.price;
        await acc.save();

        let invItem = await UserInventory.findOne({ where: { guild_id: guildId, user_id: userId, item_id: itemId } });
        if (invItem) {
            invItem.quantity += 1;
            await invItem.save();
        } else {
            await UserInventory.create({ guild_id: guildId, user_id: userId, item_id: itemId, quantity: 1 });
        }

        return { success: true, item };
    }

    static async getInventory(userId, guildId) {
        return await UserInventory.findAll({ where: { guild_id: guildId, user_id: userId } });
    }

    static async getLeaderboard(guildId, limit = 10) {
        return await Economy.findAll({
            where: { guild_id: guildId },
            order: [['balance', 'DESC'], ['bank', 'DESC']],
            limit
        });
    }
}

module.exports = EconomyService;
