const { DataTypes } = require('sequelize');
const { sequelize } = require('../connection');

const JailSetup = sequelize.define('JailSetup', {
    guild_id: {
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false
    },
    jailed_role_id: {
        type: DataTypes.STRING,
        allowNull: true
    },
    jailer_role_id: {
        type: DataTypes.STRING,
        allowNull: true
    },
    logs_channel_id: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    tableName: 'jail_setup',
    timestamps: true
});

module.exports = JailSetup;
