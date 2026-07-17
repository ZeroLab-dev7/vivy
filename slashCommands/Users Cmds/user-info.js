const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const UI = require('../../utils/ui');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('user')
        .setDescription('Get detailed information about a user.')
        .addUserOption(option =>
            option.setName('target')
                .setDescription('The user to get information about')
                .setRequired(false)),

    async execute(interaction) {
        try {
            await interaction.deferReply();

            const targetUser = interaction.options.getUser('target') || interaction.user;
            const member = await interaction.guild.members.fetch(targetUser.id).catch(() => null);

            if (!member) {
                const errorContainer = UI.createContainer({
                    description: '- <a:warn:1365688576758644797> This user is not in the server.'
                });
                await interaction.editReply({
                    components: [errorContainer],
                    flags: MessageFlags.IsComponentsV2
                });
                return;
            }

            const joinedAt = member.joinedAt;
            const timeJoined = `<t:${Math.floor(joinedAt.getTime() / 1000)}:R>`;
            const createdAt = targetUser.createdAt;
            const timeCreated = `<t:${Math.floor(createdAt.getTime() / 1000)}:R>`;
            const highestRole = member.roles.highest;
            const highestRoleName = highestRole ? highestRole.toString() : 'No Role';
            const nickname = member.nickname || `\`No Nickname\``;

            // Get all roles
            const roles = member.roles.cache
                .filter(role => role.id !== interaction.guild.id) // Exclude @everyone
                .map(role => role.toString())
                .join(', ');

            const rolesDisplay = roles.length > 0 ? roles : 'No Roles';

            const container = UI.createContainer({
                title: `${targetUser.username}'s Information`,
                description: ` <a:info:1366763944177434626> User information for \`${targetUser.username}\``,
                fields: [
                    { name: '<a:info:1366763944177434626>・Info General', value: `**Username**: ${targetUser.username} / <@${targetUser.id}>\n**Nickname**: ${nickname}\n**ID**: \`${targetUser.id}\`\n**Account Created**: ${timeCreated}`, inline: false },
                    { name: '<a:info:1366763944177434626>・Basic Server Info', value: `**Joined Server**: ${timeJoined}\n**Highest Role**: ${highestRoleName}`, inline: false },
                    { name: '<a:info:1366763944177434626>・Roles', value: rolesDisplay, inline: false }
                ],
            });

            await interaction.editReply({
                components: [container],
                flags: MessageFlags.IsComponentsV2
            });

        } catch (error) {
            console.error("Error in user info command:", error);
            const errorContainer = UI.createContainer({
                description: "- <a:warn:1365688576758644797> An error occurred while fetching user information.",
                color: 0xff0000
            });

            await interaction.editReply({
                components: [errorContainer],
                flags: MessageFlags.IsComponentsV2
            });
        }
    },
};
