const { MessageFlags } = require("discord.js");
const { PremiumPlan } = require("../../db/models");
const UI = require("../../utils/ui");

const colorMap = {
    black: "#010101",
    white: "#ffffff",
    grey: "#808080",
    gray: "#808080",
    pink: "#ffc0cb",
    red: "#ff0000",
    blue: "#0000ff",
    green: "#00ff00",
    yellow: "#ffff00",
    purple: "#800080",
    orange: "#ffa500",
    brown: "#a52a2a",
    cyan: "#00ffff",
    magenta: "#ff00ff",
    lime: "#00ff00",
    teal: "#008080",
    navy: "#000080",
    gold: "#ffd700",
    silver: "#c0c0c0",
    maroon: "#800000",
    olive: "#808000"
};

module.exports = {
    name: "pcolor",
    description: "Change your premium role color",
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

            if (args.length < 1) {
                return message.reply({
                    components: [UI.createContainer({
                        title: "Command: pcolor",
                        description: "Change the color of your premium role.",
                        fields: [
                            { name: "Usage", value: `\`?pcolor <color_name_or_hex>\`` },
                            { name: "Examples", value: `\`?pcolor red\`, \`?pcolor #ff00ff\`` }
                        ]
                    })],
                    flags: MessageFlags.IsComponentsV2
                });
            }

            let inputColor = args.join(" ").toLowerCase();
            let finalColor = colorMap[inputColor];

            if (!finalColor) {
                if (/^#?[0-9A-Fa-f]{6}$/i.test(inputColor)) {
                    finalColor = inputColor.startsWith("#") ? inputColor : `#${inputColor}`;
                } else {
                    return message.reply({
                        components: [UI.createContainer({ color: 0xFF0000, description: "❌ **Invalid Color**\nPlease provide a valid color name (e.g., red, pink) or hex code (e.g., #ff0000)." })],
                        flags: MessageFlags.IsComponentsV2
                    });
                }
            }

            if (finalColor === "#000000") finalColor = "#010101";

            // 3. Update Role Color
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

            await role.setColor(finalColor).catch(err => {
                console.error(err);
                throw new Error("Discord API error while setting color.");
            });

            message.reply({
                components: [UI.createContainer({
                    color: parseInt(finalColor.replace('#', ''), 16),
                    description: `✅ Your premium role color has been updated to **${inputColor}**.`
                })],
                flags: MessageFlags.IsComponentsV2
            });

        } catch (error) {
            console.error("pcolor Error:", error);
            message.reply({
                components: [UI.createContainer({ color: 0xFF0000, description: "❌ **Internal Error**\nFailed to update the role color." })],
                flags: MessageFlags.IsComponentsV2
            });
        }
    },
};
