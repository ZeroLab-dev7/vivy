const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType } = require("discord.js");
const RoomSetupDB = require("../db/room-setup-db");

module.exports = {
    async handleButton(interaction) {
        if (!interaction.customId.startsWith('nh_')) return;

        try {
            const parts = interaction.customId.split('_');
            // Format: nh_<action>_<targetChannelId>_<targetUserId>
            const action = parts[1];
            const targetChannelId = parts[2];
            const targetUserId = parts[3];

            const guild = interaction.guild;
            const member = interaction.member;

            const targetChannel = guild.channels.cache.get(targetChannelId);

            // If channel is deleted, just update embed to say "Closed" or "Deleted"
            if (!targetChannel && action !== 'close') {
                return interaction.reply({ content: "❌ The room no longer exists.", ephemeral: true });
            }

            switch (action) {
                case 'claim':
                    // Update the embed to show "Claimed by @User"
                    // We need to modify the original embed
                    // Access old embed
                    const oldEmbed = interaction.message.embeds[0];
                    if (!oldEmbed) return;

                    const claimedEmbed = EmbedBuilder.from(oldEmbed)
                        .setColor("Yellow")
                        .setDescription(oldEmbed.description + `\n\n✅ **Claimed by:** ${member} | \`${member.id}\``);

                    // Update message components to disable 'Click to Claim'? Or just update text.
                    // Let's replace the "Claim" button with "Claimed" disabled button.
                    const oldComponents = interaction.message.components[0];
                    const newRow = ActionRowBuilder.from(oldComponents);

                    // Disable first button (Claim)
                    newRow.components[0].setDisabled(true).setLabel("Claimed");

                    await interaction.update({ embeds: [claimedEmbed], components: [newRow] });

                    // Notify in the user's room
                    if (targetChannel) {
                        await targetChannel.send({
                            content: `👋 **Hello!** ${member} has claimed your request and will be with you shortly.`
                        }).catch(() => { });
                    }
                    break;

                case 'join':
                    // Move the staff member to the channel
                    if (!member.voice.channel) {
                        return interaction.reply({ content: "❌ You need to be in a voice channel first to be moved!", ephemeral: true });
                    }

                    if (targetChannel) {
                        await member.voice.setChannel(targetChannel);
                        await interaction.reply({ content: `✅ Moved to <#${targetChannelId}>`, ephemeral: true });
                    } else {
                        await interaction.reply({ content: "❌ Room not found.", ephemeral: true });
                    }
                    break;

                case 'close':
                    // Delete the room
                    // Delete the room
                    if (targetChannel) {
                        try {
                            const { SupportTicket } = require("../db/models");
                            await targetChannel.delete().catch(() => { });
                            await SupportTicket.destroy({ where: { channel_id: targetChannelId } });
                        } catch (err) {
                            console.error("Error deleting channel/ticket:", err);
                        }
                    } else {
                        // Even if channel is gone, ensure DB is clean
                        const { SupportTicket } = require("../db/models");
                        await SupportTicket.destroy({ where: { channel_id: targetChannelId } }).catch(() => { });
                    }

                    // Update embed to closed
                    const closedEmbed = EmbedBuilder.from(interaction.message.embeds[0])
                        .setColor("Red")
                        .setDescription(interaction.message.embeds[0].description.split('\n\n✅ **Claimed by:**')[0] + `\n\n❌ **Closed by:** ${member} | \`${member.id}\``);

                    // Disable all buttons
                    const closedRow = ActionRowBuilder.from(interaction.message.components[0]);
                    closedRow.components.forEach(btn => btn.setDisabled(true));

                    // If it was already replied to (e.g. claim then close), we need to editReply
                    // But here we are handling a button click, so update is fine.
                    // However, if we deleted the channel, we update the log message.
                    await interaction.update({ embeds: [closedEmbed], components: [closedRow] });
                    break;
            }

        } catch (error) {
            console.error("Staff Management Error:", error);
            if (!interaction.replied) {
                await interaction.reply({ content: "❌ An error occurred.", ephemeral: true });
            }
        }
    }
};
