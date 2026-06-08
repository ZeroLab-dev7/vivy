require('dotenv').config();

module.exports = {
    token: process.env.TOKEN,
    clientId: process.env.CLIENT_ID,
    guildId: process.env.GUILD_ID,
    databasePath: './database.sqlite',
    colors: {
        primary: '#00f5ff',
        success: '#00ff00',
        error: '#ff0000',
        warning: '#ffff00'
    },
    // Add other global config values here
};
