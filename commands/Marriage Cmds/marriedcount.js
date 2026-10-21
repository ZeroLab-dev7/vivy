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
  name: 'marriedcount',
  aliases: ['mcount'],
  description: 'Show the number of users who are married.',
  async execute(message) {
    if (cooldowns.has(message.author.id)) {
      return message.react('⏳');
    }

    cooldowns.set(message.author.id, Date.now() + COOLDOWN_TIME);
    setTimeout(() => cooldowns.delete(message.author.id), COOLDOWN_TIME);

    const marriageData = loadMarriageData();
    let count = 0;

    for (const data of Object.values(marriageData)) {
      if (data.partner) {
        count++;
      }
    }

    const couples = Math.floor(count / 2);

    const container = UI.createContainer({
      title: '<:ring:1526494769050816512> Married Users Count',
      description: `There are currently **${count}** users married (**${couples}** couples) in the bot's database.`
    });

    message.channel.send({
      components: [container],
      flags: MessageFlags.IsComponentsV2
    });
  }
};
