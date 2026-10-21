const { DataTypes } = require('sequelize');
const { sequelize } = require('../connection');

const Cooldown = sequelize.define('Cooldown', {
    user_id: {
        type: DataTypes.STRING,
        allowNull: false
    },
    guild_id: {
        type: DataTypes.STRING,
        allowNull: false
    },
    command: {
        type: DataTypes.STRING,
        allowNull: false
    },
    expires_at: {
        type: DataTypes.DATE,
        allowNull: false
    }
}, {
    indexes: [
        {
            unique: true,
            fields: ['user_id', 'guild_id', 'command']
        }
    ]
});

module.exports = Cooldown;
