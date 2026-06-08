const { DataTypes } = require('sequelize');
const { sequelize } = require('../connection');

const VerificationRoles = sequelize.define('VerificationRoles', {
    guild_id: {
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false
    },
    verificator_role: {
        type: DataTypes.STRING,
        allowNull: true
    },
    unverified_role: {
        type: DataTypes.STRING,
        allowNull: true
    },
    verified_role: {
        type: DataTypes.STRING,
        allowNull: true
    },
    verified_female_role: {
        type: DataTypes.STRING,
        allowNull: true
    },
    verification_logs: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    tableName: 'verification_roles',
    timestamps: true
});

module.exports = VerificationRoles;
