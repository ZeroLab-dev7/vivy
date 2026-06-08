const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const db = new sqlite3.Database(path.join(__dirname, 'antiWebhook.sqlite'), (err) => {
  if (err) {
    console.error('Error connecting to the database:', err);
  } else {
    console.log('Connected to the antiWebhook database.');
  }
});

// Initialize table
db.run(`
  CREATE TABLE IF NOT EXISTS anti_webhook_settings (
    guild_id TEXT PRIMARY KEY,
    is_enabled INTEGER
  )
`);

module.exports = {
  /**
   * Save the anti-webhook setting for a guild.
   * @param {string} guildId - The ID of the guild.
   * @param {number} isEnabled - 1 for enabled, 0 for disabled.
   * @returns {Promise<void>}
   */
  saveSettings(guildId, isEnabled) {
    return new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO anti_webhook_settings (guild_id, is_enabled)
         VALUES (?, ?)
         ON CONFLICT(guild_id) 
         DO UPDATE SET is_enabled = excluded.is_enabled`,
        [guildId, isEnabled],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });
  },

  /**
   * Get the anti-webhook setting for a guild.
   * @param {string} guildId - The ID of the guild.
   * @returns {Promise<number|null>} - 1 for enabled, 0 for disabled, null if not set.
   */
  getSettings(guildId) {
    return new Promise((resolve, reject) => {
      db.get(
        `SELECT is_enabled FROM anti_webhook_settings WHERE guild_id = ?`,
        [guildId],
        (err, row) => {
          if (err) reject(err);
          else resolve(row ? row.is_enabled : null);
        }
      );
    });
  },
};
