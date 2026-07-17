const { AntiBotSetup, GuildSettings } = require('../../db/models');
const UI = require('../../utils/ui');
const { MessageFlags } = require('discord.js');

module.exports = {
    name: 'antibots',
    aliases: ['antibot'],
    description: 'Toggle anti-bot protection system',
    async execute(message, args) {
        // Fetch Settings for Owner Role check
        const settings = await GuildSettings.findOne({ where: { guild_id: message.guild.id } });
        const ownerRoleIds = settings?.owner_role_id ? settings.owner_role_id.split(',') : [];

        const isOwner = message.author.id === message.guild.ownerId;
        const hasOwnerRole = ownerRoleIds.some(id => message.member.roles.cache.has(id));

        if (!isOwner && !hasOwnerRole) {
            return message.reply({
                components: [UI.createContainer({
                    color: 0xFF0000,
                    description: '<:no:1526496561188831244>**Access Denied**\nYou need the **Owner Role** to use this command.'
                })],
                flags: MessageFlags.IsComponentsV2
            });
        }

        const mode = args[0]?.toLowerCase();
        let setup = await AntiBotSetup.findByPk(message.guild.id);

        if (mode === 'on') {
            const channelMention = message.mentions.channels.first() || (args[1] ? message.guild.channels.cache.get(args[1]) : null);

            // First time setup check: If no log channel in DB and no channel provided, error.
            if (!setup?.log_channel_id && !channelMention) {
                return message.reply({
                    components: [UI.createContainer({
                        title: '⚠️ First-Time Setup Required',
                        description: 'Please specify a **log channel** the first time you enable Anti-Bot protection.',
                        fields: [
                            { name: 'Usage', value: `\`?antibots on #log-channel\`` }
                        ]
                    })],
                    flags: MessageFlags.IsComponentsV2
                });
            }

            await AntiBotSetup.upsert({
                guild_id: message.guild.id,
                is_enabled: true,
                log_channel_id: channelMention ? channelMention.id : setup.log_channel_id
            });

            message.reply({
                components: [UI.createContainer({
                    color: 0x00FF00,
                    title: '🛡️ Anti-Bot Enabled',
                    description: `Unauthorized bots will now be kicked and logged to ${channelMention || `<#${setup?.log_channel_id}>`}.`
                })],
                flags: MessageFlags.IsComponentsV2
            });

            // Log Admin action
            if (settings?.log_channel) {
                const logChannel = message.guild.channels.cache.get(settings.log_channel);
                if (logChannel) {
                    const logContainer = UI.createContainer({
                        title: '⚙️ Protection Update',
                        description: `**Action:** Anti-Bot Enabled\n**Executor:** ${message.author.tag} (\`${message.author.id}\`)\n**Log Channel:** ${channelMention || `<#${setup?.log_channel_id}>`}`,
                        color: 0x00FF00
                    });
                    logChannel.send({ components: [logContainer], flags: MessageFlags.IsComponentsV2 });
                }
            }
        } else if (mode === 'off') {
            await AntiBotSetup.upsert({
                guild_id: message.guild.id,
                is_enabled: false
            });
            message.reply({
                components: [UI.createContainer({
                    title: '🛡️ Anti-Bot Disabled',
                    description: 'The server is no longer protected from unauthorized bots.'
                })],
                flags: MessageFlags.IsComponentsV2
            });

            // Log Admin action
            if (settings?.log_channel) {
                const logChannel = message.guild.channels.cache.get(settings.log_channel);
                if (logChannel) {
                    const logContainer = UI.createContainer({
                        title: '⚙️ Protection Update',
                        description: `**Action:** Anti-Bot Disabled\n**Executor:** ${message.author.tag} (\`${message.author.id}\`)`,
                        color: 0xFF0000
                    });
                    logChannel.send({ components: [logContainer], flags: MessageFlags.IsComponentsV2 });
                }
            }
        } else {
            message.reply({
                components: [UI.createContainer({
                    description: 'Usage: `?antibots <on|off> [#logchannel]`',
                    fields: [
                        { name: 'Note', value: 'Log channel is required only during the first setup.' }
                    ]
                })],
                flags: MessageFlags.IsComponentsV2
            });
        }
    },
};
