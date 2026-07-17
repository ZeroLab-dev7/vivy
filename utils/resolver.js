const { ChannelType } = require('discord.js');
const ms = require('ms');

/**
 * Parses Discord mentions into their type and ID.
 */
function parseMention(input) {
    if (!input || typeof input !== 'string') return null;
    const userMatch = input.match(/^<@!?(\d+)>$/);
    if (userMatch) return { type: 'user', id: userMatch[1] };
    const roleMatch = input.match(/^<@&(\d+)>$/);
    if (roleMatch) return { type: 'role', id: roleMatch[1] };
    const channelMatch = input.match(/^<#(\d+)>$/);
    if (channelMatch) return { type: 'channel', id: channelMatch[1] };
    const emojiMatch = input.match(/^<a?:(\w+):(\d+)>$/);
    if (emojiMatch) return { type: 'emoji', id: emojiMatch[2], name: emojiMatch[1] };
    return null;
}

/**
 * Checks if a given ID belongs to another type of entity in the guild.
 */
function detectReceivedType(guild, id) {
    if (!guild) return null;
    if (guild.channels.cache.has(id)) {
        const chan = guild.channels.cache.get(id);
        if (chan.type === ChannelType.GuildVoice || chan.type === ChannelType.GuildStageVoice) return 'voice_channel';
        if (chan.type === ChannelType.GuildCategory) return 'category';
        return 'channel';
    }
    if (guild.roles.cache.has(id)) return 'role';
    if (guild.members.cache.has(id)) return 'user';
    if (guild.emojis.cache.has(id)) return 'emoji';
    return null;
}

/**
 * Finds a close match in a collection.
 */
function findSuggestion(collection, nameKeys, input) {
    if (!input || typeof input !== 'string') return null;
    const inputClean = input.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (!inputClean) return null;
    let bestMatch = null;
    let bestScore = 0;
    for (const item of collection.values()) {
        for (const nameKey of nameKeys) {
            const val = item[nameKey];
            if (!val || typeof val !== 'string') continue;
            const itemClean = val.toLowerCase().replace(/[^a-z0-9]/g, '');
            let score = 0;
            if (itemClean === inputClean) score = 100;
            else if (itemClean.startsWith(inputClean) || inputClean.startsWith(itemClean)) score = 80;
            else if (itemClean.includes(inputClean) || inputClean.includes(itemClean)) score = 50;

            if (score > bestScore) {
                bestScore = score;
                bestMatch = item;
            }
        }
    }
    if (bestScore >= 50) return bestMatch;
    return null;
}

const Resolver = {
    /**
     * Resolves a User object.
     */
    async resolveUser(client, input) {
        if (!input) return { success: false, code: 'MISSING_ARGUMENT', expected: 'user' };
        const parsed = parseMention(input);
        if (parsed) {
            if (parsed.type !== 'user') {
                return { success: false, code: 'WRONG_ENTITY_TYPE', expected: 'user', received: parsed.type };
            }
            const user = client.users.cache.get(parsed.id) || await client.users.fetch(parsed.id).catch(() => null);
            if (user) return { success: true, value: user };
            return { success: false, code: 'USER_NOT_FOUND' };
        }
        if (/^\d{17,20}$/.test(input)) {
            const user = client.users.cache.get(input) || await client.users.fetch(input).catch(() => null);
            if (user) return { success: true, value: user };
            return { success: false, code: 'USER_NOT_FOUND' };
        }
        const inputLower = input.toLowerCase();
        const matches = client.users.cache.filter(u => u.username.toLowerCase() === inputLower);
        if (matches.size === 1) return { success: true, value: matches.first() };
        if (matches.size > 1) {
            return { success: false, code: 'MULTIPLE_MATCHES', matches: matches.map(u => `${u.tag} (${u.id})`) };
        }
        const sug = findSuggestion(client.users.cache, ['username'], input);
        return { success: false, code: 'USER_NOT_FOUND', suggestion: sug };
    },

    /**
     * Resolves a GuildMember object.
     */
    async resolveMember(guild, input) {
        if (!guild) return { success: false, code: 'GUILD_NOT_FOUND' };
        if (!input) return { success: false, code: 'MISSING_ARGUMENT', expected: 'user' };
        const parsed = parseMention(input);
        if (parsed) {
            if (parsed.type !== 'user') {
                return { success: false, code: 'WRONG_ENTITY_TYPE', expected: 'user', received: parsed.type };
            }
            const member = guild.members.cache.get(parsed.id) || await guild.members.fetch(parsed.id).catch(() => null);
            if (member) return { success: true, value: member };
            return { success: false, code: 'USER_NOT_FOUND' };
        }
        if (/^\d{17,20}$/.test(input)) {
            const rType = detectReceivedType(guild, input);
            if (rType && rType !== 'user') {
                return { success: false, code: 'WRONG_ENTITY_TYPE', expected: 'user', received: rType };
            }
            const member = guild.members.cache.get(input) || await guild.members.fetch(input).catch(() => null);
            if (member) return { success: true, value: member };
            return { success: false, code: 'USER_NOT_FOUND' };
        }
        const inputLower = input.toLowerCase();
        const matches = guild.members.cache.filter(m => 
            m.user.username.toLowerCase() === inputLower ||
            m.displayName.toLowerCase() === inputLower ||
            (m.nickname && m.nickname.toLowerCase() === inputLower)
        );
        if (matches.size === 1) return { success: true, value: matches.first() };
        if (matches.size > 1) {
            return { success: false, code: 'MULTIPLE_MATCHES', matches: matches.map(m => `${m.user.username} (${m.id})`) };
        }
        // Suggestions search
        let sug = findSuggestion(guild.members.cache, ['nickname', 'displayName'], input);
        if (!sug) {
            const userSug = findSuggestion(guild.members.cache.map(m => m.user), ['username'], input);
            if (userSug) sug = guild.members.cache.get(userSug.id);
        }
        return { success: false, code: 'USER_NOT_FOUND', suggestion: sug };
    },

    /**
     * Resolves a Role object.
     */
    async resolveRole(guild, input) {
        if (!guild) return { success: false, code: 'GUILD_NOT_FOUND' };
        if (!input) return { success: false, code: 'MISSING_ARGUMENT', expected: 'role' };
        const parsed = parseMention(input);
        if (parsed) {
            if (parsed.type !== 'role') {
                return { success: false, code: 'WRONG_ENTITY_TYPE', expected: 'role', received: parsed.type };
            }
            const role = guild.roles.cache.get(parsed.id);
            if (role) return { success: true, value: role };
            return { success: false, code: 'ROLE_NOT_FOUND' };
        }
        if (/^\d{17,20}$/.test(input)) {
            const rType = detectReceivedType(guild, input);
            if (rType && rType !== 'role') {
                return { success: false, code: 'WRONG_ENTITY_TYPE', expected: 'role', received: rType };
            }
            const role = guild.roles.cache.get(input);
            if (role) return { success: true, value: role };
            return { success: false, code: 'ROLE_NOT_FOUND' };
        }
        const inputLower = input.toLowerCase();
        const matches = guild.roles.cache.filter(r => r.name.toLowerCase() === inputLower);
        if (matches.size === 1) return { success: true, value: matches.first() };
        if (matches.size > 1) {
            return { success: false, code: 'MULTIPLE_MATCHES', matches: matches.map(r => `${r.name} (${r.id})`) };
        }
        const sug = findSuggestion(guild.roles.cache, ['name'], input);
        return { success: false, code: 'ROLE_NOT_FOUND', suggestion: sug };
    },

    /**
     * Resolves a Channel object.
     */
    async resolveChannel(guild, input) {
        if (!guild) return { success: false, code: 'GUILD_NOT_FOUND' };
        if (!input) return { success: false, code: 'MISSING_ARGUMENT', expected: 'channel' };
        const parsed = parseMention(input);
        if (parsed) {
            if (parsed.type !== 'channel') {
                return { success: false, code: 'WRONG_ENTITY_TYPE', expected: 'channel', received: parsed.type };
            }
            const channel = guild.channels.cache.get(parsed.id);
            if (channel) return { success: true, value: channel };
            return { success: false, code: 'CHANNEL_NOT_FOUND' };
        }
        if (/^\d{17,20}$/.test(input)) {
            const rType = detectReceivedType(guild, input);
            if (rType && rType !== 'channel' && rType !== 'voice_channel' && rType !== 'category') {
                return { success: false, code: 'WRONG_ENTITY_TYPE', expected: 'channel', received: rType };
            }
            const channel = guild.channels.cache.get(input);
            if (channel) return { success: true, value: channel };
            return { success: false, code: 'CHANNEL_NOT_FOUND' };
        }
        const inputLower = input.toLowerCase();
        const matches = guild.channels.cache.filter(c => c.name.toLowerCase() === inputLower);
        if (matches.size === 1) return { success: true, value: matches.first() };
        if (matches.size > 1) {
            return { success: false, code: 'MULTIPLE_MATCHES', matches: matches.map(c => `#${c.name} (${c.id})`) };
        }
        const sug = findSuggestion(guild.channels.cache, ['name'], input);
        return { success: false, code: 'CHANNEL_NOT_FOUND', suggestion: sug };
    },

    /**
     * Resolves a Category channel.
     */
    async resolveCategory(guild, input) {
        const res = await Resolver.resolveChannel(guild, input);
        if (!res.success) return res;
        if (res.value.type !== ChannelType.GuildCategory) {
            return { success: false, code: 'WRONG_ENTITY_TYPE', expected: 'category', received: 'channel' };
        }
        return res;
    },

    /**
     * Resolves a Voice Channel.
     */
    async resolveVoiceChannel(guild, input) {
        const res = await Resolver.resolveChannel(guild, input);
        if (!res.success) return res;
        if (res.value.type !== ChannelType.GuildVoice && res.value.type !== ChannelType.GuildStageVoice) {
            return { success: false, code: 'WRONG_ENTITY_TYPE', expected: 'voice_channel', received: 'channel' };
        }
        return res;
    },

    /**
     * Resolves an Emoji.
     */
    async resolveEmoji(guild, input) {
        if (!guild) return { success: false, code: 'GUILD_NOT_FOUND' };
        if (!input) return { success: false, code: 'MISSING_ARGUMENT', expected: 'emoji' };
        const parsed = parseMention(input);
        if (parsed && parsed.type === 'emoji') {
            const emoji = guild.emojis.cache.get(parsed.id);
            if (emoji) return { success: true, value: emoji };
            return { success: false, code: 'EMOJI_NOT_FOUND' };
        }
        if (/^\d{17,20}$/.test(input)) {
            const emoji = guild.emojis.cache.get(input);
            if (emoji) return { success: true, value: emoji };
            return { success: false, code: 'EMOJI_NOT_FOUND' };
        }
        const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1F1E0}-\u{1F1FF}]/u;
        if (emojiRegex.test(input)) {
            return { success: true, value: input };
        }
        const matches = guild.emojis.cache.filter(e => e.name.toLowerCase() === input.toLowerCase());
        if (matches.size === 1) return { success: true, value: matches.first() };
        if (matches.size > 1) {
            return { success: false, code: 'MULTIPLE_MATCHES', matches: matches.map(e => `:${e.name}: (${e.id})`) };
        }
        const sug = findSuggestion(guild.emojis.cache, ['name'], input);
        return { success: false, code: 'EMOJI_NOT_FOUND', suggestion: sug };
    },

    /**
     * Resolves a Guild object.
     */
    async resolveGuild(client, input) {
        if (!input) return { success: false, code: 'MISSING_ARGUMENT', expected: 'guild' };
        if (/^\d{17,20}$/.test(input)) {
            const guild = client.guilds.cache.get(input);
            if (guild) return { success: true, value: guild };
            return { success: false, code: 'GUILD_NOT_FOUND' };
        }
        const matches = client.guilds.cache.filter(g => g.name.toLowerCase() === input.toLowerCase());
        if (matches.size === 1) return { success: true, value: matches.first() };
        if (matches.size > 1) {
            return { success: false, code: 'MULTIPLE_MATCHES', matches: matches.map(g => `${g.name} (${g.id})`) };
        }
        const sug = findSuggestion(client.guilds.cache, ['name'], input);
        return { success: false, code: 'GUILD_NOT_FOUND', suggestion: sug };
    },

    /**
     * Resolves a Message object.
     */
    async resolveMessage(channel, input) {
        if (!channel) return { success: false, code: 'CHANNEL_NOT_FOUND' };
        if (!input) return { success: false, code: 'MISSING_ARGUMENT', expected: 'message' };
        const linkMatch = input.match(/https?:\/\/(?:ptb\.|canary\.)?discord\.com\/channels\/\d+\/(\d+)\/(\d+)/);
        if (linkMatch) {
            const targetChannelId = linkMatch[1];
            const messageId = linkMatch[2];
            const targetChannel = channel.guild.channels.cache.get(targetChannelId);
            if (!targetChannel) return { success: false, code: 'CHANNEL_NOT_FOUND' };
            const msg = await targetChannel.messages.fetch(messageId).catch(() => null);
            if (msg) return { success: true, value: msg };
            return { success: false, code: 'MESSAGE_NOT_FOUND' };
        }
        if (/^\d{17,20}$/.test(input)) {
            const msg = channel.messages.cache.get(input) || await channel.messages.fetch(input).catch(() => null);
            if (msg) return { success: true, value: msg };
            return { success: false, code: 'MESSAGE_NOT_FOUND' };
        }
        return { success: false, code: 'MESSAGE_NOT_FOUND' };
    },

    /**
     * Resolves an Attachment object.
     */
    async resolveAttachment(message, input) {
        if (!message) return { success: false, code: 'MESSAGE_NOT_FOUND' };
        const attachment = message.attachments.first();
        if (attachment) return { success: true, value: attachment };
        return { success: false, code: 'ATTACHMENT_NOT_FOUND' };
    },

    /**
     * Resolves an Invite object.
     */
    async resolveInvite(client, input) {
        if (!input) return { success: false, code: 'MISSING_ARGUMENT', expected: 'invite' };
        const invite = await client.fetchInvite(input).catch(() => null);
        if (invite) return { success: true, value: invite };
        return { success: false, code: 'INVITE_NOT_FOUND' };
    },

    /**
     * Resolves a Color string/hex/integer.
     */
    resolveColor(input) {
        if (!input) return { success: false, code: 'MISSING_ARGUMENT', expected: 'color' };
        if (/^#?[0-9A-Fa-f]{6}$/.test(input)) {
            const hex = input.replace('#', '');
            return { success: true, value: parseInt(hex, 16) };
        }
        const val = parseInt(input);
        if (!isNaN(val) && val >= 0 && val <= 16777215) {
            return { success: true, value: val };
        }
        return { success: false, code: 'INVALID_COLOR' };
    },

    /**
     * Resolves a Duration in ms.
     */
    resolveDuration(input) {
        if (!input) return { success: false, code: 'MISSING_ARGUMENT', expected: 'duration' };
        try {
            const val = ms(input);
            if (val && val > 0) return { success: true, value: val };
        } catch {}
        return { success: false, code: 'INVALID_DURATION' };
    },

    /**
     * Resolves a valid Number.
     */
    resolveNumber(input, options = {}) {
        if (input === undefined || input === null || input === '') {
            return { success: false, code: 'MISSING_ARGUMENT', expected: 'number' };
        }
        const val = Number(input);
        if (isNaN(val)) return { success: false, code: 'INVALID_NUMBER' };
        if (options.min !== undefined && val < options.min) return { success: false, code: 'INVALID_NUMBER_MIN', min: options.min };
        if (options.max !== undefined && val > options.max) return { success: false, code: 'INVALID_NUMBER_MAX', max: options.max };
        return { success: true, value: val };
    },

    /**
     * Resolves a Boolean value.
     */
    resolveBoolean(input) {
        if (input === undefined || input === null || input === '') {
            return { success: false, code: 'MISSING_ARGUMENT', expected: 'boolean' };
        }
        const val = String(input).toLowerCase();
        if (['true', 'yes', 'enable', 'on', '1'].includes(val)) return { success: true, value: true };
        if (['false', 'no', 'disable', 'off', '0'].includes(val)) return { success: true, value: false };
        return { success: false, code: 'INVALID_BOOLEAN' };
    },

    /**
     * Resolves a URL.
     */
    resolveURL(input) {
        if (!input) return { success: false, code: 'MISSING_ARGUMENT', expected: 'url' };
        try {
            const url = new URL(input);
            return { success: true, value: url.href };
        } catch {
            return { success: false, code: 'INVALID_URL' };
        }
    }
};

module.exports = Resolver;
