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
            return interaction.editReply({ content: '<:no:1526496561188831244>Apply system is not configured. Use `/setup-apply` first.' });
        }

        const channel = interaction.guild.channels.cache.get(settings.apply_channel_id) ||
            await interaction.guild.channels.fetch(settings.apply_channel_id).catch(() => null);

        if (!channel) {
            return interaction.editReply({ content: '<:no:1526496561188831244>Configured apply channel not found or inaccessible.' });
        }

        const { SeparatorSpacingSize, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, MediaGalleryBuilder, MediaGalleryItemBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

        // Resolve custom panel strings and departments
        const title = settings.panel_title || `${interaction.guild.name} • Staff Applications`;
        const description = settings.panel_description ||
            `め 」 **Take your application test, Our team is waiting for you!**\n` +
            `• **We're looking for active and dedicated members to join our team and help our community grow!**`;
        const style = settings.panel_style || 'menu';

        let departments = [];
        if (settings.departments) {
            try {
                departments = typeof settings.departments === 'string'
                    ? JSON.parse(settings.departments)
                    : settings.departments;
                if (typeof departments === 'string') {
                    departments = JSON.parse(departments);
                }
            } catch { }
        }

        // If no custom departments are configured, use legacy/default 4 departments
        if (!Array.isArray(departments) || departments.length === 0) {
            departments = [
                {
                    key: 'staff',
                    label: 'Staff',
                    emoji: '<:staff:1369870831383220225>',
                    description: 'Moderate and assist members',
                    role_id: settings.role_staff_id,
                },
                {
                    key: 'designer',
                    label: 'Designer',
                    emoji: '<:designer:1492427141374152714>',
                    description: 'Create visuals & graphics',
                    role_id: settings.role_designer_id,
                },
                {
                    key: 'event',
                    label: 'Events',
                    emoji: '<:event:1492427991429677167>',
                    description: 'Organize fun community events',
                    role_id: settings.role_event_id,
                },
                {
                    key: 'partnership',
                    label: 'Partners',
                    emoji: '<:partner:1492427938950545498>',
                    description: 'Build server relationships',
                    role_id: settings.role_partnership_id,
                }
            ];
        }

        let container;

        if (style === 'buttons') {
            container = UI.createContainer({
                title: title,
                description: description,
                color: 0x0099ff,
            });

            const safeDepts = departments.slice(0, 25);

            // Add detailed sections with separators
            safeDepts.forEach((dept, index) => {
                if (dept.is_separator || dept.type === 'separator') {
                    container.addSeparatorComponents(sep => sep.setSpacing(dept.spacing === 'large' ? SeparatorSpacingSize.Large : SeparatorSpacingSize.Small));
                    if (dept.label) {
                        container.addTextDisplayComponents(td => td.setContent(`**${dept.label}**`));
                    }
                } else {
                    container.addSeparatorComponents(sep => sep.setSpacing(SeparatorSpacingSize.Small));
                    container.addTextDisplayComponents(td => td.setContent(`• ${dept.emoji || ''} **${dept.label || 'Department'}** : \`${dept.description || ''}\``));
                }
            });

            // Add action rows for buttons (split every 5 buttons)
            const rows = [];
            let currentRow = new ActionRowBuilder();
            safeDepts.forEach((dept, index) => {
                if (dept.is_separator || dept.type === 'separator') return;
                if (currentRow.components.length >= 5) {
                    rows.push(currentRow);
                    currentRow = new ActionRowBuilder();
                }
                const btnId = dept.key ? `apply_${dept.key}` : `apply_dept_${index}`;
                const btn = new ButtonBuilder()
                    .setCustomId(btnId)
                    .setLabel((dept.label || 'Department').substring(0, 80))
                    .setStyle(ButtonStyle.Secondary);
                if (dept.emoji) {
                    try { btn.setEmoji(dept.emoji); } catch { }
                }
                currentRow.addComponents(btn);
            });
            if (currentRow.components.length > 0) {
                rows.push(currentRow);
            }

            container.addSeparatorComponents(sep => sep.setSpacing(SeparatorSpacingSize.Small));
            rows.forEach(r => container.addActionRowComponents(r));
        } else {
            // Interactive Hub Layout
            container = UI.createContainer({
                title: title,
                description: description,
                color: 0x0099ff,
            });

            const selectMenu = new StringSelectMenuBuilder()
                .setCustomId('apply_hub_dept_select')
                .setPlaceholder('Select a department to view info...');

            const safeDepts = departments.slice(0, 25);
            safeDepts.forEach((dept, index) => {
                if (dept.is_separator || dept.type === 'separator') {
                    container.addSeparatorComponents(sep => sep.setSpacing(dept.spacing === 'large' ? SeparatorSpacingSize.Large : SeparatorSpacingSize.Small));
                    if (dept.label) {
                        container.addTextDisplayComponents(td => td.setContent(`**${dept.label}**`));
                    }
                    const dividerLabel = dept.label ? `─── ${dept.label} ───` : '────────────────────';
                    const option = new StringSelectMenuOptionBuilder()
                        .setLabel(dividerLabel.substring(0, 100))
                        .setDescription('Divider line')
                        .setValue(`separator_${index}`);
                    selectMenu.addOptions(option);
                } else {
                    const optVal = dept.key ? dept.key : `dept_${index}`;
                    const option = new StringSelectMenuOptionBuilder()
                        .setLabel((dept.label || 'Department').substring(0, 100))
                        .setDescription((dept.description || '').substring(0, 100))
                        .setValue(optVal);
                    if (dept.emoji) {
                        try { option.setEmoji(dept.emoji); } catch { }
                    }
                    selectMenu.addOptions(option);
                }
            });

            container.addSeparatorComponents(sep => sep.setSpacing(SeparatorSpacingSize.Small));
            container.addActionRowComponents(row => row.addComponents(selectMenu));
        }

        // Add branding image (bottom of container)
        const bannerUrl = settings.banner_url || "https://media.discordapp.net/attachments/1329547343791525989/1492418340013084742/image.png?ex=69db4264&is=69d9f0e4&hm=89a4bc524d917dafd8b093478eb186879ad2dd27be947e6b2c0bd14f944ea008&=&format=webp&quality=lossless";
        const gallery = new MediaGalleryBuilder();
        gallery.addItems(new MediaGalleryItemBuilder().setURL(bannerUrl));
        container.addMediaGalleryComponents(gallery);

        // Footer LAST
        container.addSeparatorComponents(sep => sep.setSpacing(SeparatorSpacingSize.Small));
        container.addTextDisplayComponents(td => td.setContent(`-# Forge Studio • Staff Recruitment`));

        try {
            await channel.send({
                components: [container],
                flags: MessageFlags.IsComponentsV2
            });
            await interaction.editReply({ content: `✅ Application panel (${style}) sent to ${channel}.` });
        } catch (error) {
            console.error(error);
            await interaction.editReply({ content: '<:no:1526496561188831244>Failed to send application panel.' });
        }
    }
};
