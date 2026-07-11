const { PermissionsBitField, AuditLogEvent } = require("discord.js");
const { GuildSettings, JailSetup, JailedUser, AntiBotSetup, Mute, MuteSetup, PubSetup, SecuritySettings, RaidProtectionSettings, TrustedEntity } = require("../db/models");
const { isExecutorTrusted, punishExecutor, logSecurityEvent } = require("../utils/securityHelper");
const UI = require("../utils/ui");
const WelcomeService = require("../services/welcomeService");

const recentJoins = new Map();

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

      const guild = member.guild;

      // 0.5. Raid Protection check (Check this extremely early to mitigate join floods)
      const raidSettings = await RaidProtectionSettings.findOne({ where: { guild_id: guild.id } });
      if (raidSettings && raidSettings.is_enabled) {
          const now = Date.now();
          let joins = recentJoins.get(guild.id) || [];
          const windowMs = (raidSettings.join_time_window_sec || 10) * 1000;
          
          joins = joins.filter(t => now - t < windowMs);
          joins.push(now);
          recentJoins.set(guild.id, joins);

          if (joins.length >= (raidSettings.join_limit || 10)) {
              // Lock down server if configured
              if (raidSettings.lock_server) {
                  await guild.roles.everyone.setPermissions(
                      guild.roles.everyone.permissions.remove(PermissionsBitField.Flags.SendMessages),
                      'Vivy Raid Protection: Server Lockdown'
                  ).catch(console.error);
              }

              // Punish the current joining user
              const punishResult = await punishExecutor(
                  guild,
                  member.id,
                  raidSettings.punishment,
                  'Vivy Raid Protection: Join limit exceeded (Raid Lockdown)'
              );

              // Log Raid Event
              await logSecurityEvent(guild, {
                  module: 'raid-protection',
                  action: 'Join Raid Detected',
                  executor: null,
                  target: member.user,
                  result: `Server lock: ${raidSettings.lock_server}. Joined user punished: ${punishResult}`,
                  logChannelId: raidSettings.log_channel_id
              });

              if (punishResult === 'Kicked' || punishResult === 'Banned') {
                  return; // Stop execution if member kicked/banned
              }
          }
      }

      // 1. Anti-Bot Protection
      const secSettings = await SecuritySettings.findOne({ where: { guild_id: guild.id } });
      if (secSettings && secSettings.anti_bot_enabled && member.user.bot) {
          // Identify inviter (executor) who added the bot
          const auditLogs = await guild.fetchAuditLogs({
              limit: 1,
              type: AuditLogEvent.BotAdd
          }).catch(() => null);

          const log = auditLogs?.entries.first();
          let executor = null;
          if (log && Date.now() - log.createdTimestamp < 8000) {
              executor = log.executor;
          }

          // Check Whitelist:
          // A. Is this bot ID whitelisted directly?
          const isBotTrusted = await TrustedEntity.findOne({
              where: { guild_id: guild.id, entity_id: member.id, type: 'bot' }
          });

          // B. Is the inviter (executor) trusted?
          const isInviterTrusted = executor ? await isExecutorTrusted(guild, executor.id) : false;

          const isWhitelisted = isBotTrusted || isInviterTrusted;

          if (!isWhitelisted) {
              // Unauthorized bot join. Execute punishment on both bot and executor!
              // 1. Kick/ban bot
              const botAction = secSettings.anti_bot_punishment === 'ban' ? 'ban' : 'kick';
              
              if (botAction === 'ban') {
                  await member.ban({ reason: 'Anti-Bot: Unauthorized bot account' }).catch(() => {});
              } else {
                  await member.kick('Anti-Bot: Unauthorized bot account').catch(() => {});
              }

              // 2. Punish inviter (executor)
              let inviterPunishmentResult = 'None';
              if (executor) {
                  inviterPunishmentResult = await punishExecutor(
                      guild,
                      executor.id,
                      secSettings.anti_bot_punishment,
                      `Vivy Anti-Bot: Unauthorized bot addition of bot "${member.user.tag}"`
                  );
              }

              // 3. Log Action
              await logSecurityEvent(guild, {
                  module: 'anti-bot',
                  action: 'Unauthorized Bot Joined',
                  executor,
                  target: member.user,
                  result: `Bot account: ${botAction}ned. Inviter punished: ${inviterPunishmentResult}`,
                  logChannelId: secSettings.log_channel_id
              });

              return; // Stop processing further for this member
          }
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
