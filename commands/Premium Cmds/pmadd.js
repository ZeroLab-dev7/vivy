const { MessageFlags } = require("discord.js");
const { PremiumPlan } = require("../../db/models");
const UI = require("../../utils/ui");

module.exports = {
    name: "pmadd",
    description: "Add a manager to your premium plan",
    async execute(message, args) {
        try {
            // 1. Check if user owns a plan
            const plan = await PremiumPlan.findOne({ where: { owner_id: message.author.id, guild_id: message.guild.id } });

            if (!plan) {
                return message.reply({
                    components: [UI.createContainer({ color: 0xFF0000, description: "❌ **Access Denied**\nYou do not own a premium plan." })],
                    flags: MessageFlags.IsComponentsV2
                });
            }

            // 2. Parse Target User
            if (args.length < 1) {
                return message.reply({
                    components: [UI.createContainer({
                        title: "Command: pmadd",
                        description: "Add a manager to help you manage your premium plan.",
                        fields: [
                            { name: "Usage", value: `\`?pmadd <user_id/mention>\`` }
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

            if (targetUser.id === message.author.id) {
                return message.reply({
                    components: [UI.createContainer({ color: 0xFF0000, description: "❌ **You are already the owner of this plan.**" })],
                    flags: MessageFlags.IsComponentsV2
                });
            }

            // 3. Update Managers
            let managers = plan.managers ? plan.managers.split(",").filter(id => id.length > 0) : [];

            if (managers.includes(targetUser.id)) {
                return message.reply({
                    components: [UI.createContainer({ color: 0xFF0000, description: "❌ **This user is already a manager.**" })],
                    flags: MessageFlags.IsComponentsV2
                });
            }

            if (managers.length >= 3) {
                return message.reply({
                    components: [UI.createContainer({ color: 0xFF0000, description: "❌ **Manager Limit Reached**\nYou can only have a maximum of **3** managers." })],
                    flags: MessageFlags.IsComponentsV2
                });
            }

            managers.push(targetUser.id);
            await plan.update({ managers: managers.join(",") });

            message.reply({
                components: [UI.createContainer({ color: 0x00FF00, description: `✅ Successfully added ${targetUser} as a manager for your premium plan.` })],
                flags: MessageFlags.IsComponentsV2
            });

        } catch (error) {
            console.error("pmadd Error:", error);
            message.reply({
                components: [UI.createContainer({ color: 0xFF0000, description: "❌ **Internal Error**\nFailed to add manager." })],
                flags: MessageFlags.IsComponentsV2
            });
        }
    },
};
