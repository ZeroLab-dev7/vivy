const { DataTypes } = require('sequelize');
const { sequelize } = require('../connection');

const Economy = sequelize.define('Economy', {
    user_id: {
        type: DataTypes.STRING,
        allowNull: false
    },
    guild_id: {
        type: DataTypes.STRING,
        allowNull: false
    },
    balance: {
        type: DataTypes.BIGINT,
        defaultValue: 1000
    },
    bank: {
        type: DataTypes.BIGINT,
        defaultValue: 0
    },
    bank_capacity: {
        type: DataTypes.BIGINT,
        defaultValue: 50000
    },
    net_worth: {
        type: DataTypes.BIGINT,
        defaultValue: 1000
    },
    gems: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    tokens: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    xp: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    level: {
        type: DataTypes.INTEGER,
        defaultValue: 1
    },
    prestige: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    job_id: {
        type: DataTypes.STRING,
        allowNull: true
    },
    job_xp: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    daily_streak: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    weekly_streak: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    monthly_streak: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    active_title: {
        type: DataTypes.STRING,
        allowNull: true
    },
    active_badge: {
        type: DataTypes.STRING,
        allowNull: true
    },
    last_daily: {
        type: DataTypes.DATE,
        allowNull: true
    },
    last_weekly: {
        type: DataTypes.DATE,
        allowNull: true
    },
    last_monthly: {
        type: DataTypes.DATE,
        allowNull: true
    },
    last_work: {
        type: DataTypes.DATE,
        allowNull: true
    },
    last_beg: {
        type: DataTypes.DATE,
        allowNull: true
    },
    last_crime: {
        type: DataTypes.DATE,
        allowNull: true
    },
    last_slut: {
        type: DataTypes.DATE,
        allowNull: true
    },
    last_search: {
        type: DataTypes.DATE,
        allowNull: true
    },
    last_dig: {
        type: DataTypes.DATE,
        allowNull: true
    },
    last_fish: {
        type: DataTypes.DATE,
        allowNull: true
    },
    last_hunt: {
        type: DataTypes.DATE,
        allowNull: true
    },
    last_mine: {
        type: DataTypes.DATE,
        allowNull: true
    },
    last_rob: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    indexes: [
        {
            unique: true,
            fields: ['user_id', 'guild_id']
        }
    ]
});

module.exports = Economy;
