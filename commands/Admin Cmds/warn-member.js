const { PermissionFlagsBits, MessageFlags } = require('discord.js');
const WarnDB = require('../../db/warn-db');
const { Warning } = require('../../db/models');
const UI = require('../../utils/ui');
const Emojis = require('../../utils/emojis');

module.exports = {
    name: 'warn',
    aliases: ['w'],
    usage: 'warn <@user/id> [reason]',
    description: '- Warn a user automatically to the next level',
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
                        title: 'Command: warn',
                        description: "Warn a user from the server.",
                        fields: [
                            { name: "Usage:", value: "- ?warn @user/id [reason]" },
                            { name: "Examples:", value: `- ?warn <@${message.author.id}> [reason]\n- ?warn ${message.author.id} [reason] ` }
                        ]
                    })],
                    flags: MessageFlags.IsComponentsV2
                });
            }

            const reason = args.slice(1).join(' ');
            if (!reason) {
                return message.reply({
                    components: [UI.createContainer({
                        description: `- ${Emojis.Anim.warn} You must provide a reason for this warning.`
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

            // Determine warning level from database count
            const warnCount = await Warning.count({
                where: {
                    guild_id: message.guild.id,
                    user_id: target.id
                }
            });

            if (warnCount >= 3) {
                return message.reply({
                    components: [UI.createContainer({
                        description: `- ${Emojis.Anim.warn} \`${target.user.username}\` is already at the maximum warning level (3)!`
                    })],
                    flags: MessageFlags.IsComponentsV2
                });
            }

            const warnLevel = warnCount + 1;
            let warnRole;
            let rolesToRemove = [roles.warn_first, roles.warn_second, roles.warn_last].filter(Boolean);

            if (warnLevel === 1) {
                warnRole = message.guild.roles.cache.get(roles.warn_first);
            } else if (warnLevel === 2) {
                warnRole = message.guild.roles.cache.get(roles.warn_second);
            } else if (warnLevel === 3) {
                warnRole = message.guild.roles.cache.get(roles.warn_last);
            }

            if (!warnRole) {
                return message.reply({
                    components: [UI.createContainer({
                        description: `${Emojis.Anim.warn} The warning role for level ${warnLevel} is missing. Please check the setup!`
                    })],
                    flags: MessageFlags.IsComponentsV2
                });
            }

            // Remove all previous warning roles to ensure sync
            for (const roleId of rolesToRemove) {
                if (target.roles.cache.has(roleId)) {
                    const roleToRemove = message.guild.roles.cache.get(roleId);
                    if (roleToRemove) {
                        await target.roles.remove(roleToRemove).catch(() => { });
                    }
                }
            }

            // Add the new warning role
            await target.roles.add(warnRole).catch(err => {
                console.error('Failed to add warn role:', err);
            });

            // Create warning record AFTER role changes to ensure count is accurate for next time
            await Warning.create({
                guild_id: message.guild.id,
                user_id: target.id,
                moderator_id: message.author.id,
                reason: reason
            });

            const dmContainer = UI.createContainer({
                title: `${Emojis.Anim.warn} You Have Been Warned`,
                description: `You have been issued a **${warnLevel === 1 ? 'First' : warnLevel === 2 ? 'Second' : 'Last'} Warning** in **${message.guild.name}**.\n\n**Reason:** ${reason}\n\nPlease adhere to the server rules to avoid further action.`
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
                description: `- ${Emojis.Anim.done} Successfully warned \`${target.user.username}\` at level **${warnLevel}**.\n\n- Added: \`<@&${warnRole.id}>\`\n**Reason:** ${reason}`
            });
            await message.reply({
                components: [successContainer],
                flags: MessageFlags.IsComponentsV2
            });

            const logChannel = message.guild.channels.cache.get(roles.warning_logs);
            if (logChannel) {
                const logContainer = UI.createContainer({
                    title: 'Warning Log',
                    // thumbnail: target.displayAvatarURL({ dynamic: true }),
                    description: `**User:** \`${target.user.username}\` (${target.id})\n**Warned By:** \`${message.author.username}\` (${message.author.id})\n**Warning Level:** ${warnLevel}\n**Reason:** ${reason}\n\n**Role Modified:**\n- Added: \`<@&${warnRole.id}>\``,
                    footer: 'Warning System'
                });

                await logChannel.send({
                    components: [logContainer],
                    flags: MessageFlags.IsComponentsV2
                }).catch(() => { });
            }
        } catch (error) {
            console.error('Warn Command Error:', error);
            message.reply({
                components: [UI.createContainer({
                    description: `- ${Emojis.Anim.warn} An error occurred while issuing the warning.`
                })],
                flags: MessageFlags.IsComponentsV2
            });
        }
    },
};
