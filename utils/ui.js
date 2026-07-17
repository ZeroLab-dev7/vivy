const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, StringSelectMenuBuilder, ButtonStyle, ContainerBuilder, TextDisplayBuilder, SeparatorBuilder, SeparatorSpacingSize, MessageFlags, MediaGalleryBuilder, MediaGalleryItemBuilder, SectionBuilder, ThumbnailBuilder } = require('discord.js');
const config = require('../config');
const Emojis = require('./emojis');
const Messages = require('./messages');

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
    static createContainer({ title, description, color = 0x00FFFF, fields = [], footer, image, thumbnail }) {
        const container = new ContainerBuilder();

        // Check if description is a success message
        const isSuccess = description && (
            /Successfully/i.test(description) ||
            /has\s+been\s+(unmuted|muted|kicked|deafened|undeafened|unjailed|jailed|added|removed|created|deleted|verified|banned|unbanned|warned|unwarned|timed out|untimeouted|un-timed out)/i.test(description) ||
            /(<:done:\d+>|<:success:\d+>|<a:done:\d+>|✅)/i.test(description)
        ) && !(
            /(<a:warn:\d+>|❌|⚠️|<:false:\d+>|Error|Failed)/i.test(description)
        );

        // Clear fields on success containers to prevent printing detailed logs/tables
        const activeFields = isSuccess ? [] : fields;

        // Container accent color expects integer/hex; defaults to cyan
        const colorInt = typeof color === 'string' && color.startsWith('#')
            ? parseInt(color.replace('#', ''), 16)
            : color;
        if (colorInt) container.setAccentColor(colorInt);

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
                if (description || activeFields.length > 0) {
                    container.addSeparatorComponents(sep => sep.setSpacing(SeparatorSpacingSize.Small));
                }
            }

            if (description) {
                if (isSuccess) {
                    let cleanText = description
                        .replace(/^[-#\s]+/g, '')
                        .replace(/^(?:<:done:\d+>|<:success:\d+>|<a:done:\d+>|✅)\s*/i, '')
                        .replace(/^[-#\s]+/g, '')
                        .replace(/^Successfully\s+/i, '')
                        .replace(/^[-#\s]+/g, '')
                        .replace(/^\*\*Successfully\s+/i, '**')
                        .replace(/^\*Successfully\s+/i, '*')
                        .replace(/^__Successfully\s+/i, '__');

                    if (!cleanText.startsWith('**') && cleanText.endsWith('**')) {
                        cleanText = cleanText.slice(0, -2);
                    }
                    if (!cleanText.startsWith('*') && cleanText.endsWith('*')) {
                        cleanText = cleanText.slice(0, -1);
                    }
                    if (!cleanText.startsWith('`') && cleanText.endsWith('`')) {
                        cleanText = cleanText.slice(0, -1);
                    }

                    let rest = cleanText;

                    const roleActionRegex = /^(added|removed)\s+(?:the\s+)?role\s+(\*\*[^*]+\*\*|`[^`]+`|[\w@<#!:>]+)\s+(?:to|from)\s+(.*)/i;
                    const roleActionMatch = cleanText.match(roleActionRegex);

                    const nickActionRegex = /^changed\s+([^\s]+)'s\s+nickname\s+to\s+(.*)/i;
                    const nickActionMatch = cleanText.match(nickActionRegex);

                    if (roleActionMatch) {
                        const verb = roleActionMatch[1].toLowerCase();
                        const roleName = roleActionMatch[2];
                        const targetUser = roleActionMatch[3];
                        if (verb === 'added') {
                            rest = `${roleName} role has been added to ${targetUser}`;
                        } else {
                            rest = `${roleName} role has been removed from ${targetUser}`;
                        }
                    } else if (nickActionMatch) {
                        const targetUser = nickActionMatch[1];
                        const newNick = nickActionMatch[2];
                        rest = `${targetUser}'s nickname has been changed to ${newNick}`;
                    } else {
                        const actionRegex = /^(unmuted|muted|kicked|deafened|undeafened|unjailed|jailed|added|removed|created|deleted|verified|banned|unbanned|warned|unwarned|timed out|untimeouted|un-timed out)\s+(\*\*[^*]+\*\*|`[^`]+`|[\w@<#!:>]+)\s*(.*)/i;
                        const actionMatch = cleanText.match(actionRegex);
                        
                        const actionRegex2 = /^(\*\*[^*]+\*\*|`[^`]+`|[\w@<#!:>]+)\s+Successfully\s+(unmuted|muted|kicked|deafened|undeafened|unjailed|jailed|added|removed|created|deleted|verified|banned|unbanned|warned|unwarned|timed out|untimeouted|un-timed out)\s*(.*)/i;
                        const actionMatch2 = cleanText.match(actionRegex2);

                        if (actionMatch) {
                            const verb = actionMatch[1].toLowerCase();
                            const target = actionMatch[2];
                            const tail = actionMatch[3];
                            rest = `${target} has been ${verb}${tail ? ' ' + tail : ''}`;
                        } else if (actionMatch2) {
                            const target = actionMatch2[1];
                            const verb = actionMatch2[2].toLowerCase();
                            const tail = actionMatch2[3];
                            rest = `${target} has been ${verb}${tail ? ' ' + tail : ''}`;
                        } else {
                            if (rest.startsWith('**')) {
                                rest = '**' + rest.slice(2).charAt(0).toUpperCase() + rest.slice(3);
                            } else if (rest.startsWith('*')) {
                                rest = '*' + rest.slice(1).charAt(0).toUpperCase() + rest.slice(2);
                            } else if (rest.startsWith('_')) {
                                rest = '_' + rest.slice(1).charAt(0).toUpperCase() + rest.slice(2);
                            } else {
                                rest = rest.charAt(0).toUpperCase() + rest.slice(1);
                            }
                        }
                    }

                    container.addTextDisplayComponents(td => td.setContent(`### <:success:1526086221338771567> Success`));
                    container.addSeparatorComponents(new SeparatorBuilder());
                    container.addTextDisplayComponents(td => td.setContent(rest));
                } else {
                    container.addTextDisplayComponents(td => td.setContent(description));
                }
            }
        }

        if (activeFields.length > 0) {
            // Container doesn't have native fields like embed, render as text/markdown
            // Maybe add a separator before fields
            container.addSeparatorComponents(sep => sep.setSpacing(SeparatorSpacingSize.Small));

            activeFields.forEach(field => {
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
