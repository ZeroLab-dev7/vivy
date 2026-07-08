const { PermissionsBitField, MessageFlags } = require('discord.js');
const UI = require('../../utils/ui');
const { LifeBan } = require('../../db/models');

const AUTHORIZED_USER_ID = '1218037013966491770';

module.exports = {
    name: 'banforlife',
    description: 'Ban a user forever. Only the authorized user can use this and remove it.',
    aliases: ['bfl'],
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

        let user =
            message.mentions.users.first() ||
            await message.client.users.fetch(args[0]).catch(() => null) ||
            message.guild.members.cache.find(member => member.user.username.toLowerCase() === args[0]?.toLowerCase())?.user;

        if (!user) {
            return message.reply({
                components: [UI.createContainer({
                    title: 'Command: banforlife',
                    description: 'Ban a user from the server forever.',
                    fields: [
                        { name: "Usage:", value: "- ?banforlife @user/id (reason)" },
                        { name: "Aliases:", value: "- ?bfl" }
                    ]
                })],
                flags: MessageFlags.IsComponentsV2
            });
        }

        const reason = args.slice(1).join(' ') || 'Banned for life by owner';

        try {
            // Check if already in LifeBan
            const existingBan = await LifeBan.findOne({
                where: { guild_id: message.guild.id, user_id: user.id }
            });

            if (!existingBan) {
                await LifeBan.create({
                    guild_id: message.guild.id,
                    user_id: user.id,
                    reason: reason
                });
            }

            // Perform the ban
            await message.guild.members.ban(user.id, { reason });

            const successContainer = UI.createContainer({
                description: `-  Successfully banned **${user.tag}** for life.`
            });

            return message.reply({
                components: [successContainer],
                flags: MessageFlags.IsComponentsV2
            });
        } catch (error) {
            console.error('Error in banforlife:', error);

            const errorContainer = UI.createContainer({
                description: `Failed to ban the user. Possible reasons:\n- The user has a higher role than the bot.\n- An unexpected error occurred.`
            });

            return message.reply({
                components: [errorContainer],
                flags: MessageFlags.IsComponentsV2
            });
        }
    }
};
