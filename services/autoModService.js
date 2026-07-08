const { AutoModSettings, Warning, GuildSettings, AntiLink } = require('../db/models');
const { PermissionFlagsBits } = require('discord.js');

class AutoModService {
    static async getOrCreateConfig(guildId) {
        let config = await AutoModSettings.findByPk(guildId);
        if (!config) {
            config = await AutoModSettings.create({ guild_id: guildId });
        }
        return config;
    }

    static async syncToDiscord(client, guildId, config = null) {
        try {
            const guild = client.guilds.cache.get(guildId);
            if (!guild) return { success: false, error: 'Guild not found in client cache' };

            // Fetch the bot member and verify ManageGuild permission
            const me = guild.members.me || await guild.members.fetch(client.user.id).catch(() => null);
            if (!me) {
                console.error(`[AutoModSync] Could not find bot member in guild ${guildId}`);
                return { success: false, error: 'Could not find bot member' };
            }
            if (!me.permissions.has(PermissionFlagsBits.ManageGuild)) {
                console.warn(`[AutoModSync] Missing ManageGuild permission in guild ${guildId}`);
                return { success: false, error: 'Missing Manage Guild permission' };
            }

            // Always retrieve the latest configuration from the database to avoid incomplete parameters
            config = await this.getOrCreateConfig(guildId);

            // Fetch AntiLink settings
            let antiLinkSettings = await AntiLink.findOne({ where: { guild_id: guildId } });
            if (!antiLinkSettings) {
                antiLinkSettings = await AntiLink.create({ guild_id: guildId });
            }

            // Fetch owner role from GuildSettings
            const guildSettings = await GuildSettings.findOne({ where: { guild_id: guildId } });

            // Collect whitelists
            const exemptRoles = new Set();
            const exemptChannels = new Set();

            // 1. AntiLink whitelist roles/channels
            try {
                if (antiLinkSettings.whitelist_roles) {
                    const roles = JSON.parse(antiLinkSettings.whitelist_roles);
                    if (Array.isArray(roles)) {
                        roles.forEach(id => {
                            if (id) exemptRoles.add(id);
                        });
                    }
                }
            } catch (e) {
                console.error('[AutoModSync] Error parsing antiLinkSettings.whitelist_roles:', e);
            }

            try {
                if (antiLinkSettings.whitelist_channels) {
                    const channels = JSON.parse(antiLinkSettings.whitelist_channels);
                    if (Array.isArray(channels)) {
                        channels.forEach(id => {
                            if (id) exemptChannels.add(id);
                        });
                    }
                }
            } catch (e) {
                console.error('[AutoModSync] Error parsing antiLinkSettings.whitelist_channels:', e);
            }

            // 2. GuildSettings owner role
            if (guildSettings && guildSettings.owner_role_id) {
                const roles = guildSettings.owner_role_id.split(',').map(r => r.trim()).filter(Boolean);
                roles.forEach(id => exemptRoles.add(id));
            }

            // Convert back to arrays for API
            const exemptRolesArray = Array.from(exemptRoles);
            const exemptChannelsArray = Array.from(exemptChannels);

            // Fetch existing AutoMod rules for this guild
            const existingRules = await guild.autoModerationRules.fetch().catch(() => new Map());

            const botName = client.user?.username || 'Vivy';
            const actionCustomMessage = `This message was prevented by an AutoMod rule created by ${botName}.`;

            // Helper to find, create or update a rule
            const syncRule = async (name, triggerType, triggerMetadata, isEnabled, ruleExemptRoles = [], ruleExemptChannels = []) => {
                const ruleKey = name.toLowerCase();
                const existing = existingRules.find(r => r.name.toLowerCase() === ruleKey);

                if (!isEnabled) {
                    // Delete the rule if it exists and is disabled
                    if (existing) {
                        await existing.delete('Vivy AutoMod Sync: Disabled').catch(() => { });
                    }
                    return;
                }

                // If rule doesn't exist, check trigger type limits (e.g. max 1 rule of trigger type 3/5 per guild)
                if (!existing && (triggerType === 3 || triggerType === 5)) {
                    const otherRule = existingRules.find(r => r.triggerType === triggerType);
                    if (otherRule) {
                        console.warn(`[AutoModSync] Skipping rule "${name}" because another rule of type ${triggerType} ("${otherRule.name}") already exists in guild ${guildId}.`);
                        return;
                    }
                }

                // Prepare rule data
                const ruleData = {
                    name: name,
                    eventType: 1, // MESSAGE_SEND
                    triggerType: triggerType,
                    triggerMetadata: triggerMetadata,
                    actions: [
                        {
                            type: 1, // BlockMessage
                            metadata: {
                                customMessage: actionCustomMessage
                            }
                        }
                    ],
                    exemptRoles: ruleExemptRoles,
                    exemptChannels: ruleExemptChannels,
                    enabled: true
                };

                if (existing) {
                    // Update existing rule
                    await existing.edit(ruleData, 'Vivy AutoMod Sync').catch(e => console.error(`[AutoModSync] Error editing rule ${name}:`, e));
                } else {
                    // Create new rule
                    await guild.autoModerationRules.create(ruleData, 'Vivy AutoMod Sync').catch(e => console.error(`[AutoModSync] Error creating rule ${name}:`, e));
                }
            };

            // 1. Invite Links Rule (Enabled if either automod invites or antilink is enabled)
            const invitesEnabled = !!config.invites_enabled || !!antiLinkSettings.is_enabled;
            await syncRule(
                'Vivy AutoMod: Block Invite Links',
                1, // Keyword
                { keywordFilter: ['*discord.gg/*', '*discord.com/invite/*'] },
                invitesEnabled,
                exemptRolesArray,
                exemptChannelsArray
            );

            // 2. Bad Words Rule
            const words = (config.bad_words_list || '').split(',').map(w => w.trim()).filter(Boolean);
            await syncRule(
                'Vivy AutoMod: Block Bad Words',
                1, // Keyword
                { keywordFilter: words.length > 0 ? words : ['dummykeywordplaceholderxyz'] },
                !!config.bad_words_enabled && words.length > 0,
                Array.from(exemptRoles), // Only owner roles bypass bad words by default
                []
            );

            // 3. Generic Links Rule
            await syncRule(
                'Vivy AutoMod: Block Links',
                1, // Keyword
                { keywordFilter: ['*http:///*', '*https://*'] },
                !!config.links_enabled,
                exemptRolesArray,
                exemptChannelsArray
            );

            // 4. Mention Spam Rule
            await syncRule(
                'Vivy AutoMod: Mention Spam Protection',
                5, // MentionSpam
                { mentionTotalLimit: parseInt(config.mentions_limit) || 5 },
                !!config.mentions_enabled,
                Array.from(exemptRoles),
                []
            );

            // 5. Spam Protection (Message Flood)
            await syncRule(
                'Vivy AutoMod: Spam Protection',
                3, // Spam
                {}, // triggerMetadata is empty for triggerType 3
                !!config.spam_enabled,
                Array.from(exemptRoles),
                []
            );

            return { success: true };
        } catch (err) {
            console.error('[AutoModSync] Error syncing native AutoMod rules:', err);
            return { success: false, error: err.message };
        }
    }
}

module.exports = AutoModService;
