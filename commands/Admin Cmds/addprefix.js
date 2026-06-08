const { PermissionsBitField, MessageFlags } = require('discord.js');
const UI = require('../../utils/ui');
const { setPrefix, getPrefix } = require('../../db/prefix');

const COOLDOWN_TIME = 5000; // 5 seconds cooldown
const cooldowns = new Map();

module.exports = {
    name: 'addprefix',
    aliases: ['setprefix', 'prefix'],
    description: 'Set a custom prefix for the bot in this server.',
    async execute(message, args) {
        if (cooldowns.has(message.author.id)) {
            return message.react('⏳');
        }

        // Set cooldown for the user
        cooldowns.set(message.author.id, Date.now() + COOLDOWN_TIME);
        setTimeout(() => cooldowns.delete(message.author.id), COOLDOWN_TIME);

        // Ensure the user has the required permissions
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator) && !message.member.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
            return message.reply({
                components: [UI.createContainer({
                    description: '- You need "Administrator" or "Manage Server" permission to use this command.'
                })],
                flags: MessageFlags.IsComponentsV2
            });
        }

        // Guide for correct usage
        if (args.length < 1) {
            const currentPrefix = await getPrefix(message.guild.id);
            const guideContainer = UI.createContainer({
                title: 'Command : AddPrefix',
                description: 'Set a custom prefix for the bot in this server.',
                footer: `Requested by ${message.author.tag}`,
                fields: [
                    { name: "Aliases:", value: "addprefix, setprefix, prefix" },
                    { name: "Current Prefix:", value: `\`${currentPrefix}\`` },
                    { name: "Usage:", value: `${currentPrefix}addprefix <new prefix>` },
                    { name: "Example:", value: `- ${currentPrefix}addprefix !\n- ${currentPrefix}addprefix $` }
                ]
            });
            return message.reply({
                components: [guideContainer],
                flags: MessageFlags.IsComponentsV2
            });
        }

        const newPrefix = args[0];

        // Validation
        if (newPrefix.length > 5) {
            return message.reply({
                components: [UI.createContainer({
                    description: '- The prefix cannot be longer than 5 characters.'
                })],
                flags: MessageFlags.IsComponentsV2
            });
        }

        if (newPrefix.includes(' ')) {
            return message.reply({
                components: [UI.createContainer({
                    description: '- The prefix cannot contain spaces.'
                })],
                flags: MessageFlags.IsComponentsV2
            });
        }

        try {
            await setPrefix(message.guild.id, newPrefix);
            const successContainer = UI.createContainer({
                description: `- Successfully updated the bot's prefix to: **${newPrefix}**`,
                fields: [
                    { name: 'New Prefix:', value: `\`${newPrefix}\`` },
                    { name: 'Usage Example:', value: `\`${newPrefix}help\`` }
                ]
            });
            message.channel.send({
                components: [successContainer],
                flags: MessageFlags.IsComponentsV2
            });
        } catch (err) {
            console.error('❌ Error setting prefix:', err.message);
            return message.reply({
                components: [UI.createContainer({ description: '- An error occurred while updating the prefix.' })],
                flags: MessageFlags.IsComponentsV2
            });
        }
    },
};
