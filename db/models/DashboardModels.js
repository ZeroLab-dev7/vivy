const { DataTypes } = require('sequelize');
const { sequelize } = require('../connection');

// 1. Welcome & Leave Settings
const WelcomeSettings = sequelize.define('WelcomeSettings', {
    guild_id: { type: DataTypes.STRING, primaryKey: true, allowNull: false },
    welcome_enabled: { type: DataTypes.BOOLEAN, defaultValue: false },
    welcome_channel: { type: DataTypes.STRING, allowNull: true },
    welcome_message: { type: DataTypes.TEXT, defaultValue: 'Welcome {user} to {server}!' },
    welcome_embed_json: { type: DataTypes.TEXT, allowNull: true }, // JSON String of Embed
    welcome_bg_image: { type: DataTypes.STRING, allowNull: true },
    welcome_dm_enabled: { type: DataTypes.BOOLEAN, defaultValue: false },
    welcome_dm_message: { type: DataTypes.TEXT, defaultValue: 'Welcome {user} to {server}!' },
    
    leave_enabled: { type: DataTypes.BOOLEAN, defaultValue: false },
    leave_channel: { type: DataTypes.STRING, allowNull: true },
    leave_message: { type: DataTypes.TEXT, defaultValue: '{user} has left {server}.' },
    leave_embed_json: { type: DataTypes.TEXT, allowNull: true },
    leave_bg_image: { type: DataTypes.STRING, allowNull: true }
}, { tableName: 'welcome_settings' });

// 2. Auto Moderation Settings
const AutoModSettings = sequelize.define('AutoModSettings', {
    guild_id: { type: DataTypes.STRING, primaryKey: true, allowNull: false },
    spam_enabled: { type: DataTypes.BOOLEAN, defaultValue: false },
    spam_limit: { type: DataTypes.INTEGER, defaultValue: 5 }, // Messages per 5 seconds
    links_enabled: { type: DataTypes.BOOLEAN, defaultValue: false },
    invites_enabled: { type: DataTypes.BOOLEAN, defaultValue: false },
    bad_words_enabled: { type: DataTypes.BOOLEAN, defaultValue: false },
    bad_words_list: { type: DataTypes.TEXT, defaultValue: '' }, // Comma separated words
    mentions_enabled: { type: DataTypes.BOOLEAN, defaultValue: false },
    mentions_limit: { type: DataTypes.INTEGER, defaultValue: 5 },
    caps_enabled: { type: DataTypes.BOOLEAN, defaultValue: false },
    caps_percentage: { type: DataTypes.INTEGER, defaultValue: 70 },
    emoji_spam_enabled: { type: DataTypes.BOOLEAN, defaultValue: false },
    emoji_limit: { type: DataTypes.INTEGER, defaultValue: 8 },
    raid_protection_enabled: { type: DataTypes.BOOLEAN, defaultValue: false },
    punishment: { type: DataTypes.ENUM('warn', 'timeout', 'kick', 'ban'), defaultValue: 'warn' }
}, { tableName: 'automod_settings' });

// 3. Reaction Role Panel
const ReactionRolePanel = sequelize.define('ReactionRolePanel', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    guild_id: { type: DataTypes.STRING, allowNull: false },
    channel_id: { type: DataTypes.STRING, allowNull: false },
    message_id: { type: DataTypes.STRING, allowNull: false },
    panel_title: { type: DataTypes.STRING, defaultValue: 'Reaction Roles' },
    emoji_role_map: { type: DataTypes.TEXT, defaultValue: '{}' } // JSON mapping: { "emoji": "role_id" }
}, { tableName: 'reaction_role_panels' });

// 4. Self Role Category
const SelfRoleCategory = sequelize.define('SelfRoleCategory', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    guild_id: { type: DataTypes.STRING, allowNull: false },
    name: { type: DataTypes.STRING, allowNull: false },
    embed_title: { type: DataTypes.STRING, defaultValue: 'Self Roles' },
    embed_description: { type: DataTypes.TEXT, defaultValue: 'Select roles below' },
    image_url: { type: DataTypes.STRING, allowNull: true },
    max_selections: { type: DataTypes.INTEGER, defaultValue: 1 },
    min_selections: { type: DataTypes.INTEGER, defaultValue: 0 },
    required_roles: { type: DataTypes.TEXT, defaultValue: '[]' }, // JSON array of role IDs
    roles: { type: DataTypes.TEXT, defaultValue: '[]' } // JSON mapping: [{ "label": "Gamer", "emoji": "🎮", "role_id": "..." }]
}, { tableName: 'self_role_categories' });

// 5. Ticket Configuration
const TicketConfig = sequelize.define('TicketConfig', {
    guild_id: { type: DataTypes.STRING, primaryKey: true, allowNull: false },
    is_enabled: { type: DataTypes.BOOLEAN, defaultValue: false },
    staff_roles: { type: DataTypes.TEXT, defaultValue: '[]' }, // JSON array of role IDs
    category_id: { type: DataTypes.STRING, allowNull: true },
    logs_channel_id: { type: DataTypes.STRING, allowNull: true },
    claim_enabled: { type: DataTypes.BOOLEAN, defaultValue: true },
    transcript_enabled: { type: DataTypes.BOOLEAN, defaultValue: true }
}, { tableName: 'ticket_config' });

// 6. Ticket Instance
const TicketInstance = sequelize.define('TicketInstance', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    guild_id: { type: DataTypes.STRING, allowNull: false },
    channel_id: { type: DataTypes.STRING, allowNull: false, unique: true },
    user_id: { type: DataTypes.STRING, allowNull: false },
    status: { type: DataTypes.ENUM('open', 'claimed', 'closed'), defaultValue: 'open' },
    claimed_by: { type: DataTypes.STRING, allowNull: true },
    transcript_url: { type: DataTypes.STRING, allowNull: true }
}, { tableName: 'ticket_instances' });

// 7. Verification Config
const VerificationConfig = sequelize.define('VerificationConfig', {
    guild_id: { type: DataTypes.STRING, primaryKey: true, allowNull: false },
    is_enabled: { type: DataTypes.BOOLEAN, defaultValue: false },
    type: { type: DataTypes.ENUM('button', 'captcha'), defaultValue: 'button' },
    role_id: { type: DataTypes.STRING, allowNull: true },
    min_account_age_days: { type: DataTypes.INTEGER, defaultValue: 0 },
    min_join_age_days: { type: DataTypes.INTEGER, defaultValue: 0 }
}, { tableName: 'verification_config' });

// 8. Giveaway Instance
const GiveawayInstance = sequelize.define('GiveawayInstance', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    guild_id: { type: DataTypes.STRING, allowNull: false },
    channel_id: { type: DataTypes.STRING, allowNull: false },
    message_id: { type: DataTypes.STRING, allowNull: false },
    prize: { type: DataTypes.STRING, allowNull: false },
    winner_count: { type: DataTypes.INTEGER, defaultValue: 1 },
    end_time: { type: DataTypes.DATE, allowNull: false },
    requirements_roles: { type: DataTypes.TEXT, defaultValue: '[]' },
    bonus_entries_roles: { type: DataTypes.TEXT, defaultValue: '[]' }, // JSON mapping
    blacklisted_users: { type: DataTypes.TEXT, defaultValue: '[]' },
    participants: { type: DataTypes.TEXT, defaultValue: '[]' },
    winners: { type: DataTypes.TEXT, defaultValue: '[]' },
    is_ended: { type: DataTypes.BOOLEAN, defaultValue: false }
}, { tableName: 'giveaway_instances' });

// 9. Temporary Voice Settings
const TempVoiceConfig = sequelize.define('TempVoiceConfig', {
    guild_id: { type: DataTypes.STRING, primaryKey: true, allowNull: false },
    is_enabled: { type: DataTypes.BOOLEAN, defaultValue: false },
    hub_channel_id: { type: DataTypes.STRING, allowNull: true }, // Channel that spawns voice
    category_id: { type: DataTypes.STRING, allowNull: true }, // Category where channels spawn
    default_limit: { type: DataTypes.INTEGER, defaultValue: 0 },
    default_bitrate: { type: DataTypes.INTEGER, defaultValue: 64000 }
}, { tableName: 'temp_voice_config' });

// 10. Temporary Voice Channel List
const TempVoiceChannel = sequelize.define('TempVoiceChannel', {
    channel_id: { type: DataTypes.STRING, primaryKey: true, allowNull: false },
    guild_id: { type: DataTypes.STRING, allowNull: false },
    creator_id: { type: DataTypes.STRING, allowNull: false }
}, { tableName: 'temp_voice_channels' });

// 11. Music Config
const MusicConfig = sequelize.define('MusicConfig', {
    guild_id: { type: DataTypes.STRING, primaryKey: true, allowNull: false },
    dj_role_id: { type: DataTypes.STRING, allowNull: true },
    default_volume: { type: DataTypes.INTEGER, defaultValue: 50 },
    stay_24_7: { type: DataTypes.BOOLEAN, defaultValue: false },
    autoplay: { type: DataTypes.BOOLEAN, defaultValue: false }
}, { tableName: 'music_config' });

// 12. AI Config
const AiConfig = sequelize.define('AiConfig', {
    guild_id: { type: DataTypes.STRING, primaryKey: true, allowNull: false },
    api_key: { type: DataTypes.STRING, allowNull: true },
    chat_channel_id: { type: DataTypes.STRING, allowNull: true },
    auto_reply_rules: { type: DataTypes.TEXT, defaultValue: '[]' }, // JSON rules [{ trigger: 'hello', reply: 'hi' }]
    smart_moderation: { type: DataTypes.BOOLEAN, defaultValue: false },
    summaries_channel_id: { type: DataTypes.STRING, allowNull: true }
}, { tableName: 'ai_config' });

// 13. Leveling Config
const LevelConfig = sequelize.define('LevelConfig', {
    guild_id: { type: DataTypes.STRING, primaryKey: true, allowNull: false },
    is_enabled: { type: DataTypes.BOOLEAN, defaultValue: true },
    xp_cooldown_sec: { type: DataTypes.INTEGER, defaultValue: 60 },
    xp_range_min: { type: DataTypes.INTEGER, defaultValue: 15 },
    xp_range_max: { type: DataTypes.INTEGER, defaultValue: 25 },
    reward_roles: { type: DataTypes.TEXT, defaultValue: '[]' }, // JSON [{ level: 5, role_id: "..." }]
    rank_card_background: { type: DataTypes.STRING, allowNull: true },
    rank_card_font: { type: DataTypes.STRING, defaultValue: 'Outfit' },
    
    // Custom formulas
    xp_formula_base: { type: DataTypes.INTEGER, defaultValue: 100 },
    xp_formula_exponent: { type: DataTypes.FLOAT, defaultValue: 1.8 },
    xp_formula_offset: { type: DataTypes.INTEGER, defaultValue: 100 },
    
    // Voice XP Configuration
    voice_xp_interval_min: { type: DataTypes.INTEGER, defaultValue: 5 },
    voice_xp_amount: { type: DataTypes.INTEGER, defaultValue: 10 },
    
    // Limits
    daily_xp_limit: { type: DataTypes.INTEGER, defaultValue: 0 },
    weekly_xp_limit: { type: DataTypes.INTEGER, defaultValue: 0 },
    
    // Announcements
    announce_enabled: { type: DataTypes.BOOLEAN, defaultValue: true },
    announce_channel: { type: DataTypes.STRING, allowNull: true },
    announce_message: { type: DataTypes.TEXT, defaultValue: '🎉 Congratulations {user}! You reached Level {level}!' },
    announce_embed: { type: DataTypes.BOOLEAN, defaultValue: true },
    announce_color: { type: DataTypes.STRING, defaultValue: '#5865F2' },
    announce_image_url: { type: DataTypes.STRING, allowNull: true },
    
    // Rewards behaviour
    stack_rewards: { type: DataTypes.BOOLEAN, defaultValue: true },
    remove_rewards_on_demote: { type: DataTypes.BOOLEAN, defaultValue: true }
}, { tableName: 'level_config' });

// 14. User XP Records
const UserXP = sequelize.define('UserXP', {
    guild_id: { type: DataTypes.STRING, primaryKey: true, allowNull: false },
    user_id: { type: DataTypes.STRING, primaryKey: true, allowNull: false },
    xp: { type: DataTypes.INTEGER, defaultValue: 0 },
    level: { type: DataTypes.INTEGER, defaultValue: 0 },
    text_xp: { type: DataTypes.INTEGER, defaultValue: 0 },
    text_level: { type: DataTypes.INTEGER, defaultValue: 0 },
    voice_xp: { type: DataTypes.INTEGER, defaultValue: 0 },
    voice_level: { type: DataTypes.INTEGER, defaultValue: 0 },
    last_xp_time: { type: DataTypes.DATE, allowNull: true },
    
    // Extended counters
    messages_count: { type: DataTypes.INTEGER, defaultValue: 0 },
    voice_time_min: { type: DataTypes.INTEGER, defaultValue: 0 },
    
    // Cooldown tracking limits
    xp_today: { type: DataTypes.INTEGER, defaultValue: 0 },
    xp_week: { type: DataTypes.INTEGER, defaultValue: 0 },
    xp_month: { type: DataTypes.INTEGER, defaultValue: 0 },
    last_reset_day: { type: DataTypes.DATE, allowNull: true },
    last_reset_week: { type: DataTypes.DATE, allowNull: true },
    last_reset_month: { type: DataTypes.DATE, allowNull: true }
}, {
    tableName: 'user_xp',
    indexes: [
        { unique: true, fields: ['guild_id', 'user_id'] }
    ]
});

// 15. Economy Config (Extending existing Economy fields)
const EconomyConfig = sequelize.define('EconomyConfig', {
    guild_id: { type: DataTypes.STRING, primaryKey: true, allowNull: false },
    daily_reward: { type: DataTypes.INTEGER, defaultValue: 100 },
    weekly_reward: { type: DataTypes.INTEGER, defaultValue: 700 },
    work_cooldown_sec: { type: DataTypes.INTEGER, defaultValue: 3600 },
    rob_cooldown_sec: { type: DataTypes.INTEGER, defaultValue: 7200 },
    shop_items: { type: DataTypes.TEXT, defaultValue: '[]' } // JSON [{ id: "...", name: "Gamer Role", price: 1000, description: "Unlocks role", role_id: "..." }]
}, { tableName: 'economy_config' });

// 16. User Inventory
const UserInventory = sequelize.define('UserInventory', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    guild_id: { type: DataTypes.STRING, allowNull: false },
    user_id: { type: DataTypes.STRING, allowNull: false },
    item_id: { type: DataTypes.STRING, allowNull: false },
    quantity: { type: DataTypes.INTEGER, defaultValue: 1 }
}, {
    tableName: 'user_inventories',
    indexes: [
        { unique: true, fields: ['guild_id', 'user_id', 'item_id'] }
    ]
});

// 17. Starboard Settings
const StarboardConfig = sequelize.define('StarboardConfig', {
    guild_id: { type: DataTypes.STRING, primaryKey: true, allowNull: false },
    is_enabled: { type: DataTypes.BOOLEAN, defaultValue: false },
    starboard_channel_id: { type: DataTypes.STRING, allowNull: true },
    min_stars: { type: DataTypes.INTEGER, defaultValue: 3 },
    emoji: { type: DataTypes.STRING, defaultValue: '⭐' }
}, { tableName: 'starboard_config' });

// 18. Starboard Messages Track
const StarboardMessage = sequelize.define('StarboardMessage', {
    message_id: { type: DataTypes.STRING, primaryKey: true, allowNull: false },
    guild_id: { type: DataTypes.STRING, allowNull: false },
    starboard_message_id: { type: DataTypes.STRING, allowNull: false },
    star_count: { type: DataTypes.INTEGER, defaultValue: 0 }
}, { tableName: 'starboard_messages' });

// 19. Backups
const BackupInstance = sequelize.define('BackupInstance', {
    id: { type: DataTypes.STRING, primaryKey: true, allowNull: false }, // Unique backup ID
    guild_id: { type: DataTypes.STRING, allowNull: false },
    creator_id: { type: DataTypes.STRING, allowNull: false },
    backup_data: { type: DataTypes.TEXT, allowNull: false }, // Compressed JSON data
    timestamp: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, { tableName: 'backup_instances' });

// 20. Custom Commands
const CustomCommand = sequelize.define('CustomCommand', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    guild_id: { type: DataTypes.STRING, allowNull: false },
    name: { type: DataTypes.STRING, allowNull: false },
    type: { type: DataTypes.ENUM('prefix', 'slash'), defaultValue: 'prefix' },
    reply_template: { type: DataTypes.TEXT, allowNull: true },
    embeds_json: { type: DataTypes.TEXT, allowNull: true }, // JSON array of embeds
    buttons_json: { type: DataTypes.TEXT, defaultValue: '[]' }, // JSON array of buttons
    conditions: { type: DataTypes.TEXT, defaultValue: '[]' } // Rules mapping
}, {
    tableName: 'custom_commands',
    indexes: [
        { unique: true, fields: ['guild_id', 'name'] }
    ]
});

// 21. Suggestion Setup
const SuggestionConfig = sequelize.define('SuggestionConfig', {
    guild_id: { type: DataTypes.STRING, primaryKey: true, allowNull: false },
    is_enabled: { type: DataTypes.BOOLEAN, defaultValue: false },
    channel_id: { type: DataTypes.STRING, allowNull: true },
    admin_roles: { type: DataTypes.TEXT, defaultValue: '[]' }
}, { tableName: 'suggestion_config' });

// 22. Suggestions Instances
const SuggestionInstance = sequelize.define('SuggestionInstance', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    guild_id: { type: DataTypes.STRING, allowNull: false },
    message_id: { type: DataTypes.STRING, allowNull: false, unique: true },
    creator_id: { type: DataTypes.STRING, allowNull: false },
    content: { type: DataTypes.TEXT, allowNull: false },
    status: { type: DataTypes.ENUM('pending', 'approved', 'denied'), defaultValue: 'pending' },
    reason: { type: DataTypes.TEXT, allowNull: true }
}, { tableName: 'suggestion_instances' });

// 23. Polls Config
const PollConfig = sequelize.define('PollConfig', {
    guild_id: { type: DataTypes.STRING, primaryKey: true, allowNull: false },
    is_enabled: { type: DataTypes.BOOLEAN, defaultValue: false },
    channel_id: { type: DataTypes.STRING, allowNull: true }
}, { tableName: 'poll_config' });

// 24. Poll Instances
const PollInstance = sequelize.define('PollInstance', {
    message_id: { type: DataTypes.STRING, primaryKey: true, allowNull: false },
    guild_id: { type: DataTypes.STRING, allowNull: false },
    question: { type: DataTypes.STRING, allowNull: false },
    options: { type: DataTypes.TEXT, defaultValue: '[]' }, // JSON options
    votes: { type: DataTypes.TEXT, defaultValue: '{}' }, // JSON mapping
    end_time: { type: DataTypes.DATE, allowNull: true },
    is_ended: { type: DataTypes.BOOLEAN, defaultValue: false }
}, { tableName: 'poll_instances' });

// 25. Birthday Config & User Birthdays
const BirthdayConfig = sequelize.define('BirthdayConfig', {
    guild_id: { type: DataTypes.STRING, primaryKey: true, allowNull: false },
    is_enabled: { type: DataTypes.BOOLEAN, defaultValue: false },
    channel_id: { type: DataTypes.STRING, allowNull: true },
    message_template: { type: DataTypes.TEXT, defaultValue: 'Happy Birthday {user}!' }
}, { tableName: 'birthday_config' });

const UserBirthday = sequelize.define('UserBirthday', {
    guild_id: { type: DataTypes.STRING, primaryKey: true, allowNull: false },
    user_id: { type: DataTypes.STRING, primaryKey: true, allowNull: false },
    birth_date: { type: DataTypes.STRING, allowNull: false } // format MM-DD
}, {
    tableName: 'user_birthdays',
    indexes: [
        { unique: true, fields: ['guild_id', 'user_id'] }
    ]
});

// 26. Sticky Messages
const StickyMessage = sequelize.define('StickyMessage', {
    channel_id: { type: DataTypes.STRING, primaryKey: true, allowNull: false },
    guild_id: { type: DataTypes.STRING, allowNull: false },
    message_template: { type: DataTypes.TEXT, allowNull: true },
    embed_json: { type: DataTypes.TEXT, allowNull: true },
    last_message_id: { type: DataTypes.STRING, allowNull: true }
}, { tableName: 'sticky_messages' });

// 27. Activity Logs
const DashboardAuditLog = sequelize.define('DashboardAuditLog', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    guild_id: { type: DataTypes.STRING, allowNull: false },
    user_id: { type: DataTypes.STRING, allowNull: false },
    action: { type: DataTypes.STRING, allowNull: false },
    old_value: { type: DataTypes.TEXT, allowNull: true },
    new_value: { type: DataTypes.TEXT, allowNull: true }
}, { tableName: 'dashboard_audit_logs' });

// 28. API Keys
const DashboardApiKey = sequelize.define('DashboardApiKey', {
    key: { type: DataTypes.STRING, primaryKey: true, allowNull: false },
    guild_id: { type: DataTypes.STRING, allowNull: false },
    label: { type: DataTypes.STRING, defaultValue: 'Default Key' },
    permissions: { type: DataTypes.TEXT, defaultValue: '["read", "write"]' },
    usage_count: { type: DataTypes.INTEGER, defaultValue: 0 },
    last_used: { type: DataTypes.DATE, allowNull: true }
}, { tableName: 'dashboard_api_keys' });

// 29. Room Settings (consolidated from room-setup.db)
const RoomSettings = sequelize.define('RoomSettings', {
    guild_id: { type: DataTypes.STRING, primaryKey: true, allowNull: false },
    log_channel: { type: DataTypes.STRING, allowNull: false },
    room_category: { type: DataTypes.STRING, allowNull: false },
    join_channel: { type: DataTypes.STRING, allowNull: false },
    staff_role: { type: DataTypes.TEXT, allowNull: true },
    manager_role: { type: DataTypes.STRING, allowNull: true }
}, { tableName: 'room_settings_seq', timestamps: true });

// 30. Role Blacklist (consolidated from blacklist-role.db)
const RoleBlacklist = sequelize.define('RoleBlacklist', {
    guild_id: { type: DataTypes.STRING, primaryKey: true, allowNull: false },
    user_id: { type: DataTypes.STRING, primaryKey: true, allowNull: false },
    role_id: { type: DataTypes.STRING, primaryKey: true, allowNull: false }
}, {
    tableName: 'role_blacklist_seq',
    timestamps: true,
    indexes: [
        { unique: true, fields: ['guild_id', 'user_id', 'role_id'] }
    ]
});
// 31. Developer Audit Log
const DevAuditLog = sequelize.define('DevAuditLog', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    user_id: { type: DataTypes.STRING, allowNull: false },
    username: { type: DataTypes.STRING, allowNull: false },
    action: { type: DataTypes.STRING, allowNull: false },
    ip_address: { type: DataTypes.STRING, allowNull: false }
}, { tableName: 'dev_audit_logs' });

// 32. Bot Error Tracking
const BotError = sequelize.define('BotError', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    message: { type: DataTypes.TEXT, allowNull: false },
    stack: { type: DataTypes.TEXT, allowNull: true },
    guild_id: { type: DataTypes.STRING, allowNull: true },
    count: { type: DataTypes.INTEGER, defaultValue: 1 },
    last_occurred: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, { tableName: 'bot_errors' });

// 33. Command Log Statistics
const CommandLog = sequelize.define('CommandLog', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    command_name: { type: DataTypes.STRING, allowNull: false },
    user_id: { type: DataTypes.STRING, allowNull: false },
    guild_id: { type: DataTypes.STRING, allowNull: true },
    type: { type: DataTypes.ENUM('prefix', 'slash'), defaultValue: 'prefix' },
    timestamp: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, { tableName: 'command_logs' });

// 34. Premium Server Tracking
const PremiumServer = sequelize.define('PremiumServer', {
    guild_id: { type: DataTypes.STRING, primaryKey: true, allowNull: false },
    is_premium: { type: DataTypes.BOOLEAN, defaultValue: false },
    expires_at: { type: DataTypes.DATE, allowNull: true },
    granted_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    granted_by: { type: DataTypes.STRING, allowNull: true }
}, { tableName: 'premium_servers' });

// 35. Global System Configuration
const SystemConfig = sequelize.define('SystemConfig', {
    key: { type: DataTypes.STRING, primaryKey: true, allowNull: false },
    value: { type: DataTypes.TEXT, allowNull: true }
}, { tableName: 'system_configs' });

// 36. Global Broadcast Announcements
const BroadcastLog = sequelize.define('BroadcastLog', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    title: { type: DataTypes.STRING, allowNull: true },
    content: { type: DataTypes.TEXT, allowNull: false },
    type: { type: DataTypes.ENUM('text', 'embed'), defaultValue: 'text' },
    status: { type: DataTypes.ENUM('sent', 'scheduled', 'failed'), defaultValue: 'sent' },
    scheduled_at: { type: DataTypes.DATE, allowNull: true },
    sent_at: { type: DataTypes.DATE, allowNull: true },
    target_count: { type: DataTypes.INTEGER, defaultValue: 0 },
    success_count: { type: DataTypes.INTEGER, defaultValue: 0 },
    failed_guild_ids: { type: DataTypes.TEXT, allowNull: true },
    duration_ms: { type: DataTypes.INTEGER, defaultValue: 0 }
}, { tableName: 'broadcast_logs' });

// 37. Developer Private Notes
const DevNote = sequelize.define('DevNote', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    title: { type: DataTypes.STRING, allowNull: false },
    content: { type: DataTypes.TEXT, allowNull: false },
    author_id: { type: DataTypes.STRING, allowNull: false },
    author_name: { type: DataTypes.STRING, allowNull: false }
}, { tableName: 'dev_notes', timestamps: true });

// 38. Level Rewards Table
const LevelReward = sequelize.define('LevelReward', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    guild_id: { type: DataTypes.STRING, allowNull: false },
    level: { type: DataTypes.INTEGER, allowNull: false },
    role_id: { type: DataTypes.STRING, allowNull: false },
    is_enabled: { type: DataTypes.BOOLEAN, defaultValue: true }
}, { 
    tableName: 'level_rewards',
    indexes: [{ fields: ['guild_id'] }]
});

// 39. XP Boosts Table
const XPBoost = sequelize.define('XPBoost', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    guild_id: { type: DataTypes.STRING, allowNull: false },
    type: { type: DataTypes.ENUM('role', 'channel', 'event'), allowNull: false },
    target_id: { type: DataTypes.STRING, allowNull: false }, // role ID, channel ID, or boost name
    multiplier: { type: DataTypes.FLOAT, defaultValue: 1.0 },
    start_time: { type: DataTypes.DATE, allowNull: true },
    end_time: { type: DataTypes.DATE, allowNull: true },
    is_enabled: { type: DataTypes.BOOLEAN, defaultValue: true }
}, { 
    tableName: 'xp_boosts',
    indexes: [{ fields: ['guild_id'] }]
});

// 40. Voice Sessions Table
const VoiceSession = sequelize.define('VoiceSession', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    guild_id: { type: DataTypes.STRING, allowNull: false },
    user_id: { type: DataTypes.STRING, allowNull: false },
    channel_id: { type: DataTypes.STRING, allowNull: false },
    joined_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    last_xp_grant: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, { 
    tableName: 'voice_sessions',
    indexes: [{ fields: ['guild_id', 'user_id'] }]
});

// 41. Level History (Analytics Logs)
const LevelHistory = sequelize.define('LevelHistory', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    guild_id: { type: DataTypes.STRING, allowNull: false },
    user_id: { type: DataTypes.STRING, allowNull: false },
    action: { type: DataTypes.STRING, allowNull: false }, // 'message_xp', 'voice_xp', 'admin_add', 'admin_remove', 'admin_set', 'level_up'
    xp_gained: { type: DataTypes.INTEGER, defaultValue: 0 },
    level_before: { type: DataTypes.INTEGER, defaultValue: 0 },
    level_after: { type: DataTypes.INTEGER, defaultValue: 0 },
    details: { type: DataTypes.TEXT, allowNull: true },
    timestamp: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, { 
    tableName: 'level_histories',
    indexes: [{ fields: ['guild_id', 'timestamp'] }]
});

// 42. Level Leaderboard Cache
const LevelLeaderboardCache = sequelize.define('LevelLeaderboardCache', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    guild_id: { type: DataTypes.STRING, allowNull: false },
    user_id: { type: DataTypes.STRING, allowNull: false },
    rank: { type: DataTypes.INTEGER, allowNull: false },
    xp: { type: DataTypes.INTEGER, allowNull: false },
    level: { type: DataTypes.INTEGER, allowNull: false },
    cached_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, { 
    tableName: 'level_leaderboard_caches',
    indexes: [{ fields: ['guild_id'] }]
});

module.exports = {
    WelcomeSettings,
    AutoModSettings,
    ReactionRolePanel,
    SelfRoleCategory,
    TicketConfig,
    TicketInstance,
    VerificationConfig,
    GiveawayInstance,
    TempVoiceConfig,
    TempVoiceChannel,
    MusicConfig,
    AiConfig,
    LevelConfig,
    UserXP,
    EconomyConfig,
    UserInventory,
    StarboardConfig,
    StarboardMessage,
    BackupInstance,
    CustomCommand,
    SuggestionConfig,
    SuggestionInstance,
    PollConfig,
    PollInstance,
    BirthdayConfig,
    UserBirthday,
    StickyMessage,
    DashboardAuditLog,
    DashboardApiKey,
    RoomSettings,
    RoleBlacklist,
    DevAuditLog,
    BotError,
    CommandLog,
    PremiumServer,
    SystemConfig,
    BroadcastLog,
    DevNote,
    LevelReward,
    XPBoost,
    VoiceSession,
    LevelHistory,
    LevelLeaderboardCache
};
