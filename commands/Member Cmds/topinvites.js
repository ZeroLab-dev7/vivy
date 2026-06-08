const { PermissionFlagsBits, ButtonBuilder, ButtonStyle, ActionRowBuilder, MessageFlags } = require('discord.js');
const UI = require('../../utils/ui');

const cooldowns = new Map(); // Cooldown map for users
const COOLDOWN_TIME = 10000; // 10 seconds cooldown

module.exports = {
    name: 'topinvites',
    description: 'Displays the top inviters in the server',
    aliases: ['topinvite'],
    async execute(message, args) {
        // Check for cooldown
        if (cooldowns.has(message.author.id)) {
            return message.react('⏳'); // React with the hourglass emoji to indicate cooldown
        }

        // Set the cooldown for the user
        cooldowns.set(message.author.id, Date.now() + COOLDOWN_TIME);
        setTimeout(() => cooldowns.delete(message.author.id), COOLDOWN_TIME);

        // Check for permission
        if (!message.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
            return message.reply({ content: 'You do not have permission to use this command.' });
        }

        const guild = message.guild;
        const invites = await guild.invites.fetch().catch(() => null);
        if (!invites) return message.reply({
            components: [UI.createContainer({
                description: '- <a:warn:1365688576758644797> Could not fetch invites.'
            })],
            flags: MessageFlags.IsComponentsV2
        });

        // Sort invites by highest count
        const topInvites = invites
            .filter(invite => invite.uses > 0)
            .sort((a, b) => b.uses - a.uses)
            .first(10); // Get top 10 inviters

        if (!topInvites.length) {
            return message.reply({
                components: [UI.createContainer({
                    description: '- <a:warn:1365688576758644797> No invites with usage found.'
                })],
                flags: MessageFlags.IsComponentsV2
            });
        }

        // Format invite leaderboard
        const inviteList = topInvites
            .map((invite, index) => `\`${index + 1}.\` **${invite.inviter.tag}** - \`${invite.uses}\` invites`)
            .join('\n');

        const container = UI.createContainer({
            title: `${guild.name} Top Inviters`,
            fields: [
                { name: '<a:links:1366752207533379646>  Top Inviters:', value: inviteList }
            ],
            footer: `${guild.name} Invite`
        });

        const topButton = new ButtonBuilder()
            .setCustomId('top_invite')
            .setLabel('Top Inviters')
            .setEmoji('<a:links:1366752207533379646>')
            .setDisabled(true)
            .setStyle(ButtonStyle.Secondary);

        const row = new ActionRowBuilder().addComponents(topButton);

        await message.channel.send({
            components: [container, row],
            flags: MessageFlags.IsComponentsV2
        });
    }
};
