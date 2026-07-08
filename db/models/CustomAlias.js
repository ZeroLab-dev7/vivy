const { DataTypes } = require('sequelize');
const { sequelize } = require('../connection');

const CustomAlias = sequelize.define('CustomAlias', {
    guild_id: {
        type: DataTypes.STRING,
        allowNull: false
    },
    alias: {
        type: DataTypes.STRING,
        allowNull: false
    },
    command_name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    is_prefixless: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
}, {
    indexes: [
        {
            unique: true,
            fields: ['guild_id', 'alias']
        }
    ]
});

module.exports = CustomAlias;
