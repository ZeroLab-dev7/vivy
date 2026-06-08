const { SlashCommandBuilder, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags } = require('discord.js');
const { ApplySetup } = require('../../db/models');
const UI = require('../../utils/ui');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('apply-panel')
        .setDescription('Send the application panel to the configured channel')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        const settings = await ApplySetup.findOne({ where: { guild_id: interaction.guild.id } });

        if (!settings || !settings.apply_channel_id) {
            return interaction.editReply({ content: '❌ Apply system is not configured. Use `/setup-apply` first.' });
        }

        const channel = interaction.guild.channels.cache.get(settings.apply_channel_id) ||
            await interaction.guild.channels.fetch(settings.apply_channel_id).catch(() => null);

        if (!channel) {
            return interaction.editReply({ content: '❌ Configured apply channel not found or inaccessible.' });
        }

        const { SeparatorBuilder, SeparatorSpacingSize, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, MediaGalleryBuilder, MediaGalleryItemBuilder } = require('discord.js');

        const style = settings.panel_style || 'menu';
        let container;

        if (style === 'buttons') {
            container = UI.createContainer({
                title: `${interaction.guild.name} • Staff Applications`,
                description:
                    `め 」 **Take your application test, Our team is waiting for you!**\n` +
                    `• **We're looking for active and dedicated members to join our team and help our community grow!**`,
                color: 0x0099ff, // Blue color
            });

            // Add detailed sections with separators
            container.addSeparatorComponents(sep => sep.setSpacing(SeparatorSpacingSize.Small));
            container.addTextDisplayComponents(td => td.setContent(`• <:staff:1369870831383220225> **Staff Team** : \`Moderate and assist members\``));
            container.addSeparatorComponents(sep => sep.setSpacing(SeparatorSpacingSize.Small));
            container.addTextDisplayComponents(td => td.setContent(`• <:designer:1492427141374152714> **Designer** : \`Create visuals & graphics\``));
            container.addSeparatorComponents(sep => sep.setSpacing(SeparatorSpacingSize.Small));
            container.addTextDisplayComponents(td => td.setContent(`• <:event:1492427991429677167> **Event Hoster** : \`Organize fun community events\``));
            container.addSeparatorComponents(sep => sep.setSpacing(SeparatorSpacingSize.Small));
            container.addTextDisplayComponents(td => td.setContent(`• <:partner:1492427938950545498> **Partnership** : \`Build server relationships\``));

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('apply_staff').setLabel('Staff').setStyle(ButtonStyle.Secondary).setEmoji('<:staff:1369870831383220225>'),
                new ButtonBuilder().setCustomId('apply_designer').setLabel('Designer').setStyle(ButtonStyle.Secondary).setEmoji('<:designer:1492427141374152714>'),
                new ButtonBuilder().setCustomId('apply_event').setLabel('Events').setStyle(ButtonStyle.Secondary).setEmoji('<:event:1492427991429677167>'),
                new ButtonBuilder().setCustomId('apply_partnership').setLabel('Partners').setStyle(ButtonStyle.Secondary).setEmoji('<:partner:1492427938950545498>')
            );

            container.addSeparatorComponents(sep => sep.setSpacing(SeparatorSpacingSize.Small));
            container.addActionRowComponents(row);
        } else {
            // Interactive Hub Layout
            container = UI.createContainer({
                title: `${interaction.guild.name} • Recruitment Hub`,
                description:
                    `め 」 **Welcome to our official Staff Recruitment Hub!**\n\n` +
                    `We are always looking for passionate individuals to help **Zero Lab** reach new heights. ` +
                    `Select a department below to view its specific requirements and start your journey with us.`,
                color: 0x0099ff, // Blue color
            });

            const selectMenu = new StringSelectMenuBuilder()
                .setCustomId('apply_hub_dept_select')
                .setPlaceholder('Select a department to view info...')
                .addOptions(
                    new StringSelectMenuOptionBuilder().setLabel('Staff Team').setDescription('Moderate and assist the community').setEmoji('<:staff:1369870831383220225>').setValue('staff'),
                    new StringSelectMenuOptionBuilder().setLabel('Designer').setDescription('Create visuals and branding').setEmoji('<:designer:1492427141374152714>').setValue('designer'),
                    new StringSelectMenuOptionBuilder().setLabel('Event Hoster').setDescription('Organize and host fun events').setEmoji('<:event:1492427991429677167>').setValue('event'),
                    new StringSelectMenuOptionBuilder().setLabel('Partnership').setDescription('Manage server relationships').setEmoji('<:partner:1492427938950545498>').setValue('partnership')
                );

            container.addSeparatorComponents(sep => sep.setSpacing(SeparatorSpacingSize.Small));
            container.addActionRowComponents(row => row.addComponents(selectMenu));
        }

        // Add branding image (bottom of container)
        const gallery = new MediaGalleryBuilder();
        gallery.addItems(new MediaGalleryItemBuilder().setURL("https://media.discordapp.net/attachments/1329547343791525989/1492418340013084742/image.png?ex=69db4264&is=69d9f0e4&hm=89a4bc524d917dafd8b093478eb186879ad2dd27be947e6b2c0bd14f944ea008&=&format=webp&quality=lossless"));
        container.addMediaGalleryComponents(gallery);

        // Footer LAST
        container.addSeparatorComponents(sep => sep.setSpacing(SeparatorSpacingSize.Small));
        container.addTextDisplayComponents(td => td.setContent(`-# Powered by Zero Lab #LoadingToFuture • Staff Recruitment`));

        try {
            await channel.send({
                components: [container],
                flags: MessageFlags.IsComponentsV2
            });
            await interaction.editReply({ content: `✅ Application panel (${style}) sent to ${channel}.` });
        } catch (error) {
            console.error(error);
            await interaction.editReply({ content: '❌ Failed to send application panel.' });
        }
    }
};
