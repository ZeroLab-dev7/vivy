const { ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags } = require('discord.js');
const UI = require('../../utils/ui');

const COOLDOWN_TIME = 5000; // 5 seconds cooldown
const cooldowns = new Map();

module.exports = {
    name: "firstmsj",
    aliases: ["firstmsg", "first-message", "firstmessage"],
    description: "Get the first message in the current channel",
    async execute(message) {
        // Check if the user is on cooldown
        if (cooldowns.has(message.author.id)) {
            return message.react('⏳'); // React with a cooldown emoji
        }

        // Set cooldown for the user
        cooldowns.set(message.author.id, Date.now() + COOLDOWN_TIME);
        setTimeout(() => cooldowns.delete(message.author.id), COOLDOWN_TIME);

        try {
            const fetchMessages = await message.channel.messages.fetch({ after: "1", limit: 1 });
            const firstMessage = fetchMessages.first();

            if (!firstMessage) {
                const errorContainer = UI.createContainer({
                    description: "- No messages found in this channel."
                });
                return message.reply({
                    components: [errorContainer],
                    flags: MessageFlags.IsComponentsV2
                });
            }

            // Container for first message info
            const container = UI.createContainer({
                title: "First Message Info",
                description: ` **First message in \`#${message.channel.name}\`:**\n\n` +
                    `**Author:** \`${firstMessage.author.username}\` (${firstMessage.author.username})\n` +
                    `**Sent:** <t:${Math.floor(firstMessage.createdTimestamp / 1000)}:F>\n` +
                    `**Message Content:** ${firstMessage.content || 'No content'}`,
                footer: `Message ID: ${firstMessage.id}`
            });

            // ActionRow with button to jump to message
            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setLabel("Go To Message")
                    .setURL(firstMessage.url)
                    .setStyle(ButtonStyle.Link)
            );

            // Add row to container components? 
            // NOTE: In V2 Components, ActionRows are often top-level siblings to Containers if they are interactive components that don't fit inside a container text flow?
            // OR ContainerBuilder has .addActionRowComponents().
            // Let's add it internal to the container if we can, or send as sibling?
            // help.js example: adds row to mainContainer.

            container.addActionRowComponents(builder => builder.setComponents(
                new ButtonBuilder()
                    .setLabel("Go To Message")
                    .setURL(firstMessage.url)
                    .setStyle(ButtonStyle.Link)
            ));

            return message.reply({
                components: [container],
                flags: MessageFlags.IsComponentsV2
            });
        } catch (error) {
            console.error("Error fetching first message:", error);
            // V2 Error
            return message.reply({
                components: [UI.createContainer({
                    description: "An error occurred while fetching the first message."
                })],
                flags: MessageFlags.IsComponentsV2
            });
        }
    }
};
