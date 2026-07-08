const { MessageFlags } = require("discord.js");
const UI = require('../../utils/ui');

const COOLDOWN_TIME = 5000; // 5 seconds cooldown
const cooldowns = new Map();

module.exports = {
    name: "addemoji",
    aliases: ['ae', 'addemojis'],
    description: "Add an emoji from another server",
    async execute(message, args) {
        // Check if the user is on cooldown
        if (cooldowns.has(message.author.id)) {
            return message.react('⏳'); // React with a cooldown emoji
        }

        // Set cooldown for the user
        cooldowns.set(message.author.id, Date.now() + COOLDOWN_TIME);
        setTimeout(() => cooldowns.delete(message.author.id), COOLDOWN_TIME);

        // Check if the user has Manage Emojis permission
        if (!message.member.permissions.has("ManageEmojisAndStickers")) {
            return message.reply({
                components: [UI.createContainer({
                    description: "- You need the `Manage Emojis` permission to use this command."
                })],
                flags: MessageFlags.IsComponentsV2
            });
        }

        // Check if both emoji and name are provided
        if (!args[0] || !args[1]) {
            const guideContainer = UI.createContainer({
                title: 'Command : addemoji',
                description: "Add emoji to the server",
                footer: `Requested by ${message.author.tag}`,
                fields: [
                    { name: "Aliases:", value: "- ae, addemojis" },
                    { name: "Usage:", value: "- ?addemoji <emoji> <name>" },
                    { name: "Examples:", value: "- ?addemoji Hpsy" }
                ]
            });

            return message.reply({
                components: [guideContainer],
                flags: MessageFlags.IsComponentsV2
            });
        }

        const emoji = args[0];
        const name = args[1];

        // Validate emoji format (must be a custom emoji from another server)
        const emojiMatch = emoji.match(/<(a)?:\w+:(\d+)>/);

        if (!emojiMatch) {
            return message.reply({
                components: [UI.createContainer({
                    description: "- Invalid emoji format. Please provide a valid custom emoji from another server."
                })],
                flags: MessageFlags.IsComponentsV2
            });
        }

        const isAnimated = emojiMatch[1] === 'a';
        const emojiID = emojiMatch[2];
        const extension = isAnimated ? 'gif' : 'png';
        const emojiURL = `https://cdn.discordapp.com/emojis/${emojiID}.${extension}`;

        try {
            // Attempt to create the emoji on the server
            const newEmoji = await message.guild.emojis.create({ attachment: emojiURL, name: name });

            const successContainer = UI.createContainer({
                description: "- Successfully added emoji!"
            });
            // We can't set thumbnail on Container easily with helper, but it's fine. 
            // If they really want the image, we can add it as a separate text link or improve helper later.
            // Helper supports 'thumbnail' in createEmbed but createContainer signature currently: title, description, color, fields, footer.
            // Let's stick to text description for now to be safe or just show it.
            // Actually, we can just reply.

            return message.reply({
                components: [successContainer],
                flags: MessageFlags.IsComponentsV2
            });

        } catch (error) {
            let errorMessage = "- Failed to add emoji.";
            if (error.code === 30008) {
                errorMessage += " The server has reached the emoji limit.";
            } else if (error.code === 50013) {
                errorMessage += " The bot needs `Manage Emojis` permission.";
            }

            return message.reply({
                components: [UI.createContainer({
                    description: errorMessage
                })],
                flags: MessageFlags.IsComponentsV2
            });
        }
    }
};
