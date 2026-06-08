const { MessageFlags } = require("discord.js");
const { PremiumPlan } = require("../../db/models");
const UI = require("../../utils/ui");

module.exports = {
    name: "plist",
    description: "List members in your premium plan",
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

            // 2. Get Role & Members
            const role = message.guild.roles.cache.get(plan.role_id);
            if (!role) {
                return message.reply({
                    components: [UI.createContainer({ color: 0xFF0000, description: "❌ **Plan role not found.**" })],
                    flags: MessageFlags.IsComponentsV2
                });
            }

            // Force fetch members to ensure cache is up to date
            await message.guild.members.fetch();

            const memberList = role.members.map(m => `- ${m.user.tag} (\`${m.id}\`)`).join("\n");

            // 3. Send Container
            message.reply({
                components: [UI.createContainer({
                    title: `Members of ${role.name}`,
                    description: memberList || "*No members yet.*",
                    color: 0x3498DB,
                    footer: `${role.members.size} members currently in this plan.`
                })],
                flags: MessageFlags.IsComponentsV2
            });

        } catch (error) {
            console.error("plist Error:", error);
            message.reply({
                components: [UI.createContainer({ color: 0xFF0000, description: "❌ **Internal Error**\nFailed to fetch the member list." })],
                flags: MessageFlags.IsComponentsV2
            });
        }
    },
};
