Created At: 2026-06-17T22:54:17Z
Completed At: 2026-06-17T22:54:18Z
File Path: `file:///home/ubuntu/zero-lab-bots/vivy/server/public/developer.js`
Total Lines: 842
Total Bytes: 34960
Showing lines 1 to 110
The following code has been modified to include a line number before every line, in the format: <line_number>: <original_line>. Please note that any changes targeting the original code should remove the line number, colon, and leading space.
1: /* ============================================================
2:    Vivy Developer Portal — Interactivity & Canvas Charting
3:    ============================================================ */
4: 
5: let activeTab = 'dashboard';
6: let statsInterval = null;
7: let currentConfirmAction = null;
8: 
9: // On startup
10: document.addEventListener('DOMContentLoaded', () => {
11:     checkDevAuth();
12:     switchTab('dashboard');
13:     startRealtimeStats();
14: });
15: 
16: // Verify authentication and load safe user metadata
17: async function checkDevAuth() {
18:     try {
19:         const res = await fetch('/auth/discord/user');
20:         if (!res.ok) window.location.href = '/auth/discord/login?returnTo=/developer';
21:         const data = await res.json();
22:         if (!data.authenticated) {
23:             window.location.href = '/auth/discord/login?returnTo=/developer';
24:         }
25:         
26:         // Populate profile chip
27:         const avatarEl = document.getElementById('userAvatar');
28:         const nameEl = document.getElementById('username');
29:         if (avatarEl && data.user.avatar) {
30:             avatarEl.src = `https://cdn.discordapp.com/avatars/${data.user.id}/${data.user.avatar}.png`;
31:         }
32:         if (nameEl) nameEl.textContent = data.user.username;
33:     } catch (err) {
34:         console.error('Auth verification error:', err);
35:     }
36: }
37: 
38: // Switching panel sections
39: function switchTab(tabId) {
40:     activeTab = tabId;
41:     
42:     // Reset active classes in sidebar
43:     document.qu
<truncated 842 bytes>
TabData(tabId);
64: }
65: 
66: // Load appropriate data based on tab selection
67: function loadTabData(tabId) {
68:     if (tabId === 'dashboard') {
69:         loadDashboardStats();
70:     } else if (tabId === 'analytics') {
71:         loadAnalytics();
72:     } else if (tabId === 'status') {
73:         loadSystemStatus();
74:     } else if (tabId === 'servers') {
75:         loadServersList();
76:     } else if (tabId === 'premium') {
77:         loadPremiumList();
78:     } else if (tabId === 'commands') {
79:         loadCommandsList();
80:     } else if (tabId === 'broadcasts') {
81:         loadBroadcastHistory();
82:     } else if (tabId === 'audit') {
83:         loadAuditLogs();
84:     } else if (tabId === 'errors') {
85:         loadErrorLogs();
86:     } else if (tabId === 'controls' || tabId === 'settings') {
87:         loadMaintenanceStatus();
88:     }
89: }
90: 
91: // Periodically updates system status & dashboard if active
92: function startRealtimeStats() {
93:     statsInterval = setInterval(() => {
94:         if (activeTab === 'dashboard') {
95:             loadDashboardStats();
96:         } else if (activeTab === 'status') {
97:             loadSystemStatus();
98:         }
99:     }, 5000);
100: }
101: 
102: // ── Dashboard Metrics ──────────────────────────────────────────────────────────
103: async function loadDashboardStats() {
104:     try {
105:         const res = await fetch('/api/developer/dashboard-stats');
106:         if (!res.ok) return;
107:         const data = await res.json();
108: 
109:         document.getElementById('statServers').textContent = data.totalServers;
110:         document.getElementById('statMembers').textContent = data.totalMembers.toLocaleString();
The above content does NOT show the entire file contents. If you need to view any lines of the file which were not shown to complete your task, call this tool again to view those lines.
