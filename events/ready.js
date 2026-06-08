const { ActivityType } = require('discord.js');
const { checkExpiredMutes } = require('../utils/muteManager');

module.exports = {
  name: 'clientReady',
  once: true,
  async execute(client) {
    client.user.setPresence({
      status: 'idle',
      activities: [
        {
          type: ActivityType.Playing,
          name: 'Zero Lab #LoadingToFuture',
        },
      ],
      afk: false,
      device: {
        mobile: true,
      },
    });

    console.log('✅ Background tasks initialized: Mute Expiry Check');
    // Check every 30 seconds
    setInterval(() => checkExpiredMutes(client), 30000);
    // Initial check
    checkExpiredMutes(client);

    // Initialize Invite Tracker
    const InviteTracker = require('../utils/InviteTracker');
    client.inviteTracker = new InviteTracker(client);

    // Cache invites for all guilds
    client.guilds.cache.forEach(async (guild) => {
      await client.inviteTracker.fetchAndCache(guild);
    });
    console.log('✅ Invite Tracker initialized');

    console.log(`✅ Logged in as ${client.user.tag}`);
  },
};