const express = require('express');
const axios = require('axios');
const { connectDatabase } = require('../db/connection');

async function runTests() {
    await connectDatabase();
    console.log('Database connected.');

    const app = express();
    app.use(express.json());

    // Injected mock developer session middleware (Guild ID: 1291865555753762907, Role ID: 1297545090168000604)
    app.use((req, res, next) => {
        req.session = {
            user: { id: '111222333444555', username: 'TestDeveloper' },
            isDeveloper: true // Bypass Discord member fetch to test endpoint logic directly
        };
        next();
    });

    // Mock client setup
    const mockClient = {
        user: { id: '1481773011668434975', tag: 'Vivy#9489' },
        guilds: {
            cache: {
                size: 24,
                values: () => [
                    { 
                        id: '1291865555753762907', 
                        name: 'ZeroLab Studio', 
                        memberCount: 50, 
                        ownerId: '111222333444555', 
                        iconURL: () => null,
                        channels: {
                            cache: {
                                find: () => ({
                                    id: '111',
                                    name: 'general',
                                    type: 0,
                                    send: async (msg) => { console.log('[MOCK CHANNEL SEND]', JSON.stringify(msg)); }
                                })
                            }
                        },
                        members: {
                            me: { id: 'bot_id' }
                        }
                    }
                ]
            }
        },
        commands: { keys: () => ['ping', 'warn'] },
        slashCommands: { keys: () => ['ping', 'warn', 'economy'] }
    };
    app.set('discordClient', mockClient);

    // Mount developer router
    const developerRouter = require('../server/routes/developer');
    app.use('/api/developer', developerRouter);

    // Listen on a test port (3032)
    const server = app.listen(3032, async () => {
        console.log('Test Developer Portal server listening on port 3032.');

        try {
            console.log('\n--- 1. Testing GET /api/developer/dashboard-stats ---');
            let res = await axios.get('http://127.0.0.1:3032/api/developer/dashboard-stats');
            console.log('Status:', res.status, 'Servers:', res.data.totalServers, 'Uptime:', res.data.uptime);

            console.log('\n--- 2. Testing GET /api/developer/servers ---');
            res = await axios.get('http://127.0.0.1:3032/api/developer/servers');
            console.log('Status:', res.status, 'Count:', res.data.length, 'First Server Name:', res.data[0]?.name);

            console.log('\n--- 3. Testing POST /api/developer/premium (Grant Premium) ---');
            res = await axios.post('http://127.0.0.1:3032/api/developer/premium', {
                guildId: '1291865555753762907',
                expiresAt: new Date(Date.now() + 1000 * 60 * 60).toISOString()
            });
            console.log('Status:', res.status, 'Response Body:', res.data);

            console.log('\n--- 4. Testing GET /api/developer/premium (List Premium) ---');
            res = await axios.get('http://127.0.0.1:3032/api/developer/premium');
            console.log('Status:', res.status, 'Count:', res.data.length, 'Premium Guild:', res.data[0]?.guild_id);

            console.log('\n--- 5. Testing DELETE /api/developer/premium/:guildId (Revoke Premium) ---');
            res = await axios.delete('http://127.0.0.1:3032/api/developer/premium/1291865555753762907');
            console.log('Status:', res.status, 'Response Body:', res.data);

            console.log('\n--- 6. Testing GET /api/developer/system-status ---');
            res = await axios.get('http://127.0.0.1:3032/api/developer/system-status');
            console.log('Status:', res.status, 'RAM used:', res.data.ram?.usedMB, 'CPU usage:', res.data.cpu);

            console.log('\n--- 7. Testing POST /api/developer/bot-controls (Toggle Maintenance Mode) ---');
            res = await axios.post('http://127.0.0.1:3032/api/developer/bot-controls', {
                action: 'toggle-maintenance'
            });
            console.log('Status:', res.status, 'Maintenance State:', res.data.maintenance);

            // Re-toggle to disable maintenance mode after test
            res = await axios.post('http://127.0.0.1:3032/api/developer/bot-controls', {
                action: 'toggle-maintenance'
            });
            console.log('Restored Maintenance State:', res.data.maintenance);

            console.log('\n--- 8. Testing POST /api/developer/broadcast ---');
            res = await axios.post('http://127.0.0.1:3032/api/developer/broadcast', {
                title: 'Global System Update',
                content: 'The system has been updated. Thanks for using Vivy!',
                type: 'embed'
            });
            console.log('Status:', res.status, 'Broadcast ID:', res.data.broadcastId);

            console.log('\n--- 9. Testing GET /api/developer/broadcasts ---');
            res = await axios.get('http://127.0.0.1:3032/api/developer/broadcasts');
            console.log('Status:', res.status, 'Count:', res.data.length, 'First Broadcast Content:', res.data[0]?.content);

            console.log('\n--- 10. Testing GET /api/developer/audit-logs ---');
            res = await axios.get('http://127.0.0.1:3032/api/developer/audit-logs');
            console.log('Status:', res.status, 'Count:', res.data.length, 'Last Action:', res.data[0]?.action);

            console.log('\nAll Developer Portal integration tests executed successfully!');
        } catch (err) {
            console.error('Test failed with error:', err.response ? {
                status: err.response.status,
                data: err.response.data
            } : err.message);
        } finally {
            server.close(() => {
                console.log('Test Developer Portal server stopped.');
                process.exit(0);
            });
        }
    });
}

runTests().catch(err => {
    console.error('Test script startup error:', err);
    process.exit(1);
});
