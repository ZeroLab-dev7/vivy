const { DataTypes } = require('sequelize');
const { sequelize } = require('../connection');

const InviteBonus = sequelize.define('InviteBonus', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    guild_id: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    user_id: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    bonus: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false,
    },
});

module.exports = InviteBonus;
