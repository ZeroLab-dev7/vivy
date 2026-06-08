const sqlite3 = require('sqlite3').verbose();
const { connectDatabase, sequelize } = require('./connection');
const WarnSetup = require('./models/WarnSetup');
const path = require('path');

async function migrate() {
    console.log('🔄 Starting migration from warnings.db to Sequelize...');

    // 1. Connect to Sequelize
    await connectDatabase();

    // 2. Open Legacy DB
    const legacyDbPath = path.join(__dirname, '../warnings.db');
    const db = new sqlite3.Database(legacyDbPath, sqlite3.OPEN_READONLY, (err) => {
        if (err) {
            console.error('❌ Could not open warnings.db:', err.message);
            process.exit(1);
        }
    });

    // 3. Read and Migrate
    db.all("SELECT * FROM warn_setup", [], async (err, rows) => {
        if (err) {
            console.error('❌ Error reading legacy DB:', err);
            return;
        }

        console.log(`📦 Found ${rows ? rows.length : 0} rows to migrate.`);

        if (!rows || rows.length === 0) {
            console.log('✅ No data to migrate.');
            return;
        }

        let successCount = 0;
        let failCount = 0;

        for (const row of rows) {
            try {
                await WarnSetup.upsert({
                    guild_id: row.guild_id,
                    warn_first: row.warn_first,
                    warn_second: row.warn_second,
                    warn_last: row.warn_last,
                    warner_role: row.warner_role,
                    warning_logs: row.warning_logs
                });
                successCount++;
            } catch (error) {
                console.error(`❌ Failed to migrate guild ${row.guild_id}:`, error);
                failCount++;
            }
        }

        console.log(`✅ Migration Complete: ${successCount} succeeded, ${failCount} failed.`);
        console.log('🆗 You may now safely deprecate db/warn-db.js logic.');
        process.exit(0);
    });
}

migrate();
