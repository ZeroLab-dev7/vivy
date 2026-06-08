const { MessageFlags, ChannelType } = require('discord.js');
const UI = require('../../utils/ui');

const BOT_OWNER_ID = '1218034475775299688';
const COOLDOWN_TIME = 3000;
const cooldowns = new Map();

module.exports = {
    name: 'idchannel',
    aliases: ['idrole', 'iduser', 'id', 'getid'],
    description: 'Get the ID of a channel, role, user, or the server. (Dev / Bot Owner only)',
    /**
     * Usage:
     *   idchannel              — ID of the current channel
     *   idchannel #channel     — ID of a mentioned channel
     *   idchannel @role        — ID of a mentioned role
     *   idchannel @user        — ID of a mentioned user
     *   idchannel server       — ID of the current guild
     *   idchannel all          — List all channel IDs
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

        // ── Guild ID ─────────────────────────────────────────────────────────────
        if (sub === 'server' || sub === 'guild') {
            return message.reply({
                components: [UI.createContainer({
                    title: '🏠 Server ID',
                    description: [
                        `- **Name:** \`${message.guild.name}\``,
                        `- **ID:** \`${message.guild.id}\``
                    ].join('\n')
                })],
                flags: MessageFlags.IsComponentsV2
            });
        }

        // ── All Channels ─────────────────────────────────────────────────────────
        if (sub === 'all') {
            return handleAllChannels(message);
        }

        // ── Role mention ─────────────────────────────────────────────────────────
        const role = message.mentions.roles.first();
        if (role) {
            return message.reply({
                components: [UI.createContainer({
                    title: '🎭 Role ID',
                    description: [
                        `- **Name:** \`@${role.name}\``,
                        `- **ID:** \`${role.id}\``,
                        `- **Position:** \`${role.position}\``,
                        `- **Color:** \`${role.hexColor}\``
                    ].join('\n')
                })],
                flags: MessageFlags.IsComponentsV2
            });
        }

        // ── User mention ─────────────────────────────────────────────────────────
        const user = message.mentions.users.first();
        if (user) {
            const member = message.guild.members.cache.get(user.id);
            return message.reply({
                components: [UI.createContainer({
                    title: '👤 User ID',
                    description: [
                        `- **Tag:** \`${user.tag}\``,
                        `- **ID:** \`${user.id}\``,
                        `- **Bot:** \`${user.bot ? 'Yes' : 'No'}\``,
                        member ? `- **Nickname:** \`${member.nickname || 'None'}\`` : null,
                        `- **Created:** <t:${Math.floor(user.createdTimestamp / 1000)}:R>`
                    ].filter(Boolean).join('\n')
                })],
                flags: MessageFlags.IsComponentsV2
            });
        }

        // ── Channel mention ──────────────────────────────────────────────────────
        const channel = message.mentions.channels.first() || message.channel;
        const typeMap = {
            [ChannelType.GuildText]: 'Text',
            [ChannelType.GuildVoice]: 'Voice',
            [ChannelType.GuildCategory]: 'Category',
            [ChannelType.GuildAnnouncement]: 'Announcement',
            [ChannelType.GuildStageVoice]: 'Stage',
            [ChannelType.GuildForum]: 'Forum',
            [ChannelType.GuildThread]: 'Thread',
        };
        const typeName = typeMap[channel.type] || `Unknown (${channel.type})`;

        return message.reply({
            components: [UI.createContainer({
                title: `#️⃣ Channel ID`,
                description: [
                    `- **Name:** \`#${channel.name}\``,
                    `- **ID:** \`${channel.id}\``,
                    `- **Type:** \`${typeName}\``,
                    channel.parentId ? `- **Category:** \`${channel.parent?.name || channel.parentId}\`` : null,
                    `- **Created:** <t:${Math.floor(channel.createdTimestamp / 1000)}:R>`
                ].filter(Boolean).join('\n')
            })],
            flags: MessageFlags.IsComponentsV2
        });
    }
};

// ── ALL CHANNELS ────────────────────────────────────────────────────────────────
async function handleAllChannels(message) {
    const categories = message.guild.channels.cache
        .filter(c => c.type === ChannelType.GuildCategory)
        .sort((a, b) => a.position - b.position);

    const uncategorized = message.guild.channels.cache
        .filter(c => c.type !== ChannelType.GuildCategory && !c.parentId)
        .sort((a, b) => a.position - b.position);

    const lines = [];

    // Uncategorized first
    if (uncategorized.size > 0) {
        lines.push('**No Category**');
        for (const [, ch] of uncategorized) {
            lines.push(`- \`#${ch.name}\` → \`${ch.id}\``);
        }
    }

    for (const [, cat] of categories) {
        lines.push(`\n**${cat.name}** (\`${cat.id}\`)`);
        const children = message.guild.channels.cache
            .filter(c => c.parentId === cat.id)
            .sort((a, b) => a.position - b.position);
        for (const [, ch] of children) {
            const prefix = ch.type === ChannelType.GuildVoice ? '🔊' : '#';
            lines.push(`- \`${prefix} ${ch.name}\` → \`${ch.id}\``);
        }
    }

    const description = lines.join('\n');

    // Truncate if too long
    const truncated = description.length > 3800
        ? description.slice(0, 3800) + '\n...(truncated)'
        : description;

    return message.reply({
        components: [UI.createContainer({
            title: `📋 All Channels — ${message.guild.name}`,
            description: truncated
        })],
        flags: MessageFlags.IsComponentsV2
    });
}
