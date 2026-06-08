const { Events, AuditLogEvent } = require('discord.js');
const { sendLog, getExecutor } = require('../utils/logManager');

module.exports = {
    name: Events.VoiceStateUpdate,
    async execute(oldState, newState) {
        const member = newState.member;
        const guild = newState.guild;

        if (!member) return;

        // Join
        if (!oldState.channelId && newState.channelId) {
            await sendLog(guild, 'voice-join', {
                author: { name: 'Voice Joined', iconURL: member.user.displayAvatarURL({ dynamic: true }) },
                fields: [
                    { name: '<a:member:1366766051626582050> Target User:', value: `${member}`, inline: true },
                    { name: '<:userinfo:1492408642803204096> User id:', value: `\`${member.id}\``, inline: true },
                    { name: '<:timee:1492407654256218142> Joined at:', value: `<t:${Math.floor(Date.now() / 1000)}:R>`, inline: true },
                    { name: '🔊 Voice Channel:', value: `${newState.channel}`, inline: true }
                ],
                color: 'Green'
            });
        }

        // Leave / Disconnect
        if (oldState.channelId && !newState.channelId) {
            // Check if this was a moderator disconnect
            const executor = await getExecutor(guild, AuditLogEvent.MemberDisconnect, null);

            if (executor) {
                await sendLog(guild, 'voice-disconnect', {
                    author: { name: 'Voice Disconnected', iconURL: member.user.displayAvatarURL({ dynamic: true }) },
                    fields: [
                        { name: '<a:member:1366766051626582050> Target User:', value: `${member}`, inline: true },
                        { name: '<:userinfo:1492408642803204096> User id:', value: `\`${member.id}\``, inline: true },
                        { name: '<:timee:1492407654256218142> Disconnected at:', value: `<t:${Math.floor(Date.now() / 1000)}:R>`, inline: true },
                        { name: '🔊 Voice Channel:', value: `${oldState.channel}`, inline: true },
                        { name: '<:timee:1492407654256218142> Disconnected by:', value: `${executor}`, inline: true }
                    ],
                    color: 'Red'
                });
            } else {
                await sendLog(guild, 'voice-leave', {
                    author: { name: 'Voice Left', iconURL: member.user.displayAvatarURL({ dynamic: true }) },
                    fields: [
                        { name: '<a:member:1366766051626582050> Target User:', value: `${member}`, inline: true },
                        { name: '<:userinfo:1492408642803204096> User id:', value: `\`${member.id}\``, inline: true },
                        { name: '<:timee:1492407654256218142> Left at:', value: `<t:${Math.floor(Date.now() / 1000)}:R>`, inline: true },
                        { name: '🔊 Voice Channel:', value: `${oldState.channel}`, inline: true }
                    ],
                    color: 'Red'
                });
            }
        }

        // Move
        if (oldState.channelId && newState.channelId && oldState.channelId !== newState.channelId) {
            const executor = await getExecutor(guild, AuditLogEvent.MemberMove, null);

            await sendLog(guild, 'voice-move', {
                author: { name: 'Voice Moved', iconURL: member.user.displayAvatarURL({ dynamic: true }) },
                fields: [
                    { name: '<a:member:1366766051626582050> Target User:', value: `${member}`, inline: true },
                    { name: '<:userinfo:1492408642803204096> User id:', value: `\`${member.id}\``, inline: true },
                    { name: '<:timee:1492407654256218142> Moved at:', value: `<t:${Math.floor(Date.now() / 1000)}:R>`, inline: true },
                    { name: '🔊 Old Channel:', value: `${oldState.channel}`, inline: true },
                    { name: '🔊 New Channel:', value: `${newState.channel}`, inline: true },
                    { name: '<:timee:1492407654256218142> Moved by:', value: executor ? `${executor}` : `${member} (Self)`, inline: true }
                ],
                color: 'Orange'
            });
        }

        // Mute/Unmute (Server)
        if (oldState.channelId && newState.channelId && oldState.serverMute !== newState.serverMute) {
            const executor = await getExecutor(guild, AuditLogEvent.MemberUpdate, member.id, entry => {
                return entry.changes.some(c => c.key === 'mute');
            });
            await sendLog(guild, 'voice-mute', {
                author: { name: newState.serverMute ? 'Server Muted' : 'Server Unmuted', iconURL: member.user.displayAvatarURL({ dynamic: true }) },
                fields: [
                    { name: '<a:member:1366766051626582050> Target User:', value: `${member}`, inline: true },
                    { name: '<:userinfo:1492408642803204096> User id:', value: `\`${member.id}\``, inline: true },
                    { name: '<:timee:1492407654256218142> Action at:', value: `<t:${Math.floor(Date.now() / 1000)}:R>`, inline: true },
                    { name: '🔊 Voice Channel:', value: `${newState.channel}`, inline: true },
                    { name: '<:timee:1492407654256218142> Modified by:', value: executor ? `${executor}` : 'Unknown', inline: true }
                ],
                color: newState.serverMute ? 'Red' : 'Green'
            });
        }

        // Deafen/Undeafen (Server)
        if (oldState.channelId && newState.channelId && oldState.serverDeaf !== newState.serverDeaf) {
            const executor = await getExecutor(guild, AuditLogEvent.MemberUpdate, member.id, entry => {
                return entry.changes.some(c => c.key === 'deaf');
            });
            await sendLog(guild, 'voice-deafen', {
                author: { name: newState.serverDeaf ? 'Server Deafened' : 'Server Undeafened', iconURL: member.user.displayAvatarURL({ dynamic: true }) },
                fields: [
                    { name: '<a:member:1366766051626582050> Target User:', value: `${member}`, inline: true },
                    { name: '<:userinfo:1492408642803204096> User id:', value: `\`${member.id}\``, inline: true },
                    { name: '<:timee:1492407654256218142> Action at:', value: `<t:${Math.floor(Date.now() / 1000)}:R>`, inline: true },
                    { name: '🔊 Voice Channel:', value: `${newState.channel}`, inline: true },
                    { name: '<:timee:1492407654256218142> Modified by:', value: executor ? `${executor}` : 'Unknown', inline: true }
                ],
                color: newState.serverDeaf ? 'Red' : 'Green'
            });
        }
    }
};
