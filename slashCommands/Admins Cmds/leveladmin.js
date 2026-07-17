const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');
const LevelService = require('../../services/levelService');
const UI = require('../../utils/ui');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('leveladmin')
        .setDescription('Admin commands for managing server leveling systems.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .addSubcommand(subcommand =>
            subcommand.setName('addxp')
                .setDescription('Add XP to a user')
                .addUserOption(option => option.setName('user').setDescription('The user to add XP to').setRequired(true))
                .addIntegerOption(option => option.setName('amount').setDescription('The amount of XP to add').setRequired(true).setMinValue(1)))
        .addSubcommand(subcommand =>
            subcommand.setName('removexp')
                .setDescription('Remove XP from a user')
                .addUserOption(option => option.setName('user').setDescription('The user to remove XP from').setRequired(true))
                .addIntegerOption(option => option.setName('amount').setDescription('The amount of XP to remove').setRequired(true).setMinValue(1)))
        .addSubcommand(subcommand =>
            subcommand.setName('setxp')
                .setDescription('Set a user\'s XP')
                .addUserOption(option => option.setName('user').setDescription('The user to set XP for').setRequired(true))
                .addIntegerOption(option => option.setName('value').setDescription('The exact amount of XP to set').setRequired(true).setMinValue(0)))
        .addSubcommand(subcommand =>
            subcommand.setName('setlevel')
                .setDescription('Set a user\'s level')
                .addUserOption(option => option.setName('user').setDescription('The user to set level for').setRequired(true))
                .addIntegerOption(option => option.setName('value').setDescription('The exact level to set').setRequired(true).setMinValue(0)))
        .addSubcommand(subcommand =>
            subcommand.setName('reset')
                .setDescription('Reset a user\'s leveling progress')
                .addUserOption(option => option.setName('user').setDescription('The user to reset').setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand.setName('resetleaderboard')
                .setDescription('Reset the entire server leaderboard')),

    async execute(interaction) {
        try {
            await interaction.deferReply();

            // Require Manage Server permission check (extra guard)
            if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild) && !interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
                return interaction.editReply({
                    components: [UI.createContainer({
                        description: '<:no:1526496561188831244>You require **Manage Server** or **Administrator** permissions to use this command.'
                    })],
                    flags: MessageFlags.IsComponentsV2
                });
            }

            const subcommand = interaction.options.getSubcommand();

            if (subcommand === 'resetleaderboard') {
                await LevelService.resetLeaderboard(interaction.guild.id, interaction.client);
                return interaction.editReply({
                    components: [UI.createContainer({
                        description: '✅ Successfully reset all leveling stats and caches for this server.'
                    })],
                    flags: MessageFlags.IsComponentsV2
                });
            }

            const targetUser = interaction.options.getUser('user');
            const member = await interaction.guild.members.fetch(targetUser.id).catch(() => null);

            if (!member) {
                return interaction.editReply({
                    components: [UI.createContainer({
                        description: '<:no:1526496561188831244>User is not in this server.'
                    })],
                    flags: MessageFlags.IsComponentsV2
                });
            }

            if (targetUser.bot) {
                return interaction.editReply({
                    components: [UI.createContainer({
                        description: '<:no:1526496561188831244>Bots do not participate in leveling.'
                    })],
                    flags: MessageFlags.IsComponentsV2
                });
            }

            let result;
            if (subcommand === 'addxp') {
                const amount = interaction.options.getInteger('amount');
                result = await LevelService.addAdminXP(targetUser.id, interaction.guild.id, amount, interaction.client);
                return interaction.editReply({
                    components: [UI.createContainer({
                        description: `✅ Added **${amount} XP** to ${targetUser}. User is now level **${result.level}**.`
                    })],
                    flags: MessageFlags.IsComponentsV2
                });
            }

            if (subcommand === 'removexp') {
                const amount = interaction.options.getInteger('amount');
                result = await LevelService.removeAdminXP(targetUser.id, interaction.guild.id, amount, interaction.client);
                return interaction.editReply({
                    components: [UI.createContainer({
                        description: `✅ Removed **${amount} XP** from ${targetUser}. User is now level **${result.level}**.`
                    })],
                    flags: MessageFlags.IsComponentsV2
                });
            }

            if (subcommand === 'setxp') {
                const value = interaction.options.getInteger('value');
                result = await LevelService.setXP(targetUser.id, interaction.guild.id, value, interaction.client);
                return interaction.editReply({
                    components: [UI.createContainer({
                        description: `✅ Set XP for ${targetUser} to **${value}**. User is now level **${result.level}**.`
                    })],
                    flags: MessageFlags.IsComponentsV2
                });
            }

            if (subcommand === 'setlevel') {
                const value = interaction.options.getInteger('value');
                result = await LevelService.setLevel(targetUser.id, interaction.guild.id, value, interaction.client);
                return interaction.editReply({
                    components: [UI.createContainer({
                        description: `✅ Set level for ${targetUser} to **${value}**.`
                    })],
                    flags: MessageFlags.IsComponentsV2
                });
            }

            if (subcommand === 'reset') {
                await LevelService.resetXP(targetUser.id, interaction.guild.id, interaction.client);
                return interaction.editReply({
                    components: [UI.createContainer({
                        description: `✅ Reset leveling progress and counters for ${targetUser}.`
                    })],
                    flags: MessageFlags.IsComponentsV2
                });
            }

        } catch (error) {
            console.error('Error in slash leveladmin command:', error);
            await interaction.editReply({
                components: [UI.createContainer({
                    description: '<:no:1526496561188831244>Failed to process admin leveling command.',
                    color: 0xff0000
                })],
                flags: MessageFlags.IsComponentsV2
            });
        }
    }
};
