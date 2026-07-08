require('dotenv').config({ override: true });
console.log('SESSION_SECRET set:', !!process.env.SESSION_SECRET, '(length:', (process.env.SESSION_SECRET || '').length + ')');
console.log('OAUTH_CLIENT_SECRET set:', !!process.env.OAUTH_CLIENT_SECRET);
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('BOT_OWNER_ID set:', !!process.env.BOT_OWNER_ID);
console.log('All critical env vars OK!');
