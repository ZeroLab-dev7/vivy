const { MessageFlags } = require('discord.js');
const UI = require('../../utils/ui');
const Emojis = require('../../utils/emojis');
const { MuteSetup } = require('../../db/models');
const { parseDuration, muteUser, formatMs } = require('../../utils/muteManager');

module.exports = {
    name: 'mute',
    description: 'Mute a user for a specified duration',
    async execute(message, args) {
        try {
            const config = await MuteSetup.findOne({ where: { guild_id: message.guild.id } });
            if (!config) {
                return message.reply({
                    components: [UI.createContainer({ description: '- Mute system is not set up. Use `/setupmute` first.' })],
                    flags: MessageFlags.IsComponentsV2
                });
            }

            // Check permissions (Administrator or configured staff roles)
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
                        title: 'Command: Mute',
                        description: 'Mute a user for a specific time.',
                        fields: [
                            { name: 'Usage:', value: `?mute <@user/id/name> [time] [reason]` },
                            { name: 'Examples:', value: `- ?mute @user 1h spam\n- ?mute @user 30m\n- ?mute @user` }
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

            // Duration and Reason
            let durationMs = null;
            let reason = 'No reason provided.';

            if (args.length >= 2) {
                durationMs = parseDuration(args[1]);
                if (durationMs) {
                    reason = args.slice(2).join(' ') || reason;
                } else {
                    // If second arg is not a duration, assume it's the start of the reason
                    reason = args.slice(1).join(' ');
                }
            }

            // Logic to prevent muting higher roles or self
            if (target.id === message.author.id) {
                return message.reply({
                    components: [UI.createContainer({ description: '- You cannot mute yourself.' })],
                    flags: MessageFlags.IsComponentsV2
                });
            }
            if (target.roles.highest.position >= message.member.roles.highest.position && message.author.id !== message.guild.ownerId) {
                return message.reply({
                    components: [UI.createContainer({ description: '- You cannot mute someone with a higher or equal role.' })],
                    flags: MessageFlags.IsComponentsV2
                });
            }

            await muteUser(message.guild, target, message.author, durationMs, reason);

            const successEmbed = UI.createEmbed({
                type: 'success',
                description: `${Emojis.Anim.done} **${target.user.username}** has been muted for **${durationMs ? formatMs(durationMs) : 'Permanent'}**.\n**Reason:** ${reason}`
            });

            await message.channel.send({ embeds: [successEmbed] });

        } catch (error) {
            console.error('Mute Command Error:', error);
            message.reply({
                components: [UI.createContainer({ description: '- An error occurred while trying to mute the user.' })],
                flags: MessageFlags.IsComponentsV2
            });
        }
    }
};
