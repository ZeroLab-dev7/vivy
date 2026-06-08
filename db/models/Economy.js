const { DataTypes } = require('sequelize');
const { sequelize } = require('../connection');

const Economy = sequelize.define('Economy', {
    user_id: {
        type: DataTypes.STRING,
        allowNull: false
    },
    guild_id: {
        type: DataTypes.STRING,
        allowNull: false
    },
    balance: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    bank: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    last_daily: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    indexes: [
        {
            unique: true,
            fields: ['user_id', 'guild_id']
        }
    ]
});

module.exports = Economy;
