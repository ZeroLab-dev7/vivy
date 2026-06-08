const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const db = new sqlite3.Database(path.join(__dirname, 'antiToken.sqlite'), (err) => {
  if (err) {
    console.error('Error connecting to the database:', err);
  } else {
    console.log('Connected to the antiToken database.');
  }
});

// Initialize tables
db.run(`
  CREATE TABLE IF NOT EXISTS anti_token_settings (
    guild_id TEXT PRIMARY KEY,
    is_enabled INTEGER
  )
`);

db.run(`
  CREATE TABLE IF NOT EXISTS token_timeouts (
    user_id TEXT PRIMARY KEY,
    guild_id TEXT,
    timeout_until INTEGER
  )
`);

module.exports = {
  // Save anti-token settings
  saveSettings(guildId, isEnabled) {
    return new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO anti_token_settings (guild_id, is_enabled)
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

  // Get anti-token settings
  getSettings(guildId) {
    return new Promise((resolve, reject) => {
      db.get(
        `SELECT is_enabled FROM anti_token_settings WHERE guild_id = ?`,
        [guildId],
        (err, row) => {
          if (err) reject(err);
          else resolve(row ? row.is_enabled : null);
        }
      );
    });
  },

  // Add a timeout for a user
  addTimeout(userId, guildId, timeoutUntil) {
    return new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO token_timeouts (user_id, guild_id, timeout_until)
         VALUES (?, ?, ?)
         ON CONFLICT(user_id)
         DO UPDATE SET timeout_until = excluded.timeout_until`,
        [userId, guildId, timeoutUntil],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });
  },

  // Check if a user is under timeout
  checkTimeout(userId) {
    return new Promise((resolve, reject) => {
      db.get(
        `SELECT timeout_until FROM token_timeouts WHERE user_id = ?`,
        [userId],
        (err, row) => {
          if (err) reject(err);
          else resolve(row && Date.now() < row.timeout_until);
        }
      );
    });
  }
};
