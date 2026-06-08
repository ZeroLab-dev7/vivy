const { PermissionsBitField, MessageFlags } = require("discord.js");
const { JailSetup, JailedUser } = require("../../db/models");
const UI = require("../../utils/ui");
const Emojis = require("../../utils/emojis");

module.exports = {
  name: "unjail",
  description: "Unjail a user.",
  aliases: ["unjail", "release"],
  async execute(message, args) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      // Logic for jailer roles will check later
    }

    const targetId = message.mentions.users.first()?.id || args[0];

    if (!targetId) {
      return message.reply({
        components: [UI.createContainer({
          title: 'Command: unjail',
          description: "Unjail a user from the server.",
          footer: `Requested by ${message.author.tag}`,
          fields: [
            { name: "Aliases:", value: "- unjail, release" },
            { name: "Usage:", value: "- &unjail @user/id" },
            { name: "Examples:", value: `- &unjail <@${message.author.id}>` }
          ]
        })],
        flags: MessageFlags.IsComponentsV2
      });
    }

    const settings = await JailSetup.findByPk(message.guild.id);
    if (!settings) {
      return message.reply({
        components: [UI.createContainer({
          description: `- ${Emojis.Anim.warn} Jail system not set up. Run \`/setupjail\` to configure.`
        })],
        flags: MessageFlags.IsComponentsV2
      });
    }

    const { jailed_role_id, jailer_role_id, logs_channel_id } = settings;
    const jailedRoleObject = message.guild.roles.cache.get(jailed_role_id);

    // Parse jailer roles
    let jailerRoleIds = [];
    try {
      jailerRoleIds = JSON.parse(jailer_role_id);
      if (!Array.isArray(jailerRoleIds)) jailerRoleIds = [jailer_role_id];
    } catch {
      jailerRoleIds = [jailer_role_id];
    }

    if (!jailedRoleObject) {
      return message.reply({
        components: [UI.createContainer({
          description: `- ${Emojis.Anim.warn} The specified jailed role does not exist.`
        })],
        flags: MessageFlags.IsComponentsV2
      });
    }

    const hasPermission = message.member.permissions.has(PermissionsBitField.Flags.Administrator) ||
      message.member.roles.cache.some(r => jailerRoleIds.includes(r.id));

    if (!hasPermission) {
      return message.reply({
        components: [UI.createContainer({
          description: `- ${Emojis.Anim.warn} You need the Jail role or Administrator permission to unjail someone.`
        })],
        flags: MessageFlags.IsComponentsV2
      });
    }

    const guildMember = await message.guild.members.fetch(targetId).catch(() => null);

    // Hierarchy check
    if (guildMember && (guildMember.roles.highest.position >= message.member.roles.highest.position && !message.member.permissions.has(PermissionsBitField.Flags.Administrator))) {
      return message.reply({
        components: [UI.createContainer({
          description: `- ${Emojis.Anim.warn} You cannot unjail a user with a higher or equal role position.`
        })],
        flags: MessageFlags.IsComponentsV2
      });
    }

    // Get user data before destroying record
    const jailedUserData = await JailedUser.findOne({
      where: {
        guild_id: message.guild.id,
        user_id: targetId
      }
    });

    if (!jailedUserData) {
      return message.reply({
        components: [UI.createContainer({
          description: `- ${Emojis.Anim.warn} This user is not jailed.`
        })],
        flags: MessageFlags.IsComponentsV2
      });
    }

    // Remove from database
    await JailedUser.destroy({
      where: {
        guild_id: message.guild.id,
        user_id: targetId
      }
    });

    // Use the already fetched guildMember
    if (guildMember) {
      // Remove jailed role
      await guildMember.roles.remove(jailedRoleObject).catch(() => { });

      // Restore saved roles
      try {
        if (jailedUserData.roles) {
          const rolesToRestore = JSON.parse(jailedUserData.roles);
          if (Array.isArray(rolesToRestore) && rolesToRestore.length > 0) {
            // Filter out roles that might have been deleted or are higher than the bot's permission
            const validRoles = rolesToRestore.filter(roleId => message.guild.roles.cache.has(roleId));
            if (validRoles.length > 0) {
              await guildMember.roles.add(validRoles, "Restoring roles after unjail").catch(err => {
                console.error("Failed to restore some roles:", err);
              });
            }
          }
        }
      } catch (e) {
        console.error("Error parsing/restoring roles:", e);
      }

      const dmContainer = UI.createContainer({
        title: `You Have Been Released in ${message.guild.name}`,
        description: `- ${Emojis.Anim.done} You are now **unjailed** in **__${message.guild.name}__**.`
      });

      try {
        await guildMember.send({
          components: [dmContainer],
          flags: MessageFlags.IsComponentsV2
        });
      } catch (error) {
        console.log("Could not DM user.");
      }
    }

    const targetUser = guildMember?.user || await message.client.users.fetch(targetId).catch(() => null);
    const targetName = targetUser ? targetUser.username : targetId;

    const successContainer = UI.createContainer({
      description: `- ${Emojis.Anim.done} Successfully unjailed \`${targetName}\``
    });
    await message.reply({
      components: [successContainer],
      flags: MessageFlags.IsComponentsV2
    });

    const channel = message.guild.channels.cache.get(logs_channel_id);
    if (channel && channel.isTextBased()) {
      const logContainer = UI.createContainer({
        title: "Member Has Been Unjailed",
        description: `\`${targetName}\` has been successfully unjailed.`,
        fields: [
          { name: "Unjailed User", value: `- \`${targetName}\` | ${targetId}` },
          { name: "Unjailed By", value: `- \`${message.author.username}\` | ${message.author.id}` }
        ],
        footer: `Requested by ${message.author.tag}`
      });

      await channel.send({
        components: [logContainer],
        flags: MessageFlags.IsComponentsV2
      }).catch(() => { });
    }
  },
};
