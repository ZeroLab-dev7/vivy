const { PermissionFlagsBits, ButtonBuilder, ButtonStyle, ActionRowBuilder, ApplicationCommandOptionType, MessageFlags } = require('discord.js');
const UI = require('../../utils/ui');
const { InviteData, InviteBonus } = require('../../db/models');

// Cooldown management
const cooldowns = new Map(); // Cooldown map for users
const COOLDOWN_TIME = 5000; // 5 seconds cooldown

// Leaderboard cache to avoid excessive fetching
let leaderboardCache = {
    data: null,
    timestamp: 0
};
const CACHE_LIFETIME = 300000; // 5 minutes cache lifetime

module.exports = {
    name: 'myinvites',
    aliases: ['invites', 'checkinvites'],
    description: 'Displays how many people joined using your invite',

    // Add slash command support
    slash: true,
    options: [
        {
            name: 'user',
            description: 'User to check invites for (default: yourself)',
            type: ApplicationCommandOptionType.User,
            required: false
        },
        {
            name: 'display',
            description: 'Display mode',
            type: ApplicationCommandOptionType.String,
            required: false,
            choices: [
                { name: 'Basic', value: 'basic' },
                { name: 'Detailed', value: 'detailed' },
                { name: 'Leaderboard', value: 'leaderboard' }
            ]
        }
    ],

    // Helper to calculate all invite counts for the guild
    async getInviteCounts(guild) {
        // Fetch all data in parallel
        const [invites, dbInvites, bonuses] = await Promise.all([
            guild.invites.fetch().catch(err => {
                console.error(`Error fetching invites: ${err}`);
                return new Map();
            }),
            InviteData.findAll({ where: { guild_id: guild.id } }),
            InviteBonus.findAll({ where: { guild_id: guild.id } })
        ]);

        const userStats = new Map();

        // 1. Process Discord Invites (The "Regular" base count)
        invites.forEach(invite => {
            if (!invite.inviter) return;
            const id = invite.inviter.id;
            const stats = userStats.get(id) || { uses: 0, fake: 0, left: 0, bonus: 0, username: invite.inviter.username };
            stats.uses += (invite.uses || 0);
            if (!stats.username) stats.username = invite.inviter.username;
            userStats.set(id, stats);
        });

        // 2. Process DB Invites (Fakes and Leaves)
        dbInvites.forEach(invite => {
            const id = invite.inviter_id;
            const stats = userStats.get(id) || { uses: 0, fake: 0, left: 0, bonus: 0, username: 'Unknown' };

            if (invite.is_fake) stats.fake++;
            if (invite.has_left) stats.left++;

            userStats.set(id, stats);
        });

        // 3. Process Bonuses
        bonuses.forEach(bonus => {
            const id = bonus.user_id;
            const stats = userStats.get(id) || { uses: 0, fake: 0, left: 0, bonus: 0, username: 'Unknown' };
            stats.bonus += bonus.bonus;
            userStats.set(id, stats);
        });

        // 4. Calculate Real Score
        // Formula: Real = (uses + bonus) - (fake + left)
        for (const [id, stats] of userStats.entries()) {
            stats.real = (stats.uses + stats.bonus) - (stats.fake + stats.left);

            // Try to resolve username if unknown
            if (stats.username === 'Unknown') {
                try {
                    const member = guild.members.cache.get(id);
                    if (member) stats.username = member.user.username;
                } catch (e) { }
            }
        }

        return { userStats, discordInvites: invites };
    },

    async execute(message, args) {
        try {
            // Check if the user is on cooldown
            if (cooldowns.has(message.author.id)) {
                const timeLeft = cooldowns.get(message.author.id) - Date.now();
                if (timeLeft > 0) {
                    // React with a cooldown emoji
                    return message.react('⏳');
                }
            }

            // Set the cooldown for the user
            cooldowns.set(message.author.id, Date.now() + COOLDOWN_TIME);
            setTimeout(() => cooldowns.delete(message.author.id), COOLDOWN_TIME);

            // Fetch guild invites with error handling
            const guild = message.guild;
            if (!guild) return message.reply({
                components: [UI.createContainer({
                    description: '- <a:warn:1365688576758644797> This command can only be used in a server.'
                })],
                flags: MessageFlags.IsComponentsV2
            });

            // Check if bot has necessary permissions to fetch invites
            const botMember = await guild.members.fetch(message.client.user.id).catch(() => null);
            if (!botMember?.permissions.has(PermissionFlagsBits.ManageGuild)) {
                return message.reply({
                    components: [UI.createContainer({
                        description: '- <a:warn:1365688576758644797> I need the "Manage Server" permission to check invites.'
                    })],
                    flags: MessageFlags.IsComponentsV2
                });
            }

            // Parse arguments
            let targetUser = message.author;
            let displayMode = 'detailed'; // default mode

            // Check if user wants to see someone else's invites
            if (args.length > 0) {
                // Check if first argument is "leaderboard"
                if (args[0].toLowerCase() === 'leaderboard') {
                    return this.showLeaderboard(message, guild);
                }

                // Try to find mentioned user or by ID
                const mentionedUser = message.mentions.users.first();
                if (mentionedUser) {
                    targetUser = mentionedUser;
                } else if (/^\d{17,19}$/.test(args[0])) {
                    try {
                        targetUser = await message.client.users.fetch(args[0]);
                    } catch (error) {
                        // Invalid user ID, keep default
                    }
                }

                // Check for display mode argument
                if (args.includes('basic')) displayMode = 'basic';
                if (args.includes('detailed')) displayMode = 'detailed';
            }

            // Fetch all invite data using helper
            const { userStats, discordInvites } = await this.getInviteCounts(guild);

            // Get stats for target user
            const stats = userStats.get(targetUser.id) || { uses: 0, fake: 0, left: 0, bonus: 0, real: 0, username: targetUser.username };

            // Get total server joins
            const serverJoins = discordInvites.reduce((sum, invite) => sum + (invite.uses || 0), 0);

            // Calculate Rank
            const sortedUsers = [...userStats.entries()].sort((a, b) => b[1].real - a[1].real);
            const rank = sortedUsers.findIndex(entry => entry[0] === targetUser.id) + 1;
            const rankDisplay = rank > 0 ? `\n🏆 Server Rank: #${rank}` : '';

            // Invite Details (Active links)
            let inviteDetails = '';
            const userInvites = discordInvites.filter(invite => invite.inviter && invite.inviter.id === targetUser.id);
            const activeInvitesCount = userInvites.size;

            if (userInvites.size > 0) {
                const sortedInvites = [...userInvites.values()]
                    .sort((a, b) => (b.uses || 0) - (a.uses || 0));

                sortedInvites.forEach(invite => {
                    const expiresAt = invite.expiresAt
                        ? `(Expires: <t:${Math.floor(invite.expiresAt.getTime() / 1000)}:R>)`
                        : '';

                    inviteDetails += `\n• Code: \`${invite.code}\` - Used ${invite.uses || 0} times ${expiresAt}`;

                    if (displayMode === 'detailed' && invite.channel) {
                        inviteDetails += ` - Channel: <#${invite.channel.id}>`;
                    }
                });
            } else {
                inviteDetails = targetUser.id === message.author.id
                    ? "\nYou haven't created any invites yet."
                    : `\n${targetUser.username} hasn't created any invites yet.`;
            }

            // Set embed color based on REAL count
            let embedColor;
            if (stats.real > 50) embedColor = '#FFD700'; // Gold
            else if (stats.real > 25) embedColor = '#C0C0C0'; // Silver
            else if (stats.real > 10) embedColor = '#CD7F32'; // Bronze
            else embedColor = '#00f5ff'; // Default blue

            const inviteCountText = `**${stats.real}** real invites \n(**${stats.uses}** regular, **${stats.bonus}** bonus, **${stats.fake}** fake, **${stats.left}** leaves)${rankDisplay}`;

            // Create embed container with detailed stats
            const fields = [
                {
                    name: '<a:links:1366752207533379646> Invite Summary',
                    value: inviteCountText + `\n📊 **Active Links:** ${activeInvitesCount}`
                }
            ];

            // Add details field if not basic mode
            if (displayMode !== 'basic') {
                fields.push({
                    name: '📋 Invite Details',
                    value: inviteDetails || "No invites found."
                });
            }

            fields.push({
                name: '📈 Server Stats',
                value: `Total server joins from invites: **${serverJoins}**\nTotal invite links: **${discordInvites.size}**`
            });

            const embedContainer = UI.createContainer({
                title: targetUser.id === message.author.id ?
                    `Your Invite Stats` :
                    `${targetUser.username}'s Invite Stats`,
                description: `Requested by ${message.author.username}`,
                fields: fields,
                footer: `${guild.name} Invite System`
            });

            // Create action buttons
            const row = new ActionRowBuilder();

            // Add invite stats button
            const inviteButton = new ButtonBuilder()
                .setCustomId('my_invites')
                .setLabel(targetUser.id === message.author.id ? 'Your Invites' : `${targetUser.username}'s Invites`)
                .setEmoji('<a:links:1366752207533379646>')
                .setDisabled(true)
                .setStyle(ButtonStyle.Secondary);
            row.addComponents(inviteButton);

            // Add create invite button
            const createInviteButton = new ButtonBuilder()
                .setCustomId('create_invite')
                .setLabel('Create Invite')
                .setEmoji('🔗')
                .setStyle(ButtonStyle.Primary);
            row.addComponents(createInviteButton);

            // Add leaderboard button
            const leaderboardButton = new ButtonBuilder()
                .setCustomId('invite_leaderboard')
                .setLabel('Leaderboard')
                .setEmoji('🏆')
                .setStyle(ButtonStyle.Success);
            row.addComponents(leaderboardButton);

            // Send the message with embed and buttons
            // Send the message with embed and buttons
            await message.reply({
                components: [embedContainer, row],
                flags: MessageFlags.IsComponentsV2
            });

        } catch (error) {
            console.error(`Error in myinvites command: ${error}`);
            message.reply({ content: 'An error occurred while processing your request.' });
        }
    },

    // Helper method to show invite leaderboard
    async showLeaderboard(message, guild) {
        try {
            // Use cached leaderboard if available and not expired
            const now = Date.now();
            if (leaderboardCache.data && leaderboardCache.timestamp + CACHE_LIFETIME > now) {
                await message.reply({
                    components: [leaderboardCache.data],
                    flags: MessageFlags.IsComponentsV2
                });
                return;
            }

            await message.channel.sendTyping();

            const invites = await guild.invites.fetch().catch(error => {
                console.error(`Error fetching invites for leaderboard: ${error}`);
                return null;
            });

            if (!invites) return message.reply({
                components: [UI.createContainer({
                    description: '- <a:warn:1365688576758644797> Could not fetch invites for the leaderboard.'
                })],
                flags: MessageFlags.IsComponentsV2
            });

            // Use the shared helper to get stats
            const { userStats } = await this.getInviteCounts(guild);

            if (userStats.size === 0) {
                return message.reply({
                    components: [UI.createContainer({
                        description: '- <a:warn:1365688576758644797> No invite data found for this server.'
                    })],
                    flags: MessageFlags.IsComponentsV2
                });
            }

            // Sort users by REAL invite count
            const sortedUsers = [...userStats.entries()]
                .sort((a, b) => b[1].real - a[1].real)
                .slice(0, 10); // Top 10

            // Create leaderboard text
            let leaderboardText = '';
            sortedUsers.forEach((entry, index) => {
                const [userId, stats] = entry;
                const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`;

                // Link format for username if available
                const userDisplay = stats.username !== 'Unknown' ? `**${stats.username}**` : `<@${userId}>`;

                leaderboardText += `${medal} ${userDisplay} - **${stats.real}** Real Invites (${stats.uses} Regular, ${stats.fake} Fake, ${stats.left} Left)\n`;
            });

            // Find user's rank if not in top 10
            const authorId = message.author.id;

            // Get full sorted list for author rank
            const allSortedUsers = [...userStats.entries()].sort((a, b) => b[1].real - a[1].real);

            let authorRank = allSortedUsers.findIndex(entry => entry[0] === authorId) + 1;
            let authorFooter = '';

            if (authorRank > 0) {
                const authorStats = userStats.get(authorId);
                authorFooter = `Your rank: #${authorRank} with ${authorStats.real} real invites`;
            }

            // Create leaderboard embed
            // Create leaderboard container
            const leaderboardContainer = UI.createContainer({
                title: `🏆 Invite Leaderboard - ${guild.name}`,
                description: leaderboardText,
                footer: authorFooter || `${guild.name} Invite System`
            });

            // Cache the leaderboard
            leaderboardCache.data = leaderboardContainer;
            leaderboardCache.timestamp = now;

            // Create buttons
            const refreshButton = new ButtonBuilder()
                .setCustomId('refresh_leaderboard')
                .setLabel('Refresh')
                .setEmoji('<a:refresh:1366762522367103080>')
                .setStyle(ButtonStyle.Primary);

            const myInvitesButton = new ButtonBuilder()
                .setCustomId('view_my_invites')
                .setLabel('My Invites')
                .setEmoji('<a:links:1366752207533379646>')
                .setStyle(ButtonStyle.Secondary);

            const row = new ActionRowBuilder().addComponents(refreshButton, myInvitesButton);

            await message.reply({
                components: [leaderboardContainer, row],
                flags: MessageFlags.IsComponentsV2
            });

        } catch (error) {
            console.error(`Error showing leaderboard: ${error}`);
            message.reply({ content: 'An error occurred while generating the leaderboard.' });
        }
    },

    // For slash command support - you'll need a handler for this
    async interactionExecute(interaction) {
        try {
            // Check cooldown
            if (cooldowns.has(interaction.user.id)) {
                const timeLeft = cooldowns.get(interaction.user.id) - Date.now();
                if (timeLeft > 0) {
                    return interaction.reply({
                        content: `Please wait ${(timeLeft / 1000).toFixed(1)} seconds before using this command again.`,
                        ephemeral: true
                    });
                }
            }

            // Set cooldown
            cooldowns.set(interaction.user.id, Date.now() + COOLDOWN_TIME);
            setTimeout(() => cooldowns.delete(interaction.user.id), COOLDOWN_TIME);

            const guild = interaction.guild;
            if (!guild) return interaction.reply({ content: 'This command can only be used in a server.', ephemeral: true });

            // Handle options
            const targetUser = interaction.options.getUser('user') || interaction.user;
            const displayMode = interaction.options.getString('display') || 'detailed';

            // Special case for leaderboard
            if (displayMode === 'leaderboard') {
                await interaction.deferReply();

                // Create a message-like object for compatibility with showLeaderboard
                const messageObj = {
                    author: interaction.user,
                    channel: {
                        sendTyping: async () => { }
                    },
                    reply: async (options) => interaction.followUp(options)
                };

                return this.showLeaderboard(messageObj, guild);
            }

            await interaction.deferReply();

            // Helper function to process interaction based on message command logic
            // Get stats
            const { userStats, discordInvites } = await this.getInviteCounts(guild);

            // Target stats
            const stats = userStats.get(targetUser.id) || { uses: 0, fake: 0, left: 0, bonus: 0, real: 0, username: targetUser.username };

            // Server joins
            const serverJoins = discordInvites.reduce((sum, invite) => sum + (invite.uses || 0), 0);

            // Rank
            const sortedUsers = [...userStats.entries()].sort((a, b) => b[1].real - a[1].real);
            const rank = sortedUsers.findIndex(entry => entry[0] === targetUser.id) + 1;
            const rankDisplay = rank > 0 ? `\n🏆 Server Rank: #${rank}` : '';

            // Active Links (Count)
            const userInvites = discordInvites.filter(invite => invite.inviter && invite.inviter.id === targetUser.id);
            const activeInvitesCount = userInvites.size;

            // Embed String
            const inviteCountText = `**${stats.real}** real invites \n(**${stats.uses}** regular, **${stats.bonus}** bonus, **${stats.fake}** fake, **${stats.left}** leaves)${rankDisplay}`;

            const fields = [
                {
                    name: '<a:links:1366752207533379646> Invite Summary',
                    value: inviteCountText + `\n📊 **Active Links:** ${activeInvitesCount}`
                }
            ];

            fields.push({
                name: '📈 Server Stats',
                value: `Total server joins from invites: **${serverJoins}**\nTotal invite links: **${discordInvites.size}**`
            });

            // Build a similar container for slash
            const slashContainer = UI.createContainer({
                title: targetUser.id === interaction.user.id ?
                    `Your Invite Stats` :
                    `${targetUser.username}'s Invite Stats`,
                description: `Requested by ${interaction.user.username}`,
                fields: fields,
                footer: `${guild.name} Invite System`
            });

            interaction.followUp({
                components: [slashContainer],
                flags: MessageFlags.IsComponentsV2
            });

        } catch (error) {
            console.error(`Error in slash command invites: ${error}`);

            // Handle failed interactions properly
            if (interaction.deferred || interaction.replied) {
                interaction.followUp({ content: 'An error occurred while processing your request.', ephemeral: true });
            } else {
                interaction.reply({ content: 'An error occurred while processing your request.', ephemeral: true });
            }
        }
    }
};