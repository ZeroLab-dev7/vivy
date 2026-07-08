const express = require('express');
const router = express.Router();
const axios = require('axios');
const config = require('../../config');
const {
    WelcomeSettings, AutoModSettings, LevelConfig, TicketConfig,
    VerificationConfig, MusicConfig, AiConfig, EconomyConfig, StarboardConfig,
    DashboardAuditLog, DashboardApiKey, BackupInstance, GuildSettings,
    WarnSetup, JailSetup, MuteSetup, VerificationRoles, AntiLink, ApplySetup,
    AntiBotSetup, AutoRoleSetup, LogSettings, RoomSettings, AntiWebhook, Warning,
    CustomCommand, PremiumServer, LevelReward, XPBoost, VoiceSession, LevelHistory, LevelLeaderboardCache,
    UserXP
} = require('../../db/models');

const BackupService  = require('../../services/backupService');
const GeneralService = require('../../services/generalService');

// ── Allowed module names (whitelist) ────────────────────────
const ALLOWED_MODULES = new Set([
    'warn', 'jail', 'mute', 'verification', 'antilink', 'apply',
    'antibot', 'antiwebhook', 'autorole', 'logs', 'rooms',
    'guildsettings', 'automod', 'welcome', 'economy', 'leveling'
]);

// ── Middleware: require authenticated session ────────────────
const ensureAuthenticated = (req, res, next) => {
    if (!req.session || !req.session.user) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    next();
};

// ── Middleware: validate guildId format ──────────────────────
const validateGuildId = (req, res, next) => {
    if (!/^\d{17,19}$/.test(req.params.guildId)) {
        return res.status(400).json({ error: 'Invalid guild ID format.' });
    }
    next();
};

// ── Middleware: verify user has Manage Server on this guild ───
const MANAGE_GUILD   = 0x20n;  // Manage Server
const ADMINISTRATOR  = 0x8n;   // Administrator (implies all permissions)

/**
 * Safely converts a Discord permissions string to BigInt.
 * Clamps to 53-bit safe range to prevent unexpected overflow behavior.
 * Discord permissions are 53-bit integers in their API.
 */
function parsePermissions(raw) {
    try {
        const n = BigInt(raw || 0);
        // Discord's maximum permissions value fits in 53 bits; clamp to prevent abuse
        const MAX_PERMS = (1n << 53n) - 1n;
        return n < 0n ? 0n : n > MAX_PERMS ? MAX_PERMS : n;
    } catch {
        return 0n;
    }
}

const checkGuildPermission = (req, res, next) => {
    const { guildId } = req.params;
    const userGuilds = req.session.guilds || [];
    const guild = userGuilds.find(g => g.id === guildId);
    if (!guild) return res.status(403).json({ error: 'Access denied.' });
    const perms = parsePermissions(guild.permissions);
    // Server owner or users with ADMINISTRATOR/MANAGE_GUILD permission can manage the server
    const isAdmin = guild.owner === true || (perms & ADMINISTRATOR) === ADMINISTRATOR || (perms & MANAGE_GUILD) === MANAGE_GUILD;
    if (!isAdmin) return res.status(403).json({ error: 'Manage Server permission required.' });
    next();
};


// Apply auth check to all API routes
router.use(ensureAuthenticated);

// ── GET /guilds ──────────────────────────────────────────────
router.get('/guilds', async (req, res) => {
    try {
        const client = req.app.get('discordClient');
        let userGuilds = req.session.guilds || [];
        const token = req.session.token;
        const now = Date.now();

        // Refetch guilds if token is present and cache is stale (> 60 seconds) or not present
        if (token && (!req.session.guilds || !req.session.guildsLastFetched || (now - req.session.guildsLastFetched > 60000))) {
            try {
                const response = await axios.get('https://discord.com/api/users/@me/guilds', {
                    headers: { Authorization: `Bearer ${token}` },
                    timeout: 5000
                });
                userGuilds = response.data;
                req.session.guilds = userGuilds;
                req.session.guildsLastFetched = now;
                // Save session changes immediately
                await new Promise((resolve, reject) => {
                    req.session.save((err) => {
                        if (err) reject(err);
                        else resolve();
                    });
                });
            } catch (err) {
                console.error('[GET /api/guilds] Failed to refresh user guilds:', err.message);
                // Fallback to existing session guilds
            }
        }

        const mutualGuilds = userGuilds.map(guild => {
            const perms = parsePermissions(guild.permissions);
            const isAdmin = guild.owner === true || (perms & ADMINISTRATOR) === ADMINISTRATOR || (perms & MANAGE_GUILD) === MANAGE_GUILD;
            const botInstalled = client?.guilds?.cache?.has(guild.id) ?? false;
            const clientId = client?.user?.id || config.clientId || '';
            return {
                id: guild.id,
                name: guild.name,
                icon: guild.icon ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png` : null,
                isAdmin,
                botInstalled,
                inviteLink: `https://discord.com/oauth2/authorize?client_id=${encodeURIComponent(clientId)}&permissions=8&scope=bot%20applications.commands&guild_id=${guild.id}&disable_guild_select=true`
            };
        });

        res.json(mutualGuilds);
    } catch (err) {
        console.error('[GET /api/guilds] Error:', err.message);
        // Never expose internal error message
        res.status(500).json({ error: 'Failed to fetch guilds.' });
    }
});

// ── GET /guilds/:guildId — all config in one shot ────────────
router.get('/guilds/:guildId', validateGuildId, checkGuildPermission, async (req, res) => {
    const { guildId } = req.params;
    const client = req.app.get('discordClient');
    const guild = client.guilds.cache.get(guildId);
    if (!guild) return res.status(404).json({ error: 'Bot is not in this server.' });

    const channels = guild.channels.cache
        .filter(c => [0, 2, 4, 5].includes(c.type))
        .map(c => ({ id: c.id, name: c.name, type: c.type }))
        .sort((a, b) => a.name.localeCompare(b.name));

    const roles = guild.roles.cache
        .filter(r => !r.managed && r.id !== guild.id)
        .map(r => ({ id: r.id, name: r.name, color: r.hexColor }))
        .sort((a, b) => b.position - a.position);

    const safeGet = async (model, pk) => {
        try { return (await model.findOne({ where: { guild_id: pk } }))?.toJSON() || null; }
        catch { return null; }
    };

    const [
        guildSettings, automod, welcome,
        warn, jail, mute, verification,
        antilink, apply, antibot, antiwebhook,
        autorole, logs, rooms, economy, leveling
    ] = await Promise.all([
        safeGet(GuildSettings, guildId),
        safeGet(AutoModSettings, guildId),
        safeGet(WelcomeSettings, guildId),
        safeGet(WarnSetup, guildId),
        safeGet(JailSetup, guildId),
        safeGet(MuteSetup, guildId),
        safeGet(VerificationRoles, guildId),
        safeGet(AntiLink, guildId),
        safeGet(ApplySetup, guildId),
        safeGet(AntiBotSetup, guildId),
        safeGet(AntiWebhook, guildId),
        safeGet(AutoRoleSetup, guildId),
        safeGet(LogSettings, guildId),
        safeGet(RoomSettings, guildId),
        safeGet(EconomyConfig, guildId),
        safeGet(LevelConfig, guildId),
    ]);

    let commands = [];
    try {
        commands = await CustomCommand.findAll({ where: { guild_id: guildId } });
    } catch (err) {
        console.error('Error fetching custom commands for dashboard:', err);
    }

    let isPremium = false;
    let premiumExpiresAt = null;
    try {
        const premiumRecord = await PremiumServer.findOne({ where: { guild_id: guildId, is_premium: true } });
        if (premiumRecord) {
            isPremium = true;
            premiumExpiresAt = premiumRecord.expires_at;
        }
    } catch (err) {
        console.error('Error checking premium status:', err);
    }

    res.json({
        guildName: guild.name,
        guildIcon: guild.iconURL(),
        memberCount: guild.memberCount,
        channels,
        roles,
        isPremium,
        premiumExpiresAt,
        configs: {
            guildSettings,
            guildsettings: guildSettings,
            automod,
            welcome,
            commands,
            warn,
            jail,
            mute,
            verification,
            antilink,
            apply,
            antibot,
            antiwebhook,
            autorole,
            logs,
            rooms,
            economy,
            leveling
        }
    });
});

// ── POST /guilds/:guildId/config/giveaway ────────────────────
router.post('/guilds/:guildId/config/giveaway', validateGuildId, checkGuildPermission, async (req, res) => {
    const { guildId } = req.params;
    const { channelId, prize, winners, duration } = req.body;

    if (!channelId || !prize || !winners || !duration) {
        return res.status(400).json({ error: 'All giveaway fields are required.' });
    }

    const parsedWinners = parseInt(winners, 10);
    const parsedDuration = parseInt(duration, 10);

    if (isNaN(parsedWinners) || parsedWinners < 1) {
        return res.status(400).json({ error: 'Winners count must be a positive integer.' });
    }

    if (isNaN(parsedDuration) || parsedDuration < 1) {
        return res.status(400).json({ error: 'Duration must be a positive integer.' });
    }

    const client = req.app.get('discordClient');
    const guild = client?.guilds?.cache?.get(guildId);
    if (!guild) {
        return res.status(404).json({ error: 'Bot is not in this server.' });
    }

    const channel = guild.channels.cache.get(channelId);
    if (!channel) {
        return res.status(404).json({ error: 'Channel not found.' });
    }

    try {
        const GiveawayService = require('../../services/giveawayService');
        const giveaway = await GiveawayService.startGiveaway(
            guild,
            channel,
            prize,
            parsedDuration,
            parsedWinners
        );

        res.json({ success: true, giveawayId: giveaway.id });
    } catch (e) {
        console.error('[POST giveaway] Error launching giveaway:', e);
        res.status(500).json({ error: 'Failed to launch giveaway.' });
    }
});

// ── POST /guilds/:guildId/config/commands ────────────────────
router.post('/guilds/:guildId/config/commands', validateGuildId, checkGuildPermission, async (req, res) => {
    const { guildId } = req.params;
    const { name, type, reply, id } = req.body;

    if (!name || !reply) {
        return res.status(400).json({ error: 'Command name and response are required.' });
    }

    // Discord slash command name validation: lowercase alphanumeric/dashes, 1-32 chars
    const cleanName = name.trim().toLowerCase();
    if (type === 'slash') {
        if (!/^[a-z0-9-]{1,32}$/.test(cleanName)) {
            return res.status(400).json({ error: 'Slash command names must be 1-32 characters, lowercase alphanumeric or dashes only.' });
        }
    } else {
        if (cleanName.includes(' ') || cleanName.length > 32) {
            return res.status(400).json({ error: 'Command name must not contain spaces and must be under 32 characters.' });
        }
    }

    try {
        let command;
        if (id) {
            command = await CustomCommand.findOne({ where: { id, guild_id: guildId } });
            if (command) {
                await command.update({ name: cleanName, type, reply_template: reply });
            }
        }
        
        if (!command) {
            const existing = await CustomCommand.findOne({ where: { guild_id: guildId, name: cleanName } });
            if (existing) {
                return res.status(400).json({ error: `A command named "${cleanName}" already exists.` });
            }
            command = await CustomCommand.create({
                guild_id: guildId,
                name: cleanName,
                type,
                reply_template: reply,
                buttons_json: '[]',
                conditions: '[]'
            });
        }

        try {
            await GeneralService.logAction(guildId, req.session.user.id, `Created/Updated custom command /${cleanName}`, null, null);
        } catch {}

        const client = req.app.get('discordClient');
        if (client) {
            const CustomCommandService = require('../../services/customCommandService');
            await CustomCommandService.syncGuildSlashCommands(client, guildId);
        }

        res.json({ success: true, command });
    } catch (e) {
        console.error('[POST commands] Save error:', e);
        res.status(500).json({ error: 'Failed to save custom command.' });
    }
});

// ── DELETE /guilds/:guildId/config/commands/:id ──────────────
router.delete('/guilds/:guildId/config/commands/:id', validateGuildId, checkGuildPermission, async (req, res) => {
    const { guildId, id } = req.params;

    try {
        const command = await CustomCommand.findOne({ where: { id, guild_id: guildId } });
        if (!command) {
            return res.status(404).json({ error: 'Command not found.' });
        }

        const name = command.name;
        await command.destroy();

        try {
            await GeneralService.logAction(guildId, req.session.user.id, `Deleted custom command /${name}`, null, null);
        } catch {}

        const client = req.app.get('discordClient');
        if (client) {
            const CustomCommandService = require('../../services/customCommandService');
            await CustomCommandService.syncGuildSlashCommands(client, guildId);
        }

        res.json({ success: true });
    } catch (e) {
        console.error('[DELETE command] Error:', e);
        res.status(500).json({ error: 'Failed to delete custom command.' });
    }
});

// ── GET /guilds/:guildId/config/:moduleName ──────────────────
router.get('/guilds/:guildId/config/:moduleName', validateGuildId, checkGuildPermission, async (req, res) => {
    const { guildId, moduleName } = req.params;

    const safeModule = moduleName.toLowerCase();
    if (!ALLOWED_MODULES.has(safeModule)) {
        return res.status(400).json({ error: 'Unknown module.' });
    }

    const modelMap = {
        warn:          { ref: WarnSetup },
        jail:          { ref: JailSetup },
        mute:          { ref: MuteSetup },
        verification:  { ref: VerificationRoles },
        antilink:      { ref: AntiLink },
        apply:         { ref: ApplySetup },
        antibot:       { ref: AntiBotSetup },
        antiwebhook:   { ref: AntiWebhook },
        autorole:      { ref: AutoRoleSetup },
        logs:          { ref: LogSettings },
        rooms:         { ref: RoomSettings },
        guildsettings: { ref: GuildSettings },
        automod:       { ref: AutoModSettings },
        welcome:       { ref: WelcomeSettings },
        economy:       { ref: EconomyConfig },
        leveling:      { ref: LevelConfig },
    };

    const mapping = modelMap[safeModule];
    if (!mapping) return res.status(400).json({ error: 'Unknown module.' });

    try {
        const record = await mapping.ref.findOne({ where: { guild_id: guildId } });
        res.json(record?.toJSON() || null);
    } catch (err) {
        console.error(`[GET config] Error loading ${safeModule}:`, err.message);
        res.status(500).json({ error: 'Failed to load configuration.' });
    }
});

// ── POST /guilds/:guildId/config/:moduleName ─────────────────
router.post('/guilds/:guildId/config/:moduleName', validateGuildId, checkGuildPermission, async (req, res) => {
    const { guildId, moduleName } = req.params;

    // Whitelist module names to prevent prototype pollution / injection
    const safeModule = moduleName.toLowerCase();
    if (!ALLOWED_MODULES.has(safeModule)) {
        return res.status(400).json({ error: 'Unknown module.' });
    }

    const modelMap = {
        warn:          { ref: WarnSetup,         label: 'Warning System' },
        jail:          { ref: JailSetup,          label: 'Jail System' },
        mute:          { ref: MuteSetup,          label: 'Mute System' },
        verification:  { ref: VerificationRoles,  label: 'Verification System' },
        antilink:      { ref: AntiLink,           label: 'Anti-Link' },
        apply:         { ref: ApplySetup,         label: 'Apply Panel' },
        antibot:       { ref: AntiBotSetup,       label: 'Anti-Bot Setup' },
        antiwebhook:   { ref: AntiWebhook,        label: 'Anti-Webhook Setup' },
        autorole:      { ref: AutoRoleSetup,      label: 'Auto Role Setup' },
        logs:          { ref: LogSettings,        label: 'Server Logging' },
        rooms:         { ref: RoomSettings,       label: 'Need Help Rooms' },
        guildsettings: { ref: GuildSettings,      label: 'General Settings' },
        automod:       { ref: AutoModSettings,    label: 'Auto Moderation' },
        welcome:       { ref: WelcomeSettings,    label: 'Welcome & Leave Settings' },
        economy:       { ref: EconomyConfig,      label: 'Economy System' },
        leveling:      { ref: LevelConfig,        label: 'Leveling System' },
    };

    const mapping = modelMap[safeModule];
    if (!mapping) return res.status(400).json({ error: 'Unknown module.' });

    const rawData = req.body;
    console.log(`[ConfigSave] POST module ${safeModule} for guild ${guildId} (${Object.keys(rawData || {}).length} fields)`);

    // Strip dangerous prototype-pollution keys and prevent client from overriding guild_id
    const FORBIDDEN_KEYS = new Set(['__proto__', 'constructor', 'prototype', 'guild_id']);
    if (rawData && typeof rawData === 'object') {
        for (const key of Object.keys(rawData)) {
            if (FORBIDDEN_KEYS.has(key)) {
                return res.status(400).json({ error: 'Invalid request data.' });
            }
        }
    }
    // Build a clean payload with only the supplied (non-forbidden) fields
    const data = Object.fromEntries(
        Object.entries(rawData || {}).filter(([k]) => !FORBIDDEN_KEYS.has(k))
    );

    try {
        await mapping.ref.upsert({ guild_id: guildId, ...data });
        try {
            await GeneralService.logAction(guildId, req.session.user.id, `Updated ${mapping.label}`, null, null);
        } catch { /* audit log failure should not block save */ }

        // Sync to Discord native AutoMod rules in background when either AutoMod or Anti-Link is saved
        if (safeModule === 'automod' || safeModule === 'antilink') {
            const client = req.app.get('discordClient');
            if (client) {
                const AutoModService = require('../../services/autoModService');
                AutoModService.syncToDiscord(client, guildId).catch(err => {
                    console.error('[AutoModSync] Background error:', err.message);
                });
            }
        }

        res.json({ success: true });
    } catch (e) {
        console.error('[POST config] Save error:', e.message);
        res.status(500).json({ error: 'Failed to save configuration.' });
    }
});

// ── GET /guilds/:guildId/analytics ──────────────────────────
router.get('/guilds/:guildId/analytics', validateGuildId, checkGuildPermission, async (req, res) => {
    const { guildId } = req.params;
    const client = req.app.get('discordClient');
    const guild = client.guilds.cache.get(guildId);
    if (!guild) return res.status(404).json({ error: 'Guild not found.' });

    let warningsCount = 0, openTickets = 0;
    try { warningsCount = await Warning.count({ where: { guild_id: guildId } }); } catch {}
    try {
        const { TicketInstance } = require('../../db/models');
        openTickets = await TicketInstance.count({ where: { guild_id: guildId, status: 'open' } });
    } catch {}

    const base = guild.memberCount;
    res.json({
        totalMembers: base,
        onlineMembers: guild.members.cache.filter(m => m.presence?.status && m.presence.status !== 'offline').size,
        warningsIssued: warningsCount,
        openTickets,
        growth: [
            { date: 'Mon', count: Math.max(1, base - 18) },
            { date: 'Tue', count: Math.max(1, base - 13) },
            { date: 'Wed', count: Math.max(1, base - 9) },
            { date: 'Thu', count: Math.max(1, base - 5) },
            { date: 'Fri', count: Math.max(1, base - 2) },
            { date: 'Sat', count: Math.max(1, base - 1) },
            { date: 'Sun', count: base },
        ]
    });
});

// ── Audit Logs ───────────────────────────────────────────────
router.get('/guilds/:guildId/auditlogs', validateGuildId, checkGuildPermission, async (req, res) => {
    const { guildId } = req.params;
    try {
        const logs = await DashboardAuditLog.findAll({
            where: { guild_id: guildId },
            attributes: ['user_id', 'action', 'module', 'created_at'],  // Only safe columns
            order: [['created_at', 'DESC']],
            limit: 50
        });
        res.json(logs);
    } catch { res.json([]); }
});

// ── Backups ──────────────────────────────────────────────────
router.post('/guilds/:guildId/backups', validateGuildId, checkGuildPermission, async (req, res) => {
    const { guildId } = req.params;
    const client = req.app.get('discordClient');
    const guild = client.guilds.cache.get(guildId);
    if (!guild) return res.status(404).json({ error: 'Guild not found.' });
    try {
        const backup = await BackupService.createBackup(guild, req.session.user.id);
        res.json({ success: true, backupId: backup.id });
    } catch (e) {
        console.error('[Backups] Error:', e.message);
        res.status(500).json({ error: 'Backup failed.' });
    }
});

router.get('/guilds/:guildId/backups', validateGuildId, checkGuildPermission, async (req, res) => {
    const { guildId } = req.params;
    try { res.json(await BackupInstance.findAll({ where: { guild_id: guildId } })); }
    catch { res.json([]); }
});

// ── API Keys ─────────────────────────────────────────────────
router.get('/guilds/:guildId/apikeys', validateGuildId, checkGuildPermission, async (req, res) => {
    const { guildId } = req.params;
    try {
        const keys = await DashboardApiKey.findAll({
            where: { guild_id: guildId },
            // Return metadata and a masked key only — never expose the full secret in list endpoints
            attributes: ['label', 'usage_count', 'last_used', 'created_at', 'key']
        });
        // Mask the key: show only first 8 chars (prefix) + last 4 chars
        const masked = keys.map(k => ({
            label: k.label,
            usage_count: k.usage_count,
            last_used: k.last_used,
            created_at: k.created_at,
            key: k.key.length > 12 ? k.key.substring(0, 8) + '••••' + k.key.slice(-4) : '••••'
        }));
        res.json(masked);
    } catch { res.json([]); }
});

router.post('/guilds/:guildId/apikeys', validateGuildId, checkGuildPermission, async (req, res) => {
    const { guildId } = req.params;
    const { label } = req.body;

    // Validate label
    if (!label || typeof label !== 'string' || label.trim().length === 0 || label.length > 100) {
        return res.status(400).json({ error: 'Invalid label.' });
    }

    try {
        res.json(await GeneralService.generateApiKey(guildId, label.trim().slice(0, 100)));
    } catch (e) {
        console.error('[API Keys] Generate error:', e.message);
        res.status(500).json({ error: 'Failed to generate API key.' });
    }
});

router.delete('/guilds/:guildId/apikeys/:key', validateGuildId, checkGuildPermission, async (req, res) => {
    const { guildId, key } = req.params;

    // Validate key format
    if (!/^vivy_[a-z0-9]+$/.test(key)) {
        return res.status(400).json({ error: 'Invalid key format.' });
    }

    await DashboardApiKey.destroy({ where: { key, guild_id: guildId } });
    res.json({ success: true });
});

// ── LEVELING SYSTEM EXTENSIONS ───────────────────────────────

// ── GET Rewards ──
router.get('/guilds/:guildId/leveling/rewards', validateGuildId, checkGuildPermission, async (req, res) => {
    const { guildId } = req.params;
    try {
        const rewards = await LevelReward.findAll({ where: { guild_id: guildId }, order: [['level', 'ASC']] });
        res.json(rewards);
    } catch (err) {
        console.error('Error fetching rewards:', err);
        res.status(500).json({ error: 'Failed to fetch rewards.' });
    }
});

// ── POST Reward ──
router.post('/guilds/:guildId/leveling/rewards', validateGuildId, checkGuildPermission, async (req, res) => {
    const { guildId } = req.params;
    const { level, role_id, is_enabled } = req.body;
    if (!level || !role_id) {
        return res.status(400).json({ error: 'Level and Role ID are required.' });
    }
    try {
        const reward = await LevelReward.create({
            guild_id: guildId,
            level: parseInt(level, 10),
            role_id,
            is_enabled: is_enabled !== false
        });
        try {
            await GeneralService.logAction(guildId, req.session.user.id, `Added level reward: Level ${level} -> Role ${role_id}`, null, null);
        } catch {}
        res.json({ success: true, reward });
    } catch (err) {
        console.error('Error creating reward:', err);
        res.status(500).json({ error: 'Failed to save level reward.' });
    }
});

// ── DELETE Reward ──
router.delete('/guilds/:guildId/leveling/rewards/:id', validateGuildId, checkGuildPermission, async (req, res) => {
    const { guildId, id } = req.params;
    try {
        const reward = await LevelReward.findOne({ where: { id, guild_id: guildId } });
        if (reward) {
            await reward.destroy();
            try {
                await GeneralService.logAction(guildId, req.session.user.id, `Removed level reward for Level ${reward.level}`, null, null);
            } catch {}
        }
        res.json({ success: true });
    } catch (err) {
        console.error('Error deleting reward:', err);
        res.status(500).json({ error: 'Failed to delete reward.' });
    }
});

// ── GET Boosts ──
router.get('/guilds/:guildId/leveling/boosts', validateGuildId, checkGuildPermission, async (req, res) => {
    const { guildId } = req.params;
    try {
        const boosts = await XPBoost.findAll({ where: { guild_id: guildId } });
        res.json(boosts);
    } catch (err) {
        console.error('Error fetching boosts:', err);
        res.status(500).json({ error: 'Failed to fetch boosts.' });
    }
});

// ── POST Boost ──
router.post('/guilds/:guildId/leveling/boosts', validateGuildId, checkGuildPermission, async (req, res) => {
    const { guildId } = req.params;
    const { type, target_id, multiplier, start_time, end_time, is_enabled } = req.body;
    if (!type || !target_id || !multiplier) {
        return res.status(400).json({ error: 'Type, Target ID/Name, and Multiplier are required.' });
    }
    try {
        const boost = await XPBoost.create({
            guild_id: guildId,
            type,
            target_id,
            multiplier: parseFloat(multiplier),
            start_time: start_time ? new Date(start_time) : null,
            end_time: end_time ? new Date(end_time) : null,
            is_enabled: is_enabled !== false
        });
        try {
            await GeneralService.logAction(guildId, req.session.user.id, `Added XP boost: ${type} (${target_id}) x${multiplier}`, null, null);
        } catch {}
        res.json({ success: true, boost });
    } catch (err) {
        console.error('Error creating boost:', err);
        res.status(500).json({ error: 'Failed to save booster.' });
    }
});

// ── DELETE Boost ──
router.delete('/guilds/:guildId/leveling/boosts/:id', validateGuildId, checkGuildPermission, async (req, res) => {
    const { guildId, id } = req.params;
    try {
        const boost = await XPBoost.findOne({ where: { id, guild_id: guildId } });
        if (boost) {
            await boost.destroy();
            try {
                await GeneralService.logAction(guildId, req.session.user.id, `Deleted XP boost of type ${boost.type} for ${boost.target_id}`, null, null);
            } catch {}
        }
        res.json({ success: true });
    } catch (err) {
        console.error('Error deleting boost:', err);
        res.status(500).json({ error: 'Failed to delete booster.' });
    }
});

// ── GET Leaderboard ──
router.get('/guilds/:guildId/leveling/leaderboard', validateGuildId, checkGuildPermission, async (req, res) => {
    const { guildId } = req.params;
    const { type } = req.query;
    try {
        const LevelService = require('../../services/levelService');
        const leaderboard = await LevelService.getLeaderboard(guildId, type || 'total', 100);
        
        // Fetch discord users cache for usernames
        const client = req.app.get('discordClient');
        const guild = client?.guilds.cache.get(guildId);

        // Batch fetch missing members to avoid sequential API requests
        const userIdsToFetch = [];
        if (guild) {
            for (const record of leaderboard) {
                if (!guild.members.cache.has(record.user_id)) {
                    userIdsToFetch.push(record.user_id);
                }
            }
            if (userIdsToFetch.length > 0) {
                try {
                    await guild.members.fetch({ user: userIdsToFetch });
                } catch (err) {
                    console.error('[Leaderboard] Failed to batch fetch members:', err.message);
                }
            }
        }
        
        const mapped = [];
        const config = await LevelService.getOrCreateConfig(guildId);
        for (const record of leaderboard) {
            const member = guild ? guild.members.cache.get(record.user_id) : null;
            const totalXP = LevelService.getTotalXP(record.level, record.xp, config);
            mapped.push({
                user_id: record.user_id,
                username: member ? member.user.username : 'Unknown User',
                avatar: member ? member.user.displayAvatarURL({ dynamic: true }) : null,
                xp: totalXP,
                level: record.level,
                messages_count: record.messages_count,
                voice_time_min: record.voice_time_min,
                xp_today: record.xp_today
            });
        }
        res.json(mapped);
    } catch (err) {
        console.error('Error fetching leaderboard:', err);
        res.status(500).json({ error: 'Failed to fetch leaderboard.' });
    }
});

// ── GET Analytics ──
router.get('/guilds/:guildId/leveling/analytics', validateGuildId, checkGuildPermission, async (req, res) => {
    const { guildId } = req.params;
    const { Op } = require('sequelize');
    try {
        const now = new Date();
        const startOfDay = new Date(now.setHours(0,0,0,0));
        
        const xpToday = await LevelHistory.sum('xp_gained', {
            where: { guild_id: guildId, timestamp: { [Op.gte]: startOfDay }, action: { [Op.ne]: 'level_up' } }
        }) || 0;

        const activeUsers = await UserXP.count({
            where: { guild_id: guildId, last_xp_time: { [Op.gte]: startOfDay } }
        });

        const dailyTrends = [];
        for (let i = 6; i >= 0; i--) {
            const dStart = new Date();
            dStart.setDate(dStart.getDate() - i);
            dStart.setHours(0,0,0,0);
            const dEnd = new Date(dStart);
            dEnd.setDate(dEnd.getDate() + 1);

            const dayXP = await LevelHistory.sum('xp_gained', {
                where: { guild_id: guildId, timestamp: { [Op.gte]: dStart, [Op.lt]: dEnd }, action: { [Op.ne]: 'level_up' } }
            }) || 0;

            const dateStr = dStart.toLocaleDateString('en-US', { weekday: 'short' });
            dailyTrends.push({ date: dateStr, count: dayXP });
        }

        res.json({
            xpToday,
            activeUsers,
            growth: dailyTrends
        });
    } catch (err) {
        console.error('Error loading analytics:', err);
        res.status(500).json({ error: 'Failed to load leveling analytics.' });
    }
});

// ── GET History Logs ──
router.get('/guilds/:guildId/leveling/logs', validateGuildId, checkGuildPermission, async (req, res) => {
    const { guildId } = req.params;
    try {
        const logs = await LevelHistory.findAll({
            where: { guild_id: guildId },
            order: [['timestamp', 'DESC']],
            limit: 50
        });
        
        const client = req.app.get('discordClient');
        const guild = client?.guilds.cache.get(guildId);

        // Batch fetch missing members to avoid sequential API requests
        const userIdsToFetch = [];
        if (guild) {
            for (const log of logs) {
                if (log.user_id !== 'SYSTEM' && !guild.members.cache.has(log.user_id)) {
                    userIdsToFetch.push(log.user_id);
                }
            }
            if (userIdsToFetch.length > 0) {
                try {
                    await guild.members.fetch({ user: userIdsToFetch });
                } catch (err) {
                    console.error('[Logs] Failed to batch fetch members:', err.message);
                }
            }
        }
        
        const mapped = [];
        for (const log of logs) {
            let userTag = 'Unknown User';
            if (log.user_id !== 'SYSTEM') {
                const member = guild ? guild.members.cache.get(log.user_id) : null;
                userTag = member ? member.user.username : log.user_id;
            } else {
                userTag = 'SYSTEM';
            }
            mapped.push({
                id: log.id,
                user_id: log.user_id,
                username: userTag,
                action: log.action,
                xp_gained: log.xp_gained,
                level_before: log.level_before,
                level_after: log.level_after,
                details: log.details,
                timestamp: log.timestamp
            });
        }
        res.json(mapped);
    } catch (err) {
        console.error('Error fetching logs:', err);
        res.status(500).json({ error: 'Failed to fetch logs.' });
    }
});

// ── POST Admin actions ──
router.post('/guilds/:guildId/leveling/admin', validateGuildId, checkGuildPermission, async (req, res) => {
    const { guildId } = req.params;
    const { action, userId, amount, value } = req.body;
    const client = req.app.get('discordClient');
    const LevelService = require('../../services/levelService');

    try {
        if (action === 'resetleaderboard') {
            await LevelService.resetLeaderboard(guildId, client);
            return res.json({ success: true, message: 'Leaderboard reset successfully.' });
        }

        if (!userId) {
            return res.status(400).json({ error: 'User ID is required.' });
        }

        let result;
        if (action === 'addxp') {
            result = await LevelService.addAdminXP(userId, guildId, parseInt(amount, 10), client);
        } else if (action === 'removexp') {
            result = await LevelService.removeAdminXP(userId, guildId, parseInt(amount, 10), client);
        } else if (action === 'setxp') {
            result = await LevelService.setXP(userId, guildId, parseInt(value, 10), client);
        } else if (action === 'setlevel') {
            result = await LevelService.setLevel(userId, guildId, parseInt(value, 10), client);
        } else if (action === 'resetxp') {
            result = await LevelService.resetXP(userId, guildId, client);
        } else {
            return res.status(400).json({ error: 'Invalid admin action.' });
        }
        res.json({ success: true, userXP: result });
    } catch (err) {
        console.error('Admin leveling error:', err);
        res.status(500).json({ error: 'Admin action failed.' });
    }
});

module.exports = router;
