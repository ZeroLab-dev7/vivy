const { ActivityType } = require('discord.js');
const { checkExpiredMutes } = require('../utils/muteManager');

module.exports = {
  name: 'clientReady',
  once: true,
  async execute(client) {
    const statuses = [
      'https://vivy.pro/',
      '?help',
      '?dashboard to manage server',
    ];
    let index = 0;

    const setBotPresence = () => {
      client.user.setPresence({
        status: 'online',
        activities: [
          {
            type: ActivityType.Playing,
            name: statuses[index],
          },
        ],
        afk: false,
        device: {
          mobile: true,
        },
      });
      index = (index + 1) % statuses.length;
    };

    // Set initial status
    setBotPresence();

    // Rotate status every 15 minutes (Warning: Discord enforces a rate limit of 5 presence updates per 60 seconds per connection, which may cause some updates to be queued, delayed, or ignored)
    setInterval(setBotPresence, 60000);

    console.log('✅ Background tasks initialized: Mute Expiry Check');
    // Check mutes every 30 seconds
    setInterval(() => checkExpiredMutes(client), 30000);
    checkExpiredMutes(client);

    // Initialize Giveaway Expiry Check
    const GiveawayService = require('../services/giveawayService');
    console.log('✅ Background tasks initialized: Giveaway Expiry Check');
    // Check giveaways every 30 seconds
    setInterval(() => GiveawayService.checkAndResolveGiveaways(client), 30000);
    GiveawayService.checkAndResolveGiveaways(client);

    // Initialize Broadcast Expiry Check
    const BroadcastService = require('../services/broadcastService');
    console.log('✅ Background tasks initialized: Broadcast Expiry Check');
    setInterval(() => BroadcastService.checkAndSendScheduled(client), 30000);
    BroadcastService.checkAndSendScheduled(client);

    // Initialize Leveling Voice XP Check
    const LevelService = require('../services/levelService');
    console.log('✅ Background tasks initialized: Voice XP Check');
    setInterval(() => LevelService.checkVoiceXP(client), 60000);

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