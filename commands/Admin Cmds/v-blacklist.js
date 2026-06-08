const { PermissionFlagsBits, MessageFlags } = require("discord.js");
const UI = require('../../utils/ui');
const { VerificationRoles, VerificationBlacklist, GuildSettings } = require("../../db/models");

module.exports = {
    name: "v-blacklist",
    aliases: ['vbl', 'verification-blacklist'],
    usage: "v-blacklist <add|remove|list> [user] [reason]",
    description: "Manage the verification blacklist with ownership protection",
    async execute(message, args) {
        try {
            const sub = args[0]?.toLowerCase();

            if (!sub || !['add', 'remove', 'list'].includes(sub)) {
                return message.reply({
                    components: [UI.createContainer({
                        title: 'Verification Blacklist Help',
                        fields: [
                            { name: "Usage:", value: "- &v-blacklist add <user/id> [reason]\n- &v-blacklist remove <user/id>\n- &v-blacklist list" }
                        ]
                    })],
                    flags: MessageFlags.IsComponentsV2
                });
            }

            const rolesData = await VerificationRoles.findByPk(message.guild.id);
            if (!rolesData) {
                return message.reply({
                    components: [UI.createContainer({ description: "- Verification system is not set up!" })],
                    flags: MessageFlags.IsComponentsV2
                });
            }

            const hasVerificatorRole = message.member.roles.cache.has(rolesData.verificator_role);
            const hasManageRoles = message.member.permissions.has(PermissionFlagsBits.ManageRoles);

            if (!hasVerificatorRole && !hasManageRoles) {
                return message.reply({
                    components: [UI.createContainer({ description: "- You don't have permission to manage the verification blacklist!" })],
                    flags: MessageFlags.IsComponentsV2
                });
            }

            if (sub === 'add') {
                const target = message.mentions.users.first() || await message.client.users.fetch(args[1]).catch(() => null);
                if (!target) return message.reply("Please provide a valid user or ID.");

                const reason = args.slice(2).join(' ') || "No reason provided";

                const requestChannelId = '1463224267540922601';
                const requestChannel = message.guild.channels.cache.get(requestChannelId);

                if (!requestChannel) {
                    return message.reply(`- ❌ Could not find the blacklist request channel (<#${requestChannelId}>). Please check the ID.`);
                }

                const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

                const row = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId(`vbl_accept_${target.id}_${message.author.id}`)
                        .setLabel('Accept')
                        .setStyle(ButtonStyle.Success),
                    new ButtonBuilder()
                        .setCustomId(`vbl_refuse_${target.id}_${message.author.id}`)
                        .setLabel('Refuse')
                        .setStyle(ButtonStyle.Danger)
                );

                await requestChannel.send({
                    components: [UI.createContainer({
                        title: 'Blacklist Request',
                        description: `**Target:** ${target.username} (\`${target.id}\`)\n**Reason:** ${reason}\n**Requested By:** ${message.author.username}`
                    }), row],
                    flags: MessageFlags.IsComponentsV2
                });

                return message.reply({
                    components: [UI.createContainer({
                        description: `- ✅ Your blacklist request for \`${target.tag}\` has been sent to <#${requestChannelId}> for owner approval.`
                    })],
                    flags: MessageFlags.IsComponentsV2
                });

            } else if (sub === 'remove') {
                const target = message.mentions.users.first() || await message.client.users.fetch(args[1]).catch(() => null);
                if (!target) return message.reply("Please provide a valid user or ID.");

                const entry = await VerificationBlacklist.findOne({
                    where: { guild_id: message.guild.id, user_id: target.id }
                });

                if (!entry) return message.reply("That user is not blacklisted.");

                const settings = await GuildSettings.findOne({ where: { guild_id: message.guild.id } });
                const ownerRoles = settings?.owner_role_id?.split(',') || [];
                const isOwner = message.member.roles.cache.some(r => ownerRoles.includes(r.id)) ||
                    message.member.permissions.has(PermissionFlagsBits.Administrator);

                // OWNERSHIP CHECK: Only the original verificator, an Owner, or an Admin can remove
                if (entry.verificator_id !== message.author.id && !isOwner) {
                    return message.reply({
                        components: [UI.createContainer({
                            description: `- ❌ Only the person who blacklisted this user (\`${entry.verificator_id}\`), an **Owner**, or an **Administrator** can remove them from the blacklist!`
                        })],
                        flags: MessageFlags.IsComponentsV2
                    });
                }

                await entry.destroy();

                return message.reply({
                    components: [UI.createContainer({
                        description: `- ✅ \`${target.tag}\` has been removed from the verification blacklist.`
                    })],
                    flags: MessageFlags.IsComponentsV2
                });

            } else if (sub === 'list') {
                const list = await VerificationBlacklist.findAll({ where: { guild_id: message.guild.id } });
                if (list.length === 0) return message.reply("The verification blacklist is empty.");

                const content = list.map(e => `- User ID: \`${e.user_id}\` | By ID: \`${e.verificator_id}\``).join('\n');

                return message.reply({
                    components: [UI.createContainer({
                        title: 'Verification Blacklist',
                        description: content
                    })],
                    flags: MessageFlags.IsComponentsV2
                });
            }

        } catch (error) {
            console.error("v-blacklist error:", error);
            message.reply("- An error occurred while managing the blacklist.");
        }
    }
};
