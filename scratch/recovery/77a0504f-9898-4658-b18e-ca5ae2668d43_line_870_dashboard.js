Created At: 2026-06-17T22:01:27Z
Completed At: 2026-06-17T22:01:27Z
File Path: `file:///home/ubuntu/zero-lab-bots/vivy/server/public/dashboard.js`
Total Lines: 1541
Total Bytes: 63847
Showing lines 60 to 115
The following code has been modified to include a line number before every line, in the format: <line_number>: <original_line>. Please note that any changes targeting the original code should remove the line number, colon, and leading space.
60: 
61: /* ---------- Tab Switcher ---------- */
62: function switchTab(tabId, pushHistory = true) {
63:     // Deactivate all
64:     document.querySelectorAll('.dash-tab').forEach(t => t.classList.remove('active'));
65:     document.querySelectorAll('.sidebar-item').forEach(i => i.classList.remove('active'));
66: 
67:     // Activate target tab
68:     const tab = document.getElementById(`tab-${tabId}`);
69:     if (tab) tab.classList.add('active');
70: 
71:     const navEl = document.getElementById(`nav-${tabId}`);
72:     if (navEl) navEl.classList.add('active');
73: 
74:     // Update history URL if pushHistory is true
75:     if (pushHistory && activeGuildId) {
76:         history.pushState(null, '', `/servers/${activeGuildId}/${tabId}`);
77:     }
78: }
79: 
80: // Listen for browser navigation (Back/Forward buttons)
81: window.addEventListener('popstate', () => {
82:     const parts = window.location.pathname.split('/').filter(Boolean);
83:     if (parts[0] === 'servers' && parts[1]) {
84:         activeGuildId = parts[1];
85:         const tab = parts[2] || 'overview';
86:         switchTab(tab, false);
87:     }
88: });
89: 
90: /* ---------- Init ---------- */
91: async function initDashboard() {
92:     if (!activeGuildId) {
93:         window.location.href = '/servers';
94:         return;
95:     }
96: 
97:     try {
98:         // Load user
99:         const userRes = await fetch('/auth/discord/user');
100:         const userData = await userRes.json();
101:         if (!userData.authenticated) {
102:             window.location.href = '/';
103:             return;
104:         }
105: 
106:         const hash = userData.user.avatar;
107:         const avatarUrl = hash
108:             ? `https://cdn.discordapp.com/avatars/${userData.user.id}/${hash}.png`
109:             : `https://cdn.discordapp.com/embed/avatars/0.png`;
110: 
111:         const avatarEl = document.getElementById('userAvatar');
112:         const usernameEl = document.getElementById('username');
113:         if (avatarEl) avatarEl.src = avatarUrl;
114:         if (usernameEl) usernameEl.textContent = userData.user.global_name || userData.user.username;
115: 
The above content does NOT show the entire file contents. If you need to view any lines of the file which were not shown to complete your task, call this tool again to view those lines.
