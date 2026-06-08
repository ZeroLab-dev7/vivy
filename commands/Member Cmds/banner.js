const { MessageFlags } = require('discord.js');
const UI = require('../../utils/ui');

module.exports = {
    name: "banner",
    description: "Displays the banner of a user",
    aliases: ["b", "ba"],
    async execute(message, args) {
        const client = message.client;
        try {
            let target;

            // Handle user input
            if (args.length > 0) {
                // Extract user ID from mention or raw ID
                const userId = args[0].replace(/[<@!>]/g, "");
                try {
                    target = await client.users.fetch(userId, { force: true });
                } catch (error) {
                    return message.reply({
                        components: [UI.createContainer({
                            description: "❌ Invalid user ID or mention provided."
                        })],
                        flags: MessageFlags.IsComponentsV2
                    });
                }
            } else {
                // Default to message author if no args provided
                target = await client.users.fetch(message.author.id, { force: true });
            }

            // Get banner URL
            const bannerURL = target.bannerURL({
                dynamic: true,
                size: 1024,
            });

            if (!bannerURL) {
                return message.reply({
                    components: [UI.createContainer({
                        description: "❌ This user does not have a banner set."
                    })],
                    flags: MessageFlags.IsComponentsV2
                });
            }

            // Send simple message with banner as clickable link
            await message.reply({
                content: `Here Is **${target.username}'s** Banner:\n 🔗 [Global Banner](${bannerURL})`
            });
        } catch (error) {
            console.error("Error in banner command:", error);
            await message.reply({
                components: [UI.createContainer({
                    description: "❌ An error occurred while fetching the banner."
                })],
                flags: MessageFlags.IsComponentsV2
            });
        }
    },
};
