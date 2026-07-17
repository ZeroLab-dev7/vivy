const { PermissionFlagsBits, MessageFlags } = require('discord.js');
const WarnDB = require('../../db/warn-db');
const { Warning } = require('../../db/models');
const UI = require('../../utils/ui');
const Emojis = require('../../utils/emojis');

module.exports = {
    name: 'warnlist',
    aliases: ['warnings'],
    usage: 'warnlist <@user/id>',
    description: '- View all warnings for a user',
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
                        title: 'Command: warnlist',
                        description: "View a user's warning history.",
                        fields: [
                            { name: "Usage:", value: "- ?warnlist @user/id" },
                            { name: "Examples:", value: `- ?warnlist <@${message.author.id}>\n- ?warnlist ${message.author.id}` }
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

            const warnings = await Warning.findAll({
                where: {
                    guild_id: message.guild.id,
                    user_id: target.id
                },
                order: [['createdAt', 'DESC']],
                limit: 10 // Prevent embed from getting too large
            });

            if (warnings.length === 0) {
                return message.reply({
                    components: [UI.createContainer({
                        description: `- ${Emojis.Anim.done} \`${target.user.username}\` currently has **0** warnings.`
                    })],
                    flags: MessageFlags.IsComponentsV2
                });
            }

            const totalWarnings = await Warning.count({
                where: {
                    guild_id: message.guild.id,
                    user_id: target.id
                }
            });

            const warningFields = warnings.map((warn, index) => {
                return {
                    name: `Warning #${totalWarnings - index}`,
                    value: `**Moderator:** <@${warn.moderator_id}>\n**Reason:** ${warn.reason}\n**Date:** <t:${Math.floor(new Date(warn.timestamp || warn.createdAt).getTime() / 1000)}:f>`
                };
            });

            const listContainer = UI.createContainer({
                title: `Warnings for ${target.user.username}`,
                description: `**Total Warnings:** ${totalWarnings}`,
                fields: warningFields,
            });

            await message.reply({
                components: [listContainer],
                flags: MessageFlags.IsComponentsV2
            });

        } catch (error) {
            console.error('Warnlist Command Error:', error);
            message.reply({
                components: [UI.createContainer({
                    description: `- ${Emojis.Anim.warn} An error occurred while retrieving warnings.`
                })],
                flags: MessageFlags.IsComponentsV2
            });
        }
    },
};
