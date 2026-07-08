Created At: 2026-06-16T23:20:36Z
Completed At: 2026-06-16T23:20:36Z
File Path: `file:///home/ubuntu/zero-lab-bots/vivy/server/public/dashboard.js`
Total Lines: 1024
Total Bytes: 41778
Showing lines 1 to 110
The following code has been modified to include a line number before every line, in the format: <line_number>: <original_line>. Please note that any changes targeting the original code should remove the line number, colon, and leading space.
1: /* ============================================================
2:    Vivy Dashboard – Client Script
3:    ============================================================ */
4: 
5: let activeGuildId = new URLSearchParams(window.location.search).get('guild');
6: let guildChannels = [];
7: let guildRoles = [];
8: let economyShopItems = [];
9: 
10: /* ---------- Toast ---------- */
11: function showToast(message, type = 'info') {
12:     const icons = {
13:         success: 'fa-circle-check',
14:         error:   'fa-circle-xmark',
15:         warning: 'fa-triangle-exclamation',
16:         info:    'fa-circle-info'
17:     };
18:     const wrap = document.getElementById('toastWrap');
19:     if (!wrap) return;
20:     const t = document.createElement('div');
21:     t.className = `toast ${type}`;
22:     t.innerHTML = `<i class="fa-solid ${icons[type] || icons.info}"></i> ${message}`;
23:     wrap.appendChild(t);
24:     setTimeout(() => {
25:         t.style.opacity = '0';
26:         t.style.transform = 'translateX(20px)';
27:         setTimeout(() => t.remove(), 400);
28:     }, 3800);
29: }
30: 
31: /* ---------- Tab Switcher ---------- */
32: function switchTab(tabId) {
33:     // Deactivate all
34:     document.querySelectorAll('.dash-tab').forEach(t => t.classList.remove('active'));
35:     document.querySelectorAll('.sidebar-item').forEach(i => i.classList.remove('active'));
36: 
37:     // Activate target tab
38:     const tab = document.getElementById(`tab-${tabId}`);
39:     if (tab) tab.classList.add('active');
40: 
41:     const navEl = document.getElementById
<truncated 716 bytes>
}.png`
64:             : `https://cdn.discordapp.com/embed/avatars/0.png`;
65: 
66:         const avatarEl = document.getElementById('userAvatar');
67:         const usernameEl = document.getElementById('username');
68:         if (avatarEl) avatarEl.src = avatarUrl;
69:         if (usernameEl) usernameEl.textContent = userData.user.global_name || userData.user.username;
70: 
71:         // Show premium chip if applicable
72:         if (userData.premium) {
73:             const chip = document.getElementById('premiumChip');
74:             if (chip) chip.style.display = 'inline-flex';
75:         }
76: 
77:         // Load guild info
78:         const guildRes = await fetch(`/api/guilds/${activeGuildId}`);
79:         if (!guildRes.ok) {
80:             showToast('Failed to load server details.', 'error');
81:             setTimeout(() => window.location.href = '/selector.html', 2000);
82:             return;
83:         }
84: 
85:         const data = await guildRes.json();
86: 
87:         const guildNameEl = document.getElementById('guildName');
88:         if (guildNameEl) guildNameEl.textContent = data.guildName || 'Server Dashboard';
89: 
90:         guildChannels = data.channels || [];
91:         guildRoles    = data.roles    || [];
92: 
93:         populateSelectors();
94:         loadWelcomeTab(data.configs?.welcome);
95:         loadAutoModTab(data.configs?.automod);
96:         loadEconomyTab(data.configs?.economy);
97:         loadAllModules(data.configs);
98: 
99:         fetchAnalytics();
100:         fetchApiKeys();
101:         fetchAuditLogs();
102: 
103:     } catch (e) {
104:         console.error('Dashboard Init Error:', e);
105:         showToast('Error loading dashboard configuration.', 'error');
106:     }
107: }
108: 
109: /* ---------- Populate Dropdowns ---------- */
110: function populateSelectors() {
The above content does NOT show the entire file contents. If you need to view any lines of the file which were not shown to complete your task, call this tool again to view those lines.
