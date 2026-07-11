const { DataTypes } = require('sequelize');
const { sequelize } = require('../connection');

const RaidProtectionSettings = sequelize.define('RaidProtectionSettings', {
    guild_id: {
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false
    },
    is_enabled: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    join_limit: {
        type: DataTypes.INTEGER,
        defaultValue: 10
    },
    join_time_window_sec: {
        type: DataTypes.INTEGER,
        defaultValue: 10
    },
    mention_limit: {
        type: DataTypes.INTEGER,
        defaultValue: 10
    },
    invite_spam_limit: {
        type: DataTypes.INTEGER,
        defaultValue: 5
    },
    punishment: {
        type: DataTypes.ENUM('none', 'kick', 'ban', 'timeout'),
        defaultValue: 'timeout'
    },
    lock_server: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    log_channel_id: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    tableName: 'raid_protection_settings',
    timestamps: true
});

module.exports = RaidProtectionSettings;
