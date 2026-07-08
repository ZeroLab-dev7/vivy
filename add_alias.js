const { sequelize } = require('./db/connection');
const CustomAlias = require('./db/models/CustomAlias');

async function addAlias() {
    try {
        await sequelize.authenticate();
        console.log('Connected.');

        // Target Guild from inspection
        const guildId = '1458164989708730552';

        await CustomAlias.create({
            guild_id: guildId,
            alias: 'a',
            command_name: 'avatar',
            is_prefixless: true
        });

        console.log('✅ Manually added alias: a -> avatar (noprefix)');

        const aliases = await CustomAlias.findAll({ where: { guild_id: guildId } });
        console.log('Current Aliases:', JSON.stringify(aliases, null, 2));

        await sequelize.close();
    } catch (e) {
        console.error('Error adding alias:', e);
    }
}

addAlias();
