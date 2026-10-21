const { RoomSettings } = require('./models');

class RoomSetupDB {
  async setSettings(guildId, settings) {
    try {
      await RoomSettings.upsert({
        guild_id: guildId,
        log_channel: settings.log_channel,
        room_category: settings.room_category,
        join_channel: settings.join_channel,
        staff_role: settings.staff_role,
        manager_role: settings.manager_role
      });
    } catch (error) {
      console.error("Error saving room settings via Sequelize:", error);
      throw error;
    }
  }

  async getSettings(guildId) {
    try {
      const row = await RoomSettings.findByPk(guildId);
      return row ? row.toJSON() : null;
    } catch (error) {
      console.error("Error fetching room settings via Sequelize:", error);
      throw error;
    }
  }

  async deleteSettings(guildId) {
    try {
      await RoomSettings.destroy({ where: { guild_id: guildId } });
    } catch (error) {
      console.error("Error deleting room settings via Sequelize:", error);
      throw error;
    }
  }
}

module.exports = new RoomSetupDB();
