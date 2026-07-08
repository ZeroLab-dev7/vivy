const { PermissionsBitField, MessageFlags } = require("discord.js");
const { JailSetup, JailedUser } = require("../../db/models");
const UI = require("../../utils/ui");
const Emojis = require("../../utils/emojis");

const COOLDOWN_TIME = 5000;
const cooldowns = new Map();

module.exports = {
  name: "jail",
  description: "Jail a user.",
  aliases: ["jail", "eject"],
  async execute(message, args) {
    if (cooldowns.has(message.author.id)) {
      return message.react('⏳');
    }
    cooldowns.set(message.author.id, Date.now() + COOLDOWN_TIME);
    setTimeout(() => cooldowns.delete(message.author.id), COOLDOWN_TIME);

    if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      // Logic for jailer roles will check later, but administrators always pass
    }

    const targetId = message.mentions.users.first()?.id || args[0];

    if (!targetId) {
      return message.reply({
        components: [UI.createContainer({
          title: 'Command: jail',
          description: "Jail a user from the server.",
          footer: `Requested by ${message.author.tag}`,
          fields: [
            { name: "Aliases:", value: "- jail, eject" },
            { name: "Usage:", value: "- ?jail @user/id (reason)" },
            { name: "Examples:", value: `- ?jail <@${message.author.id}> advertisement` }
          ]
        })],
        flags: MessageFlags.IsComponentsV2
      });
    }

    // Modern DB Fetch
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

    // Parse jailer roles (handle both old single ID and new array string)
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
          description: `- ${Emojis.Anim.warn} You need the Jail role or Administrator permission to jail someone.`
        })],
        flags: MessageFlags.IsComponentsV2
      });
    }

    const reason = args.slice(1).join(" ") || "No reason provided";

    // Try to fetch member in case they are in the server
    const guildMember = await message.guild.members.fetch(targetId).catch(() => null);

    // Hierarchy check
    if (guildMember && (guildMember.roles.highest.position >= message.member.roles.highest.position && !message.member.permissions.has(PermissionsBitField.Flags.Administrator))) {
      return message.reply({
        components: [UI.createContainer({
          description: `- ${Emojis.Anim.warn} You cannot jail a user with a higher or equal role position.`
        })],
        flags: MessageFlags.IsComponentsV2
      });
    }

    // Capture roles or preserve existing ones
    const existingJail = await JailedUser.findOne({ where: { guild_id: message.guild.id, user_id: targetId } });
    let rolesToSave = [];

    if (existingJail && existingJail.roles) {
      try {
        rolesToSave = JSON.parse(existingJail.roles);
      } catch {
        rolesToSave = [];
      }
    } else if (guildMember) {
      rolesToSave = guildMember.roles.cache
        .filter(role => role.id !== message.guild.id && !role.managed && role.id !== jailed_role_id)
        .map(role => role.id);
    }

    if (guildMember) {
      // Remove current roles
      const currentRoles = guildMember.roles.cache
        .filter(role => role.id !== message.guild.id && !role.managed)
        .map(role => role.id);

      await guildMember.roles.remove(currentRoles).catch(() => {
        return message.reply({
          components: [UI.createContainer({
            description: `- ${Emojis.Anim.warn} Failed to remove roles. Check bot permissions.`
          })],
          flags: MessageFlags.IsComponentsV2
        });
      });

      await guildMember.roles.add(jailedRoleObject).catch(() => {
        return message.reply({
          components: [UI.createContainer({
            description: `- ${Emojis.Anim.warn} An error occurred while adding the jailed role.`
          })],
          flags: MessageFlags.IsComponentsV2
        });
      });

      const dmContainer = UI.createContainer({
        title: `You Have Been Jailed in ${message.guild.name}`,
        description: `- ${Emojis.Static.warning} You have been **Jailed** in the server **__${message.guild.name}__**.\n\n**Reason:** \`${reason}\``
      });

      const buttonRow = UI.createButtons([{
        customId: "sent-from",
        label: `Sent From: ${message.guild.name}`,
        style: 2, // Secondary
        disabled: true
      }]);

      try {
        await guildMember.send({
          components: [dmContainer, buttonRow],
          flags: MessageFlags.IsComponentsV2
        });
      } catch (error) {
        console.log("Could not DM user.");
      }
    }

    // Save jail status in database with captured roles
    await JailedUser.upsert({
      guild_id: message.guild.id,
      user_id: targetId,
      reason: reason,
      jailer_id: message.author.id,
      roles: JSON.stringify(rolesToSave)
    });

    const targetUser = guildMember?.user || await message.client.users.fetch(targetId).catch(() => null);
    const targetName = targetUser ? targetUser.username : targetId;

    const successContainer = UI.createContainer({
      description: `- ${Emojis.Anim.done} Successfully jailed \`${targetName}\``
    });
    await message.reply({
      components: [successContainer],
      flags: MessageFlags.IsComponentsV2
    });

    const channel = message.guild.channels.cache.get(logs_channel_id);
    if (channel && channel.isTextBased()) {
      const logContainer = UI.createContainer({
        title: "Member Has Been Jailed",
        description: `\`${targetName}\` has been successfully jailed${guildMember ? "" : " (User is not in server, will be jailed upon joining)"}.`,
        fields: [
          { name: "Jailed User", value: `- \`${targetName}\` | ${targetId}` },
          { name: "Jailed By", value: `- \`${message.author.username}\` | ${message.author.id}` },
          { name: "Reason", value: `- \`${reason}\`` }
        ],
        footer: `Requested by ${message.author.tag}`
      });
      await channel.send({
        components: [logContainer],
        flags: MessageFlags.IsComponentsV2
      });
    }
  },
};
