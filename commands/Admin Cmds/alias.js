const CustomAlias = require('../../db/models/CustomAlias');
const UI = require('../../utils/ui');

module.exports = {
    name: 'alias',
    description: 'Manage custom command aliases',
    async execute(message, args) {
        // Allow Administrators and Guild Owner
        if (!message.member.permissions.has('Administrator') && message.author.id !== message.guild.ownerId) {
            return message.reply({
                embeds: [UI.createEmbed({
                    type: 'error',
                    description: 'Only **Administrators** or the **Server Owner** can use this command.'
                })]
            });
        }

        const sub = args[0]?.toLowerCase();

        if (sub === 'add') {
            // Usage: ?alias add <command> <trigger> [noprefix]
            const commandName = args[1];
            const trigger = args[2];
            const noPrefix = args[3] === 'noprefix';

            if (!commandName || !trigger) {
                return message.reply("Usage: `?alias add <command> <alias_trigger> [noprefix]`");
            }

            // Verify command exists
            console.log(`Checking command: ${commandName}`);
            let cmd = message.client.commands.get(commandName);

            if (!cmd) {
                // Safe lookup using Array.from to avoid any Collection.find issues
                const allCommands = Array.from(message.client.commands.values());
                cmd = allCommands.find(c => c.aliases && c.aliases.includes(commandName));
            }

            if (!cmd) {
                return message.reply(`Command \`${commandName}\` not found.`);
            }

            try {
                console.log(`Attempting to create alias: ${trigger} for ${cmd.name}`);
                await CustomAlias.create({
                    guild_id: message.guild.id,
                    alias: trigger.toLowerCase(),
                    command_name: cmd.name,
                    is_prefixless: noPrefix
                });

                message.reply({
                    embeds: [UI.createEmbed({
                        type: 'success',
                        title: 'Alias Added',
                        description: `Bound **${trigger}** → **${cmd.name}**\nPrefixless: **${noPrefix}**`
                    })]
                });

            } catch (e) {
                if (e.name === 'SequelizeUniqueConstraintError') {
                    return message.reply("That alias already exists in this server.");
                }
                console.error(e);
                message.reply("Failed to add alias.");
            }

        } else if (sub === 'remove') {
            const trigger = args[1];
            if (!trigger) return message.reply("Usage: `?alias remove <alias_trigger>`");

            const deleted = await CustomAlias.destroy({
                where: { guild_id: message.guild.id, alias: trigger.toLowerCase() }
            });

            if (deleted) {
                message.reply("Alias deleted.");
            } else {
                message.reply("Alias not found.");
            }

        } else if (sub === 'list') {
            console.log("Listing aliases...");
            const aliases = await CustomAlias.findAll({ where: { guild_id: message.guild.id } });
            console.log(`Found ${aliases.length} aliases.`);

            if (aliases.length === 0) return message.reply("No custom aliases set.");

            const list = aliases.map(a => `\`${a.alias}\` → \`${a.command_name}\` ${a.is_prefixless ? '(No Prefix)' : ''}`).join('\n');

            message.reply({
                embeds: [UI.createEmbed({
                    type: 'info',
                    title: 'Custom Aliases',
                    description: list
                })]
            });

        } else {
            message.reply({
                embeds: [UI.createEmbed({ type: 'info', description: 'Usage: `?alias <add|remove|list>`' })]
            });
        }
    },
};
