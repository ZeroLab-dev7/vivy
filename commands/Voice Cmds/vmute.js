const { PermissionsBitField, MessageFlags } = require("discord.js");
const UI = require('../../utils/ui');

module.exports = {
    name: "vmute",
    description: "Mute a user in the voice channel.",
    async execute(message, args) {
        // Ensure the user has the required permissions
        if (!message.member.permissions.has(PermissionsBitField.Flags.MuteMembers)) {
            return message.reply({
                components: [UI.createContainer({
                    description: '- <a:warn:1365688576758644797> You need the `Mute Members` permission to use this command.'
                })],
                flags: MessageFlags.IsComponentsV2
            });
        }

        // Ensure the bot has the required permissions
        if (!message.guild.members.me.permissions.has(PermissionsBitField.Flags.MuteMembers)) {
            return message.reply({
                components: [UI.createContainer({
                    description: '- <a:warn:1365688576758644797> I need the `Mute Members` permission to perform this action.'
                })],
                flags: MessageFlags.IsComponentsV2
            });
        }

        // Get the target user (mention or ID)
        let target;
        if (message.mentions.members.size) {
            target = message.mentions.members.first();
        } else if (args[0]) {
            target = message.guild.members.cache.get(args[0]);
        }

        if (!target) {
            return message.reply({
                components: [UI.createContainer({
                    title: "Command: vmute",
                    description: "Mute a user in a voice channel.",
                    fields: [
                        { name: "Aliases:", value: "- vmute, voicemute", inline: false },
                        { name: "Usage:", value: "- ?vmute @user/id", inline: false },
                        { name: "Example:", value: `- ?vmute <@${message.author.id}>\n- ?vmute ${message.author.id}`, inline: false }
                    ],
                    footer: `Requested by ${message.author.tag}`
                })],
                flags: MessageFlags.IsComponentsV2
            });
        }

        // Check if the target user is in a voice channel
        if (!target.voice.channel) {
            return message.reply({
                components: [UI.createContainer({
                    description: `- <a:warn:1365688576758644797> ${target.user.tag} is not connected to a voice channel.`
                })],
                flags: MessageFlags.IsComponentsV2
            });
        }

        // Check if the user is already muted
        if (target.voice.serverMute) {
            return message.reply({
                components: [UI.createContainer({
                    description: `- <a:warn:1365688576758644797> ${target.user.tag} is already muted.`
                })],
                flags: MessageFlags.IsComponentsV2
            });
        }

        try {
            // Mute the user
            await target.voice.setMute(true);

            // Send a confirmation embed
            // Send a confirmation container
            const container = UI.createContainer({
                description: `- <a:done:1365447294819762266> Successfully muted **${target.user.tag}** in the voice channel.`
            });

            return message.reply({
                components: [container],
                flags: MessageFlags.IsComponentsV2
            });
        } catch (error) {
            console.error("Error muting user:", error);

            // Handle unexpected errors
            // Handle unexpected errors
            return message.reply({
                components: [UI.createContainer({
                    description: "- <a:warn:1365688576758644797> An error occurred while trying to mute the user."
                })],
                flags: MessageFlags.IsComponentsV2
            });
        }
    }
};
