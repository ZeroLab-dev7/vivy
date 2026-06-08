const { PermissionsBitField, MessageFlags } = require("discord.js");
const { PremiumPlan, PremiumSetup } = require("../../db/models");
const UI = require("../../utils/ui");

module.exports = {
    name: "pshowall",
    description: "Show all premium plans (Managers only)",
    async execute(message, args) {
        try {
            // 1. Check Permissions
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
                    components: [UI.createContainer({ color: 0xFF0000, description: "❌ **Access Denied**\nThis command is restricted to **Managers**." })],
                    flags: MessageFlags.IsComponentsV2
                });
            }

            // 2. Fetch Plans
            const plans = await PremiumPlan.findAll({ where: { guild_id: message.guild.id } });
            if (plans.length === 0) {
                return message.reply({
                    components: [UI.createContainer({ description: "ℹ️ **No premium plans found in this server.**" })],
                    flags: MessageFlags.IsComponentsV2
                });
            }

            // 3. Format Output
            const fields = plans.map((p, index) => {
                return {
                    name: `Plan #${index + 1}`,
                    value: `**Owner:** <@${p.owner_id}> (\`${p.owner_id}\`)\n**Role:** <@&${p.role_id}>\n**Channel:** <#${p.channel_id}>`
                };
            });

            message.reply({
                components: [UI.createContainer({
                    title: "All Premium Plans",
                    fields: fields,
                    color: 0xF1C40F, // Gold
                    footer: `Total Plans: ${plans.length}`
                })],
                flags: MessageFlags.IsComponentsV2
            });

        } catch (error) {
            console.error("pshowall Error:", error);
            message.reply({
                components: [UI.createContainer({ color: 0xFF0000, description: "❌ **Internal Error**\nFailed to fetch plans." })],
                flags: MessageFlags.IsComponentsV2
            });
        }
    },
};
