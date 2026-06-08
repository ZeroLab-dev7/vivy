const { DataTypes } = require('sequelize');
const { sequelize } = require('../connection');

const ApplySetup = sequelize.define('ApplySetup', {
    guild_id: { type: DataTypes.STRING, primaryKey: true },
    apply_channel_id: { type: DataTypes.STRING },
    staff_channel_id: { type: DataTypes.STRING },
    log_channel_id: { type: DataTypes.STRING },
    // role_setup:id {type}
    staff_role_id: { type: DataTypes.STRING }, //authorized reviewer roles
    banner_url: { type: DataTypes.STRING },
    questions: { type: DataTypes.TEXT, defaultValue: '[]' }, // Stored as JSON string
    role_staff_id: { type: DataTypes.STRING },
    role_designer_id: { type: DataTypes.STRING },
    role_event_id: { type: DataTypes.STRING },
    role_partnership_id: { type: DataTypes.STRING },
    panel_style: { type: DataTypes.STRING, defaultValue: 'menu' }
});

module.exports = ApplySetup;
