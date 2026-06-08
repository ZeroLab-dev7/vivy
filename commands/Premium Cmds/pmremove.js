const { MessageFlags } = require("discord.js");
const { PremiumPlan } = require("../../db/models");
const UI = require("../../utils/ui");

module.exports = {
    name: "pmremove",
    description: "Remove a manager from your premium plan",
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
                        title: "Command: pmremove",
                        description: "Remove a manager from your premium plan.",
                        fields: [
                            { name: "Usage", value: `\`&pmremove <user_id/mention>\`` }
                        ]
                    })],
                    flags: MessageFlags.IsComponentsV2
                });
            }

            const targetId = args[0].replace(/[<@!>]/g, "");

            // 3. Update Managers
            let managers = plan.managers ? plan.managers.split(",").filter(id => id.length > 0) : [];

            if (!managers.includes(targetId)) {
                return message.reply({
                    components: [UI.createContainer({ color: 0xFF0000, description: "❌ **This user is not a manager of your plan.**" })],
                    flags: MessageFlags.IsComponentsV2
                });
            }

            managers = managers.filter(id => id !== targetId);
            await plan.update({ managers: managers.join(",") });

            message.reply({
                components: [UI.createContainer({ color: 0x00FF00, description: `✅ Successfully removed <@${targetId}> from your plan managers.` })],
                flags: MessageFlags.IsComponentsV2
            });

        } catch (error) {
            console.error("pmremove Error:", error);
            message.reply({
                components: [UI.createContainer({ color: 0xFF0000, description: "❌ **Internal Error**\nFailed to remove manager." })],
                flags: MessageFlags.IsComponentsV2
            });
        }
    },
};
