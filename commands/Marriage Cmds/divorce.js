const { ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags } = require('discord.js');
const UI = require('../../utils/ui');
const fs = require('fs');
const path = './marriages.json';

const loadMarriageData = () => {
    if (fs.existsSync(path)) {
        return JSON.parse(fs.readFileSync(path, 'utf-8'));
    }
    return {};
};

const saveMarriageData = (data) => {
    fs.writeFileSync(path, JSON.stringify(data, null, 2), 'utf-8');
};

const cooldowns = new Map(); // Cooldown map for users
const COOLDOWN_TIME = 10000; // 10 seconds cooldown

module.exports = {
    name: 'divorce',
    description: 'Divorce from your partner.',
    async execute(message) {
        const userId = message.author.id;

        // Check for cooldown
        if (cooldowns.has(userId)) {
            return message.react('⏳'); // React with the hourglass emoji to indicate cooldown
        }

        // Set the cooldown for the user
        cooldowns.set(userId, Date.now() + COOLDOWN_TIME);
        setTimeout(() => cooldowns.delete(userId), COOLDOWN_TIME);

        const marriageData = loadMarriageData();

        if (!marriageData[userId]) {
            return message.reply({
                components: [UI.createContainer({
                    description: '- 💔 You are not married.'
                })],
                flags: MessageFlags.IsComponentsV2
            });
        }

        const partnerId = marriageData[userId].partner;
        const partnerUser = await message.client.users.fetch(partnerId);

        const confirmContainer = UI.createContainer({
            description: `- 💔  Are you sure you want to divorce **${partnerUser.username}** ?`
        });

        const buttons = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('confirm_divorce')
                .setLabel('Accept')
                .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
                .setCustomId('cancel_divorce')
                .setLabel('Cancel')
                .setStyle(ButtonStyle.Danger)
        );

        const disabledButtons = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('confirm_divorce')
                .setLabel('Accept')
                .setStyle(ButtonStyle.Success)
                .setDisabled(true),
            new ButtonBuilder()
                .setCustomId('cancel_divorce')
                .setLabel('Cancel')
                .setStyle(ButtonStyle.Danger)
                .setDisabled(true)
        );

        confirmContainer.addActionRowComponents(buttons);

        const reply = await message.reply({
            components: [confirmContainer],
            flags: MessageFlags.IsComponentsV2
        });

        const filter = (interaction) =>
            interaction.user.id === message.author.id;

        const collector = reply.createMessageComponentCollector({ filter, time: 15000 });

        collector.on('collect', (interaction) => {
            if (interaction.customId === 'confirm_divorce') {
                const parents = [userId, partnerId];
                if (marriageData[userId] && marriageData[userId].children) {
                    for (const child of marriageData[userId].children) {
                        if (marriageData[child.id]) {
                            marriageData[child.id].parents = (marriageData[child.id].parents || []).filter(p => !parents.includes(p));
                            if (marriageData[child.id].parents.length === 0) {
                                delete marriageData[child.id].parents;
                            }
                            if (!marriageData[child.id].partner && !marriageData[child.id].parents && (!marriageData[child.id].children || marriageData[child.id].children.length === 0)) {
                                delete marriageData[child.id];
                            }
                        }
                    }
                }

                if (marriageData[userId]) {
                    delete marriageData[userId].partner;
                    delete marriageData[userId].date;
                    delete marriageData[userId].children;
                }
                if (marriageData[partnerId]) {
                    delete marriageData[partnerId].partner;
                    delete marriageData[partnerId].date;
                    delete marriageData[partnerId].children;
                }

                if (marriageData[userId] && !marriageData[userId].partner && (!marriageData[userId].parents || marriageData[userId].parents.length === 0) && (!marriageData[userId].children || marriageData[userId].children.length === 0)) {
                    delete marriageData[userId];
                }
                if (marriageData[partnerId] && !marriageData[partnerId].partner && (!marriageData[partnerId].parents || marriageData[partnerId].parents.length === 0) && (!marriageData[partnerId].children || marriageData[partnerId].children.length === 0)) {
                    delete marriageData[partnerId];
                }
                saveMarriageData(marriageData);

                collector.stop('divorced');

                const divorceContainer = UI.createContainer({
                    description: `- 🖤 You have divorced **${partnerUser.username}**`
                });

                interaction.update({
                    components: [divorceContainer],
                    flags: MessageFlags.IsComponentsV2
                });
            } else {
                collector.stop('cancelled');

                const cancelContainer = UI.createContainer({
                    description: '- <:no:1526496561188831244>Divorce cancelled.'
                });

                interaction.update({
                    components: [cancelContainer],
                    flags: MessageFlags.IsComponentsV2
                });
            }
        });

        collector.on('end', (collected, reason) => {
            if (reason === 'time') {
                const timeoutContainer = UI.createContainer({
                    description: '-  It seems you changed your mind, next time think before making your decision.'
                });

                timeoutContainer.addActionRowComponents(disabledButtons);

                reply.edit({
                    components: [timeoutContainer],
                    flags: MessageFlags.IsComponentsV2
                }).catch(() => { });
            }
        });
    }
};
