const { MessageFlags } = require("discord.js");
const UI = require("../../utils/ui");

module.exports = {
    name: "pdebug",
    description: "Debug premium system status",
    async execute(message, args) {
        message.reply({
            components: [UI.createContainer({
                color: 0x00FF00,
                description: "✅ **Premium System Status**\nThe premium commands system is active and receiving commands correctly."
            })],
            flags: MessageFlags.IsComponentsV2
        });
    }
};
