const { WelcomeSettings, AutoRoleSetup } = require('../db/models');
const { createCanvas, loadImage } = require('@napi-rs/canvas');
const { EmbedBuilder, AttachmentBuilder } = require('discord.js');

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
                const bg = await loadImage(bgUrl);
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

                    const welcomeEmbed = new EmbedBuilder();
                    if (embedData) {
                        if (embedData.title) welcomeEmbed.setTitle(this.replaceVariables(embedData.title, member));
                        if (embedData.description) welcomeEmbed.setDescription(this.replaceVariables(embedData.description, member));
                        if (embedData.color) welcomeEmbed.setColor(embedData.color);
                    } else {
                        welcomeEmbed.setTitle('👋 Welcome!')
                            .setDescription(`Hey ${member}, welcome to **${member.guild.name}**!`)
                            .setColor('#00f5ff');
                    }

                    welcomeEmbed.setTimestamp();

                    // Generate Welcome Banner Image if set
                    if (settings.welcome_bg_image) {
                        const buffer = await this.drawBanner(member, settings.welcome_bg_image);
                        const attachment = new AttachmentBuilder(buffer, { name: 'welcome.png' });
                        welcomeEmbed.setImage('attachment://welcome.png');
                        options.files = [attachment];
                    }

                    options.embeds = [welcomeEmbed];
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

                    const leaveEmbed = new EmbedBuilder();
                    if (embedData) {
                        if (embedData.title) leaveEmbed.setTitle(this.replaceVariables(embedData.title, member));
                        if (embedData.description) leaveEmbed.setDescription(this.replaceVariables(embedData.description, member));
                        if (embedData.color) leaveEmbed.setColor(embedData.color);
                    } else {
                        leaveEmbed.setTitle('🚪 Member Left')
                            .setDescription(`${member.user.username} has left the server.`)
                            .setColor('#ff3333');
                    }

                    leaveEmbed.setTimestamp();

                    options.embeds = [leaveEmbed];
                    await channel.send(options).catch(err => console.error("Error sending leave message:", err));
                }
            }
        } catch (error) {
            console.error('Welcome Service Leave Handler Error:', error);
        }
    }
}

module.exports = WelcomeService;
