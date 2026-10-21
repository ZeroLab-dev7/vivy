const { MessageFlags } = require('discord.js');
const UI = require('../../utils/ui');
const os = require('os');

const BOT_OWNER_ID = '1218037013966491770';
const COOLDOWN_TIME = 5000;
const cooldowns = new Map();

module.exports = {
    name: 'botinfo',
    aliases: ['botstats', 'binfo'],
    description: 'Detailed bot stats — ping, uptime, memory, shards. (Dev / Bot Owner only)',
    async execute(message, args) {
        // ── Owner Guard ─────────────────────────────────────────────────────────
        if (message.author.id !== BOT_OWNER_ID) {
            return message.reply({
                components: [UI.createContainer({ description: '- 🔒 Only the **Bot Owner** can use this command.' })],
                flags: MessageFlags.IsComponentsV2
            });
        }

        // ── Cooldown ────────────────────────────────────────────────────────────
        if (cooldowns.has(message.author.id)) return message.react('⏳');
        cooldowns.set(message.author.id, true);
        setTimeout(() => cooldowns.delete(message.author.id), COOLDOWN_TIME);

        // ── Latency ─────────────────────────────────────────────────────────────
        const sent = await message.reply({
            components: [UI.createContainer({ description: '- 📡 Measuring latency...' })],
            flags: MessageFlags.IsComponentsV2
        });

        const apiLatency = Math.round(message.client.ws.ping);
        const msgLatency = sent.createdTimestamp - message.createdTimestamp;

        // ── Uptime ───────────────────────────────────────────────────────────────
        const uptimeMs = process.uptime() * 1000;
        const uptimeStr = formatUptime(uptimeMs);

        // ── Memory ───────────────────────────────────────────────────────────────
        const mem = process.memoryUsage();
        const heapUsed = (mem.heapUsed / 1024 / 1024).toFixed(2);
        const heapTotal = (mem.heapTotal / 1024 / 1024).toFixed(2);
        const rss = (mem.rss / 1024 / 1024).toFixed(2);

        // ── System ───────────────────────────────────────────────────────────────
        const platform = process.platform;
        const nodeVersion = process.version;
        const cpuModel = os.cpus()[0]?.model?.trim() || 'Unknown';
        const totalMem = (os.totalmem() / 1024 / 1024 / 1024).toFixed(2);
        const freeMem = (os.freemem() / 1024 / 1024 / 1024).toFixed(2);

        // ── Bot Stats ─────────────────────────────────────────────────────────────
        const guildCount = message.client.guilds.cache.size;
        const userCount = message.client.guilds.cache.reduce((acc, g) => acc + g.memberCount, 0);
        const channelCount = message.client.channels.cache.size;
        const commandCount = message.client.commands?.size || 0;

        const startTimestamp = Math.floor((Date.now() - uptimeMs) / 1000);

        const container = UI.createContainer({
            title: `🤖 Bot Info — ${message.client.user.tag}`,
            description: [
                `**📡 Latency**`,
                `- **API Ping:** \`${apiLatency}ms\``,
                `- **Message Latency:** \`${msgLatency}ms\``,
                ``,
                `**⏱️ Uptime**`,
                `- **Running for:** \`${uptimeStr}\``,
                `- **Started:** <t:${startTimestamp}:R>`,
                ``,
                `**📊 Bot Stats**`,
                `- **Servers:** \`${guildCount.toLocaleString()}\``,
                `- **Users:** \`${userCount.toLocaleString()}\``,
                `- **Channels:** \`${channelCount.toLocaleString()}\``,
                `- **Commands:** \`${commandCount}\``,
                `- **Bot ID:** \`${message.client.user.id}\``,
                ``,
                `**💾 Memory (Process)**`,
                `- **Heap Used:** \`${heapUsed} MB / ${heapTotal} MB\``,
                `- **RSS:** \`${rss} MB\``,
                ``,
                `**🖥️ System**`,
                `- **OS:** \`${platform}\``,
                `- **Node.js:** \`${nodeVersion}\``,
                `- **CPU:** \`${cpuModel}\``,
                `- **RAM:** \`${freeMem} GB free / ${totalMem} GB total\``
            ].join('\n')
        });

        await sent.edit({
            components: [container],
            flags: MessageFlags.IsComponentsV2
        });
    }
};

function formatUptime(ms) {
    const days = Math.floor(ms / 86_400_000);
    const hours = Math.floor((ms % 86_400_000) / 3_600_000);
    const minutes = Math.floor((ms % 3_600_000) / 60_000);
    const seconds = Math.floor((ms % 60_000) / 1000);

    const parts = [];
    if (days) parts.push(`${days}d`);
    if (hours) parts.push(`${hours}h`);
    if (minutes) parts.push(`${minutes}m`);
    parts.push(`${seconds}s`);
    return parts.join(' ');
}
