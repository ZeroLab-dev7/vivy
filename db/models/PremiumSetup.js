const { DataTypes } = require('sequelize');
const { sequelize } = require('../connection');

const PremiumSetup = sequelize.define('PremiumSetup', {
    guild_id: { type: DataTypes.STRING, primaryKey: true },
    category_id: { type: DataTypes.STRING },
    manager_role_id: { type: DataTypes.STRING }
});

module.exports = PremiumSetup;
