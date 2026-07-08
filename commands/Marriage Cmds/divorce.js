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

        const reply = await message.reply({
            components: [confirmContainer, buttons],
            flags: MessageFlags.IsComponentsV2
        });

        const filter = (interaction) =>
            interaction.user.id === message.author.id;

        const collector = reply.createMessageComponentCollector({ filter, time: 15000 });

        collector.on('collect', (interaction) => {
            if (interaction.customId === 'confirm_divorce') {
                delete marriageData[userId];
                delete marriageData[partnerId];
                saveMarriageData(marriageData);

                const divorceContainer = UI.createContainer({
                    description: `- 🖤 You have divorced **${partnerUser.username}**`
                });

                interaction.update({
                    components: [divorceContainer],
                    flags: MessageFlags.IsComponentsV2
                });
            } else {
                const cancelContainer = UI.createContainer({
                    description: '- ❌ Divorce cancelled.'
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

                reply.edit({
                    components: [timeoutContainer, disabledButtons],
                    flags: MessageFlags.IsComponentsV2
                });
            }
        });
    }
};
