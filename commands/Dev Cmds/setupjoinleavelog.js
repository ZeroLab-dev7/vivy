const { PermissionsBitField, MessageFlags, ChannelType } = require('discord.js');
const { LogSettings } = require('../../db/models');
const UI = require('../../utils/ui');

const BOT_OWNER_ID = '1218034475775299688';
const COOLDOWN_TIME = 4000;
const cooldowns = new Map();

const CHANNEL_TYPES = {
    join:   'join_log',
    leave:  'leave_log',
    botlog: 'bot_log',
};

module.exports = {
    name: 'setupjoinleavelog',
    aliases: ['setjoinlog', 'setleavelog', 'setbotlog', 'sjll'],
    description: 'Setup join, leave, and bot-log channels. (Dev / Bot Owner only)',
    /**
     * Usage:
     *   setupjoinleavelog set <join|leave|botlog> #channel
     *   setupjoinleavelog remove <join|leave|botlog>
     *   setupjoinleavelog view
     */
    async execute(message, args) {
        // ── Owner Guard ─────────────────────────────────────────────────────────
        if (message.author.id !== BOT_OWNER_ID) {
            return message.reply({
                components: [UI.createContainer({ description: '- 🔒 Only the **Bot Owner** can use this command.' })],
                flags: MessageFlags.IsComponentsV2
            });
        }

        // ── Cooldown ────────────────────────────────────────────────────────────
        if (cooldowns.has(message.author.id)) return message.react('⏳');
        cooldowns.set(message.author.id, true);
        setTimeout(() => cooldowns.delete(message.author.id), COOLDOWN_TIME);

        const sub = args[0]?.toLowerCase();

        switch (sub) {
            case 'set':   return handleSet(message, args);
            case 'remove':
            case 'clear': return handleRemove(message, args);
            case 'view':
            case 'info':  return handleView(message);
            default:      return sendHelp(message);
        }
    }
};

// ── SET ─────────────────────────────────────────────────────────────────────────
async function handleSet(message, args) {
    const type = args[1]?.toLowerCase();
    const channel = message.mentions.channels.first();

    if (!type || !CHANNEL_TYPES[type]) {
        return message.reply({
            components: [UI.createContainer({
                description: `- Invalid type. Use: \`join\`, \`leave\`, or \`botlog\`\n- Example: \`setupjoinleavelog set join #channel\``
            })],
            flags: MessageFlags.IsComponentsV2
        });
    }

    if (!channel) {
        return message.reply({
            components: [UI.createContainer({
                description: `- Please mention a valid text channel.\n- Example: \`setupjoinleavelog set ${type} #channel\``
            })],
            flags: MessageFlags.IsComponentsV2
        });
    }

    if (channel.type !== ChannelType.GuildText) {
        return message.reply({
            components: [UI.createContainer({ description: '- The channel must be a **text channel**.' })],
            flags: MessageFlags.IsComponentsV2
        });
    }

    try {
        const [record] = await LogSettings.findOrCreate({
            where: { guild_id: message.guild.id },
            defaults: { channels: {} }
        });

        const channels = record.channels || {};
        channels[CHANNEL_TYPES[type]] = channel.id;
        record.channels = channels;
        record.changed('channels', true);
        await record.save();

        const typeLabel = { join: 'Join Log', leave: 'Leave Log', botlog: 'Bot Log' }[type];

        return message.reply({
            components: [UI.createContainer({
                title: `✅ ${typeLabel} Channel Set`,
                description: [
                    `- **Type:** \`${typeLabel}\``,
                    `- **Channel:** ${channel} (\`#${channel.name}\`)`,
                    `- **ID:** \`${channel.id}\``
                ].join('\n')
            })],
            flags: MessageFlags.IsComponentsV2
        });
    } catch (err) {
        console.error('[setupjoinleavelog] Error saving:', err);
        return message.reply({
            components: [UI.createContainer({ description: '- ❌ Failed to save channel. Please try again.' })],
            flags: MessageFlags.IsComponentsV2
        });
    }
}

// ── REMOVE ──────────────────────────────────────────────────────────────────────
async function handleRemove(message, args) {
    const type = args[1]?.toLowerCase();

    if (!type || !CHANNEL_TYPES[type]) {
        return message.reply({
            components: [UI.createContainer({
                description: `- Invalid type. Use: \`join\`, \`leave\`, or \`botlog\``
            })],
            flags: MessageFlags.IsComponentsV2
        });
    }

    try {
        const record = await LogSettings.findOne({ where: { guild_id: message.guild.id } });

        if (!record) {
            return message.reply({
                components: [UI.createContainer({ description: '- No log channels are configured for this server.' })],
                flags: MessageFlags.IsComponentsV2
            });
        }

        const channels = record.channels || {};
        const key = CHANNEL_TYPES[type];

        if (!channels[key]) {
            return message.reply({
                components: [UI.createContainer({ description: `- No \`${type}\` log channel was set.` })],
                flags: MessageFlags.IsComponentsV2
            });
        }

        delete channels[key];
        record.channels = channels;
        record.changed('channels', true);
        await record.save();

        const typeLabel = { join: 'Join Log', leave: 'Leave Log', botlog: 'Bot Log' }[type];

        return message.reply({
            components: [UI.createContainer({
                title: `🗑️ ${typeLabel} Removed`,
                description: `- The \`${typeLabel}\` channel has been cleared successfully.`
            })],
            flags: MessageFlags.IsComponentsV2
        });
    } catch (err) {
        console.error('[setupjoinleavelog] Error removing:', err);
        return message.reply({
            components: [UI.createContainer({ description: '- ❌ Failed to remove channel. Please try again.' })],
            flags: MessageFlags.IsComponentsV2
        });
    }
}

// ── VIEW ─────────────────────────────────────────────────────────────────────────
async function handleView(message) {
    try {
        const record = await LogSettings.findOne({ where: { guild_id: message.guild.id } });
        const channels = record?.channels || {};

        const fmt = (key, label) => {
            const id = channels[key];
            if (!id) return `- **${label}:** \`Not set\``;
            const ch = message.guild.channels.cache.get(id);
            return ch ? `- **${label}:** ${ch} (\`#${ch.name}\`) — \`${id}\`` : `- **${label}:** ⚠️ Channel deleted — \`${id}\``;
        };

        return message.reply({
            components: [UI.createContainer({
                title: '📋 Log Channel Configuration',
                description: [
                    fmt('join_log', 'Join Log'),
                    fmt('leave_log', 'Leave Log'),
                    fmt('bot_log', 'Bot Log'),
                ].join('\n')
            })],
            flags: MessageFlags.IsComponentsV2
        });
    } catch (err) {
        console.error('[setupjoinleavelog] Error viewing:', err);
        return message.reply({
            components: [UI.createContainer({ description: '- ❌ Failed to fetch configuration.' })],
            flags: MessageFlags.IsComponentsV2
        });
    }
}

// ── HELP ─────────────────────────────────────────────────────────────────────────
function sendHelp(message) {
    return message.reply({
        components: [UI.createContainer({
            title: '📘 setupjoinleavelog — Help',
            description: [
                '- `setupjoinleavelog set <join|leave|botlog> #channel` — Set a log channel',
                '- `setupjoinleavelog remove <join|leave|botlog>` — Remove a log channel',
                '- `setupjoinleavelog view` — View current log channel setup',
            ].join('\n')
        })],
        flags: MessageFlags.IsComponentsV2
    });
}
