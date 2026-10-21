const { DataTypes } = require('sequelize');
const { sequelize } = require('../connection');

const VerificationBlacklist = sequelize.define('VerificationBlacklist', {
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
    reason: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: 'No reason provided'
    },
    verificator_id: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    tableName: 'verification_blacklist',
    timestamps: true
});

module.exports = VerificationBlacklist;
