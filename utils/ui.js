const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, StringSelectMenuBuilder, ButtonStyle, ContainerBuilder, TextDisplayBuilder, SeparatorBuilder, SeparatorSpacingSize, MessageFlags, MediaGalleryBuilder, MediaGalleryItemBuilder, SectionBuilder, ThumbnailBuilder } = require('discord.js');
const config = require('../config');
const Emojis = require('./emojis');

class UI {
    /**
     * Create a V2 Styled Embed
     * @param {Object} options
     * @param {string} options.title
     * @param {string} [options.description]
     * @param {'info'|'success'|'error'|'warning'|'admin'} [options.type='info'] - Defines color
     * @param {Array} [options.fields]
     * @param {string} [options.footer]
     * @param {string} [options.thumbnail]
     * @param {string} [options.image]
     * @param {Object} [options.author]
     */
    static createEmbed({ title, description, type, fields = [], footer, thumbnail, image, author, color }) {
        const embed = new EmbedBuilder()

        // Allow manual color override or type-based color if needed, 
        // but user requested "no colors". 
        // If they pass a specific color in options (not in original sig but useful), we could use it.
        // Original signature: type='info' was default.
        // User said: "i dont wanna colors in embeds without collor" -> implying if no color specified, no color.
        // And "without footer".

        if (color) embed.setColor(color);
        embed.setTimestamp();

        if (title) embed.setTitle(title);

        // V2 Description Formatting (bullet points automatically invoked if needed, but handled by caller usually)
        if (description) embed.setDescription(description);

        if (fields.length > 0) embed.addFields(fields);

        // Standard Footer - Only if provided
        if (footer) {
            embed.setFooter({
                text: footer,
                iconURL: thumbnail || undefined
            });
        }

        if (author) embed.setAuthor(author);
        if (thumbnail) embed.setThumbnail(thumbnail);
        if (image) embed.setImage(image);

        return embed;
    }

    /**
     * Create a V2 Container
     * @param {Object} options
     * @param {string} options.title
     * @param {string} [options.description]
     * @param {string} [options.color] - Hex color for accent (e.g. 0xFF0000)
     * @param {Array} [options.fields] - Array of {name, value} objects
     * @param {string} [options.footer]
     */
    static createContainer({ title, description, color, fields = [], footer, image, thumbnail }) {
        const container = new ContainerBuilder();

        if (color) {
            // Container accent color expects integer/hex
            const colorInt = typeof color === 'string' && color.startsWith('#')
                ? parseInt(color.replace('#', ''), 16)
                : color;
            if (colorInt) container.setAccentColor(colorInt);
        }

        // Handle Thumbnail (Header Section) or Standard Header
        if (thumbnail) {
            const section = new SectionBuilder();
            section.setThumbnailAccessory(new ThumbnailBuilder().setURL(thumbnail));

            if (title) {
                section.addTextDisplayComponents(td => td.setContent(`# ${title}`));
            }
            if (description) {
                section.addTextDisplayComponents(td => td.setContent(description));
            }
            container.addSectionComponents(section);
        } else {
            if (title) {
                container.addTextDisplayComponents(td => td.setContent(`# ${title}`));
                // Add subtle separator after title if there's more content
                if (description || fields.length > 0) {
                    container.addSeparatorComponents(sep => sep.setSpacing(SeparatorSpacingSize.Small));
                }
            }

            if (description) {
                container.addTextDisplayComponents(td => td.setContent(description));
            }
        }

        if (fields.length > 0) {
            // Container doesn't have native fields like embed, render as text/markdown
            // Maybe add a separator before fields
            container.addSeparatorComponents(sep => sep.setSpacing(SeparatorSpacingSize.Small));

            fields.forEach(field => {
                const header = `### ${field.name}`;
                const body = field.value;
                container.addTextDisplayComponents(td => td.setContent(`${header}\n${body}`));
            });
        }

        if (image) {
            const gallery = new MediaGalleryBuilder();
            gallery.addItems(new MediaGalleryItemBuilder().setURL(image));
            container.addMediaGalleryComponents(gallery);
        }

        if (footer) {
            container.addSeparatorComponents(sep => sep.setSpacing(SeparatorSpacingSize.Small));
            container.addTextDisplayComponents(td => td.setContent(`*${footer}*`)); // Italicize footer
        }

        return container;
    }

    static getNavigationRow({ backDisabled = false, nextDisabled = false, homeId = 'home', backId = 'back', nextId = 'next' } = {}) {
        return new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId(backId)
                .setEmoji(Emojis.Nav.back)
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(backDisabled),

            new ButtonBuilder()
                .setCustomId(homeId)
                .setEmoji(Emojis.Nav.home)
                .setStyle(ButtonStyle.Secondary),

            new ButtonBuilder()
                .setCustomId(nextId)
                .setEmoji(Emojis.Nav.next)
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(nextDisabled)
        );
    }

    static createButtons(buttons) {
        const row = new ActionRowBuilder();
        buttons.forEach(btn => {
            const builder = new ButtonBuilder();

            if (btn.url) {
                builder.setStyle(ButtonStyle.Link).setURL(btn.url);
            } else {
                builder.setCustomId(btn.customId || 'no_id')
                    .setStyle(btn.style || ButtonStyle.Secondary);
            }

            if (btn.label) builder.setLabel(btn.label);
            if (btn.emoji) builder.setEmoji(btn.emoji);
            if (btn.disabled) builder.setDisabled(true);

            row.addComponents(builder);
        });
        return row;
    }

    /**
     * Create Standard Select Menu
     */
    static createSelectMenu({ customId, placeholder, options, minValues = 1, maxValues = 1 }) {
        return new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId(customId)
                .setPlaceholder(placeholder || 'Select an option...')
                .addOptions(options)
                .setMinValues(minValues)
                .setMaxValues(maxValues)
        );
    }
}

module.exports = UI;
