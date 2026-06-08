const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { MuteSetup } = require('../../db/models');
const UI = require('../../utils/ui');
const Emojis = require('../../utils/emojis');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setupmute')
        .setDescription('Setup the mute system for the server')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addRoleOption(option =>
            option.setName('muterole')
                .setDescription('Select the role to be given to muted users')
                .setRequired(true))
        .addChannelOption(option =>
            option.setName('logschannel')
                .setDescription('Select the channel where mute logs will be sent')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('staffroles')
                .setDescription('IDs of staff roles allowed to use mute (comma-separated)')
                .setRequired(true)),

    async execute(interaction) {
        try {
            await interaction.deferReply({ ephemeral: true });

            const muteRole = interaction.options.getRole('muterole');
            const logsChannel = interaction.options.getChannel('logschannel');
            const staffRolesInput = interaction.options.getString('staffroles');

            // Clean up staff roles input (remove spaces, duplicate characters, extract IDs)
            // This regex matches any sequence of digits, allowing users to input: "123, 456" OR "<@&123>, <@&456>"
            const staffRoles = (staffRolesInput.match(/\d{17,19}/g) || []);

            // Save to database
            await MuteSetup.upsert({
                guild_id: interaction.guild.id,
                mute_role_id: muteRole.id,
                mute_logs_channel: logsChannel.id,
                staff_roles: JSON.stringify(staffRoles)
            });

            const successEmbed = UI.createEmbed({
                type: 'success',
                title: 'Mute System Setup',
                description: [
                    `${Emojis.Anim.done} **Mute system has been successfully configured!**`,
                    '',
                    `**Mute Role:** ${muteRole}`,
                    `**Logs Channel:** ${logsChannel}`,
                    `**Staff Roles:** ${staffRoles.map(id => `<@&${id}>`).join(', ')}`
                ].join('\n'),
                footer: interaction.guild.name,
                thumbnail: interaction.guild.iconURL({ dynamic: true })
            });

            await interaction.editReply({ embeds: [successEmbed] });

            // Log to the newly set logs channel
            if (logsChannel) {
                const logEmbed = UI.createEmbed({
                    type: 'info',
                    title: 'Mute System Updated',
                    description: `Mute system configuration was updated by ${interaction.user}.`
                });
                await logsChannel.send({ embeds: [logEmbed] }).catch(() => { });
            }

        } catch (error) {
            console.error('Error in setupmute:', error);
            const errorOptions = {
                embeds: [UI.createEmbed({
                    type: 'error',
                    description: 'An error occurred while setting up the mute system.'
                })],
                ephemeral: true
            };
            if (interaction.deferred || interaction.replied) {
                await interaction.editReply(errorOptions).catch(() => { });
            } else {
                await interaction.reply(errorOptions).catch(() => { });
            }
        }
    },
};
