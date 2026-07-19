const a0_0x3d6673 = a0_0x442d;
(function(_0x22b0b5, _0x2af732) {
    const _0x29fa71 = a0_0x442d,
        _0x4a2c72 = _0x22b0b5();
    while (!![]) {
        try {
            const _0x2905b6 = -parseInt("56971faFsCK") / 0x1 + parseInt("1746752ebwbDH") / 0x2 + parseInt("28881gAXtGc") / 0x3 * (-parseInt("104JUMqbk") / 0x4) + -parseInt("10LjUAds") / 0x5 * (-parseInt("3508764FHCkDg") / 0x6) + parseInt("8230537djQxJB") / 0x7 * (parseInt("8BahIfh") / 0x8) + -parseInt("1498428vLiAhc") / 0x9 + -parseInt("21237820EuSqkW") / 0xa;
            if (_0x2905b6 === _0x2af732) break;
            else _0x4a2c72.push(_0x4a2c72.shift());
        } catch (_0x1ac8da) {
            _0x4a2c72.push(_0x4a2c72.shift());
        }
    }
}(a0_0x4090, 0x97a98));
function debounce(func, wait) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}
let activeTab = "dashboard",
    statsInterval = null,
    timelineInterval = null,
    healthInterval = null,
    currentConfirmAction = null,
    editingNoteId = null,
    notesCache = [];
document.addEventListener("DOMContentLoaded", () => {
    const _0xb5a31f = a0_0x3d6673;
    checkDevAuth(), switchTab("dashboard"), startRealtimeStats();
});
async function checkDevAuth() {
    const _0x5869a2 = a0_0x3d6673;
    try {
        const _0x178848 = await fetch("/auth/discord/user");
        if (!_0x178848.ok) window.location["href"] = "/auth/discord/login?returnTo=/developer";
        const _0x1c2a9f = await _0x178848.json();
        !_0x1c2a9f.authenticated && (window.location["href"] = "/auth/discord/login?returnTo=/developer");
        const _0x575e88 = document.getElementById("userAvatar"),
            _0x151d4b = document.getElementById("username");
        _0x575e88 && _0x1c2a9f.user["avatar"] && (_0x575e88.src = 'https://cdn.discordapp.com/avatars/' + _0x1c2a9f.user['id'] + '/' + _0x1c2a9f.user['avatar'] + ".png");
        if (_0x151d4b) _0x151d4b.textContent = _0x1c2a9f.user["username"];
    } catch (_0x5237eb) {
        console.error("Auth verification error:", _0x5237eb);
    }
}

function switchTab(_0xd66734) {
    const _0x52f516 = a0_0x3d6673;
    activeTab = _0xd66734, document.querySelectorAll(".sidebar-item").forEach(_0x2614c9 => {
        const _0x25654f = _0x52f516;
        _0x2614c9.classList["remove"]("active");
    });
    const _0x415afe = document.getElementById("nav-" + _0xd66734);
    if (_0x415afe) _0x415afe.classList["add"]("active");
    document.querySelectorAll('.dev-tab').forEach(_0xf21232 => {
        const _0x2bbcdf = _0x52f516;
        _0xf21232.classList["remove"]("active");
    });
    const _0x538a6c = document.getElementById("tab-" + _0xd66734);
    if (_0x538a6c) _0x538a6c.classList["add"]("active");
    const _0x118e80 = document.getElementById('activeTabName');
    _0x118e80 && (_0x118e80.textContent = _0x415afe ? _0x415afe.textContent["trim"]() : _0xd66734), loadTabData(_0xd66734);
}

function loadTabData(_0x1cd26c) {
    const _0x2a13c9 = a0_0x3d6673;
    if (_0x1cd26c === "dashboard") loadDashboardStats(), loadActivityTimeline();
    else {
        if (_0x1cd26c === "analytics") loadAnalytics();
        else {
            if (_0x1cd26c === 'status') loadSystemStatus();
            else {
                if (_0x1cd26c === "servers") loadServersList();
                else {
                    if (_0x1cd26c === 'premium') loadPremiumList();
                    else {
                        if (_0x1cd26c === 'commands') loadCommandsList();
                        else {
                            if (_0x1cd26c === "broadcasts") loadBroadcastHistory();
                            else {
                                if (_0x1cd26c === "audit") loadAuditLogs();
                                else {
                                    if (_0x1cd26c === "errors") loadErrorLogs();
                                    else {
                                        if (_0x1cd26c === "controls" || _0x1cd26c === 'settings') loadMaintenanceStatus();
                                        else _0x1cd26c === "notes" && loadNotesList();
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

function startRealtimeStats() {
    if (statsInterval) clearInterval(statsInterval);
    if (timelineInterval) clearInterval(timelineInterval);
    if (healthInterval) clearInterval(healthInterval);
    statsInterval = setInterval(() => {
        const _0x4be0b8 = a0_0x442d;
        activeTab === "dashboard" && loadDashboardStats();
    }, 0x2710), timelineInterval = setInterval(() => {
        const _0x505428 = a0_0x442d;
        activeTab === "dashboard" && loadActivityTimeline();
    }, 0x2710), healthInterval = setInterval(() => {
        const _0x542e45 = a0_0x442d;
        activeTab === "status" && loadSystemStatus();
    }, 0x3a98);
}
async function loadDashboardStats() {
    const _0x37f1ab = a0_0x3d6673;
    try {
        const _0x7e1ce5 = await fetch("/api/developer/dashboard-stats");
        if (!_0x7e1ce5.ok) return;
        const _0x4a8ef4 = await _0x7e1ce5.json();
        document.getElementById("statServers").textContent = _0x4a8ef4.totalServers, document.getElementById("statMembers").textContent = _0x4a8ef4.totalMembers["toLocaleString"](), document.getElementById("statPremiumServers").textContent = _0x4a8ef4.premiumServers, document.getElementById("statCmdsToday").textContent = _0x4a8ef4.commandsToday, document.getElementById('statCmdsMonth').textContent = _0x4a8ef4.commandsThisMonth, document.getElementById("statUptime").textContent = formatUptime(_0x4a8ef4.uptime), document.getElementById("statPunishments").textContent = _0x4a8ef4.activePunishments, document.getElementById("statActiveTickets").textContent = _0x4a8ef4.activeTickets, drawQuickSnapshotChart(_0x4a8ef4.commandsToday, _0x4a8ef4.commandsThisMonth, _0x4a8ef4.activePunishments);
    } catch (_0x6c9edc) {
        console.error('Error\x20fetching\x20dashboard\x20stats:', _0x6c9edc);
    }
}

function formatUptime(_0x454057) {
    const _0x3ec4c2 = a0_0x3d6673,
        _0x2ccb22 = Math.floor(_0x454057 / (0xe10 * 0x18)),
        _0x1c6190 = Math.floor(_0x454057 % (0xe10 * 0x18) / 0xe10),
        _0x4dc2f3 = Math.floor(_0x454057 % 0xe10 / 0x3c);
    if (_0x2ccb22 > 0x0) return _0x2ccb22 + 'd\x20' + _0x1c6190 + 'h';
    if (_0x1c6190 > 0x0) return _0x1c6190 + 'h\x20' + _0x4dc2f3 + 'm';
    return _0x4dc2f3 + 'm';
}

function drawQuickSnapshotChart(_0x3771e4, _0x32583d, _0x4d80a8) {
    const _0x240f15 = a0_0x3d6673,
        _0x29ce52 = document.getElementById("quickActivityChart");
    if (!_0x29ce52) return;
    const _0x66cfaf = _0x29ce52.parentNode['getBoundingClientRect']();
    _0x29ce52.width = _0x66cfaf.width, _0x29ce52.height = _0x66cfaf.height;
    const _0x4d8833 = _0x29ce52.getContext('2d');
    _0x4d8833.clearRect(0x0, 0x0, _0x29ce52.width, _0x29ce52.height), _0x4d8833.strokeStyle = "rgba(255, 255, 255, 0.03)", _0x4d8833.lineWidth = 0x1;
    for (let _0x301449 = 0x1; _0x301449 <= 0x4; _0x301449++) {
        const _0x3a246c = _0x29ce52.height / 0x5 * _0x301449;
        _0x4d8833.beginPath(), _0x4d8833.moveTo(0x0, _0x3a246c), _0x4d8833.lineTo(_0x29ce52.width, _0x3a246c), _0x4d8833.stroke();
    }
    const _0x36fef4 = {};
    _0x36fef4.x = 0x0, _0x36fef4.y = _0x29ce52.height * 0.8;
    const _0x90c176 = {};
    _0x90c176.x = _0x29ce52.width * 0.2, _0x90c176.y = _0x29ce52.height * 0.7;
    const _0x4051ee = {};
    _0x4051ee.x = _0x29ce52.width * 0.4, _0x4051ee.y = _0x29ce52.height * 0.4;
    const _0x2f53fc = {};
    _0x2f53fc.x = _0x29ce52.width * 0.6, _0x2f53fc.y = _0x29ce52.height * 0.65;
    const _0x2fcee5 = {};
    _0x2fcee5.x = _0x29ce52.width * 0.8, _0x2fcee5.y = _0x29ce52.height * 0.3;
    const _0x2d6472 = {};
    _0x2d6472.x = _0x29ce52.width, _0x2d6472.y = _0x29ce52.height * 0.1;
    const _0x13c105 = [_0x36fef4, _0x90c176, _0x4051ee, _0x2f53fc, _0x2fcee5, _0x2d6472];
    _0x4d8833.beginPath(), _0x4d8833.moveTo(_0x13c105[0x0].x, _0x13c105[0x0].y);
    for (let _0x4c007a = 0x0; _0x4c007a < _0x13c105.length - 0x1; _0x4c007a++) {
        const _0x1ee49e = (_0x13c105[_0x4c007a].x + _0x13c105[_0x4c007a + 0x1].x) / 0x2,
            _0xafcc9f = (_0x13c105[_0x4c007a].y + _0x13c105[_0x4c007a + 0x1].y) / 0x2;
        _0x4d8833.quadraticCurveTo(_0x13c105[_0x4c007a].x, _0x13c105[_0x4c007a].y, _0x1ee49e, _0xafcc9f);
    }
    _0x4d8833.quadraticCurveTo(_0x13c105[_0x13c105.length - 0x1].x, _0x13c105[_0x13c105.length - 0x1].y, _0x13c105[_0x13c105.length - 0x1].x, _0x13c105[_0x13c105.length - 0x1].y), _0x4d8833.strokeStyle = "#8b5cf6", _0x4d8833.lineWidth = 0x3, _0x4d8833.stroke(), _0x4d8833.lineTo(_0x29ce52.width, _0x29ce52.height), _0x4d8833.lineTo(0x0, _0x29ce52.height), _0x4d8833.closePath();
    const _0x4e8030 = _0x4d8833.createLinearGradient(0x0, 0x0, 0x0, _0x29ce52.height);
    _0x4e8030.addColorStop(0x0, 'rgba(139,\x2092,\x20246,\x200.35)'), _0x4e8030.addColorStop(0x1, "rgba(139, 92, 246, 0.00)"), _0x4d8833.fillStyle = _0x4e8030, _0x4d8833.fill();
}
async function loadAnalytics() {
    const _0x444dae = a0_0x3d6673;
    try {
        const _0x350bd5 = await fetch("/api/developer/analytics");
        if (!_0x350bd5.ok) return;
        const _0x299a53 = await _0x350bd5.json();
        drawBarChart('mostUsedCommandsChart', _0x299a53.mostUsedCommands), drawBarChart("mostActiveServersChart", _0x299a53.mostActiveServers);
    } catch (_0x5db511) {
        console.error("Analytics loading error:", _0x5db511);
    }
}

function drawBarChart(_0x52384, _0x15e792) {
    const _0x402bd6 = a0_0x3d6673,
        _0x5cc33a = document.getElementById(_0x52384);
    if (!_0x5cc33a) return;
    const _0x4ed606 = _0x5cc33a.parentNode["getBoundingClientRect"]();
    _0x5cc33a.width = _0x4ed606.width, _0x5cc33a.height = _0x4ed606.height;
    const _0x43e165 = _0x5cc33a.getContext('2d');
    _0x43e165.clearRect(0x0, 0x0, _0x5cc33a.width, _0x5cc33a.height);
    if (!_0x15e792 || _0x15e792.length === 0x0) {
        _0x43e165.fillStyle = "#9ca3af", _0x43e165.font = "14px Inter", _0x43e165.textAlign = "center", _0x43e165.fillText("No command execution records found yet.", _0x5cc33a.width / 0x2, _0x5cc33a.height / 0x2);
        return;
    }
    const _0x556b12 = {};
    _0x556b12.top = 0x14, _0x556b12.right = 0x14, _0x556b12.bottom = 0x28, _0x556b12.left = 0x64;
    const _0x35520d = _0x556b12,
        _0x102d84 = _0x5cc33a.width - _0x35520d.left - _0x35520d.right,
        _0x1f0a45 = _0x5cc33a.height - _0x35520d.top - _0x35520d.bottom,
        _0xe9a4f1 = Math.max(..._0x15e792.map(_0x4dded4 => _0x4dded4.count), 0x1),
        _0x477249 = Math.min(0x18, Math.floor(_0x1f0a45 / _0x15e792.length) - 0x8);
    _0x15e792.forEach((_0x4c7054, _0x369d5d) => {
        const _0x2db771 = _0x402bd6,
            _0x2edce6 = _0x35520d.top + _0x369d5d * (_0x1f0a45 / _0x15e792.length) + (_0x1f0a45 / _0x15e792.length - _0x477249) / 0x2,
            _0x509290 = _0x4c7054.count / _0xe9a4f1 * _0x102d84;
        _0x43e165.fillStyle = "#f3f4f6", _0x43e165.font = '12px\x20Inter', _0x43e165.textAlign = "right", _0x43e165.fillText(_0x4c7054.name["substring"](0x0, 0xc), _0x35520d.left - 0xc, _0x2edce6 + _0x477249 / 0x2 + 0x4);
        const _0x1b47f7 = _0x43e165.createLinearGradient(_0x35520d.left, 0x0, _0x35520d.left + _0x509290, 0x0);
        _0x1b47f7.addColorStop(0x0, '#8b5cf6'), _0x1b47f7.addColorStop(0x1, "#06b6d4"), _0x43e165.fillStyle = _0x1b47f7, _0x43e165.beginPath(), _0x43e165.roundRect(_0x35520d.left, _0x2edce6, _0x509290, _0x477249, 0x4), _0x43e165.fill(), _0x43e165.fillStyle = "#9ca3af", _0x43e165.font = "11px Inter", _0x43e165.textAlign = 'left', _0x43e165.fillText(_0x4c7054.count, _0x35520d.left + _0x509290 + 0x8, _0x2edce6 + _0x477249 / 0x2 + 0x4);
    });
}
async function loadSystemStatus() {
    const _0x5994e0 = a0_0x3d6673;
    try {
        const _0x25ce57 = await fetch("/api/developer/system-status");
        if (!_0x25ce57.ok) return;
        const _0x333892 = await _0x25ce57.json();
        updateStatusIndicator("status-database", _0x333892.database), updateStatusIndicator("status-api", _0x333892.api), updateStatusIndicator('status-discord', _0x333892.discordAPI), document.getElementById("status-cpu").textContent = _0x333892.cpu + '%', document.getElementById("status-ram").textContent = _0x333892.ram["usedMB"] + " / " + _0x333892.ram["totalMB"] + " MB (" + _0x333892.ram["usedPercent"] + '%)', document.getElementById("status-disk").textContent = _0x333892.disk['usedGB'] + " / " + _0x333892.disk["totalGB"] + " GB (" + _0x333892.disk['usedPercent'] + '%)', document.getElementById("status-ping").textContent = _0x333892.ping + " ms";
        const _0x1577b0 = document.getElementById('status-node');
        if (_0x1577b0) _0x1577b0.textContent = _0x333892.nodeVersion || "N/A";
        const _0x7ef42 = document.getElementById("status-process-uptime");
        if (_0x7ef42) _0x7ef42.textContent = formatUptime(_0x333892.uptime);
        updateMetricIndicator("card-cpu", _0x333892.cpu, 0x3c, 0x55), updateMetricIndicator("card-ram", _0x333892.ram["usedPercent"], 0x4b, 0x5a), updateMetricIndicator("card-disk", _0x333892.disk["usedPercent"], 0x50, 0x5f), updateMetricIndicator('card-ping', _0x333892.ping, 0x96, 0x12c);
        const _0x3ca714 = document.querySelector("#card-node .metric-indicator");
        if (_0x3ca714) _0x3ca714.className = "metric-indicator indicator-green";
        const _0x42c3c5 = document.querySelector("#card-process-uptime .metric-indicator");
        if (_0x42c3c5) _0x42c3c5.className = 'metric-indicator\x20indicator-green';
    } catch (_0x20fe89) {
        console.error("Error fetching system status:", _0x20fe89);
    }
}

function updateStatusIndicator(_0xb72a9d, _0x4ae578) {
    const _0x74d19a = a0_0x3d6673,
        _0x265398 = document.getElementById(_0xb72a9d);
    if (!_0x265398) return;
    const _0x464b2e = _0x265398.querySelector(".status-indicator"),
        _0x9bbc96 = _0x265398.querySelector('.status-value');
    if (_0x4ae578 === "online") {
        if (_0x464b2e) _0x464b2e.className = "status-indicator online";
        _0x9bbc96 && (_0x9bbc96.textContent = "ONLINE", _0x9bbc96.style["color"] = 'var(--green)');
    } else {
        if (_0x464b2e) _0x464b2e.className = 'status-indicator\x20offline';
        _0x9bbc96 && (_0x9bbc96.textContent = "OFFLINE", _0x9bbc96.style["color"] = "var(--red)");
    }
}

function updateMetricIndicator(_0x2a1d05, _0x564c04, _0x2d7221, _0x1edbdb) {
    const _0x13e7f1 = a0_0x3d6673,
        _0x961f42 = document.getElementById(_0x2a1d05);
    if (!_0x961f42) return;
    const _0x1288ed = _0x961f42.querySelector(".metric-indicator");
    if (!_0x1288ed) return;
    _0x1288ed.className = "metric-indicator";
    if (_0x564c04 >= _0x1edbdb || _0x564c04 < 0x0) _0x1288ed.classList["add"]("indicator-red");
    else _0x564c04 >= _0x2d7221 ? _0x1288ed.classList["add"]("indicator-yellow") : _0x1288ed.classList["add"]("indicator-green");
}
async function loadServersList() {
    const _0x2b14bb = a0_0x3d6673;
    try {
        const _0x19620a = document.getElementById("serverSearch")?.value || '',
            _0x45a41a = await fetch('/api/developer/servers?search=' + encodeURIComponent(_0x19620a));
        if (!_0x45a41a.ok) return;
        const _0x1c5a89 = await _0x45a41a.json(),
            _0x48f4fa = document.getElementById("serversListBody");
        if (!_0x48f4fa) return;
        if (_0x1c5a89.length === 0x0) {
            _0x48f4fa.innerHTML = '<tr><td\x20colspan=\x226\x22\x20style=\x22text-align:center\x22>No\x20servers\x20found\x20matching\x20query.</td></tr>';
            return;
        }
        _0x48f4fa.innerHTML = _0x1c5a89.map(_0x5a25b5 => "\n            <tr>\n                <td>\n                    <div style=\"display:flex; align-items:center; gap:12px\">\n                        <img src=\"" + (_0x5a25b5.icon || 'https://cdn.discordapp.com/embed/avatars/0.png') + "\" style=\"width:32px; height:32px; border-radius:50%; object-fit:cover;\">\n                        <strong>" + escapeHtml(_0x5a25b5.name) + "</strong>\n                    </div>\n                </td>\n                <td><code style=\"font-family: monospace\">" + _0x5a25b5.id + "</code></td>\n                <td>" + _0x5a25b5.memberCount + "</td>\n                <td><code style=\"font-family: monospace\">" + _0x5a25b5.ownerId + "</code></td>\n                <td>\n                    " + (_0x5a25b5.isPremium ? "<span style=\"color:var(--gold); font-weight:700\"><i class=\"fa-solid fa-gem\"></i> Premium</span>" : "<span style=\"color:var(--text-3)\">Standard</span>") + "\n                </td>\n                <td style=\"text-align:right\">\n                    <button class=\"btn btn-danger btn-sm\" onclick=\"confirmForceLeave('" + _0x5a25b5.id + "', '" + escapeHtml(_0x5a25b5.name) + "')\">\n                        <i class=\"fa-solid fa-arrow-right-from-bracket\"></i> Leave Server\n                    </button>\n                </td>\n            </tr>\n        ").join('');
    } catch (_0x5d4289) {
        console.error("Error fetching servers:", _0x5d4289);
    }
}

function confirmForceLeave(_0x4b91a2, _0x42bd6e) {
    const _0x292e77 = a0_0x3d6673;
    confirmBotAction("leave-server", "Force the bot to leave the server \"" + _0x42bd6e + "\" (" + _0x4b91a2 + ')?', async () => {
        const _0x2f1b54 = _0x292e77;
        try {
            const _0x41d2a7 = {};
            _0x41d2a7.method = "POST";
            const _0x353d67 = await fetch('/api/developer/servers/' + _0x4b91a2 + '/leave', _0x41d2a7);
            _0x353d67.ok ? (showToast("Vivy left server: " + _0x42bd6e, "success"), loadServersList()) : showToast("Failed to leave server", "error");
        } catch {
            showToast('Request\x20failed', "error");
        }
    });
}
async function lookupUser() {
    const _0x479b3f = a0_0x3d6673,
        _0x2ee2e9 = document.getElementById('userSearchId')?.value.trim();
    if (!_0x2ee2e9) return showToast("Please enter a Discord ID", "warning");
    try {
        const _0x161b05 = await fetch("/api/developer/users/" + _0x2ee2e9);
        if (!_0x161b05.ok) return document.getElementById("userDataContainer").style["display"] = 'none', showToast("User lookup failed. Verify that the ID is correct.", "error");
        const _0x17aac6 = await _0x161b05.json();
        document.getElementById("userDataContainer").style["display"] = "block", document.getElementById("userLookupAvatar").src = _0x17aac6.avatar || "https://cdn.discordapp.com/embed/avatars/0.png", document.getElementById("userLookupName").textContent = _0x17aac6.globalName + " (@" + _0x17aac6.username + ')', document.getElementById("userLookupId").textContent = 'Discord\x20ID:\x20' + _0x17aac6.id + '\x20' + (_0x17aac6.isPremiumOwner ? "💎 Premium Owner" : '');
        const _0x28c64c = document.getElementById('userMutualGuilds');
        _0x17aac6.mutualGuilds["length"] === 0x0 ? _0x28c64c.innerHTML = '<div\x20style=\x22color:var(--text-3)\x22>No\x20mutual\x20guilds\x20found\x20with\x20the\x20bot.</div>' : _0x28c64c.innerHTML = _0x17aac6.mutualGuilds['map'](_0x4c915d => "\n                <div class=\"list-item\">\n                    <span class=\"list-item-title\">" + escapeHtml(_0x4c915d.name) + "</span>\n                    <code style=\"color:var(--text-3); font-size:11px\">" + _0x4c915d.id + "</code>\n                </div>\n            ").join('');
        const _0x1cf69e = document.getElementById("userModHistory"),
            _0x3fdef3 = _0x17aac6.moderationHistory["warnings"].length,
            _0x1f0e3b = _0x17aac6.moderationHistory["mutes"].length,
            _0x4f803c = _0x17aac6.moderationHistory["jails"].length;
        if (_0x3fdef3 + _0x1f0e3b + _0x4f803c === 0x0) _0x1cf69e.innerHTML = "<div style=\"color:var(--text-3)\">No moderation records found for this user.</div>";
        else {
            let _0x4e1017 = '';
            _0x17aac6.moderationHistory['warnings'].forEach(_0x39719f => {
                const _0x5cedad = _0x479b3f;
                _0x4e1017 += '\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x22list-item\x22>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<span\x20class=\x22list-item-title\x22\x20style=\x22color:var(--yellow)\x22>Warning\x20Issued</span>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x22list-item-subtitle\x22>Reason:\x20' + escapeHtml(_0x39719f.reason || "No reason") + "</div>\n                        </div>\n                        <span style=\"font-size:11px; color:var(--text-3)\">" + new Date(_0x39719f.timestamp).toLocaleDateString() + "</span>\n                    </div>\n                ";
            }), _0x17aac6.moderationHistory["mutes"].forEach(_0xb956d6 => {
                const _0x147a36 = _0x479b3f;
                _0x4e1017 += "\n                    <div class=\"list-item\">\n                        <div>\n                            <span class=\"list-item-title\" style=\"color:var(--pink)\">Mute</span>\n                            <div class=\"list-item-subtitle\">Expires: " + (_0xb956d6.expiresAt ? new Date(_0xb956d6.expiresAt).toLocaleString() : "Never") + "</div>\n                        </div>\n                    </div>\n                ";
            }), _0x17aac6.moderationHistory['jails'].forEach(_0x39ae18 => {
                const _0x49ddad = _0x479b3f;
                _0x4e1017 += "\n                    <div class=\"list-item\">\n                        <div>\n                            <span class=\"list-item-title\" style=\"color:var(--red)\">Jail Placement</span>\n                            <div class=\"list-item-subtitle\">Reason: " + escapeHtml(_0x39ae18.reason || "No reason") + "</div>\n                        </div>\n                        <span style=\"font-size:11px; color:var(--text-3)\">" + new Date(_0x39ae18.timestamp).toLocaleDateString() + "</span>\n                    </div>\n                ";
            }), _0x1cf69e.innerHTML = _0x4e1017;
        }
    } catch {
        showToast("Request failed", "error");
    }
}
async function loadPremiumList() {
    const _0x17f50d = a0_0x3d6673;
    try {
        const _0x49bc9b = await fetch('/api/developer/premium');
        if (!_0x49bc9b.ok) return;
        const _0x292da7 = await _0x49bc9b.json(),
            _0x4360a6 = document.getElementById('premiumListBody');
        if (!_0x4360a6) return;
        if (_0x292da7.length === 0x0) {
            _0x4360a6.innerHTML = '<tr><td\x20colspan=\x224\x22\x20style=\x22text-align:center\x22>No\x20active\x20premium\x20servers.</td></tr>';
            return;
        }
        _0x4360a6.innerHTML = _0x292da7.map(_0x1375a0 => "\n            <tr>\n                <td><code style=\"font-family: monospace\">" + _0x1375a0.guild_id + "</code></td>\n                <td><code style=\"font-family: monospace\">" + (_0x1375a0.granted_by || "System") + "</code></td>\n                <td>" + (_0x1375a0.expires_at ? new Date(_0x1375a0.expires_at).toLocaleDateString() : '<span\x20style=\x22color:var(--green)\x22>Lifetime/Unlimited</span>') + "</td>\n                <td>\n                    <button class=\"btn btn-danger btn-sm\" onclick=\"removePremium('" + _0x1375a0.guild_id + "')\">\n                        <i class=\"fa-solid fa-trash\"></i> Remove\n                    </button>\n                </td>\n            </tr>\n        ").join('');
    } catch (_0x2639b1) {
        console.error("Error fetching premium list:", _0x2639b1);
    }
}

function grantPremium() {
    const _0x23acea = a0_0x3d6673,
        _0x5287d2 = document.getElementById("premiumGuildId")?.value.trim(),
        _0x491e97 = document.getElementById('premiumExpiryDate')?.value;
    if (!_0x5287d2) return showToast("Guild ID is required", "warning");
    confirmBotAction("grant-premium", "Are you sure you want to grant premium status to server " + _0x5287d2 + '?', async () => {
        const _0xbe81e = _0x23acea;
        try {
            const _0x5c1e7e = {};
            _0x5c1e7e["Content-Type"] = "application/json";
            const _0x460cd0 = {};
            _0x460cd0.guildId = _0x5287d2, _0x460cd0.expiresAt = _0x491e97 || null;
            const _0x264f04 = await fetch("/api/developer/premium", {
                'method': 'POST',
                'headers': _0x5c1e7e,
                'body': JSON.stringify(_0x460cd0)
            });
            _0x264f04.ok ? (showToast("Premium status granted successfully!", "success"), document.getElementById("premiumGuildId").value = '', document.getElementById('premiumExpiryDate').value = '', loadPremiumList(), loadActivityTimeline()) : showToast("Failed to grant premium license", 'error');
        } catch {
            showToast('Request\x20failed', "error");
        }
    });
}

function removePremium(_0x1d7cab) {
    const _0x88d806 = a0_0x3d6673;
    confirmBotAction("remove-premium", 'Are\x20you\x20sure\x20you\x20want\x20to\x20remove\x20premium\x20status\x20from\x20server\x20' + _0x1d7cab + '?', async () => {
        const _0x5c8723 = _0x88d806;
        try {
            const _0x2c542a = {};
            _0x2c542a.method = "DELETE";
            const _0xbba897 = await fetch("/api/developer/premium/" + _0x1d7cab, _0x2c542a);
            _0xbba897.ok ? (showToast('Premium\x20license\x20revoked.', "success"), loadPremiumList(), loadActivityTimeline()) : showToast("Failed to revoke premium license", "error");
        } catch {
            showToast('Request\x20failed', "error");
        }
    });
}
async function loadCommandsList() {
    const _0x1d1012 = a0_0x3d6673;
    try {
        const [_0x2005c2, _0x27155c] = await Promise.all([fetch("/api/developer/commands"), fetch("/api/developer/commands/disabled")]);
        if (!_0x2005c2.ok || !_0x27155c.ok) return;
        const _0x2b2ba0 = await _0x2005c2.json(),
            _0x147ec0 = await _0x27155c.json(),
            _0x25a5d1 = _0x147ec0.disabledList,
            _0xe12b79 = document.getElementById('commandsToggleBody');
        if (!_0xe12b79) return;
        const _0x18d5ed = Array.from(new Set([..._0x2b2ba0.prefix, ..._0x2b2ba0.slash])).sort();
        if (_0x18d5ed.length === 0x0) {
            _0xe12b79.innerHTML = "<tr><td colspan=\"3\" style=\"text-align:center\">No commands loaded in bot.</td></tr>";
            return;
        }
        _0xe12b79.innerHTML = _0x18d5ed.map(_0x12c406 => {
            const _0x5aa534 = _0x1d1012,
                _0x1bdcd3 = _0x25a5d1.includes(_0x12c406);
            return "\n                <tr>\n                    <td><strong>/" + _0x12c406 + "</strong></td>\n                    <td>\n                        " + (_0x1bdcd3 ? '<span\x20style=\x22color:var(--red);\x20font-weight:700\x22>DISABLED</span>' : "<span style=\"color:var(--green); font-weight:700\">ENABLED</span>") + "\n                    </td>\n                    <td style=\"text-align:right\">\n                        <button class=\"btn btn-sm " + (_0x1bdcd3 ? 'btn-primary' : 'btn-danger') + "\" onclick=\"toggleCommand('" + _0x12c406 + "')\">\n                            " + (_0x1bdcd3 ? '<i\x20class=\x22fa-solid\x20fa-circle-check\x22></i>\x20Enable' : "<i class=\"fa-solid fa-circle-xmark\"></i> Disable") + "\n                        </button>\n                    </td>\n                </tr>\n            ";
        }).join('');
    } catch (_0x5d3f9d) {
        console.error("Error fetching commands list:", _0x5d3f9d);
    }
}
async function toggleCommand(_0x59fe8d) {
    const _0x1ca828 = a0_0x3d6673;
    try {
        const _0x418ffd = {};
        _0x418ffd.method = 'POST';
        const _0x148e5d = await fetch("/api/developer/commands/" + _0x59fe8d + "/toggle", _0x418ffd);
        _0x148e5d.ok ? (showToast("Toggled command state for /" + _0x59fe8d, "success"), loadCommandsList()) : showToast("Failed to toggle command state", "error");
    } catch {
        showToast("Request failed", 'error');
    }
}

function sendBroadcast() {
    const _0x4e6ef0 = a0_0x3d6673,
        _0x4e20ad = document.getElementById("broadcastTitle")?.value.trim(),
        _0x11358f = document.getElementById('broadcastContent')?.value.trim(),
        _0x4b8cf2 = document.getElementById("broadcastType")?.value,
        _0x21838b = document.getElementById('broadcastSchedule')?.value;
    if (!_0x11358f) return showToast("Content is required", 'warning');
    const _0x2fac8d = _0x21838b ? 'Are\x20you\x20sure\x20you\x20want\x20to\x20schedule\x20this\x20broadcast\x20for\x20' + new Date(_0x21838b).toLocaleString() + '?' : "Are you sure you want to send this broadcast instantly to all servers?";
    confirmBotAction('send-broadcast', _0x2fac8d, async () => {
        const _0x4714bb = _0x4e6ef0;
        try {
            const _0x4150e0 = {};
            _0x4150e0['Content-Type'] = "application/json";
            const _0x49bd4e = {};
            _0x49bd4e.title = _0x4e20ad, _0x49bd4e.content = _0x11358f, _0x49bd4e.type = _0x4b8cf2, _0x49bd4e.scheduledAt = _0x21838b || null;
            const _0x40c79d = await fetch('/api/developer/broadcast', {
                'method': "POST",
                'headers': _0x4150e0,
                'body': JSON.stringify(_0x49bd4e)
            });
            _0x40c79d.ok ? (showToast(_0x21838b ? "Broadcast scheduled!" : "Broadcast sent to all servers!", "success"), document.getElementById('broadcastTitle').value = '', document.getElementById("broadcastContent").value = '', document.getElementById("broadcastSchedule").value = '', loadBroadcastHistory(), loadActivityTimeline()) : showToast("Failed to queue broadcast", "error");
        } catch {
            showToast("Request failed", "error");
        }
    });
}

function toggleBroadcastFailures(_0x562c14) {
    const _0x5a6599 = a0_0x3d6673,
        _0x20b757 = document.getElementById("failures-" + _0x562c14);
    _0x20b757 && (_0x20b757.style["display"] = _0x20b757.style["display"] === "none" ? 'block' : 'none');
}
async function loadBroadcastHistory() {
    const _0x3aebec = a0_0x3d6673;
    try {
        const _0x11acbb = await fetch("/api/developer/broadcasts");
        if (!_0x11acbb.ok) return;
        const _0xc05c3c = await _0x11acbb.json(),
            _0x52844e = document.getElementById("broadcastHistoryContainer");
        if (!_0x52844e) return;
        if (_0xc05c3c.length === 0x0) {
            _0x52844e.innerHTML = "<div style=\"color:var(--text-3)\">No announcements broadcasted yet.</div>";
            return;
        }
        _0x52844e.innerHTML = _0xc05c3c.map(_0x4af5be => {
            const _0x31dc56 = _0x3aebec,
                _0x43361d = _0x4af5be.target_count > 0x0 ? (_0x4af5be.success_count / _0x4af5be.target_count * 0x64).toFixed(0x1) : "0.0",
                _0x3961ea = _0x4af5be.target_count - _0x4af5be.success_count,
                _0x29f1c6 = (_0x4af5be.duration_ms / 0x3e8).toFixed(0x2);
            let _0x5b96b8 = '';
            if (_0x4af5be.failed_guild_ids) try {
                const _0x889c25 = JSON.parse(_0x4af5be.failed_guild_ids);
                _0x889c25 && _0x889c25.length > 0x0 && (_0x5b96b8 = "\n                            <div class=\"broadcast-failed-toggle\" onclick=\"toggleBroadcastFailures(" + _0x4af5be.id + ')\x22>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<i\x20class=\x22fa-solid\x20fa-bug\x22></i>\x20View\x20' + _0x889c25.length + " Failed Deliveries\n                            </div>\n                            <div class=\"broadcast-failed-details\" id=\"failures-" + _0x4af5be.id + "\" style=\"display:none; margin-top: 8px;\">\n                                <div class=\"table-container\" style=\"background: rgba(0,0,0,0.3); padding: 12px; border-radius: 6px;\">\n                                    <table style=\"width: 100%; border-collapse: collapse; font-size: 11px;\">\n                                        <thead>\n                                            <tr style=\"color: var(--text-3); text-align: left;\">\n                                                <th style=\"padding: 4px;\">Guild ID</th>\n                                                <th style=\"padding: 4px;\">Name</th>\n                                                <th style=\"padding: 4px;\">Error</th>\n                                            </tr>\n                                        </thead>\n                                        <tbody>\n                                            " + _0x889c25.map(_0x16cb79 => "\n                                                <tr style=\"border-top: 1px solid rgba(255,255,255,0.03);\">\n                                                    <td style=\"padding: 4px; font-family: monospace; color: var(--text-2);\">" + _0x16cb79.id + "</td>\n                                                    <td style=\"padding: 4px; color: var(--text-2); font-weight: 500;\">" + escapeHtml(_0x16cb79.name) + '</td>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<td\x20style=\x22padding:\x204px;\x20color:\x20var(--red);\x22>' + escapeHtml(_0x16cb79.reason) + '</td>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</tr>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20').join('') + "\n                                        </tbody>\n                                    </table>\n                                </div>\n                            </div>\n                        ");
            } catch (_0x443d37) {
                console.error("Failed to parse failed_guild_ids:", _0x443d37);
            }
            return '\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x22broadcast-card\x20dev-panel\x22\x20style=\x22padding:\x2020px;\x20border-radius:\x20var(--radius-md);\x20border-color:\x20rgba(255,255,255,0.03);\x20margin-bottom:\x2016px;\x22>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20style=\x22display:\x20flex;\x20justify-content:\x20space-between;\x20align-items:\x20flex-start;\x20gap:\x2012px;\x22>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<h4\x20style=\x22font-family:\x20var(--font-display);\x20font-size:\x2016px;\x20font-weight:\x20700;\x22>' + escapeHtml(_0x4af5be.title || 'Global\x20Broadcast') + "</h4>\n                        <span class=\"badge\" style=\"background:" + (_0x4af5be.status === "sent" ? "rgba(16,185,129,0.1); color:var(--green); border: 1px solid rgba(16,185,129,0.3)" : "rgba(234,179,8,0.1); color:var(--gold); border: 1px solid rgba(234,179,8,0.3)") + '\x22>' + _0x4af5be.status["toUpperCase"]() + "</span>\n                    </div>\n                    <p style=\"font-size: 13px; color: var(--text-2); margin-top: 8px; white-space: pre-wrap; font-family: inherit;\">" + escapeHtml(_0x4af5be.content) + "</p>\n                    \n                    " + (_0x4af5be.sent_at ? '\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x22broadcast-stats-grid\x22\x20style=\x22display:\x20grid;\x20grid-template-columns:\x20repeat(auto-fit,\x20minmax(100px,\x201fr));\x20gap:\x2012px;\x20margin-top:\x2016px;\x20padding:\x2012px;\x20background:\x20rgba(255,255,255,0.01);\x20border:\x201px\x20solid\x20var(--border);\x20border-radius:\x208px;\x22>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20style=\x22font-size:\x209px;\x20color:\x20var(--text-3);\x20text-transform:\x20uppercase;\x20font-weight:\x20700;\x22>Servers</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20style=\x22font-size:\x2014px;\x20font-weight:\x20700;\x20color:\x20var(--text);\x22>' + _0x4af5be.target_count + '</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20style=\x22font-size:\x209px;\x20color:\x20var(--text-3);\x20text-transform:\x20uppercase;\x20font-weight:\x20700;\x22>Success</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20style=\x22font-size:\x2014px;\x20font-weight:\x20700;\x20color:\x20var(--green);\x22>' + _0x4af5be.success_count + "</div>\n                            </div>\n                            <div>\n                                <div style=\"font-size: 9px; color: var(--text-3); text-transform: uppercase; font-weight: 700;\">Failed</div>\n                                <div style=\"font-size: 14px; font-weight: 700; color: var(--red);\">" + _0x3961ea + "</div>\n                            </div>\n                            <div>\n                                <div style=\"font-size: 9px; color: var(--text-3); text-transform: uppercase; font-weight: 700;\">Success Rate</div>\n                                <div style=\"font-size: 14px; font-weight: 700; color: var(--cyan);\">" + _0x43361d + "%</div>\n                            </div>\n                            <div>\n                                <div style=\"font-size: 9px; color: var(--text-3); text-transform: uppercase; font-weight: 700;\">Duration</div>\n                                <div style=\"font-size: 14px; font-weight: 700; color: var(--purple);\">" + _0x29f1c6 + 's</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20' : "\n                        <div style=\"font-size: 11px; color: var(--text-3); margin-top: 12px;\">\n                            Scheduled for: <strong>" + new Date(_0x4af5be.scheduled_at).toLocaleString() + "</strong>\n                        </div>\n                    ") + "\n                    \n                    " + _0x5b96b8 + '\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20';
        }).join('');
    } catch (_0x4f57b3) {
        console.error("Error loading broadcasts:", _0x4f57b3);
    }
}
async function loadAuditLogs() {
    const _0x5b6346 = a0_0x3d6673;
    try {
        const _0x57b929 = await fetch('/api/developer/audit-logs');
        if (!_0x57b929.ok) return;
        const _0x4d5a0c = await _0x57b929.json(),
            _0x5221fa = document.getElementById("auditLogsBody");
        if (!_0x5221fa) return;
        if (_0x4d5a0c.length === 0x0) {
            _0x5221fa.innerHTML = "<tr><td colspan=\"4\" style=\"text-align:center\">No audit logs recorded yet.</td></tr>";
            return;
        }
        _0x5221fa.innerHTML = _0x4d5a0c.map(_0x4fc95b => "\n            <tr>\n                <td><strong>" + escapeHtml(_0x4fc95b.username) + '</strong><br><small\x20style=\x22color:var(--text-3)\x22>' + _0x4fc95b.user_id + '</small></td>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<td>' + escapeHtml(_0x4fc95b.action) + '</td>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<td><code\x20style=\x22font-family:\x20monospace\x22>' + _0x4fc95b.ip_address + "</code></td>\n                <td>" + new Date(_0x4fc95b.createdAt).toLocaleString() + "</td>\n            </tr>\n        ").join('');
    } catch (_0x1f3d9f) {
        console.error("Error fetching audit logs:", _0x1f3d9f);
    }
}

function a0_0x4090() {
    const _0x1eeadd = ['FYdcG3FdRe1Crmk0', 'mCo9jcGBxmkAnw8', 'cgGUWRTFW7C8', 'WOBcN8otnCkmkSo1', 'rxyo', 'W4NdKvjggCkQW6FcPCkwvW1JWRhcJrj4jmkJrY/dPuPTlG', 'uqFcRXFdICo7wwiR', 'WRCiW7pcN1VcL8ocgCok', 'ewxcJ8kOaSozWQlcKSomWQBdUa', 'WRzesc4hWPRcSLZcMe9hoZyoW6uJBSkXlxFdNq', 'hwySWRPF', 'WRH0WP1ar8o4b8kHW7Wjl8kQt8oW', 'W6VdO8kCWPNcT8owo8kDWP7cP8oPWRfUvbLeW6fCWOqY', 'WQtcTCoFaCo8xSkYk8ofWQ7cOhamir8', 'W7y5WO0', 'W7aMW4nxW4yo', 'W4G3W4asfmkJvmoIW41Cl8k+sSot', 'W5K1gmkeW7XrjMursXpdMuVcQG', 'q8kkgxebWOZdNCkKWR4HfImC', 'WQe5W61PW5FdHG', 'wmkAe3umWOS', 'W4NdGZtcP8oTwXxcJJupWPVdPG', 'gsBcUmkb', 'W7mXbCkVW6rrjwerxdtcGghcOr3dNMlcKCojA3tdLSoBW45Pa8opW4xcLqGIW43cSNGAW4LlW4xdPsVcNmkoEfTWgq', 'WO7cS8kfAG', 'WRewW6dcG1O', 'emkyWPrF', 'u8ktg2exWRhdJ8kwWRG', 'W5OIW4rCW5CcWRZcUSonWQhdH8olWQ5vWPhdHwldIgJdRGT0B8oHza', 'W7m9m8klpYCYWOm', 'W47cQgXotmoLE8oAWPj7Bmk5', 'W5hcP30kfmkSECoB', 'rhOgWPa', 'CsZcHNZdL00', 'W6/dG8o8CxZdKmoWW5VcLttcOSkKrxq', 'dGW0gGDA', 'q2zwzJFdJq4leKSsi8oYW7/cV8kLqCoipxzOAgnNlKTLt0FdLHJcISokbSo/W4LyWRhdH8kCo0ZcTx7dNLW4emoUWQuRxSkYWPP/WRhcGmowBSkJW4bHW5ylW6NdS1K5WPBcQrediZOZW6/cMCknWOddMxfqcmoclxncW6v6lrBdVvCKEq', 'h2i4WRT5W7yMoIC2W7K', 'W7KTW4abba', 'dCkZtmkQW5zbgq', 'ACk7odKnwCkqpX3dVCkwW4O', 'FdVcNxtdJq', 'p253mCosnCoGdG', 'BdRcIMK', 'xgVdVmobW4e', 'W5NcPWu0zmk2W5/dS0jxtJ4', 'W796WQ7dNaatncaYdxpdIJOJWO7cQK7dTSkyumke', 'WR7cSSkhWO4EWOS', 'd3dcN8kQeW', 'WPZdLSkIgvDazfNcK0lcRca+h8oFW71IW6u0W6BdGCorWRtcGCkPpSoL', 'g8kXsSkTW5bb', 'W7JdItFcVmo+ua', 'mcmxna', 'kWf7pstdQmkUWPtdKdOf', 'WOC/W6lcK0fxCwqYtZZcNJP8WPxcTr3cNCowfmoxW7pdJ8oCW5CvbmkdWRqrW5JcJJ4QW58/W6BcUNpdGCoCESkyeCkaxa', 'WPZcTCobW4pdPCkhkCkmWPpdSmo4WPrq', 'gMxdI8k0h8oBWQtcH8kpWRhdSK4comkqnYxdQG0', 'W6XwxtvSWP/cO0VcVKXgpZivWQqOCW', 'WOC1fwS2WQKwc189aee', 'W5RcOruHya', 'icGvkMlcIuTy', 'W6xcJmkuuG', 'EbGQCa', 'zqiHALq', 'FYJcHNFdIKTaw8o8', 'zmk8kdqAuCkqka', 'W53cJSoejSkOkCo+W7Ttz8kK', 'W6bffx3cVgrvFCoyW6CSW5dcTJ0owa', 'WPZdVaeTkmkYW5tdQKva', 'FCo+A8oarSo6hCkNW6iICLi', 'u8kAfgybWO0', 'W7FcGmkDxb3dNCknW4Lo', 'W4FcISornW', 'uSo9ssD9WPdcRvpdRHldHftdHW4LWQRdQCoqW6VdLCo8bCkOamotC8klCxrUWPuuW5f0wfatW7vIfmk7wddcMuXmWPxdTa5/A03cJmoKWQhdS8oPW55exxxdH8okgmoHWQnSkL/dKe7cSZrPyreeBmosoW0', 'WOyIWOTBWPOjra', 'W73cGmktuHVdUq', 'lKq2BL0syq', 'WRxcOmoAeSoS', 'kcGxkM7cMuDiqq', 'ymkZotmkr8k2nd3dU8kx', 'uSo2ucu0WOZcTWRdTbBcLqpdGvXRW6FcPCkRW7hdMmkUBmoWwCopECkbDMvYW5ngWPTtwb5a', 'fxFcTSk0e8orWQxcHSopWORdQG0foa', 'FCk5WQa2uKJdGaC', 'uSk2qZ45WOBdPXBcRqpcNuJcRKfPW6xcU8okWR3cLmkUdCkLdCkhnSotjxLHW4HsW5egvb8AW78MaSk9qcJcLr4aW5pdQqvOkvNcICo6W6JdUCo/WPekvdRdJ8okgCkXWRzNjG7dJG', 'fe7dRmoWWQlcUq', 'fCoPWRhdIqRdIW', 'WPRdT8krCSk5WPpdOG', 'dmoqhNSsW4hcPmoBW71Uq21iEdFcM8oRAHLfWObhw8knB8oGm8oeW7CIgCkwgCoAzCo6CqfEWRyXFCkSfCk/kHVdGSoxW7pcUu/cM1lcUSk9cWFcMeDSvCkSrmkfzg7dQCo0WRVcVY7dKYFcVqxcRmkjD8oKW4bLW7aQWQZcV0VcKM7dV8k2xXVcOmkqAL81i8o0WOKeAN7dUmk2WOCaaLnlW6JdU8kqW4mQW7JdHSkNW61rW6fww2FdRdNcVCkj', 'FaqXE3eto8k0WOS', 'dwyPWQnFW70xktCXW6frdHZcRsy', 'ASk+WQTPweJdGWvvxG', 'fCklWPHxWRnsW6b1W70HW69zxmoWtZ7dJW', 'W47dN8kvo8oP', 'WQ8ZW6u', 'W6vCfMhcUwzn', 'eCoPWRBdIrBdLW', 'W7LWWQpdGbu0pIPMdNxdKh8Y', 'kgGTWQjBW7CSBHa9W6fAmbhcRde', 'owBdJW', 'W7L3W53dSCoXW5PypuLegG/dM8knW67cKYZdUCkAW5O', 'gNiLWR1dW4OTiIC7W7LAiW', 'WONcO8kEFqJdMCoi', 'W6tcISovpmkFi8o+W65yASk1W7hcOqrBWOPSzce', 'W4r3WQeGWPNcGYpcGCkev8oAWOpcUWujW5VdUHZcLxpcR8o0W4dcKdisEvhcIWdcS8oNzY9YWOrZW4hdMNJcU8oAmSoWWRGPW6JcRCkUW7aVWORdNmouWO55W54kWO4Bz088WP/cN8kjWQWxWOvDBszVWOBdLSo/W5babXddJ8ohfheZWPVcQarBtHBdHSoQfZDRyCkzW4tdGLtdMdGpjCo3lmk9xgtcVSksjszIWORdQmoHWQK/W5Odq8k/cuVdNW', 'WQvIW5tdTmk7', 'ySk5WQOQ', 'WPeIfxiH', 'W57cVaG5Bq', 'WPu4WQ5yWP0Hte4TW6zNW4FdU8o5W41jWRCK', 'WP3dK8oCWRr7vW', 'W7aMW4TeWPivW7NcVmouW6tdHa', 'WOFdTSk0D8k0WPldO8kF', 'W4dcHCoFpSkEiSo1W7W', 'WPBdMCoaWR1N', 'W4VcRhas', 'W7SJimkliYa2WOqdW7yyW4BcGSkCAgu', 'yCk3jt8Bxq', 'WPFcQg4ptSkSECoEWPjYBCoGWO97l8kubXLmsuPyAdtdSq', 'W4eAWQaxW5y', 'lIOzjhBcGwbkxW4', 'W7DqvsjAWPFcTa', 'W6NdGSoS', 'WOmwzCkiW4ZcSsxcMCoCkbq', 'rmkzWOfyWQKxW71GW6OUW68Mh8o9tJFdKK8bsmkDsCkic8k3W7LHW5T5Fs/dNSoQcmkqWPuve8olv8k7W7VdGmkdEGS/BCkt', 'W514WOfyWPOLhHDgW7n3WPZcOSkTWP8aW7LJW4bkmmouCCodW7NcPmk/WQhcQtpcNSk+ka', 'W413W4u', 'cMq0WQzmW7W', 'WRRcMwJdPw89ySoLlCoHWPZcG8o1dmoRW67dUqvgcCksF8k5kSkYqJZdVguqsqbWwNxcKSkPd2ddQ0nbWRX9faVcPSkBpCkgtwTEDGz+WP1xrMLCWP8mW4KtWPVdRstcNv4LrKL5imoQlhWtWOpcVSkdWP3cOmopW6xcO8kggWGG', 'beBcTrBcHCk5lq9haebOnmkDW5VdJfSTWO97W7ZcMx/dGmk+W4pdHSoYWRddKCoeF3JdKCoLE8kOdWxdSmkKWO/dPSkWWQHcxJLOWROqxq1qW7/dNCoCfI04oCoyWQVdKWZdRXb/W6JdLmkAWRq9sxyMlCknWQRdLmkSBgjwiCoClmo0eColWQyEWOZcQe4BWQHRWR7dOYfEgmogWQhcSCopamkQW7pcHwerWPvpWRmlWPjepgntWPe9', 'WRmbW6BcQutcVSogd8oqW6hdNCksbCoa', 'WP4Jchm', 'W77dJIFcVG', 'WOFdK8ofWR9YqaW', 'w2OdWODrWOJdJSkIWOqFWQ7dHSo8', 'W6NdGY/cVCo8', 'zSkwdgTeWPpdI8kDWQLUecGAlNldICoXAG', 'WPZcSSk5WP/cH8oZF8kA', 'W51TWQFdNGGcpgrHg33dIM8ZW4hcOfhdTSkyqmksWRFdJ8kpWOjwr8ogW6DcWP7dM3jMWPPQ', 'W6hdImoMuwldVCojW7pcTW', 'WPm1e1G/WR4Oc1a7ivdcKuC', 'zCkRWRCVwvVdRG1Cq8kW', 'WO/cH8oiAq', 'W442WPjEW5eKrv0mW6T8W5ldJCo/WPbdWRyUWO0lFSkqiG', 'W47dRSkuWOBcOCo8ESkeWPq', 'WO0BDSkqW5RcJW/cHCoe', 'gSo8wcuEWOZcT17dPXNcJq', 'rmkqdNmiWRldRa', 'zmk5ahf9W4pdUqRcOLFdMvBcHefPW6xcU8okWR3cLmkUeCkQsCooymond3L9WPWwW48Af1bEWROMuCoPgwtdKb8nW5hdRX0IdH/dImk3WQhcTCkMWOSkgxxcGCkfvSoUWRnTnrldUHVdOhe7BW0lka', 'WRRcJNhdSIfUzCoOomoOW4tcNmkJcSo8W7BcUXyqfSkuy8kRzmo6sYFdTxmcuLb3ux/cJ8oQhZ/cSbbzWRb8a1JdUCovBmoihJ1CAe8GW4myawSuWOLDWPG5WPpdOgJcNLSOvum0BSk7CtDAW5pdSCkNWORcTSkmWRddUCkptLfTWQHmBeu', 'W6G2imklkYaY', 'WOSfzCkmW5S', 'oYmgkNBcJKS', 'W5RcNSoFmCkonCoJ', 'W7xcIgpdOdS8F8oYjG', 'WPdcUCkuCa', 'CqO3EHeopSk4', 'BMBdVCohW5DvW6PaW5xdGSoaxSo0W7dcQCouhmk+WRldVGrvW7uUW60', 'WRT5W5VdVCkkW5e', 'mMLNlColmmo8', 'WRuhW6BcHv7cSSoFe8o4W7ddUSkpd8olWQT7mSkbwMtcNq', 'W43cJSoAm8kEkSoK', 'WR4LW6rTW5ddLM7dPSorhSkwW4FdKKe', 'rCkJWRZdGrRdHMddUYL3h8o6lSkXowyJWPvzW70mWOtcVSo4W4lcIgbGWOhcKIyEW5m', 'ghmHWQXr', 'tgpdV8ooW5a', 'jYKci0pcHfPhvYjCC8kNWQS', 'W4hcRraJBCoBW53dQ0LEwa', 'aHu7gG4', 'W4ZcPLijaSkPCmonWQrQCmo5WOrU', 'W7TjvYrd', 'FSk3os4kr8kgfZJdP8krW7ZdLX8c', 't0yMhGDgW4G', 'WPiJWPbEWPaNsu0q', 'cmo2uHq8WOdcSq', 'W6ldLCoNwG', 'W4/dK0HtCSo0WRRdQmoFgua', 'AJ3cJM/dIKOiqCk/W67cP8k5W4xcLCkopmkqfmokbmk1h0W', 'W6NdGdVcOmo7EqJdKbu', 'dSk9x8k3W4Sp', 'wqRcTrVdLmoD', 'wWxcOahdImo/zfWt', 'cSo8tdqPWOBdTetdRqpcNa', 'WRvKW4JdUCkQW5TzcLG', 'pqO1DXmyoSkJWOldOsynW7ZcPCkPlJFcVCkggfxcKWHX', 'W7ZdJ8o8whu', 'wCkrgx4rWPVdI8ki', 'v8oJWOtcLGC', 'dmk8yCoDrmo9hq', 'gmo4uNLWW47cQv/dSaFcLrpcJq', 'c8kcWP5lWRm', 'umoMWONcHqDGqvVdL8oiWPrcWRBcRSk4tYNdTCoCW7FdVW', 'sSo+Dq', 'W4/cHmoof8kkjCo4', 'uCkBhLelWPpdGCkjWO46dd0', 'WORcT8kpBqG', 'W7NcJmkuucFdOG', 'iJ9aW4quW5VcNCoDW4DqW7VcImkOWOhdJbpdNmkms8ovn8kjWRRdM8oFnr85WPtdO18atSk0qrZdGN7dLCkRW7FcN0pcVcHfWPKVW73cHSoIov0FxSkTWQmKW5NcMrhdTYrEp8oDxCk1W4ZdPLq2W4FcHZ7cKSkZfIRdN2FcVCoRW6j0qaJdN8o4CCkyxSkUySoRCmkcWRFcMq', 'WRdcPmoknSoMq8oRkSoCWQ4', 'W53dMujIumo4WRW', 'W4FcNSorn8kzl8oZ', 'WQj/W5NdTmk7', 'W7dcL8kiwGe', 'wmo9ASoBuq', 'W6X3WQK', 'wGBcTqBdLmoE', 'WPyKctaJWQKSa189gG', 'W67dMmkOdGa', 'DsJcNg/dOfzgs8kKW7JcVmk/W4a', 'W4OXhSkMW7vafgmqsJ/dLa', 'v8kAdLCiWPRdG8kEWRm6itqHpa', 'W6VdO8kCWPNcT8owo8kDWP7cP8o5WRX9ueSkW6TAWPnZkCkjW4RcPmoMdq', 'aSk+yCoDvCkQ', 'WOKsy8kMW4xcPGVcK8oEmYqFzhS', 'W68GnCkvbYWZWRGdW6OcWOBcMSkw', 'FmkVWR0WFuxdHavE', 'W7T+WRdcM0XAiYf2rG', 'WQabW6RcMgVcTmofhSoBW7VdQW', 'cSo5WRZdJrVdKc0', 'WQuksZDjWPddQsddNqmiA3nCW6PTiCoLActdKJaPWRGpmvqUwb7dQmkaW4tcK8oFW6GHgwXUt8oBW6tdNfJdPSorWRjIimo7uIXYW5lcNJDBWP7dM8oDa8o6W5zFW6TEFSoofNBcPsPQu3evhq', 'W47dHsNcSSoQwqtdHW', 'WQmnW7BcMea', 'WPRdVCkVBW', 'lImca3VcIenoxb9WESkBWRS', 'gSoJWRpdGqW', 'W7lcKNxdSImDC8oUn8oHW5pdKG', 'WQZcVSktWO4', 'v2tdU8okW5fuWQ9w', 'WPu+dNaYWQ8Sava', 'mKNdOvlcM8ktlq9haebOnmkDW5VdJfSTWO97W7ZcHtVcICoOW4pcHCk+W7hcGSkxyNRcNCkSkmo8aKZcPmoHW4ldPmkUWOjcxJLOWROqxq1qW7/dNCoCfJfSFCoyW7JcH1xcO1vIW6RcMmkFWRKVhHjHn8knWR7cHmo0D2ivBSkqy8kMc8olW7bFW57cOemwW7WUW6BcTYXmeCobW7lcP8obamo+WR3cNMulWOeAW6vDW5ScEh4bW4DMaSojfg/cMbBdUCoDWQLfbY7dOSoQj8kqW6K8l8oBWQxcTmkUWQjqpSoIW7iqW4rmWPVdNSk+WPGRpuSPFe5vWRWdW4/cH8k2aSknb10pW78jEmkPW7q4iYFdNsTnW49gW4VcRCoeFSk7kxRdHmkHl8okWRjPE3ddS1STW4lcMmomWQxdJ8oTW6BdJSkNCmoHy8kJleCFddilzcC9WRFcH8oTzCkuz2NdJc1bWPhdMxNdG8obWQmIoba', 'W7SMnmkopG84WPCzW5SzWO3cKq', 'W4RdG1vvsmoiWRhdSmoFfea+W68', 'W4JdGKjiwSo+WOFdQmodg1e', 'W7FdNdRcTbNcG8kTWP3cSG', 'WOOsW41fW63dPG', 'WRZdNmk9cNHkBG3cLupcTq', 'W5W1c8kOW75KkNqx', 'o2fK', 'omo5WQVdHL7dLtVcTw9LeSkNrCoLCcLTWPuCWQ9EW4VdRmoI', 'cSo4WQ3dGrxdHG3cS39VhG', 'uSknfxmaWPZdJ8kiWQK9', 'WQexW7FcIhJcVSozcCoBW7VdQW', 'WQbSW45FW5ydWQldHmkcWQhcLSkEW6SaW5tdHsdcMIFcR083lSkYlmkjWOqqW7VcV8kpsM/cMWtdUmo7WQX5saFcP2a', 'WR0kW7hcGf3cV8oogq', 'tvOMgH9eWPmoWQ7dS0rnC03dIHxcQ8offJJdTCkoxKWWh8oeWRtcSdldKmoKkmkPWQlcR8kLg8kOahqAW7hcVu1nWRpcNSk4W5xdNNBcICoxW5ZcJ3NcHSoAWRBcHmoHWQZdKbJdRrBcJSospgBdMxOHlSo0W5hdHhpcPCoXiH/cHSkDWRpdHCkZhwqjWQfvoN3cUSoSWPyaWPXIdSo0WRZcU8odW4pdHutcO8ooASoKamkAWOJdSbFcQ8oHW7itEf5UnNfcw25wW70KpfmIW5C3W5hdRJ9jtSoyC2dcQrJdVshdN8oyW7FcNWzrW6BdV8kyWPZcVSkNW4RcR8oDDbFdVXndo8oxlCkwW6aiW5pdUetcMWZdO8oWqHBcKuZcVt5FWRKEoSkWe8kCWRtcTbVdPmodW61KW4xdVvhcJJaMWOldRmoZW6JcOmoZeGNdMCohW79FW67cKbdcJuJcUMlcR8o0n2OyWOiZWPZcNCkpAg/dG8o1nSoCWR/dISkFkKXXDu3cTSolz0RdHmoeW4TcW6hcJ8kyWOhcIJldLmoFwxRdLmoJW7nqgheaW5VdOHZcNKGjsuquv8otWQGDkCoGh0i4hCkYWRzVjmokyCoLWRhcQxxdQSkOAmkNW4FcH8kCqJNcHmoEWRdcLc3dRSk9smoWadnoWPNdKSkRWQ5recBcShBcP8oQW5rCW63cPmoMW4/dN0VcTCkGw2JdKqfqWQmIWPTFA8ogWPNdUmkGmCkbpXRcNLxdMLddIxmVsSkXWRBdQYVcJ1OIWRtdGJfnAYH/WRNcVueeW7lcIru+i8oaCCoYWRnjW4BdM8ovkCkifCoCW5b/CW5DAHnPtLhcSSoyiHtdVSo3dW1eW5BdVb/cV8o2xdnqWPOUWR1Ce3/dHCkfWP8wW6NdUSkoWONcTConCSkuWQ5SWP7cSe18bCozCCk3WRmDlJlcN3ZcSmkOBSkbW55bCmkfW6RcRSkXCSojdGlcNmkyW60XWOxcT2hdP8otW4/dUCoJA0Dgfmo4W7PIW7pdVCk1WQZcPhxdPSkQWORcNfFcSr7cLSkHWRJdOGjptx7cMSkgzXtcHZxcGCoPWRpcOCkKW67cHNZdOrakpSkSW7tcRq/cM27dKmo+zmkDCXi8fsddIcfRsrqUdeOqWRTjW59ynfq9W6P7i1hdHSk2qmo0iMyyWO7dGf/dHwdcT8k+WPvRW4DdWPHCBSo2WQtdHCotb8olrXvSBuxcH1nGWRL5hSkkcmkIWRizASotjCkjtmo0W50KwavXW7lcVNygumkDW5tcUdSpW7pdUG90kthcMh1cW7pcISkjWRnwWP3cU8kgWRhdNmobzCkdrq59W7xcPSkzW6W7WQ4WW6Ofc8oPxmkbpSoAWP/dQSoykbJdRmk9hN7cLsDpWOtdJCk7WQ9RsmoPqvtcHmovB8kItCoqW5ddNeKJW4tcJCoWW77dRh/cJYe2lvRdKHuzW4SkWPVcGmkpW5vDWPBcHa3cNWFdNeOOW6dcVmkCaG7cTZJcLuFcMCkxWPSeW4hdGSofDCk2WRRdImovW4PAWQmCaHVcVgVcOdNcLxTfkY9yW5hdVLJdG8k9gu9chMzOp8olWONcRG/dJKSSzmotWRhcLKJdRSkKW5JdNmoZbSoCkvWSctNcQmoIWOmXW5xcQ25PWPXEW5uVWONdQCo0FqVcKSkalWK5geddO8okhWnPheCdWPpcKtDlW7ldLwHQWRyBW6iPWQKrWR/cM8ohl8ogW7BcQCk3WOXApSk+dr00W6xcRW', 'WQZdJmk3h09mBXFcR0dcSG', 'dZRdLmomW7fXWQ5w', 'WQ5uegxcVsHqymocW6STWO3cUgenwCoVA3tcISkUW7VcP8k8WQ03W6Kav8oEe8oIpCoBW7bxbSk3W5m', 'WRu8cZ0WWROWcvy7q0ZcOeaXyZ8nW7W9j0ddS8kQW4NcJeBdPZRcS8kqd8oNAGC', 'W7j4W6vPW4/cNqNcGCkev8oAWOpcUWujW5VdUHZcLxpcR8oOW4/dHhymu03dJ0NdPCoNjgmZW5CGW5ZdMdNdUmkoE8kMW7f9WRhcVmkUW71IWPZcISkt', 'WRtcICo7qgldMSoZW5NdHuRdGmo9ldaTW7VdHMZcTY7dL3r0mcvBtmkXW5xcUuFcJdfQFcpcVCoUzdJcQKJdHaPfW5rIWQToFCoNWPpcKmo1tfyNFmk+WRDXpSompuaIzmomAcddH8kluMr+hJlcImo9WOvujYNdH2BcVxfMuCkBECkXdSkHqmkZW6uFwmoieSk+xWNdJmour1iPD3DiW5dcOga1', 'W6WSW4mFjmkLtCoL', 'W5/dO8ky', 'W6FcISkpwXFdN8kjW55s', 'W5NcVgOodSk6q8ogWPzZzW', 'W6yGW4eubmkO', 'xca0FCkhCCkLxrZdLSolW47dJwpcImkMWRvbgfH7WQ7cLu9NWRLDWPHoAvRdQbZdOJpcT8kCWPRdKMv5egX8W6VcQdxdQICQW6pdVwTVlSkSaSkZmItcHCkdt8kkcSoqW5Hsg0hcIcGoW4zUESkBdGD/W4xcJCk5FIOyWQxdIuOya3hcS8ouWOdcPvTBWRa6W6FcTSo0yCkYWRLjp8krWQDdWQlcMmkNW53cIZpdQCowC8oFW484nCkYtCkWAmoDaColE8kDdqFcHSk/W6bxWOT2W51LWQ1PW7ldGLBdUeWfW4uGWRWGW61Wte3dOYDTvbqFdw7cV8kpqNKHFCo5B8k6WQJcVbqwWROLmSobcCo1W6uvk0FdJLKynSojurxcVSkmWOXKW67dQSoQW78dfKuUWOJcRHFdUhGow8ojW5JdKeOHWPPoW7TxwGviW7xdKuaBW6D1sCouW5VcQe/dMCkGWQf0W57cQmoMWQLNWQafW7FcVCoZCu1htbGLWRhdGdKLwmoDW5hdUGnNtwpcTSoKW5GsebdcSLrpzmkAksVcNSkgC8kwWR7cUCoOW6/dTSo7xupdOdTXW5hcKwK5rmkGWPxcPmksqSkVDmoclmoIzSoGW73dSCkWvmotW63dRSk/WObghCk0dCkkutddV8kVW6pcJmoMW7CgfCo8ybblWROZfCoTWPRcTSkxh8osWQZcOSkkudnpCLiuFJDbtmkaoSkmWQurhrddNZepm8o1tcddNCojm8oMW5BdJCkZW7xcQxTYiIRdRIzVgmkDW5jbWQ3dMmkcWPBdSSohqmoGWORdM0/dUwb4DYTPWPr8WPienwBcRCoZWPVcIrRcUsyyxYL1WQ/cMWVdG8kMWPNcNmoTl8o4Cmk8dCkmxCkbWOyZWRxcQmoxWOiEWRdcRw8HrtnFW4ddG0u1W5NcKZhcT8kXtt3cS8kMWODOlSk4y8k3BXCav8orvcq/WOtcPY/cUmoCDSoDaXHznsXInCozW7ldNv0nsfzmWQSwW5/cMSoDpf0QWRfoW7NcV8o3WQHzcr4Stu7dMrhcG8oJoSkVW4mhrHiKwmkdWRH7B8kYAmktW5JcHCkOi8k1W7DNgWfMASkzl8kEW4WYbgqpW4FdISkthv7cRmoOc8kRW7fv', 'W69esM8fW5pcPu/cMqO', 'laDRlapdSSkSWOxdKqSqhq', 'W7lcNgpcVG', 'W7OSW591W5mfW7q', 'WOBdVCk+FmkPWOi', 'W6VcMCotm8kpjCoXW7XckCkJWRtcIH4AWPXVistcLCkpWQldQSkOWO/dSSkpFCogqa', 'c8kNw8k2W4z8g8kjWOyPySoKqq', 'W6NdNJ/cSSo8uc3dIG8tWORdSCkLW5OsjCk8vqFcJG', 'W5q9fa', 'W7lcMhNdPWWHEmoOjmoQW5u', 'F8kRWRCQvuFdIHe', 'gCkFWPvqWRm', 'WO3dI8k3euKfzHZcHe7cQsqXfSkBWQ5OW6iHW7FdICorWQhcMSk6ASk/WRWm', 'W6K2pSktfsiJ', 'WQxcJxZcMMhcQSk1WOZcSG', 'W6pdGJNcV8o9uqtdKa', 'W4lcMCoLxHSfifNdKa3dOw1/uCkBW70XWRf1WRlcHmorW7ldJSo7pSoQW68werxcGqykrCkwBCo/WRpdG0m/iSkUm8kZfdv9WOSHrKXCWOKHW4RcVd3dG2DkebpcIh3cTCo1aZemW5Togt4hvcHpnSoEW6FdMSoiWO5tW7JcSGvaW79bWOxdNCoXuSoadmo4wrXviConF8ooWRxcSdL0W7ZdL8kAWQBcLCk2gSkXnmkADWBcOtaYfHCHcc81W6j/WO7dQmkEBrldICozWOWmW7lcNSotAJJcHCkmiSkVySoTfSo7WQFdMCoQaKneo1RcUsBcVdfksrjHhw/dMSoFr00tW5PJW6qFWQtdQeJcOmo8WQVdSmoJW4SYguBcRY/cH2BcV8koiYvTamkGi1PhW4xdSCoKzGddK1GEW7eWW7VcOmo5WQmqW4S1DSkKsmkTWPuzWQK', 'W6VcNhe', 'zCkmh2beWPpdGCkuWRy7e20oox7dL8kUlHDfW7yccCoyBCoWzCkqW7WVdmofhSkpiSk0vZeBW7iKmSkGdSkOkLZcN8kPW70', 'WRmnxsNdPgb1uCofW48H', 'rSkEfMCb', 'WPe+WOXq', 'WPOLcNGHWRiM', 'W6/dNIJcVmo6', 'W6tdGY7cTSolwG/dLWqyWP/dISkmW5Ggnq', 'aSk+DSoeqSo6v8kaWPz7iHFdNmo1W4hdTxvaWPVcOCkZWQNcV8ojuvzKmLnLkKRdM2ZdKSk/aCkPWQ8RWR7dH8khySofvSk9p1n0W6S', 'W58SW4neW5CiW6JdO8o2W7JdHSoB', 'WRVcMgpdQ8k8b1NdLs0FWQRdQ8kb', 'W7CYoCkjpIy5WPeeW7OtWQtcJCkCDgOhWO3cPfJdI3ZcIG', 'BN4jWOHrWP/cNCkjWOHqWRZdMSoPW4/cMbpcJmoEdSkyFSoCW7FdM8ktFfX8W5RcRf4', 'W5NdL1rava', 'WPhdPWiHESkuW5tdUr4oeZLMWPFcGmosdmoIW5ZcUmosdmkRgalcLCoUWRhcRSoGic7cHCoOrCorDCodW4hcLSoCzmk8q8knWRSiWP/dNL3dSCkWyW8dW5nqr2KGkSo9WPBdQq', 'hSoPWQVdQXldHJpcOMH3oCk9BCo1', 'kLldQ8oSWQJcSa', 'W5lcT8kJF8o/W7ZcPSomj2TBW4NcRMtdUSorFCo4tmoYW63cNYVcNHxdNrpdI8k4rHDkzJtdQqpdMmoxWOpdN8o+o3nSW44ZW6NdRCkrWRFcN2z+rfFdGKTXW6CJFCkWW6C', 'W6xdH8o4', 'hK7dRmoBWQlcS8koqJVcNq', 'WQbSW4LzW4ryWPBdRSkcWQhcLSkEW6SaW5tdHsdcMIFcR083lSkUp8ocWOKpWRpcI8kLsM/cMWtdUmo7WQX5saFcPW', 'WQtdNmkRgu9n', 'vSoTWO7cLWTJtfZdMSoFWP9jWRW', 'W4NdQ8kgWPBcVCoaF8kOWQhdJG', 'WOW2WPbCWPSYy0qfW6HH', 'W7W6pmklgtCUWPWp', 'bgvLkmociSoXxvRcL8kcWOlcIdS', 'yCkKWQSHtMhdUs98', 'W69TWQ3dKGuumdDMj3xdJw4VWPpcVMddUmkyqmkwWRRcGCkzWOu', 'FG4REuGu', 'eK9zhSoip8oXgflcGSkNWOhcJdVcICkR', 'W4ewz8kkWOBcPWpcGmovkWKwsg06W6H8W5JdUCoYW4dcVCodcGZcOvBcO8kVutrd', 'W6jAchZcTgLqESoLW6CMWP7cPq', 'uqFcOH7dJSoxAfW', 'CWVcUmk4W63dVCoAb2pdICkxWRJdTCkvW5T5W5z6lmodW4KNW7rThYFdPCk/W7dcQ24cWRrkoviWzIddRCkLW6xdO8k1amoJjCoxWQfoDwxdSKlcVexcKmkVWPCxW5RcNcS6vfhcR8ory8oDW5j0WRtcMSkJW7VdOghcSG1abMrPaSovW5tcK8o5BCkmWOpcRHxcHhhcKgPKW4ewewLoWPxcNmkfeGJcJY0By0Tflr3dTc8VBM/dQCkhWPGGW7yoWQldONiuifzDpZC+W5uPW7WnW7Cto8k8W7WzW57cQmkPW7pdUCkHW6JcLMrGWQxdHCk4wefJWP3dPZBcP2O6ySolW5bUWPJcG8onr8ojWOddN8kHESoFWQmpt8kRg0xdKSoLaevWASokwSkwtSkjd0FcSSoQoG8MW4L6omk0FSkybmkIWOPqWRjcAmkgnmk4rCoLjmkaymkIpCk6W7DBiLvSWPzqza', 'fu7dTSo/WRNcTq', 'W4O1fmk1W5nBjxqAusu', 'BsBcO3tdNfHjtCkvW6VcUSk/W7FcLCktj8oEha', 'WQC5W69LW4VdQ1FdRmoO', 'W7NdNchcVKdcGSkQWO/cT8kBtCoEW7tdJ8kdxaC', 'W78HiSkioa', 'WPeXhmkOWR9qlNyAuZ7dKgFcVfZdM2tcM8orEhVdHSobWO4', 'g8kfWP1wWRu', 'beBcOH3dN8owmXnivar2hSkDW5VdJfSTWO97W7ZcMx/dGmk+W4pdHSoYWRddJCkqo2BdU8oLE8kOdWxdSmkKWO/dPSkWWQHcxJLOWROqxq1q', 'c07dUCoRWQlcSW', 'W6nuaxBcSa', 'W64Fp8kv', 'W5VcISoArXBdRmkFW5ji', 'W5JdSCkqWOFcK8oeESkDWPddTq', 'WQtcRCoxfSoS', 'W7m9pSkcoaSdWR0M', 'W60XWRjMWO3dHtu', 'W5RcLCkFrXldUCkfW5jiW5NdLmkIWPZcJmkZE8kVBx9MW7jlW5zUW4JcMJa6gWpcQ8oX', 'W6ddMddcPa', 'zmkVWQSJsee', 'n2rW', 'WRCYW6bY', 'WRv6W4ZdQ8kTW7juofG', 'W6xcKwddOdWaD8oXja', 'WRBcPCoA', 'gGKWha', 'WOJdSCk7DW', 'WRKfW6dcH03cQCoObCosW7RdRq', 'W65WWQZdLqGfpaL9c33dKG', 'WQj+WRFdHWLyns1HdhpdJh5VWPtcTeBdPq', 'dxuVWQi', 'WQiYW6D0', 'W6VdGdy', 'WO7cU8kwWPtdOCotFq', 'WOFcM8osnq', 'W7KHnCkgpIyZWReE', 'ugxdRmodW5C', 'WO/dU8kJCSk3WPm', 'WR/cVSkFWR8xWPWdWRpdNSo5hmoKW4VdVG', 'oKtdTSoSWQJcS8kobYRcMSkxW6RcSmoeWO4WWOq/Aa', 'W7GQW55B', 'cXSS', 'W47cUHq0FmkEW57cVKrxsIHUW4BdUSkxxSoIWPldT8kgsq', 'nhj7pmodmSoKdKJcOSkcWPRcGtO', 'WO84WPzsWQ0LqvKkW69AW4ZdMmo4W4S', 'o8kGw8oKW4zac8ofWPa/zmoUeXZdUCkezCknaM4gFMOyW4qrW4iwuWRcH8kJW4ucf8kqW5ddMCkDncK9ymohW6FcSfDYqHX7W6eglwJcRu/dLSkLt8o2vCkiW4GJACoitmkgua', 'W6hcGmkcqtddOSkcW4LdWPFdHq', 'WQfNws9HWPJcVW', 'smk8W6VdPcVdRI/cPw0', 'bK9hcq', 'WOi4WOXrWPCYtwygW6nYW47dPCo+W5G', 'W6SMW5SAbSkL', 'w8oJD8oBuq', 'f0tdRmo9WOdcSSkErI/cVCoEW6ZcUCoq', 'W45WWQZdHWqzjwLgfMZdMW', 'W77dNI/cTG', 'WPtcRSoqaCoSq8oRySoWWQpcSxC', 'WPJdL8ohWRH2usPHW6ldLYu', 'W6GSW6fFW4udW67cJCodW7ldKW', 'eqSJkGJdQSkTWOhdMZbrdmoaWQXTWRi0dtT5iuNdTSoLawv8W7/cM8kHhvPTW7hdJmkufWVcIa', 'FaqREW', 'W7lcKMBdTcmRo8oXimoTW4/dLCoKb8oYW7tcTWe', 'gX8TgIvhWPHhW6NdUvK', 'W68VW4XdW5O', '8lMZNxdcTZGMoSkzh8o0vSkMWP/cGwj5', 'W70KW50DgCkUuG', 'WQ04W6XTW5JdJwFdKSoWh8ktW5ddLKPhWO/cSG', 'WRDYW4NdM8kXW5jsox9CgG8', 'qmoYWPtcMa9H', 'wdVcIJVdHLzqcmkIW7/cVmk/WOtcMmkoo8kqdmofbSkOuv3dOCoZECoiFu0UW6SyW4CYWR3cTupcVmkAW5/cMc/dRCkKW655WQSWdmoAW6vdWO9yWPdcRZFcKKxdTbFcVGdcO8o3WPXgySoNlCkIxtJcTmkYDrDPWReDWRVcMhfmWO/dSmopqG/dMIFdLqH+qmktumkNDtBdOHS1WOOEWPn7W6Dj', 'kW13jqi', 'W53cMCovpW', 'WO3dI8k3euKfzHZcHe7cQsqXfSkBWQ1JW7q4W7VdKCkCW7lcGSkYBCk+W7u', 'WPhcOmoxgCoSsCk/o8olW7RcTx0knrz7WQ/dVZ/dJ8oWa0fCESo4W5VdJWvD', 'W7/dNZ/cOCoewG7dIbqgWQxdOSkpW40', 'W5n6WOzEWPKPva', 'gXSNcqnCWQLqW6pdOKnk', 'WRilW6dcQuNcUmod', 'WRFcT8kuCbNdJ8ovECkQuMWCW7SVl8o4ccDpW6i', 'W6ZcPHa5CCkpW5pdVvmsucjJW43dO8kCs8oIWPNdQSkaq8o5aG', 'WQifW6ddHaxdTSoFd8ogW6hcSSoyzq', 'WOhdK8onWQC', 'ugVdTCod', 'xhaSWOTdWP7dJ8k+WOydWR4', 'lMhcL8kZe8opWRJdK8oeWQtdTa8flG', 'jsmqmG', 'WPOsB8kxW6RcRaJcGSovkri', 'u1uMgHrhWPHuWRlcNq0EiWhcI0ZcSCklwxBcSmkvxGfXtCkdW73dVJ/cHmkREmkZWR7cUmkXcSoLheaWW7hcVu1nWRpcNSk4W5xdNNBcICoxW5ZcJ3NcHSoAWRBcHa', 'gLNdVCo5WRNcUmkEzJC', 'lqfZjqBdPmkL', 'uSoNWPtcTa5HdfRdNmokWRnxWPdcUG', 'W4BdICkOrNxdLmoUW5hcLq', 'W4tcPHu8A8kAW47dSviFtIHM', 'A8kZzIOkvSkqmIhdOa', 'W4VcVh0fbmk7BW', 'F3JdVCkgW51FWR8fW4JdG8oxsCo0W6JdPSoLvCk6WRddVWirWQeiWONcRgCTWRZcLMhcPSoaW7lcPCkvWQZcPSkXtCk1uZlcNvJdIG', 'W4tcHmopjSkQjCoKW6zaBmkdWRtcLHXFWPPZ', 'WQhdN8obWR92aWHGW6RcMdtcHSkRW5HiW646ySkqWPBdOSohAcJcLcD6h2WR', 'W6BcKCkBqtldRSkyW5rqWPZdPCkZWPRcHmkJE8k5', 'WP3dRCk0EmkKWOxdTq', 'W4dcHCosn8kzdSoeW4j6', 'tx7dUCosW5fd', 'sSo0FCoaymo7b8o+W5m1DG', 'WR8IW6rYW4ddSgBdJCobfmkoW4ZdQq', 'g8kKx8kWW55D', 'W4hcJSovnCkdmG', 'WPK/a3GHWROXb1eHk0dcQ1C7yti', 'W57cVbaHw8kEW4JdQevatW', 'WR7cUSogWP4uWPyCW7VdN8o9o8oZ', 'WRVcTmkgWPCAWPCkW7VdGSoOmSoYW6pdVSo/W6e', 'WQ/dNmkXo1DaBrZcNLNcGZqwfq', 'WP7dUCkLFSkVWOldImkdyY4', 'WRBcUSkgWP8', 'WPVdMCobWRzEta1VW6i', 'W6/cK2ldVZOQC8oV', 'f8k3sSk2W5zmu8kmWO0UF8oOuHhdUCkdzCktdwqBpx8dWOSqWOOFru/cLSkL', 'W7XxsIHA', 'WQpcRSoo', 'rmofWPvqWRejWOq0WRnIWQO7hCk+axVcNr0BhSoCg8kabSk6WQ0KWP9PowRdL8kRwSkIWPihqmknwmkMW6VcMCkbAbGQASocpwLXAWNcNmoiuaZcOZqOj8kAW7DhWRpdMSkCoL1YW4aRW5xcVmoSWQxdRNv0WQZdKJOmWRdcOaNcPNTkxSkkWPvuWPJcOmoOg3VdVMJcVaFcM8onCCofW4ZdNfRcICoWBMFdUSk8bmoXWOfszmouW5PJW7RcM1RdGCkJgWrknCo5W44', 'WPNcUSkCBr7dPmoADCkH', 'a8o8uYi8WOtcVa', 'p8oTWRBdGHVdH37cS2KJc8kLvSoIFgzLW5qqWRfjW4ddGCk/WPFdGsWKW77dHZyjW5C', 'oML6omoZpG', 'zmkVWQqYwqtdNGDcwSkNWRO', 'xKSLfKzHWPHhW6NdPq', 'WQpcJNRcP8oHqq3dHLXuWQ7dP8klW5Xtd8k6raZdMfbSW4bRWQHEFCojxmo2W4xdVcJdGSkgWOT0sd7dRSoSe1RcR8kzdmodWOLpomoSc8kXcNikWQSdWQNdLmo4W7VcI8kRjxqWW6FcLetcRSovWPTJedJdQvu2C8o8W6a6WODMzmkmWOTEtmkHCSoTymkTxf14WRlcTSkghCkTp8kaFLaZwCktthj8WRVdSehdImoOl0fOeMbIWPucW6WzWR0DW4rMW7hdOwpcM8ooWOWNW4yRxb7dUConWPFdUeK', 'WONdVCkJxSkTWPpdQ8kjAt85WPddHYa', 'DItdHSoMvSkCW6ZdK8kcW6xcVunaASorDg7cS1BdPICwW49pW6/cGSoiW6X5W6/cLSkZqSkXgg/dK8k+WOhdUhLNW63cVCk3xmoQD8oOW6fElmoiA33cGCopgCk1WQtcNaSwWRpcVxCrWR/cObS7W5zzjxf3DHnCW6RdNmkfW4NcVCorW5FdMdrSW4hcLv8OtcNdTSkrWQ4Qn8oxWPlcR8kke2DQWQNdLwDfW7HzomkqabVcVYbrWRiVCcbIb8ofW7xcOri7WQxcR8ksW43dPHHmEaNcOCkmW6VcQutcVvv9WO4OWOldKsT0yq', 'CX4XDLmoamk7WOBdOcW', 'W4pdRCkbWPdcOCo1ACkaWPxdHmo1WR5SufbeW6TA', 'o2f9m8otnmoRhflcLCko', 'tuqv', 'WQxdMmk3fv5xqXBcNelcSW', 'WR7cUSogWO4EWOSdWR/dNSoSmG', 'WQC0W65U', 'dCoLWRldIW3dLZ/cQNy', 'k8oPWQ7dMXVdKcRdP2bIeSkOqCo1', 'W5ZdT8kqWOFcQ8oHFSkfWPtdPmoUWR9QCfvg', 'CmoSWOhcKW5Hbq', 'h8kyWPbxWRnsW6PlW7e7', 'WRBdNCkyabddQ8oA', 'gmoOWRS', 'W7GGW44ah8kU', 'cMxcISkZeW', 'W6/dLcRcUSo6ubldOHu', 'W77dHs7cV8oT', 'd8kHw8kGW69kdmkgWOyKyG', 'W57dHejiqW', 'vgxdSCoi', 'WOhdL8ohWRr2vZzTW6hdJtNcNq', 'W67dJsNcU8oQwGddKqu', 'xhJdT8ohW4btWQTwW48', 'WRxcMmkXvYpdRW', 'WRfZW5NdNCkYW5TqlKjCnWBdT8kB', 'swOuWOXrWPxdICkuWOqrWQ/dJCoS', 'WQrZW4ddT8kOW5S', 'WQG+W61S', 'W6uJWP3cOmoPWOGjdwrRhJVdMq', 'AJZcJhJdMKPw', 'WR4xW73cGG', 's8k0W6FcLK/dHb/cN3jega', 'grS5gWm', 'W7xcIwddPZO9o8oUimoP', 'W702jmkIjIy6WPueW600WPdcOCkl', 'aXu2dXjbWPLD', 'WOG0WO1z', 'WRRcOmomhSoSx8oCimoiWRxcSW', 'xCkEchKbWO3dRCkuWReHeq', 'WO0+WOXsWQKPrf8b', 'dqfYpaldTmk0W4ddKZuybCoDWQ0', 'dgi0WOPwW7WLkYWSW49mgbe', 'W6hcMhxdLImRE8o5l8oWW6pdMmoidq', 'W73cISkprW', 'WRNdJmkShvbKyW3cMvVcQdKMmSotWRXJW6u', 'W7HVWRBdMGWs', 'gCk+x8k3W4XJf8kwWPC', 'fMVcJ8kO', 'vCknch0w', 'WQ3dI8k3euK', 'wmoNWPtcGWTNtfBdNmoAWPHnWRJcQSkYtW', 'WRH5W5NdVCkkW5Djj0LHgW/dI8kl', 'ghVdRCojW5al', 'W5VcPx8veSkgFCofWPi', 'DwKsl2hdKYqleKSsi8oYW7/cV8kLqCoipxzOAgnNlLDQdrlcGKZdMCklxmkCWP9gWPVdH8kCo0ZcTx7dNLW4emoUWQuRxSkYWPP/WQ3cJ8kckSk9W6PHW4PyWRNcSHC5W4xdVuHpzICXWQNdLSoFW5VcGhahEmkhn2jtWRuInHBcVHHOnSosWRBcOc/cRmoSDfVdVCo9W6n3WRxdTZrTva', 'fwRcImkJbmo0WPJcVSoU', 'kdygi3NcIw1dwWDw', 'zmk5ahf9W4pdUqRcOLFdMvBcHefPW6xcU8okWR3cLmkUj8kLdCkhnSotjxL9WPWwW48Af1bEWROMuCoPgq', 'w2tdUCoeW4HvWQ4', 'WOCKfxi4WR4', 'W47cQhitba', 'EIxcINRdJwTas8kL', 'WPddHmohWRXH', 'W7KXW44hbCkZgmoHW5asgW', 'EWuRE040c8kyWQS', 'WRTZW5NdSmkXW5O', 'WPJdMCogWQDsqb1NW7JdNqtcJmk3W5PiW7i9aCkzWOxdTCkt', 'WR3cQCkzWPuj', 'W7NcQMOpdSkMpmoKWPH5zCo1WO4', 'W6pdLcZcPfW', 'eCkjWP5x', 'ubVcPbq', 'W5VcQr0GBq', 'xCkSegLQW5xdRwZdIJtcKJldGW', 'W4BcSSkuAe3dMCopyCkOvdqEW5WPmmo2ghfCW6FdIcuIsmkHfa8CWP5LWPSyWQZcMXvAW7RdTqWtwCkAk8o8ydBcJSkfyumWfSowk8kGW5e9qeatW7xcJSoNWRVdS0ddI1xcG8k6oNm', 'cL7dU8o7WQJcRSkj', 'W5hcP3Gj', 'W7PxxszCWPVcS2VcIq', 'cghcNSkYnCotWQlcH8ohWQVdQq', 'wCo0CCoXt8oXbmoVW5GVqe7cTCkX', 'W61kxYbeWPVdUKFcNePgpZysWQSJySkG', 'hCoSqZi4WPdcQG', 'W7ZcHSkvwW', 'W4ZcRbuqFSkEW5tdQMXBtZLNW4FdR8ka', 'xGlcUSkMW4FdVCoAb2pdICkxWRJdTCkvW5T5W5z6lmodW4K7WRaKssFcPSoZWRhdPhqFW7vkmvi3DMVdV8kHWQxcSSoKzSkQyCoxW6CpEctcObddSXlcNCo9W55qWPldIcz8bH7dOSoCiCktW5D+WQNdGCoDW7NdVN3cVurEbGGSq8kdWPhcK8kkkmoEW5xdQ0FcRNhcKgPKW4ewewLsW4BdJmoexaJdJgfAmbHym17dVYKVn2NdS8oCW78TWQjhW7BcRJCwiaujzNT7W4GRWR9EWRqilCk4WObyWOZcOmkKW77cQCoOWQBdNw1IWRVcTmoIwfzHWRJcTgBdPIqKsmolW5a', 'rmofWPKnW7K9WQ40WRnIWQO7hCk+axVcNr0BhSoCg8kabSk6WQ0KWOmTCcdcHmk4v8kTW4exeCoorCk6WQldNSooAb85zSkpC2KNlg/dMCovuK7dONDJymoiWRGsW73cNSkg', 'gWG8aW', 'zXGGBfiDmSkW', 'W7KWW4WqfCkZrG', 'nGPTlbxdJ8kuWQ3dUq', 'ESk7lYWh', 'W4ZcQWu8FSkE', 'WQbSW55aW5miWQldHmkcWQhcLSkEW6SaW5tdHsdcMIFcR083lSkYmmkgW4bzWRhcRSoHaZNcHs7dUmo7WQX5saFcP2aGWRRcIbv0ymopqqlcHKRcV8oLf8o6WR50fWZcISk1W6FcQsNcLqlcUtirWQZcTryKpSkkWRz2W6TyWR4u', 'xCoNWONcLGPW', 'jYKci2tcQLXcvIHDBCkMWR7dTSoRbmkA', 'W5mXha', 'BL/dJa', 'h2VcImkYe8osWRG', 'WO7dMmkSeL5bia3cNW3cPsGZfmopWRGXW786W6BdGq', 'W5aXaCkK', 'gsTzW5WaW4NcHCklWQSzWPRdGmoR', 'CWGXD1ms', 'kWTpjGtdPSkSWOxdStufdmoRWR18WQ4UaW', 'gXmHaGm', 'W74Yi8kpkcW2WOio', 'g2hcKSkdgSozWQhcLSomWRhdNXOPlG', 'wCoRWO7cLdzR', 'wCkrhNShWP7dMSkuWQ9JgIGenhJdJa', 'WOFcJSoTiq', 'W4VcRgO', 'b2iUWQHoW7e', 'W6DSWQ3dNq', 'W6xdIc3cOK3cTmkHWOlcVmkBxmkrW7u', 'W73dKYBcTuBcR8kqWQpcLq', 'WRSNW6vHW43dHMFdOmoq', 'WOyLWOnzWOPTufKmW6P6W5FdHq', 'WPa9cCk1W6jDkc0wutxdIwhcRWFdL3K', 'fCoPWRNdMG', 'W7DucwtcSa', 'WPBdMSouWQbGBWb9W7O', 'FsdcNgVdK1HC', 'W64SW5Wy', 'WQG4W7nfW5JdGgS', 'WQpcRSo4hmoXsmo7', 'WPxcSmogW4xdP8kblmknWPVdLSoIWPPA', 'W6HlW7BcHv7dPCkHsSkEWRxcV8olBmkeW6uVC8oifchdJ8osW7TbWPxdMSoUWOBcHfBcQSkYxCoVsY/dJSkVW6WAdCoJvCoFW5NcOCoTWPPUvCodb8oWgtvgWRldHMJcN2LdW7tcUmomvJPMjmktW6/cO8k8qmkuWPddPCo7W6CeWR3cS8o5p8o3W4FcNSoaW5SqW5eBW75kFCk2W7aIWPL8W5BcQmo8WOzzewJcM8o4ru3cTa', 'W5BdJYFcSvdcHmkLWP3cRCoyw8kDW6/dNSkgxq5tW5pdRG', 'W6e2W7fPWPBdH2BdL8obg8kvW5pdVLCgWOVcQfNdMdRdUSkLW4a', 'ymkVWQWJvf0', 'WP3cS8kjwWhdJ8owFCkQruTfW7yI', 'W7tdJCk3qaDrzfNcK0lcRt4VemovW6aZWQj3WRldL8kfWQVcGSk+i8oOWRTtsuhcJeDgdmori8oLW7dcHG1Rz8o8mCkTENP9W5q6wqfoWPm8W5xdUwZcJMrbbXpdJwBdTSkHdI5cW5vdrJjdgxSmk8oiW7K', 'W5O3W4OEgCk1wmkXW74ohCk1umocEa', 'WR1gfxdcUYDhFCoiW6qNW4ldVI0owSoNCcddG8k9W6ZdU8oKW7i+W48kd8kFxSk8A8oyW7nwaSo/W5z7W5nuWOyXx8kBWQjlDGxcISkPyKRdKCkJt8kXW41yWRrcWOHC', 'WQj+WRldMK4tndj3a3pdJN8YW47cSLddSSker8oy', 'u8oRWOZcNtfWgfpdLW', 'WPuLWOTA', 'WRtcICoSxwBcI8kxWP7dM2ddGmo9ldaTW7VdHMZcTY7dL3r0mcvBtmkXW5xcUvVcG3uJkIhcMmkQlw7cTgldHaPfW5rIWQToFCoNWPpcKmoPqWjJySkuWRDXpSompuaIzmomAcddM8opgZjGkgBdJmoJWPKxAg3cGMBdRIu/hCoEzmkZsmoUdSoNW6HzgCkfw8oYbHpdJmkzcbX6yg5FWPpcTJzYzSk/W5moWO7dRwHeW706W7rMWOFcGaSMdmkJqXxcUwbqF8k7W7RcI1VdKuCpW43cSmoRrG1FW7JdIt7cKfbZad/cJCk/W7dcIwuUW4T2wtpdGwnIrmo3B8k6pYGuz8oZzgCLWRddKMZdNe4YWP9sW63dSCkTqsGcqSk5W7XpytBdM8ogW7NdLx7cG8oky8oUw8opWO41iCouWPqlrWBcN0/cMJRdPCk0F1RcTZKfW6FcT0CkoCk0W7ddTCoTW7yRxKymBqZdN8kUW4KGuCkEW6/cNatdOCk+pIq6W4fbDdLdW5JcPNGSkhZdISkdW5VdH8kKhCkbf8oFW69AxYvmcN7cISoFnCoPW7hcJSoiWR0vmSkQfWRcLCkhWQrZWPiorI3cMctcLdddUc3cTComW5u', 'wSo1WO7cLbbnbq', 'qSoRWOtcHqO', 'WPJdVKHIoCkDW5VdMfnXDW', 'W7ldNcZcTxVcKSkWW47dQCowg8knWQFdNSkdwWCwW5hcOmkrWOKkW6ZdOCog', 'mKNdOvlcM8ktlq9haebOnmkDW5VdJfSXW5SPW6lcS3/dGmk+W4pdHSoYWRddKCoeF3JdKCoLE8kOdWxdSmkKWO/dUSoKW6XCqMO8W6HFe0PoW7a', 'W7VdK8oRv3xdHSoU', 'WPO/e3GsWQ4XbLe9judcTfCXyq', 'W6JdK0jrvmoPW7tdKmoFeua', 'DXK3Cu4', 'WOa1h2KqWRqRgLSHfW', 'WRySWO8qhmkHrSoIWOrEgSk6cCouC0pdN0uoBCo9W47dPSk0WOKzqZaKWOqNDtVcQhLcWRKLrmolm1aHgCoRWR4dDq', 'c8kEWPbnWRjeWQnWW7OXW6e', 'WRVdNdJcUrVcG8kHWPJcVmkur8koW6ldIConwbbtW5RcPSkwWPm', 'W7GYnmkalW', 'WORcImoDimkpA8oGW71zASk1WQlcL0DpWPH0AcJcNmodWQZdTmkOWONdTSkdBmkycmkQxmk2WQFdG8khqZC', 'zaOPA1K', 'taZcUqBdUmoCy1SctHq', 'DaiPCM8ijSk5WOi', 'W7W8iSkelYD3WPifW61wWP3cH8opA24bWP7cIa', 'uSo9ssD9WPdcRvpdRHldHftdHW4LWQRdQCoqW6VdLCo8bCkOamotC8klCxrUWPunW49ouGGkWRDNhCkGxIRdIKbhW5VdSG5UpX/cMmo2W6xdSCoVW4vna2FcLCoveSo6W7u6dupdKf7cSIn0pv4lA8oAofqDtCozb23cTCojWP9PqwJcPuyXpCkSWPnSW59I8l+rN8onW7i4WPnbW5u', 'trRcPaddT8oCyKqsucKS', 'W6hcISk2wHddRmkaW5HIWPJdHCk/WQRcM8k0zSkKBG', 'WRzQW4SAbSo+p8kXWPLCxmo7bmkhpa/cLGeok8k8W4pcPCo9W5TAd3uPW5XQkgBcPZikWRSadCovmZrOsSkQW7XpmdlcPSoxrgPxWQHjeaj8qIVcOr7dIfNcRCkAj8k1WPtcSmkdzuzps8oqBSkyW43dHq', 'WRtcRCoFbSo6yCo2pmoq', 'WPxcHmomjSkckCo+WQ9aAmk8WQtcGvCy', 'W6NdK8o8xh/dH8ocW5FcNW', 'WReIfxiHW7SPav8RcKFcVWmXytKlW6fZoa/dUmk2WPq', 'WRRdKNldOY4GkmkwyCkKWOhcGCkHsCkZWRRdTeqkqmovmCkJACoRaYZdSgevy1aXhJhdM8oNshRdUvCrW6rMfeJdQColnSkDat1mCfC/W5uyawSAW4PAW5OMWPpdVI3dGGS0qL5IBmoMiNrCWP/dQ8kbWPNcOCojW7tcOCkwfWzQW7uEk0ddJCkRcSk1aLlcIYPhWRChWQP+W61GW6aOoI3cNMtdJdj1qcy/C35lW7lcTmoBW5FdISkHW7RdTCodcWVcRaauW75HEmopWQqFASonDG', 'hwyYW6CxWRq8kZOSWQahEa', 'WOa/k3iWWROPc207eudcTKq', 'W7GHp8kglIa2WOmEW40pWPNcJq', 'b8o3qZ0OWOFcVfK', 'W6NdHCo8xwBdKa', 'dCkzWPrlWOTyW6f/W6yYW4TTxmoQqcK', 'WQf/W4NdRmk2', 'W6JcKNxdTGiHCSo9lq', 'W648hmkipsyLWRmlW6Ot', 'EIBcGx3dLKTizCk+W67cR8k2W6BcLCkp', 'oMxcJ8kQe8oyW6ZcH8onW6xdVGSfkCkADcpdRHddVdDnWQSoWQhdGCknW6WQWRVdL8oNf8oI', 'rCkJWRVdHWJcNvtdPYyJw8oKbmkXowyJWPvzW70mWOtcVSo4W4lcIgbGWOhcJNjAW40QEGVcOrH3W78OWRlcTgtcR8kDESoBWOuHW4ddVSk2jmk5WRddLSokxSkSWQFcT8kdvCo9W5xcRSkEW4rBW7vuW4ldM8kOax3dP8osW513BgddHIroWRCWW5OBW5tcKKFcPCkCWPX4B8kogs7dUmkXWQhdVCocW7fZimoqWRFdKSoZWPjEWRjxWO4BC8oBbmkhtmodkWZcL8kqCmoBW7LsW6G2W7XSWPKBW6HnW5nVxtH7CCobz8kDfJVdT8oCW7juuttdT8kXWQBcVSoQmCokWPvZWOBcTmk4cmkOWQVdMSkZWRZdJCkKWONcG8olWQ0mWQO8t8oJdwXvemkUW4i3FL3dNcL/wmo8FSkSl0xcIKJdVSoEwmonWOf4WPKDWP7cHmoLW6m8WO4WW6fBWORcVblcV8odoJpcNCkbW6PEW5vcWRuYWP3cMtBcNCk3jSoOW7COWOJcGdVdJa8yWPO2WP7dHCoqp8otzmkuD8k9W5dcGCobfJG/tCoeevztEmoeW6TYh8kHW49xE8oRaSk3W6VcOZ/cK8o1D3Gej8k9yKzqs8oXzmkPWQGiWQxcHxXmWQPor8oeWRS', 'wCkmkMabWPldH8koWRa', 'q8kla34b', 'WP0dBSkpW4W', 'WRhcTCkfWP8jWRe6WPVdVa', 'W5G5aSkL', 'W5NcPWu0zmk8W7G', 'qCoNWPJcHsfRd0VdL8oqWOu', 'WOa/fW', 'W4z+W4ajW7rGaaTjWQCZWOlcImkTWP8aW7LJW4bkmmouCCodW7NcPmk/WQhcQs/dISo6nG', 'W57cPMWJamkRDa', 'EgxdQSofW4eqWR5nW57cLSohq8kGWRhdVCo/vCkHWRtdSabuW7utW4hcQIS7WRJcLJFcOSoEWR7cPW', 'xrVcSX3dIq', 'WPBdMSouWQbGBqHJW6S', 'FaqXE38tmCkHWOldOZ00W7FcP8oZoW', 'W5JdQCoBya', 'rmkAaMy', 'WO3cJHa8zmkEW57cVMrxucr0W4ZdUmkBsCkXW7BcUmosdmkRgalcLCoUWRhcRSoGic7cHCoOrConiCkhW5/cVmoCzmk8q8knWRSiWOpdKrNcUmoMFsudW5nqr2KGkSo9WPBdQstdOG1mwNZdIqTnW5hdRhZdKxFcG8oGWOv/hmoulCo2iNG4WPS9WPBdRSkFD8krWPj7pab7WRJcJSkxWOaQxhNdSSogWR/cSSkYWPddOCkhW7qIDSoMy1iDB3XZgSk4W5f1WQ45W5W', 'WR7cUSogWP0EWPq', 'c8kFWPjAWQjeW70', 'EIxcGgJdMMLexmk5', 'zmk8lZemvmkbncpcUCkcW4ZdNr4v', 'paHQkGW', 'WRVcTmkhWPuj', 'W6JcUGm6ESoBW5BdSufwvsnLWONdPmkDwmkNWO/cOG', 'W7RdPEkdICoAu8kCcSk/W4tdQdRcTmk+WRxdQCo1xvldHW', 'qSkudrqME8kW', 'W7nnWRddJfZcSSoFbSoBWQJcVCkVkCoiWQb7nSoiEM7cM8kxW7LFWONcK8oUW4xdIbFdUCo9t8kPrdJdNCowWQnwrmkNvCkzWPJcRmk5W4GVbSklcSkZwhTeWQZdMMFdLNDFW6FcQCojqYaPoCozWPZdR8o5xCkwW5BcQSk1WRmjW67dUSkJESoTW5BcJ8kqWOmlW5feWR5cE8kYW7rEW5GUW57cPCoXW5iCstZcLSoRte/cQSoZm8oVjZTVCCoduSo1W5LBW44sWP8iCbJdIH3cOSoiW7Clk8kbW5yWzGTQdCkNW4udaxJcLCo8WQq5WP/cGCoQiSozmSopjWBcMq', 'gmo8WQ/dGHFdGd/cS29SfCoRtSoIDIG', 'kIOxnwtcO09gvW', 'cgyYWQSxW7O4oW', 'd3hcHCkLe8opWR8', 'WQVcR8kkWO4RWOSlWRVdMCo4m8ooW6FdQmoSW6botW', 'b8oYA3HpfCovE3hcTmofWP7cMfTBW57cG8oqW7GUW7tcOCowWOXjWPXVkcvbW6uIfmoHhSkAWRXrWQpdMZJdM8oAWO/dOc0vWRpdI8oLWPT4WQJcSCkRACo4c8o2W5lcGSosWQtcMviskbFcOfOEEKxcJJhcVM7dJCoGyCotWRlcTZlcKuPYE3BdHxj4W4FdV8k/d8k9denZW4ddMmkXW4hcMxRcRSo8W6D7WRxcH8kXWQtdVmokW6GcgxrUWQZdMbJdLtStBSk9WQTBD8oGW5hdNCojwb/cOmo7WPGVkWZdJwy/cHv6qSoMWPHgyxP6W5WcWQdcGZjfyHPkofpdUuS4WOnreMv9Eu1okSoeW6vqmConiSk2cSkTW7bEFCoK', 'WQG4W690', 'hCkyWOnwWRu', 'WORdVCkHnSkTWPNdOCkfAq', 'o8kGw8oKW4zac8ofWPa/zmoUeXZdUCkezCknaM4gFMOyW4qgW4iuuL7cLSoRW5GzuSosW4BdK8kknsyZy8owWRxdUvDUqHG1WRC', 'n2rWgmornmoRcxdcN8kyWPRcIdhcICk9', 'cSoPWQ3dMbVdKs0', 'W7jbbgxcGhDaymoCW60', 'dmoqcIXUW5/cJSoBW71Uq21iEdFcM8oRAHLfWObhw8krk8kdzCoeWRrUwmofsSohz8k0pLuBWRT3mSoJqCo6Ea', 'W7/dNZ/cOCoxxau', 'W6L+WRhdMWmymdz2', 'h8oLWRpdGIRdHIBcSW', 'WOy1f3eYWRGG', 'wmoTWOtcLbbLfvBdNCoqWRLhWQRcQSkYt3a', 'W7KXW44hpCkLwmoZW5WodW', 'E8kTWQe', 'WR/dMmk3efjlzW', 'WRpcOmonhCoRqSo+pCoa', 'cSo4WR7dMGVdKa', 'wSokWOjnWR5BW6SPWRe1W6n/sCo2g2JcJ01dbCoCu8oft8o9W6vWWPK+yMZcJ8oZfSkHWO4ggCokrmoKW63cNCoiya4ToCkyyZ9ODwZdNSkcfu/dTZLUBSooW60eW7ZcJmozAezWW54bW5xcVmoSWQxdRMK2W7NcHM5dW77cOeRdQJOzdCkxWPCwW4ZdRSoLqMZdO27dVGFcK8kh', 'tXSHtG', 'W6tdJtFcTG', 'awyPWQnj', 'sWZcTqBdKSoDALWQqqKMymoyWPxcJrvUW4OiWQJdMcVcHq', 'eMxcKmoR', 'sSo+sCoBqmo1bCoVW6uVCf7cKSkY', 'W6vRWRBdGXjnFMTXc3lcKh4PWPlcPeZdPCksvCkhWQpdGCkFWPHyc8ogW7LtWP3dIJfRWPuQW7BdPt3dGCkhomozd8kjbq', 'WPFdL8orWRr2', 'W6pdGJtcTSo6FtxdRI0', 'WP8cDSkhW5VcOHlcN8otbbmuw3PbW6q', 'ghmHWRTpW6O', 'zG49AN8tmCkHWOldOZ0', 'k8oRuJ4VW4pcTuxdOXpcKbJdG0eRWRFdTmklW7NdL8oVxSoXxSkD', 'WRZdLSkjevHeBbZcO1NcSYqXfG', 'a8o4ua', 'h0ldTmo0WPNcUmkcuW', 'WR4LW6rTW5ddLM7cJmodbCkBW43dR0bn', 'WRNcUmkFWPmnWPW', 'dSoLWRVdMHy', 'uSknfxmaWPZdJ8kiWQKDacunpgldL8kU', 'W5tcPCkuEGJdImoAASoPwh1zW5i', 'WQJdUCk+D8kKWPlcPSkyAgSpWOBdQspcTSkuFCk1dCk7WQpdI3lcHbdcJuZdJCo3uqylysu', 'W4r+vW', 'B8kVWRebueZdGaDEwmkaWRfdWPm', 'CX4XDLmoamk8WOm', 'W7nwvYK', 'WRVdNdJcUrVcG8kHWPJcVmkur8koW6ldIContrbeW5JcVCkqW5eiW7ldOmouW6e', 'W4hcRr8YFmkt', 'h8kpWOv8WQTsW6nXW702W4HIDmo6', 'WPSeCSkhW6tcGq', 'W7Hbxa', 'WOeJaM8xWROXd30Gdv3cUuO6DJK', 'W5pdIchcVfddH8knWQRdUCkrw8oEW7xdNSktxqTeW5lcQW', 'd24ZWR9wW7GX', 'EmkHlJW/umkhodtdUSkr', 'ESkVWQGRsKZcGbjcsCkVWQf/WPO', 'W7XxsIHAWO0', 'wmo3WPtcLbe', 'W5hcP3ade8kasmoLWRS', 'W7nqfx3cTgrr', 'W5C+aSkKW6j8h00Z', 'W70GW5LzW4qd', 'WOSLW7nVW4VcG2xdHmoqfmksW4RdTuijWPRcR1JdNcFcR8kKWOdcGYuw', 'WORdSCkKA8kTWPFdVW', 'Ds9wjxVcJf1yd0LuySo/WQZdSmoPcmkmptaPztCOAraMsb/dJqRcG8kgbSojW4yrWQ/dH8o5Dq3dTZlcM1XvuCkNW6T/g8o8W5SXW67dIG', 'WPNdK8oBWRrNsW', 'vaOSCLKyF8kHWOJcRtSyW6/cUmoTkNNcRmkybeZcKX5VDSkaWQlcG8o8WPZcNeO', 'WPddJSofWRPHrHPrW6/dJa', 'fSk3umkJW4Th', 'W5mXbCkVW6rrjwerxdq', 'AJ3cLNFdMG', 'W5NdR8kEF17dI8oD', 'WQJdLgJcS1JcHSk3WP3dPmoAtSkFWQRdImknraTsWPFcQCkcW5miW7FdT8owW7/cUcT9W4TqASotW5NdP3y4WPVdOa', 'W4G0dMTZWRGPd008xGVcVveMFdLjW6CHnqpdUSoNWPa', 'W4JdGLfewG', 'txJdUW', 'ha4NbWHpWP9vW7u', 'W7aGp8kj', 'W59eusTnWPRdT17cKGnelJikWQ9TCSkGoNlcL2i', 'W5/cRgOJdCkTCConWPLQqmoPWQnT', 'W5JdMLfuqSoxWR3dR8oo', 'WRzQW5WdeCkUc8kBWPLCxmo7bmkhpa/cLGeok8k8W4pcPCo9W5TAd3u1W5mUFt/dVvfCWQuQdCovmZrOsSkQW7XpmdlcPSoxrgPxWQHvqaiZgtBcPa3dI3hdQ8ovACoHWPNdO8okpWnvs8obFCoiWPxdNLZdSINdRSoHuSopEquXfd1wWPhdQZXzuwpcPCocW7dcNN8VASofW6OflSolWQ8IW5upoa4NWQRdL0tdUetcVw7cICoVWRikW73cJIpdUWL6aSkDbSkcW7efW4VdTSkwW6OgW7mpjCkPWONdSM3dK8krWO7cGeJcMCoiD8kyWPO2iui', 'q8oJWOZcHaC', 'd2ZcICk0aG', 'WR7cR8oqemo7zColaSoO', 'BCk4WRCRtG', 'rCkphNmqWPRdISk6WQK', 'W47cJSoif8khi8o9W6PyFCksWQJcRq4', 'W6OHnCkkiZy6WRCFW7aAWO3cOCkl', 'WOaNWPjBWPCJqv8aW6H9WO3dGSo+W5bo', 'W5xcUmo6nSkSWPFdTmkhyJLwWORdOsJcTCkdCmk/amk9WRRcHtC', 'W4ZcPLijaSkPCmonWRn/DSo1WRL9CSkFgXe', 'W5VdO8kzWOdcTW', 'W6tcQmkBWPSvW5KDWQldICoHo8kGWQddUCo1W6LttSodW4FdOSo+W7qfW4pcJHDLW6tcLSoWWPtcTuBcISkwWQq/v3tdPZVcQKT7xGPHwColW48GlmkbECoebCoDW67cKeumW7i2qSoAWQtcQxW0nXy', 'WRdcPmokmmoLsmoYkSokWQ7cG2SKnG', 'W5ldMf5cq8otWOddKCo2', 'W6XOWQfuW5hdINdcGCoffmkoW4RdTeSjWPJcU1ldMZZdU8oOWO3cGxzzhrxdHe7dTSoP', 'W5jyzmktW4JcRvJdVmkqz0zgdt81WQSZWPxcTmkZWO7dUCkqbuJdQaxdOSoXeJvohSoyb8kNFSk3FZJdSSomW5SwW4GVWRnIs1qn', 'WPG1awK', 'qxeoWOfgWRpdQCkWWQS', 'W4JdGLftyCoUWRRdTCojh1K0W7pdMvm', 'WRyfW7BcI00', 'W7xcIgldScO9zq', 'W6dcNgJdVYOQsCo7nmoTW43dHCoEamo3W6K', 'FYJdGNNdILvjqmk+W7JcOa', 'dby0hrvKWP9aW7G', 'FSkMotebuSkCpsG', 'jxr1kCosiSkOdu7cMCkiWOVcNIZdGCk6WRmveLL/', 'WQifW6ddHaxdTSosd8osW7NdSmkCzq', 'omo+WRRcJGFdJcVdP3v2cCkHbmoODJmJW4iyWRnyWOtdQSk3W4ldJZiHW4/dMNikWP9Vn17dUXe+W7PIW5NdOdhdVmkDlSkuWOvYWOxcRmoGyCoRWRa', 'W6FdMs7cTSo7', 'WRWWW6nHWPhcKtdcLCkirSonWPRcTX0fW4VdTa3cNgJcR8kRWOdcIdLEsqFdILlcU8oQAMG9W4G3W4JdGxJdUCkvymk0W717W7lcSCoRW6r3W5NdM8ocWO51WOCiWOGzFvO5W4ZdGmouW6DiWOGwkhKRW4ldMSoYW7m', 'hCoTqsuEWO7cVvNdLHJcNrFdNq', 'W4xcGSosn8k8l8o0W7TE', 'W60GW5S2hmkLwmo0W5CipSkIBCod', 'WPpcUmkECHJdJSoEAW', 'W5iEn8kaW4xcOHxcHCknzqahagX6W6D6W5hcTmo1W4/dTmoevWhcQuVcPCkHwhXcemkfyCoMm8o2k3hcVCkcW5KiW5qGW7P8', 'W5/cRrW6FSkE', 'qCoNWPJcHq', 'W6pcHmkihv7cOmknW5beWPZdG8oZ', 'EWuMCKKyoSkM', 'wCkCfxW', 'W6e2W7fPWPBdH2BdL8obg8kvW5pdVLCgWPxcTuJdKca', 'WOqLWPbyWOW', 'WQJcQCkoWPWsWOe', 'uHRcRHW', 'n2nGnmoipW', 'rmkEWOmhW7TdW6O0W7aTW6zOtCo/t2BcNWKzhSkpt8ozsSo/WRaMW5DOkgJdMSkPwSkQWOyAr8omu8kNW6VcMCoEk0uqBmknmM83phFcNmkeh0VdSdr6ySozWRGvW7FcN8oyoGq3WPqLW4NcS8k4W6hdShu5WQ3dLha', 'u2xdRSodW7bF', 'mGvQjXpdOSkUWOhdMZCu', 'WRldQt5gqCoOpmkiW5C+iSkWW4O1Dmkes3WndqKzo2dcOH3cKCoLW77cRSkrDZZcOCoeW7KPWP7dT1O8W79LASoTDCori8otW6CXW4pdJmo3WPHlW4/cSgr6h2lcQCkInmkIWP3cMXddOxKHWPpcOG0', 'aX87crja', 'W5SXf3r8WR8GgfSJdfNcVvf7CsqqWR4WoW7dQ8k3W4hcKXu', 'WRv5W4pdRmkSW5froa', 'rmofWOvDW7K9WQ40WRnIWQO7hCk+axVcNr0heCkisCkElmk6WQ0KWOmTCdZdLW', 'eexdTSo9WR/cLCkUAG8', 'WRrWtmoHWRauAYbFh3hcGcldRLpcMcVdLSkCotxcGSksWOeNtmklW5/cGL40W53dQ2CkWPCkW4BdUtBcJSowz15ZxqjohCk6nY50hYpdKGNdLSoYWQpdOSoCzCkorSkZrYjZf8khW7JdR8k3W4OjWRBdISo8wSo0w0HFW5PPWQpcGL3dImo6WQxcGeqyW47cQN1vW7qxWRFdR8oskSo0jWxcQfxcOmogCIj8bJOzWPRcKa3cVCooWRZdTCkaeCkmW7RcRcbbWOHKdwhdRCohW70oWQGNWOBcPbiCWRK', 'WOm4WPzdWPeT', 'WPyIchW3WRGKhuOmdeFcRey6zW', 'W4ZcMCoopCkz', 'WOiLWODwWOOLBeihW6jYW5ddR8o/W55eWRaMWO4E', 'W77dUmoBW4LcW4i', 'WP7cNwJdSbtdH8oKW47dUCoycmoEWQFcM8occeikWPJcQ8kkWOHvWPtcPCkvWRpdVsy+WOmvkCkyW5VdUwO3W5ldVG', 'n2nGnmorna', 'gmoOWRVdRrhdJZhcTvv3fmk0', 'qSkyghnmW43cM8ooW7fUuxHDDdFcICo+FXvfWPbjs8kciG', 'WP0ZdCkZW7qzjw8BwNhcJM/cQWFdIMlcLCkrChVdHSoBW4jMbmkaW4q', 'WQPTW68', 'W7JcOmoohmkMsCo6oCobWRBcRMiiifv6W67dRZJdGmoYa11CD8o4W5VdJWvl', 'fmoTWRBdGaRdHJdcPMHGhSkjqCoIAIDKW5a', 'amo2vdqjWORcRuBdPZ7cLWBdKru', 'eghcImkHaSou', 'bmoQtZ8', 'WRClW6FcGLW', 'W5ZcOg0n', 'WQSVW7fPW4VdHNddOmoq', 'c23cGSkYhG', 'eCoWCmoas8k7dCoJW4u4BuxcMmo6WO3cUJijW5xcVSoHW6ZdQ8kCaXGqFvjLkKBdMZFcTmoWuCoSW70', 'WOCKbMKMWQHOd04M', 'W6FdMmk1fXrbzq/cLuhcRJ06a8kuWQ5OW6iHW7FdICoCWQhcMSk6ASk/WRW', 'W4pcPWuWrCkuW57dV0XMvtLUW4W', 'WOG5WOXsWOWiDgyL', 'WQmfW6dcGKhcTCom', 'WRj3W5q', 'WPuYWPPdWR0VtL8mW6LN', 'xaZcRrFdJ8owAq8drryTEmosWOVcIqKTW4e0WQJdNa', 'W64MW4bFW4qd', 'WPL5tSo/WPOuAYbFh3hcGcldRLpcMcVdLSkCotxcGSksWOeNumopWPBdLeiUWONdSwCoW5LBWP3cTd7cM8owz1HLuvXosSoQAIi9xJpdLuFcH8k8WRBcQ8kujmkUc8oZbsbZzCotW7xdVmk+W5ejW7VcI8kUhCk9fuulWPu5WRNcGKZdMSk2W7ldMrnsWRddPtnlW54xWRFdR8oskSo0jWxcQfxcOmogCIj8bIywW47dLbpcL8ooWRZcHSodwCojWR7dUwWeW4XKvYhdQ8kpW6m4W7TZW5tdQ1XBWQDA', 'gCkGw8kLW4Tko8kjWOyNC8oLrW', 'lbbXiaNdOmkPWOBdJa', 'W6b+WQVdNruspYv8dhK', 'a8o2rdqVWOlcRupdRrNcSr/dLXuMWRFdOG', 'p254nmojnmkOh1dcMCkiWOu', 'WO7cR8knEW', 'qrmXqWTjWP9DW7JdSKnFBuldJKhdS8oFfW', 'nCoGEgHAbSocpZVdHCkDW7tdUG', 'W7JcOmoohmkMsCo6oCobWRBcRMiiifvTW6RdQctdI8oZbvW', 'W7y2pSkapIS', 'dbu7gGngWOi', 'W6dcLSkFrX3dRmkbW5G', 'WR3cRSoxgW', 'ggqOWQPEW6WKkYyzW7K', 'W5dcRhCbcCk8', 'W4n3WO1zWP0SsuGcWROXW5BdH8oQW5HmWRWaWO8hFCkvp8khW7hcOW', 'W7FcKCkufrRdQCobW5bhWPddN8kUWPZcGCkNyCkPBhj3W7ngWPu', 'W702W5LyW50uW4pcOmodW6ZdKW', 'W6mGWPtcR8oVW5HCdv9RpG', 'E8kZjY0k', 'W4VcRgOscmkME8oB', 'W6xdJ8oMqwtdKa', 'emk+W4/cLqTYxZxcKSkEW5eoW7NdVSo9hsNcU8ktWQpcUSkkf8kbuCo5WRBcKmkAW7OxW6xdHmkYcmkgW7r8W5CRi0RcGCk6m8k/xmo6q8oOWOngW4/dGgJcJcZcN8k1g8oJhtXaWPtdQSknWRPGkZ3cS8ocW7boWQxdRCoqcu7dJJ3cKwJdL0GMWRrofqLAW5VdImk7WRVcUWa+BSkzWRLbWRNcQcxcLXTbWPOgW6pdS1VdLfpdQCk/W7ldNCkXdM/cSmosWQ3dVvf2W49KCdpdMGa9W4KFW6iYWPBcK8kJW4VdQCoHW7/cLmkelWRcJmoDoHhcJhPBAfFdTSkWAY0/BCkahdu+WQKPdmoQlrBdMWddHYfMWQldN1Odts/dQSkFpHL6fmoFWO8eWOhdLMJcM01hWQ7cI1NdPCkPWOVdQZJcT2NcLw3dLSoXWP/cTmoDW5BcUCkKW5OFyCkmW4hcPXvXCSovWPW2WOzDW5DMWOVcGmoklaKWWRxcK8oqWQzaomo3FW/cVxjkjSoseHnpWO/dNHJcV34/WPVdQmoPW7zGWQxdJw7cPWGIECklExxcUCkqWRH2WPvlnfNdKSk6WOzgnmk/wSk8W4ClW6XTW7RcHSkbW6dcMw3cHKtcGbDoW4BdOdv2oXtcHCkFca', 'WQKYW7vfW5xdHM7dHmoka8k4W5RdKKe', 'W4r3WQeGWPNcGYpcGCkev8oAWOpcUXLDWONdPdBcLxpcR8oOW4/dHhymu1hcIWdcS8oNzY9UW5a3W5/dShJcU8oAmSoWWRGPW6JcSCo6WRqVW5NcImknW4i8W4miW5PcE1jNW57cGmkuWRivW5OsjIvUWOhcHmkTWRSzhvBcG8kctgOZW5RdPe0CabVcJ8k+uNO4E8oAWOhcJadcGsHbCCoKiSkJrJBdOmkdlNDHWQlcQSk1W6C/WPHxdCkYwGBdN8kBvmkZW7NdVJNdRgm4W7lcM8otWRBdH1GcoCkiW6ZdUCkycmoV', 'W7/cLSkvW7mZa0KUWQ7cMhFdICoLWOWnWQbUFSkvWO3dSCohEshcHcfGucSJWR/dSmoBW4dcUfddNN7cGv/dQCoNzu3cJ3jRm8krWP/cTmkaW4CIxaxcSLJdGCo4x8oootyTcSoXqmopiMzCWQWyW6vgW53cIhydmmoMWQnIW5xcTKutx8oHW6W', 'W69evdjn', 'ww/dRmoJW4HvWQDaW5xdGSoNvCkDW7u', 'WQ4VW7tdKvCtzq', 'CYBcHNu', 'gfVdQmo0WQtcVSkBuYRcHSozWRFcV8ogWPq3', 'rCkJWQVdIKdcQx7dPYyJw8oKbmkXowyJWPvzW70mWOtcOSkSWOBcLKPGWOhcJNjAW40QEHFcRLW+WQK2WPJcTgtcR8kDESohW4D0WPtcQSo5ASk5W7pcMSkldCo/WRRcTCobaCkZW5xdRmokWOPwWQ1rW4xdISoZEx3cPCkgWPn6pY3dHcqbW7LZWPzsWPFdMvRcP8ooW5K1imoyxf7cQSo0W6ZcTmkxWRX7oW', 'W4hdUCkNCSoUWPldO8kAyICuWPNdQZBdTCkul8kQa8kGWR4', 'W65mxdna', 'W4JdSmkhWPRcOa', 'DCknch0wW5/dImkEWQKTcYqgpZFdImkUoe8aW5iuqq', 'WPFcT8kn', 'W7KXW44hbCkZgmoYW4Kj', 'WRG2W611W5W', 'tbVcQb8', 'W44MW5XfW5CvW6JdRSoeW6ddN8osWQ5e', 'xhOyWPb3WPtdK8kjWOiEWQ8', 'WRtcICoRw3tdKmkJWOldLdtcHmoJbJaTW7VdHMZcTY7dL3r0mcvBtmkXW5xcPq/dH2S', 'W746jG', 'W4S3W4PtcCkVqmkXW4OjdSk+bmoEC1RcLLzpzCoOW4pdSCkYW5SErIzOWP4MCwNcPdCtW6DRqCovFNuHbmo+WRKbCxZdPCksrcCyW6WmdWiubsBcU0JcGtRdOCowj8o0W5JdVmommKyDdSkxo8ouWOZcL1ZdVcpdR8oSrCkhkLmKctujW4NdSxLcsIpdUSkkWQxdMMfUECofW6icBCkr', 'W4ZdPSkrWRBcVCoEDmkBWQldS8o1WQa', 'W50/gCkVW6q', 'WPVcTmkfWO4EWPCAW7VdPmo0lSo4', 'W5BcISkuuXRdQSomW75oWPJdN8k9WPW', 'WRBcTmkFWP84WPyaWQldLCoJkSouW6ZdQSoVW7e', 'AMK0pSolmmo2dGhdLmknWO/dGcZcG8kJWQOfw1j7W7dcHrS3WQLAWPGpDepdPGdcPhldQmosW5hcMwu', 'W61aqdnRWPhcUv7cMe1C', 'WPeaW7VcMaJcN8oohmoBW7NdSmkBkCowW6vbpmkCuq', 'dgi0WO1vW6WMkIS2W6P2prZcRdVcP3pcUrqq', 'fwFcICkO', 'rmkql2iuWPRdNmk4WRW9bG', 'ge/dVa', 'W5pcHmktwrBdQComW4LjW5NdGSk7WO/cISoMBmkLzZL8W6bDW4DQW4/cGdKHbee', 'WPZdV8k1ESoPW4FcSmoanNnoW4xcV3BdO8oDBCo2xCo7W7BcN3tcHr3cJf3cKSkHqWbcog3dTX3dMmkpW4/cKmkQDwuUW5O2W6hdTSohW67cLdzRc0RdGLrOW6jGASo1WRT0ru3dPvG4WO81W6tdS8kOW4qubCk3r8oJ', 'WQddVCkHFSkZ', 'kSo8vNerWOZcVKpdRa', 'ASk3pX0dumkypJ/dOmkNW4FdSr8', 'W6KQW4iEeCkUuCoIW60ufCkOACoiCLVdNG', 'Dq4Xw1azmSkWWONdUqSeW5dcSW', 'WQnSWRBdKHuciML7axJdL3KHWPxcQfe', 'W7HSWQFdGq8wpce', 'WQTKzmorFxzLWPuiW64uWQ3cOa', 'WQxdMmk1', 'u8o+yCoruCo1hCoJW5K1sL7cJ8kHWO7cPYW', 'W6KPW44aa8kmxmoIW40', 'WOSLW7nVW4VcG2xdHmoqfmksW4RdTuijWPJcTvhdMdldOCkSWPZdHdPfaaxcKq', 'WPhdPWiLACkvWOtcLaashg0IWONcQSosdmoIW5ZcUmosdmkRgalcLCoUWRhcRSoGic7cMCk7fCkmB8khWPZdSmkDn8oVxSkpW7PlW4VcLWVcUmoKoGjbWPiuacWGAmk8W5lcRMhdRW', 'jxrTmCoc'];
    a0_0x4090 = function() {
        return _0x1eeadd;
    };
    return a0_0x4090();
}
async function loadErrorLogs() {
    const _0x580637 = a0_0x3d6673;
    try {
        const _0x4c19b6 = await fetch("/api/developer/errors");
        if (!_0x4c19b6.ok) return;
        const _0x133877 = await _0x4c19b6.json(),
            _0x2506e6 = document.getElementById('errorsContainer');
        if (!_0x2506e6) return;
        if (_0x133877.length === 0x0) {
            _0x2506e6.innerHTML = "<div style=\"color:var(--text-3); text-align:center; padding:24px;\">No errors caught. System healthy! 💚</div>";
            return;
        }
        _0x2506e6.innerHTML = _0x133877.map(_0x4f1b12 => '\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x22dev-panel\x22\x20style=\x22padding:20px;\x20border-color:rgba(239,\x2068,\x2068,\x200.2)\x22>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20style=\x22display:flex;\x20justify-content:space-between;\x20align-items:center;\x22>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<strong\x20style=\x22color:var(--red);\x20font-size:15px\x22>' + escapeHtml(_0x4f1b12.message) + '</strong>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<span\x20class=\x22badge\x20badge-dev\x22\x20style=\x22background:rgba(239,\x2068,\x2068,\x200.1);\x20color:var(--red)\x22>Count:\x20' + _0x4f1b12.count + "</span>\n                </div>\n                <div style=\"font-size:11px; color:var(--text-3); margin-top:4px\">\n                    Last occurred: " + new Date(_0x4f1b12.last_occurred).toLocaleString() + "\n                </div>\n                " + (_0x4f1b12.stack ? "<div class=\"error-trace\">" + escapeHtml(_0x4f1b12.stack) + "</div>" : '') + '\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20').join('');
    } catch (_0x40b24c) {
        console.error("Error loading error logs:", _0x40b24c);
    }
}

function a0_0x442d(_0x115bbf, _0x5f0b05) {
    _0x115bbf = _0x115bbf - 0x1c2;
    const _0x4090b1 = a0_0x4090();
    let _0x442dcb = _0x4090b1[_0x115bbf];
    if (a0_0x442d.OKuDmk === undefined) {
        var _0x2cc84e = function(_0x8c5d50) {
            const _0xbfc90a = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+/=';
            let _0x475b5b = '',
                _0x1a876c = '';
            for (let _0x3d4e82 = 0x0, _0x4985d8, _0x4c7cfa, _0x5b15c2 = 0x0; _0x4c7cfa = _0x8c5d50.charAt(_0x5b15c2++); ~_0x4c7cfa && (_0x4985d8 = _0x3d4e82 % 0x4 ? _0x4985d8 * 0x40 + _0x4c7cfa : _0x4c7cfa, _0x3d4e82++ % 0x4) ? _0x475b5b += String.fromCharCode(0xff & _0x4985d8 >> (-0x2 * _0x3d4e82 & 0x6)) : 0x0) {
                _0x4c7cfa = _0xbfc90a.indexOf(_0x4c7cfa);
            }
            for (let _0x59c19f = 0x0, _0x28e432 = _0x475b5b.length; _0x59c19f < _0x28e432; _0x59c19f++) {
                _0x1a876c += '%' + ('00' + _0x475b5b.charCodeAt(_0x59c19f).toString(0x10)).slice(-0x2);
            }
            return decodeURIComponent(_0x1a876c);
        };
        const _0x5249fd = function(_0x5662f5, _0x3bf79a) {
            let _0xb4ecd4 = [],
                _0x33b992 = 0x0,
                _0xab652b, _0x4da29d = '';
            _0x5662f5 = _0x2cc84e(_0x5662f5);
            let _0x2c5a14;
            for (_0x2c5a14 = 0x0; _0x2c5a14 < 0x100; _0x2c5a14++) {
                _0xb4ecd4[_0x2c5a14] = _0x2c5a14;
            }
            for (_0x2c5a14 = 0x0; _0x2c5a14 < 0x100; _0x2c5a14++) {
                _0x33b992 = (_0x33b992 + _0xb4ecd4[_0x2c5a14] + _0x3bf79a.charCodeAt(_0x2c5a14 % _0x3bf79a.length)) % 0x100, _0xab652b = _0xb4ecd4[_0x2c5a14], _0xb4ecd4[_0x2c5a14] = _0xb4ecd4[_0x33b992], _0xb4ecd4[_0x33b992] = _0xab652b;
            }
            _0x2c5a14 = 0x0, _0x33b992 = 0x0;
            for (let _0x4d75c0 = 0x0; _0x4d75c0 < _0x5662f5.length; _0x4d75c0++) {
                _0x2c5a14 = (_0x2c5a14 + 0x1) % 0x100, _0x33b992 = (_0x33b992 + _0xb4ecd4[_0x2c5a14]) % 0x100, _0xab652b = _0xb4ecd4[_0x2c5a14], _0xb4ecd4[_0x2c5a14] = _0xb4ecd4[_0x33b992], _0xb4ecd4[_0x33b992] = _0xab652b, _0x4da29d += String.fromCharCode(_0x5662f5.charCodeAt(_0x4d75c0) ^ _0xb4ecd4[(_0xb4ecd4[_0x2c5a14] + _0xb4ecd4[_0x33b992]) % 0x100]);
            }
            return _0x4da29d;
        };
        a0_0x442d.lEiopM = _0x5249fd, a0_0x442d.NoRKwi = {}, a0_0x442d.OKuDmk = !![];
    }
    const _0x5f6b79 = _0x4090b1[0x0],
        _0x32ca02 = _0x115bbf + _0x5f6b79,
        _0x535bd6 = a0_0x442d.NoRKwi[_0x32ca02];
    return !_0x535bd6 ? (a0_0x442d.dFdfHK === undefined && (a0_0x442d.dFdfHK = !![]), _0x442dcb = a0_0x442d.lEiopM(_0x442dcb, _0x5f0b05), a0_0x442d.NoRKwi[_0x32ca02] = _0x442dcb) : _0x442dcb = _0x535bd6, _0x442dcb;
}
async function clearErrorLogs() {
    const _0x117269 = a0_0x3d6673;
    if (!confirm("Are you sure you want to clear all error logs?")) return;
    try {
        const _0x183674 = {};
        _0x183674.method = 'POST';
        const _0x4f740c = await fetch("/api/developer/errors/clear", _0x183674);
        _0x4f740c.ok ? (showToast("All caught exceptions logs cleared.", "success"), loadErrorLogs()) : showToast("Failed to clear error logs", "error");
    } catch {
        showToast('Request\x20failed', "error");
    }
}
async function loadMaintenanceStatus() {
    const _0x3853c0 = a0_0x3d6673;
    try {
        const _0x5583e6 = await fetch('/api/developer/maintenance-status');
        if (!_0x5583e6.ok) return;
        const _0x26e663 = await _0x5583e6.json();
        updateMaintenanceUI(_0x26e663.maintenance);
    } catch (_0x50b66b) {
        console.error('Error\x20fetching\x20maintenance\x20state:', _0x50b66b);
    }
}

function updateMaintenanceUI(_0x10ce52) {
    const _0x3f61ea = a0_0x3d6673,
        _0x59a50b = document.getElementById("maintenanceBanner"),
        _0x33ef5d = document.getElementById("settingsMaintenanceState"),
        _0x3a2636 = document.querySelector(".id-maintenance-btn");
    if (_0x59a50b) _0x59a50b.style["display"] = _0x10ce52 ? "inline-block" : 'none';
    _0x33ef5d && (_0x33ef5d.textContent = _0x10ce52 ? "Enabled" : "Disabled", _0x33ef5d.style["color"] = _0x10ce52 ? "var(--yellow)" : 'var(--green)'), _0x3a2636 && (_0x3a2636.className = "btn id-maintenance-btn " + (_0x10ce52 ? "btn-primary" : "btn-danger"), _0x3a2636.innerHTML = _0x10ce52 ? '<i\x20class=\x22fa-solid\x20fa-toggle-on\x22></i>\x20Disable\x20Maintenance' : "<i class=\"fa-solid fa-toggle-off\"></i> Enable Maintenance");
}
async function toggleMaintenance() {
    const _0x326efe = a0_0x3d6673;
    try {
        const _0x31df20 = await fetch('/api/developer/maintenance-status');
        if (!_0x31df20.ok) return showToast("Failed to check maintenance status", 'error');
        const _0x3a8aff = await _0x31df20.json(),
            _0x2d65e6 = _0x3a8aff.maintenance,
            _0x28e309 = _0x2d65e6 ? "Are you sure you want to disable global maintenance mode? This will allow regular members to run commands again." : "Are you sure you want to enable global maintenance mode? This prevents regular members from running commands.";
        confirmBotAction("toggle-maintenance", _0x28e309, async () => {
            const _0x9c2354 = _0x326efe;
            try {
                const _0xf0d4e4 = {};
                _0xf0d4e4["Content-Type"] = 'application/json';
                const _0x3fc62c = {};
                _0x3fc62c.action = "toggle-maintenance";
                const _0x51622b = await fetch('/api/developer/bot-controls', {
                    'method': "POST",
                    'headers': _0xf0d4e4,
                    'body': JSON.stringify(_0x3fc62c)
                });
                if (_0x51622b.ok) {
                    const _0x63f74a = await _0x51622b.json();
                    showToast('Maintenance\x20mode\x20toggled\x20to:\x20' + (_0x63f74a.maintenance ? 'Enabled' : 'Disabled'), "success"), updateMaintenanceUI(_0x63f74a.maintenance), loadActivityTimeline();
                } else showToast("Failed to toggle maintenance state", "error");
            } catch {
                showToast('Request\x20failed', "error");
            }
        });
    } catch {
        showToast("Request failed", 'error');
    }
}

function confirmBotAction(_0x3423ec, _0x523e83, _0x277475 = null) {
    const _0x314171 = a0_0x3d6673;
    currentConfirmAction = _0x277475 || async function() {
        const _0x2405e3 = a0_0x442d;
        try {
            showToast('Executing\x20bot\x20action...', "info");
            const _0x14a60f = {};
            _0x14a60f["Content-Type"] = 'application/json';
            const _0x4cd8d1 = {};
            _0x4cd8d1.action = _0x3423ec;
            const _0x1682e2 = await fetch("/api/developer/bot-controls", {
                'method': 'POST',
                'headers': _0x14a60f,
                'body': JSON.stringify(_0x4cd8d1)
            });
            if (_0x1682e2.ok) {
                const _0x22069e = await _0x1682e2.json();
                showToast(_0x22069e.message || "Operation executed successfully!", "success"), loadMaintenanceStatus(), loadActivityTimeline();
            } else showToast('Action\x20execution\x20failed', "error");
        } catch {
            showToast("Request failed", "error");
        }
    }, document.getElementById("confirmModalMsg").textContent = _0x523e83, document.getElementById('confirmModal').classList["add"]("active");
}
document.getElementById("confirmModalBtn")?.addEventListener("click", () => {
    if (currentConfirmAction) currentConfirmAction();
    closeConfirmModal();
});

function closeConfirmModal() {
    const _0xe0b44f = a0_0x3d6673;
    document.getElementById("confirmModal").classList["remove"]("active"), currentConfirmAction = null;
}
async function saveSettings() {
    const _0x1114c5 = a0_0x3d6673,
        _0x1c1625 = document.getElementById("maintenanceMessageInput"),
        _0x3b86e6 = _0x1c1625 ? _0x1c1625.value['trim']() : '';
    try {
        const _0x584772 = {};
        _0x584772["Content-Type"] = "application/json";
        const _0x55980b = {};
        _0x55980b.maintenanceMessage = _0x3b86e6;
        const _0x3bf926 = await fetch("/api/developer/settings", {
            'method': "POST",
            'headers': _0x584772,
            'body': JSON.stringify(_0x55980b)
        });
        _0x3bf926.ok ? (showToast("Maintenance configurations saved successfully!", "success"), loadMaintenanceStatus(), loadActivityTimeline()) : showToast("Failed to save configurations.", "error");
    } catch (_0x113871) {
        showToast('Request\x20failed', "error");
    }
}

function getTimelineBadgeInfo(_0xaa12aa) {
    const _0x4cd8ff = a0_0x3d6673,
        _0x13eb91 = _0xaa12aa.toLowerCase();
    if (_0x13eb91.includes('granted\x20premium')) {
        const _0x1e54d6 = {};
        return _0x1e54d6.badge = "premium-granted", _0x1e54d6.text = "Premium Granted", _0x1e54d6.icon = "fa-gem", _0x1e54d6.markerColor = "var(--green)", _0x1e54d6;
    }
    if (_0x13eb91.includes('removed\x20premium')) {
        const _0x54180f = {};
        return _0x54180f.badge = 'premium-removed', _0x54180f.text = 'Premium\x20Removed', _0x54180f.icon = 'fa-trash-can', _0x54180f.markerColor = "var(--red)", _0x54180f;
    }
    if (_0x13eb91.includes("broadcast")) {
        const _0x23a34d = {};
        return _0x23a34d.badge = 'broadcast-sent', _0x23a34d.text = "Broadcast Sent", _0x23a34d.icon = "fa-bullhorn", _0x23a34d.markerColor = 'var(--blue)', _0x23a34d;
    }
    if (_0x13eb91.includes("leave guild") || _0x13eb91.includes("left server") || _0x13eb91.includes("forced bot to leave")) {
        const _0xa398aa = {};
        return _0xa398aa.badge = 'server-left', _0xa398aa.text = "Server Left", _0xa398aa.icon = "fa-door-open", _0xa398aa.markerColor = "var(--amber)", _0xa398aa;
    }
    if (_0x13eb91.includes("reloaded bot commands") || _0x13eb91.includes('hot-reloaded\x20bot\x20commands')) {
        const _0x557c5b = {};
        return _0x557c5b.badge = "command-reloaded", _0x557c5b.text = "Command Reloaded", _0x557c5b.icon = "fa-terminal", _0x557c5b.markerColor = "var(--purple)", _0x557c5b;
    }
    if (_0x13eb91.includes('maintenance\x20mode') || _0x13eb91.includes("maintenance state")) {
        const _0x1c8aca = _0x13eb91.includes("enabled") || _0x13eb91.includes("true"),
            _0x104105 = {};
        return _0x104105.badge = "maintenance", _0x104105.text = _0x1c8aca ? "Maintenance Enabled" : "Maintenance Disabled", _0x104105.icon = _0x1c8aca ? 'fa-toggle-on' : 'fa-toggle-off', _0x104105.markerColor = 'var(--red)', _0x104105;
    }
    if (_0x13eb91.includes('developer\x20login')) {
        const _0x19fa2a = {};
        return _0x19fa2a.badge = "dev-login", _0x19fa2a.text = "Dev Login", _0x19fa2a.icon = "fa-right-to-bracket", _0x19fa2a.markerColor = 'var(--cyan)', _0x19fa2a;
    }
    if (_0x13eb91.includes('updated\x20global\x20maintenance\x20message') || _0x13eb91.includes("settings") || _0x13eb91.includes("edited developer note") || _0x13eb91.includes("deleted developer note") || _0x13eb91.includes("created developer note")) {
        const _0x53cc39 = {};
        return _0x53cc39.badge = "config-change", _0x53cc39.text = "Config Change", _0x53cc39.icon = 'fa-sliders', _0x53cc39.markerColor = "var(--text-2)", _0x53cc39;
    }
    const _0x21637a = {};
    return _0x21637a.badge = "default", _0x21637a.text = "Action Logged", _0x21637a.icon = "fa-receipt", _0x21637a.markerColor = "var(--text-3)", _0x21637a;
}
async function loadActivityTimeline() {
    const _0x2a5b56 = a0_0x3d6673;
    try {
        const _0xc8eb1f = await fetch('/api/developer/audit-logs');
        if (!_0xc8eb1f.ok) return;
        const _0xd1dd67 = await _0xc8eb1f.json(),
            _0x1e6b43 = document.getElementById("activityFeedContainer");
        if (!_0x1e6b43) return;
        if (_0xd1dd67.length === 0x0) {
            _0x1e6b43.innerHTML = '\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x22empty-state\x22>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x22empty-state-icon\x22><i\x20class=\x22fa-solid\x20fa-clock-rotate-left\x22></i></div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<h3>No\x20activity\x20logged</h3>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<p>Waiting\x20for\x20developer\x20events...</p>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20';
            return;
        }
        const _0x31b106 = _0xd1dd67.slice(0x0, 0xa);
        _0x1e6b43.innerHTML = _0x31b106.map(_0x51dbe2 => {
            const _0x1572ac = _0x2a5b56,
                _0x17955d = getTimelineBadgeInfo(_0x51dbe2.action),
                _0x1916d2 = {};
            _0x1916d2.hour = "2-digit", _0x1916d2.minute = "2-digit";
            const _0x5f5134 = new Date(_0x51dbe2.createdAt).toLocaleTimeString([], _0x1916d2),
                _0x431053 = {};
            _0x431053.month = "short", _0x431053.day = "numeric";
            const _0x3e4e03 = new Date(_0x51dbe2.createdAt).toLocaleDateString([], _0x431053);
            return '\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x22activity-item\x22>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x22activity-marker\x22\x20style=\x22border-color:\x20' + _0x17955d.markerColor + "; --marker-color-glow: " + _0x17955d.markerColor + '\x22>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<i\x20class=\x22fa-solid\x20' + _0x17955d.icon + '\x22\x20style=\x22color:\x20' + _0x17955d.markerColor + '\x22></i>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x22activity-header\x22>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<span\x20class=\x22activity-username\x22>@' + escapeHtml(_0x51dbe2.username) + "</span>\n                        <span class=\"activity-badge badge-" + _0x17955d.badge + '\x22>' + _0x17955d.text + "</span>\n                    </div>\n                    <div class=\"activity-action\">" + escapeHtml(_0x51dbe2.action) + "</div>\n                    <div class=\"activity-time\">" + _0x3e4e03 + " at " + _0x5f5134 + "</div>\n                </div>\n            ";
        }).join('');
    } catch (_0x5b8265) {
        console.error('Error\x20loading\x20activity\x20feed:', _0x5b8265);
    }
}
async function loadNotesList() {
    const _0x5145a6 = a0_0x3d6673,
        _0x14aaef = document.getElementById("notesGridContainer");
    _0x14aaef && (_0x14aaef.innerHTML = "\n            <div class=\"skeleton-card\"><div class=\"skeleton skeleton-title\"></div><div class=\"skeleton skeleton-text\"></div><div class=\"skeleton skeleton-text\" style=\"width:60%\"></div></div>\n            <div class=\"skeleton-card\"><div class=\"skeleton skeleton-title\"></div><div class=\"skeleton skeleton-text\"></div><div class=\"skeleton skeleton-text\" style=\"width:60%\"></div></div>\n            <div class=\"skeleton-card\"><div class=\"skeleton skeleton-title\"></div><div class=\"skeleton skeleton-text\"></div><div class=\"skeleton skeleton-text\" style=\"width:60%\"></div></div>\n        ");
    try {
        const _0x45975f = await fetch("/api/developer/notes");
        if (!_0x45975f.ok) {
            _0x14aaef.innerHTML = '<div\x20style=\x22text-align:center;\x20padding:24px;\x20color:var(--red);\x22>Failed\x20to\x20load\x20notes.</div>';
            return;
        }
        notesCache = await _0x45975f.json(), populateAuthorFilter(notesCache), renderNotes(notesCache);
    } catch (_0x326113) {
        console.error("Error loading notes:", _0x326113), _0x14aaef && (_0x14aaef.innerHTML = "<div style=\"text-align:center; padding:24px; color:var(--red);\">Failed to load notes.</div>");
    }
}

function populateAuthorFilter(_0x4dba6f) {
    const _0x298e92 = a0_0x3d6673,
        _0x34b979 = document.getElementById('noteAuthorFilter');
    if (!_0x34b979) return;
    const _0x33914f = _0x34b979.value,
        _0x184e29 = new Map();
    _0x4dba6f.forEach(_0xf65698 => {
        const _0x290e7a = _0x298e92;
        _0xf65698.author_id && _0xf65698.author_name && _0x184e29.set(_0xf65698.author_id, _0xf65698.author_name);
    });
    let _0x2cb686 = "<option value=\"\">All Authors</option>";
    _0x184e29.forEach((_0x5d9ba7, _0x1e16fa) => {
        const _0x1b4222 = _0x298e92;
        _0x2cb686 += "<option value=\"" + _0x1e16fa + "\">@" + escapeHtml(_0x5d9ba7) + "</option>";
    }), _0x34b979.innerHTML = _0x2cb686, _0x34b979.value = _0x33914f;
}

function renderNotes(_0xbee743) {
    const _0x333591 = a0_0x3d6673,
        _0x458059 = document.getElementById("notesGridContainer");
    if (!_0x458059) return;
    if (_0xbee743.length === 0x0) {
        _0x458059.innerHTML = '\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x22empty-state\x22\x20style=\x22grid-column:\x201\x20/\x20-1;\x22>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x22empty-state-icon\x22><i\x20class=\x22fa-solid\x20fa-pen-to-square\x22></i></div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<h3>No\x20notes\x20found</h3>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<p>Create\x20a\x20note\x20to\x20start\x20tracking\x20ideas,\x20wiki\x20docs,\x20or\x20bug\x20tickets.</p>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20';
        return;
    }
    _0x458059.innerHTML = _0xbee743.map(_0x3d212b => {
        const _0x567330 = _0x333591,
            _0xfba512 = {};
        _0xfba512.month = "short", _0xfba512.day = "numeric", _0xfba512.year = 'numeric';
        const _0x1ace8f = new Date(_0x3d212b.createdAt).toLocaleDateString([], _0xfba512),
            _0x366333 = {};
        _0x366333.month = "short", _0x366333.day = "numeric", _0x366333.year = 'numeric';
        const _0x37fc3f = new Date(_0x3d212b.updatedAt).toLocaleDateString([], _0x366333),
            _0x10ed83 = _0x3d212b.createdAt !== _0x3d212b.updatedAt;
        return '\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x22note-card\x22>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x22note-header\x22>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x22note-title\x22>' + escapeHtml(_0x3d212b.title) + "</div>\n                    <div class=\"note-actions\">\n                        <button class=\"btn-edit-note\" onclick=\"openEditNoteModal(" + _0x3d212b.id + ")\" title=\"Edit Note\"><i class=\"fa-solid fa-pencil\"></i></button>\n                        <button class=\"btn-delete-note\" onclick=\"confirmDeleteNote(" + _0x3d212b.id + ", '" + escapeHtml(_0x3d212b.title["replace"](/'/g, '\x5c\x27')) + "')\" title=\"Delete Note\"><i class=\"fa-solid fa-trash-can\"></i></button>\n                    </div>\n                </div>\n                <div class=\"note-content\">" + escapeHtml(_0x3d212b.content) + "</div>\n                <div class=\"note-footer\">\n                    <div>\n                        By <span class=\"note-author\">@" + escapeHtml(_0x3d212b.author_name) + '</span>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20' + _0x1ace8f + '\x20' + (_0x10ed83 ? "<span style=\"color:var(--text-3); font-style:italic;\" title=\"Updated at " + _0x37fc3f + "\">• (edited)</span>" : '') + "\n                    </div>\n                </div>\n            </div>\n        ";
    }).join('');
}

function filterNotes() {
    const _0x3a97b7 = a0_0x3d6673,
        _0x6b1280 = document.getElementById("noteSearchInput")?.value.trim().toLowerCase() || '',
        _0x539d05 = document.getElementById("noteAuthorFilter")?.value || '',
        _0x19057c = notesCache.filter(_0x2ac757 => {
            const _0x4d682f = _0x3a97b7,
                _0x347bdc = !_0x6b1280 || _0x2ac757.title['toLowerCase']().includes(_0x6b1280) || _0x2ac757.content["toLowerCase"]().includes(_0x6b1280),
                _0x46c617 = !_0x539d05 || _0x2ac757.author_id === _0x539d05;
            return _0x347bdc && _0x46c617;
        });
    renderNotes(_0x19057c);
}

function openCreateNoteModal() {
    const _0x16e95b = a0_0x3d6673;
    editingNoteId = null, document.getElementById("noteModalTitle").textContent = 'Create\x20Developer\x20Note', document.getElementById("noteTitleInput").value = '', document.getElementById("noteContentInput").value = '', document.getElementById("noteModal").classList['add']("active");
}

function openEditNoteModal(_0xb3790b) {
    const _0x2ea71d = a0_0x3d6673,
        _0x4408bb = notesCache.find(_0x27cbbe => _0x27cbbe.id === _0xb3790b);
    if (!_0x4408bb) return;
    editingNoteId = _0xb3790b, document.getElementById("noteModalTitle").textContent = "Edit Developer Note", document.getElementById("noteTitleInput").value = _0x4408bb.title, document.getElementById("noteContentInput").value = _0x4408bb.content, document.getElementById("noteModal").classList["add"]('active');
}

function closeNoteModal() {
    const _0x5125c0 = a0_0x3d6673;
    document.getElementById("noteModal").classList['remove']("active"), editingNoteId = null;
}
async function saveNote() {
    const _0x3e6e79 = a0_0x3d6673,
        _0x1ef87f = document.getElementById("noteTitleInput").value["trim"](),
        _0x415dc3 = document.getElementById("noteContentInput").value['trim']();
    if (!_0x1ef87f || !_0x415dc3) return showToast("Title and content are required", "warning");
    try {
        let _0x1bea42;
        if (editingNoteId) {
            const _0x190187 = {};
            _0x190187["Content-Type"] = "application/json";
            const _0x572c67 = {};
            _0x572c67.title = _0x1ef87f, _0x572c67.content = _0x415dc3, _0x1bea42 = await fetch("/api/developer/notes/" + editingNoteId, {
                'method': "PUT",
                'headers': _0x190187,
                'body': JSON.stringify(_0x572c67)
            });
        } else {
            const _0x3d486d = {};
            _0x3d486d["Content-Type"] = "application/json";
            const _0x14919f = {};
            _0x14919f.title = _0x1ef87f, _0x14919f.content = _0x415dc3, _0x1bea42 = await fetch("/api/developer/notes", {
                'method': 'POST',
                'headers': _0x3d486d,
                'body': JSON.stringify(_0x14919f)
            });
        }
        if (_0x1bea42.ok) showToast(editingNoteId ? 'Note\x20updated\x20successfully!' : 'Note\x20created\x20successfully!', "success"), closeNoteModal(), loadNotesList(), loadActivityTimeline();
        else {
            const _0x511488 = await _0x1bea42.json();
            showToast(_0x511488.error || "Failed to save note.", "error");
        }
    } catch (_0x1f3b0c) {
        showToast('Request\x20failed', "error");
    }
}

function confirmDeleteNote(_0x2e9cae, _0x4b7fc1) {
    const _0x5ec0e3 = a0_0x3d6673;
    confirmBotAction("delete-note", "Are you sure you want to delete the developer note \"" + _0x4b7fc1 + "\"? This action cannot be undone.", async () => {
        const _0x2d124f = _0x5ec0e3;
        try {
            const _0xee2fb9 = {};
            _0xee2fb9.method = 'DELETE';
            const _0xd67bd4 = await fetch('/api/developer/notes/' + _0x2e9cae, _0xee2fb9);
            _0xd67bd4.ok ? (showToast('Note\x20deleted\x20successfully', "success"), loadNotesList(), loadActivityTimeline()) : showToast("Failed to delete note", "error");
        } catch (_0x576d39) {
            showToast("Request failed", "error");
        }
    });
}

function showToast(_0x41d04a, _0x538c4b = "success") {
    const _0x5a39f9 = a0_0x3d6673,
        _0x3e00cb = document.getElementById("toastContainer");
    if (!_0x3e00cb) return;
    const _0x5ba348 = document.createElement("div");
    _0x5ba348.className = "toast " + _0x538c4b;
    let _0x47a648 = '<i\x20class=\x22fa-solid\x20fa-circle-info\x22></i>';
    if (_0x538c4b === "success") _0x47a648 = "<i class=\"fa-solid fa-circle-check\"></i>";
    else {
        if (_0x538c4b === "error") _0x47a648 = "<i class=\"fa-solid fa-circle-xmark\"></i>";
        else {
            if (_0x538c4b === "warning") _0x47a648 = "<i class=\"fa-solid fa-triangle-exclamation\"></i>";
        }
    }
    _0x5ba348.innerHTML = _0x47a648 + " <span>" + _0x41d04a + "</span>", _0x3e00cb.appendChild(_0x5ba348), setTimeout(() => {
        const _0x27cb6a = _0x5a39f9;
        _0x5ba348.style["animation"] = "fadeOut 0.3s ease forwards", setTimeout(() => _0x5ba348.remove(), 0x12c);
    }, 0xfa0);
}

function escapeHtml(_0x231d21) {
    const _0x61ec4 = a0_0x3d6673;
    if (!_0x231d21) return '';
    return String(_0x231d21).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, '&gt;').replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

// Add custom event listeners mapping static HTML elements to actions in developer.js
document.addEventListener('DOMContentLoaded', () => {
    // 1. Sidebar tab switching
    document.querySelectorAll('.sidebar-item').forEach(item => {
        const tab = item.getAttribute('data-tab');
        if (tab) {
            item.addEventListener('click', () => {
                if (window.switchTab) window.switchTab(tab);
            });
        }
    });

    // 2. Buttons click mapping
    const clickBindings = {
        'btn-lookup-user': 'lookupUser',
        'btn-grant-premium': 'grantPremium',
        'btn-send-broadcast': 'sendBroadcast',
        'btn-clear-errors': 'clearErrorLogs',
        'btn-toggle-maintenance': 'toggleMaintenance',
        'btn-save-settings': 'saveSettings',
        'btn-create-note': 'openCreateNoteModal',
        'btn-close-confirm': 'closeConfirmModal',
        'btn-close-note': 'closeNoteModal',
        'btn-save-note': 'saveNote'
    };

    Object.entries(clickBindings).forEach(([id, funcName]) => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('click', (e) => {
                if (window[funcName]) window[funcName](e);
            });
        }
    });

    // 3. confirmBotAction button class mapping
    document.querySelectorAll('.btn-bot-action').forEach(btn => {
        btn.addEventListener('click', () => {
            const action = btn.getAttribute('data-bot-action');
            const prompt = btn.getAttribute('data-bot-prompt');
            if (window.confirmBotAction && action && prompt) {
                window.confirmBotAction(action, prompt);
            }
        });
    });

    // 4. Input and change bindings
    const serverSearch = document.getElementById('serverSearch');
    if (serverSearch) {
        serverSearch.addEventListener('keyup', debounce(() => {
            if (window.loadServersList) window.loadServersList();
        }, 300));
    }

    const noteSearchInput = document.getElementById('noteSearchInput');
    if (noteSearchInput) {
        noteSearchInput.addEventListener('keyup', debounce(() => {
            if (window.filterNotes) window.filterNotes();
        }, 300));
    }

    const noteAuthorFilter = document.getElementById('noteAuthorFilter');
    if (noteAuthorFilter) {
        noteAuthorFilter.addEventListener('change', () => {
            if (window.filterNotes) window.filterNotes();
        });
    }
});