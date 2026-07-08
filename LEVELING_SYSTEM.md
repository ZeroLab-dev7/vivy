# Vivy Discord Bot - Leveling & Engagement System

An enterprise-grade Leveling, Engagement, and Role Rewards system integrated with the Vivy Dashboard, database schemas, and Discord.js v14 handlers.

---

## 1. Core Leveling Mechanics

### XP Acquisition
- **Message XP**: Gained by sending text messages in channels. Awarded once per configured cooldown period (defaults to 60 seconds) to prevent spamming.
- **Voice XP**: Active voice channel members gain XP periodically (defaults to every 5 minutes). AFK channels, muted (self/server), deafened (self/server), and bot users are ignored.
- **Anti-Spam Controls**: Gaining XP respects a randomized range per message/voice interval and is subject to absolute **Daily XP Limits** and **Weekly XP Limits** per user.

### Level Formula
The system supports customizable mathematical level calculation curves:
$$\text{XP Needed}(L) = \text{base} \times L^{\text{exponent}} + \text{offset}$$

* **Default configuration**: Base = 100, Exponent = 1.8, Offset = 100.
* **Customization**: Base, exponent, and offset are fully customizable per guild in real-time from the dashboard settings tab.

---

## 2. Advanced Role Rewards

Configures automatic Discord role assignment as users progress through levels.

### Features
- **Unlimited Role Rewards**: Map level thresholds to roles (e.g., Level 5 &rarr; `@Active`, Level 10 &rarr; `@Veteran`).
- **Stacking vs. Replacing**:
  - **Stacked**: Users keep all previous level reward roles they have earned.
  - **Replacing**: When a user levels up, the bot grants the new role and automatically removes all lower-level reward roles.
- **Demotion Syncing**: If a user's level is decreased by an administrator or reset, the bot automatically strips any rewards they no longer qualify for (if configured).

---

## 3. XP Multipliers & Timed Boosters

Provides configurable boosts to encourage engagement in specific channels, for VIP roles, or during community events.

### Boost Types
1. **Role Boosts**: Extra multipliers for specific roles (e.g., `@VIP` gets `2.0x` XP, `@Server Booster` gets `1.5x` XP). The highest multiplier is applied if a user possesses multiple role boosts.
2. **Channel Boosts**: Specific text/voice channels award boosted XP rates (e.g., `#chat` awards `2.0x` XP, `#events` awards `3.0x` XP).
3. **Event Boosts**: Server-wide global boosts with set start and end dates (e.g., Double XP Weekend). Multipliers automatically expire based on current timestamp comparison.

*Multiple boosts are applied cumulatively (e.g., `base XP * role boost * channel boost * event boost`).*

---

## 4. Chat & Slash Commands

### Member Commands
- `/rank` (or prefix `&rank`, `&level`, `&xp`): Generates a custom PNG rank card showing avatar, username, current server rank, level, and a neon-gradient progress bar.
- `/leaderboard` (or prefix `&leaderboard`, `&lb`): Shows the top active members on the server.
  - **Filters**: Total XP, Message Count, Voice Active Time, Daily XP, Weekly XP, Monthly XP.

### Admin Commands
Requires **Manage Server** or **Administrator** permissions:
- `/leveladmin addxp <user> <amount>`: Grant XP to a member.
- `/leveladmin removexp <user> <amount>`: Deduct XP from a member.
- `/leveladmin setxp <user> <value>`: Set a user's exact XP.
- `/leveladmin setlevel <user> <level>`: Set a user's level.
- `/leveladmin reset <user>`: Reset all leveling counters and strip reward roles for a user.
- `/leveladmin resetleaderboard`: Clear all leveling records and caches for the guild.

---

## 5. REST API Documentation

All API endpoints are authenticated. Session or API Key authorization is verified, and the user must possess **Manage Server** on the target guild.

### Config settings
- **GET** `/api/guilds/:guildId`
  - Returns the guild configuration object including `configs.leveling` settings.
- **POST** `/api/guilds/:guildId/config/leveling`
  - Saves core settings.
  - Payload keys: `is_enabled`, `xp_cooldown_sec`, `xp_range_min`, `xp_range_max`, `xp_formula_base`, `xp_formula_exponent`, `xp_formula_offset`, `voice_xp_interval_min`, `voice_xp_amount`, `daily_xp_limit`, `weekly_xp_limit`, `announce_enabled`, `announce_channel`, `announce_message`, `announce_embed`, `announce_color`, `announce_image_url`, `stack_rewards`, `remove_rewards_on_demote`.

### Level Rewards CRUD
- **GET** `/api/guilds/:guildId/leveling/rewards`
  - Returns array of level role rewards.
- **POST** `/api/guilds/:guildId/leveling/rewards`
  - Creates a level role reward.
  - Body: `{ "level": 5, "role_id": "123456789...", "is_enabled": true }`
- **DELETE** `/api/guilds/:guildId/leveling/rewards/:id`
  - Deletes a level role reward record.

### Timed XP Boosts CRUD
- **GET** `/api/guilds/:guildId/leveling/boosts`
  - Returns array of boosters.
- **POST** `/api/guilds/:guildId/leveling/boosts`
  - Creates a booster.
  - Body: `{ "type": "role|channel|event", "target_id": "ID or event name", "multiplier": 2.0, "start_time": "ISO Date (optional)", "end_time": "ISO Date (optional)" }`
- **DELETE** `/api/guilds/:guildId/leveling/boosts/:id`
  - Deletes a booster record.

### Rankings & Analytics
- **GET** `/api/guilds/:guildId/leveling/leaderboard?type=total|messages|voice|daily|weekly|monthly`
  - Returns mapped user array with usernames, rank positions, and details.
- **GET** `/api/guilds/:guildId/leveling/analytics`
  - Returns today's active users, XP sum today, and weekly growth trends data (for charting).
- **GET** `/api/guilds/:guildId/leveling/logs`
  - Returns the recent 50 level up / XP adjustment audit entries.

### Admin Adjustments
- **POST** `/api/guilds/:guildId/leveling/admin`
  - Performs administrative database adjustments.
  - Body: `{ "action": "addxp|removexp|setxp|setlevel|reset|resetleaderboard", "userId": "user_id", "amount": 100, "value": 5 }`
