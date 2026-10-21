const { handleRandom } = require('../../utils/funHelper');

module.exports = {
    name: 'fcoinflip',
    aliases: ['funcoinflip', 'funcf', 'funflip'],
    description: "Flip a coin (Fun random generator)",
    async execute(message, args) {
        const query = args.join(' ');
        await handleRandom(message, 'coinflip', query);
    }
};
