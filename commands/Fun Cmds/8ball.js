const { handleInteraction, handleRating, handleSocial, handleRandom, handleAnimal, handleGame } = require('../../utils/funHelper');

module.exports = {
    name: '8ball',
    description: "Ask magic 8ball a question",
    async execute(message, args) {
        const target = message.mentions.users.first() || (args[0] ? await message.client.users.fetch(args[0]).catch(() => null) : null);
        const target2 = args[1] ? await message.client.users.fetch(args[1]).catch(() => null) : null;
        const query = args.join(' ');
        
        
        
        
        
        await handleRandom(message, '8ball', query);
        
        
    }
};
