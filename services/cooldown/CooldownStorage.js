const CooldownConfig = require('./CooldownConfig');

// Maps for fast O(1) lookups
const cooldowns = new Map();     // key: string (e.g. user:userId:commandName), value: number (expiration timestamp)
const spamScores = new Map();     // key: string (userId), value: { score: number, lastCommandTime: number }
const punishments = new Map();   // key: string (userId), value: { type: string, expires: number, details: any }

let cleanupTimer = null;

/**
 * Initialize background cleanup interval.
 */
function initCleanup() {
    if (cleanupTimer) return;
    
    // Dynamically retrieve cleanup interval
    const runSweep = async () => {
        const interval = await CooldownConfig.get('cleanup_interval');
        
        const now = Date.now();
        
        // Sweep cooldowns
        for (const [key, expires] of cooldowns.entries()) {
            if (expires <= now) {
                cooldowns.delete(key);
            }
        }
        
        // Sweep punishments
        for (const [userId, p] of punishments.entries()) {
            if (p.expires <= now) {
                punishments.delete(userId);
            }
        }
        
        // Sweep inactive spam trackers (idle for > 5 minutes)
        for (const [userId, tracker] of spamScores.entries()) {
            if (now - tracker.lastCommandTime > 300000) {
                spamScores.delete(userId);
            }
        }
        
        cleanupTimer = setTimeout(runSweep, interval);
    };

    // Run first sweep asynchronously and setup timer
    CooldownConfig.get('cleanup_interval').then(interval => {
        cleanupTimer = setTimeout(runSweep, interval);
    }).catch(err => {
        console.error('[CooldownStorage] Failed to resolve cleanup_interval config:', err);
        cleanupTimer = setTimeout(runSweep, 60000);
    });
}

// Automatically initialize the sweep
initCleanup();

module.exports = {
    cooldowns,
    spamScores,
    punishments,
    initCleanup
};
