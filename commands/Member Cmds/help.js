const {
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  MessageFlags,
  SeparatorSpacingSize
} = require('discord.js');
const Emojis = require("../../utils/emojis");
const config = require("../../config");
const { getPrefix } = require("../../db/prefix");

module.exports = {
  name: "help",
  aliases: ["h"],
  description: "Shows all available commands.",
  cooldown: 5,
  async execute(message, args) {
    const supportServerLink = "https://discord.gg/YcF9Q3ntqb";
    const botInviteLink = `https://discord.com/api/oauth2/authorize?client_id=${message.client.user.id}&permissions=8&scope=bot%20applications.commands`;
    const prefix = await getPrefix(message.guild.id);

    // Category Data (Synced with actual files)
    const categories = {
      admin: {
        name: 'Admin',
        // emoji: '👮',
        description: 'Admin & Moderation Tools',
        commands: [
          "`?addrole` - Add a role to a user.",
          "`?addemoji` - Add an emoji to the server.",
          "`?ban` - Ban a user.",
          "`?boosters` - Show server boosters.",
          "`?channel-info` - Show channel information.",
          "`?clear` - Clear messages.",
          "`?crole` - Create a role.",
          "`?embed` - Create an embed message.",
          "`?emoji-info` - Show emoji information.",
          "`?firstmessage` - Show the first message in a channel.",
          "`?hide` - Hide a channel.",
          "`?inrole` - Show users in a role.",
          "`?inviteinfo` - Show invite information.",
          "`?jail` - Jail a user.",
          "`?kick` - Kick a user.",
          "`?lock` - Lock a channel.",
          "`?membercount` - Show member count.",
          "`?move` - Move a user.",
          "`?nick` - Change nickname.",
          "`?remove-role` - Remove role.",
          "`?role-info` - Role info.",
          "`?tax` - Calc tax.",
          "`?temprole` - Temp role.",
          "`?timeout` - Timeout user.",
          "`?unban` - Unban user.",
          "`?unhide` - Unhide channel.",
          "`?unjail` - Unjail user.",
          "`?unlock` - Unlock channel.",
          "`?untimeout` - Remove timeout.",
          "`?warn` - Warn user (Slash: /warn)."
        ]
      },
      applications: {
        name: 'Applications',
        emoji: '<:staff:1369870831383220225>',
        description: 'Staff Application System',
        commands: [
          "`/setup-apply` - Configure application roles & channels.",
          "`/apply-panel` - Spawn the premium application panel.",
          "`/apply` - Submit an application (Panel-based)."
        ]
      },
      setup: {
        name: 'Setup',
        emoji: '⚙️',
        description: 'Server Configuration Guide',
        commands: [
          "`/setup` - Centralized setup dashboard (Main Guide).",
          "`/setup_warn` - Configure warning system.",
          "`/setupmute` - Configure mute system.",
          "`/setup_jail` - Configure jail system.",
          "`/set-needhelp` - Configure support room system.",
          "`/setup_verification` - Configure verification system.",
          "`/setup-logs` - Configure advanced system logging.",
          "`/setup-owner` - Configure security owner roles.",
          "`/setup-profile` - Configure user profile cards.",
          "`/setup-premium` - Configure premium features."
        ]
      },
      economy: {
        name: 'Economy',
        emoji: '💰',
        description: 'Economy System',
        commands: [
          "`?bal` - Check your balance.",
          "`?daily` - Claim daily rewards.",
          "`?transfer` - Transfer money.",
          "`?shop` - Open the shop.",
          "`?top` - Show economy leaderboard."
        ]
      },
      fun: {
        name: 'Fun',
        emoji: '🎉',
        description: 'Fun & Games',
        commands: [
          "`?cat` - Random cat.",
          "`?cringe` - Cringe meter.",
          "`?dance` - Dance.",
          "`?gender` - Check gender.",
          "`?howgay` - Gay rate.",
          "`?hug` - Hug a user.",
          "`?love` - Love calc.",
          "`?roll` - Roll dice.",
          "`?slap` - Slap user.",
          "`?smile` - Smile."
        ]
      },
      info: {
        name: 'Info',
        emoji: 'ℹ️',
        description: 'Information',
        commands: [
          "`?avatar` - User avatar.",
          "`?avatar-server` - Server avatar.",
          "`?banner` - User banner.",
          "`?banner-server` - Server banner.",
          "`?channelinfo` - Channel info.",
          "`?invite` - Bot invite.",
          "`?invites` - User invites count.",
          "`?membercount` - Member count.",
          "`?ping` - Bot latency.",
          "`?serverinfo` - Server info.",
          "`?topinvites` - Server invite leaderboard.",
          "`?user` - User info."
        ]
      },
      voice: {
        name: 'Voice',
        emoji: '🎤',
        description: 'Voice Management',
        commands: [
          "`?find` - Find in voice.",
          "`?join` - Make bot join vc.",
          "`?vclist` - List voice users.",
          "`?vdeafen` - Voice deafen.",
          "`?vkick` - Voice kick.",
          "`?vmute` - Mute in voice.",
          "`?vundeafen` - Undeafen.",
          "`?vunmute` - Unmute.",
          "`?stats-voice` - Voice activity stats."
        ]
      },
      marriage: {
        name: 'Marriage',
        emoji: '💍',
        description: 'Marriage System',
        commands: [
          "`?marry` - Marry a user.",
          "`?divorce` - Divorce your partner.",
          "`?marriage` - Check marriage stats."
        ]
      },
      verification: {
        name: 'Verification',
        emoji: '✅',
        description: 'Verification System',
        commands: [
          "`?vb` - Verify member.",
          "`?vg` - Verify female.",
          "`/setup-verif` - Setup."
        ]
      },
      jail: {
        name: 'Jail',
        emoji: '⛓️',
        description: 'Jail System',
        commands: [
          "`?jail` - Jail user.",
          "`?unjail` - Unjail user.",
          "`/setup-jail` - Configure."
        ]
      },
      security: {
        name: 'Security',
        emoji: '🛡️',
        description: 'Security Tools',
        commands: [
          "`?antibots` - Anti-Bot.",
          "`?antilink` - Anti-Link.",
          "`?antilink-stats` - Stats.",
          "`?antilink-whitelist` - Whitelist.",
          "`?antiwebhook` - Anti-Webhook.",
          "`?setup-owner` - Setup Security Owner Roles.",
          "`?setup-logs` - Configure Security Log Channels."
        ]
      },
      premium: {
        name: 'Premium',
        emoji: '💎',
        description: 'Premium Plan Management',
        commands: [
          "`?pcreate` - Create a premium plan for a user.",
          "`?pdelete` - Delete a premium plan.",
          "`?pshowall` - Show all premium plans (Manager).",
          "`?plist` - List members in your plan.",
          "`?padd` - Add user to your plan.",
          "`?premove` - Remove user from your plan.",
          "`?pmadd` - Add manager to your plan.",
          "`?pmremove` - Remove manager from your plan.",
          "`?pname` - Rename your plan.",
          "`?pcolor` - Change plan role color.",
          "`?picon` - Change plan role icon.",
          "`?pdebug` - Debug premium system."
        ]
      }
    };

    // Helper to send error (Style matching user example)
    async function sendErrorMessage(msg, content) {
      const errorContainer = new ContainerBuilder()
        .setAccentColor(0xFF0000)
        .addTextDisplayComponents(td => td.setContent(`❌ **Error**\n${content}`));

      return msg.channel.send({
        components: [errorContainer],
        flags: MessageFlags.IsComponentsV2,
      });
    }

    try {
      // Create select menu options
      const selectMenuOptions = Object.entries(categories).map(([key, category]) =>
        new StringSelectMenuOptionBuilder()
          .setLabel(` ${category.name} `)
          .setDescription(category.description)
          .setValue(key)
          .setEmoji('1481789552401318048') // Custom folder emoji ID
      );

      // Create select menu
      const selectMenu = new StringSelectMenuBuilder()
        .setCustomId('help_category_select')
        .setPlaceholder('Select a category to view commands')
        .addOptions(selectMenuOptions);

      // Build main container
      const mainContainer = new ContainerBuilder()
        .addTextDisplayComponents(td => td.setContent(`# __${message.client.user.username} Help__`))
        .addTextDisplayComponents(td => td.setContent(`> Welcome to **${message.guild.name}**! Choose a category below to see available commands.\n> Current Prefix: \`${prefix}\``))
        .addSeparatorComponents(sep => sep.setSpacing(SeparatorSpacingSize.Large))
        .addTextDisplayComponents(td => td.setContent(`## Select a category to view commands`))
        .addActionRowComponents(row => row.setComponents(selectMenu))
        .addSeparatorComponents(sep => sep.setSpacing(SeparatorSpacingSize.Large))
        .addTextDisplayComponents(td => td.setContent(`-# © Powered by: Zero Lab`));

      let initialComponents = [mainContainer];

      if (args.length > 0) {
        const query = args[0].toLowerCase();
        const foundCategoryKey = Object.keys(categories).find(key => key.toLowerCase() === query || categories[key].name.toLowerCase() === query);

        if (foundCategoryKey) {
          const category = categories[foundCategoryKey];
          const categoryContainer = new ContainerBuilder()
            .addTextDisplayComponents(td => td.setContent(category.emoji ? `# ${category.emoji} ${category.name} Commands` : `# ${category.name} Commands`))
            .addTextDisplayComponents(td => td.setContent(`*Requested by ${message.author.tag}*`))
            .addSeparatorComponents(sep => sep.setSpacing(SeparatorSpacingSize.Small))
            .addTextDisplayComponents(td => td.setContent(`## Available Commands`))
            .addTextDisplayComponents(td => td.setContent(category.commands.join('\n')))
            .addSeparatorComponents(sep => sep.setSpacing(SeparatorSpacingSize.Small))
            .addTextDisplayComponents(td => td.setContent(`*${category.commands.length} commands available in this category*`))
            .addActionRowComponents(row => row.setComponents(selectMenu))
            .addActionRowComponents(row => row.setComponents(
              new ButtonBuilder()
                .setCustomId('help_home')
                .setLabel('Home')
                .setStyle(ButtonStyle.Secondary)
                .setEmoji('<:zerolab:1481778588456980543>')
                .setDisabled(false)
            ))
            .addTextDisplayComponents(td => td.setContent(`-# © Powered by: Zero Lab`));
          initialComponents = [categoryContainer];
        }
      }

      // Send initial message
      const reply = await message.reply({
        components: initialComponents,
        flags: MessageFlags.IsComponentsV2,
      });

      // Create interaction collector
      const filter = (i) => i.user.id === message.author.id;
      const collector = reply.createMessageComponentCollector({
        filter,
        time: 120000 // 2 minutes
      });

      collector.on('collect', async (interaction) => {
        try {
          if (interaction.customId === 'help_home') {
            // Reset to Home
            // Rebuild Main Container but with Home button disabled
            // (The mainContainer above already has it disabled, so we can reuse logic)
            await interaction.update({
              components: [mainContainer],
              flags: MessageFlags.IsComponentsV2
            });
            return;
          }

          const selectedCategory = interaction.values[0];
          const category = categories[selectedCategory];

          if (!category) return;

          // Build category response
          const categoryContainer = new ContainerBuilder()
            .addTextDisplayComponents(td => td.setContent(category.emoji ? `# ${category.emoji} ${category.name} Commands` : `# ${category.name} Commands`))
            .addTextDisplayComponents(td => td.setContent(`*Requested by ${interaction.user.tag}*`))
            .addSeparatorComponents(sep => sep.setSpacing(SeparatorSpacingSize.Small))
            .addTextDisplayComponents(td => td.setContent(`## Available Commands`))
            .addTextDisplayComponents(td => td.setContent(category.commands.join('\n')))
            .addSeparatorComponents(sep => sep.setSpacing(SeparatorSpacingSize.Small))
            .addTextDisplayComponents(td => td.setContent(`*${category.commands.length} commands available in this category*`))
            .addActionRowComponents(row => row.setComponents(selectMenu)) // Keep menu available
            .addActionRowComponents(row => row.setComponents(
              new ButtonBuilder()
                .setCustomId('help_home')
                .setLabel('Home')
                .setStyle(ButtonStyle.Secondary)
                .setEmoji('<:zerolab:1481778588456980543>')
                .setDisabled(false) // Enable Home button
            ))
            .addTextDisplayComponents(td => td.setContent(`-# © Powered by: Zero Lab`));

          await interaction.update({
            components: [categoryContainer],
            flags: MessageFlags.IsComponentsV2
          });

        } catch (error) {
          console.error('Error handling interaction:', error);
        }
      });

      collector.on('end', async () => {
        // Disable components
        try {
          const disabledMenu = StringSelectMenuBuilder.from(selectMenu).setDisabled(true).setPlaceholder('❌ Menu Expired');
          const expiredContainer = new ContainerBuilder()
            .addTextDisplayComponents(td => td.setContent(`# Help Menu Expired`))
            .addTextDisplayComponents(td => td.setContent(`Please run \`&help\` again to view commands.`))
            .addActionRowComponents(row => row.setComponents(disabledMenu));

          await reply.edit({
            components: [expiredContainer],
            flags: MessageFlags.IsComponentsV2
          }).catch(() => { });
        } catch (err) { }
      });

    } catch (error) {
      console.error('Critical error in help command:', error);
      sendErrorMessage(message, 'An unexpected error occurred.');
    }
  },
};