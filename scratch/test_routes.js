const express = require('express');
const axios = require('axios');
const path = require('path');
const { connectDatabase } = require('../db/connection');
const CustomCommandService = require('../services/customCommandService');
const GiveawayService = require('../services/giveawayService');

// Stub Discord-touching methods to avoid real API errors during routing test
CustomCommandService.syncGuildSlashCommands = async (client, guildId) => {
    console.log(`[TEST STUB] syncGuildSlashCommands called for guild ${guildId}`);
};

GiveawayService.startGiveaway = async (guild, channel, prize, duration, winners) => {
    console.log(`[TEST STUB] startGiveaway called on channel ${channel.id} for prize "${prize}"`);
    return { id: 99999 };
};

async function test() {
    await connectDatabase();
    console.log('Database connected.');

    const { CustomCommand } = require('../db/models');
    await CustomCommand.destroy({ where: { guild_id: '1487265229183389769' } });
    console.log('Cleaned custom commands for target guild.');

    const app = express();
    
    // Injected mock session middleware to bypass OAuth check and permission check
    app.use((req, res, next) => {
        req.session = {
            user: { id: '123456789' },
            guilds: [
                {
                    id: '1487265229183389769', // Unix's server
                    name: "Unix's server",
                    owner: true,
                    permissions: '8' // Administrator
                }
            ]
        };
        next();
    });

    app.use(express.json());

    // Mock client to satisfy api.js dependencies
    const mockClient = {
        user: { id: '1481773011668434975' },
        guilds: {
            cache: {
                get: (id) => ({
                    id,
                    name: "Unix's server",
                    channels: {
                        cache: {
                            get: (chanId) => ({
                                id: chanId,
                                name: 'general',
                                type: 0 // Text channel
                            })
                        }
                    }
                })
            }
        }
    };
    app.set('discordClient', mockClient);

    // Mount the routes
    const apiRouter = require('../server/routes/api');
    app.use('/api', apiRouter);

    // Start a temporary test server on port 3031
    const server = app.listen(3031, async () => {
        console.log('Test server listening on port 3031.');

        try {
            console.log('\n--- Test 1: POST /api/guilds/1487265229183389769/config/commands ---');
            const resCommand = await axios.post('http://127.0.0.1:3031/api/guilds/1487265229183389769/config/commands', {
                name: 'testcmd',
                type: 'prefix',
                reply: 'This is a test reply!'
            });
            console.log('Status Code:', resCommand.status);
            console.log('Response Body:', resCommand.data);

            console.log('\n--- Test 2: POST /api/guilds/1487265229183389769/config/giveaway ---');
            const resGiveaway = await axios.post('http://127.0.0.1:3031/api/guilds/1487265229183389769/config/giveaway', {
                channelId: '111222333444555',
                prize: 'A cool game',
                winners: '2',
                duration: '10'
            });
            console.log('Status Code:', resGiveaway.status);
            console.log('Response Body:', resGiveaway.data);

            console.log('\n--- Test 3: POST /api/guilds/1487265229183389769/config/welcome (Verify generic route is not broken) ---');
            const resWelcome = await axios.post('http://127.0.0.1:3031/api/guilds/1487265229183389769/config/welcome', {
                enabled: true,
                channel_id: '111222333444555',
                message: 'Welcome {user}!'
            });
            console.log('Status Code:', resWelcome.status);
            console.log('Response Body:', resWelcome.data);

            console.log('\nAll tests passed successfully!');
        } catch (err) {
            console.error('Test failed with error:', err.response ? {
                status: err.response.status,
                data: err.response.data
            } : err.message);
        } finally {
            server.close(() => {
                console.log('Test server stopped.');
                process.exit(0);
            });
        }
    });
}

test().catch(err => {
    console.error('Startup error:', err);
    process.exit(1);
});
