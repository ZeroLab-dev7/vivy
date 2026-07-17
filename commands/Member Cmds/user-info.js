const { EmbedBuilder } = require('discord.js');

const cooldowns = new Map(); // Cooldown map for users
const COOLDOWN_TIME = 10000; // 10 seconds cooldown

module.exports = {
    name: 'user',
    aliases: ['u', 'userinfo', 'user-info'],
    description: 'Get detailed information about a user.',
    cooldown: 10,
    async execute(message, args, client) {
        // Check for cooldown
        if (cooldowns.has(message.author.id)) {
            return message.react('⏳');
        }

        // Set the cooldown for the user
        cooldowns.set(message.author.id, Date.now() + COOLDOWN_TIME);
        setTimeout(() => cooldowns.delete(message.author.id), COOLDOWN_TIME);

        let user;
        if (message.mentions.users.size) {
            user = message.mentions.users.first();
        } else if (args.length) {
            user = await client.users.fetch(args[0]).catch(() => null);
        } else {
            user = message.author;
        }

        if (!user) {
            return message.reply('<:no:1526496561188831244>User not found.');
        }

        const member = await message.guild.members.fetch(user.id).catch(() => null);

        if (!member) {
            return message.reply('<:no:1526496561188831244>This user is not in the server.');
        }

        const joinedAt = member.joinedAt;
        const timeJoined = `<t:${Math.floor(joinedAt.getTime() / 1000)}:R>`;
        const createdAt = user.createdAt;
        const timeCreated = `<t:${Math.floor(createdAt.getTime() / 1000)}:R>`;
        const highestRole = member.roles.highest;
        const highestRoleName = highestRole ? highestRole.toString() : 'No Role';
        const nickname = member.nickname || `\`No Nickname\``;

        // Get all roles
        const roles = member.roles.cache
            .filter(role => role.id !== message.guild.id) // Exclude @everyone
            .map(role => role.toString())
            .join(', ');

        const rolesDisplay = roles.length > 0 ? (roles.length > 1024 ? roles.substring(0, 1021) + '...' : roles) : 'No Roles';

        const embed = new EmbedBuilder()
            .setColor("Blue")
            .setTitle(`${user.username}'s Information`)
            .setThumbnail(user.displayAvatarURL({ dynamic: true }))
            .addFields(
                { name: '<a:info:1366763944177434626> User Information', value: `> **Username**: ${user.username}\n> **Mention**: <@${user.id}>\n> **ID**: \`${user.id}\`\n> **Nickname**: ${nickname}\n> **Created At**: ${timeCreated}`, inline: false },
                { name: '<a:info:1366763944177434626> Server Member Info', value: `> **Joined At**: ${timeJoined}\n> **Highest Role**: ${highestRoleName}`, inline: false },
                { name: '<a:info:1366763944177434626> Roles', value: rolesDisplay, inline: false }
            )

            .setTimestamp();

        await message.channel.send({ embeds: [embed] });
    }
};
