const { MessageFlags } = require('discord.js');
const UI = require('../../utils/ui');

module.exports = {
    name: 'membercount',
    aliases: ['mcount', 'members'],
    description: 'Get the total number of members in the server',
    async execute(message) {
        const { guild } = message;

        const totalMembers = guild.memberCount;
        const humans = guild.members.cache.filter(member => !member.user.bot).size;
        const bots = guild.members.cache.filter(member => member.user.bot).size;

        const container = UI.createContainer({
            title: 'Command : Member Count',
            description: `Server Members Information for **${guild.name}**`,
            // Thumbnail not supported yet
            fields: [
                { name: "Users", value: `\`${totalMembers}\`` },
                { name: "Humans", value: `\`${humans}\`` },
                { name: "Bots", value: `\`${bots}\`` }
            ]
        });

        return message.reply({
            components: [container],
            flags: MessageFlags.IsComponentsV2
        });
    },
};
