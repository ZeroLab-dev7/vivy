const { PermissionsBitField, MessageFlags } = require('discord.js');
const UI = require('../../utils/ui');

const COOLDOWN_TIME = 5000; // 5 seconds cooldown
const cooldowns = new Map();

module.exports = {
    name: 'addrole',
    aliases: ['roleadd'],
    description: 'Assign a role to a user',
    async execute(message, args) {
        if (cooldowns.has(message.author.id)) {
            return message.react('⏳');
        }

        // Set cooldown for the user
        cooldowns.set(message.author.id, Date.now() + COOLDOWN_TIME);
        setTimeout(() => cooldowns.delete(message.author.id), COOLDOWN_TIME);

        // Ensure the user has the required permissions
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
            return message.reply({
                components: [UI.createContainer({
                    description: '- You need "Manage Roles" permission to use this command.'
                })],
                flags: MessageFlags.IsComponentsV2
            });
        }

        // Ensure the bot has the required permissions
        if (!message.guild.members.me.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
            return message.reply({
                components: [UI.createContainer({
                    description: '- I need "Manage Roles" permission to add roles.'
                })],
                flags: MessageFlags.IsComponentsV2
            });
        }

        // Guide for correct usage
        if (args.length < 2) {
            const guideContainer = UI.createContainer({
                title: 'Command : AddRole',
                description: 'Add a role to a user.',
                footer: `Requested by ${message.author.tag}`,
                fields: [
                    { name: "Aliases:", value: "addrole, roleadd" },
                    { name: "Usage:", value: "+addrole @user/id <role name/id/mention>" },
                    { name: "Examples:", value: `- +addrole @user @Member\n- +addrole 123456789 Admin` }
                ]
            });
            return message.reply({
                components: [guideContainer],
                flags: MessageFlags.IsComponentsV2
            });
        }

        const userInput = args[0];
        const roleInput = args.slice(1).join(' '); // Role ID or name or mention

        let member;
        // Check if the input is a mention or a user ID
        if (message.mentions.members.size > 0) {
            member = message.mentions.members.first();
        } else if (/^\d+$/.test(userInput)) {
            try {
                member = await message.guild.members.fetch(userInput);
            } catch (error) {
                return message.reply({
                    components: [UI.createContainer({ description: '- Invalid user ID or user not found in this server.' })],
                    flags: MessageFlags.IsComponentsV2
                });
            }
        } else {
            return message.reply({
                components: [UI.createContainer({ description: '- Please mention a user or provide a valid user ID.' })],
                flags: MessageFlags.IsComponentsV2
            });
        }

        let role;
        if (message.mentions.roles.size > 0) {
            role = message.mentions.roles.first();
        } else if (/^\d+$/.test(roleInput)) {
            role = message.guild.roles.cache.get(roleInput);
        } else {
            // Exact match first
            role = message.guild.roles.cache.find(r => r.name.toLowerCase() === roleInput.toLowerCase());

            // If no exact match, try partial match
            if (!role) {
                role = message.guild.roles.cache.find(r => r.name.toLowerCase().includes(roleInput.toLowerCase()));
            }
        }

        if (!role) {
            return message.reply({
                components: [UI.createContainer({ description: '- Role not found. Please mention the role, provide its ID, or type its exact name.' })],
                flags: MessageFlags.IsComponentsV2
            });
        }

        // Ensure the role is assignable
        if (role.position >= message.guild.members.me.roles.highest.position) {
            return message.reply({
                components: [UI.createContainer({ description: "- I cannot add a role that is higher or equal to my highest role." })],
                flags: MessageFlags.IsComponentsV2
            });
        }

        // Check if the user already has the role
        if (member.roles.cache.has(role.id)) {
            return message.reply({
                components: [UI.createContainer({ description: `- ${member.user.tag} already has the role **${role.name}**.` })],
                flags: MessageFlags.IsComponentsV2
            });
        }

        // Assign role to the member
        try {
            const reason = `By: ${message.author.tag} (${message.author.id})`;
            await member.roles.add(role, reason);
            const successContainer = UI.createContainer({
                description: `- Successfully added the role **${role.name}** to ${member.user.username}.`,
                fields: [
                    { name: 'User Tag:', value: `${member.user.tag}` },
                    { name: 'User ID:', value: `${member.id}` },
                    { name: 'Role Name:', value: `${role.name}` },
                    { name: 'Role ID:', value: `${role.id}` }
                ]
            });
            message.channel.send({
                components: [successContainer],
                flags: MessageFlags.IsComponentsV2
            });
        } catch (err) {
            console.error('❌ Error adding role:', err.message);
            return message.reply({
                components: [UI.createContainer({ description: '- An error occurred while adding the role.' })],
                flags: MessageFlags.IsComponentsV2
            });
        }
    },
};
