const { DataTypes } = require('sequelize');
const { sequelize } = require('../connection');

const PremiumPlan = sequelize.define('PremiumPlan', {
    // Unique ID for the plan? Or just use role_id as key since 1 role/plan
    role_id: { type: DataTypes.STRING, primaryKey: true },
    guild_id: { type: DataTypes.STRING },
    owner_id: { type: DataTypes.STRING },
    channel_id: { type: DataTypes.STRING },
    managers: { type: DataTypes.TEXT, defaultValue: "" }
});

module.exports = PremiumPlan;
