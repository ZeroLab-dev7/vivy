const { LevelConfig, UserXP, LevelReward, XPBoost, VoiceSession, LevelHistory, LevelLeaderboardCache } = require('../db/models');
const { createCanvas, loadImage } = require('@napi-rs/canvas');

class LevelService {
    static async getOrCreateConfig(guildId) {
        let config = await LevelConfig.findByPk(guildId);
        if (!config) {
            config = await LevelConfig.create({
                guild_id: guildId,
                is_enabled: true,
                xp_cooldown_sec: 60,
                xp_range_min: 15,
                xp_range_max: 25,
                xp_formula_base: 100,
                xp_formula_exponent: 1.8,
                xp_formula_offset: 100,
                voice_xp_interval_min: 5,
                voice_xp_amount: 10,
                daily_xp_limit: 0,
                weekly_xp_limit: 0,
                announce_enabled: true,
                announce_embed: true,
                announce_color: '#5865F2',
                stack_rewards: true,
                remove_rewards_on_demote: true
            });
        }
        return config;
    }

    static async getOrCreateUserXP(userId, guildId) {
        let xpRecord = await UserXP.findOne({ where: { user_id: userId, guild_id: guildId } });
        if (!xpRecord) {
            xpRecord = await UserXP.create({
                user_id: userId,
                guild_id: guildId,
                xp: 0,
                level: 0,
                text_xp: 0,
                text_level: 0,
                voice_xp: 0,
                voice_level: 0,
                messages_count: 0,
                voice_time_min: 0,
                xp_today: 0,
                xp_week: 0,
                xp_month: 0,
                last_reset_day: new Date(),
                last_reset_week: new Date(),
                last_reset_month: new Date()
            });
        }
        return xpRecord;
    }

    static getXPNeeded(level, config) {
        const base = config?.xp_formula_base ?? 75;
        const exponent = config?.xp_formula_exponent ?? 1.0;
        const offset = config?.xp_formula_offset ?? 100;
        return Math.floor(base * Math.pow(level, exponent) + offset);
    }

    static getTotalXP(level, progressXP, config) {
        let total = progressXP;
        for (let i = 0; i < level; i++) {
            total += this.getXPNeeded(i, config);
        }
        return total;
    }

    static async checkXPLimits(xpRecord, config) {
        const now = new Date();
        const lastResetDay = xpRecord.last_reset_day ? new Date(xpRecord.last_reset_day) : null;
        const lastResetWeek = xpRecord.last_reset_week ? new Date(xpRecord.last_reset_week) : null;
        const lastResetMonth = xpRecord.last_reset_month ? new Date(xpRecord.last_reset_month) : null;

        // Reset daily limit if day has changed
        if (!lastResetDay || now.getDate() !== lastResetDay.getDate() || now.getMonth() !== lastResetDay.getMonth() || now.getFullYear() !== lastResetDay.getFullYear()) {
            xpRecord.xp_today = 0;
            xpRecord.last_reset_day = now;
        }

        // Reset weekly limit if week has changed
        const getWeekNumber = (d) => {
            const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
            const dayNum = date.getUTCDay() || 7;
            date.setUTCDate(date.getUTCDate() + 4 - dayNum);
            const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
            return Math.ceil((((date - yearStart) / 86400000) + 1) / 7);
        };

        if (!lastResetWeek || getWeekNumber(now) !== getWeekNumber(lastResetWeek) || now.getFullYear() !== lastResetWeek.getFullYear()) {
            xpRecord.xp_week = 0;
            xpRecord.last_reset_week = now;
        }

        // Reset monthly limit if month has changed
        if (!lastResetMonth || now.getMonth() !== lastResetMonth.getMonth() || now.getFullYear() !== lastResetMonth.getFullYear()) {
            xpRecord.xp_month = 0;
            xpRecord.last_reset_month = now;
        }

        await xpRecord.save();

        const dailyLimitReached = config.daily_xp_limit > 0 && xpRecord.xp_today >= config.daily_xp_limit;
        const weeklyLimitReached = config.weekly_xp_limit > 0 && xpRecord.xp_week >= config.weekly_xp_limit;

        return { dailyLimitReached, weeklyLimitReached };
    }

    static async getXPMultiplier(member, channelId, guildId) {
        let multiplier = 1.0;
        const now = new Date();

        const boosts = await XPBoost.findAll({
            where: { guild_id: guildId, is_enabled: true }
        });

        // 1. Event/Temporary boosts
        const eventBoosts = boosts.filter(b => b.type === 'event');
        for (const eb of eventBoosts) {
            const start = eb.start_time ? new Date(eb.start_time) : null;
            const end = eb.end_time ? new Date(eb.end_time) : null;
            if ((!start || now >= start) && (!end || now <= end)) {
                multiplier *= eb.multiplier;
            }
        }

        // 2. Channel boosts
        if (channelId) {
            const channelBoosts = boosts.filter(b => b.type === 'channel' && b.target_id === channelId);
            for (const cb of channelBoosts) {
                multiplier *= cb.multiplier;
            }
        }

        // 3. Role boosts
        if (member) {
            const roleBoosts = boosts.filter(b => b.type === 'role');
            let maxRoleMult = 1.0;
            let hasRoleBoost = false;
            for (const rb of roleBoosts) {
                if (member.roles.cache.has(rb.target_id)) {
                    if (rb.multiplier > maxRoleMult) {
                        maxRoleMult = rb.multiplier;
                        hasRoleBoost = true;
                    }
                }
            }
            if (hasRoleBoost) {
                multiplier *= maxRoleMult;
            }
        }

        return multiplier;
    }

    static async syncRoles(member, xpRecord, config) {
        if (!member || !xpRecord || !config) return;
        const rewards = await LevelReward.findAll({
            where: { guild_id: member.guild.id, is_enabled: true },
            order: [['level', 'ASC']]
        });
        if (rewards.length === 0) return;

        const currentLevel = xpRecord.level;
        let rolesToAdd = [];
        let rolesToRemove = [];

        if (config.stack_rewards) {
            const matchingRewards = rewards.filter(r => r.level <= currentLevel);
            rolesToAdd = matchingRewards.map(r => r.role_id);
            if (config.remove_rewards_on_demote) {
                const demotedRewards = rewards.filter(r => r.level > currentLevel);
                rolesToRemove = demotedRewards.map(r => r.role_id);
            }
        } else {
            const eligible = rewards.filter(r => r.level <= currentLevel);
            const highestReward = eligible.length > 0 ? eligible[eligible.length - 1] : null;

            if (highestReward) {
                rolesToAdd = [highestReward.role_id];
                rolesToRemove = rewards.filter(r => r.role_id !== highestReward.role_id).map(r => r.role_id);
            } else {
                if (config.remove_rewards_on_demote) {
                    rolesToRemove = rewards.map(r => r.role_id);
                }
            }
        }

        rolesToAdd = rolesToAdd.filter(roleId => member.guild.roles.cache.has(roleId));
        rolesToRemove = rolesToRemove.filter(roleId => member.guild.roles.cache.has(roleId));

        // Add missing roles
        for (const roleId of rolesToAdd) {
            if (!member.roles.cache.has(roleId)) {
                await member.roles.add(roleId, `Level Reward (Level ${currentLevel})`).catch(() => { });
                await LevelHistory.create({
                    guild_id: member.guild.id,
                    user_id: member.id,
                    action: 'reward_role_add',
                    details: `Granted role <@&${roleId}> for level ${currentLevel}`
                }).catch(() => { });
            }
        }

        // Remove old roles
        for (const roleId of rolesToRemove) {
            if (member.roles.cache.has(roleId)) {
                await member.roles.remove(roleId, `Level Reward Demotion/Cleanup`).catch(() => { });
                await LevelHistory.create({
                    guild_id: member.guild.id,
                    user_id: member.id,
                    action: 'reward_role_remove',
                    details: `Removed role <@&${roleId}> (Level sync)`
                }).catch(() => { });
            }
        }
    }

    static async sendLevelAnnouncement(member, xpRecord, config, messageChannel = null) {
        try {
            const { EmbedBuilder } = require('discord.js');
            const guild = member.guild;

            // If announcements are disabled globally, or channel is explicitly 'disabled', or not set
            if (!config.announce_enabled || !config.announce_channel || config.announce_channel === 'disabled') {
                return;
            }

            const unlockedReward = await LevelReward.findOne({
                where: { guild_id: guild.id, level: xpRecord.level, is_enabled: true }
            });
            const role = unlockedReward ? guild.roles.cache.get(unlockedReward.role_id) : null;

            const template = config.announce_message || '<a:pink8:1337678972108148757> Congratulations {user}! You reached Level {level}!';
            const totalXP = this.getTotalXP(xpRecord.level, xpRecord.xp, config);
            const replaceVars = (str) => {
                return str
                    .replace(/{user}/g, `<@${member.id}>`)
                    .replace(/{username}/g, member.user.username)
                    .replace(/{level}/g, xpRecord.level)
                    .replace(/{xp}/g, totalXP)
                    .replace(/{server}/g, guild.name)
                    .replace(/{role}/g, role ? `<@&${role.id}>` : 'None');
            };

            const contentText = replaceVars(template);

            // Handle DM type
            if (config.announce_channel === 'dm') {
                if (config.announce_embed) {
                    const embed = new EmbedBuilder()
                        .setColor(config.announce_color || '#5865F2')
                        .setDescription(contentText)
                        .setTimestamp();

                    if (config.announce_image_url) {
                        embed.setImage(config.announce_image_url);
                    }
                    await member.send({ content: `**Level Up in ${guild.name}!**`, embeds: [embed] }).catch(() => { });
                } else {
                    await member.send({ content: `**Level Up in ${guild.name}!**\n${contentText}` }).catch(() => { });
                }
                return;
            }

            // Handle Channel type
            let channel = guild.channels.cache.get(config.announce_channel);
            if (!channel) {
                channel = await guild.channels.fetch(config.announce_channel).catch(() => null);
            }

            if (!channel) return;

            if (config.announce_embed) {
                const embed = new EmbedBuilder()
                    .setColor(config.announce_color || '#5865F2')
                    .setDescription(contentText)
                    .setTimestamp();

                if (config.announce_image_url) {
                    embed.setImage(config.announce_image_url);
                }

                await channel.send({ content: `<@${member.id}>`, embeds: [embed] }).catch(() => { });
            } else {
                await channel.send({ content: contentText }).catch(() => { });
            }
        } catch (e) {
            console.error('Error sending level announcement:', e);
        }
    }

    static async addXP(messageOrUserId, guildId, client) {
        let userId;
        let message = null;
        if (messageOrUserId && typeof messageOrUserId === 'object' && messageOrUserId.author) {
            message = messageOrUserId;
            userId = message.author.id;
            guildId = message.guild.id;
            client = message.client;
        } else {
            userId = messageOrUserId;
        }

        const config = await this.getOrCreateConfig(guildId);
        if (!config.is_enabled) return null;

        // Ignore bots
        if (message && message.author.bot) return null;

        const xpRecord = await this.getOrCreateUserXP(userId, guildId);
        const now = new Date();
        const cooldownMs = config.xp_cooldown_sec * 1000;

        if (xpRecord.last_xp_time && (now - new Date(xpRecord.last_xp_time)) < cooldownMs) {
            return null;
        }

        const limitCheck = await this.checkXPLimits(xpRecord, config);
        if (limitCheck.dailyLimitReached || limitCheck.weeklyLimitReached) {
            return null;
        }

        let member = null;
        let multiplier = 1.0;
        if (message) {
            member = message.member || await message.guild.members.fetch(userId).catch(() => null);
            multiplier = await this.getXPMultiplier(member, message.channel.id, guildId);
        } else {
            const guild = client?.guilds.cache.get(guildId);
            member = await guild?.members.fetch(userId).catch(() => null);
            multiplier = await this.getXPMultiplier(member, null, guildId);
        }

        const minXp = config.xp_range_min ?? 15;
        const maxXp = config.xp_range_max ?? 25;
        let baseXP = Math.floor(Math.random() * (maxXp - minXp + 1)) + minXp;

        let xpToAdd = Math.round(baseXP * multiplier);

        if (config.daily_xp_limit > 0 && (xpRecord.xp_today + xpToAdd) > config.daily_xp_limit) {
            xpToAdd = config.daily_xp_limit - xpRecord.xp_today;
        }
        if (config.weekly_xp_limit > 0 && (xpRecord.xp_week + xpToAdd) > config.weekly_xp_limit) {
            const remaining = config.weekly_xp_limit - xpRecord.xp_week;
            xpToAdd = Math.min(xpToAdd, remaining);
        }

        if (xpToAdd <= 0) return null;

        xpRecord.xp += xpToAdd;
        xpRecord.xp_today += xpToAdd;
        xpRecord.xp_week += xpToAdd;
        xpRecord.xp_month += xpToAdd;
        xpRecord.text_xp += xpToAdd;
        xpRecord.last_xp_time = now;
        xpRecord.messages_count += 1;

        let levelUp = false;
        let oldLevel = xpRecord.level;

        while (xpRecord.xp >= this.getXPNeeded(xpRecord.level, config)) {
            xpRecord.xp -= this.getXPNeeded(xpRecord.level, config);
            xpRecord.level += 1;
            levelUp = true;
        }

        while (xpRecord.text_xp >= this.getXPNeeded(xpRecord.text_level, config)) {
            xpRecord.text_xp -= this.getXPNeeded(xpRecord.text_level, config);
            xpRecord.text_level += 1;
        }

        await xpRecord.save();

        await LevelHistory.create({
            guild_id: guildId,
            user_id: userId,
            action: 'message_xp',
            xp_gained: xpToAdd,
            level_before: oldLevel,
            level_after: xpRecord.level,
            details: `Earned ${xpToAdd} XP from message`
        }).catch(() => { });

        if (levelUp) {
            await LevelHistory.create({
                guild_id: guildId,
                user_id: userId,
                action: 'level_up',
                level_before: oldLevel,
                level_after: xpRecord.level,
                details: `Leveled up from ${oldLevel} to ${xpRecord.level}`
            }).catch(() => { });

            if (member) {
                await this.syncRoles(member, xpRecord, config);
            }

            if (config.announce_enabled && member) {
                await this.sendLevelAnnouncement(member, xpRecord, config, message?.channel);
            }
        }

        return { levelUp, level: xpRecord.level, oldLevel, xp: xpRecord.xp };
    }

    static async handleVoiceStateUpdate(oldState, newState) {
        try {
            const member = newState.member;
            if (!member || member.user.bot) return;

            const guildId = newState.guild.id;
            const userId = member.id;
            const channelId = newState.channelId;
            const oldChannelId = oldState.channelId;

            // Left all channels
            if (!channelId) {
                await VoiceSession.destroy({ where: { guild_id: guildId, user_id: userId } }).catch(() => { });
                return;
            }

            // Joined AFK channel
            if (newState.guild.afkChannelId === channelId) {
                await VoiceSession.destroy({ where: { guild_id: guildId, user_id: userId } }).catch(() => { });
                return;
            }

            // Joined or changed channel
            if (channelId !== oldChannelId) {
                const now = new Date();
                await VoiceSession.upsert({
                    guild_id: guildId,
                    user_id: userId,
                    channel_id: channelId,
                    joined_at: now,
                    last_xp_grant: now
                }).catch(() => { });
            }
        } catch (e) {
            console.error('Error in handleVoiceStateUpdate:', e);
        }
    }

    static async addVoiceXP(member, channelId, config, isMutedOrDeafened = false) {
        const userId = member.id;
        const guildId = member.guild.id;

        const xpRecord = await this.getOrCreateUserXP(userId, guildId);
        const now = new Date();

        const limitCheck = await this.checkXPLimits(xpRecord, config);
        if (limitCheck.dailyLimitReached || limitCheck.weeklyLimitReached) {
            return null;
        }

        const baseXP = config.voice_xp_amount || 10;
        const multiplier = await this.getXPMultiplier(member, channelId, guildId);
        let xpToAdd = Math.round(baseXP * multiplier);

        if (isMutedOrDeafened) {
            xpToAdd = Math.max(1, Math.round(xpToAdd * 0.1));
        }

        if (config.daily_xp_limit > 0 && (xpRecord.xp_today + xpToAdd) > config.daily_xp_limit) {
            xpToAdd = config.daily_xp_limit - xpRecord.xp_today;
        }
        if (config.weekly_xp_limit > 0 && (xpRecord.xp_week + xpToAdd) > config.weekly_xp_limit) {
            const remaining = config.weekly_xp_limit - xpRecord.xp_week;
            xpToAdd = Math.min(xpToAdd, remaining);
        }

        if (xpToAdd <= 0) return null;

        xpRecord.xp += xpToAdd;
        xpRecord.xp_today += xpToAdd;
        xpRecord.xp_week += xpToAdd;
        xpRecord.xp_month += xpToAdd;
        xpRecord.voice_xp += xpToAdd;
        xpRecord.last_xp_time = now;

        let levelUp = false;
        let oldLevel = xpRecord.level;

        while (xpRecord.xp >= this.getXPNeeded(xpRecord.level, config)) {
            xpRecord.xp -= this.getXPNeeded(xpRecord.level, config);
            xpRecord.level += 1;
            levelUp = true;
        }

        while (xpRecord.voice_xp >= this.getXPNeeded(xpRecord.voice_level, config)) {
            xpRecord.voice_xp -= this.getXPNeeded(xpRecord.voice_level, config);
            xpRecord.voice_level += 1;
        }

        await xpRecord.save();

        await LevelHistory.create({
            guild_id: guildId,
            user_id: userId,
            action: 'voice_xp',
            xp_gained: xpToAdd,
            level_before: oldLevel,
            level_after: xpRecord.level,
            details: `Earned ${xpToAdd} XP from voice in <#${channelId}>`
        }).catch(() => { });

        if (levelUp) {
            await LevelHistory.create({
                guild_id: guildId,
                user_id: userId,
                action: 'level_up',
                level_before: oldLevel,
                level_after: xpRecord.level,
                details: `Leveled up from ${oldLevel} to ${xpRecord.level}`
            }).catch(() => { });

            await this.syncRoles(member, xpRecord, config);

            if (config.announce_enabled) {
                await this.sendLevelAnnouncement(member, xpRecord, config);
            }
        }

        return { levelUp, level: xpRecord.level, oldLevel, xp: xpRecord.xp };
    }

    static async checkVoiceXP(client) {
        try {
            const guilds = client.guilds.cache.values();
            const now = new Date();

            for (const guild of guilds) {
                const config = await this.getOrCreateConfig(guild.id);
                if (!config.is_enabled) continue;

                const sessions = await VoiceSession.findAll({ where: { guild_id: guild.id } });
                const voiceStates = guild.voiceStates.cache.values();

                const activeVoiceUsers = new Map();
                for (const vs of voiceStates) {
                    if (vs.member && !vs.member.user.bot && vs.channelId) {
                        if (guild.afkChannelId === vs.channelId) continue;

                        activeVoiceUsers.set(vs.id, vs);
                    }
                }

                for (const session of sessions) {
                    const userId = session.user_id;
                    const vs = activeVoiceUsers.get(userId);

                    if (!vs || vs.channelId !== session.channel_id) {
                        await session.destroy().catch(() => { });
                        continue;
                    }

                    const intervalMs = (config.voice_xp_interval_min || 5) * 60 * 1000;
                    const lastGrant = new Date(session.last_xp_grant);

                    if ((now - lastGrant) >= intervalMs) {
                        const isMutedOrDeafened = vs.selfMute || vs.serverMute || vs.selfDeaf || vs.serverDeaf;
                        await this.addVoiceXP(vs.member, vs.channelId, config, isMutedOrDeafened);

                        session.last_xp_grant = now;
                        await session.save().catch(() => { });

                        const xpRecord = await this.getOrCreateUserXP(userId, guild.id);
                        xpRecord.voice_time_min += config.voice_xp_interval_min || 5;
                        await xpRecord.save().catch(() => { });
                    }
                }

                // Create missing voice sessions
                for (const [userId, vs] of activeVoiceUsers) {
                    const exists = sessions.some(s => s.user_id === userId);
                    if (!exists) {
                        await VoiceSession.create({
                            guild_id: guild.id,
                            user_id: userId,
                            channel_id: vs.channelId,
                            joined_at: now,
                            last_xp_grant: now
                        }).catch(() => { });
                    }
                }
            }
        } catch (e) {
            console.error('Error in checkVoiceXP loop:', e);
        }
    }

    static async getLeaderboard(guildId, type = 'total', limit = 10) {
        let order = [];
        if (type === 'messages') {
            order = [['messages_count', 'DESC']];
        } else if (type === 'voice') {
            order = [['voice_time_min', 'DESC']];
        } else if (type === 'daily') {
            order = [['xp_today', 'DESC']];
        } else if (type === 'weekly') {
            order = [['xp_week', 'DESC']];
        } else if (type === 'monthly') {
            order = [['xp_month', 'DESC']];
        } else {
            order = [['level', 'DESC'], ['xp', 'DESC']];
        }

        return await UserXP.findAll({
            where: { guild_id: guildId },
            order: order,
            limit: limit
        });
    }

    static async addAdminXP(userId, guildId, amount, client) {
        const config = await this.getOrCreateConfig(guildId);
        const xpRecord = await this.getOrCreateUserXP(userId, guildId);
        const oldLevel = xpRecord.level;

        xpRecord.xp += amount;
        let levelUp = false;

        while (xpRecord.xp >= this.getXPNeeded(xpRecord.level, config)) {
            xpRecord.xp -= this.getXPNeeded(xpRecord.level, config);
            xpRecord.level += 1;
            levelUp = true;
        }

        await xpRecord.save();

        await LevelHistory.create({
            guild_id: guildId,
            user_id: userId,
            action: 'admin_add',
            xp_gained: amount,
            level_before: oldLevel,
            level_after: xpRecord.level,
            details: `Admin added ${amount} XP`
        }).catch(() => { });

        const guild = client.guilds.cache.get(guildId);
        const member = await guild?.members.fetch(userId).catch(() => null);
        if (member) {
            await this.syncRoles(member, xpRecord, config);
            if (levelUp && config.announce_enabled) {
                await this.sendLevelAnnouncement(member, xpRecord, config);
            }
        }

        return xpRecord;
    }

    static async removeAdminXP(userId, guildId, amount, client) {
        const config = await this.getOrCreateConfig(guildId);
        const xpRecord = await this.getOrCreateUserXP(userId, guildId);
        const oldLevel = xpRecord.level;

        xpRecord.xp -= amount;

        while (xpRecord.xp < 0 && xpRecord.level > 0) {
            xpRecord.level -= 1;
            xpRecord.xp += this.getXPNeeded(xpRecord.level, config);
        }

        if (xpRecord.level === 0 && xpRecord.xp < 0) {
            xpRecord.xp = 0;
        }

        await xpRecord.save();

        await LevelHistory.create({
            guild_id: guildId,
            user_id: userId,
            action: 'admin_remove',
            xp_gained: -amount,
            level_before: oldLevel,
            level_after: xpRecord.level,
            details: `Admin removed ${amount} XP`
        }).catch(() => { });

        const guild = client.guilds.cache.get(guildId);
        const member = await guild?.members.fetch(userId).catch(() => null);
        if (member) {
            await this.syncRoles(member, xpRecord, config);
        }

        return xpRecord;
    }

    static async setXP(userId, guildId, xpVal, client) {
        const config = await this.getOrCreateConfig(guildId);
        const xpRecord = await this.getOrCreateUserXP(userId, guildId);
        const oldLevel = xpRecord.level;

        xpRecord.xp = xpVal;
        xpRecord.level = 0;

        while (xpRecord.xp >= this.getXPNeeded(xpRecord.level, config)) {
            xpRecord.xp -= this.getXPNeeded(xpRecord.level, config);
            xpRecord.level += 1;
        }

        await xpRecord.save();

        await LevelHistory.create({
            guild_id: guildId,
            user_id: userId,
            action: 'admin_set',
            level_before: oldLevel,
            level_after: xpRecord.level,
            details: `Admin set XP to ${xpVal}`
        }).catch(() => { });

        const guild = client.guilds.cache.get(guildId);
        const member = await guild?.members.fetch(userId).catch(() => null);
        if (member) {
            await this.syncRoles(member, xpRecord, config);
        }

        return xpRecord;
    }

    static async setLevel(userId, guildId, levelVal, client) {
        const config = await this.getOrCreateConfig(guildId);
        const xpRecord = await this.getOrCreateUserXP(userId, guildId);
        const oldLevel = xpRecord.level;

        xpRecord.level = levelVal;
        xpRecord.xp = 0;

        await xpRecord.save();

        await LevelHistory.create({
            guild_id: guildId,
            user_id: userId,
            action: 'admin_set',
            level_before: oldLevel,
            level_after: xpRecord.level,
            details: `Admin set level to ${levelVal}`
        }).catch(() => { });

        const guild = client.guilds.cache.get(guildId);
        const member = await guild?.members.fetch(userId).catch(() => null);
        if (member) {
            await this.syncRoles(member, xpRecord, config);
        }

        return xpRecord;
    }

    static async resetXP(userId, guildId, client) {
        const config = await this.getOrCreateConfig(guildId);
        const xpRecord = await this.getOrCreateUserXP(userId, guildId);
        const oldLevel = xpRecord.level;

        xpRecord.level = 0;
        xpRecord.xp = 0;
        xpRecord.text_level = 0;
        xpRecord.text_xp = 0;
        xpRecord.voice_level = 0;
        xpRecord.voice_xp = 0;
        xpRecord.messages_count = 0;
        xpRecord.voice_time_min = 0;
        xpRecord.xp_today = 0;
        xpRecord.xp_week = 0;
        xpRecord.xp_month = 0;

        await xpRecord.save();

        await LevelHistory.create({
            guild_id: guildId,
            user_id: userId,
            action: 'admin_reset',
            level_before: oldLevel,
            level_after: 0,
            details: `Admin reset user leveling stats`
        }).catch(() => { });

        const guild = client.guilds.cache.get(guildId);
        const member = await guild?.members.fetch(userId).catch(() => null);
        if (member) {
            await this.syncRoles(member, xpRecord, config);
        }

        return xpRecord;
    }

    static async resetLeaderboard(guildId, client) {
        const config = await this.getOrCreateConfig(guildId);
        const xpRecords = await UserXP.findAll({ where: { guild_id: guildId } });

        for (const xpRecord of xpRecords) {
            const oldLevel = xpRecord.level;
            xpRecord.level = 0;
            xpRecord.xp = 0;
            xpRecord.text_level = 0;
            xpRecord.text_xp = 0;
            xpRecord.voice_level = 0;
            xpRecord.voice_xp = 0;
            xpRecord.messages_count = 0;
            xpRecord.voice_time_min = 0;
            xpRecord.xp_today = 0;
            xpRecord.xp_week = 0;
            xpRecord.xp_month = 0;
            await xpRecord.save();

            const guild = client.guilds.cache.get(guildId);
            const member = await guild?.members.fetch(xpRecord.user_id).catch(() => null);
            if (member) {
                await this.syncRoles(member, xpRecord, config);
            }
        }

        await LevelLeaderboardCache.destroy({ where: { guild_id: guildId } }).catch(() => { });

        await LevelHistory.create({
            guild_id: guildId,
            user_id: 'SYSTEM',
            action: 'admin_reset_all',
            details: `Admin reset full guild leaderboard`
        }).catch(() => { });

        return true;
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // REDESIGNED getRankCard method
    // ─────────────────────────────────────────────────────────────────────────────
    static async getRankCard(userId, guildId, username, avatarURL, presenceStatus = 'offline', guildIconURL = null) {
        // presenceStatus: 'online' | 'idle' | 'dnd' | 'offline'
        const xpRecord = await this.getOrCreateUserXP(userId, guildId);
        const config = await this.getOrCreateConfig(guildId);
        const xpNeeded = this.getXPNeeded(xpRecord.level, config);

        const allXP = await UserXP.findAll({
            where: { guild_id: guildId },
            order: [['level', 'DESC'], ['xp', 'DESC']]
        });
        const rank = allXP.filter(x =>
            x.level > xpRecord.level ||
            (x.level === xpRecord.level && x.xp > xpRecord.xp)
        ).length + 1;

        // ── Canvas ──────────────────────────────────────────────────────────────
        const W = 900, H = 280;
        const canvas = createCanvas(W, H);
        const ctx = canvas.getContext('2d');

        // ── 1. Background image (only if custom config.rank_card_background exists) ──
        let hasBgImage = false;
        if (config.rank_card_background) {
            try {
                let bgSource = config.rank_card_background;
                if (bgSource.startsWith('/presets/')) {
                    const path = require('path');
                    bgSource = path.join(__dirname, '../server/public', bgSource);
                }
                const bgImg = await loadImage(bgSource);
                ctx.drawImage(bgImg, 0, 0, W, H);
                hasBgImage = true;
            } catch (e) {
                console.error("Failed to load custom rank card background:", e);
            }
        }

        if (!hasBgImage) {
            // fallback gradient - premium clean dark theme
            const fallback = ctx.createLinearGradient(0, 0, W, H);
            fallback.addColorStop(0, '#0c0b15');
            fallback.addColorStop(1, '#1a1829');
            ctx.fillStyle = fallback;
            ctx.fillRect(0, 0, W, H);
        }

        // ── 2. Dark vignette overlay so text stays readable ─────────────────────
        const vignette = ctx.createRadialGradient(W / 2, H / 2, H * 0.1, W / 2, H / 2, H * 1.1);
        vignette.addColorStop(0, 'rgba(0,0,0,0.35)');
        vignette.addColorStop(1, 'rgba(0,0,0,0.78)');
        ctx.fillStyle = vignette;
        ctx.fillRect(0, 0, W, H);

        // ── 3. Frosted-glass card panel ─────────────────────────────────────────
        ctx.save();
        ctx.beginPath();
        ctx.roundRect(22, 22, W - 44, H - 44, 22);
        ctx.fillStyle = 'rgba(10, 8, 20, 0.55)';
        ctx.fill();
        // border
        ctx.strokeStyle = 'rgba(255,255,255,0.10)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.restore();

        // ── 4. Accent glow behind avatar ────────────────────────────────────────
        const glowX = 110, glowY = H / 2;
        const glow = ctx.createRadialGradient(glowX, glowY, 10, glowX, glowY, 110);
        glow.addColorStop(0, 'rgba(0, 200, 255, 0.22)');
        glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = glow;
        ctx.fillRect(0, 0, 240, H);

        // ── 5. Avatar (clipped circle) ──────────────────────────────────────────
        const AX = 110, AY = H / 2, AR = 70;
        ctx.save();
        ctx.beginPath();
        ctx.arc(AX, AY, AR, 0, Math.PI * 2);
        ctx.clip();
        try {
            const avatarImg = await loadImage(avatarURL);
            ctx.drawImage(avatarImg, AX - AR, AY - AR, AR * 2, AR * 2);
        } catch {
            ctx.fillStyle = '#5865F2';
            ctx.fillRect(AX - AR, AY - AR, AR * 2, AR * 2);
        }
        ctx.restore();

        // ── 6. Discord-style Status Dot ─────────────────────────────────────────
        const statusColors = {
            online: '#3ba55c',
            idle: '#faa61a',
            dnd: '#ed4245',
            offline: '#747f8d'
        };
        const sColor = statusColors[presenceStatus] || statusColors.offline;

        // Center of status dot: AX + AR * cos(pi/4) = 110 + 70 * 0.707 = 160
        // AY + AR * sin(pi/4) = 140 + 70 * 0.707 = 190
        const SX = 160, SY = 190, SR = 14;

        // Draw dark border cut out for status dot
        ctx.save();
        ctx.beginPath();
        ctx.arc(SX, SY, SR + 4, 0, Math.PI * 2);
        ctx.fillStyle = '#0c0b15'; // matching background tone
        ctx.fill();
        ctx.restore();

        // Draw status dot itself
        ctx.save();
        ctx.beginPath();
        ctx.arc(SX, SY, SR, 0, Math.PI * 2);
        ctx.fillStyle = sColor;
        ctx.fill();
        ctx.restore();

        // Font family definition
        const font = config.rank_card_font || 'sans-serif';

        // ── 7. Header Row (Username, Rank, Level, Guild Icon) ────────────────────
        const HEADER_Y = 78;

        // Username (Left-aligned)
        ctx.save();
        ctx.shadowColor = 'rgba(0,0,0,0.8)';
        ctx.shadowBlur = 8;
        ctx.fillStyle = '#ffffff';
        ctx.font = `bold 32px ${font}`;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'alphabetic';
        ctx.fillText(username.length > 16 ? username.slice(0, 15) + '…' : username, 210, HEADER_Y);
        ctx.restore();

        // RANK
        ctx.save();
        ctx.textAlign = 'left';
        ctx.textBaseline = 'alphabetic';
        ctx.fillStyle = '#8f939e';
        ctx.font = `bold 11px ${font}`;
        ctx.fillText('RANK', 560, HEADER_Y - 18);
        ctx.fillStyle = '#00f5ff';
        ctx.font = `bold 28px ${font}`;
        ctx.fillText(`#${rank}`, 560, HEADER_Y + 6);
        ctx.restore();

        // LEVEL
        ctx.save();
        ctx.textAlign = 'left';
        ctx.textBaseline = 'alphabetic';
        ctx.fillStyle = '#8f939e';
        ctx.font = `bold 11px ${font}`;
        ctx.fillText('LEVEL', 670, HEADER_Y - 18);
        ctx.fillStyle = '#ffffff';
        ctx.font = `bold 28px ${font}`;
        ctx.fillText(`${xpRecord.level}`, 670, HEADER_Y + 6);
        ctx.restore();

        // Guild Icon (Far Right)
        if (guildIconURL) {
            try {
                const guildIconImg = await loadImage(guildIconURL);
                const giX = 816, giY = 42, giSize = 44;
                ctx.save();
                ctx.beginPath();
                ctx.arc(giX + giSize / 2, giY + giSize / 2, giSize / 2, 0, Math.PI * 2);
                ctx.clip();
                ctx.drawImage(guildIconImg, giX, giY, giSize, giSize);
                ctx.restore();

                // Add subtle border
                ctx.save();
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.arc(giX + giSize / 2, giY + giSize / 2, giSize / 2, 0, Math.PI * 2);
                ctx.stroke();
                ctx.restore();
            } catch (e) {
                console.error('Failed to draw guild icon on card:', e);
            }
        }

        // ── 8. Progress Bars (Text & Voice) ──────────────────────────────────────
        const xpNeededText = this.getXPNeeded(xpRecord.text_level, config);
        const xpNeededVoice = this.getXPNeeded(xpRecord.voice_level, config);
        const pctText = Math.min(xpRecord.text_xp / xpNeededText, 1);
        const pctVoice = Math.min(xpRecord.voice_xp / xpNeededVoice, 1);

        const BAR_X = 210, BAR_W = 420, BAR_H = 12, BAR_R = 6;

        // --- Draw Text XP Bar ---
        const BAR_Y_TEXT = 130;
        // track
        ctx.save();
        ctx.fillStyle = 'rgba(255,255,255,0.07)';
        ctx.beginPath();
        ctx.roundRect(BAR_X, BAR_Y_TEXT, BAR_W, BAR_H, BAR_R);
        ctx.fill();

        // filled
        if (pctText > 0) {
            const filled = BAR_W * pctText;
            const grad = ctx.createLinearGradient(BAR_X, 0, BAR_X + BAR_W, 0);
            grad.addColorStop(0, '#00f5ff');
            grad.addColorStop(0.5, '#7b2fff');
            grad.addColorStop(1, '#ff3cac');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.roundRect(BAR_X, BAR_Y_TEXT, filled, BAR_H, BAR_R);
            ctx.fill();

            // shimmer
            if (pctText > 0.06) {
                const shimX = BAR_X + filled * 0.55;
                const shimGrad = ctx.createLinearGradient(shimX - 30, 0, shimX + 30, 0);
                shimGrad.addColorStop(0, 'rgba(255,255,255,0)');
                shimGrad.addColorStop(0.5, 'rgba(255,255,255,0.22)');
                shimGrad.addColorStop(1, 'rgba(255,255,255,0)');
                ctx.save();
                ctx.beginPath();
                ctx.roundRect(BAR_X, BAR_Y_TEXT, filled, BAR_H, BAR_R);
                ctx.clip();
                ctx.fillStyle = shimGrad;
                ctx.fillRect(shimX - 30, BAR_Y_TEXT, 60, BAR_H);
                ctx.restore();
            }

            // glow
            ctx.save();
            ctx.shadowColor = '#00f5ff';
            ctx.shadowBlur = 12;
            ctx.strokeStyle = 'rgba(0,245,255,0.6)';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(BAR_X + filled - 1, BAR_Y_TEXT + BAR_R);
            ctx.lineTo(BAR_X + filled - 1, BAR_Y_TEXT + BAR_H - BAR_R);
            ctx.stroke();
            ctx.restore();
        }
        ctx.restore();

        // Text Label & Percentage
        ctx.fillStyle = '#b0b4be';
        ctx.font = `13px ${font}`;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'alphabetic';
        ctx.fillText(`Text Lvl ${xpRecord.text_level}  •  ${xpRecord.text_xp.toLocaleString()} / ${xpNeededText.toLocaleString()} XP`, BAR_X, BAR_Y_TEXT - 10);

        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'right';
        ctx.font = `bold 13px ${font}`;
        ctx.fillText(`${Math.floor(pctText * 100)}%`, BAR_X + BAR_W, BAR_Y_TEXT - 10);


        // --- Draw Voice XP Bar ---
        const BAR_Y_VOICE = 190;
        // track
        ctx.save();
        ctx.fillStyle = 'rgba(255,255,255,0.07)';
        ctx.beginPath();
        ctx.roundRect(BAR_X, BAR_Y_VOICE, BAR_W, BAR_H, BAR_R);
        ctx.fill();

        // filled
        if (pctVoice > 0) {
            const filled = BAR_W * pctVoice;
            const grad = ctx.createLinearGradient(BAR_X, 0, BAR_X + BAR_W, 0);
            grad.addColorStop(0, '#ff8a00');
            grad.addColorStop(0.5, '#da1b60');
            grad.addColorStop(1, '#ff3cac');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.roundRect(BAR_X, BAR_Y_VOICE, filled, BAR_H, BAR_R);
            ctx.fill();

            // shimmer
            if (pctVoice > 0.06) {
                const shimX = BAR_X + filled * 0.55;
                const shimGrad = ctx.createLinearGradient(shimX - 30, 0, shimX + 30, 0);
                shimGrad.addColorStop(0, 'rgba(255,255,255,0)');
                shimGrad.addColorStop(0.5, 'rgba(255,255,255,0.22)');
                shimGrad.addColorStop(1, 'rgba(255,255,255,0)');
                ctx.save();
                ctx.beginPath();
                ctx.roundRect(BAR_X, BAR_Y_VOICE, filled, BAR_H, BAR_R);
                ctx.clip();
                ctx.fillStyle = shimGrad;
                ctx.fillRect(shimX - 30, BAR_Y_VOICE, 60, BAR_H);
                ctx.restore();
            }

            // glow
            ctx.save();
            ctx.shadowColor = '#ff8a00';
            ctx.shadowBlur = 12;
            ctx.strokeStyle = 'rgba(255,138,0,0.6)';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(BAR_X + filled - 1, BAR_Y_VOICE + BAR_R);
            ctx.lineTo(BAR_X + filled - 1, BAR_Y_VOICE + BAR_H - BAR_R);
            ctx.stroke();
            ctx.restore();
        }
        ctx.restore();

        // Voice Label & Percentage
        ctx.fillStyle = '#b0b4be';
        ctx.font = `13px ${font}`;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'alphabetic';
        ctx.fillText(`Voice Lvl ${xpRecord.voice_level}  •  ${xpRecord.voice_xp.toLocaleString()} / ${xpNeededVoice.toLocaleString()} XP`, BAR_X, BAR_Y_VOICE - 10);

        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'right';
        ctx.font = `bold 13px ${font}`;
        ctx.fillText(`${Math.floor(pctVoice * 100)}%`, BAR_X + BAR_W, BAR_Y_VOICE - 10);

        // ── 9. Right Column Stats Sub-panel ─────────────────────────────────────
        const spX = 660, spY = 110, spW = 200, spH = 112, spR = 12;
        ctx.save();
        // frosted glass background for sub-panel
        ctx.beginPath();
        ctx.roundRect(spX, spY, spW, spH, spR);
        ctx.fillStyle = 'rgba(10, 8, 20, 0.45)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Separator line
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(spX + 15, spY + spH / 2);
        ctx.lineTo(spX + spW - 15, spY + spH / 2);
        ctx.stroke();

        // Messages Row (Top half)
        ctx.fillStyle = '#8f939e';
        ctx.font = `bold 11px ${font}`;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText('MESSAGES', spX + 18, spY + 28);

        ctx.fillStyle = '#ffffff';
        ctx.font = `bold 15px ${font}`;
        ctx.textAlign = 'right';
        ctx.fillText((xpRecord.messages_count || 0).toLocaleString(), spX + spW - 18, spY + 28);

        // Voice Time Row (Bottom half)
        ctx.fillStyle = '#8f939e';
        ctx.font = `bold 11px ${font}`;
        ctx.textAlign = 'left';
        ctx.fillText('VOICE TIME', spX + 18, spY + spH - 28);

        ctx.fillStyle = '#ffffff';
        ctx.font = `bold 15px ${font}`;
        ctx.textAlign = 'right';
        ctx.fillText(`${xpRecord.voice_time_min || 0} min`, spX + spW - 18, spY + spH - 28);
        ctx.restore();

        // ── 10. Watermark ───────────────────────────────────────────────────────
        ctx.fillStyle = 'rgba(255,255,255,0.15)';
        ctx.font = `italic 11px ${font}`;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'alphabetic';

        return canvas.toBuffer('image/png');
    }
}

module.exports = LevelService;
