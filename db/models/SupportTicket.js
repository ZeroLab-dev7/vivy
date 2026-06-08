const { DataTypes } = require('sequelize');
const { sequelize } = require('../connection');

const SupportTicket = sequelize.define('SupportTicket', {
    guild_id: {
        type: DataTypes.STRING,
        allowNull: false
    },
    user_id: {
        type: DataTypes.STRING,
        allowNull: false
    },
    channel_id: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
});

module.exports = SupportTicket;
