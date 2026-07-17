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
  name: 'familytree',
  aliases: ['tree'],
  description: 'View your complete family tree.',
  async execute(message, args) {
    if (cooldowns.has(message.author.id)) {
      return message.react('⏳');
    }

    cooldowns.set(message.author.id, Date.now() + COOLDOWN_TIME);
    setTimeout(() => cooldowns.delete(message.author.id), COOLDOWN_TIME);

    let target = message.mentions.users.first() || (args[0] ? await message.client.users.fetch(args[0]).catch(() => null) : null) || message.author;

    const marriageData = loadMarriageData();
    const userData = marriageData[target.id];

    if (!userData) {
      return message.channel.send({
        components: [UI.createContainer({
          description: `- 💔 **${target.username}** has no family history in our records.`
        })],
        flags: MessageFlags.IsComponentsV2
      });
    }

    const lines = [];

    // 1. Draw Parents
    if (userData.parents && userData.parents.length > 0) {
      const pNames = [];
      for (const pId of userData.parents) {
        const pUser = await message.client.users.fetch(pId).catch(() => null);
        pNames.push(pUser ? pUser.username : `User (${pId})`);
      }
      lines.push('👪 **Parents**');
      lines.push(`\`\`\`\n  ${pNames.join(' + ')}\n      │\n      ▼\n\`\`\``);
    }

    // 2. Draw Couple / Self and spouse
    lines.push('<:ring:1526494769050816512> **Couple**');
    let coupleLine = '';
    if (userData.partner) {
      const partner = await message.client.users.fetch(userData.partner).catch(() => null);
      const partnerName = partner ? partner.username : `User (${userData.partner})`;
      coupleLine = `  ${target.username} + ${partnerName}`;
    } else {
      coupleLine = `  ${target.username} (Single)`;
    }

    // 3. Draw Children
    if (userData.children && userData.children.length > 0) {
      const childrenLines = [coupleLine, '      │'];
      for (let i = 0; i < userData.children.length; i++) {
        const child = userData.children[i];
        const isLast = i === userData.children.length - 1;
        childrenLines.push(`${isLast ? '      └── ' : '      ├── '}${child.name}`);
      }
      lines.push(`\`\`\`\n${childrenLines.join('\n')}\n\`\`\``);
    } else {
      lines.push(`\`\`\`\n${coupleLine}\n\`\`\``);
    }

    const container = UI.createContainer({
      title: `🌳 ${target.username}'s Family Tree`,
      description: lines.join('\n')
    });

    message.channel.send({
      components: [container],
      flags: MessageFlags.IsComponentsV2
    });
  }
};
