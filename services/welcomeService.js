const { WelcomeSettings, AutoRoleSetup } = require('../db/models');
const { createCanvas, loadImage } = require('@napi-rs/canvas');
const { EmbedBuilder, AttachmentBuilder } = require('discord.js');
const UI = require('../utils/ui');

class WelcomeService {
    static async getOrCreateWelcomeSettings(guildId) {
        let settings = await WelcomeSettings.findByPk(guildId);
        if (!settings) {
            settings = await WelcomeSettings.create({ guild_id: guildId });
        }
        return settings;
    }

    static replaceVariables(template, member) {
        if (!template) return '';
        return template
            .replace(/{user}/g, `<@${member.id}>`)
            .replace(/{username}/g, member.user.username)
            .replace(/{server}/g, member.guild.name)
            .replace(/{memberCount}/g, member.guild.memberCount.toString());
    }

    static async drawBanner(member, bgUrl) {
        const canvas = createCanvas(700, 250);
        const ctx = canvas.getContext('2d');

        // Draw background
        ctx.fillStyle = '#23272a';
        ctx.fillRect(0, 0, 700, 250);

        if (bgUrl) {
            try {
                let imageSource = bgUrl;
                if (bgUrl.startsWith('/presets/')) {
                    const path = require('path');
                    imageSource = path.join(__dirname, '../server/public', bgUrl);
                }
                const bg = await loadImage(imageSource);
                ctx.drawImage(bg, 0, 0, 700, 250);
            } catch (e) {
                console.error("Failed to load welcome banner background:", e);
            }
        }

        // Draw visual blur overlay
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, 700, 250);

        // Circular clipping mask for avatar
        ctx.save();
        ctx.beginPath();
        ctx.arc(350, 80, 50, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.clip();
        try {
            const avatarUrl = member.user.displayAvatarURL({ extension: 'png', size: 128 });
            const avatar = await loadImage(avatarUrl);
            ctx.drawImage(avatar, 300, 30, 100, 100);
        } catch (e) {
            ctx.fillStyle = '#00f5ff';
            ctx.fillRect(300, 30, 100, 100);
        }
        ctx.restore();

        // Draw welcome text
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 32px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('WELCOME', 350, 160);

        ctx.fillStyle = '#00f5ff';
        ctx.font = '24px sans-serif';
        ctx.fillText(member.user.username.toUpperCase(), 350, 195);

        ctx.fillStyle = '#7a7d85';
        ctx.font = '16px sans-serif';
        ctx.fillText(`MEMBER #${member.guild.memberCount}`, 350, 225);

        return canvas.toBuffer('image/png');
    }

    static async handleJoin(member) {
        try {
            const settings = await this.getOrCreateWelcomeSettings(member.guild.id);

            // 1. Channel Welcome Message
            if (settings.welcome_enabled && settings.welcome_channel) {
                const channel = member.guild.channels.cache.get(settings.welcome_channel);
                if (channel) {
                    const content = this.replaceVariables(settings.welcome_message, member);
                    const options = { content };

                    let embedData = null;
                    if (settings.welcome_embed_json) {
                        try {
                            embedData = JSON.parse(settings.welcome_embed_json);
                        } catch (e) { }
                    }

                    let welcomeTitle = '👋 Welcome!';
                    let welcomeDesc = `Hey ${member}, welcome to **${member.guild.name}**!`;
                    let welcomeColor = '#00f5ff';

                    if (embedData) {
                        if (embedData.title) welcomeTitle = this.replaceVariables(embedData.title, member);
                        if (embedData.description) welcomeDesc = this.replaceVariables(embedData.description, member);
                        if (embedData.color) welcomeColor = embedData.color;
                    }

                    const containerOptions = {
                        title: welcomeTitle,
                        description: welcomeDesc,
                        color: welcomeColor
                    };

                    // Generate Welcome Banner Image if set
                    if (settings.welcome_bg_image) {
                        const buffer = await this.drawBanner(member, settings.welcome_bg_image);
                        const attachment = new AttachmentBuilder(buffer, { name: 'welcome.png' });
                        containerOptions.image = 'attachment://welcome.png';
                        options.files = [attachment];
                    }

                    const welcomeContainer = UI.createContainer(containerOptions);
                    options.components = [welcomeContainer];
                    options.flags = 128; // MessageFlags.IsComponentsV2

                    await channel.send(options).catch(err => console.error("Error sending welcome message:", err));
                }
            }

            // 2. DM Welcome Message
            if (settings.welcome_dm_enabled) {
                const dmContent = this.replaceVariables(settings.welcome_dm_message, member);
                await member.send({ content: dmContent }).catch(() => {});
            }

            // 3. Auto Role assignment
            const autoRole = await AutoRoleSetup.findByPk(member.guild.id);
            if (autoRole && autoRole.role_ids) {
                try {
                    const roleIds = JSON.parse(autoRole.role_ids);
                    for (const roleId of roleIds) {
                        const role = member.guild.roles.cache.get(roleId);
                        if (role) {
                            await member.roles.add(role, 'Auto role on join').catch(() => {});
                        }
                    }
                } catch (e) { }
            }

        } catch (error) {
            console.error('Welcome Service Join Handler Error:', error);
        }
    }

    static async handleLeave(member) {
        try {
            const settings = await this.getOrCreateWelcomeSettings(member.guild.id);

            if (settings.leave_enabled && settings.leave_channel) {
                const channel = member.guild.channels.cache.get(settings.leave_channel);
                if (channel) {
                    const content = this.replaceVariables(settings.leave_message, member);
                    const options = { content };

                    let embedData = null;
                    if (settings.leave_embed_json) {
                        try {
                            embedData = JSON.parse(settings.leave_embed_json);
                        } catch (e) { }
                    }

                    let leaveTitle = '🚪 Member Left';
                    let leaveDesc = `${member.user.username} has left the server.`;
                    let leaveColor = '#ff3333';

                    if (embedData) {
                        if (embedData.title) leaveTitle = this.replaceVariables(embedData.title, member);
                        if (embedData.description) leaveDesc = this.replaceVariables(embedData.description, member);
                        if (embedData.color) leaveColor = embedData.color;
                    }

                    const containerOptions = {
                        title: leaveTitle,
                        description: leaveDesc,
                        color: leaveColor
                    };

                    const leaveContainer = UI.createContainer(containerOptions);
                    options.components = [leaveContainer];
                    options.flags = 128; // MessageFlags.IsComponentsV2

                    await channel.send(options).catch(err => console.error("Error sending leave message:", err));
                }
            }
        } catch (error) {
            console.error('Welcome Service Leave Handler Error:', error);
        }
    }
}

module.exports = WelcomeService;
