const { DataTypes } = require('sequelize');
const { sequelize } = require('../connection');

const Inventory = sequelize.define('Inventory', {
    user_id: {
        type: DataTypes.STRING,
        allowNull: false
    },
    guild_id: {
        type: DataTypes.STRING,
        allowNull: false
    },
    item_id: {
        type: DataTypes.STRING,
        allowNull: false
    },
    quantity: {
        type: DataTypes.INTEGER,
        defaultValue: 1
    },
    durability: {
        type: DataTypes.INTEGER,
        allowNull: true
    }
}, {
    indexes: [
        {
            unique: true,
            fields: ['user_id', 'guild_id', 'item_id']
        }
    ]
});

module.exports = Inventory;
