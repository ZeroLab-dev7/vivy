const { ContainerBuilder, SectionBuilder, SeparatorBuilder, ButtonBuilder, ButtonStyle, MessageFlags, TextDisplayBuilder } = require('discord.js');

class UIManager {
    static ACCENTS = {
        CYAN: 0x00FFFF,
        INDIGO: 0x6366F1,
        EMERALD: 0x10B981,
        AMBER: 0xF59E0B,
        ROSE: 0xF43F5E,
        DARK: 0x0F172A
    };

    /**
     * Create a standard Dark Minimal Premium Container V2
     */
    static createContainer({ title, accentColor = this.ACCENTS.CYAN }) {
        const container = new ContainerBuilder();
        container.setAccentColor(accentColor);

        if (title) {
            container.addTextDisplayComponents(td => td.setContent(`# ${title}`));
            container.addSeparatorComponents(new SeparatorBuilder());
        }

        return container;
    }

    /**
     * Create a section with a text title/body and button accessory
     */
    static createSection({ title, content, buttonLabel, buttonId, buttonStyle = ButtonStyle.Secondary, disabled = true }) {
        const section = new SectionBuilder();
        const fullText = title && content ? `**${title}**\n${content}` : (title || content || '');
        if (fullText) {
            section.addTextDisplayComponents(td => td.setContent(fullText));
        }
        if (buttonLabel && buttonId) {
            const btn = new ButtonBuilder()
                .setCustomId(buttonId)
                .setLabel(buttonLabel)
                .setStyle(buttonStyle)
                .setDisabled(disabled);
            section.setButtonAccessory(btn);
        }
        return section;
    }

    /**
     * Add multiple sections to a container with SeparatorBuilder between each section
     */
    static addSections(container, sections) {
        sections.forEach((section, index) => {
            container.addSectionComponents(section);
            if (index < sections.length - 1) {
                container.addSeparatorComponents(new SeparatorBuilder());
            }
        });
    }

    /**
     * Response payload with IsComponentsV2 flag
     */
    static toResponse(container, ephemeral = false) {
        const payload = {
            components: [container],
            flags: MessageFlags.IsComponentsV2
        };
        if (ephemeral) {
            payload.flags |= MessageFlags.Ephemeral;
        }
        return payload;
    }
}

module.exports = UIManager;
