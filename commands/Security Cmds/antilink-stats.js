const AntiLink = require('../../db/models/AntiLink');
const UI = require('../../utils/ui');
const { MessageFlags } = require('discord.js');

module.exports = {
    name: 'antilink-stats',
    description: 'Check anti-link statistics',
    async execute(message, args) {
        const settings = await AntiLink.findOne({ where: { guild_id: message.guild.id } });

        if (!settings || !settings.is_enabled) {
            return message.reply({
                components: [UI.createContainer({
                    description: '- <a:warn:1365688576758644797> Anti-Link is currently **disabled**.'
                })],
                flags: MessageFlags.IsComponentsV2
            });
        }

        const whitelist = JSON.parse(settings.whitelist_roles || '[]');

        message.reply({
            components: [UI.createContainer({
                title: '📊 Anti-Link Statistics',
                description: `
**Status:** Enabled ✅
**Whitelisted Roles:** ${whitelist.length}
**Action:** Delete Messages
                `
            })],
            flags: MessageFlags.IsComponentsV2
        });
    },
};
