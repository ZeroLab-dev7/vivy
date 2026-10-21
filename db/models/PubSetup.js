const { DataTypes } = require('sequelize');
const { sequelize } = require('../connection');

const PubSetup = sequelize.define('PubSetup', {
    guild_id: {
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false
    },
    is_enabled: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
});

module.exports = PubSetup;
