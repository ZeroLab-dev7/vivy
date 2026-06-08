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
        require('./models/index'); // Ensure GuildSettings and others are loaded

        // Sync all models - Removed { alter: true } to prevent SQLite migration errors
        await sequelize.sync();
        console.log("✅ Models synced: WarnSetup, JailSetup, AntiBotSetup, AutoRoleSetup, Economy, AntiLink, AntiWebhook, CustomAlias.");
    } catch (error) {
        console.error('❌ Unable to connect to the database:', error);
    }
};

module.exports = { sequelize, connectDatabase };
