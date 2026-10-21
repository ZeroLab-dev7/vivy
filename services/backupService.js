const { BackupInstance } = require('../db/models');

class BackupService {
    static async createBackup(guild, creatorId) {
        // Ensure the cache is fully populated by fetching roles and channels from the Discord API
        try {
            await guild.roles.fetch();
            await guild.channels.fetch();
        } catch (e) {
            console.error('[BackupService] Pre-fetch error:', e);
        }

        const backupData = {
            name: guild.name,
            icon: guild.iconURL(),
            roles: [],
            channels: []
        };

        // Serialize roles (not snapshotting permissions)
        guild.roles.cache.forEach(role => {
            if (role.name !== '@everyone' && !role.managed) {
                backupData.roles.push({
                    name: role.name,
                    color: role.color,
                    hoist: role.hoist,
                    mentionable: role.mentionable
                });
            }
        });

        // Serialize channels (not snapshotting permissions)
        guild.channels.cache.forEach(channel => {
            backupData.channels.push({
                name: channel.name,
                type: channel.type,
                parentId: channel.parentId,
                topic: channel.topic,
                nsfw: channel.nsfw,
                userLimit: channel.userLimit,
                bitrate: channel.bitrate
            });
        });

        const id = Math.random().toString(36).substring(2, 11).toUpperCase();
        return await BackupInstance.create({
            id,
            guild_id: guild.id,
            creator_id: creatorId,
            backup_data: JSON.stringify(backupData)
        });
    }

    static async loadBackup(guild, backupId) {
        const backup = await BackupInstance.findOne({ where: { id: backupId, guild_id: guild.id } });
        if (!backup) return { success: false, reason: 'Backup not found' };

        const backupData = JSON.parse(backup.backup_data);

        // Delete existing channels
        guild.channels.cache.forEach(channel => {
            channel.delete('Loading server backup').catch(() => {});
        });

        // Restore roles (simple create)
        for (const roleData of backupData.roles) {
            await guild.roles.create({
                name: roleData.name,
                color: roleData.color,
                hoist: roleData.hoist,
                permissions: roleData.permissions ? BigInt(roleData.permissions) : undefined,
                mentionable: roleData.mentionable,
                reason: 'Restoring backup'
            }).catch(() => {});
        }

        // Restore channels (simple create)
        const categories = {};
        for (const chan of backupData.channels.filter(c => c.type === 4)) { // Categories first
            const created = await guild.channels.create({
                name: chan.name,
                type: chan.type
            }).catch(() => null);
            if (created) categories[chan.parentId] = created.id;
        }

        for (const chan of backupData.channels.filter(c => c.type !== 4)) {
            await guild.channels.create({
                name: chan.name,
                type: chan.type,
                parent: categories[chan.parentId] || null,
                topic: chan.topic,
                nsfw: chan.nsfw,
                userLimit: chan.userLimit,
                bitrate: chan.bitrate
            }).catch(() => {});
        }

        return { success: true };
    }
}

module.exports = BackupService;
