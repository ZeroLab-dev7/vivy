const express = require('express');
const router = express.Router();
const axios = require('axios');
const crypto = require('crypto');
const config = require('../../config');
const { isDeveloper } = require('../../utils/developerHelper');

// ── Config (NO hardcoded fallbacks for secrets) ──────────────
const CLIENT_ID = process.env.OAUTH_CLIENT_ID;
const CLIENT_SECRET = process.env.OAUTH_CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI || 'https://vivy.pro/auth/discord/callback';

// Fail loudly at startup if critical env vars are missing
if (!CLIENT_SECRET) {
    console.error('[FATAL] OAUTH_CLIENT_SECRET is not set in environment. Dashboard OAuth will not work.');
}

// ── /login — initiate OAuth2 with state (CSRF protection) ────
router.get('/login', (req, res) => {
    const state = crypto.randomBytes(16).toString('hex');
    req.session.oauthState = state;

    // Optional: redirect back to a specific page after login
    const returnTo = req.query.returnTo;
    // Strictly validate returnTo: must be a relative path-only string (no protocol, no host, no //)
    if (returnTo && /^\/[a-zA-Z0-9\/_-]*$/.test(returnTo) && !returnTo.startsWith('//')) {
        req.session.oauthReturnTo = returnTo;
    }

    req.session.save((err) => {
        if (err) {
            console.error('[OAuth] Session save error before redirect:', err);
            return res.status(500).send('Session error. Please try again.');
        }
        const authorizeUrl = `https://discord.com/api/oauth2/authorize?client_id=${encodeURIComponent(CLIENT_ID)}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&scope=identify%20guilds%20guilds.join&state=${state}`;
        res.redirect(authorizeUrl);
    });
});

// ── /callback — exchange code for token ──────────────────────
router.get('/callback', async (req, res) => {
    const { code, state } = req.query;

    if (!code) {
        return res.status(400).send('Missing authorization code.');
    }

    // Validate OAuth state to prevent CSRF
    if (!state || !req.session.oauthState || state !== req.session.oauthState) {
        console.warn('[OAuth] State mismatch — possible CSRF attempt. SessionID:', req.sessionID);
        delete req.session.oauthState;
        res.status(403);
        if (req.accepts('html')) {
            const path = require('path');
            return res.sendFile(path.join(__dirname, '..', 'public', '403.html'));
        }
        return res.send('Invalid OAuth state. Please try logging in again.');
    }
    delete req.session.oauthState;

    try {
        // Exchange code for token
        const tokenResponse = await axios.post('https://discord.com/api/oauth2/token', new URLSearchParams({
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
            grant_type: 'authorization_code',
            code,
            redirect_uri: REDIRECT_URI
        }), {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });

        const { access_token, token_type } = tokenResponse.data;
        if (!access_token) {
            throw new Error('No access_token in Discord response');
        }

        // Fetch User details
        const userResponse = await axios.get('https://discord.com/api/users/@me', {
            headers: { Authorization: `Bearer ${access_token}` }
        });

        const userId = userResponse.data.id;

        // Attempt to auto-join the user to ZeroLab Studio (https://discord.gg/bUcFFGHTrF)
        try {
            const targetGuildId = '1291865555753762907';
            const botToken = config.token;
            if (botToken) {
                await axios.put(
                    `https://discord.com/api/v10/guilds/${targetGuildId}/members/${userId}`,
                    { access_token },
                    {
                        headers: {
                            Authorization: `Bot ${botToken}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );
                console.log(`[OAuth] Successfully auto-joined user ${userId} to guild ${targetGuildId}`);
            } else {
                console.error('[OAuth] Bot token not found in config, cannot auto-join user to guild');
            }
        } catch (joinError) {
            console.error('[OAuth] Auto-join guild error:', joinError.response?.status, joinError.response?.data || joinError.message);
        }

        // Fetch User Guilds
        const guildsResponse = await axios.get('https://discord.com/api/users/@me/guilds', {
            headers: { Authorization: `Bearer ${access_token}` }
        });

        // Store token in session (NOT exposed to frontend)
        req.session.token = access_token;
        req.session.user = userResponse.data;
        req.session.guilds = guildsResponse.data;

        const rawReturnTo = req.session.oauthReturnTo || '/servers';
        delete req.session.oauthReturnTo;
        // Enforce that returnTo is a safe relative path — prevent session hijack via poisoned returnTo
        const safeReturnTo = /^\/[a-zA-Z0-9\/_-]*$/.test(rawReturnTo) && !rawReturnTo.startsWith('//') ? rawReturnTo : '/servers';

        req.session.save((err) => {
            if (err) {
                console.error('[OAuth] Session save error after callback:', err);
                return res.status(500).send('Session error. Please try again.');
            }
            res.redirect(safeReturnTo);
        });

    } catch (error) {
        // Never expose internal error details to the client
        console.error('[OAuth] Token exchange error:', error.response?.status, error.response?.data?.error || error.message);
        res.status(500).send('Authentication failed. Please try again.');
    }
});

// ── /logout ──────────────────────────────────────────────────
router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) console.error('[OAuth] Session destroy error:', err);
        // Cookie flags must match the original session cookie exactly so the browser honours the deletion.
        // In production (HTTPS), 'secure: true' is required for the browser to clear a secure cookie.
        res.clearCookie('vivy.sid', {
            path: '/',
            httpOnly: true,
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production'
        });
        res.redirect('/');
    });
});

// ── /user — return safe subset of user data ──────────────────
router.get('/user', async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ authenticated: false });
    }

    // Determine developer status
    if (req.session.isDeveloper === undefined) {
        const client = req.app.get('discordClient');
        if (client) {
            req.session.isDeveloper = await isDeveloper(req.session.user.id, client);
        } else {
            req.session.isDeveloper = false;
        }
    }

    // Only expose what the frontend needs — never expose access_token
    const { id, username, global_name, avatar, discriminator } = req.session.user;
    res.json({
        authenticated: true,
        user: { id, username, global_name, avatar, discriminator },
        premium: req.session.user.premium || false,
        isDeveloper: req.session.isDeveloper || false
    });
});

module.exports = router;
