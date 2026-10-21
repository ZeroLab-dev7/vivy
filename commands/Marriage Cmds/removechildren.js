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
  name: 'removechildren',
  aliases: ['disown', 'removechild'],
  description: 'Remove/disown one or all of your children.',
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
          description: "- <a:warn:1365688576758644797> You must be married to manage children!"
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
    let target = null;
    if (args[0]) {
      target = message.mentions.users.first() || await message.client.users.fetch(args[0]).catch(() => null);
      if (!target) {
        return message.channel.send({
          components: [UI.createContainer({
            description: "- <a:warn:1365688576758644797> Could not find the specified child user. Please mention them or use a valid user ID."
          })],
          flags: MessageFlags.IsComponentsV2
        });
      }
    }

    if (target) {
      const childIndex = userData.children.findIndex(c => c.id === target.id);
      if (childIndex === -1) {
        return message.channel.send({
          components: [UI.createContainer({
            description: `- <a:warn:1365688576758644797> **${target.username}** is not your child.`
          })],
          flags: MessageFlags.IsComponentsV2
        });
      }

      userData.children.splice(childIndex, 1);

      if (marriageData[partnerId] && marriageData[partnerId].children) {
        const partnerChildIndex = marriageData[partnerId].children.findIndex(c => c.id === target.id);
        if (partnerChildIndex !== -1) {
          marriageData[partnerId].children.splice(partnerChildIndex, 1);
        }
      }

      if (marriageData[target.id]) {
        const parents = [message.author.id, partnerId];
        marriageData[target.id].parents = (marriageData[target.id].parents || []).filter(p => !parents.includes(p));
        if (marriageData[target.id].parents.length === 0) {
          delete marriageData[target.id].parents;
        }
        if (!marriageData[target.id].partner && !marriageData[target.id].parents && (!marriageData[target.id].children || marriageData[target.id].children.length === 0)) {
          delete marriageData[target.id];
        }
      }

      saveMarriageData(marriageData);

      return message.channel.send({
        components: [UI.createContainer({
          description: `👶 You have successfully disowned/removed **${target.username}** from your family.`
        })],
        flags: MessageFlags.IsComponentsV2
      });
    } else {
      const confirmContainer = UI.createContainer({
        description: "👪 Are you sure you want to disown **ALL** of your children?"
      });

      const buttons = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("confirm_disown_all")
          .setLabel("Accept")
          .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
          .setCustomId("cancel_disown_all")
          .setLabel("Cancel")
          .setStyle(ButtonStyle.Danger)
      );

      confirmContainer.addActionRowComponents(buttons);

      const msg = await message.channel.send({
        components: [confirmContainer],
        flags: MessageFlags.IsComponentsV2
      });

      const filter = (interaction) => interaction.user.id === message.author.id;
      const collector = msg.createMessageComponentCollector({ filter, time: 15000 });

      collector.on("collect", async (interaction) => {
        if (interaction.customId === "confirm_disown_all") {
          const freshData = loadMarriageData();
          const freshUser = freshData[message.author.id];
          const parents = [message.author.id, partnerId];

          if (freshUser && freshUser.children) {
            for (const child of freshUser.children) {
              if (freshData[child.id]) {
                freshData[child.id].parents = (freshData[child.id].parents || []).filter(p => !parents.includes(p));
                if (freshData[child.id].parents.length === 0) {
                  delete freshData[child.id].parents;
                }
                if (!freshData[child.id].partner && !freshData[child.id].parents && (!freshData[child.id].children || freshData[child.id].children.length === 0)) {
                  delete freshData[child.id];
                }
              }
            }

            freshUser.children = [];
            if (freshData[partnerId]) {
              freshData[partnerId].children = [];
            }

            saveMarriageData(freshData);
          }

          collector.stop('disowned');

          await interaction.update({
            components: [UI.createContainer({
              description: "👶 You have successfully disowned/removed all of your children."
            })],
            flags: MessageFlags.IsComponentsV2
          });
        } else {
          collector.stop('cancelled');

          await interaction.update({
            components: [UI.createContainer({
              description: "<:no:1526496561188831244>Action cancelled."
            })],
            flags: MessageFlags.IsComponentsV2
          });
        }
      });

      collector.on("end", async (collected, reason) => {
        if (reason === 'time') {
          const timeoutContainer = UI.createContainer({
            description: "- ⏳ Time's up! Action cancelled."
          });

          const disabledButtons = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
              .setCustomId("confirm_disown_all")
              .setLabel("Accept")
              .setStyle(ButtonStyle.Success)
              .setDisabled(true),
            new ButtonBuilder()
              .setCustomId("cancel_disown_all")
              .setLabel("Cancel")
              .setStyle(ButtonStyle.Danger)
              .setDisabled(true)
          );

          timeoutContainer.addActionRowComponents(disabledButtons);

          msg.edit({
            components: [timeoutContainer],
            flags: MessageFlags.IsComponentsV2
          }).catch(() => { });
        }
      });
    }
  }
};
