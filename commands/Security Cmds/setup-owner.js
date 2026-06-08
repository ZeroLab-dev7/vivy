const { GuildSettings } = require('../../db/models');
const UI = require('../../utils/ui');

const config = require('../../config');
const { MessageFlags } = require('discord.js');

module.exports = {
    name: 'setup-owner',
    description: 'Set the specialized Owner Role for security commands',
    async execute(message, args) {
        // Permission Check: Server Owner or Bot Owner
        const BOT_OWNER_ID = '1218034475775299688';
        const isServerOwner = message.author.id === message.guild.ownerId;
        const isBotOwner = message.author.id === BOT_OWNER_ID;

        if (!isServerOwner && !isBotOwner) {
            return message.reply({
                components: [UI.createContainer({
                    color: 0xFF0000,
                    description: '- <a:warn:1365688576758644797> Only the **Server Owner** can configure the Security Owner Roles.'
                })],
                flags: MessageFlags.IsComponentsV2
            });
        }

        const roles = message.mentions.roles;
        const roleIds = args.filter(arg => /^\d+$/.test(arg) || arg.startsWith('<@&'));

        // Extract all unique IDs from mentions and args
        const finalIds = new Set();
        roles.forEach(r => finalIds.add(r.id));
        roleIds.forEach(id => {
            const match = id.match(/\d+/);
            if (match) finalIds.add(match[0]);
        });

        if (finalIds.size === 0) {
            return message.reply({
                components: [UI.createContainer({
                    description: 'Usage: `$setup-owner @Role1 @Role2 ...` or `$setup-owner ID1 ID2 ...`'
                })],
                flags: MessageFlags.IsComponentsV2
            });
        }

        const idsString = Array.from(finalIds).join(',');

        // Save to DB
        const [settings, created] = await GuildSettings.findOrCreate({
            where: { guild_id: message.guild.id },
            defaults: { owner_role_id: idsString }
        });

        if (!created) {
            settings.owner_role_id = idsString;
            await settings.save();
        }

        const roleNames = Array.from(finalIds).map(id => message.guild.roles.cache.get(id)?.name || `Unknown (${id})`).join(', ');

        message.reply({
            components: [UI.createContainer({
                title: '🔑 Owner Roles Set',
                description: `**${roleNames}** are now the designated Security Owner Roles.\nUsers with any of these roles can bypass security checks and manage the bot.`
            })],
            flags: MessageFlags.IsComponentsV2
        });

        // Log to Security Log Channel
        if (settings?.log_channel) {
            const logChannel = message.guild.channels.cache.get(settings.log_channel);
            if (logChannel) {
                const logContainer = UI.createContainer({
                    title: '🔐 Security Role Update',
                    description: `**Executor:** ${message.author.tag} (\`${message.author.id}\`)\n**New Owner Roles:** ${roleNames}`,
                    color: 0xFFA500
                });
                logChannel.send({ components: [logContainer], flags: MessageFlags.IsComponentsV2 });
            }
        }
    },
};
