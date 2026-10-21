const { PermissionsBitField } = require("discord.js");
const { PubSetup } = require("../../db/models");
const UI = require("../../utils/ui");

module.exports = {
  name: "pub",
  description: "Dev command to enable or disable the custom welcome message.",
  cooldown: 3,

  async execute(message, args) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return message.reply({
        embeds: [
          UI.createEmbed({
            type: 'error',
            title: 'Error',
            description: "<:no:1526496561188831244>You don't have permissions to use this command."
          })
        ]
      });
    }

    if (!args[0]) {
      return message.reply({
        embeds: [
          UI.createEmbed({
            type: 'info',
            title: 'Info',
            description: "❓ Please specify `on` or `off`.\nExample: `?pub on`"
          })
        ]
      });
    }

    const option = args[0].toLowerCase();

    if (option === 'on') {
      await PubSetup.upsert({
        guild_id: message.guild.id,
        is_enabled: true
      });

      return message.reply({
        embeds: [
          UI.createEmbed({
            type: 'success',
            title: 'Success',
            description: "✅ Pub message has been enabled! New members will receive the Forge Studio welcome message."
          })
        ]
      });
    } else if (option === 'off') {
      await PubSetup.upsert({
        guild_id: message.guild.id,
        is_enabled: false
      });

      return message.reply({
        embeds: [
          UI.createEmbed({
            type: 'success',
            title: 'Success',
            description: "✅ Pub message has been disabled!"
          })
        ]
      });
    } else {
      return message.reply({
        embeds: [
          UI.createEmbed({
            type: 'info',
            title: 'Info',
            description: "❓ Invalid option. Please specify `on` or `off`.\nExample: `?pub on`"
          })
        ]
      });
    }
  }
};
