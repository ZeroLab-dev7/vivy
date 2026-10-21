const { SlashCommandBuilder } = require('discord.js');
const EconomyService = require('../../services/economyService');
const UIManager = require('../../managers/uiManager');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('pay')
        .setDescription('Transfer money to another user')
        .addUserOption(option => option.setName('user').setDescription('Recipient user').setRequired(true))
        .addIntegerOption(option => option.setName('amount').setDescription('Amount of money to send').setRequired(true)),

    async execute(interaction) {
        await interaction.deferReply();
        const target = interaction.options.getUser('user');
        const amount = interaction.options.getInteger('amount');

        try {
            const res = await EconomyService.transfer(interaction.user.id, target.id, interaction.guild.id, amount);
            const container = UIManager.createContainer({
                title: '<:vivycoin:1533128699350749425> Transfer Executed',
                accentColor: UIManager.ACCENTS.EMERALD
            });
            const sec = UIManager.createSection({
                title: 'Payment Details',
                content: `Sent: \`${Number(amount).toLocaleString()}\` <:vivycoin:1533128699350749425> to <@${target.id}>\nNew Balance: \`${Number(res.senderNewBal).toLocaleString()}\` <:vivycoin:1533128699350749425>`,
                buttonLabel: 'Success',
                buttonId: 'pay_success_btn'
            });
            container.addSectionComponents(sec);
            return interaction.editReply(UIManager.toResponse(container));
        } catch (err) {
            const errContainer = UIManager.createContainer({
                title: '❌ Transfer Failed',
                accentColor: UIManager.ACCENTS.ROSE
            });
            const sec = UIManager.createSection({
                title: 'Error',
                content: err.message,
                buttonLabel: 'Failed',
                buttonId: 'pay_err_btn'
            });
            errContainer.addSectionComponents(sec);
            return interaction.editReply(UIManager.toResponse(errContainer));
        }
    }
};
