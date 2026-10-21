const EconomyRepository = require('../repositories/economyRepository');
const { JOBS, CRIMES } = require('../constants/economy');

class EconomyService {
    /**
     * Get user balance & account info
     */
    static async getAccount(userId, guildId) {
        const account = await EconomyRepository.getOrCreateAccount(userId, guildId);
        await EconomyRepository.calculateNetWorth(userId, guildId);
        return account;
    }

    /**
     * Process Daily Reward with streaks & multipliers
     */
    static async claimDaily(userId, guildId) {
        const account = await EconomyRepository.getOrCreateAccount(userId, guildId);
        const now = new Date();
        const cooldownMs = 24 * 60 * 60 * 1000;

        if (account.last_daily && (now - new Date(account.last_daily)) < cooldownMs) {
            const nextClaim = new Date(new Date(account.last_daily).getTime() + cooldownMs);
            return { success: false, nextClaim };
        }

        // Streak calculation
        const isContinuous = account.last_daily && (now - new Date(account.last_daily)) < (48 * 60 * 60 * 1000);
        const streak = isContinuous ? account.daily_streak + 1 : 1;
        const reward = 1000 + (streak * 100);

        account.balance = BigInt(account.balance) + BigInt(reward);
        account.daily_streak = streak;
        account.last_daily = now;

        await account.save();
        await EconomyRepository.logTransaction(userId, guildId, reward, 'daily', 'daily_claim', `Daily claim streak ${streak}`);
        await EconomyRepository.calculateNetWorth(userId, guildId);

        return { success: true, reward, streak };
    }

    /**
     * Transfer money between users
     */
    static async transfer(senderId, receiverId, guildId, amount) {
        if (amount <= 0) throw new Error('Transfer amount must be greater than zero.');
        if (senderId === receiverId) throw new Error('You cannot transfer money to yourself.');

        const sender = await EconomyRepository.getOrCreateAccount(senderId, guildId);
        if (BigInt(sender.balance) < BigInt(amount)) {
            throw new Error('Insufficient wallet balance for this transfer.');
        }

        const receiver = await EconomyRepository.getOrCreateAccount(receiverId, guildId);

        sender.balance = BigInt(sender.balance) - BigInt(amount);
        receiver.balance = BigInt(receiver.balance) + BigInt(amount);

        await sender.save();
        await receiver.save();

        await EconomyRepository.logTransaction(senderId, guildId, amount, 'transfer_out', 'transfer', `Paid ${receiverId}`);
        await EconomyRepository.logTransaction(receiverId, guildId, amount, 'transfer_in', 'transfer', `Received from ${senderId}`);

        await EconomyRepository.calculateNetWorth(senderId, guildId);
        await EconomyRepository.calculateNetWorth(receiverId, guildId);

        return { sender, receiver, amount };
    }

    /**
     * Deposit cash into bank
     */
    static async deposit(userId, guildId, amount) {
        const account = await EconomyRepository.getOrCreateAccount(userId, guildId);
        const wallet = BigInt(account.balance);
        const bank = BigInt(account.bank);
        const capacity = BigInt(account.bank_capacity);

        let depAmount = amount === 'all' ? wallet : BigInt(amount);
        if (depAmount <= 0n) throw new Error('Deposit amount must be positive.');
        if (wallet < depAmount) throw new Error('You do not have enough cash in your wallet.');

        if (bank + depAmount > capacity) {
            depAmount = capacity - bank;
            if (depAmount <= 0n) throw new Error('Your bank account is already at full capacity!');
        }

        account.balance = wallet - depAmount;
        account.bank = bank + depAmount;

        await account.save();
        await EconomyRepository.logTransaction(userId, guildId, depAmount, 'deposit', 'bank', 'Bank deposit');
        await EconomyRepository.calculateNetWorth(userId, guildId);

        return { deposited: depAmount, newBank: account.bank, newWallet: account.balance };
    }

    /**
     * Withdraw cash from bank
     */
    static async withdraw(userId, guildId, amount) {
        const account = await EconomyRepository.getOrCreateAccount(userId, guildId);
        const wallet = BigInt(account.balance);
        const bank = BigInt(account.bank);

        let withAmount = amount === 'all' ? bank : BigInt(amount);
        if (withAmount <= 0n) throw new Error('Withdrawal amount must be positive.');
        if (bank < withAmount) throw new Error('You do not have enough funds in your bank.');

        account.bank = bank - withAmount;
        account.balance = wallet + withAmount;

        await account.save();
        await EconomyRepository.logTransaction(userId, guildId, withAmount, 'withdraw', 'bank', 'Bank withdrawal');
        await EconomyRepository.calculateNetWorth(userId, guildId);

        return { withdrawn: withAmount, newBank: account.bank, newWallet: account.balance };
    }

    /**
     * Perform Job Work
     */
    static async work(userId, guildId) {
        const account = await EconomyRepository.getOrCreateAccount(userId, guildId);
        const now = new Date();
        const cooldownMs = 5 * 60 * 1000; // 5 minutes

        if (account.last_work && (now - new Date(account.last_work)) < cooldownMs) {
            const nextWork = new Date(new Date(account.last_work).getTime() + cooldownMs);
            return { success: false, nextWork };
        }

        const jobDef = JOBS.find(j => j.id === account.job_id) || JOBS[0];
        const earned = Math.floor(jobDef.salary * (0.85 + Math.random() * 0.3));

        account.balance = BigInt(account.balance) + BigInt(earned);
        account.xp += 50;
        account.last_work = now;

        await account.save();
        await EconomyRepository.logTransaction(userId, guildId, earned, 'work', 'work_reward', `Worked as ${jobDef.title}`);
        await EconomyRepository.calculateNetWorth(userId, guildId);

        return { success: true, earned, job: jobDef.title };
    }
}

module.exports = EconomyService;
