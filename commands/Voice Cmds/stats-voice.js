const { ActivityType, MessageFlags, ButtonBuilder, ButtonStyle, ContainerBuilder, SectionBuilder, SeparatorBuilder, ThumbnailBuilder } = require('discord.js');
const UI = require('../../utils/ui');

module.exports = {
    name: 'stats-voice',
    description: 'Displays the server voice and member stats',
    aliases: ['vc', 'voicestats'],
    async execute(message, args) {
        const guild = message.guild;

        const membersInVoice = guild.voiceStates.cache.size;
        const boostCount = guild.premiumSubscriptionCount || 0;
        const guildIconURL = guild.iconURL({ dynamic: true });

        // Create the container manually to support specific layout
        const container = new ContainerBuilder();
        container.setAccentColor(0x00FFFF);

        // Section 1: Members (with guild icon as thumbnail accessory)
        const membersSection = new SectionBuilder();

        if (guildIconURL) {
            membersSection.setThumbnailAccessory(new ThumbnailBuilder().setURL(guildIconURL));
        }

        // Add Title and Members count to the first section
        membersSection.addTextDisplayComponents(td => td.setContent(`# ${guild.name} Stats!`));
        membersSection.addTextDisplayComponents(td => td.setContent(`### <a:member:1366766051626582050>  Members: \`${guild.memberCount}\``));

        const membersButton = new ButtonBuilder()
            .setCustomId('stats_member_count')
            .setLabel(`${guild.memberCount}`)
            .setDisabled(true)
            .setStyle(ButtonStyle.Secondary);

        membersSection.setButtonAccessory(membersButton);

        container.addSectionComponents(membersSection);
        container.addSeparatorComponents(new SeparatorBuilder());

        // Section 2: Voice Stats (With Button Accessory)
        const voiceButton = new ButtonBuilder()
            .setCustomId('stats_voice_count')
            .setLabel(`${membersInVoice}`)
            .setDisabled(true)
            .setStyle(ButtonStyle.Secondary);

        const voiceSection = new SectionBuilder()
            .addTextDisplayComponents(td => td.setContent(`### <a:voice:1366765217761071134>  In Voice: \`${membersInVoice}\``));

        voiceSection.setButtonAccessory(voiceButton);

        container.addSectionComponents(voiceSection);
        container.addSeparatorComponents(new SeparatorBuilder());

        // Section 3: Boosts (With Button Accessory)
        const boostButton = new ButtonBuilder()
            .setCustomId('stats_boost_level')
            .setLabel(`Level: ${guild.premiumTier}`)
            .setDisabled(true)
            .setStyle(ButtonStyle.Secondary);

        const boostSection = new SectionBuilder()
            .addTextDisplayComponents(td => td.setContent(`### <a:boost:1366892421635375167>  Boosts: \`${boostCount}\``));

        boostSection.setButtonAccessory(boostButton);

        container.addSectionComponents(boostSection);

        await message.channel.send({
            components: [container],
            flags: MessageFlags.IsComponentsV2
        });
    },
};
