const { PermissionsBitField, MessageFlags } = require('discord.js');
const UI = require('../../utils/ui');

const COOLDOWN_TIME = 5000;
const cooldowns = new Map();

module.exports = {
    name: 'ban',
    description: 'Ban a user by their ID, username, or mention with an optional reason.',
    aliases: ['ban'],
    async execute(message, args) {
        if (cooldowns.has(message.author.id)) {
            return message.react('⏳');
        }

        cooldowns.set(message.author.id, Date.now() + COOLDOWN_TIME);
        setTimeout(() => cooldowns.delete(message.author.id), COOLDOWN_TIME);

        if (!message.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
            return message.reply({
                components: [UI.createContainer({
                    description: '- You need the `Ban Members` permission to use this command.'
                })],
                flags: MessageFlags.IsComponentsV2
            });
        }

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
                    title: 'Command: ban',
                    description: 'Ban a user from the server.',
                    fields: [
                        { name: "Usage:", value: "- ?ban @user/id (reason)" },
                        { name: "Examples:", value: `- ?ban <@${message.author.id}> breaking rules` }
                    ]
                })],
                flags: MessageFlags.IsComponentsV2
            });
        }

        const reason = args.slice(1).join(' ') || 'No reason provided';

        try {
            await message.guild.members.ban(user.id, { reason });

            const successContainer = UI.createContainer({
                description: `-  Successfully banned ${user.tag}.`
            });

            return message.reply({
                components: [successContainer],
                flags: MessageFlags.IsComponentsV2
            });
        } catch (error) {
            console.error('Error banning user:', error);

            const errorContainer = UI.createContainer({
                description: `Failed to ban the user. Possible reasons:\n- The user is not in the server.\n- The ID is invalid.\n- The user has a higher role than the bot.`
            });

            return message.reply({
                components: [errorContainer],
                flags: MessageFlags.IsComponentsV2
            });
        }
    }
};
