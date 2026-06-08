const { DataTypes } = require('sequelize');
const { sequelize } = require('../connection');

const JailedUser = sequelize.define('JailedUser', {
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
        type: DataTypes.TEXT,
        allowNull: true
    },
    jailer_id: {
        type: DataTypes.STRING,
        allowNull: true
    },
    timestamp: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    roles: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    tableName: 'jailed_users',
    timestamps: true
});

module.exports = JailedUser;
