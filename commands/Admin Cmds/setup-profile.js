const { MessageFlags, SeparatorSpacingSize } = require('discord.js');
const UI = require('../../utils/ui');

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

        // &setup-profile view  (show current native profile)
        if (!args.length || args[0].toLowerCase() === 'view') {
            const me = message.guild.members.me;

            const guildAvatarURL  = me.avatarURL({ size: 256 }) || null;
            const guildBannerURL  = me.bannerURL?.({ size: 512 }) || null;
            const guildNick       = me.nickname || null;

            const container = UI.createContainer({
                title: '🎭 Server Bot Profile (Native)',
                description:
                    `め 」 **Bot's real Discord profile in \`${message.guild.name}\`**\n\n` +
                    `> **Nickname:** ${guildNick ? `\`${guildNick}\`` : '`None (using global name)`'}\n` +
                    `> **Guild Avatar:** ${guildAvatarURL ? `[View ↗](${guildAvatarURL})` : '`None (using global avatar)`'}\n` +
                    `> **Guild Banner:** ${guildBannerURL ? `[View ↗](${guildBannerURL})` : '`None (using global banner)`'}\n\n` +
                    `-# This is the real Discord profile seen by members when they click the bot.\n\n` +
                    `### Usage\n` +
                    `\`\`\`\n` +
                    `&setup-profile name <text>       — Set nickname\n` +
                    `&setup-profile name reset        — Remove nickname\n` +
                    `&setup-profile avatar <url>      — Set guild avatar (attach image too)\n` +
                    `&setup-profile avatar reset      — Remove guild avatar\n` +
                    `&setup-profile banner <url>      — Set guild profile banner (attach image too)\n` +
                    `&setup-profile banner reset      — Remove guild banner\n` +
                    `\`\`\``,
                color: 0x5865F2,
                thumbnail: guildAvatarURL || message.client.user.displayAvatarURL({ size: 256 })
            });

            return message.reply({
                components: [container],
                flags: MessageFlags.IsComponentsV2
            });
        }

        const type  = args[0].toLowerCase();
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
            const isReset = value.toLowerCase() === 'reset' || value === '';
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

        const isReset = !imageSource && (value.toLowerCase() === 'reset' || value === '');

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
            const editPayload = {};

            if (type === 'avatar') {
                editPayload.avatar = isReset ? null : imageSource;
            } else if (type === 'banner') {
                editPayload.banner = isReset ? null : imageSource;
            }

            // discord.js resolveImage() downloads URL → base64 automatically
            await message.guild.members.editMe(editPayload);

            // Fetch the updated member to get the real CDN URL
            const updatedMe = await message.guild.members.fetch(message.client.user.id);
            const resultURL = type === 'avatar'
                ? updatedMe.avatarURL({ size: 512 })
                : updatedMe.bannerURL?.({ size: 512 });

            const container = UI.createContainer({
                title: `✅ Guild ${type === 'avatar' ? 'Avatar' : 'Banner'} ${isReset ? 'Removed' : 'Updated'}`,
                description: isReset
                    ? `Guild ${type} removed. The bot now shows its global ${type} in **${message.guild.name}**.`
                    : `Guild ${type} updated for **${message.guild.name}**. Members will see this when they click the bot.\n\n` +
                      `-# The change is applied natively on Discord — no simulation.`,
                color: 0x57F287,
                image: (!isReset && resultURL) ? resultURL : undefined
            });

            // Edit the processing message to show the result
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
                        (type === 'avatar'
                            ? `-# Make sure the image is a valid PNG/JPG/GIF and under 8MB.`
                            : `-# Guild banners require the image to be PNG/JPG/GIF and under 8MB.`),
                    color: 0xED4245
                })],
                flags: MessageFlags.IsComponentsV2
            });
        }
    }
};
