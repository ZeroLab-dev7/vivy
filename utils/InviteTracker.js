const { Collection } = require('discord.js');

class InviteTracker {
    constructor(client) {
        this.client = client;
        this.invites = new Collection();
    }

    /**
     * Fetch and cache invites for a guild
     * @param {Guild} guild 
     */
    async fetchAndCache(guild) {
        try {
            if (!guild.members.me.permissions.has('ManageGuild')) return;

            const invites = await guild.invites.fetch();
            const codeUses = new Collection();

            invites.each(inv => codeUses.set(inv.code, inv.uses));
            this.invites.set(guild.id, codeUses);

            console.log(`Cached ${invites.size} invites for ${guild.name}`);
        } catch (err) {
            console.error(`Failed to cache invites for ${guild.name}:`, err);
        }
    }

    /**
     * Find which invite was used by a new member
     * @param {GuildMember} member 
     * @returns {Promise<Invite|null>} The invite that was used
     */
    async findInviter(member) {
        try {
            const guild = member.guild;
            if (!guild.members.me.permissions.has('ManageGuild')) return null;

            // Get cached invites
            const cachedInvites = this.invites.get(guild.id);
            if (!cachedInvites) return null;

            // Fetch new invites
            const newInvites = await guild.invites.fetch();

            // Find the invite that has incremented uses
            let usedInvite = null;
            newInvites.find(inv => {
                const cachedUses = cachedInvites.get(inv.code) || 0;
                if (inv.uses > cachedUses) {
                    usedInvite = inv;
                    return true;
                }
                return false;
            });

            // Update cache
            const codeUses = new Collection();
            newInvites.each(inv => codeUses.set(inv.code, inv.uses));
            this.invites.set(guild.id, codeUses);

            return usedInvite;
        } catch (err) {
            console.error('Error finding inviter:', err);
            return null;
        }
    }
}

module.exports = InviteTracker;
