const { DataTypes } = require('sequelize');
const { sequelize } = require('../connection');

const SecuritySettings = sequelize.define('SecuritySettings', {
    guild_id: {
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false
    },
    anti_bot_enabled: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    anti_bot_punishment: {
        type: DataTypes.ENUM('none', 'kick', 'ban'),
        defaultValue: 'kick'
    },
    anti_webhook_enabled: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    anti_webhook_punishment: {
        type: DataTypes.ENUM('none', 'kick', 'ban', 'timeout'),
        defaultValue: 'kick'
    },
    role_protection_enabled: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    role_protection_punishment: {
        type: DataTypes.ENUM('none', 'kick', 'ban', 'timeout'),
        defaultValue: 'kick'
    },
    channel_protection_enabled: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    channel_protection_punishment: {
        type: DataTypes.ENUM('none', 'kick', 'ban', 'timeout'),
        defaultValue: 'kick'
    },
    log_channel_id: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    tableName: 'security_settings_seq',
    timestamps: true
});

module.exports = SecuritySettings;
