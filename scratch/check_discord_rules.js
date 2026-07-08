const { Client, GatewayIntentBits } = require('discord.js');
require('dotenv').config();

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildModeration]
});

client.once('ready', async () => {
    console.log(`Logged in as ${client.user.tag}`);
    const guildId = '1487265229183389769';
    const guild = client.guilds.cache.get(guildId);
    if (!guild) {
        console.error('Guild not found in cache!');
        process.exit(1);
    }
    try {
        const rules = await guild.autoModerationRules.fetch();
        console.log(`Found ${rules.size} AutoMod rules:`);
        rules.forEach(rule => {
            console.log('--------------------------------------------------');
            console.log(`Name: ${rule.name}`);
            console.log(`ID: ${rule.id}`);
            console.log(`Enabled: ${rule.enabled}`);
            console.log(`Trigger Type: ${rule.triggerType}`);
            console.log(`Trigger Metadata:`, JSON.stringify(rule.triggerMetadata));
            console.log(`Actions:`, JSON.stringify(rule.actions));
            console.log(`Exempt Roles:`, rule.exemptRoles.map(r => r));
            console.log(`Exempt Channels:`, rule.exemptChannels.map(c => c));
        });
    } catch (err) {
        console.error('Error fetching rules:', err);
    }
    process.exit(0);
});

client.login(process.env.TOKEN);
