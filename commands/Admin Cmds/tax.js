const { MessageFlags } = require('discord.js');
const UI = require('../../utils/ui');

module.exports = {
    name: "tax",
    description: "Calculate tax for a given amount",
    async execute(message, args) {
        const taxRate = 0.06; // 6% tax rate

        if (args.length < 1 || isNaN(args[0])) {
            const errorContainer = UI.createContainer({
                description: "- Please provide a valid number!"
            });
            return message.reply({
                components: [errorContainer],
                flags: MessageFlags.IsComponentsV2
            });
        }

        const amount = parseFloat(args[0]);
        const tax = amount * taxRate;
        const total = amount + tax;

        const container = UI.createContainer({
            title: 'Tax Calculation',
            description: `**Amount:** ${amount}\n**Tax (6%):** ${tax.toFixed(2)}\n**Total (with tax):** ${total.toFixed(2)}`,
            footer: "Tax Calculator Bot"
        });

        return message.reply({
            components: [container],
            flags: MessageFlags.IsComponentsV2
        });
    }
};
