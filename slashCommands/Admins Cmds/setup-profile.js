const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags, ContainerBuilder, SectionBuilder, ThumbnailBuilder, SeparatorSpacingSize } = require('discord.js');
const UI = require('../../utils/ui');
const axios = require('axios');

async function resolveImageToBase64(imageSource) {
    if (!imageSource) return null;
    if (imageSource.startsWith('data:')) return imageSource;

    try {
        const response = await axios.get(imageSource, {
            responseType: 'arraybuffer',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });
        const contentType = response.headers['content-type'] || 'image/png';
        const base64 = Buffer.from(response.data).toString('base64');
        return `data:${contentType};base64,${base64}`;
    } catch (error) {
        throw new Error(`Failed to download image from URL: ${error.message}`);
    }
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setup-profile')
        .setDescription('Set native per-guild bot profile (name, avatar, banner) directly via Discord API')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommand(subcommand =>
            subcommand.setName('view')
                .setDescription('View current guild-specific profile settings of the bot'))
        .addSubcommand(subcommand =>
            subcommand.setName('name')
                .setDescription('Set or reset the bot nickname in this server')
                .addStringOption(option =>
                    option.setName('text')
                        .setDescription('Nickname text. Use "reset" to remove nickname.')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand.setName('avatar')
                .setDescription('Set, reset, or update the bot guild avatar')
                .addAttachmentOption(option =>
                    option.setName('image')
                        .setDescription('Directly upload an image file')
                        .setRequired(false))
                .addStringOption(option =>
                    option.setName('url')
                        .setDescription('An image URL starting with http/https')
                        .setRequired(false))
                .addBooleanOption(option =>
                    option.setName('reset')
                        .setDescription('Set to true to remove the current guild avatar')
                        .setRequired(false)))
        .addSubcommand(subcommand =>
            subcommand.setName('banner')
                .setDescription('Set, reset, or update the bot guild banner')
                .addAttachmentOption(option =>
                    option.setName('image')
                        .setDescription('Directly upload an image file')
                        .setRequired(false))
                .addStringOption(option =>
                    option.setName('url')
                        .setDescription('An image URL starting with http/https')
                        .setRequired(false))
                .addBooleanOption(option =>
                    option.setName('reset')
                        .setDescription('Set to true to remove the current guild banner')
                        .setRequired(false))),

    async execute(interaction) {
        try {
            await interaction.deferReply();

            // FIX #6: Redundant but safe — API already restricts this, but double-check doesn't hurt
            if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
                return interaction.editReply({
                    components: [UI.createContainer({ description: '- ❌ You need `Administrator` permission to use this command.' })],
                    flags: MessageFlags.IsComponentsV2
                });
            }

            const subcommand = interaction.options.getSubcommand();

            if (subcommand === 'view') {
                const me = interaction.guild.members.me;

                const guildAvatarURL = me.avatarURL({ size: 256 }) || null;
                // FIX #1: GuildMember has no bannerURL, use me.user.bannerURL()
                const guildBannerURL = me.user?.bannerURL({ size: 512 }) || null;
                const guildNick = me.nickname || null;

                const container = new ContainerBuilder()
                    .setAccentColor(0x00FFFF)
                    .addTextDisplayComponents(td => td.setContent(`# <:pic:1518430671922528256> Server Bot Profile`))
                    .addSeparatorComponents(sep => sep.setSpacing(SeparatorSpacingSize.Small))
                    .addSectionComponents(
                        new SectionBuilder()
                            .setThumbnailAccessory(new ThumbnailBuilder().setURL(guildAvatarURL || interaction.client.user.displayAvatarURL({ size: 256 })))
                            .addTextDisplayComponents(td => td.setContent(`## <:wchydrangeaflower:1516951730745770025> 」 **Bot's real Discord profile in \`${interaction.guild.name}\`**`))
                    )
                    .addSeparatorComponents(sep => sep.setSpacing(SeparatorSpacingSize.Small))
                    .addTextDisplayComponents(td => td.setContent(
                        `> **Nickname:** ${guildNick ? `\`${guildNick}\`` : '`None (using global name)`'}\n` +
                        `> **Guild Avatar:** ${guildAvatarURL ? `[View ↗](${guildAvatarURL})` : '`None (using global avatar)`'}\n` +
                        `> **Guild Banner:** ${guildBannerURL ? `[View ↗](${guildBannerURL})` : '`None (using global banner)`'}`
                    ))
                    .addSeparatorComponents(sep => sep.setSpacing(SeparatorSpacingSize.Small))
                    .addTextDisplayComponents(td => td.setContent(
                        `### Usage\n` +
                        `Use \`/setup-profile\` commands to edit the nickname, avatar, or banner.`
                    ));

                return interaction.editReply({
                    components: [container],
                    flags: MessageFlags.IsComponentsV2
                });
            }

            if (subcommand === 'name') {
                // FIX #3: getString can return null, use optional chaining
                const value = interaction.options.getString('text')?.trim() ?? '';
                const isReset = value.toLowerCase() === 'reset';

                try {
                    await interaction.guild.members.editMe({
                        nick: isReset ? null : value
                    });

                    return interaction.editReply({
                        components: [UI.createContainer({
                            title: '✅ Nickname Updated',
                            description: isReset
                                ? `Nickname removed — bot is back to its global name in this server.`
                                : `Nickname set to **${value}** in **${interaction.guild.name}**.`,
                            color: 0x57F287
                        })],
                        flags: MessageFlags.IsComponentsV2
                    });
                } catch (err) {
                    console.error('[setup-profile slash] Nickname error:', err);
                    return interaction.editReply({
                        components: [UI.createContainer({
                            description: `- ❌ Failed to set nickname. Make sure the bot has **Change Nickname** permission.\n\`\`\`${err.message}\`\`\``
                        })],
                        flags: MessageFlags.IsComponentsV2
                    });
                }
            }

            // Handle avatar / banner
            const type = subcommand; // 'avatar' or 'banner'
            const attachment = interaction.options.getAttachment('image');
            const url = interaction.options.getString('url');
            const reset = interaction.options.getBoolean('reset') ?? false;

            let imageSource = null;
            if (attachment) {
                imageSource = attachment.url;
            } else if (url) {
                if (!url.startsWith('http')) {
                    return interaction.editReply({
                        components: [UI.createContainer({
                            description: `- ❌ Please provide a valid image URL starting with http/https.`
                        })],
                        flags: MessageFlags.IsComponentsV2
                    });
                }
                imageSource = url;
            }

            const isReset = !imageSource && reset;

            if (!imageSource && !isReset) {
                return interaction.editReply({
                    components: [UI.createContainer({
                        description: `- ❌ Please provide an image URL, attach an image, or set reset to True.`
                    })],
                    flags: MessageFlags.IsComponentsV2
                });
            }

            // Tell user we're updating
            await interaction.editReply({
                components: [UI.createContainer({
                    description: `⏳ ${isReset ? 'Removing' : 'Uploading'} guild ${type}... please wait.`,
                    color: 0xFAA61A
                })],
                flags: MessageFlags.IsComponentsV2
            });

            try {
                let resultURL = null;

                if (type === 'avatar') {
                    const base64Data = isReset ? null : await resolveImageToBase64(imageSource);
                    await interaction.guild.members.editMe({ avatar: base64Data });

                    // FIX #4: Force fetch to bypass cache
                    const updatedMe = await interaction.guild.members.fetch({
                        user: interaction.client.user.id,
                        force: true
                    });
                    resultURL = updatedMe.avatarURL({ size: 512 });
                } else if (type === 'banner') {
                    // FIX #2: Discord.js editMe() does NOT support banner for guild members
                    // You must use the REST API directly. Uncomment below if you have the required setup:
                    
                    /*
                    const { REST } = require('@discordjs/rest');
                    const { Routes } = require('discord-api-types/v10');
                    const rest = new REST({ version: '10' }).setToken(interaction.client.token);
                    
                    const base64Data = isReset ? null : await resolveImageToBase64(imageSource);
                    await rest.patch(
                        Routes.guildMember(interaction.guild.id, interaction.client.user.id),
                        { body: { banner: base64Data } }
                    );
                    */
                    
                    // Throw informative error since standard Discord.js doesn't support this
                    throw new Error(
                        'Guild banner editing for bots is not supported via Discord.js editMe(). ' +
                        'You must use the Discord REST API directly (see commented code). ' +
                        'Note: This feature may also require specific API permissions/whitelisting.'
                    );
                }

                const container = UI.createContainer({
                    title: `✅ Guild ${type === 'avatar' ? 'Avatar' : 'Banner'} ${isReset ? 'Removed' : 'Updated'}`,
                    description: isReset
                        ? `Guild ${type} removed. The bot now shows its default/global appearance in **${interaction.guild.name}**.`
                        : `Guild ${type} updated successfully. Members will see this when they click the bot.\n`,
                    color: 0x57F287,
                    // image: (!isReset && resultURL) ? resultURL : undefined
                });

                await interaction.editReply({
                    components: [container],
                    flags: MessageFlags.IsComponentsV2
                });

            } catch (err) {
                console.error(`[setup-profile slash] ${type} error:`, err);
                await interaction.editReply({
                    components: [UI.createContainer({
                        description:
                            `- ❌ Failed to update guild ${type}.\n` +
                            `\`\`\`${err.message}\`\`\`\n\n` +
                            `-# Make sure the image is a valid PNG/JPG/GIF and under 8MB.`,
                        color: 0xED4245
                    })],
                    flags: MessageFlags.IsComponentsV2
                });
            }

        } catch (error) {
            console.error('Error in slash setup-profile command:', error);
            
            // Try to edit reply, but if interaction already failed, reply instead
            try {
                await interaction.editReply({
                    components: [UI.createContainer({
                        description: '❌ Failed to process setup-profile command.',
                        color: 0xff0000
                    })],
                    flags: MessageFlags.IsComponentsV2
                });
            } catch {
                // If edit fails, try followUp or just log
                console.error('Failed to send error reply:', error);
            }
        }
    }
};