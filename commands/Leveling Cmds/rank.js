// commands/prefix/rank.js
const { AttachmentBuilder } = require('discord.js');
const LevelService = require('../../services/levelService');
const UI = require('../../utils/ui');

module.exports = {
    name: 'rank',
    aliases: ['level', 'xp'],
    description: 'Check your current leveling rank and progress card.',

    async execute(message, args) {
        try {
            const targetUser = message.mentions.users.first() || message.author;

            if (targetUser.bot) {
                return message.reply({
                    components: [UI.createContainer({
                        description: '<:no:1526496561188831244>Bots do not earn XP or have rank cards.'
                    })]
                });
            }

            // Fetch member to get presence/status
            const member = await message.guild.members.fetch({
                user: targetUser.id,
                force: false
            }).catch(() => null);

            const presenceStatus = member?.presence?.status ?? 'offline';
            const avatarURL = targetUser.displayAvatarURL({ forceStatic: true, extension: 'png', size: 256 });
            const guildIconURL = message.guild.iconURL({ extension: 'png', size: 128 });

            const cardBuffer = await LevelService.getRankCard(
                targetUser.id,
                message.guild.id,
                targetUser.username,
                avatarURL,
                presenceStatus,
                guildIconURL
            );

            const attachment = new AttachmentBuilder(cardBuffer, { name: 'rank.png' });
            await message.reply({ files: [attachment] });

        } catch (error) {
            console.error('Error executing rank command:', error);
            await message.reply({
                components: [UI.createContainer({
                    description: '<:no:1526496561188831244>An error occurred while generating the rank card.',
                    color: 0xff0000
                })]
            });
        }
    }
};