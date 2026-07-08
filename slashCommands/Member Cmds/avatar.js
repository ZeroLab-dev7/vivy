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

    // Fetch guild member to check for server-specific avatar
    const member = interaction.guild ? await interaction.guild.members.fetch(user.id).catch(() => null) : null;
    const globalAvatarURL = user.displayAvatarURL({ dynamic: true, size: 1024 });
    const serverAvatarURL = member ? member.avatarURL({ dynamic: true, size: 1024 }) : null;

    const embeds = [];

    if (serverAvatarURL) {
      const globalEmbed = new EmbedBuilder()
        .setColor('Random')
        .setTitle(`${user.tag}'s Global Avatar`)
        .setURL(globalAvatarURL)
        .setImage(globalAvatarURL)
        .setFooter({ text: `Requested by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
        .setTimestamp();

      const serverEmbed = new EmbedBuilder()
        .setColor('Random')
        .setTitle(`${user.tag}'s Server Avatar`)
        .setURL(serverAvatarURL)
        .setImage(serverAvatarURL)
        .setFooter({ text: `Requested by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
        .setTimestamp();

      embeds.push(globalEmbed, serverEmbed);
    } else {
      const embed = new EmbedBuilder()
        .setColor('Random')
        .setTitle(`${user.tag}'s Avatar`)
        .setURL(globalAvatarURL)
        .setImage(globalAvatarURL)
        .setFooter({ text: `Requested by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
        .setTimestamp();

      embeds.push(embed);
    }

    // Send the avatar embed(s)
    await interaction.reply({
      embeds: embeds,
    });
  },
};
