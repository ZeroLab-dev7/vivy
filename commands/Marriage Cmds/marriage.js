const { ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags } = require('discord.js');
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

const cooldowns = new Map(); // Cooldown map for users
const COOLDOWN_TIME = 5000; // 5 seconds cooldown

module.exports = {
  name: 'marry',
  description: 'Propose marriage to another user.',
  async execute(message, args) {
    // Check if user is on cooldown
    if (cooldowns.has(message.author.id)) {
      return message.react('⏳'); // React with the cooldown emoji (⏳)
    }

    // Set cooldown for the user
    cooldowns.set(message.author.id, Date.now() + COOLDOWN_TIME);
    setTimeout(() => cooldowns.delete(message.author.id), COOLDOWN_TIME); // Remove cooldown after 5 seconds

    let target = message.mentions.users.first() || await message.client.users.fetch(args[0]).catch(() => null);

    if (!target) {
      return message.channel.send({
        components: [UI.createContainer({
          description: "- <a:warn:1365688576758644797> Please mention a user or provide a valid user ID."
        })],
        flags: MessageFlags.IsComponentsV2
      });
    }

    if (target.id === message.author.id) {
      return message.channel.send({
        components: [UI.createContainer({
          description: "- <a:warn:1365688576758644797> You can't marry yourself!"
        })],
        flags: MessageFlags.IsComponentsV2
      });
    }

    if (target.bot) {
      return message.channel.send({
        components: [UI.createContainer({
          description: "- <a:warn:1365688576758644797> You can't marry bots!"
        })],
        flags: MessageFlags.IsComponentsV2
      });
    }

    const marriageData = loadMarriageData();

    if (marriageData[message.author.id] || marriageData[target.id]) {
      return message.channel.send({
        components: [UI.createContainer({
          description: "- <a:warn:1365688576758644797> You or the person you're proposing to is already married!"
        })],
        flags: MessageFlags.IsComponentsV2
      });
    }

    const container = UI.createContainer({
      description: `💍 Hey \`${target.username}\`, it would make \`${message.author.username}\` really happy if you would marry them. What do you say?`
    });

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("accept_marry")
        .setLabel("Accept")
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId("reject_marry")
        .setLabel("Reject")
        .setStyle(ButtonStyle.Danger)
    );

    const msg = await message.channel.send({
      components: [container, row],
      flags: MessageFlags.IsComponentsV2
    });

    const filter = (interaction) => interaction.user.id === target.id;
    const collector = msg.createMessageComponentCollector({ filter, time: 15000 });

    collector.on("collect", async (interaction) => {
      if (interaction.customId === "accept_marry") {
        marriageData[message.author.id] = {
          partner: target.id,
          date: Date.now()
        };
        marriageData[target.id] = {
          partner: message.author.id,
          date: Date.now()
        };
        saveMarriageData(marriageData);

        await interaction.update({
          components: [UI.createContainer({
            description: `🎉 Congratulations!\n💍 \`${message.author.username}\` and \`${target.username}\` are now married! 💕`
          })],
          flags: MessageFlags.IsComponentsV2
        });
      } else if (interaction.customId === "reject_marry") {
        await interaction.update({
          components: [UI.createContainer({
            description: `-  \`${target.username}\` has rejected \`${message.author.username}\`'s marriage proposal.`
          })],
          flags: MessageFlags.IsComponentsV2
        });
      }
    });

    collector.on("end", async () => {
      if (!msg.deleted) {
        const timeoutContainer = UI.createContainer({
          description: "- ⏳ Time's up! You didn't get a response in time. Better luck next time!"
        });

        const disabledRow = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId("accept_marry")
            .setLabel("Accept")
            .setStyle(ButtonStyle.Success)
            .setDisabled(true),
          new ButtonBuilder()
            .setCustomId("reject_marry")
            .setLabel("Reject")
            .setStyle(ButtonStyle.Danger)
            .setDisabled(true)
        );

        msg.edit({
          components: [timeoutContainer, disabledRow],
          flags: MessageFlags.IsComponentsV2
        }).catch(() => { });
      }
    });
  }
};
