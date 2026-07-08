Created At: 2026-06-17T00:01:27Z
Completed At: 2026-06-17T00:01:28Z
File Path: `file:///home/ubuntu/zero-lab-bots/vivy/server/public/dashboard.js`
Total Lines: 1074
Total Bytes: 43818
Showing lines 1 to 80
The following code has been modified to include a line number before every line, in the format: <line_number>: <original_line>. Please note that any changes targeting the original code should remove the line number, colon, and leading space.
1: /* ============================================================
2:    Vivy Dashboard – Client Script
3:    ============================================================ */
4: 
5: /* ---------- Security: HTML Escaping ---------- */
6: function escapeHtml(str) {
7:     if (str === null || str === undefined) return '';
8:     return String(str)
9:         .replace(/&/g,  '&amp;')
10:         .replace(/</g,  '&lt;')
11:         .replace(/>/g,  '&gt;')
12:         .replace(/"/g,  '&quot;')
13:         .replace(/'/g,  '&#x27;');
14: }
15: 
16: const pathParts = window.location.pathname.split('/').filter(Boolean);
17: let activeGuildId = null;
18: let initialTab = 'overview';
19: 
20: if (pathParts[0] === 'servers' && pathParts[1]) {
21:     activeGuildId = pathParts[1];
22:     if (pathParts[2]) {
23:         initialTab = pathParts[2];
24:     }
25: } else {
26:     // Fallback to legacy query parameters
27:     activeGuildId = new URLSearchParams(window.location.search).get('guild');
28:     const legacyTab = new URLSearchParams(window.location.search).get('tab');
29:     if (legacyTab) initialTab = legacyTab;
30: }
31: 
32: let guildChannels = [];
33: let guildRoles = [];
34: let economyShopItems = [];
35: 
36: /* ---------- Toast ---------- */
37: function showToast(message, type = 'info') {
38:     const icons = {
39:         success: 'fa-circle-check',
40:         error:   'fa-circle-xmark',
41:         warning: 'fa-triangle-exclamation',
42:         info:    'fa-circle-info'
43:     };
44:     const wrap = document.getElementById('toastWrap');
45:     if (!wrap) return;
46:     const t = document.createElement('div');
47:     t.className = `toast ${type}`;
48:     // Use textContent for the message portion to avoid XSS
49:     const icon = document.createElement('i');
50:     icon.className = `fa-solid ${icons[type] || icons.info}`;
51:     t.appendChild(icon);
52:     t.appendChild(document.createTextNode(' ' + String(message)));
53:     wrap.appendChild(t);
54:     setTimeout(() => {
55:         t.style.opacity = '0';
56:         t.style.transform = 'translateX(20px)';
57:         setTimeout(() => t.remove(), 400);
58:     }, 3800);
59: }
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
The above content does NOT show the entire file contents. If you need to view any lines of the file which were not shown to complete your task, call this tool again to view those lines.
