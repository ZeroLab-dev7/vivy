/**
 * Economy System Constants
 * Core data definitions for items, jobs, pets, achievements, titles, badges, crops, and recipes.
 */

const ITEMS = {
    // Tools
    FISHING_ROD: {
        id: 'fishing_rod',
        name: 'Wooden Fishing Rod',
        emoji: '🎣',
        rarity: 'Common',
        category: 'Tools',
        description: 'Basic rod for fishing in calm waters.',
        buyPrice: 500,
        sellPrice: 200,
        durability: 30,
        stackSize: 1,
        usable: false
    },
    GOLDEN_ROD: {
        id: 'golden_rod',
        name: 'Golden Fishing Rod',
        emoji: '✨🎣',
        rarity: 'Rare',
        category: 'Tools',
        description: 'High-tier rod that attracts rare fish.',
        buyPrice: 5000,
        sellPrice: 2500,
        durability: 100,
        stackSize: 1,
        usable: false
    },
    PICKAXE: {
        id: 'pickaxe',
        name: 'Iron Pickaxe',
        emoji: '⛏️',
        rarity: 'Common',
        category: 'Tools',
        description: 'Standard pickaxe for mining stone and iron.',
        buyPrice: 600,
        sellPrice: 250,
        durability: 40,
        stackSize: 1,
        usable: false
    },
    DIAMOND_PICKAXE: {
        id: 'diamond_pickaxe',
        name: 'Diamond Pickaxe',
        emoji: '💎⛏️',
        rarity: 'Epic',
        category: 'Tools',
        description: 'Ultra-durable pickaxe capable of extracting diamonds and rubies.',
        buyPrice: 12000,
        sellPrice: 6000,
        durability: 200,
        stackSize: 1,
        usable: false
    },

    // Consumables & Boosters
    XP_BOOSTER: {
        id: 'xp_booster',
        name: '2x XP Booster (1h)',
        emoji: '⚡',
        rarity: 'Uncommon',
        category: 'Boosters',
        description: 'Doubles all XP gained for 1 hour.',
        buyPrice: 1500,
        sellPrice: 500,
        durability: 1,
        stackSize: 10,
        usable: true,
        effects: { type: 'xp_multiplier', value: 2, durationMinutes: 60 }
    },
    MONEY_BOOSTER: {
        id: 'money_booster',
        name: '1.5x Coin Booster (1h)',
        emoji: '<:vivycoin:1533128699350749425>',
        rarity: 'Rare',
        category: 'Boosters',
        description: 'Boosts earnings by 50% for 1 hour.',
        buyPrice: 3000,
        sellPrice: 1000,
        durability: 1,
        stackSize: 10,
        usable: true,
        effects: { type: 'coin_multiplier', value: 1.5, durationMinutes: 60 }
    },
    PET_FOOD: {
        id: 'pet_food',
        name: 'Premium Pet Food',
        emoji: '🍖',
        rarity: 'Common',
        category: 'Food',
        description: 'Restores 50 Hunger & 30 Energy to active pet.',
        buyPrice: 100,
        sellPrice: 40,
        durability: 1,
        stackSize: 50,
        usable: true,
        effects: { type: 'pet_feed', hunger: 50, energy: 30 }
    },
    BANK_NOTE: {
        id: 'bank_note',
        name: 'Vault Expansion Note',
        emoji: '📜',
        rarity: 'Rare',
        category: 'Collectibles',
        description: 'Increases bank capacity by $25,000.',
        buyPrice: 10000,
        sellPrice: 4000,
        durability: 1,
        stackSize: 20,
        usable: true,
        effects: { type: 'bank_capacity', value: 25000 }
    },

    // Electronics & Assets
    LAPTOP: {
        id: 'laptop',
        name: 'Cyber Laptop',
        emoji: '💻',
        rarity: 'Uncommon',
        category: 'Electronics',
        description: 'Required for tech jobs & cyber crimes.',
        buyPrice: 2500,
        sellPrice: 1200,
        durability: 100,
        stackSize: 1,
        usable: false
    },
    CAR: {
        id: 'car',
        name: 'Sports Car',
        emoji: '🏎️',
        rarity: 'Epic',
        category: 'Vehicles',
        description: 'Luxury sports car. Boosts job salary by 15%.',
        buyPrice: 75000,
        sellPrice: 35000,
        durability: 1,
        stackSize: 1,
        usable: false
    },
    HOUSE: {
        id: 'house',
        name: 'Modern Mansion',
        emoji: '🏰',
        rarity: 'Legendary',
        category: 'Assets',
        description: 'Ultimate flex asset. Grants passive daily income.',
        buyPrice: 500000,
        sellPrice: 250000,
        durability: 1,
        stackSize: 1,
        usable: false
    },

    // Gathering Resources
    STONE: { id: 'stone', name: 'Raw Stone', emoji: '🪨', rarity: 'Common', category: 'Collectibles', buyPrice: 0, sellPrice: 10, stackSize: 999 },
    IRON_ORE: { id: 'iron_ore', name: 'Iron Ore', emoji: '⚙️', rarity: 'Common', category: 'Collectibles', buyPrice: 0, sellPrice: 35, stackSize: 999 },
    GOLD_ORE: { id: 'gold_ore', name: 'Gold Ore', emoji: '🥇', rarity: 'Uncommon', category: 'Collectibles', buyPrice: 0, sellPrice: 100, stackSize: 999 },
    DIAMOND: { id: 'diamond', name: 'Flawless Diamond', emoji: '💎', rarity: 'Epic', category: 'Collectibles', buyPrice: 0, sellPrice: 500, stackSize: 999 },
    RUBY: { id: 'ruby', name: 'Blood Ruby', emoji: '🔻', rarity: 'Legendary', category: 'Collectibles', buyPrice: 0, sellPrice: 1500, stackSize: 999 },

    FISH_COMMON: { id: 'fish_common', name: 'Salmon', emoji: '🐟', rarity: 'Common', category: 'Collectibles', buyPrice: 0, sellPrice: 20, stackSize: 999 },
    FISH_RARE: { id: 'fish_rare', name: 'Golden Bass', emoji: '🐠', rarity: 'Rare', category: 'Collectibles', buyPrice: 0, sellPrice: 150, stackSize: 999 },
    FISH_LEGEND: { id: 'fish_legend', name: 'Kraken Tentacle', emoji: '🦑', rarity: 'Legendary', category: 'Collectibles', buyPrice: 0, sellPrice: 2000, stackSize: 999 },

    WHEAT_SEED: { id: 'wheat_seed', name: 'Wheat Seed', emoji: '🌱', rarity: 'Common', category: 'Tools', buyPrice: 20, sellPrice: 5, stackSize: 999, usable: true },
    WHEAT: { id: 'wheat', name: 'Golden Wheat', emoji: '🌾', rarity: 'Common', category: 'Food', buyPrice: 0, sellPrice: 50, stackSize: 999 }
};

const JOBS = [
    { id: 'dev', title: 'Developer', category: 'Tech', salary: 1200, cooldownMs: 300000, successRate: 0.9, reqLevel: 1, reqItem: 'laptop' },
    { id: 'doctor', title: 'Doctor', category: 'Medical', salary: 1800, cooldownMs: 300000, successRate: 0.85, reqLevel: 5, reqItem: null },
    { id: 'lawyer', title: 'Lawyer', category: 'Legal', salary: 2200, cooldownMs: 300000, successRate: 0.82, reqLevel: 8, reqItem: null },
    { id: 'streamer', title: 'Streamer', category: 'Media', salary: 1000, cooldownMs: 300000, successRate: 0.95, reqLevel: 1, reqItem: null },
    { id: 'designer', title: 'UI/UX Designer', category: 'Tech', salary: 1400, cooldownMs: 300000, successRate: 0.88, reqLevel: 3, reqItem: 'laptop' },
    { id: 'engineer', title: 'Robotics Engineer', category: 'Tech', salary: 2500, cooldownMs: 300000, successRate: 0.8, reqLevel: 10, reqItem: 'laptop' },
    { id: 'police', title: 'Police Officer', category: 'Security', salary: 1600, cooldownMs: 300000, successRate: 0.87, reqLevel: 4, reqItem: null },
    { id: 'chef', title: 'Executive Chef', category: 'Culinary', salary: 1300, cooldownMs: 300000, successRate: 0.9, reqLevel: 2, reqItem: null },
    { id: 'pilot', title: 'Airline Pilot', category: 'Transport', salary: 3000, cooldownMs: 300000, successRate: 0.75, reqLevel: 15, reqItem: null },
    { id: 'scientist', title: 'Quantum Scientist', category: 'Research', salary: 3500, cooldownMs: 300000, successRate: 0.7, reqLevel: 20, reqItem: null }
];

const PETS = [
    { id: 'cat', name: 'Cyber Cat', emoji: '🐱', buyPrice: 5000, baseIncome: 100, maxHappiness: 100 },
    { id: 'dog', name: 'Mecha Dog', emoji: '🐶', buyPrice: 7500, baseIncome: 150, maxHappiness: 100 },
    { id: 'fox', name: 'Shadow Fox', emoji: '🦊', buyPrice: 15000, baseIncome: 350, maxHappiness: 100 },
    { id: 'dragon', name: 'Void Dragon', emoji: '🐲', buyPrice: 50000, baseIncome: 1200, maxHappiness: 100 },
    { id: 'phoenix', name: 'Solar Phoenix', emoji: '🔥🦅', buyPrice: 100000, baseIncome: 2500, maxHappiness: 100 }
];

const CRIMES = [
    { id: 'atm', name: 'Hack ATM', minReward: 300, maxReward: 1200, successRate: 0.75, fine: 400 },
    { id: 'bank', name: 'Rob Regional Bank', minReward: 1500, maxReward: 6000, successRate: 0.45, fine: 2000 },
    { id: 'pocket', name: 'Pickpocket Local', minReward: 100, maxReward: 400, successRate: 0.85, fine: 150 },
    { id: 'scam', name: 'Crypto Scam', minReward: 800, maxReward: 3500, successRate: 0.6, fine: 1200 },
    { id: 'smuggle', name: 'Smuggle Rare Artifacts', minReward: 2500, maxReward: 10000, successRate: 0.35, fine: 5000 }
];

const TITLES = [
    { id: 'novice', name: 'Novice Trader', reqNetWorth: 0 },
    { id: 'hustler', name: 'Street Hustler', reqNetWorth: 10000 },
    { id: 'millionaire', name: 'Cyber Millionaire', reqNetWorth: 1000000 },
    { id: 'legend', name: 'Economy Legend', reqNetWorth: 10000000 },
    { id: 'tycoon', name: 'Global Tycoon', reqNetWorth: 50000000 }
];

const BADGES = [
    { id: 'early', name: 'Early Founder', emoji: '👑' },
    { id: 'rich', name: 'Top 1% Rich', emoji: '💎' },
    { id: 'gambler', name: 'High Roller', emoji: '🎰' },
    { id: 'master_crafter', name: 'Master Crafter', emoji: '🔨' }
];

const ACHIEVEMENTS = [
    { id: 'first_coin', name: 'First Dollar', description: 'Earn your first dollar in the economy.', rewardCoins: 100 },
    { id: 'workaholic', name: 'Workaholic', description: 'Complete 25 work shifts.', rewardCoins: 1000 },
    { id: 'high_roller', name: 'High Roller', description: 'Win over $50,000 in gambling.', rewardCoins: 5000 },
    { id: 'bank_vault', name: 'Vault Keeper', description: 'Deposit over $100,000 in your bank.', rewardCoins: 2500 },
    { id: 'prestige_master', name: 'Reborn', description: 'Prestige for the first time.', rewardCoins: 25000, rewardTitle: 'Legend' }
];

module.exports = {
    ITEMS,
    JOBS,
    PETS,
    CRIMES,
    TITLES,
    BADGES,
    ACHIEVEMENTS
};
