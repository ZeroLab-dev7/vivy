const {
  EmbedBuilder,
  ChannelType,
  PermissionFlagsBits,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require("discord.js");
const RoomSetupDB = require("../db/room-setup-db");
const VoiceService = require("../services/voiceService");

const LevelService = require("../services/levelService");

module.exports = {
  name: "voiceStateUpdate",
  async execute(oldState, newState) {
    try {
      // Leveling Voice Session update
      await LevelService.handleVoiceStateUpdate(oldState, newState);

      // Execute the general Temp Voice Service (Join to Create)
      await VoiceService.handleVoiceStateUpdate(oldState, newState);

      // Stop/pause music if the bot is server muted, and resume when unmuted
      if (newState.id === newState.client.user.id) {
        if (oldState.serverMute !== newState.serverMute) {
          const MusicService = require("../services/musicService");
          const queue = MusicService.getQueue(newState.guild.id);
          if (queue) {
            if (newState.serverMute) {
              // Bot was server muted -> pause the player
              if (queue.player && typeof queue.player.pause === "function") {
                queue.player.pause();
                if (queue.textChannel) {
                  await queue.textChannel.send("⏸️ **Music has been paused because the bot was server-muted.**").catch(() => {});
                }
              }
            } else {
              // Bot was server unmuted -> resume the player
              if (queue.player && typeof queue.player.unpause === "function") {
                queue.player.unpause();
                if (queue.textChannel) {
                  await queue.textChannel.send("▶️ **Music has been resumed because the bot was server-unmuted.**").catch(() => {});
                }
              }
            }
          }
        }
      }
      // Fetch server settings
      const settings = await RoomSetupDB.getSettings(newState.guild.id);
      if (!settings || !settings.log_channel || !settings.room_category || !settings.join_channel) {
        return;
      }

      const parsedStaffRoles = JSON.parse(settings.staff_role || '[]');

      // Fetch log channel
      let logChannel = newState.guild.channels.cache.get(settings.log_channel);
      if (!logChannel) {
        try {
          logChannel = await newState.guild.channels.fetch(settings.log_channel);
        } catch (err) {
          console.log("Log Channel not found or inaccessible");
          return;
        }
      }

      // Room creation logic
      if (newState.channelId === settings.join_channel) {

        const staffOverwrites = parsedStaffRoles.map(roleId => ({
          id: roleId,
          allow: [PermissionFlagsBits.Connect, PermissionFlagsBits.Speak, PermissionFlagsBits.ViewChannel]
        }));

        // Create the room
        const personalRoom = await newState.guild.channels.create({
          name: `🆘・${newState.member.user.username}'s support`,
          type: ChannelType.GuildVoice,
          parent: settings.room_category,
          userLimit: 0,
          permissionOverwrites: [
            {
              id: newState.member.id,
              allow: [PermissionFlagsBits.Connect, PermissionFlagsBits.Speak, PermissionFlagsBits.ViewChannel],
            },
            ...staffOverwrites,
            {
              id: newState.guild.id, // @everyone
              deny: [
                PermissionFlagsBits.Connect,
                PermissionFlagsBits.ViewChannel
              ],
            },
          ],
        });

        const { SupportTicket } = require("../db/models");
        await SupportTicket.create({
          guild_id: newState.guild.id,
          user_id: newState.member.id,
          channel_id: personalRoom.id
        });

        await newState.member.voice.setChannel(personalRoom).catch(err => {
          console.error("Failed to move user:", err);
        });

        // Notify the user in their room
        const userEmbed = new EmbedBuilder()
          .setColor(0x2b2d31)
          .setDescription(`**Helper Alert**\n\n<a:loading:1365691079374012587> Staff has been notified and will be with you shortly.`)
          .setTimestamp();

        // Ping the Staff Roles and the User
        const staffPings = parsedStaffRoles.map(id => `<@&${id}>`).join(' ');
        await personalRoom.send({
          content: `${staffPings} | ${newState.member}`,
          embeds: [userEmbed]
        });

        // Helper Management Panel in Log Channel
        if (logChannel) {
          const logEmbed = new EmbedBuilder()
            .setColor("Blue")
            .setTitle("New Support Request")
            .setDescription(
              `**User:** ${newState.member} | \`${newState.member.id}\`\n` +
              `**Room:** ${personalRoom} | \`${personalRoom.id}\`\n` +
              `**Status:** Open <a:enabled:1365447306278862899>`
            )
            .setThumbnail(newState.member.user.displayAvatarURL({ dynamic: true }))
            .setTimestamp();

          const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
              .setCustomId(`nh_claim_${personalRoom.id}_${newState.member.id}`)
              .setLabel("Claim")
              .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
              .setCustomId(`nh_join_${personalRoom.id}_${newState.member.id}`)
              .setLabel("Join Room")
              .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
              .setCustomId(`nh_close_${personalRoom.id}_${newState.member.id}`)
              .setLabel("Close Ticket")
              .setStyle(ButtonStyle.Danger)
          );

          const managerPing = settings.manager_role ? `<@&${settings.manager_role}>` : staffPings;

          await logChannel.send({
            content: managerPing,
            embeds: [logEmbed],
            components: [row]
          }).catch(console.error);
        }
      }

      // Room deletion logic (Automatic cleanup if empty)
      if (oldState.channel) {
        // Check if the channel is a tracked SupportTicket
        // We only want to delete channels that are in our DB as active tickets
        const { SupportTicket } = require("../db/models");
        const ticket = await SupportTicket.findOne({ where: { channel_id: oldState.channel.id } });

        if (ticket) {
          // Check if it's empty
          if (oldState.channel.members.size === 0) {
            try {
              const channelName = oldState.channel.name || "Unknown Channel";
              await oldState.channel.delete("Support Room is empty");
              await ticket.destroy();

              // Optionally update log message if we could find it, but we don't store message IDs.
              // So we just log a separate "Room Deleted" embed.
              if (logChannel) {
                const logEmbed = new EmbedBuilder()
                  .setColor("Red")
                  .setDescription(
                    `**Room Deleted (Empty):** ${channelName}`
                  )
                  .setTimestamp();
                await logChannel.send({ embeds: [logEmbed] }).catch(() => { });
              }

            } catch (deleteError) {
              // Ignore if already deleted
              if (deleteError.code !== 10003) {
                console.error("Error deleting empty room:", deleteError);
              }
            }
          }
        }
      }
    } catch (error) {
      console.error("Error in voice state update:", error);
    }
  },
};
