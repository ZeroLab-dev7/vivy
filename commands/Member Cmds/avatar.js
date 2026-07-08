const { ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags } = require('discord.js');
const UI = require('../../utils/ui');

module.exports = {
    name: "avatar",
    description: "Shows user avatar",
    aliases: ["a", "av", "pfp"],
    async execute(message, args) {
        const client = message.client;
        try {
            let target;

            // Handle user input
            if (args.length > 0) {
                // Extract user ID from mention or raw ID
                const userId = args[0].replace(/[<@!>]/g, "");
                try {
                    target = await client.users.fetch(userId);
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
                target = message.author;
            }

            // Validate target user
            if (!target) {
                return message.reply({
                    components: [UI.createContainer({
                        description: "❌ Could not find the specified user."
                    })],
                    flags: MessageFlags.IsComponentsV2
                });
            }

            // Get avatar URLs (global and server-specific if set)
            const member = message.guild ? await message.guild.members.fetch(target.id).catch(() => null) : null;
            const globalAvatarURL = target.displayAvatarURL({
                dynamic: true,
                size: 1024,
            });
            const serverAvatarURL = member ? member.avatarURL({
                dynamic: true,
                size: 1024,
            }) : null;

            // Build links array
            const links = [`[Global Avatar](${globalAvatarURL})`];
            if (serverAvatarURL) {
                links.push(`[Server Avatar](${serverAvatarURL})`);
            }

            // Send message with avatars as clickable links
            await message.reply({
                content: `Here Is **${target.username}'s** Avatar:\n 🔗 ${links.join(' | ')}`
            });
        } catch (error) {
            console.error("Error in avatar command:", error);
            await message.reply({
                components: [UI.createContainer({
                    description: "❌ An error occurred while fetching the avatar."
                })],
                flags: MessageFlags.IsComponentsV2
            });
        }
    },
};
