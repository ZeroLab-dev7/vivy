const { PermissionsBitField, MessageFlags } = require('discord.js');
const UI = require('../../utils/ui');

module.exports = {
    name: 'unhide',
    description: 'Unhide a channel and make it visible to non-administrative members.',
    async execute(message, args) {
        // Check if the command executor has the required permissions
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
            return message.reply({
                components: [UI.createContainer({
                    description: '- You need the `Manage Channels` permission to use this command.'
                })],
                flags: MessageFlags.IsComponentsV2
            });
        }

        // Check if the bot has the required permissions
        if (!message.guild.members.me.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
            return message.reply({
                components: [UI.createContainer({
                    description: '- I need the `Manage Channels` permission to perform this action.'
                })],
                flags: MessageFlags.IsComponentsV2
            });
        }

        // Get the channel mentioned or use the current channel if none is mentioned
        const channel = message.mentions.channels.first() || message.channel;

        try {
            // Update channel permissions to unhide it
            await channel.permissionOverwrites.edit(message.guild.roles.everyone, {
                ViewChannel: true // Allow the ViewChannel permission
            });

            // Send confirmation embed
            // Send confirmation embed
            const container = UI.createContainer({
                description: `-  \`#${channel.name}\` has been unhided successfully.`
            });

            return message.reply({
                components: [container],
                flags: MessageFlags.IsComponentsV2
            });
        } catch (error) {
            console.error('Error unhiding channel:', error);

            // Handle unexpected errors
            // Handle unexpected errors
            const errorContainer = UI.createContainer({
                description: '- An error occurred while trying to unhide the channel. Please try again later.'
            });

            return message.reply({
                components: [errorContainer],
                flags: MessageFlags.IsComponentsV2
            });
        }
    }
};
