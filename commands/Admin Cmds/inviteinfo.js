const { MessageFlags } = require('discord.js');
const UI = require('../../utils/ui');

const COOLDOWN_TIME = 5000; // 5 seconds cooldown
const cooldowns = new Map();

module.exports = {
    name: 'inviteinfo',
    aliases: ['iinfo', 'invite-info'],
    description: 'Get information about a specific Discord invite link',
    async execute(message, args) {
        // Check if the user is on cooldown
        if (cooldowns.has(message.author.id)) {
            return message.react('⏳'); // React with a cooldown emoji
        }

        // Set cooldown for the user
        cooldowns.set(message.author.id, Date.now() + COOLDOWN_TIME);
        setTimeout(() => cooldowns.delete(message.author.id), COOLDOWN_TIME);

        if (args.length < 1) {
            const guideContainer = UI.createContainer({
                title: 'Command : InviteInfo',
                description: 'Retrieve details about a specific Discord invite link.',
                footer: `Requested by ${message.author.tag}`,
                fields: [
                    { name: "Aliases:", value: "iinfo, invite-info" },
                    { name: "Usage:", value: "?inviteinfo invite-code / full-link" },
                    { name: "Examples:", value: `- ?inviteinfo hpsy\n- ?inviteinfo https://discord.gg/hpsy` }
                ]
            });
            return message.reply({
                components: [guideContainer],
                flags: MessageFlags.IsComponentsV2
            });
        }

        const inviteCode = args[0].replace('https://discord.gg/', '').replace('discord.gg/', '');

        try {
            const invite = await message.client.fetchInvite(inviteCode);

            const inviteContainer = UI.createContainer({
                title: 'Command : Invite Info',
                description: `Invite Information for **${invite.guild.name}**`,
                footer: `Requested by ${message.author.tag}`,
                fields: [
                    { name: " Server Name", value: `\`${invite.guild.name}\`` },
                    { name: " Server ID", value: `\`${invite.guild.id}\`` },
                    { name: " Invite Channel", value: `\`${invite.channel.name}\`` },
                    { name: " Inviter Creator :", value: invite.inviter ? `\`${invite.inviter.tag} | ${invite.inviter.id}\`` : 'Unknown' },
                    { name: " Created At", value: `<t:${Math.floor(invite.createdTimestamp / 1000)}:F>` },
                    { name: " Expires At", value: invite.expiresTimestamp ? `<t:${Math.floor(invite.expiresTimestamp / 1000)}:F>` : 'Never' }
                ]
            });
            // Thumbnail not supported yet in basic helper

            return message.reply({
                components: [inviteContainer],
                flags: MessageFlags.IsComponentsV2
            });

        } catch (error) {
            const errorContainer = UI.createContainer({
                description: '- Invalid or expired invite link.'
            });
            return message.reply({
                components: [errorContainer],
                flags: MessageFlags.IsComponentsV2
            });
        }
    },
};
