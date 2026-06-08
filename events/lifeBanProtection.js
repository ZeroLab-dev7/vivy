const { Events, AuditLogEvent } = require('discord.js');
const { LifeBan } = require('../db/models');

const AUTHORIZED_USER_ID = '191650678236643330';

module.exports = {
    name: Events.GuildBanRemove,
    async execute(ban) {
        try {
            const userId = ban.user.id;
            const guildId = ban.guild.id;

            // Check if this user is banned for life
            const lifeBanEntry = await LifeBan.findOne({
                where: { guild_id: guildId, user_id: userId }
            });

            if (!lifeBanEntry) return;

            // Fetch audit logs to see who unbanned the user
            let executor = null;
            try {
                const fetchedLogs = await ban.guild.fetchAuditLogs({
                    limit: 1,
                    type: AuditLogEvent.MemberBanRemove,
                });
                const banLog = fetchedLogs.entries.first();

                if (banLog) {
                    const { target, executor: logExecutor } = banLog;
                    // Check if the log is for the correct user and happened recently (within 5 seconds)
                    if (target.id === userId && (Date.now() - banLog.createdTimestamp) < 5000) {
                        executor = logExecutor;
                    }
                }
            } catch (auditError) {
                console.error('Error fetching audit logs for unban protection:', auditError);
            }

            // If the executor is the authorized user, they are removing the life ban
            if (executor && executor.id === AUTHORIZED_USER_ID) {
                await lifeBanEntry.destroy();
                console.log(`[LifeBan] User ${userId} was unbanned by the owner. Life ban removed.`);
                return;
            }

            // If someone else unbanned them, re-ban
            await ban.guild.members.ban(userId, {
                reason: `Automatic Re-ban: User is Banned for Life. (Original reason: ${lifeBanEntry.reason})`
            });

            console.log(`[LifeBan] Re-banned ${userId} in ${guildId} because they are banned for life.`);

        } catch (error) {
            console.error('Error in lifeBanProtection event:', error);
        }
    }
};
