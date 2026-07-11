const { Client, GatewayIntentBits, Partials, Collection, SectionBuilder, ButtonBuilder, ContainerBuilder } = require('discord.js');
const config = require('./config');

// Override SectionBuilder.prototype.toJSON to fix a bug in @discordjs/builders where accessory is required
const originalSectionToJSON = SectionBuilder.prototype.toJSON;
SectionBuilder.prototype.toJSON = function () {
    if (this.accessory === undefined) {
        this.accessory = new ButtonBuilder().setCustomId('dummy').setLabel('dummy');
        const json = originalSectionToJSON.call(this);
        delete json.accessory;
        this.accessory = undefined;
        return json;
    }
    return originalSectionToJSON.call(this);
};

// Extension to allow setting thumbnail accessory directly in ContainerBuilder chain
ContainerBuilder.prototype.setThumbnailAccessory = function (accessory) {
    const section = this.components.find(c => c instanceof SectionBuilder || c.constructor?.name === 'SectionBuilder');
    if (section) {
        section.setThumbnailAccessory(accessory);
    }
    return this;
};
const { connectDatabase } = require('./db/connection');
const loadEvents = require('./handlers/eventHandler');
const loadCommands = require('./handlers/commandHandler');

// 1. Initialize Client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildInvites,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessageTyping,
    GatewayIntentBits.GuildWebhooks,
    GatewayIntentBits.GuildModeration,
    GatewayIntentBits.GuildIntegrations,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildScheduledEvents,
  ],
  partials: [
    Partials.User,
    Partials.Channel,
    Partials.Message,
    Partials.GuildMember,
    Partials.Reaction,
  ],
  allowedMentions: {
    parse: [],
    users: [],
    roles: [],
    repliedUser: false
  }
});

// 2. Attach Collections
client.commands = new Collection();
client.slashCommands = new Collection();

// 3. Main Init Function
const init = async () => {
  try {
    console.log('🚀 Starting bot...');

    // Connect to Database
    await connectDatabase();

    // Load Handlers
    loadEvents(client);
    await loadCommands(client);

    // Login
    await client.login(config.token);
    console.log(`✅ Logged in as ${client.user.tag}`);

    // Sync all custom slash commands from database on startup
    const CustomCommandService = require('./services/customCommandService');
    CustomCommandService.syncAllGuildsSlashCommands(client).catch(err => {
        console.error('❌ Failed to sync custom commands on startup:', err);
    });

    // Start Dashboard Server
    const startDashboard = require('./server/server');
    startDashboard(client);

    // Daily premium expiry cleanup — runs every 24h
    const { revokeExpiredPremium } = require('./utils/premiumHelper');
    setInterval(async () => {
        await revokeExpiredPremium();
    }, 24 * 60 * 60 * 1000); // every 24 hours
    // Also run once on startup
    revokeExpiredPremium().catch(err => console.error('[Premium] Startup expiry check failed:', err));

  } catch (error) {
    console.error('❌ Startup Error:', error);
  }
};

// 4. Global Error Handling
const recordGlobalError = async (err) => {
  try {
    const { BotError } = require('./db/models');
    const message = err?.message || String(err || 'Unknown error');
    const stack = err?.stack || null;
    
    const existing = await BotError.findOne({ where: { message, stack } });
    if (existing) {
        await existing.increment('count');
        await existing.update({ last_occurred: new Date() });
    } else {
        await BotError.create({
            message,
            stack,
            count: 1,
            last_occurred: new Date()
        });
    }
  } catch (dbErr) {
    console.error('Failed to log error to database:', dbErr);
  }
};

process.on("unhandledRejection", (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  recordGlobalError(reason).catch(() => {});
});

process.on("uncaughtException", (err) => {
  console.error('Uncaught Exception:', err);
  recordGlobalError(err).catch(() => {});
});

init();