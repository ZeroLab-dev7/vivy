const { AutoModSettings } = require('../db/models');
const { connectDatabase } = require('../db/connection');

async function test() {
    try {
        await connectDatabase();
        console.log('DB connected');
        
        const guildId = '1487265229183389769';
        const data = {
            spam_enabled: true,
            links_enabled: true,
            invites_enabled: true,
            bad_words_enabled: true,
            bad_words_list: 'zabi',
            punishment: 'warn'
        };
        
        console.log('Running upsert...');
        const [record, created] = await AutoModSettings.upsert({
            guild_id: guildId,
            ...data
        });
        console.log('Upsert succeeded. Created:', created);
        
        const updatedRecord = await AutoModSettings.findByPk(guildId);
        console.log('Record after upsert:', updatedRecord.toJSON());
    } catch (e) {
        console.error('Upsert failed:', e);
    }
    process.exit(0);
}

test();
