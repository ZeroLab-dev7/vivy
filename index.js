const { Client, GatewayIntentBits, Partials, Collection } = require('discord.js');
const config = require('./config');
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

  } catch (error) {
    console.error('❌ Startup Error:', error);
  }
};

// 4. Global Error Handling
process.on("unhandledRejection", (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on("uncaughtException", (err) => {
  console.error('Uncaught Exception:', err);
});

init();