const a0_0x201bc1 = a0_0x38ca;
(function(_0x10a782, _0x58fbfd) {
    const _0x55837d = a0_0x38ca,
        _0x4048c0 = _0x10a782();
    while (!![]) {
        try {
            const _0x556c4e = -parseInt("117814qUeXGU") / 0x1 * (-parseInt("14PbKwYK") / 0x2) + -parseInt("2959191ahfAJe") / 0x3 + parseInt("1044GAmnOx") / 0x4 * (parseInt("29905jeZKQM") / 0x5) + -parseInt("3888192WQpgOt") / 0x6 + -parseInt("1601341bLDdOq") / 0x7 + parseInt("13460776UHgBPo") / 0x8 + -parseInt("11648457cIveoa") / 0x9;
            if (_0x556c4e === _0x58fbfd) break;
            else _0x4048c0.push(_0x4048c0.shift());
        } catch (_0x16e4e1) {
            _0x4048c0.push(_0x4048c0.shift());
        }
    }
}(a0_0x293b, 0xde617));

function escapeHtml(_0x138c03) {
    const _0x3b4c75 = a0_0x38ca;
    if (_0x138c03 === null || _0x138c03 === undefined) return '';
    return String(_0x138c03).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#x27;");
}
const pathParts = window.location["pathname"].split('/').filter(Boolean);
let activeGuildId = null,
    initialTab = "overview";
if (pathParts[0x0] === "servers" && pathParts[0x1]) activeGuildId = pathParts[0x1], pathParts[0x2] && (initialTab = pathParts[0x2]);
else {
    activeGuildId = new URLSearchParams(window.location['search']).get("guild");
    const legacyTab = new URLSearchParams(window.location["search"]).get('tab');
    if (legacyTab) initialTab = legacyTab;
}
let guildChannels = [],
    guildRoles = [],
    economyShopItems = [],
    guildCustomCommands = [];
const loadedTabs = {};

function showToast(_0x1a7b00, _0xfc7b46 = "info") {
    const _0x54e78d = a0_0x201bc1,
        _0x504b05 = {};
    _0x504b05.success = "fa-circle-check", _0x504b05.error = "fa-circle-xmark", _0x504b05.warning = "fa-triangle-exclamation", _0x504b05.info = "fa-circle-info";
    const _0x15ee32 = _0x504b05,
        _0x477a33 = document.getElementById("toastWrap");
    if (!_0x477a33) return;
    const _0x149696 = document.createElement('div');
    _0x149696.className = "toast " + _0xfc7b46;
    const _0x3fbbc3 = document.createElement('i');
    _0x3fbbc3.className = "fa-solid " + (_0x15ee32[_0xfc7b46] || _0x15ee32.info), _0x149696.appendChild(_0x3fbbc3), _0x149696.appendChild(document.createTextNode('\x20' + String(_0x1a7b00))), _0x477a33.appendChild(_0x149696), setTimeout(() => {
        const _0x39994c = _0x54e78d;
        _0x149696.style["opacity"] = '0', _0x149696.style["transform"] = "translateX(20px)", setTimeout(() => _0x149696.remove(), 0x190);
    }, 0xed8);
}

function switchTab(_0x33ec37, _0x3a93a1 = !![]) {
    const _0x52c73f = a0_0x201bc1;
    document.querySelectorAll(".dash-tab").forEach(_0x2febf5 => _0x2febf5.classList["remove"]('active')), document.querySelectorAll('.sidebar-item').forEach(_0x2f59e5 => _0x2f59e5.classList["remove"]("active"));
    const _0x528b3d = document.getElementById("tab-" + _0x33ec37);
    if (_0x528b3d) _0x528b3d.classList['add']('active');
    const _0x565e8c = document.getElementById("nav-" + _0x33ec37);
    if (_0x565e8c) _0x565e8c.classList["add"]("active");
    _0x3a93a1 && activeGuildId && history.pushState(null, '', "/servers/" + activeGuildId + '/' + _0x33ec37);
    if (_0x528b3d) {
        _0x528b3d.querySelectorAll("select").forEach(_select => {
            if (typeof initCustomSelect === 'function') initCustomSelect(_select);
        });
    }
}
window.addEventListener("popstate", () => {
    const _0x1b3649 = a0_0x201bc1,
        _0xfe739c = window.location['pathname'].split('/').filter(Boolean);
    if (_0xfe739c[0x0] === 'servers' && _0xfe739c[0x1]) {
        activeGuildId = _0xfe739c[0x1];
        const _0x462822 = _0xfe739c[0x2] || "overview";
        switchTab(_0x462822, ![]);
    }
});
async function initDashboard() {
    const _0x32f658 = a0_0x201bc1;
    if (!activeGuildId) {
        window.location["href"] = "/servers";
        return;
    }
    try {
        const _0x2f0477 = await fetch("/auth/discord/user"),
            _0x19ae39 = await _0x2f0477.json();
        if (!_0x19ae39.authenticated) {
            window.location["href"] = '/';
            return;
        }
        const _0x13421a = _0x19ae39.user["avatar"],
            _0x19c159 = _0x13421a ? "https://cdn.discordapp.com/avatars/" + _0x19ae39.user['id'] + '/' + _0x13421a + '.png' : "https://cdn.discordapp.com/embed/avatars/0.png",
            _0x3e003c = document.getElementById("userAvatar"),
            _0x530ed6 = document.getElementById("username");
        if (_0x3e003c) _0x3e003c.src = _0x19c159;
        if (_0x530ed6) _0x530ed6.textContent = _0x19ae39.user['global_name'] || _0x19ae39.user["username"];
        if (_0x19ae39.isDeveloper) {
            const _0x4b1eed = document.getElementById("devPortalBtn");
            if (_0x4b1eed) _0x4b1eed.style["display"] = "inline-flex";
        }
        if (_0x19ae39.premium) {
            const _0x5a0bb2 = document.getElementById('premiumChip');
            if (_0x5a0bb2) _0x5a0bb2.style['display'] = "inline-flex";
        }
        const _0xde3188 = await fetch("/api/guilds/" + activeGuildId);
        if (!_0xde3188.ok) {
            showToast("Failed to load server details.", "error"), setTimeout(() => window.location["href"] = '/servers', 0x7d0);
            return;
        }
        const _0x178706 = await _0xde3188.json(),
            _0x51a4b7 = document.getElementById("guildName");
        if (_0x51a4b7) _0x51a4b7.textContent = _0x178706.guildName || "Server Dashboard";
        guildChannels = _0x178706.channels || [], guildRoles = _0x178706.roles || [], populateSelectors();
        const _0x4c01e3 = document.getElementById('premiumActiveCard'),
            _0x5e54e9 = document.getElementById("premiumInactiveCard");
        if (_0x4c01e3 && _0x5e54e9) {
            if (_0x178706.isPremium) {
                _0x4c01e3.style["display"] = "block", _0x5e54e9.style["display"] = 'none';
                const _0x4b58e7 = document.getElementById('premiumExpiryText');
                if (_0x4b58e7) {
                    if (_0x178706.premiumExpiresAt) {
                        const _0x25385 = {};
                        _0x25385.year = "numeric", _0x25385.month = "long", _0x25385.day = 'numeric';
                        const _0x52ef80 = new Date(_0x178706.premiumExpiresAt).toLocaleDateString(undefined, _0x25385);
                        _0x4b58e7.innerHTML = "Next renewal: <strong style=\"color:var(--text)\">" + _0x52ef80 + "</strong>";
                    } else _0x4b58e7.innerHTML = "<strong style=\"color:var(--text)\">Lifetime License Active</strong> · Granted by Developer";
                }
            } else _0x4c01e3.style["display"] = "none", _0x5e54e9.style["display"] = "block";
        }
        loadWelcomeTab(_0x178706.configs?.welcome), loadAutoModTab(_0x178706.configs?.automod, _0x178706.configs?.antilink, _0x178706.configs?.guildSettings), loadEconomyTab(_0x178706.configs?.economy), loadAllModules(_0x178706.configs), switchTab(initialTab, ![]), fetchAnalytics(), fetchApiKeys(), fetchAuditLogs();
    } catch (_0x2f59d4) {
        console.error("Dashboard Init Error:", _0x2f59d4), showToast('Error\x20loading\x20dashboard\x20configuration.', "error");
    }
}

function populateSelectors() {
    const _0x57bde6 = a0_0x201bc1,
        _0x348f5a = guildChannels.filter(_0x182c13 => [0x0, 0x5].includes(_0x182c13.type)),
        _0x3ef974 = guildChannels.filter(_0x78dea9 => _0x78dea9.type === 0x2),
        _0x42eb5f = guildChannels.filter(_0x47ab3c => _0x47ab3c.type === 0x4),
        _0x1be3c1 = guildRoles;

    const channelsHtml = _0x348f5a.map(_ch => `<option value="${escapeHtml(_ch.id)}">#${escapeHtml(_ch.name)}</option>`).join('');
    const voiceChannelsHtml = _0x3ef974.map(_ch => `<option value="${escapeHtml(_ch.id)}">🔊 ${escapeHtml(_ch.name)}</option>`).join('');
    const categoriesHtml = _0x42eb5f.map(_cat => `<option value="${escapeHtml(_cat.id)}">📁 ${escapeHtml(_cat.name)}</option>`).join('');
    const rolesHtml = _0x1be3c1.map(_role => `<option value="${escapeHtml(_role.id)}">@${escapeHtml(_role.name)}</option>`).join('');

    const _0x557bdf = ["welcomeChannel", "leaveChannel", "giveawayChannel", 'amLogChannel', "warnLogsChannel", "muteMuteLogsChannel", "jailLogsChannel", 'verLogsChannel', 'applyChannel', "applyStaffChannel", "applyLogChannel", 'antibotLogChannel', 'antiwebhookLogChannel', "roomLogChannel", "logChan_welcome", "logChan_leave", "logChan_nickname", "logChan_role-given", 'logChan_role-remove', "logChan_role-update", "logChan_ban", "logChan_messages", "logChan_channels", 'logChan_unban', "logChan_kick", "logChan_timeout", 'logChan_role-create', "logChan_role-delete", "logChan_emojis", "logChan_invites", "logChan_voice-join", "logChan_voice-leave", 'logChan_voice-move', "logChan_voice-mute", "logChan_voice-deafen", "logChan_voice-disconnect", 'secChannelId', 'secLogChannelId'];
    _0x557bdf.forEach(_0x901caa => {
        const _0x5b785d = document.getElementById(_0x901caa);
        if (_0x5b785d) {
            _0x5b785d.innerHTML = '<option value="">Select a channel…</option>' + channelsHtml;
        }
    });

    const _0x436a86 = ['roomJoinChannel'];
    _0x436a86.forEach(_0x299b53 => {
        const _0xe525d2 = document.getElementById(_0x299b53);
        if (_0xe525d2) {
            _0xe525d2.innerHTML = '<option value="">Select voice channel…</option>' + voiceChannelsHtml;
        }
    });

    const _0x58981a = ['roomCategory', 'secCategoryId'];
    _0x58981a.forEach(_0x5c9495 => {
        const _0x1e351f = document.getElementById(_0x5c9495);
        if (_0x1e351f) {
            _0x1e351f.innerHTML = '<option value="">Select category…</option>' + categoriesHtml;
        }
    });

    const _0x1fbc41 = ['shopItemRole', "warnFirst", "warnSecond", "warnLast", "warnWarnerRole", "muteMuteRole", "jailJailedRole", "jailJailerRole", "verVerificatorRole", "verUnverifiedRole", 'verVerifiedRole', "verVerifiedFemaleRole", "applyStaffRole", "applyRoleStaff", "applyRoleDesigner", "applyRoleEvent", "applyRolePartnership", "autoroleRoles", "guildOwnerRoles", 'roomStaffRole', "roomManagerRole", 'secVerifiedRoleId', 'secUnverifiedRoleId', 'secFailureRoleId'];
    _0x1fbc41.forEach(_0x763c67 => {
        const _0x36778b = document.getElementById(_0x763c67);
        if (_0x36778b) {
            if (_0x36778b.multiple) {
                _0x36778b.innerHTML = rolesHtml;
            } else {
                _0x36778b.innerHTML = '<option value="">Select a role…</option>' + rolesHtml;
            }
        }
    });

    const _0x24ccaf = document.getElementById("antilinkWlChannels");
    if (_0x24ccaf) _0x24ccaf.innerHTML = channelsHtml;

    const _0x535b04 = document.getElementById("antilinkWlRoles");
    if (_0x535b04) _0x535b04.innerHTML = rolesHtml;

    const _0xfe5e49 = document.getElementById("amLinksWlRoles");
    if (_0xfe5e49) _0xfe5e49.innerHTML = rolesHtml;

    initAllCustomSelects();
}

function loadAllModules(_0x49826b) {
    const _0x2bdd90 = a0_0x201bc1;
    if (!_0x49826b) return;
    if (_0x49826b.warn) loadWarnTab(_0x49826b.warn);
    if (_0x49826b.jail) loadJailTab(_0x49826b.jail);
    if (_0x49826b.mute) loadMuteTab(_0x49826b.mute);
    if (_0x49826b.verification) loadVerificationTab(_0x49826b.verification);
    if (_0x49826b.antilink) loadAntiLinkTab(_0x49826b.antilink);
    loadApplyTab(_0x49826b.apply || {});
    if (_0x49826b.autorole) loadAutoRoleTab(_0x49826b.autorole);
    if (_0x49826b.logs) loadLogsTab(_0x49826b.logs);
    if (_0x49826b.rooms) loadRoomsTab(_0x49826b.rooms);
    if (_0x49826b.antibot) loadAntiBotTab(_0x49826b.antibot);
    if (_0x49826b.antiwebhook) loadAntiWebhookTab(_0x49826b.antiwebhook);
    if (_0x49826b.guildSettings) loadGuildSettingsTab(_0x49826b.guildSettings);
    loadCommandsTab(_0x49826b.commands || []);
}

function setVal(_0x13c2ee, _0x435b4b) {
    const _0x38bbf0 = a0_0x201bc1,
        _0x59f1c4 = document.getElementById(_0x13c2ee);
    if (!_0x59f1c4 || _0x435b4b == null) return;
    _0x59f1c4.type === "checkbox" ? _0x59f1c4.checked = !!_0x435b4b : (_0x59f1c4.value = _0x435b4b || '', _0x59f1c4.tagName === "SELECT" && document.getElementById("wrap-" + _0x13c2ee) && syncCustomSelect(_0x13c2ee));
}

function setMulti(_0x560cbe, _0x8cbb35) {
    const _0x22fb76 = a0_0x201bc1,
        _0x268138 = document.getElementById(_0x560cbe);
    if (!_0x268138) return;
    let _0x5ee28d = [];
    try {
        _0x5ee28d = JSON.parse(_0x8cbb35 || '[]');
    } catch {}
    Array.from(_0x268138.options).forEach(_0x12bdcb => {
        const _0x235a9c = _0x22fb76;
        _0x12bdcb.selected = _0x5ee28d.includes(_0x12bdcb.value);
    }), document.getElementById("wrap-" + _0x560cbe) && syncCustomSelect(_0x560cbe);
}

function setMultiComma(_0x238130, _0xa2c82c) {
    const _0xe66bfa = a0_0x201bc1,
        _0x5e534a = document.getElementById(_0x238130);
    if (!_0x5e534a) return;
    const _0x42ba4e = (_0xa2c82c || '').split(',').filter(Boolean);
    Array.from(_0x5e534a.options).forEach(_0x304d8e => {
        const _0x1996cc = _0xe66bfa;
        _0x304d8e.selected = _0x42ba4e.includes(_0x304d8e.value);
    }), document.getElementById('wrap-' + _0x238130) && syncCustomSelect(_0x238130);
}

function loadWarnTab(_0x1e916e) {
    const _0x4e11f7 = a0_0x201bc1;
    setVal("warnFirst", _0x1e916e.warn_first || ''), setVal("warnSecond", _0x1e916e.warn_second || ''), setVal("warnLast", _0x1e916e.warn_last || ''), setVal("warnWarnerRole", _0x1e916e.warner_role || ''), setVal('warnLogsChannel', _0x1e916e.warning_logs || '');
}

function a0_0x293b() {
    const _0x1011b8 = ['hCo/WQvtDmoooSoZW699', 'W5a4W4pcKsFcQq', 'pmoLW5VdSHilcSkoW5mZBNVcVfOtWRS', 'WONcHmkdFqCr', 'DSkAWRFdTIPeeCoRW4JdLYRcKW', 'W6ZdVKRcQGeEW6NdKCoym8ocWQxdGW', 'WP0fW4aBW67dPZFcGmk3lSoFWP7cR1e6WP3dSSk5a2tcM8kKcSosW6nb', 'WQCWW4JcUueeW6VcJIpdJSo9W55e', 'zCkfWQVdV35YcCoUW4FdJsO', 'bSkfWRpdUGhcH8kXWQFdUG', 'A3rnW6KUxCkCW45sW5nKWRzBWPVdGwVdHYPOWQ3dKmk1omkgWOldO8koCSoOhH/dOZngCa', 'tHv6W6ZdUWhdQ8kOc8ofW416W79TW48ICmoRACo1uXldH8k+', 'W6q9W7pcOhH/W67cIttcH8kJW69KzG', 'mtddSmoNWPb/zG', 'vbv0W4ZdTK3dOCkshmomW4f3', 'W4u8W54', 'bmoTWPrtDSoWlmo2W751W5q', 'WRLNW7LaomoDea', 'W4K9F8k9qCoZWPpcHNW', 'qX55', 'xXHTWPbPWRuaWONcOWqvW7RdJ8oWW7HItgZcOmouWPNdHmobWOHkW5zExvHDaKxdGwtdGCoQW5KdWQFdTmoGW5ijbftcNCkvW4K0cJNdP8k0x8oUWPTaW7NdSJtdV8ojWO5WWPm6b8kXrSoqbmkBWPtcJLZdVSo3yHVdGCkts8kOW4S', 'y8kKW5j/W64qpvz5WQG5', 'zCkbWQFcGmohhWtcOf8', 'zCoBzWy', 'W7VcKSkrW4G', 'WQGAWPHjW6C', 'WPFcQWNdJ3mnFCoKW54', 'bKmLf2ddO8kwWRdcIH/cH0udWPXsWOtdQrNcM15c', 'AMBdTSoAW4JdTd3dLq', 'B8oYWPldJ8kmEqhcSSofWQ4', 'W4eJyCk9xCoFWOtcO1LqWQW', 'WQxdUfBcIHSjW6VdMSkBlSoJWRpdPbK', 'af9/WO5MWR5sW7a', 'W4RcM8oQxg9wtmoyWPldU8o+W5ZdRCkK', 'ubvYW4ldNW/dOSk0fColW4P3W78S', 'WRBdVfdcQbiy', 'nmkhWQGff8oUWOddKCk5pIC', 'W6ZcHSkfW6pcGmogcG', 'W5RcJmo/As4', 'WQTVW7PjpG', 'E33dSCoB', 'W79YWQq5sWldOgi0xsviq8oC', 'yNVdG8obW5BdVcO', 'p03cV0xcRmo4lujCW4RcTCoFamoV', 'W4CFW4un', 'mIxdQSoPWOT5', 'CNvCW6SKnmowWO1uW5r+W7Dn', 'WPJcK8kgBq8nW4K', 'l8kUpSkXyWhdVCokWPquW6O', 'WQOIWO5HW5ipxSkSW7pcOSkD', 'W6K3Er0UtCoeyxm', 'W4RcI8o3DwC', 'WQqQW4lcPgefW6pcQH3dNCo3W4LiW67cSSkiW6FcR0q', 'WOVcNCkmBW8eW50', 'bmoXtSoC', 'm8kqWR0qiCoKWRBdICki', 'W5iiW4ebW7JdPY4', 'eSogW7u', 'jmkHWQhcMcy6o8omBmkzaeG6meu', 'dxhdMSkdWPJcU8omqeW', 'rJ9Rq30pz8kgW4S', 'zNjlW7yV', 'zmkEWR7dTJy', 'WOVcN8oZAtG', 'W6BcHCkpW4JcK8oJo8kOWOa', 'hMhcJmofFa', 'WQhcLmoisCoBW7NcVSoZAbCY', 'aw7cJSovA8o5pSoMW7C', 'WP4YW57cIJJcO8k6fCobwmkGE07dUgW', 'W5KMFCosWOFcMCo0fmk4WQtdUWhdVq', 'WQ1TW7TfpSoxbG', 'zCoCWOZdTtTtFmkNzCozj8k8W6K', 'tSo1WPRdMmojnr7cOSkrWRiSrJD8W55FWP7dUSowgdSFvSkMpt0UrmoiW6BdGmkBWP/cTbXwtexdVSo2xM9nW5ZdRSk0gCoa', 'W6i2W7pcJhHZW63cHW3cN8kIW75mBmket8kBeG', 'W49LaCohlq', 'wNal', 'nmkKWRtcHIyLmCohsSksfuKMfexdSW', 'nSk0WQpcGJOejW', 'WOb4wmoijmkWWOu/pg84WR92WPpdI8oLvSkIg2OatSoUW6FdM8kSB8kpWP3dGmoTW7tcHhNcS0lcQwBcL8kIWRldIJDcaa', 'sSkaW6ZcPeFcNxBcH8oH', 'pSkWW4TSWQahcKD8WQfGiCkrW4zwWOmoncVdGSknxcKBWRhcH1fpWOijz8oTw8oDWQPBWQ7dLmkfW6LSxCkcvwKhhtK2gmoovW1QW652FCoKeSkOD8k0W7mXs8onsCoEW5PIzLNcOSkhrq3dGSkyW4iqrYLBlSkZWO/dHMfRb0ZcSCkZvSkFWOhdPJtdSJSkFfDqW6ldPCoghCodW4O', 'u8oeWQ7dRXlcOCoBW6dcLSoIW6zJiuznA3bhpYZdG8kbW4qpWPjYW5FcRv0CW4yhWQhcNmoaW6tdM8kSkCkwW6WPpCkBW74zdJX6WQnDi8kOW4RcVSkNwSkPWPtcJY1Zt8oYWQnGW7NdOSoYW6hcKCkagtBdIsldQG/cL0Wjdmkodmk0WQOOW51Skr0NBWBcHspcHmoCt3/dK8kGi8krBwi1DmoGfCkrxbCJWOfUw8oHkSotwIGj', 'jCkqWR0iaSoOWRC', 'WQFdNSk+osmtaCkDW5ZcR8kCWOxcHmo8W43dRSombCk8z8o1h35BWRNdHCk5W4tcRIDPWRxdG0vtcmomEvFcKSk5nJD/fCoTW5NdV3bUCSo9FSkdlCkwcXuqg8o8oJO+WRn0WQtcHaC', 'WR83WOz5W6GWuCk2W7pcOmkTwXFcUKCfhGBcQchcVW', 'W4ZcHmkpW5NcHmofg8oiWPHgiSoG', 'b8o4WOnAFW', 'W692W4eTWQbuqCknW7pcLmkUAW', 'W7u3W67cHNe3W6/cItVcHCke', 'WQddHvpcG8kpWQrI', 'WOFcSZZdIwKnyCoIW4ddTCk2W7K', 'W7VcMCkiW4a', 'ffKOeNi', 'WOpdS1BcPLOGW6/dKCkEESosWQ/dMqKZWRldRSoUW4hdK8o3W7xdU8owW6q', 'ggZcGCotFmozbCohW59IkW', 'WQ1QW7bapmoveq', 'WQFdN1xcQCkdWQHU', 'WO9jW4yCW6JdPZtdISoKz8kCWP7cOHXvW5hcT8o6v2NdImoHs8kaWQajW5qRaCo8rrhcUhKNASoyASkr8kElI08', 'nSkwWRKnfCoU', 'W7T/WRessqldOxq', 'W6ZdVLFcVamdW6VcKSkyl8onWR7dHa4/WRddRmo+WPxcJCoIW6ldUCkFWRFdNCoWWO3dRxK', 'yNqgW73dM8knua', 'W7LNWQazsqpdJM8Zrqm', 'BMxdRCozW43dRG', 'hSoBW7FcPeddJJBdHSkYzSkKW6/dP8kXW6DuW5lcP8kvW5JdU8oEWRtdTIhdVwtcPgWWWQBcLvHFbwldKmoIjYXgWO/dQmk7WRFdO8oHvSkqW6NcSJfjW59zWQpcUmkKWPNdVmozWO4jWQ9GW6pdQetdMLldTqapW4pdNCknW6ZcM8k4jmkytSolWQryW7D1WRLfsLaxW5mSyYWzW4nommonWQjVWPyyW5bFWOjBlbL6nWxcQCkAxZzZWRdcRJC4W7hcThJcQSoqdZXtrwdcMr4mW64plH1fAmo7FLmgi3znW7OpkYiAigOwWQRcKSoLW7fnWPSDkwbFCWFcLrCXW53cO8kaiHGGW5tdH8oTwvBdJbJdSCkSl2xcIXdcO8oHWP3dG29OySksELhdHwODW7ldNSk6W6NcRmk8W4rGWRW', 'omkoWRK', 'W6VcJSksW47cK8och8krWQvqpa', 'W7y8zre6BmoZtuVcGSoqW54', 'WRhdGKlcGCklWR5RgSkYWRBcSmoFWQ7dNmoSWQ8', 'ChrlW7aZaa', 'Dmk1W45VW6u', 'umkpWQNdVYfMfCkQW5xdNdVcI1z3bd/cStmCWP/dI8oMWQm', 'jCo/W4xcNCofzLJdSSknW6qHdq', 'cSkJWRBcLteFlSood8kxfeH0nKBdSSkSWR5lACkiwcCSn8kqdmo+iq', 'stXTC2yGAmk0W5NdOZxdQSkkWOiI', 'xNdcMmkqkmkdgSot', 'W7JcJSknW47cJSogcSkGWQjEmmoPW4qQ', 'FwNdRSogW4e', 'W7DHWRuouq7dQha', 'yCkvWRBcJCoKbqu', 'zx4yW5RdNmkBudlcTNJcIxmXAXW', 'b8oRvmoCcSozWO9tWQLBsZ4', 'DCkfWQhcQ8oTeXVcTKuVW7qDWPVcSG', 'FXFdSYrj', 'pelcPq', 'omk/iSkOFW', 'kSk/WRlcNd4ym8oo', 'eeJcVSomjrWJW4ir', 'WOhcNmkmBbqRW7RdHbS', 'esnYed9XDSkt', 'C8kqWQxcGSo4jbNcV04lW5CwWQBcUmkCWPbiW4mIWR0', 'dxldLCkwWOlcKSoE', 'WPH0E8obWPBcNCofhCk5W6G', 'bSo7qCopiSoZWPztWOHhrJZcMa', 'EHpdSZrpWR/dVKldOmo6vdxcVCkazW', 'AHRdVIjFWOxdUKVdIG', 'WPyTW5y', 'WQhdSupcVaqGW6/dJmkb', 'E8kpWQNdVsDV', 'W4mXW4FcMt/cHCkGumoAsG', 'zmkFWQtdUtz0cG', 'BSogWPhdSW', 'nSkHWR3cNtWt', 'lcxdTmoIWP5YCa', 'WRxcUX7dIMiwmSoMW4ldT8k/W6tdNa06WQ3cIemXWQWa', 'W5/cM8oUDwjqra', 'W5v/dSocpmk0WOutzcm/WRW3WOxdGa', 'W6a0W6BcLMDuW6lcGt8', 'hwNdICkzWOxcKSoes1a', 'WOjwWOfCW53dItFdG8kviW', 'wJezWRqSWPbJ', 'cJj6wseMC8kcW4ldOIRcPG', 'l8o7W5/dRaGWbSkMW44', 'W6aTW7tcKxT3W5dcItBcLSkcW6jKBmkdxG', 'WRHNW6D2oCogefxdSmkuF8opWOJdTmkeWPKw', 'yCklWQVdRZy', 'WQhcMCoBwCoB', 'kdhcTSkkW4BdVgC', 'WPhcKCoUBwPCt8kDWORdRSoqW5ddGCo9WPS', 'qCkiWQJdRaFcOmkiW4FdM8k3WQO3AbuijZueAYhcJmorWPbgW4fV', 'aL8Jewu', 'Bg3dTSo2W4JdUd7dM8kkzYhdQSkVha', 'WOFcVrJdLwGk', 'WRC3W4VcVguE', 'W4W1DmogWPy', 'W7T4WR4AtGddVG', 'W4KGASoAWP3cM8oyhSkK', 'WOtcNCkbAbikW4hdPW', 'W7ZcN8kyW4hcHa', 'nSkBWRKnd8oIWRZdMW', 'i8orW6ldLSkWqGFcHK4dW7eX', 'iCkWWQxcKq', 'WRy0W4JcQMm', 'W5mJCmk1BmoEWQNcQLjqWQ3cMG', 'WQ0pWO1qW6C', 'WQPNW6vcjCoegeldT8kgzq', 'd1H5WQnGWRPqW5ZdRKfgWQNcJSk3WR0X', 'bfjQWQvKWR5tW6BdRvb3WQpcPSk0', 'ymkcWQ7dRJzRemo5W5ldPIZcL153dsNdVtm', 'W4yYpmk7wSojWQtcP1urWQVcLN4pW4a', 'zM3dSCoaW4xdUJBdJq', 'omkgWPVdSJPynG', 'lmk/WR/cKs0+amoMyW', 'ssqzWR0JWPDfWRRdKmkpxG', 'WPuQW4ldQxeFW7VdGWddICoMW5GbW6hcUmk+WQBcQKhdVmoSWOldKvVdQSo9acCdW5ddLCkMp13cTmk7WPPeamkkW4yDswNdHSo2W49m', 'WOdIGBeXWOThW5RcOCkTeh3cUmkoDWxdImoszSk0W7NcLCoU', 'xY7cJ8ogW5VdGSkAg3ZdPCokWQCaFG', 'udm3gCoVk14', 'W4ZcK8osCg1yuSoQWPddNCotW4NdGCkZ', 'sIn+wweVDq', 'WQ8bWObwW7BcR3BdOMK', 'E8koWQxcM8o1', 'wHFdQtqmWQ3dUK/dG8oVrhi', 'CSoiWPtdQdS', 'W4mMySkSxmowWPtcRLXzWQVcILicW4ldHW', 'W7NdGf/dJmotW7L2jW', 'gmoJWPLxBSogn8oX', 'WR8hWPjvW67cMx0', 'W5m6DSowWOhcTmoLnCkr', 'emoaW7hcKvlcL3e', 'W4DJW5FdTYz3xmkUWODbW7y', 'WRWlWPvGW67cNwNdPNFdQ8knlZRdMq', 'W50XBmo2WP/cMCoChCkZWR3dNbBdGgi', 'h8oYW4ZdQr4m', 'W6BcMmomW4dcLmohg8kmWRXtnW', 't2NdSCoBW4BdSJldJmkamYRdVCkpdmknECo5smoLW4nL', 'W6pcHmkgW67cICokaCk6WQLspCoVW4G9', 'WRGUWPPHW7qs', 'W6DGWP/dStLjWRZcTcldJmoZW7jv', 'h8oCW4lcPKhcLwa', 'WQq4WR8muW7dOMLK', 'pZddTmoRWPf1vJxdNSk7mG', 'g3tcMCoCFa', 'FHpdSZjdWQBdVNNdISoKqt7cVSklCa', 'WRWhWPDaW6pcJ2xdULRdT8kUob3dMmk5', 'fCoHWQPdDmogk8o3W6D8W5/cVa', 'nSkfWR0bdCoVWPhdMmk+nsy', 'p0RdL8ognGy0W5ulW4DgC8oBudq', 'WRDKWRuouqldV3q', 'W549BG', 'W5j4g8oajSkWWPSP', 'W5y2W6NcHhL/W6C', 'W4DUW5tdOMvWhCk5WOWfWRJdLsaBcexIGRS', 'jmkbWRqibG', 'W5iiW4ebW7JdPY7dOCk1pmoWWOlcP0WXWPtdUW', 'oe/cRLq', 'BSoAEGeQW5FdIGDrrSoiyJC2vJet', 'W4hcHSohlxldHq', 'W4e9zCkXuCouWRpcJL5DWQRcKN4i', 'FCo0WOJdNmkiia/cR8o0WR0Mxte', 'WRa5W5pcQhSvW7O', 'vmkfWQNdRJzPdCkNW7ldGd/cMG', 'WR0cWOrD', 'W4NcM8oYFhDw', 'wSkfWQK', 'oKRcVq', 'W7DJW53dPg1Hwq', 'W6zUW5xdQhbH', 'WRldHf7cGmkh', 'W7XNWOrWW7WprSk9W7ldOG', 'p2jlWQC', 'W4edW4ueW7VdQZ8', 'BSkPW74', 'W4OYEmk0ECoAWQ7cP1voWPRcKxCj', 'W4KHE8oqWPBcJ8oc', 'W6dcOWe', 'W685W6xcGhG', 'tSoFW7VdTaldHMNcKq', 'y2iqW7C', 'WPhdUfdcUriEWQBdU8kukCojWQJdGHWOWRG', 'zSkfWQ3cMSocgrJcP041W4i', 'pmoeDG', 'y8kKW5j2W7K4evLtWQW8BCkCW4Xw', 'rIfVuxOKq8khW4VdQZZdP8kr', 'W4P0cSoclSk4WPmOxIS7WRm6WOZdGCowtCkPv2K', 'AM5xW7WVl8oNWQX9', 'qIGGe8oOn1K', 'W5C1Aa', 'AmoiWPRdUdi', 'W4asW4WeW78', 'WRClWObtW6FcRghdU20', 'vsfJu2S', 'EGldPJ1j', 'dxldJSkEWP8', 'W73cJSkrW4hcMmo0g8kaWQfppSoKW5uR', 'fmkAWQmqbSoLWQBcNCkdidiI', 'ffGYhxldTCkh', 'l8kUpSkXyXpdVCokWP8DW4WvW5/cH8o+', 'BmkRW43dRXOqwq', 'a8kRoSk4oJddPCoxWO4uW7vCW5JcISoTbCo/WQC', 'A8oYWPtdGCkLoWVcHmozWQOTxsaW', 'rSkpWR7cI8oVvGtcTL00W50bWRBdUa', 'W5uhWPGlW7pdUJNdGCk/DSoAWOtcOe0', 'DSkjWRpdSZXP', 'W4ZcJSoUFg1xySovWPxdO8oy', 'l8oLW5VdVG8BiSkNW44UyMFcRq', 'A8kgWR0fdCkRWRhdNmk2kJf6hCkKWQeJWOFdUmoWW7dcUmk/pCkFv8oea8o9ldmjWP/dUrzbt0HKyCkSWQlcLmomutLVgayAW7fygSonaSkfjmogW5JcK0rGdCklW4NcNdnPpCotW4LMWP/dVYeUW5nzW4FdV8kfwmkSWOefymk8CKJcMKvBWQxcScDNwNdcRtZcM8kQimojpmo4WPJdSKpdVbJdIGPRWRRdGt/cJ8ogaSk5gaFcNsqxFSoxyNlcIK0mW4bikCkVe1HjtM3cHGDxW5PIy8opW4VcL8occrTV', 'lCk7imkPFZe', 'CSk1W4z+W6KAgq', 'W77cSLhcUWudW6JdMmol', 'cNtdImkaWOFcLmou', 'W5u4W4lcNt7cOCkX', 'rr9PW6RdVWxdQmkse8oEW6zGW5mK', 'W5OiW5SnW6JdGa7dOmkw', 'wWiLgINcJmouW7JdHvddJcLmW5SXW4ZcQfFdLrSoB8oaaSoiWRG', 'W4m/CmkRqmo3WQ7cUeq', 'W6GRCH4', 'W60TW6RcGgzZW6a', 'amkDWQWqq8oMWRpdM8kYkMiMh8k1WRuKWOpdUmkHWQpcRCk+kmotuCkwtmoYod4lWOZdSLLrv0KWECo6', 'sIrKvxWEDmkeW4ldOWBdOmkb', 'WRuOW5FcRgyuW43cIXRdKmoW', 'u8oeWRldRWFcPSkkWOtcIa', 'vJzMvw01y8kp', 'qxZdI8kzW4tcKSoyrexdICoEW4O', 'W48OW5RcMXZcUCkGumoLvSkGAW', 'W7iuW5biW6pdPY/cJCk5nmoEWOZcQvaRWPddTCk2eMNcN8kUgColW6LhWPmRvSk1evNcUd1In8oiySogddCCW6O', 'oCk7iSk+Ds7dUq', 'y8kvWRdcNmo4jrpcV044W4ilWQdcL8kvWO4', 'luBcP0NcRCoJpgn9W5VcO8oAcSoLW5G', 'oeZcUwNcR8o0mq', 'CMqmW7ZdHSkhhGxcVMxdN3yGAbSdoIaXWOVcKZify1xdUSoU', 'FSkfWRVcICo1hG', 'gCkkWRhdQHy', 'dCoPWPTe', 'W5VcG8ku', 'W4C2zCkDx8oEWQRcRL5iWORcH1ii', 'W4dcKCoWBwS', 'FCkfWQ7dTa', 'aSoTWPzdFW', 'WR8QWRP8W78lqW', 'eeBcS1JdRSoLpgLxW5ZcTSoFx8kRWPFdNSk5h8ohW4hcOK9YCCo3DYVdMCoEsItcVtGHW6NdQt7dKmk/ormcWQTeW6LDW5xcUa', 'uZXJu2TSBmkeW4FdQa', 'jSoAW7pcRHrgfmoKW6NdGq', 'W5NcHSoxl3S', 'bKtcHComoHSW', 'ohJdICkzWO3cNmootf3dHmocWOTWyJ7dN8ojtw5qWOVdJSklDSkVWQy', 'hYi9dmkQk1NcL8oVW7JcUCk6WQSYDv/dLIScveKQh1ddS8opmCoCW4TiW7ldGSkSjvS1dCofnCkkWQ8FzSk1W77cMvyJDhdcVeJcN8kPW7ldS2/cJ8oIaI7dS8orWQzcdGipf8kWW4POWRunW43dJCk5WOJcPumdvmk0WPRdLSkNWORcOXBdRWiTvSoSxCoTttpcJmoCWR3cO1yxDmkJpSo4y8knW5HQB8oJW6ZdN8omW5pcNCkKWRni', 'wWiIdNBdQmokW6tdIGtcIdDMW5SXW4ZcQfFdLrSoB8oCvSkmWQyvzCkTwxiHAW', 'BSk9W4XXW7mRg1bXWQyXzSkw', 'W7BcLCoqk2pdLdrugSklW6FcJCo0W6aMWRSbyqhcHSo9zhhdGsi', 'lmk/WRFcMW', 'vIDZxgS', 'W7RcLSo/BsnysmotWPJcR8otW4pcHmkLW4/dUCkCE8oVz8kIucSxW73dHCoGWOVdUYCLW7ZcIabpcmohzWpcJSk6i2y', 'CgvvW7W+e8owWOu', 'C8omWPtdVJfqBCkAy8oajW', 'WPVcL8koBauxW4VdRrJcNCk2CZq3fG', 'f8oFW7pcSv3cKfRcGCk2B8kK', 'WOhcHSkhzdK', 'W5K8ECoDWP3cMCoDcW', 'WOpcNCoRANDCtmkqWPhdUSoqW5hdJCkZW5ZdSmkxBmoOASk6tYOsW7BcI8oQW4NdOM46W6e', 'o3xcJG', 'DCoYWPZdS8kkpa3cQCoFWQ4V', 'W51HcmoojSk1WRuKAce6', 'W7NcISknW5JcHa', 'W7mXEaGvCCo1qxVcJSomW5m', 'WR8RWP9YW78Prmk9W7VcVW', 'WQe2W5hcRhOzW6JcIHBdMmolW49oW7tcSG', 'ftyS', 'fvzYWPvT', 'yg9uW7q8cCox', 'ySogWORdMd9Eya', 'WR4RW4JcPW', 'W683W6dcPNX7W63cSYZcNmkiW7vil8kgt8kwfYe', 'b8o4WPvgsSoDn8oVW6T+W5dcVhvEwG', 'd2xcLmo1DCoub8ooW5vZg1anAq', 'zhvqW7u5nCoCWO1uW4q', 'cxxcLmoFDmoEdG', 'C8kqWQxcGSo4nr7cSKu1W5mi', 'hHvTW5VdUG/dQ8oxc8olW4HSW799WOK', 'smoOWP7dN8kDpqpcQCkr', 'geVcLmoojHeYW5q', 'WQ1WW7bci8ovmeVdVmkFC8oeWPG', 'sSoCW7FcPLZcMN7dICkSD8k5W6RdO8kIWQfEW47cQmkvW5JcPCojWQxdTcFcVIZcPcyPWQBdIbSciwBdK8oPjZyeW5VdU8ofW6FcTCkWd8oqWRJcOuCtWPOfW6FdQmkHWO7cTSkcW41sW7G1W6NdUColW4KHWRDrumkeWOJdKCo4W47dTtBdS0ldKmkGu8o9k8kSwq', 'dcCKe8kLp1JcH8oVW7NdT8k3', 'WRiDWQbxW7dcMx0', 'l8k6kG', 'WPHQeSktW5pdNmkrwmo9W6NcVK/cQsBdOarxq8kOWQyIjK/dHgD0WPjAy8kLE1CsmSkZW57cNmkUsfHEW43cK8kkBNxcSwzSW69iW6bKW751kSkFvmoXW7/dV8oFFbRdQvpcMSk5WP89WO1zWRhcTCoFDSoTzSoFW4OGWQ/cSYavhmoKW7BcSNBdOSkTBmoldCkTwurUW5vwkCkCq8oR', 'm8kqWR0qk8oUWRpdLmkYkW4MxCkJWQWy', 'een/WOzUWOrmW6ZdR0e', 'W5ujW4CTW7VdQZi', 'iCoYW4RdTXqA', 'drTTW4BcVaFdSmkEeCooW5C2', 'oJxdTSoVWOT4EJm', 'WP3cGCkhEW', 'W5NcKCosDNrwu8o+WP3dVmoz', 'W6zKW5tdOLLTwq', 'oSk7nSkP', 'W7vLW4ZdRMPTu8kZWRvjWOxdIJGxfa', 'WRaXW5tcUwqrW7C', 'zw9lW5W8bmoB', 'WRSOW4lcPW', 'y8kfWOVdTsrIc8ojW4FdIIO', 'WQHKW4JdS29Ru8o4WPreWRVdKdfprq', 'kSk3pCkTDIldPq', 'WRlcL8oCrmok', 'W6D7W5NdQq', 'W7u5W6VcKhe', 'svxcJW', 'b1jOWRbNWQLkW6ldR2zbWRq', 'EmkwWQikbCoIWRxcN8k0nI8QxSkOWQq0', 'ANJdSSowW4RdUrddLSknFWC', 'oINdT8o+WPnWBa', 'g8oAW7FcSwZcMhBcJSkSxmkJW67dP8oXW61yW40', 'bei/cNBdR8kAWQS', 'lCoNW47dSWiHbmkJW4OTAwZcTxy7WQS', 'B2mqW7q', 'dmkdWRJdVbJcQSkb', 'cuW8gW', 'W6m2EHu9A8o0xW', 'DSomWOJdSt9EBq', 'W6WUW6lcL2jZW6BcMW', 'afdcKSoqkIyYW4ShW5rgDCog', 'nSkfWR0igSoBWRpdNSkYnryUs8kQWQu', 'WQ86Eby6Bmo3a1JcGSojW5vNW7NdOCkb', 'ubvXW4RcVGtdOmkBgmoEW4e', 'i8k+WQpcMxirjSoewSkb', 'W7q9W6VcHNT3W6BcUd/cI8kv', 'BSoztaKSW6/dKtLAuG', 'rdSoWPSLWPjOWO3dM8kcva', 'amokW7hcGLBcHNdcJ8k2ymkHW7ldQCoTW5fsW43cOq', 'fudcHmobirWNW5mlW5HC', 'W5bUW4VdPhrTx8k9W4jCWRJdKczsa07dRJPKWP7dOSkGyx5LWQiSketdOIhcK8orWPb+xmk2uSofxdLAgCkZW7y', 'rXr5W5ZdHaNdSCkF', 'W47cKSo/ANb/smooWOG', 'W7T4WQusuW', 'dmkeWQJdSqC', 'g8koWQxdQW', 'ASoPWONdHCkhmWxcOCoi', 'W5P+fSoFg8k4WOWP', 'W7r4WR4B', 'W5eXyq', 'W6NcH8keW5u', 'W488W5y', 'W5alW5eMW7VdPt8', 'cmoQtSkzjCoyWPuBWPDBqdtcImoOx8ovC2a+DxO', 'jSk9WRdcHYW6pCoywW', 'yYfJ', 'kSk7pCk+AcRdRmoqWPmEW7y', 'WQWOWPPWWRWsvCk1W7NcUSkm', 'DwfvW6W4', 'tYKZoCoIoupcSCoTW7tdP8oZWQy8Dfu', 'W67cM8krW4hcMmoVcSkvWQ1njSoOW4qGW6DS', 'fvjSWRzTWQLxW6xdQKfrWPZcISk9WRKUcr7dR8kyW5W', 'WPaOW5zNW7qtrCk0W6lcV8ojwaVcRfSi', 'kmkSiCkW', 'W6jUW4RdKwn2vmk+WOTaWRpdTZSEaG', 'EhZdO8ohW7ddTdddLCkbzXa', 'W6m1FHS3', 'W7L5WReqxHpdPgqPAG9qEmom', 'W4PWfmoElq', 'WQhcImkuW57cLCoeaSoiWQfkpSoXW4G9W7zZWOFdNCo4WRJdP1ybFCoAj8ouCCoLW5vwW74', 'FapcQfxdS8k1', 'W4muW5aEW7pdRs3dUCk/i8oh', 'l8oIW4ZdRbqm', 'B8o8WPFdMCkm', 'c8kcWQS', 'ESoXWPRdN8kAgG3cQSou', 'W4rQW4RdS2HHt8kRWOPmWQC', 'AmorEI0KW53dKY5qvCojCX88', 'W5hcJSogoNVdKg0', 'qrD4WOLKWRCdWQhdTLzzW7ldJmkZWRaJhJJdH8kgW5JcGmoiWOPfW4H0xuqouGtcJ2tcGSk6W4GFWRJcSmkUW5GseGdcGSkxWO03cYBcRSo/', 'W4ejW5OfW4NdVdVdI8k8cCoCWOBcOW', 'WPRcK8kmBqKo', 'nCkJWRtcGJyti8oPtSkFd0mM', 'eKNcLSoridS2W4Oh', 'iCkuWQerbG', 'FgiAW6VdTCkmxXNcVMq', 'W7v7W4JdQ29NxmkSWOTkWRNcIJ4bceu', 'pSkcpLL7WOZcJYLYzCoVrsC', 'jSkWWQxcLZC', 'CSk9iCk5F2pdR8oqWOmDW71bWONcICo6a8oWW6fXWOXVrCkte2xdG0O6lh7dTJaHW4hdKCkOW7GQW4WScehcHfddTZSup8oPW5/cRNHIdCkjt8kgBSk4W5ZcKMJcUCoHW7unWOtdHmownmoJW47cNmo8mSkdWR0Kx0WoWPGrBCkeemk5WQBcI20pW5fbCW1oW5RdS8o2W4RdVHhdH2yBo2SdWP9AfNCUWPz0qSoPWRzoWROaW5FcMtKgW4mOjq', 'DgflW7CkbSobWO9uW4vyW7DtWPC', 'W4P+eCoilCo8WPSJDYG', 'W6D/W4hdQ2m', 'AN0EW6RdH8k0xWdcUG', 'W5BcImoBlh7dLMC', 'WPZcL8kAFq', 'W68PCHy', 'W5e1W4hcJHJcUmkXwmoZxmk/Bq', 'W7nUW4ZdGMPHumk9WOXrWPxdNb0w', 'yCkfWQ7dUtyQhCoJW5xdMIdcKvf8adG', 'W67cM8krW4JcJ8oplmknWQvtnG', 'AhuB', 'nmkzWQWxemofWRpdNCkY', 'fCodW6RcT1G', 'W5ZcI8o7A3PGrmorWPNdRmoiW4RdLSkbW5xdSa', 'euW9c3i', 'lCkSk8k8BIBdMCoiWP8CW70sW58', 'pCk7iSk4EtFdUCoa', 'WRi3W5xcJgKtW6y', 'ymkfWQxcGSoGfrm', 'bseGqq', 'E8koWRBcGSo0eHpcOa', 'e0KPWPNcO1FcSSobkmoIW4nBW4OV', 'WRldGeVcHCkw', 'EMeEW7C', 'WPdcVWddIwi', 'smkJWOLcAmoanSo4WRq5WOVdQcbswZNdQmojd1jUrCoNeblcN0xdQYz2zYrPWQNdKwufW4ZdQ8orW7ddQZ9ZWRRcUCkNWORdR0nSWPPOk1NcRdldMSo9DSkaW4zvW5P1ndCNW70TWOpcMItcR0nrBSo3W4JdVmosW7vTWQpcJf46v8o8bemYW6hcJK7dGx9RW43cMmkxW6vqW5eQuSkqWR3dO3JdP3pdICkpWPhcRmoXWPrUEmojyCkkWRZdQJtcNmoFWO3cVmoK', 'W7e9W6RcIMj/', 'f8oFW7pcUeRcShZcMCk+CCk0W6VdO8oXW7Do', 'WPu1AmoAW5ZcM8oeeCkXWQ3dRua', 'W4dcI8oYBwPdtCoy', 'BwFdRmohW7FdTcNdMW', 'rmkVWOVdNXbt', 'WQdcVWxdKgiamSo+W4lcSmk7W7/dLWTUWRVdIvy7WQvmz8kDWPKE', 'g0tcNSoohXOWW5qHW59tDmoAw3y', 'vZ8KhW', 'WQLJW6u', 'eSogW7dcPf/cLwa', 'mSkWWQpcMGafmCoiqmkFbq', 'l8oMumoCnCofWP5yWPHrbZBcNmoYhSoqBMb0jNTWWPZdJCokW6FdR8kof8ownSkOWQJcPw1OW7BdK8kLvW', 'WQldGKlcJCkwWQ5fmmkKWRlcVmovWR/dMSomWRD6dSomWOtdOCoomGW', 'W6KQsb0YzmoYqfRcJW', 'pSk/oSk1DcldSCob', 'WPyOWOe1W7upemkHW7NcUCojwa3cT1fmhH3cTsVcV8kzW7uGxwpcHupcJmo1W4ZcUunrtq', 'WR1NW7Lgnmoeeem', 'f0OT', 'W6vPWPhdVtbeWRVdLbddTCoIW5HoW7K', 'WR83WOz5W6GYx8k0W7pcImkmtq3cVLSjha', 'u8obWPNdQx5uE8oUF8oxjSkRWQ1+xSorWOm1eglcP8kNvmk/WO9geCo0W5ddM8oqyaqwlCkqvmkTq8oQwmocdgnK', 'ahZdLSkv', 'kmkYk8kLxIRdRSobWPKfW7etW4u', 'bSkyWOldUH3cRSkhWOBdK8kM', 'uIfRqcm', 'W5BcISorhM7dGxe', 'tW9XW5VdUHddQCks', 'usm5fCo8pq', 'z8klWRxdRJ1Ic8o5W47dKd8', 'WR83WOzWW78eC8kWW7/cOmkn', 'uZjMrwS', 'ymoeAWy', 'aCokW6/cT1ZcMxZcQSk3ySkUW6JdO8oZ', 'AMqmW63dM8kxeWdcQNRcI3m2AWngltX5W5/cGtae', 'fCo8WOPAy8oRpCoVW6TRW4xcPxLFqc4', 'neZcOKi', 'EmkpWRZcGa', 'nt4qW6NdGmktuqpdOq', 'cxxcLmoFA8oEbSoo', 'W5RcL8oqja', 'uvhcNSopnGz3eeldU1nPW4aeoG', 'WOVcMSkhAG0gW4O', 'WQVdG0JcGG', 'pu/cQL/cVCozogPx', 'WRLJW6Dng8orbLm', 'WOxcK8ks', 'WO7cGmknza', 'ymoaWO4', 'dmoXuSouASolWOLzWO5e', 'W6hcISkmW4G', 'rMpcLCodBCoEb8kgW5zYnv0TFSoKW5ahrZ3dM8ocWO4FWQ9mWPZdSmkskq', 'b0tcM8oxnG', 'W4eTW67cIxa6W7dcIsJcHCkeW6qnCmkprSkwfs3cUCkDWOiUW4tcT1K', 'WRCPWPHWW6mOzmkvW5O', 'jmk1WRxcSsKtoSoFy8kyeLiXo0ZdRq', 'iSkXkCkECIldSSo7WOWEW7eFW47dHSo/bCo6W6bMWO0', 'WP4UW57cNZ/dRmk3wCowsSk/mWNcQcTezCk4DhVcPI1sW7vFD37dKLRdTd7dOmoHj8kmWPZdGmoM', 'p8oJW5/dQZyBcSkPW44XDa', 'Fg3dRSoqW4VdSdBdVCkmCG3dVCkdfa', 'WOHTiCkdW4BcLSouiSkwWPJdKW', 'pSk2WPW', 'rWHVW4ddOq', 'tN7dP8oDW5dcVrVdKCkxzWBdOq', 'WQJdQfhcUX4kW7/dVmkAnmovWQ/dGWK', 'fd0eWR9TWOb0WRhcHmobuSohW4S8oCk+W5RdVHZdJcVdG8kfpfKaWRvKsmo0W6S0C8oEW4BdMCksWRfXCSk4uKNdGa', 'fLdcNSoonZS2W4Oh', 'W4NcM8oUBubsu8ozWQm', 'ASoTWPRdJ8kmEq7cOSofWRWMvIS', 'yh8tW7ddMSkFeWVcS3pcHW', 'W5e4W4lcMZlcUmkXuCo+v8kOA1m', 'W4pcHSozp3i', 'a0RcMmopebqJW4ifW5HayW', 'WQZcT8kUtdiM', 'y8kvWRdcNCo1hXNcVvG', 'zgvnW5WXaSoEWOrFW4niW6f2WPy', 'WPX8DCkXrCkfW43dQXaCW6JdNJTmWOVcKZldVCk2W5VcVCk5oxKsEtvfWOhcMGWKWP7cP8ovWQHngehdRx5ce8kcF8kXk8obBHJcTWqDwSkCDCk3d8o8Cbndeh4JWO3cSHOQWRlcPmkQW7BdKq', 'WOFcRHZdMwKauCoIW4tdVmk8', 'pCouW5hdSq8FdSkLW44Xwa', 'rcmGp8oMpudcI8oTW6NdHSoHWOe5', 'WOCDW6VcJeSK', 'wsemWQO0WQbJWR7dNmkatSoCW40', 'cxJdJ8k1WOFcKmoaseFdMCoVWPWzDq', 'zbT0W4pdTGtcPCkdeSkkW4H2W7SKWOS4zSo6Cmo+t1FdGmkVoCk3tvBdSrC', 'AHRdVIjFWOFdSLxdMW', 'tYbLxG', 'mYxdT8o9WP52Cc7dU8k4mr7cKxS', 'W71LW47dRNjHtG', 'qtOhWR0/WRTsWP/dTq', 'aev7WOf8WR57W6/dPKLqWRtcMW', 'zxaDW7ZdMa', 'W7v7W4JdQ39xsCk5WOrdWPtdJtuCcu7dSq', 'FMmEW6NcMq', 'WOFcRHZdKh4GD8o6W4ZdOSkSW6ddLWrUWQ0', 'WOb+cmoFiCk+WPHSDYWYWQS+W53cHSkRaCkvxMaeamoQWQVdJ8o/p8oEW43cIUkcOSo2WOTxWQDsW6byWOZdUq', 'x8ogAX4HW5FdIZGErmoZEJmQuterW69EjbbSWPtdRmoYWQ18WRlcM3H7WP08W44jxCojW6/dMwBcJSo1WQi', 'WRKTW5pcRa', 'EmoTWOVdGmkqba3cQCouWQChvJy/W4ftWPRdPSoqeYy', 'W5mxW5tcSq', 'l8oIW43dQXqtsSkMW54VC2dcQKW+WQRcPCkwWPqaeHtdVsBdNL0', 'hmo7W5VdVGGBr8kUW4u3yNVdUuHYWQtcO8kBWPKigGxdQcBcKq', 'W4ChW5iMW7VdPt8', 'cLGLg1RdS8kaWR3cQr/cI3OVWPnWWOldPHlcMq', 'fmooW63cULBcHKBcNmkTBW', 'WOv0WOZdGg3cPCo0vSoBwmk/FrBdPYHlpmkIDhNdRxCYW4znp3JdJLRdQJpdVSoWAmotWPtcKmoKW6ldRLHzW7CVW7TdD8oMBSkrWPKxdCkMWOhdJmoTW5vtW5BcNCkXW4vZWQq', 'psJdOCoTWPrZEIu', 'BwfuW7W', 'wJSgWRuaWPjOWRpdNSkgsmoHW5aGlW', 'pZddTmoIWOzvCc3dLSkLiHtcKxf/xW', 'p3njW7GZr8oqWO1qW4r5WQuDWPddK2ZdJZ0SWQ7dGCkHCCkaW4ddP8opDCoXxvxdKJnqouyEWONdMHVdJJBcS1a', 'uqP8W4e', 'E8koWRVcI8oZpIlcNMC', 'sYymWRK5WPzdWR7dNmkox8oDW4S', 'EdGmWRK+WPyMWRtdKmkpvSktW4SKl8kKWPBcVHldHstcG8kfDuqcWRDZdmo0W7uGFCopW4ZdH8onWRTYBSk3fq', 'g2xcJmovESofd8op', 'W5SKAmoFWORcR8ofgCk7WQ/dJaddPwm', 'bSoXr8oMjmoeWPPyWPvrsW', 'W6P4WR8rBqJdPgKzqqzFzmoDW4i', 'lvFcSKdcQW', 'fCoIWO5FDSognSo0W511W6pcP3burW', 'kmkVWOVdLa', 'kSk3oa', 'd8kRoSkYoHhdS8oiWP9rW6SzW5/cN8oYdSo8W7uJWPb7xCkswIC', 'euGJkhldTmkDWR7cJbpcJx0dWOLdWOpdPbi', 'WRWYWOjHW74o', 'WQdcJComwmohW4lcTmoZAre0vY4', 'WPlcUXtdIa', 'tJPPwW', 'uYCWhSoJnKO', 'mmkqWRKHd8oUWR/dLCk5lqa+DSkI', 'WPW8yCkSwSouWQNdQ0zDWQtcI35rWOK', 'W6K3EXeYymk9sLpcJSoh', 'WRlcKmomsCovW7tcTq', 'WQPNW6zajCozbvpdSmkDEa', 'bCoBW6lcOgFcNxRcGSk6D8kZ', 'a8oWq8ovmSoiWP5f', 'W5m8zq45DW', 'ACoviXW6W5hdNYvztCoUjZmGwZGEW6fACbbTW5O', 'W6NcMCkoW4a', 'W5q1DCow', 'AGpdRcvdWQBcTKVdMSoMvdxcOCklEe/dKmkOW7ZcRexdMrldLmkN', 'W5SKAmoFWORcUmoucmk8WRVdQGldRgJcTfC', 'bCoFW6/cVvdcKq', 'p0/cOKVcOmoElwjFW5G', 'W5lcGSobd3VdLhLhhCkmW5dcLCorW7C', 'gCk7iSk+Ds7dUCkeW5XrW5qzW4RcNCo+qmoOW6n3WPDZrCkqtsBdN0CJoYddTW', 'W79+WQyzrHddRh4nqaLFB8okW50', 'eSoTW5DvC8oDo8oZW680W4NcPx1dxW', 'f8obW7FcVv/cNxFcGG', 'WPZcK8kfrWCoW4S', 'aeGLo3VdO8kzWR3cIWtcRNaLWP8', 'WROdWRjvW6pcLq', 'W7DNW5NdThvkxmk1WOC', 'e8oPWO5ZDSoknCo6W6rTW7pcSvvv', 'k8oYW4RdMHCBcSkUW4u3rxdcKe0', 'AhW9W7JdKmkTur/cU2u', 'afzQWOnG', 'xJufWQ0O', 'cCo/vmoAlW', 'ur9XW4RdSbtcQa', 'WQVdRN3cQHKnW6tdK8kqpG', 'amkBWRZdVbRcU8kC', 'cw3cRmoFFSoYaSokW5vPpeu', 'pfFcPqZcRmoJnYPbW47cTmoCc8oVW4RdN8k0tCokW5VcQ0jYAa', 'emooWQ7cP1ZcMhdcJCo/zCkHWQVdPCo3W6zlW5pcQ8kuWOFdU8oqWRpdQc/dSgNcTtuJWR3cJXrvdMddMW', 'F8oYWONdQCkinWq', 'W6pdGCkCe8kpWQJdOmo+zbqbCJK', 'W5ZcICoBl2xdUubVpW', 'chtdL8keWO7cHW', 'WPhdV3tcUa', 'ANn4W6SVbSok', 'kIxdVmo6WRX+EYNdKSk5iG', 'WPhcISoSjZ9hrCkDWP/dOmoqW5BdLmkHW5FcOCoqo8k+z8kMsYCxW7ZdMmk7WPddQ389WRJcGGKgg8ogFqJcHmkNiZWTtCoIW5FdOgWHASoPFSkvySoEbGmub8oVCIv+W6zIWQRdGL3dHmo+p8oQFSo+grrKWPJdTJFdI8oPWQnsW47dLbWssw/dIY4RW4nbA3H0W4ZdRmo8W7FcSmk7pSkyB8k9oCkVo8oHW4JcVhqYEu8GW5u', 'W59Kc8oFj8k8W5SHDceQWRCOWOxdImoSxmkYfNWnaSo9W67dHSkWiCovW4tcNq', 'sIG6h8o4ehNcO8op', 'kCk+WRBcHW', 'W7ZcNSkcW47cHmoyha', 'EgddRCodW6JdTcddIG', 'W7TLWRuDuWldIgS/rajFFG', 'hmkoWRhdUHdcUW', 'WQa9W5/cVuSFW6dcLXBdKSoG', 'ghZdL8kfWO4', 'CCkvWQBcMSoUg1VcVL43W4inWQhcS8kvWODyW59MWR1Wh8kMzSolgmkgc8oHvG', 'W6jQW5tdSMm', 'gSoTWPDt', 'cCoSrCoym8ojWQ9tWOnaAttcMCo5', 'qdqXg8o+pwJcGSoMW7ddOCo2WRW', 'omklWRldVJPZfCoLW4hdIG', 'jCoYWOVdMmkaoWldP8ohWQOVrIbHWPe', 'W5eMDmkQsSoOWQlcP1vFWRZcKwK', 'WRBcNCoDB8osW7tcVmo6yGycqrxcGq', 'WPbKWPFdJMtcPSkXB8o8Amkb', 'pelcR3pcUCo4k2nbW7tcSSoDbmoPW4FdImkP', 'lLhcRKRcP8oV', 'yw9lW704fCoHWObvW55/W6S', 'WROEWPfaW6ZcNeFdQ3ddS8kR', 'zSkXW5j7W7iae1T+WRaUqmkDW4DoWO0vydJdKq', 'WOhcGCkJEXqcW5C', 'W4L/gSokjG', 'W6bHW6bqi8oFgaRdTmkhESoEWOxdLCkoWPKwbeJcTYZdVITHlCoy', 'bKtcHComoHSWW5qRW4rbB8orwG', 'a8oWtSoCnCoKWQ97WRC', 'f05UWOu', 'wCooW7BcOfVdM33cGmkSymkVW7tdOSkWW7zoW4tcTG', 'W5dcLCohjwu', 'p8kRk8kVyXddUCoiWP8sW6WtW5K', 'W4XKc8odg8kLWPC4za', 'WPr0jmoaWOpcNCoFwmk0WQ3cO03dRwpcSfa/bSoPW6jNDcpcHsuXW545', 'jSoKW5hdSq', 'kmkXpmkyEYddTa', 'CSomWORdIZTpyCkOB8oDn8kFW6HYsCoCWO8lhMZcQW', 'A8oDFrGKW5NdHW', 'BmobFrWNW5xcKYzltCo/yYu9vdeCW7GwDbvJW5FdUSo/WRbMWRpcJcO', 'W6m8EqW5DW', 'l8o7W5FdVba', 'WQpdNeJcJ8kj', 'afG4eNpdICkdWRBcGalcVMyaWP5I', 'WRtdUfdcMriEW6/dMCkCp8ofWOZdIba7WRddRmopWO7dJmoZ', 'BmogAWK8W53dUYDBtmoUzci', 'W4qdW5KlW7xdPt/dSSk4pmoSWOpcQ0m4WPq', 'FmkpWRVcIW', 'WROEWPfjW7VcQ3ddON/dUCkDor/dMa', 'afdcKSoqkIyYW4ShW5rgDCogF3zU', 'W6vQW5FcSq', 'DSkAWRFdTIPvfSoMW4pdVdNcMLfT', 'W4qhW4CgW4NdRtNdGSk0pW', 'lttdVCoIWPO', 'Fq/dRZq', 'WOVcH8krFqKoW63dPJRcGmkJDd8Qj8kgW4xdQa', 'kchdQmo7WPO', 'pSkBWQmbeCodWOBdVCkB', 'W608Eq0', 'W541Bmow', 'p8oJW4FdSX4', 'vCkXW455W68zgX5RWReUzSkaW5qAWPGtlIBdKmkAbNjtWRFcNWG', 'W5aoW5qgW73dRq', 'W7v7W5hdJgn9CCk5WObaWRS', 'W7fMW5FdRw8', 'yIddGmkqoCkrsSklWPSNEqLKlCkHWPXcgdRcHSouWPjaWOWhWP/dPCkumXHjW6xdIvTuWOaWASoyWORdVCkYWQDfvNeObXxdN8o8WQRdScWJB1OtWP/dTMxcU8kfWRpcIdtcQq0njmkyAZjcWOBdH8kRtXBdHbNdNSoUWRdcUCkkA8oICt7cOvHwh1zPW7xcPZnrWOyKW6y3CJfas3upd8kyF8oMccBdM1ddNZOTW75jB8kcW48AW6FcMsfTWPSygmkigCk3DmogugNcS8oZW7fEWQVcNaCdlCkMWPXeW6ZcLCoYWRLqW6NdIG', 'W71LW5BdONrmACkvWQ4', 'W4VcKSo7yq', 'BSo4WPFdJ8kgoqNcGSoFWQOHxYa4', 'W554WOFdQsHqWQ7dG1pcNmk0WP0bWQtcU8kQW6tcUeZcSSo7W47dHeFcUCkKrY0jW5BdNCkRj1tcV8kTW5ycw8k/W4Oav23cG8kWW4GhBCk/W5hcRSoplLddJmoSWRmXWOChuhpdO3tcHYBcLmkPn8kpW7FcQmkvWOP5WQBcHfjTWO/cLbZcI3zoWOxcGCkoi8knWRuImNGvW6FdRapdMgZcV0BcUGJcNc0RWQ7dVmoghfZcLeVcK8o3CIVcVCovW6KZxaDaW5ZdOZrFbSo9pSoTrCoEBWvAeCozWPpdJW', 'dmkhWRZdRadcGCkeWOFdKW', 'c3xcK8oeDSoCr8ogW45Rlua3AmoTW5KbugtcKSohWPmoWRSnWOtdRG', 'W4K9FCkXxCoEW6RcRvXzWRa', 'axpcSmocFmoCa8oEW5y', 'WOKVWO81W7upemkHW7NcUCojsqxcT0fmgH3dOstcVSkeW7jHxJBcHWlcISoKW4pcSq4', 'cCo2qCoxkCojWPDf', 'zCkXW5zFW6Wre1T+WRaFESk7W40', 'W73cN0JcNmkwWQjPmCo0', 'C2flW6O4', 'W4mZW5RcLYBcQCk2xCoyvSkN', 'it55', 'j8oYW4C', 'C8kpWRFdRHfOhCoZW7K', 'WQBdLvpcQCkoWQ5RoSkKWRlcM8ouWOldIW', 'p8oJW5/dQZKscmkOW4aW', 'iKdcM8ohmaf3W4GsW4nBDCoAtEkaVa', 'ymomWOJdQxnEACk8ySkvo8k8W6X7tCoc', 'WONcGSkszr8WW5RdQdhcI8kqDtC8', 'k8k+WR/cKq', 'W5rNW5y1WRfaemo4WRBdRmojhKtdPueEuhJdOw7dSConWRXHewpdLqldNSkHWOldVbectSkmzvNdLx0TWO7cVhRcQalcGG/cNq8vW5KIWPRcJmkAW7FdHcddL0CtqSkFWQ0LWRjxqHKoWRldNCo1qqlcGSoxW7OmWPqVW7C', 'y8k3W5zZW7yr', 'cSkBaSkytGy', 'W5iwW4ueW6pdMJxdGCk/cmohWOVcOeq', 'W4pcGSohi3hdMhDdb8krW73cGSohW79PW7Ps', 'vHvrW4ddSahdQCkslSoEW5zWW7qN', 'W7aTW6xcKwz/W6y', 'f8oFW7pcUeRcPhJcH8k6B8keW6pdTCo8W7fuW5hcSmktW4xdSq', 'WPlcL8ohxSoBW7/cPCkYwaSWxq', 'jSkx8ygwL34', 'W4CxW4RcPNT0W7FcIttcH8kTW7LmzSkptG', 'c0iYh2pdR8kBWRy', 'jSo2W5FdSZeFdSkNW44NvwBcTuW', 'amkBWRJdSq', 'nmkqWQmqbSo5', 'EMugW7xdKq', 'WOXZnSk9xSouWQ3cOHCqW6JcINmfW5JcNwtcVmo6WO7dUmkWo3S3pxWtWP/cSaWKWP4', 'W4FcGSoyjwhdLa', 'WQxcISoirmonW73cSmoRAsPOcMZcLxaf', 'vdq1cSkN', 'W5q8W4lcIZq', 'qh7dJSkdWP/cMSoaafRdImobWOaZzwRdMSoCrhyv', 'W6pcHmkcW4ZcLCocamkl', 'WOZcK8kwBa', 'W7S5W5FcOgmvW7FcKfW', 'tJSBWP0SWPbU', 'W5q1BSkE', 'yCk4W4nPW7m6h1n1', 'dSkjW5JcVx4DkmoUjSken8k8W6TSfSk6W4P5usddRSoRhCoRW5zgv8k7WP7cL8oryridnSk5qCoSqSo1wmocddaYqh1uWP/cJsGOa8oMsH1lcw4Ok8kNDCo5W7OXW6WXtmo/ECkuW50HW61xW6rtb8oHWQTycNJdLZuizCkQWPtcN8okWR9qW4ScgtTorWOBWP54WRT7CN3cNwHYmNpcQ8kBvuOdoY9YvXRcR8kwiwBdUWBdTxZdUmo4Dgz7hWuMEqOqWOdcHSohW4HubJNdQKyJFKK0W6GkWRrQusj6d0Xuph/dQtJcGHinWQS4v3BdRh9UyrOVcmohWRubW4flEmoFy1BcTmkPW6/cTCoKW5bixgjNW6HmhCk/W7DHW7ZcHhfPcv1yW6JcR8k3WRhdSwHYuSkNW7uWW7BdNtBcPmkDAmkjW4zIW63cTSoxfCoopSo/zmozEZn2WO9abSoqWRJcJSkrWRH0DCkHlrmSsCkzt8o+DSoHudtcPmoqjXHmkLpdT0xcUCoNW5JdNxFdNCk+WRmKW5JcLI7cU8kIg8ogW4ldQgNcRJRdGSkPW63dNae', 'W7JcISktW4m', 'WRdcJCoDrComW77cVCo6xH0Sxs8', 'WRWZWPG1W7muxSo1W7RcO8kourhcRq', 'cmo0WOi6WQbuxH4WW6r9i8osWPvwWO0EAZhcG8kCggvfWRBdNWTDW4bji8o7uCotWQzkW6/cHCosW5DSf8ose20sqYmNqmo0gWfJWRS+F8k/e8kODCo+WPXJumkDcmkAWP4Rkb7cUmkvvuhdK8onWPbBFwypi8kSWOhcNI1SqLpcOmo/e8koWOZdSYldPszrF0WmWRpdP8obg8oBWOddQJdcK8opW6JcT0ddVSoyWO7dTai', 'WORcVX/dIfGryCoVW4K', 'i8kRoSk4vZBdQmobWQGEW7qz', 'E8kfWQddHtbVgmoKW4JdNcpcOfz9', 'nSkLWR7cHa8eo8oBtSkwafi9oKC', 'ESoXWPRdN8kAgaxcTmof', 'd1jWWOD8WRm', 'zw9lW7rWbmoCWO9fW4vLW7q', 'zCkHW4T2W6qhg0PKWQ0Zzmkb', 'W7aSW77cIxe', 'vIzPu2SYDq', 'WQ3dI8koW4pcImofh8kqWRGcCmoWW5eQW7jRWOFdUSoPW6xdVhauEmoalmkp', 'vb9VW4BdTqNdPSkwcCofW5zgW6GVW4CU', 'BmoByGC6', 'W7H4WOdcRw0dW63cKrRdJmoGW5roW7BdSmoNWQBcQuJdU8oRWOZdK1xcPSoSagjeWPRcUSkMAXxdVCoOWPOarq', 'WR7dN8kXW4/cQSoCnSkU', 'BCobEHWNW5BdJq', 'WQxdMve', 'z2fa', 'CCkdWQVdRJz1', 'jmkzWQWxcW', 'BNRdSmoCW5y', 'eenSWOLMWRXxW6xdUG', 'WQBdUfhcRaufW7BdI8kCnCop', 'AhRdP8osW5ddUbBdKSkbFGBdVCks', 'CwvjW7u8bmow', 'nmkzWQWxemohWRVdG8kJ', 'CmkpWRpdNZ9IfmoVW4JdJq3cHNz9', 'uG9UW4C', 'kCk7oSkyDIBdSCobWPqfW5OfW6lcJW', 'ECorFd4TW4RdLY1xqSoQFJKQAJStW6K', 'zSk9W5fQW6WvbW', 'WO9SW6fkESoYgLpcUCkbC8oEWPJdJ8kfWPiar0/dUYNdVI4Y', 'WRSXWPn7W6u', 'EmovFayFW5NdJcvBu8ozztO9', 'W5jWfCoo', 'DmkyWQldUYDIpmoMW4pdLcRcKuS', 'W5BcLCoqk2pdLffofSkvW7FcGSoS', 'W4y8y8kDuSoyWQ8', 'FCkqWRdcGa', 'WRiOWPfwW7KbxSkhW7xcPmkiuaRcVfKF', 'WP7cK8koFam', 'yINcPmoTWPnWzI7cISo1mbJdMwXKqflcI8kyWPldN30oW7dcUtJdJqBcQWxcLmoQla', 'l8kUpSk4DcFdN8omWPmDW7W', 'WOdcSr7dUwyhEG', 'FHFdRt8', 'W51KWRmDvWi', 'W652WRWjqG', 'W4u4W5RcUZ3cQCk5umoztCkoD2lcOq', 'E8koWRpcGq', 'WQpdS1BcPHudW7i', 'BwFdSmo2W4xdVJS', 'W4qIWRudD8kqvqFcUCooF8kkWO/dISkkWOyawH7dVd7cTJL8iSozWOjHWPjmWPZdNrldGGfRkqWlWRVcOHFcS8kEWO9MW6aeWP/cJ8klW79qWPJdJsTXrvRcLgBcL0JcUKjcWQ7dQfHghCkmWQhdG8ohW6GHW4NcGhtdUmodWPndkxiIWOZcRCk0krHAnSkWWPa2W5JdOXiotZdcSxa0WRvZW7mPhKiSW5ddPXesDmkmW6pdRwldG8ocWOddJKDPW4pcUmoAW6FcSSkhwh9cqmogn8oyW4lIGPlcRYRdQHlcVCkwba', 'WRtdG0lcNSk9WQjI', 'WQldGKlcJCkwWQ5dm8kVWQVcVmodWR8', 'FuxdUuRdVCoXBa', 'fI/dS8kUWPjWEYtcL8kNnWVcGhfUxKJcH8orWOtdJxazW6pcTMVdNeVdObNdK8oIFmkwaMDEW6dcLCk7lLRcRCkb', 'qJz+DwiKA8koW4ddSHVdSmkSWOS', 'd2xcLmoXBCofgmocW5LYluW', 'W47cKCoWF2PuuG', 'kSoLW5hdSG', 'bhZdKSkCWO7cKCoYx0BdGCoiWRO5Dq', 'j8kuWR8xbG', 'DCkXW455W68zg2P1WRWP', 'W7X+WQy', 'W5zWeCohaSkWWP8Gzd8mWRe3WOu', 'W5NdG8oupv5xWPVcVJtcPmk0FZq4', 'vInRxG', 'W57cM8oYFgbhrmozWRxdOCoyW4ddNa', 'ucm4h8oPleJcISomW63dSmoXWQCZAG', 'dmkzWRJdVGFcQSkGWOBdK8kVWQmTDq', 'rXDYW4xdUG', 'eCoHWPvCC8oC', 'W7q9W6VcHNT3W6BcRJ3cUSkmW7DkzW', 'iCkqWR8nbCoIWRhdKCkJmc0P', 'vc/cLmouj8k7sSklWPSNEqLKlCkHWPXcbgNdLSkvW5XEW79cW5pcVmkdiWyuWQFdMePqWO4SpSowWOpdSSk1W7qmgZmQafddISkOWQ3cSY4TlXnyW5hdUxtcV8kkW7ddHvpcQW1cASoBj3SbW43dMSkPhvpcIvBcImk3WORdSCkgD8okDIJdSvi', 'jCo5W5ddUGK2m8kgW6C', 'W48OW5RcMW', 'E8oBqGC/W53dJaHFuSoU', 'k8kZiCk3CW', 'W7T7W4ZdRMLQtG', 'c8kcWQ7dRX/cRSkC', 'aMhcICoCu8oqa8ohW55Jc0yOAa', 'WQdcISkrW4tcISoofSkw', 'vID4wwaMB8knW5C', 'vmkpW6xcVv/cMctdI8o8n8kHWRpcS8kPWRSFWOhcOSkvW4tdQ8ksWRFdR3xdTJZdSNjGW7ddGu1zfxVcMmoTptWbW5hcQCk0WQZcU8k8bCohWRhdPcrqWOGdW7/dUCkWW4FcPmkBW5zrW69VW7xcKblcNqpcTXXnWPhcG8ogW7xdN8oPzmoEqCkeW7S', 'FNKwW63dKCkwvX7cQ0NcJxuPAXW', 'pSo7W5z+WR5+xH4WW6r9i8osWOKAW4XClN3cG8oFvdHcWQhdGLPpW5zxk8oRh8oFWQvxWQ7dKmkfW7D9d8kjuILpvJvOd8omhX5GW6T+zmoKgCkKFCkKW7mTs8ojtCocW4OMz0JdVCoheXhdLCouW5PlzsOskSkVWO3dKdrVt0lcOmk4hSkEWPddSZldSYeDDLqmWR/cUSkzf8oAWPJdTY3dHCkBWQNcSWNcV8kaWP/cRfHvlSkaBCkPW75wu8o0WQpcHSk3WQxdRW', 'WQ7cK8klzqmhWO7dVtJdJCkUEY43bSkbWOhdTIiTW5erW7hcQxVdRW', 'WRlcISoms8okW7tcLmoZAr8LvIG', 'W6bYW4JdOG', 'fCoaW63cOflcNxFcMG', 'W5tdNCknErikW4hdP2K', 'gCo2t8ojgmofWO9tWPzh', 'kelcP1NcQW', 'gSoaW6tcL1VcLxFcTSkTBmkSW6pcQ8oQW7nzW4dcSmkF', 'yg9mW7CP', 'WRGMW5TMW74mwCk8WRy', 'tYKZoCoIoupcSCo3W7tdQCo9WQCOBq', 'W6VcGSksW53cJCokfG', 'td1SxW', 'EMqCW7RdKCkjtq', 'WRxcKCoAwSosW7dcQa', 'emoPWPXxB8odla', 'W6CXW7tcLxH7W7O', 'W6dcVvVdSLu', 'W44YW4NcVtNcRCk6ASoBxmkTEe4', 'W5NdGCksCq', 'lCkuFfvQWOZcNgTysmoNzMT6g2rpW6KoyH8GWPtdRmoJWQ1LWRZcJguPW59+WO1xwCkkWQZcKY/cJCoYW6/cV8oYbdtdICkCWPlcI8kQW6NcGmkbtSorpSkTy1jTWPtcI8kxbSoYzSo5c2TKnJhdOrGLW7lcLCko', 'W5RcN8oSD2PDrG', 'asJcOSktWOtcVxpcNSoem0pcS8ogwmknhmkRgSkQWPf/B0NdP2CbqW', 'fMSYcd94nmk8W7/dTJ7dHSkr', 'WPVcHSkBzqm', 'ESoOWOJdMmkgouhcQSoeWQC3wJy5W59FWONdPSkueZHlwCkMiw5KwSooW6ldNq', 'W7eSCGOLvSo1qfRcImolW590', 'iSkXkCkU', 'WRLJW6DnpSoEeNJdTCkDCCoz', 'Bq1XxJFcPSouW7JdHvddJcLmW5SXW4ZcQeVcGuKqrCoCvSkmWQyvzCkTrszLDuqwd8kEzKzSeWpcUmknsmk7WO/cKCkXkCowjCkXW4y', 'AgqlW7BdHSkvuGG', 'e0GPcLtdQCkAWQZcGb7cMa', 'qtP8', 'WO/cH8klzqiSW5NdPZlcN8kqDtC8fG', 'WQeRW4lcU2yrW6pcHG', 'B8omWOe', 'FCo8WO/dIq', 'mIxdPCo4WPPsFtZdMCk5mXu', 'kZezW7ddMmkwa0/cSxNcKx9NlHXxpcC/W47dNxvujqddRCo1W5FcVJDsz8k2WOnXo8k8CgG/W5XQWO/dJCkHW59JW5PiomoRwSkxxJJcT2lcI8oct8khWPrKW6xdG0BcGCodW6ZcKXlcLSoyWQ1WBIFcKHjcWPhdTNRcOXNdRCkMWQJcIvHup8opnSkntSo2W681W4PwWOW3W7fpjmou', 'WROdWQ1mW6ZcK3FdLhxdJCkGoHBdJG', 'cxdcKmovD8ovkCodW5jRpq', 'WRpdN0JcGCkVWQPOpSkTWQpcQ8o/WQtdG8oi', 'W7r4WRCJra/dRgK0taS', 'hmkFWQtdSXy', 'yCkMW4D7W7qro1j1WQK4BCkg', 'WPWLBCoCWOFdHW', 'WOxcTGNdN2WbDG', 'W7T8W5BdONrBt8k3WO5aWOJdJda', 'bg7dLmkE', 'b8o4WPTqFmoWkSoWW6z8', 'dCoRsCovi8o/WP5cWO9DstZcJG', 'aNldMmkrWP/cNmocqW', 'ANJdSSoFW53dJtldKmkbFZFdUSksfmoi', 'W7XYWQmFvq7dVxmZrGK', 'WRG3W4dcUG', 'p8oJW5/dQZyBfmk4W4OKyNO', 'ACoviXSNW5tdLY8Er8oQjZuWxsinW6nvkqXYWPtdVmo/WRP8WQxcHJyMWPuTW5uj', 'WQ/dQfBcQG', 'ECk4WRZcK38fjSoieSotcviGjvRcPCoUW6rgzmksd2mGmSkwdCo4nSkXwhaik38SW6BdTmkQEmo5a8knW64', 'W5q8xCk3umoAWQVcRMniWRRcL3ul', 'W4eVW4VcNYxcQCkrwCosvmkPyf8', 'WPxcQGpdJfCwFCo6W4ZdT8k5W7NdMWv0', 'BCovya', 'ocmpW6e', 'W73cHmknW4JdJmoEh8kbWQ1lnW', 'WRCWW4BcP2yvW6lcQHC', 'smk1W4T2WQahb01KWQeWi8kbW4HmWOKylW', 'WRX2yXXId8kWdb/dI8kFWPaMWQ7cOmoyWQfntWBcVapdG8kNW5S1WQyGWRq+WRJcTKnefSk9i8kiWO7dUMNcMSoxjHJdPr1+vYRdIb8VsSofWPdcMCof', 'tYC2h8oM', 'WQFcMCofx8oB', 'W7jKW4RdQITJt8k3WPDv', 'cCoYqCoknmoIWPPBWP4', 'W5RcN8oSD1bwqSosWPldQW', 'FSo4WO/dQCkfmqhcOSoFWR8bsGW4', 'WR02W5FcVhW', 'bSoXr8o6l8onWPvPWOLBsZ7dKmo7fSobyMa', 'aSoaW7FcTv/cUxZcHmk9zSkYW7u', 'W4CjW5qBW67cQa', 'WR01WPn0W6ufDCk0W7pcOCkmuba', 'W7X5W53dOq', 'B30AW6e', 'WP4RWPJcPYy', 'zCoeWRRdVdPQz8k8ySolh8kWW75R', 'W4OMCCojWPy', 'eCokW7FcKv/cKxtcJmkXD8kcW7/dJ8o7', 'dCk+WQBdLcGziCohs8orgeKHDuhdVSkVWQ9jzCoCqcCQlSkBbmoMo8kZxcbelwq2WQZdTmkPn8o+d8ktWQpcKGWqWRO', 'WQhdUeZcUXiE', 'y8omWOZdMdjyzCkRAmomeCkGW4r7', 'W415WR4DsGldQsCEtbDqEmomW4mtWRWi', 'cxxcLmoFA8oEbSooW6LOnuW3', 'WOhdNSk5DwjrrmorW5VcO8kCW5hdJmkPW4RcSSkeBSoWmSkWfNXfWPpdHCk5W4tcRIDPWRxdGW', 'WOVcUWldIq', 'W6nQW4RdQuPLtSkS', 'EXNdSZqbWQZdSLddISoK', 'W7u1W5FdNJxcO8o0tmoytmoSEuRcQZOkzCk+o3/dQ3P8WObdz37cNeJdRtRcUSkODmkiWPJdJ8k1W7i', 'WRiaWPjaW7dcJeBdPN/dSmk9mW', 'b15O', 'W6jOWOvLW7aodG', 'rsKMf8kNp1/cGCo2W60', 'WQWpWPnlW6VcLMm', 'beeWdwtdImkvWRxcGa', 'odldQ8oJ', 'td1KvxWjuSkMW6i', 'W7mXEaGvCCo1qxhcISosW5u', 'WR8PWOj8W70jxSkZW5pcOSkixaJcVfe', 'p1pcU0NcOmoZgM9BW4FcSW', 'CmkvWQhcMSoUga', 'WQa3W7tcVxOzW6dcHa', 'CSogWPhdVJSqBmkRz8oEnSk3', 'W7y4EW05', 'zwXCW6e', 'WPfHyCkG', 'W4adW5KnW7NdVd/dIq', 'e8oLWOXtE8oyoCoMW45SW4pcQwHywZm', 'WOFcSYddK2aNESoRW4pdVSk9W6e', 'WOdcTWddIgiw', 'W47cJmo7EhDwzmorWPNdOSozW4VdKa', 'W47cHCkvW4tdJmo8cSkhWQrqpCoUWOe9W7zRWPBdL8oIW7ldUWygDCodlmodFq', 'qmkkWQ3dTLZcQmkqWOpdMSkMWRvS', 'WONcGSkszr8NW4VdUtBcN8k2DZ43eCkA', 'c2ZcGCodASo/c8ogW54', 'D2lcPmo9WOTOEtJcISo1jHJcKhTIqLZdLCkoWOtdHNblWRdcQdpcNKldULFdJ8kUyCkBfgDeWQBdGSkUpq3dTSkaECoZWRpdT8k9l8kpW7KeW4bLuSoMWP7dLmoyv1DLyfFdPrCKy0yTWRrcuZ06W6BcMCoyWQvTWQJcPXddSX3cSL8ADGJcIYWTW509mbWsBHVcG8kWW55rW5tdT8o3WQlcVmktjWTaW5FdPaBdKCkKE8o9EvrMWRJdMaiFW7unW7PJp2jLs20NWPCgWPaCWQyYW43dTqi3h8k9W4mhkSkkWRzvW6TqeCkBcN0Wi0VcUWxdNcqlW7rBmCk1vebTxceaWPpcOt3dUSkPW6eVzM3dUmk6WQe', 'W4CMEmk0v8o1WQBcPLu', 'lCk1W4X7W6WncLDZWRC', 'W7f5WR4zvs/dMuOw', 'WRG9W4BcV20ZW6BcGH3dKSoXW5e', 'a3ZdIW', 'bKvSWO96', 'WRC3W5lcP3W', 'W4W8W4pcMW', 'WRPWW7rnjmowgLxdTa', 'vrTVW4e', 'sInVxLOOzCkaW4VdSIO', 'CctdPCo9WPC8ytZdLq', 'yhvkW60YcSkEWOXeW5T+W7fmWPFdNM3dIYWHWQldJ8oOzmkaWP7dU8onz8oTxWJdTZjbmejlW5JcGatdIJ7cRGSvlmkQhSk8W7mcvSoKW7ddRMddH0BdOmkjng4+pf7dNq', 'WPRcHmoAjhhdMhmn', 'WORcUWldM3mm', 'WQPJW6fcjmovaq', 'WQhcNmkeW4/cKCkuhmkmWRzAB8kXWPLSWRnSWPBdH8oGW7dcTqqcFCorpCopzSkPWO0DW7RdNh9mWPBcJCoDWQldGmkRbSoNFYLyjX0ps8oVBYSCWQxcHSonpSoyWQj1s8kMAmk7FJldTmoGW7Pg', 'ouBcV2NcOSoYngjCW5/cLCoklmoV', 'd3NdN8k1WP3cKmodwwxdHmoEWPe1FYldNG', 'tICGgCoI', 'bM/cLW', 'yCk4W41PW6uhcG', 'lJldOCo4WPz0yH7dMmk6jHBcMNPLweG', 'W5tcISo5i3NdMMD1h8kQW73cGmo9W6a', 'pCkdWRRcGmoNhXhdVeG0W5SjWRpcUmkDWPeu', 'WOxcQX/dIgGjp8oNW5JdVmkSW6tdGq92WRVcIKf5WRXayq', 'FqtdTJW', 'ywulW6NdH8oaeulcVhlcKtqHzXXaitOWW4RcKcDzDL/dPCoVW5tcTxCxCmoTWPbOmCkTpg0LWPCUW4NcGmoTWOO', 'W4lcGSozkxJdNhf9hSkDW6hcN8o5W7rJ', 'nSkfWR0igSopWRFdGmk2kZyQwSkOWRq0', 'beeWdwtdISkDWQVcKq', 'amoPWOjcwCoanSoRW693W4u', 'W5T0dmoUjmk0WPSPBZKCWQCsWOq', 'omoYW4BdQZGrcCk/W44TCW', 'WQBdUflcRGuyW6VdMSkBlSos', 'osxdSmolWPn0EdJdMCkJfadcVxS', 'W5mNAmk0vG', 'deDQWOLNWRvn', 'W4qhW4CgW5ZdOsJdNSkU', 'WOhcUXJdUwSbF8oVW4pdPmkAW7tdUW4', 'dM/cKSo1EmosaG', 'W4mhW5SnW7BdLYNdMCkJn8ow', 'W7z+WRmxsqBdOgi', 'jmkqWQebamo/WRFdLa', 'bKayeghdR8kaWR3cLG', 'FmoaDWqT', 'W4uhW5KDW78', 'W6ChW58bWRpdHcVdQIC', 'c8oUumoCkCoiWRHEWPjyqW', 'WO8pWPulW7BdQsNdNSoNECovWOVdQ1eWWP3dVSk+vY/cICoSe8onW6fBWP8Ph8oGsLJcPG', 'chldICk1WORcLSof', 'WQBdVfBcQG', 'WQ8CWOHi', 'lCkYl8kUAq3dVCojWP8', 'CSomWORdKtfAE8knBSozpCk3W6HZ', 'W58jW5iRW7ldQttdSSkSnmoAWONcOW8YWOtdO8k/', 'hCo/WR5tBmoknmoWW7P8W4m', 'vc/cJ8oaBCoybCofWOu', 'iSkgWQGw', 'WRXTW7Lgcmova0ldT8kgsCodWOG', 'Amk1W4T2W4WBgu1tWQW8BCkCW4Xw', 'eej9WOnTWQHn', 'WR13W7zamSodbG', 'WRFdKuVcMCkh', 'omo+W5pdUHqleW', 'ubvXW4RdOa', 'a8keWR7dVGFcPSkkWOq', 'WRhdGKlcGCklWR5R', 'pCktWRdcNmo3eWtcOaq', 'W6KRW6JcIW', 'urjYW5/dMHtdOmkAl8ofW4H8', 'wSoVWO9fBSoanCkYW6DSW53cVhvcuthdQmkkcaTJsmoLaelcMeNdPZT0', 'AHNdQJ9y', 'W7JcISktW4pcP8ochCkwWRG', 'DSkeWRpdSZ9Uf8oHW6FdMJVcLLb3', 'AaBdRZ1vWPVdUKJdISoMCYJcQ8kcCq', 'W4RcI8o3DwDGrmojWOJdPSosW4ldLW', 'WRm9W5pcJgqvW6pcHH3dImowW4rOW7W', 'WPJcH8kmybulW4pdRdNcMq', 'sXrZW4RdOsJdKCk6mq', 'W689W6BcK3foW6BcLc4', 'j8kWkmkY', 'W7jRWRvao8orbLtcPmoqCmolW4hdLCkeWPKAaXZdVd7cTIX8iSouWOmZW5LcW4hdLr3cH1e+ybXCW7u', 'eeWJeeddP8kgWRBcGalcVMyaWP4', 'lwnmW6OPcmoEW4XCW4jMW6XwWOhdL2tdJtT4W6hdJSkQo8kxWOJdVCouF8oQdeBdPcHzk0Ou', 'WRylWO9q', 'WQZdHvpcICkVWR5YoSkgWQNcVSoEWOJdH8omWRvsgCob', 'WQJdNKNcICkqWOnseSkg', 'BbxdSd9dWQBdOG', 'ACoBBr07', 'mvpcV0xcOCo5kG', 'Ah8lW7ddG8kFxaxcShNcLa', 'wCkpWRdcUHDIcCoRW5tdJslcMLfT', 'EmovFay', 'tH98W5NdTJ/dPSkFhmoeW4P8W7y', 'BCo8WONdI8kmia', 'W754WQi5rGtdPq', 'WOxcL8krEGCeW4VdUG', 'wJSfWR0sWPPI', 'tXTT', 'FCo0WO0', 'W6JcJSkvW6JcJCooaSkaWQjlemo8W6GQ', 'WQKMWOr7W7GovW', 'CSkYl8k/FY/cVmohWPyqW6SpWPBdICo9d8oPW6SUWO97sCksuItcJfuHjYJcSY4XW47cGSk+WQXYWPKHgK/cLeddStHjjCo/WP3cPJTGb8ofxSkDlCk2W5lcK3/dOCkXWR4EW4JdK8oqlCo5WPdcNmkPi8owW6vTs0amWOKrESkqgmkJWR7cMZHbWP4qiu1uWPtcSSouW5/cTv3dIgOuoY8FWPGaiJHRW501dSk9W7OdWR4zWOBdLYjjWPjKj8kMWRtdJ8kZBxBdHW', 'WRKIWOjqW70fxCk9W7JcUmkRrY3cVq', 'DCkXW455W68zg3T+WQu/B8kxW40', 'WRXTW7Poja', 'fui9gZRdOCkDWQ7cGb4', 'f1FcMmop', 'WOxcH8kwBcSwW5RdRbVcGSkLArGXbmkhW4/dTcC', 'WQKbWO5iW47cL2pdGhhdVSkHobBdKq', 'vrj0W5VdTGZdRmkecCo1W5z2W7yLW5G', 'WRC0W4BcUNS+W6/cJHy', 'WOxcSGxdN2W', 'W7RdRvO', 'zmkcWQJdQHPZhmoNW6JdMclcMG', 'W4m7Dmk7wmoEWQm', 'W6aQW6lcHgb/W4BcGd/cNSkeW7Hz', 'WR7cLSokrSoxW7lcUG', 'WOdcSGNdHa', 'W4tcKSoqowpdMhTmaa', 'WOZcM8krEqOcW5C', 'WRHJW7LwmG', 'W6C8yZ0Wymo9svhcN8o9W4LpW6O', 'deGO', 'zmkbWRNcM8oK', 'W5yYFCkTvG', 'qWPTW4RdVqtdHSkFfmogW4a', 'qJyKfSoZheJcNSoIW6/dSmo1WQ0ZBum', 'fdSzWQWKWPXOW7ldJ8kcvSogW5PXAa', 'nSk0WR3cKtWcmCop', 'E3qpW7xdJq', 'FSo8WOS', 'BSoeFG0MW5ZdVsnxtCoV', 'z8k5W41WW6K', 'eenNWOXT', 'mSkyWQiocG', 'pY9nW71JBCktW4erWPCQWRGFW5lcKIJcIhGSW6ZcGmoLkSkrWONcSmkDymoUhGxcOIjzpLWvWOJdLWRdNZpcUGTzk8kOdSo2W7Hadmo3W6FdSZFcLq', 'WQi9W5xcNgygW6VcKrRdMSo9W5HfW4RcUmkNW6m', 'oc/dTSoJW5j2zZtdK8o6za', 'WR83WOz5W6G', 'WRaMWPTW', 'pCkUiSk0BG', 'WRlcKmoirmoqW7tcVCoS', 'WR3cL8ooDCoDW7NcSmoXyHCSzZxcGq', 'WOVcNSkdEHuVW4FdUIm', 'WRJcLSoht8omW5NcHCosqa', 'vJuXca', 'WROUWOa', 'gmoJWP11CSoonSoaW7X2W5JcQ3KCxJldPmkh', 'ymoAzWy4W43dIG', 'WRZcL8onx8osW7q', 'W4iYCSkZvmojWQJcVL5yWOVcKxCdW5K', 'WQLNW6fMo8ovgeldT8kgvmotWQxdGG', 'ygHyW7CZaSoFWPi', 'uGH4W4NdUHG', 'E8oBqGCRW5NdKI5TvCo5yZG/', 'WQjTW7jGp8org3JdQ8kDESopW4hdGSkoWPKwe1K', 'W5JcG8kaW5NdGCoof8kvWQLno8oGW48TW7y/WOBdKCkSW6ZdP1nvFmoup8ocFmoGW5ifW6FdIYajWOZcICoaWQZdH8kXaW', 'pCkQn8kXFW', 'W6NcISomW57cJSohbSkbW6Xzm8kOW4iMW7zPWPddKCoIWRJdVvzvD8oDlmorlSoMW5iiW6pdHYSc', 'W5mTDH46jCoesv7cHG', 'lwnmW6OPcmoEW4XCW4jMW6XwWOhdL2tdJtT4W6hdL8k3D8kvW4pdOCorDSoW', 'W5q4W5ZcLZFcPCkXuCoOs8kJyK4', 'z3asW7W', 'budcJ8owebO5W5mhW5Lg', 'zbFdQZje', 'c03cPu3cO8oYpsD2W47cP8osf8o/W4BdImkJgq', 'FCoryWC+W50', 'WRtdVe7cUHi', 'W4FcGSofjNBdKNe', 'W6dcVupcQXmjW6lcN8kbnCkbWRNdHriQW70', 'WRTQW4JdRM1HrmkR', 'qcO1cCo5fKZcG8oM', 'p8oJW4ZdTHuzdSkTW5i', 'WQy3W4JcPhS', 'B3tdLmoSWRrMtby', 'WQi5W4VcVg0', 'EhZdU8oFW4e', 'jSk+WR3cMY0', 'lvpcP0xcUG', 'cMrQrSoJEe7cGSoIW67dT8kLW6O7Eb3dL34yxf8IvbZcQSoEo8ojWPusW7NdH8o2zvX/hmkzpSkfWR5romoVWRddNuiJDtBdGKxdNSoLWRVcTchcLCkHr2dcP8kuW7rzxKnxxmkTW5yX', 'W5GdW4W', 'W5y2y8kXvCosWQtcQKrvWQFcKa', 'kulcUulcKCoXmhvbW58', 'W4e1W4VcNtRcQCkW', 'ASkMW4D8', 'rbz4W5C', 'W63dL8oDt8ogW6xdR8kvlfjGghZdHsGm', 'asJcOSktWOtcVxpcNSoem0pcS8ogrmoovCo5wCoMW5r/melcQIq', 'WRtdG0lcNSkmWQPRoG', 'kCoyELm', 'qJyKh8oKpg7cHSoQW7hdOa', 'imkJWQpcMY0', 'z8oBWP3dVcPytCkIy8ovnSk3W7K', 'zSoCWOZdQtft', 'gM/cJ8oDsSofc8onW51vnKuH', 'WOxcL8kwyqKh', 'aKDUWOXXWPLFW63dRufh', 'gg/cKmodBCoqhSoo', 'WQCSW57cPw0', 'BgmnW7BdHG', 'x1lcKSoai0OKW44yW5iplSkmhdPXW6mTjmkNnbT9l8oxqeOMW5HPiSofW6SoBLuYW4pcKmkUo8okzbJcOmkPsdKiW4eyzG3cNuTqW5xdJ8kYW4NcRGWEW4K+n8oTWPZcOmoJWOq', 'wduhWR0HWQXIWRFdISkasmoAW484i8oRWPS', 'WR12W6XpmG', 'WQ84zXfZySoLrvpcJ8omWP8', 'gxZdICkE', 'n8k+WR3cKqagnCozw8kFbfqNpuddR8kEWQjb', 'WOVcVXW', 'imk8WR7cNJy', 'DSkMW4T3', 'WQ7dUepcUriVW67dNSkBnmoeWQy', 'D2fBWRq', 'zCkHW4T2W6qNg0PKWQ0Zzmkb', 'efxcH8ohpreuW48lW5Tw', 'ESoWWP/dVSkmjadcVG', 'W5S6BmoAWOtcMCotemkYWQBdTsRdP2FcOKGsbW', 'WRBdLuVcJ8knWQzJamkPWQ7cUmodWQxdISob', 'oc/dTSolWP5YFq', 'W5eMDmkRr8osWQJcPum', 'aLhcJSoonG', 'sSomWOZdQJfpy8oUy8okiCk2W78X', 'fCoDW6BcTuFcKvZcHCk6BSkLW6JdSG', 'tJGmWQa', 'qd5LwMC', 'W7C9W7/cKvD1W63cMd/cNCkv', 'W5JcJCo7AW', 'WRXTW7PofmorauldVSkDzmot', 'WQBcMCoBrmoHW73cSmoSEa', 'W449DCowWPZcICof', 'dSo7rSoymSoaWO8', 'W689W6BcK3ffW6BcGJVcKCknW7nj', 'W6eTW7pcKxT0', 'W6WVW6NcGgzfW7hcGZBcLSk+W79j', 'nmkhWQGff8oUWPFdNmkYncCPsW', 'W7n+W5hdQ2jkxmk1WOC', 'iSkgWQWdbSouWRhdN8kInZy', 'W7zM8lAGIcG', 'ltxdP8oTWPPIzG', 'fvH3WOnTW7ztW6ZdTue', 'W599gCoyo8kFWPCHza', 'dhhdLmktWOa', 'WQtdSLdcIHypW64', 'W58jW5iRW7ldQttdSG', 'FSobAXOXW6VdMYDBqSo/zsq', 'WPxcRa8', 'WRhdUepcVrqe', 'dCo7vmo8k8ojWPztWPvazslcTmo4', 'WPOBWPvkW4/cL2dcO2VdQSkJmWdcNCkMyg7cHrxcTW', 'WQ3dN0dcR8kkWQPOamkHWQ/cUSog', 'hmkXiCkWoJddUCoqWO8bWRGpW4RcNCo+bmk6', 'W7qpWPfmWQ3cN3hdQNxdU8k8Eq', 'W7q5W7xcI1H1W6tcNXNcM8kaW7Hdz8kg', 'rIS7emoJ', 'EgpdVmk8W4GQ', 'x8oyAWK7W53cNI5qvCoUEhy5gciEW6bsyfLSW5xdSSoYW79RWRNcJxH7WO4NW5KcfG', 'yCkvWRFcNCo1ba', 'evjZWO9+WR4', 'a3ONdSo4n0pcICk9', 'cxdcKmoCya', 'WRC0W4BcUNS8W6FcKaC', 'vmoMWQVdIq', 'WRu2W5pcOgqzW6dcIa', 'W77cSLhcVXycWRJcTCovESkbW6RcJv16W7ZcQCk9W4hcGmk2WQpcVSksW7NdMSoOWPBdR3mZimoCWR9xwN5mmSo9W7dcHmobWRNcGwJcM23dPrr+W4HmW7JcNComDSopWQi+W6hdK2pcJmkmWOhcMsxcVLvrC2SNp8kxpCotW7dcR07cT8klW7NcIa', 'ywfDW4yQcmobWOvcW6HMW7fmWOy', 'jmkTiCkZ', 'W7zQW5VdRgf2uSkTWOXbWPtdIJGDfq', 'W7i2EX0dBmo0', 'WQddGfFcICkmWQ9fn8kJWQRcVq', 'nCkWWQpcKtecgSoes8ku', 'W6CXW7e', 'WQGOWP92W7rnwSk3W7/cOG', 'WQGBWOjgW6FcI3C', 'WQddSLdcQXiEW5tdNSkrm8ouWRK', 'eKj7WPjXWOHBW6/dPKDbWRxcNCkrWRqU', 'iSo2W5pdUG', 'W51/dmocjmk4WPGNqc4QWRC0WO4', 'hudcMCofjX0', 'DSogWPtdUafuBa', 'jSk9WRdcHYW4nCogsG', 'fKdcG8oNpXa6W4imW4nWy8o9wG', 'DSkTW5j/', 'yhjCW7GPaSo2WO1uW5PVW7zl', 'DmoiWPZdUtDtBW', 'ANKwW7xdKmk2vX7cQW', 'W5a1CCoF', 'W4uHy8k3qq', 'W51/dmocp8k0WPqKBIi1', 'W5TWca', 'W4hcN8o8Fg8', 'aLdcLmobnGyK', 'W586FmoaWQtcLCofea', 'W6jOWPqR', 'W5BcKSogpNJdNdLpbSkuW6BcHCoRW7zQW7HcCL7cKmo/BwJcGG', 'WQPRW6m', 'pmoLW5VdQriBemkpW44WzhVcSfKMWQBcQCkm', 'oIxdT8oTWO14zsNdNSk4oa', 'rcn6xgCIz8kFW4FdQtFcPSkpWPWOWQW', 'W5KHASoaWPZcJG', 'iSk0WQu', 'e0WTWP7cOftcTmkvmCoUW4bwW6S', 'omkfWRKndmoLWQe', 'W6ZcHmkmW4dcGmofcW', 'bei/gh7dOCkh', 'WQZdKvC', 'W7q5W7xcI1H7W7dcMa', 'tCovW74', 'a0dcH8oomHyY', 'W7jKW4RdGMDNvq'];
    a0_0x293b = function() {
        return _0x1011b8;
    };
    return a0_0x293b();
}

function loadJailTab(_0xaec6f) {
    const _0x1b5286 = a0_0x201bc1;
    setVal('jailJailedRole', _0xaec6f.jailed_role_id || ''), setVal('jailJailerRole', _0xaec6f.jailer_role_id || ''), setVal('jailLogsChannel', _0xaec6f.logs_channel_id || '');
}

function loadMuteTab(_0xbd4b3) {
    const _0x4a2d12 = a0_0x201bc1;
    setVal("muteMuteRole", _0xbd4b3.mute_role_id || ''), setVal("muteMuteLogsChannel", _0xbd4b3.mute_logs_channel || '');
}

function loadVerificationTab(_0x5f55db) {
    const _0x1081f4 = a0_0x201bc1;
    setVal("verVerificatorRole", _0x5f55db.verificator_role || ''), setVal("verUnverifiedRole", _0x5f55db.unverified_role || ''), setVal('verVerifiedRole', _0x5f55db.verified_role || ''), setVal("verVerifiedFemaleRole", _0x5f55db.verified_female_role || ''), setVal('verLogsChannel', _0x5f55db.verification_logs || '');
}

function loadAntiLinkTab(_0x508972) {
    const _0x3dc4ce = a0_0x201bc1;
    setVal('antilinkEnabled', _0x508972.is_enabled || ![]), setVal("antilinkAction", _0x508972.action || "delete"), setMulti('antilinkWlChannels', _0x508972.whitelist_channels), setMulti("antilinkWlRoles", _0x508972.whitelist_roles);
}

function loadApplyTab(_0x3b693f) {
    const _0x45b949 = a0_0x201bc1;
    setVal("applyChannel", _0x3b693f.apply_channel_id || ''), setVal('applyStaffChannel', _0x3b693f.staff_channel_id || ''), setVal('applyLogChannel', _0x3b693f.log_channel_id || ''), setVal("applyStaffRole", _0x3b693f.staff_role_id || ''), setVal("applyBanner", _0x3b693f.banner_url || ''), setVal("applyPanelStyle", _0x3b693f.panel_style || "menu"), setVal("applyPanelTitle", _0x3b693f.panel_title || ''), setVal("applyPanelDescription", _0x3b693f.panel_description || '');
    let _0x2ef42c = [];
    if (_0x3b693f.departments) try {
        _0x2ef42c = typeof _0x3b693f.departments === 'string' ? JSON.parse(_0x3b693f.departments) : _0x3b693f.departments;
    } catch (_0x5d85ac) {}
    if (!Array.isArray(_0x2ef42c) || _0x2ef42c.length === 0x0) {
        const _0x2aae9a = {};
        _0x2aae9a.key = 'staff', _0x2aae9a.label = "Staff Team", _0x2aae9a.emoji = '🎭', _0x2aae9a.description = 'Moderate\x20and\x20assist\x20members', _0x2aae9a.role_id = _0x3b693f.role_staff_id || '', _0x2aae9a.questions = ["Why do you want to join our staff team?", "What experience do you have in moderation?", 'How\x20active\x20can\x20you\x20be\x20on\x20a\x20weekly\x20basis?', "How would you handle a conflict between members?"];
        const _0x417ecd = {};
        _0x417ecd.key = 'designer', _0x417ecd.label = 'Designer', _0x417ecd.emoji = '🎨', _0x417ecd.description = "Create visuals & graphics", _0x417ecd.role_id = _0x3b693f.role_designer_id || '', _0x417ecd.questions = ['What\x20design\x20software\x20do\x20you\x20use?', 'Link\x20to\x20your\x20portfolio\x20or\x20examples\x20of\x20work.', "Describe your design style (Minimalist, etc.)", "Are you comfortable working with deadlines?"];
        const _0x551ec2 = {};
        _0x551ec2.key = "event", _0x551ec2.label = "Event Hoster", _0x551ec2.emoji = '🪄', _0x551ec2.description = "Organize fun community events", _0x551ec2.role_id = _0x3b693f.role_event_id || '', _0x551ec2.questions = ["What kind of events would you like to host?", "Experience managing large groups/events?", "What makes a successful community event?", "What is your availability for hosting events?"];
        const _0x1ce8a0 = {};
        _0x1ce8a0.key = "partnership", _0x1ce8a0.label = "Partnership", _0x1ce8a0.emoji = '🌐', _0x1ce8a0.description = "Build server relationships", _0x1ce8a0.role_id = _0x3b693f.role_partnership_id || '', _0x1ce8a0.questions = ["Previous experience in server partnerships?", "How do you find potential partners?", "What are your methods for growing relationships?", "How many partnerships can you handle weekly?"], _0x2ef42c = [_0x2aae9a, _0x417ecd, _0x551ec2, _0x1ce8a0];
    }
    window.applyDepartments = _0x2ef42c, renderDepartmentsEditor(), updateApplyPreview();
}

function renderDepartmentsEditor() {
    const _0x4727c9 = a0_0x201bc1,
        _0x2cf371 = document.getElementById("departmentsContainer");
    if (!_0x2cf371) return;
    _0x2cf371.innerHTML = '';
    const _0xabd891 = window.applyDepartments || [];
    _0xabd891.forEach((_0x4ad8b9, _0x12e3ba) => {
        const _0x1a4e1e = _0x4727c9,
            _0x54f63c = document.createElement('div');
        _0x54f63c.className = 'dept-card', _0x54f63c.id = "deptCard_" + _0x12e3ba;
        const _0x44a98c = document.createElement("div");
        _0x44a98c.className = "dept-card-header", _0x44a98c.onclick = () => {
            const _0x4fbc43 = _0x1a4e1e,
                _0x1c5559 = document.getElementById("deptBody_" + _0x12e3ba);
            if (_0x1c5559) {
                const _0x275167 = _0x1c5559.style['display'] === 'none';
                _0x1c5559.style["display"] = _0x275167 ? "flex" : "none";
                const _0x2fbcd0 = _0x44a98c.querySelector(".chevron-icon");
                _0x2fbcd0 && (_0x2fbcd0.className = _0x275167 ? "fa-solid fa-chevron-up chevron-icon" : "fa-solid fa-chevron-down chevron-icon");
            }
        };
        const _0x208b67 = document.createElement("span");
        _0x208b67.className = 'dept-card-header-title', _0x208b67.innerHTML = "<i class=\"fa-solid fa-folder-open\"></i> " + (_0x12e3ba + 0x1) + ". <span id=\"deptHeaderLabel_" + _0x12e3ba + '\x22>' + escapeHtml(_0x4ad8b9.label || "Unnamed Department") + "</span>", _0x44a98c.appendChild(_0x208b67);
        const _0x32519c = document.createElement('div');
        _0x32519c.style["display"] = "flex", _0x32519c.style["alignItems"] = "center", _0x32519c.style['gap'] = "12px";
        const _0x59578f = document.createElement('button');
        _0x59578f.type = "button", _0x59578f.className = "btn btn-logout btn-sm", _0x59578f.style['padding'] = '3px\x208px', _0x59578f.style["fontSize"] = '12px', _0x59578f.innerHTML = "<i class=\"fa-solid fa-trash\"></i>", _0x59578f.onclick = _0x170424 => {
            const _0x1eeb86 = _0x1a4e1e;
            _0x170424.stopPropagation(), confirm("Are you sure you want to delete this department?") && (_0xabd891.splice(_0x12e3ba, 0x1), renderDepartmentsEditor(), updateApplyPreview());
        }, _0x32519c.appendChild(_0x59578f);
        const _0x172a53 = document.createElement('i');
        _0x172a53.className = "fa-solid fa-chevron-up chevron-icon", _0x32519c.appendChild(_0x172a53), _0x44a98c.appendChild(_0x32519c), _0x54f63c.appendChild(_0x44a98c);
        const _0x2c621f = document.createElement("div");
        _0x2c621f.className = 'dept-card-body', _0x2c621f.id = "deptBody_" + _0x12e3ba, _0x2c621f.style["display"] = "flex", _0x2c621f.style["flexDirection"] = 'column', _0x2c621f.style["gap"] = "12px";
        const _0x1fc456 = document.createElement("div");
        _0x1fc456.className = "form-grid-2", _0x1fc456.style["gap"] = "12px";
        const _0x3d0a89 = document.createElement("div");
        _0x3d0a89.className = 'form-group', _0x3d0a89.innerHTML = "\n            <label class=\"form-label\">Department Name</label>\n            <input type=\"text\" class=\"form-control\" value=\"" + escapeHtml(_0x4ad8b9.label || '') + "\" oninput=\"updateDeptValue(" + _0x12e3ba + ", 'label', this.value)\">\n        ", _0x1fc456.appendChild(_0x3d0a89);
        const _0x1e67de = document.createElement("div");
        _0x1e67de.className = "form-group", _0x1e67de.innerHTML = "\n            <label class=\"form-label\">Emoji (standard or &lt;:name:id&gt;)</label>\n            <input type=\"text\" class=\"form-control\" value=\"" + escapeHtml(_0x4ad8b9.emoji || '') + '\x22\x20oninput=\x22updateDeptValue(' + _0x12e3ba + ", 'emoji', this.value)\">\n        ", _0x1fc456.appendChild(_0x1e67de), _0x2c621f.appendChild(_0x1fc456);
        const _0x1f223f = document.createElement("div");
        _0x1f223f.className = 'form-grid-2', _0x1f223f.style['gap'] = '12px';
        const _0x43ff5a = document.createElement('div');
        _0x43ff5a.className = "form-group";
        const _0x343b83 = document.createElement('select');
        _0x343b83.className = "form-control", _0x343b83.innerHTML = getRoleOptionsHtml(_0x4ad8b9.role_id), _0x343b83.onchange = _0x4eda37 => updateDeptValue(_0x12e3ba, "role_id", _0x4eda37.target["value"]), _0x43ff5a.appendChild(document.createRange().createContextualFragment('<label\x20class=\x22form-label\x22>Role\x20Reward\x20(given\x20on\x20approval)</label>')), _0x43ff5a.appendChild(_0x343b83), _0x1f223f.appendChild(_0x43ff5a);
        const _0x45b9f5 = document.createElement('div');
        _0x45b9f5.className = "form-group", _0x45b9f5.innerHTML = '\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<label\x20class=\x22form-label\x22>Short\x20Description</label>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<input\x20type=\x22text\x22\x20class=\x22form-control\x22\x20value=\x22' + escapeHtml(_0x4ad8b9.description || '') + '\x22\x20oninput=\x22updateDeptValue(' + _0x12e3ba + ", 'description', this.value)\">\n        ", _0x1f223f.appendChild(_0x45b9f5), _0x2c621f.appendChild(_0x1f223f);
        const _0x14837d = document.createElement("div");
        _0x14837d.className = "form-group", _0x14837d.innerHTML = "<label class=\"form-label\" style=\"margin-bottom: 6px;\"><i class=\"fa-solid fa-circle-question\"></i> Application Questions (max 5)</label>";
        const _0x523fa0 = document.createElement('div');
        _0x523fa0.id = "qContainer_" + _0x12e3ba, _0x523fa0.style["display"] = "flex", _0x523fa0.style['flexDirection'] = "column", _0x523fa0.style['gap'] = "8px";
        const _0x594eb9 = _0x4ad8b9.questions || [];
        _0x594eb9.forEach((_0x5404d4, _0x3460a6) => {
            const _0xf320a6 = _0x1a4e1e,
                _0x3960f9 = document.createElement("div");
            _0x3960f9.className = 'question-row';
            const _0x4824cf = document.createElement("input");
            _0x4824cf.type = "text", _0x4824cf.className = 'form-control', _0x4824cf.value = _0x5404d4, _0x4824cf.placeholder = "Question " + (_0x3460a6 + 0x1), _0x4824cf.oninput = _0x301d47 => {
                const _0x43f929 = _0xf320a6;
                _0x4ad8b9.questions[_0x3460a6] = _0x301d47.target["value"], updateApplyPreview();
            };
            const _0x3b356f = document.createElement("button");
            _0x3b356f.type = "button", _0x3b356f.className = "btn btn-logout", _0x3b356f.style["padding"] = "8px 12px", _0x3b356f.innerHTML = "<i class=\"fa-solid fa-xmark\"></i>", _0x3b356f.onclick = () => {
                const _0x2ae547 = _0xf320a6;
                _0x4ad8b9.questions["splice"](_0x3460a6, 0x1), renderDepartmentsEditor(), updateApplyPreview();
            }, _0x3960f9.appendChild(_0x4824cf), _0x3960f9.appendChild(_0x3b356f), _0x523fa0.appendChild(_0x3960f9);
        }), _0x14837d.appendChild(_0x523fa0);
        if (_0x594eb9.length < 0x5) {
            const _0x4cef69 = document.createElement("button");
            _0x4cef69.type = 'button', _0x4cef69.className = "btn btn-secondary btn-sm", _0x4cef69.style['marginTop'] = "8px", _0x4cef69.style["padding"] = "4px 10px", _0x4cef69.style["fontSize"] = "12px", _0x4cef69.innerHTML = "<i class=\"fa-solid fa-plus\"></i> Add Question", _0x4cef69.onclick = () => {
                const _0x5675b2 = _0x1a4e1e;
                _0x4ad8b9.questions["push"](''), renderDepartmentsEditor(), updateApplyPreview();
            }, _0x14837d.appendChild(_0x4cef69);
        }
        _0x2c621f.appendChild(_0x14837d), _0x54f63c.appendChild(_0x2c621f), _0x2cf371.appendChild(_0x54f63c);
    });
}

function updateDeptValue(_0x42a5a1, _0x4961e7, _0x435fc2) {
    const _0x36e437 = a0_0x201bc1;
    if (window.applyDepartments && window.applyDepartments[_0x42a5a1]) {
        window.applyDepartments[_0x42a5a1][_0x4961e7] = _0x435fc2;
        if (_0x4961e7 === "label") {
            const _0x13563c = document.getElementById("deptHeaderLabel_" + _0x42a5a1);
            if (_0x13563c) _0x13563c.textContent = _0x435fc2 || "Unnamed Department";
        }
        updateApplyPreview();
    }
}

function addDepartment() {
    const _0x2c29ab = a0_0x201bc1;
    if (!window.applyDepartments) window.applyDepartments = [];
    const _0x3126c1 = {};
    _0x3126c1.label = "New Department", _0x3126c1.emoji = '📝', _0x3126c1.role_id = '', _0x3126c1.description = 'Moderate\x20and\x20assist\x20members', _0x3126c1.questions = ["Why do you want to join our team?"], window.applyDepartments["push"](_0x3126c1), renderDepartmentsEditor(), updateApplyPreview();
}

function getRoleOptionsHtml(_0x5b9524) {
    const _0x1251a4 = a0_0x201bc1;
    let _0x18a53d = '<option\x20value=\x22\x22>Select\x20role\x20reward…</option>';
    return window.guildRoles && window.guildRoles["forEach"](_0x1a46c8 => {
        const _0x455bbd = _0x1251a4;
        _0x18a53d += '<option\x20value=\x22' + escapeHtml(_0x1a46c8.id) + '\x22\x20' + (_0x1a46c8.id === _0x5b9524 ? "selected" : '') + '>@' + escapeHtml(_0x1a46c8.name) + "</option>";
    }), _0x18a53d;
}

function updateApplyPreview() {
    const _0x29f9a2 = a0_0x201bc1,
        _0x2a3764 = document.getElementById("applyPanelTitle")?.value,
        _0x149209 = document.getElementById("applyPanelDescription")?.value,
        _0x142e95 = document.getElementById("applyBanner")?.value,
        _0x55adf3 = document.getElementById('applyPanelStyle')?.value || "menu",
        _0x24a77e = document.getElementById("guildName")?.textContent || "Server",
        _0x14b94f = document.getElementById('previewTitle');
    _0x14b94f && (_0x14b94f.textContent = _0x2a3764 || _0x24a77e + " • Staff Applications");
    const _0x240bad = document.getElementById("previewDescription");
    if (_0x240bad) {
        let _0x15827b = _0x149209 || 'め\x20」\x20**Take\x20your\x20application\x20test,\x20Our\x20team\x20is\x20waiting\x20for\x20you!**\x0a•\x20**We\x27re\x20looking\x20for\x20active\x20and\x20dedicated\x20members\x20to\x20join\x20our\x20team\x20and\x20help\x20our\x20community\x20grow!**';
        const _0x5a746f = document.createElement('div');
        _0x5a746f.textContent = _0x15827b, _0x15827b = _0x5a746f.innerHTML, _0x15827b = _0x15827b.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>'), _0x15827b = _0x15827b.replace(/\*(.*?)\*/g, "<i>$1</i>"), _0x15827b = _0x15827b.replace(/`(.*?)`/g, "<code style=\"background-color: #2b2d31; padding: 2px 4px; border-radius: 3px; font-family: monospace; font-size: 85%;\">$1</code>"), _0x15827b = _0x15827b.replace(/\n/g, "<br>"), _0x240bad.innerHTML = _0x15827b;
    }
    const _0x79b5dd = document.getElementById('previewItems');
    if (_0x79b5dd) {
        _0x79b5dd.innerHTML = '';
        const _0x19ae6c = window.applyDepartments || [];
        _0x19ae6c.forEach(_0x1f0604 => {
            const _0x1f8bc5 = _0x29f9a2,
                _0x21bcd9 = document.createElement("div");
            _0x21bcd9.style["display"] = "flex", _0x21bcd9.style["alignItems"] = "center", _0x21bcd9.style["gap"] = '6px';
            let _0x1a4c15 = '';
            if (_0x1f0604.emoji) {
                if (_0x1f0604.emoji['startsWith']('<') && _0x1f0604.emoji["endsWith"]('>')) {
                    const _0x40bae5 = _0x1f0604.emoji["match"](/:(\d+)>/);
                    _0x40bae5 ? _0x1a4c15 = "<img src=\"https://cdn.discordapp.com/emojis/" + _0x40bae5[0x1] + ".webp?size=48\" style=\"width: 18px; height: 18px; object-fit: contain;\">" : _0x1a4c15 = '🔹';
                } else _0x1a4c15 = escapeHtml(_0x1f0604.emoji);
            } else _0x1a4c15 = '•';
            _0x21bcd9.innerHTML = _0x1a4c15 + " <strong>" + escapeHtml(_0x1f0604.label || 'Unnamed') + "</strong> : <code style=\"background-color: #2b2d31; padding: 1px 4px; border-radius: 3px; font-family: monospace; color: #dbdee1;\">" + escapeHtml(_0x1f0604.description || '') + "</code>", _0x79b5dd.appendChild(_0x21bcd9);
        }), _0x79b5dd.style['display'] = _0x19ae6c.length > 0x0 ? "flex" : 'none';
    }
    const _0x2dfa36 = document.getElementById("previewBanner");
    if (_0x2dfa36) {
        const _0x378dbf = "https://media.discordapp.net/attachments/1329547343791525989/1492418340013084742/image.png?ex=69db4264&is=69d9f0e4&hm=89a4bc524d917dafd8b093478eb186879ad2dd27be947e6b2c0bd14f944ea008&=&format=webp&quality=lossless",
            _0xe9a72d = _0x142e95 || _0x378dbf;
        _0x2dfa36.src = _0xe9a72d, _0x2dfa36.style["display"] = "block";
    }
    const _0x28592b = document.getElementById("previewComponents");
    if (_0x28592b) {
        _0x28592b.innerHTML = '';
        const _0x8cac2 = window.applyDepartments || [];
        if (_0x55adf3 === "buttons") {
            const _0xaf0182 = document.createElement('div');
            _0xaf0182.style["display"] = "flex", _0xaf0182.style['gap'] = "8px", _0xaf0182.style['flexWrap'] = 'wrap', _0x8cac2.forEach(_0x2633ad => {
                const _0x28eda4 = _0x29f9a2,
                    _0x8c0417 = document.createElement("div");
                _0x8c0417.style["backgroundColor"] = '#4e5058', _0x8c0417.style["color"] = "#f2f3f5", _0x8c0417.style["borderRadius"] = "3px", _0x8c0417.style["padding"] = "6px 12px", _0x8c0417.style['fontSize'] = '13px', _0x8c0417.style['fontWeight'] = "500", _0x8c0417.style["display"] = "inline-flex", _0x8c0417.style['alignItems'] = "center", _0x8c0417.style["gap"] = "6px", _0x8c0417.style["cursor"] = "default";
                let _0x202b09 = '';
                if (_0x2633ad.emoji) {
                    if (_0x2633ad.emoji['startsWith']('<') && _0x2633ad.emoji["endsWith"]('>')) {
                        const _0x558dea = _0x2633ad.emoji["match"](/:(\d+)>/);
                        if (_0x558dea) _0x202b09 = "<img src=\"https://cdn.discordapp.com/emojis/" + _0x558dea[0x1] + ".webp?size=48\" style=\"width: 16px; height: 16px; object-fit: contain;\">";
                    } else _0x202b09 = escapeHtml(_0x2633ad.emoji);
                }
                _0x8c0417.innerHTML = _0x202b09 + " <span>" + escapeHtml(_0x2633ad.label || "Unnamed") + '</span>', _0xaf0182.appendChild(_0x8c0417);
            }), _0x28592b.appendChild(_0xaf0182);
        } else {
            const _0x2c782e = document.createElement("div");
            _0x2c782e.style["backgroundColor"] = '#2b2d31', _0x2c782e.style['border'] = '1px\x20solid\x20#1e1f22', _0x2c782e.style["borderRadius"] = "4px", _0x2c782e.style["padding"] = "8px 12px", _0x2c782e.style["display"] = "flex", _0x2c782e.style["justifyContent"] = "space-between", _0x2c782e.style["alignItems"] = "center", _0x2c782e.style["color"] = "#949ba4", _0x2c782e.style['fontSize'] = "13px", _0x2c782e.style["cursor"] = "default", _0x2c782e.innerHTML = "\n                <span>Select a department to view info...</span>\n                <i class=\"fa-solid fa-chevron-down\" style=\"font-size: 11px;\"></i>\n            ", _0x28592b.appendChild(_0x2c782e);
        }
    }
}

function loadAutoRoleTab(_0x4fc32e) {
    const _0xd39b33 = a0_0x201bc1;
    setMultiComma("autoroleRoles", _0x4fc32e.auto_role_id);
}

function loadGuildSettingsTab(_0x134eb8) {
    const _0x1901ca = a0_0x201bc1;
    setVal('guildPrefix', _0x134eb8.prefix || '&'), setMultiComma("guildOwnerRoles", _0x134eb8.owner_role_id);
}

function loadAntiBotTab(_0x435450) {
    const _0x373710 = a0_0x201bc1;
    setVal("antibotEnabled", _0x435450.is_enabled || ![]), setVal("antibotLogChannel", _0x435450.log_channel_id || '');
}

function loadAntiWebhookTab(_0x5afd8a) {
    const _0x3a9209 = a0_0x201bc1;
    setVal('antiwebhookEnabled', _0x5afd8a.is_enabled || ![]), setVal('antiwebhookLogChannel', _0x5afd8a.log_channel_id || '');
}

function loadRoomsTab(_0x2100f7) {
    const _0x21d7f7 = a0_0x201bc1;
    setVal('roomJoinChannel', _0x2100f7.join_channel || ''), setVal("roomCategory", _0x2100f7.room_category || ''), setVal("roomLogChannel", _0x2100f7.log_channel || '');
    let _0x11457b = '';
    try {
        const _0x15bc65 = JSON.parse(_0x2100f7.staff_role || '[]');
        _0x11457b = Array.isArray(_0x15bc65) ? _0x15bc65[0x0] : _0x15bc65;
    } catch {
        _0x11457b = _0x2100f7.staff_role || '';
    }
    setVal("roomStaffRole", _0x11457b), setVal('roomManagerRole', _0x2100f7.manager_role || '');
}

function loadLogsTab(_0x3f0931) {
    const _0x160bbf = a0_0x201bc1;
    let _0x2a05e7 = {};
    try {
        _0x2a05e7 = typeof _0x3f0931.channels === "string" ? JSON.parse(_0x3f0931.channels) : _0x3f0931.channels || {};
    } catch {}
    const _0x5c41ec = ["welcome", 'leave', "nickname", "role-given", "role-remove", "role-update", "ban", "messages", "voice-join", "channels", 'unban', "kick", "timeout", 'role-create', "role-delete", "emojis", "invites", 'voice-leave', "voice-move", 'voice-mute', "voice-deafen", 'voice-disconnect'];
    _0x5c41ec.forEach(_0x22e981 => {
        setVal('logChan_' + _0x22e981, _0x2a05e7[_0x22e981] || '');
    });
}
async function saveWarn() {
    const _0x454232 = a0_0x201bc1,
        _0x5e7a9c = await saveModuleConfig("warn", {
            'warn_first': document.getElementById("warnFirst")?.value || null,
            'warn_second': document.getElementById('warnSecond')?.value || null,
            'warn_last': document.getElementById("warnLast")?.value || null,
            'warner_role': document.getElementById("warnWarnerRole")?.value || null,
            'warning_logs': document.getElementById('warnLogsChannel')?.value || null
        });
    if (_0x5e7a9c) showToast('Warn\x20system\x20saved!', "success");
}
async function saveJail() {
    const _0x2f6435 = a0_0x201bc1,
        _0x10da4b = await saveModuleConfig('jail', {
            'jailed_role_id': document.getElementById("jailJailedRole")?.value || null,
            'jailer_role_id': document.getElementById("jailJailerRole")?.value || null,
            'logs_channel_id': document.getElementById("jailLogsChannel")?.value || null
        });
    if (_0x10da4b) showToast("Jail system saved!", 'success');
}
async function saveMute() {
    const _0x595efd = a0_0x201bc1,
        _0x7aa85a = await saveModuleConfig("mute", {
            'mute_role_id': document.getElementById("muteMuteRole")?.value || null,
            'mute_logs_channel': document.getElementById("muteMuteLogsChannel")?.value || null
        });
    if (_0x7aa85a) showToast("Mute system saved!", "success");
}
async function saveVerification() {
    const _0xce924d = a0_0x201bc1,
        _0x490fdc = await saveModuleConfig("verification", {
            'verificator_role': document.getElementById("verVerificatorRole")?.value || null,
            'unverified_role': document.getElementById("verUnverifiedRole")?.value || null,
            'verified_role': document.getElementById("verVerifiedRole")?.value || null,
            'verified_female_role': document.getElementById("verVerifiedFemaleRole")?.value || null,
            'verification_logs': document.getElementById("verLogsChannel")?.value || null
        });
    if (_0x490fdc) showToast("Verification system saved!", "success");
}
async function saveAntiLink() {
    const _0x29f5fc = a0_0x201bc1,
        _0x20fd6a = Array.from(document.getElementById('antilinkWlChannels')?.selectedOptions || []).map(_0x181b78 => _0x181b78.value),
        _0x48aff1 = Array.from(document.getElementById("antilinkWlRoles")?.selectedOptions || []).map(_0x5074ca => _0x5074ca.value),
        _0x30d24b = await saveModuleConfig('antilink', {
            'is_enabled': document.getElementById("antilinkEnabled")?.checked || ![],
            'action': document.getElementById("antilinkAction")?.value || 'delete',
            'whitelist_channels': JSON.stringify(_0x20fd6a),
            'whitelist_roles': JSON.stringify(_0x48aff1)
        });
    if (_0x30d24b) showToast("Anti-Link settings saved!", 'success');
}
async function saveApply() {
    const _0x31415a = a0_0x201bc1,
        _0x1a9db0 = await saveModuleConfig("apply", {
            'apply_channel_id': document.getElementById("applyChannel")?.value || null,
            'staff_channel_id': document.getElementById('applyStaffChannel')?.value || null,
            'log_channel_id': document.getElementById("applyLogChannel")?.value || null,
            'staff_role_id': document.getElementById("applyStaffRole")?.value || null,
            'panel_style': document.getElementById('applyPanelStyle')?.value || "menu",
            'panel_title': document.getElementById("applyPanelTitle")?.value || '',
            'panel_description': document.getElementById("applyPanelDescription")?.value || '',
            'banner_url': document.getElementById("applyBanner")?.value || null,
            'departments': JSON.stringify(window.applyDepartments || [])
        });
    if (_0x1a9db0) showToast('Apply\x20panel\x20saved!', 'success');
}
async function saveAutoRole() {
    const _0x2b2b6c = a0_0x201bc1,
        _0x470829 = Array.from(document.getElementById('autoroleRoles')?.selectedOptions || []).map(_0x203771 => _0x203771.value),
        _0x4ba1a1 = await saveModuleConfig('autorole', {
            'auto_role_id': _0x470829.join(',')
        });
    if (_0x4ba1a1) showToast("Auto Role settings saved!", "success");
}
async function saveGuildSettings() {
    const _0x33289f = a0_0x201bc1,
        _0x5966d2 = Array.from(document.getElementById('guildOwnerRoles')?.selectedOptions || []).map(_0x3dfd87 => _0x3dfd87.value),
        _0x1b149f = await saveModuleConfig('guildsettings', {
            'prefix': document.getElementById('guildPrefix')?.value || '&',
            'owner_role_id': _0x5966d2.join(',')
        });
    if (_0x1b149f) showToast("General settings saved!", "success");
}
async function saveAntiBot() {
    const _0x49c057 = a0_0x201bc1,
        _0x1e81ec = await saveModuleConfig("antibot", {
            'is_enabled': document.getElementById("antibotEnabled")?.checked || ![],
            'log_channel_id': document.getElementById("antibotLogChannel")?.value || null
        });
    if (_0x1e81ec) showToast("Anti-Bot settings saved!", "success");
}
async function saveAntiWebhook() {
    const _0x6ffec1 = a0_0x201bc1,
        _0x5e90ae = await saveModuleConfig("antiwebhook", {
            'is_enabled': document.getElementById("antiwebhookEnabled")?.checked || ![],
            'log_channel_id': document.getElementById("antiwebhookLogChannel")?.value || null
        });
    if (_0x5e90ae) showToast("Anti-Webhook settings saved!", "success");
}
async function saveRooms() {
    const _0x76854f = a0_0x201bc1,
        _0x45f994 = document.getElementById("roomStaffRole")?.value,
        _0x1cfdb5 = await saveModuleConfig('rooms', {
            'join_channel': document.getElementById("roomJoinChannel")?.value || null,
            'room_category': document.getElementById("roomCategory")?.value || null,
            'log_channel': document.getElementById("roomLogChannel")?.value || null,
            'staff_role': _0x45f994 ? JSON.stringify([_0x45f994]) : '[]',
            'manager_role': document.getElementById("roomManagerRole")?.value || null
        });
    if (_0x1cfdb5) showToast("Room setup saved!", "success");
}
async function saveLogs() {
    const _0x500e95 = a0_0x201bc1,
        _0x4e926c = ["welcome", 'leave', "nickname", "role-given", 'role-remove', "role-update", "ban", "messages", "voice-join", "channels", "unban", 'kick', "timeout", 'role-create', 'role-delete', "emojis", 'invites', "voice-leave", "voice-move", "voice-mute", "voice-deafen", "voice-disconnect"],
        _0x1b1ebf = {};
    _0x4e926c.forEach(_0x268010 => {
        const _0x3e7ea3 = _0x500e95,
            _0x12184a = document.getElementById("logChan_" + _0x268010)?.value;
        if (_0x12184a) _0x1b1ebf[_0x268010] = _0x12184a;
    });
    const _0x2a569d = await saveModuleConfig("logs", {
        'channels': JSON.stringify(_0x1b1ebf)
    });
    if (_0x2a569d) showToast("Server logging saved!", 'success');
}

function loadWelcomeTab(_0x22b6d6) {
    const _0x45c588 = a0_0x201bc1;
    if (!_0x22b6d6) return;
    const _0x18c5dc = (_0x180a47, _0x39d996) => {
        const _0x119e88 = a0_0x38ca,
            _0x446b5d = document.getElementById(_0x180a47);
        _0x446b5d && (_0x446b5d.value !== undefined ? _0x446b5d.value = _0x39d996 : _0x446b5d.checked = _0x39d996, _0x446b5d.tagName === "SELECT" && document.getElementById('wrap-' + _0x180a47) && syncCustomSelect(_0x180a47));
    };
    document.getElementById("welcomeEnabled") && (document.getElementById("welcomeEnabled").checked = _0x22b6d6.welcome_enabled || ![]), document.getElementById('leaveEnabled') && (document.getElementById('leaveEnabled').checked = _0x22b6d6.leave_enabled || ![]), _0x18c5dc("welcomeChannel", _0x22b6d6.welcome_channel || ''), _0x18c5dc("welcomeText", _0x22b6d6.welcome_message || "Welcome {user} to {server}!"), _0x18c5dc('welcomeBgImage', _0x22b6d6.welcome_bg_image || ''), _0x18c5dc("leaveChannel", _0x22b6d6.leave_channel || ''), _0x18c5dc("leaveText", _0x22b6d6.leave_message || "{user} has left the server."), updateLivePreview();
}

function updateLivePreview() {
    const _0x31356f = a0_0x201bc1,
        _0x43f31f = document.getElementById("welcomeText"),
        _0x6c0d20 = document.getElementById("previewText"),
        _0x44bd31 = document.getElementById('guildName');
    if (!_0x43f31f || !_0x6c0d20) return;
    const _0x470d53 = _0x44bd31 ? _0x44bd31.textContent : "Server",
        _0x56df70 = escapeHtml(_0x43f31f.value).replace(/\{user\}/g, "<span class=\"mention\">@Username</span>").replace(/\{username\}/g, '<b>Username</b>').replace(/\{server\}/g, "<b>" + escapeHtml(_0x470d53) + "</b>").replace(/\{memberCount\}/g, "<b>1,245</b>");
    _0x6c0d20.innerHTML = _0x56df70;
}
async function saveWelcomeSettings() {
    const _0x4d4021 = a0_0x201bc1,
        _0x18e25b = {
            'welcome_enabled': document.getElementById("welcomeEnabled")?.checked || ![],
            'welcome_channel': document.getElementById('welcomeChannel')?.value || '',
            'welcome_message': document.getElementById("welcomeText")?.value || '',
            'welcome_bg_image': document.getElementById("welcomeBgImage")?.value || '',
            'leave_enabled': document.getElementById('leaveEnabled')?.checked || ![],
            'leave_channel': document.getElementById("leaveChannel")?.value || '',
            'leave_message': document.getElementById("leaveText")?.value || ''
        },
        _0x2a405a = await saveModuleConfig("welcome", _0x18e25b);
    if (_0x2a405a) showToast("Welcome & Leave settings saved!", "success");
}

function loadAutoModTab(_0x17eab7, _0x5acc06, _0x4063bd) {
    const _0x235217 = a0_0x201bc1;
    if (!_0x17eab7) return;
    const _0x2ff16f = (_0x17e489, _0x10917c) => {
        const _0x434d6e = a0_0x38ca,
            _0xd2589f = document.getElementById(_0x17e489);
        if (_0xd2589f) _0xd2589f.checked = _0x10917c;
    };
    _0x2ff16f("amSpam", _0x17eab7.spam_enabled || ![]), _0x2ff16f('amLinks', _0x17eab7.links_enabled || ![]), _0x2ff16f("amInvites", _0x17eab7.invites_enabled || ![]), _0x2ff16f("amBadWords", _0x17eab7.bad_words_enabled || ![]);
    const _0x64e941 = document.getElementById('amBadWordsList');
    if (_0x64e941) _0x64e941.value = _0x17eab7.bad_words_list || '';
    const _0x250c75 = document.getElementById("amPunishment");
    if (_0x250c75) _0x250c75.value = _0x17eab7.punishment || "warn";
    _0x5acc06 && setMulti("amLinksWlRoles", _0x5acc06.whitelist_roles), _0x4063bd && setVal("amLogChannel", _0x4063bd.log_channel || '');
}
async function saveAutoMod() {
    const _0x5f835d = a0_0x201bc1,
        _0x5e0858 = {
            'spam_enabled': document.getElementById('amSpam')?.checked || ![],
            'links_enabled': document.getElementById("amLinks")?.checked || ![],
            'invites_enabled': document.getElementById("amInvites")?.checked || ![],
            'bad_words_enabled': document.getElementById("amBadWords")?.checked || ![],
            'bad_words_list': document.getElementById("amBadWordsList")?.value || '',
            'punishment': document.getElementById("amPunishment")?.value || "warn"
        },
        _0x618a17 = await saveModuleConfig("automod", _0x5e0858),
        _0x413e23 = document.getElementById("amLinksWlRoles");
    if (_0x413e23) {
        const _0x404875 = Array.from(_0x413e23.selectedOptions || []).map(_0x45960c => _0x45960c.value),
            _0x20d761 = await fetch('/api/guilds/' + activeGuildId),
            _0x4dc37e = await _0x20d761.json()["catch"](() => ({})),
            _0x187bb7 = _0x4dc37e.configs?.antilink || {};
        await saveModuleConfig("antilink", {
            'is_enabled': _0x187bb7.is_enabled || ![],
            'action': _0x187bb7.action || 'delete',
            'whitelist_channels': _0x187bb7.whitelist_channels || '[]',
            'whitelist_roles': JSON.stringify(_0x404875)
        });
    }
    const _0x4cdd4f = document.getElementById("amLogChannel");
    if (_0x4cdd4f) {
        const _0x3d0500 = _0x4cdd4f.value || null,
            _0x4ee82a = await fetch("/api/guilds/" + activeGuildId),
            _0x37bf99 = await _0x4ee82a.json()["catch"](() => ({})),
            _0x1f6575 = _0x37bf99.configs?.guildSettings || {},
            _0x2e8df9 = {};
        _0x2e8df9.prefix = _0x1f6575.prefix || '&', _0x2e8df9.owner_role_id = _0x1f6575.owner_role_id || '', _0x2e8df9.log_channel = _0x3d0500, await saveModuleConfig("guildsettings", _0x2e8df9);
    }
    if (_0x618a17) showToast("AutoMod rules saved!", "success");
}

function loadEconomyTab(_0x2a7d07) {
    const _0x1e2fa3 = a0_0x201bc1;
    if (!_0x2a7d07) return;
    try {
        economyShopItems = JSON.parse(_0x2a7d07.shop_items || '[]'), renderShopItems();
    } catch (_0x5b770c) {
        economyShopItems = [];
    }
}

function renderShopItems() {
    const _0x59faa4 = a0_0x201bc1,
        _0x9aa1e7 = document.getElementById("shopList");
    if (!_0x9aa1e7) return;
    if (economyShopItems.length === 0x0) {
        _0x9aa1e7.innerHTML = "<div style=\"color:var(--text-2);font-size:14px;text-align:center;padding:20px;\">No shop items yet. Create one above!</div>";
        return;
    }
    _0x9aa1e7.innerHTML = '\x0a\x20\x20\x20\x20\x20\x20\x20\x20<table\x20class=\x22data-table\x22>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<thead><tr><th>Name</th><th>Price</th><th>Description</th><th></th></tr></thead>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<tbody>' + economyShopItems.map((_0x42f304, _0x2dac13) => "\n                <tr>\n                    <td><strong>" + escapeHtml(_0x42f304.name) + "</strong></td>\n                    <td>🪙 " + escapeHtml(String(_0x42f304.price?.toLocaleString() ?? 0x0)) + "</td>\n                    <td style=\"color:var(--text-2)\">" + escapeHtml(_0x42f304.description) + "</td>\n                    <td><button class=\"btn btn-danger btn-sm\" onclick=\"removeShopItem(" + parseInt(_0x2dac13) + ")\"><i class=\"fa-solid fa-trash\"></i></button></td>\n                </tr>").join('') + '\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</tbody>\x0a\x20\x20\x20\x20\x20\x20\x20\x20</table>';
}

function addShopItem() {
    const _0x2e39e = a0_0x201bc1,
        _0x539182 = document.getElementById("shopItemName")?.value.trim(),
        _0x32a700 = parseInt(document.getElementById('shopItemPrice')?.value),
        _0x3bab0b = document.getElementById("shopItemRole")?.value,
        _0x196190 = document.getElementById("shopItemDesc")?.value.trim();
    if (!_0x539182 || isNaN(_0x32a700) || _0x32a700 <= 0x0) {
        showToast("Please enter a valid name and price.", 'warning');
        return;
    }
    economyShopItems.push({
        'id': "item_" + Date.now(),
        'name': _0x539182,
        'price': _0x32a700,
        'role_id': _0x3bab0b || null,
        'description': _0x196190 || "No description."
    }), ["shopItemName", "shopItemPrice", "shopItemDesc"].forEach(_0x519750 => {
        const _0x13fd91 = _0x2e39e,
            _0x588fb1 = document.getElementById(_0x519750);
        if (_0x588fb1) _0x588fb1.value = '';
    }), renderShopItems(), showToast('\x22' + _0x539182 + "\" added to shop!", 'success');
}

function removeShopItem(_0x1f0190) {
    const _0x324f23 = a0_0x201bc1,
        _0x104dc6 = economyShopItems.splice(_0x1f0190, 0x1)[0x0];
    renderShopItems(), showToast('\x22' + _0x104dc6.name + "\" removed.", "info");
}
async function saveEconomy() {
    const _0x47b483 = a0_0x201bc1,
        _0x1c5049 = await saveModuleConfig('economy', {
            'shop_items': JSON.stringify(economyShopItems)
        });
    if (_0x1c5049) showToast("Shop saved!", "success");
}
async function launchGiveaway() {
    const _0x3a9b9f = a0_0x201bc1,
        _0x354ff8 = document.getElementById('giveawayChannel')?.value,
        _0x44606b = document.getElementById('giveawayPrize')?.value.trim(),
        _0x846687 = parseInt(document.getElementById("giveawayWinners")?.value),
        _0x4741ce = parseInt(document.getElementById("giveawayDuration")?.value);
    if (!_0x354ff8 || !_0x44606b || isNaN(_0x846687) || isNaN(_0x4741ce) || _0x846687 < 0x1 || _0x4741ce < 0x1) {
        showToast('Please\x20fill\x20all\x20giveaway\x20fields.', "warning");
        return;
    }
    try {
        const _0x53464d = {};
        _0x53464d["Content-Type"] = "application/json";
        const _0x85292a = {};
        _0x85292a.channelId = _0x354ff8, _0x85292a.prize = _0x44606b, _0x85292a.winners = _0x846687, _0x85292a.duration = _0x4741ce;
        const _0xa9ae5e = await fetch('/api/guilds/' + activeGuildId + "/config/giveaway", {
            'method': 'POST',
            'headers': _0x53464d,
            'body': JSON.stringify(_0x85292a)
        });
        _0xa9ae5e.ok ? showToast('Giveaway\x20launched\x20on\x20Discord!\x20<a:pink8:1337678972108148757>', 'success') : showToast("Failed to launch giveaway.", "error");
    } catch {
        showToast("Network error.", "error");
    }
}

function loadCommandsTab(_0x1abb95) {
    const _0x358227 = a0_0x201bc1;
    guildCustomCommands = Array.isArray(_0x1abb95) ? _0x1abb95 : [], renderCommandsList();
}

function renderCommandsList() {
    const _0x2dd924 = a0_0x201bc1,
        _0xd7ad37 = document.getElementById("customCommandsBody");
    if (!_0xd7ad37) return;
    if (guildCustomCommands.length === 0x0) {
        _0xd7ad37.innerHTML = "<tr><td colspan=\"4\" style=\"text-align:center;color:var(--text-2);padding:24px;\">No custom commands created yet.</td></tr>";
        return;
    }
    _0xd7ad37.innerHTML = guildCustomCommands.map(_0x32b242 => {
        const _0x17596e = _0x2dd924,
            _0x24db7a = _0x32b242.type === "slash" ? "<span class=\"badge\" style=\"background:linear-gradient(135deg, #a855f7, #6366f1);color:#fff;padding:4px 8px;border-radius:4px;font-size:11px;\">Slash</span>" : "<span class=\"badge badge-info\">Prefix</span>",
            _0x234d8b = _0x32b242.type === 'slash' ? '/' + escapeHtml(_0x32b242.name) : '' + escapeHtml(_0x32b242.name);
        return "\n            <tr>\n                <td style=\"font-weight:600;color:var(--text-1);\">" + _0x234d8b + "</td>\n                <td>" + _0x24db7a + "</td>\n                <td style=\"max-width:300px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--text-2);\" title=\"" + escapeHtml(_0x32b242.reply_template || '') + '\x22>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20' + escapeHtml(_0x32b242.reply_template || '') + '\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</td>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<td\x20style=\x22text-align:right;\x22>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<button\x20class=\x22btn\x20btn-danger\x22\x20onclick=\x22deleteCustomCommand(' + _0x32b242.id + ")\" style=\"padding:6px 12px;font-size:12px;\">\n                        <i class=\"fa-solid fa-trash-can\"></i> Delete\n                    </button>\n                </td>\n            </tr>\n        ";
    }).join('');
}
async function addCustomCommand() {
    const _0x2bf667 = a0_0x201bc1,
        _0x2b5acf = document.getElementById("cmdName")?.value.trim(),
        _0x2b2d79 = document.getElementById("cmdType")?.value,
        _0x264437 = document.getElementById('cmdReply')?.value.trim();
    if (!_0x2b5acf || !_0x264437) {
        showToast("Please fill the command name and response.", "warning");
        return;
    }
    try {
        const _0x1f7810 = {};
        _0x1f7810["Content-Type"] = 'application/json';
        const _0x17fac8 = {};
        _0x17fac8.name = _0x2b5acf, _0x17fac8.type = _0x2b2d79, _0x17fac8.reply = _0x264437;
        const _0x3af5df = await fetch('/api/guilds/' + activeGuildId + "/config/commands", {
            'method': "POST",
            'headers': _0x1f7810,
            'body': JSON.stringify(_0x17fac8)
        });
        if (_0x3af5df.ok) {
            const _0xcc470c = await _0x3af5df.json();
            showToast('Command\x20\x22/' + _0x2b5acf + "\" created!", "success"), ["cmdName", "cmdReply"].forEach(_0x4f6ec0 => {
                const _0x52b049 = _0x2bf667,
                    _0x39a7fe = document.getElementById(_0x4f6ec0);
                if (_0x39a7fe) _0x39a7fe.value = '';
            }), _0xcc470c.command && (guildCustomCommands.push(_0xcc470c.command), renderCommandsList());
        } else {
            const _0x5245a1 = await _0x3af5df.json()["catch"](() => ({}));
            showToast(_0x5245a1.error || "Failed to create command.", "error");
        }
    } catch {
        showToast('Network\x20error.', 'error');
    }
}
async function deleteCustomCommand(_0x5eee19) {
    const _0x219adf = a0_0x201bc1;
    if (!confirm('Are\x20you\x20sure\x20you\x20want\x20to\x20delete\x20this\x20custom\x20command?')) return;
    try {
        const _0x58e7b3 = {};
        _0x58e7b3.method = "DELETE";
        const _0x3bd339 = await fetch("/api/guilds/" + activeGuildId + "/config/commands/" + _0x5eee19, _0x58e7b3);
        _0x3bd339.ok ? (showToast('Custom\x20command\x20deleted\x20successfully.', "success"), guildCustomCommands = guildCustomCommands.filter(_0x1dc397 => _0x1dc397.id !== _0x5eee19), renderCommandsList()) : showToast('Failed\x20to\x20delete\x20command.', 'error');
    } catch {
        showToast('Network\x20error.', "error");
    }
}
async function fetchAuditLogs() {
    const _0x3c3114 = a0_0x201bc1;
    try {
        const _0x26dea8 = await fetch('/api/guilds/' + activeGuildId + "/auditlogs"),
            _0x354e43 = await _0x26dea8.json(),
            _0x6e2821 = document.getElementById('auditLogsBody');
        if (!_0x6e2821) return;
        if (!Array.isArray(_0x354e43) || _0x354e43.length === 0x0) {
            _0x6e2821.innerHTML = '<tr><td\x20colspan=\x224\x22\x20style=\x22text-align:center;color:var(--text-2);padding:28px;\x22>No\x20audit\x20logs\x20recorded\x20yet.</td></tr>';
            return;
        }
        _0x6e2821.innerHTML = _0x354e43.map(_0x4b52f4 => "\n            <tr>\n                <td><span class=\"badge badge-info\">" + escapeHtml(String(_0x4b52f4.user_id || '')) + "</span></td>\n                <td>" + escapeHtml(String(_0x4b52f4.action || '')) + "</td>\n                <td><span class=\"badge badge-warn\">" + escapeHtml(String(_0x4b52f4.module || '—')) + '</span></td>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<td\x20style=\x22color:var(--text-2)\x22>' + escapeHtml(new Date(_0x4b52f4.created_at).toLocaleString()) + '</td>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</tr>').join('');
    } catch {}
}
async function fetchApiKeys() {
    const _0x20188d = a0_0x201bc1;
    try {
        const _0xc227f5 = await fetch("/api/guilds/" + activeGuildId + "/apikeys"),
            _0x1848ca = await _0xc227f5.json(),
            _0x55fb7f = document.getElementById('apiKeysList');
        if (!_0x55fb7f) return;
        if (!Array.isArray(_0x1848ca) || _0x1848ca.length === 0x0) {
            _0x55fb7f.innerHTML = "<div style=\"color:var(--text-2);font-size:14px;text-align:center;padding:20px;\">No tokens generated yet.</div>";
            return;
        }
        _0x55fb7f.innerHTML = _0x1848ca.map(_0x446d88 => '\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x22api-key-item\x22>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20style=\x22font-weight:700;font-size:14px;margin-bottom:4px;\x22>' + escapeHtml(_0x446d88.label) + '</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20style=\x22font-size:12px;color:var(--text-2)\x22>Used\x20' + escapeHtml(String(_0x446d88.usage_count || 0x0)) + " times · Last: " + (_0x446d88.last_used ? escapeHtml(new Date(_0x446d88.last_used).toLocaleString()) : 'Never') + "</div>\n                </div>\n                <span class=\"api-key-value\">" + escapeHtml(_0x446d88.key) + "</span>\n                <button class=\"btn btn-danger btn-sm\" onclick=\"deleteApiKey('" + escapeHtml(_0x446d88.key) + "')\"><i class=\"fa-solid fa-trash\"></i></button>\n            </div>").join('');
    } catch {}
}
async function generateApiKey() {
    const _0x1551f1 = a0_0x201bc1,
        _0x4a387d = document.getElementById('apiKeyLabel')?.value.trim();
    if (!_0x4a387d) return showToast("Please enter a key label.", "warning");
    const _0x102221 = {};
    _0x102221["Content-Type"] = 'application/json';
    const _0x422c3b = {};
    _0x422c3b.label = _0x4a387d, await fetch("/api/guilds/" + activeGuildId + "/apikeys", {
        'method': "POST",
        'headers': _0x102221,
        'body': JSON.stringify(_0x422c3b)
    });
    const _0x5931ff = document.getElementById("apiKeyLabel");
    if (_0x5931ff) _0x5931ff.value = '';
    fetchApiKeys(), showToast('API\x20token\x20generated!', 'success');
}
async function deleteApiKey(_0x5dc252) {
    const _0x2649b8 = a0_0x201bc1,
        _0x5adb7d = {};
    _0x5adb7d.method = "DELETE", await fetch("/api/guilds/" + activeGuildId + "/apikeys/" + _0x5dc252, _0x5adb7d), fetchApiKeys(), showToast("Token revoked.", "info");
}
async function fetchAnalytics() {
    const _0x278334 = a0_0x201bc1;
    try {
        const _0x1f83bd = await fetch("/api/guilds/" + activeGuildId + "/analytics"),
            _0x1affad = await _0x1f83bd.json(),
            _0xdf4755 = (_0x482cf6, _0x514cec) => {
                const _0x28bc0f = _0x278334,
                    _0x4bd11f = document.getElementById(_0x482cf6);
                if (_0x4bd11f) _0x4bd11f.textContent = _0x514cec?.toLocaleString() ?? '—';
            };
        _0xdf4755("statMembers", _0x1affad.totalMembers), _0xdf4755("statBlocks", _0x1affad.warningsIssued), _0xdf4755("statTickets", _0x1affad.openTickets), _0xdf4755('statMessages', _0x1affad.messagesLogged || 0x0), drawChart(_0x1affad.growth || [], _0x1affad.totalMembers || 0x64);
    } catch {
        ['statMembers', 'statBlocks', "statTickets", "statMessages"].forEach(_0x2e4a07 => {
            const _0x5635a1 = _0x278334,
                _0x122827 = document.getElementById(_0x2e4a07);
            if (_0x122827) _0x122827.textContent = '—';
        }), drawChart([], 0x64);
    }
}

function a0_0x38ca(_0x377242, _0x2d1f12) {
    _0x377242 = _0x377242 - 0x107;
    const _0x293b1a = a0_0x293b();
    let _0x38ca64 = _0x293b1a[_0x377242];
    if (a0_0x38ca.uCqgsp === undefined) {
        var _0x2067e0 = function(_0x2a96bd) {
            const _0x4c8125 = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+/=';
            let _0x41d7cf = '',
                _0x38f056 = '';
            for (let _0x3baf12 = 0x0, _0x2fed28, _0x4701b1, _0x3eae63 = 0x0; _0x4701b1 = _0x2a96bd.charAt(_0x3eae63++); ~_0x4701b1 && (_0x2fed28 = _0x3baf12 % 0x4 ? _0x2fed28 * 0x40 + _0x4701b1 : _0x4701b1, _0x3baf12++ % 0x4) ? _0x41d7cf += String.fromCharCode(0xff & _0x2fed28 >> (-0x2 * _0x3baf12 & 0x6)) : 0x0) {
                _0x4701b1 = _0x4c8125.indexOf(_0x4701b1);
            }
            for (let _0x4e14c0 = 0x0, _0x537380 = _0x41d7cf.length; _0x4e14c0 < _0x537380; _0x4e14c0++) {
                _0x38f056 += '%' + ('00' + _0x41d7cf.charCodeAt(_0x4e14c0).toString(0x10)).slice(-0x2);
            }
            return decodeURIComponent(_0x38f056);
        };
        const _0xe9ce11 = function(_0x5ba632, _0x5b42dd) {
            let _0x4f6ac1 = [],
                _0x15b928 = 0x0,
                _0x2c51ae, _0x9162f0 = '';
            _0x5ba632 = _0x2067e0(_0x5ba632);
            let _0x8ebf78;
            for (_0x8ebf78 = 0x0; _0x8ebf78 < 0x100; _0x8ebf78++) {
                _0x4f6ac1[_0x8ebf78] = _0x8ebf78;
            }
            for (_0x8ebf78 = 0x0; _0x8ebf78 < 0x100; _0x8ebf78++) {
                _0x15b928 = (_0x15b928 + _0x4f6ac1[_0x8ebf78] + _0x5b42dd.charCodeAt(_0x8ebf78 % _0x5b42dd.length)) % 0x100, _0x2c51ae = _0x4f6ac1[_0x8ebf78], _0x4f6ac1[_0x8ebf78] = _0x4f6ac1[_0x15b928], _0x4f6ac1[_0x15b928] = _0x2c51ae;
            }
            _0x8ebf78 = 0x0, _0x15b928 = 0x0;
            for (let _0x115232 = 0x0; _0x115232 < _0x5ba632.length; _0x115232++) {
                _0x8ebf78 = (_0x8ebf78 + 0x1) % 0x100, _0x15b928 = (_0x15b928 + _0x4f6ac1[_0x8ebf78]) % 0x100, _0x2c51ae = _0x4f6ac1[_0x8ebf78], _0x4f6ac1[_0x8ebf78] = _0x4f6ac1[_0x15b928], _0x4f6ac1[_0x15b928] = _0x2c51ae, _0x9162f0 += String.fromCharCode(_0x5ba632.charCodeAt(_0x115232) ^ _0x4f6ac1[(_0x4f6ac1[_0x8ebf78] + _0x4f6ac1[_0x15b928]) % 0x100]);
            }
            return _0x9162f0;
        };
        a0_0x38ca.lecLvi = _0xe9ce11, a0_0x38ca.ctNnje = {}, a0_0x38ca.uCqgsp = !![];
    }
    const _0x12e64a = _0x293b1a[0x0],
        _0x42828c = _0x377242 + _0x12e64a,
        _0x1213fd = a0_0x38ca.ctNnje[_0x42828c];
    return !_0x1213fd ? (a0_0x38ca.iZPsbC === undefined && (a0_0x38ca.iZPsbC = !![]), _0x38ca64 = a0_0x38ca.lecLvi(_0x38ca64, _0x2d1f12), a0_0x38ca.ctNnje[_0x42828c] = _0x38ca64) : _0x38ca64 = _0x1213fd, _0x38ca64;
}

function drawChart(_0x4722bc, _0x294336) {
    const _0x2924f1 = a0_0x201bc1,
        _0x2b4e64 = document.getElementById("analyticsChart");
    if (!_0x2b4e64) return;
    if (!_0x4722bc.length) {
        const _0x135c03 = {};
        _0x135c03.date = "Mon", _0x135c03.count = 0xc;
        const _0x562b99 = {};
        _0x562b99.date = 'Tue', _0x562b99.count = 0x13;
        const _0x1c9c4b = {};
        _0x1c9c4b.date = "Wed", _0x1c9c4b.count = 0x8;
        const _0x3b41ec = {};
        _0x3b41ec.date = "Thu", _0x3b41ec.count = 0x1b;
        const _0x1ce1e7 = {};
        _0x1ce1e7.date = "Fri", _0x1ce1e7.count = 0xf;
        const _0x16798a = {};
        _0x16798a.date = "Sat", _0x16798a.count = 0x22;
        const _0x5002cc = {};
        _0x5002cc.date = "Sun", _0x5002cc.count = 0x16, _0x4722bc = [_0x135c03, _0x562b99, _0x1c9c4b, _0x3b41ec, _0x1ce1e7, _0x16798a, _0x5002cc];
    }
    const _0x20ab2f = 0x2bc,
        _0x3209ed = 0xa0,
        _0x89ce0d = 0x14,
        _0x1c44b2 = 0x14,
        _0x3ad41e = 0x14,
        _0x5788b1 = 0x1e,
        _0x1067f9 = _0x20ab2f - _0x89ce0d - _0x1c44b2,
        _0xb98e1f = _0x3209ed - _0x3ad41e - _0x5788b1,
        _0x5f3b39 = Math.max(..._0x4722bc.map(_0x356b88 => _0x356b88.count), 0x1),
        _0x4c6d78 = _0x1067f9 / (_0x4722bc.length - 0x1 || 0x1),
        _0x214701 = _0x4722bc.map((_0x10c572, _0x449a6e) => {
            const _0x2b3d2d = _0x2924f1,
                _0x1b754b = _0x89ce0d + _0x449a6e * _0x4c6d78,
                _0x4180e2 = _0x3ad41e + _0xb98e1f - _0x10c572.count / _0x5f3b39 * _0xb98e1f,
                _0xade70 = {};
            return _0xade70.x = _0x1b754b, _0xade70.y = _0x4180e2, _0xade70.d = _0x10c572, _0xade70;
        }),
        _0x53287d = _0x214701.map(_0x1943ed => _0x1943ed.x + ',' + _0x1943ed.y).join('\x20'),
        _0x5e8801 = 'M' + _0x89ce0d + ',' + (_0x3ad41e + _0xb98e1f) + '\x20' + _0x214701.map(_0x303266 => 'L' + _0x303266.x + ',' + _0x303266.y).join('\x20') + ('\x20L' + (_0x89ce0d + _0x1067f9) + ',' + (_0x3ad41e + _0xb98e1f) + '\x20Z');
    _0x2b4e64.innerHTML = "\n        <defs>\n            <linearGradient id=\"chartGrad\" x1=\"0\" y1=\"0\" x2=\"0\" y2=\"1\">\n                <stop offset=\"0%\" stop-color=\"#00e5ff\" stop-opacity=\"0.25\"/>\n                <stop offset=\"100%\" stop-color=\"#00e5ff\" stop-opacity=\"0\"/>\n            </linearGradient>\n        </defs>\n        <path d=\"" + _0x5e8801 + "\" fill=\"url(#chartGrad)\"/>\n        <polyline points=\"" + _0x53287d + "\" fill=\"none\" stroke=\"#00e5ff\" stroke-width=\"2.5\" stroke-linejoin=\"round\" stroke-linecap=\"round\"/>\n        " + _0x214701.map(_0x1278a4 => "\n            <circle cx=\"" + _0x1278a4.x + "\" cy=\"" + _0x1278a4.y + "\" r=\"4\" fill=\"#00e5ff\" stroke=\"#070a10\" stroke-width=\"2\"/>\n            <text x=\"" + _0x1278a4.x + "\" y=\"" + (_0x3ad41e + _0xb98e1f + 0x12) + "\" fill=\"#4a5568\" font-size=\"11\" text-anchor=\"middle\" font-family=\"Inter,sans-serif\">" + _0x1278a4.d["date"] + "</text>\n        ").join('') + "\n    ";
}
async function saveModuleConfig(_0x308d0c, _0x2cee3e) {
    const _0x18a076 = a0_0x201bc1;
    try {
        const _0x4cb158 = {};
        _0x4cb158["Content-Type"] = "application/json";
        const _0x401e1d = await fetch("/api/guilds/" + activeGuildId + "/config/" + _0x308d0c, {
            'method': "POST",
            'headers': _0x4cb158,
            'body': JSON.stringify(_0x2cee3e)
        });
        if (_0x401e1d.ok) return !![];
        const _0x2115e4 = await _0x401e1d.json()["catch"](() => ({}));
        return showToast(_0x2115e4.error || "Save failed.", "error"), ![];
    } catch {
        return showToast('Network\x20error.', "error"), ![];
    }
}

function initCustomSelect(_0x5ccb14) {
    const _0x11450f = a0_0x201bc1;
    if (!_0x5ccb14 || _0x5ccb14.dataset["customSelectInit"]) return;
    _0x5ccb14.dataset["customSelectInit"] = 'true';
    const _0x59a0cc = _0x5ccb14.id || "select-" + Math.random().toString(0x24).substr(0x2, 0x9);
    if (!_0x5ccb14.id) _0x5ccb14.id = _0x59a0cc;
    const _0x14559e = _0x5ccb14.multiple,
        _0x45df9f = _0x5ccb14.getAttribute("placeholder") || (_0x5ccb14.options[0x0] && _0x5ccb14.options[0x0].value === '' ? _0x5ccb14.options[0x0].text : '') || (_0x14559e ? 'Select\x20options…' : 'Select\x20an\x20option…'),
        _0x2b276b = document.createElement('div');
    _0x2b276b.className = "custom-multiselect-wrap " + (_0x14559e ? "is-multiple" : 'is-single'), _0x2b276b.id = "wrap-" + _0x59a0cc;
    const _0x4dc001 = document.createElement("div");
    _0x4dc001.className = "custom-multiselect-display";
    const _0x13abd4 = document.createElement("div");
    _0x13abd4.className = "custom-multiselect-tags";
    const _0x2a2f9c = document.createElement("span");
    _0x2a2f9c.className = 'custom-select-value';
    _0x14559e ? _0x4dc001.appendChild(_0x13abd4) : _0x4dc001.appendChild(_0x2a2f9c);
    const _0x3d5a10 = document.createElement("div");
    _0x3d5a10.className = "custom-multiselect-dropdown";
    const _0x3cf1b1 = document.createElement('div');
    _0x3cf1b1.className = 'custom-multiselect-search-wrap', _0x3cf1b1.innerHTML = "\n        <i class=\"fa-solid fa-magnifying-glass\"></i>\n        <input type=\"text\" class=\"custom-multiselect-search\" placeholder=\"Type to search…\">\n    ";
    const _0x19eeeb = _0x3cf1b1.querySelector(".custom-multiselect-search"),
        _0x42650e = document.createElement('div');
    _0x42650e.className = "custom-multiselect-options-list", _0x3d5a10.appendChild(_0x3cf1b1), _0x3d5a10.appendChild(_0x42650e), _0x2b276b.appendChild(_0x4dc001), _0x2b276b.appendChild(_0x3d5a10), _0x5ccb14.style["display"] = 'none', _0x5ccb14.parentNode["insertBefore"](_0x2b276b, _0x5ccb14), _0x4dc001.addEventListener("click", _0x450dec => {
        const _0x26fd43 = _0x11450f;
        if (_0x450dec.target["closest"](".custom-multiselect-tag-remove")) return;
        const _0x516451 = _0x2b276b.classList["contains"]("open");
        document.querySelectorAll(".custom-multiselect-wrap.open").forEach(_0x45a987 => {
            const _0x4b7132 = _0x26fd43;
            if (_0x45a987 !== _0x2b276b) _0x45a987.classList["remove"]("open");
        }), _0x516451 ? _0x2b276b.classList["remove"]("open") : (_0x2b276b.classList["add"]("open"), _0x19eeeb.value = '', filterOptions(_0x2b276b, ''), _0x19eeeb.focus());
    }), _0x19eeeb.addEventListener("input", () => {
        const _0x49c610 = _0x11450f;
        filterOptions(_0x2b276b, _0x19eeeb.value["toLowerCase"]());
    }), _0x19eeeb.addEventListener("keydown", _0x410450 => {
        const _0x31c668 = _0x11450f;
        _0x410450.key === "Escape" && _0x2b276b.classList["remove"]("open");
    });
    const _0x36995a = new MutationObserver(() => {
            syncCustomSelect(_0x59a0cc, _0x45df9f);
        }),
        _0x4842a0 = {};
    _0x4842a0.childList = !![], _0x4842a0.subtree = !![], _0x36995a.observe(_0x5ccb14, _0x4842a0), syncCustomSelect(_0x59a0cc, _0x45df9f);
}

function syncCustomSelect(_0x5946a4, _0x4a5a9e) {
    const _0x421d31 = a0_0x201bc1,
        _0xabe748 = document.getElementById(_0x5946a4),
        _0x2357fb = document.getElementById("wrap-" + _0x5946a4);
    if (!_0xabe748 || !_0x2357fb) return;
    const _0x106856 = _0xabe748.multiple,
        _0x3b3496 = _0x2357fb.querySelector('.custom-multiselect-tags'),
        _0x1f8484 = _0x2357fb.querySelector(".custom-select-value"),
        _0x1890e8 = _0x2357fb.querySelector(".custom-multiselect-options-list"),
        _0x152e71 = _0x2357fb.querySelector('.custom-multiselect-search'),
        _0x462767 = Array.from(_0xabe748.options),
        _0x301171 = _0x462767.filter(_0x4498e5 => _0x4498e5.selected);
    if (_0x106856) {
        _0x3b3496.innerHTML = '';
        if (_0x301171.length === 0x0) {
            const _0x5a8545 = document.createElement("span");
            _0x5a8545.className = "custom-multiselect-placeholder", _0x5a8545.textContent = _0x4a5a9e || "Select options…", _0x3b3496.appendChild(_0x5a8545);
        } else _0x301171.forEach(_0xc28183 => {
            const _0x2e3bdd = _0x421d31,
                _0x1cb59d = document.createElement("div");
            _0x1cb59d.className = "custom-multiselect-tag", _0x1cb59d.innerHTML = "\n                    <span>" + _0xc28183.text + "</span>\n                    <span class=\"custom-multiselect-tag-remove\" data-value=\"" + _0xc28183.value + "\">\n                        <i class=\"fa-solid fa-xmark\"></i>\n                    </span>\n                ", _0x1cb59d.querySelector(".custom-multiselect-tag-remove").addEventListener("click", _0x567f9d => {
                const _0x360ac0 = _0x2e3bdd;
                _0x567f9d.stopPropagation(), _0xc28183.selected = ![], _0xabe748.dispatchEvent(new Event('change')), syncCustomSelect(_0x5946a4, _0x4a5a9e);
            }), _0x3b3496.appendChild(_0x1cb59d);
        });
    } else {
        let _0x53ed6e = _0x301171[0x0];
        !_0x53ed6e && _0xabe748.options["length"] > 0x0 && (_0x53ed6e = _0xabe748.options[_0xabe748.selectedIndex >= 0x0 ? _0xabe748.selectedIndex : 0x0]), _0x53ed6e && _0x53ed6e.value !== '' ? (_0x1f8484.textContent = _0x53ed6e.text, _0x1f8484.classList["remove"]("custom-multiselect-placeholder")) : (_0x1f8484.textContent = _0x4a5a9e || "Select an option…", _0x1f8484.classList['add']("custom-multiselect-placeholder"));
    }
    _0x1890e8.innerHTML = '', _0x462767.length === 0x0 ? _0x1890e8.innerHTML = '<div\x20class=\x22custom-multiselect-no-results\x22>No\x20options\x20available</div>' : _0x462767.forEach(_0x4a995a => {
        const _0x37c231 = _0x421d31,
            _0x381fad = document.createElement("div");
        _0x381fad.className = "custom-multiselect-option";
        let _0x526285 = _0x4a995a.selected;
        !_0x106856 && _0xabe748.value === _0x4a995a.value && (_0x526285 = !![]);
        if (_0x526285) _0x381fad.classList["add"]("selected");
        _0x381fad.dataset["value"] = _0x4a995a.value, _0x381fad.innerHTML = '\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<span>' + _0x4a995a.text + "</span>\n                <span class=\"custom-multiselect-option-check\"><i class=\"fa-solid fa-check\"></i></span>\n            ", _0x381fad.addEventListener("click", _0x3fdaee => {
            const _0x148720 = _0x37c231;
            _0x3fdaee.stopPropagation(), _0x106856 ? _0x4a995a.selected = !_0x4a995a.selected : (_0xabe748.value = _0x4a995a.value, _0x462767.forEach(_0xf27138 => _0xf27138.selected = _0xf27138.value === _0x4a995a.value), _0x2357fb.classList['remove']("open")), _0xabe748.dispatchEvent(new Event("change")), syncCustomSelect(_0x5946a4, _0x4a5a9e);
        }), _0x1890e8.appendChild(_0x381fad);
    }), _0x152e71 && _0x152e71.value && filterOptions(_0x2357fb, _0x152e71.value["toLowerCase"]());
}

function filterOptions(_0x2f13b5, _0x2572f5) {
    const _0x2a9d09 = a0_0x201bc1,
        _0x1ec27a = _0x2f13b5.querySelectorAll(".custom-multiselect-option");
    let _0xa9e5a8 = ![];
    _0x1ec27a.forEach(_0x1825cf => {
        const _0x4db3d1 = _0x2a9d09,
            _0x2a5134 = _0x1825cf.querySelector("span").textContent["toLowerCase"]();
        _0x2a5134.includes(_0x2572f5) ? (_0x1825cf.style["display"] = "flex", _0xa9e5a8 = !![]) : _0x1825cf.style['display'] = "none";
    });
    let _0x1139e6 = _0x2f13b5.querySelector(".custom-multiselect-no-results-filter");
    if (!_0xa9e5a8) !_0x1139e6 && (_0x1139e6 = document.createElement("div"), _0x1139e6.className = "custom-multiselect-no-results custom-multiselect-no-results-filter", _0x1139e6.textContent = "No results found", _0x2f13b5.querySelector(".custom-multiselect-options-list").appendChild(_0x1139e6));
    else {
        if (_0x1139e6) _0x1139e6.remove();
    }
}

function initAllCustomSelects() {
    const _0x5b8795 = a0_0x201bc1;
    const initialTabContainer = document.getElementById("tab-" + initialTab);
    if (initialTabContainer) {
        initialTabContainer.querySelectorAll("select").forEach(_0x249ceb => {
            initCustomSelect(_0x249ceb);
        });
    }
}
document.addEventListener("click", _0x7d2d5 => {
    const _0x5f42bf = a0_0x201bc1;
    document.querySelectorAll(".custom-multiselect-wrap.open").forEach(_0x12527c => {
        const _0x2ab45f = _0x5f42bf;
        if (!_0x12527c.contains(_0x7d2d5.target)) {
            _0x12527c.classList["remove"]("open");
            const _0x22b7b7 = _0x12527c.querySelector(".custom-multiselect-search");
            _0x22b7b7 && (_0x22b7b7.value = '', filterOptions(_0x12527c, ''));
        }
    });
}), window.addEventListener("DOMContentLoaded", initDashboard);

// ── SECURITY SUITE EXTENSION CODE ──

let securityChannels = [];
let securityRoles = [];

let activeGuildIdFromPath = null;
const paths = window.location.pathname.split('/').filter(Boolean);
if (paths[0] === 'servers' && paths[1]) {
    activeGuildIdFromPath = paths[1];
}

async function apiFetch(url, options = {}) {
    const res = await fetch(url, options);
    if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Request failed');
    }
    return res.json();
}

async function loadGuildMetadata() {
    if (securityChannels.length > 0) return;
    try {
        const res = await fetch(`/api/guilds/${activeGuildIdFromPath}`);
        const data = await res.json();
        securityChannels = data.channels || [];
        securityRoles = data.roles || [];

        populateSelect('securityLogChannel', securityChannels, 'channel');
        populateSelect('raidLogChannel', securityChannels, 'channel');
    } catch (err) {
        console.error('Error loading guild metadata:', err);
    }
}

function populateSelect(elementId, items, type) {
    const el = document.getElementById(elementId);
    if (!el) return;

    el.innerHTML = type === 'channel' ?
        '<option value="">Disable log alerts</option>' :
        '<option value="">Select a role...</option>';

    items.forEach(item => {
        const opt = document.createElement('option');
        opt.value = item.id;
        opt.textContent = type === 'channel' ? `#${item.name}` : `@${item.name}`;
        el.appendChild(opt);
    });
}

async function fetchSecuritySettings() {
    await loadGuildMetadata();
    try {
        const gData = await apiFetch(`/api/guilds/${activeGuildIdFromPath}/config/guildsettings`);
        if (gData) {
            if (typeof setVal === 'function') {
                setVal('guildPrefix', gData.prefix || '&');
            }
            if (typeof setMultiComma === 'function') {
                setMultiComma('guildOwnerRoles', gData.owner_role_id || '');
            }
        }
    } catch (err) {
        console.error('Error fetching general settings:', err);
    }

    try {
        const data = await apiFetch(`/api/guilds/${activeGuildIdFromPath}/config/security`);
        if (data) {
            document.getElementById('sec_antiBotEnabled').checked = !!data.anti_bot_enabled;
            document.getElementById('sec_antiBotPunishment').value = data.anti_bot_punishment || 'kick';
            document.getElementById('sec_antiWebhookEnabled').checked = !!data.anti_webhook_enabled;
            document.getElementById('sec_antiWebhookPunishment').value = data.anti_webhook_punishment || 'kick';
            document.getElementById('sec_roleProtectionEnabled').checked = !!data.role_protection_enabled;
            document.getElementById('sec_roleProtectionPunishment').value = data.role_protection_punishment || 'kick';
            document.getElementById('sec_channelProtectionEnabled').checked = !!data.channel_protection_enabled;
            document.getElementById('sec_channelProtectionPunishment').value = data.channel_protection_punishment || 'kick';
            document.getElementById('securityLogChannel').value = data.log_channel_id || '';
        }
    } catch (err) {
        console.error('Error fetching security settings:', err);
    }
}

async function saveSecuritySettings() {
    const payload = {
        anti_bot_enabled: document.getElementById('sec_antiBotEnabled').checked,
        anti_bot_punishment: document.getElementById('sec_antiBotPunishment').value,
        anti_webhook_enabled: document.getElementById('sec_antiWebhookEnabled').checked,
        anti_webhook_punishment: document.getElementById('sec_antiWebhookPunishment').value,
        role_protection_enabled: document.getElementById('sec_roleProtectionEnabled').checked,
        role_protection_punishment: document.getElementById('sec_roleProtectionPunishment').value,
        channel_protection_enabled: document.getElementById('sec_channelProtectionEnabled').checked,
        channel_protection_punishment: document.getElementById('sec_channelProtectionPunishment').value,
        log_channel_id: document.getElementById('securityLogChannel').value
    };

    try {
        await apiFetch(`/api/guilds/${activeGuildIdFromPath}/config/security`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });
        showToast('Anti-Nuke shields updated successfully.', 'success');
    } catch (err) {
        showToast(err.message, 'error');
    }
}

async function fetchRaidSettings() {
    await loadGuildMetadata();
    try {
        const data = await apiFetch(`/api/guilds/${activeGuildIdFromPath}/config/raid`);
        if (data) {
            document.getElementById('raidEnabled').checked = !!data.is_enabled;
            document.getElementById('raidJoinLimit').value = data.join_limit || 10;
            document.getElementById('raidJoinWindow').value = data.join_time_window_sec || 10;
            document.getElementById('raidMentionLimit').value = data.mention_limit || 10;
            document.getElementById('raidInviteLimit').value = data.invite_spam_limit || 5;
            document.getElementById('raidPunishment').value = data.punishment || 'timeout';
            document.getElementById('raidLogChannel').value = data.log_channel_id || '';
            document.getElementById('raidLockServer').checked = !!data.lock_server;
        }
    } catch (err) {
        console.error('Error fetching raid settings:', err);
    }
}

async function saveRaidSettings() {
    const payload = {
        is_enabled: document.getElementById('raidEnabled').checked,
        join_limit: parseInt(document.getElementById('raidJoinLimit').value, 10),
        join_time_window_sec: parseInt(document.getElementById('raidJoinWindow').value, 10),
        mention_limit: parseInt(document.getElementById('raidMentionLimit').value, 10),
        invite_spam_limit: parseInt(document.getElementById('raidInviteLimit').value, 10),
        punishment: document.getElementById('raidPunishment').value,
        log_channel_id: document.getElementById('raidLogChannel').value,
        lock_server: document.getElementById('raidLockServer').checked
    };

    try {
        await apiFetch(`/api/guilds/${activeGuildIdFromPath}/config/raid`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });
        showToast('Raid settings saved successfully.', 'success');
    } catch (err) {
        showToast(err.message, 'error');
    }
}

async function fetchWhitelist() {
    try {
        const list = await apiFetch(`/api/guilds/${activeGuildIdFromPath}/security/trusted`);
        const tbody = document.getElementById('whitelistTableBody');
        if (!tbody) return;

        tbody.innerHTML = '';
        if (list.length === 0) {
            tbody.innerHTML = '<tr><td colspan="3" style="text-align:center; color:var(--text-2); padding:20px;">No whitelisted entities yet.</td></tr>';
            return;
        }

        list.forEach(item => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><span class="badge badge-${item.type}">${item.type.toUpperCase()}</span></td>
                <td>
                    <div style="font-weight:600; color:var(--text-1);">${escapeHtml(item.label || 'Unnamed Entity')}</div>
                    <div style="font-size:11px; color:var(--text-2);">${escapeHtml(item.entity_id)}</div>
                </td>
                <td>
                    <button class="btn btn-danger btn-sm btn-delete-whitelist" data-id="${item.id}">
                        <i class="fa-solid fa-trash"></i> Remove
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (err) {
        console.error('Error fetching whitelist:', err);
    }
}

async function addWhitelistEntity() {
    const entity_id = document.getElementById('whitelistEntityId').value.trim();
    const type = document.getElementById('whitelistType').value;
    const label = document.getElementById('whitelistLabel').value.trim();

    if (!entity_id || !/^\d{17,19}$/.test(entity_id)) {
        showToast('Invalid ID format. Must be 17-19 digits.', 'error');
        return;
    }

    try {
        await apiFetch(`/api/guilds/${activeGuildIdFromPath}/security/trusted`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                entity_id,
                type,
                label
            })
        });
        document.getElementById('whitelistEntityId').value = '';
        document.getElementById('whitelistLabel').value = '';
        showToast('Entity added to whitelist.', 'success');
        fetchWhitelist();
    } catch (err) {
        showToast(err.message, 'error');
    }
}

async function deleteWhitelistEntity(id) {
    try {
        await apiFetch(`/api/guilds/${activeGuildIdFromPath}/security/trusted/${id}`, {
            method: 'DELETE'
        });
        showToast('Entity removed from whitelist.', 'success');
        fetchWhitelist();
    } catch (err) {
        showToast(err.message, 'error');
    }
}

async function fetchBackups() {
    try {
        const list = await apiFetch(`/api/guilds/${activeGuildIdFromPath}/backups`);
        const tbody = document.getElementById('backupsTableBody');
        if (!tbody) return;

        tbody.innerHTML = '';
        if (list.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; color:var(--text-2); padding:32px;">No backup instances found. Click create to start.</td></tr>';
            return;
        }

        list.forEach(item => {
            let data = {};
            try {
                data = JSON.parse(item.data || '{}');
            } catch {}
            const roleCount = data.roles ? data.roles.length : 0;
            const channelCount = data.channels ? data.channels.length : 0;
            const dateStr = new Date(item.created_at).toLocaleString();

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td style="font-family:monospace; font-size:12px; color:var(--cyan);">${escapeHtml(item.id)}</td>
                <td>${escapeHtml(item.creator_id)}</td>
                <td><span class="badge badge-role">${roleCount} roles</span></td>
                <td><span class="badge badge-channel">${channelCount} channels</span></td>
                <td style="color:var(--text-2);">${escapeHtml(dateStr)}</td>
                <td>
                    <div style="display:flex; gap:8px;">
                        <button class="btn btn-primary btn-sm btn-restore-backup" data-id="${item.id}">
                            <i class="fa-solid fa-rotate-left"></i> Restore
                        </button>
                        <button class="btn btn-danger btn-sm btn-delete-backup" data-id="${item.id}">
                            <i class="fa-solid fa-trash"></i> Delete
                        </button>
                    </div>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (err) {
        console.error('Error fetching backups:', err);
    }
}

async function createBackup() {
    try {
        showToast('Creating backup snapshot...', 'info');
        const res = await apiFetch(`/api/guilds/${activeGuildIdFromPath}/backups`, {
            method: 'POST'
        });
        showToast(`Backup created successfully: ${res.backupId}`, 'success');
        fetchBackups();
    } catch (err) {
        showToast(err.message, 'error');
    }
}

async function restoreBackup(backupId) {
    if (!confirm("⚠️ WARNING: Restoring this backup will delete all existing channels and roles and recreate them from the snapshot. This operation CANNOT be undone. Are you sure you want to proceed?")) {
        return;
    }

    try {
        showToast('Restoring backup (this may take a minute)...', 'info');
        await apiFetch(`/api/guilds/${activeGuildIdFromPath}/backups/${backupId}/restore`, {
            method: 'POST'
        });
        showToast('Backup restored successfully!', 'success');
        setTimeout(() => window.location.reload(), 1500);
    } catch (err) {
        showToast(err.message, 'error');
    }
}

async function deleteBackup(backupId) {
    if (!confirm("Are you sure you want to delete this backup snapshot?")) {
        return;
    }

    try {
        await apiFetch(`/api/guilds/${activeGuildIdFromPath}/backups/${backupId}`, {
            method: 'DELETE'
        });
        showToast('Backup deleted successfully.', 'success');
        fetchBackups();
    } catch (err) {
        showToast(err.message, 'error');
    }
}

async function fetchSecurityLogs() {
    try {
        const list = await apiFetch(`/api/guilds/${activeGuildIdFromPath}/security/logs`);
        const tbody = document.getElementById('securityLogsTableBody');
        if (!tbody) return;

        tbody.innerHTML = '';
        if (list.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; color:var(--text-2); padding:32px;">No security logs recorded.</td></tr>';
            return;
        }

        list.forEach(item => {
            const dateStr = new Date(item.created_at).toLocaleString();
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td style="color:var(--text-2); font-size:12px;">${escapeHtml(dateStr)}</td>
                <td><span class="badge badge-module">${escapeHtml(item.module.toUpperCase())}</span></td>
                <td><strong style="color:var(--text-1);">${escapeHtml(item.action)}</strong></td>
                <td>
                    <div style="font-weight:600;">${escapeHtml(item.executor_tag || 'Unknown')}</div>
                    <div style="font-size:10px; color:var(--text-2);">${escapeHtml(item.executor_id || 'N/A')}</div>
                </td>
                <td>
                    <div style="font-weight:600;">${escapeHtml(item.target_name || 'N/A')}</div>
                    <div style="font-size:10px; color:var(--text-2);">${escapeHtml(item.target_id || '')}</div>
                </td>
                <td><span style="color:var(--cyan); font-weight:600;">${escapeHtml(item.result || 'Logged')}</span></td>
            `;
            tbody.appendChild(tr);
        });
    } catch (err) {
        console.error('Error fetching security logs:', err);
    }
}

function onTabSwitched(tabName) {
    if (loadedTabs[tabName]) return;
    if (tabName === 'security') {
        fetchSecuritySettings();
        fetchWhitelist();
        loadedTabs[tabName] = true;
    } else if (tabName === 'raid') {
        fetchRaidSettings();
        loadedTabs[tabName] = true;
    } else if (tabName === 'backups') {
        fetchBackups();
        loadedTabs[tabName] = true;
    } else if (tabName === 'security-logs') {
        fetchSecurityLogs();
        loadedTabs[tabName] = true;
    }
}

// Hook switchTab
document.addEventListener('DOMContentLoaded', () => {
    // Helper to call a named function exposed on window by build.js bindings
    const call = (name, ...args) => {
        if (typeof window[name] === 'function') window[name](...args);
    };

    // Attach click listeners to sidebar items
    document.querySelectorAll(".sidebar-item").forEach(item => {
        item.addEventListener("click", () => {
            const tabName = item.getAttribute('data-tab') || item.dataset.tab;
            if (typeof window.switchTab === 'function') {
                window.switchTab(tabName);
            } else {
                switchTab(tabName);
            }
        });
    });

    // ── Save Buttons ─────────────────────────────────────────────
    const btnBindings = [
        ['save-welcome-btn', 'saveWelcomeSettings'],
        ['save-automod-btn', 'saveAutoMod'],
        ['btn-save-economy', 'saveEconomy'],
        ['btn-save-warn', 'saveWarn'],
        ['btn-save-jail', 'saveJail'],
        ['btn-save-mute', 'saveMute'],
        ['btn-save-verification', 'saveVerification'],
        ['btn-save-antilink', 'saveAntiLink'],
        ['btn-save-apply', 'saveApply'],
        ['btn-save-autorole', 'saveAutoRole'],
        ['btn-save-guildsettings', 'saveGuildSettings'],
        ['btn-save-securitysettings', 'saveSecuritySettings'],
        ['btn-save-raidsettings', 'saveRaidSettings'],
        ['btn-save-logs', 'saveLogs'],
        ['btn-save-rooms', 'saveRooms'],
        ['btn-launch-giveaway', 'launchGiveaway'],
        ['btn-add-custom-command', 'addCustomCommand'],
        ['btn-generate-apikey', 'generateApiKey'],
        ['btn-add-shop-item', 'addShopItem'],
        ['btn-add-whitelist-entity', 'addWhitelistEntity'],
        ['btn-create-backup', 'createBackup'],
        ['btn-add-department', 'addDepartment'],
    ];
    btnBindings.forEach(([id, fnName]) => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('click', () => call(fnName));
    });

    // ── Live Preview Inputs ───────────────────────────────────────
    const previewInputIds = ['welcomeText', 'welcomeBgImage'];
    previewInputIds.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('input', () => call('updateLivePreview'));
    });

    const applyPreviewIds = ['applyPanelTitle', 'applyPanelDescription', 'applyBanner'];
    applyPreviewIds.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('input', () => call('updateApplyPreview'));
    });

    // Apply panel style select
    const applyPanelStyle = document.getElementById('applyPanelStyle');
    if (applyPanelStyle) {
        applyPanelStyle.addEventListener('change', () => call('updateApplyPreview'));
    }

    setTimeout(() => {
        const originalSwitchTab = window.switchTab;
        window.switchTab = function(tabName, updateHistory) {
            if (typeof originalSwitchTab === 'function') {
                originalSwitchTab(tabName, updateHistory);
            }
            onTabSwitched(tabName);
        };

        // Initial tab check
        const pathParts = window.location.pathname.split('/').filter(Boolean);
        if (pathParts[0] === 'servers' && pathParts[1]) {
            const initialTab = pathParts[2] || 'overview';
            onTabSwitched(initialTab);
        }
    }, 500);
});

// Delegated click listeners for Whitelist removal and Backup restore/delete
document.addEventListener('click', (e) => {
    // Delete Whitelist Entity
    const deleteWhitelistBtn = e.target.closest('.btn-delete-whitelist');
    if (deleteWhitelistBtn) {
        const id = deleteWhitelistBtn.getAttribute('data-id');
        if (id) {
            deleteWhitelistEntity(id);
        }
    }

    // Restore Backup
    const restoreBackupBtn = e.target.closest('.btn-restore-backup');
    if (restoreBackupBtn) {
        const id = restoreBackupBtn.getAttribute('data-id');
        if (id) {
            restoreBackup(id);
        }
    }

    // Delete Backup
    const deleteBackupBtn = e.target.closest('.btn-delete-backup');
    if (deleteBackupBtn) {
        const id = deleteBackupBtn.getAttribute('data-id');
        if (id) {
            deleteBackup(id);
        }
    }
});