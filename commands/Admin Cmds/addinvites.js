const { PermissionFlagsBits, MessageFlags } = require('discord.js');
const { InviteBonus } = require('../../db/models');
const UI = require('../../utils/ui');

module.exports = {
    name: 'addinvites',
    aliases: ['addinvite', 'bonusinvite'],
    description: 'Add bonus invites to a user',
    usage: '<user> <amount>',
    permissions: [PermissionFlagsBits.Administrator],

    async execute(message, args) {
        if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return message.reply({ content: '❌ You do not have permission to use this command.' });
        }

        const targetUser = message.mentions.users.first() || await message.client.users.fetch(args[0]).catch(() => null);
        const amount = parseInt(args[1]);

        if (!targetUser || isNaN(amount)) {
            return message.reply({
                components: [UI.createContainer({
                    description: '❌ Usage: `&addinvites @User <amount>`'
                })],
                flags: MessageFlags.IsComponentsV2
            });
        }

        try {
            const [bonusRecord] = await InviteBonus.findOrCreate({
                where: {
                    guild_id: message.guild.id,
                    user_id: targetUser.id
                },
                defaults: { bonus: 0 }
            });

            const newBonus = bonusRecord.bonus + amount;
            await bonusRecord.update({ bonus: newBonus });

            message.reply({
                components: [UI.createContainer({
                    title: '✅ Bonus Invites Updated',
                    description: `Added **${amount}** bonus invites to ${targetUser}.\n\nTotal Bonus: **${newBonus}**`
                })],
                flags: MessageFlags.IsComponentsV2
            });

        } catch (error) {
            console.error('Error adding bonus invites:', error);
            message.reply({ content: '❌ An error occurred while updating bonus invites.' });
        }
    }
};
