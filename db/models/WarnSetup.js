const { DataTypes } = require('sequelize');
const { sequelize } = require('../connection');

const WarnSetup = sequelize.define('WarnSetup', {
    guild_id: {
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false
    },
    warn_first: {
        type: DataTypes.STRING,
        allowNull: true
    },
    warn_second: {
        type: DataTypes.STRING,
        allowNull: true
    },
    warn_last: {
        type: DataTypes.STRING,
        allowNull: true
    },
    warner_role: {
        type: DataTypes.STRING,
        allowNull: true
    },
    warning_logs: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    tableName: 'warn_setup',
    timestamps: true // Keeps track of when settings were updated
});

module.exports = WarnSetup;
