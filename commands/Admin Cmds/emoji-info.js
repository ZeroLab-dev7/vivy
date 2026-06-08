const { MessageFlags } = require('discord.js');
const UI = require('../../utils/ui');

const COOLDOWN_TIME = 5000; // 5 seconds cooldown
const cooldowns = new Map();

module.exports = {
    name: 'emojiinfo',
    aliases: ['einfo', 'emoji-info'],
    description: 'Get information about a specific emoji',
    async execute(message, args) {
        // Check if the user is on cooldown
        if (cooldowns.has(message.author.id)) {
            return message.react('⏳'); // React with a cooldown emoji
        }

        // Set cooldown for the user
        cooldowns.set(message.author.id, Date.now() + COOLDOWN_TIME);
        setTimeout(() => cooldowns.delete(message.author.id), COOLDOWN_TIME);

        if (args.length < 1) {
            const guideContainer = UI.createContainer({
                title: 'Command : EmojiInfo',
                description: 'Retrieve details about a specific emoji.',
                footer: `Requested by ${message.author.tag}`,
                fields: [
                    { name: "Aliases:", value: "- einfo, emoji-info, emojiinfo" },
                    { name: "Usage:", value: "- &emojiinfo emoji/id" },
                    { name: "Examples:", value: `- &emojiinfo <:hpsy:1363633042672848916>\n- &emojiinfo 1363633042672848916` }
                ]
            });
            return message.reply({
                components: [guideContainer],
                flags: MessageFlags.IsComponentsV2
            });
        }

        const emojiInput = args[0];
        let emoji;

        // If the input is an emoji ID
        if (/^\d+$/.test(emojiInput)) {
            emoji = message.guild.emojis.cache.get(emojiInput);
        }
        // If the input is a custom emoji format <:name:id>
        else if (emojiInput.match(/^<a?:\w+:(\d+)>$/)) {
            const emojiId = emojiInput.match(/^<a?:\w+:(\d+)>$/)[1];
            emoji = message.guild.emojis.cache.get(emojiId);
        }
        // If the input is an emoji name
        else {
            emoji = message.guild.emojis.cache.find(e => e.name.toLowerCase() === emojiInput.toLowerCase());
        }

        if (!emoji) {
            const errorContainer = UI.createContainer({
                description: '- Emoji not found.'
            });
            return message.reply({
                components: [errorContainer],
                flags: MessageFlags.IsComponentsV2
            });
        }

        const emojiContainer = UI.createContainer({
            title: 'Command : Emoji Info',
            description: `Emoji Information: **${emoji}**`,
            footer: `Requested by ${message.author.tag}`,
            fields: [
                { name: " Emoji Name", value: `\`${emoji.name}\`` },
                { name: " Emoji ID", value: `\`${emoji.id}\`` },
                { name: " Animated", value: emoji.animated ? ' Yes' : ' No' },
                { name: " Created At", value: `<t:${Math.floor(emoji.createdTimestamp / 1000)}:F>` },
                { name: " URL", value: `[Click Here](${emoji.url})` }
            ]
        });
        // Note: Thumbnail logic (displaying the emoji large) isn't supported in createContainer yet.

        return message.reply({
            components: [emojiContainer],
            flags: MessageFlags.IsComponentsV2
        });
    },
};
