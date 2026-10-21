const { PermissionsBitField, MessageFlags } = require('discord.js');
const UI = require('../../utils/ui');

const COOLDOWN_TIME = 5000; // 5 seconds cooldown
const cooldowns = new Map();

module.exports = {
    name: 'crole',
    description: 'Create a new role in the server.',
    aliases: ['newrole', 'rolecreate'],
    async execute(message, args) {
        // Check if the user is on cooldown
        if (cooldowns.has(message.author.id)) {
            return message.react('⏳'); // React with a cooldown emoji
        }

        // Set cooldown for the user
        cooldowns.set(message.author.id, Date.now() + COOLDOWN_TIME);
        setTimeout(() => cooldowns.delete(message.author.id), COOLDOWN_TIME);

        // Check if the user has Manage Roles permission
        // Check if the user has Manage Roles permission
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
            return message.reply({
                components: [UI.createContainer({
                    description: "- You need the `Manage Roles` permission to use this command."
                })],
                flags: MessageFlags.IsComponentsV2
            });
        }

        // Check if a role name is provided
        if (!args[0]) {
            const guideContainer = UI.createContainer({
                title: 'Command : crole',
                description: "Create a new role in the server.",
                fields: [
                    { name: "Aliases:", value: "- newrole, rolecreate" },
                    { name: "Usage:", value: "- ?crole <roleName>" },
                    { name: "Examples:", value: "- ?crole <rolename>\n- ?crole Forge Studio" }
                ]
            });

            return message.reply({
                components: [guideContainer],
                flags: MessageFlags.IsComponentsV2
            });
        }

        const roleName = args.join(' '); // Combine all arguments to form the role name

        try {
            // Create the role with the specified name
            const role = await message.guild.roles.create({
                name: roleName,
                reason: `Role created by ${message.author.tag}`,
            });

            // Success embed
            const successContainer = UI.createContainer({
                description: `-  Successfully created role **${role.name}**.`
            });

            return message.reply({
                components: [successContainer],
                flags: MessageFlags.IsComponentsV2
            });

        } catch (error) {
            console.error(error);
            let errorMessage = "- Failed to create the role.";
            if (error.code === 50013) {
                errorMessage += " The bot needs `Manage Roles` permission.";
            }

            return message.reply({
                components: [UI.createContainer({
                    description: errorMessage
                })],
                flags: MessageFlags.IsComponentsV2
            });
        }
    }
};
