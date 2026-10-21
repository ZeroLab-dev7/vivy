const { DataTypes } = require('sequelize');
const { sequelize } = require('../connection');

const FarmPlot = sequelize.define('FarmPlot', {
    user_id: {
        type: DataTypes.STRING,
        allowNull: false
    },
    guild_id: {
        type: DataTypes.STRING,
        allowNull: false
    },
    plot_index: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    crop_id: {
        type: DataTypes.STRING,
        allowNull: true
    },
    planted_at: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    indexes: [
        {
            unique: true,
            fields: ['user_id', 'guild_id', 'plot_index']
        }
    ]
});

module.exports = FarmPlot;
