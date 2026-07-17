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

const cooldowns = new Map();
const COOLDOWN_TIME = 5000;

module.exports = {
  name: 'adopt',
  description: 'Adopt a child with your partner.',
  async execute(message, args) {
    if (cooldowns.has(message.author.id)) {
      return message.react('⏳');
    }

    cooldowns.set(message.author.id, Date.now() + COOLDOWN_TIME);
    setTimeout(() => cooldowns.delete(message.author.id), COOLDOWN_TIME);

    const marriageData = loadMarriageData();
    const userMarriage = marriageData[message.author.id];

    if (!userMarriage || !userMarriage.partner) {
      return message.channel.send({
        components: [UI.createContainer({
          description: "- <a:warn:1365688576758644797> You must be married to adopt a child!"
        })],
        flags: MessageFlags.IsComponentsV2
      });
    }

    const partnerId = userMarriage.partner;

    let target = message.mentions.users.first() || (args[0] ? await message.client.users.fetch(args[0]).catch(() => null) : null);

    if (!target) {
      return message.channel.send({
        components: [UI.createContainer({
          description: "- <a:warn:1365688576758644797> Please mention a user or provide a valid user ID to adopt."
        })],
        flags: MessageFlags.IsComponentsV2
      });
    }

    if (target.id === message.author.id) {
      return message.channel.send({
        components: [UI.createContainer({
          description: "- <a:warn:1365688576758644797> You can't adopt yourself!"
        })],
        flags: MessageFlags.IsComponentsV2
      });
    }

    if (target.id === partnerId) {
      return message.channel.send({
        components: [UI.createContainer({
          description: "- <a:warn:1365688576758644797> You can't adopt your own spouse!"
        })],
        flags: MessageFlags.IsComponentsV2
      });
    }

    if (target.bot) {
      return message.channel.send({
        components: [UI.createContainer({
          description: "- <a:warn:1365688576758644797> You can't adopt bots!"
        })],
        flags: MessageFlags.IsComponentsV2
      });
    }

    if (userMarriage.parents && userMarriage.parents.includes(target.id)) {
      return message.channel.send({
        components: [UI.createContainer({
          description: "- <a:warn:1365688576758644797> You can't adopt your own parent!"
        })],
        flags: MessageFlags.IsComponentsV2
      });
    }

    if (marriageData[partnerId] && marriageData[partnerId].parents && marriageData[partnerId].parents.includes(target.id)) {
      return message.channel.send({
        components: [UI.createContainer({
          description: "- <a:warn:1365688576758644797> You can't adopt your partner's parent!"
        })],
        flags: MessageFlags.IsComponentsV2
      });
    }

    if (marriageData[target.id] && marriageData[target.id].parents && marriageData[target.id].parents.length > 0) {
      return message.channel.send({
        components: [UI.createContainer({
          description: "- <a:warn:1365688576758644797> This user is already adopted by other parents!"
        })],
        flags: MessageFlags.IsComponentsV2
      });
    }

    const currentChildren = userMarriage.children || [];
    if (currentChildren.length >= 15) {
      return message.channel.send({
        components: [UI.createContainer({
          description: "- <a:warn:1365688576758644797> You and your partner have reached the limit of 15 children!"
        })],
        flags: MessageFlags.IsComponentsV2
      });
    }

    if (currentChildren.some(c => c.id === target.id)) {
      return message.channel.send({
        components: [UI.createContainer({
          description: "- <a:warn:1365688576758644797> You have already adopted this user!"
        })],
        flags: MessageFlags.IsComponentsV2
      });
    }

    const partnerUser = await message.client.users.fetch(partnerId).catch(() => null);
    const partnerName = partnerUser ? partnerUser.username : 'your partner';

    const container = UI.createContainer({
      description: `👪 Hey \`${target.username}\`, \`${message.author.username}\` and \`${partnerName}\` want to adopt you as their child! Do you accept?`
    });

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("accept_adopt")
        .setLabel("Accept")
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId("reject_adopt")
        .setLabel("Reject")
        .setStyle(ButtonStyle.Danger)
    );

    container.addActionRowComponents(row);

    const msg = await message.channel.send({
      components: [container],
      flags: MessageFlags.IsComponentsV2
    });

    const filter = (interaction) => interaction.user.id === target.id;
    const collector = msg.createMessageComponentCollector({ filter, time: 20000 });

    collector.on("collect", async (interaction) => {
      if (interaction.customId === "accept_adopt") {
        const freshData = loadMarriageData();

        if (!freshData[message.author.id] || !freshData[message.author.id].partner) {
          return interaction.update({
            components: [UI.createContainer({
              description: "- <a:warn:1365688576758644797> The parents are no longer married!"
            })],
            flags: MessageFlags.IsComponentsV2
          });
        }
        if (freshData[target.id] && freshData[target.id].parents && freshData[target.id].parents.length > 0) {
          return interaction.update({
            components: [UI.createContainer({
              description: "- <a:warn:1365688576758644797> This user has already been adopted by someone else!"
            })],
            flags: MessageFlags.IsComponentsV2
          });
        }

        freshData[message.author.id].children = freshData[message.author.id].children || [];
        freshData[message.author.id].children.push({
          id: target.id,
          name: target.username,
          date: Date.now()
        });

        freshData[partnerId].children = freshData[partnerId].children || [];
        freshData[partnerId].children.push({
          id: target.id,
          name: target.username,
          date: Date.now()
        });

        freshData[target.id] = freshData[target.id] || {};
        freshData[target.id].parents = [message.author.id, partnerId];

        saveMarriageData(freshData);

        collector.stop('accepted');

        await interaction.update({
          components: [UI.createContainer({
            description: `<a:pink8:1337678972108148757> Congratulations!\n👪 \`${target.username}\` has been adopted by \`${message.author.username}\` and \`${partnerName}\`! 💕`
          })],
          flags: MessageFlags.IsComponentsV2
        });
      } else if (interaction.customId === "reject_adopt") {
        collector.stop('rejected');

        await interaction.update({
          components: [UI.createContainer({
            description: `- \`${target.username}\` has rejected the adoption proposal.`
          })],
          flags: MessageFlags.IsComponentsV2
        });
      }
    });

    collector.on("end", async (collected, reason) => {
      if (reason === 'time') {
        const timeoutContainer = UI.createContainer({
          description: "- ⏳ Time's up! No response to the adoption proposal."
        });

        const disabledRow = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId("accept_adopt")
            .setLabel("Accept")
            .setStyle(ButtonStyle.Success)
            .setDisabled(true),
          new ButtonBuilder()
            .setCustomId("reject_adopt")
            .setLabel("Reject")
            .setStyle(ButtonStyle.Danger)
            .setDisabled(true)
        );

        timeoutContainer.addActionRowComponents(disabledRow);

        msg.edit({
          components: [timeoutContainer],
          flags: MessageFlags.IsComponentsV2
        }).catch(() => { });
      }
    });
  }
};
