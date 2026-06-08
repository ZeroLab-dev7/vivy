const sqlite3 = require("sqlite3").verbose();
const path = require("path");

// Define the path to the SQLite database
const dbPath = path.join(__dirname, "database.sqlite");

// Connect to the SQLite database
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error("❌ Error connecting to SQLite:", err.message);
    } else {
        console.log("✅ Connected to SQLite database.");
    }
});

// Create the antilink table if it doesn't exist
db.run(`
    CREATE TABLE IF NOT EXISTS antilink (
        guild_id TEXT PRIMARY KEY,
        enabled INTEGER DEFAULT NULL,
        log_channel TEXT
    )
`, (err) => {
    if (err) {
        console.error("❌ Error creating the antilink table:", err.message);
    } else {
        console.log("✅ antilink table created successfully.");
    }
});

// Create the whitelist roles table
db.run(`
    CREATE TABLE IF NOT EXISTS anti_link_whitelisted_roles (
        guild_id TEXT,
        role_id TEXT,
        PRIMARY KEY (guild_id, role_id)
    )
`, (err) => {
    if (err) {
        console.error("❌ Error creating whitelist roles table:", err.message);
    } else {
        console.log("✅ Whitelist roles table created successfully.");
    }
});

// Function to add a whitelisted role
function addWhitelistedRole(guildId, roleId) {
    return new Promise((resolve, reject) => {
        db.run(`INSERT OR IGNORE INTO anti_link_whitelisted_roles (guild_id, role_id) VALUES (?, ?)`,
            [guildId, roleId], (err) => {
                if (err) {
                    console.error("❌ Error inserting whitelisted role:", err.message);
                    reject(err);
                } else {
                    console.log(`✅ Role ${roleId} whitelisted for guild ${guildId}.`);
                    resolve();
                }
            });
    });
}

// Function to remove a whitelisted role
function removeWhitelistedRole(guildId, roleId) {
    return new Promise((resolve, reject) => {
        db.run(
            `DELETE FROM anti_link_whitelisted_roles WHERE guild_id = ? AND role_id = ?`,
            [guildId, roleId],
            (err) => {
                if (err) {
                    console.error("❌ Error removing whitelisted role:", err.message);
                    reject(err);
                } else {
                    console.log(`✅ Role ${roleId} removed from whitelist for guild ${guildId}.`);
                    resolve();
                }
            }
        );
    });
}

// Function to get whitelisted roles
function getWhitelistedRoles(guildId) {
    return new Promise((resolve, reject) => {
        db.all(`SELECT role_id FROM anti_link_whitelisted_roles WHERE guild_id = ?`, [guildId], (err, rows) => {
            if (err) {
                console.error("❌ Error fetching whitelisted roles:", err.message);
                reject(err);
            } else {
                resolve(rows.map(row => row.role_id));
            }
        });
    });
}

// Function to get Anti-Link settings (enabled, log_channel)
function getSettings(guildId) {
    return new Promise((resolve, reject) => {
        db.get("SELECT enabled, log_channel FROM antilink WHERE guild_id = ?", [guildId], (err, row) => {
            if (err) {
                console.error("❌ Error fetching settings:", err.message);
                reject(err);
            } else {
                console.log("🔍 Retrieved settings for", guildId, row);
                resolve(row || { enabled: 0, log_channel: null });
            }
        });
    });
}

// Function to save Anti-Link settings (enabled, log_channel)
function saveSettings(guildId, enabled, logChannel) {
    return new Promise((resolve, reject) => {
        db.run(`
            INSERT INTO antilink (guild_id, enabled, log_channel)
            VALUES (?, ?, ?)
            ON CONFLICT(guild_id) DO UPDATE SET enabled = ?, log_channel = ?
        `, [guildId, enabled, logChannel, enabled, logChannel], (err) => {
            if (err) {
                console.error("❌ Error saving Anti-Link settings:", err.message);
                reject(err);
            } else {
                console.log(`✅ Settings updated for guild ${guildId} (enabled: ${enabled})`);
                resolve();
            }
        });
    });
}

// Export functions to interact with the database
module.exports = {
    db,
    addWhitelistedRole,
    removeWhitelistedRole,
    getWhitelistedRoles,
    getSettings,
    saveSettings
};