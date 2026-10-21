const { SlashCommandBuilder } = require('discord.js');
const GatheringService = require('../../services/gatheringService');
const UIManager = require('../../managers/uiManager');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('gather')
        .setDescription('Gather resources or commit street crimes')
        .addSubcommand(sub => sub.setName('fish').setDescription('Go fishing for sea treasures'))
        .addSubcommand(sub => sub.setName('mine').setDescription('Mine subterranean ores'))
        .addSubcommand(sub => sub.setName('crime').setDescription('Attempt high-stakes street crimes')),

    async execute(interaction) {
        await interaction.deferReply();
        const subcommand = interaction.options.getSubcommand();

        try {
            if (subcommand === 'fish') {
                const res = await GatheringService.fish(interaction.user.id, interaction.guild.id);
                if (!res.success) {
                    const unixTime = Math.floor(res.nextTime.getTime() / 1000);
                    const errContainer = UIManager.createContainer({ title: '⏳ Fishing Cooldown Active', accentColor: UIManager.ACCENTS.AMBER });
                    errContainer.addSectionComponents(UIManager.createSection({ title: 'Waiting for Bites', content: `Fish are sleeping! Try again <t:${unixTime}:R>`, buttonLabel: 'Cooldown', buttonId: 'fish_cd' }));
                    return interaction.editReply(UIManager.toResponse(errContainer));
                }

                const container = UIManager.createContainer({ title: '🎣 Fishing Expedition Complete', accentColor: UIManager.ACCENTS.CYAN });
                container.addSectionComponents(UIManager.createSection({
                    title: `Caught: ${res.catchItem.emoji} ${res.catchItem.name}`,
                    content: `Rarity: **${res.catchItem.rarity}** • Est Value: \`$${res.catchItem.sellPrice}\``,
                    buttonLabel: 'Caught',
                    buttonId: 'fish_catch'
                }));
                return interaction.editReply(UIManager.toResponse(container));
            } else if (subcommand === 'mine') {
                const res = await GatheringService.mine(interaction.user.id, interaction.guild.id);
                if (!res.success) {
                    const unixTime = Math.floor(res.nextTime.getTime() / 1000);
                    const errContainer = UIManager.createContainer({ title: '⏳ Mining Cooldown Active', accentColor: UIManager.ACCENTS.AMBER });
                    errContainer.addSectionComponents(UIManager.createSection({ title: 'Stamina Recharging', content: `Arms are tired! Next swing <t:${unixTime}:R>`, buttonLabel: 'Cooldown', buttonId: 'mine_cd' }));
                    return interaction.editReply(UIManager.toResponse(errContainer));
                }

                const container = UIManager.createContainer({ title: '⛏️ Mine Excavation Complete', accentColor: UIManager.ACCENTS.INDIGO });
                container.addSectionComponents(UIManager.createSection({
                    title: `Extracted: ${res.ore.emoji} ${res.ore.name}`,
                    content: `Rarity: **${res.ore.rarity}** • Market Value: \`$${res.ore.sellPrice}\``,
                    buttonLabel: 'Mined',
                    buttonId: 'mine_ore'
                }));
                return interaction.editReply(UIManager.toResponse(container));
            } else if (subcommand === 'crime') {
                const res = await GatheringService.crime(interaction.user.id, interaction.guild.id);
                if (!res.success) {
                    if (res.nextTime) {
                        const unixTime = Math.floor(res.nextTime.getTime() / 1000);
                        const errContainer = UIManager.createContainer({ title: '⏳ Crime Heat Active', accentColor: UIManager.ACCENTS.AMBER });
                        errContainer.addSectionComponents(UIManager.createSection({ title: 'Hiding from Cops', content: `Police are searching for you! Next crime <t:${unixTime}:R>`, buttonLabel: 'Wanted', buttonId: 'crime_cd' }));
                        return interaction.editReply(UIManager.toResponse(errContainer));
                    }
                    const failContainer = UIManager.createContainer({ title: `🚨 Crime Busted: ${res.crime}`, accentColor: UIManager.ACCENTS.ROSE });
                    failContainer.addSectionComponents(UIManager.createSection({
                        title: 'Arrested by Police',
                        content: `You were caught! Fined: \`-$${res.fine.toLocaleString()}\``,
                        buttonLabel: 'Fined',
                        buttonId: 'crime_fine'
                    }));
                    return interaction.editReply(UIManager.toResponse(failContainer));
                }

                const container = UIManager.createContainer({ title: `🕵️ Crime Heist Successful: ${res.crime}`, accentColor: UIManager.ACCENTS.EMERALD });
                container.addSectionComponents(UIManager.createSection({
                    title: 'Loot Secured',
                    content: `Reward: \`+$${res.reward.toLocaleString()}\``,
                    buttonLabel: 'Escaped',
                    buttonId: 'crime_loot'
                }));
                return interaction.editReply(UIManager.toResponse(container));
            }
        } catch (err) {
            const errContainer = UIManager.createContainer({ title: '❌ Error', accentColor: UIManager.ACCENTS.ROSE });
            errContainer.addSectionComponents(UIManager.createSection({ title: 'Failed', content: err.message, buttonLabel: 'Error', buttonId: 'gath_err' }));
            return interaction.editReply(UIManager.toResponse(errContainer));
        }
    }
};
