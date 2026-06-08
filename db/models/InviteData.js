const { DataTypes } = require('sequelize');
const { sequelize } = require('../connection');

const InviteData = sequelize.define('InviteData', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    guild_id: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    inviter_id: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    invited_id: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    code: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    is_fake: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    has_left: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    timestamp: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
});

module.exports = InviteData;
