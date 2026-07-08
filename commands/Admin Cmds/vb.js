const { ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits, MessageFlags, EmbedBuilder } = require("discord.js");
const UI = require('../../utils/ui');
const VerificationRoles = require("../../db/models/VerificationRoles");
const VerifiedUsers = require("../../db/models/VerifiedUsers");
const VerificationBlacklist = require("../../db/models/VerificationBlacklist");

module.exports = {
  name: "verify-boy",
  aliases: ['vb', 'boy', 'verifyboy'],
  usage: "verify-boy <@user/id>",
  description: "Verify a user as male",
  async execute(message, args) {
    try {
      if (args.length === 0) {
        return message.reply({
          components: [UI.createContainer({
            title: 'Verification Help',
            footer: `Requested by ${message.author.tag}`,
            fields: [
              { name: "Aliases:", value: "- verify-boy, verifyboy" },
              { name: "Usage:", value: "- ?vb @user/id" },
              { name: "Examples:", value: `- ?vb ${message.author.username}` }
            ]
          })],
          flags: MessageFlags.IsComponentsV2
        });
      }

      const target =
        message.mentions.members.first() ||
        (await message.guild.members.fetch(args[0]).catch(() => null));

      if (!target) {
        return message.reply({
          components: [UI.createContainer({
            description: "- <:false:1365517000750661693> Please mention a user or provide their ID!"
          })],
          flags: MessageFlags.IsComponentsV2
        });
      }

      const rolesData = await VerificationRoles.findByPk(message.guild.id);
      if (!rolesData) {
        return message.reply({
          components: [UI.createContainer({
            description: "- Verification system is not set up in this server!"
          })],
          flags: MessageFlags.IsComponentsV2
        });
      }

      // Security Check: Blacklist
      const blacklistEntry = await VerificationBlacklist.findOne({
        where: {
          guild_id: message.guild.id,
          user_id: target.id
        }
      });

      if (blacklistEntry) {
        return message.reply({
          components: [UI.createContainer({
            description: `- ❌ This user is blocked from verification!\n**Reason:** ${blacklistEntry.reason}\n**Blacklisted By ID:** \`${blacklistEntry.verificator_id}\``
          })],
          flags: MessageFlags.IsComponentsV2
        });
      }

      // Security Check: Permissions
      const hasVerificatorRole = message.member.roles.cache.has(rolesData.verificator_role);
      const hasManageRoles = message.member.permissions.has(PermissionFlagsBits.ManageRoles);

      if (!hasVerificatorRole && !hasManageRoles) {
        return message.reply({
          components: [UI.createContainer({
            description: "- You need **Manage Roles** permission or **Verificator Role** to use this command!"
          })],
          flags: MessageFlags.IsComponentsV2
        });
      }

      const verifiedRole = message.guild.roles.cache.get(rolesData.verified_role);
      const unverifiedRole = message.guild.roles.cache.get(rolesData.unverified_role);

      if (!verifiedRole || !unverifiedRole) {
        return message.reply({
          components: [UI.createContainer({
            description: "- Some verification roles are missing. Please check the setup!"
          })],
          flags: MessageFlags.IsComponentsV2
        });
      }

      if (target.roles.cache.has(verifiedRole.id)) {
        return message.reply({
          components: [UI.createContainer({
            description: `- \`${target.user.username}\` is already verified!`
          })],
          flags: MessageFlags.IsComponentsV2
        });
      }

      // Parallelize role addition and removal
      const roleUpdates = [
        target.roles.add(verifiedRole),
        target.roles.remove(unverifiedRole)
      ];

      // Parallelize DB updates
      const dbUpdate = VerifiedUsers.upsert({
        guild_id: message.guild.id,
        user_id: target.id,
        username: target.user.username,
        verificator_id: message.author.id,
        gender: "male"
      }).catch(dbError => console.error("Database Error (Add Verified User):", dbError));

      await Promise.all([...roleUpdates, dbUpdate]);

      const logChannel = message.guild.channels.cache.get(rolesData.verification_logs);

      // Prepare DM and Log containers
      const dmContainer = UI.createContainer({
        title: `Verified in ${message.guild.name}`,
        description: `-  Congrats, you're **Verified** in the server **__${message.guild.name}__**`
      });

      const buttonRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("sent-from")
          .setLabel(`Sent From: ${message.guild.name}`)
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(true)
      );

      // Execute non-blocking actions (DM and Logging)
      (async () => {
        try {
          await target.send({
            components: [dmContainer, buttonRow],
            flags: MessageFlags.IsComponentsV2
          });
        } catch (error) {
          console.error(`Could not DM user ${target.user.tag}:`, error.message);
        }

        if (logChannel) {
          const logContainer = UI.createContainer({
            title: 'Member Has Been Verified',
            description: `- \`${target.user.username}\` has been Successfully verified.\n\n**Verified User:**\n \`${target.user.username}\` | ${target.id}\n\n**Verification Type:**\n\`Male\`\n\n**Verified By:**\n \`${message.author.username}\` | ${message.author.id}`,
          });

          await logChannel.send({
            components: [logContainer],
            flags: MessageFlags.IsComponentsV2
          }).catch(() => { });
        }
      })();

      // Send Success Embed to admin immediately
      await message.reply({
        components: [UI.createContainer({
          description: `- \`${target.user.username}\` Successfully verified.`
        })],
        flags: MessageFlags.IsComponentsV2
      });

    } catch (error) {
      console.error("Verify Boy Error:", error);
      message.reply("- An error occurred while verifying the user. Please check my permissions and try again.");
    }
  },
};
