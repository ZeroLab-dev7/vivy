const { GiveawayInstance } = require('../db/models');
const { MessageFlags } = require('discord.js');
const UI = require('../utils/ui');

class GiveawayService {
    static async startGiveaway(guild, channel, prize, durationMinutes, winnerCount, requirements = {}, bonusEntries = {}, blacklist = []) {
        const endTime = new Date(Date.now() + durationMinutes * 60 * 1000);

        const giveawayContainer = UI.createContainer({
            title: `<a:pink8:1337678972108148757> GIVEAWAY <a:pink8:1337678972108148757>`,
            description: `**Prize:** ${prize}\n**Winners:** ${winnerCount}\n**React with <a:pink8:1337678972108148757> to enter!**\n\nEnds: <t:${Math.floor(endTime.getTime() / 1000)}:R>`,
            color: 0x00f5ff
        });

        const message = await channel.send({
            components: [giveawayContainer],
            flags: MessageFlags.IsComponentsV2
        });
        await message.react('<a:pink8:1337678972108148757>');

        return await GiveawayInstance.create({
            guild_id: guild.id,
            channel_id: channel.id,
            message_id: message.id,
            prize,
            winner_count: winnerCount,
            end_time: endTime,
            requirements_roles: JSON.stringify(requirements.roles || []),
            bonus_entries_roles: JSON.stringify(bonusEntries),
            blacklisted_users: JSON.stringify(blacklist),
            participants: '[]',
            winners: '[]',
            is_ended: false
        });
    }

    static async checkAndResolveGiveaways(client) {
        const active = await GiveawayInstance.findAll({
            where: { is_ended: false, end_time: { [require('sequelize').Op.lte]: new Date() } }
        });

        for (const giveaway of active) {
            try {
                const guild = client.guilds.cache.get(giveaway.guild_id) || await client.guilds.fetch(giveaway.guild_id).catch(() => null);
                if (!guild) continue;

                const channel = guild.channels.cache.get(giveaway.channel_id) || await guild.channels.fetch(giveaway.channel_id).catch(() => null);
                if (!channel) continue;

                const message = await channel.messages.fetch(giveaway.message_id).catch(() => null);
                if (!message) {
                    giveaway.is_ended = true;
                    await giveaway.save();
                    continue;
                }

                const reaction = message.reactions.cache.get('1337678972108148757')
                    || message.reactions.cache.find(r => r.emoji.id === '1337678972108148757' || r.emoji.name === 'pink8')
                    || message.reactions.cache.first();

                const eligible = [];
                const requirements = JSON.parse(giveaway.requirements_roles || '[]');
                const bonusRoles = JSON.parse(giveaway.bonus_entries_roles || '{}');
                const blacklist = JSON.parse(giveaway.blacklisted_users || '[]');

                if (reaction) {
                    let fetchedUsers = new Map();
                    let lastId = null;
                    while (true) {
                        const options = { limit: 100 };
                        if (lastId) options.after = lastId;
                        const usersBatch = await reaction.users.fetch(options).catch(() => null);
                        if (!usersBatch || usersBatch.size === 0) break;
                        for (const [id, u] of usersBatch) {
                            fetchedUsers.set(id, u);
                        }
                        if (usersBatch.size < 100) break;
                        lastId = usersBatch.lastKey();
                    }

                    for (const user of fetchedUsers.values()) {
                        if (user.bot) continue;
                        if (blacklist.includes(user.id)) continue;

                        const member = await guild.members.fetch(user.id).catch(() => null);
                        if (!member) continue;

                        // Check role requirements
                        if (requirements.length > 0) {
                            const hasRoles = requirements.every(roleId => member.roles.cache.has(roleId));
                            if (!hasRoles) continue;
                        }

                        // Handle bonus entries
                        let entries = 1;
                        for (const [roleId, multiplier] of Object.entries(bonusRoles)) {
                            if (member.roles.cache.has(roleId)) {
                                entries = Math.max(entries, parseInt(multiplier));
                            }
                        }

                        for (let i = 0; i < entries; i++) {
                            eligible.push(user.id);
                        }
                    }
                }

                // Pick winners using pool of entries
                const pool = [...eligible];
                const uniqueParticipants = [...new Set(pool)];
                const winnersList = [];
                const wCount = Math.min(giveaway.winner_count, uniqueParticipants.length);

                while (winnersList.length < wCount && pool.length > 0) {
                    const idx = Math.floor(Math.random() * pool.length);
                    const winnerId = pool[idx];
                    if (winnerId && !winnersList.includes(winnerId)) {
                        winnersList.push(winnerId);
                    }
                    for (let i = pool.length - 1; i >= 0; i--) {
                        if (pool[i] === winnerId) pool.splice(i, 1);
                    }
                }

                giveaway.is_ended = true;
                giveaway.participants = JSON.stringify(uniqueParticipants);
                giveaway.winners = JSON.stringify(winnersList);
                await giveaway.save();

                const endContainer = UI.createContainer({
                    title: `<a:pink8:1337678972108148757> GIVEAWAY ENDED <a:pink8:1337678972108148757>`,
                    description: `**Prize:** ${giveaway.prize}\n**Winners:** ${winnersList.map(id => `<@${id}>`).join(', ') || 'No eligible entrants.'}`,
                    color: 0x9d4edd
                });

                await message.edit({
                    components: [endContainer],
                    embeds: [],
                    flags: MessageFlags.IsComponentsV2
                }).catch(err => console.error("Failed to edit giveaway end container:", err));

                if (winnersList.length > 0) {
                    await channel.send({
                        content: `Congratulations ${winnersList.map(id => `<@${id}>`).join(', ')}! You won the giveaway for **${giveaway.prize}**!`,
                        allowedMentions: { parse: ['users'] }
                    }).catch(() => null);
                } else {
                    await channel.send(`Giveaway for **${giveaway.prize}** ended with no winners.`).catch(() => null);
                }
            } catch (e) {
                console.error("Failed to resolve giveaway:", e);
            }
        }
    }
}

module.exports = GiveawayService;
