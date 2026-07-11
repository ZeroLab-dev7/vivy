const { MessageFlags, SeparatorSpacingSize, ContainerBuilder, SectionBuilder, ThumbnailBuilder } = require('discord.js');
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
    name: 'setup-profile',
    description: 'Set native per-guild bot profile (name, avatar, banner) directly via Discord API',
    aliases: ['botprofile', 'servprofile'],
    async execute(message, args) {
        if (!message.member.permissions.has('Administrator')) {
            return message.reply({
                components: [UI.createContainer({ description: '- ❌ You need `Administrator` permission to use this command.' })],
                flags: MessageFlags.IsComponentsV2
            });
        }

        // ?setup-profile view  (show current native profile)
        if (!args.length || args[0].toLowerCase() === 'view') {
            const me = message.guild.members.me;

            const guildAvatarURL = me.avatarURL({ size: 256 }) || null;
            // FIX #2: GuildMember doesn't have bannerURL, use me.user.bannerURL()
            const guildBannerURL = me.user?.bannerURL({ size: 512 }) || null;
            const guildNick = me.nickname || null;

            const container = new ContainerBuilder()
                .setAccentColor(0x00FFFF)
                .addTextDisplayComponents(td => td.setContent(`# <:pic:1518430671922528256> Server Bot Profile`))
                .addSeparatorComponents(sep => sep.setSpacing(SeparatorSpacingSize.Small))
                .addSectionComponents(
                    new SectionBuilder()
                        .setThumbnailAccessory(new ThumbnailBuilder().setURL(guildAvatarURL || message.client.user.displayAvatarURL({ size: 256 })))
                        .addTextDisplayComponents(td => td.setContent(`<:wchydrangeaflower:1516951730745770025> **Bot's real Discord profile in \`${message.guild.name}\`**`))
                )
                .addSeparatorComponents(sep => sep.setSpacing(SeparatorSpacingSize.Small))
                .addTextDisplayComponents(td => td.setContent(
                    `> **Nickname:** ${guildNick ? `\`${guildNick}\`` : '`None (using global name)`'}\n` +
                    `> **Guild Avatar:** ${guildAvatarURL ? `[View ↗](${guildAvatarURL})` : '`None (using global avatar)`'}\n` +
                    `> **Guild Banner:** ${guildBannerURL ? `[View ↗](${guildBannerURL})` : '`None (using global banner)`'}`
                ))
                .addSeparatorComponents(sep => sep.setSpacing(SeparatorSpacingSize.Small))
                .addTextDisplayComponents(td => td.setContent(
                    `\`\`\`\n` +
                    `?setup-profile name <text>       — Set nickname\n` +
                    `?setup-profile name reset        — Remove nickname\n` +
                    `?setup-profile avatar <url>      — Set guild avatar (attach image too)\n` +
                    `?setup-profile avatar reset      — Remove guild avatar\n` +
                    `?setup-profile banner <url>      — Set guild banner (attach image too)\n` +
                    `?setup-profile banner reset      — Remove guild banner\n` +
                    `\`\`\``
                ));

            try {
                return await message.reply({
                    components: [container],
                    flags: MessageFlags.IsComponentsV2
                });
            } catch (err) {
                console.error('[setup-profile] V2 components failed, falling back to embed. Error:', err.message);
                if (err.rawError && err.rawError.errors) {
                    console.error('[setup-profile] Validation errors:', JSON.stringify(err.rawError.errors, null, 2));
                }
                const fallbackEmbed = UI.createEmbed({
                    title: '🎭 Server Bot Profile (Native)',
                    description:
                        `め 」 **Bot's real Discord profile in \`${message.guild.name}\`**\n\n` +
                        `> **Nickname:** ${guildNick ? `\`${guildNick}\`` : '`None (using global name)`'}\n` +
                        `> **Guild Avatar:** ${guildAvatarURL ? `[View ↗](${guildAvatarURL})` : '`None (using global avatar)`'}\n` +
                        `> **Guild Banner:** ${guildBannerURL ? `[View ↗](${guildBannerURL})` : '`None (using global banner)`'}\n\n` +
                        `\`\`\`\n` +
                        `?setup-profile name <text>       — Set nickname\n` +
                        `?setup-profile name reset        — Remove nickname\n` +
                        `?setup-profile avatar <url>      — Set guild avatar (attach image too)\n` +
                        `?setup-profile avatar reset      — Remove guild avatar\n` +
                        `?setup-profile banner <url>      — Set guild banner (attach image too)\n` +
                        `?setup-profile banner reset      — Remove guild banner\n` +
                        `\`\`\``,
                    color: 0x5865F2,
                    thumbnail: guildAvatarURL || message.client.user.displayAvatarURL({ size: 256 })
                });
                // FIX #5: Added await
                return await message.reply({ embeds: [fallbackEmbed] });
            }
        }

        const type = args[0].toLowerCase();
        const value = args.slice(1).join(' ').trim();

        if (!['name', 'avatar', 'banner'].includes(type)) {
            return message.reply({
                components: [UI.createContainer({
                    description: `- ❌ Invalid type \`${type}\`. Use \`name\`, \`avatar\`, or \`banner\`.`
                })],
                flags: MessageFlags.IsComponentsV2
            });
        }

        // --- Handle name ---
        if (type === 'name') {
            // FIX #1/#4: Handle empty value properly
            const isReset = !value || value.toLowerCase() === 'reset';
            try {
                await message.guild.members.editMe({
                    nick: isReset ? null : value
                });

                return message.reply({
                    components: [UI.createContainer({
                        title: '✅ Nickname Updated',
                        description: isReset
                            ? `Nickname removed — bot is back to its global name in this server.`
                            : `Nickname set to **${value}** in **${message.guild.name}**.`,
                        color: 0x57F287
                    })],
                    flags: MessageFlags.IsComponentsV2
                });
            } catch (err) {
                console.error('[setup-profile] Nickname error:', err);
                return message.reply({
                    components: [UI.createContainer({
                        description: `- ❌ Failed to set nickname. Make sure the bot has **Change Nickname** permission.\n\`\`\`${err.message}\`\`\``
                    })],
                    flags: MessageFlags.IsComponentsV2
                });
            }
        }

        // --- Handle avatar / banner ---
        // Resolve image: attachment > URL arg
        let imageSource = null;

        if (message.attachments.size > 0) {
            imageSource = message.attachments.first().url;
        } else if (value && value.toLowerCase() !== 'reset') {
            if (!value.startsWith('http')) {
                return message.reply({
                    components: [UI.createContainer({
                        description: `- ❌ Please provide a valid image URL (must start with \`https://\`) or attach an image directly.`
                    })],
                    flags: MessageFlags.IsComponentsV2
                });
            }
            imageSource = value;
        }

        // FIX #1: Proper reset detection - check value exists before toLowerCase
        const isReset = !imageSource && (!value || value.toLowerCase() === 'reset');

        if (!imageSource && !isReset) {
            return message.reply({
                components: [UI.createContainer({
                    description: `- ❌ Please provide an image URL or attach an image, or type \`reset\` to remove the current one.`
                })],
                flags: MessageFlags.IsComponentsV2
            });
        }

        // Send a "processing" message since image upload can take a moment
        const processingMsg = await message.reply({
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
                await message.guild.members.editMe({ avatar: base64Data });

                // FIX #6: Force fetch to bypass cache
                const updatedMe = await message.guild.members.fetch({ 
                    user: message.client.user.id, 
                    force: true 
                });
                resultURL = updatedMe.avatarURL({ size: 512 });
            } else if (type === 'banner') {
                // FIX #3: Discord.js editMe() does NOT support banner for guild members
                // You need to use the REST API directly. This is a limitation of Discord's API
                // for bot guild profiles. Uncomment below if you want to try via REST:
                
                /*
                const { REST } = require('@discordjs/rest');
                const { Routes } = require('discord-api-types/v10');
                const rest = new REST({ version: '10' }).setToken(message.client.token);
                
                const base64Data = isReset ? null : await resolveImageToBase64(imageSource);
                await rest.patch(
                    Routes.guildMember(message.guild.id, message.client.user.id),
                    { body: { banner: base64Data } }
                );
                */
               
                // For now, throw informative error since standard Discord.js doesn't support this
                throw new Error(
                    'Guild banner editing for bots is not supported via Discord.js editMe(). ' +
                    'You must use the Discord REST API directly (see commented code). ' +
                    'Note: This feature may also require specific API permissions/whitelisting.'
                );
            }

            const container = UI.createContainer({
                title: `✅ Guild ${type === 'avatar' ? 'Avatar' : 'Banner'} ${isReset ? 'Removed' : 'Updated'}`,
                description: isReset
                    ? `Guild ${type} removed. The bot now shows its default/global appearance in **${message.guild.name}**.`
                    : `Guild ${type} updated successfully. Members will see this when they click the bot.\n`,
                color: 0x57F287,
            });

            await processingMsg.edit({
                components: [container],
                flags: MessageFlags.IsComponentsV2
            });

        } catch (err) {
            console.error(`[setup-profile] ${type} error:`, err);
            await processingMsg.edit({
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
    }
};