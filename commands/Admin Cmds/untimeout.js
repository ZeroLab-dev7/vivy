const { MessageFlags } = require('discord.js');
const UI = require('../../utils/ui');

module.exports = {
    name: 'untimeout',
    aliases: ['remove-timeout', 'untimeoutuser'],
    description: 'Remove a timeout from a user',
    async execute(message, args) {
        // Guide for correct usage
        if (args.length < 1) {
            const guideContainer = UI.createContainer({
                title: 'Command: UnTimeout',
                description: 'Remove a timeout from a user.',
                footer: `Requested by ${message.author.tag}`,
                fields: [
                    { name: "Aliases:", value: "- untimeout, remove-timeout, untimeoutuser" },
                    { name: "Usage:", value: "- &untimeout (user/id)" },
                    { name: "Examples:", value: `- &untimeout @user/id` }
                ]
            });
            return message.reply({
                components: [guideContainer],
                flags: MessageFlags.IsComponentsV2
            });
        }

        const userInput = args[0];

        let user;
        // Check if the input is a mention or a user ID
        if (message.mentions.users.size > 0) {
            user = message.mentions.users.first();
        } else if (/^\d+$/.test(userInput)) {
            // Fetch user by ID
            try {
                user = await message.client.users.fetch(userInput);
            } catch (error) {
                const errorContainer = UI.createContainer({
                    description: '- Invalid user ID or user not found.'
                });
                return message.reply({
                    components: [errorContainer],
                    flags: MessageFlags.IsComponentsV2
                });
            }
        } else {
            const errorContainer = UI.createContainer({
                description: '- Please mention a user or provide a valid user ID.'
            });
            return message.reply({
                components: [errorContainer],
                flags: MessageFlags.IsComponentsV2
            });
        }

        // Remove timeout from user
        const member = message.guild.members.cache.get(user.id);

        // Check if the bot has permission to remove timeouts
        if (!message.guild.me.permissions.has('MODERATE_MEMBERS')) {
            const permErrorContainer = UI.createContainer({
                description: '- I do not have permission to remove timeouts.'
            });
            return message.reply({
                components: [permErrorContainer],
                flags: MessageFlags.IsComponentsV2
            });
        }

        // Check if the member is actually timed out
        if (!member.isCommunicationDisabled()) {
            const errorContainer = UI.createContainer({
                description: '- This user is not currently in timeout.'
            });
            return message.reply({
                components: [errorContainer],
                flags: MessageFlags.IsComponentsV2
            });
        }

        // Remove the timeout
        try {
            await member.timeout(null); // Remove the timeout
            const successContainer = UI.createContainer({
                description: `-  Successfully removed the timeout from \`${user.username}\`.`
            });
            message.channel.send({
                components: [successContainer],
                flags: MessageFlags.IsComponentsV2
            });
        } catch (err) {
            console.error('<:false:1365517000750661693> Error removing timeout:', err.message);
            const errorContainer = UI.createContainer({
                description: '- <:false:1365517000750661693> An error occurred while removing the timeout.'
            });
            return message.reply({
                components: [errorContainer],
                flags: MessageFlags.IsComponentsV2
            });
        }
    },
};
