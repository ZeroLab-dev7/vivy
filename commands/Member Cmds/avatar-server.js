const { ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags } = require('discord.js');
const UI = require('../../utils/ui');

const cooldowns = new Map(); // Cooldown map for users
const COOLDOWN_TIME = 5000; // 5 seconds cooldown

module.exports = {
    name: 'serveravatar',
    aliases: ['sa'],
    description: 'Displays the server avatar (icon).',
    async execute(message) {
        // Check if user is on cooldown
        console.log(`Checking cooldown for ${message.author.id}`); // Log the user ID for debugging
        if (cooldowns.has(message.author.id)) {
            console.log(`${message.author.id} is on cooldown!`); // Log if the user is on cooldown
            // React with a cooldown emoji
            return message.react('⏳');
        }

        // Set the cooldown for the user
        cooldowns.set(message.author.id, Date.now() + COOLDOWN_TIME);
        setTimeout(() => cooldowns.delete(message.author.id), COOLDOWN_TIME);

        // Get the server (guild) object
        const guild = message.guild;

        // Get the server icon URL (avatar)
        const serverAvatar = guild.iconURL({ dynamic: true, size: 1024 });

        if (serverAvatar) {
            // Create an embed to show the server avatar
            // Create an embed to show the server avatar
            const avatarContainer = UI.createContainer({
                title: `${guild.name}'s Avatar`,
                // url: serverAvatar, // Container might not support URL in title directly like Embed? keeping it safe or checking if needed.
                // image: serverAvatar, // UI.createContainer might not support image directly yet based on previous notes.
                description: `**Server Avatar**\n[Click to download](${serverAvatar})`,
            });

            // Create the download button
            const downloadButton = new ButtonBuilder()
                .setLabel('Download Avatar')
                .setStyle(ButtonStyle.Link)  // This makes it open a link
                .setURL(serverAvatar); // URL will be the avatar image URL

            // Create action row for the button
            const row = new ActionRowBuilder().addComponents(downloadButton);

            avatarContainer.addActionRowComponents(row);

            await message.reply({
                components: [avatarContainer],
                flags: MessageFlags.IsComponentsV2
            });
        } else {
            await message.reply({
                components: [UI.createContainer({
                    description: '- <a:warn:1365688576758644797> This server does not have an avatar set.'
                })],
                flags: MessageFlags.IsComponentsV2
            });
        }
    }
};
