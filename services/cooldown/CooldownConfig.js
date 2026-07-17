const { SystemConfig } = require('../../db/models');

const DEFAULTS = {
    cooldown_default_normal: 5000,
    cooldown_default_premium: 1000,
    
    // Category Cooldowns
    cooldown_category_moderation: 2000,
    cooldown_category_economy: 5000,
    cooldown_category_fun: 1000,
    cooldown_category_ai: 8000,
    cooldown_category_voice: 2000,
    cooldown_category_security: 3000,
    cooldown_category_default: 3000,

    // Anti Spam Configuration
    spam_interval: 1000,
    spam_threshold: 5.0,
    spam_decay_rate: 1.0,

    // Punishment Config
    punishment_duration_lock: 30000,      // 30 seconds lock
    punishment_duration_increase: 60000,  // 60 seconds of elevated cooldown
    punishment_increase_multiplier: 3,    // 3x cooldown
    
    // Memory Cleanups
    cleanup_interval: 60000               // 60 seconds storage purge
};

let cache = {};
let lastFetch = 0;
const CACHE_TTL = 30000; // 30 seconds

async function loadConfig() {
    const now = Date.now();
    if (now - lastFetch < CACHE_TTL) {
        return cache;
    }

    try {
        const configs = await SystemConfig.findAll();
        const dbConfig = {};
        for (const row of configs) {
            dbConfig[row.key] = row.value;
        }

        const newCache = {};
        for (const [key, defaultValue] of Object.entries(DEFAULTS)) {
            const dbVal = dbConfig[key];
            if (dbVal !== undefined && dbVal !== null) {
                if (typeof defaultValue === 'number') {
                    const parsed = parseFloat(dbVal);
                    newCache[key] = isNaN(parsed) ? defaultValue : parsed;
                } else if (typeof defaultValue === 'boolean') {
                    newCache[key] = dbVal === 'true';
                } else {
                    newCache[key] = dbVal;
                }
            } else {
                newCache[key] = defaultValue;
            }
        }

        cache = newCache;
        lastFetch = now;
    } catch (err) {
        console.error('[CooldownConfig] Failed to fetch config from DB, using fallback cache:', err);
        // Fallback if DB query fails on startup
        if (Object.keys(cache).length === 0) {
            cache = { ...DEFAULTS };
        }
    }

    return cache;
}

/**
 * Get a configuration value dynamically.
 * @param {string} key 
 * @returns {Promise<any>}
 */
async function get(key) {
    const activeConfig = await loadConfig();
    return activeConfig[key] !== undefined ? activeConfig[key] : DEFAULTS[key];
}

module.exports = {
    get,
    DEFAULTS
};
