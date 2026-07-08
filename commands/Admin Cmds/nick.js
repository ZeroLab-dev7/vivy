const { PermissionsBitField, MessageFlags } = require('discord.js');
const UI = require('../../utils/ui');

module.exports = {
    name: 'nick',
    aliases: ['nickname'],
    description: 'Change a user\'s nickname on the server.',
    async execute(message, args) {
        // Check if the command executor has the required permission
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageNicknames)) {
            return message.reply({
                components: [UI.createContainer({
                    description: ' - You need the `Manage Nicknames` permission to use this command.'
                })],
                flags: MessageFlags.IsComponentsV2
            });
        }

        // Check if the bot has the required permission
        if (!message.guild.members.me.permissions.has(PermissionsBitField.Flags.ManageNicknames)) {
            return message.reply({
                components: [UI.createContainer({
                    description: ' - I need the `Manage Nicknames` permission to perform this action.'
                })],
                flags: MessageFlags.IsComponentsV2
            });
        }

        // Validate user argument
        const member = message.mentions.members?.first() || message.guild.members.cache.get(args[0]);
        if (!member) {
            return message.reply({
                components: [UI.createContainer({
                    title: 'Command : NickName',
                    description: 'Change a user\'s nickname on the server.',
                    footer: `Requested by ${message.author.tag}`,
                    fields: [
                        { name: "Aliases:", value: "- nick, nickname" },
                        { name: "Usage:", value: "- ?nick (user)  [new nickname]" },
                        { name: "Examples:", value: `- ?nick @user NewNickname` }
                    ]
                })],
                flags: MessageFlags.IsComponentsV2
            });
        }

        const newNickname = args.slice(1).join(' ');
        if (!newNickname) {
            return message.reply({
                components: [UI.createContainer({
                    description: ' - Please provide a new nickname for the member.'
                })],
                flags: MessageFlags.IsComponentsV2
            });
        }

        // Check if the user is the same as the bot or higher
        if (member.id === message.author.id) {
            return message.reply({
                components: [UI.createContainer({
                    description: '- You cannot change your own nickname with this command.'
                })],
                flags: MessageFlags.IsComponentsV2
            });
        }

        if (member.id === message.guild.ownerId) {
            return message.reply({
                components: [UI.createContainer({
                    description: '- You cannot change the server owner\'s nickname.'
                })],
                flags: MessageFlags.IsComponentsV2
            });
        }

        if (member.roles.highest.position >= message.member.roles.highest.position) {
            return message.reply({
                components: [UI.createContainer({
                    description: '- You cannot change the nickname of a member with the same or higher role.'
                })],
                flags: MessageFlags.IsComponentsV2
            });
        }

        try {
            // Change the nickname
            await member.setNickname(newNickname);

            // Send a confirmation embed
            const container = UI.createContainer({
                description: `-  Successfully changed ${member.user.tag}'s nickname to **${newNickname}**.`,
                fields: [
                    { name: 'User Mention:', value: `${member.user}`, inline: true },
                    { name: 'User ID:', value: `${member.id}`, inline: true },
                    { name: 'New Nickname:', value: `${newNickname}`, inline: true }
                ]
            });

            return message.reply({
                components: [container],
                flags: MessageFlags.IsComponentsV2
            });
        } catch (error) {
            console.error('Error changing nickname:', error);

            // Handle errors
            return message.reply({
                components: [UI.createContainer({
                    description: '- There was an error trying to change the nickname. Please check my permissions and try again.'
                })],
                flags: MessageFlags.IsComponentsV2
            });
        }
    },
};
