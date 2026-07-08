const { UserXP, VoiceSession } = require('./db/models');

async function run() {
    try {
        const userId = '1218037013966491770';
        const guildId = '1291865555753762907';

        const record = await UserXP.findOne({ where: { user_id: userId, guild_id: guildId } });
        const session = await VoiceSession.findOne({ where: { user_id: userId, guild_id: guildId } });
        console.log("=== Verification Status ===");
        console.log("Current Voice Time (min):", record.voice_time_min);
        console.log("Current Voice XP:", record.voice_xp);
        console.log("Session last grant:", session ? session.last_xp_grant : "No Session");
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

run();
