const { AutoModSettings } = require('../db/models');

async function test() {
    try {
        const guildId = '1491234165901889629';
        console.log("Upserting automod settings...");
        const res = await AutoModSettings.upsert({
            guild_id: guildId,
            spam_enabled: true,
            links_enabled: true,
            invites_enabled: true,
            bad_words_enabled: true,
            bad_words_list: 'zb',
            punishment: 'warn'
        });
        console.log("Upsert response:", res);

        const record = await AutoModSettings.findByPk(guildId);
        console.log("Verifying saved record:", record ? record.toJSON() : "NOT FOUND");
    } catch (e) {
        console.error("UPSERT ERROR:", e);
    }
    process.exit(0);
}

test();
