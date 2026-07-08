const { PermissionsBitField, MessageFlags } = require('discord.js');
const UI = require('../../utils/ui');

const COOLDOWN_TIME = 5000; // 5 seconds cooldown
const cooldowns = new Map();

module.exports = {
    name: 'inrole',
    description: 'List all members with a specific role.',
    aliases: ['rolelist', 'membersinrole'], // Aliases
    async execute(message, args) {
        // Check if the user is on cooldown
        if (cooldowns.has(message.author.id)) {
            return message.react('⏳'); // React with a cooldown emoji
        }

        // Set cooldown for the user
        cooldowns.set(message.author.id, Date.now() + COOLDOWN_TIME);
        setTimeout(() => cooldowns.delete(message.author.id), COOLDOWN_TIME);

        // Check permissions
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
            const errorContainer = UI.createContainer({
                description: ' - You need the `Manage Roles` permission to use this command.'
            });
            return message.reply({
                components: [errorContainer],
                flags: MessageFlags.IsComponentsV2
            });
        }

        // Find the role
        const role = message.mentions.roles.first() || message.guild.roles.cache.find(r => r.name.toLowerCase() === args.join(' ').toLowerCase());
        if (!role) {
            const guideContainer = UI.createContainer({
                title: 'Command : inrole',
                description: "List all members with a specific role.",
                footer: `Requested by ${message.author.tag}`,
                fields: [
                    { name: "Aliases:", value: "- rolelist, membersinrole" },
                    { name: "Usage:", value: "- ?inrole @role/id" },
                    { name: "Examples:", value: `- ?inrole @role/id` }
                ]
            });
            return message.reply({
                components: [guideContainer],
                flags: MessageFlags.IsComponentsV2
            });
        }

        // Get members with the role
        const members = role.members.map(member => `- \`${member.user.username}\` | \`${member.user.id}\``);

        if (members.length === 0) {
            const errorContainer = UI.createContainer({
                description: `- No members are currently assigned to the role **${role.name}**.`
            });
            return message.reply({
                components: [errorContainer],
                flags: MessageFlags.IsComponentsV2
            });
        }

        // Container with results
        const container = UI.createContainer({
            title: `${message.guild.name} | Users with the role: ${role.name}`,
            description: members.join('\n').slice(0, 4000),
            footer: `Requested by ${message.author.tag} | Total Members: ${members.length}`
        });

        return message.reply({
            components: [container],
            flags: MessageFlags.IsComponentsV2
        });
    }
};
