// commands/slash/rank.js
const { SlashCommandBuilder, AttachmentBuilder, MessageFlags } = require('discord.js');
const LevelService = require('../../services/levelService');
const UI = require('../../utils/ui');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rank')
        .setDescription('Check your current leveling rank and progress card.')
        .addUserOption(option =>
            option.setName('target')
                .setDescription('The user to view rank card for')
                .setRequired(false)),

    async execute(interaction) {
        try {
            await interaction.deferReply();

            const targetUser = interaction.options.getUser('target') || interaction.user;

            if (targetUser.bot) {
                return interaction.editReply({
                    components: [UI.createContainer({
                        description: '❌ Bots do not earn XP or have rank cards.'
                    })],
                    flags: MessageFlags.IsComponentsV2
                });
            }

            // Fetch member to get presence/status
            const member = await interaction.guild.members.fetch({
                user: targetUser.id,
                force: false
            }).catch(() => null);

            // Resolve presence: online | idle | dnd | offline
            const presenceStatus = member?.presence?.status ?? 'offline';
            const avatarURL = targetUser.displayAvatarURL({ forceStatic: true, extension: 'png', size: 256 });
            const guildIconURL = interaction.guild.iconURL({ extension: 'png', size: 128 });

            const cardBuffer = await LevelService.getRankCard(
                targetUser.id,
                interaction.guild.id,
                targetUser.username,
                avatarURL,
                presenceStatus,
                guildIconURL
            );

            const attachment = new AttachmentBuilder(cardBuffer, { name: 'rank.png' });
            await interaction.editReply({ files: [attachment] });

        } catch (error) {
            console.error('Error in slash rank command:', error);
            await interaction.editReply({
                components: [UI.createContainer({
                    description: '❌ An error occurred while generating the rank card.',
                    color: 0xff0000
                })],
                flags: MessageFlags.IsComponentsV2
            });
        }
    }
};