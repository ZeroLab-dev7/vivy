const { sequelize } = require('./connection');
const LogSettings = require('./models/LogSettings');

async function sync() {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');

        // Sync ONLY LogSettings
        await LogSettings.sync({ alter: true });
        console.log('LogSettings synced successfully.');
    } catch (error) {
        console.error('Sync failed:', error);
    } finally {
        await sequelize.close();
    }
}

sync();
