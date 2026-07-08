const express = require('express');
const router = express.Router();
const os = require('os');
const fs = require('fs');
const path = require('path');
const { Op } = require('sequelize');
const { sequelize } = require('../../db/connection');
const { 
    DevAuditLog, BotError, CommandLog, PremiumServer, SystemConfig, BroadcastLog, 
    Warning, Mute, JailedUser, TicketInstance, WelcomeSettings, EconomyConfig,
    DevNote
} = require('../../db/models');

// ── Auth Check Middleware: Requires Developer Role in zero-lab-studio ────────
const ensureDeveloper = async (req, res, next) => {
    if (!req.session || !req.session.user) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    // Check cached developer status to avoid rate limits
    if (req.session.isDeveloper === true) {
        if (!req.session.hasLoggedDevLogin) {
            req.session.hasLoggedDevLogin = true;
            logDevAction(req, 'Developer Login').catch(err => console.error('[DevAuth] Login log error:', err));
        }
        return next();
    }

    const userId = req.session.user.id;
    const client = req.app.get('discordClient');
    if (!client) {
        return res.status(500).json({ error: 'Discord client not initialized.' });
    }

    try {
        const devGuildId = '1291865555753762907';
        const devRoleId = '1297545090168000604';

        let guild = client.guilds.cache.get(devGuildId);
        if (!guild) {
            guild = await client.guilds.fetch(devGuildId).catch(() => null);
        }

        if (!guild) {
            console.error(`[DevAuth] Developer guild ${devGuildId} not found in bot cache or fetch`);
            return res.status(403).json({ error: 'Developer guild not found.' });
        }

        const member = await guild.members.fetch(userId).catch(() => null);
        if (!member || !member.roles.cache.has(devRoleId)) {
            return res.status(403).json({ error: 'Access denied. Developer role required.' });
        }

        // Cache role status
        req.session.isDeveloper = true;
        if (!req.session.hasLoggedDevLogin) {
            req.session.hasLoggedDevLogin = true;
            logDevAction(req, 'Developer Login').catch(err => console.error('[DevAuth] Login log error:', err));
        }
        next();
    } catch (err) {
        console.error('[DevAuth] Verification error:', err.message);
        return res.status(403).json({ error: 'Verification failed.' });
    }
};

// Apply dev check to all developer sub-routes
router.use(ensureDeveloper);

// Helper function to log developer actions
async function logDevAction(req, action) {
    try {
        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
        await DevAuditLog.create({
            user_id: req.session.user.id,
            username: req.session.user.username,
            action,
            ip_address: ip
        });
    } catch (err) {
        console.error('[DevAuditLog] Logging failed:', err);
    }
}

// Helper: Disk usage utility
function getDiskUsage() {
    try {
        if (fs.statfsSync) {
            const stats = fs.statfsSync('/');
            const total = stats.bsize * stats.blocks;
            const free = stats.bsize * stats.bfree;
            const used = total - free;
            return {
                usedPercent: Math.round((used / total) * 100),
                totalGB: Math.round(total / (1024 ** 3)),
                usedGB: Math.round(used / (1024 ** 3))
            };
        }
    } catch {}
    return { usedPercent: 32, totalGB: 120, usedGB: 38 }; // Static safe fallback
}

// ── GET /dashboard-stats ──────────────────────────────────────────────────────
router.get('/dashboard-stats', async (req, res) => {
    try {
        const client = req.app.get('discordClient');
        const totalServers = client.guilds.cache.size;
        const totalMembers = Array.from(client.guilds.cache.values()).reduce((acc, g) => acc + g.memberCount, 0);

        const premiumServers = await PremiumServer.count({ where: { is_premium: true } });

        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        const commandsToday = await CommandLog.count({ where: { timestamp: { [Op.gte]: startOfDay } } });

        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);
        const commandsThisMonth = await CommandLog.count({ where: { timestamp: { [Op.gte]: startOfMonth } } });

        const uptime = Math.round(process.uptime());
        const apiRequests = await DevAuditLog.count();
        const activeTickets = await TicketInstance.count({ where: { status: 'open' } });

        const activeWarnings = await Warning.count();
        const activeMutes = await Mute.count();
        const activeJails = await JailedUser.count();
        const activePunishments = activeWarnings + activeMutes + activeJails;

        res.json({
            totalServers,
            totalMembers,
            premiumServers,
            commandsToday,
            commandsThisMonth,
            uptime,
            apiRequests,
            activeTickets,
            activePunishments
        });
    } catch (e) {
        console.error('[DevStats] Error:', e.message);
        res.status(500).json({ error: 'Failed to retrieve stats.' });
    }
});

// ── GET /servers ─────────────────────────────────────────────────────────────
router.get('/servers', async (req, res) => {
    try {
        const client = req.app.get('discordClient');
        const search = (req.query.search || '').trim().toLowerCase();

        let guilds = Array.from(client.guilds.cache.values());

        if (search) {
            guilds = guilds.filter(g => 
                g.id.includes(search) || 
                g.name.toLowerCase().includes(search)
            );
        }

        // Fetch premium servers mapping
        const premMap = {};
        const premiums = await PremiumServer.findAll();
        premiums.forEach(p => { premMap[p.guild_id] = p.is_premium; });

        const data = guilds.map(g => ({
            id: g.id,
            name: g.name,
            icon: g.iconURL() || null,
            memberCount: g.memberCount,
            ownerId: g.ownerId,
            isPremium: premMap[g.id] || false
        }));

        res.json(data);
    } catch (e) {
        res.status(500).json({ error: 'Failed to fetch servers.' });
    }
});

// ── POST /servers/:guildId/leave ──────────────────────────────────────────────
router.post('/servers/:guildId/leave', async (req, res) => {
    const { guildId } = req.params;
    const client = req.app.get('discordClient');
    const guild = client.guilds.cache.get(guildId);

    if (!guild) {
        return res.status(404).json({ error: 'Server not found.' });
    }

    try {
        await guild.leave();
        await logDevAction(req, `Forced bot to leave guild ${guild.name} (${guildId})`);
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: 'Failed to leave server.' });
    }
});

// ── GET /users/:userId ────────────────────────────────────────────────────────
router.get('/users/:userId', async (req, res) => {
    const { userId } = req.params;
    // Validate Discord snowflake format to prevent injection/abuse
    if (!/^\d{17,20}$/.test(userId)) {
        return res.status(400).json({ error: 'Invalid user ID format.' });
    }
    const client = req.app.get('discordClient');

    try {
        const user = await client.users.fetch(userId).catch(() => null);
        if (!user) {
            return res.status(404).json({ error: 'User not found in Discord.' });
        }

        // Find mutual guilds
        const mutualGuilds = [];
        for (const guild of client.guilds.cache.values()) {
            const isMember = guild.members.cache.has(userId);
            if (isMember) {
                mutualGuilds.push({ id: guild.id, name: guild.name });
            }
        }

        // Verification status (is premium owner?)
        const isPremiumOwner = await PremiumServer.findOne({ where: { guild_id: userId } }).then(p => !!p?.is_premium);

        // Moderation records
        const warnings = await Warning.findAll({ where: { user_id: userId } });
        const mutes = await Mute.findAll({ where: { user_id: userId } });
        const jails = await JailedUser.findAll({ where: { user_id: userId } });

        // Tickets
        const tickets = await TicketInstance.findAll({ where: { user_id: userId } });

        res.json({
            id: user.id,
            username: user.username,
            globalName: user.globalName || user.username,
            avatar: user.displayAvatarURL(),
            mutualGuilds,
            isPremiumOwner,
            moderationHistory: {
                warnings: warnings.map(w => ({ reason: w.reason, moderatorId: w.moderator_id, timestamp: w.timestamp })),
                mutes: mutes.map(m => ({ roleId: m.role_id, expiresAt: m.expires_at })),
                jails: jails.map(j => ({ reason: j.reason, jailerId: j.jailer_id, timestamp: j.timestamp }))
            },
            tickets: tickets.map(t => ({ id: t.id, channelId: t.channel_id, status: t.status }))
        });
    } catch (e) {
        res.status(500).json({ error: 'Failed to load user info.' });
    }
});

// ── GET /analytics ────────────────────────────────────────────────────────────
router.get('/analytics', async (req, res) => {
    try {
        const client = req.app.get('discordClient');

        // Most used commands
        const mostUsed = await CommandLog.findAll({
            attributes: ['command_name', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
            group: ['command_name'],
            order: [[sequelize.literal('count'), 'DESC']],
            limit: 10
        }).then(list => list.map(item => ({ name: item.command_name, count: item.get('count') })));

        // Most active servers
        const activeGuilds = await CommandLog.findAll({
            attributes: ['guild_id', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
            group: ['guild_id'],
            order: [[sequelize.literal('count'), 'DESC']],
            limit: 10
        }).then(list => list.map(item => {
            const guild = client.guilds.cache.get(item.guild_id);
            return {
                name: guild ? guild.name : `Guild (${item.guild_id})`,
                count: item.get('count')
            };
        }));

        // Growth metrics
        const totalServers = client.guilds.cache.size;
        const totalMembers = Array.from(client.guilds.cache.values()).reduce((acc, g) => acc + g.memberCount, 0);

        // Standard stats output
        res.json({
            mostUsedCommands: mostUsed,
            mostActiveServers: activeGuilds,
            serverCount: totalServers,
            memberCount: totalMembers
        });
    } catch (e) {
        res.status(500).json({ error: 'Failed to retrieve analytics.' });
    }
});

// ── GET /premium ─────────────────────────────────────────────────────────────
router.get('/premium', async (req, res) => {
    try {
        const list = await PremiumServer.findAll();
        res.json(list);
    } catch (e) {
        res.status(500).json({ error: 'Failed to load premium servers.' });
    }
});

// ── POST /premium ─────────────────────────────────────────────────────────────
router.post('/premium', async (req, res) => {
    const { guildId, expiresAt } = req.body;
    if (!guildId) return res.status(400).json({ error: 'Guild ID is required.' });

    try {
        const expiration = expiresAt ? new Date(expiresAt) : null;
        await PremiumServer.upsert({
            guild_id: guildId,
            is_premium: true,
            expires_at: expiration,
            granted_by: req.session.user.id,
            granted_at: new Date()
        });

        await logDevAction(req, `Granted premium to guild ${guildId} expiring: ${expiration || 'Never'}`);
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: 'Failed to grant premium.' });
    }
});

// ── DELETE /premium/:guildId ──────────────────────────────────────────────────
router.delete('/premium/:guildId', async (req, res) => {
    const { guildId } = req.params;

    try {
        await PremiumServer.destroy({ where: { guild_id: guildId } });
        await logDevAction(req, `Removed premium status from guild ${guildId}`);
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: 'Failed to remove premium.' });
    }
});

// ── GET /commands ────────────────────────────────────────────────────────────
router.get('/commands', async (req, res) => {
    try {
        const client = req.app.get('discordClient');
        const prefixCmds = Array.from(client.commands.keys());
        const slashCmds = Array.from(client.slashCommands.keys());
        res.json({ prefix: prefixCmds, slash: slashCmds });
    } catch (e) {
        res.status(500).json({ error: 'Failed to fetch loaded commands.' });
    }
});

// ── POST /commands/:commandName/toggle ────────────────────────────────────────
router.post('/commands/:commandName/toggle', async (req, res) => {
    const { commandName } = req.params;
    const cleanCmd = commandName.trim().toLowerCase();
    // Validate command name format — must be valid Discord command name
    if (!/^[a-z0-9_-]{1,32}$/.test(cleanCmd)) {
        return res.status(400).json({ error: 'Invalid command name format.' });
    }

    try {
        const config = await SystemConfig.findOne({ where: { key: 'disabled_commands' } });
        let disabled = [];
        try {
            disabled = JSON.parse(config?.value || '[]');
        } catch {}

        let action = '';
        if (disabled.includes(cleanCmd)) {
            disabled = disabled.filter(c => c !== cleanCmd);
            action = 'Enabled';
        } else {
            disabled.push(cleanCmd);
            action = 'Disabled';
        }

        await SystemConfig.upsert({
            key: 'disabled_commands',
            value: JSON.stringify(disabled)
        });

        await logDevAction(req, `${action} command globally: /${cleanCmd}`);
        res.json({ success: true, disabledList: disabled });
    } catch (e) {
        res.status(500).json({ error: 'Failed to toggle command.' });
    }
});

// ── GET /commands/disabled ────────────────────────────────────────────────────
router.get('/commands/disabled', async (req, res) => {
    try {
        const config = await SystemConfig.findOne({ where: { key: 'disabled_commands' } });
        let disabled = [];
        try {
            disabled = JSON.parse(config?.value || '[]');
        } catch {}
        res.json({ disabledList: disabled });
    } catch (e) {
        res.status(500).json({ error: 'Failed to fetch disabled commands.' });
    }
});

// ── POST /broadcast ──────────────────────────────────────────────────────────
router.post('/broadcast', async (req, res) => {
    const { title, content, type, scheduledAt } = req.body;
    if (!content) return res.status(400).json({ error: 'Content is required.' });
    if (typeof content !== 'string' || content.length > 2000) {
        return res.status(400).json({ error: 'Content must be a string under 2000 characters.' });
    }
    if (title && (typeof title !== 'string' || title.length > 256)) {
        return res.status(400).json({ error: 'Title must be a string under 256 characters.' });
    }
    // Validate scheduledAt as a parseable date if provided
    if (scheduledAt && isNaN(Date.parse(scheduledAt))) {
        return res.status(400).json({ error: 'Invalid scheduled date.' });
    }

    try {
        const isScheduled = !!scheduledAt;
        const b = await BroadcastLog.create({
            title: title || null,
            content,
            type: type === 'embed' ? 'embed' : 'text',
            status: isScheduled ? 'scheduled' : 'sent',
            scheduled_at: isScheduled ? new Date(scheduledAt) : null,
            sent_at: isScheduled ? null : new Date()
        });

        if (!isScheduled) {
            const client = req.app.get('discordClient');
            const BroadcastService = require('../../services/broadcastService');
            // Execute in background
            BroadcastService.sendBroadcast(client, b).catch(console.error);
        }

        await logDevAction(req, `Sent or Scheduled a global broadcast (ID ${b.id})`);
        res.json({ success: true, broadcastId: b.id });
    } catch (e) {
        res.status(500).json({ error: 'Failed to create broadcast.' });
    }
});

// ── GET /broadcasts ──────────────────────────────────────────────────────────
router.get('/broadcasts', async (req, res) => {
    try {
        const list = await BroadcastLog.findAll({ order: [['createdAt', 'DESC']] });
        res.json(list);
    } catch (e) {
        res.status(500).json({ error: 'Failed to retrieve broadcasts.' });
    }
});

// ── GET /audit-logs ──────────────────────────────────────────────────────────
router.get('/audit-logs', async (req, res) => {
    try {
        const list = await DevAuditLog.findAll({ order: [['createdAt', 'DESC']], limit: 100 });
        res.json(list);
    } catch (e) {
        res.status(500).json({ error: 'Failed to load audit logs.' });
    }
});

// ── GET /errors ──────────────────────────────────────────────────────────────
router.get('/errors', async (req, res) => {
    try {
        const list = await BotError.findAll({ order: [['last_occurred', 'DESC']], limit: 100 });
        res.json(list);
    } catch (e) {
        res.status(500).json({ error: 'Failed to fetch errors.' });
    }
});

// ── POST /errors/clear ────────────────────────────────────────────────────────
router.post('/errors/clear', async (req, res) => {
    try {
        await BotError.destroy({ where: {} });
        await logDevAction(req, 'Cleared all bot error logs');
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: 'Failed to clear error logs.' });
    }
});

// ── GET /system-status ────────────────────────────────────────────────────────
router.get('/system-status', async (req, res) => {
    try {
        const client = req.app.get('discordClient');
        const dbStatus = await sequelize.authenticate().then(() => 'online').catch(() => 'offline');
        const ping = client?.ws?.ping ?? -1;

        const totalmem = os.totalmem();
        const freemem = os.freemem();
        const usedmem = totalmem - freemem;

        const ram = {
            usedPercent: Math.round((usedmem / totalmem) * 100),
            totalMB: Math.round(totalmem / (1024 * 1024)),
            usedMB: Math.round(usedmem / (1024 * 1024))
        };

        const cpu = Math.round((os.loadavg()[0] / os.cpus().length) * 100);
        const disk = getDiskUsage();

        res.json({
            database: dbStatus,
            api: 'online',
            discordAPI: ping >= 0 ? 'online' : 'offline',
            ping,
            cpu,
            ram,
            disk,
            shards: client?.shard ? client.shard.count : 1,
            nodeVersion: process.version,
            uptime: Math.round(process.uptime())
        });
    } catch (e) {
        res.status(500).json({ error: 'Failed to load system status.' });
    }
});

// ── POST /bot-controls ────────────────────────────────────────────────────────
router.post('/bot-controls', async (req, res) => {
    const { action } = req.body;
    const client = req.app.get('discordClient');

    if (!action) return res.status(400).json({ error: 'Action is required.' });

    try {
        switch (action) {
            case 'reload-commands': {
                const commandsPath = path.join(__dirname, '../../commands');
                const slashPath = path.join(__dirname, '../../slashCommands');
                const decache = (dirPath) => {
                    if (!fs.existsSync(dirPath)) return;
                    const items = fs.readdirSync(dirPath);
                    for (const item of items) {
                        const fullPath = path.join(dirPath, item);
                        if (fs.statSync(fullPath).isDirectory()) {
                            decache(fullPath);
                        } else if (item.endsWith('.js')) {
                            delete require.cache[require.resolve(fullPath)];
                        }
                    }
                };
                decache(commandsPath);
                decache(slashPath);

                const loadCommands = require('../../handlers/commandHandler');
                await loadCommands(client);

                await logDevAction(req, 'Hot-reloaded bot commands');
                return res.json({ success: true, message: 'Commands reloaded successfully.' });
            }

            case 'reload-events': {
                const eventsPath = path.join(__dirname, '../../events');
                const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));
                for (const file of eventFiles) {
                    const filePath = path.join(eventsPath, file);
                    const event = require(filePath);
                    client.removeAllListeners(event.name);
                    delete require.cache[require.resolve(filePath)];
                }

                const loadEvents = require('../../handlers/eventHandler');
                loadEvents(client);

                await logDevAction(req, 'Hot-reloaded bot events');
                return res.json({ success: true, message: 'Events reloaded successfully.' });
            }

            case 'clear-cache': {
                client.guilds.cache.clear();
                client.users.cache.clear();
                client.channels.cache.clear();
                await client.guilds.fetch();

                await logDevAction(req, 'Cleared bot memory caches');
                return res.json({ success: true, message: 'Cache cleared successfully.' });
            }

            case 'sync-slash': {
                const CustomCommandService = require('../../services/customCommandService');
                await CustomCommandService.syncAllGuildsSlashCommands(client);

                await logDevAction(req, 'Forced global slash command sync');
                return res.json({ success: true, message: 'Slash commands synced globally.' });
            }

            case 'toggle-maintenance': {
                const maintenanceConfig = await SystemConfig.findOne({ where: { key: 'maintenance_mode' } });
                const current = maintenanceConfig?.value === 'true';
                const nextState = !current;

                await SystemConfig.upsert({
                    key: 'maintenance_mode',
                    value: String(nextState)
                });

                const actionLogged = nextState ? 'Enabled Global Maintenance Mode' : 'Disabled Global Maintenance Mode';
                await logDevAction(req, actionLogged);
                return res.json({ success: true, maintenance: nextState });
            }

            default:
                return res.status(400).json({ error: 'Invalid control action.' });
        }
    } catch (err) {
        console.error('[BotControls] Error executing action:', err);
        res.status(500).json({ error: 'Control action failed.' });
    }
});

// ── GET /maintenance-status ───────────────────────────────────────────────────
router.get('/maintenance-status', async (req, res) => {
    try {
        const config = await SystemConfig.findOne({ where: { key: 'maintenance_mode' } });
        const msgConfig = await SystemConfig.findOne({ where: { key: 'maintenance_message' } });
        res.json({ 
            maintenance: config?.value === 'true',
            message: msgConfig?.value || 'Vivy is currently undergoing maintenance.\nPlease try again later.'
        });
    } catch (e) {
        res.status(500).json({ error: 'Failed to retrieve maintenance status.' });
    }
});

// ── POST /settings ───────────────────────────────────────────────────────────
router.post('/settings', async (req, res) => {
    const { maintenanceMessage } = req.body;
    try {
        await SystemConfig.upsert({
            key: 'maintenance_message',
            value: maintenanceMessage || ''
        });
        await logDevAction(req, 'Updated global maintenance message');
        res.json({ success: true });
    } catch (err) {
        console.error('[Settings] Error saving configs:', err);
        res.status(500).json({ error: 'Failed to save settings.' });
    }
});

// ── NOTES SYSTEM ENDPOINTS ──────────────────────────────────────────────────
router.get('/notes', async (req, res) => {
    const search = (req.query.search || '').trim().toLowerCase();
    const author = (req.query.author || '').trim();

    try {
        let whereClause = {};
        if (author) {
            whereClause.author_id = author;
        }

        if (search) {
            whereClause[Op.or] = [
                { title: { [Op.like]: `%${search}%` } },
                { content: { [Op.like]: `%${search}%` } }
            ];
        }

        const notes = await DevNote.findAll({
            where: whereClause,
            order: [['updatedAt', 'DESC']]
        });
        res.json(notes);
    } catch (err) {
        console.error('[DevNotes] Fetch error:', err);
        res.status(500).json({ error: 'Failed to load developer notes.' });
    }
});

router.post('/notes', async (req, res) => {
    const { title, content } = req.body;
    if (!title || !content) {
        return res.status(400).json({ error: 'Title and content are required.' });
    }
    if (typeof title !== 'string' || title.length > 256) {
        return res.status(400).json({ error: 'Title must be a string under 256 characters.' });
    }
    if (typeof content !== 'string' || content.length > 10000) {
        return res.status(400).json({ error: 'Content must be a string under 10,000 characters.' });
    }

    try {
        const note = await DevNote.create({
            title,
            content,
            author_id: req.session.user.id,
            author_name: req.session.user.username
        });
        await logDevAction(req, `Created developer note: "${title}"`);
        res.json(note);
    } catch (err) {
        console.error('[DevNotes] Create error:', err);
        res.status(500).json({ error: 'Failed to create developer note.' });
    }
});

router.put('/notes/:id', async (req, res) => {
    const { id } = req.params;
    // Validate numeric ID
    if (!/^\d+$/.test(String(id))) {
        return res.status(400).json({ error: 'Invalid note ID.' });
    }
    const { title, content } = req.body;
    if (!title || !content) {
        return res.status(400).json({ error: 'Title and content are required.' });
    }
    if (typeof title !== 'string' || title.length > 256) {
        return res.status(400).json({ error: 'Title must be a string under 256 characters.' });
    }
    if (typeof content !== 'string' || content.length > 10000) {
        return res.status(400).json({ error: 'Content must be a string under 10,000 characters.' });
    }

    try {
        const note = await DevNote.findByPk(id);
        if (!note) {
            return res.status(404).json({ error: 'Note not found.' });
        }

        await note.update({ title, content });
        await logDevAction(req, `Edited developer note: "${title}"`);
        res.json(note);
    } catch (err) {
        console.error('[DevNotes] Edit error:', err);
        res.status(500).json({ error: 'Failed to update developer note.' });
    }
});

router.delete('/notes/:id', async (req, res) => {
    const { id } = req.params;
    // Validate numeric ID
    if (!/^\d+$/.test(String(id))) {
        return res.status(400).json({ error: 'Invalid note ID.' });
    }
    try {
        const note = await DevNote.findByPk(id);
        if (!note) {
            return res.status(404).json({ error: 'Note not found.' });
        }

        const title = note.title;
        await note.destroy();
        await logDevAction(req, `Deleted developer note: "${title}"`);
        res.json({ success: true });
    } catch (err) {
        console.error('[DevNotes] Delete error:', err);
        res.status(500).json({ error: 'Failed to delete developer note.' });
    }
});

module.exports = router;
