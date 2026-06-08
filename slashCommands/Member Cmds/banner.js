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

      // Get the user's banner URL
      const userBanner = userProfile.bannerURL({ dynamic: true, size: 1024 });

      if (userBanner) {
        // Create an embed to show the user's banner
        const bannerEmbed = new EmbedBuilder()
          .setColor("Random") // Set a specific color
          .setTitle(`Banner of ${user.tag}`)
          .setURL(userBanner) // URL to the banner
          .setImage(userBanner) // Main image for the user's banner
          .setFooter({ text: `Requested by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
          .setTimestamp();

        await interaction.reply({ embeds: [bannerEmbed] });
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
