const sqlite3 = require('sqlite3').verbose();
const { sequelize, connectDatabase } = require('./connection');
const { VerifiedUser, Warning, GuildSettings } = require('./models');
const path = require('path');
const fs = require('fs');

async function migrateVerifiedUser() {
    const dbPath = path.join(__dirname, 'verified.sqlite');
    if (!fs.existsSync(dbPath)) return console.log('⚠️ verified.sqlite not found, skipping.');

    const oldDB = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY);

    return new Promise((resolve, reject) => {
        oldDB.all("SELECT * FROM verified_users", [], async (err, rows) => { // Assuming table name based on file
            // Logic adjusted based on actual table name inspection if needed
            // Fallback to likely name or query sqlite_master if unknown
            if (err) {
                // Try looking up table name
                oldDB.all("SELECT name FROM sqlite_master WHERE type='table'", [], async (err, tables) => {
                    if (tables && tables.length > 0) {
                        const tableName = tables[0].name;
                        oldDB.all(`SELECT * FROM ${tableName}`, [], async (err, rows) => {
                            if (!rows) return resolve();
                            console.log(`Migrating ${rows.length} verified users...`);
                            for (const row of rows) {
                                try {
                                    await VerifiedUser.upsert({
                                        guild_id: row.guild_id,
                                        user_id: row.user_id,
                                        username: row.username,
                                        verified_at: row.verified_at,
                                        verificator_id: row.verificator_id,
                                        gender: row.gender
                                    });
                                } catch (e) { console.error('Error migrating user:', e); }
                            }
                            resolve();
                        });
                    } else {
                        resolve();
                    }
                });
            } else {
                resolve();
            }
        });
    });
}

// Add similar functions for other DBs (warns.db, etc.) if schema is known.
// For now, focusing on verified.sqlite as confirmed.

const migrate = async () => {
    await connectDatabase();
    console.log('Starting migration...');

    await migrateVerifiedUser();

    console.log('Migration complete.');
};

migrate().catch(console.error);
