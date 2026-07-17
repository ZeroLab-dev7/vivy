const { TicketConfig, TicketInstance } = require('../db/models');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, PermissionFlagsBits } = require('discord.js');

class TicketService {
    static async getOrCreateConfig(guildId) {
        let config = await TicketConfig.findByPk(guildId);
        if (!config) {
            config = await TicketConfig.create({ guild_id: guildId });
        }
        return config;
    }

    static async createTicket(guild, user) {
        const config = await this.getOrCreateConfig(guild.id);
        if (!config.is_enabled) return { success: false, reason: 'Tickets are disabled' };

        const existingTicket = await TicketInstance.findOne({
            where: { guild_id: guild.id, user_id: user.id, status: 'open' }
        });
        if (existingTicket) return { success: false, reason: 'You already have an open ticket' };

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

        // Create voice/text channel
        const ticketChannel = await guild.channels.create({
            name: `ticket-${user.username}`,
            type: ChannelType.GuildText,
            parent: config.category_id || null,
            permissionOverwrites
        });

        // Save ticket instance
        await TicketInstance.create({
            guild_id: guild.id,
            channel_id: ticketChannel.id,
            user_id: user.id,
            status: 'open'
        });

        // Send Welcome embed
        const welcomeEmbed = new EmbedBuilder()
            .setTitle(`🎫 Ticket Opened`)
            .setDescription(`Hello ${user}, support team will be with you shortly. Use buttons below to manage the ticket.`)
            .setColor('#00f5ff')
            .setTimestamp();

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId(`ticket_close_${ticketChannel.id}`).setLabel('Close Ticket').setEmoji('🔒').setStyle(ButtonStyle.Danger),
            new ButtonBuilder().setCustomId(`ticket_claim_${ticketChannel.id}`).setLabel('Claim Ticket').setEmoji('🙋‍♂️').setStyle(ButtonStyle.Success)
        );

        await ticketChannel.send({ embeds: [welcomeEmbed], components: [row] });
        return { success: true, channel: ticketChannel };
    }

    static async claimTicket(interaction, channelId) {
        const ticket = await TicketInstance.findOne({ where: { channel_id: channelId, status: 'open' } });
        if (!ticket) return interaction.reply({ content: '<:no:1526496561188831244>Ticket not found or already closed.', ephemeral: true });

        const config = await this.getOrCreateConfig(interaction.guild.id);
        const staffRoles = JSON.parse(config.staff_roles || '[]');
        const isStaff = staffRoles.some(roleId => interaction.member.roles.cache.has(roleId)) ||
            interaction.member.permissions.has(PermissionFlagsBits.Administrator);

        if (!isStaff) return interaction.reply({ content: '<:no:1526496561188831244>Only staff members can claim tickets.', ephemeral: true });

        ticket.status = 'claimed';
        ticket.claimed_by = interaction.user.id;
        await ticket.save();

        const embed = new EmbedBuilder()
            .setDescription(`🙋‍♂️ Ticket claimed by **${interaction.user.tag}**`)
            .setColor('Green')
            .setTimestamp();

        await interaction.channel.send({ embeds: [embed] });
        await interaction.reply({ content: '✅ Ticket claimed successfully.', ephemeral: true });
    }

    static async closeTicket(interaction, channelId) {
        const ticket = await TicketInstance.findOne({ where: { channel_id: channelId } });
        if (!ticket || ticket.status === 'closed') return interaction.reply({ content: '<:no:1526496561188831244>Ticket not found or already closed.', ephemeral: true });

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
        ticket.save();

        // Send transcript to logs
        if (config.logs_channel_id) {
            const logsChannel = interaction.guild.channels.cache.get(config.logs_channel_id);
            if (logsChannel) {
                const buffer = Buffer.from(transcriptContent, 'utf-8');
                const file = { attachment: buffer, name: `transcript-${interaction.channel.name}.txt` };

                const logEmbed = new EmbedBuilder()
                    .setTitle(`🔒 Ticket Closed`)
                    .setDescription(`**Ticket:** ${interaction.channel.name}\n**Closed By:** ${interaction.user.tag}`)
                    .setColor('Red')
                    .setTimestamp();

                await logsChannel.send({ embeds: [logEmbed], files: [file] });
            }
        }

        await interaction.reply({ content: '✅ Ticket is being closed and archived. Channel will be deleted in 5 seconds.' });

        setTimeout(async () => {
            await interaction.channel.delete().catch(() => { });
        }, 5000);
    }
}

module.exports = TicketService;
