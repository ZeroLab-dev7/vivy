const { DataTypes } = require('sequelize');
const { sequelize } = require('../connection');

const SecurityLog = sequelize.define('SecurityLog', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    guild_id: {
        type: DataTypes.STRING,
        allowNull: false
    },
    executor_id: {
        type: DataTypes.STRING,
        allowNull: true
    },
    executor_tag: {
        type: DataTypes.STRING,
        allowNull: true
    },
    target_id: {
        type: DataTypes.STRING,
        allowNull: true
    },
    target_name: {
        type: DataTypes.STRING,
        allowNull: true
    },
    module: {
        type: DataTypes.ENUM('anti-bot', 'anti-webhook', 'raid-protection', 'role-protection', 'channel-protection', 'backup'),
        allowNull: false
    },
    action: {
        type: DataTypes.STRING,
        allowNull: false
    },
    old_value: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    new_value: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    result: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    tableName: 'security_logs',
    timestamps: true
});

module.exports = SecurityLog;
