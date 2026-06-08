const { PermissionsBitField, MessageFlags } = require("discord.js");
const { PremiumPlan, PremiumSetup } = require("../../db/models");
const UI = require("../../utils/ui");

module.exports = {
    name: "pdelete",
    description: "Delete a premium plan (Managers only)",
    async execute(message, args) {
        try {
            // 1. Check Permissions (Manager Only)
            const settings = await PremiumSetup.findByPk(message.guild.id);
            if (!settings) {
                return message.reply({
                    components: [UI.createContainer({ color: 0xFF0000, description: "❌ **Premium system not set up.**" })],
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
                        description: "❌ **Access Denied**\nOnly **Managers** or **Administrators** can delete premium plans."
                    })],
                    flags: MessageFlags.IsComponentsV2
                });
            }

            // 2. Determine Target Plan
            let plan;
            if (args.length > 0) {
                const targetId = args[0].replace(/[<@!>]/g, "");
                plan = await PremiumPlan.findOne({ where: { owner_id: targetId, guild_id: message.guild.id } });
                if (!plan) {
                    return message.reply({
                        components: [UI.createContainer({ color: 0xFF0000, description: "❌ **Plan not found for that user.**" })],
                        flags: MessageFlags.IsComponentsV2
                    });
                }
            } else {
                return message.reply({
                    components: [UI.createContainer({ color: 0xFF0000, description: "❌ **Specify a user.**\nUsage: `&pdelete <user_id/mention>`" })],
                    flags: MessageFlags.IsComponentsV2
                });
            }

            // 3. Delete Resources
            const role = message.guild.roles.cache.get(plan.role_id);
            const channel = message.guild.channels.cache.get(plan.channel_id);

            if (channel) await channel.delete("Premium Plan Deleted").catch(() => { });
            if (role) await role.delete("Premium Plan Deleted").catch(() => { });

            // 4. Delete from DB
            await plan.destroy();

            message.reply({
                components: [UI.createContainer({
                    color: 0x00FF00,
                    description: `✅ **Premium Plan Deleted**\nThe plan and its associated resources have been removed.`
                })],
                flags: MessageFlags.IsComponentsV2
            });

        } catch (error) {
            console.error("pdelete Error:", error);
            message.reply({
                components: [UI.createContainer({ color: 0xFF0000, description: "❌ **Internal Error**\nAn error occurred while deleting the plan." })],
                flags: MessageFlags.IsComponentsV2
            });
        }
    },
};
