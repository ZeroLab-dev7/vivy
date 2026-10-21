const { DataTypes } = require('sequelize');
const { sequelize } = require('../connection');

const Marketplace = sequelize.define('Marketplace', {
    seller_id: {
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
    price: {
        type: DataTypes.BIGINT,
        allowNull: false
    },
    status: {
        type: DataTypes.STRING,
        defaultValue: 'active' // 'active', 'sold', 'cancelled'
    }
});

module.exports = Marketplace;
