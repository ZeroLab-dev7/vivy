const { DataTypes } = require('sequelize');
const { sequelize } = require('../connection');

const UserAchievement = sequelize.define('UserAchievement', {
    user_id: {
        type: DataTypes.STRING,
        allowNull: false
    },
    guild_id: {
        type: DataTypes.STRING,
        allowNull: false
    },
    achievement_id: {
        type: DataTypes.STRING,
        allowNull: false
    },
    unlocked_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    indexes: [
        {
            unique: true,
            fields: ['user_id', 'guild_id', 'achievement_id']
        }
    ]
});

module.exports = UserAchievement;
