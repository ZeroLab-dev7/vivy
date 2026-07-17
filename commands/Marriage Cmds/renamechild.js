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

const saveMarriageData = (data) => {
  fs.writeFileSync(path, JSON.stringify(data, null, 2));
};

const cooldowns = new Map();
const COOLDOWN_TIME = 5000;

module.exports = {
  name: 'renamechild',
  aliases: ['rename'],
  description: 'Rename one of your children.',
  async execute(message, args) {
    if (cooldowns.has(message.author.id)) {
      return message.react('⏳');
    }

    cooldowns.set(message.author.id, Date.now() + COOLDOWN_TIME);
    setTimeout(() => cooldowns.delete(message.author.id), COOLDOWN_TIME);

    const marriageData = loadMarriageData();
    const userData = marriageData[message.author.id];

    if (!userData || !userData.partner) {
      return message.channel.send({
        components: [UI.createContainer({
          description: "- <a:warn:1365688576758644797> You must be married to rename your children!"
        })],
        flags: MessageFlags.IsComponentsV2
      });
    }

    if (!userData.children || userData.children.length === 0) {
      return message.channel.send({
        components: [UI.createContainer({
          description: "- <a:warn:1365688576758644797> You do not have any children."
        })],
        flags: MessageFlags.IsComponentsV2
      });
    }

    const partnerId = userData.partner;

    let target = message.mentions.users.first() || (args[0] ? await message.client.users.fetch(args[0]).catch(() => null) : null);

    if (!target) {
      return message.channel.send({
        components: [UI.createContainer({
          description: "- <a:warn:1365688576758644797> Please mention the child or provide their valid user ID."
        })],
        flags: MessageFlags.IsComponentsV2
      });
    }

    const childIndex = userData.children.findIndex(c => c.id === target.id);
    if (childIndex === -1) {
      return message.channel.send({
        components: [UI.createContainer({
          description: `- <a:warn:1365688576758644797> **${target.username}** is not your child.`
        })],
        flags: MessageFlags.IsComponentsV2
      });
    }

    const newName = args.slice(1).join(' ');

    if (!newName) {
      return message.channel.send({
        components: [UI.createContainer({
          description: "- <a:warn:1365688576758644797> Please provide a new name for the child."
        })],
        flags: MessageFlags.IsComponentsV2
      });
    }

    if (newName.length > 32) {
      return message.channel.send({
        components: [UI.createContainer({
          description: "- <a:warn:1365688576758644797> The child name cannot exceed 32 characters."
        })],
        flags: MessageFlags.IsComponentsV2
      });
    }

    userData.children[childIndex].name = newName;

    if (marriageData[partnerId] && marriageData[partnerId].children) {
      const partnerChildIndex = marriageData[partnerId].children.findIndex(c => c.id === target.id);
      if (partnerChildIndex !== -1) {
        marriageData[partnerId].children[partnerChildIndex].name = newName;
      }
    }

    saveMarriageData(marriageData);

    const container = UI.createContainer({
      description: `👶 You have successfully renamed your child **${target.username}** to **${newName}**.`
    });

    message.channel.send({
      components: [container],
      flags: MessageFlags.IsComponentsV2
    });
  }
};
