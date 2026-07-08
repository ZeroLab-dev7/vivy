const { GuildSettings } = require('./models');

/**
 * Get prefix for a guild.
 * @param {string} guildId - The ID of the guild.
 * @returns {Promise<string>} - The prefix for the guild or the default prefix.
 */
async function getPrefix(guildId) {
    try {
        const settings = await GuildSettings.findByPk(guildId);
        return settings ? settings.prefix : (process.env.PREFIX || '?');
    } catch (error) {
        console.error('Error fetching prefix from Sequelize:', error);
        return process.env.PREFIX || '?';
    }
}

/**
 * Set prefix for a guild.
 * @param {string} guildId - The ID of the guild.
 * @param {string} newPrefix - The new prefix to set.
 * @returns {Promise<void>}
 */
async function setPrefix(guildId, newPrefix) {
    try {
        await GuildSettings.upsert({ guild_id: guildId, prefix: newPrefix });
    } catch (error) {
        console.error('Error saving prefix to Sequelize:', error);
        throw error;
    }
}

module.exports = {
    getPrefix,
    setPrefix,
};
