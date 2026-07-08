const { DataTypes } = require('sequelize');
const { sequelize } = require('../connection');

const VerifiedUsers = sequelize.define('VerifiedUsers', {
    guild_id: {
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false
    },
    user_id: {
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false
    },
    verificator_id: {
        type: DataTypes.STRING,
        allowNull: true
    },
    gender: {
        type: DataTypes.STRING,
        allowNull: true // 'male' or 'female'
    },
    verified_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'verified_users',
    timestamps: true
});

module.exports = VerifiedUsers;
