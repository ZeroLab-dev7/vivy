const { GiveawayInstance } = require('../db/models');
const { EmbedBuilder } = require('discord.js');

class GiveawayService {
    static async startGiveaway(guild, channel, prize, durationMinutes, winnerCount, requirements = {}, bonusEntries = {}, blacklist = []) {
        const endTime = new Date(Date.now() + durationMinutes * 60 * 1000);

        const giveawayEmbed = new EmbedBuilder()
            .setTitle(`<a:pink8:1337678972108148757> GIVEAWAY <a:pink8:1337678972108148757>`)
            .setDescription(`**Prize:** ${prize}\n**Winners:** ${winnerCount}\n**React with <a:pink8:1337678972108148757> to enter!**\n\nEnds: <t:${Math.floor(endTime.getTime() / 1000)}:R>`)
            .setColor('#00f5ff')
            .setTimestamp();

        const message = await channel.send({ embeds: [giveawayEmbed] });
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
                const guild = client.guilds.cache.get(giveaway.guild_id);
                if (!guild) continue;

                const channel = guild.channels.cache.get(giveaway.channel_id);
                if (!channel) continue;

                const message = await channel.messages.fetch(giveaway.message_id).catch(() => null);
                if (!message) continue;

                const reaction = message.reactions.cache.get('<a:pink8:1337678972108148757>');
                if (!reaction) continue;

                const users = await reaction.users.fetch();
                const eligible = [];
                const requirements = JSON.parse(giveaway.requirements_roles || '[]');
                const bonusRoles = JSON.parse(giveaway.bonus_entries_roles || '{}');
                const blacklist = JSON.parse(giveaway.blacklisted_users || '[]');

                for (const user of users.values()) {
                    if (user.bot) continue;
                    if (blacklist.includes(user.id)) continue;

                    const member = await guild.members.fetch(user.id).catch(() => null);
                    if (!member) continue;

                    // Check role requirements
                    if (requirements.length > 0) {
                        const hasRoles = requirements.every(roleId => member.roles.cache.has(roleId));
                        if (!hasRoles) continue;
                    }

                    // Handle bonus entries (multiple entries by push)
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

                // Pick winners
                const winnersList = [];
                const uniqueParticipants = [...new Set(eligible)];
                const wCount = Math.min(giveaway.winner_count, uniqueParticipants.length);

                for (let i = 0; i < wCount; i++) {
                    const idx = Math.floor(Math.random() * uniqueParticipants.length);
                    const winnerId = uniqueParticipants.splice(idx, 1)[0];
                    if (winnerId) winnersList.push(winnerId);
                }

                giveaway.is_ended = true;
                giveaway.participants = JSON.stringify([...new Set(eligible)]);
                giveaway.winners = JSON.stringify(winnersList);
                await giveaway.save();

                const endEmbed = new EmbedBuilder()
                    .setTitle(`<a:pink8:1337678972108148757> GIVEAWAY ENDED <a:pink8:1337678972108148757>`)
                    .setDescription(`**Prize:** ${giveaway.prize}\n**Winners:** ${winnersList.map(id => `<@${id}>`).join(', ') || 'No eligible entrants.'}`)
                    .setColor('Purple')
                    .setTimestamp();

                await message.edit({ embeds: [endEmbed] });
                if (winnersList.length > 0) {
                    await channel.send(`Congratulations ${winnersList.map(id => `<@${id}>`).join(', ')}! You won the giveaway for **${giveaway.prize}**!`);
                } else {
                    await channel.send(`Giveaway for **${giveaway.prize}** ended with no winners.`);
                }
            } catch (e) {
                console.error("Failed to resolve giveaway:", e);
            }
        }
    }
}

module.exports = GiveawayService;
