const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');
const { TicketBlacklist } = require('../../db/models');
const UI = require('../../utils/ui');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('blacklistticket')
        .setDescription('Manage blacklisted users from opening support tickets')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommand(sub =>
            sub.setName('add')
                .setDescription('Blacklist a user from opening tickets')
                .addUserOption(opt =>
                    opt.setName('target')
                        .setDescription('The user to blacklist')
                        .setRequired(true))
                .addStringOption(opt =>
                    opt.setName('reason')
                        .setDescription('Reason for the blacklist')
                        .setRequired(false)))
        .addSubcommand(sub =>
            sub.setName('remove')
                .setDescription('Remove a user from the ticket blacklist')
                .addUserOption(opt =>
                    opt.setName('target')
                        .setDescription('The user to unblacklist')
                        .setRequired(true)))
        .addSubcommand(sub =>
            sub.setName('list')
                .setDescription('List all users blacklisted from the ticket system')),

    async execute(interaction) {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        const subcommand = interaction.options.getSubcommand();

        if (subcommand === 'add') {
            const targetUser = interaction.options.getUser('target');
            const reason = interaction.options.getString('reason') || 'No reason provided';

            const existing = await TicketBlacklist.findOne({
                where: { guild_id: interaction.guild.id, user_id: targetUser.id }
            });

            if (existing) {
                const container = UI.createContainer({
                    title: '<:no:1526496561188831244> Already Blacklisted',
                    description: `User ${targetUser} (\`${targetUser.id}\`) is already blacklisted from the ticket system.`,
                    color: 0xFF0000
                });
                return interaction.editReply({ components: [container], flags: MessageFlags.IsComponentsV2 });
            }

            await TicketBlacklist.create({
                guild_id: interaction.guild.id,
                user_id: targetUser.id,
                reason: reason,
                blacklisted_by: interaction.user.id
            });

            const container = UI.createContainer({
                title: '⛔ User Blacklisted from Tickets',
                description: `Successfully blacklisted ${targetUser} (\`${targetUser.id}\`) from opening tickets.\n\n**Reason:** ${reason}`,
                color: 0xFF0000
            });
            return interaction.editReply({ components: [container], flags: MessageFlags.IsComponentsV2 });
        }

        if (subcommand === 'remove') {
            const targetUser = interaction.options.getUser('target');

            const existing = await TicketBlacklist.findOne({
                where: { guild_id: interaction.guild.id, user_id: targetUser.id }
            });

            if (!existing) {
                const container = UI.createContainer({
                    title: '<:no:1526496561188831244> Not Blacklisted',
                    description: `User ${targetUser} (\`${targetUser.id}\`) is not in the ticket blacklist.`,
                    color: 0xFF0000
                });
                return interaction.editReply({ components: [container], flags: MessageFlags.IsComponentsV2 });
            }

            await existing.destroy();

            const container = UI.createContainer({
                title: '✅ Ticket Blacklist Removed',
                description: `Successfully removed ${targetUser} (\`${targetUser.id}\`) from the ticket blacklist.`,
                color: 0x00FF00
            });
            return interaction.editReply({ components: [container], flags: MessageFlags.IsComponentsV2 });
        }

        if (subcommand === 'list') {
            const list = await TicketBlacklist.findAll({
                where: { guild_id: interaction.guild.id }
            });

            if (list.length === 0) {
                const container = UI.createContainer({
                    title: '📋 Ticket Blacklist',
                    description: 'There are currently no users blacklisted from opening tickets in this server.',
                    color: 0x00FFFF
                });
                return interaction.editReply({ components: [container], flags: MessageFlags.IsComponentsV2 });
            }

            const formattedList = list.map((item, index) => {
                return `${index + 1}. <@${item.user_id}> (\`${item.user_id}\`)\n└ **Reason:** ${item.reason || 'None'} | **By:** <@${item.blacklisted_by}>`;
            }).join('\n\n');

            const container = UI.createContainer({
                title: `📋 Ticket Blacklist (${list.length})`,
                description: formattedList,
                color: 0x00FFFF
            });
            return interaction.editReply({ components: [container], flags: MessageFlags.IsComponentsV2 });
        }
    }
};
