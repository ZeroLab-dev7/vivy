const { MusicConfig } = require('../db/models');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus } = require('@discordjs/voice');

const queues = new Map(); // guild_id -> { connection, player, songs: [], volume: 50, loop: false, current: null }

class MusicService {
    static async getOrCreateConfig(guildId) {
        let config = await MusicConfig.findByPk(guildId);
        if (!config) {
            config = await MusicConfig.create({ guild_id: guildId });
        }
        return config;
    }

    static getQueue(guildId) {
        return queues.get(guildId) || null;
    }

    static createQueue(guildId, voiceChannel, textChannel) {
        const player = createAudioPlayer();
        const connection = joinVoiceChannel({
            channelId: voiceChannel.id,
            guildId: voiceChannel.guild.id,
            adapterCreator: voiceChannel.guild.voiceAdapterCreator,
        });

        connection.subscribe(player);

        const queue = {
            connection,
            player,
            songs: [],
            volume: 50,
            loop: false,
            current: null,
            textChannel
        };

        queues.set(guildId, queue);

        player.on(AudioPlayerStatus.Idle, () => {
            this.playNext(guildId);
        });

        player.on('error', error => {
            console.error(`Audio player error: ${error.message}`);
            this.playNext(guildId);
        });

        return queue;
    }

    static async play(guildId, voiceChannel, textChannel, songUrl, songTitle) {
        let queue = this.getQueue(guildId);
        if (!queue) {
            queue = this.createQueue(guildId, voiceChannel, textChannel);
        }

        const song = { title: songTitle, url: songUrl };
        queue.songs.push(song);

        if (!queue.current) {
            this.playNext(guildId);
        }

        return song;
    }

    static playNext(guildId) {
        const queue = this.getQueue(guildId);
        if (!queue) return;

        if (queue.songs.length === 0) {
            queue.current = null;
            // Handle stay 24/7 or disconnect
            this.getOrCreateConfig(guildId).then(cfg => {
                if (!cfg.stay_24_7) {
                    queue.connection.destroy();
                    queues.delete(guildId);
                }
            });
            return;
        }

        const song = queue.songs.shift();
        queue.current = song;

        try {
            // Stream audio resource (using mock stream or direct link)
            const resource = createAudioResource(song.url, { inlineVolume: true });
            resource.volume.setVolume(queue.volume / 100);
            queue.player.play(resource);

            if (queue.textChannel) {
                queue.textChannel.send(`🎶 Now playing: **${song.title}**`);
            }
        } catch (error) {
            console.error("Failed to play audio resource:", error);
            if (queue.textChannel) {
                queue.textChannel.send(`❌ Failed to play: **${song.title}**`);
            }
            this.playNext(guildId);
        }
    }

    static skip(guildId) {
        const queue = this.getQueue(guildId);
        if (queue) {
            queue.player.stop();
            return true;
        }
        return false;
    }

    static stop(guildId) {
        const queue = this.getQueue(guildId);
        if (queue) {
            queue.songs = [];
            queue.player.stop();
            queue.connection.destroy();
            queues.delete(guildId);
            return true;
        }
        return false;
    }

    static setVolume(guildId, volume) {
        const queue = this.getQueue(guildId);
        if (queue) {
            queue.volume = volume;
            if (queue.player.state.resource) {
                queue.player.state.resource.volume.setVolume(volume / 100);
            }
            return true;
        }
        return false;
    }
}

module.exports = MusicService;
