const { MessageFlags } = require('discord.js');
const UI = require('../../utils/ui');

module.exports = {
    name: 'find',
    description: 'Finds a user in a voice channel and displays relevant information.',
    async execute(message, args) {
        let user;

        // Check if a mention is provided or an ID is given in the arguments
        if (message.mentions.users.size > 0) {
            user = message.mentions.users.first();
        } else if (args.length > 0) {
            // If an ID is provided, try to find the user by ID
            user = await message.client.users.fetch(args[0]).catch(() => null);
        } else {
            // If no ID or mention is provided, use the message author (the command user)
            user = message.author;
        }

        if (!user) {
            return message.channel.send({
                components: [UI.createContainer({
                    description: '- <a:warn:1365688576758644797> Please mention a user to find in a voice channel.'
                })],
                flags: MessageFlags.IsComponentsV2
            });
        }

        // Check if the user is trying to find themselves
        if (user.id === message.author.id) {
            return message.channel.send({
                components: [UI.createContainer({
                    description: "- <a:warn:1365688576758644797> You can't find yourself!"
                })],
                flags: MessageFlags.IsComponentsV2
            });
        }

        const member = await message.guild.members.fetch(user.id);
        let container;
        if (member.voice.channel) {
            const voiceChannel = member.voice.channel;

            container = UI.createContainer({
                title: `Voice Find: ${voiceChannel.name}`,
                url: "https://discord.gg/pe22x24tJu",
                fields: [
                    { name: '<a:voice:1366765217761071134> **Voice Check:**', value: `<#${voiceChannel.id}>`, inline: true },
                    { name: '<a:voice:1366765217761071134> **Voice Name:**', value: `${voiceChannel.name}`, inline: true }
                ],
                footer: `${user.tag}`
            });
        } else {
            container = UI.createContainer({
                description: `- ${user.tag} is not connected to any voice channel.`
            });
        }

        await message.channel.send({
            components: [container],
            flags: MessageFlags.IsComponentsV2
        });
    },
};
