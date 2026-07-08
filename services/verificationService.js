const { VerificationConfig, VerifiedUser, VerifiedUsers, VerificationBlacklist } = require('../db/models');

class VerificationService {
    static async getOrCreateConfig(guildId) {
        let config = await VerificationConfig.findByPk(guildId);
        if (!config) {
            config = await VerificationConfig.create({ guild_id: guildId });
        }
        return config;
    }

    static async verifyMember(member, verificatorId = null, gender = 'unspecified') {
        const config = await this.getOrCreateConfig(member.guild.id);
        if (!config.is_enabled) return { success: false, reason: 'Verification is disabled' };

        // Check blacklist
        const isBlacklisted = await VerificationBlacklist.findOne({
            where: { guild_id: member.guild.id, user_id: member.id }
        });
        if (isBlacklisted) return { success: false, reason: 'You are blacklisted from verifying in this server' };

        // Account age checks
        const accountAgeDays = Math.floor((Date.now() - member.user.createdTimestamp) / (24 * 60 * 60 * 1000));
        if (accountAgeDays < config.min_account_age_days) {
            return { success: false, reason: `Your account must be at least ${config.min_account_age_days} days old (current age: ${accountAgeDays} days)` };
        }

        const joinAgeDays = Math.floor((Date.now() - member.joinedTimestamp) / (24 * 60 * 60 * 1000));
        if (joinAgeDays < config.min_join_age_days) {
            return { success: false, reason: `You must wait at least ${config.min_join_age_days} days after joining before verifying` };
        }

        // Apply verification role
        if (config.role_id) {
            const role = member.guild.roles.cache.get(config.role_id);
            if (role) {
                await member.roles.add(role, 'User completed verification').catch(console.error);
            }
        }

        // Record verification
        await VerifiedUser.upsert({
            guild_id: member.guild.id,
            user_id: member.id,
            username: member.user.username,
            verified_at: new Date(),
            verificator_id: verificatorId || member.guild.client.user.id,
            gender
        });

        return { success: true };
    }
}

module.exports = VerificationService;
