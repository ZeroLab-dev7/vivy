const { MessageFlags } = require('discord.js');
const UI = require('../../utils/ui');

module.exports = {
    name: 'roleinfo',
    aliases: ['rinfo', 'role-info'],
    description: 'Get information about a specific role, including permissions',
    async execute(message, args) {
        if (args.length < 1) {
            const guideContainer = UI.createContainer({
                title: 'Command : RoleInfo',
                description: 'Retrieve details about a specific role,\n including permissions.',
                footer: `Requested by ${message.author.tag}`,
                fields: [
                    { name: "Aliases:", value: "- rinfo, role-info" },
                    { name: "Usage:", value: "- &roleinfo @role/id" },
                    { name: "Examples:", value: `- &roleinfo @Role\n- &roleinfo 123456789012345678` }
                ]
            });
            return message.reply({
                components: [guideContainer],
                flags: MessageFlags.IsComponentsV2
            });
        }

        const roleInput = args[0];
        let role;

        if (/^\d+$/.test(roleInput)) {
            // If the input is a role ID
            role = message.guild.roles.cache.get(roleInput);
        } else if (message.mentions.roles.size > 0) {
            // If it's a role mention
            role = message.mentions.roles.first();
        } else {
            // If it's a role name
            role = message.guild.roles.cache.find(r => r.name.toLowerCase() === roleInput.toLowerCase());
        }

        if (!role) {
            const errorContainer = UI.createContainer({
                description: '- <:false:1365517000750661693> Role not found.'
            });
            return message.reply({
                components: [errorContainer],
                flags: MessageFlags.IsComponentsV2
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
            .join('\n') || ' No important permissions';

        // Role Information
        const roleContainer = UI.createContainer({
            title: 'Command : Role Info',
            description: `Role Information: **${role.name}**`,
            footer: `Requested by ${message.author.tag}`,
            fields: [
                { name: " Role ID", value: `\`${role.id}\`` },
                { name: " Created At", value: `<t:${Math.floor(role.createdTimestamp / 1000)}:F>` },
                { name: " Members", value: `${role.members.size} users` },
                { name: " Role Permissions", value: filteredPermissions }
            ]
        });

        return message.reply({
            components: [roleContainer],
            flags: MessageFlags.IsComponentsV2
        });
    },
};
