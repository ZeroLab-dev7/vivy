const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
  Colors,
} = require("discord.js");
const JailSetup = require("../../db/models/JailSetup");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("setup_jail")
    .setDescription("Setup the jail system")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addStringOption((option) =>
      option
        .setName("role-hammer")
        .setDescription("Select the roles for users who can jail others (IDs or Mentions)")
        .setRequired(true)
    )
    .addRoleOption((option) =>
      option
        .setName("jailed_role")
        .setDescription("Select the role for jailed users")
        .setRequired(true)
    )
    .addChannelOption((option) =>
      option
        .setName("channel-logs")
        .setDescription("Select the jail logs channel")
        .setRequired(true)
    ),

  async execute(interaction) {
    try {
      await interaction.deferReply({ ephemeral: true });

      const jailerRolesInput = interaction.options.getString("role-hammer");
      const jailedRole = interaction.options.getRole("jailed_role");
      const jailLogsChannel = interaction.options.getChannel("channel-logs");

      // Extract IDs
      const jailerRoleIds = jailerRolesInput.match(/\d{17,19}/g) || [];

      if (jailerRoleIds.length === 0 || !jailedRole || !jailLogsChannel) {
        const errorEmbed = new EmbedBuilder()
          .setColor(Colors.Yellow)
          .setDescription(
            "- <a:warn:1365688576758644797> Please ensure you have configured valid roles and channels."
          );

        return await interaction.editReply({
          embeds: [errorEmbed],
          ephemeral: true,
        });
      }

      await JailSetup.upsert({
        guild_id: interaction.guild.id,
        jailer_role_id: JSON.stringify(jailerRoleIds),
        jailed_role_id: jailedRole.id,
        logs_channel_id: jailLogsChannel.id,
      });

      const embed = new EmbedBuilder()
        .setColor(Colors.Blue)
        .setDescription(
          `
          <a:done:1365447294819762266> **Successfully configured jail system!**

          **Roles Configuration:**
          - Role hammer: ${jailerRoleIds.map(id => `<@&${id}>`).join(", ")}
          - Jailed Role: <@&${jailedRole.id}>

          **Logs Configuration:**
          - Jail Logs: <#${jailLogsChannel.id}>`
        )
        .setFooter({
          text: interaction.guild.name,
          iconURL: interaction.guild.iconURL({ dynamic: true }),
        });

      const logChannel = interaction.guild.channels.cache.get(
        jailLogsChannel.id
      );

      if (logChannel) {
        const logEmbed = new EmbedBuilder()
          .setColor(Colors.Blue)
          .setDescription(
            `
            **Updated by:** ${interaction.user}
            **Action:** Setup Jail System

            **New Configuration:**
            - Jailer Role: ${jailerRoleIds.map(id => `<@&${id}>`).join(", ")}
            - Jailed Role: <@&${jailedRole.id}>`
          );

        await logChannel.send({ embeds: [logEmbed] }).catch(() => { });
      }

      await interaction.editReply({
        embeds: [embed],
        ephemeral: true,
      });
    } catch (error) {
      console.error("Setup Jail Error:", error);

      const errorEmbed = new EmbedBuilder()
        .setColor(Colors.Red)
        .setDescription(
          "- <a:warn:1365688576758644797> An error occurred while setting up the jail system."
        );

      const errorOptions = { embeds: [errorEmbed], ephemeral: true };
      if (interaction.deferred || interaction.replied) {
        await interaction.editReply(errorOptions).catch(() => { });
      } else {
        await interaction.reply(errorOptions).catch(() => { });
      }
    }
  },
};