const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, Colors } = require('discord.js');
const VerificationRoles = require('../../db/models/VerificationRoles');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setup_verification')
        .setDescription('Setup the verification system')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addRoleOption(option =>
            option.setName('verificator_role')
                .setDescription('Select the verificator role')
                .setRequired(true))
        .addRoleOption(option =>
            option.setName('unverified_role')
                .setDescription('Select the unverified role')
                .setRequired(true))
        .addRoleOption(option =>
            option.setName('verified_role')
                .setDescription('Select the verified role')
                .setRequired(true))
        .addRoleOption(option =>
            option.setName('verified_female_role')
                .setDescription('Select the verified female role')
                .setRequired(true))
        .addChannelOption(option =>
            option.setName('verification_logs')
                .setDescription('Select the verification logs channel')
                .setRequired(true)),

    async execute(interaction) {
        try {
            await interaction.deferReply({ ephemeral: true });

            const guild = interaction.guild;
            const roles = {
                guild_id: guild.id,
                verificator_role: interaction.options.getRole('verificator_role').id,
                unverified_role: interaction.options.getRole('unverified_role').id,
                verified_role: interaction.options.getRole('verified_role').id,
                verified_female_role: interaction.options.getRole('verified_female_role').id,
                verification_logs: interaction.options.getChannel('verification_logs').id
            };

            await VerificationRoles.upsert(roles);

            const embed = new EmbedBuilder()
                .setColor(Colors.Blue) // Fixed color issue
                .setTitle('Verification System Setup')
                .setDescription(`
<a:done:1365447294819762266> **Successfully configured verification system!**

**Roles Configuration:**
- Verificator Role: <@&${roles.verificator_role}>
- Unverified Role: <@&${roles.unverified_role}>
- Verified Role: <@&${roles.verified_role}>
- Verified Female: <@&${roles.verified_female_role}>

**Logs Configuration:**
- Verification Logs: <#${roles.verification_logs}>`)
                .setTimestamp()
                .setFooter({
                    text: guild.name,
                    iconURL: guild.iconURL({ dynamic: true })
                });

            const logChannel = interaction.guild.channels.cache.get(roles.verification_logs);
            if (logChannel) {
                const logEmbed = new EmbedBuilder()
                    .setColor(Colors.Blue)
                    .setDescription(`
**Updated by:** ${interaction.user}
**Action:** Setup Verification System

**New Configuration:**
- Verificator Role: <@&${roles.verificator_role}>
- Unverified Role: <@&${roles.unverified_role}>
- Verified Role: <@&${roles.verified_role}>
- Verified Female: <@&${roles.verified_female_role}>`)
                    .setTimestamp();

                await logChannel.send({ embeds: [logEmbed] });
            }

            await interaction.editReply({
                embeds: [embed],
                ephemeral: true
            });
        } catch (error) {
            console.error('Setup Verification Error:', error);

            const errorEmbed = new EmbedBuilder()
                .setColor(Colors.Yellow)
                .setDescription('<a:warn:1365688576758644797> An error occurred while setting up the verification system. Please check the roles and channel permissions and try again.')
                .setTimestamp();

            const errorOptions = { embeds: [errorEmbed], ephemeral: true };
            if (interaction.deferred || interaction.replied) {
                await interaction.editReply(errorOptions).catch(() => { });
            } else {
                await interaction.reply(errorOptions).catch(() => { });
            }
        }
    }
};