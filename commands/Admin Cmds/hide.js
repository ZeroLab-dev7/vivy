const { PermissionsBitField, MessageFlags } = require('discord.js');
const UI = require('../../utils/ui');

const COOLDOWN_TIME = 5000; // 5 seconds cooldown
const cooldowns = new Map();

module.exports = {
    name: 'hide',
    description: 'Hide a channel from non-administrative members.',
    async execute(message, args) {
        // Check if the user is on cooldown
        if (cooldowns.has(message.author.id)) {
            return message.react('⏳'); // React with a cooldown emoji
        }

        // Set cooldown for the user
        cooldowns.set(message.author.id, Date.now() + COOLDOWN_TIME);
        setTimeout(() => cooldowns.delete(message.author.id), COOLDOWN_TIME);

        // Check if the command executor has the required permissions
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
            const errorContainer = UI.createContainer({
                description: '- You need the `Manage Channels` permission to use this command.'
            });
            return message.reply({
                components: [errorContainer],
                flags: MessageFlags.IsComponentsV2
            });
        }

        // Check if the bot has the required permissions
        if (!message.guild.members.me.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
            const errorContainer = UI.createContainer({
                description: '- I need the `Manage Channels` permission to perform this action.'
            });
            return message.reply({
                components: [errorContainer],
                flags: MessageFlags.IsComponentsV2
            });
        }

        const channel = message.mentions.channels.first() || message.channel;

        try {
            // Update channel permissions to hide it
            await channel.permissionOverwrites.edit(message.guild.roles.everyone, {
                ViewChannel: false // Deny the ViewChannel permission
            });

            // Send confirmation embed
            const successContainer = UI.createContainer({
                description: `- \`#${channel.name}\` has been hided successfully.`
            });

            return message.reply({
                components: [successContainer],
                flags: MessageFlags.IsComponentsV2
            });
        } catch (error) {
            console.error('Error hiding channel:', error);

            // Handle unexpected errors
            const errorContainer = UI.createContainer({
                description: '- An error occurred while trying to hide the channel. Please try again later.'
            });

            return message.reply({
                components: [errorContainer],
                flags: MessageFlags.IsComponentsV2
            });
        }
    }
};
