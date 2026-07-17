const { Sequelize } = require('sequelize');
const path = require('path');
const config = require('../config');

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: config.databasePath,
    logging: false, // Set to console.log to see SQL queries
    define: {
        timestamps: true,
        underscored: true
    }
});

const connectDatabase = async () => {
    try {
        await sequelize.authenticate();
        await sequelize.query('PRAGMA journal_mode=WAL;');
        console.log('✅ Database connected successfully.');
        // Require models to ensure they are defined before sync
        require('./models/WarnSetup');
        require('./models/JailSetup');
        require('./models/AntiBotSetup');
        require('./models/AutoRoleSetup');
        require('./models/Economy');
        require('./models/AntiLink');
        require('./models/AntiWebhook');
        require('./models/CustomAlias');
        require('./models/VerificationRoles');
        require('./models/VerifiedUsers');
        require('./models/VerificationBlacklist');
        require('./models/SupportTicket');
        require('./models/LifeBan');
        require('./models/DashboardModels');
        require('./models/TrustedEntity');
        require('./models/SecuritySettings');
        require('./models/RaidProtectionSettings');
        require('./models/SecurityLog');
        require('./models/index'); // Ensure GuildSettings and others are loaded

        // Sync all models - Removed { alter: true } to prevent SQLite migration errors
        await sequelize.sync();

        // Safe migrations to add missing columns in SQLite
        await sequelize.query(`ALTER TABLE broadcast_logs ADD COLUMN failed_guild_ids TEXT;`).catch(() => { });
        await sequelize.query(`ALTER TABLE broadcast_logs ADD COLUMN duration_ms INTEGER DEFAULT 0;`).catch(() => { });

        // Economy migrations
        await sequelize.query(`ALTER TABLE economies ADD COLUMN last_weekly DATETIME;`).catch(() => { });
        await sequelize.query(`ALTER TABLE economies ADD COLUMN last_work DATETIME;`).catch(() => { });
        await sequelize.query(`ALTER TABLE economies ADD COLUMN last_rob DATETIME;`).catch(() => { });

        // Level Config migrations
        await sequelize.query(`ALTER TABLE level_config ADD COLUMN is_enabled BOOLEAN DEFAULT 0;`).catch(() => { });
        await sequelize.query(`ALTER TABLE level_config ADD COLUMN xp_cooldown_sec INTEGER DEFAULT 60;`).catch(() => { });
        await sequelize.query(`ALTER TABLE level_config ADD COLUMN xp_range_min INTEGER DEFAULT 15;`).catch(() => { });
        await sequelize.query(`ALTER TABLE level_config ADD COLUMN xp_range_max INTEGER DEFAULT 25;`).catch(() => { });
        await sequelize.query(`ALTER TABLE level_config ADD COLUMN reward_roles TEXT DEFAULT '[]';`).catch(() => { });
        await sequelize.query(`ALTER TABLE level_config ADD COLUMN rank_card_background VARCHAR(255);`).catch(() => { });
        await sequelize.query(`ALTER TABLE level_config ADD COLUMN rank_card_font VARCHAR(255) DEFAULT 'Outfit';`).catch(() => { });
        await sequelize.query(`ALTER TABLE level_config ADD COLUMN xp_formula_base INTEGER DEFAULT 100;`).catch(() => { });
        await sequelize.query(`ALTER TABLE level_config ADD COLUMN xp_formula_exponent FLOAT DEFAULT 1.8;`).catch(() => { });
        await sequelize.query(`ALTER TABLE level_config ADD COLUMN xp_formula_offset INTEGER DEFAULT 100;`).catch(() => { });
        await sequelize.query(`ALTER TABLE level_config ADD COLUMN voice_xp_interval_min INTEGER DEFAULT 5;`).catch(() => { });
        await sequelize.query(`ALTER TABLE level_config ADD COLUMN voice_xp_amount INTEGER DEFAULT 10;`).catch(() => { });
        await sequelize.query(`ALTER TABLE level_config ADD COLUMN daily_xp_limit INTEGER DEFAULT 0;`).catch(() => { });
        await sequelize.query(`ALTER TABLE level_config ADD COLUMN weekly_xp_limit INTEGER DEFAULT 0;`).catch(() => { });
        await sequelize.query(`ALTER TABLE level_config ADD COLUMN announce_enabled BOOLEAN DEFAULT 1;`).catch(() => { });
        await sequelize.query(`ALTER TABLE level_config ADD COLUMN announce_channel VARCHAR(255);`).catch(() => { });
        await sequelize.query(`ALTER TABLE level_config ADD COLUMN announce_message TEXT DEFAULT '<a:pink8:1337678972108148757> Congratulations {user}! You reached Level {level}!';`).catch(() => { });
        await sequelize.query(`ALTER TABLE level_config ADD COLUMN announce_embed BOOLEAN DEFAULT 1;`).catch(() => { });
        await sequelize.query(`ALTER TABLE level_config ADD COLUMN announce_color VARCHAR(255) DEFAULT '#5865F2';`).catch(() => { });
        await sequelize.query(`ALTER TABLE level_config ADD COLUMN announce_image_url VARCHAR(255);`).catch(() => { });
        await sequelize.query(`ALTER TABLE level_config ADD COLUMN stack_rewards BOOLEAN DEFAULT 1;`).catch(() => { });
        await sequelize.query(`ALTER TABLE level_config ADD COLUMN remove_rewards_on_demote BOOLEAN DEFAULT 1;`).catch(() => { });

        // User XP migrations
        await sequelize.query(`ALTER TABLE user_xp ADD COLUMN xp INTEGER DEFAULT 0;`).catch(() => { });
        await sequelize.query(`ALTER TABLE user_xp ADD COLUMN level INTEGER DEFAULT 0;`).catch(() => { });
        await sequelize.query(`ALTER TABLE user_xp ADD COLUMN text_xp INTEGER DEFAULT 0;`).catch(() => { });
        await sequelize.query(`ALTER TABLE user_xp ADD COLUMN text_level INTEGER DEFAULT 0;`).catch(() => { });
        await sequelize.query(`ALTER TABLE user_xp ADD COLUMN voice_xp INTEGER DEFAULT 0;`).catch(() => { });
        await sequelize.query(`ALTER TABLE user_xp ADD COLUMN voice_level INTEGER DEFAULT 0;`).catch(() => { });
        await sequelize.query(`ALTER TABLE user_xp ADD COLUMN last_xp_time DATETIME;`).catch(() => { });
        await sequelize.query(`ALTER TABLE user_xp ADD COLUMN messages_count INTEGER DEFAULT 0;`).catch(() => { });
        await sequelize.query(`ALTER TABLE user_xp ADD COLUMN voice_time_min INTEGER DEFAULT 0;`).catch(() => { });
        await sequelize.query(`ALTER TABLE user_xp ADD COLUMN xp_today INTEGER DEFAULT 0;`).catch(() => { });
        await sequelize.query(`ALTER TABLE user_xp ADD COLUMN xp_week INTEGER DEFAULT 0;`).catch(() => { });
        await sequelize.query(`ALTER TABLE user_xp ADD COLUMN xp_month INTEGER DEFAULT 0;`).catch(() => { });
        await sequelize.query(`ALTER TABLE user_xp ADD COLUMN last_reset_day DATETIME;`).catch(() => { });
        await sequelize.query(`ALTER TABLE user_xp ADD COLUMN last_reset_week DATETIME;`).catch(() => { });
        await sequelize.query(`ALTER TABLE user_xp ADD COLUMN last_reset_month DATETIME;`).catch(() => { });

        // Enable leveling system for all existing guilds
        await sequelize.query(`UPDATE level_config SET is_enabled = 1;`).catch(() => { });

        // SQLite indexes creation
        await sequelize.query(`CREATE INDEX IF NOT EXISTS idx_level_rewards_guild ON level_rewards (guild_id);`).catch(() => { });
        await sequelize.query(`CREATE INDEX IF NOT EXISTS idx_xp_boosts_guild ON xp_boosts (guild_id);`).catch(() => { });
        await sequelize.query(`CREATE INDEX IF NOT EXISTS idx_voice_sessions_guild_user ON voice_sessions (guild_id, user_id);`).catch(() => { });
        await sequelize.query(`CREATE INDEX IF NOT EXISTS idx_level_histories_guild_time ON level_histories (guild_id, timestamp);`).catch(() => { });
        await sequelize.query(`CREATE INDEX IF NOT EXISTS idx_level_leaderboard_caches_guild ON level_leaderboard_caches (guild_id);`).catch(() => { });

        // Verification config migrations
        await sequelize.query(`ALTER TABLE verification_config ADD COLUMN mode VARCHAR(50) DEFAULT 'staff';`).catch(() => { });
        await sequelize.query(`ALTER TABLE verification_config ADD COLUMN sec_unverified_role VARCHAR(255);`).catch(() => { });
        await sequelize.query(`ALTER TABLE verification_config ADD COLUMN sec_verified_role VARCHAR(255);`).catch(() => { });
        await sequelize.query(`ALTER TABLE verification_config ADD COLUMN sec_failure_role VARCHAR(255);`).catch(() => { });
        await sequelize.query(`ALTER TABLE verification_config ADD COLUMN sec_min_account_age INTEGER DEFAULT 0;`).catch(() => { });
        await sequelize.query(`ALTER TABLE verification_config ADD COLUMN sec_min_join_time INTEGER DEFAULT 0;`).catch(() => { });
        await sequelize.query(`ALTER TABLE verification_config ADD COLUMN sec_require_avatar BOOLEAN DEFAULT 0;`).catch(() => { });
        await sequelize.query(`ALTER TABLE verification_config ADD COLUMN sec_require_verified_account BOOLEAN DEFAULT 0;`).catch(() => { });
        await sequelize.query(`ALTER TABLE verification_config ADD COLUMN sec_anti_alt VARCHAR(50) DEFAULT 'disabled';`).catch(() => { });
        await sequelize.query(`ALTER TABLE verification_config ADD COLUMN sec_captcha VARCHAR(50) DEFAULT 'disabled';`).catch(() => { });
        await sequelize.query(`ALTER TABLE verification_config ADD COLUMN sec_cooldown INTEGER DEFAULT 10;`).catch(() => { });
        await sequelize.query(`ALTER TABLE verification_config ADD COLUMN sec_auto_kick_limit INTEGER DEFAULT 0;`).catch(() => { });
        await sequelize.query(`ALTER TABLE verification_config ADD COLUMN sec_auto_ban BOOLEAN DEFAULT 0;`).catch(() => { });
        await sequelize.query(`ALTER TABLE verification_config ADD COLUMN msg_embed_title VARCHAR(255) DEFAULT 'Verification Required';`).catch(() => { });
        await sequelize.query(`ALTER TABLE verification_config ADD COLUMN msg_embed_desc TEXT DEFAULT 'Click the button below to verify and access the server.';`).catch(() => { });
        await sequelize.query(`ALTER TABLE verification_config ADD COLUMN msg_embed_color VARCHAR(50) DEFAULT '#0099ff';`).catch(() => { });
        await sequelize.query(`ALTER TABLE verification_config ADD COLUMN msg_embed_thumbnail VARCHAR(255);`).catch(() => { });
        await sequelize.query(`ALTER TABLE verification_config ADD COLUMN msg_embed_footer VARCHAR(255);`).catch(() => { });
        await sequelize.query(`ALTER TABLE verification_config ADD COLUMN msg_btn_text VARCHAR(100) DEFAULT 'Verify Me';`).catch(() => { });
        await sequelize.query(`ALTER TABLE verification_config ADD COLUMN msg_btn_emoji VARCHAR(50) DEFAULT '🛡️';`).catch(() => { });
        await sequelize.query(`ALTER TABLE verification_config ADD COLUMN msg_btn_style VARCHAR(50) DEFAULT 'primary';`).catch(() => { });

        // Index for verification logs
        await sequelize.query(`CREATE INDEX IF NOT EXISTS idx_ver_logs_guild ON verification_logs_history (guild_id);`).catch(() => { });

        console.log("✅ Models synced: WarnSetup, JailSetup, AntiBotSetup, AutoRoleSetup, Economy, AntiLink, AntiWebhook, CustomAlias, DashboardModels, and columns migrated.");
    } catch (error) {
        console.error('<:no:1526496561188831244>Unable to connect to the database:', error);
    }
};

module.exports = { sequelize, connectDatabase };
