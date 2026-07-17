/**
 * livepreview.js
 * Handles real-time Discord-style previews for Welcome and Apply Panel tabs.
 */

// ── FETCH INTERCEPTOR FOR EMBDED/CONTAINER FIELDS ──────────────────────────────

const originalFetch = window.fetch;
window.fetch = async function (url, options) {
    const urlStr = String(url);
    
    // Intercept Welcome settings save to inject custom welcome_embed_json / leave_embed_json
    if (options && options.method === 'POST' && urlStr.includes('/config/welcome')) {
        try {
            const body = JSON.parse(options.body);
            
            // Build welcome_embed_json
            const welcomeTitle = document.getElementById('welcomeEmbedTitle')?.value || '';
            const welcomeDesc = document.getElementById('welcomeEmbedDesc')?.value || '';
            body.welcome_embed_json = JSON.stringify({
                title: welcomeTitle,
                description: welcomeDesc,
                color: '#00f5ff'
            });

            // Build leave_embed_json
            const leaveTitle = document.getElementById('leaveEmbedTitle')?.value || '';
            const leaveDesc = document.getElementById('leaveEmbedDesc')?.value || '';
            body.leave_embed_json = JSON.stringify({
                title: leaveTitle,
                description: leaveDesc,
                color: '#ff3333'
            });

            options.body = JSON.stringify(body);
        } catch (e) {
            console.error('Error modifying welcome settings save payload:', e);
        }
    }

    const response = await originalFetch(url, options);

    // Intercept load config
    if (!options || options.method === 'GET' || !options.method) {
        const isMainGuildRequest = /\/api\/guilds\/\d{17,19}(\?.*)?$/.test(urlStr.split('#')[0]);
        if (isMainGuildRequest) {
            try {
                const clone = response.clone();
                const data = await clone.json();
                
                if (data && data.configs && data.configs.welcome) {
                    const welcome = data.configs.welcome;
                    
                    // Delay slightly to ensure inputs exist in the DOM
                    setTimeout(() => {
                        // Populate welcome embed fields
                        let welcomeEmbed = {};
                        if (welcome.welcome_embed_json) {
                            try { welcomeEmbed = JSON.parse(welcome.welcome_embed_json); } catch (e) {}
                        }
                        const welcomeTitleInput = document.getElementById('welcomeEmbedTitle');
                        const welcomeDescInput = document.getElementById('welcomeEmbedDesc');
                        if (welcomeTitleInput) welcomeTitleInput.value = welcomeEmbed.title || '';
                        if (welcomeDescInput) welcomeDescInput.value = welcomeEmbed.description || '';

                        // Populate leave embed fields
                        let leaveEmbed = {};
                        if (welcome.leave_embed_json) {
                            try { leaveEmbed = JSON.parse(welcome.leave_embed_json); } catch (e) {}
                        }
                        const leaveTitleInput = document.getElementById('leaveEmbedTitle');
                        const leaveDescInput = document.getElementById('leaveEmbedDesc');
                        if (leaveTitleInput) leaveTitleInput.value = leaveEmbed.title || '';
                        if (leaveDescInput) leaveDescInput.value = leaveEmbed.description || '';

                        // Update the live preview
                        updateLivePreview();
                    }, 50);
                }

                if (data) {
                    setTimeout(() => {
                        setupVerificationTab(data);
                    }, 50);
                }
            } catch (e) {
                console.error('Error handling loaded welcome/verification settings:', e);
            }
        }
    }

    return response;
};

// ── WELCOME TAB LIVE PREVIEW ──────────────────────────────────────────────────

function updateLivePreview() {
    const rawText = document.getElementById('welcomeText')?.value || 'Welcome {user} to {server}!';
    const bgUrl   = document.getElementById('welcomeBgImage')?.value?.trim() || '';
    
    const embedTitleText = document.getElementById('welcomeEmbedTitle')?.value?.trim() || '👋 Welcome!';
    const embedDescText = document.getElementById('welcomeEmbedDesc')?.value || 'Hey {user}, glad you\'re here!';

    // Parse variables into styled Discord-mention spans for welcomeText
    const rendered = rawText
        .replace(/\{user\}/g,        '<span class="mention">@User</span>')
        .replace(/\{username\}/g,    '<span class="mention">User</span>')
        .replace(/\{server\}/g,      '<span class="mention">Server</span>')
        .replace(/\{memberCount\}/g, '<span class="mention">#1,000</span>');

    const previewText = document.getElementById('previewText');
    if (previewText) previewText.innerHTML = rendered;

    // Parse variables into styled Discord-mention spans for embed description
    const renderedEmbedDesc = embedDescText
        .replace(/\{user\}/g,        '<span class="mention">@User</span>')
        .replace(/\{username\}/g,    '<span class="mention">User</span>')
        .replace(/\{server\}/g,      '<span class="mention">Server</span>')
        .replace(/\{memberCount\}/g, '<span class="mention">#1,000</span>');

    const previewEmbedTitle = document.getElementById('previewEmbedTitle');
    if (previewEmbedTitle) previewEmbedTitle.textContent = embedTitleText;

    const previewEmbedDesc = document.getElementById('previewEmbedDesc');
    if (previewEmbedDesc) previewEmbedDesc.innerHTML = renderedEmbedDesc;

    // Canvas / embed background
    const embedCanvas = document.querySelector('.embed-canvas');
    if (embedCanvas && bgUrl) {
        embedCanvas.style.backgroundImage = `url('${bgUrl}')`;
        embedCanvas.style.backgroundSize  = 'cover';
        embedCanvas.style.backgroundPosition = 'center';
    } else if (embedCanvas) {
        embedCanvas.style.backgroundImage = '';
    }
}

// ── APPLY PANEL LIVE PREVIEW ──────────────────────────────────────────────────

function updateApplyPreview() {
    const title       = document.getElementById('applyPanelTitle')?.value?.trim()       || 'Recruitment Hub';
    const description = document.getElementById('applyPanelDescription')?.value?.trim() || 'Welcome to our recruitment hub.';
    const bannerUrl   = document.getElementById('applyBanner')?.value?.trim()           || '';
    const style       = document.getElementById('applyPanelStyle')?.value               || 'menu';

    // -- Title
    const previewTitle = document.getElementById('previewTitle');
    if (previewTitle) previewTitle.textContent = title;

    // -- Description (preserve line breaks)
    const previewDesc = document.getElementById('previewDescription');
    if (previewDesc) previewDesc.textContent = description;

    // -- Banner image
    const previewBanner = document.getElementById('previewBanner');
    if (previewBanner) {
        if (bannerUrl) {
            previewBanner.src = bannerUrl;
            previewBanner.style.display = 'block';
        } else {
            previewBanner.src = '';
            previewBanner.style.display = 'none';
        }
    }

    // -- Items list: pull department names from dept-card elements
    const departments = [];
    document.querySelectorAll('.dept-card').forEach(card => {
        // The dept name is the first text input inside the card header area
        const nameInput = card.querySelector('input[type="text"]');
        const name = nameInput?.value?.trim();
        if (name) departments.push(name);
    });

    const previewItems = document.getElementById('previewItems');
    if (previewItems) {
        if (departments.length) {
            previewItems.innerHTML = departments
                .map(d => `<div style="display:flex;align-items:center;gap:6px;color:#dbdee1;">
                    <span style="color:#00b0f4;font-size:11px;">◆</span>
                    <span>${escapePreview(d)}</span>
                </div>`)
                .join('');
        } else {
            previewItems.innerHTML = '<div style="color:#949ba4;font-size:12px;font-style:italic;">No departments configured yet</div>';
        }
    }

    // -- Component row: buttons or dropdown
    const previewComponents = document.getElementById('previewComponents');
    if (previewComponents) {
        if (departments.length === 0) {
            previewComponents.innerHTML = '';
        } else if (style === 'buttons') {
            // Show individual button pills
            previewComponents.innerHTML = departments.slice(0, 4)
                .map(d => `<button style="
                    background: #4e5058;
                    border: none;
                    border-radius: 4px;
                    color: #dbdee1;
                    font-size: 13px;
                    font-weight: 500;
                    padding: 6px 16px;
                    margin: 3px 4px 3px 0;
                    cursor: default;
                    font-family: 'Inter', sans-serif;
                ">${escapePreview(d)}</button>`)
                .join('')
                + (departments.length > 4
                    ? `<span style="color:#949ba4;font-size:11px;margin-left:4px;">+${departments.length - 4} more…</span>`
                    : '');
        } else {
            // Dropdown select mock
            previewComponents.innerHTML = `<div style="
                background: #1e1f22;
                border: 1px solid #4e5058;
                border-radius: 4px;
                padding: 8px 12px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                color: #949ba4;
                font-size: 14px;
                cursor: default;
                font-family: 'Inter', sans-serif;
                max-width: 320px;
            ">
                <span>Choose a position…</span>
                <span style="font-size:10px;">▼</span>
            </div>`;
        }
    }
}

function escapePreview(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

// ── CARD PRESETS GALLERY ──────────────────────────────────────────────────────

function initPresetGalleries() {
    document.addEventListener('click', e => {
        const item = e.target.closest('.preset-item');
        if (!item) return;

        const gallery = item.closest('.preset-gallery');
        if (!gallery) return;

        const targetId = gallery.getAttribute('data-target');
        const targetInput = document.getElementById(targetId);
        if (!targetInput) return;

        const url = item.getAttribute('data-url');
        targetInput.value = url;

        // Visual feedback: border highlighting
        gallery.querySelectorAll('.preset-item').forEach(el => {
            el.style.borderColor = 'rgba(255,255,255,0.08)';
            el.style.boxShadow = 'none';
        });
        item.style.borderColor = 'var(--cyan)';
        item.style.boxShadow = '0 0 10px rgba(0, 242, 254, 0.4)';

        // Dispatch input event to trigger previews/state updates
        targetInput.dispatchEvent(new Event('input', { bubbles: true }));
        targetInput.dispatchEvent(new Event('change', { bubbles: true }));
    });
}

// ── WIRING ────────────────────────────────────────────────────────────────────

function wireWelcomePreview() {
    ['welcomeText', 'welcomeBgImage', 'welcomeEmbedTitle', 'welcomeEmbedDesc'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('input', updateLivePreview);
    });
    // Initial render
    updateLivePreview();
}

function wireApplyPreview() {
    ['applyPanelTitle', 'applyPanelDescription', 'applyBanner'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('input', updateApplyPreview);
    });

    const styleSelect = document.getElementById('applyPanelStyle');
    if (styleSelect) styleSelect.addEventListener('change', updateApplyPreview);

// Watch for dynamically added department name inputs via MutationObserver
    const container = document.getElementById('departmentsContainer');
    if (container) {
        const observer = new MutationObserver(() => updateApplyPreview());
        observer.observe(container, { childList: true, subtree: true, characterData: true });

        // Also delegate input events on department name fields inside the container
        container.addEventListener('input', e => {
            const card = e.target.closest('.dept-card');
            if (card && e.target.tagName === 'INPUT') {
                updateApplyPreview();
            }
        });
    }

    // Initial render
    updateApplyPreview();
}
// ── VERIFICATION CENTER CUSTOM LOGIC ──────────────────────────────────────────
const activeGuildId = window.location.pathname.split('/').filter(Boolean)[1] || window.activeGuildId || '';
let verificationLogsCached = [];

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;')
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;')
              .replace(/"/g, '&quot;')
              .replace(/'/g, '&#039;');
}

function toast(msg, type = 'info') {
    if (typeof showToast === 'function') {
        showToast(msg, type);
    } else if (typeof window.showToast === 'function') {
        window.showToast(msg, type);
    } else {
        alert(msg);
    }
}

function populateSelect(id, items, selectedValue, defaultLabel) {
    const select = document.getElementById(id);
    if (!select) {
        console.warn(`[populateSelect] Element with id "${id}" not found.`);
        return;
    }
    select.innerHTML = `<option value="">${defaultLabel}</option>`;
    items.forEach(item => {
        const opt = document.createElement('option');
        opt.value = item.id;
        opt.textContent = item.name;
        if (item.id && String(item.id) === String(selectedValue)) {
            opt.selected = true;
        }
        select.appendChild(opt);
    });

    const wrap = document.getElementById('wrap-' + id);
    console.log(`[populateSelect] id: ${id}`, {
        selectExists: !!select,
        optionsCount: select.options.length,
        wrapperExists: !!wrap,
        wrapperVisible: wrap ? window.getComputedStyle(wrap).display !== 'none' : false,
        itemsCount: items.length
    });
}

function setCheckbox(id, val) {
    const el = document.getElementById(id);
    if (el) el.checked = !!val;
}

function setInputVal(id, val) {
    const el = document.getElementById(id);
    if (el) el.value = val;
}

function toggleVerificationPanels(selectedType) {
    const panelStaff = document.getElementById('panel-ver-staff');
    const panelSecurity = document.getElementById('panel-ver-security');
    
    if (selectedType === 'security') {
        if (panelStaff) panelStaff.style.display = 'none';
        if (panelSecurity) panelSecurity.style.display = 'block';
    } else {
        if (panelStaff) panelStaff.style.display = 'block';
        if (panelSecurity) panelSecurity.style.display = 'none';
    }
}

function updatePresetVisibility(level) {
    const customPanel = document.getElementById('panel-sec-custom-rules');
    if (customPanel) {
        if (level === 'custom') {
            customPanel.style.display = 'block';
        } else {
            customPanel.style.display = 'none';
        }
    }
}

function updateCustomRuleWrappers() {
    const rules = [
        { chk: 'secRuleMinAccountAgeEnabled', wrap: 'wrapper-rule-min-age' },
        { chk: 'secRuleMinJoinTimeEnabled', wrap: 'wrapper-rule-min-join' },
        { chk: 'secRuleCaptchaEnabled', wrap: 'wrapper-rule-captcha' },
        { chk: 'secRuleAntiAltEnabled', wrap: 'wrapper-rule-anti-alt' },
        { chk: 'secRuleCooldownEnabled', wrap: 'wrapper-rule-cooldown' },
        { chk: 'secRuleMaxAttemptsEnabled', wrap: 'wrapper-rule-max-attempts' }
    ];
    rules.forEach(r => {
        const chkEl = document.getElementById(r.chk);
        const wrapEl = document.getElementById(r.wrap);
        if (chkEl && wrapEl) {
            wrapEl.style.display = chkEl.checked ? 'block' : 'none';
        }
    });
}

/**
 * Selects a preset level card by value, updating radio + .active class
 */
function selectPresetCard(value) {
    document.querySelectorAll('.preset-card').forEach(card => {
        const radio = card.querySelector('input[type="radio"]');
        if (radio) {
            const isSelected = radio.value === value;
            radio.checked = isSelected;
            card.classList.toggle('active', isSelected);
        }
    });
}

function updateSecurityVerificationPreview() {
    const title = document.getElementById('secEmbedTitle')?.value || 'Verification Required';
    const desc = document.getElementById('secEmbedDesc')?.value || 'Click the button below to verify and access the server.';
    const color = document.getElementById('secEmbedColor')?.value || '#0099ff';
    const thumb = document.getElementById('secEmbedThumbnail')?.value || '';
    const footer = document.getElementById('secEmbedFooter')?.value || '';
    const btnLabel = document.getElementById('secBtnLabel')?.value || 'Verify Me';
    const btnEmoji = document.getElementById('secBtnEmoji')?.value || '🛡️';
    const btnStyle = document.getElementById('secBtnStyle')?.value || 'primary';

    const previewTitle = document.getElementById('secPreviewTitle');
    if (previewTitle) previewTitle.textContent = title;

    const previewDesc = document.getElementById('secPreviewDesc');
    if (previewDesc) previewDesc.textContent = desc;

    const previewBox = document.getElementById('secPreviewEmbedBox');
    if (previewBox) previewBox.style.borderLeftColor = color;

    const previewThumb = document.getElementById('secPreviewThumb');
    if (previewThumb) {
        if (thumb) {
            previewThumb.style.display = 'block';
            const img = previewThumb.querySelector('img');
            if (img) img.src = thumb;
        } else {
            previewThumb.style.display = 'none';
        }
    }

    const previewFooter = document.getElementById('secPreviewFooter');
    if (previewFooter) previewFooter.textContent = footer;

    const previewBtn = document.getElementById('secPreviewButton');
    const previewBtnEmoji = document.getElementById('secPreviewBtnEmoji');
    const previewBtnText = document.getElementById('secPreviewBtnText');

    if (previewBtn) {
        if (btnStyle === 'primary') previewBtn.style.background = '#5865F2';
        else if (btnStyle === 'secondary') previewBtn.style.background = '#4e5058';
        else if (btnStyle === 'success') previewBtn.style.background = '#248046';
        else if (btnStyle === 'danger') previewBtn.style.background = '#da373c';
    }
    if (previewBtnEmoji) {
        const emojiMatch = btnEmoji.match(/<a?:[a-zA-Z0-9_]+:([0-9]+)>/);
        if (emojiMatch) {
            const emojiId = emojiMatch[1];
            const isAnimated = btnEmoji.startsWith('<a:');
            const ext = isAnimated ? 'gif' : 'png';
            previewBtnEmoji.innerHTML = `<img src="https://cdn.discordapp.com/emojis/${emojiId}.${ext}" style="width:16px; height:16px; object-fit:contain; vertical-align:middle; margin-right:4px;">`;
        } else {
            previewBtnEmoji.textContent = btnEmoji;
        }
    }
    if (previewBtnText) previewBtnText.textContent = btnLabel;
}

async function setupVerificationTab(data) {
    if (!activeGuildId) return;
    if (!data || !data.roles || !data.channels) {
        return;
    }

    try {
        // Fetch legacy/Staff verification config
        const res = await fetch(`/api/guilds/${activeGuildId}/verification/config`);
        if (!res.ok) return;
        const verConfig = await res.json();

        // Populate dropdowns with roles & channels from data
        const roles = data.roles || [];
        const channels = data.channels || [];

        populateSelect('verVerificatorRole', roles, verConfig.roles?.verificator_role, 'Select role…');
        populateSelect('verUnverifiedRole', roles, verConfig.roles?.unverified_role, 'Select role…');
        populateSelect('verVerifiedRole', roles, verConfig.roles?.verified_role, 'Select role…');
        populateSelect('verVerifiedFemaleRole', roles, verConfig.roles?.verified_female_role, 'Select role…');
        populateSelect('verLogsChannel', channels, verConfig.roles?.verification_logs, 'Select channel…');

        // Fetch new Security Verification config
        const secRes = await fetch(`/api/guilds/${activeGuildId}/security-verification/config`);
        if (secRes.ok) {
            const secConfig = await secRes.json();
            
            // Populate select dropdowns for Security Mode
            populateSelect('secChannelId', channels, secConfig.channel_id, 'Select channel…');
            populateSelect('secCategoryId', channels, secConfig.category_id, 'Select category…');
            populateSelect('secVerifiedRoleId', roles, secConfig.verified_role_id, 'Select role…');
            populateSelect('secUnverifiedRoleId', roles, secConfig.unverified_role_id, 'Select role…');
            populateSelect('secFailureRoleId', roles, secConfig.failure_role_id, 'Select role (none)...');
            populateSelect('secLogChannelId', channels, secConfig.log_channel_id, 'Select channel…');

            const setValSelect = (id, val) => {
                if (typeof window.setVal === 'function') {
                    window.setVal(id, val);
                } else {
                    const el = document.getElementById(id);
                    if (el) el.value = val || '';
                }
            };

            setValSelect('secChannelId', secConfig.channel_id);
            setValSelect('secCategoryId', secConfig.category_id);
            setValSelect('secVerifiedRoleId', secConfig.verified_role_id);
            setValSelect('secUnverifiedRoleId', secConfig.unverified_role_id);
            setValSelect('secFailureRoleId', secConfig.failure_role_id);
            setValSelect('secLogChannelId', secConfig.log_channel_id);
            
            // Populate Preset Level
            const level = secConfig.level || 'low';
            selectPresetCard(level);
            updatePresetVisibility(level);

            // Wire click events for preset level cards (idempotent guard)
            document.querySelectorAll('.preset-card').forEach(card => {
                if (!card.dataset.wired) {
                    card.dataset.wired = '1';
                    card.addEventListener('click', () => {
                        const radio = card.querySelector('input[type="radio"]');
                        if (radio) {
                            selectPresetCard(radio.value);
                            updatePresetVisibility(radio.value);
                        }
                    });
                }
            });

            // Populate Section 2 Channel Toggles & Buttons
            setCheckbox('secAutoCreateChannel', secConfig.auto_create_channel);
            setCheckbox('secAutoPermissions', secConfig.auto_permissions);
            setCheckbox('secDeletePreviousMsg', secConfig.delete_previous_msg);
            setInputVal('secBtnLabel', secConfig.btn_label || 'Verify Me');
            setInputVal('secBtnEmoji', secConfig.btn_emoji || '🛡️');
            setInputVal('secBtnStyle', secConfig.btn_style || 'primary');
            setInputVal('secEmbedTitle', secConfig.embed_title || 'Verification Required');
            setInputVal('secEmbedDesc', secConfig.embed_desc || 'Click the button below to verify and access the server.');
            setInputVal('secEmbedColor', secConfig.embed_color || '#0099ff');
            setInputVal('secEmbedThumbnail', secConfig.embed_thumbnail || '');
            setInputVal('secEmbedFooter', secConfig.embed_footer || '');

            // Populate Section 4 Custom Rules
            setCheckbox('secRuleMinAccountAgeEnabled', secConfig.rule_min_account_age_enabled);
            setInputVal('secRuleMinAccountAgeVal', secConfig.rule_min_account_age_val || 3);
            setCheckbox('secRuleMinJoinTimeEnabled', secConfig.rule_min_join_time_enabled);
            setInputVal('secRuleMinJoinTimeVal', secConfig.rule_min_join_time_val || 10);
            setCheckbox('secRuleRequireAvatarEnabled', secConfig.rule_require_avatar_enabled);
            setCheckbox('secRuleCaptchaEnabled', secConfig.rule_captcha_enabled);
            setInputVal('secRuleCaptchaType', secConfig.rule_captcha_type || 'button');
            setCheckbox('secRuleAntiAltEnabled', secConfig.rule_anti_alt_enabled);
            setInputVal('secRuleAntiAltType', secConfig.rule_anti_alt_type || 'basic');
            setCheckbox('secRuleCooldownEnabled', secConfig.rule_cooldown_enabled);
            setInputVal('secRuleCooldownVal', secConfig.rule_cooldown_val || 10);
            setCheckbox('secRuleMaxAttemptsEnabled', secConfig.rule_max_attempts_enabled);
            setInputVal('secRuleMaxAttemptsVal', secConfig.rule_max_attempts_val || 3);
            setCheckbox('secRuleAutoKickEnabled', secConfig.rule_auto_kick_enabled);
            setCheckbox('secRuleAutoBanEnabled', secConfig.rule_auto_ban_enabled);
            setCheckbox('secRuleSendDmEnabled', secConfig.rule_send_dm_enabled);
            setCheckbox('secRuleWelcomeMessageEnabled', secConfig.rule_welcome_message_enabled);

            // Populate Section 5 Actions
            setCheckbox('secActionSuccessRemoveUnverified', secConfig.action_success_remove_unverified);
            setCheckbox('secActionSuccessGiveVerified', secConfig.action_success_give_verified);
            setCheckbox('secActionSuccessSendDm', secConfig.action_success_send_dm);
            setCheckbox('secActionSuccessLog', secConfig.action_success_log);
            setCheckbox('secActionFailRetry', secConfig.action_fail_retry);
            setInputVal('secActionFailCooldown', secConfig.action_fail_cooldown || 60);
            setCheckbox('secActionFailNotifyStaff', secConfig.action_fail_notify_staff);
            setCheckbox('secActionFailKick', secConfig.action_fail_kick);
            setCheckbox('secActionFailBan', secConfig.action_fail_ban);

            // Populate Section 6 Logs
            setValSelect('secLogLevel', secConfig.log_level || 'info');
            setCheckbox('secLogVerbose', secConfig.log_verbose);

            // Trigger updates of wrappers & live previews
            updateCustomRuleWrappers();
            updateSecurityVerificationPreview();
        }

        // Populate Mode type selector (card-based)
        const mode = verConfig.mode || null;
        setVerificationType(mode, false); // false = don't save to API on load

        // Load stats & history logs
        await loadVerificationStats();
        await loadVerificationHistory();
    } catch (e) {
        console.error('Error in setupVerificationTab:', e);
    }
}

async function saveSecurityVerificationSettings() {
    if (!activeGuildId) return;
    const btn = document.getElementById('btn-save-security-verification');
    if (btn) btn.disabled = true;

    try {
        const body = {
            level: document.querySelector('input[name="secLevel"]:checked')?.value || 'low',
            
            // Section 2
            channel_id: document.getElementById('secChannelId')?.value || null,
            category_id: document.getElementById('secCategoryId')?.value || null,
            auto_create_channel: document.getElementById('secAutoCreateChannel')?.checked || false,
            auto_permissions: document.getElementById('secAutoPermissions')?.checked || false,
            delete_previous_msg: document.getElementById('secDeletePreviousMsg')?.checked || false,
            btn_label: document.getElementById('secBtnLabel')?.value || 'Verify Me',
            btn_emoji: document.getElementById('secBtnEmoji')?.value || '🛡️',
            btn_style: document.getElementById('secBtnStyle')?.value || 'primary',
            embed_title: document.getElementById('secEmbedTitle')?.value || 'Verification Required',
            embed_desc: document.getElementById('secEmbedDesc')?.value || 'Click the button below to verify and access the server.',
            embed_color: document.getElementById('secEmbedColor')?.value || '#0099ff',
            embed_thumbnail: document.getElementById('secEmbedThumbnail')?.value || null,
            embed_footer: document.getElementById('secEmbedFooter')?.value || null,
            
            // Section 3
            verified_role_id: document.getElementById('secVerifiedRoleId')?.value || null,
            unverified_role_id: document.getElementById('secUnverifiedRoleId')?.value || null,
            failure_role_id: document.getElementById('secFailureRoleId')?.value || null,

            // Section 4
            rule_min_account_age_enabled: document.getElementById('secRuleMinAccountAgeEnabled')?.checked || false,
            rule_min_account_age_val: parseInt(document.getElementById('secRuleMinAccountAgeVal')?.value) || 3,
            rule_min_join_time_enabled: document.getElementById('secRuleMinJoinTimeEnabled')?.checked || false,
            rule_min_join_time_val: parseInt(document.getElementById('secRuleMinJoinTimeVal')?.value) || 10,
            rule_require_avatar_enabled: document.getElementById('secRuleRequireAvatarEnabled')?.checked || false,
            rule_captcha_enabled: document.getElementById('secRuleCaptchaEnabled')?.checked || false,
            rule_captcha_type: document.getElementById('secRuleCaptchaType')?.value || 'button',
            rule_anti_alt_enabled: document.getElementById('secRuleAntiAltEnabled')?.checked || false,
            rule_anti_alt_type: document.getElementById('secRuleAntiAltType')?.value || 'basic',
            rule_cooldown_enabled: document.getElementById('secRuleCooldownEnabled')?.checked || false,
            rule_cooldown_val: parseInt(document.getElementById('secRuleCooldownVal')?.value) || 10,
            rule_max_attempts_enabled: document.getElementById('secRuleMaxAttemptsEnabled')?.checked || false,
            rule_max_attempts_val: parseInt(document.getElementById('secRuleMaxAttemptsVal')?.value) || 3,
            rule_auto_kick_enabled: document.getElementById('secRuleAutoKickEnabled')?.checked || false,
            rule_auto_ban_enabled: document.getElementById('secRuleAutoBanEnabled')?.checked || false,
            rule_send_dm_enabled: document.getElementById('secRuleSendDmEnabled')?.checked || false,
            rule_welcome_message_enabled: document.getElementById('secRuleWelcomeMessageEnabled')?.checked || false,

            // Section 5
            action_success_remove_unverified: document.getElementById('secActionSuccessRemoveUnverified')?.checked || false,
            action_success_give_verified: document.getElementById('secActionSuccessGiveVerified')?.checked || false,
            action_success_send_dm: document.getElementById('secActionSuccessSendDm')?.checked || false,
            action_success_log: document.getElementById('secActionSuccessLog')?.checked || false,
            action_fail_retry: document.getElementById('secActionFailRetry')?.checked || false,
            action_fail_cooldown: parseInt(document.getElementById('secActionFailCooldown')?.value) || 60,
            action_fail_notify_staff: document.getElementById('secActionFailNotifyStaff')?.checked || false,
            action_fail_kick: document.getElementById('secActionFailKick')?.checked || false,
            action_fail_ban: document.getElementById('secActionFailBan')?.checked || false,

            // Section 6
            log_channel_id: document.getElementById('secLogChannelId')?.value || null,
            log_level: document.getElementById('secLogLevel')?.value || 'info',
            log_verbose: document.getElementById('secLogVerbose')?.checked || false
        };

        const res = await fetch(`/api/guilds/${activeGuildId}/security-verification/config`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        if (res.ok) {
            toast('Security Verification settings saved successfully!', 'success');
            await loadVerificationStats();
        } else {
            toast('Failed to save Security Verification settings.', 'error');
        }
    } catch (e) {
        console.error('Error saving Security Verification settings:', e);
        toast('Failed to save Security Verification settings.', 'error');
    } finally {
        if (btn) btn.disabled = false;
    }
}

async function loadVerificationStats() {
    if (!activeGuildId) return;
    try {
        const res = await fetch(`/api/guilds/${activeGuildId}/verification/stats`);
        if (!res.ok) return;
        const stats = await res.json();
        
        const elToday = document.getElementById('stat-ver-today');
        if (elToday) elToday.textContent = stats.verifiedToday || 0;

        const elFailed = document.getElementById('stat-ver-failed');
        if (elFailed) elFailed.textContent = stats.failedToday || 0;

        const elPending = document.getElementById('stat-ver-pending');
        if (elPending) elPending.textContent = stats.pendingMembers || 0;

        const elRate = document.getElementById('stat-ver-rate');
        if (elRate) elRate.textContent = `${stats.successRate || 100}%`;
        
        const elSpeed = document.getElementById('stat-ver-speed');
        if (elSpeed) {
            const speedSec = Math.round((stats.avgTimeMs || 0) / 1000);
            elSpeed.textContent = `${speedSec}s`;
        }
    } catch (e) {
        console.error('Error loading stats:', e);
    }
}

async function loadVerificationHistory() {
    if (!activeGuildId) return;
    try {
        const status = document.getElementById('verHistoryFilterStatus')?.value || 'all';
        const timeframe = document.getElementById('verHistoryFilterTime')?.value || 'all';
        const search = document.getElementById('verHistorySearch')?.value || '';
        
        const query = new URLSearchParams({ status, timeframe, search }).toString();
        const res = await fetch(`/api/guilds/${activeGuildId}/verification/history?${query}`);
        if (!res.ok) return;
        
        const logs = await res.json();
        verificationLogsCached = logs;
        
        const tbody = document.getElementById('verHistoryTableBody');
        if (!tbody) return;
        
        if (logs.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; color:var(--text-2); padding:32px;">No verification records found.</td></tr>`;
            return;
        }
        
        tbody.innerHTML = '';
        logs.forEach(log => {
            const tr = document.createElement('tr');
            
            // User Avatar + Name
            const userTd = document.createElement('td');
            userTd.style.display = 'flex';
            userTd.style.alignItems = 'center';
            userTd.style.gap = '8px';
            const avatarUrl = log.user_avatar 
                ? `https://cdn.discordapp.com/avatars/${log.user_id}/${log.user_avatar}.png`
                : 'https://cdn.discordapp.com/embed/avatars/0.png';
            userTd.innerHTML = `
                <img src="${avatarUrl}" style="width:24px; height:24px; border-radius:50%;" onerror="this.src='https://cdn.discordapp.com/embed/avatars/0.png'">
                <div>
                    <div style="font-weight:600; color:var(--text-1);">${escapeHtml(log.username)}</div>
                    <div style="font-size:10px; color:var(--text-3);">${log.user_id}</div>
                </div>
            `;
            tr.appendChild(userTd);
            
            // Timestamp
            const timeTd = document.createElement('td');
            timeTd.textContent = new Date(log.timestamp).toLocaleString();
            tr.appendChild(timeTd);
            
            // Method
            const methodTd = document.createElement('td');
            methodTd.innerHTML = log.method === 'security'
                ? `<span class="badge badge-info" style="background:rgba(0,245,255,0.1); color:var(--cyan); border:1px solid rgba(0,245,255,0.2);">Security</span>`
                : `<span class="badge badge-warning" style="background:rgba(255,165,0,0.1); color:#ffa500; border:1px solid rgba(255,165,0,0.2);">Staff</span>`;
            tr.appendChild(methodTd);
            
            // Status
            const statusTd = document.createElement('td');
            statusTd.innerHTML = log.status === 'passed'
                ? `<span class="badge badge-success" style="background:rgba(0,255,127,0.1); color:#00ff7f; border:1px solid rgba(0,255,127,0.2);">Passed</span>`
                : `<span class="badge badge-danger" style="background:rgba(255,0,127,0.1); color:#ff007f; border:1px solid rgba(255,0,127,0.2);">Failed</span>`;
            tr.appendChild(statusTd);
            
            // Checks Passed
            const passedTd = document.createElement('td');
            let passedArr = [];
            try { passedArr = JSON.parse(log.checks_passed) || []; } catch(e){}
            passedTd.innerHTML = passedArr.map(c => `<span style="font-size:10px; display:inline-block; margin:2px; padding:2px 6px; background:rgba(255,255,255,0.05); border-radius:4px; color:#00ff7f;">${c}</span>`).join('') || '-';
            tr.appendChild(passedTd);
            
            // Checks Failed
            const failedTd = document.createElement('td');
            let failedArr = [];
            try { failedArr = JSON.parse(log.checks_failed) || []; } catch(e){}
            failedTd.innerHTML = failedArr.map(c => `<span style="font-size:10px; display:inline-block; margin:2px; padding:2px 6px; background:rgba(255,0,0,0.1); border-radius:4px; color:#ff007f;">${c}</span>`).join('') || '-';
            tr.appendChild(failedTd);
            
            // Details / Reason
            const reasonTd = document.createElement('td');
            reasonTd.style.fontSize = '12px';
            reasonTd.style.color = log.status === 'failed' ? '#ff007f' : 'var(--text-2)';
            reasonTd.textContent = log.failure_reason || '-';
            tr.appendChild(reasonTd);
            
            tbody.appendChild(tr);
        });
    } catch (e) {
        console.error('Error loading history:', e);
    }
}

/**
 * Select a verification type card, update hidden input, toggle panels, optionally save.
 * Pass null or '' to reset to the unselected state.
 */
async function setVerificationType(value, save = true) {
    const hiddenInput = document.getElementById('verificationTypeSelect');
    if (hiddenInput) hiddenInput.value = value || '';

    const notice = document.getElementById('ver-no-selection-notice');
    const wrapper = document.getElementById('ver-panels-wrapper');

    // Update each card's visual state
    document.querySelectorAll('.ver-type-card').forEach(card => {
        const isActive = value && card.dataset.value === value;
        const badge = card.querySelector('.ver-type-badge');
        const btn = card.querySelector('.ver-type-btn');

        if (isActive) {
            const isSecure = value === 'security';
            card.style.borderColor = isSecure ? '#00b4d8' : '#5865F2';
            card.style.background = isSecure ? 'rgba(0,180,216,0.07)' : 'rgba(88,101,242,0.07)';
            card.style.boxShadow = isSecure
                ? '0 0 0 2px rgba(0,180,216,0.2), 0 8px 24px rgba(0,0,0,0.25)'
                : '0 0 0 2px rgba(88,101,242,0.2), 0 8px 24px rgba(0,0,0,0.25)';
            card.setAttribute('aria-checked', 'true');
            if (badge) badge.style.display = 'block';
            if (btn) btn.textContent = '✓ Selected';
        } else {
            card.style.borderColor = 'rgba(255,255,255,0.07)';
            card.style.background = 'rgba(255,255,255,0.02)';
            card.style.boxShadow = 'none';
            card.setAttribute('aria-checked', 'false');
            if (badge) badge.style.display = 'none';
            if (btn) btn.textContent = 'Select';
        }
    });

    // Show/hide notice and panels wrapper
    if (!value) {
        // No selection — show notice, hide panels
        if (notice) notice.style.display = 'flex';
        if (wrapper) {
            wrapper.style.opacity = '0';
            wrapper.style.transform = 'translateY(10px)';
            wrapper.style.display = 'none';
        }
        return;
    }

    // A type is selected — hide notice, reveal panels with animation
    if (notice) notice.style.display = 'none';
    if (wrapper) {
        wrapper.style.display = 'block';
        // Force reflow so transition fires
        void wrapper.offsetHeight;
        wrapper.style.opacity = '1';
        wrapper.style.transform = 'translateY(0)';
    }

    // Toggle which inner panel is visible
    toggleVerificationPanels(value);

    // Persist to API if requested
    if (save && activeGuildId) {
        await fetch(`/api/guilds/${activeGuildId}/verification/config`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ mode: value })
        }).catch(console.error);
    }
}

function wireVerificationCenter() {
    // Verification Type card clicks
    document.querySelectorAll('.ver-type-card').forEach(card => {
        card.addEventListener('click', () => setVerificationType(card.dataset.value, true));
        card.addEventListener('keydown', e => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setVerificationType(card.dataset.value, true);
            }
        });
    });

    // Preset level switching
    const levelRadios = document.querySelectorAll('input[name="secLevel"]');
    levelRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            updatePresetVisibility(radio.value);
        });
    });

    // Custom Rules toggles wrappers update
    ['secRuleMinAccountAgeEnabled', 'secRuleMinJoinTimeEnabled', 'secRuleCaptchaEnabled', 'secRuleAntiAltEnabled', 'secRuleCooldownEnabled', 'secRuleMaxAttemptsEnabled'].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('change', updateCustomRuleWrappers);
        }
    });

    // Live preview inputs for Security Mode
    ['secEmbedTitle', 'secEmbedDesc', 'secEmbedColor', 'secEmbedThumbnail', 'secEmbedFooter', 'secBtnLabel', 'secBtnEmoji', 'secBtnStyle'].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('input', updateSecurityVerificationPreview);
            el.addEventListener('change', updateSecurityVerificationPreview);
        }
    });

    // Send Embed message
    const btnSend = document.getElementById('btn-sec-post-message');
    if (btnSend) {
        btnSend.addEventListener('click', async () => {
            btnSend.disabled = true;
            try {
                const res = await fetch(`/api/guilds/${activeGuildId}/security-verification/post-embed`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' }
                });
                if (res.ok) {
                    toast('Verification message posted successfully!', 'success');
                } else {
                    const err = await res.json();
                    toast(err.error || 'Failed to post verification message.', 'error');
                }
            } catch (e) {
                toast('Error posting verification message.', 'error');
            } finally {
                btnSend.disabled = false;
            }
        });
    }

    // Save Button for Security Settings
    const saveBtn = document.getElementById('btn-save-security-verification');
    if (saveBtn) {
        saveBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            e.stopPropagation();
            await saveSecurityVerificationSettings();
        });
    }

    // History logs searching and filtering
    const btnSearch = document.getElementById('btn-ver-history-search');
    if (btnSearch) btnSearch.addEventListener('click', loadVerificationHistory);

    const filterStatus = document.getElementById('verHistoryFilterStatus');
    if (filterStatus) filterStatus.addEventListener('change', loadVerificationHistory);

    const filterTime = document.getElementById('verHistoryFilterTime');
    if (filterTime) filterTime.addEventListener('change', loadVerificationHistory);

    // Export JSON
    const btnExportJson = document.getElementById('btn-export-ver-json');
    if (btnExportJson) {
        btnExportJson.addEventListener('click', () => {
            if (!verificationLogsCached || verificationLogsCached.length === 0) {
                toast('No logs to export.', 'error');
                return;
            }
            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(verificationLogsCached, null, 2));
            const dlAnchorElem = document.createElement('a');
            dlAnchorElem.setAttribute("href", dataStr);
            dlAnchorElem.setAttribute("download", `verification_history_${activeGuildId}.json`);
            dlAnchorElem.click();
            toast('History exported as JSON.', 'success');
        });
    }

    // Export CSV
    const btnExportCsv = document.getElementById('btn-export-ver-csv');
    if (btnExportCsv) {
        btnExportCsv.addEventListener('click', () => {
            if (!verificationLogsCached || verificationLogsCached.length === 0) {
                toast('No logs to export.', 'error');
                return;
            }
            
            const headers = ['User ID', 'Username', 'Timestamp', 'Method', 'Status', 'Checks Passed', 'Checks Failed', 'Failure Reason'];
            const rows = verificationLogsCached.map(log => [
                log.user_id,
                log.username,
                new Date(log.timestamp).toISOString(),
                log.method,
                log.status,
                JSON.parse(log.checks_passed || '[]').join(';'),
                JSON.parse(log.checks_failed || '[]').join(';'),
                log.failure_reason || ''
            ]);
            
            let csvContent = "data:text/csv;charset=utf-8," 
                + [headers.join(','), ...rows.map(e => e.map(val => `"${val.replace(/"/g, '""')}"`).join(','))].join('\n');
                
            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", `verification_history_${activeGuildId}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            toast('History exported as CSV.', 'success');
        });
    }
}

// Expose globally so the main bundle's `call()` dispatcher can find them
window.updateLivePreview  = updateLivePreview;
window.updateApplyPreview = updateApplyPreview;

// Run wiring after DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        wireWelcomePreview();
        wireApplyPreview();
        wireVerificationCenter();
        initPresetGalleries();
    });
} else {
    wireWelcomePreview();
    wireApplyPreview();
    wireVerificationCenter();
    initPresetGalleries();
}
