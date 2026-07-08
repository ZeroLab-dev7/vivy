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
  name: 'marry-stats',
  aliases: ['marrystats'],
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
    if (!marriageData[user.id]) {
      return replyMethod({
        components: [UI.createContainer({
          description: '- 💔 No Marriage Data.'
        })],
        flags: MessageFlags.IsComponentsV2
      });
    }

    const marriage = marriageData[user.id];
    const partnerId = marriage.partner;
    const marriageDate = new Date(marriage.date);
    const timestamp = Math.floor(marriageDate.getTime() / 1000);

    const formattedDate = `<t:${timestamp}:D>`; // Format the marriage date
    const formattedAge = `<t:${timestamp}:R>`; // Format how long the marriage has been active

    const partner = await interactionOrMessage.client.users.fetch(partnerId);

    const container = UI.createContainer({
      title: '💍 Marriage Status',
      // thumbnail: partner.displayAvatarURL({ dynamic: true }), // Assuming createContainer doesn't handle thumbnail directly yet, or if it does, adapt UI.js. For now sticking to no thumbnail or assuming description is enough. Or I might need to update UI.js to support thumbnails if strict visual parity is needed. The `help.js` doesn't show thumbnail support but other files (server-info) had it in EmbedBuilder. 
      // Based on user request "no explicit colors", I'll stick to clean text.
      // If thumbnail is critical, I'd need to add it to UI.createContainer. 
      // For now I will omit thumbnail to match V2 style unless I know UI.js supports it.
      description: ` <a:arrow:1366894100917391471> \`${user.username}\` <a:love:1366894294291451914> \`${partner.username}\` `,
      fields: [
        { name: '<:calender:1366894449723965551> Marriage Date', value: formattedDate, inline: true },
        { name: '<a:time:1366894649192747059> Marriage Age', value: formattedAge, inline: true }
      ],
      // footer: null // No footer in original that matters much (timestamp is standard)? Or maybe I can add one.
    });

    replyMethod({
      components: [container],
      flags: MessageFlags.IsComponentsV2
    });
  }
};
