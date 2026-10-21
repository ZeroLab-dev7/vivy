const { SlashCommandBuilder, AttachmentBuilder, MediaGalleryBuilder, MediaGalleryItemBuilder, SeparatorBuilder } = require('discord.js');
const EconomyService = require('../../services/economyService');
const CanvasService = require('../../services/canvasService');
const UIManager = require('../../managers/uiManager');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('profile')
        .setDescription('Render high-resolution Canvas Profile Card')
        .addUserOption(option => option.setName('user').setDescription('Target user')),

    async execute(interaction) {
        await interaction.deferReply();
        const target = interaction.options.getUser('user') || interaction.user;
        const account = await EconomyService.getAccount(target.id, interaction.guild.id);

        const imageBuffer = await CanvasService.generateProfileCard(target, account);
        const attachment = new AttachmentBuilder(imageBuffer, { name: 'profile-card.png' });

        const container = UIManager.createContainer({
            title: `Card Profile: ${target.username}`,
            accentColor: UIManager.ACCENTS.INDIGO
        });

        const statusSec = UIManager.createSection({
            title: '✨ Level & Status',
            content: `Level: **${account.level}** • Prestige: **${account.prestige}** • Net Worth: **$${Number(account.net_worth).toLocaleString()}**`,
            buttonLabel: 'Overview',
            buttonId: 'profile_overview_btn'
        });

        container.addSectionComponents(statusSec);
        container.addSeparatorComponents(new SeparatorBuilder());

        container.addMediaGalleryComponents(
            new MediaGalleryBuilder().addItems(new MediaGalleryItemBuilder().setURL('attachment://profile-card.png'))
        );

        return interaction.editReply({
            files: [attachment],
            ...UIManager.toResponse(container)
        });
    }
};
