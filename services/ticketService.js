const { TicketConfig, TicketInstance, TicketBlacklist } = require('../db/models');
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, PermissionFlagsBits, MessageFlags } = require('discord.js');
const { Op } = require('sequelize');
const UI = require('../utils/ui');

// Track ticket creation cooldown per user per guild: `${guildId}:${userId}` -> timestamp
const ticketCooldowns = new Map();
const COOLDOWN_MS = 30000; // 30 seconds cooldown

class TicketService {
    static async getOrCreateConfig(guildId) {
        let config = await TicketConfig.findByPk(guildId);
        if (!config) {
            config = await TicketConfig.create({ guild_id: guildId });
        }
        return config;
    }

    static async createTicket(guild, user, optionSelected) {
        const config = await this.getOrCreateConfig(guild.id);
        if (!config.is_enabled) return { success: false, reason: 'Tickets are currently disabled in this server.' };

        // 1. Blacklist Check
        const isBlacklisted = await TicketBlacklist.findOne({
            where: { guild_id: guild.id, user_id: user.id }
        });
        if (isBlacklisted) {
            return {
                success: false,
                reason: `You are blacklisted from using the ticket system.${isBlacklisted.reason ? ` Reason: ${isBlacklisted.reason}` : ''}`
            };
        }

        // 2. Existing Active Ticket Check (open or claimed)
        const existingTicket = await TicketInstance.findOne({
            where: {
                guild_id: guild.id,
                user_id: user.id,
                status: { [Op.or]: ['open', 'claimed'] }
            }
        });
        if (existingTicket) {
            return { success: false, reason: 'You already have an active open ticket. Please close your current ticket before opening a new one.' };
        }

        // 3. Cooldown Check
        const cooldownKey = `${guild.id}:${user.id}`;
        const now = Date.now();
        const lastCreated = ticketCooldowns.get(cooldownKey);
        if (lastCreated && now - lastCreated < COOLDOWN_MS) {
            const remaining = Math.ceil((COOLDOWN_MS - (now - lastCreated)) / 1000);
            return { success: false, reason: `You are on cooldown. Please wait ${remaining} second(s) before opening another ticket.` };
        }

        // Parse custom category/option details
        let option = null;
        if (optionSelected) {
            try {
                const options = JSON.parse(config.options || '[]');
                option = options.find(o => o.id === optionSelected);
            } catch (e) { }
        }

        // Create Channel permissions
        const permissionOverwrites = [
            {
                id: guild.roles.everyone.id,
                deny: [PermissionFlagsBits.ViewChannel]
            },
            {
                id: user.id,
                allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory, PermissionFlagsBits.AttachFiles]
            }
        ];

        try {
            const staffRoles = JSON.parse(config.staff_roles || '[]');
            for (const roleId of staffRoles) {
                permissionOverwrites.push({
                    id: roleId,
                    allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory]
                });
            }
        } catch (e) { }

        const channelLabel = option ? option.label.toLowerCase().replace(/[^a-z0-9]/g, '-') : 'support';

        // Resolve target category:
        // 1. Per-option override category
        // 2. Configured default category_id
        // 3. Parent category of the ticket panel channel (same category as the panel)
        // 4. null (no category)
        let targetCategory = (option && option.category_id) || config.category_id || null;
        if (!targetCategory && config.ticket_channel_id) {
            try {
                const panelChannel = guild.channels.cache.get(config.ticket_channel_id)
                    || await guild.channels.fetch(config.ticket_channel_id).catch(() => null);
                if (panelChannel && panelChannel.parentId) {
                    targetCategory = panelChannel.parentId;
                }
            } catch (e) { /* silently fall through */ }
        }

        // Create ticket channel
        const ticketChannel = await guild.channels.create({
            name: `ticket-${channelLabel}-${user.username}`,
            type: ChannelType.GuildText,
            parent: targetCategory,
            permissionOverwrites
        });

        // Set cooldown timestamp
        ticketCooldowns.set(cooldownKey, Date.now());

        // Save ticket instance
        await TicketInstance.create({
            guild_id: guild.id,
            channel_id: ticketChannel.id,
            user_id: user.id,
            status: 'open'
        });

        const staffRoles = JSON.parse(config.staff_roles || '[]');
        const staffMentions = staffRoles.map(id => `<@&${id}>`).join(' ');
        const pingHeader = `<@${user.id}> ${staffMentions}`.trim();

        const welcomeDesc = (option && option.welcome_message) || `Hello ${user}, support team will be with you shortly. Use buttons below to manage the ticket.`;
        const fullDesc = `${pingHeader}\n\n${welcomeDesc}`;

        // Send Welcome V2 Component Container
        const welcomeContainer = UI.createContainer({
            title: `🎫 ${option ? option.label : 'Ticket'} Opened`,
            description: fullDesc,
            color: 0x00f5ff
        });

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId(`ticket_close_${ticketChannel.id}`).setLabel('Close Ticket').setEmoji('🔒').setStyle(ButtonStyle.Danger),
            new ButtonBuilder().setCustomId(`ticket_claim_${ticketChannel.id}`).setLabel('Claim Ticket').setEmoji('🙋‍♂️').setStyle(ButtonStyle.Success)
        );

        welcomeContainer.addActionRowComponents(row);

        await ticketChannel.send({
            components: [welcomeContainer],
            flags: MessageFlags.IsComponentsV2,
            allowedMentions: {
                parse: ['users', 'roles', 'everyone']
            }
        });

        return { success: true, channel: ticketChannel };
    }

    static async claimTicket(interaction, channelId) {
        const ticket = await TicketInstance.findOne({ where: { channel_id: channelId, status: 'open' } });
        if (!ticket) {
            const container = UI.createContainer({
                title: '<:no:1526496561188831244> Action Failed',
                description: 'Ticket not found or already claimed/closed.',
                color: 0xFF0000
            });
            return interaction.reply({ components: [container], flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral });
        }

        const config = await this.getOrCreateConfig(interaction.guild.id);
        const staffRoles = JSON.parse(config.staff_roles || '[]');
        const isStaff = staffRoles.some(roleId => interaction.member.roles.cache.has(roleId)) ||
            interaction.member.permissions.has(PermissionFlagsBits.Administrator);

        if (!isStaff) {
            const container = UI.createContainer({
                title: '<:no:1526496561188831244> Permission Denied',
                description: 'Only authorized staff members can claim tickets.',
                color: 0xFF0000
            });
            return interaction.reply({ components: [container], flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral });
        }

        ticket.status = 'claimed';
        ticket.claimed_by = interaction.user.id;
        await ticket.save();

        const claimNoticeContainer = UI.createContainer({
            title: '🙋‍♂️ Ticket Claimed',
            description: `Ticket has been claimed by **${interaction.user.tag}** (<@${interaction.user.id}>).`,
            color: 0x00FF00
        });

        await interaction.channel.send({ components: [claimNoticeContainer], flags: MessageFlags.IsComponentsV2 });

        const replyContainer = UI.createContainer({
            title: '✅ Ticket Claimed',
            description: 'You have successfully claimed this ticket.',
            color: 0x00FF00
        });
        await interaction.reply({ components: [replyContainer], flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral });
    }

    static async closeTicket(interaction, channelId) {
        // Defer immediately to prevent DiscordAPIError[10062] (interaction expires after 3s)
        await interaction.deferReply();

        const ticket = await TicketInstance.findOne({ where: { channel_id: channelId } });
        if (!ticket || ticket.status === 'closed') {
            const container = UI.createContainer({
                title: '<:no:1526496561188831244> Action Failed',
                description: 'Ticket not found or already closed.',
                color: 0xFF0000
            });
            return interaction.editReply({ components: [container], flags: MessageFlags.IsComponentsV2 });
        }

        const config = await this.getOrCreateConfig(interaction.guild.id);

        // 1. Generate Transcript
        let transcriptContent = `Ticket Transcript for #${interaction.channel.name}\n\n`;
        const messages = await interaction.channel.messages.fetch({ limit: 100 });
        const sorted = messages.sort((a, b) => a.createdTimestamp - b.createdTimestamp);

        sorted.forEach(msg => {
            transcriptContent += `[${new Date(msg.createdTimestamp).toISOString()}] ${msg.author.tag}: ${msg.content}\n`;
            if (msg.attachments.size > 0) {
                msg.attachments.forEach(att => {
                    transcriptContent += `Attachment: ${att.url}\n`;
                });
            }
        });

        // Close ticket status
        ticket.status = 'closed';
        await ticket.save();

        // Send transcript to logs channel using V2 component container
        if (config.logs_channel_id) {
            const logsChannel = interaction.guild.channels.cache.get(config.logs_channel_id);
            if (logsChannel) {
                const buffer = Buffer.from(transcriptContent, 'utf-8');
                const file = { attachment: buffer, name: `transcript-${interaction.channel.name}.txt` };

                const logContainer = UI.createContainer({
                    title: `🔒 Ticket Closed`,
                    description: `**Ticket:** #${interaction.channel.name}\n**Closed By:** ${interaction.user.tag} (<@${interaction.user.id}>)`,
                    color: 0xFF0000
                });

                await logsChannel.send({ components: [logContainer], files: [file], flags: MessageFlags.IsComponentsV2 });
            }
        }

        const closeContainer = UI.createContainer({
            title: '🔒 Closing Ticket',
            description: 'Ticket is being closed and archived. Channel will be deleted in 5 seconds.',
            color: 0xFF9900
        });

        await interaction.editReply({ components: [closeContainer], flags: MessageFlags.IsComponentsV2 });

        setTimeout(async () => {
            // Guard against channel already being deleted before the timeout fires
            const channel = interaction.channel;
            if (channel) {
                await channel.delete().catch(() => { });
            }
        }, 5000);
    }
}

module.exports = TicketService;
