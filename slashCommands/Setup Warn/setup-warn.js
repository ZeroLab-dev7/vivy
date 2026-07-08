const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const WarnSetup = require('../../db/models/WarnSetup');
const UI = require('../../utils/ui');
const Emojis = require('../../utils/emojis');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setup_warn')
        .setDescription('Setup the warning system')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addStringOption(option =>
            option.setName('warn_staff')
                .setDescription('Select the roles for members who can issue warnings (Mentions or IDs)')
                .setRequired(true))
        .addRoleOption(option =>
            option.setName('role1')
                .setDescription('Select the role for the first warning')
                .setRequired(true))
        .addRoleOption(option =>
            option.setName('role2')
                .setDescription('Select the role for the second warning')
                .setRequired(true))
        .addRoleOption(option =>
            option.setName('role3')
                .setDescription('Select the role for the last warning')
                .setRequired(true))
        .addChannelOption(option =>
            option.setName('warning_logs')
                .setDescription('Select the warning logs channel')
                .setRequired(true)),

    async execute(interaction) {
        try {
            await interaction.deferReply({ ephemeral: true });

            const guild = interaction.guild;
            const warnerRolesInput = interaction.options.getString('warn_staff');
            const warnerRoleIds = warnerRolesInput.match(/\d{17,19}/g) || [];

            if (warnerRoleIds.length === 0) {
                return interaction.editReply({
                    content: '❌ Please provide valid roles or role IDs for warner roles.',
                    ephemeral: true
                });
            }

            const roles = {
                warn_first: interaction.options.getRole('role1').id,
                warn_second: interaction.options.getRole('role2').id,
                warn_last: interaction.options.getRole('role3').id,
                warner_role: JSON.stringify(warnerRoleIds),
                warning_logs: interaction.options.getChannel('warning_logs').id,
            };

            // Store configuration using Sequelize Model directly
            await WarnSetup.upsert({
                guild_id: guild.id,
                ...roles
            });

            // Confirmation Embed V2
            const embed = UI.createEmbed({
                type: 'success',
                title: 'Warning System Setup',
                description: `
${Emojis.Anim.done} **Successfully configured warning system!**

**Roles Configuration:**
- First Warning Role: <@&${roles.warn_first}>
- Second Warning Role: <@&${roles.warn_second}>
- Last Warning Role: <@&${roles.warn_last}>
- Warner Roles: ${warnerRoleIds.map(id => `<@&${id}>`).join(', ')}

**Logs Configuration:**
- Warning Logs: <#${roles.warning_logs}>
                `,
                footer: guild.name,
                thumbnail: guild.iconURL({ dynamic: true })
            });

            // Log Action V2
            const logChannel = interaction.guild.channels.cache.get(roles.warning_logs);
            if (logChannel) {
                const logEmbed = UI.createEmbed({
                    type: 'info',
                    title: 'Warning System Updated',
                    description: `
**Updated by:** ${interaction.user}
**Action:** Setup Warning System

**New Configuration:**
- First Warning Role: <@&${roles.warn_first}>
- Second Warning Role: <@&${roles.warn_second}>
- Last Warning Role: <@&${roles.warn_last}>
- Warner Roles: ${warnerRoleIds.map(id => `<@&${id}>`).join(', ')}`
                });

                await logChannel.send({ embeds: [logEmbed] });
            }

            await interaction.editReply({
                embeds: [embed],
                ephemeral: true,
            });

        } catch (error) {
            console.error('Setup Warning Error:', error);

            const errorEmbed = UI.createEmbed({
                type: 'error',
                description: `- ${Emojis.Anim.warn} An error occurred while setting up the warning system.Please check the roles and channel permissions and try again.`
            });

            const errorOptions = { embeds: [errorEmbed], ephemeral: true };
            if (interaction.deferred || interaction.replied) {
                await interaction.editReply(errorOptions).catch(() => { });
            } else {
                await interaction.reply(errorOptions).catch(() => { });
            }
        }
    },
};
