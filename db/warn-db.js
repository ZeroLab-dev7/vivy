const WarnSetup = require('./models/WarnSetup');

module.exports = {
    /**
     * @deprecated Use WarnSetup.upsert() directly if possible.
     */
    async setRoles(guildId, roles) {
        try {
            await WarnSetup.upsert({
                guild_id: guildId,
                warn_first: roles.warn_first,
                warn_second: roles.warn_second,
                warn_last: roles.warn_last,
                warner_role: roles.warner_role,
                warning_logs: roles.warning_logs
            });
            return true;
        } catch (error) {
            console.error('❌ Error in WarnSetup.setRoles:', error);
            throw error;
        }
    },

    /**
     * @deprecated Use WarnSetup.findByPk() directly if possible.
     */
    async getRoles(guildId) {
        try {
            const data = await WarnSetup.findByPk(guildId);
            return data ? data.toJSON() : undefined;
        } catch (error) {
            console.error('❌ Error in WarnSetup.getRoles:', error);
            throw error;
        }
    },
};
