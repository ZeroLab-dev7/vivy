const { MessageFlags } = require('discord.js');
const UI = require('../../utils/ui');

const COOLDOWN_TIME = 5000; // 5 seconds cooldown
const cooldowns = new Map();

module.exports = {
    name: 'boosters',
    description: 'A list of current boosters in the server.',
    async execute(message) {
        // Check if the user is on cooldown
        if (cooldowns.has(message.author.id)) {
            return message.react('⏳'); // React with a cooldown emoji
        }

        // Set cooldown for the user
        cooldowns.set(message.author.id, Date.now() + COOLDOWN_TIME);
        setTimeout(() => cooldowns.delete(message.author.id), COOLDOWN_TIME);

        try {
            // Fetch all members and filter only boosters (premium users)
            const members = await message.guild.members.fetch();
            const boosters = members.filter(member => member.premiumSince);

            if (boosters.size === 0) {
                return message.reply({
                    components: [
                        UI.createContainer({
                            description: '- There are currently no boosters in the server.'
                        })
                    ],
                    flags: MessageFlags.IsComponentsV2
                });
            }

            // Create a list of booster mentions (tagging them directly)
            const boosterList = boosters.map((member) => `<@${member.user.id}>`).join('\n');

            const container = UI.createContainer({
                title: 'Current Boosters',
                description: `**__Here are the current boosters in the server:__**\n${boosterList}`
            });

            message.reply({
                components: [container],
                flags: MessageFlags.IsComponentsV2
            });

        } catch (error) {
            console.error('Error fetching boosters:', error);
            message.reply({
                components: [
                    UI.createContainer({
                        description: '- An error occurred while fetching the boosters.'
                    })
                ],
                flags: MessageFlags.IsComponentsV2
            });
        }
    }
};
