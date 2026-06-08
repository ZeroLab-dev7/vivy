const { DataTypes } = require('sequelize');
const { sequelize } = require('../connection');

const AntiBotSetup = sequelize.define('AntiBotSetup', {
    guild_id: {
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false
    },
    is_enabled: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    log_channel_id: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    tableName: 'antibot_setup',
    timestamps: true
});

module.exports = AntiBotSetup;
