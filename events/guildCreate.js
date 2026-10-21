const { PermissionsBitField, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const UIManager = require('../managers/uiManager');

module.exports = {
    name: "guildCreate",
    async execute(guild) {
        try {
            let targetUser;

            // Fetch owner
            const owner = await guild.fetchOwner().catch(err => console.log("Error fetching owner:", err));
            if (owner && !owner.user.bot) {
                targetUser = owner.user;
            } else {
                // Fetch admins manually
                const members = await guild.members.fetch().catch(() => null);
                if (members) {
                    const admins = members.filter(member =>
                        member.permissions.has(PermissionsBitField.Flags.ManageGuild) && !member.user.bot
                    );
                    if (admins.size > 0) {
                        targetUser = admins.first().user;
                    }
                }
            }

            if (targetUser) {
                const container = UIManager.createContainer({
                    title: `✨ Thank You for Adding Vivy!`,
                    accentColor: UIManager.ACCENTS.CYAN
                });

                const welcomeSec = UIManager.createSection({
                    title: `Welcome to Vivy`,
                    content: `Hello **${targetUser.username}**!\nThank you for adding **Vivy** to **${guild.name}**.\nVivy is your all-in-one Discord assistant featuring Global Economy, Leveling, Moderation, AutoMod, Tickets, Custom Commands, and Server Protection.`
                });

                const quickStartSec = UIManager.createSection({
                    title: `🚀 Quick Start Guide`,
                    content: `• **Default Prefix:** \`?\` (e.g. \`?help\`, \`?bal\`, \`?top\`)\n• **Slash Commands:** \`/\` (e.g. \`/help\`, \`/leaderboard\`, \`/dashboard\`)\n• **Server Dashboard:** Type \`?dashboard\` or \`/dashboard\` to manage server settings.`
                });

                UIManager.addSections(container, [welcomeSec, quickStartSec]);

                const supportRow = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setLabel("Support Server")
                        .setURL("https://discord.gg/e7nejPpxhY")
                        .setStyle(ButtonStyle.Link)
                );

                container.addActionRowComponents(supportRow);

                await targetUser.send(UIManager.toResponse(container))
                    .catch(err => console.log(`Unable to send welcome DM to ${targetUser.tag}:`, err));
            }

            // Sync/create native AutoMod rules on guild join
            try {
                const AutoModService = require('../services/autoModService');
                const config = await AutoModService.getOrCreateConfig(guild.id);
                await AutoModService.syncToDiscord(guild.client, guild.id, config);
            } catch (e) {
                console.error("Error syncing AutoMod rules on guild join:", e);
            }

            // Sync/register all slash commands for this guild on join
            try {
                const CustomCommandService = require('../services/customCommandService');
                await CustomCommandService.syncGuildSlashCommands(guild.client, guild.id);
            } catch (e) {
                console.error("Error syncing slash commands on guild join:", e);
            }
        } catch (error) {
            console.error("Error handling guildCreate event:", error);
        }
    }
};
