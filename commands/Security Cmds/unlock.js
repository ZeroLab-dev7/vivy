const UI = require('../../utils/ui');
const { PermissionsBitField, MessageFlags } = require('discord.js');

module.exports = {
    name: 'unlock',
    description: 'Unlock a channel',
    async execute(message, args) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
            return message.reply({
                components: [UI.createContainer({
                    description: '- <a:warn:1365688576758644797> You need `Manage Channels` permission.'
                })],
                flags: MessageFlags.IsComponentsV2
            });
        }

        const channel = message.mentions.channels.first() || message.channel;

        try {
            await channel.permissionOverwrites.edit(message.guild.roles.everyone, {
                SendMessages: null
            });

            message.reply({
                components: [UI.createContainer({
                    title: '🔓 Channel Unlocked',
                    description: `${channel} is now unlocked.`
                })],
                flags: MessageFlags.IsComponentsV2
            });
        } catch (err) {
            console.error(err);
            message.reply({
                components: [UI.createContainer({
                    description: '- <a:warn:1365688576758644797> Failed to unlock channel. Check my permissions.'
                })],
                flags: MessageFlags.IsComponentsV2
            });
        }
    },
};
