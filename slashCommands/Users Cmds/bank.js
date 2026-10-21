const { SlashCommandBuilder } = require('discord.js');
const EconomyService = require('../../services/economyService');
const UIManager = require('../../managers/uiManager');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('bank')
        .setDescription('Manage your bank vault reserves')
        .addSubcommand(sub => sub
            .setName('deposit')
            .setDescription('Deposit cash into your bank vault')
            .addStringOption(opt => opt.setName('amount').setDescription('Amount to deposit or "all"').setRequired(true))
        )
        .addSubcommand(sub => sub
            .setName('withdraw')
            .setDescription('Withdraw cash from your bank vault')
            .addStringOption(opt => opt.setName('amount').setDescription('Amount to withdraw or "all"').setRequired(true))
        ),

    async execute(interaction) {
        await interaction.deferReply();
        const subcommand = interaction.options.getSubcommand();
        const amountStr = interaction.options.getString('amount');

        try {
            if (subcommand === 'deposit') {
                const res = await EconomyService.deposit(interaction.user.id, interaction.guild.id, amountStr);
                const container = UIManager.createContainer({
                    title: '<:5526iconbank:1533131833338761297> Bank Deposit Successful',
                    accentColor: UIManager.ACCENTS.EMERALD
                });
                const sec = UIManager.createSection({
                    title: 'Vault Status',
                    content: `Deposited: \`+${Number(res.deposited).toLocaleString()}\` <:vivycoin:1533128699350749425>\nBank Balance: \`${Number(res.newBank).toLocaleString()}\` <:vivycoin:1533128699350749425>\nRemaining Wallet: \`${Number(res.newWallet).toLocaleString()}\` <:vivycoin:1533128699350749425>`,
                    buttonLabel: 'Deposited',
                    buttonId: 'bank_dep_btn'
                });
                container.addSectionComponents(sec);
                return interaction.editReply(UIManager.toResponse(container));
            } else {
                const res = await EconomyService.withdraw(interaction.user.id, interaction.guild.id, amountStr);
                const container = UIManager.createContainer({
                    title: '<:5526iconbank:1533131833338761297> Bank Withdrawal Successful',
                    accentColor: UIManager.ACCENTS.CYAN
                });
                const sec = UIManager.createSection({
                    title: 'Vault Status',
                    content: `Withdrawn: \`-${Number(res.withdrawn).toLocaleString()}\` <:vivycoin:1533128699350749425>\nBank Balance: \`${Number(res.newBank).toLocaleString()}\` <:vivycoin:1533128699350749425>\nNew Wallet: \`${Number(res.newWallet).toLocaleString()}\` <:vivycoin:1533128699350749425>`,
                    buttonLabel: 'Withdrawn',
                    buttonId: 'bank_with_btn'
                });
                container.addSectionComponents(sec);
                return interaction.editReply(UIManager.toResponse(container));
            }
        } catch (err) {
            const errContainer = UIManager.createContainer({
                title: '❌ Transaction Failed',
                accentColor: UIManager.ACCENTS.ROSE
            });
            const sec = UIManager.createSection({
                title: 'Error',
                content: err.message,
                buttonLabel: 'Failed',
                buttonId: 'bank_err_btn'
            });
            errContainer.addSectionComponents(sec);
            return interaction.editReply(UIManager.toResponse(errContainer));
        }
    }
};
