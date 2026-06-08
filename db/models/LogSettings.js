const { DataTypes } = require('sequelize');
const { sequelize } = require('../connection');

const LogSettings = sequelize.define('LogSettings', {
    guild_id: {
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false
    },
    // Storing channels as a JSON object: { "welcome": "channel_id", "ban": "channel_id", ... }
    channels: {
        type: DataTypes.JSON,
        defaultValue: {}
    }
});

module.exports = LogSettings;
