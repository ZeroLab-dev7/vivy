const { Warning, GuildSettings } = require('../db/models');
const { MessageFlags } = require('discord.js');
const UI = require('../utils/ui');

module.exports = {
    name: 'autoModerationActionExecution',
    async execute(actionExecution) {
        try {
            console.log(`[AutoModEvent] Triggered for rule "${actionExecution.ruleName}" in guild ${actionExecution.guild?.id} by user ${actionExecution.userId}`);
            const { guild, userId, ruleName, channelId } = actionExecution;
            if (!guild) {
                console.warn('[AutoModEvent] No guild object found in event.');
                return;
            }

            const member = await guild.members.fetch(userId).catch(() => null);
            if (!member) {
                console.warn(`[AutoModEvent] Member ${userId} not found in guild ${guild.id}`);
                return;
            }

            // Log action to DB as a warning if ruleName starts with 'Vivy AutoMod:'
            if (ruleName && ruleName.startsWith('Vivy AutoMod:')) {
                const reason = ruleName.replace('Vivy AutoMod:', '').trim();

                // Create a warning in DB
                console.log(`[AutoModEvent] Creating database Warning record for user ${userId}...`);
                await Warning.create({
                    guild_id: guild.id,
                    user_id: userId,
                    moderator_id: guild.client.user.id,
                    reason: `AutoMod: ${reason}`
                });

                // Send a log to the logging channel if configured
                const settings = await GuildSettings.findOne({ where: { guild_id: guild.id } });
                const logChannelId = settings?.log_channel;
                console.log(`[AutoModEvent] Configured log channel ID: ${logChannelId}`);
                
                const logChannel = logChannelId ? (guild.channels.cache.get(logChannelId) || await guild.channels.fetch(logChannelId).catch(() => null)) : null;
                if (logChannel) {
                    console.log(`[AutoModEvent] Sending warning embed to channel #${logChannel.name}...`);
                    const logContainer = UI.createContainer({
                        title: '🛡️ AutoMod Protection Active',
                        description: `**Member:** ${member.user.tag} (\`${member.id}\`)\n**Action:** BLOCKED\n**Reason:** ${reason}\n**Channel:** <#${channelId}>`,
                        color: 0xFF3300,
                        footer: 'AutoMod Security System'
                    });
                    await logChannel.send({ components: [logContainer], flags: MessageFlags.IsComponentsV2 }).catch(e => {
                        console.error('[AutoModEvent] Failed to send log message:', e.message);
                    });
                } else {
                    console.warn(`[AutoModEvent] Log channel ${logChannelId} could not be resolved/found.`);
                }
            }
        } catch (error) {
            console.error('Error handling autoModerationActionExecution:', error);
        }
    }
};
