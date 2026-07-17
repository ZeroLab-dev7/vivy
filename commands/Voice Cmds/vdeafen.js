const { PermissionsBitField, MessageFlags } = require('discord.js');
const UI = require('../../utils/ui');

module.exports = {
    name: 'vdeafen',
    description: 'Deafen a user in the server.',
    async execute(message, args) {
        // Check if the user has the required permission
        if (!message.member.permissions.has(PermissionsBitField.Flags.DeafenMembers)) {
            return message.reply({
                components: [UI.createContainer({
                    description: '- <a:warn:1365688576758644797> You need the `Deafen Members` permission to use this command.'
                })],
                flags: MessageFlags.IsComponentsV2
            });
        }

        // Check if the bot has the required permission
        if (!message.guild.members.me.permissions.has(PermissionsBitField.Flags.DeafenMembers)) {
            return message.reply({
                components: [UI.createContainer({
                    description: '- <a:warn:1365688576758644797> I need the `Deafen Members` permission to perform this action.'
                })],
                flags: MessageFlags.IsComponentsV2
            });
        }

        // Get the target user (mention or ID)
        const user = message.mentions.members.first() || message.guild.members.cache.get(args[0]);

        if (!user) {
            return message.reply({
                components: [UI.createContainer({
                    title: 'Command: vdeafen',
                    description: 'Deafen a user in a voice channel.',
                    fields: [
                        { name: "Aliases:", value: "- vdeafen", inline: false },
                        { name: 'Usage:', value: '- ?vdeafen @user/id', inline: false },
                        { name: 'Example:', value: `- ?vdeafen <@${message.author.id}>\n- ?vdeafen ${message.author.id} `, inline: false }
                    ],
                })],
                flags: MessageFlags.IsComponentsV2
            });
        }

        // Check if the user is connected to a voice channel
        if (!user.voice.channel) {
            return message.reply({
                components: [UI.createContainer({
                    description: `- <a:warn:1365688576758644797> ${user.user.tag} is not connected to a voice channel.`
                })],
                flags: MessageFlags.IsComponentsV2
            });
        }

        // Check if the user is already deafened
        if (user.voice.serverDeaf) {
            return message.reply({
                components: [UI.createContainer({
                    description: `- <a:warn:1365688576758644797> ${user.user.tag} is already deafened.`
                })],
                flags: MessageFlags.IsComponentsV2
            });
        }

        try {
            // Deafen the user
            await user.voice.setDeaf(true);

            // Confirmation embed
            // Confirmation container
            const container = UI.createContainer({
                description: `- <a:done:1365447294819762266> Successfully deafened ${user.user.tag}.`
            });

            return message.reply({
                components: [container],
                flags: MessageFlags.IsComponentsV2
            });
        } catch (error) {
            console.error('Error deafening user:', error);

            // Error handling
            // Error handling
            const errorContainer = UI.createContainer({
                description: '- <a:warn:1365688576758644797> Failed to deafen the user. Possible reasons:\n- The user is not in a voice channel.\n- The bot lacks sufficient permissions.'
            });

            return message.reply({
                components: [errorContainer],
                flags: MessageFlags.IsComponentsV2
            });
        }
    }
};
