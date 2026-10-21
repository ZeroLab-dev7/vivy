const { DataTypes } = require('sequelize');
const { sequelize } = require('../connection');

const UserPet = sequelize.define('UserPet', {
    user_id: {
        type: DataTypes.STRING,
        allowNull: false
    },
    guild_id: {
        type: DataTypes.STRING,
        allowNull: false
    },
    pet_id: {
        type: DataTypes.STRING,
        allowNull: false
    },
    pet_name: {
        type: DataTypes.STRING,
        allowNull: true
    },
    level: {
        type: DataTypes.INTEGER,
        defaultValue: 1
    },
    xp: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    happiness: {
        type: DataTypes.INTEGER,
        defaultValue: 100
    },
    hunger: {
        type: DataTypes.INTEGER,
        defaultValue: 100
    },
    energy: {
        type: DataTypes.INTEGER,
        defaultValue: 100
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
});

module.exports = UserPet;
