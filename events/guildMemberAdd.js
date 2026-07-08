const { PermissionsBitField } = require("discord.js");
const { GuildSettings, JailSetup, JailedUser, AntiBotSetup, Mute, MuteSetup, PubSetup } = require("../db/models");
const UI = require("../utils/ui");
const WelcomeService = require("../services/welcomeService");

module.exports = {
  name: "guildMemberAdd",
  async execute(member) {
    try {
      // 0. Inviter Identification (Must be done first to catch the invite use)
      let inviterData = null;
      if (member.client.inviteTracker) {
        const usedInvite = await member.client.inviteTracker.findInviter(member);
        if (usedInvite) {
          inviterData = {
            inviter: usedInvite.inviter,
            code: usedInvite.code,
            uses: usedInvite.uses
          };
          // Store purely for the logger to pick up (attaching to member object is a hack but works for sequential event handling)
          member.inviterData = inviterData;
        }
      }

      // 1. Anti-Bot Protection
      const antiBot = await AntiBotSetup.findByPk(member.guild.id);

      if (antiBot && antiBot.is_enabled && member.user.bot) {
        if (!member.guild.members.me.permissions.has(PermissionsBitField.Flags.KickMembers)) {
          console.warn(`Missing "Kick Members" permission in guild: ${member.guild.name} (${member.guild.id})`);
          return;
        }

        try {
          await member.kick("Anti-Bot: Unauthorized bot");
          console.log(`Kicked unauthorized bot: ${member.user.tag} from guild: ${member.guild.name}`);

          const settings = await GuildSettings.findOne({ where: { guild_id: member.guild.id } });
          const logChannelId = antiBot.log_channel_id || settings?.log_channel;
          const logChannel = logChannelId ? member.guild.channels.cache.get(logChannelId) : null;

          if (logChannel) {
            const logContainer = UI.createContainer({
                title: "🚫 Unauthorized Bot Kicked",
                description: `Bot **${member.user.tag}** (\`${member.id}\`) was kicked due to Anti-Bot settings.\n\n**Account Created:** <t:${Math.floor(member.user.createdTimestamp / 1000)}:R>`,
                color: 0xFF0000
            });

            await logChannel.send({
                components: [logContainer],
                flags: 128 // MessageFlags.IsComponentsV2
            });
          }
        } catch (kickError) {
          console.error(`Failed to kick bot ${member.user.tag}:`, kickError);
        }
        return; // Stop processing further if kicked
      }

      // 2. Auto-Jail Check (Must be done after Anti-Bot check)
      const jailedUser = await JailedUser.findOne({
        where: {
          guild_id: member.guild.id,
          user_id: member.id
        }
      });

      if (jailedUser) {
        const jailSettings = await JailSetup.findByPk(member.guild.id);
        if (jailSettings && jailSettings.jailed_role_id) {
          const jailRole = member.guild.roles.cache.get(jailSettings.jailed_role_id);
          if (jailRole) {
            // Remove existing roles
            await member.roles.set([jailRole], `Auto-jail on join: ${jailedUser.reason || "No reason provided"}`).catch(console.error);

            // Log it
            const logChannelId = jailSettings.logs_channel_id;
            const logChannel = logChannelId ? member.guild.channels.cache.get(logChannelId) : null;
            if (logChannel && logChannel.isTextBased()) {
              const logContainer = UI.createContainer({
                title: "User Auto-Jailed on Join",
                description: `\`${member.user.username}\` was automatically jailed because they have an active jail status.`,
                fields: [
                  { name: "User", value: `- \`${member.user.username}\` | ${member.id}` },
                  { name: "Original Reason", value: `- \`${jailedUser.reason || "No reason provided"}\`` }
                ]
              });
              await logChannel.send({
                components: [logContainer],
                flags: 128 // MessageFlags.IsComponentsV2
              }).catch(() => { });
            }
            return; // Don't give auto-roles if jailed
          }
        }
      }

      // 2.5. Mute Evasion Check
      const activeMute = await Mute.findOne({
        where: {
          guild_id: member.guild.id,
          user_id: member.id
        }
      });

      if (activeMute) {
        if (!activeMute.expires_at || activeMute.expires_at > new Date()) {
          const muteConfig = await MuteSetup.findOne({ where: { guild_id: member.guild.id } });
          if (muteConfig && muteConfig.mute_role_id) {
            const muteRole = member.guild.roles.cache.get(muteConfig.mute_role_id);
            if (muteRole) {
              await member.roles.add(muteRole, "Mute evasion protection: User was muted before leaving").catch(console.error);

              // Log it if channel exists
              const logChannelId = muteConfig.mute_logs_channel;
              const logChannel = logChannelId ? member.guild.channels.cache.get(logChannelId) : null;
              if (logChannel) {
                const logEmbed = UI.createEmbed({
                  type: 'info',
                  title: 'Mute Re-applied (Evasion Protection)',
                  description: [
                    `**User:** ${member} (\`${member.user.tag}\`)`,
                    `**Reason:** User was previously muted and the mute has not expired.`,
                    `**Status:** Mute re-applied automatically.`,
                    `**Expires:** ${activeMute.expires_at ? `<t:${Math.floor(activeMute.expires_at.getTime() / 1000)}:R>` : 'Permanent'}`
                  ].join('\n'),
                  color: 'Orange'
                });
                await logChannel.send({ embeds: [logEmbed] }).catch(() => { });
              }
            }
          }
        } else {
          // Cleanup expired mute record
          await activeMute.destroy().catch(() => { });
        }
      }

      // 3. Auto-Role Assignment
      const autoRole = await (require("../db/models/AutoRoleSetup")).findByPk(member.guild.id);
      if (autoRole && autoRole.auto_role_id) {
        const roleIds = autoRole.auto_role_id.split(',').filter(Boolean);
        for (const roleId of roleIds) {
          const role = member.guild.roles.cache.get(roleId);
          if (role) {
            await member.roles.add(role, "Auto-role assignment on join").catch(console.error);
            console.log(`Assigned auto role ${role.name} to user ${member.user.tag} in guild: ${member.guild.name}`);
          } else {
            console.warn(`Role with ID ${roleId} not found in guild: ${member.guild.name}`);
          }
        }
      }
      // 4. Pub Message
      const pubSetup = await PubSetup.findByPk(member.guild.id);
      if (pubSetup && pubSetup.is_enabled) {
        const pubMessage = `# 👋 Welcome ${member}! Thanks for joining **${member.guild.name}** ❤️\n\n> If you're enjoying ZeroLab Bots or need any help, join our **Official Support Server**.\n\n## 📥 Official Support Server for ZeroLab Bots\n• 💬 Get help from our team\n• 🐛 Report bugs & issues\n• 💡 Request new features\n• 🚀 Stay updated with the latest releases\n\n🔗 **Join:** https://discord.gg/kB2cAM897m`;
        
        // Only send to DM
        await member.send({ content: pubMessage }).catch(() => {});
      }

      // 5. Visual Welcome & Advanced Custom Welcome Roles
      await WelcomeService.handleJoin(member);
    } catch (error) {
      console.error("Error in guildMemberAdd event handler:", error);
    }
  },
};
