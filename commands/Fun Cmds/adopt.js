const { handleSocial } = require('../../utils/funHelper');

module.exports = {
    name: 'fadopt',
    aliases: ['funadopt', 'fun-adopt', 'roleplayadopt'],
    description: "Adopt another user (Fun roleplay)",
    async execute(message, args) {
        const target = message.mentions.users.first() || (args[0] ? await message.client.users.fetch(args[0]).catch(() => null) : null);
        const target2 = args[1] ? await message.client.users.fetch(args[1]).catch(() => null) : null;
        await handleSocial(message, 'adopt', target, target2);
    }
};
