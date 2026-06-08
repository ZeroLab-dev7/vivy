const { MessageFlags } = require('discord.js');
const { joinVoiceChannel } = require('@discordjs/voice');
const UI = require('../../utils/ui');
const Emojis = require('../../utils/emojis');

const ALLOWED_USER_ID = "1218034475775299688";

module.exports = {
    name: 'join',
    description: 'Bot joins your voice channel (AFK Voice).',
    aliases: ['summon', 'connect'],
    async execute(message, args) {
        // Strict Restriction
        if (message.author.id !== ALLOWED_USER_ID) {
            return message.reply({
                components: [UI.createContainer({
                    description: `- ${Emojis.Status.error} You are not authorized to use this command.`
                })],
                flags: MessageFlags.IsComponentsV2
            });
        }

        const { member, guild } = message;

        // Check if user is in a voice channel
        if (!member.voice.channel) {
            return message.reply({
                components: [UI.createContainer({
                    description: `- ${Emojis.Status.warning} You must be in a voice channel first.`
                })],
                flags: MessageFlags.IsComponentsV2
            });
        }

        try {
            // Join the voice channel
            joinVoiceChannel({
                channelId: member.voice.channel.id,
                guildId: guild.id,
                adapterCreator: guild.voiceAdapterCreator,
                selfDeaf: false,
                selfMute: false,
            });

            const successContainer = UI.createContainer({
                description: `- ${Emojis.Status.success} Successfully joined \`${member.voice.channel.name}\``,
                footer: 'AFK Voice Mode Enabled'
            });

            return message.reply({
                components: [successContainer],
                flags: MessageFlags.IsComponentsV2
            });

        } catch (error) {
            console.error("Join command error (somework):", error);
            const errorContainer = UI.createContainer({
                description: `- ${Emojis.Status.error} Failed to join: ${error.message}`
            });

            return message.reply({
                components: [errorContainer],
                flags: MessageFlags.IsComponentsV2
            });
        }
    }
};
