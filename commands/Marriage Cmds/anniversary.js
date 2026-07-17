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
  name: 'anniversary',
  description: 'Check your marriage anniversary.',
  async execute(message, args) {
    if (cooldowns.has(message.author.id)) {
      return message.react('⏳');
    }

    cooldowns.set(message.author.id, Date.now() + COOLDOWN_TIME);
    setTimeout(() => cooldowns.delete(message.author.id), COOLDOWN_TIME);

    let target = message.mentions.users.first() || (args[0] ? await message.client.users.fetch(args[0]).catch(() => null) : null) || message.author;

    const marriageData = loadMarriageData();
    const userData = marriageData[target.id];

    if (!userData || !userData.partner) {
      return message.channel.send({
        components: [UI.createContainer({
          description: `- 💔 **${target.username}** is not married.`
        })],
        flags: MessageFlags.IsComponentsV2
      });
    }

    const partnerId = userData.partner;
    const partner = await message.client.users.fetch(partnerId).catch(() => null);
    const partnerName = partner ? partner.username : 'Unknown User';

    const mDate = new Date(userData.date);
    const timestamp = Math.floor(mDate.getTime() / 1000);

    // Calculate next anniversary countdown
    const now = new Date();
    let nextAnniversary = new Date(now.getFullYear(), mDate.getMonth(), mDate.getDate(), mDate.getHours(), mDate.getMinutes(), mDate.getSeconds());
    if (nextAnniversary < now) {
      nextAnniversary.setFullYear(now.getFullYear() + 1);
    }
    const nextAnniversaryTimestamp = Math.floor(nextAnniversary.getTime() / 1000);

    const container = UI.createContainer({
      title: '📅 Marriage Anniversary',
      description: `<:ring:1526494769050816512> **${target.username}** & **${partnerName}**`,
      fields: [
        { name: '<:ring:1526494769050816512> Married On', value: `<t:${timestamp}:D> (<t:${timestamp}:R>)`, inline: true },
        { name: '<a:pink8:1337678972108148757> Next Anniversary', value: `<t:${nextAnniversaryTimestamp}:D> (<t:${nextAnniversaryTimestamp}:R>)`, inline: true }
      ]
    });

    message.channel.send({
      components: [container],
      flags: MessageFlags.IsComponentsV2
    });
  }
};
