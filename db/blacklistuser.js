const { RoleBlacklist } = require('./models');
const { Op } = require('sequelize');

class BlacklistUserDB {
  // Add user to role blacklist
  static async addBlacklistRole(guildId, userId, roleId) {
    try {
      await RoleBlacklist.upsert({
        guild_id: guildId,
        user_id: userId,
        role_id: roleId
      });
    } catch (error) {
      console.error("Error in addBlacklistRole via Sequelize:", error);
      throw error;
    }
  }

  // Remove user from role blacklist
  static async removeBlacklistRole(guildId, userId, roleId) {
    try {
      await RoleBlacklist.destroy({
        where: {
          guild_id: guildId,
          user_id: userId,
          role_id: roleId
        }
      });
    } catch (error) {
      console.error("Error in removeBlacklistRole via Sequelize:", error);
      throw error;
    }
  }

  // Get all blacklisted roles for a user
  static async getBlacklistedRoles(guildId, userId) {
    try {
      const rows = await RoleBlacklist.findAll({
        where: { guild_id: guildId, user_id: userId }
      });
      return rows.map(r => r.toJSON());
    } catch (error) {
      console.error("Error in getBlacklistedRoles via Sequelize:", error);
      throw error;
    }
  }

  // Check if user is blacklisted from a specific role
  static async isBlacklistedFromRole(guildId, userId, roleId) {
    try {
      const row = await RoleBlacklist.findOne({
        where: {
          guild_id: guildId,
          user_id: userId,
          [Op.or]: [
            { role_id: roleId },
            { role_id: 'all' }
          ]
        }
      });
      return !!row;
    } catch (error) {
      console.error("Error in isBlacklistedFromRole via Sequelize:", error);
      throw error;
    }
  }
}

module.exports = BlacklistUserDB;
