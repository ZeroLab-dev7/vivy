const { PermissionsBitField, MessageFlags } = require('discord.js');
const UI = require('../../utils/ui');

const COOLDOWN_TIME = 5000; // 5 seconds cooldown
const cooldowns = new Map();

module.exports = {
  name: 'kick',
  description: 'Kick a member from the server.',
  aliases: ['kick', 'expluser'], // Aliases added
  async execute(message, args) {
    // Check if the user is on cooldown
    if (cooldowns.has(message.author.id)) {
      return message.react('⏳'); // React with a cooldown emoji
    }

    // Set cooldown for the user
    cooldowns.set(message.author.id, Date.now() + COOLDOWN_TIME);
    setTimeout(() => cooldowns.delete(message.author.id), COOLDOWN_TIME);

    // Check if the command executor has the required permission
    if (!message.member.permissions.has(PermissionsBitField.Flags.KickMembers)) {
      return message.reply({
        components: [UI.createContainer({
          description: ' - You need the `Kick Members` permission to use this command.'
        })],
        flags: MessageFlags.IsComponentsV2
      });
    }

    // Check if the bot has the required permission
    if (!message.guild.members.me.permissions.has(PermissionsBitField.Flags.KickMembers)) {
      return message.reply({
        components: [UI.createContainer({
          description: ' - I need the `Kick Members` permission to perform this action.'
        })],
        flags: MessageFlags.IsComponentsV2
      });
    }

    // Validate user argument
    const user = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
    if (!user) {
      return message.reply({
        components: [UI.createContainer({
          title: 'Command : kick',
          description: "Kick a user from the server.",
          footer: `Requested by ${message.author.tag}`,
          fields: [
            { name: "Aliases:", value: "- kick, expluser" },
            { name: "Usage:", value: "- ?kick @user/id (reason)" },
            { name: "Examples:", value: `- ?kick  <@${message.author.id}> Ads` }
          ]
        })],
        flags: MessageFlags.IsComponentsV2
      });
    }

    // Check if the user is the same as the bot or higher
    if (user.id === message.author.id) {
      return message.reply({
        components: [UI.createContainer({
          description: '- You cannot kick yourself.'
        })],
        flags: MessageFlags.IsComponentsV2
      });
    }

    if (user.id === message.guild.ownerId) {
      return message.reply({
        components: [UI.createContainer({
          description: '- You cannot kick the server owner.'
        })],
        flags: MessageFlags.IsComponentsV2
      });
    }

    if (user.roles.highest.position >= message.member.roles.highest.position) {
      return message.reply({
        components: [UI.createContainer({
          description: '- You cannot kick a member with the same or higher role.'
        })],
        flags: MessageFlags.IsComponentsV2
      });
    }

    // Optionally, get a reason for the kick
    const reason = args.slice(1).join(' ') || 'No reason provided';

    try {
      // Kick the user
      await user.kick(reason);

      // Send a confirmation embed
      const container = UI.createContainer({
        description: `-  Successfully kicked \`${user.user.username}\` (${user.id}).`,
        fields: [
          { name: 'User Mention:', value: `\`${user.user.username}\``, inline: true },
          { name: 'User ID:', value: `${user.id}`, inline: true },
          { name: 'Reason:', value: reason, inline: false }
        ]
      });

      return message.reply({
        components: [container],
        flags: MessageFlags.IsComponentsV2
      });
    } catch (error) {
      console.error('Error kicking user:', error);

      // Send an error message if something goes wrong
      const errorContainer = UI.createContainer({
        description: '- There was an error trying to kick the user. Please check my permissions and try again.'
      });

      return message.reply({
        components: [errorContainer],
        flags: MessageFlags.IsComponentsV2
      });
    }
  },
};
