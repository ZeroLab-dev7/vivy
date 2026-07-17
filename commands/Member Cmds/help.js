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
  MediaGalleryItemBuilder,
  SectionBuilder,
  ThumbnailBuilder
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
    const botAvatarURL = message.client.user.displayAvatarURL({ extension: 'png', size: 1024 });

    // Category Data (Synced with actual files)
    const categories = {
      general: {
        name: 'General / Member',
        emoji: 'ℹ️',
        description: 'General details, user & server information',
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
          "`?boosters` - Show server boosters.",
          "`?firstmsj` - Show the first message in a channel.",
          "`?support` - Get the support server link.",
          "`/support` - Get the support server link (Slash)."
        ]
      },
      admin: {
        name: 'Admin',
        emoji: '⚙️',
        description: 'Server administration and utility configuration',
        commands: [
          "`?addprefix` - Set a custom prefix for the bot.",
          "`?alias` - Manage custom command aliases.",
          "`?autorole` - Configure auto-role for new members.",
          "`?addemoji` - Add a custom emoji to the server.",
          "`?emojiinfo` - Show custom emoji information.",
          "`?inviteinfo` - Show invite code details.",
          "`?addinvites` - Add bonus invites to a user.",
          "`?setup-profile` - Configure native per-guild bot profile."
        ]
      },
      moderator: {
        name: 'Moderator',
        emoji: '👮',
        description: 'Moderation and member management tools',
        commands: [
          "`?ban` - Ban a user.",
          "`?unban` - Unban user.",
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
          "`?addrole` - Add a role to a user.",
          "`?removerole` - Remove role from a user.",
          "`?crole` - Create a new role.",
          "`?inrole` - Show users in a role.",
          "`?roleinfo` - Role information.",
          "`?nick` - Change user nickname.",
          "`?move` - Move a user.",
          "`?lock` - Lock a channel.",
          "`?unlock` - Unlock channel.",
          "`?hide` - Hide a channel.",
          "`?unhide` - Unhide channel."
        ]
      },
      security: {
        name: 'Security',
        emoji: '🛡️',
        description: 'Server security, spam defense, and permissions',
        commands: [
          "`?antibots` - Anti-Bot protection.",
          "`?antilink` - Anti-Link protection.",
          "`?antilink-stats` - Link deletion statistics.",
          "`?antilink-whitelist` - Trusted link whitelists.",
          "`?antiwebhook` - Anti-Webhook spam defense.",
        ]
      },
      fun: {
        name: 'Fun',
        emoji: '<a:pink8:1337678972108148757>',
        description: 'Interactive, mini-games, and fun commands',
        commands: [
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
          "`?mcstats` - Get Minecraft server stats."
        ]
      },
      games: {
        name: 'Games',
        emoji: '🎮',
        description: 'Play interactive games like Blackjack, Slots, RPS, and Guess',
        commands: [
          "`?blackjack` - Play Blackjack.",
          "`?slots` - Play Slot machine.",
          "`?roulette` - Play Roulette.",
          "`?rps` - Play Rock Paper Scissors.",
          "`?guess` - Play Guess the Number.",
          "`?tictactoe` - Play Tic-Tac-Toe.",
          "`?connect4` - Play Connect 4.",
          "`?hangman` - Play Hangman.",
          "`?memory` - Play Memory match."
        ]
      },
      voice: {
        name: 'Voice',
        emoji: '🔊',
        description: 'Voice channel utilities and stats',
        commands: [
          "`/vc` - Server voice stats (Slash).",
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
      economy: {
        name: 'Economy',
        emoji: '🪙',
        description: 'Claim daily, transfer currency, check leaderboard',
        commands: [
          "`?bal` - Check your balance.",
          "`?daily` - Claim daily rewards.",
          "`?transfer` - Transfer money.",
          "`?top` - Show economy leaderboard.",
          "`?tax` - Calculate server/donation taxes."
        ]
      },
      marriage: {
        name: 'Marriage',
        emoji: '<:ring:1526494769050816512>',
        description: 'Marry, divorce, adopt, or check marriage/family details',
        commands: [
          "`?marry` - Propose marriage to another user.",
          "`?divorce` - Divorce your partner.",
          "`?marrystats` - Show Marry Stats.",
          "`?adopt` - Adopt a child with your partner.",
          "`?children` - Name Of Children.",
          "`?anniversary` - Check your marriage anniversary.",
          "`?familylb` - Family leaderboard - see who has the biggest family.",
          "`?familytree` - View your complete family tree.",
          "`?marriedcount` - Show the number of users who are married.",
          "`?removechildren` - Remove children.",
          "`?renamechild` - Rename one of your children."
        ]
      },
      leveling: {
        name: 'Leveling',
        emoji: '📈',
        description: 'Rank, leaderboard, and XP settings',
        commands: [
          "`?rank` - Check your rank and level.",
          "`?leaderboard` - Check leveling leaderboard.",
          "`?leveladmin` - Manage levels (Admin only)."
        ]
      },
      verification: {
        name: 'Verification',
        emoji: '✅',
        description: 'Gender role verification and setup',
        commands: [
          "`?vb` - Verify member as male.",
          "`?vg` - Verify member as female.",
          "`?v-blacklist` - Manage the verification blacklist."
        ]
      },
      premium: {
        name: 'Premium',
        emoji: '💎',
        description: 'Create plans, customize colors, and manage members',
        commands: [
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
          "`?temprole` - Give temporary roles to users."
        ]
      },
      setup: {
        name: 'Setup & Config',
        emoji: '🛠️',
        description: 'Configuration menus for log systems, warn, mute, jail, apply',
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
          "`/apply-panel` - Spawn the application panel."
        ]
      }
    };

    // Helper to send error (Style matching user example)
    async function sendErrorMessage(msg, content) {
      const errorContainer = new ContainerBuilder()
        .setAccentColor(0x00FFFF)
        .addTextDisplayComponents(td => td.setContent(`<:no:1526496561188831244>**Error**\n${content}`));

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

      // Build main container header section with bot avatar thumbnail
      const headerSection = new SectionBuilder()
        .setThumbnailAccessory(new ThumbnailBuilder().setURL(botAvatarURL))
        .addTextDisplayComponents(td => td.setContent(
          `<:vivy:1510334908562804856> **__Hello, I'm Vivy!__** an all-in-one Discord companion designed to make managing your community simple, enjoyable, and effortless—always ready to help, protect, and entertain. <:wchydrangeaflower:1516951730745770025>\n\n` +
          `• Use </dashboard:1522761049915527289> to manage your server.\n• Need help? Use </support:1526443917573230703> anytime`
        ));

      const mainContainer = new ContainerBuilder()
        .setAccentColor(0x00FFFF)
        .addSectionComponents(headerSection)
        .addSeparatorComponents(sep => sep.setSpacing(SeparatorSpacingSize.Large))
        .addMediaGalleryComponents(
          new MediaGalleryBuilder().addItems(
            new MediaGalleryItemBuilder().setURL("https://media.discordapp.net/attachments/1329547343791525989/1526438110601416724/image.png?ex=6a5705c5&is=6a55b445&hm=08966965f453254d28cb0d0a5eb4a10e69873397666b167d82b47835ef66fe2b&=&format=webp&quality=lossless")
          )
        )
        .addSeparatorComponents(sep => sep.setSpacing(SeparatorSpacingSize.Large))
        .addTextDisplayComponents(td => td.setContent(`## <:category:1509401226012393543> Select a category to view commands`))
        .addActionRowComponents(row => row.setComponents(selectMenu));

      let currentContainer = mainContainer;
      let initialComponents = [mainContainer];

      if (args.length > 0) {
        const query = args[0].toLowerCase();
        const foundCategoryKey = Object.keys(categories).find(key => key.toLowerCase() === query || categories[key].name.toLowerCase() === query);

        if (foundCategoryKey) {
          const category = categories[foundCategoryKey];
          const categorySection = new SectionBuilder()
            .setThumbnailAccessory(new ThumbnailBuilder().setURL(botAvatarURL))
            .addTextDisplayComponents(td => td.setContent(category.emoji ? `# ${category.emoji} ${category.name} Commands` : `# ${category.name} Commands`));

          const categoryContainer = new ContainerBuilder()
            .setAccentColor(0x00FFFF)
            .addSectionComponents(categorySection)
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
          currentContainer = categoryContainer;
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
            currentContainer = mainContainer;
            await interaction.update({
              components: [mainContainer],
              flags: MessageFlags.IsComponentsV2
            });
            return;
          }

          const selectedCategory = interaction.values[0];
          const category = categories[selectedCategory];

          if (!category) return;

          const categorySection = new SectionBuilder()
            .setThumbnailAccessory(new ThumbnailBuilder().setURL(botAvatarURL))
            .addTextDisplayComponents(td => td.setContent(category.emoji ? `# ${category.emoji} ${category.name} Commands` : `# ${category.name} Commands`));

          // Build category response
          const categoryContainer = new ContainerBuilder()
            .setAccentColor(0x00FFFF)
            .addSectionComponents(categorySection)
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

          currentContainer = categoryContainer;

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
          if (currentContainer && currentContainer.components) {
            for (const component of currentContainer.components) {
              if (component.components && Array.isArray(component.components)) {
                for (const child of component.components) {
                  if (typeof child.setDisabled === 'function') {
                    child.setDisabled(true);
                  }
                }
              }
            }
          }

          if (selectMenu && typeof selectMenu.setDisabled === 'function') {
            selectMenu.setDisabled(true);
            selectMenu.setPlaceholder('<:no:1526496561188831244>Menu Expired');
          }

          await reply.edit({
            components: [currentContainer],
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