const { MessageFlags, ChannelType } = require('discord.js');
const UI = require('../../utils/ui');

const BOT_OWNER_ID = '1218034475775299688';
const COOLDOWN_TIME = 5000;
const cooldowns = new Map();

module.exports = {
    name: 'devserverinfo',
    aliases: ['dsi', 'guildinfo-dev'],
    description: 'Deep server info with all IDs and config data. (Dev / Bot Owner only)',
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

        const guild = message.guild;

        // Fetch detailed guild data
        const fetchedGuild = await guild.fetch().catch(() => guild);
        const owner = await guild.fetchOwner().catch(() => null);

        // Channel counts
        const channels      = guild.channels.cache;
        const textChannels  = channels.filter(c => c.type === ChannelType.GuildText).size;
        const voiceChannels = channels.filter(c => c.type === ChannelType.GuildVoice).size;
        const categories    = channels.filter(c => c.type === ChannelType.GuildCategory).size;
        const threads       = channels.filter(c => c.isThread()).size;
        const totalChannels = channels.size;

        // Role info
        const roles = guild.roles.cache
            .filter(r => r.id !== guild.id)
            .sort((a, b) => b.position - a.position);
        const roleList = roles.size > 0
            ? roles.map(r => `\`${r.name}\``).slice(0, 20).join(', ') + (roles.size > 20 ? ` + ${roles.size - 20} more` : '')
            : 'None';

        // Emojis
        const emojis       = guild.emojis.cache.size;
        const animEmojis   = guild.emojis.cache.filter(e => e.animated).size;
        const staticEmojis = emojis - animEmojis;

        // Boost
        const boostLevel   = fetchedGuild.premiumTier;
        const boostCount   = fetchedGuild.premiumSubscriptionCount || 0;

        // Features
        const features = fetchedGuild.features?.length > 0
            ? fetchedGuild.features.map(f => `\`${f}\``).join(', ')
            : 'None';

        const createdTimestamp = Math.floor(guild.createdTimestamp / 1000);
        const verificationMap = ['None', 'Low', 'Medium', 'High', 'Very High'];
        const verificationLevel = verificationMap[guild.verificationLevel] || 'Unknown';

        const container = UI.createContainer({
            title: `🛠️ Dev Server Info — ${guild.name}`,
            description: [
                `**🏠 Guild**`,
                `- **ID:** \`${guild.id}\``,
                `- **Name:** \`${guild.name}\``,
                `- **Owner:** ${owner ? `${owner.user.tag} (\`${owner.id}\`)` : `\`${guild.ownerId}\``}`,
                `- **Created:** <t:${createdTimestamp}:R> (<t:${createdTimestamp}:d>)`,
                `- **Verification:** \`${verificationLevel}\``,
                `- **Locale:** \`${guild.preferredLocale}\``,
                ``,
                `**👥 Members**`,
                `- **Total:** \`${guild.memberCount.toLocaleString()}\``,
                `- **Bots:** \`${guild.members.cache.filter(m => m.user.bot).size}\``,
                ``,
                `**📁 Channels** (Total: \`${totalChannels}\`)`,
                `- **Text:** \`${textChannels}\` | **Voice:** \`${voiceChannels}\` | **Categories:** \`${categories}\` | **Threads:** \`${threads}\``,
                ``,
                `**🎭 Roles** (\`${roles.size}\`)`,
                `- ${roleList}`,
                ``,
                `**😀 Emojis** (\`${emojis}\`)`,
                `- **Static:** \`${staticEmojis}\` | **Animated:** \`${animEmojis}\``,
                ``,
                `**🚀 Boosts**`,
                `- **Level:** \`${boostLevel}\` | **Count:** \`${boostCount}\``,
                ``,
                `**✨ Features**`,
                `- ${features}`
            ].join('\n')
        });

        return message.reply({
            components: [container],
            flags: MessageFlags.IsComponentsV2
        });
    }
};
