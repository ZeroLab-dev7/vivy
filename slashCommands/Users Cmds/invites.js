const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, PermissionFlagsBits } = require('discord.js');
const { InviteData, InviteBonus } = require('../../db/models');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('invites')
        .setDescription('Displays how many people joined using your invite')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to check invites for')
                .setRequired(false)
        ),
    async execute(interaction) {
        const guild = interaction.guild;
        const targetUser = interaction.options.getUser('user') || interaction.user;

        const invites = await guild.invites.fetch().catch(() => null);
        if (!invites) return interaction.reply({ content: 'Could not fetch invites.', ephemeral: true });

        // Fetch DB stats
        const dbInvites = await InviteData.findAll({
            where: {
                guild_id: guild.id,
                inviter_id: targetUser.id
            }
        });

        const bonusRecord = await InviteBonus.findOne({
            where: {
                guild_id: guild.id,
                user_id: targetUser.id
            }
        });

        // Calculate Stats
        const regular = dbInvites.filter(i => !i.is_fake && !i.has_left).length;
        const fake = dbInvites.filter(i => i.is_fake).length;
        const left = dbInvites.filter(i => i.has_left).length;
        const bonus = bonusRecord ? bonusRecord.bonus : 0;

        // Real = Regular + Bonus
        const totalReal = regular + bonus;

        // Active Invites (from Discord object)
        const userInvites = invites.filter(invite => invite.inviter && invite.inviter.id === targetUser.id);
        const activeInvites = userInvites.filter(invite => invite.uses && invite.uses > 0).size;

        const embedMessage = new EmbedBuilder()
            .setAuthor({ name: `${targetUser.username}'s Invite Stats`, iconURL: targetUser.displayAvatarURL() })
            .setColor('#00f5ff')
            .setThumbnail(guild.iconURL() || undefined)
            .addFields(
                {
                    name: '<a:links:1366752207533379646>  Your Invites:',
                    value: `**${totalReal}** invites\n(**${regular}** regular, **${bonus}** bonus, **${fake}** fake, **${left}** leaves)\n\n📊 **Active Invites:** ${activeInvites}`
                }
            )
            .setFooter({ text: `${guild.name} Invite System`, iconURL: guild.iconURL() })
            .setTimestamp();

        const inviteButton = new ButtonBuilder()
            .setCustomId('my_invites')
            .setLabel('Your Invites')
            .setEmoji('<a:links:1366752207533379646>')
            .setDisabled(true)
            .setStyle(ButtonStyle.Secondary);

        const row = new ActionRowBuilder().addComponents(inviteButton);

        await interaction.reply({ embeds: [embedMessage], components: [row] });
    }
};
