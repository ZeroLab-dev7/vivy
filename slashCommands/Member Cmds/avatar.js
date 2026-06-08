const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('avatar')
    .setDescription('Displays a user\'s avatar.')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The user to fetch the avatar for.')
        .setRequired(false)
    ),

  async execute(interaction) {
    // Get the user from the interaction or default to the invoking user
    const user = interaction.options.getUser('user') || interaction.user;

    // Create the avatar embed
    const embed = new EmbedBuilder()
      .setColor('Random')
      .setTitle(`${user.tag}'s Avatar`)
      .setImage(user.displayAvatarURL({ dynamic: true, size: 1024 }))
      .setFooter({ text: `Requested by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
      .setTimestamp();

    // Send the avatar embed
    await interaction.reply({
      embeds: [embed],
    });
  },
};
