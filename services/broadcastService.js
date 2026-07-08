const { BroadcastLog } = require('../db/models');
const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { Op } = require('sequelize');

class BroadcastService {
    static async sendBroadcast(client, broadcast) {
        const startTime = Date.now();
        let successCount = 0;
        let targetCount = 0;
        const failedGuilds = [];

        const guilds = Array.from(client.guilds.cache.values());
        targetCount = guilds.length;

        let messagePayload = {};
        if (broadcast.type === 'embed') {
            const embed = new EmbedBuilder()
                .setDescription(broadcast.content)
                .setColor('#8b5cf6')
                .setTimestamp();
            if (broadcast.title) {
                embed.setTitle(broadcast.title);
            }
            messagePayload = { embeds: [embed] };
        } else {
            messagePayload = { content: broadcast.content };
        }

        for (const guild of guilds) {
            try {
                // Find first text channel with send permissions (ChannelType.GuildText is 0)
                const channel = guild.channels.cache.find(c => 
                    c.type === 0 && 
                    c.permissionsFor(guild.members.me)?.has(PermissionFlagsBits.SendMessages)
                );
                if (channel) {
                    await channel.send(messagePayload);
                    successCount++;
                } else {
                    failedGuilds.push({
                        id: guild.id,
                        name: guild.name,
                        reason: 'No text channel found with SendMessages permission.'
                    });
                }
            } catch (err) {
                console.error(`Failed to send broadcast to guild ${guild.id}:`, err.message);
                failedGuilds.push({
                    id: guild.id,
                    name: guild.name,
                    reason: err.message || 'Unknown send error'
                });
            }
        }

        const durationMs = Date.now() - startTime;

        await broadcast.update({
            status: 'sent',
            sent_at: new Date(),
            target_count: targetCount,
            success_count: successCount,
            failed_guild_ids: JSON.stringify(failedGuilds),
            duration_ms: durationMs
        });
        console.log(`[Broadcast] Completed broadcast ID ${broadcast.id}. Success rate: ${successCount}/${targetCount} in ${durationMs}ms`);
    }

    static async checkAndSendScheduled(client) {
        try {
            const now = new Date();
            const scheduled = await BroadcastLog.findAll({
                where: {
                    status: 'scheduled',
                    scheduled_at: { [Op.lte]: now }
                }
            });

            for (const b of scheduled) {
                // Instantly update status to 'sent' (or similar) to prevent double delivery on slow ticks
                await b.update({ status: 'sent' });
                await this.sendBroadcast(client, b);
            }
        } catch (err) {
            console.error('[BroadcastChecker] Error running scheduler:', err);
        }
    }
}

module.exports = BroadcastService;
