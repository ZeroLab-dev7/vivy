const { MessageFlags } = require('discord.js');
const UI = require('../../utils/ui');

const cooldowns = new Map();
const COOLDOWN_TIME = 5000; // 5 seconds cooldown
const MAX_MESSAGES_PER_BATCH = 100; // Discord API limitation

module.exports = {
    name: 'clear',
    aliases: ['ms7', 'msh', 'mse7', 'msa7', 'Msa7'],
    description: 'Clear messages in the channel based on specific filters.',
    execute: async (message, args) => {
        // Check if the user has the right permissions
        if (!message.member.permissions.has('ManageMessages')) { // Fixed permission flag
            const errorContainer = UI.createContainer({
                description: '- You do not have permission to manage messages.'
            });
            return message.reply({
                components: [errorContainer],
                flags: MessageFlags.IsComponentsV2
            });
        }

        // Check if the user is on cooldown
        if (cooldowns.has(message.author.id)) {
            // React with a timer emoji (this will react on the user's message)
            await message.react('⏳'); // React here on the user's message, not the bot's
            return; // Exit the command if the user is on cooldown
        }

        // Set cooldown for the user
        cooldowns.set(message.author.id, Date.now() + COOLDOWN_TIME);
        setTimeout(() => cooldowns.delete(message.author.id), COOLDOWN_TIME); // Remove cooldown after the set time

        if (!args.length) {
            const guideContainer = UI.createContainer({
                title: 'Command: clear',
                description: 'Clear messages in the channel.',
                footer: `Requested by ${message.author.tag}`,
                fields: [
                    { name: "Aliases:", value: "- clear, ms7, Msa7, msa7, mse7, msh" },
                    { name: "Usage:", value: "- &clear (number of messages)" },
                    { name: "Examples:", value: `- &clear 100\n- &clear 50` }
                ]
            });
            return message.reply({
                components: [guideContainer],
                flags: MessageFlags.IsComponentsV2
            });
        }

        const numberOfMessages = parseInt(args[0]);

        if (isNaN(numberOfMessages)) {
            const errorContainer = UI.createContainer({
                description: '- Please provide a valid number of messages to delete.'
            })
            return message.reply({
                components: [errorContainer],
                flags: MessageFlags.IsComponentsV2
            });
        }

        if (numberOfMessages < 1) {
            const errorContainer = UI.createContainer({
                description: '- You must delete at least 1 message.'
            });
            return message.reply({
                components: [errorContainer],
                flags: MessageFlags.IsComponentsV2
            });
        }

        try {
            // Delete the command message first
            await message.delete().catch(() => { });

            let totalMessagesDeleted = 0;
            let remaining = numberOfMessages;
            let beforeId = undefined;

            while (remaining > 0) {
                const fetchLimit = Math.min(remaining, MAX_MESSAGES_PER_BATCH);

                const fetchOptions = { limit: MAX_MESSAGES_PER_BATCH };
                if (beforeId) fetchOptions.before = beforeId;

                const fetchedMessages = await message.channel.messages.fetch(fetchOptions);

                if (fetchedMessages.size === 0) break;

                beforeId = fetchedMessages.last().id;

                const messagesToDelete = fetchedMessages.first(fetchLimit);
                if (!messagesToDelete || messagesToDelete.length === 0) break;

                if (messagesToDelete.length >= 2) {
                    // Bulk delete for 2+ messages (Discord API requires minimum 2)
                    try {
                        const deleted = await message.channel.bulkDelete(messagesToDelete, true);
                        totalMessagesDeleted += deleted.size;
                        remaining -= deleted.size;
                        if (deleted.size < messagesToDelete.length) break;
                    } catch (bulkDeleteError) {
                        console.error('[clear] bulkDelete failed, falling back to individual delete:', bulkDeleteError.message);
                        // Fallback: delete individually
                        for (const msg of messagesToDelete) {
                            try {
                                await msg.delete();
                                totalMessagesDeleted++;
                                remaining--;
                            } catch (e) { /* skip undeletable messages */ }
                        }
                    }
                } else {
                    // Single message — delete individually
                    try {
                        await messagesToDelete[0].delete();
                        totalMessagesDeleted++;
                        remaining--;
                    } catch (e) { /* skip undeletable messages */ }
                }

                // Small delay between batches to avoid rate limiting
                if (remaining > 0) {
                    await new Promise(resolve => setTimeout(resolve, 500));
                }
            }

            // Send the success confirmation after deletion
            const successContainer = UI.createContainer({
                description: `- Successfully cleared **${totalMessagesDeleted}** message(s)!`
            });

            // Send the success message and delete it after 3 seconds
            const successMessage = await message.channel.send({
                components: [successContainer],
                flags: MessageFlags.IsComponentsV2
            });
            setTimeout(() => successMessage.delete().catch(() => { }), 3000);

        } catch (error) {
            console.error(error);
            const errorContainer = UI.createContainer({
                description: '- An error occurred while trying to delete the messages.'
            });
            message.reply({
                components: [errorContainer],
                flags: MessageFlags.IsComponentsV2
            }).catch(() => {
                // If we can't reply to the original message, send a new message
                message.channel.send({
                    components: [errorContainer],
                    flags: MessageFlags.IsComponentsV2
                }).catch(() => { });
            });
        }
    }
};