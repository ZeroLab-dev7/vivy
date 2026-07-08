const { MessageFlags } = require('discord.js');
const UI = require('../../utils/ui');
const MinecraftServer = require('minecraft-server-util');

module.exports = {
  name: "mcstats",
  description: "Get Minecraft server stats",
  async execute(message, args) {
    try {
      const serverIP = args[0];  // Get the server IP from the command argument
      if (!serverIP) {
        return message.reply({
          components: [UI.createContainer({
            description: "- Please provide a Minecraft server IP."
          })],
          flags: MessageFlags.IsComponentsV2
        });
      }

      // Fetch the server stats
      const status = await MinecraftServer.status(serverIP);

      // Ensure all fields are valid strings
      const onlineStatus = status.online ? 'Yes' : 'No';
      const playersOnline = status.players && status.players.online ? `${status.players.online} / ${status.players.max}` : 'N/A';
      const serverVersion = status.version && typeof status.version === 'string' ? status.version : (status.version ? status.version.name : 'Unknown version');
      const motd = status.motd && status.motd.clean ? String(status.motd.clean) : 'No message set';  // Ensure this is a string

      // Create a container for the server stats
      const container = UI.createContainer({
        title: 'Minecraft Server Stats',
        description: `**Minecraft Server Status for ${serverIP}**`,
        // Thumbnail not supported yet
        fields: [
          { name: "Online", value: String(onlineStatus) },
          { name: "Players Online", value: String(playersOnline) },
          { name: "Version", value: String(serverVersion) },
          { name: "MOTD", value: String(motd) }
        ],
        footer: "Minecraft Server Stats"
      });

      return message.reply({
        components: [container],
        flags: MessageFlags.IsComponentsV2
      });

    } catch (error) {
      console.error("Error fetching Minecraft server stats:", error);
      return message.reply({
        components: [UI.createContainer({
          description: "- Error fetching Minecraft server stats."
        })],
        flags: MessageFlags.IsComponentsV2
      });
    }
  }
};
