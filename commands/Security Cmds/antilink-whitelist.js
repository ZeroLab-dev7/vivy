const AntiLink = require('../../db/models/AntiLink');
const UI = require('../../utils/ui');
const { PermissionsBitField, MessageFlags } = require('discord.js');

module.exports = {
    name: 'antilink-whitelist',
    aliases: ['al-wl'],
    description: 'Manage anti-link whitelist roles',
    async execute(message, args) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.reply({
                components: [UI.createContainer({
                    description: '- <a:warn:1365688576758644797> You need `Administrator` permission to use this command.'
                })],
                flags: MessageFlags.IsComponentsV2
            });
        }

        const sub = args[0]?.toLowerCase();
        const role = message.mentions.roles.first() || message.guild.roles.cache.get(args[1]);

        // Get current settings
        let settings = await AntiLink.findOne({ where: { guild_id: message.guild.id } });
        if (!settings) {
            settings = await AntiLink.create({ guild_id: message.guild.id });
        }

        let whitelist = [];
        try {
            whitelist = JSON.parse(settings.whitelist_roles || '[]');
        } catch (e) {
            whitelist = [];
        }

        if (sub === 'add') {
            if (!role) return message.reply("Please mention a role or ID.");

            if (whitelist.includes(role.id)) {
                return message.reply("That role is already whitelisted.");
            }

            whitelist.push(role.id);
            settings.whitelist_roles = JSON.stringify(whitelist);
            await settings.save();

            message.reply({
                components: [UI.createContainer({
                    title: '✅ Role Whitelisted',
                    description: `**${role.name}** has been added to the anti-link whitelist.`
                })],
                flags: MessageFlags.IsComponentsV2
            });

        } else if (sub === 'remove') {
            if (!role) return message.reply("Please mention a role or ID.");

            if (!whitelist.includes(role.id)) {
                return message.reply("That role is not whitelisted.");
            }

            whitelist = whitelist.filter(id => id !== role.id);
            settings.whitelist_roles = JSON.stringify(whitelist);
            await settings.save();

            message.reply({
                components: [UI.createContainer({
                    title: '🗑️ Role Removed',
                    description: `**${role.name}** has been removed from the whitelist.`
                })],
                flags: MessageFlags.IsComponentsV2
            });

        } else if (sub === 'list') {
            if (whitelist.length === 0) {
                return message.reply("No roles are whitelisted.");
            }

            const roleNames = whitelist.map(id => {
                const r = message.guild.roles.cache.get(id);
                return r ? r.name : `Unknown Role (${id})`;
            }).join(', ');

            message.reply({
                components: [UI.createContainer({
                    title: '📋 Whitelisted Roles',
                    description: roleNames
                })],
                flags: MessageFlags.IsComponentsV2
            });

        } else {
            message.reply({
                components: [UI.createContainer({
                    description: 'Usage: `$antilink-whitelist <add|remove|list> [role]`'
                })],
                flags: MessageFlags.IsComponentsV2
            });
        }
    },
};
