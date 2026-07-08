const { sequelize } = require('../db/connection');
const signature = require('cookie-signature');
const dotenv = require('dotenv');
const path = require('path');

// Load env variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const secret = process.env.SESSION_SECRET;
if (!secret) {
    console.error('SESSION_SECRET not found in .env');
    process.exit(1);
}

async function run() {
    await sequelize.authenticate();
    console.log('Database connected.');

    const sessionId = 'devagenttestsessionid';
    const signedCookie = 's:' + signature.sign(sessionId, secret);
    
    const sessionData = {
        cookie: {
            originalMaxAge: 7 * 24 * 60 * 60 * 1000,
            expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            secure: false,
            httpOnly: true,
            path: '/'
        },
        user: {
            id: '1291865555753762907',
            username: 'DevAgent',
            global_name: 'Dev Agent',
            avatar: null
        },
        isDeveloper: true
    };

    const now = new Date();
    const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    // Table name is 'dashboard_sessions'
    await sequelize.query(
        `INSERT OR REPLACE INTO dashboard_sessions (sid, expires, data, created_at, updated_at) VALUES (?, ?, ?, ?, ?);`,
        {
            replacements: [sessionId, expires, JSON.stringify(sessionData), now, now]
        }
    );

    console.log('Session inserted successfully!');
    console.log('Cookie Name: vivy.sid');
    console.log('Cookie Value:', signedCookie);
    process.exit(0);
}

run().catch(console.error);
