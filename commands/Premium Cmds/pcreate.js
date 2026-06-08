const { PermissionsBitField, ChannelType, MessageFlags } = require("discord.js");
const { PremiumSetup, PremiumPlan } = require("../../db/models");
const UI = require("../../utils/ui");

module.exports = {
    name: "pcreate",
    description: "Create a premium plan for a user",
    async execute(message, args) {
        try {
            // 1. Check Permissions (Manager Role)
            const settings = await PremiumSetup.findByPk(message.guild.id);
            if (!settings || !settings.manager_role_id) {
                return message.reply({
                    components: [UI.createContainer({
                        color: 0xFF0000,
                        description: "❌ **Premium system is not set up.**\nRun `/setup-premium` first."
                    })],
                    flags: MessageFlags.IsComponentsV2
                });
            }

            let parsedManagerRoles = [];
            try {
                const parsed = JSON.parse(settings.manager_role_id || '[]');
                parsedManagerRoles = Array.isArray(parsed) ? parsed : [parsed].filter(Boolean);
            } catch (e) {
                if (settings.manager_role_id) parsedManagerRoles = [settings.manager_role_id];
            }

            const hasManagerRole = parsedManagerRoles.some(id => message.member.roles.cache.has(id));
            if (!hasManagerRole && !message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
                return message.reply({
                    components: [UI.createContainer({
                        color: 0xFF0000,
                        description: "❌ **Access Denied**\nYou do not have permission to use this command."
                    })],
                    flags: MessageFlags.IsComponentsV2
                });
            }

            // check hierarchy 
            if (message.guild.members.me.roles.highest.position <= message.member.roles.highest.position && message.author.id !== message.guild.ownerId) {
                // not strictly necessary for creation but good for safety
            }

            // 2. Parse Arguments: &pcreate <name> <user_id/mention>
            if (args.length < 2) {
                return message.reply({
                    components: [UI.createContainer({
                        title: "Command: pcreate",
                        description: "Create a premium plan for a specific user.",
                        fields: [
                            { name: "Usage", value: `\`&pcreate <plan name> <user_id/mention>\`` },
                            { name: "Example", value: `\`&pcreate OG Plan 1234567890\`` }
                        ]
                    })],
                    flags: MessageFlags.IsComponentsV2
                });
            }

            const targetId = args.pop().replace(/[<@!>]/g, "");
            const planName = args.join(" ");

            const targetUser = await message.guild.members.fetch(targetId).catch(() => null);
            if (!targetUser) {
                return message.reply({
                    components: [UI.createContainer({ color: 0xFF0000, description: "❌ **User not found.**" })],
                    flags: MessageFlags.IsComponentsV2
                });
            }

            // check if user already has a plan
            const existing = await PremiumPlan.findOne({ where: { owner_id: targetUser.id, guild_id: message.guild.id } });
            if (existing) {
                return message.reply({
                    components: [UI.createContainer({ color: 0xFF0000, description: `❌ **${targetUser.user.tag}** already owns a premium plan.` })],
                    flags: MessageFlags.IsComponentsV2
                });
            }

            // 3. Create Role
            const planRole = await message.guild.roles.create({
                name: planName,
                reason: `Premium Plan for ${targetUser.user.tag}`,
            }).catch(async (err) => {
                console.error(err);
                return null;
            });

            if (!planRole) {
                return message.reply({
                    components: [UI.createContainer({ color: 0xFF0000, description: "❌ **Failed to create role.** Ensure I have `Manage Roles` permission and my role is high enough." })],
                    flags: MessageFlags.IsComponentsV2
                });
            }

            // 4. Create Voice Channel
            const planChannel = await message.guild.channels.create({
                name: planName,
                type: ChannelType.GuildVoice,
                parent: settings.category_id,
                permissionOverwrites: [
                    {
                        id: message.guild.id, // @everyone
                        deny: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.Connect],
                    },
                    {
                        id: planRole.id, // Plan Role
                        allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.Connect, PermissionsBitField.Flags.Speak],
                    },
                    {
                        id: targetUser.id, // Owner
                        allow: [
                            PermissionsBitField.Flags.ViewChannel,
                            PermissionsBitField.Flags.Connect,
                            PermissionsBitField.Flags.Speak,
                            PermissionsBitField.Flags.ManageChannels,
                            PermissionsBitField.Flags.ManageRoles,
                            PermissionsBitField.Flags.MoveMembers
                        ],
                    },
                ],
            }).catch(async (err) => {
                console.error(err);
                await planRole.delete().catch(() => { });
                return null;
            });

            if (!planChannel) {
                return message.reply({
                    components: [UI.createContainer({ color: 0xFF0000, description: "❌ **Failed to create voice channel.** Ensure I have `Manage Channels` permission." })],
                    flags: MessageFlags.IsComponentsV2
                });
            }

            // 5. Assign Role to User
            await targetUser.roles.add(planRole).catch(() => { });

            // 6. Save to Database
            await PremiumPlan.create({
                role_id: planRole.id,
                guild_id: message.guild.id,
                owner_id: targetUser.id,
                channel_id: planChannel.id,
            });

            // 7. Success Reply
            message.reply({
                components: [UI.createContainer({
                    title: "💎 Premium Plan Created!",
                    description: `A new premium plan has been successfully provisioned.`,
                    fields: [
                        { name: "Owner", value: `${targetUser} (\`${targetUser.id}\`)` },
                        { name: "Plan Name", value: `**${planName}**` },
                        { name: "Role", value: `${planRole}` },
                        { name: "Channel", value: `${planChannel}` }
                    ],
                    color: 0x00FF00
                })],
                flags: MessageFlags.IsComponentsV2
            });

        } catch (error) {
            console.error("pcreate Error:", error);
            message.reply({
                components: [UI.createContainer({ color: 0xFF0000, description: "❌ **Internal Error**\nFailed to create the premium plan." })],
                flags: MessageFlags.IsComponentsV2
            });
        }
    },
};
