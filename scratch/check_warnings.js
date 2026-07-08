const { Warning } = require('../db/models');
const { connectDatabase } = require('../db/connection');

async function check() {
    try {
        await connectDatabase();
        console.log('Database connected.');
        const warnings = await Warning.findAll({ limit: 10, order: [['id', 'DESC']] });
        console.log(`Found ${warnings.length} warnings:`);
        warnings.forEach(w => console.log(w.toJSON()));
    } catch (err) {
        console.error(err);
    }
    process.exit(0);
}

check();
