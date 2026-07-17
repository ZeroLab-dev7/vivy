const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');
const { CustomAlias } = require('../../db/models');
const UI = require('../../utils/ui');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('alias')
        .setDescription('Manage custom command aliases')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .addSubcommand(subcommand =>
            subcommand.setName('add')
                .setDescription('Bind a custom trigger to a command')
                .addStringOption(option =>
                    option.setName('command')
                        .setDescription('The command to bind to (e.g. avatar)')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('trigger')
                        .setDescription('The trigger/alias keyword')
                        .setRequired(true))
                .addBooleanOption(option =>
                    option.setName('noprefix')
                        .setDescription('Should this alias trigger without a prefix? (Default: false)')
                        .setRequired(false)))
        .addSubcommand(subcommand =>
            subcommand.setName('remove')
                .setDescription('Remove a custom command alias')
                .addStringOption(option =>
                    option.setName('trigger')
                        .setDescription('The alias trigger keyword to remove')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand.setName('list')
                .setDescription('List all custom aliases in this server')),

    async execute(interaction) {
        try {
            await interaction.deferReply();

            // Permissions check: Administrator or Server Owner
            if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator) && interaction.user.id !== interaction.guild.ownerId) {
                return interaction.editReply({
                    components: [UI.createContainer({
                        description: '<:no:1526496561188831244>Only **Administrators** or the **Server Owner** can use this command.'
                    })],
                    flags: MessageFlags.IsComponentsV2
                });
            }

            const subcommand = interaction.options.getSubcommand();

            if (subcommand === 'add') {
                const commandName = interaction.options.getString('command').trim().toLowerCase();
                const trigger = interaction.options.getString('trigger').trim().toLowerCase();
                const noPrefix = interaction.options.getBoolean('noprefix') ?? false;

                // Verify command exists in client.commands
                let cmd = interaction.client.commands.get(commandName);
                if (!cmd) {
                    const allCommands = Array.from(interaction.client.commands.values());
                    cmd = allCommands.find(c => c.aliases && c.aliases.includes(commandName));
                }

                if (!cmd) {
                    return interaction.editReply({
                        components: [UI.createContainer({
                            description: `<:no:1526496561188831244>Command \`${commandName}\` not found.`
                        })],
                        flags: MessageFlags.IsComponentsV2
                    });
                }

                try {
                    await CustomAlias.create({
                        guild_id: interaction.guild.id,
                        alias: trigger,
                        command_name: cmd.name,
                        is_prefixless: noPrefix
                    });

                    return interaction.editReply({
                        components: [UI.createContainer({
                            title: '✅ Alias Added',
                            description: `Bound **${trigger}** → **${cmd.name}**\nPrefixless: **${noPrefix}**`,
                            color: 0x57F287
                        })],
                        flags: MessageFlags.IsComponentsV2
                    });
                } catch (e) {
                    if (e.name === 'SequelizeUniqueConstraintError') {
                        return interaction.editReply({
                            components: [UI.createContainer({
                                description: `<:no:1526496561188831244>The alias **${trigger}** already exists in this server.`
                            })],
                            flags: MessageFlags.IsComponentsV2
                        });
                    }
                    console.error('[alias slash] Error adding alias:', e);
                    return interaction.editReply({
                        components: [UI.createContainer({
                            description: '<:no:1526496561188831244>Failed to add alias.'
                        })],
                        flags: MessageFlags.IsComponentsV2
                    });
                }
            }

            if (subcommand === 'remove') {
                const trigger = interaction.options.getString('trigger').trim().toLowerCase();

                const deleted = await CustomAlias.destroy({
                    where: { guild_id: interaction.guild.id, alias: trigger }
                });

                if (deleted) {
                    return interaction.editReply({
                        components: [UI.createContainer({
                            description: `✅ Alias \`${trigger}\` deleted.`,
                            color: 0x57F287
                        })],
                        flags: MessageFlags.IsComponentsV2
                    });
                } else {
                    return interaction.editReply({
                        components: [UI.createContainer({
                            description: `<:no:1526496561188831244>Alias \`${trigger}\` not found.`
                        })],
                        flags: MessageFlags.IsComponentsV2
                    });
                }
            }

            if (subcommand === 'list') {
                const aliases = await CustomAlias.findAll({ where: { guild_id: interaction.guild.id } });

                if (aliases.length === 0) {
                    return interaction.editReply({
                        components: [UI.createContainer({
                            description: 'ℹ️ No custom aliases set.'
                        })],
                        flags: MessageFlags.IsComponentsV2
                    });
                }

                const list = aliases.map(a => `» \`${a.alias}\` → \`${a.command_name}\` ${a.is_prefixless ? '(No Prefix)' : ''}`).join('\n');

                return interaction.editReply({
                    components: [UI.createContainer({
                        title: 'Custom Aliases',
                        description: list,
                        color: 0x009aff
                    })],
                    flags: MessageFlags.IsComponentsV2
                });
            }

        } catch (error) {
            console.error('Error in slash alias command:', error);
            await interaction.editReply({
                components: [UI.createContainer({
                    description: '<:no:1526496561188831244>Failed to process alias command.',
                    color: 0xff0000
                })],
                flags: MessageFlags.IsComponentsV2
            });
        }
    }
};
