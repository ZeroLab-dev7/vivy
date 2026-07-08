const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('roleinfo')
        .setDescription('Get information about a specific role, including permissions.')
        .addRoleOption(option =>
            option.setName('role')
                .setDescription('Select the role you want information about')
                .setRequired(true)
        ),
        
    async execute(interaction) {
        const role = interaction.options.getRole('role');

        if (!role) {
            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor('#ff0000')
                        .setDescription('- <:false:1365517000750661693> Role not found.')
                ],
                ephemeral: true
            });
        }

        // Extract permissions
        const permissions = role.permissions.toArray();
        const importantPermissions = [
            'Administrator', 'ManageChannels', 'ManageRoles', 'ManageGuild', 
            'KickMembers', 'BanMembers', 'MentionEveryone', 'ManageMessages', 
            'ViewAuditLog', 'ManageWebhooks'
        ];

        const filteredPermissions = permissions
            .filter(perm => importantPermissions.includes(perm))
            .map(perm => ` ${perm.replace(/([A-Z])/g, ' $1').trim()}`)
            .join('\n') || '<:false:1365517000750661693> No important permissions';

        // Role Information
        const roleEmbed = new EmbedBuilder()
            .setColor(role.color || '#00f5ff')
            .setAuthor({ name: 'Command : Role Info', iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
            .setDescription(` **Role Information:** ${role.name}`)
            .addFields(
                { name: " Role ID", value: `\`${role.id}\``, inline: false },
                { name: " Created At", value: `<t:${Math.floor(role.createdTimestamp / 1000)}:F>`, inline: false },
                { name: " Members", value: `${role.members.size} users`, inline: false },
                { name: " Role Permissions", value: filteredPermissions, inline: false }
            );

        return interaction.reply({ embeds: [roleEmbed] });
    },
};
