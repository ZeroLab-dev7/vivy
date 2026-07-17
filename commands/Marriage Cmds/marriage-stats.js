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

const cooldowns = new Map(); // Cooldown map for users
const COOLDOWN_TIME = 5000; // 5 seconds cooldown

module.exports = {
  name: 'marrystats',
  aliases: ['ms'],
  description: 'Check your marriage status and view marriage statistics.',
  async execute(interactionOrMessage) {
    const isInteraction = !!interactionOrMessage.user; // Check if it's an interaction or message
    const user = isInteraction ? interactionOrMessage.user : interactionOrMessage.author;
    const replyMethod = isInteraction ? interactionOrMessage.reply.bind(interactionOrMessage) : interactionOrMessage.channel.send.bind(interactionOrMessage.channel);

    // Check if user is on cooldown
    if (cooldowns.has(user.id)) {
      // React with the cooldown emoji
      await interactionOrMessage.react('⏳');  // Or use any other emoji you prefer

      return replyMethod({
        components: [UI.createContainer({
          description: '- <a:warn:1365688576758644797> Please wait a few seconds before checking your stats again.'
        })],
        flags: MessageFlags.IsComponentsV2
      });
    }

    // Set cooldown for the user
    cooldowns.set(user.id, Date.now() + COOLDOWN_TIME);
    setTimeout(() => cooldowns.delete(user.id), COOLDOWN_TIME); // Remove cooldown after the specified time

    const marriageData = loadMarriageData();
    const userData = marriageData[user.id];

    if (!userData || (!userData.partner && (!userData.parents || userData.parents.length === 0))) {
      return replyMethod({
        components: [UI.createContainer({
          description: '- 💔 No Marriage Data.'
        })],
        flags: MessageFlags.IsComponentsV2
      });
    }

    const fields = [];
    let description = '';

    if (userData.partner) {
      const partnerId = userData.partner;
      const marriageDate = new Date(userData.date);
      const timestamp = Math.floor(marriageDate.getTime() / 1000);
      const formattedDate = `<t:${timestamp}:D>`;
      const formattedAge = `<t:${timestamp}:R>`;
      const partner = await interactionOrMessage.client.users.fetch(partnerId).catch(() => null);
      const partnerName = partner ? partner.username : 'Unknown User';

      description = `\`${user.username}\` <a:love:1366894294291451914> \`${partnerName}\` `;
      fields.push(
        { name: '<:calender:1366894449723965551> Marriage Date', value: formattedDate, inline: true },
        { name: '<a:time:1366894649192747059> Marriage Age', value: formattedAge, inline: true }
      );
    } else {
      description = `\`${user.username}\` is not currently married.`;
    }

    if (userData.parents && userData.parents.length > 0) {
      const parentNames = [];
      for (const parentId of userData.parents) {
        const pUser = await interactionOrMessage.client.users.fetch(parentId).catch(() => null);
        parentNames.push(pUser ? `\`${pUser.username}\`` : `<@${parentId}>`);
      }
      fields.push({
        name: '👪 Parents',
        value: parentNames.join(' & '),
        inline: false
      });
    }

    if (userData.children && userData.children.length > 0) {
      const childrenNames = userData.children.map((c, i) => `${i + 1}. <@${c.id}> (as *${c.name}*)`).join('\n');
      fields.push({
        name: '👶 Children',
        value: childrenNames,
        inline: false
      });
    }

    const container = UI.createContainer({
      title: '<:ring:1526494769050816512> Marriage Status',
      description: description,
      fields: fields
    });

    replyMethod({
      components: [container],
      flags: MessageFlags.IsComponentsV2
    });
  }
};
