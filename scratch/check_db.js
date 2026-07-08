const { AutoModSettings, AntiLink, GuildSettings } = require('../db/models');

async function check() {
    try {
        console.log("=== AutoModSettings ===");
        const configs = await AutoModSettings.findAll();
        configs.forEach(c => {
            console.log(c.toJSON());
        });

        console.log("\n=== AntiLink ===");
        const antilink = await AntiLink.findAll();
        antilink.forEach(a => {
            console.log(a.toJSON());
        });

        console.log("\n=== GuildSettings ===");
        const gs = await GuildSettings.findAll();
        gs.forEach(g => {
            console.log(g.toJSON());
        });
    } catch (e) {
        console.error(e);
    }
    process.exit(0);
}

check();
