const sqlite3 = require("sqlite3").verbose();
const dbPath = "./db/room-setup.db";

class RoomSetupDB {
  constructor() {
    this.db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error("Error connecting to database:", err.message);
      } else {
        console.log("Connected to RoomSetupDB.");
        this.init();
      }
    });
  }

  init() {
    this.db.serialize(() => {
      const query = `
            CREATE TABLE IF NOT EXISTS room_settings (
                guild_id TEXT PRIMARY KEY,
                log_channel TEXT NOT NULL,
                room_category TEXT NOT NULL,
                join_channel TEXT NOT NULL,
                staff_role TEXT,
                manager_role TEXT
            )
        `;
      this.db.run(query, (err) => {
        if (err) {
          console.error("Error initializing database:", err.message);
        } else {
          // Add manager_role column if it doesn't exist
          this.db.run("ALTER TABLE room_settings ADD COLUMN manager_role TEXT", (err) => {
            if (err && !err.message.includes("duplicate column name")) {
              // Ignore error if column already exists
            }
          });
        }
      });
    });
  }

  setSettings(guildId, settings) {
    const query = `
         INSERT OR REPLACE INTO room_settings (
             guild_id, 
             log_channel, 
             room_category, 
             join_channel,
             staff_role,
             manager_role
         ) VALUES (?, ?, ?, ?, ?, ?)
     `;
    const params = [
      guildId,
      settings.log_channel,
      settings.room_category,
      settings.join_channel,
      settings.staff_role,
      settings.manager_role,
    ];

    return new Promise((resolve, reject) => {
      this.db.run(query, params, (err) => {
        if (err) {
          console.error("Error saving settings:", err.message);
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  getSettings(guildId) {
    const query = `
         SELECT * FROM room_settings WHERE guild_id = ?
     `;

    return new Promise((resolve, reject) => {
      this.db.get(query, [guildId], (err, row) => {
        if (err) {
          console.error("Error fetching settings:", err.message);
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  deleteSettings(guildId) {
    const query = `
         DELETE FROM room_settings WHERE guild_id = ?
     `;

    return new Promise((resolve, reject) => {
      this.db.run(query, [guildId], (err) => {
        if (err) {
          console.error("Error deleting settings:", err.message);
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }
}

module.exports = new RoomSetupDB();
