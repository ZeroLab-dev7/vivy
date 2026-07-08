const { MessageFlags } = require("discord.js");
const { PremiumPlan } = require("../../db/models");
const UI = require("../../utils/ui");

module.exports = {
    name: "picon",
    description: "Change your premium role icon",
    async execute(message, args) {
        try {
            // 1. Check Owner
            const plan = await PremiumPlan.findOne({ where: { owner_id: message.author.id, guild_id: message.guild.id } });
            if (!plan) {
                return message.reply({
                    components: [UI.createContainer({ color: 0xFF0000, description: "❌ **Access Denied**\nYou do not own a premium plan." })],
                    flags: MessageFlags.IsComponentsV2
                });
            }

            // 2. Parse Image URL or Attachment
            let iconUrl = args[0];
            if (message.attachments.size > 0) {
                iconUrl = message.attachments.first().url;
            }

            if (!iconUrl) {
                return message.reply({
                    components: [UI.createContainer({
                        title: "Command: picon",
                        description: "Update your premium role icon.",
                        fields: [
                            { name: "Usage", value: `\`?picon <image_url_or_attachment>\`` },
                            { name: "To Remove", value: `\`?picon remove\`` }
                        ]
                    })],
                    flags: MessageFlags.IsComponentsV2
                });
            }

            // 3. Update Role Icon
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

            if (iconUrl.toLowerCase() === "remove" || iconUrl.toLowerCase() === "none") {
                await role.setIcon(null).catch(err => {
                    if (err.code === 50013) throw new Error("PERMISSION_OR_BOOST");
                    throw err;
                });
                return message.reply({
                    components: [UI.createContainer({ color: 0x00FF00, description: `✅ Plan icon removed.` })],
                    flags: MessageFlags.IsComponentsV2
                });
            }

            await role.setIcon(iconUrl).catch(err => {
                if (err.code === 50013 || err.code === 50035) throw new Error("PERMISSION_OR_BOOST");
                throw err;
            });

            message.reply({
                components: [UI.createContainer({ color: 0x00FF00, description: `✅ Plan icon updated successfully.` })],
                flags: MessageFlags.IsComponentsV2
            });

        } catch (error) {
            console.error("picon Error:", error);
            let errorMsg = "An error occurred while updating the role icon.";
            if (error.message === "PERMISSION_OR_BOOST") {
                errorMsg = "Ensure I have `Manage Roles` permission and the server has **Boost Level 2** enabled for role icons.";
            }

            message.reply({
                components: [UI.createContainer({ color: 0xFF0000, description: `❌ **Update Failed**\n${errorMsg}` })],
                flags: MessageFlags.IsComponentsV2
            });
        }
    },
};
