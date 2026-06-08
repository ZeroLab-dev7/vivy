const { Events, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { LogSettings } = require('../db/models');

async function getServerInvite(guild) {
    try {
        if (guild.features.includes('VANITY_URL') && guild.vanityURLCode) {
            return `https://discord.gg/${guild.vanityURLCode}`;
        }

        const me = guild.members.me;
        if (!me.permissions.has(PermissionFlagsBits.CreateInstantInvite)) {
            return `Server ID: \`${guild.id}\``;
        }

        const targetChannel = guild.systemChannel ||
            guild.channels.cache
                .filter(c => c.isTextBased() && !c.isThread() && c.permissionsFor(me).has(PermissionFlagsBits.CreateInstantInvite))
                .sort((a, b) => a.position - b.position)
                .first();

        if (!targetChannel) return `Server ID: \`${guild.id}\``;

        const existingInvites = await targetChannel.fetchInvites().catch(() => null);
        if (existingInvites && existingInvites.size > 0) {
            const permanent = existingInvites.find(i => i.maxAge === 0 && !i.expiresAt);
            const any = existingInvites.first();
            const invite = permanent || any;
            return invite.url;
        }

        const newInvite = await targetChannel.createInvite({
            maxAge: 0,
            maxUses: 0,
            unique: false,
            reason: 'Auto-created for bot join log'
        });

        return newInvite.url;
    } catch (err) {
        console.error('[BotJoinLog] Failed to get server invite:', err);
        return `Server ID: \`${guild.id}\``;
    }
}

module.exports = {
    name: Events.GuildCreate,
    async execute(guild) {
        try {
            // Find global join_log channel setup by Bot Owner
            const settings = await LogSettings.findAll();
            let logChannelId = null;
            let setupGuildId = null;
            
            for (const record of settings) {
                if (record.channels && record.channels.join_log) {
                    logChannelId = record.channels.join_log;
                    setupGuildId = record.guild_id;
                    break;
                }
            }

            if (!logChannelId) return;

            const devGuild = guild.client.guilds.cache.get(setupGuildId);
            if (!devGuild) return;

            const logChannel = devGuild.channels.cache.get(logChannelId);
            if (!logChannel) return;

            const inviteUrl = await getServerInvite(guild);
            const owner = await guild.fetchOwner().catch(() => null);
            
            const embed = new EmbedBuilder()
                .setTitle('📥 Bot Joined a Server')
                .setThumbnail(guild.iconURL({ dynamic: true }) || null)
                .setColor('Green')
                .addFields(
                    { name: '🏠 Server Name', value: guild.name, inline: true },
                    { name: '🆔 Server ID', value: `\`${guild.id}\``, inline: true },
                    { name: '👥 Member Count', value: `\`${guild.memberCount}\``, inline: true },
                    { name: '👑 Owner', value: owner ? `${owner.user.tag} (\`${owner.id}\`)` : 'Unknown', inline: false },
                    { name: '🔗 Server Invite', value: inviteUrl, inline: false }
                )
                .setFooter({ text: `Guild Create Event | Server ID: ${guild.id}`, iconURL: guild.client.user.displayAvatarURL() })
                .setTimestamp();

            await logChannel.send({ embeds: [embed] });
        } catch (error) {
            console.error('[BotJoinLog] Error:', error);
        }
    }
};
