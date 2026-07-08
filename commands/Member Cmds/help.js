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
  SeparatorSpacingSize,
  MediaGalleryBuilder,
  MediaGalleryItemBuilder
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
      general: {
        name: 'General & Info',
        emoji: 'ℹ️',
        description: 'General, Information, Fun, and Voice commands',
        commands: [
          "`?ping` - Bot latency.",
          "`?user` - User info.",
          "`?serverinfo` - Server info.",
          "`?avatar` - User avatar.",
          "`/avatar` - User avatar (Slash).",
          "`?serveravatar` - Server avatar.",
          "`?banner` - User banner.",
          "`/banner` - User banner (Slash).",
          "`?serverbanner` - Server banner.",
          "`?membercount` - Member count.",
          "`?channelinfo` - Show channel information.",
          "`?invites` - User invites count.",
          "`?topinvites` - Server invite leaderboard.",
          "`/vc` - Server voice stats (Slash).",
          "`?find` - Find in voice.",
          "`?join` - Make bot join vc.",
          "`?vclist` - List voice users.",
          "`?vdeafen` - Voice deafen.",
          "`?vkick` - Voice kick.",
          "`?vmute` - Mute in voice.",
          "`?vundeafen` - Undeafen.",
          "`?vunmute` - Unmute.",
          "`?stats-voice` - Voice activity stats.",
          "`?cat` - Random cat.",
          "`?cringe` - Cringe meter.",
          "`?dance` - Dance.",
          "`?gender` - Check gender.",
          "`?howgay` - Gay rate.",
          "`?hug` - Hug a user.",
          "`?kiss` - Kiss a user.",
          "`?love` - Love calc.",
          "`?roll` - Roll dice.",
          "`?slap` - Slap user.",
          "`?smile` - Smile.",
          "`?boosters` - Show server boosters.",
          "`?firstmsj` - Show the first message in a channel.",
          "`?move` - Move a user."
        ]
      },
      security: {
        name: 'Security',
        emoji: '🛡️',
        description: 'Security & Protections',
        commands: [
          "`?antibots` - Anti-Bot protection.",
          "`?antilink` - Anti-Link protection.",
          "`?antilink-stats` - Link deletion statistics.",
          "`?antilink-whitelist` - Trusted link whitelists.",
          "`?antiwebhook` - Anti-Webhook spam defense."
        ]
      },
      moderation: {
        name: 'Moderation',
        emoji: '👮',
        description: 'Moderation & Staff Management Tools',
        commands: [
          "`?ban` - Ban a user.",
          "`?banforlife` - Ban a user forever.",
          "`?unban` - Unban user.",
          "`?unbanforlife` - Remove a life ban.",
          "`?kick` - Kick a user.",
          "`?timeout` - Timeout user.",
          "`?untimeout` - Remove timeout.",
          "`?mute` - Mute a user for a specified duration.",
          "`?unmute` - Unmute a user.",
          "`?jail` - Jail a user.",
          "`?unjail` - Unjail user.",
          "`?warn` - Warn a user.",
          "`?unwarn` - Remove warnings of a user.",
          "`?warnlist` - View warnings of a user.",
          "`?clear` - Clear messages.",
          "`?lock` - Lock a channel.",
          "`?unlock` - Unlock channel.",
          "`?hide` - Hide a channel.",
          "`?unhide` - Unhide channel.",
          "`?addrole` - Add a role to a user.",
          "`?removerole` - Remove role from a user.",
          "`?crole` - Create a new role.",
          "`?inrole` - Show users in a role.",
          "`?roleinfo` - Role information.",
          "`?nick` - Change user nickname."
        ]
      },
      community: {
        name: 'Community',
        emoji: '🎉',
        description: 'Verification, Applications, Economy & Socials',
        commands: [
          "`?bal` - Check your balance.",
          "`?daily` - Claim daily rewards.",
          "`?transfer` - Transfer money.",
          "`?top` - Show economy leaderboard.",
          "`?marry` - Marry a user.",
          "`?divorce` - Divorce your partner.",
          "`?marry-stats` - Check marriage stats.",
          "`?vb` - Verify member as male.",
          "`?vg` - Verify member as female.",
          "`?v-blacklist` - Manage the verification blacklist.",
          "`/apply-panel` - Spawn the application panel."
        ]
      },
      advanced: {
        name: 'Advanced',
        emoji: '💎',
        description: 'Server Configuration & Premium Tools',
        commands: [
          "`/setup` - Centralized setup dashboard (Main Guide).",
          "`/setup_warn` - Configure warning system.",
          "`/setupmute` - Configure mute system.",
          "`/setup_jail` - Configure jail system.",
          "`/set-needhelp` - Configure support room system.",
          "`/setup_verification` - Configure verification system.",
          "`/setup-logs` - Configure advanced system logging.",
          "`/setup-apply` - Configure application roles & channels.",
          "`/setup-premium` - Configure premium features.",
          "`?setup-owner` - Configure security owner roles.",
          "`?setup-profile` - Configure native per-guild bot profile.",
          "`?addprefix` - Set a custom prefix for the bot.",
          "`?alias` - Manage custom command aliases.",
          "`?autorole` - Configure auto-role for new members.",
          "`?embed` - Create custom embed messages.",
          "`?tax` - Calculate server/donation taxes.",
          "`?temprole` - Give temporary roles to users.",
          "`?addemoji` - Add a custom emoji to the server.",
          "`?emojiinfo` - Show custom emoji information.",
          "`?inviteinfo` - Show invite code details.",
          "`?addinvites` - Add bonus invites to a user.",
          "`?pcreate` - Create a premium plan.",
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
          .setEmoji('1515102029830426808') // Custom folder emoji ID
      );

      // Create select menu
      const selectMenu = new StringSelectMenuBuilder()
        .setCustomId('help_category_select')
        .setPlaceholder('Select a category to view commands')
        .addOptions(selectMenuOptions);

      // Build main container
      const mainContainer = new ContainerBuilder()
        .addTextDisplayComponents(td => td.setContent(`## <:vivy:1510334908562804856> __${message.client.user.username} Help__`))
        .addSeparatorComponents(sep => sep.setSpacing(SeparatorSpacingSize.Large))
        .addTextDisplayComponents(td => td.setContent(`## > <:wchydrangeaflower:1516951730745770025> Welcome to **Vivy**!\n## > <a:21261cyan:1516952984389685399> Current Prefix: \`${prefix}\``))
        .addSeparatorComponents(sep => sep.setSpacing(SeparatorSpacingSize.Large))
        .addMediaGalleryComponents(
          new MediaGalleryBuilder().addItems(
            new MediaGalleryItemBuilder().setURL("https://media.discordapp.net/attachments/1340097259391684628/1515101316530049166/9f48cf138b8b7962ec611b986ac7b527.gif?ex=6a2dc78f&is=6a2c760f&hm=7eb19c0ebd9e711a0aa8580d21381d18b114e3259b0c713f9dce60a17e2f615d&=")
          )
        )
        .addSeparatorComponents(sep => sep.setSpacing(SeparatorSpacingSize.Large))
        .addTextDisplayComponents(td => td.setContent(`## <:category:1509401226012393543> Select a category to view commands`))
        .addActionRowComponents(row => row.setComponents(selectMenu))
        .addSeparatorComponents(sep => sep.setSpacing(SeparatorSpacingSize.Large))

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
                .setEmoji('<:vivy:1510334908562804856>')
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
                .setEmoji('<:vivy:1510334908562804856>')
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
            .addTextDisplayComponents(td => td.setContent(`Please run \`?help\` again to view commands.`))
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