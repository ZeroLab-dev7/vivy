const { MessageFlags } = require("discord.js");
const { PremiumPlan } = require("../../db/models");
const UI = require("../../utils/ui");

module.exports = {
    name: "padd",
    description: "Add a user to your premium plan",
    async execute(message, args) {
        try {
            const { Op } = require("sequelize");
            const plan = await PremiumPlan.findOne({
                where: {
                    guild_id: message.guild.id,
                    [Op.or]: [
                        { owner_id: message.author.id },
                        { managers: { [Op.like]: `%${message.author.id}%` } }
                    ]
                }
            });

            if (!plan) {
                return message.reply({
                    components: [UI.createContainer({
                        color: 0xFF0000,
                        description: "<:no:1526496561188831244>**Access Denied**\nYou do not own a premium plan and you are not a manager of any plan."
                    })],
                    flags: MessageFlags.IsComponentsV2
                });
            }

            // 2. Parse Target User
            if (args.length < 1) {
                return message.reply({
                    components: [UI.createContainer({
                        title: "Command: padd",
                        description: "Add a member to your premium plan.",
                        fields: [
                            { name: "Usage", value: `\`?padd <user_id/mention>\`` }
                        ]
                    })],
                    flags: MessageFlags.IsComponentsV2
                });
            }

            const targetId = args[0].replace(/[<@!>]/g, "");
            const targetUser = await message.guild.members.fetch(targetId).catch(() => null);

            if (!targetUser) {
                return message.reply({
                    components: [UI.createContainer({ color: 0xFF0000, description: "<:no:1526496561188831244>**User not found.**" })],
                    flags: MessageFlags.IsComponentsV2
                });
            }

            // 3. Add Role
            const role = message.guild.roles.cache.get(plan.role_id);
            if (!role) {
                return message.reply({
                    components: [UI.createContainer({ color: 0xFF0000, description: "<:no:1526496561188831244>**Plan role not found.** Please contact an admin." })],
                    flags: MessageFlags.IsComponentsV2
                });
            }

            // check hierarchy
            if (message.guild.members.me.roles.highest.position <= role.position) {
                return message.reply({
                    components: [UI.createContainer({
                        color: 0xFF0000,
                        description: `<:no:1526496561188831244>**Permission Error**\nMy role is not high enough to manage the role **${role.name}**.`
                    })],
                    flags: MessageFlags.IsComponentsV2
                });
            }

            await targetUser.roles.add(role).catch(err => {
                console.error(err);
                return null;
            });

            message.reply({
                components: [UI.createContainer({
                    color: 0x00FF00,
                    description: `✅ Successfully added ${targetUser} to your premium plan **${role.name}**.`
                })],
                flags: MessageFlags.IsComponentsV2
            });

        } catch (error) {
            console.error("padd Error:", error);
            message.reply({
                components: [UI.createContainer({ color: 0xFF0000, description: "<:no:1526496561188831244>**Internal Error**\nAn unexpected error occurred." })],
                flags: MessageFlags.IsComponentsV2
            });
        }
    },
};
