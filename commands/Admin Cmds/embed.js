const UI = require('../../utils/ui');
const { MessageFlags } = require('discord.js');
const Emojis = require('../../utils/emojis');

const COOLDOWN_TIME = 5000; // 5 seconds cooldown
const cooldowns = new Map();

module.exports = {
    name: 'embed',
    description: 'Create and send an embed from a JSON string',
    async execute(message, args) {
        // Check if the user is on cooldown
        if (cooldowns.has(message.author.id)) {
            return message.react('⏳'); // React with a cooldown emoji
        }

        // Set cooldown for the user
        cooldowns.set(message.author.id, Date.now() + COOLDOWN_TIME);
        setTimeout(() => cooldowns.delete(message.author.id), COOLDOWN_TIME);

        if (message.author.bot || !args.length) return;

        try {
            const jsonString = args.join(' ');
            const jsonEmbed = JSON.parse(jsonString);

            // Validation checks...
            const rawEmbed = jsonEmbed.embeds ? jsonEmbed.embeds[0] : jsonEmbed;

            // Use UI.createContainer for V2 consistency.
            // Map raw fields to Container options.
            const container = UI.createContainer({
                title: rawEmbed.title,
                description: rawEmbed.description,
                fields: rawEmbed.fields || [],
                footer: rawEmbed.footer?.text,
                // Color is ignored as per user request "no colors"
            });

            // Note: ContainerBuilder handles images/thumbnails differently/not fully in my helper yet?
            // createContainer helper doesn't support setting image/thumbnail.
            // Only title, description, fields, footer.
            // If the user provided thumbnail/image in JSON, it won't be displayed with current helper.
            // I should update helper or just pass it to container manually if I had access.
            // But createContainer returns a ContainerBuilder.
            // ContainerBuilder doesn't seem to have valid setImage/setThumbnail methods in the same way as EmbedBuilder?
            // Actually, V2 Components are different. Images are usually separate blocks (ImageDisplay?).
            // Checking help.js... it doesn't use images.
            // Let's stick to text for now as Containers are layout based.
            // Or maybe standard Embeds are still supported inside V2 as 'attachments' or something?
            // No, V2 replaces Embeds.
            // If they want images, they might need different components.
            // For now, I'll ignore images in JSON for V2 migration unless I expand the helper.

            await message.channel.send({
                content: jsonEmbed.content || null,
                components: [container],
                flags: MessageFlags.IsComponentsV2
            });

            await message.delete().catch(() => { });
        } catch (error) {
            // console.error('Error parsing JSON:', error); // Silent or log?

            const errorContainer = UI.createContainer({
                description: `- ${Emojis.Anim.warn} There is an error in your JSON format. Please check the syntax.`
            });
            return message.reply({
                components: [errorContainer],
                flags: MessageFlags.IsComponentsV2
            });
        }
    },
};
