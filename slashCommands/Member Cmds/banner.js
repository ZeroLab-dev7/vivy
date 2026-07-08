const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("banner")
    .setDescription("Displays the banner of the mentioned user or user ID, as well as your own banner.")
    .addUserOption(option =>
      option
        .setName("user")
        .setDescription("The user to fetch the banner for.")
        .setRequired(false)
    ),

  async execute(interaction) {
    // Get the user from the interaction
    let user = interaction.options.getUser("user") || interaction.user;

    try {
      // Fetch the user's profile to access the banner
      const userProfile = await interaction.client.users.fetch(user.id, { force: true });

      // Fetch the guild member to check for server-specific banner
      const member = interaction.guild ? await interaction.guild.members.fetch(user.id).catch(() => null) : null;

      // Get banner URLs
      const globalBannerURL = userProfile.bannerURL({ dynamic: true, size: 1024 });
      const serverBannerURL = member ? member.bannerURL({ dynamic: true, size: 1024 }) : null;

      const embeds = [];

      if (globalBannerURL) {
        const globalEmbed = new EmbedBuilder()
          .setColor("Random")
          .setTitle(`${user.tag}'s Global Banner`)
          .setURL(globalBannerURL)
          .setImage(globalBannerURL)
          .setFooter({ text: `Requested by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
          .setTimestamp();
        embeds.push(globalEmbed);
      }

      if (serverBannerURL) {
        const serverEmbed = new EmbedBuilder()
          .setColor("Random")
          .setTitle(`${user.tag}'s Server Banner`)
          .setURL(serverBannerURL)
          .setImage(serverBannerURL)
          .setFooter({ text: `Requested by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
          .setTimestamp();
        embeds.push(serverEmbed);
      }

      // If only one exists and it's the global banner, make the title match original style
      if (embeds.length === 1 && globalBannerURL) {
        embeds[0].setTitle(`Banner of ${user.tag}`);
      }

      if (embeds.length > 0) {
        await interaction.reply({ embeds: embeds });
      } else {
        const nobannerEmbed = new EmbedBuilder()
          .setDescription('- This user does not have a banner set.')
          .setColor("#FF0000")  // Red color for no banner
          .setTimestamp();

        await interaction.reply({ embeds: [nobannerEmbed] });
      }
    } catch (error) {
      console.error("Error fetching banner:", error);
      const errorEmbed = new EmbedBuilder()
        .setDescription('Could not fetch the user profile. Please make sure the user ID is valid or mention the user.')
        .setColor("#FF0000")  // Red color for error
        .setTimestamp();

      await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }
  }
};
