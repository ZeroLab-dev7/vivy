const { SlashCommandBuilder, MessageFlags, ButtonBuilder, ButtonStyle, ActionRowBuilder, SeparatorSpacingSize } = require('discord.js');
const UI = require('../../utils/ui');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('dashboard')
        .setDescription('Displays information about the Vivy web dashboard and how to use it.'),
    async execute(interaction) {
        // Defer reply so we can load/handle potential lag or collectors
        await interaction.deferReply();

        const getOverviewContainer = () => {
            const container = UI.createContainer({
                title: '<:vivy:1510334908562804856> Vivy Web Dashboard Overview',
                description: 'Vivy features a powerful web dashboard to configure and manage your server easily in real-time.',
                fields: [
                    {
                        name: '<a:vivyrun:1522764241197863124> Features Available',
                        value: '• **Security & AutoMod:** Set up anti-link, anti-bot, anti-webhook, and warning thresholds.\n• **Verification & Applications:** Customize verification gates and staff applications.\n• **Advanced Moderation:** Configure automated mutes, custom jail rooms, and warnings.\n• **System Logging:** Track deleted messages, edits, invites, and voice channels.'
                    }
                ]
            });

            const buttonsRow = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setLabel('Open Dashboard')
                    .setURL('https://vivy.zerolab.best/')
                    .setStyle(ButtonStyle.Link)
                    .setEmoji('<:vivy:1510334908562804856>'),
                new ButtonBuilder()
                    .setLabel('Support Server')
                    .setURL('https://discord.gg/YcF9Q3ntqb')
                    .setStyle(ButtonStyle.Link)
                    .setEmoji('<:zerolab:1481778588456980543>'),
                new ButtonBuilder()
                    .setCustomId('slash_dash_next')
                    .setLabel('How to Use')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('<a:warrr:1327310170661064775>')
            );

            container.addSeparatorComponents(sep => sep.setSpacing(SeparatorSpacingSize.Small));
            container.addActionRowComponents(buttonsRow);
            return container;
        };

        const getStepsContainer = () => {
            const container = UI.createContainer({
                title: '<:vivy:1510334908562804856> Dashboard Guide & Steps',
                description: 'Follow these simple steps to start using the Vivy Web Dashboard:',
                fields: [
                    {
                        name: '<a:one:1522764802764705914> Step 1: Visit & Login',
                        value: 'Go to [vivy.zerolab.best](https://vivy.zerolab.best/) and click **Login** in the top-right corner to authorize the dashboard with your Discord account.'
                    },
                    {
                        name: '<a:two:1522764857105973328> Step 2: Select Server',
                        value: 'Choose your server from the list. *Note: You must have **Manage Server** or **Administrator** permission in that server.*'
                    },
                    {
                        name: '<a:three:1522764996524638341> Step 3: Configure Settings',
                        value: 'Navigate through the dashboard tabs (Welcome settings, AutoMod, Logging, etc.) to customize Vivy.'
                    },
                    {
                        name: '<a:four:1522765079945416864> Step 4: Save & Apply',
                        value: 'Click **Save Settings** to immediately apply the configurations directly to your Discord server.'
                    }
                ]
            });

            const buttonsRow = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('slash_dash_back')
                    .setLabel('Overview')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('⬅️'),
                new ButtonBuilder()
                    .setLabel('Open Dashboard')
                    .setURL('https://vivy.zerolab.best/')
                    .setStyle(ButtonStyle.Link)
                    .setEmoji('<:vivy:1510334908562804856>'),
                new ButtonBuilder()
                    .setLabel('Support Server')
                    .setURL('https://discord.gg/YcF9Q3ntqb')
                    .setStyle(ButtonStyle.Link)
                    .setEmoji('<:zerolab:1481778588456980543>')
            );

            container.addSeparatorComponents(sep => sep.setSpacing(SeparatorSpacingSize.Small));
            container.addActionRowComponents(buttonsRow);
            return container;
        };

        try {
            const reply = await interaction.editReply({
                components: [getOverviewContainer()],
                flags: MessageFlags.IsComponentsV2
            });

            const filter = (i) => i.user.id === interaction.user.id;
            const collector = reply.createMessageComponentCollector({
                filter,
                time: 60000 // 1 minute
            });

            collector.on('collect', async (i) => {
                try {
                    if (i.customId === 'slash_dash_next') {
                        await i.update({
                            components: [getStepsContainer()],
                            flags: MessageFlags.IsComponentsV2
                        });
                    } else if (i.customId === 'slash_dash_back') {
                        await i.update({
                            components: [getOverviewContainer()],
                            flags: MessageFlags.IsComponentsV2
                        });
                    }
                } catch (error) {
                    console.error('Error in dashboard slash command collector:', error);
                }
            });

            collector.on('end', async () => {
                try {
                    // Disable custom interactive buttons on timeout
                    const finalContainer = UI.createContainer({
                        title: '<:vivy:1510334908562804856> Vivy Web Dashboard Overview',
                        description: 'Vivy features a powerful web dashboard to configure and manage your server easily in real-time.',
                        fields: [
                            {
                                name: '<a:vivyrun:1522764241197863124> Features Available',
                                value: '• **Security & AutoMod:** Set up anti-link, anti-bot, anti-webhook, and warning thresholds.\n• **Verification & Applications:** Customize verification gates and staff applications.\n• **Advanced Moderation:** Configure automated mutes, custom jail rooms, and warnings.\n• **System Logging:** Track deleted messages, edits, invites, and voice channels.'
                            }
                        ]
                    });

                    const disabledRow = new ActionRowBuilder().addComponents(
                        new ButtonBuilder()
                            .setLabel('Open Dashboard')
                            .setURL('https://vivy.zerolab.best/')
                            .setStyle(ButtonStyle.Link)
                            .setEmoji('<:vivy:1510334908562804856>'),
                        new ButtonBuilder()
                            .setLabel('Support Server')
                            .setURL('https://discord.gg/YcF9Q3ntqb')
                            .setStyle(ButtonStyle.Link)
                            .setEmoji('<:zerolab:1481778588456980543>')
                    );
                    finalContainer.addSeparatorComponents(sep => sep.setSpacing(SeparatorSpacingSize.Small));
                    finalContainer.addActionRowComponents(disabledRow);

                    await interaction.editReply({
                        components: [finalContainer],
                        flags: MessageFlags.IsComponentsV2
                    }).catch(() => {});
                } catch (err) {}
            });

        } catch (error) {
            console.error('Error executing dashboard slash command:', error);
        }
    }
};
