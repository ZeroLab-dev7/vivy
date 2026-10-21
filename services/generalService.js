const {
    SuggestionConfig, SuggestionInstance, PollConfig, PollInstance,
    BirthdayConfig, UserBirthday, StickyMessage, DashboardAuditLog, DashboardApiKey
} = require('../db/models');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const crypto = require('crypto');

class GeneralService {
    // --- Sticky Messages ---
    static async handleStickyMessage(message) {
        if (!message.guild || message.author.bot) return;

        const stick = await StickyMessage.findByPk(message.channel.id);
        if (!stick || !stick.message_template) return;

        // Delete old sticky message if exists
        if (stick.last_message_id) {
            const lastMsg = await message.channel.messages.fetch(stick.last_message_id).catch(() => null);
            if (lastMsg) await lastMsg.delete().catch(() => {});
        }

        // Send new sticky message
        let embeds = [];
        if (stick.embed_json) {
            try {
                const embedData = JSON.parse(stick.embed_json);
                const embed = new EmbedBuilder()
                    .setTitle(embedData.title || 'Info')
                    .setDescription(embedData.description || '')
                    .setColor(embedData.color || '#00f5ff')
                    .setTimestamp();
                embeds.push(embed);
            } catch (e) { }
        }

        const newMsg = await message.channel.send({
            content: stick.message_template,
            embeds: embeds.length > 0 ? embeds : undefined
        });

        stick.last_message_id = newMsg.id;
        await stick.save();
    }

    // --- Suggestions ---
    static async createSuggestion(guild, member, content) {
        const config = await SuggestionConfig.findByPk(guild.id);
        if (!config || !config.is_enabled || !config.channel_id) return null;

        const channel = guild.channels.cache.get(config.channel_id);
        if (!channel) return null;

        const embed = new EmbedBuilder()
            .setTitle(`💡 New Suggestion`)
            .setDescription(content)
            .setAuthor({ name: member.user.tag, iconURL: member.user.displayAvatarURL() })
            .setColor('#ffff00')
            .setTimestamp()
            .setFooter({ text: 'Status: Pending Approval' });

        const msg = await channel.send({ embeds: [embed] });
        await msg.react('👍');
        await msg.react('👎');

        return await SuggestionInstance.create({
            guild_id: guild.id,
            message_id: msg.id,
            creator_id: member.id,
            content
        });
    }

    static async updateSuggestionStatus(guild, messageId, status, reason, reviewerTag) {
        const sugg = await SuggestionInstance.findOne({ where: { guild_id: guild.id, message_id: messageId } });
        if (!sugg) return false;

        const config = await SuggestionConfig.findByPk(guild.id);
        const channel = guild.channels.cache.get(config?.channel_id);
        if (!channel) return false;

        const msg = await channel.messages.fetch(messageId).catch(() => null);
        if (!msg) return false;

        sugg.status = status; // 'approved' / 'denied'
        sugg.reason = reason;
        await sugg.save();

        const colorMap = { approved: 'Green', denied: 'Red' };
        const embed = EmbedBuilder.from(msg.embeds[0])
            .setColor(colorMap[status])
            .setFooter({ text: `Status: ${status.toUpperCase()} by ${reviewerTag}` });

        if (reason) {
            embed.addFields({ name: 'Reason', value: reason });
        }

        await msg.edit({ embeds: [embed] });
        return true;
    }

    // --- Polls ---
    static async startPoll(guild, channel, question, optionsArray, durationMinutes) {
        const endTime = new Date(Date.now() + durationMinutes * 60 * 1000);
        
        let desc = "";
        const emojis = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];
        const optionsMapping = [];

        optionsArray.slice(0, 10).forEach((opt, idx) => {
            desc += `${emojis[idx]} ${opt}\n`;
            optionsMapping.push({ emoji: emojis[idx], text: opt });
        });

        const embed = new EmbedBuilder()
            .setTitle(`📊 Poll: ${question}`)
            .setDescription(desc)
            .setColor('#00f5ff')
            .setTimestamp()
            .setFooter({ text: `Ends: ${endTime.toISOString()}` });

        const message = await channel.send({ embeds: [embed] });

        for (let i = 0; i < optionsMapping.length; i++) {
            await message.react(emojis[i]);
        }

        return await PollInstance.create({
            message_id: message.id,
            guild_id: guild.id,
            question,
            options: JSON.stringify(optionsMapping),
            votes: '{}',
            end_time: endTime,
            is_ended: false
        });
    }

    // --- Birthdays ---
    static async setBirthday(guildId, userId, mmdd) {
        await UserBirthday.upsert({
            guild_id: guildId,
            user_id: userId,
            birth_date: mmdd // format "05-24"
        });
    }

    static async checkBirthdays(client) {
        const today = new Date();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        const searchDate = `${mm}-${dd}`;

        const bdays = await UserBirthday.findAll({ where: { birth_date: searchDate } });

        for (const bday of bdays) {
            try {
                const guild = client.guilds.cache.get(bday.guild_id);
                if (!guild) continue;

                const config = await BirthdayConfig.findByPk(guild.id);
                if (!config || !config.is_enabled || !config.channel_id) continue;

                const channel = guild.channels.cache.get(config.channel_id);
                if (channel) {
                    const text = config.message_template.replace(/{user}/g, `<@${bday.user_id}>`);
                    await channel.send(text);
                }
            } catch (e) { }
        }
    }

    // --- Audit Logging ---
    static async logAction(guildId, userId, action, oldValue, newValue) {
        await DashboardAuditLog.create({
            guild_id: guildId,
            user_id: userId,
            action,
            old_value: oldValue ? JSON.stringify(oldValue) : null,
            new_value: newValue ? JSON.stringify(newValue) : null
        });
    }

    // --- Developer API Keys ---
    static async generateApiKey(guildId, label, permissions = ['read']) {
        // Use cryptographically secure random bytes instead of Math.random()
        const key = 'vivy_' + crypto.randomBytes(32).toString('hex');
        return await DashboardApiKey.create({
            key,
            guild_id: guildId,
            label,
            permissions: JSON.stringify(permissions)
        });
    }

    static async validateApiKey(key, guildId) {
        const apiKey = await DashboardApiKey.findOne({ where: { key, guild_id: guildId } });
        if (apiKey) {
            apiKey.usage_count += 1;
            apiKey.last_used = new Date();
            await apiKey.save();
            return JSON.parse(apiKey.permissions);
        }
        return null;
    }
}

module.exports = GeneralService;
