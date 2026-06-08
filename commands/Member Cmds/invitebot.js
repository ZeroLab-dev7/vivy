// const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

// const cooldowns = new Map(); // Cooldown map for users
// const COOLDOWN_TIME = 5000; // 5 seconds cooldown

// module.exports = {
//     name: 'invite',
//     aliases: ['Celestail','support','celestail','invitebot'],
//     description: 'Get the bot\'s invite link.',
//     async execute(message) {
//         // Check if the user is on cooldown
//         if (cooldowns.has(message.author.id)) {
//             // React with a cooldown emoji
//             return message.react('⏳'); 
//         }

//         // Set the cooldown for the user
//         cooldowns.set(message.author.id, Date.now() + COOLDOWN_TIME);
//         setTimeout(() => cooldowns.delete(message.author.id), COOLDOWN_TIME);

//         // Your bot's invite link (replace this with your actual invite link)
//         const inviteLink = 'https://discord.com/oauth2/authorize?client_id=1379506375872483388&permissions=0&integration_type=0&scope=bot+applications.commands';

//         // Check if a user is mentioned, otherwise set to the bot itself
//         const user = message.mentions.users.first() || message.author;

//         // Create the embed
//         const embed = new EmbedBuilder()
//             .setColor('Blue')
//             .setAuthor({ name: 'Bot Invite Link', iconURL: user.displayAvatarURL({ dynamic: true }) })
//             .setDescription('**__Click the buttons below to invite the bot to your server or visit the support server!__**');

//         // Create the first button (Invite Bot)
//         const inviteButton = new ButtonBuilder()
//             .setLabel('・Add Bot') // Label for the first button
//             .setEmoji('<a:links:1366752207533379646>') // A default robot emoji
//             .setStyle(ButtonStyle.Link)
//             .setURL(inviteLink);

//         // Create the second button (Support Server)
//         const supportButton = new ButtonBuilder()
//             .setLabel('・Support Server') // Label for the second button
//             .setEmoji('<:redlogo:1379924543434391623>') // A wrench emoji for support
//             .setStyle(ButtonStyle.Link)
//             .setURL('https://discord.gg/YcF9Q3ntqb'); // Replace with your support server link

//         // Create an action row to hold the buttons
//         const row = new ActionRowBuilder().addComponents(inviteButton, supportButton);

//         // Send the embed with the buttons
//         message.reply({ embeds: [embed], components: [row] });
//     }
// };
