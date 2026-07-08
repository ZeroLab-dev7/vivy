const { GuildSettings } = require('../../db/models');
const UI = require('../../utils/ui');
const { PermissionsBitField, MessageFlags } = require('discord.js');

module.exports = {
    name: 'setup-logs',
    aliases: ['setuplogs', 'setlog', 'setlogs', 'securitylogs'],
    description: 'Set the channel for security logs',
    async execute(message, args) {
        // Permission Check: Owner Only or Security Owner
        const settings = await GuildSettings.findOne({ where: { guild_id: message.guild.id } });
        const ownerRoleIds = settings?.owner_role_id ? settings.owner_role_id.split(',') : [];
        const isOwner = message.author.id === message.guild.ownerId;
        const hasOwnerRole = ownerRoleIds.some(id => message.member.roles.cache.has(id));

        if (!isOwner && !hasOwnerRole) {
            return message.reply({
                components: [UI.createContainer({
                    description: 'You need the **Owner Role** to use this command.'
                })],
                flags: MessageFlags.IsComponentsV2
            });
        }

        const channel = message.mentions.channels.first() || message.guild.channels.cache.get(args[0]);

        if (!channel) {
            // Check if they want to disable/reset
            if (args[0]?.toLowerCase() === 'reset' || args[0]?.toLowerCase() === 'disable' || args[0]?.toLowerCase() === 'off') {
                await GuildSettings.upsert({
                    guild_id: message.guild.id,
                    log_channel: null
                });
                return message.reply({
                    components: [UI.createContainer({
                        title: '📝 Security Logs Disabled',
                        description: 'Security logs have been disabled.'
                    })],
                    flags: MessageFlags.IsComponentsV2
                });
            }

            return message.reply({
                components: [UI.createContainer({
                    description: 'Usage: `?setup-logs <#channel|ID|off>`'
                })],
                flags: MessageFlags.IsComponentsV2
            });
        }

        // Save to DB
        // upsert handles both update and insert logic. 
        // We know guild_id is primary key, so it updates if exists.
        // Wait, GuildSettings definition says guild_id is primary key.
        // We need to preserve other fields though? upsert updates ONLY the fields specified if found? 
        // Sequelize upsert: "Insert or update a single row... The update happens when a row with the same primary key values is found."
        // It updates the row with the VALUES given. 
        // If I only provide guild_id and log_channel, will it NULL other fields?
        // NO, typically upsert merges if using specialized methods, but Sequelize `upsert` might replace or update.
        // Wait, standard SQL UPSERT (INSERT ... ON CONFLICT DO UPDATE) updates columns.
        // But if I create a new object with only 2 fields, does it default others?
        // Actually, safer to use findOrCreate -> update since we just want to update one field.
        // Or upsert is fine if the model has defaults?
        // Let's use standard find mechanism to be safe and avoid overwriting existing config with nulls if upsert behavior creates a fresh record for update.
        // Actually for SQLite/Sequelize upsert usually works fine but findOne -> save is safer for partial updates on existing complex records.

        let guildSettings = await GuildSettings.findOne({ where: { guild_id: message.guild.id } });
        if (guildSettings) {
            guildSettings.log_channel = channel.id;
            await guildSettings.save();
        } else {
            await GuildSettings.create({
                guild_id: message.guild.id,
                log_channel: channel.id
            });
        }

        message.reply({
            components: [UI.createContainer({
                title: '🛡️ Security Configuration Logs',
                description: `Administrative security actions (like setup and toggles) will now be logged to \`#${channel.name}\`.`
            })],
            flags: MessageFlags.IsComponentsV2
        });
    },
};
