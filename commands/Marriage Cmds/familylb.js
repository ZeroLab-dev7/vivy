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
const COOLDOWN_TIME = 10000;

module.exports = {
  name: 'familylb',
  aliases: ['familyleaderboard'],
  description: 'See who has the biggest family.',
  async execute(message) {
    if (cooldowns.has(message.author.id)) {
      return message.react('⏳');
    }

    cooldowns.set(message.author.id, Date.now() + COOLDOWN_TIME);
    setTimeout(() => cooldowns.delete(message.author.id), COOLDOWN_TIME);

    const marriageData = loadMarriageData();
    const families = [];

    const processed = new Set();
    for (const [userId, data] of Object.entries(marriageData)) {
      if (processed.has(userId)) continue;
      if (data.partner) {
        processed.add(userId);
        processed.add(data.partner);
        
        families.push({
          parent1: userId,
          parent2: data.partner,
          childCount: data.children ? data.children.length : 0
        });
      }
    }

    if (families.length === 0) {
      return message.channel.send({
        components: [UI.createContainer({
          description: "- 💔 No families found in the leaderboard."
        })],
        flags: MessageFlags.IsComponentsV2
      });
    }

    families.sort((a, b) => b.childCount - a.childCount);

    const topFamilies = families.slice(0, 10);
    const leaderboardLines = [];

    for (let i = 0; i < topFamilies.length; i++) {
      const fam = topFamilies[i];
      const p1 = await message.client.users.fetch(fam.parent1).catch(() => null);
      const p2 = await message.client.users.fetch(fam.parent2).catch(() => null);
      const name1 = p1 ? p1.username : 'Unknown User';
      const name2 = p2 ? p2.username : 'Unknown User';

      leaderboardLines.push(`**${i + 1}.** \`${name1}\` & \`${name2}\` — **${fam.childCount}** child${fam.childCount === 1 ? '' : 'ren'}`);
    }

    const container = UI.createContainer({
      title: '👪 Family Leaderboard',
      description: leaderboardLines.join('\n')
    });

    message.channel.send({
      components: [container],
      flags: MessageFlags.IsComponentsV2
    });
  }
};
