const CooldownConfig = require('./CooldownConfig');
const CooldownStorage = require('./CooldownStorage');
const CooldownLogger = require('./CooldownLogger');

/**
 * Record a command invocation and check if the user is spamming.
 * @param {string} userId - ID of the user executing the command
 * @param {object} client - Discord Client
 * @param {object} guild - Discord Guild (null if DM)
 * @param {object} command - The command being executed
 * @param {string} category - Command category
 * @returns {Promise<object>} Result of spam check: { punished: boolean, punishment: object|null }
 */
async function recordCommandAndCheckSpam(userId, client, guild, command, category) {
    const now = Date.now();
    
    // Fetch active punishment
    const punishment = CooldownStorage.punishments.get(userId);
    if (punishment && punishment.expires > now) {
        // If they already have a lock, ignore scoring updates to prevent locking extensions
        if (punishment.type === 'command_lock' || punishment.type === 'command_mute') {
            return { punished: true, punishment };
        }
    }

    // Get spam configuration parameters
    const spamInterval = await CooldownConfig.get('spam_interval');
    const spamThreshold = await CooldownConfig.get('spam_threshold');
    const spamDecayRate = await CooldownConfig.get('spam_decay_rate');

    const tracker = CooldownStorage.spamScores.get(userId) || { score: 0, lastCommandTime: 0 };
    
    // Decay score based on time elapsed
    const elapsedMs = now - tracker.lastCommandTime;
    const elapsedSec = elapsedMs / 1000;
    let score = Math.max(0, tracker.score - elapsedSec * spamDecayRate);

    // If commands are executed within the spam interval, increment the score
    if (tracker.lastCommandTime > 0 && elapsedMs < spamInterval) {
        score += 1.0;
    }

    tracker.score = score;
    tracker.lastCommandTime = now;
    CooldownStorage.spamScores.set(userId, tracker);

    // If threshold is exceeded, apply punishment
    if (score >= spamThreshold) {
        // Determine configured punishment type (lock or increase)
        const durationLock = await CooldownConfig.get('punishment_duration_lock');
        const durationIncrease = await CooldownConfig.get('punishment_duration_increase');
        const multiplier = await CooldownConfig.get('punishment_increase_multiplier');
        
        // Fetch or guess user object to populate tags
        let userObj = client.users.cache.get(userId);
        if (!userObj && guild && typeof guild.members?.fetch === 'function') {
            const member = await guild.members.fetch(userId).catch(() => null);
            userObj = member?.user;
        }

        const newPunishment = {
            type: 'command_lock', // Default punishment type
            expires: now + durationLock,
            score: score
        };

        // Custom punishment routing could look at user category or config
        CooldownStorage.punishments.set(userId, newPunishment);

        // Log the punishment event
        await CooldownLogger.logSpamEvent(client, {
            user: userObj || { id: userId, tag: `User ID: ${userId}` },
            guild,
            command: command.name || 'unknown',
            category,
            cooldown: 0,
            reason: `Anti-Spam Triggered (Spam Score: ${score.toFixed(1)}). Commands locked for ${(durationLock / 1000).toFixed(0)}s.`
        });

        return { punished: true, punishment: newPunishment };
    }

    return { punished: false };
}

module.exports = {
    recordCommandAndCheckSpam
};
