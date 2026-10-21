const { handleInteraction } = require('../../utils/funHelper');

module.exports = {
    name: 'fkick',
    aliases: ['animekick', 'fun-kick', 'dropkick'],
    description: "Kick someone (Fun roleplay animation)",
    async execute(message, args) {
        const target = message.mentions.users.first() || (args[0] ? await message.client.users.fetch(args[0]).catch(() => null) : null);
        await handleInteraction(message, 'kick', target);
    }
};
