const { SlashCommandBuilder, PermissionFlagsBits, ChannelType, EmbedBuilder } = require('discord.js');
const { ApplySetup } = require('../../db/models');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setup-apply')
        .setDescription('Configure the application system')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addChannelOption(option =>
            option.setName('apply_channel')
                .setDescription('Channel where the apply panel will be sent')
                .addChannelTypes(ChannelType.GuildText)
                .setRequired(true))
        .addChannelOption(option =>
            option.setName('review_channel')
                .setDescription('Channel where applications will be sent for review')
                .addChannelTypes(ChannelType.GuildText)
                .setRequired(true))
        .addChannelOption(option =>
            option.setName('log_channel')
                .setDescription('Channel where application results will be logged')
                .addChannelTypes(ChannelType.GuildText)
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reviewer_role')
                .setDescription('Roles authorized to review applications (Mentions or IDs)')
                .setRequired(true))
        .addRoleOption(option =>
            option.setName('role_staff')
                .setDescription('Role to give for Staff Team approval')
                .setRequired(true))
        .addRoleOption(option =>
            option.setName('role_designer')
                .setDescription('Role to give for Designer approval')
                .setRequired(true))
        .addRoleOption(option =>
            option.setName('role_event')
                .setDescription('Role to give for Event Hoster approval')
                .setRequired(true))
        .addRoleOption(option =>
            option.setName('role_partnership')
                .setDescription('Role awarded for Partnership department')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('style')
                .setDescription('Select the visual style for the application panel')
                .addChoices(
                    { name: 'Classic Buttons', value: 'buttons' },
                    { name: 'Interactive Hub (Menu)', value: 'menu' }
                )
                .setRequired(true)),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        const applyChannel = interaction.options.getChannel('apply_channel');
        const staffChannel = interaction.options.getChannel('review_channel');
        const logChannel = interaction.options.getChannel('log_channel');
        const staffRolesRaw = interaction.options.getString('reviewer_role');
        const roleStaff = interaction.options.getRole('role_staff');
        const roleDesigner = interaction.options.getRole('role_designer');
        const roleEvent = interaction.options.getRole('role_event');
        const rolePartnership = interaction.options.getRole('role_partnership');
        const panelStyle = interaction.options.getString('style');

        // Parse staff roles (Mentions like <@&123> or Raw IDs)
        const staffRoleIds = staffRolesRaw.match(/\d+/g) || [];

        if (staffRoleIds.length === 0) {
            return interaction.editReply({ content: '<:no:1526496561188831244>Invalid staff roles. Please provide role mentions or IDs.' });
        }

        try {
            await ApplySetup.upsert({
                guild_id: interaction.guild.id,
                apply_channel_id: applyChannel.id,
                staff_channel_id: staffChannel.id,
                log_channel_id: logChannel.id,
                staff_role_id: staffRoleIds.join(','),
                role_staff_id: roleStaff.id,
                role_designer_id: roleDesigner.id,
                role_event_id: roleEvent.id,
                role_partnership_id: rolePartnership.id,
                panel_style: panelStyle
            });

            const embed = new EmbedBuilder()
                .setTitle('Apply System Configured')
                .setDescription('The application system has been updated with automatic role assignment.')
                .setColor('Green')
                .addFields(
                    { name: 'Channels', value: `» Apply: ${applyChannel}\n» Review: ${staffChannel}\n» Logs: ${logChannel}` },
                    { name: 'Reviewer Roles', value: staffRoleIds.map(id => `<@&${id}>`).join(', ') },
                    { name: 'Department Rewards', value: `» Staff: ${roleStaff}\n» Designer: ${roleDesigner}\n» Events: ${roleEvent}\n» Partnership: ${rolePartnership}` }
                )
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });
        } catch (error) {
            console.error('APPLY SETUP ERROR:', error);
            await interaction.editReply({ content: `<:no:1526496561188831244>Failed to save apply settings: ${error.message}` });
        }
    }
};
