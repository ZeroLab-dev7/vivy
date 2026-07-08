const { connectDatabase } = require('/home/ubuntu/zero-lab-bots/vivy/db/connection');
const { CustomCommand, GuildSettings } = require('/home/ubuntu/zero-lab-bots/vivy/db/models');
const CustomCommandService = require('/home/ubuntu/zero-lab-bots/vivy/services/customCommandService');

const mockGuildId = '999999999999999999';

// Mock Message Object
const mockMessage = {
    author: {
        id: '1218037013966491770',
        username: 'testuser'
    },
    guild: {
        id: mockGuildId,
        name: 'Test Guild',
        memberCount: 42
    },
    channel: {
        id: '111111111111111111'
    },
    content: '?website',
    replied: false,
    async reply(options) {
        this.replied = true;
        this.replyOptions = options;
        console.log('Message Reply Triggered with options:', JSON.stringify(options, null, 2));
        return this;
    },
    catch() {}
};

// Mock Interaction Object
const mockInteraction = {
    user: {
        id: '1218037013966491770',
        username: 'testuser'
    },
    guild: {
        id: mockGuildId,
        name: 'Test Guild',
        memberCount: 42
    },
    channel: {
        id: '111111111111111111'
    },
    replied: false,
    async reply(options) {
        this.replied = true;
        this.replyOptions = options;
        console.log('Interaction Reply Triggered with options:', JSON.stringify(options, null, 2));
        return this;
    },
    catch() {}
};

async function run() {
    await connectDatabase();
    console.log('Database connected.');

    // 1. Clean existing records
    await CustomCommand.destroy({ where: { guild_id: mockGuildId } });
    await GuildSettings.destroy({ where: { guild_id: mockGuildId } });

    // Set mock prefix
    await GuildSettings.create({
        guild_id: mockGuildId,
        prefix: '?'
    });

    // 2. Create mock custom prefix command
    const prefixCmd = await CustomCommand.create({
        guild_id: mockGuildId,
        name: 'website',
        type: 'prefix',
        reply_template: 'Hello {user}! Check our site at https://zerolab.best for guild {guild} ({memberCount} members).',
        buttons_json: '[]',
        conditions: '[]'
    });
    console.log('Created prefix command:', prefixCmd.name);

    // 3. Create mock custom slash command
    const slashCmd = await CustomCommand.create({
        guild_id: mockGuildId,
        name: 'ping',
        type: 'slash',
        reply_template: 'Pong! Active user is {username} in <#{channel}>.',
        buttons_json: '[]',
        conditions: '[]'
    });
    console.log('Created slash command:', slashCmd.name);

    // 4. Test Prefix Command Matching & Execution
    console.log('\n--- Testing Prefix Command Match & Execute ---');
    const matched = await CustomCommandService.matchAndExecute(mockMessage);
    console.log('Match Result (expected true):', matched);
    console.log('Reply options content check:', mockMessage.replyOptions?.content);

    // 5. Test Slash Command Interaction Execution
    console.log('\n--- Testing Slash Command Interaction Execute ---');
    await CustomCommandService.executeInteraction(slashCmd, mockInteraction);
    console.log('Reply options content check:', mockInteraction.replyOptions?.content);

    // Clean up
    await CustomCommand.destroy({ where: { guild_id: mockGuildId } });
    await GuildSettings.destroy({ where: { guild_id: mockGuildId } });
    console.log('\nCleaned database records.');
    process.exit(0);
}

run().catch(err => {
    console.error(err);
    process.exit(1);
});
