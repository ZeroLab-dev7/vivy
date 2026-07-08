const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
  ChannelType,
  Colors,
} = require("discord.js");

const RoomSetupDB = require("../../db/room-setup-db");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("set-needhelp")
    .setDescription("Setup the room creation system")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addChannelOption((option) =>
      option
        .setName("logs_channel")
        .setDescription("Select the channel for system logs")
        .setRequired(true)
        .addChannelTypes(ChannelType.GuildText)
    )

    .addChannelOption((option) =>
      option
        .setName("room_category")
        .setDescription("Select the category for personal rooms")
        .setRequired(true)
        .addChannelTypes(ChannelType.GuildCategory)
    )
    .addChannelOption((option) =>
      option
        .setName("join_channel")
        .setDescription("Select the voice channel for room creation")
        .setRequired(true)
        .addChannelTypes(ChannelType.GuildVoice)
    )
    .addStringOption((option) =>
      option
        .setName("staff_role")
        .setDescription("Select the Staff Roles that will help users (Mentions or IDs)")
        .setRequired(true)
    )
    .addRoleOption((option) =>
      option
        .setName("manager_role")
        .setDescription("Select the Manager Role (will be tagged in logs)")
        .setRequired(true)
    ),

  async execute(interaction) {
    try {
      await interaction.deferReply({ ephemeral: true });

      const guild = interaction.guild;
      const staffRolesInput = interaction.options.getString("staff_role");
      const managerRole = interaction.options.getRole("manager_role");
      const staffRoleIds = staffRolesInput.match(/\d{17,19}/g) || [];

      if (staffRoleIds.length === 0) {
        return interaction.editReply({
          content: '❌ Please provide valid roles or role IDs for staff roles.',
          ephemeral: true
        });
      }

      const settings = {
        log_channel: interaction.options.getChannel("logs_channel").id,
        room_category: interaction.options.getChannel("room_category").id,
        join_channel: interaction.options.getChannel("join_channel").id,
        staff_role: JSON.stringify(staffRoleIds),
        manager_role: managerRole.id,
      };

      // Save settings to database
      await RoomSetupDB.setSettings(guild.id, settings);

      // Create confirmation embed
      const embed = new EmbedBuilder()
        .setColor(0x2b2d31)
        .setTitle("Room Creation System Setup")
        .setDescription(
          `<a:done:1365447294819762266> **Successfully configured the room creation system!**\n\n` +
          `**Configuration Details:**\n` +
          `- Logs Channel: <#${settings.log_channel}>\n` +
          `- Room Category: <#${settings.room_category}>\n` +
          `- Join Channel: <#${settings.join_channel}>\n` +
          `- Staff Roles: ${staffRoleIds.map(id => `<@&${id}>`).join(', ')}\n` +
          `- Manager Role: <@&${settings.manager_role}>`
        )
        .setTimestamp()
        .setFooter({
          text: guild.name,
          iconURL: guild.iconURL({ dynamic: true }),
        });

      // Log to specified log channel
      const logChannel = guild.channels.cache.get(settings.log_channel);
      if (logChannel) {
        const logEmbed = new EmbedBuilder()
          .setColor(0x2b2d31)
          .setTitle("Room System Updated")
          .setDescription(
            `**Updated by:** ${interaction.user}\n` +
            `**Action:** Setup Room Creation System\n\n` +
            `**New Configuration:**\n` +
            `- Logs Channel: <#${settings.log_channel}>\n` +
            `- Room Category: <#${settings.room_category}>\n` +
            `- Join Channel: <#${settings.join_channel}>\n` +
            `- Staff Roles: ${staffRoleIds.map(id => `<@&${id}>`).join(', ')}\n` +
            `- Manager Role: <@&${managerRole}>`
          )
          .setTimestamp();

        await logChannel.send({ embeds: [logEmbed] });
      }

      // Reply to interaction
      await interaction.editReply({
        embeds: [embed],
        ephemeral: true,
      });
    } catch (error) {
      console.error("Setup Room Error:", error);

      const errorEmbed = new EmbedBuilder()
        .setColor(Colors.Yellow)
        .setDescription(
          "- <a:warn:1365688576758644797> An error occurred while setting up the room system. " +
          "Please check the channel and role permissions and try again."
        )
        .setTimestamp();

      const errorOptions = { embeds: [errorEmbed], ephemeral: true };
      if (interaction.deferred || interaction.replied) {
        await interaction.editReply(errorOptions).catch(() => { });
      } else {
        await interaction.reply(errorOptions).catch(() => { });
      }
    }
  },
};
