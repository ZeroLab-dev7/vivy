const { SlashCommandBuilder, PermissionFlagsBits, ChannelType, MessageFlags } = require('discord.js');
const { TicketConfig } = require('../../db/models');
const UI = require('../../utils/ui');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setup-ticket')
        .setDescription('Configure the support ticket system')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addChannelOption(option =>
            option.setName('ticket_channel')
                .setDescription('Channel where the ticket panel will be sent')
                .addChannelTypes(ChannelType.GuildText)
                .setRequired(true))
        .addChannelOption(option =>
            option.setName('category')
                .setDescription('Discord Category where new ticket channels will be created')
                .addChannelTypes(ChannelType.GuildCategory)
                .setRequired(true))
        .addStringOption(option =>
            option.setName('staff_roles')
                .setDescription('Authorized staff roles allowed to manage tickets (Mentions or IDs)')
                .setRequired(true))
        .addChannelOption(option =>
            option.setName('logs_channel')
                .setDescription('Channel where closed ticket transcripts will be sent')
                .addChannelTypes(ChannelType.GuildText)
                .setRequired(false))
        .addStringOption(option =>
            option.setName('style')
                .setDescription('Select the visual style for the ticket panel')
                .addChoices(
                    { name: 'Classic Buttons', value: 'buttons' },
                    { name: 'Interactive Dropdown Menu', value: 'menu' }
                )
                .setRequired(false))
        .addBooleanOption(option =>
            option.setName('claim_enabled')
                .setDescription('Enable staff ticket claiming')
                .setRequired(false))
        .addBooleanOption(option =>
            option.setName('transcript_enabled')
                .setDescription('Enable saving transcripts on close')
                .setRequired(false)),

    async execute(interaction) {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        const ticketChannel = interaction.options.getChannel('ticket_channel');
        const category = interaction.options.getChannel('category');
        const staffRolesRaw = interaction.options.getString('staff_roles');
        const logsChannel = interaction.options.getChannel('logs_channel');
        const panelStyle = interaction.options.getString('style') || 'menu';
        const claimEnabled = interaction.options.getBoolean('claim_enabled') !== null ? interaction.options.getBoolean('claim_enabled') : true;
        const transcriptEnabled = interaction.options.getBoolean('transcript_enabled') !== null ? interaction.options.getBoolean('transcript_enabled') : true;

        const staffRoleIds = staffRolesRaw.match(/\d+/g) || [];
        if (staffRoleIds.length === 0) {
            const errContainer = UI.createContainer({
                title: '<:no:1526496561188831244> Invalid Roles',
                description: 'Invalid staff roles. Please provide role mentions or IDs.',
                color: 0xFF0000
            });
            return interaction.editReply({ components: [errContainer], flags: MessageFlags.IsComponentsV2 });
        }

        try {
            let config = await TicketConfig.findByPk(interaction.guild.id);
            if (!config) {
                config = await TicketConfig.create({
                    guild_id: interaction.guild.id,
                    options: '[]',
                    panel_title: 'Create a Support Ticket',
                    panel_description: 'Need help? Choose a category below to open a support ticket.'
                });
            }

            config.is_enabled = true;
            config.ticket_channel_id = ticketChannel.id;
            config.category_id = category.id;
            config.staff_roles = JSON.stringify(staffRoleIds);
            config.logs_channel_id = logsChannel ? logsChannel.id : null;
            config.panel_style = panelStyle;
            config.claim_enabled = claimEnabled;
            config.transcript_enabled = transcriptEnabled;

            await config.save();

            const container = UI.createContainer({
                title: 'Ticket System Configured',
                description: 'The support ticket configuration has been saved successfully.',
                color: 0x00FF00,
                fields: [
                    { name: 'Panel Channel', value: `${ticketChannel}` },
                    { name: 'Target Category', value: `${category}` },
                    { name: 'Logs Channel', value: logsChannel ? `${logsChannel}` : 'None' },
                    { name: 'Staff Roles', value: staffRoleIds.map(id => `<@&${id}>`).join(', ') || 'None' },
                    { name: 'Settings', value: `» Claim: \`${claimEnabled}\`\n» Transcripts: \`${transcriptEnabled}\`\n» Style: \`${panelStyle}\`` }
                ]
            });

            await interaction.editReply({ components: [container], flags: MessageFlags.IsComponentsV2 });
        } catch (error) {
            console.error('TICKET SETUP ERROR:', error);
            const errContainer = UI.createContainer({
                title: '<:no:1526496561188831244> Error',
                description: 'An error occurred while configuring the ticket system.',
                color: 0xFF0000
            });
            await interaction.editReply({ components: [errContainer], flags: MessageFlags.IsComponentsV2 });
        }
    }
};
