const { MessageFlags } = require('discord.js');
const UI = require('../../utils/ui');
const ms = require('ms'); // Required for parsing time strings (e.g., 10m, 1h, 1d)

module.exports = {
    name: 'timeout',
    aliases: ['timeoutuser', 'settimeout'],
    description: 'Apply a timeout to a user for a specific amount of time',
    async execute(message, args) {
        // Guide for correct usage
        if (args.length < 2) {
            const guideContainer = UI.createContainer({
                title: 'Command: Timeout',
                description: 'Apply a timeout to a user for a specific amount of time.',
                fields: [
                    { name: "Aliases:", value: "- timeout, timeoutuser, settimeout" },
                    { name: "Usage:", value: "- ?timeout (user/id) (time)" },
                    { name: "Examples:", value: `- ?timeout @user/id 24h` }
                ]
            });
            return message.reply({
                components: [guideContainer],
                flags: MessageFlags.IsComponentsV2
            });
        }

        const userInput = args[0];
        const timeInput = args[1]; // Time in format like 10m, 1h, 1d

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

        // Apply timeout to user
        const member = message.guild.members.cache.get(user.id);

        // Check if the bot has permission to timeout users
        if (!message.guild.me.permissions.has('MODERATE_MEMBERS')) {
            const permErrorContainer = UI.createContainer({
                description: '- I do not have permission to timeout users.'
            });
            return message.reply({
                components: [permErrorContainer],
                flags: MessageFlags.IsComponentsV2
            });
        }

        // Validate the timeInput
        const timeInMilliseconds = ms(timeInput);
        if (!timeInMilliseconds || timeInMilliseconds <= 0) {
            const errorContainer = UI.createContainer({
                description: '- Please provide a valid time (e.g., 10m, 1h, 1d).'
            });
            return message.reply({
                components: [errorContainer],
                flags: MessageFlags.IsComponentsV2
            });
        }

        // Timeout the member
        try {
            await member.timeout(timeInMilliseconds);
            const successContainer = UI.createContainer({
                description: `-  Successfully timed out **${user.username}** for ${timeInput}.`
            });
            message.channel.send({
                components: [successContainer],
                flags: MessageFlags.IsComponentsV2
            });

            // Send a message when timeout expires
            setTimeout(async () => {
                try {
                    await member.timeout(null); // Remove the timeout after the specified time
                    const removeContainer = UI.createContainer({
                        description: `-  The timeout for **${user.username}** has expired.`
                    });
                    message.channel.send({
                        components: [removeContainer],
                        flags: MessageFlags.IsComponentsV2
                    });
                } catch (err) {
                    console.error('<:no:1526496561188831244>Error removing timeout:', err.message);
                }
            }, timeInMilliseconds);
        } catch (err) {
            console.error('<:no:1526496561188831244>Error applying timeout:', err.message);
            const errorContainer = UI.createContainer({
                description: '- An error occurred while applying the timeout.'
            });
            return message.reply({
                components: [errorContainer],
                flags: MessageFlags.IsComponentsV2
            });
        }
    },
};
