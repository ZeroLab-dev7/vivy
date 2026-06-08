const { PermissionsBitField, MessageFlags } = require('discord.js');
const UI = require('../../utils/ui');
const { LifeBan } = require('../../db/models');

const AUTHORIZED_USER_ID = '1218034475775299688';

module.exports = {
    name: 'unbanforlife',
    description: 'Remove a life ban from a user. Only the authorized user can use this.',
    aliases: ['unbfl'],
    async execute(message, args) {
        // Restrictions: Only the authorized user can use this command
        if (message.author.id !== AUTHORIZED_USER_ID) {
            return message.reply({
                components: [UI.createContainer({
                    description: '- This command is restricted to the bot owner.'
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

        const userId = args[0];
        if (!userId || isNaN(userId)) {
            return message.reply({
                components: [UI.createContainer({
                    title: 'Command: unbanforlife',
                    description: 'Remove a life ban from a user.',
                    fields: [
                        { name: "Usage:", value: "- &unbanforlife user_id" },
                        { name: "Aliases:", value: "- &unbfl" }
                    ]
                })],
                flags: MessageFlags.IsComponentsV2
            });
        }

        try {
            // Remove from database
            const deleted = await LifeBan.destroy({
                where: { guild_id: message.guild.id, user_id: userId }
            });

            // Unban from guild
            const banInfo = await message.guild.bans.fetch(userId).catch(() => null);
            if (banInfo) {
                await message.guild.bans.remove(userId);
            }

            if (deleted === 0 && !banInfo) {
                return message.reply({
                    components: [UI.createContainer({
                        description: `- User with ID \`${userId}\` was not found in the life ban list or ban list.`
                    })],
                    flags: MessageFlags.IsComponentsV2
                });
            }

            const successContainer = UI.createContainer({
                description: `-  Successfully removed life ban and unbanned user \`${userId}\`.`
            });

            return message.reply({
                components: [successContainer],
                flags: MessageFlags.IsComponentsV2
            });
        } catch (error) {
            console.error('Error in unbanforlife:', error);

            const errorContainer = UI.createContainer({
                description: `Failed to unban the user. Possible reasons:\n- The ID is invalid.\n- An unexpected error occurred.`
            });

            return message.reply({
                components: [errorContainer],
                flags: MessageFlags.IsComponentsV2
            });
        }
    }
};
