const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionsBitField } = require('discord.js');

module.exports = {
    name: "guildCreate",
    async execute(guild) {
        try {
            let targetUser;

            // Fetch owner
            const owner = await guild.fetchOwner().catch(err => console.log(`<:no:1526496561188831244>Error fetching owner:`, err));
            if (owner && !owner.user.bot) {
                targetUser = owner.user;
            } else {
                // Fetch admins manually (because cache may not work)
                const members = await guild.members.fetch();
                const admins = members.filter(member =>
                    member.permissions.has(PermissionsBitField.Flags.ManageGuild) && !member.user.bot
                );

                if (admins.size > 0) {
                    targetUser = admins.first().user;
                }
            }

            if (targetUser) {
                const welcomeEmbed = new EmbedBuilder()
                    .setColor("#00f5ff")
                    .setAuthor({ name: `Hello ${targetUser.username}! <a:pink8:1337678972108148757>`, iconURL: targetUser.displayAvatarURL({ dynamic: true }) })
                    .setDescription(`**Thank you for adding me to __${guild.name}__!**\n\n`
                        + " - **Use `&help` to explore my commands.**\n"
                        + " - **Need assistance? Join our support server!**\n"
                        + " - **Enjoying the bot? Consider supporting us to keep it online!**\n\n"
                        + "I'm here to assist you anytime! <:ozull:1363827309144178850> ")
                    .setFooter({ text: "Ozul Bot", iconURL: guild.client.user.displayAvatarURL() })
                    .setThumbnail("https://cdn.discordapp.com/icons/724620756373209148/58fb6581fe6f93d018cbe44fa91f47f7.webp");

                const buttons = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setLabel("Ozul Dev")
                        .setEmoji("<:ozul:1363633042672848916>")
                        .setURL("https://discord.gg/e7nejPpxhY")
                        .setStyle(ButtonStyle.Link),
                );

                await targetUser.send({ embeds: [welcomeEmbed], components: [buttons] })
                    .catch(err => console.log(`<:no:1526496561188831244>Unable to send a message to ${targetUser.tag}:`, err));
            }
            // Sync/create native AutoMod rules on guild join
            try {
                const AutoModService = require('../services/autoModService');
                const config = await AutoModService.getOrCreateConfig(guild.id);
                await AutoModService.syncToDiscord(guild.client, guild.id, config);
            } catch (e) {
                console.error("<:no:1526496561188831244>Error syncing AutoMod rules on guild join:", e);
            }
            // Sync/register all slash commands for this guild on join
            try {
                const CustomCommandService = require('../services/customCommandService');
                await CustomCommandService.syncGuildSlashCommands(guild.client, guild.id);
            } catch (e) {
                console.error("<:no:1526496561188831244>Error syncing slash commands on guild join:", e);
            }
        } catch (error) {
            console.error("<:no:1526496561188831244>Error sending message:", error);
        }
    }
};
