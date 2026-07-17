const { PremiumServer } = require('../db/models');
const { Op } = require('sequelize');
const {
    ContainerBuilder,
    SectionBuilder,
    ButtonBuilder,
    ButtonStyle,
    TextDisplayBuilder,
    SeparatorBuilder,
    MessageFlags
} = require('discord.js');

/**
 * Check if a guild has active (non-expired) premium.
 * Auto-revokes expired records in the DB.
 * @param {string} guildId
 * @returns {Promise<boolean>}
 */
async function isPremiumGuild(guildId) {
    try {
        const record = await PremiumServer.findOne({
            where: { guild_id: guildId, is_premium: true }
        });

        if (!record) return false;

        // If there's an expiry date and it's in the past, auto-revoke
        if (record.expires_at && new Date(record.expires_at) < new Date()) {
            await record.update({ is_premium: false });
            console.log(`[Premium] Auto-revoked expired premium for guild ${guildId}`);
            return false;
        }

        return true;
    } catch (err) {
        console.error('[Premium] Error checking premium status:', err);
        return false;
    }
}

/**
 * Revoke all expired premium records in the DB.
 * Should be called on a periodic schedule.
 * @returns {Promise<number>} Number of revoked records
 */
async function revokeExpiredPremium() {
    try {
        const [count] = await PremiumServer.update(
            { is_premium: false },
            {
                where: {
                    is_premium: true,
                    expires_at: { [Op.lt]: new Date(), [Op.ne]: null }
                }
            }
        );
        if (count > 0) {
            console.log(`[Premium] Auto-revoked ${count} expired premium guild(s).`);
        }
        return count;
    } catch (err) {
        console.error('[Premium] Error revoking expired premium:', err);
        return 0;
    }
}

/**
 * Send a premium-required message as a reply.
 * @param {object} context - Discord Message or Interaction
 * @param {string} featureName - Human-readable feature name (e.g. "Voice Lock")
 */
async function sendPremiumRequired(context, featureName = 'This feature') {
    const upgradeButton = new ButtonBuilder()
        .setLabel('Upgrade Now')
        .setURL('https://vivy.pro/pricing')
        .setStyle(ButtonStyle.Link)
        .setEmoji('✨');

    const container = new ContainerBuilder()
        .setAccentColor(0x00FFFF)
        // Header section: locked feature name + inline upgrade button
        .addSectionComponents(
            new SectionBuilder()
                .addTextDisplayComponents(td => td.setContent(
                    `### 🔒 ${featureName}\n` +
                    `-# This is a premium feature. Upgrade to unlock! 💎`
                ))
                .setButtonAccessory(upgradeButton)
        )
        .addSeparatorComponents(new SeparatorBuilder())
        // Premium perks teaser
        .addTextDisplayComponents(td => td.setContent(
            `> <a:boost:1366892421635375167> **Unlock the full Voice Suite**\n` +
            `> \`kickall\` · \`muteall\` · \`deafenall\` · \`moveall\` · \`pullall\` · \`lock\` · \`private\``
        ))
        .addSeparatorComponents(new SeparatorBuilder())
        .addTextDisplayComponents(td => td.setContent(
            `-# 💎 **vivy.pro/pricing** · Available for all servers`
        ));

    const opts = {
        components: [container],
        flags: MessageFlags.IsComponentsV2
    };

    if (typeof context.reply === 'function') return context.reply(opts);
    if (typeof context.editReply === 'function') return context.editReply(opts);
}

module.exports = { isPremiumGuild, revokeExpiredPremium, sendPremiumRequired };
