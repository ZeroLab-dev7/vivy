/* ============================================================
   Vivy Dashboard – Client Script
   ============================================================ */

let activeGuildId = new URLSearchParams(window.location.search).get('guild');
let guildChannels = [];
let guildRoles = [];
let economyShopItems = [];

/* ---------- Toast ---------- */
function showToast(message, type = 'info') {
    const icons = {
        success: 'fa-circle-check',
        error:   'fa-circle-xmark',
        warning: 'fa-triangle-exclamation',
        info:    'fa-circle-info'
    };
    const wrap = document.getElementById('toastWrap');
    if (!wrap) return;
    const t = document.createElement('div');
    t.className = `toast ${type}`;
    t.innerHTML = `<i class="fa-solid ${icons[type] || icons.info}"></i> ${message}`;
    wrap.appendChild(t);
    setTimeout(() => {
        t.style.opacity = '0';
        t.style.transform = 'translateX(20px)';
        setTimeout(() => t.remove(), 400);
    }, 3800);
}

/* ---------- Tab Switcher ---------- */
function switchTab(tabId) {
    // Deactivate all
    document.querySelectorAll('.dash-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.sidebar-item').forEach(i => i.classList.remove('active'));

    // Activate target tab
    const tab = document.getElementById(`tab-${tabId}`);
    if (tab) tab.classList.add('active');

    const navEl = document.getElementById
                <i class="fa-solid fa-crown"></i> Premium
            </div>
            <div class="user-chip" id="userChip">
                <img src="https://cdn.discordapp.com/embed/avatars/0.png" alt="Avatar" id="userAvatar">
                <span id="username">…</span>
            </div>
            <a href="/auth/discord/logout" class="btn-logout" id="logout-btn">
                <i class="fa-solid fa-right-from-bracket"></i> Logout
            </a>
        </div>
    </nav>

    <!-- Shell -->
    <div class="dash-shell">

        <!-- Sidebar -->
        <aside class="dash-sidebar">
            <span class="sidebar-section-label">General</span>
            <div class="sidebar-item active" id="nav-overview" onclick="switchTab('overview')">
                <i class="fa-solid fa-chart-line"></i> Overview
            </div>
            <div class="sidebar-item" id="nav-welcome" onclick="switchTab('welcome')">
            : `https://cdn.discordapp.com/embed/avatars/0.png`;

        const avatarEl = document.getElementById('userAvatar');
        const usernameEl = document.getElementById('username');
        if (avatarEl) avatarEl.src = avatarUrl;
        if (usernameEl) usernameEl.textContent = userData.user.global_name || userData.user.username;

        // Show premium chip if applicable
        if (userData.premium) {
            const chip = document.getElementById('premiumChip');
            if (chip) chip.style.display = 'inline-flex';
        }

        // Load guild info
        const guildRes = await fetch(`/api/guilds/${activeGuildId}`);
        if (!guildRes.ok) {
            showToast('Failed to load server details.', 'error');
            setTimeout(() => window.location.href = '/selector.html', 2000);
            return;
        }

        const data = await guildRes.json();

        const guildNameEl = document.getElementById('guildName');
        if (guildNameEl) guildNameEl.textContent = data.guildName || 'Server Dashboard';

        guildChannels = data.channels || [];
        guildRoles    = data.roles    || [];

        populateSelectors();
        loadWelcomeTab(data.configs?.welcome);
        loadAutoModTab(data.configs?.automod);
        loadEconomyTab(data.configs?.economy);
        loadAllModules(data.configs);

        fetchAnalytics();
        fetchApiKeys();
        fetchAuditLogs();

    } catch (e) {
        console.error('Dashboard Init Error:', e);
        showToast('Error loading dashboard configuration.', 'error');
    }
}

/* ---------- Populate Dropdowns ---------- */
function populateSelectors() {
            <div class="sidebar-item" id="nav-rooms" onclick="switchTab('rooms')">
                <i class="fa-solid fa-comments"></i> Need Help Rooms
    const catChans = guildChannels.filter(c => c.type === 4);
    const allRoles  = guildRoles;

    const chanIds = [
        'welcomeChannel','leaveChannel','giveawayChannel','amLogChannel',
        'warnLogsChannel','muteMuteLogsChannel','jailLogsChannel','verLogsChannel',
        'applyChannel','applyStaffChannel','applyLogChannel',
        'antibotLogChannel','antiwebhookLogChannel','roomLogChannel',
        'logChan_welcome', 'logChan_leave', 'logChan_nickname', 'logChan_role-given',
        'logChan_role-remove', 'logChan_role-update', 'logChan_ban', 'logChan_messages', 'logChan_channels'
    ];
    chanIds.forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;
        el.innerHTML = '<option value="">Select a channel…</option>';
        textChans.forEach(ch => { el.innerHTML += `<option value="${ch.id}">#${ch.name}</option>`; });
    });

    const voiceChanIds = [
        'roomJoinChannel', 'logChan_voice-join'
    ];
    voiceChanIds.forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;
        el.innerHTML = '<option value="">Select voice channel…</option>';
        voiceChans.forEach(ch => { el.innerHTML += `<option value="${ch.id}">🔊 ${ch.name}</option>`; });
    });

    const catChanIds = [
        'roomCategory'
    ];
    catChanIds.forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;
        el.innerHTML = '<option value="">Select category…</option>';
        catChans.forEach(ch => { el.innerHTML += `<option value="${ch.id}">📁 ${ch.name}</option>`; });
    });

    const roleIds = [
        'shopItemRole',
        'warnFirst', 'warnSecond', 'warnLast',
        'warnWarnerRole','muteMuteRole','jailJailedRole','jailJailerRole',
        'verVerificatorRole','verUnverifiedRole','verVerifiedRole','verVerifiedFemaleRole',
        'applyStaffRole','applyRoleStaff','applyRoleDesigner','applyRoleEvent','applyRolePartnership',
        'autoroleRoles','guildOwnerRoles','roomStaffRole','roomManagerRole'
    ];
    roleIds.forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;
        if (el.multiple) {
            el.innerHTML = '';
        } else {
            el.innerHTML = '<option value="">Select a role…</option>';
        }
        allRoles.forEach(r => { el.innerHTML += `<option value="${r.id}">@${r.name}</option>`; });
    });

    // Multi-select whitelists for anti-link
    const wlChan = document.getElementById('antilinkWlChannels');
    if (wlChan) { wlChan.innerHTML = ''; textChans.forEach(ch => { wlChan.innerHTML += `<option value="${ch.id}">#${ch.name}</option>`; }); }
    const wlRole = document.getElementById('antilinkWlRoles');
    if (wlRole) { wlRole.innerHTML = ''; allRoles.forEach(r => { wlRole.innerHTML += `<option value="${r.id}">@${r.name}</option>`; }); }
}

/* ---------- Load all new bot modules ---------- */
function loadAllModules(configs) {
    if (!configs) return;
    if (configs.warn)          loadWarnTab(configs.warn);
 

    const voiceChanIds = [
        'roomJoinChannel'
    ];
    voiceChanIds.forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;
        el.innerHTML = '<option value="">Select voice channel…</option>';
        voiceChans.forEach(ch => { el.innerHTML += `<option value="${escapeHtml(ch.id)}">🔊 ${escapeHtml(ch.name)}</option>`; });
    });

    const catChanIds = [
        'roomCategory'
    ];
    catChanIds.forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;
        el.innerHTML = '<option value="">Select category…</option>';
        catChans.forEach(ch => { el.innerHTML += `<option value="${escapeHtml(ch.id)}">📁 ${escapeHtml(ch.name)}</option>`; });
// MISSING LINE 201
// MISSING LINE 202
// MISSING LINE 203
// MISSING LINE 204
// MISSING LINE 205
// MISSING LINE 206
// MISSING LINE 207
// MISSING LINE 208
// MISSING LINE 209
// MISSING LINE 210
// MISSING LINE 211
// MISSING LINE 212
// MISSING LINE 213
// MISSING LINE 214
// MISSING LINE 215
// MISSING LINE 216
// MISSING LINE 217
// MISSING LINE 218
// MISSING LINE 219
    setMulti('antilinkWlChannels', c.whitelist_channels);
    setMulti('antilinkWlRoles',    c.whitelist_roles);
}
function loadApplyTab(c) {
    setVal('applyChannel',         c.apply_channel_id    || '');
    setVal('applyStaffChannel',    c.staff_channel_id    || '');
    setVal('applyLogChannel',      c.log_channel_id      || '');
    setVal('applyStaffRole',       c.staff_role_id       || '');
    setVal('applyRoleStaff',       c.role_staff_id       || '');
    setVal('applyRoleDesigner',    c.role_designer_id    || '');
    setVal('applyRoleEvent',       c.role_event_id       || '');
    setVal('applyRolePartnership', c.role_partnership_id || '');
    setVal('applyBanner',          c.banner_url          || '');
}

/* ---------- Save functions for new modules ---------- */
async function saveWarn() {
    const ok = await saveModuleConfig('warn', {
        warn_first:   document.getElementById('warnFirst')?.value       || null,
        warn_second:  document.getElementById('warnSecond')?.value      || null,
        warn_last:    document.getElementById('warnLast')?.value        || null,
        warner_role:  document.getElementById('warnWarnerRole')?.value  || null,
        warning_logs: document.getElementById('warnLogsChannel')?.value || null,
    });
    if (ok) showToast('Warn system saved!', 'success');
}
async function saveJail() {
    const ok = await saveModuleConfig('jail', {
        jailed_role_id:  document.getElementById('jailJailedRole')?.value  || null,
        jailer_role_id:  document.getElementById('jailJailerRole')?.value  || null,
        logs_channel_id: document.getElementById('jailLogsChannel')?.value || null,
    });
    if (ok) showToast('Jail system saved!', 'success');
}
async function saveMute() {
    const ok = await saveModuleConfig('mute', {
        mute_role_id:      document.getElementById('muteMuteRole')?.value        || null,
        mute_logs_channel: document.getElementById('muteMuteLogsChannel')?.value || null,
    });
    if (ok) showToast('Mute system saved!', 'success');
}
        role_partnership_id: document.getElementById('applyRolePartnership')?.value  || null,
        banner_url:          document.getElementById('applyBanner')?.value           || null,
    });
    if (ok) showToast('Apply panel saved!', 'success');
}

/* ---------- Welcome Tab ---------- */
function loadWelcomeTab(config) {
    if (!config) return;
    }
    setVal('roomStaffRole', staffRole);
    setVal('roomManagerRole', c.manager_role || '');
}
function loadLogsTab(c) {
    let channels = {};
    try {
        channels = typeof c.channels === 'string' ? JSON.parse(c.channels) : (c.channels || {});
    } catch {}
    const keys = [
        'welcome', 'leave', 'nickname', 'role-given', 'role-remove',
        'role-update', 'ban', 'messages', 'voice-join', 'channels'
    ];
    keys.forEach(key => {
        setVal(`logChan_${key}`, channels[key] || '');
    });
}

/* ---------- Save functions for new modules ---------- */
async function saveWarn() {
    const ok = await saveModuleConfig('warn', {
        warn_first:   document.getElementById('warnFirst')?.value       || null,
        warn_second:  document.getElementById('warnSecond')?.value      || null,
        warn_last:    document.getElementById('warnLast')?.value        || null,
        warner_role:  document.getElementById('warnWarnerRole')?.value  || null,
        warning_logs: document.getElementById('warnLogsChannel')?.value || null,
    });
    if (ok) showToast('Warn system saved!', 'success');
}
async function saveJail() {
    const ok = await saveModuleConfig('jail', {
        jailed_role_id:  document.getElementById('jailJailedRole')?.value  || null,
        jailer_role_id:  document.getElementById('jailJailerRole')?.value  || null,
        logs_channel_id: document.getElementById('jailLogsChannel')?.value || null,
    });
    if (ok) showToast('Jail system saved!', 'success');
}
async function saveMute() {
    const ok = await saveModuleConfig('mute', {
        mute_role_id:      document.getElementById('muteMuteRole')?.value        || null,
        mute_logs_channel: document.getElementById('muteMuteLogsChannel')?.value || null,
    });
    if (ok) showToast('Mute system saved!', 'success');
}
async function saveVerification() {
    const ok = await saveModuleConfig('verification', {
        verificator_role:     document.getElementById('verVerificatorRole')?.value    || null,
        unverified_role:      document.getElementById('verUnverifiedRole')?.value     || null,
        verified_role:        document.getElementById('verVerifiedRole')?.value       || null,
        verified_female_role: document.getElementById('verVerifiedFemaleRole')?.value || null,
        verification_logs:    document.getElementById('verLogsChannel')?.value        || null,
    });
    if (ok) showToast('Verification system saved!', 'success');
}
async function saveAntiLink() {
    const wlChan = Array.from(document.getElementById('antilinkWlChannels')?.selectedOptions || []).map(o => o.value);
    const wlRole = Array.from(document.getElementById('antilinkWlRoles')?.selectedOptions    || []).map(o => o.value);
    const ok = await saveModuleConfig('antilink', {
        is_enabled:         document.getElementById('antilinkEnabled')?.checked || false,
        action:             document.getElementById('antilinkAction')?.value    || 'delete',
        whitelist_channels: JSON.stringify(wlChan),
        whitelist_roles:    JSON.stringify(wlRole),
    });
    if (ok) showToast('Anti-Link settings saved!', 'success');
}
async function saveApply() {
    const ok = await saveModuleConfig('apply', {
        apply_channel_id:    document.getElementById('applyChannel')?.value          || null,
        staff_channel_id:    document.getElementById('applyStaffChannel')?.value     || null,
        log_channel_id:      document.getElementById('applyLogChannel')?.value       || null,
        staff_role_id:       document.getElementById('applyStaffRole')?.value        || null,
    }
    setVal('roomStaffRole', staffRole);
    setVal('roomManagerRole', c.manager_role || '');
}
function loadLogsTab(c) {
    let channels = {};
    try {
        channels = typeof c.channels === 'string' ? JSON.parse(c.channels) : (c.channels || {});
    } catch {}
    const keys = [
        'welcome', 'leave', 'nickname', 'role-given', 'role-remove',
        'role-update', 'ban', 'messages', 'voice-join', 'channels'
    ];
    keys.forEach(key => {
        setVal(`logChan_${key}`, channels[key] || '');
    });
}

/* ---------- Save functions for new modules ---------- */
async function saveWarn() {
                </tr>`).join('')}
            </tbody>
        </table>`;
}

function addShopItem() {
    const name  = document.getElementById('shopItemName')?.value.trim();
    const price = parseInt(document.getElementById('shopItemPrice')?.value);
    const role  = document.getElementById('shopItemRole')?.value;
    const desc  = document.getElementById('shopItemDesc')?.value.trim();

    if (!name || isNaN(price) || price <= 0) {
        showToast('Please enter a valid name and price.', 'warning');
        return;
    }

    economyShopItems.push({ id: `item_${Date.now()}`, name, price, role_id: role || null, description: desc || 'No description.' });
    ['shopItemName','shopItemPrice','shopItemDesc'].forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
    renderShopItems();
    showToast(`"${name}" added to shop!`, 'success');
}
        `;
    });
    svgContent += `</svg>`;
    chart.innerHTML = svgContent;
}

// Save config helper
async function saveModuleConfig(moduleName, data) {
    try {
        const res = await fetch(`/api/guilds/${activeGuildId}/config/${moduleName}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (res.ok) {
            return true;
        } else {
            const err = await res.json();
            showToast(err.error || 'Failed to update configuration.', 'error');
            return false;
        }
    } catch (e) {
        showToast('Network synchronization error.', 'error');
        return false;
    }
}

// Toast alerts display
function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast-alert toast-${type}`;
    
    const icons = {
        info: '<i class="fa-solid fa-circle-info"></i>',
        success: '<i class="fa-solid fa-circle-check"></i>',
        warning: '<i class="fa-solid fa-triangle-exclamation"></i>',
        error: '<i class="fa-solid fa-circle-xmark"></i>'
    };

    toast.innerHTML = `${icons[type]} <span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateY(0)';
    }, 100);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(-20px)';
        setTimeout(() => toast.remove(), 400);
    }, 3500);
}

window.onload = initDashboard;

    set('welcomeChannel', config.welcome_channel  || '');
    set('welcomeText',    config.welcome_message  || 'Welcome {user} to {server}!');
    set('welcomeBgImage', config.welcome_bg_image || '');
    set('leaveChannel',   config.leave_channel    || '');
    set('leaveText',      config.leave_message    || '{user} has left the server.');
    updateLivePreview();
}
        welcome_bg_image: document.getElementById('welcomeBgImage')?.value   || '',
        leave_enabled:    document.getElementById('leaveEnabled')?.checked   || false,
        leave_channel:    document.getElementById('leaveChannel')?.value     || '',
        leave_message:    document.getElementById('leaveText')?.value        || '',
    set('leaveChannel',   config.leave_channel    || '');
    set('leaveText',      config.leave_message    || '{user} has left the server.');
    updateLivePreview();
}

function updateLivePreview() {
    const textEl = document.getElementById('welcomeText');
    const previewEl = document.getElementById('previewText');
    const guildNameEl = document.getElementById('guildName');
    if (!textEl || !previewEl) return;

    const guildName = guildNameEl ? guildNameEl.textContent : 'Server';
    previewEl.innerHTML = textEl.value
        .replace(/{user}/g,        `<span class="mention">@Username</span>`)
        .replace(/{username}/g,    '<b>Username</b>')
        .replace(/{server}/g,      `<b>${guildName}</b>`)
        .replace(/{memberCount}/g, '<b>1,245</b>');
}

async function saveWelcomeSettings() {
    const data = {
        welcome_enabled:  document.getElementById('welcomeEnabled')?.checked || false,
        welcome_channel:  document.getElementById('welcomeChannel')?.value   || '',
        welcome_message:  document.getElementById('welcomeText')?.value      || '',
        welcome_bg_image: document.getElementById('welcomeBgImage')?.value   || '',
        leave_enabled:    document.getElementById('leaveEnabled')?.checked   || false,
        leave_channel:    document.getElementById('leaveChannel')?.value     || '',
        leave_message:    document.getElementById('leaveText')?.value        || '',
    };
    cons
    if (ok) showToast('Server logging saved!', 'success');
}

/* ---------- AutoMod Tab ---------- */
function loadAutoModTab(config) {
    if (!config) return;
    const cb = (id, val) => { const el = document.getElementById(id); if (el) el.checked = val; };
    cb('amSpam',     config.spam_enabled     || false);
    cb('amLinks',    config.links_enabled    || false);
    cb('amInvites',  config.invites_enabled  || false);
    cb('amBadWords', config.bad_words_enabled|| false);
    const bwl = document.getElementById('amBadWordsList');
    if (bwl) bwl.value = config.bad_words_list || '';
    const pun = document.getElementById('amPunishment');
    if (pun) pun.value = config.punishment || 'warn';
}

async function saveAutoMod() {
    const data = {
        spam_enabled:      document.getElementById('amSpam')?.checked     || false,
        links_enabled:     document.getElementById('amLinks')?.checked    || false,
        invites_enabled:   document.getElementById('amInvites')?.checked  || false,
        bad_words_enabled: document.getElementById('amBadWords')?.checked || false,
        bad_words_list:    document.getElementById('amBadWordsList')?.value || '',
        punishment:        document.getElementById('amPunishment')?.value  || 'warn',
    };
    const ok = await saveModuleConfig('automod', data);
    if (ok) showToast('AutoMod rules saved!', 'success');
}

/* ---------- Economy Tab ---------- */
function loadEconomyTab(config) {
    if (!config) return;
    try {
        economyShopItems = JSON.parse(config.shop_items || '[]');
        renderShopItems();
    } catch (e) { economyShopItems = []; }
}

function renderShopItems() {
    const el = document.getElementById('shopList');
        </table>`;
}

function addShopItem() {
    const name  = document.getElementById('shopItemName')?.value.trim();
    const price = parseInt(document.getElementById('shopItemPrice')?.value);
    const role  = document.getElementById('shopItemRole')?.value;
    const desc  = document.getElementById('shopItemDesc')?.value.trim();

async function saveAutoMod() {
    const data = {
        spam_enabled:      document.getElementById('amSpam')?.checked     || false,
        links_enabled:     document.getElementById('amLinks')?.checked    || false,
        invites_enabled:   document.getElementById('amInvites')?.checked  || false,
        bad_words_enabled: document.getElementById('amBadWords')?.checked || false,
        bad_words_list:    document.getElementById('amBadWordsList')?.value || '',
        punishment:        document.getElementById('amPunishment')?.value  || 'warn',
    };
    const ok = await saveModuleConfig('automod', data);
    if (ok) showToast('AutoMod rules saved!', 'success');
}

/* ---------- Economy Tab ---------- */
function loadEconomyTab(config) {
    if (!config) return;
    try {
        economyShopItems = JSON.parse(config.shop_items || '[]');
        renderShopItems();
    } catch (e) { economyShopItems = []; }
}

function renderShopItems() {
    const el = document.getElementById('shopList');
    if (!el) return;
    if (economyShopItems.length === 0) {
        el.innerHTML = '<div style="color:var(--text-2);font-size:14px;text-align:center;padding:20px;">No shop items yet. Create one above!</div>';
        return;
    }
    el.innerHTML = `
        <table class="data-table">
            <thead><tr><th>Name</th><th>Price</th><th>Description</th><th></th></tr></thead>
            <tbody>${economyShopItems.map((item, i) => `
                <tr>
                    <td><strong>${item.name}</strong></td>
                    <td>🪙 ${item.price.toLocaleString()}</td>
                    <td style="color:var(--text-2)">${item.description}</td>
                    <td><button class="btn btn-danger btn-sm" onclick="removeShopItem(${i})"><i class="fa-solid fa-trash"></i></button></td>
                </tr>`).join('')}
            </tbody>
        </table>`;
}

function addShopItem() {
    const name  = document.getElementById('shopItemName')?.value.trim();
    const price = parseInt(document.getElementById('shopItemPrice')?.value);
    const role  = document.getElementById('shopItemRole')?.value;
    const desc  = document.getElementById('shopItemDesc')?.value.trim();

    if (!name || isNaN(price) || price <= 0) {
        showToast('Please enter a valid name and price.', 'warning');
        return;
    }

    economyShopItems.push({ id: `item_${Date.now()}`, name, price, role_id: role || null, description: desc || 'No description.' });
    ['shopItemName','shopItemPrice','shopItemDesc'].forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
    renderShopItems();
    showToast(`"${name}" added to shop!`, 'success');
}

function removeShopItem(idx) {
    const removed = economyShopItems.splice(idx, 1)[0];
    renderShopItems();
    showToast(`"${removed.name}" removed.`, 'info');
}

async function saveEconomy() {
    const ok = await saveModuleConfig('economy', { shop_items: JSON.stringify(economyShopItems) });
    if (ok) showToast('Shop saved!', 'success');
}

/* ---------- Giveaway ---------- */
async function launchGiveaway() {
    const channelId = document.getElementById('giveawayChannel')?.value;
    const prize     = document.getElementById('giveawayPrize')?.value.trim();
    const winners   = parseInt(document.getElementById('giveawayWinners')?.value);
    const duration  = parseInt(document.getElementById('giveawayDuration')?.value);

    if (!channelId || !prize || isNaN(winners) || isNaN(duration) || winners < 1 || duration < 1) {
        showToast('Please fill all giveaway fields.', 'warning');
        return;
    }

    try {
        const res = await fetch(`/api/guilds/${activeGuildId}/config/giveaway`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ channelId, prize, winners, duration })
        });
        res.ok ? showToast('Giveaway launched on Discord! 🎉', 'success') : showToast('Failed to launch giveaway.', 'error');
    } catch { showToast('Network error.', 'error'); }
// MISSING LINE 621
// MISSING LINE 622
// MISSING LINE 623
// MISSING LINE 624
// MISSING LINE 625
// MISSING LINE 626
// MISSING LINE 627
// MISSING LINE 628
// MISSING LINE 629
// MISSING LINE 630
// MISSING LINE 631
// MISSING LINE 632
// MISSING LINE 633
// MISSING LINE 634
// MISSING LINE 635
// MISSING LINE 636
// MISSING LINE 637
// MISSING LINE 638
// MISSING LINE 639
// MISSING LINE 640
// MISSING LINE 641
// MISSING LINE 642
// MISSING LINE 643
// MISSING LINE 644
// MISSING LINE 645
// MISSING LINE 646
// MISSING LINE 647
// MISSING LINE 648
// MISSING LINE 649
}

async function deleteApiKey(key) {
    await fetch(`/api/guilds/${activeGuildId}/apikeys/${key}`, { method: 'DELETE' });
    fetchApiKeys();
    showToast('Token revoked.', 'info');
}

/* ---------- Analytics ---------- */
async function fetchAnalytics() {
    try {
        const res = await fetch(`/api/guilds/${activeGuildId}/analytics`);
        const data = await res.json();

        const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val?.toLocaleString() ?? '—'; };
        set('statMembers',  data.totalMembers);
        set('statBlocks',   data.warningsIssued);
        set('statTickets',  data.openTickets);
        set('statMessages', data.messagesLogged || 0);

        drawChart(data.growth || [], data.totalMembers || 100);
    } catch {
        ['statMembers','statBlocks','statTickets','statMessages'].forEach(id => {
            const el = document.getElementById(id); if (el) el.textContent = '—';
        });
        drawChart([], 100);
    }
}

function drawChart(growth, totalMembers) {
    const svg = document.getElementById('analyticsChart');
    if (!svg) return;

    // Default sample data if empty
    if (!growth.length) {
        growth = [
            { date: 'Mon', count: 12 },
            { date: 'Tue', count: 19 },
            { date: 'Wed', count: 8  },
            { date: 'Thu', count: 27 },
            {
// MISSING LINE 691
// MISSING LINE 692
// MISSING LINE 693
// MISSING LINE 694
// MISSING LINE 695
// MISSING LINE 696
// MISSING LINE 697
// MISSING LINE 698
// MISSING LINE 699
// MISSING LINE 700
// MISSING LINE 701
// MISSING LINE 702
// MISSING LINE 703
// MISSING LINE 704
// MISSING LINE 705
    });

    const polyline = points.map(p => `${p.x},${p.y}`).join(' ');
    const areaPath = `M${padL},${padT + chartH} ` +
        points.map(p => `L${p.x},${p.y}`).join(' ') +
        ` L${padL + chartW},${padT + chartH} Z`;

    svg.innerHTML = `
        <defs>
            <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#00e5ff" stop-opacity="0.25"/>
                <stop offset="100%" stop-color="#00e5ff" stop-opacity="0"/>
            </linearGradient>
        </defs>
        <path d="${areaPath}" fill="url(#chartGrad)"/>
        <polyline points="${polyline}" fill="none" stroke="#00e5ff" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>
        ${points.map(p => `
            <circle cx="${p.x}" cy="${p.y}" r="4" fill="#00e5ff" stroke="#070a10" stroke-width="2"/>
            <text x="${p.x}" y="${padT + chartH + 18}" fill="#4a5568" font-size="11" text-anchor="middle" font-family="Inter,sans-serif">${p.d.date}</text>
        `).join('')}
    `;
}

/* ---------- Save Helper ---------- */
async function saveModuleConfig(moduleName, data) {
    try {
        const res = await fetch(`/api/guilds/${activeGuildId}/config/${moduleName}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (res.ok) return true;
        const err = await res.json().catch(() => ({}));
        showToast(err.error || 'Save failed.', 'error');
        return false;
    } catch {
        showToast('Network error.', 'error');
        return false;
    }
}

/* ---------- Boot ---------- */
window.addEventListener('DOMContentLoaded', initDashboard);

        if (res.ok) return true;
        const err = await res.json().catch(() => ({}));
        showToast(err.error || 'Save failed.', 'error');
        return false;
    } catch {
        showToast('Network error.', 'error');
        return false;
    }
}
async function saveModuleConfig(moduleName, data) {
    try {
        const res = await fetch(`/api/guilds/${activeGuildId}/config/${moduleName}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (res.ok) return true;
        const err = await res.json().catch(() => ({}));
        showToast(err.error || 'Save failed.', 'error');
        return false;
    } catch {
        showToast('Network error.', 'error');
        return false;
    }
}

/* ---------- Unified Custom Select Component ---------- */
function initCustomSelect(select) {
    if (!select || select.dataset.customSelectInit) return;
    select.dataset.customSelectInit = 'true';

    const selectId = select.id || 'select-' + Math.random().toString(36).substr(2, 9);
    if (!select.id) select.id = selectId;

    const isMultiple = select.multiple;
    const placeholder = select.getAttribute('placeholder') || 
                        (select.options[0] && select.options[0].value === '' ? select.options[0].text : '') || 
                        (isMultiple ? 'Select options…' : 'Select an option…');

    // Create wrapper
    const wrap = document.createElement('div');
    wrap.className = `custom-multiselect-wrap ${isMultiple ? 'is-multiple' : 'is-single'}`;
    wrap.id = `wrap-${selectId}`;

    const display = document.createElement('div');
    display.className = 'custom-multiselect-display';

    const tags = document.createElement('div');
    tags.className = 'custom-multiselect-tags';

    const singleVal = document.createElement('span');
        channels = typeof c.channels === 'string' ? JSON.parse(c.channels) : (c.channels || {});
    } catch {}
    const keys = [
        'welcome', 'leave', 'nickname', 'role-given', 'role-remove',
        'role-update', 'ban', 'messages', 'voice-join', 'channels',
        'unban', 'kick', 'timeout', 'role-create', 'role-delete',
        'emojis', 'invites', 'voice-leave', 'voice-move', 'voice-mute',
        'voice-deafen', 'voice-disconnect'
    ];
    keys.forEach(key => {
        setVal(`logChan_${key}`, channels[key] || '');
    });
}

/* ---------- Save functions for new modules ---------- */
async function saveWarn() {
    const ok = await saveModuleConfig('warn', {
        warn_first:   document.getElementById('warnFirst')?.value       || null,
        warn_second:  document.getElementById('warnSecond')?.value      || null,
        warn_last:    document.getElementById('warnLast')?.value        || null,
        warner_role:  document.getElementById('warnWarnerRole')?.value  || null,
        warning_logs: document.getElementById('warnLogsChannel')?.value || null,
    });
    if (ok) showToast('Warn system saved!', 'success');
}
async function saveJail() {
    const ok = await saveModuleConfig('jail', {
        jailed_role_id:  document.getElementById('jailJailedRole')?.value  || null,
        jailer_role_id:  document.getElementById('jailJailerRole')?.value  || null,
        logs_channel_id: document
        staff_channel_id:    document.getElementById('applyStaffChannel')?.value     || null,
        log_channel_id:      document.getElementById('applyLogChannel')?.value       || null,
        staff_role_id:       document.getElementById('applyStaffRole')?.value        || null,
        role_staff_id:       document.getElementById('applyRoleStaff')?.value        || null,
        role_designer_id:    document.getElementById('applyRoleDesigner')?.value     || null,
        role_event_id:       document.getElementById('applyRoleEvent')?.value        || null,
        role_partnership_id: document.getElementById('applyRolePartnership')?.value  || null,
        banner_url:          document.getElementById('applyBanner')?.value           || null,
    });
    if (ok) showToast('Apply panel saved!', 'success');
}

async function saveAutoRole() {
    const roles = Array.from(document.getElementById('autoroleRoles')?.selectedOptions || []).map(o => o.value);
    const ok = await saveModuleConfig('autorole', {
// MISSING LINE 846
// MISSING LINE 847
// MISSING LINE 848
// MISSING LINE 849
// MISSING LINE 850
// MISSING LINE 851
// MISSING LINE 852
// MISSING LINE 853
// MISSING LINE 854
// MISSING LINE 855
// MISSING LINE 856
// MISSING LINE 857
// MISSING LINE 858
// MISSING LINE 859
}

async function saveAntiBot() {
    const ok = await saveModuleConfig('antibot', {
        is_enabled: document.getElementById('antibotEnabled')?.checked || false,
        log_channel_id: document.getElementById('antibotLogChannel')?.value || null
    });
    if (ok) showToast('Anti-Bot settings saved!', 'success');
}

async function saveAntiWebhook() {
    const ok = await saveModuleConfig('antiwebhook', {
        is_enabled: document.getElementById('antiwebhookEnabled')?.checked || false,
        log_channel_id: document.getElementById('antiwebhookLogChannel')?.value || null
    });
    if (ok) showToast('Anti-Webhook settings saved!', 'success');
}

async function saveRooms() {
    const staffRole = document.getElementById('roomStaffRole')?.value;
    const ok = await saveModuleConfig('rooms', {
        join_channel: document.getElementById('roomJoinChannel')?.value || null,
        room_category: document.getElementById('roomCategory')?.value || null,
        log_channel: document.getElementById('roomLogChannel')?.value || null,
        staff_role: staffRole ? JSON.stringify([staffRole]) : '[]',
        manager_role: document.getElementById('roomManagerRole')?.value || null
    });
    if (ok) showToast('Room setup saved!', 'success');
}

async function saveLogs() {
    const keys = [
        'welcome', 'leave', 'nickname', 'role-given', 'role-remove',
        'role-update', 'ban', 'messages', 'voice-join', 'channels',
        'unban', 'kick', 'timeout', 'role-create', 'role-delete',
        'emojis', 'invites', 'voice-leave', 'voice-move', 'voice-mute',
        'voice-deafen', 'voice-disconnect'
    ];
    const channels = {};
    keys.forEach(key => {
        const val = document.getElementById(`logChan_${key}`)?.value;
// MISSING LINE 901
// MISSING LINE 902
// MISSING LINE 903
// MISSING LINE 904
// MISSING LINE 905
// MISSING LINE 906
// MISSING LINE 907
// MISSING LINE 908
// MISSING LINE 909
// MISSING LINE 910
        });
    }

    if (search.value) {
        filterOptions(wrap, search.value.toLowerCase());
    }
}

function filterOptions(wrap, query) {
    const options = wrap.querySelectorAll('.custom-multiselect-option');
    let hasMatch = false;
    options.forEach(opt => {
        const text = opt.querySelector('span').textContent.toLowerCase();
        if (text.includes(query)) {
            opt.style.display = 'flex';
            hasMatch = true;
        } else {
            opt.style.display = 'none';
        }
    });

    let noResults = wrap.querySelector('.custom-multiselect-no-results-filter');
    if (!hasMatch) {
        if (!noResults) {
            noResults = document.createElement('div');
            noResults.className = 'custom-multiselect-no-results custom-multiselect-no-results-filter';
            noResults.textContent = 'No results found';
            wrap.querySelector('.custom-multiselect-dropdown').appendChild(noResults);
        }
    } else {
        if (noResults) noResults.remove();
    }
}

// Close dropdowns on outside click
document.addEventListener('click', (e) => {
    document.querySelectorAll('.custom-multiselect-wrap.open').forEach(wrap => {
        if (!wrap.contains(e.target)) {
            wrap.classList.remove('open');
            item.innerHTML = `
                <span>${opt.text}</span>
                <span class="custom-multiselect-option-check"><i class="fa-solid fa-check"></i></span>
            `;

            item.addEventListener('click', (e) => {
                e.stopPropagation();
                if (isMultiple) {
                    opt.selected = !opt.selected;
                } else {
                    select.value = opt.value;
                    nativeOptions.forEach(o => o.selected = (o.value === opt.value));
                    wrap.classList.remove('open');
                }
                select.dispatchEvent(new Event('change'));
                syncCustomSelect(selectId, placeholder);
            });
            optionsList.appendChild(item);
        });
    }

    if (search && search.value) {
        filterOptions(wrap, search.value.toLowerCase());
    }
}

function filterOptions(wrap, query) {
    const options = wrap.querySelectorAll('.custom-multiselect-option');
    let hasMatch = false;
    options.forEach(opt => {
        const text = opt.querySelector('span').textContent.toLowerCase();
        if (text.includes(query)) {
            opt.style.display = 'flex';
            hasMatch = true;
        } else {
            opt.style.display = 'none';
        }
    });

    let noResults = wrap.querySelector('.custom-multiselect-no-results-filter');
    if (!hasMatch) {
        if (!noResults) {
            noResults = document.createElement('div');
            noResults.className = 'custom-multiselect-no-results custom-multiselect-no-results-filter';
            noResults.textContent = 'No results found';
            wrap.querySelector('.custom-multiselect-options-list').appendChild(noResults);
        }
    } else {
        if (noResults) noResults.remove();
    }
}

function initAllCustomSelects() {
    document.querySelectorAll('select').forEach(select => {
        initCustomSelect(select);
    });
}

// Close dropdowns on outside click
document.addEventListener('click', (e) => {
    document.querySelectorAll('.custom-multiselect-wrap.open').forEach(wrap => {
        if (!wrap.contains(e.target)) {
            wrap.classList.remove('open');
            const search = wrap.querySelector('.custom-multiselect-search');
            if (search) {
                search.value = '';
                filterOptions(wrap, '');
            }
        }
    });
});

/* ---------- Boot ---------- */
window.addEventListener('DOMContentLoaded', initDashboard);

            noResults = document.createElement('div');
            noResults.className = 'custom-multiselect-no-results custom-multiselect-no-results-filter';
            noResults.textContent = 'No results found';
            wrap.querySelector('.custom-multiselect-options-list').appendChild(noResults);
        }
    } else {
        if (noResults) noResults.remove();
    }
}

function initAllCustomSelects() {
    document.querySelectorAll('select').forEach(select => {
        initCustomSelect(select);
    });
}

// Close dropdowns on outside click
document.addEventListener('click', (e) => {
    document.querySelectorAll('.custom-multiselect-wrap.open').forEach(wrap => {
        if (!wrap.contains(e.target)) {
            wrap.classList.remove('open');
            const search = wrap.querySelector('.custom-multiselect-search');
            if (search) {
                search.value = '';
                filterOptions(wrap, '');
            }
        }
    });
});

/* ---------- Boot ---------- */
window.addEventListener('DOMContentLoaded', initDashboard);
