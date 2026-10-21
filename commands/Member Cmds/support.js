const { MessageFlags, ActionRowBuilder, ButtonBuilder, ButtonStyle, SeparatorSpacingSize } = require('discord.js');
const UI = require('../../utils/ui');

const cooldowns = new Map();
const COOLDOWN_TIME = 5000; // 5 seconds cooldown

module.exports = {
    name: 'support',
    aliases: ['supportserver', 'help-server'],
    description: 'Get a link to Vivy\'s support server and dashboard.',
    async execute(message) {
        if (cooldowns.has(message.author.id)) {
            return message.react('⏳');
        }

        cooldowns.set(message.author.id, Date.now() + COOLDOWN_TIME);
        setTimeout(() => cooldowns.delete(message.author.id), COOLDOWN_TIME);

        const supportServerLink = "https://discord.gg/YcF9Q3ntqb";
        const botInviteLink = `https://discord.com/api/oauth2/authorize?client_id=${message.client.user.id}&permissions=8&scope=bot%20applications.commands`;

        const container = UI.createContainer({
            title: '<:vivy:1510334908562804856> Vivy Server Support',
            description: 'Need help with Vivy? Join our support server to connect with our developers, get assistance, report bugs, and suggest new features!',
            fields: [
                {
                    name: '<a:support:1526444196670607461> Support Resources',
                    value: '• **Web Dashboard:** Access [vivy.pro](https://vivy.pro) to configure the bot in real-time.\n• **Help Command:** Type `?help` to see the full list of commands.\n• **Discord Support:** Join our Discord server to get help from our active staff members.'
                }
            ]
        });

        const buttonsRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setLabel('Support Server')
                .setURL(supportServerLink)
                .setStyle(ButtonStyle.Link)
                .setEmoji('<:f8758e903b5948a18f78d804b3f96a6b:1533119428978282716>'),
            new ButtonBuilder()
                .setLabel('Invite Bot')
                .setURL(botInviteLink)
                .setStyle(ButtonStyle.Link)
                .setEmoji('<:vivy:1510334908562804856>'),
            new ButtonBuilder()
                .setLabel('Vivy Dashboard')
                .setURL('https://vivy.pro')
                .setStyle(ButtonStyle.Link)
                .setEmoji('<a:vivyrun:1522764241197863124>')
        );

        container.addSeparatorComponents(sep => sep.setSpacing(SeparatorSpacingSize.Small));
        container.addActionRowComponents(buttonsRow);

        message.reply({
            components: [container],
            flags: MessageFlags.IsComponentsV2
        });
    }
};
