const { DataTypes } = require('sequelize');
const { sequelize } = require('../connection');

const AntiWebhook = sequelize.define('AntiWebhook', {
    guild_id: {
        type: DataTypes.STRING,
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
    indexes: [
        {
            unique: true,
            fields: ['guild_id']
        }
    ]
});

module.exports = AntiWebhook;
