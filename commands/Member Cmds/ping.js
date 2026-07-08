const { MessageFlags } = require('discord.js');
const UI = require('../../utils/ui');

const cooldowns = new Map(); // Cooldown map for users
const COOLDOWN_TIME = 5000; // 5 seconds cooldown
const SUPPORT_SERVER = "https://discord.gg/kYJnSKFa3U"; // Your support server link

module.exports = {
    name: 'ping',
    aliases: ['p'],
    description: 'Checks the bot\'s ping, API latency, and uptime.',
    async execute(message) {
        // Check if the user is on cooldown
        if (cooldowns.has(message.author.id)) {
            return message.react('⏳');
        }

        // Set the cooldown for the user
        cooldowns.set(message.author.id, Date.now() + COOLDOWN_TIME);
        setTimeout(() => cooldowns.delete(message.author.id), COOLDOWN_TIME);

        // Get bot's latency and API latency
        const botPing = Date.now() - message.createdTimestamp;
        const apiPing = Math.round(message.client.ws.ping);

        // Calculate the bot's uptime
        const uptime = process.uptime();
        const days = Math.floor(uptime / (24 * 60 * 60));
        const hours = Math.floor((uptime % (24 * 60 * 60)) / (60 * 60));
        const minutes = Math.floor((uptime % (60 * 60)) / 60);
        const seconds = Math.floor(uptime % 60);

        const uptimeString = `${days}d ${hours}h ${minutes}m ${seconds}s`;

        // Create Container
        // 0x00FF00 is Green
        const container = UI.createContainer({
            title: '🏓 Pong!',
            fields: [
                { name: 'Bot Latency', value: `\`\`\`yaml\n${botPing}ms\`\`\`` },
                { name: 'API Latency', value: `\`\`\`yaml\n${apiPing}ms\`\`\`` },
                { name: 'Uptime', value: `\`\`\`yaml\n${uptimeString}\`\`\`` }
            ]
        });

        // Send with V2 Flags
        message.reply({
            components: [container],
            flags: MessageFlags.IsComponentsV2
        });
    },
};
