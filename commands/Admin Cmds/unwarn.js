const { PermissionFlagsBits, MessageFlags } = require('discord.js');
const WarnDB = require('../../db/warn-db');
const { Warning } = require('../../db/models');
const UI = require('../../utils/ui');
const Emojis = require('../../utils/emojis');

module.exports = {
    name: 'unwarn',
    aliases: ['uw'],
    usage: 'unwarn <@user/id>',
    description: '- Remove all warning roles from a user',
    async execute(message, args) {
        try {
            let target;
            if (message.mentions.members.size > 0) {
                target = message.mentions.members.first();
            } else if (args[0] && !isNaN(args[0])) {
                target = await message.guild.members.fetch(args[0]).catch(() => null);
            }

            if (!target) {
                return message.reply({
                    components: [UI.createContainer({
                        title: 'Command: unwarn',
                        footer: `Requested by ${message.author.tag}`,
                        fields: [
                            { name: "Examples:", value: `- ?unwarn <@${message.author.id}>` }
                        ]
                    })],
                    flags: MessageFlags.IsComponentsV2
                });
            }

            const roles = await WarnDB.getRoles(message.guild.id);
            if (!roles) {
                return message.reply({
                    components: [UI.createContainer({
                        description: `- ${Emojis.Anim.warn} Warning system is not set up in this server!`
                    })],
                    flags: MessageFlags.IsComponentsV2
                });
            }

            const parsedWarnerRoles = JSON.parse(roles.warner_role || '[]');
            const hasWarnerRole = parsedWarnerRoles.some(id => message.member.roles.cache.has(id));
            const hasManageRoles = message.member.permissions.has(PermissionFlagsBits.ManageRoles);

            if (!hasWarnerRole && !hasManageRoles) {
                return message.reply({
                    components: [UI.createContainer({
                        description: `- ${Emojis.Anim.warn} You need Manage Roles permission or Warner role to use this command!`
                    })],
                    flags: MessageFlags.IsComponentsV2
                });
            }

            const warningRoles = [
                roles.warn_first,
                roles.warn_second,
                roles.warn_last
            ].filter(Boolean);

            const removedRoles = [];
            for (const roleId of warningRoles) {
                const role = message.guild.roles.cache.get(roleId);
                if (role && target.roles.cache.has(roleId)) {
                    await target.roles.remove(role);
                    removedRoles.push(`\`<@&${roleId}>\``);
                }
            }

            if (removedRoles.length === 0) {
                return message.reply({
                    components: [UI.createContainer({
                        description: `- ${Emojis.Anim.warn} \`${target.user.username}\` doesn't have any warning roles!`
                    })],
                    flags: MessageFlags.IsComponentsV2
                });
            }

            // Clear warnings from database
            await Warning.destroy({
                where: {
                    guild_id: message.guild.id,
                    user_id: target.id
                }
            });

            const dmContainer = UI.createContainer({
                title: `${Emojis.Anim.done} Your Warnings Have Been Cleared`,
                description: `All your warning roles have been removed in **${message.guild.name}**.\n\nYou can now participate in the server without any restrictions from previous warnings.`
            });

            try {
                await target.send({
                    components: [dmContainer],
                    flags: MessageFlags.IsComponentsV2
                });
            } catch (error) {
                console.log(`Could not DM user ${target.user.tag}:`, error.message);
            }

            const successContainer = UI.createContainer({
                description: `- ${Emojis.Anim.done} Successfully removed all warning roles from \`${target.user.username}\`\n\n- Removed: ${removedRoles.join(', ')}`
            });
            await message.reply({
                components: [successContainer],
                flags: MessageFlags.IsComponentsV2
            });

            const logChannel = message.guild.channels.cache.get(roles.warning_logs);
            if (logChannel) {
                const logContainer = UI.createContainer({
                    title: 'Warnings Cleared',
                    // thumbnail: target.displayAvatarURL({ dynamic: true }),
                    description: `**User:** \`${target.user.username}\` (${target.id})\n**Warnings Cleared By:** \`${message.author.username}\` (${message.author.id})\n\n**Roles Removed:**\n${removedRoles.map(r => `- ${r}`).join('\n')}`,
                    footer: 'Warning System'
                });

                await logChannel.send({
                    components: [logContainer],
                    flags: MessageFlags.IsComponentsV2
                }).catch(() => { });
            }
        } catch (error) {
            console.error('Unwarn Command Error:', error);
            message.reply({
                components: [UI.createContainer({
                    description: `- ${Emojis.Anim.warn} An error occurred while clearing warnings.`
                })],
                flags: MessageFlags.IsComponentsV2
            });
        }
    },
};