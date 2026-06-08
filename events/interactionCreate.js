const { EmbedBuilder, PermissionFlagsBits, MessageFlags, ActionRowBuilder, ButtonBuilder, ButtonStyle, SeparatorSpacingSize } = require("discord.js");
const UI = require('../utils/ui');

module.exports = {
  name: "interactionCreate",
  async execute(interaction) {
    try {
      // 1. Slash Commands
      if (interaction.isChatInputCommand()) {
        const command = interaction.client.slashCommands.get(interaction.commandName);
        if (!command) return;

        try {
          await command.execute(interaction);
        } catch (error) {
          if (error.code === 10062 || error.code === 40060) {
            // Ignore Unknown interaction and Interaction has already been acknowledged errors 
            // because retrying will only spawn more errors.
            return;
          }
          console.error(error);
          const errorEmbed = UI.createEmbed({
            description: "❌ An error occurred while executing this command.",
            color: "Red",
            footer: "Please report this to the developer."
          });

          if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ embeds: [errorEmbed], ephemeral: true }).catch(() => { });
          } else {
            await interaction.reply({ embeds: [errorEmbed], ephemeral: true }).catch(() => { });
          }
        }
      }

      // 2. Buttons & Select Menus
      else if (interaction.isButton() || interaction.isStringSelectMenu()) {
        // For now, we can try to find a collector or specific handler.
        // But since this is a general modernization, we often want commands to handle their own collectors.
        // However, global button handlers (like 'close' or 'back') should be here.

        if (interaction.customId === 'close_embed') {
          await interaction.message.delete().catch(() => { });
        }

        // --- Setup Hub Pagination Handler (4 Pages) ---
        if (interaction.customId.startsWith('setup_page_')) {
          const page = parseInt(interaction.customId.split('_').reverse()[0]);
          const { SeparatorSpacingSize, MediaGalleryBuilder, MediaGalleryItemBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, SectionBuilder } = require('discord.js');

          const container = UI.createContainer({
            title: `Server Setup • Page ${page}/4`,
            description: `め 」 **Manage your server configuration using the buttons below.**\n\n` +
              `Use the navigation buttons at the bottom to switch between pages.`,
            color: 0x0099ff
          });

          const createSection = (desc, label, customId) => {
            const section = new SectionBuilder();
            section.addTextDisplayComponents(td => td.setContent(`• ⌄ ${desc} ⁝`));
            section.setButtonAccessory(new ButtonBuilder().setCustomId(customId).setLabel(label).setStyle(ButtonStyle.Secondary));
            return section;
          };

          if (page === 1) {
            container.addSeparatorComponents(sep => sep.setSpacing(SeparatorSpacingSize.Small));
            container.addSectionComponents(createSection('Configure automatic role assignment for new members', 'Auto Role', 'btn_setup_autorole'));
            container.addSeparatorComponents(sep => sep.setSpacing(SeparatorSpacingSize.Small));
            container.addSectionComponents(createSection('Configure automatic nickname tags based on roles', 'Auto Tag', 'btn_setup_autotag'));
            container.addSeparatorComponents(sep => sep.setSpacing(SeparatorSpacingSize.Small));
            container.addSectionComponents(createSection('Configure staff application system', 'Staff Apply', 'btn_setup_apply'));
            container.addSeparatorComponents(sep => sep.setSpacing(SeparatorSpacingSize.Small));
            container.addSectionComponents(createSection('Configure server logging system', 'Logs Server', 'btn_setup_logs'));
          } else if (page === 2) {
            container.addSeparatorComponents(sep => sep.setSpacing(SeparatorSpacingSize.Small));
            container.addSectionComponents(createSection('Configure the warning and punishment system', 'Setup Warn', 'btn_setup_warn'));
            container.addSeparatorComponents(sep => sep.setSpacing(SeparatorSpacingSize.Small));
            container.addSectionComponents(createSection('Setup the automated and manual mute system', 'Setup Mute', 'btn_setup_mute'));
            container.addSeparatorComponents(sep => sep.setSpacing(SeparatorSpacingSize.Small));
            container.addSectionComponents(createSection('Configure the server prison/jail system', 'Setup Jail', 'btn_setup_jail'));
            container.addSeparatorComponents(sep => sep.setSpacing(SeparatorSpacingSize.Small));
            container.addSectionComponents(createSection('Configure server support/help rooms', 'Need Help', 'btn_setup_needhelp'));
          } else if (page === 3) {
            container.addSeparatorComponents(sep => sep.setSpacing(SeparatorSpacingSize.Small));
            container.addSectionComponents(createSection('Setup member verification (Identity/Gender)', 'Setup Verify', 'btn_setup_verify'));
            container.addSeparatorComponents(sep => sep.setSpacing(SeparatorSpacingSize.Small));
            container.addSectionComponents(createSection('Configure security and server owner roles', 'Set Owner', 'btn_setup_owner'));
            container.addSeparatorComponents(sep => sep.setSpacing(SeparatorSpacingSize.Small));
            container.addSectionComponents(createSection('Customize user profile cards and settings', 'Set Profile', 'btn_setup_profile'));
          } else if (page === 4) {
            container.addSeparatorComponents(sep => sep.setSpacing(SeparatorSpacingSize.Small));
            container.addSectionComponents(createSection('Configure join/leave messages and logs', 'Joins/Leaves', 'btn_setup_jl'));
            container.addSeparatorComponents(sep => sep.setSpacing(SeparatorSpacingSize.Small));
            container.addSectionComponents(createSection('Manage advanced premium-only systems', 'Premium', 'btn_setup_premium'));
          }

          // Navigation row
          const prevPage = page === 1 ? 4 : page - 1;
          const nextPage = page === 4 ? 1 : page + 1;
          const navRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId(`setup_page_${prevPage}`).setEmoji('⬅️').setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId(`setup_page_${nextPage}`).setEmoji('➡️').setStyle(ButtonStyle.Secondary)
          );

          container.addSeparatorComponents(sep => sep.setSpacing(SeparatorSpacingSize.Small));
          container.addActionRowComponents(navRow);

          const gallery = new MediaGalleryBuilder();
          gallery.addItems(new MediaGalleryItemBuilder().setURL("https://media.discordapp.net/attachments/1329547343791525989/1492418340013084742/image.png?ex=69db4264&is=69d9f0e4&hm=89a4bc524d917dafd8b093478eb186879ad2dd27be947e6b2c0bd14f944ea008&=&format=webp&quality=lossless"));
          container.addMediaGalleryComponents(gallery);

          container.addSeparatorComponents(sep => sep.setSpacing(SeparatorSpacingSize.Small));
          container.addTextDisplayComponents(td => td.setContent(`-# Powered by Zero Lab #LoadingToFuture • Setup Hub`));

          return interaction.update({
            components: [container],
            flags: MessageFlags.IsComponentsV2
          });
        }

        // --- Setup Hub Configuration Hubs (V2 Interaction Panels) ---
        const setupBackRow = new ActionRowBuilder().addComponents(
          new ButtonBuilder().setCustomId('setup_page_1').setLabel('Back to Hub').setStyle(ButtonStyle.Secondary).setEmoji('🏠')
        );

        if (interaction.customId === 'btn_setup_jail') {
          const { RoleSelectMenuBuilder } = require('discord.js');
          const container = UI.createContainer({
            title: '⛓️ Jailer Configuration',
            description: 'め 」 **Select roles to manage the server jail system.**',
            color: 0x0099ff
          });

          container.addSeparatorComponents(sep => sep.setSpacing(SeparatorSpacingSize.Small));
          container.addTextDisplayComponents(td => td.setContent('• ⌄ **Jailer Roles** : `Can issue jail commands`'));
          container.addActionRowComponents(new ActionRowBuilder().addComponents(
            new RoleSelectMenuBuilder().setCustomId('select_jailers').setPlaceholder('Choose jailer roles').setMinValues(1).setMaxValues(10)
          ));

          container.addSeparatorComponents(sep => sep.setSpacing(SeparatorSpacingSize.Small));
          container.addTextDisplayComponents(td => td.setContent('• ⌄ **Jailed Role** : `Given to restricted users`'));
          container.addActionRowComponents(new ActionRowBuilder().addComponents(
            new RoleSelectMenuBuilder().setCustomId('select_jailed').setPlaceholder('Choose jailed role')
          ));

          container.addSeparatorComponents(sep => sep.setSpacing(SeparatorSpacingSize.Small));
          container.addActionRowComponents(setupBackRow);

          return interaction.update({ components: [container], flags: MessageFlags.IsComponentsV2 });
        }

        if (interaction.customId === 'btn_setup_autorole') {
          const { RoleSelectMenuBuilder } = require('discord.js');
          const container = UI.createContainer({
            title: '⚙️ Auto Role Configuration',
            description: 'め 」 **Select roles to be automatically given to new members.**',
            color: 0x0099ff
          });

          container.addSeparatorComponents(sep => sep.setSpacing(SeparatorSpacingSize.Small));
          container.addTextDisplayComponents(td => td.setContent('• ⌄ **Auto Roles** : `Given on server join`'));
          container.addActionRowComponents(new ActionRowBuilder().addComponents(
            new RoleSelectMenuBuilder().setCustomId('select_autoroles').setPlaceholder('Choose auto-assigned roles').setMinValues(1).setMaxValues(10)
          ));

          container.addSeparatorComponents(sep => sep.setSpacing(SeparatorSpacingSize.Small));
          container.addActionRowComponents(setupBackRow);

          return interaction.update({ components: [container], flags: MessageFlags.IsComponentsV2 });
        }

        if (interaction.customId === 'btn_setup_logs') {
          const { ChannelSelectMenuBuilder, ChannelType } = require('discord.js');
          const container = UI.createContainer({
            title: '📜 Global Logging',
            description: 'め 」 **Select the main channel for server-wide audit logs.**',
            color: 0x0099ff
          });

          container.addSeparatorComponents(sep => sep.setSpacing(SeparatorSpacingSize.Small));
          container.addTextDisplayComponents(td => td.setContent('• ⌄ **Log Channel** : `Audit & event logs`'));
          container.addActionRowComponents(new ActionRowBuilder().addComponents(
            new ChannelSelectMenuBuilder().setCustomId('select_logs').setPlaceholder('Choose main logging channel').setChannelTypes([ChannelType.GuildText])
          ));

          container.addSeparatorComponents(sep => sep.setSpacing(SeparatorSpacingSize.Small));
          container.addActionRowComponents(setupBackRow);

          return interaction.update({ components: [container], flags: MessageFlags.IsComponentsV2 });
        }

        if (interaction.customId === 'btn_setup_warn') {
          const { RoleSelectMenuBuilder, ChannelSelectMenuBuilder, ChannelType } = require('discord.js');
          const container = UI.createContainer({
            title: '🛡️ Warning System',
            description: 'め 」 **Configure the server warning and moderation system.**',
            color: 0x0099ff
          });

          container.addSeparatorComponents(sep => sep.setSpacing(SeparatorSpacingSize.Small));
          container.addTextDisplayComponents(td => td.setContent('• ⌄ **Staff Roles** : `Can issue warnings`'));
          container.addActionRowComponents(new ActionRowBuilder().addComponents(
            new RoleSelectMenuBuilder().setCustomId('select_warn_staff').setPlaceholder('Choose staff roles').setMinValues(1).setMaxValues(10)
          ));

          container.addSeparatorComponents(sep => sep.setSpacing(SeparatorSpacingSize.Small));
          container.addTextDisplayComponents(td => td.setContent('• ⌄ **Final Warn Role** : `Given at 3 warns`'));
          container.addActionRowComponents(new ActionRowBuilder().addComponents(
            new RoleSelectMenuBuilder().setCustomId('select_warn_final').setPlaceholder('Choose final warn role')
          ));

          container.addSeparatorComponents(sep => sep.setSpacing(SeparatorSpacingSize.Small));
          container.addTextDisplayComponents(td => td.setContent('• ⌄ **Warn Logs** : `Warning logs only`'));
          container.addActionRowComponents(new ActionRowBuilder().addComponents(
            new ChannelSelectMenuBuilder().setCustomId('select_warn_logs').setPlaceholder('Choose warn log channel').setChannelTypes([ChannelType.GuildText])
          ));

          container.addSeparatorComponents(sep => sep.setSpacing(SeparatorSpacingSize.Small));
          container.addActionRowComponents(setupBackRow);

          return interaction.update({ components: [container], flags: MessageFlags.IsComponentsV2 });
        }

        // --- Recruitment Hub Select Menu Handler (Direct Modal Style) ---
        if (interaction.customId === 'apply_hub_dept_select') {
          const selectedDept = interaction.values[0];
          return openApplyModal(interaction, selectedDept);
        }

        // --- Apply System Button Handlers ---
        if (interaction.customId.startsWith('apply_')) {
          const clickedDept = interaction.customId.split('_')[1];
          const departmentIds = ['staff', 'designer', 'event', 'partnership'];

          if (departmentIds.includes(clickedDept)) {
            return openApplyModal(interaction, clickedDept);
          }
        }

        async function openApplyModal(interaction, clickedDept) {
          const { ApplySetup } = require('../db/models');
          const settings = await ApplySetup.findOne({ where: { guild_id: interaction.guild.id } });

          if (!settings) {
            return interaction.reply({ content: '❌ Apply system is not configured. Use `/setup-apply` first.', ephemeral: true });
          }

          const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

          const deptData = {
            staff: {
              title: 'Staff Team Application',
              questions: [
                'Why do you want to join our staff team?',
                'What experience do you have in moderation?',
                'How active can you be on a weekly basis?',
                'How would you handle a conflict between members?'
              ]
            },
            designer: {
              title: 'Designer Application',
              questions: [
                'What design software do you use?',
                'Link to your portfolio or examples of work.',
                'Describe your design style (Minimalist, etc.)',
                'Are you comfortable working with deadlines?'
              ]
            },
            event: {
              title: 'Event Hoster Application',
              questions: [
                'What kind of events would you like to host?',
                'Experience managing large groups/events?',
                'What makes a successful community event?',
                'What is your availability for hosting events?'
              ]
            },
            partnership: {
              title: 'Partnership Application',
              questions: [
                'Previous experience in server partnerships?',
                'How do you find potential partners?',
                'What are your methods for growing relationships?',
                'How many partnerships can you handle weekly?'
              ]
            }
          };

          const data = deptData[clickedDept];
          const modal = new ModalBuilder()
            .setCustomId(`apply_modal_${clickedDept}`)
            .setTitle(data.title);

          const rows = data.questions.map((q, index) => {
            const input = new TextInputBuilder()
              .setCustomId(`q_${index}`)
              .setLabel(q.length > 45 ? q.substring(0, 42) + '...' : q)
              .setPlaceholder(q)
              .setStyle(TextInputStyle.Paragraph)
              .setRequired(true);

            return new ActionRowBuilder().addComponents(input);
          });

          modal.addComponents(...rows);
          return interaction.showModal(modal);
        }

        if (interaction.customId.startsWith('apply_approve_') || interaction.customId.startsWith('apply_deny_')) {
          const { ApplySetup } = require('../db/models');
          const settings = await ApplySetup.findOne({ where: { guild_id: interaction.guild.id } });

          const parsedStaffRoles = JSON.parse(settings?.staff_role_id || '[]');
          const hasStaffRole = parsedStaffRoles.some(roleId => interaction.member.roles.cache.has(roleId));

          if (!hasStaffRole && !interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return interaction.reply({ content: '❌ Only authorized staff can review applications.', ephemeral: true });
          }

          const parts = interaction.customId.split('_');
          const action = parts[1] === 'approve' ? 'Approved' : 'Denied';
          const clickedDept = parts[2];
          const userId = parts[3];
          const user = await interaction.guild.members.fetch(userId).catch(() => null);

          const embed = new EmbedBuilder()
            .setTitle(`Application ${action}`)
            .setDescription(`The application for **${user?.user.tag || 'Unknown User'}** has been **${action.toLowerCase()}**.`)
            .addFields(
              { name: 'Department', value: `\`${clickedDept}\``, inline: true },
              { name: 'Reviewer', value: `${interaction.user} (${interaction.user.tag})`, inline: true }
            )
            .setColor(action === 'Approved' ? 'Green' : 'Red')
            .setTimestamp();

          await interaction.update({ embeds: [embed], components: [] });

          // Role assignment logic
          if (action === 'Approved' && user && settings) {
            const roleKey = `role_${clickedDept}_id`;
            const roleId = settings[roleKey];
            if (roleId) {
              await user.roles.add(roleId).catch(err => console.error("Failed to add role:", err));
            }
          }

          // Log to log channel
          if (settings.log_channel_id) {
            const logChannel = interaction.guild.channels.cache.get(settings.log_channel_id);
            if (logChannel) {
              const logEmbed = new EmbedBuilder()
                .setTitle(`Application ${action}`)
                .setDescription(`**User:** ${user || 'Unknown'}\n**Department:** \`${clickedDept}\`\n**Reviewer:** ${interaction.user}`)
                .setColor(action === 'Approved' ? 'Green' : 'Red')
                .setTimestamp();
              await logChannel.send({ embeds: [logEmbed] });
            }
          }

          // Notify User
          if (user) {
            await user.send({
              content: `Hello! Your application in **${interaction.guild.name}** for **${clickedDept}** has been **${action.toLowerCase()}**.`
            }).catch(() => { });
          }
        }

        // --- Verification Blacklist Request Handlers ---
        if (interaction.customId.startsWith('vbl_accept_') || interaction.customId.startsWith('vbl_refuse_')) {
          const { GuildSettings, VerificationBlacklist } = require('../db/models');
          const settings = await GuildSettings.findOne({ where: { guild_id: interaction.guild.id } });

          const ownerRoles = settings?.owner_role_id?.split(',') || [];
          const isOwner = interaction.member.roles.cache.some(r => ownerRoles.includes(r.id)) ||
            interaction.member.permissions.has(PermissionFlagsBits.Administrator);

          if (!isOwner) {
            return interaction.reply({ content: "- ❌ Only **Owners** or **Administrators** can approve/refuse blacklist requests!", ephemeral: true });
          }

          const [, action, targetId, verificatorId] = interaction.customId.split('_');
          const requestEmbed = interaction.message.components[0].data; // UI.createContainer returns a component

          // Note: UI.createContainer returns a ContainerBuilder which might need careful extraction if it's not raw data
          // But based on usage, it's passed to components: []

          if (action === 'accept') {
            // Re-extract reason from description if possible, or just use a generic one
            // Description was: `**Target:** <@${target.id}> (\`${target.id}\`)\n**Reason:** ${reason}\n**Requested By:** <@${message.author.id}>`
            const desc = interaction.message.embeds[0]?.description || "";
            const reasonMatch = desc.match(/\*\*Reason:\*\* (.*)\n/);
            const reason = reasonMatch ? reasonMatch[1] : "No reason provided";

            await VerificationBlacklist.upsert({
              guild_id: interaction.guild.id,
              user_id: targetId,
              reason: reason,
              verificator_id: verificatorId
            });

            await interaction.update({
              components: [UI.createContainer({
                title: 'Blacklist Request Accepted',
                description: `${desc}\n\n✅ **Accepted by:** ${interaction.user.tag}`
              })],
            });

          } else if (action === 'refuse') {
            const desc = interaction.message.embeds[0]?.description || "";
            await interaction.update({
              components: [UI.createContainer({
                title: 'Blacklist Request Refused',
                description: `${desc}\n\n❌ **Refused by:** ${interaction.user.tag}`
              })],
            });
          }
        }

        // --- Staff Need Help Management ---
        if (interaction.customId.startsWith('nh_')) {
          const NeedHelpManager = require('../utils/need-help-manager');
          await NeedHelpManager.handleButton(interaction);
        }

        // --- Invite System Buttons ---
        if (['my_invites', 'create_invite', 'invite_leaderboard', 'refresh_leaderboard', 'view_my_invites'].includes(interaction.customId)) {
          const invitesCommand = require('../commands/Member Cmds/invites.js');

          if (interaction.customId === 'create_invite') {
            const invite = await interaction.channel.createInvite({ maxAge: 0, maxUses: 0, unique: true });
            return interaction.reply({ content: `Here is your permanent invite link: ${invite.url}`, ephemeral: true });
          }

          if (interaction.customId === 'invite_leaderboard' || interaction.customId === 'refresh_leaderboard') {
            // Mock a message object so we can reuse the command's method
            const msgMock = {
              author: interaction.user,
              channel: interaction.channel,
              guild: interaction.guild,
              reply: async (opts) => {
                // If updating, we edit. If new, we reply.
                if (interaction.message && interaction.customId === 'refresh_leaderboard') {
                  await interaction.update(opts);
                } else {
                  await interaction.reply(opts);
                }
              },
              client: interaction.client
            };
            await invitesCommand.showLeaderboard(msgMock, interaction.guild);
            return;
          }

          if (interaction.customId === 'my_invites' || interaction.customId === 'view_my_invites') {
            const msgMock = {
              author: interaction.user,
              guild: interaction.guild,
              client: interaction.client,
              mentions: { users: { first: () => null } },
              reply: async (opts) => {
                await interaction.reply({ ...opts, ephemeral: true });
              },
              react: () => { }
            };
            await invitesCommand.execute(msgMock, []);
            return;
          }
        }

        // --- Setup Hub Live Selection Handlers (Direct Save) ---
        if (interaction.isRoleSelectMenu() || interaction.isChannelSelectMenu()) {
          const { JailSetup, AutoRoleSetup, LogSettings, WarnSetup } = require('../db/models');

          // 1. Jail System Handlers
          if (interaction.customId === 'select_jailers') {
            const roles = interaction.values;
            await JailSetup.upsert({ guild_id: interaction.guild.id, jailer_role: JSON.stringify(roles) });
            return interaction.reply({ content: `✅ **Jailer Roles** updated: ${roles.map(id => `<@&${id}>`).join(', ')}`, ephemeral: true });
          }
          if (interaction.customId === 'select_jailed') {
            const roleId = interaction.values[0];
            await JailSetup.upsert({ guild_id: interaction.guild.id, jail_role: roleId });
            return interaction.reply({ content: `✅ **Jailed Role** updated: <@&${roleId}>`, ephemeral: true });
          }

          // 2. Auto Role Handlers
          if (interaction.customId === 'select_autoroles') {
            const roles = interaction.values;
            await AutoRoleSetup.upsert({ guild_id: interaction.guild.id, role_ids: JSON.stringify(roles) });
            return interaction.reply({ content: `✅ **Auto Roles** updated: ${roles.map(id => `<@&${id}>`).join(', ')}`, ephemeral: true });
          }

          // 3. Logging Handlers
          if (interaction.customId === 'select_logs') {
            const channelId = interaction.values[0];
            await LogSettings.upsert({ guild_id: interaction.guild.id, log_channel_id: channelId });
            return interaction.reply({ content: `✅ **Log Channel** updated: <#${channelId}>`, ephemeral: true });
          }

          // 4. Warning System Handlers
          if (interaction.customId === 'select_warn_staff') {
            const roles = interaction.values;
            await WarnSetup.upsert({ guild_id: interaction.guild.id, warner_role: JSON.stringify(roles) });
            return interaction.reply({ content: `✅ **Staff Roles** updated: ${roles.map(id => `<@&${id}>`).join(', ')}`, ephemeral: true });
          }
          if (interaction.customId === 'select_warn_final') {
            const roleId = interaction.values[0];
            await WarnSetup.upsert({ guild_id: interaction.guild.id, warn_last: roleId });
            return interaction.reply({ content: `✅ **Final Warn Role** updated: <@&${roleId}>`, ephemeral: true });
          }
          if (interaction.customId === 'select_warn_logs') {
            const channelId = interaction.values[0];
            await WarnSetup.upsert({ guild_id: interaction.guild.id, warning_logs: channelId });
            return interaction.reply({ content: `✅ **Warn Logs** updated: <#${channelId}>`, ephemeral: true });
          }
        }
      }
      // 3. Modals
      else if (interaction.isModalSubmit()) {
        const extractId = (str) => (str.match(/\d+/) || [null])[0];
        const extractIds = (str) => str.match(/\d+/g) || [];

        // --- Warning System Modal Submit Handler ---
        if (interaction.customId === 'modal_setup_warn') {
          const { WarnSetup } = require('../db/models');

          const staffIds = interaction.fields.getRoleSelectMenuValues('warn_staff') || [];
          const role3 = interaction.fields.getRoleSelectMenuValues('role3')?.[0];
          const logs = interaction.fields.getChannelSelectMenuValues('warning_logs')?.[0];

          if (!role3 || !logs || staffIds.length === 0) {
            return interaction.reply({ content: '❌ Invalid input. Please ensure you select a role and channel.', ephemeral: true });
          }

          try {
            await WarnSetup.upsert({
              guild_id: interaction.guild.id,
              warn_last: role3,
              warner_role: JSON.stringify(staffIds),
              warning_logs: logs
            });

            const embed = UI.createEmbed({
              type: 'success',
              title: '🛡️ Warning System Configured',
              description:
                `Successfully updated your warning system settings!\n\n` +
                `**Staff Roles:** ${staffIds.map(id => `<@&${id}>`).join(', ')}\n` +
                `**Last Warn Role:** <@&${role3}>\n` +
                `**Log Channel:** <#${logs}>`,
              footer: interaction.guild.name
            });

            return interaction.reply({ embeds: [embed], ephemeral: true });
          } catch (error) {
            console.error(error);
            return interaction.reply({ content: '❌ An error occurred while saving the configuration.', ephemeral: true });
          }
        }

        // --- Jail System Modal Submit Handler ---
        if (interaction.customId === 'modal_setup_jail') {
          const { JailSetup } = require('../db/models');

          const jailerIds = interaction.fields.getRoleSelectMenuValues('jail_roles') || [];
          const jailedId = interaction.fields.getRoleSelectMenuValues('jailed_role')?.[0];

          if (!jailedId || jailerIds.length === 0) {
            return interaction.reply({ content: '❌ Invalid input. Please select roles.', ephemeral: true });
          }

          try {
            await JailSetup.upsert({
              guild_id: interaction.guild.id,
              jail_role: jailedId,
              jailer_role: JSON.stringify(jailerIds)
            });

            const embed = UI.createEmbed({
              type: 'success',
              title: '⛓️ Jail System Configured',
              description:
                `Successfully updated your jailer settings!\n\n` +
                `**Jailer Roles:** ${jailerIds.map(id => `<@&${id}>`).join(', ')}\n` +
                `**Jailed Role:** <@&${jailedId}>`,
              footer: interaction.guild.name
            });

            return interaction.reply({ embeds: [embed], ephemeral: true });
          } catch (error) {
            console.error(error);
            return interaction.reply({ content: '❌ An error occurred while saving the configuration.', ephemeral: true });
          }
        }

        // --- Auto Role Modal Submit Handler ---
        if (interaction.customId === 'modal_setup_autorole') {
          const { AutoRoleSetup } = require('../db/models');
          const roleIds = interaction.fields.getRoleSelectMenuValues('auto_roles') || [];

          if (roleIds.length === 0) {
            return interaction.reply({ content: '❌ Invalid input. Please select at least one role.', ephemeral: true });
          }

          try {
            await AutoRoleSetup.upsert({
              guild_id: interaction.guild.id,
              role_ids: JSON.stringify(roleIds)
            });

            const embed = UI.createEmbed({
              type: 'success',
              title: '⚙️ Auto Role Configured',
              description:
                `Successfully updated automatic role assignment!\n\n` +
                `**New Member Roles:** ${roleIds.map(id => `<@&${id}>`).join(', ')}`,
              footer: interaction.guild.name
            });

            return interaction.reply({ embeds: [embed], ephemeral: true });
          } catch (error) {
            console.error(error);
            return interaction.reply({ content: '❌ An error occurred while saving the configuration.', ephemeral: true });
          }
        }

        // --- Logging Modal Submit Handler ---
        if (interaction.customId === 'modal_setup_logs') {
          const { LogSettings } = require('../db/models');
          const logId = interaction.fields.getChannelSelectMenuValues('log_channel')?.[0];

          if (!logId) {
            return interaction.reply({ content: '❌ Invalid input. Please select a channel.', ephemeral: true });
          }

          try {
            await LogSettings.upsert({
              guild_id: interaction.guild.id,
              log_channel_id: logId
            });

            const embed = UI.createEmbed({
              type: 'success',
              title: '📜 Logging System Configured',
              description:
                `Successfully updated server logging!\n\n` +
                `**Main Logs Channel:** <#${logId}>`,
              footer: interaction.guild.name
            });

            return interaction.reply({ embeds: [embed], ephemeral: true });
          } catch (error) {
            console.error(error);
            return interaction.reply({ content: '❌ An error occurred while saving the configuration.', ephemeral: true });
          }
        }

        if (interaction.customId.startsWith('apply_modal_')) {
          const clickedDept = interaction.customId.split('_').pop();
          const { ApplySetup } = require('../db/models');
          const settings = await ApplySetup.findOne({ where: { guild_id: interaction.guild.id } });

          if (!settings || !settings.staff_channel_id) {
            return interaction.reply({ content: '❌ Staff channel is not configured.', ephemeral: true });
          }

          const staffChannel = interaction.guild.channels.cache.get(settings.staff_channel_id) ||
            await interaction.guild.channels.fetch(settings.staff_channel_id).catch(() => null);

          if (!staffChannel) {
            return interaction.reply({ content: '❌ Staff channel not found or inaccessible.', ephemeral: true });
          }

          const deptNames = {
            staff: 'Staff Team',
            designer: 'Designer',
            event: 'Event Hoster',
            partnership: 'Partnership'
          };

          const deptQuestions = {
            staff: [
              'Why do you want to join our staff team?',
              'What experience do you have in moderation?',
              'How active can you be on a weekly basis?',
              'How would you handle a conflict between members?'
            ],
            designer: [
              'What design software do you use?',
              'Link to your portfolio or examples of work.',
              'Describe your design style (Minimalist, etc.)',
              'Are you comfortable working with deadlines?'
            ],
            event: [
              'What kind of events would you like to host?',
              'Experience managing large groups/events?',
              'What makes a successful community event?',
              'What is your availability for hosting events?'
            ],
            partnership: [
              'Previous experience in server partnerships?',
              'How do you find potential partners?',
              'What are your methods for growing relationships?',
              'How many partnerships can you handle weekly?'
            ]
          };

          const { ActionRowBuilder, ButtonBuilder, ButtonStyle, SeparatorBuilder, SeparatorSpacingSize } = require('discord.js');

          const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
              .setCustomId(`apply_approve_${clickedDept}_${interaction.user.id}`)
              .setLabel('Approve')
              .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
              .setCustomId(`apply_deny_${clickedDept}_${interaction.user.id}`)
              .setLabel('Deny')
              .setStyle(ButtonStyle.Danger)
          );

          const container = UI.createContainer({
            title: `New ${deptNames[clickedDept]} Application`,
            description: `**User:** ${interaction.user} (\`${interaction.user.id}\`)\n**Department:** \`${deptNames[clickedDept]}\``,
            color: 0xFFFF00,
            thumbnail: interaction.user.displayAvatarURL({ dynamic: true })
          });

          deptQuestions[clickedDept].forEach((q, i) => {
            container.addSeparatorComponents(sep => sep.setSpacing(SeparatorSpacingSize.Small));
            container.addTextDisplayComponents(td => td.setContent(`### ${q}\n${interaction.fields.getTextInputValue(`q_${i}`) || 'No answer'}`));
          });

          // Nest the buttons inside the container
          container.addActionRowComponents(row);

          await staffChannel.send({
            components: [container],
            flags: MessageFlags.IsComponentsV2
          });
          await interaction.reply({ content: '✅ Your application has been submitted successfully!', ephemeral: true });
        }
      }

    } catch (error) {
      console.error("Interaction Handler Error:", error);
    }
  },
};