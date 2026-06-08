const { DataTypes } = require('sequelize');
const { sequelize } = require('../connection');

const LifeBan = sequelize.define('LifeBan', {
    guild_id: {
        type: DataTypes.STRING,
        allowNull: false
    },
    user_id: {
        type: DataTypes.STRING,
        allowNull: false
    },
    reason: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    tableName: 'life_bans',
    timestamps: true,
    indexes: [
        {
            unique: true,
            fields: ['guild_id', 'user_id']
        }
    ]
});

module.exports = LifeBan;
