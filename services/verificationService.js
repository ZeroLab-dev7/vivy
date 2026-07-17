const { VerificationConfig, VerifiedUser, VerifiedUsers, VerificationBlacklist, VerificationLog, SecurityVerificationSetup } = require('../db/models');
const { Op } = require('sequelize');

// Global maps to track verification cooldowns and failure counts in memory
const verificationCooldowns = new Map();
const verificationFailures = new Map();

class VerificationService {
    static async getOrCreateConfig(guildId) {
        let config = await VerificationConfig.findByPk(guildId);
        if (!config) {
            config = await VerificationConfig.create({ guild_id: guildId });
        }
        return config;
    }

    /**
     * Mode 1: Staff manual verification
     */
    static async verifyMember(member, verificatorId = null, gender = 'unspecified') {
        const config = await this.getOrCreateConfig(member.guild.id);
        if (!config.is_enabled) return { success: false, reason: 'Verification is disabled' };

        const start = Date.now();

        // Check blacklist
        const isBlacklisted = await VerificationBlacklist.findOne({
            where: { guild_id: member.guild.id, user_id: member.id }
        });
        if (isBlacklisted) {
            await this.logVerificationEvent(member.guild.id, member, 'staff', 'failed', [], ['blacklisted'], verificatorId, Date.now() - start, 'Blacklisted from verification');
            return { success: false, reason: 'You are blacklisted from verifying in this server' };
        }

        // Account age checks
        const accountAgeDays = Math.floor((Date.now() - member.user.createdTimestamp) / (24 * 60 * 60 * 1000));
        if (accountAgeDays < config.min_account_age_days) {
            await this.logVerificationEvent(member.guild.id, member, 'staff', 'failed', [], ['account_age'], verificatorId, Date.now() - start, 'Account age too new');
            return { success: false, reason: `Your account must be at least ${config.min_account_age_days} days old (current age: ${accountAgeDays} days)` };
        }

        const joinAgeDays = Math.floor((Date.now() - member.joinedTimestamp) / (24 * 60 * 60 * 1000));
        if (joinAgeDays < config.min_join_age_days) {
            await this.logVerificationEvent(member.guild.id, member, 'staff', 'failed', [], ['join_age'], verificatorId, Date.now() - start, 'Join time too new');
            return { success: false, reason: `You must wait at least ${config.min_join_age_days} days after joining before verifying` };
        }

        // Apply verification role
        if (config.role_id) {
            const role = member.guild.roles.cache.get(config.role_id);
            if (role) {
                await member.roles.add(role, 'User completed verification').catch(console.error);
            }
        }

        // Record verification in verified_users table (compatibility with legacy DB)
        if (VerifiedUsers) {
            await VerifiedUsers.upsert({
                guild_id: member.guild.id,
                user_id: member.id,
                username: member.user.username,
                verified_at: new Date(),
                verificator_id: verificatorId || member.guild.client.user.id,
                gender
            }).catch(() => { });
        } else if (VerifiedUser) {
            await VerifiedUser.upsert({
                guild_id: member.guild.id,
                user_id: member.id,
                username: member.user.username,
                verified_at: new Date(),
                verificator_id: verificatorId || member.guild.client.user.id,
                gender
            }).catch(() => { });
        }

        // Log Verification History
        await this.logVerificationEvent(member.guild.id, member, 'staff', 'passed', ['blacklist', 'account_age', 'join_age'], [], verificatorId, Date.now() - start);

        return { success: true };
    }

    /**
     * Mode 2: Security automated verification
     */
    static async verifyMemberSecurity(member, config) {
        const start = Date.now();

        // 1. Block bot accounts
        if (member.user.bot) {
            return { success: false, reason: 'Bot accounts cannot be verified.' };
        }

        // 2. Cooldown check
        const lastTime = verificationCooldowns.get(member.id);
        const cooldownMs = (config.sec_cooldown || 10) * 1000;
        if (lastTime && (Date.now() - lastTime) < cooldownMs) {
            const remaining = Math.ceil((cooldownMs - (Date.now() - lastTime)) / 1000);
            return { success: false, reason: `Please wait ${remaining}s before trying again.` };
        }
        verificationCooldowns.set(member.id, Date.now());

        // Check blacklist
        const isBlacklisted = await VerificationBlacklist.findOne({
            where: { guild_id: member.guild.id, user_id: member.id }
        });
        if (isBlacklisted) {
            await this.logVerificationEvent(member.guild.id, member, 'security', 'failed', [], ['blacklisted'], null, Date.now() - start, 'Blacklisted from verification');
            return { success: false, reason: 'You are blacklisted from verification in this server.' };
        }

        const checksPassed = [];
        const checksFailed = [];

        // 3. Minimum Discord Account Age
        const accountAgeDays = Math.floor((Date.now() - member.user.createdTimestamp) / (24 * 60 * 60 * 1000));
        if (config.sec_min_account_age > 0) {
            if (accountAgeDays < config.sec_min_account_age) {
                checksFailed.push('account_age');
            } else {
                checksPassed.push('account_age');
            }
        }

        // 4. Minimum Server Join Time
        const joinAgeSeconds = Math.floor((Date.now() - member.joinedTimestamp) / 1000);
        if (config.sec_min_join_time > 0) {
            if (joinAgeSeconds < config.sec_min_join_time) {
                checksFailed.push('join_time');
            } else {
                checksPassed.push('join_time');
            }
        }

        // 5. Require Discord Avatar
        if (config.sec_require_avatar) {
            if (!member.user.avatar) {
                checksFailed.push('avatar');
            } else {
                checksPassed.push('avatar');
            }
        }

        // 6. Require Discord Verified Account (verified email/phone check)
        if (config.sec_require_verified_account) {
            // member.user.verified is present on discord gateway user payloads
            if (member.user.verified === false) {
                checksFailed.push('verified_account');
            } else {
                checksPassed.push('verified_account');
            }
        }

        // 7. Anti Alt Detection
        if (config.sec_anti_alt && config.sec_anti_alt !== 'disabled') {
            if (config.sec_anti_alt === 'basic') {
                // Prevent accounts created in the last 7 days
                if (accountAgeDays < 7) {
                    checksFailed.push('anti_alt_basic');
                } else {
                    checksPassed.push('anti_alt_basic');
                }
            } else if (config.sec_anti_alt === 'strict') {
                // Prevent duplicate avatar hashes inside the guild history database
                if (member.user.avatar) {
                    const dup = await VerificationLog.findOne({
                        where: {
                            guild_id: member.guild.id,
                            user_avatar: member.user.avatar,
                            user_id: { [Op.ne]: member.id },
                            status: 'passed'
                        }
                    });
                    if (dup) {
                        checksFailed.push('anti_alt_strict');
                    } else {
                        checksPassed.push('anti_alt_strict');
                    }
                } else {
                    // Strict require avatar fallback if no avatar
                    checksFailed.push('anti_alt_strict');
                }
            }
        }

        const duration = Date.now() - start;

        // Verify result
        if (checksFailed.length > 0) {
            // Record failure
            const fails = (verificationFailures.get(member.id) || 0) + 1;
            verificationFailures.set(member.id, fails);

            const failReason = `Failed checks: ${checksFailed.join(', ')}`;
            await this.logVerificationEvent(member.guild.id, member, 'security', 'failed', checksPassed, checksFailed, null, duration, failReason);

            // Trigger kick/ban limits
            if (config.sec_auto_kick_limit > 0 && fails >= config.sec_auto_kick_limit) {
                verificationFailures.delete(member.id);
                if (config.sec_auto_ban) {
                    await member.ban({ reason: `Security verification failed ${fails} times. Auto Ban triggered.` }).catch(() => { });
                } else {
                    await member.kick(`Security verification failed ${fails} times. Auto Kick triggered.`).catch(() => { });
                }
            }

            return {
                success: false,
                reason: `Verification denied. ${failReason}`,
                checksFailed
            };
        }

        // Success: Reset failure count
        verificationFailures.delete(member.id);

        // Remove Unverified Role
        if (config.sec_unverified_role) {
            const role = member.guild.roles.cache.get(config.sec_unverified_role);
            if (role) await member.roles.remove(role, 'Automated verification successful').catch(() => { });
        }

        // Add Verified Role
        if (config.sec_verified_role) {
            const role = member.guild.roles.cache.get(config.sec_verified_role);
            if (role) await member.roles.add(role, 'Automated verification successful').catch(() => { });
        }

        // Record verification in verified_users table (compatibility with legacy DB)
        if (VerifiedUsers) {
            await VerifiedUsers.upsert({
                guild_id: member.guild.id,
                user_id: member.id,
                username: member.user.username,
                verified_at: new Date(),
                verificator_id: member.guild.client.user.id,
                gender: 'unspecified'
            }).catch(() => { });
        } else if (VerifiedUser) {
            await VerifiedUser.upsert({
                guild_id: member.guild.id,
                user_id: member.id,
                username: member.user.username,
                verified_at: new Date(),
                verificator_id: member.guild.client.user.id,
                gender: 'unspecified'
            }).catch(() => { });
        }

        // Log successful verification
        await this.logVerificationEvent(member.guild.id, member, 'security', 'passed', checksPassed, [], null, duration);

        return { success: true };
    }

    /**
     * Unified logging function to write VerificationLog entries
     */
    static async logVerificationEvent(guildId, member, method, status, checksPassed, checksFailed, moderatorId = null, durationMs = 0, failureReason = null) {
        try {
            await VerificationLog.create({
                guild_id: guildId,
                user_id: member.id,
                username: member.user.username,
                user_avatar: member.user.avatar || null,
                method,
                status,
                checks_passed: JSON.stringify(checksPassed),
                checks_failed: JSON.stringify(checksFailed),
                moderator_id: moderatorId,
                duration_ms: durationMs,
                failure_reason: failureReason
            });
        } catch (e) {
            console.error('[logVerificationEvent] Error:', e);
        }
    }

    /**
     * Brand new automated Security Verification check logic
     */
    static async runSecurityVerification(member, setup) {
        const start = Date.now();
        if (member.user.bot) return { success: false, reason: 'Bots cannot verify.' };

        // Cooldown check (Section 4 Rule: Cooldown)
        const lastTime = verificationCooldowns.get(member.id);

        let cooldownVal = 0;
        let isCooldownEnabled = false;
        let maxAttemptsVal = 3;
        let isMaxAttemptsEnabled = false;
        let minAccAge = 0;
        let minJoinTime = 0;
        let requireAvatar = false;
        let requireVerified = false;
        let antiAlt = 'disabled';
        let autoKick = false;
        let autoBan = false;
        let sendDm = false;
        let welcomeMsg = false;

        const level = setup.level || 'low';
        if (level === 'low') {
            minAccAge = 3;
            minJoinTime = 10;
        } else if (level === 'medium') {
            minAccAge = 14;
            minJoinTime = 60;
        } else if (level === 'high') {
            minAccAge = 30;
            requireAvatar = true;
            antiAlt = 'basic';
            isCooldownEnabled = true;
            cooldownVal = 10;
        } else if (level === 'extreme') {
            minAccAge = 60;
            minJoinTime = 300;
            requireAvatar = true;
            requireVerified = true;
            antiAlt = 'strict';
            autoKick = true;
            isCooldownEnabled = true;
            cooldownVal = 10;
            isMaxAttemptsEnabled = true;
            maxAttemptsVal = 3;
        } else if (level === 'custom') {
            minAccAge = setup.rule_min_account_age_enabled ? setup.rule_min_account_age_val : 0;
            minJoinTime = setup.rule_min_join_time_enabled ? setup.rule_min_join_time_val : 0;
            requireAvatar = !!setup.rule_require_avatar_enabled;
            requireVerified = false; // Custom verified account
            antiAlt = setup.rule_anti_alt_enabled ? setup.rule_anti_alt_type : 'disabled';
            isCooldownEnabled = !!setup.rule_cooldown_enabled;
            cooldownVal = setup.rule_cooldown_val || 10;
            isMaxAttemptsEnabled = !!setup.rule_max_attempts_enabled;
            maxAttemptsVal = setup.rule_max_attempts_val || 3;
            autoKick = !!setup.rule_auto_kick_enabled;
            autoBan = !!setup.rule_auto_ban_enabled;
            sendDm = !!setup.rule_send_dm_enabled;
            welcomeMsg = !!setup.rule_welcome_message_enabled;
        }

        if (isCooldownEnabled && cooldownVal > 0) {
            const cooldownMs = cooldownVal * 1000;
            if (lastTime && (Date.now() - lastTime) < cooldownMs) {
                const remaining = Math.ceil((cooldownMs - (Date.now() - lastTime)) / 1000);
                return { success: false, reason: `Please wait ${remaining}s before trying again.` };
            }
            verificationCooldowns.set(member.id, Date.now());
        }

        // Check blacklist
        const isBlacklisted = await VerificationBlacklist.findOne({
            where: { guild_id: member.guild.id, user_id: member.id }
        });
        if (isBlacklisted) {
            await this.logSecurityVerificationEvent(member.guild.id, member, 'failed', [], ['blacklisted'], Date.now() - start, 'Blacklisted from verification');
            return { success: false, reason: 'You are blacklisted from verification.' };
        }

        // Perform checks
        const checksPassed = [];
        const checksFailed = [];

        // 1. Account age
        const accountAgeDays = Math.floor((Date.now() - member.user.createdTimestamp) / (24 * 60 * 60 * 1000));
        if (minAccAge > 0) {
            if (accountAgeDays < minAccAge) checksFailed.push('account_age');
            else checksPassed.push('account_age');
        }

        // 2. Server join delay
        const joinAgeSeconds = Math.floor((Date.now() - member.joinedTimestamp) / 1000);
        if (minJoinTime > 0) {
            if (joinAgeSeconds < minJoinTime) checksFailed.push('join_time');
            else checksPassed.push('join_time');
        }

        // 3. Require avatar
        if (requireAvatar) {
            if (!member.user.avatar) checksFailed.push('avatar');
            else checksPassed.push('avatar');
        }

        // 4. Require Discord Verified account
        if (requireVerified) {
            if (member.user.verified === false) checksFailed.push('verified_account');
            else checksPassed.push('verified_account');
        }

        // 5. Anti-Alt
        if (antiAlt !== 'disabled') {
            if (antiAlt === 'basic') {
                if (accountAgeDays < 7) checksFailed.push('anti_alt_basic');
                else checksPassed.push('anti_alt_basic');
            } else if (antiAlt === 'strict') {
                if (member.user.avatar) {
                    const dup = await VerificationLog.findOne({
                        where: {
                            guild_id: member.guild.id,
                            user_avatar: member.user.avatar,
                            user_id: { [Op.ne]: member.id },
                            status: 'passed'
                        }
                    });
                    if (dup) checksFailed.push('anti_alt_strict');
                    else checksPassed.push('anti_alt_strict');
                } else {
                    checksFailed.push('anti_alt_strict');
                }
            }
        }

        const duration = Date.now() - start;

        // Success / Failure Action Handling
        if (checksFailed.length > 0) {
            const fails = (verificationFailures.get(member.id) || 0) + 1;
            verificationFailures.set(member.id, fails);

            const failReason = `Failed checks: ${checksFailed.join(', ')}`;
            await this.logSecurityVerificationEvent(member.guild.id, member, 'failed', checksPassed, checksFailed, duration, failReason);

            // Failure actions
            const actionFailKick = autoKick || !!setup.action_fail_kick;
            const actionFailBan = autoBan || !!setup.action_fail_ban;
            const actionFailNotify = !!setup.action_fail_notify_staff;

            if (actionFailNotify && setup.log_channel_id) {
                const channel = member.guild.channels.cache.get(setup.log_channel_id);
                if (channel) {
                    const UI = require('../utils/ui');
                    const { MessageFlags } = require('discord.js');
                    const logContainer = UI.createContainer({
                        title: '⚠️ Security Verification Failed',
                        description: `**User:** ${member.user.tag} (\`${member.id}\`)\n` +
                            `**Status:** Verification Failed\n` +
                            `**Reason:** ${failReason}\n` +
                            `**Account Age:** ${accountAgeDays} days\n` +
                            `**Server Join Time:** ${joinAgeSeconds}s\n` +
                            `**Checks Passed:** ${checksPassed.length > 0 ? checksPassed.map(c => `\`${c}\``).join(', ') : 'None'}\n` +
                            `**Checks Failed:** ${checksFailed.map(c => `\`${c}\``).join(', ')}\n` +
                            `**Duration:** ${duration}ms`,
                        thumbnail: member.user.displayAvatarURL({ dynamic: true }),
                        color: 0xFF0000
                    });
                    channel.send({ components: [logContainer], flags: MessageFlags.IsComponentsV2 }).catch(console.error);
                }
            }

            if (isMaxAttemptsEnabled && fails >= maxAttemptsVal) {
                verificationFailures.delete(member.id);
                if (actionFailBan) {
                    await member.ban({ reason: `Security verification failed ${fails} times. Auto Ban triggered.` }).catch(() => { });
                } else if (actionFailKick) {
                    await member.kick(`Security verification failed ${fails} times. Auto Kick triggered.`).catch(() => { });
                }
            } else {
                if (actionFailBan) {
                    await member.ban({ reason: `Security verification failed. Auto Ban triggered.` }).catch(() => { });
                } else if (actionFailKick) {
                    await member.kick(`Security verification failed. Auto Kick triggered.`).catch(() => { });
                }
            }

            if (sendDm) {
                await member.send({ content: `<:no:1526496561188831244>Verification failed in **${member.guild.name}**.\nReason: ${failReason}` }).catch(() => { });
            }

            return { success: false, reason: `Verification failed: ${failReason}`, checksFailed };
        }

        // Reset failure count on success
        verificationFailures.delete(member.id);

        // Section 5 After Success Actions: Remove Unverified Role, Give Verified Role, Send Welcome DM, Log Success
        if (setup.action_success_remove_unverified && setup.unverified_role_id) {
            const role = member.guild.roles.cache.get(setup.unverified_role_id);
            if (role) await member.roles.remove(role, 'Security verification successful').catch(() => { });
        }

        if (setup.action_success_give_verified && setup.verified_role_id) {
            const role = member.guild.roles.cache.get(setup.verified_role_id);
            if (role) await member.roles.add(role, 'Security verification successful').catch(() => { });
        }

        if (setup.action_success_send_dm || welcomeMsg) {
            await member.send({ content: `<a:pink8:1337678972108148757> Welcome to **${member.guild.name}**! You have successfully verified.` }).catch(() => { });
        }

        if (setup.action_success_log && setup.log_channel_id) {
            const channel = member.guild.channels.cache.get(setup.log_channel_id);
            if (channel) {
                const UI = require('../utils/ui');
                const { MessageFlags } = require('discord.js');
                const logContainer = UI.createContainer({
                    title: '✅ Security Verification Passed',
                    description: `**User:** ${member.user.tag} (\`${member.id}\`)\n` +
                        `**Status:** Verification Passed\n` +
                        `**Account Age:** ${accountAgeDays} days\n` +
                        `**Server Join Time:** ${joinAgeSeconds}s\n` +
                        `**Checks Passed:** ${checksPassed.length > 0 ? checksPassed.map(c => `\`${c}\``).join(', ') : 'None'}\n` +
                        `**Duration:** ${duration}ms`,
                    thumbnail: member.user.displayAvatarURL({ dynamic: true }),
                    color: 0x00FF00
                });
                channel.send({ components: [logContainer], flags: MessageFlags.IsComponentsV2 }).catch(console.error);
            }
        }

        // Record verification in verified_users table (compatibility with legacy DB)
        if (VerifiedUsers) {
            await VerifiedUsers.upsert({
                guild_id: member.guild.id,
                user_id: member.id,
                username: member.user.username,
                verified_at: new Date(),
                verificator_id: member.guild.client.user.id,
                gender: 'unspecified'
            }).catch(() => { });
        } else if (VerifiedUser) {
            await VerifiedUser.upsert({
                guild_id: member.guild.id,
                user_id: member.id,
                username: member.user.username,
                verified_at: new Date(),
                verificator_id: member.guild.client.user.id,
                gender: 'unspecified'
            }).catch(() => { });
        }

        // Log successful verification history
        await this.logSecurityVerificationEvent(member.guild.id, member, 'passed', checksPassed, [], duration);

        return { success: true };
    }

    static async logSecurityVerificationEvent(guildId, member, status, checksPassed, checksFailed, durationMs = 0, failureReason = null) {
        try {
            await VerificationLog.create({
                guild_id: guildId,
                user_id: member.id,
                username: member.user.username,
                user_avatar: member.user.avatar || null,
                method: 'security',
                status,
                checks_passed: JSON.stringify(checksPassed),
                checks_failed: JSON.stringify(checksFailed),
                duration_ms: durationMs,
                failure_reason: failureReason
            });
        } catch (e) {
            console.error('[logSecurityVerificationEvent] Error:', e);
        }
    }

    static getFailures(userId) {
        return verificationFailures.get(userId) || 0;
    }

    static incrementFailures(userId) {
        const current = verificationFailures.get(userId) || 0;
        verificationFailures.set(userId, current + 1);
        return current + 1;
    }

    static resetFailures(userId) {
        verificationFailures.delete(userId);
    }
}

module.exports = VerificationService;
