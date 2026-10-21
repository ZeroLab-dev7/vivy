const { DataTypes } = require('sequelize');
const { sequelize } = require('../connection');

const TrustedEntity = sequelize.define('TrustedEntity', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    guild_id: {
        type: DataTypes.STRING,
        allowNull: false
    },
    entity_id: {
        type: DataTypes.STRING,
        allowNull: false
    },
    type: {
        type: DataTypes.ENUM('user', 'role', 'bot'),
        allowNull: false
    },
    label: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    tableName: 'trusted_entities',
    timestamps: true,
    indexes: [
        {
            unique: true,
            fields: ['guild_id', 'entity_id', 'type']
        }
    ]
});

module.exports = TrustedEntity;
