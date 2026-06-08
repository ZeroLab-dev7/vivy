const { MessageFlags } = require('discord.js');
const UI = require('../../utils/ui');
const Emojis = require('../../utils/emojis');
const { MuteSetup } = require('../../db/models');
const { unmuteUser } = require('../../utils/muteManager');

module.exports = {
    name: 'unmute',
    description: 'Unmute a user',
    async execute(message, args) {
        try {
            const config = await MuteSetup.findOne({ where: { guild_id: message.guild.id } });
            if (!config) {
                return message.reply({
                    components: [UI.createContainer({ description: '- Mute system is not set up. Use `/setupmute` first.' })],
                    flags: MessageFlags.IsComponentsV2
                });
            }

            // Check permissions
            const staffRoles = JSON.parse(config.staff_roles || '[]');
            const isStaff = message.member.permissions.has('Administrator') ||
                message.member.roles.cache.some(role => staffRoles.includes(role.id));

            if (!isStaff) {
                return message.reply({
                    components: [UI.createContainer({ description: '- You do not have permission to use this command.' })],
                    flags: MessageFlags.IsComponentsV2
                });
            }

            if (args.length < 1) {
                return message.reply({
                    components: [UI.createContainer({
                        title: 'Command: Unmute',
                        description: 'Unmute a user.',
                        fields: [
                            { name: 'Usage:', value: `+unmute <@user/id/name>` }
                        ]
                    })],
                    flags: MessageFlags.IsComponentsV2
                });
            }

            // Get target user
            const userInput = args[0];
            let target;
            if (message.mentions.members.size > 0) {
                target = message.mentions.members.first();
            } else if (/^\d+$/.test(userInput)) {
                target = await message.guild.members.fetch(userInput).catch(() => null);
            } else {
                target = message.guild.members.cache.find(m => m.user.username.toLowerCase().includes(userInput.toLowerCase()));
            }

            if (!target) {
                return message.reply({
                    components: [UI.createContainer({ description: '- User not found.' })],
                    flags: MessageFlags.IsComponentsV2
                });
            }

            await unmuteUser(message.guild, target.id, message.author);

            const successEmbed = UI.createEmbed({
                type: 'success',
                description: `${Emojis.Anim.done} **${target.user.username}** has been unmuted.`
            });

            await message.channel.send({ embeds: [successEmbed] });

        } catch (error) {
            console.error('Unmute Command Error:', error);
            message.reply({
                components: [UI.createContainer({ description: '- An error occurred while trying to unmute the user.' })],
                flags: MessageFlags.IsComponentsV2
            });
        }
    }
};
