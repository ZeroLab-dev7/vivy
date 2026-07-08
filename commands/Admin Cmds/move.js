const { PermissionsBitField, MessageFlags, ChannelType } = require('discord.js');
const UI = require('../../utils/ui');
const { GuildSettings } = require('../../db/models');

module.exports = {
  name: 'move',
  aliases: ['aji', 'jib'],
  description: 'Move a member to a voice channel.',

  async execute(message, args) {
    try {
      // 1. Fetch Guild Settings for Logs and Roles
      const settings = await GuildSettings.findOne({ where: { guild_id: message.guild.id } });
      const ownerRoleIds = settings?.owner_role_id ? settings.owner_role_id.split(',') : [];

      const isOwner = message.author.id === message.guild.ownerId;
      const hasOwnerRole = ownerRoleIds.some(id => message.member.roles.cache.has(id));
      const hasMovePerm = message.member.permissions.has(PermissionsBitField.Flags.MoveMembers);
      const isAdmin = message.member.permissions.has(PermissionsBitField.Flags.Administrator);

      // ─── Permission Check (Command Authority) ───
      // We check if the user HAS authority to use the command, ignoring room locks for them.
      if (!isOwner && !hasOwnerRole && !hasMovePerm && !isAdmin) {
        return message.reply({
          components: [UI.createContainer({ description: '❌ You do not have permission to move members.' })],
          flags: MessageFlags.IsComponentsV2
        });
      }

      // ─── Bot Permission ───
      // Ensure the bot has administrative or move permissions to perform the action.
      if (!message.guild.members.me.permissions.has(PermissionsBitField.Flags.MoveMembers)) {
        return message.channel.send({
          components: [UI.createContainer({ description: '❌ I need **Move Members** permission to work.' })],
          flags: MessageFlags.IsComponentsV2
        });
      }

      // ─── Target Member ───
      if (!args[0]) {
        return message.reply({
          components: [UI.createContainer({ description: 'Usage: `?move <member> [channel]`' })],
          flags: MessageFlags.IsComponentsV2
        });
      }

      const targetId = args[0].replace(/[<@!>]/g, "");
      const target = await message.guild.members.fetch(targetId).catch(() => null);

      if (!target) {
        return message.reply({
          components: [UI.createContainer({ description: '❌ Member not found.' })],
          flags: MessageFlags.IsComponentsV2
        });
      }

      if (target.user.bot) {
        return message.reply({
          components: [UI.createContainer({ description: '❌ You cannot move bots.' })],
          flags: MessageFlags.IsComponentsV2
        });
      }

      // ─── Target Channel ───
      let targetChannel;

      if (args[1]) {
        const channelId = args[1].replace(/[<#>]/g, "");
        targetChannel = message.guild.channels.cache.get(channelId);
      } else {
        // Default to author's voice channel
        targetChannel = message.member.voice.channel;
      }

      if (!targetChannel || targetChannel.type !== ChannelType.GuildVoice) {
        return message.reply({
          components: [UI.createContainer({ description: '❌ Invalid voice channel. Please mention a channel or join one.' })],
          flags: MessageFlags.IsComponentsV2
        });
      }

      // ─── Status Checks ───
      if (!target.voice.channel) {
        return message.reply({
          components: [UI.createContainer({ description: '❌ That user is not in a voice channel.' })],
          flags: MessageFlags.IsComponentsV2
        });
      }

      const fromChannel = target.voice.channel;
      if (fromChannel.id === targetChannel.id) {
        return message.reply({
          components: [UI.createContainer({ description: '❌ User is already in that channel.' })],
          flags: MessageFlags.IsComponentsV2
        });
      }

      // ─── MOVE Execution ───
      // We rely on the bot's permissions to perform the move, ignoring user-side room locks.
      await target.voice.setChannel(targetChannel).catch(err => {
        throw new Error(`Failed to move: ${err.message}`);
      });

      await message.reply({
        components: [UI.createContainer({
          description: `✅ **${target.user.username}** has been moved to **${targetChannel.name}**.`
        })],
        flags: MessageFlags.IsComponentsV2
      });

      // ─── LOGGING ───
      if (settings?.log_channel) {
        const logChannel = message.guild.channels.cache.get(settings.log_channel);
        if (logChannel) {
          logChannel.send({
            components: [UI.createContainer({
              title: '🔊 Voice Move Log',
              description:
                `👤 **Action By:** ${message.author.tag} (${message.author.id})\n` +
                `🎯 **Target:** ${target.user.tag} (${target.id})\n` +
                `🔊 **From:** \`${fromChannel.name}\`\n` +
                `➡ **To:** \`${targetChannel.name}\`\n` +
                `⏰ **Time:** <t:${Math.floor(Date.now() / 1000)}:F>`
            })],
            flags: MessageFlags.IsComponentsV2
          }).catch(console.error);
        }
      }

    } catch (error) {
      console.error("move command error:", error);
      return message.reply({
        components: [UI.createContainer({ description: `❌ An error occurred: ${error.message}` })],
        flags: MessageFlags.IsComponentsV2
      });
    }
  }
};
