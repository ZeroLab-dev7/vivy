const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("addemoji")
    .setDescription("Add an emoji from another server")
    .addStringOption(option =>
      option
        .setName("emoji")
        .setDescription("The emoji to add")
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName("name")
        .setDescription("The name for the emoji")
        .setRequired(true)
    ),

  async execute(interaction) {
    // Check if the user has Manage Emojis permission
    if (!interaction.member.permissions.has("ManageEmojisAndStickers")) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("Yellow")
            .setDescription("- <a:warn:1365688576758644797> You need the `Manage Emojis` permission to use this command."),
        ],
        ephemeral: true,
      });
    }

    const emoji = interaction.options.getString("emoji");
    const name = interaction.options.getString("name");

    // Validate emoji format (must be a custom emoji from another server)
    const emojiMatch = emoji.match(/<(a)?:\w+:(\d+)>/);

    if (!emojiMatch) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("Yellow")
            .setDescription("- <a:warn:1365688576758644797> Invalid emoji format. Please provide a valid custom emoji from another server."),
        ],
        ephemeral: true,
      });
    }

    const isAnimated = emojiMatch[1] === 'a';
    const emojiID = emojiMatch[2];
    const extension = isAnimated ? 'gif' : 'png';
    const emojiURL = `https://cdn.discordapp.com/emojis/${emojiID}.${extension}`;

    try {
      // Attempt to create the emoji on the server
      const newEmoji = await interaction.guild.emojis.create({
        attachment: emojiURL,
        name: name,
      });

      const embed = new EmbedBuilder()
        .setColor("#00f5ff")
        .setDescription("✅ Successfully added emoji!")
        .setThumbnail(emojiURL);

      return interaction.reply({ embeds: [embed] });

    } catch (error) {
      let errorMessage = "- <a:warn:1365688576758644797> Failed to add emoji.";
      if (error.code === 30008) {
        errorMessage += " The server has reached the emoji limit.";
      } else if (error.code === 50013) {
        errorMessage += " The bot needs `Manage Emojis` permission.";
      }

      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("#00f5ff")
            .setDescription(errorMessage),
        ],
        ephemeral: true,
      });
    }
  },
};
