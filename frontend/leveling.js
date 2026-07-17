let activeGuildId = null;
let globalChannels = [];
let globalRoles = [];

function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// Parse guild ID from URL
const pathParts = window.location.pathname.split('/').filter(Boolean);
if (pathParts[0] === 'servers' && pathParts[1]) {
    activeGuildId = pathParts[1];
} else {
    activeGuildId = new URLSearchParams(window.location.search).get('guild');
}

function showToast(message, type = 'info') {
    if (window.showToast) {
        window.showToast(message, type);
    } else {
        const toastWrap = document.getElementById('toastWrap');
        if (!toastWrap) return;
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerText = message;
        toastWrap.appendChild(toast);
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 200);
        }, 3000);
    }
}

// Hook tab switching to load data dynamically
const originalSwitchTab = window.switchTab;
window.switchTab = function (tabId, pushState = true) {
    if (originalSwitchTab) {
        originalSwitchTab(tabId, pushState);
    }
    if (tabId === 'leveling') {
        loadLevelingData();
    }
};

// Also listen for back/forward navigation
window.addEventListener('popstate', () => {
    const parts = window.location.pathname.split('/').filter(Boolean);
    if (parts[0] === 'servers' && parts[1]) {
        const currentTab = parts[2] || 'overview';
        if (currentTab === 'leveling') {
            loadLevelingData();
        }
    }
});

// Run once on page load if direct access
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', checkAndLoadOnStart);
} else {
    checkAndLoadOnStart();
}

function checkAndLoadOnStart() {
    const urlParams = new URLSearchParams(window.location.search);
    const parts = window.location.pathname.split('/').filter(Boolean);
    const currentTab = parts[2] || urlParams.get('tab');
    if (currentTab === 'leveling') {
        loadLevelingData();
    }
}

function switchLevelingSubTab(subTabId) {
    document.querySelectorAll('.leveling-subtab').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.sub-tab-btn').forEach(el => el.classList.remove('active'));

    const activeSubTab = document.getElementById(`leveling-subtab-${subTabId}`);
    if (activeSubTab) activeSubTab.classList.add('active');

    // Find the button and activate it via data-subtab attribute
    const activeBtn = Array.from(document.querySelectorAll('.sub-tab-btn')).find(btn => btn.dataset.subtab === subTabId);
    if (activeBtn) activeBtn.classList.add('active');
}

async function loadLevelingData() {
    if (!activeGuildId) return;

    try {
        // Fetch channels, roles, and core config
        const guildRes = await fetch(`/api/guilds/${activeGuildId}`);
        if (!guildRes.ok) return;

        const data = await guildRes.json();
        globalChannels = data.channels || [];
        globalRoles = data.roles || [];
        const config = data.configs?.leveling || {};

        populateSelectors(globalChannels, globalRoles, config);
        populateConfigSettings(config);

        // Fetch sub-tabs data
        await Promise.all([
            loadAnalytics(),
            loadRewards(),
            loadBoosts(),
            loadLeaderboardData(),
            loadLogs()
        ]);

    } catch (err) {
        console.error('Error loading leveling settings:', err);
        showToast('Failed to load leveling configurations.', 'error');
    }
}

function populateSelectors(channels, roles, config) {
    const announceSelect = document.getElementById('lvl-setting-announce-channel');
    if (announceSelect) {
        announceSelect.innerHTML = `
            <option value="disabled" ${(!config.announce_channel || config.announce_channel === 'disabled') ? 'selected' : ''}><:no:1526496561188831244>Disabled (Do not send)</option>
            <option value="dm" ${(config.announce_channel === 'dm') ? 'selected' : ''}>📥 Direct Message (DM)</option>
        `;
        channels.filter(c => c.type === 0 || c.type === 5).forEach(c => {
            const selected = config.announce_channel === c.id ? 'selected' : '';
            announceSelect.innerHTML += `<option value="${c.id}" ${selected}>#${c.name}</option>`;
        });
    }

    const rewardRoleSelect = document.getElementById('lvl-reward-role');
    if (rewardRoleSelect) {
        rewardRoleSelect.innerHTML = '<option value="">Select role...</option>';
        roles.forEach(r => {
            rewardRoleSelect.innerHTML += `<option value="${r.id}">@${r.name}</option>`;
        });
    }

    // Default target select populate (Roles by default)
    populateBoostTargetOptions('role');
}

function populateBoostTargetOptions(type) {
    const targetSelect = document.getElementById('lvl-boost-target');
    if (!targetSelect) return;
    targetSelect.innerHTML = '<option value="">Select target...</option>';

    if (type === 'role') {
        globalRoles.forEach(role => {
            targetSelect.innerHTML += `<option value="${role.id}">@${role.name}</option>`;
        });
    } else if (type === 'channel') {
        globalChannels.forEach(channel => {
            targetSelect.innerHTML += `<option value="${channel.id}">#${channel.name}</option>`;
        });
    }
}

function toggleBoostTargetInput() {
    const type = document.getElementById('lvl-boost-type').value;
    const targetSelectContainer = document.getElementById('lvl-boost-target-select-container');
    const targetTextContainer = document.getElementById('lvl-boost-target-text-container');
    const dateContainer = document.getElementById('lvl-boost-event-dates');
    const label = document.getElementById('lvl-boost-target-label');

    if (type === 'event') {
        targetSelectContainer.style.display = 'none';
        targetTextContainer.style.display = 'block';
        dateContainer.style.display = 'grid';
    } else {
        targetSelectContainer.style.display = 'block';
        targetTextContainer.style.display = 'none';
        dateContainer.style.display = 'none';
        if (label) {
            label.innerText = type === 'role' ? 'Target Role' : 'Target Channel';
        }
        populateBoostTargetOptions(type);
    }
}

function populateConfigSettings(config) {
    document.getElementById('lvl-setting-enabled').checked = config.is_enabled || false;
    document.getElementById('lvl-setting-min-xp').value = config.xp_range_min ?? 15;
    document.getElementById('lvl-setting-max-xp').value = config.xp_range_max ?? 25;
    document.getElementById('lvl-setting-cooldown').value = config.xp_cooldown_sec ?? 60;
    document.getElementById('lvl-setting-voice-interval').value = config.voice_xp_interval_min ?? 5;
    document.getElementById('lvl-setting-voice-xp').value = config.voice_xp_amount ?? 10;
    document.getElementById('lvl-setting-formula-base').value = config.xp_formula_base ?? 100;
    document.getElementById('lvl-setting-formula-exponent').value = config.xp_formula_exponent ?? 1.8;
    document.getElementById('lvl-setting-formula-offset').value = config.xp_formula_offset ?? 100;
    document.getElementById('lvl-setting-daily-cap').value = config.daily_xp_limit ?? 0;
    document.getElementById('lvl-setting-weekly-cap').value = config.weekly_xp_limit ?? 0;
    document.getElementById('lvl-setting-announce').checked = config.announce_enabled ?? true;
    document.getElementById('lvl-setting-announce-embed').checked = config.announce_embed ?? true;
    document.getElementById('lvl-setting-announce-color').value = config.announce_color || '#5865F2';
    document.getElementById('lvl-setting-announce-image').value = config.announce_image_url || '';
    document.getElementById('lvl-setting-announce-msg').value = config.announce_message || '<a:pink8:1337678972108148757> Congratulations {user}! You reached Level {level}!';
    document.getElementById('lvl-setting-stack').checked = config.stack_rewards ?? true;
    document.getElementById('lvl-setting-demote').checked = config.remove_rewards_on_demote ?? true;

    const rankBgInput = document.getElementById('lvl-setting-rank-bg');
    if (rankBgInput) rankBgInput.value = config.rank_card_background || '';
}

async function saveLevelingConfig() {
    try {
        const body = {
            is_enabled: document.getElementById('lvl-setting-enabled').checked,
            xp_cooldown_sec: parseInt(document.getElementById('lvl-setting-cooldown').value, 10),
            xp_range_min: parseInt(document.getElementById('lvl-setting-min-xp').value, 10),
            xp_range_max: parseInt(document.getElementById('lvl-setting-max-xp').value, 10),
            xp_formula_base: parseInt(document.getElementById('lvl-setting-formula-base').value, 10),
            xp_formula_exponent: parseFloat(document.getElementById('lvl-setting-formula-exponent').value),
            xp_formula_offset: parseInt(document.getElementById('lvl-setting-formula-offset').value, 10),
            voice_xp_interval_min: parseInt(document.getElementById('lvl-setting-voice-interval').value, 10),
            voice_xp_amount: parseInt(document.getElementById('lvl-setting-voice-xp').value, 10),
            daily_xp_limit: parseInt(document.getElementById('lvl-setting-daily-cap').value, 10),
            weekly_xp_limit: parseInt(document.getElementById('lvl-setting-weekly-cap').value, 10),
            announce_enabled: document.getElementById('lvl-setting-announce').checked,
            announce_embed: document.getElementById('lvl-setting-announce-embed').checked,
            announce_channel: document.getElementById('lvl-setting-announce-channel').value || null,
            announce_color: document.getElementById('lvl-setting-announce-color').value,
            announce_image_url: document.getElementById('lvl-setting-announce-image').value || null,
            announce_message: document.getElementById('lvl-setting-announce-msg').value,
            stack_rewards: document.getElementById('lvl-setting-stack').checked,
            remove_rewards_on_demote: document.getElementById('lvl-setting-demote').checked,
            rank_card_background: document.getElementById('lvl-setting-rank-bg')?.value || null
        };

        const res = await fetch(`/api/guilds/${activeGuildId}/config/leveling`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        if (res.ok) {
            showToast('Leveling settings saved successfully.', 'success');
        } else {
            const err = await res.json();
            showToast(err.error || 'Failed to save settings.', 'error');
        }
    } catch (err) {
        console.error(err);
        showToast('Connection error.', 'error');
    }
}

function resetLevelingSettings() {
    if (!confirm('Reset all leveling settings to their default values?\nThis only resets the form — you still need to click "Apply Settings" to save.')) return;

    // Core
    const enabledEl = document.getElementById('lvl-setting-enabled');
    if (enabledEl) enabledEl.checked = false;

    // Message XP
    const fields = {
        'lvl-setting-min-xp': 15,
        'lvl-setting-max-xp': 25,
        'lvl-setting-cooldown': 60,
        'lvl-setting-voice-interval': 5,
        'lvl-setting-voice-xp': 10,
        'lvl-setting-formula-base': 100,
        'lvl-setting-formula-exponent': 1.8,
        'lvl-setting-formula-offset': 100,
        'lvl-setting-daily-cap': 0,
        'lvl-setting-weekly-cap': 0,
    };
    Object.entries(fields).forEach(([id, val]) => {
        const el = document.getElementById(id);
        if (el) el.value = val;
    });

    // Announcements
    const announceEl = document.getElementById('lvl-setting-announce');
    if (announceEl) announceEl.checked = true;
    const embedEl = document.getElementById('lvl-setting-announce-embed');
    if (embedEl) embedEl.checked = true;
    const chanEl = document.getElementById('lvl-setting-announce-channel');
    if (chanEl) chanEl.value = chanEl.options[0]?.value ?? '';
    const colorEl = document.getElementById('lvl-setting-announce-color');
    if (colorEl) colorEl.value = '#5865F2';
    const imgEl = document.getElementById('lvl-setting-announce-image');
    if (imgEl) imgEl.value = '';
    const msgEl = document.getElementById('lvl-setting-announce-msg');
    if (msgEl) msgEl.value = '<a:pink8:1337678972108148757> Congratulations {user}! You reached Level {level}!';

    // Role reward options
    const stackEl = document.getElementById('lvl-setting-stack');
    if (stackEl) stackEl.checked = true;
    const demoteEl = document.getElementById('lvl-setting-demote');
    if (demoteEl) demoteEl.checked = true;

    showToast('Settings reset to defaults. Click "Apply Settings" to save.', 'info');
}

// ── REWARDS CRUD ──
async function loadRewards() {
    try {
        const res = await fetch(`/api/guilds/${activeGuildId}/leveling/rewards`);
        const rewards = await res.json();

        const tbody = document.getElementById('lvl-rewards-list');
        if (!tbody) return;

        // Update stats badge
        const statsRewards = document.getElementById('lvl-stat-rewards-active');
        if (statsRewards) statsRewards.innerText = rewards.length;

        if (rewards.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" style="color:var(--text-3);padding:20px 0;text-align:center;">No role rewards configured yet.</td></tr>';
            return;
        }

        tbody.innerHTML = '';
        rewards.forEach(reward => {
            const role = globalRoles.find(r => r.id === reward.role_id);
            const roleName = role ? `@${role.name}` : `Unknown Role (${reward.role_id})`;
            const statusBadge = reward.is_enabled ? '<span class="status-badge status-active">Enabled</span>' : '<span class="status-badge status-inactive">Disabled</span>';

            tbody.innerHTML += `
                <tr>
                    <td>Level ${reward.level}</td>
                    <td style="color:${role ? role.color : 'inherit'}">${roleName}</td>
                    <td>${statusBadge}</td>
                    <td>
                        <button class="btn btn-danger btn-sm btn-delete-level-reward" style="padding:4px 8px;font-size:12px;" data-id="${reward.id}">
                            <i class="fa-solid fa-trash-can"></i> Delete
                        </button>
                    </td>
                </tr>
            `;
        });
    } catch (e) {
        console.error(e);
    }
}

async function addLevelReward() {
    const levelInput = document.getElementById('lvl-reward-level');
    const roleSelect = document.getElementById('lvl-reward-role');
    const enabledInput = document.getElementById('lvl-reward-enabled');

    const level = parseInt(levelInput.value, 10);
    const role_id = roleSelect.value;
    const is_enabled = enabledInput.checked;

    if (isNaN(level) || level <= 0 || !role_id) {
        showToast('Please specify a level and select a role.', 'error');
        return;
    }

    try {
        const res = await fetch(`/api/guilds/${activeGuildId}/leveling/rewards`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ level, role_id, is_enabled })
        });

        if (res.ok) {
            showToast('Role reward added.', 'success');
            levelInput.value = '';
            roleSelect.value = '';
            loadRewards();
        } else {
            const err = await res.json();
            showToast(err.error || 'Failed to add reward.', 'error');
        }
    } catch (e) {
        showToast('Failed to save reward.', 'error');
    }
}

async function deleteLevelReward(id) {
    if (!confirm('Are you sure you want to delete this reward?')) return;
    try {
        const res = await fetch(`/api/guilds/${activeGuildId}/leveling/rewards/${id}`, {
            method: 'DELETE'
        });
        if (res.ok) {
            showToast('Role reward removed.', 'success');
            loadRewards();
        }
    } catch (e) {
        showToast('Failed to delete reward.', 'error');
    }
}

// ── BOOSTS CRUD ──
async function loadBoosts() {
    try {
        const res = await fetch(`/api/guilds/${activeGuildId}/leveling/boosts`);
        const boosts = await res.json();

        const tbody = document.getElementById('lvl-boosts-list');
        if (!tbody) return;

        // Update stats badge
        const statsBoosts = document.getElementById('lvl-stat-active-boosts');
        if (statsBoosts) statsBoosts.innerText = boosts.length;

        if (boosts.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="color:var(--text-3);padding:20px 0;text-align:center;">No active XP boosts configured.</td></tr>';
            return;
        }

        tbody.innerHTML = '';
        boosts.forEach(boost => {
            let targetLabel = boost.target_id;
            if (boost.type === 'role') {
                const role = globalRoles.find(r => r.id === boost.target_id);
                targetLabel = role ? `@${role.name}` : `@Role (${boost.target_id})`;
            } else if (boost.type === 'channel') {
                const chan = globalChannels.find(c => c.id === boost.target_id);
                targetLabel = chan ? `#${chan.name}` : `#Channel (${boost.target_id})`;
            }

            let duration = 'Permanent';
            if (boost.type === 'event' && boost.start_time && boost.end_time) {
                const start = new Date(boost.start_time).toLocaleString();
                const end = new Date(boost.end_time).toLocaleString();
                duration = `<span style="font-size:11px;">${start} to ${end}</span>`;
            }

            tbody.innerHTML += `
                <tr>
                    <td style="text-transform: capitalize;">${boost.type}</td>
                    <td>${targetLabel}</td>
                    <td><strong style="color:#00f5ff">${boost.multiplier}x XP</strong></td>
                    <td>${duration}</td>
                    <td>
                        <button class="btn btn-danger btn-sm btn-delete-xp-boost" style="padding:4px 8px;font-size:12px;" data-id="${boost.id}">
                            <i class="fa-solid fa-trash-can"></i> Delete
                        </button>
                    </td>
                </tr>
            `;
        });
    } catch (e) {
        console.error(e);
    }
}

async function addXPBoost() {
    const typeSelect = document.getElementById('lvl-boost-type');
    const targetSelect = document.getElementById('lvl-boost-target');
    const targetText = document.getElementById('lvl-boost-target-text');
    const multInput = document.getElementById('lvl-boost-multiplier');
    const startInput = document.getElementById('lvl-boost-start');
    const endInput = document.getElementById('lvl-boost-end');

    const type = typeSelect.value;
    const target_id = type === 'event' ? targetText.value : targetSelect.value;
    const multiplier = parseFloat(multInput.value);
    const start_time = type === 'event' && startInput.value ? startInput.value : null;
    const end_time = type === 'event' && endInput.value ? endInput.value : null;

    if (!target_id || isNaN(multiplier) || multiplier <= 0) {
        showToast('Please specify booster target and a valid multiplier.', 'error');
        return;
    }

    try {
        const res = await fetch(`/api/guilds/${activeGuildId}/leveling/boosts`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type, target_id, multiplier, start_time, end_time })
        });

        if (res.ok) {
            showToast('Booster created successfully.', 'success');
            if (type === 'event') targetText.value = '';
            else targetSelect.value = '';
            multInput.value = '';
            startInput.value = '';
            endInput.value = '';
            loadBoosts();
        } else {
            const err = await res.json();
            showToast(err.error || 'Failed to save booster.', 'error');
        }
    } catch (e) {
        showToast('Connection error.', 'error');
    }
}

async function deleteXPBoost(id) {
    if (!confirm('Delete this booster?')) return;
    try {
        const res = await fetch(`/api/guilds/${activeGuildId}/leveling/boosts/${id}`, {
            method: 'DELETE'
        });
        if (res.ok) {
            showToast('Booster deleted.', 'success');
            loadBoosts();
        }
    } catch (e) {
        showToast('Failed to delete booster.', 'error');
    }
}

// ── LEADERBOARD ──
async function loadLeaderboardData() {
    const metric = document.getElementById('lvl-leaderboard-sort')?.value || 'total';
    try {
        const res = await fetch(`/api/guilds/${activeGuildId}/leveling/leaderboard?type=${metric}`);
        const data = await res.json();

        const tbody = document.getElementById('lvl-leaderboard-list');
        if (!tbody) return;

        if (data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" style="color:var(--text-3);padding:20px 0;text-align:center;">No ranking data recorded yet.</td></tr>';
            return;
        }

        tbody.innerHTML = '';
        data.forEach((user, index) => {
            const avatarImg = user.avatar ? `<img src="${user.avatar}" style="width:28px;height:28px;border-radius:50%;vertical-align:middle;margin-right:8px;" />` : `<div style="display:inline-block;width:28px;height:28px;border-radius:50%;background:#5865F2;vertical-align:middle;margin-right:8px;line-height:28px;text-align:center;font-size:12px;">${user.username[0].toUpperCase()}</div>`;

            tbody.innerHTML += `
                <tr>
                    <td><strong>#${index + 1}</strong></td>
                    <td>${avatarImg}${user.username}</td>
                    <td>Level ${user.level}</td>
                    <td>${user.xp} XP</td>
                    <td>${user.messages_count} msgs</td>
                    <td>${user.voice_time_min} mins</td>
                    <td>${user.xp_today} XP</td>
                    <td>
                        <div style="display:flex;gap:4px;">
                            <button class="btn btn-secondary btn-sm btn-adjust-user-level" style="padding:2px 6px;font-size:11px;" data-userid="${user.user_id}" data-username="${escapeHtml(user.username)}">Adjust</button>
                        </div>
                    </td>
                </tr>
            `;
        });
    } catch (e) {
        console.error(e);
    }
}

function adjustUserLevelDialog(userId, username) {
    const action = prompt(`Adjust leveling stats for ${username}.\nEnter action:\n- "addxp <amount>"\n- "removexp <amount>"\n- "setxp <amount>"\n- "setlevel <level>"\n- "reset"`);
    if (!action) return;

    const parts = action.split(' ');
    const act = parts[0].toLowerCase();
    const val = parts[1] ? parseInt(parts[1], 10) : 0;

    let body = { action: act, userId };
    if (act === 'addxp' || act === 'removexp') {
        body.amount = val;
    } else if (act === 'setxp' || act === 'setlevel') {
        body.value = val;
    } else if (act === 'reset') {
        // No values needed
    } else {
        showToast('Invalid adjust action.', 'error');
        return;
    }

    fetch(`/api/guilds/${activeGuildId}/leveling/admin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    }).then(async res => {
        if (res.ok) {
            showToast('Stats adjusted successfully.', 'success');
            loadLeaderboardData();
            loadLogs();
        } else {
            const err = await res.json();
            showToast(err.error || 'Failed to adjust stats.', 'error');
        }
    }).catch(() => {
        showToast('Network error.', 'error');
    });
}

async function resetServerLeaderboard() {
    if (!confirm('🚨 WARNING! This will reset the leveling stats for ALL users on this server. This action cannot be undone.\nAre you sure you want to continue?')) return;
    try {
        const res = await fetch(`/api/guilds/${activeGuildId}/leveling/admin`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'resetleaderboard' })
        });
        if (res.ok) {
            showToast('Leaderboard has been completely reset.', 'success');
            loadLeaderboardData();
            loadLogs();
        } else {
            showToast('Failed to reset leaderboard.', 'error');
        }
    } catch (e) {
        showToast('Connection error.', 'error');
    }
}

// ── ACTIVITY LOGS ──
async function loadLogs() {
    try {
        const res = await fetch(`/api/guilds/${activeGuildId}/leveling/logs`);
        const logs = await res.json();

        const tbody = document.getElementById('lvl-logs-list');
        if (!tbody) return;

        if (logs.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" style="color:var(--text-3);padding:20px 0;text-align:center;">No leveling logs recorded.</td></tr>';
            return;
        }

        tbody.innerHTML = '';
        logs.forEach(log => {
            const time = new Date(log.timestamp).toLocaleTimeString();
            let actionBadge = '';
            if (log.action === 'message_xp') actionBadge = '<span class="status-badge status-active" style="background:rgba(88,101,242,0.15);color:#5865F2;">Message XP</span>';
            else if (log.action === 'voice_xp') actionBadge = '<span class="status-badge status-active" style="background:rgba(0,245,255,0.15);color:#00f5ff;">Voice XP</span>';
            else if (log.action === 'level_up') actionBadge = '<span class="status-badge status-active" style="background:rgba(235,69,158,0.15);color:#eb459e;border-color:#eb459e;">Level Up 🌟</span>';
            else actionBadge = '<span class="status-badge status-inactive">Admin Set</span>';

            tbody.innerHTML += `
                <tr>
                    <td style="font-size:12px;color:var(--text-3)">${time}</td>
                    <td>${log.username}</td>
                    <td>${actionBadge}</td>
                    <td>${log.xp_gained > 0 ? '+' : ''}${log.xp_gained}</td>
                    <td>${log.level_before}</td>
                    <td>${log.level_after}</td>
                    <td style="font-size:12px;max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="${log.details || ''}">${log.details || ''}</td>
                </tr>
            `;
        });
    } catch (e) {
        console.error(e);
    }
}

// ── ANALYTICS / GRAPHS ──
async function loadAnalytics() {
    try {
        const res = await fetch(`/api/guilds/${activeGuildId}/leveling/analytics`);
        const data = await res.json();

        const activeUsersStat = document.getElementById('lvl-stat-active-users');
        if (activeUsersStat) activeUsersStat.innerText = data.activeUsers || 0;

        const xpTodayStat = document.getElementById('lvl-stat-xp-today');
        if (xpTodayStat) xpTodayStat.innerText = data.xpToday || 0;

        renderXPChart(data.growth || []);
    } catch (e) {
        console.error(e);
    }
}

function renderXPChart(growthData) {
    const container = document.getElementById('lvl-chart-container');
    if (!container || !growthData || growthData.length === 0) return;

    const width = container.clientWidth || 600;
    const height = 220;
    const paddingLeft = 50;
    const paddingRight = 20;
    const paddingTop = 20;
    const paddingBottom = 30;

    const chartWidth = width - paddingLeft - paddingRight;
    const chartHeight = height - paddingTop - paddingBottom;

    const maxXP = Math.max(...growthData.map(d => d.count), 100);
    const points = growthData.map((d, index) => {
        const x = paddingLeft + (index / (growthData.length - 1)) * chartWidth;
        const y = height - paddingBottom - (d.count / maxXP) * chartHeight;
        return { x, y, label: d.date, value: d.count };
    });

    let pathD = `M ${points[0].x} ${points[0].y}`;
    let areaD = `M ${points[0].x} ${height - paddingBottom} L ${points[0].x} ${points[0].y}`;

    for (let i = 1; i < points.length; i++) {
        pathD += ` L ${points[i].x} ${points[i].y}`;
        areaD += ` L ${points[i].x} ${points[i].y}`;
    }
    areaD += ` L ${points[points.length - 1].x} ${height - paddingBottom} Z`;

    let gridSVG = '';
    const gridCount = 4;
    for (let i = 0; i <= gridCount; i++) {
        const yVal = Math.round((maxXP / gridCount) * i);
        const yPos = height - paddingBottom - (yVal / maxXP) * chartHeight;
        gridSVG += `
            <line x1="${paddingLeft}" y1="${yPos}" x2="${width - paddingRight}" y2="${yPos}" stroke="rgba(255,255,255,0.05)" stroke-dasharray="4" />
            <text x="${paddingLeft - 10}" y="${yPos + 4}" fill="rgba(255,255,255,0.3)" font-size="10" text-anchor="end">${yVal}</text>
        `;
    }

    let xAxisSVG = '';
    points.forEach(p => {
        xAxisSVG += `
            <text x="${p.x}" y="${height - 10}" fill="rgba(255,255,255,0.3)" font-size="11" text-anchor="middle">${p.label}</text>
            <circle cx="${p.x}" cy="${p.y}" r="4" fill="#00f5ff" stroke="#0f0f12" stroke-width="2" />
        `;
    });

    const svg = `
        <svg width="100%" height="100%" viewBox="0 0 ${width} ${height}">
            <defs>
                <linearGradient id="chartGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="#00f5ff" stop-opacity="0.3"/>
                    <stop offset="100%" stop-color="#a100ff" stop-opacity="0.0"/>
                </linearGradient>
                <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stop-color="#00f5ff"/>
                    <stop offset="100%" stop-color="#a100ff"/>
                </linearGradient>
            </defs>
            ${gridSVG}
            <path d="${areaD}" fill="url(#chartGlow)" />
            <path d="${pathD}" fill="none" stroke="url(#lineGrad)" stroke-width="3" />
            ${xAxisSVG}
        </svg>
    `;

    container.innerHTML = svg;
}

// Window resizing update for vector chart
window.addEventListener('resize', () => {
    const activeTab = document.querySelector('.dash-tab.active');
    if (activeTab && activeTab.id === 'tab-leveling') {
        const overviewSubTab = document.getElementById('leveling-subtab-overview');
        if (overviewSubTab && overviewSubTab.classList.contains('active')) {
            loadAnalytics();
        }
    }
});

// Expose functions to window for onclick handlers in HTML
if (typeof window !== 'undefined') {
    window.switchLevelingSubTab = switchLevelingSubTab;
    window.saveLevelingConfig = saveLevelingConfig;
    window.resetLevelingSettings = resetLevelingSettings;
    window.addLevelReward = addLevelReward;
    window.deleteLevelReward = deleteLevelReward;
    window.addXPBoost = addXPBoost;
    window.deleteXPBoost = deleteXPBoost;
    window.resetServerLeaderboard = resetServerLeaderboard;
    window.toggleBoostTargetInput = toggleBoostTargetInput;
    window.loadLeaderboardData = loadLeaderboardData;
    window.adjustUserLevelDialog = adjustUserLevelDialog;
}

// Delegated click listeners for rewards, boosts, and user adjustments
document.addEventListener('click', (e) => {
    // Delete Level Reward
    const deleteRewardBtn = e.target.closest('.btn-delete-level-reward');
    if (deleteRewardBtn) {
        const id = deleteRewardBtn.getAttribute('data-id');
        if (id) deleteLevelReward(id);
    }

    // Delete XP Boost
    const deleteBoostBtn = e.target.closest('.btn-delete-xp-boost');
    if (deleteBoostBtn) {
        const id = deleteBoostBtn.getAttribute('data-id');
        if (id) deleteXPBoost(id);
    }

    // Adjust User Level Dialog
    const adjustUserLevelBtn = e.target.closest('.btn-adjust-user-level');
    if (adjustUserLevelBtn) {
        const userId = adjustUserLevelBtn.getAttribute('data-userid');
        const username = adjustUserLevelBtn.getAttribute('data-username');
        if (userId && username) adjustUserLevelDialog(userId, username);
    }
});

// Bind leveling UI elements once DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Sub-tab buttons
    document.querySelectorAll('.sub-tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const subTabId = btn.dataset.subtab;
            if (subTabId) switchLevelingSubTab(subTabId);
        });
    });

    // Boost type selector
    const boostTypeSelect = document.getElementById('lvl-boost-type');
    if (boostTypeSelect) {
        boostTypeSelect.addEventListener('change', () => toggleBoostTargetInput());
    }

    // Leaderboard sort selector
    const leaderboardSort = document.getElementById('lvl-leaderboard-sort');
    if (leaderboardSort) {
        leaderboardSort.addEventListener('change', () => loadLeaderboardData());
    }

    // Save leveling config button
    const btnSaveLevelingConfig = document.getElementById('btn-save-leveling-config');
    if (btnSaveLevelingConfig) {
        btnSaveLevelingConfig.addEventListener('click', () => saveLevelingConfig());
    }

    // Add level reward button
    const btnAddLevelReward = document.getElementById('btn-add-level-reward');
    if (btnAddLevelReward) {
        btnAddLevelReward.addEventListener('click', () => addLevelReward());
    }

    // Add XP boost button
    const btnAddXpBoost = document.getElementById('btn-add-xp-boost');
    if (btnAddXpBoost) {
        btnAddXpBoost.addEventListener('click', () => addXPBoost());
    }

    // Reset leaderboard button
    const btnResetLeaderboard = document.getElementById('btn-reset-leaderboard');
    if (btnResetLeaderboard) {
        btnResetLeaderboard.addEventListener('click', () => resetServerLeaderboard());
    }

    // Reset leveling settings to defaults button
    const btnResetLevelingConfig = document.getElementById('btn-reset-leveling-config');
    if (btnResetLevelingConfig) {
        btnResetLevelingConfig.addEventListener('click', () => resetLevelingSettings());
    }
});
