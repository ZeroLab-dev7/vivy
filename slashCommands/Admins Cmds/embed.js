const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("embed")
    .setDescription("Create and send an embed from a JSON string")
    .addStringOption(option =>
      option
        .setName("json")
        .setDescription("- <:false:1365517000750661693> The JSON string containing the embed")
        .setRequired(true)
    ),

  async execute(interaction) {
    // Get the JSON string from the interaction
    const jsonString = interaction.options.getString("json");

    if (interaction.user.bot || !jsonString) return;

    try {
      // Parse the JSON string
      const jsonEmbed = JSON.parse(jsonString);

      if (!jsonEmbed.embeds || !Array.isArray(jsonEmbed.embeds) || jsonEmbed.embeds.length === 0) {
        const errorEmbed = new EmbedBuilder()
          .setColor("#FF0000")  // Red color for error
          .setDescription("- <:false:1365517000750661693> The provided JSON does not contain a valid embed.")
          .setFooter({ text: "Please check the provided JSON format." })
          .setTimestamp();
        return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
      }

      const embed = new EmbedBuilder(jsonEmbed.embeds[0]);

      await interaction.channel.send({
        content: jsonEmbed.content || null,
        embeds: [embed],
      });

      const successEmbed = new EmbedBuilder()
        .setColor("#00FF00")  // Green color for success
        .setDescription("- <a:done:1365447294819762266> Successfully sent the embed!")

      await interaction.reply({
        embeds: [successEmbed],
        ephemeral: true,
      });

    } catch (error) {
      console.error("Error parsing JSON:", error);

      const errorEmbed = new EmbedBuilder()
        .setColor("#FF0000")  // Red color for error
        .setDescription("- <:false:1365517000750661693> There is an error in your JSON format. Please check the syntax.")
        .setFooter({ text: "Error occurred while parsing JSON." })
        .setTimestamp();

      return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }
  },
};
