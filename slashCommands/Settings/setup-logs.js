const { SlashCommandBuilder, PermissionFlagsBits, ChannelType, MessageFlags } = require('discord.js');
const { LogSettings } = require('../../db/models');
const UI = require('../../utils/ui');

const logOptions = [
    { name: 'logs-welcome', description: 'Log Member Joins' },
    { name: 'logs-leave', description: 'Log Member Leaves' },
    { name: 'logs-nickname', description: 'Log Nickname Changes' },
    { name: 'logs-role-given', description: 'Log Role Given' },
    { name: 'logs-role-remove', description: 'Log Role Removed' },
    { name: 'logs-role-create', description: 'Log Role Created' },
    { name: 'logs-role-delete', description: 'Log Role Deleted' },
    { name: 'logs-role-update', description: 'Log Role Updated' },
    { name: 'logs-ban', description: 'Log Bans' },
    { name: 'logs-unban', description: 'Log Unbans' },
    { name: 'logs-kick', description: 'Log Kicks' },
    { name: 'logs-timeout', description: 'Log Timeouts' },
    { name: 'logs-voice-join', description: 'Log Voice Joins' },
    { name: 'logs-voice-leave', description: 'Log Voice Leaves' },
    { name: 'logs-voice-move', description: 'Log Voice Moves' },
    { name: 'logs-voice-mute', description: 'Log Voice Mutes' },
    { name: 'logs-voice-deafen', description: 'Log Voice Deafens' },
    { name: 'logs-voice-disconnect', description: 'Log Voice Disconnects' },
    { name: 'logs-emojis', description: 'Log Emoji Updates' },
    { name: 'logs-channels', description: 'Log Channel Updates' },
    { name: 'logs-messages', description: 'Log Message Edits/Deletes' },
    { name: 'logs-invites', description: 'Log Invite Updates' }
];

const commandBuilder = new SlashCommandBuilder()
    .setName('setup-logs')
    .setDescription('Configure advanced logging system')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

// Add an option for each log type
logOptions.forEach(opt => {
    commandBuilder.addChannelOption(option =>
        option.setName(opt.name)
            .setDescription(opt.description)
            .addChannelTypes(ChannelType.GuildText)
    );
});

module.exports = {
    data: commandBuilder,
    async execute(interaction) {
        // Defer immediately to prevent timeout
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        try {
            const settings = await LogSettings.findOrCreate({
                where: { guild_id: interaction.guild.id },
                defaults: { channels: {} }
            });

            // Clone the current channels to ensure a new reference for Sequelize
            const currentChannels = settings[0].channels ? { ...settings[0].channels } : {};
            const updates = [];

            let isDirty = false;
            // Iterate over options to see what was set
            logOptions.forEach(opt => {
                const channel = interaction.options.getChannel(opt.name);
                if (channel) {
                    // Map slash command option name (kebab-case) to internal log type
                    const key = opt.name.replace('logs-', '');

                    if (currentChannels[key] === channel.id) {
                        updates.push(`⚠️ **${opt.description}** is already set to ${channel}`);
                    } else {
                        currentChannels[key] = channel.id;
                        updates.push(`✅ **${opt.description}** set to ${channel}`);
                        isDirty = true;
                    }
                }
            });

            if (updates.length > 0) {
                // Force update by setting value and saving only if there are changes
                if (isDirty) {
                    settings[0].channels = currentChannels;
                    settings[0].changed('channels', true);
                    await settings[0].save();
                }

                await interaction.editReply({
                    embeds: [UI.createEmbed({
                        title: 'Logging Configuration Updated',
                        description: updates.join('\n'),
                        color: 'Green'
                    })]
                });
            } else {
                // If no options provided, show current config
                const configLines = Object.entries(currentChannels).map(([key, id]) => {
                    return `**${key}**: <#${id}>`;
                });

                await interaction.editReply({
                    embeds: [UI.createEmbed({
                        title: 'Current Logging Configuration',
                        description: configLines.length > 0 ? configLines.join('\n') : "No logging channels configured.",
                        color: 'Blue'
                    })]
                });
            }
        } catch (error) {
            console.error('Setup Logs Error:', error);
            const errorOptions = { embeds: [UI.createEmbed({ title: 'Error', description: '<:no:1526496561188831244>Failed to configure logs.', color: 'Red' })], ephemeral: true };
            if (interaction.deferred || interaction.replied) {
                await interaction.editReply(errorOptions).catch(() => { });
            } else {
                await interaction.reply(errorOptions).catch(() => { });
            }
        }
    }
};
