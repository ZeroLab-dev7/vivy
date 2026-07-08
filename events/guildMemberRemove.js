const { Events } = require('discord.js');
const { InviteData } = require('../db/models');
const WelcomeService = require('../services/welcomeService');

module.exports = {
    name: Events.GuildMemberRemove,
    async execute(member) {
        try {
            // Find the invite record for this user in this guild
            const inviteRecord = await InviteData.findOne({
                where: {
                    guild_id: member.guild.id,
                    invited_id: member.id,
                },
            });

            if (inviteRecord) {
                // Mark as left
                await inviteRecord.update({ has_left: true });
                console.log(`Updated invite record for ${member.user.tag}: has_left = true`);
            }

            // Call WelcomeService leave handler
            // Getting 
            await WelcomeService.handleLeave(member);
        } catch (error) {
            console.error('Error updating invite record on member remove:', error);
        }
    },
};
