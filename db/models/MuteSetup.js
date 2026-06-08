const { DataTypes } = require('sequelize');
const { sequelize } = require('../connection');

const MuteSetup = sequelize.define('MuteSetup', {
    guild_id: {
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false
    },
    mute_role_id: {
        type: DataTypes.STRING,
        allowNull: true
    },
    staff_roles: {
        type: DataTypes.TEXT, // Comma-separated list or JSON
        allowNull: true
    },
    mute_logs_channel: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    tableName: 'mute_setup',
    timestamps: true
});

module.exports = MuteSetup;
