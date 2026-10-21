const { PermissionsBitField, MessageFlags } = require('discord.js');
const UI = require('../../utils/ui');

const COOLDOWN_TIME = 5000; // 5 seconds cooldown
const cooldowns = new Map();

module.exports = {
    name: 'channelinfo',
    aliases: ['cinfo', 'channel-info'],
    description: 'Get information about a specific channel, including its settings and permissions',
    async execute(message, args) {
        // Check if the user is on cooldown
        if (cooldowns.has(message.author.id)) {
            return message.react('⏳'); // React with a cooldown emoji
        }

        // Set cooldown for the user
        cooldowns.set(message.author.id, Date.now() + COOLDOWN_TIME);
        setTimeout(() => cooldowns.delete(message.author.id), COOLDOWN_TIME);

        if (args.length < 1) {
            const guideContainer = UI.createContainer({
                title: 'Command : ChannelInfo',
                description: 'Retrieve details about a specific channel,\n including its settings and permissions.',
                fields: [
                    { name: "Aliases:", value: "- cinfo, channel-info" },
                    { name: "Usage:", value: "- ?channelinfo #channel/id" },
                    { name: "Examples:", value: `- ?channelinfo #general\n- ?channelinfo 123456789012345678` }
                ]
            });
            return message.reply({
                components: [guideContainer],
                flags: MessageFlags.IsComponentsV2
            });
        }

        const channelInput = args[0];
        let channel;

        if (/^\d+$/.test(channelInput)) {
            // If the input is a channel ID
            channel = message.guild.channels.cache.get(channelInput);
        } else if (message.mentions.channels.size > 0) {
            // If it's a channel mention
            channel = message.mentions.channels.first();
        } else {
            // If it's a channel name
            channel = message.guild.channels.cache.find(c => c.name.toLowerCase() === channelInput.toLowerCase());
        }

        if (!channel) {
            const errorContainer = UI.createContainer({
                description: '- Channel not found.'
            });
            return message.reply({
                components: [errorContainer],
                flags: MessageFlags.IsComponentsV2
            });
        }

        // Channel Type Mapping
        const channelTypes = {
            0: 'Text Channel',
            2: 'Voice Channel',
            4: 'Category',
            5: 'Announcement Channel',
            13: 'Stage Channel',
            15: 'Forum Channel'
        };

        const channelType = channelTypes[channel.type] || 'Unknown';

        // Extract Permissions
        const permissions = channel.permissionsFor(message.guild.roles.everyone).toArray();
        const importantPermissions = [
            'ViewChannel', 'SendMessages', 'ManageChannels', 'ManageMessages',
            'Connect', 'Speak', 'MuteMembers', 'DeafenMembers', 'MoveMembers'
        ];

        const filteredPermissions = permissions
            .filter(perm => importantPermissions.includes(perm))
            .map(perm => ` ${perm.replace(/([A-Z])/g, ' $1').trim()}`)
            .join('\n') || ' No important permissions';

        // Channel Information Embed
        const channelContainer = UI.createContainer({
            title: 'Command : Channel Info',
            description: `Channel Information: **${channel.name}**`,
            fields: [
                { name: " Channel ID", value: `\`${channel.id}\`` },
                { name: " Type", value: `${channelType}` },
                { name: " Created At", value: `<t:${Math.floor(channel.createdTimestamp / 1000)}:F>` },
                { name: " NSFW", value: channel.nsfw ? ' Yes' : ' No' },
                { name: " Channel Permissions", value: filteredPermissions }
            ]
        });

        return message.reply({
            components: [channelContainer],
            flags: MessageFlags.IsComponentsV2
        });
    },
};
