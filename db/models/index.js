const { DataTypes } = require('sequelize');
const { sequelize } = require('../connection');

const GuildSettings = sequelize.define('GuildSettings', {
    guild_id: { type: DataTypes.STRING, primaryKey: true },
    prefix: { type: DataTypes.STRING, defaultValue: '&' },
    log_channel: { type: DataTypes.STRING },
    antibot_enabled: { type: DataTypes.BOOLEAN, defaultValue: false },
    auto_role_id: { type: DataTypes.STRING },
    mute_role_id: { type: DataTypes.STRING },
    owner_role_id: { type: DataTypes.STRING }, // Role(s) that bypass/manage security (comma-separated string)
    welcome_channel: { type: DataTypes.STRING },
    transcripts_channel: { type: DataTypes.STRING },
    server_bot_name: { type: DataTypes.STRING },
    server_bot_avatar: { type: DataTypes.STRING },
    server_bot_banner: { type: DataTypes.STRING }
});

const Warning = sequelize.define('Warning', {
    guild_id: { type: DataTypes.STRING },
    user_id: { type: DataTypes.STRING },
    moderator_id: { type: DataTypes.STRING },
    reason: { type: DataTypes.TEXT },
    timestamp: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
});

const Mute = sequelize.define('Mute', {
    guild_id: { type: DataTypes.STRING },
    user_id: { type: DataTypes.STRING },
    role_id: { type: DataTypes.STRING },
    expires_at: { type: DataTypes.DATE }
});

const VerifiedUser = sequelize.define('VerifiedUser', {
    guild_id: { type: DataTypes.STRING, primaryKey: true }, // Part of composite key
    user_id: { type: DataTypes.STRING, primaryKey: true },
    username: { type: DataTypes.STRING },
    verified_at: { type: DataTypes.DATE },
    verificator_id: { type: DataTypes.STRING },
    gender: { type: DataTypes.STRING }
});

const Blacklist = sequelize.define('Blacklist', {
    guild_id: { type: DataTypes.STRING },
    target_id: { type: DataTypes.STRING }, // User or Role ID
    type: { type: DataTypes.ENUM('user', 'role') },
    reason: { type: DataTypes.STRING }
});

// Models in separate files
const ApplySetup = require('./ApplySetup');
const AntiBotSetup = require('./AntiBotSetup');
const AntiLink = require('./AntiLink');
const AntiWebhook = require('./AntiWebhook');
const AutoRoleSetup = require('./AutoRoleSetup');
const CustomAlias = require('./CustomAlias');
const Economy = require('./Economy');
const JailSetup = require('./JailSetup');
const JailedUser = require('./JailedUser');
const VerificationBlacklist = require('./VerificationBlacklist');
const VerificationRoles = require('./VerificationRoles');
const VerifiedUsers = require('./VerifiedUsers');
const WarnSetup = require('./WarnSetup');
const LogSettings = require('./LogSettings');
const MuteSetup = require('./MuteSetup');
const PremiumSetup = require('./PremiumSetup');
const PremiumPlan = require('./PremiumPlan');
const InviteData = require('./InviteData');
const InviteBonus = require('./InviteBonus');
const SupportTicket = require('./SupportTicket');
const LifeBan = require('./LifeBan');
const PubSetup = require('./PubSetup');
const DashboardModels = require('./DashboardModels');

module.exports = {
    GuildSettings,
    Warning,
    Mute,
    VerifiedUser,
    Blacklist,
    LogSettings,
    ApplySetup,
    AntiBotSetup,
    AntiLink,
    AntiWebhook,
    AutoRoleSetup,
    CustomAlias,
    Economy,
    JailSetup,
    JailedUser,
    VerificationBlacklist,
    VerificationRoles,
    VerifiedUsers,
    WarnSetup,
    MuteSetup,
    PremiumSetup,
    PremiumPlan,
    InviteData,
    InviteBonus,
    SupportTicket,
    LifeBan,
    PubSetup,
    ...DashboardModels
};
