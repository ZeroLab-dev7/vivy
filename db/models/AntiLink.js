const { DataTypes } = require('sequelize');
const { sequelize } = require('../connection');

const AntiLink = sequelize.define('AntiLink', {
    guild_id: {
        type: DataTypes.STRING,
        allowNull: false
    },
    is_enabled: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    whitelist_channels: {
        type: DataTypes.TEXT, // JSON array of channel IDs
        defaultValue: '[]'
    },
    whitelist_roles: {
        type: DataTypes.TEXT, // JSON array of role IDs
        defaultValue: '[]'
    },
    action: {
        type: DataTypes.ENUM('delete', 'kick', 'ban', 'mute'),
        defaultValue: 'delete'
    }
}, {
    indexes: [
        {
            unique: true,
            fields: ['guild_id']
        }
    ]
});

module.exports = AntiLink;
