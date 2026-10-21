const { PermissionsBitField, MessageFlags } = require('discord.js');
const { AutoRoleSetup } = require('../../db/models');
const UI = require('../../utils/ui');

const COOLDOWN_TIME = 5000;
const cooldowns = new Map();

module.exports = {
    name: 'autorole',
    description: 'Setup, remove, or view the auto-role assigned to new members.',
    /**
     * Usage:
     *   autorole set @role   — Set the auto-role for new members
     *   autorole remove      — Remove the current auto-role setting
     *   autorole view        — Show the currently set auto-role
     */
    async execute(message, args) {
        // ── Cooldown ────────────────────────────────────────────────────────────
        if (cooldowns.has(message.author.id)) {
            return message.react('⏳');
        }
        cooldowns.set(message.author.id, Date.now() + COOLDOWN_TIME);
        setTimeout(() => cooldowns.delete(message.author.id), COOLDOWN_TIME);

        // ── Permission: ManageGuild ──────────────────────────────────────────────
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
            const container = UI.createContainer({
                description: '- You need the `Manage Server` permission to use this command.'
            });
            return message.reply({
                components: [container],
                flags: MessageFlags.IsComponentsV2
            });
        }

        // ── Bot Permission: ManageRoles ──────────────────────────────────────────
        if (!message.guild.members.me.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
            const container = UI.createContainer({
                description: '- I need the `Manage Roles` permission to assign roles to new members.'
            });
            return message.reply({
                components: [container],
                flags: MessageFlags.IsComponentsV2
            });
        }

        const subCommand = args[0]?.toLowerCase();

        // ── Sub-command router ───────────────────────────────────────────────────
        switch (subCommand) {
            case 'set':
                return handleSet(message);
            case 'remove':
            case 'disable':
                return handleRemove(message);
            case 'view':
            case 'info':
                return handleView(message);
            default:
                return sendHelp(message);
        }
    }
};

// ────────────────────────────────────────────────────────────────────────────────
// SET
// ────────────────────────────────────────────────────────────────────────────────
async function handleSet(message) {
    const role = message.mentions.roles.first();

    if (!role) {
        const container = UI.createContainer({
            description: '- Please mention a valid role. Usage: `autorole set @role`'
        });
        return message.reply({
            components: [container],
            flags: MessageFlags.IsComponentsV2
        });
    }

    // Guard: role must be below bot's highest role
    const botHighestRole = message.guild.members.me.roles.highest;
    if (role.position >= botHighestRole.position) {
        const container = UI.createContainer({
            description: `- I cannot assign the role **${role.name}** because it is above or equal to my highest role in the hierarchy.\n- Move my role above **${role.name}** and try again.`
        });
        return message.reply({
            components: [container],
            flags: MessageFlags.IsComponentsV2
        });
    }

    // Guard: don't allow @everyone
    if (role.id === message.guild.id) {
        const container = UI.createContainer({
            description: '- You cannot set `@everyone` as an auto-role.'
        });
        return message.reply({
            components: [container],
            flags: MessageFlags.IsComponentsV2
        });
    }

    try {
        await AutoRoleSetup.upsert({
            guild_id: message.guild.id,
            auto_role_id: role.id
        });

        const container = UI.createContainer({
            title: '✅ Auto-Role Set',
            description: [
                `- **Role:** ${role} (\`${role.name}\`)`,
                `- **ID:** \`${role.id}\``,
                `- Every new member who joins will automatically receive this role.`
            ].join('\n')
        });

        return message.reply({
            components: [container],
            flags: MessageFlags.IsComponentsV2
        });
    } catch (error) {
        console.error('[AutoRole] Error saving auto-role:', error);
        const container = UI.createContainer({
            description: '- An error occurred while saving the auto-role. Please try again later.'
        });
        return message.reply({
            components: [container],
            flags: MessageFlags.IsComponentsV2
        });
    }
}

// ────────────────────────────────────────────────────────────────────────────────
// REMOVE
// ────────────────────────────────────────────────────────────────────────────────
async function handleRemove(message) {
    try {
        const existing = await AutoRoleSetup.findByPk(message.guild.id);

        if (!existing || !existing.auto_role_id) {
            const container = UI.createContainer({
                description: '- There is no auto-role currently set for this server.'
            });
            return message.reply({
                components: [container],
                flags: MessageFlags.IsComponentsV2
            });
        }

        await existing.update({ auto_role_id: null });

        const container = UI.createContainer({
            title: '🗑️ Auto-Role Removed',
            description: '- The auto-role has been removed. New members will no longer receive a role automatically.'
        });

        return message.reply({
            components: [container],
            flags: MessageFlags.IsComponentsV2
        });
    } catch (error) {
        console.error('[AutoRole] Error removing auto-role:', error);
        const container = UI.createContainer({
            description: '- An error occurred while removing the auto-role. Please try again later.'
        });
        return message.reply({
            components: [container],
            flags: MessageFlags.IsComponentsV2
        });
    }
}

// ────────────────────────────────────────────────────────────────────────────────
// VIEW
// ────────────────────────────────────────────────────────────────────────────────
async function handleView(message) {
    try {
        const existing = await AutoRoleSetup.findByPk(message.guild.id);

        if (!existing || !existing.auto_role_id) {
            const container = UI.createContainer({
                description: '- No auto-role is currently configured for this server.\n- Use `autorole set @role` to set one.'
            });
            return message.reply({
                components: [container],
                flags: MessageFlags.IsComponentsV2
            });
        }

        const role = message.guild.roles.cache.get(existing.auto_role_id);
        const roleDisplay = role
            ? `${role} (\`${role.name}\`) — \`${role.id}\``
            : `⚠️ Role not found (ID: \`${existing.auto_role_id}\`) — it may have been deleted.`;

        const container = UI.createContainer({
            title: '🔰 Auto-Role Configuration',
            description: [
                `- **Auto-Role:** ${roleDisplay}`,
                `- **Status:** ${role ? '✅ Active' : '<:no:1526496561188831244>Role Missing'}`
            ].join('\n')
        });

        return message.reply({
            components: [container],
            flags: MessageFlags.IsComponentsV2
        });
    } catch (error) {
        console.error('[AutoRole] Error fetching auto-role:', error);
        const container = UI.createContainer({
            description: '- An error occurred while fetching the auto-role. Please try again later.'
        });
        return message.reply({
            components: [container],
            flags: MessageFlags.IsComponentsV2
        });
    }
}

// ────────────────────────────────────────────────────────────────────────────────
// HELP
// ────────────────────────────────────────────────────────────────────────────────
function sendHelp(message) {
    const container = UI.createContainer({
        title: '🔰 Auto-Role — Help',
        description: [
            '- `autorole set @role` — Set a role to give to every new member',
            '- `autorole remove` — Disable auto-role assignment',
            '- `autorole view` — View the current auto-role configuration'
        ].join('\n')
    });

    return message.reply({
        components: [container],
        flags: MessageFlags.IsComponentsV2
    });
}
