const { PermissionsBitField, MessageFlags } = require('discord.js');
const UI = require('../../utils/ui');

module.exports = {
    name: 'unban',
    description: 'Unban a user by their ID.',
    async execute(message, args) {
        // Check if the command executor has the required permission
        if (!message.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
            return message.reply({
                components: [UI.createContainer({
                    description: '- You need the `Ban Members` permission to use this command.'
                })],
                flags: MessageFlags.IsComponentsV2
            });
        }

        // Check if the bot has the required permission
        if (!message.guild.members.me.permissions.has(PermissionsBitField.Flags.BanMembers)) {
            return message.reply({
                components: [UI.createContainer({
                    description: '- I need the `Ban Members` permission to perform this action.'
                })],
                flags: MessageFlags.IsComponentsV2
            });
        }

        // Validate user ID argument
        const userId = args[0];
        if (!userId || isNaN(userId)) {
            return message.reply({
                components: [UI.createContainer({
                    description: '- Please provide a valid user ID to unban.'
                })],
                flags: MessageFlags.IsComponentsV2
            });
        }

        try {
            // Check if the user is banned
            const banInfo = await message.guild.bans.fetch(userId).catch(() => null);

            // Handle the case where the user is not banned
            if (!banInfo) {
                return message.reply({
                    components: [UI.createContainer({
                        description: `- User with ID \`${userId}\` is not currently banned.`
                    })],
                    flags: MessageFlags.IsComponentsV2
                });
            }

            // Unban the user
            await message.guild.bans.remove(userId);

            // Send a confirmation embed
            const container = UI.createContainer({
                description: `-  Successfully unbanned \`${banInfo.user.username}\` (${userId}).`,
            });

            return message.reply({
                components: [container],
                flags: MessageFlags.IsComponentsV2
            });
        } catch (error) {
            console.error('Error unbanning user:', error);

            // Handle errors
            // Handle errors
            const errorContainer = UI.createContainer({
                description: `- Failed to unban the user. This could be due to one of the following reasons:\n- The user ID is invalid.\n- The user is not banned.\n- An unexpected error occurred.`
            });

            return message.reply({
                components: [errorContainer],
                flags: MessageFlags.IsComponentsV2
            });
        }
    }
};
