const { ContainerBuilder, SectionBuilder, ButtonBuilder, ButtonStyle, ThumbnailBuilder } = require('discord.js');

try {
  const container = new ContainerBuilder();
  const membersSection = new SectionBuilder();
  membersSection.setThumbnailAccessory(new ThumbnailBuilder().setURL("https://example.com/image.png"));
  membersSection.addTextDisplayComponents(td => td.setContent(`# Hello`));
  container.addSectionComponents(membersSection);

  const voiceButton = new ButtonBuilder()
    .setCustomId('stats_voice_count')
    .setLabel(`Voice: 10`)
    .setDisabled(true)
    .setStyle(ButtonStyle.Secondary);

  const voiceSection = new SectionBuilder()
    .addTextDisplayComponents(td => td.setContent(`### In Voice`));

  voiceSection.setButtonAccessory(voiceButton);
  container.addSectionComponents(voiceSection);
  console.log("Successfully built container JSON:", JSON.stringify(container.toJSON()));
} catch (e) {
  console.error("Failed to build container:", e);
}
