const { AttachmentBuilder, MediaGalleryBuilder, MediaGalleryItemBuilder, SeparatorBuilder } = require('discord.js');
const EconomyService = require('../../services/economyService');
const CanvasService = require('../../services/canvasService');
const UIManager = require('../../managers/uiManager');

module.exports = {
    name: 'profile',
    aliases: ['p', 'card'],
    description: 'Display canvas economy profile card',
    async execute(message, args) {
        const target = message.mentions.users.first() || message.author;
        const account = await EconomyService.getAccount(target.id, message.guild.id);

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

        return message.reply({
            files: [attachment],
            ...UIManager.toResponse(container)
        });
    }
};
