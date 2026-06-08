const { Client, GatewayIntentBits, AuditLogEvent } = require('discord.js');
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildModeration] });
client.once('ready', async () => {
    const guild = client.guilds.cache.get('1490083641538252900');
    try {
        const logs = await guild.fetchAuditLogs({ type: AuditLogEvent.MemberDisconnect, limit: 1 });
        const entry = logs.entries.first();
        console.log(entry ? JSON.stringify({ target: entry.target, executor: entry.executor.tag, reason: entry.reason }, null, 2) : 'No disconnect logs found');
    } catch (e) { console.error(e); }
    client.destroy();
});
client.login(require('./config/bot.js').token || require('../config/bot.js').token || require('./config.json').token || process.env.DISCORD_TOKEN).catch(console.error);
