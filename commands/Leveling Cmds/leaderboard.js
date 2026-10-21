const LevelService = require('../../services/levelService');
const UIManager = require('../../managers/uiManager');

module.exports = {
    name: 'leaderboard',
    aliases: ['top', 'level-top', 'xptop', 'levelboard', 'xplb', 'lvltop', 'ranktop'],
    description: 'Display server leveling and XP leaderboard (total, messages, voice, daily, weekly, monthly)',
    async execute(message, args) {
        const filterType = args[0] ? args[0].toLowerCase() : 'total';
        return this.sendLevelLeaderboard(message, filterType);
    },

    async sendLevelLeaderboard(target, filterType = 'total') {
        const guildId = target.guild?.id;
        const leaderboard = await LevelService.getLeaderboard(guildId, filterType, 10);

        const filterTitleMap = {
            total: '⚡ Server Leveling Leaderboard (Total XP)',
            messages: '💬 Text Messages Leaderboard',
            voice: '🎙️ Voice Activity Leaderboard',
            daily: '📅 Daily XP Leaderboard',
            weekly: '🗓️ Weekly XP Leaderboard',
            monthly: '📊 Monthly XP Leaderboard'
        };

        const titleLabel = filterTitleMap[filterType] || '⚡ Server Leveling Leaderboard';

        const container = UIManager.createContainer({
            title: titleLabel,
            accentColor: UIManager.ACCENTS.INDIGO
        });

        if (!leaderboard || leaderboard.length === 0) {
            container.addSectionComponents(UIManager.createSection({
                title: 'Empty Leaderboard',
                content: `No leveling data recorded yet for ${filterType} in this server.`,
                buttonLabel: 'Empty',
                buttonId: 'lvl_empty_btn'
            }));
            const payload = UIManager.toResponse(container);
            if (target.isButton && target.isButton()) {
                return target.update(payload);
            } else if (target.editReply) {
                return target.editReply(payload);
            } else {
                return target.reply(payload);
            }
        }

        const medals = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];
        const client = target.client || target.channel?.client;

        const config = await LevelService.getOrCreateConfig(guildId);
        const sections = [];
        for (let i = 0; i < Math.min(10, leaderboard.length); i++) {
            const record = leaderboard[i];
            let userTag = 'Unknown User';
            try {
                const user = await client.users.fetch(record.user_id);
                if (user) userTag = user.username;
            } catch (e) { }

            let scoreText = '';
            if (filterType === 'messages') {
                scoreText = `\`${Number(record.messages_count || 0).toLocaleString()}\` messages`;
            } else if (filterType === 'voice') {
                scoreText = `\`${Number(record.voice_time_min || 0).toLocaleString()}\` mins active`;
            } else if (filterType === 'daily') {
                scoreText = `\`${Number(record.xp_today || 0).toLocaleString()}\` XP today`;
            } else if (filterType === 'weekly') {
                scoreText = `\`${Number(record.xp_week || 0).toLocaleString()}\` XP this week`;
            } else if (filterType === 'monthly') {
                scoreText = `\`${Number(record.xp_month || 0).toLocaleString()}\` XP this month`;
            } else {
                const totalXP = LevelService.getTotalXP(record.level, record.xp, config);
                scoreText = `Level: \`${record.level}\` • Total XP: \`${Number(totalXP).toLocaleString()}\``;
            }

            sections.push(UIManager.createSection({
                title: `${medals[i] || `#${i + 1}`} ${userTag}`,
                content: scoreText,
                buttonLabel: `Rank #${i + 1}`,
                buttonId: `lvl_rank_${i + 1}`
            }));
        }

        UIManager.addSections(container, sections);
        const payload = UIManager.toResponse(container);
        if (target.isButton && target.isButton()) {
            return target.update(payload);
        } else if (target.editReply) {
            return target.editReply(payload);
        } else {
            return target.reply(payload);
        }
    }
};
