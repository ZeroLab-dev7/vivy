const { SlashCommandBuilder, ButtonBuilder, ButtonStyle, ContainerBuilder, SectionBuilder, TextDisplayBuilder, ThumbnailBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');
const UI = require('../../utils/ui');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('vc')
    .setDescription('Server Voice Stats')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

  async execute(interaction) {
    try {
      await interaction.deferReply(); // No ephemeral, so the reply will be visible to everyone

      const guild = interaction.guild;
      const members = guild.members.cache;
      const membersInVoice = members.filter(member => member.voice.channelId).size;
      const boostCount = guild.premiumSubscriptionCount || 0;
      const guildIconURL = guild.iconURL({ dynamic: true });

      // Create the container manually to support specific layout
      const container = new ContainerBuilder();

      // Section 1: Members (with guild icon as thumbnail accessory)
      // This matches the "header" feel while keeping the list structure
      const membersSection = new SectionBuilder();

      if (guildIconURL) {
        membersSection.setThumbnailAccessory(new ThumbnailBuilder().setURL(guildIconURL));
      }

      // Add Title and Members count to the first section
      membersSection.addTextDisplayComponents(td => td.setContent(`# ${guild.name} Stats!`));
      membersSection.addTextDisplayComponents(td => td.setContent(`### <a:member:1366766051626582050>  Members: \n<a:arrow:1366894100917391471>\`${members.size}\``));

      container.addSectionComponents(membersSection);

      // Section 2: Voice Stats (With Button Accessory)
      const voiceButton = new ButtonBuilder()
        .setCustomId('stats_voice_count')
        .setLabel(`Voice: ${membersInVoice}`)
        .setDisabled(true)
        .setStyle(ButtonStyle.Secondary);

      const voiceSection = new SectionBuilder()
        //.setButtonAccessory(voiceButton) // Attach button to the right of this section
        .addTextDisplayComponents(td => td.setContent(`### <a:voice:1366765217761071134>  In Voice: \n<a:arrow:1366894100917391471>\`${membersInVoice}\``));

      // Use setAccessory if available (older versions) or setButtonAccessory (newer)
      // Based on previous errors and index.d.ts, setButtonAccessory is the correct one for Buttons.
      voiceSection.setButtonAccessory(voiceButton);

      container.addSectionComponents(voiceSection);

      // Section 3: Boosts
      const boostSection = new SectionBuilder()
        .addTextDisplayComponents(td => td.setContent(`### <a:boost:1366892421635375167>  Boosts: \n<a:arrow:1366894100917391471>\`${boostCount}\``));

      container.addSectionComponents(boostSection);


      // Send the container
      await interaction.editReply({
        components: [container],
        flags: MessageFlags.IsComponentsV2
      });
    } catch (error) {
      console.error("Error in stats command:", error);

      const errorContainer = UI.createContainer({
        description: "- <a:warn:1365688576758644797> An error occurred while fetching the server stats.",
        color: 0xff0000
      });

      await interaction.editReply({
        components: [errorContainer],
        flags: MessageFlags.IsComponentsV2
      });
    }
  },
};
