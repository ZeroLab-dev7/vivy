const { SlashCommandBuilder } = require('discord.js');
const GamblingService = require('../../services/gamblingService');
const UIManager = require('../../managers/uiManager');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('gamble')
        .setDescription('High-stakes casino gambling minigames')
        .addSubcommand(sub => sub
            .setName('coinflip')
            .setDescription('Flip a coin against the house')
            .addIntegerOption(opt => opt.setName('bet').setDescription('Bet amount').setRequired(true))
            .addStringOption(opt => opt.setName('side').setDescription('Heads or Tails').setRequired(true).addChoices(
                { name: 'Heads', value: 'heads' },
                { name: 'Tails', value: 'tails' }
            ))
        )
        .addSubcommand(sub => sub
            .setName('slots')
            .setDescription('Spin the casino slot machine')
            .addIntegerOption(opt => opt.setName('bet').setDescription('Bet amount').setRequired(true))
        ),

    async execute(interaction) {
        await interaction.deferReply();
        const subcommand = interaction.options.getSubcommand();
        const bet = interaction.options.getInteger('bet');

        try {
            if (subcommand === 'coinflip') {
                const side = interaction.options.getString('side');
                const res = await GamblingService.coinflip(interaction.user.id, interaction.guild.id, bet, side);

                const container = UIManager.createContainer({
                    title: `<:vivycoin:1533128699350749425> Coinflip ${res.won ? 'VICTORY' : 'DEFEAT'}`,
                    accentColor: res.won ? UIManager.ACCENTS.EMERALD : UIManager.ACCENTS.ROSE
                });

                container.addSectionComponents(UIManager.createSection({
                    title: `Coin Result: ${res.result.toUpperCase()} (You chose ${side.toUpperCase()})`,
                    content: res.won
                        ? `Won: \`+$${res.bet.toLocaleString()}\` 🎉\nWallet: \`$${Number(res.newBalance).toLocaleString()}\``
                        : `Lost: \`-$${res.bet.toLocaleString()}\` 💀\nWallet: \`$${Number(res.newBalance).toLocaleString()}\``,
                    buttonLabel: res.won ? 'Winner' : 'Loser',
                    buttonId: 'cf_res_btn'
                }));
                return interaction.editReply(UIManager.toResponse(container));
            } else if (subcommand === 'slots') {
                const res = await GamblingService.slots(interaction.user.id, interaction.guild.id, bet);

                const container = UIManager.createContainer({
                    title: `🎰 Slots ${res.won ? 'JACKPOT' : 'NO MATCH'}`,
                    accentColor: res.won ? UIManager.ACCENTS.EMERALD : UIManager.ACCENTS.ROSE
                });

                container.addSectionComponents(UIManager.createSection({
                    title: `[ ${res.reels.join(' | ')} ]`,
                    content: res.won
                        ? `Multiplier: \`${res.multiplier}x\` • Payout: \`+$${res.reward.toLocaleString()}\` 🎉`
                        : `Lost: \`-$${bet.toLocaleString()}\` 💸`,
                    buttonLabel: res.won ? `${res.multiplier}x Payout` : 'No Match',
                    buttonId: 'slots_res_btn'
                }));
                return interaction.editReply(UIManager.toResponse(container));
            }
        } catch (err) {
            const errContainer = UIManager.createContainer({ title: '❌ Gambling Error', accentColor: UIManager.ACCENTS.ROSE });
            errContainer.addSectionComponents(UIManager.createSection({ title: 'Error', content: err.message, buttonLabel: 'Failed', buttonId: 'gamble_err' }));
            return interaction.editReply(UIManager.toResponse(errContainer));
        }
    }
};
