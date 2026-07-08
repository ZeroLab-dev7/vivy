const express = require('express');
const session = require('express-session');
const path = require('path');
const crypto = require('crypto');
const { rateLimit } = require('express-rate-limit');
const authRouter = require('./routes/auth');
const apiRouter = require('./routes/api');
const developerRouter = require('./routes/developer');
const { isDeveloper } = require('../utils/developerHelper');

function startDashboard(client) {
    const app = express();
    app.set('trust proxy', 1);
    const PORT = process.env.PORT || 3030;

    // Remove server fingerprint header
    app.disable('x-powered-by');

    // Save discord client in app instance
    app.set('discordClient', client);

    // ── Rate Limiting ─────────────────────────────────────────
    // Auth endpoint: 20 requests per 15 minutes per IP (prevents brute force / OAuth abuse)
    const authLimiter = rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 20,
        standardHeaders: 'draft-7',
        legacyHeaders: false,
        message: { error: 'Too many requests. Please try again later.' },
        skip: (req) => req.path === '/callback'  // Callback must not be blocked (OAuth flow)
    });

    // General API: 200 requests per 5 minutes per IP
    const apiLimiter = rateLimit({
        windowMs: 5 * 60 * 1000,
        max: 200,
        standardHeaders: 'draft-7',
        legacyHeaders: false,
        message: { error: 'Too many requests. Please try again later.' }
    });

    // Developer API: 100 requests per 5 minutes per IP (tighter — sensitive)
    const devLimiter = rateLimit({
        windowMs: 5 * 60 * 1000,
        max: 100,
        standardHeaders: 'draft-7',
        legacyHeaders: false,
        message: { error: 'Too many requests. Please try again later.' }
    });

    // ── Security Headers ─────────────────────────────────────
    app.use((req, res, next) => {
        // Prevent clickjacking
        res.setHeader('X-Frame-Options', 'DENY');
        // Prevent MIME-type sniffing
        res.setHeader('X-Content-Type-Options', 'nosniff');
        // Enable XSS filter in older browsers
        res.setHeader('X-XSS-Protection', '1; mode=block');
        // Referrer policy
        res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
        // Permissions policy — disable sensitive APIs
        res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
        // Content Security Policy
        res.setHeader('Content-Security-Policy', [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline'",           // unsafe-inline needed for inline scripts in HTML pages
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com",
            "font-src 'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com",
            // Media Discord CDN for avatars/icons; media.discordapp.net for attachment images
            "img-src 'self' data: https://cdn.discordapp.com https://media.discordapp.net https://ui-avatars.com",
            "connect-src 'self'",
            "frame-ancestors 'none'",
            "base-uri 'self'",
            "form-action 'self'",
            "object-src 'none'",
            "upgrade-insecure-requests"
        ].join('; '));
        // HSTS — max 1 year, include subdomains, eligible for preload list
        res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
        // Prevent browsers from opening downloads directly (IE/Edge)
        res.setHeader('X-Download-Options', 'noopen');
        next();
    });

    // ── Body Parsing ─────────────────────────────────────────
    app.use(express.json({ limit: '100kb' }));     // Prevent large payload DoS
    app.use(express.urlencoded({ extended: true, limit: '100kb' }));

    // ── Session Store ─────────────────────────────────────────
    const { sequelize } = require('../db/connection');
    const SequelizeStore = require('connect-session-sequelize')(session.Store);
    const sessionStore = new SequelizeStore({
        db: sequelize,
        tableName: 'dashboard_sessions',
        checkExpirationInterval: 15 * 60 * 1000
    });

    const SESSION_SECRET = process.env.SESSION_SECRET;
    if (!SESSION_SECRET) {
        console.error('[FATAL] SESSION_SECRET is not set. Sessions are insecure. Please set SESSION_SECRET in .env');
        process.exit(1);
    }

    app.use(session({
        secret: SESSION_SECRET,
        store: sessionStore,
        resave: false,
        saveUninitialized: false,
        proxy: true,
        name: 'vivy.sid',           // Don't use default 'connect.sid'
        cookie: {
            secure: process.env.NODE_ENV === 'production',  // true in prod (HTTPS), false in dev
            httpOnly: true,          // Prevent JS access to cookie
            sameSite: 'lax',         // CSRF protection
            maxAge: 7 * 24 * 60 * 60 * 1000  // 7 days
        }
    }));

    // Create session table if it doesn't exist
    sessionStore.sync();

    // ── Block Sensitive Paths ─────────────────────────────────
    app.use((req, res, next) => {
        const sensitivePatterns = [
            /\.env/i,
            /\.git/i,
            /node_modules/i,
            /\.(zip|sql|bak|tar|gz|log)$/i,
            /(package\.json|package-lock\.json|tsconfig\.json|config\.js|config\.json)$/i
        ];
        
        const pathToCheck = req.path;
        if (sensitivePatterns.some(pattern => pattern.test(pathToCheck))) {
            console.warn(`[Security Alert] Blocked access to sensitive path: ${pathToCheck} from ${req.ip}`);
            res.status(404);
            if (req.accepts('html')) {
                return res.sendFile(path.join(__dirname, 'public', '404.html'));
            } else {
                return res.json({ error: 'Not Found' });
            }
        }
        next();
    });

    // ── Redirect legacy .html routes to clean routes ──────────
    app.get('/selector.html', (req, res) => {
        res.redirect(301, '/servers');
    });

    app.get('/dashboard.html', (req, res) => {
        const guildId = req.query.guild;
        // Validate guildId format before using in redirect
        if (guildId && /^\d{17,19}$/.test(guildId)) {
            const tab = req.query.tab && /^[a-z-]+$/.test(req.query.tab) ? req.query.tab : 'overview';
            res.redirect(301, `/servers/${guildId}/${tab}`);
        } else {
            res.redirect(301, '/servers');
        }
    });

    app.get('/developer.html', (req, res) => {
        res.redirect(301, '/developer');
    });

    // ── Static Assets ─────────────────────────────────────────
    app.use(express.static(path.join(__dirname, 'public'), {
        setHeaders: (res) => {
            res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        }
    }));

    // ── Router Mounts ─────────────────────────────────────────
    app.use('/auth/discord', authLimiter, authRouter);
    app.use('/api/developer', devLimiter, developerRouter);
    app.use('/api', apiLimiter, apiRouter);

    // ── Developer Portal Access Control Middleware ───────────
    const ensureDeveloperPage = async (req, res, next) => {
        if (!req.session || !req.session.user) {
            req.session.oauthReturnTo = req.originalUrl;
            return res.redirect('/auth/discord/login');
        }

        if (req.session.isDeveloper === true) {
            return next();
        }

        const userId = req.session.user.id;
        const client = req.app.get('discordClient');
        if (!client) {
            res.status(500);
            if (req.accepts('html')) {
                return res.sendFile(path.join(__dirname, 'public', '500.html'));
            }
            return res.send('Discord client not initialized.');
        }

        try {
            const hasRole = await isDeveloper(userId, client);
            if (!hasRole) {
                res.status(403);
                if (req.accepts('html')) {
                    return res.sendFile(path.join(__dirname, 'public', '403.html'));
                }
                return res.send('Forbidden: Access Denied. Developer role required.');
            }

            // Cache role status
            req.session.isDeveloper = true;
            next();
        } catch (err) {
            console.error('[DevAuthPage] Verification error:', err.message);
            res.status(403);
            if (req.accepts('html')) {
                return res.sendFile(path.join(__dirname, 'public', '403.html'));
            }
            return res.send('Forbidden: Verification failed.');
        }
    };

    // ── Clean Frontend Routes ─────────────────────────────────
    app.get('/developer', ensureDeveloperPage, (req, res) => {
        res.sendFile(path.join(__dirname, 'public', 'developer.html'));
    });

    app.get('/developer/:tab', ensureDeveloperPage, (req, res, next) => {
        if (!/^[a-z-]+$/.test(req.params.tab)) return next();
        res.sendFile(path.join(__dirname, 'public', 'developer.html'));
    });

    app.get('/servers', (req, res) => {
        res.sendFile(path.join(__dirname, 'public', 'selector.html'));
    });

    // Validate guildId format in URL params before serving
    app.get('/servers/:guildId', (req, res, next) => {
        if (!/^\d{17,19}$/.test(req.params.guildId)) return next();
        res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
    });

    app.get('/servers/:guildId/:tab', (req, res, next) => {
        if (!/^\d{17,19}$/.test(req.params.guildId)) return next();
        if (!/^[a-z-]+$/.test(req.params.tab)) return next();
        res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
    });

    // ── Documentation Center ──────────────────────────────────
    app.get('/docs', (req, res) => {
        res.sendFile(path.join(__dirname, 'public', 'docs.html'));
    });

    app.get('/docs/:section', (req, res, next) => {
        if (!/^[a-z0-9-]+$/.test(req.params.section)) return next();
        res.sendFile(path.join(__dirname, 'public', 'docs.html'));
    });

    // ── Catch-all for Unknown Routes (404) ────────────────────
    app.use((req, res, next) => {
        res.status(404);
        if (req.path.startsWith('/api/') || !req.accepts('html')) {
            return res.json({ error: 'Not Found' });
        }
        res.sendFile(path.join(__dirname, 'public', '404.html'));
    });

    // ── Global Error Handler ──────────────────────────────────
    app.use((err, req, res, next) => {
        console.error('[Express Error]', err);
        if (res.headersSent) {
            return next(err);
        }
        res.status(500);
        if (req.accepts('html')) {
            res.sendFile(path.join(__dirname, 'public', '500.html'));
        } else {
            res.json({ error: 'Internal server error.' });
        }
    });

    app.listen(PORT, '127.0.0.1', () => {
        console.log(`📡 Dashboard Express Server running at http://127.0.0.1:${PORT} (bound to localhost only)`);
    });
}

module.exports = startDashboard;
