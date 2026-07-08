const LevelService = require('../../services/levelService');
const UI = require('../../utils/ui');
const { PermissionsBitField } = require('discord.js');

module.exports = {
    name: 'leveladmin',
    aliases: ['xpadmin', 'levelmanage'],
    description: 'Admin commands for managing server leveling systems.',
    async execute(message, args) {
        try {
            // Require Manage Server or Admin permission
            if (!message.member.permissions.has(PermissionsBitField.Flags.ManageGuild) && !message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
                return message.reply({
                    components: [UI.createContainer({
                        description: '❌ You require **Manage Server** or **Administrator** permissions to use this command.'
                    })]
                });
            }

            const action = args[0] ? args[0].toLowerCase() : null;
            if (!action) {
                return message.reply({
                    components: [UI.createContainer({
                        title: '⚙️ Leveling Admin Commands',
                        description: 'Available subcommands:\n' +
                            '• `leveladmin addxp <@user> <amount>` - Add XP to user\n' +
                            '• `leveladmin removexp <@user> <amount>` - Remove XP from user\n' +
                            '• `leveladmin setxp <@user> <value>` - Set user XP\n' +
                            '• `leveladmin setlevel <@user> <value>` - Set user Level\n' +
                            '• `leveladmin reset <@user>` - Reset user leveling stats\n' +
                            '• `leveladmin resetleaderboard` - Reset server leaderboard'
                    })]
                });
            }

            const target = message.mentions.members.first() || (args[1] ? await message.guild.members.fetch(args[1]).catch(() => null) : null);

            if (action === 'resetleaderboard') {
                await LevelService.resetLeaderboard(message.guild.id, message.client);
                return message.reply({
                    components: [UI.createContainer({
                        description: '✅ Successfully reset all leveling stats and caches for this server.'
                    })]
                });
            }

            if (!target) {
                return message.reply({
                    components: [UI.createContainer({
                        description: '❌ Please mention a valid user or specify a user ID.'
                    })]
                });
            }

            if (target.user.bot) {
                return message.reply({
                    components: [UI.createContainer({
                        description: '❌ Leveling operations cannot be performed on bots.'
                    })]
                });
            }

            let result;
            if (action === 'addxp') {
                const amount = parseInt(args[2], 10);
                if (isNaN(amount) || amount <= 0) return message.reply('❌ Please specify a positive number of XP to add.');
                result = await LevelService.addAdminXP(target.id, message.guild.id, amount, message.client);
                return message.reply({
                    components: [UI.createContainer({
                        description: `✅ Added **${amount} XP** to ${target}. User is now level **${result.level}**.`
                    })]
                });
            }

            if (action === 'removexp') {
                const amount = parseInt(args[2], 10);
                if (isNaN(amount) || amount <= 0) return message.reply('❌ Please specify a positive number of XP to remove.');
                result = await LevelService.removeAdminXP(target.id, message.guild.id, amount, message.client);
                return message.reply({
                    components: [UI.createContainer({
                        description: `✅ Removed **${amount} XP** from ${target}. User is now level **${result.level}**.`
                    })]
                });
            }

            if (action === 'setxp') {
                const val = parseInt(args[2], 10);
                if (isNaN(val) || val < 0) return message.reply('❌ Please specify a valid non-negative number of XP.');
                result = await LevelService.setXP(target.id, message.guild.id, val, message.client);
                return message.reply({
                    components: [UI.createContainer({
                        description: `✅ Set XP for ${target} to **${val}**. User is now level **${result.level}**.`
                    })]
                });
            }

            if (action === 'setlevel') {
                const val = parseInt(args[2], 10);
                if (isNaN(val) || val < 0) return message.reply('❌ Please specify a valid level.');
                result = await LevelService.setLevel(target.id, message.guild.id, val, message.client);
                return message.reply({
                    components: [UI.createContainer({
                        description: `✅ Set level for ${target} to **${val}**.`
                    })]
                });
            }

            if (action === 'reset') {
                await LevelService.resetXP(target.id, message.guild.id, message.client);
                return message.reply({
                    components: [UI.createContainer({
                        description: `✅ Reset leveling progress and counters for ${target}.`
                    })]
                });
            }

            return message.reply({
                components: [UI.createContainer({
                    description: '❌ Invalid leveling admin subcommand.'
                })]
            });

        } catch (error) {
            console.error('Error in leveladmin command:', error);
            await message.reply({
                components: [UI.createContainer({
                    description: '❌ Failed to process admin leveling command.',
                    color: 0xff0000
                })]
            });
        }
    }
};
