const { ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags } = require('discord.js');
const UI = require('../../utils/ui');

const cooldowns = new Map(); // Cooldown map for users
const COOLDOWN_TIME = 5000; // 5 seconds cooldown

module.exports = {
    name: 'serverbanner',
    aliases: ['sb'],
    description: 'Displays the server banner.',
    async execute(message) {
        // Check if user is on cooldown
        if (cooldowns.has(message.author.id)) {
            // React with a cooldown emoji
            return message.react('⏳');
        }

        // Set the cooldown for the user
        cooldowns.set(message.author.id, Date.now() + COOLDOWN_TIME);
        setTimeout(() => cooldowns.delete(message.author.id), COOLDOWN_TIME);

        // Get the server (guild) object
        const guild = message.guild;

        // Get the server banner URL
        const serverBanner = guild.bannerURL({ size: 1024 });

        if (serverBanner) {
            // Create an embed to show the server banner
            // Create an embed to show the server banner
            const bannerContainer = UI.createContainer({
                title: `${guild.name}'s Banner`,
                description: `**Server Banner**\n[Click to download](${serverBanner})`,
                // image: serverBanner, // Assuming UI.createContainer might not support image yet, sticking to description link + button. Or if I want to display it, I'd need a separate image component if supported.
                footer: `Requested by ${message.author.tag}`
            });

            // Create the download button
            const downloadButton = new ButtonBuilder()
                .setLabel('Download Banner')
                .setStyle(ButtonStyle.Link)  // This makes it open a link
                .setURL(serverBanner); // URL will be the banner image URL

            // Create action row for the button
            const row = new ActionRowBuilder().addComponents(downloadButton);

            await message.reply({
                components: [bannerContainer, row],
                flags: MessageFlags.IsComponentsV2
            });
        } else {
            await message.reply({
                components: [UI.createContainer({
                    description: '- <a:warn:1365688576758644797> This server does not have a banner set.'
                })],
                flags: MessageFlags.IsComponentsV2
            });
        }
    }
};
