const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');
const UI = require('../../utils/ui');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setup')
    .setDescription('Centralized dashboard for all bot configuration systems')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const { SeparatorSpacingSize, MediaGalleryBuilder, MediaGalleryItemBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, SectionBuilder } = require('discord.js');

    const container = UI.createContainer({
      title: `Server Setup • Page 1/4`,
      description:
        `め 」 **Manage your server configuration using the buttons below.**\n\n` +
        `Use the navigation buttons at the bottom to switch between pages.`,
      color: 0x009aff, // Premium Blue
    });

    const createSection = (desc, label, customId) => {
      const section = new SectionBuilder();
      section.addTextDisplayComponents(td => td.setContent(`• ⌄ ${desc} ⁝`));
      section.setButtonAccessory(new ButtonBuilder().setCustomId(customId).setLabel(label).setStyle(ButtonStyle.Secondary));
      return section;
    };

    container.addSeparatorComponents(sep => sep.setSpacing(SeparatorSpacingSize.Small));
    container.addSectionComponents(createSection('Configure automatic role assignment for new members', 'Auto Role', 'btn_setup_autorole'));
    container.addSeparatorComponents(sep => sep.setSpacing(SeparatorSpacingSize.Small));
    container.addSectionComponents(createSection('Configure automatic nickname tags based on roles', 'Auto Tag', 'btn_setup_autotag'));
    container.addSeparatorComponents(sep => sep.setSpacing(SeparatorSpacingSize.Small));
    container.addSectionComponents(createSection('Configure staff application system', 'Staff Apply', 'btn_setup_apply'));
    container.addSeparatorComponents(sep => sep.setSpacing(SeparatorSpacingSize.Small));
    container.addSectionComponents(createSection('Configure server logging system', 'Logs Server', 'btn_setup_logs'));

    // Pagination Row
    const navRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('setup_page_4').setEmoji('⬅️').setStyle(ButtonStyle.Secondary), // Left
      new ButtonBuilder().setCustomId('setup_page_2').setEmoji('➡️').setStyle(ButtonStyle.Secondary)  // Right
    );

    container.addSeparatorComponents(sep => sep.setSpacing(SeparatorSpacingSize.Small));
    container.addActionRowComponents(navRow);

    // --- Image ---
    container.addSeparatorComponents(sep => sep.setSpacing(SeparatorSpacingSize.Small));
    const gallery = new MediaGalleryBuilder();
    gallery.addItems(new MediaGalleryItemBuilder().setURL("https://media.discordapp.net/attachments/1329547343791525989/1492418340013084742/image.png?ex=69db4264&is=69d9f0e4&hm=89a4bc524d917dafd8b093478eb186879ad2dd27be947e6b2c0bd14f944ea008&=&format=webp&quality=lossless"));
    container.addMediaGalleryComponents(gallery);

    // --- Footer ---
    container.addSeparatorComponents(sep => sep.setSpacing(SeparatorSpacingSize.Small));
    container.addTextDisplayComponents(td => td.setContent(`-# Forge Studio • Setup Hub`));

    // Sync/create native AutoMod rules on setup command execution
    try {
      const AutoModService = require('../../services/autoModService');
      AutoModService.getOrCreateConfig(interaction.guild.id).then(config => {
        AutoModService.syncToDiscord(interaction.client, interaction.guild.id, config).catch(err => {
          console.error("<:no:1526496561188831244>Error syncing AutoMod rules on setup command:", err);
        });
      });
    } catch (e) {
      console.error("<:no:1526496561188831244>Error initiating AutoMod sync on setup command:", e);
    }

    try {
      await interaction.editReply({
        components: [container],
        flags: MessageFlags.IsComponentsV2
      });
    } catch (error) {
      console.error("Setup Dashboard Error:", error);
      // Fallback for interaction editReply if V2 fails in ephmeral responses on some clients
      await interaction.editReply({
        content: `<:no:1526496561188831244>An error occurred while opening the dashboard. Please ensure the bot has all necessary permissions.`,
        components: []
      });
    }
  },
};
