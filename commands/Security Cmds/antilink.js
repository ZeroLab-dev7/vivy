const AntiLink = require('../../db/models/AntiLink');
const UI = require('../../utils/ui');
const { PermissionsBitField, MessageFlags } = require('discord.js');

module.exports = {
    name: 'antilink',
    description: 'Protect server from invite links',
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

        if (sub === 'on') {
            await AntiLink.upsert({ guild_id: message.guild.id, is_enabled: true });
            message.reply({
                components: [UI.createContainer({
                    title: '🔗 Anti-Link Enabled',
                    description: 'I will now delete any Discord invite links sent by non-admins.'
                })],
                flags: MessageFlags.IsComponentsV2
            });
        } else if (sub === 'off') {
            await AntiLink.upsert({ guild_id: message.guild.id, is_enabled: false });
            message.reply({
                components: [UI.createContainer({
                    title: '🔗 Anti-Link Disabled',
                    description: 'Invite links are now allowed.'
                })],
                flags: MessageFlags.IsComponentsV2
            });
        } else {
            message.reply({
                components: [UI.createContainer({
                    description: 'Usage: `$antilink <on|off>`'
                })],
                flags: MessageFlags.IsComponentsV2
            });
        }
    },
};
