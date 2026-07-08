const { CustomCommand } = require('../db/models');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

class CustomCommandService {
    static async getCommands(guildId) {
        return await CustomCommand.findAll({ where: { guild_id: guildId } });
    }

    static replacePlaceholders(template, author, guild, channel) {
        if (!template) return '';
        const memberCount = guild ? guild.memberCount : 0;
        return template
            .replace(/{user}/g, `<@${author.id}>`)
            .replace(/{username}/g, author.username)
            .replace(/{guild}/g, guild ? guild.name : '')
            .replace(/{channel}/g, `<#${channel.id}>`)
            .replace(/{memberCount}/g, String(memberCount));
    }

    static async executeCommand(command, message) {
        // Evaluate conditions if any
        let conditions = [];
        try {
            conditions = JSON.parse(command.conditions || '[]');
        } catch (e) { }

        // Evaluate conditions (e.g., checks if user has a specific role)
        const member = message.member;
        for (const cond of conditions) {
            if (cond.type === 'has_role' && !member.roles.cache.has(cond.role_id)) {
                return message.reply(`❌ You do not have the required role to use this command.`).catch(() => {});
            }
        }

        const replyOptions = {};

        // Parse Text template
        if (command.reply_template) {
            replyOptions.content = this.replacePlaceholders(command.reply_template, message.author, message.guild, message.channel);
        }

        // Parse Embeds
        if (command.embeds_json) {
            try {
                const embedsData = JSON.parse(command.embeds_json);
                replyOptions.embeds = embedsData.map(data => {
                    const embed = new EmbedBuilder().setTimestamp();
                    if (data.title) embed.setTitle(this.replacePlaceholders(data.title, message.author, message.guild, message.channel));
                    if (data.description) embed.setDescription(this.replacePlaceholders(data.description, message.author, message.guild, message.channel));
                    if (data.color) embed.setColor(data.color);
                    return embed;
                });
            } catch (e) { }
        }

        // Parse Buttons
        if (command.buttons_json) {
            try {
                const buttonsData = JSON.parse(command.buttons_json);
                if (buttonsData.length > 0) {
                    const row = new ActionRowBuilder();
                    buttonsData.forEach(btn => {
                        const builder = new ButtonBuilder()
                            .setLabel(btn.label)
                            .setStyle(ButtonStyle[btn.style || 'Secondary']);
                        
                        if (btn.url) {
                            builder.setURL(btn.url).setStyle(ButtonStyle.Link);
                        } else {
                            builder.setCustomId(btn.customId || 'cc_btn');
                        }
                        row.addComponents(builder);
                    });
                    replyOptions.components = [row];
                }
            } catch (e) { }
        }

        await message.reply(replyOptions).catch(console.error);
    }

    static async executeInteraction(command, interaction) {
        const replyOptions = {};

        // Parse Text template
        if (command.reply_template) {
            replyOptions.content = this.replacePlaceholders(command.reply_template, interaction.user, interaction.guild, interaction.channel);
        }

        // Parse Embeds
        if (command.embeds_json) {
            try {
                const embedsData = JSON.parse(command.embeds_json);
                replyOptions.embeds = embedsData.map(data => {
                    const embed = new EmbedBuilder().setTimestamp();
                    if (data.title) embed.setTitle(this.replacePlaceholders(data.title, interaction.user, interaction.guild, interaction.channel));
                    if (data.description) embed.setDescription(this.replacePlaceholders(data.description, interaction.user, interaction.guild, interaction.channel));
                    if (data.color) embed.setColor(data.color);
                    return embed;
                });
            } catch (e) { }
        }

        // Parse Buttons
        if (command.buttons_json) {
            try {
                const buttonsData = JSON.parse(command.buttons_json);
                if (buttonsData.length > 0) {
                    const row = new ActionRowBuilder();
                    buttonsData.forEach(btn => {
                        const builder = new ButtonBuilder()
                            .setLabel(btn.label)
                            .setStyle(ButtonStyle[btn.style || 'Secondary']);
                        
                        if (btn.url) {
                            builder.setURL(btn.url).setStyle(ButtonStyle.Link);
                        } else {
                            builder.setCustomId(btn.customId || 'cc_btn');
                        }
                        row.addComponents(builder);
                    });
                    replyOptions.components = [row];
                }
            } catch (e) { }
        }

        await interaction.reply(replyOptions).catch(console.error);
    }

    static async matchAndExecute(message) {
        if (!message.guild || message.author.bot) return false;

        // Retrieve actual guild prefix
        const { GuildSettings } = require('../db/models');
        const settings = await GuildSettings.findOne({ where: { guild_id: message.guild.id } });
        const prefix = settings?.prefix || '?';

        if (!message.content.startsWith(prefix)) return false;

        const parts = message.content.slice(prefix.length).trim().split(/ +/);
        const commandName = parts[0].toLowerCase();

        const command = await CustomCommand.findOne({
            where: { guild_id: message.guild.id, name: commandName, type: 'prefix' }
        });

        if (command) {
            await this.executeCommand(command, message);
            return true;
        }

        return false;
    }

    static async syncGuildSlashCommands(client, guildId) {
        try {
            const { REST, Routes, SlashCommandBuilder } = require('discord.js');
            
            // Get custom slash commands from DB
            const customCommands = await CustomCommand.findAll({
                where: { guild_id: guildId, type: 'slash' }
            });

            const body = customCommands.map(cmd => {
                const builder = new SlashCommandBuilder()
                    .setName(cmd.name.toLowerCase())
                    .setDescription(cmd.reply_template ? cmd.reply_template.substring(0, 100) : 'Custom slash command');
                return builder.toJSON();
            });

            const rest = new REST({ version: '10' }).setToken(process.env.TOKEN || client.token);
            const clientId = client.user?.id || process.env.CLIENT_ID;

            if (!clientId) {
                console.error(`[SlashSync] CLIENT_ID not found for guild ${guildId}`);
                return;
            }

            console.log(`[SlashSync] Syncing ${body.length} custom commands for guild ${guildId}...`);
            await rest.put(
                Routes.applicationGuildCommands(clientId, guildId),
                { body }
            );
            console.log(`[SlashSync] Successfully synced custom slash commands for guild ${guildId}.`);
        } catch (error) {
            console.error(`[SlashSync] Error syncing slash commands for guild ${guildId}:`, error);
        }
    }

    static async syncAllGuildsSlashCommands(client) {
        try {
            console.log('[SlashSync] Starting sync of slash commands...');
            
            const customCommands = await CustomCommand.findAll({
                where: { type: 'slash' }
            });

            const guildsToSync = [...new Set(customCommands.map(cmd => cmd.guild_id))];

            if (guildsToSync.length > 0) {
                console.log(`[SlashSync] Found ${guildsToSync.length} guilds with custom slash commands. Syncing...`);
                for (const guildId of guildsToSync) {
                    await this.syncGuildSlashCommands(client, guildId);
                }
            } else {
                console.log('[SlashSync] No guilds with custom slash commands found.');
            }
            console.log('[SlashSync] Slash commands sync complete.');
        } catch (error) {
            console.error('[SlashSync] Error syncing all guilds slash commands:', error);
        }
    }
}

module.exports = CustomCommandService;
