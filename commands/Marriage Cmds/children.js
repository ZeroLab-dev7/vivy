const { MessageFlags } = require('discord.js');
const UI = require('../../utils/ui');
const fs = require('fs');
const path = './marriages.json';

const loadMarriageData = () => {
  if (fs.existsSync(path)) {
    return JSON.parse(fs.readFileSync(path, 'utf-8'));
  } else {
    return {};
  }
};

const cooldowns = new Map();
const COOLDOWN_TIME = 5000;

module.exports = {
  name: 'children',
  description: 'View the children of a user.',
  async execute(message, args) {
    if (cooldowns.has(message.author.id)) {
      return message.react('⏳');
    }

    cooldowns.set(message.author.id, Date.now() + COOLDOWN_TIME);
    setTimeout(() => cooldowns.delete(message.author.id), COOLDOWN_TIME);

    let target = message.mentions.users.first() || (args[0] ? await message.client.users.fetch(args[0]).catch(() => null) : null) || message.author;

    const marriageData = loadMarriageData();
    const userData = marriageData[target.id];

    if (!userData || !userData.children || userData.children.length === 0) {
      return message.channel.send({
        components: [UI.createContainer({
          description: `- 👶 **${target.username}** has no children.`
        })],
        flags: MessageFlags.IsComponentsV2
      });
    }

    const childrenNames = userData.children.map((c, i) => {
      return `${i + 1}. <@${c.id}> (as *${c.name}*)`;
    }).join('\n');

    const container = UI.createContainer({
      title: `👶 ${target.username}'s Children`,
      description: childrenNames
    });

    message.channel.send({
      components: [container],
      flags: MessageFlags.IsComponentsV2
    });
  }
};
