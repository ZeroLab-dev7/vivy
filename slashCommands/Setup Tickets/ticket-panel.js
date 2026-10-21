const { SlashCommandBuilder, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, MediaGalleryBuilder, MediaGalleryItemBuilder } = require('discord.js');
const { TicketConfig } = require('../../db/models');
const UI = require('../../utils/ui');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ticket-panel')
        .setDescription('Send the customized ticket panel to the configured channel')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        const settings = await TicketConfig.findOne({ where: { guild_id: interaction.guild.id } });
        if (!settings || !settings.ticket_channel_id) {
            const errContainer = UI.createContainer({
                title: '<:no:1526496561188831244> Not Configured',
                description: 'Ticket system is not configured. Use `/setup-ticket` first.',
                color: 0xFF0000
            });
            return interaction.editReply({ components: [errContainer], flags: MessageFlags.IsComponentsV2 });
        }

        const channel = interaction.guild.channels.cache.get(settings.ticket_channel_id) ||
            await interaction.guild.channels.fetch(settings.ticket_channel_id).catch(() => null);

        if (!channel) {
            const errContainer = UI.createContainer({
                title: '<:no:1526496561188831244> Channel Not Found',
                description: 'Configured ticket channel not found or inaccessible.',
                color: 0xFF0000
            });
            return interaction.editReply({ components: [errContainer], flags: MessageFlags.IsComponentsV2 });
        }

        const title = settings.panel_title || `Support Tickets`;
        const description = settings.panel_description || `Click a button or select a category below to open a ticket.`;
        const style = settings.panel_style || 'menu';

        let options = [];
        if (settings.options) {
            try {
                options = typeof settings.options === 'string'
                    ? JSON.parse(settings.options)
                    : settings.options;
                if (typeof options === 'string') {
                    options = JSON.parse(options);
                }
            } catch { }
        }

        if (!Array.isArray(options) || options.length === 0) {
            options = [
                {
                    id: 'support',
                    label: 'General Support',
                    emoji: '✉️',
                    description: 'Need general assistance?',
                },
                {
                    id: 'billing',
                    label: 'Billing Query',
                    emoji: '💳',
                    description: 'Questions about payments?',
                }
            ];
        }

        let container = UI.createContainer({
            title: title,
            description: description,
            color: 0x0099ff,
        });

        const { SeparatorSpacingSize } = require('discord.js');

        const safeOptions = options.slice(0, 25);

        if (style === 'buttons') {
            safeOptions.forEach((opt, index) => {
                if (opt.is_separator || opt.type === 'separator') {
                    container.addSeparatorComponents(sep => sep.setSpacing(opt.spacing === 'large' ? SeparatorSpacingSize.Large : SeparatorSpacingSize.Small));
                    if (opt.label) {
                        container.addTextDisplayComponents(td => td.setContent(`**${opt.label}**`));
                    }
                } else {
                    container.addSeparatorComponents(sep => sep.setSpacing(SeparatorSpacingSize.Small));
                    container.addTextDisplayComponents(td => td.setContent(`• ${opt.emoji || ''} **${opt.label || 'Category'}** : \`${opt.description || ''}\``));
                }
            });

            const rows = [];
            let currentRow = new ActionRowBuilder();
            safeOptions.forEach((opt, index) => {
                if (opt.is_separator || opt.type === 'separator') return;
                if (currentRow.components.length >= 5) {
                    rows.push(currentRow);
                    currentRow = new ActionRowBuilder();
                }
                const optId = opt.id || `option_${index}`;
                const btn = new ButtonBuilder()
                    .setCustomId(`ticket_open_btn_${optId}`)
                    .setLabel((opt.label || 'Category').substring(0, 80))
                    .setStyle(ButtonStyle.Secondary);
                if (opt.emoji) {
                    try { btn.setEmoji(opt.emoji); } catch { }
                }
                currentRow.addComponents(btn);
            });
            if (currentRow.components.length > 0) {
                rows.push(currentRow);
            }

            container.addSeparatorComponents(sep => sep.setSpacing(SeparatorSpacingSize.Small));
            rows.forEach(r => container.addActionRowComponents(r));
        } else {
            const selectMenu = new StringSelectMenuBuilder()
                .setCustomId('ticket_open_select')
                .setPlaceholder('Select a ticket category to open...');

            safeOptions.forEach((opt, index) => {
                if (opt.is_separator || opt.type === 'separator') {
                    container.addSeparatorComponents(sep => sep.setSpacing(opt.spacing === 'large' ? SeparatorSpacingSize.Large : SeparatorSpacingSize.Small));
                    if (opt.label) {
                        container.addTextDisplayComponents(td => td.setContent(`**${opt.label}**`));
                    }
                    const dividerLabel = opt.label ? `─── ${opt.label} ───` : '────────────────────';
                    const option = new StringSelectMenuOptionBuilder()
                        .setLabel(dividerLabel.substring(0, 100))
                        .setDescription('Divider line')
                        .setValue(`separator_${index}`);
                    selectMenu.addOptions(option);
                } else {
                    const optId = opt.id || `option_${index}`;
                    const option = new StringSelectMenuOptionBuilder()
                        .setLabel((opt.label || 'Category').substring(0, 100))
                        .setDescription((opt.description || '').substring(0, 100))
                        .setValue(optId);
                    if (opt.emoji) {
                        try { option.setEmoji(opt.emoji); } catch { }
                    }
                    selectMenu.addOptions(option);
                }
            });

            container.addSeparatorComponents(sep => sep.setSpacing(SeparatorSpacingSize.Small));
            container.addActionRowComponents(row => row.addComponents(selectMenu));
        }

        if (settings.banner_url) {
            const gallery = new MediaGalleryBuilder();
            gallery.addItems(new MediaGalleryItemBuilder().setURL(settings.banner_url));
            container.addMediaGalleryComponents(gallery);
        }

        container.addSeparatorComponents(sep => sep.setSpacing(SeparatorSpacingSize.Small));
        container.addTextDisplayComponents(td => td.setContent(`-# Forge Studio • Support Ticket System`));

        try {
            await channel.send({
                components: [container],
                flags: MessageFlags.IsComponentsV2
            });
            const successContainer = UI.createContainer({
                title: '✅ Panel Dispatched',
                description: `Ticket panel (${style}) sent to ${channel}.`,
                color: 0x00FF00
            });
            await interaction.editReply({ components: [successContainer], flags: MessageFlags.IsComponentsV2 });
        } catch (error) {
            console.error(error);
            const errContainer = UI.createContainer({
                title: '<:no:1526496561188831244> Dispatch Failed',
                description: 'Failed to send ticket panel to configured channel.',
                color: 0xFF0000
            });
            await interaction.editReply({ components: [errContainer], flags: MessageFlags.IsComponentsV2 });
        }
    }
};
