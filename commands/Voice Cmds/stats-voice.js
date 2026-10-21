const { ActivityType, MessageFlags, ButtonBuilder, ButtonStyle, ContainerBuilder, SectionBuilder, SeparatorBuilder, MediaGalleryBuilder, MediaGalleryItemBuilder } = require('discord.js');
const UI = require('../../utils/ui');

module.exports = {
    name: 'stats-voice',
    description: 'Displays the server voice and member stats',
    aliases: ['vc', 'voicestats'],
    async execute(message, args) {
        const guild = message.guild;

        const membersInVoice = guild.voiceStates.cache.size;
        const boostCount = guild.premiumSubscriptionCount || 0;
        const bannerURL = guild.bannerURL({ size: 1024 });

        // Create the container manually to support specific layout
        const container = new ContainerBuilder();
        container.setAccentColor(0x00FFFF);

        // Header Title
        container.addTextDisplayComponents(td => td.setContent(`# ${guild.name} Stats!`));
        container.addSeparatorComponents(new SeparatorBuilder());

        // Section 2: Members (With Button Accessory)
        const membersSection = new SectionBuilder()
            .addTextDisplayComponents(td => td.setContent(`### <a:member:1366766051626582050>  Members:`));

        const membersButton = new ButtonBuilder()
            .setCustomId('stats_member_count')
            .setLabel(`${guild.memberCount}`)
            .setDisabled(true)
            .setStyle(ButtonStyle.Secondary);

        membersSection.setButtonAccessory(membersButton);

        container.addSectionComponents(membersSection);
        container.addSeparatorComponents(new SeparatorBuilder());

        // Section 3: Voice Stats (With Button Accessory)
        const voiceButton = new ButtonBuilder()
            .setCustomId('stats_voice_count')
            .setLabel(`${membersInVoice}`)
            .setDisabled(true)
            .setStyle(ButtonStyle.Secondary);

        const voiceSection = new SectionBuilder()
            .addTextDisplayComponents(td => td.setContent(`### <a:voice:1366765217761071134>  In Voice:`));

        voiceSection.setButtonAccessory(voiceButton);

        container.addSectionComponents(voiceSection);
        container.addSeparatorComponents(new SeparatorBuilder());

        // Section 4: Boosts (With Button Accessory)
        const boostButton = new ButtonBuilder()
            .setCustomId('stats_boost_level')
            .setLabel(`Level: ${guild.premiumTier}`)
            .setDisabled(true)
            .setStyle(ButtonStyle.Secondary);

        const boostSection = new SectionBuilder()
            .addTextDisplayComponents(td => td.setContent(`### <a:boost:1366892421635375167>  Boosts:`));

        boostSection.setButtonAccessory(boostButton);

        container.addSectionComponents(boostSection);

        // Server Banner at the end
        if (bannerURL) {
            container.addSeparatorComponents(new SeparatorBuilder());
            container.addMediaGalleryComponents(
                new MediaGalleryBuilder().addItems(new MediaGalleryItemBuilder().setURL(bannerURL))
            );
        }

        await message.channel.send({
            components: [container],
            flags: MessageFlags.IsComponentsV2
        });
    },
};
