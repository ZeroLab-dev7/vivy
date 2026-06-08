const { MessageFlags } = require("discord.js");
const { PremiumPlan } = require("../../db/models");
const UI = require("../../utils/ui");

module.exports = {
    name: "premove",
    description: "Remove a user from your premium plan",
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
                        description: "❌ **Access Denied**\nYou do not own a premium plan and you are not a manager of any plan."
                    })],
                    flags: MessageFlags.IsComponentsV2
                });
            }

            // 2. Parse Target
            if (args.length < 1) {
                return message.reply({
                    components: [UI.createContainer({
                        title: "Command: premove",
                        description: "Remove a member from your premium plan.",
                        fields: [
                            { name: "Usage", value: `\`&premove <user_id/mention>\`` }
                        ]
                    })],
                    flags: MessageFlags.IsComponentsV2
                });
            }
            const targetId = args[0].replace(/[<@!>]/g, "");
            const targetUser = await message.guild.members.fetch(targetId).catch(() => null);

            if (!targetUser) {
                return message.reply({
                    components: [UI.createContainer({ color: 0xFF0000, description: "❌ **User not found.**" })],
                    flags: MessageFlags.IsComponentsV2
                });
            }

            // 3. Remove Role
            const role = message.guild.roles.cache.get(plan.role_id);
            if (!role) {
                return message.reply({
                    components: [UI.createContainer({ color: 0xFF0000, description: "❌ **Plan role not found.**" })],
                    flags: MessageFlags.IsComponentsV2
                });
            }

            // Hierarchy check
            if (message.guild.members.me.roles.highest.position <= role.position) {
                return message.reply({
                    components: [UI.createContainer({
                        color: 0xFF0000,
                        description: `❌ **Permission Error**\nMy role is not high enough to manage the role **${role.name}**.`
                    })],
                    flags: MessageFlags.IsComponentsV2
                });
            }

            await targetUser.roles.remove(role).catch(() => { });
            message.reply({
                components: [UI.createContainer({ color: 0x00FF00, description: `✅ Successfully removed ${targetUser} from your premium plan **${role.name}**.` })],
                flags: MessageFlags.IsComponentsV2
            });

        } catch (error) {
            console.error("premove Error:", error);
            message.reply({
                components: [UI.createContainer({ color: 0xFF0000, description: "❌ **Internal Error**\nFailed to remove user from plan." })],
                flags: MessageFlags.IsComponentsV2
            });
        }
    },
};
