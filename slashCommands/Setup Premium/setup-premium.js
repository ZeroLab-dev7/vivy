const {
    SlashCommandBuilder,
    PermissionFlagsBits,
    EmbedBuilder,
    ChannelType,
    Colors,
} = require("discord.js");

const { PremiumSetup } = require("../../db/models");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("setup-premium")
        .setDescription("Setup the premium system configuration")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addStringOption((option) =>
            option
                .setName("manager_role")
                .setDescription("Select the roles that can manage premium plans (Mentions or IDs)")
                .setRequired(true)
        )
        .addChannelOption((option) =>
            option
                .setName("category")
                .setDescription("Select the category where premium channels will be created")
                .setRequired(true)
                .addChannelTypes(ChannelType.GuildCategory)
        ),

    async execute(interaction) {
        try {
            await interaction.deferReply({ ephemeral: true });

            const managerRolesInput = interaction.options.getString("manager_role");
            const category = interaction.options.getChannel("category");

            const managerRoleIds = managerRolesInput.match(/\d{17,19}/g) || [];
            if (managerRoleIds.length === 0) {
                return interaction.editReply({
                    content: '❌ Please provide valid roles or role IDs for manager roles.',
                    ephemeral: true
                });
            }

            await PremiumSetup.upsert({
                guild_id: interaction.guild.id,
                category_id: category.id,
                manager_role_id: JSON.stringify(managerRoleIds),
            });

            const embed = new EmbedBuilder()
                .setColor(Colors.Green)
                .setDescription(
                    `
          <a:done:1365447294819762266> **Successfully configured Premium System!**

          **Configuration:**
          - Manager Roles: ${managerRoleIds.map(id => `<@&${id}>`).join(', ')}
          - Premium Category: ${category}
          `
                )
                .setFooter({
                    text: interaction.guild.name,
                    iconURL: interaction.guild.iconURL({ dynamic: true }),
                });

            await interaction.editReply({ embeds: [embed] });
        } catch (error) {
            console.error("Setup Premium Error:", error);
            const errorEmbed = new EmbedBuilder()
                .setColor(Colors.Red)
                .setDescription("- ❌ An error occurred while setting up the premium system.");

            const errorOptions = { embeds: [errorEmbed], ephemeral: true };
            if (interaction.deferred || interaction.replied) {
                await interaction.editReply(errorOptions).catch(() => { });
            } else {
                await interaction.reply(errorOptions).catch(() => { });
            }
        }
    },
};
