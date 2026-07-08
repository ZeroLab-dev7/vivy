const { MessageFlags } = require('discord.js');
const UI = require('../../utils/ui');

module.exports = {
    name: 'temprole',
    aliases: ['temprole', 'setrolefor'],
    description: 'Assign a role to a user for a specific amount of time',
    async execute(message, args) {
        if (args.length < 3) {
            const guideContainer = UI.createContainer({
                title: 'Command: TempRole',
                description: 'Assign a role to a user for a specific amount of time.',
                footer: `Requested by ${message.author.tag}`,
                fields: [
                    { name: "Aliases:", value: "- temprole, setrolefor" },
                    { name: "Usage:", value: "- ?temprole (user/id) (role/id) (time)" },
                    { name: "Examples:", value: `- ?temprole @user/id @role/id 24h` }
                ]
            });
            return message.reply({
                components: [guideContainer],
                flags: MessageFlags.IsComponentsV2
            });
        }

        const userInput = args[0];
        const roleInput = args[1];
        const timeInput = args[2];
        let user;

        if (message.mentions.users.size > 0) {
            user = message.mentions.users.first();
        } else if (/^\d+$/.test(userInput)) {
            try {
                user = await message.client.users.fetch(userInput);
            } catch (error) {
                return message.reply({
                    components: [UI.createContainer({ description: '- Invalid user ID or user not found.' })],
                    flags: MessageFlags.IsComponentsV2
                });
            }
        } else {
            return message.reply({
                components: [UI.createContainer({ description: '- Please mention a user or provide a valid user ID.' })],
                flags: MessageFlags.IsComponentsV2
            });
        }

        const member = message.guild.members.cache.get(user.id);
        if (!member) {
            return message.reply({
                components: [UI.createContainer({ description: '- This user is not in this server.' })],
                flags: MessageFlags.IsComponentsV2
            });
        }

        if (!message.guild.members.me.permissions.has('MANAGE_ROLES')) {
            return message.reply({
                components: [UI.createContainer({ description: '- I do not have permission to manage roles.' })],
                flags: MessageFlags.IsComponentsV2
            });
        }

        if (!message.member.permissions.has('MANAGE_ROLES')) {
            return message.reply({
                components: [UI.createContainer({ description: '- You do not have permission to manage roles.' })],
                flags: MessageFlags.IsComponentsV2
            });
        }

        let role;
        if (/^\d+$/.test(roleInput)) {
            role = message.guild.roles.cache.get(roleInput);
        } else if (message.mentions.roles.size > 0) {
            role = message.mentions.roles.first();
        } else {
            role = message.guild.roles.cache.find(r => r.name.toLowerCase() === roleInput.toLowerCase());
        }

        if (!role) {
            return message.reply({
                components: [UI.createContainer({ description: '- Role not found.' })],
                flags: MessageFlags.IsComponentsV2
            });
        }

        const timeInMinutes = parseInt(timeInput);
        if (isNaN(timeInMinutes) || timeInMinutes <= 0) {
            return message.reply({
                components: [UI.createContainer({ description: '- Please provide a valid time in minutes.' })],
                flags: MessageFlags.IsComponentsV2
            });
        }

        try {
            await member.roles.add(role);
            message.channel.send({
                components: [UI.createContainer({
                    description: `-  Successfully added the role **${role.name}** to ${user.username} for ${timeInMinutes} minutes.`
                })],
                flags: MessageFlags.IsComponentsV2
            });

            setTimeout(async () => {
                try {
                    await member.roles.remove(role);
                    message.channel.send({
                        components: [UI.createContainer({
                            description: `-  The role **${role.name}** was removed from ${user.username} after ${timeInMinutes} minutes.`
                        })],
                        flags: MessageFlags.IsComponentsV2
                    });
                } catch (err) {
                    console.error('❌ Error removing role:', err.message);
                }
            }, timeInMinutes * 60 * 1000);
        } catch (err) {
            console.error('<:false:1365517000750661693> Error adding role:', err.message);
            return message.reply({
                components: [UI.createContainer({ description: '- An error occurred while adding the role.' })],
                flags: MessageFlags.IsComponentsV2
            });
        }
    },
};
