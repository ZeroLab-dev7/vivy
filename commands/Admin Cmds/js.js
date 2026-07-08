const { MessageFlags } = require("discord.js");
const UI = require('../../utils/ui');

const COOLDOWN_TIME = 5000; // 5 seconds cooldown
const cooldowns = new Map();

module.exports = {
  name: "js",
  description: "Send a message in code block style.",
  async execute(message, args) {
    // Check if the user is on cooldown
    if (cooldowns.has(message.author.id)) {
      return message.react('⏳'); // React with a cooldown emoji
    }

    // Set cooldown for the user
    cooldowns.set(message.author.id, Date.now() + COOLDOWN_TIME);
    setTimeout(() => cooldowns.delete(message.author.id), COOLDOWN_TIME);

    if (!args.length) return;

    const content = args.join(" ");

    await message.delete(); // Kaytm7a message dyal user

    const container = UI.createContainer({
      description: `\`\`\`js\n${content}\n\`\`\``
    });

    message.channel.send({
      components: [container],
      flags: MessageFlags.IsComponentsV2
    }); // Kayrj3ha b style code
  }
};
