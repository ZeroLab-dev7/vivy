const { DataTypes } = require('sequelize');
const { sequelize } = require('../connection');

const Transaction = sequelize.define('Transaction', {
    user_id: {
        type: DataTypes.STRING,
        allowNull: false
    },
    guild_id: {
        type: DataTypes.STRING,
        allowNull: false
    },
    amount: {
        type: DataTypes.BIGINT,
        allowNull: false
    },
    currency: {
        type: DataTypes.STRING,
        defaultValue: 'cash'
    },
    type: {
        type: DataTypes.STRING, // 'add', 'remove', 'transfer', 'buy', 'sell', 'gamble', 'crime', 'work'
        allowNull: false
    },
    source: {
        type: DataTypes.STRING,
        allowNull: true
    },
    reason: {
        type: DataTypes.STRING,
        allowNull: true
    }
});

module.exports = Transaction;
