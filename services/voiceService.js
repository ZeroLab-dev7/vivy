const { TempVoiceConfig, TempVoiceChannel } = require('../db/models');
const { ChannelType } = require('discord.js');

class VoiceService {
    static async getOrCreateConfig(guildId) {
        let config = await TempVoiceConfig.findByPk(guildId);
        if (!config) {
            config = await TempVoiceConfig.create({ guild_id: guildId });
        }
        return config;
    }

    static async handleVoiceStateUpdate(oldState, newState) {
        const member = newState.member;
        if (!member || member.user.bot) return;

        const guildId = newState.guild.id;
        const config = await this.getOrCreateConfig(guildId);
        if (!config.is_enabled || !config.hub_channel_id) return;

        // 1. User joins the Creator/Hub Voice Channel
        if (newState.channelId === config.hub_channel_id) {
            try {
                const parentCategory = config.category_id || newState.channel?.parentId;
                
                const tempChannel = await newState.guild.channels.create({
                    name: `🔊 ${member.user.username}'s Room`,
                    type: ChannelType.GuildVoice,
                    parent: parentCategory || null,
                    userLimit: config.default_limit || 0,
                    bitrate: config.default_bitrate || 64000
                });

                // Save reference
                await TempVoiceChannel.create({
                    channel_id: tempChannel.id,
                    guild_id: guildId,
                    creator_id: member.id
                });

                // Move user to the new temporary channel
                await member.voice.setChannel(tempChannel).catch(() => {});
            } catch (error) {
                console.error("Failed to create temporary voice channel:", error);
            }
        }

        // 2. User leaves a voice channel: check if previous voice channel was a temporary channel and is now empty
        if (oldState.channelId && oldState.channelId !== newState.channelId) {
            const tempChan = await TempVoiceChannel.findByPk(oldState.channelId);
            if (tempChan) {
                const channel = oldState.guild.channels.cache.get(oldState.channelId);
                if (channel && channel.members.size === 0) {
                    await channel.delete('Temporary voice channel empty').catch(() => {});
                    await tempChan.destroy().catch(() => {});
                }
            }
        }
    }
}

module.exports = VoiceService;
