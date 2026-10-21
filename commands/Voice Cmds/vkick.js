const { PermissionsBitField, MessageFlags } = require("discord.js");
const UI = require('../../utils/ui');

module.exports = {
    name: "vkick",
    aliases: ["voicekick", "vcreject"],
    description: "Kick a user from the voice channel.",
    async execute(message, args) {
        // Ensure the user has the required permissions
        if (!message.member.permissions.has(PermissionsBitField.Flags.KickMembers)) {
            return message.reply({
                components: [UI.createContainer({
                    description: '- <a:warn:1365688576758644797> You need the `Kick Members` permission to use this command.'
                })],
                flags: MessageFlags.IsComponentsV2
            });
        }

        // Ensure the bot has the required permissions
        if (!message.guild.members.me.permissions.has(PermissionsBitField.Flags.KickMembers)) {
            return message.reply({
                components: [UI.createContainer({
                    description: '- <a:warn:1365688576758644797> I need the `Kick Members` permission to perform this action.'
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
                    title: "Command: voicekick",
                    description: "Kick a user from a voice channel.",
                    fields: [
                        { name: "Aliases:", value: "- voicekick, vkick, vcreject", inline: false },
                        { name: "Usage:", value: "- ?vkick @user/id", inline: false },
                        { name: "Example:", value: `- ?vkick <@${message.author.id}>\n- ?vkick ${message.author.id}`, inline: false }
                    ],
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

        // Ensure the bot's role is higher than the target's role
        if (target.roles.highest.position >= message.guild.members.me.roles.highest.position) {
            return message.reply({
                components: [UI.createContainer({
                    description: "- <a:warn:1365688576758644797> I cannot kick this user as their role is higher or equal to mine."
                })],
                flags: MessageFlags.IsComponentsV2
            });
        }

        try {
            // Disconnect the user from the voice channel
            await target.voice.disconnect();

            // Send a confirmation embed
            return message.reply({
                components: [UI.createContainer({
                    description: `- <a:done:1365447294819762266> Successfully kicked **${target.user.tag}** from the voice channel.`
                })],
                flags: MessageFlags.IsComponentsV2
            });
        } catch (error) {
            console.error("Error kicking user from voice channel:", error);

            // Handle unexpected errors
            return message.reply({
                components: [UI.createContainer({
                    description: "- <a:warn:1365688576758644797> An error occurred while trying to kick the user from the voice channel."
                })],
                flags: MessageFlags.IsComponentsV2
            });
        }
    }
};
