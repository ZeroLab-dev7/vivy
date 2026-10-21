const EconomyRepository = require('../repositories/economyRepository');

class GamblingService {
    /**
     * Coinflip game
     */
    static async coinflip(userId, guildId, betAmount, choice) {
        const bet = BigInt(betAmount);
        if (bet <= 0n) throw new Error('Bet amount must be positive.');

        const account = await EconomyRepository.getOrCreateAccount(userId, guildId);
        if (BigInt(account.balance) < bet) {
            throw new Error('Insufficient wallet balance to place this bet.');
        }

        const outcomes = ['heads', 'tails'];
        const result = outcomes[Math.floor(Math.random() * outcomes.length)];
        const won = choice.toLowerCase() === result;

        if (won) {
            account.balance = BigInt(account.balance) + bet;
            await EconomyRepository.logTransaction(userId, guildId, bet, 'gamble_win', 'coinflip', 'Coinflip win');
        } else {
            account.balance = BigInt(account.balance) - bet;
            await EconomyRepository.logTransaction(userId, guildId, bet, 'gamble_loss', 'coinflip', 'Coinflip loss');
        }

        await account.save();
        await EconomyRepository.calculateNetWorth(userId, guildId);

        return { won, result, bet, newBalance: account.balance };
    }

    /**
     * Slots game
     */
    static async slots(userId, guildId, betAmount) {
        const bet = BigInt(betAmount);
        if (bet <= 0n) throw new Error('Bet amount must be positive.');

        const account = await EconomyRepository.getOrCreateAccount(userId, guildId);
        if (BigInt(account.balance) < bet) {
            throw new Error('Insufficient wallet balance to spin slots.');
        }

        const symbols = ['💎', '7️⃣', '🎰', '🍋', '🍒', '🔔'];
        const reel1 = symbols[Math.floor(Math.random() * symbols.length)];
        const reel2 = symbols[Math.floor(Math.random() * symbols.length)];
        const reel3 = symbols[Math.floor(Math.random() * symbols.length)];

        let multiplier = 0;
        if (reel1 === reel2 && reel2 === reel3) {
            multiplier = reel1 === '💎' ? 10 : 5;
        } else if (reel1 === reel2 || reel2 === reel3 || reel1 === reel3) {
            multiplier = 2;
        }

        const won = multiplier > 0;
        const reward = bet * BigInt(multiplier);

        if (won) {
            account.balance = BigInt(account.balance) + reward - bet;
            await EconomyRepository.logTransaction(userId, guildId, reward, 'gamble_win', 'slots', 'Slots win');
        } else {
            account.balance = BigInt(account.balance) - bet;
            await EconomyRepository.logTransaction(userId, guildId, bet, 'gamble_loss', 'slots', 'Slots loss');
        }

        await account.save();
        await EconomyRepository.calculateNetWorth(userId, guildId);

        return { won, reels: [reel1, reel2, reel3], multiplier, reward, newBalance: account.balance };
    }
}

module.exports = GamblingService;
