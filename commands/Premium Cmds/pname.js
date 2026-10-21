const { MessageFlags } = require("discord.js");
const { PremiumPlan } = require("../../db/models");
const UI = require("../../utils/ui");

module.exports = {
    name: "pname",
    description: "Rename your premium plan (Role & Channel)",
    async execute(message, args) {
        try {
            // 1. Check Owner
            const plan = await PremiumPlan.findOne({ where: { owner_id: message.author.id, guild_id: message.guild.id } });
            if (!plan) {
                return message.reply({
                    components: [UI.createContainer({ color: 0xFF0000, description: "<:no:1526496561188831244>**Access Denied**\nYou do not own a premium plan." })],
                    flags: MessageFlags.IsComponentsV2
                });
            }

            // 2. Parse New Name
            if (args.length < 1) {
                return message.reply({
                    components: [UI.createContainer({
                        title: "Command: pname",
                        description: "Rename your premium role and voice channel.",
                        fields: [
                            { name: "Usage", value: `\`?pname <new name>\`` }
                        ]
                    })],
                    flags: MessageFlags.IsComponentsV2
                });
            }
            const newName = args.join(" ");

            // 3. Update Role & Channel
            const role = message.guild.roles.cache.get(plan.role_id);
            const channel = message.guild.channels.cache.get(plan.channel_id);

            if (role) {
                // Hierarchy check
                if (message.guild.members.me.roles.highest.position <= role.position) {
                    return message.reply({
                        components: [UI.createContainer({
                            color: 0xFF0000,
                            description: `<:no:1526496561188831244>**Permission Error**\nMy role is not high enough to rename the role **${role.name}**.`
                        })],
                        flags: MessageFlags.IsComponentsV2
                    });
                }
                await role.setName(newName).catch(() => { });
            }
            if (channel) await channel.setName(newName).catch(() => { });

            message.reply({
                components: [UI.createContainer({ color: 0x00FF00, description: `✅ Your premium plan has been renamed to **${newName}**.` })],
                flags: MessageFlags.IsComponentsV2
            });

        } catch (error) {
            console.error("pname Error:", error);
            message.reply({
                components: [UI.createContainer({ color: 0xFF0000, description: "<:no:1526496561188831244>**Internal Error**\nFailed to rename the plan." })],
                flags: MessageFlags.IsComponentsV2
            });
        }
    },
};
