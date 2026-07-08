const { Client, GatewayIntentBits } = require('discord.js');
require('dotenv').config({ path: '/home/ubuntu/zero-lab-bots/vivy/.env' });

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers]
});

client.once('ready', async () => {
    try {
        const guildId = '1491234165901889629';
        const guild = client.guilds.cache.get(guildId);
        if (!guild) {
            console.log(`Guild ${guildId} not found in client cache.`);
            process.exit(1);
        }

        console.log(`Guild Name: ${guild.name}`);
        console.log(`Owner ID: ${guild.ownerId}`);

        // Find user by name "Holy"
        const members = await guild.members.fetch();
        const user = members.find(m => m.user.username.toLowerCase().includes('holy') || m.displayName.toLowerCase().includes('holy'));
        if (user) {
            console.log(`\nUser: ${user.user.tag} (${user.id})`);
            console.log(`Is Owner: ${user.id === guild.ownerId}`);
            console.log(`Permissions: ${user.permissions.toArray().join(', ')}`);
            console.log(`Roles:`);
            user.roles.cache.forEach(role => {
                console.log(`  - ${role.name} (${role.id})`);
            });
        } else {
            console.log("User 'Holy' not found in member list.");
        }
    } catch (e) {
        console.error(e);
    }
    process.exit(0);
});

client.login(process.env.TOKEN);
