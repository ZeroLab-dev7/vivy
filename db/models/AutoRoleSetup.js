const { DataTypes } = require('sequelize');
const { sequelize } = require('../connection');

const AutoRoleSetup = sequelize.define('AutoRoleSetup', {
    guild_id: {
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false
    },
    auto_role_id: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    tableName: 'autorole_setup',
    timestamps: true
});

module.exports = AutoRoleSetup;
