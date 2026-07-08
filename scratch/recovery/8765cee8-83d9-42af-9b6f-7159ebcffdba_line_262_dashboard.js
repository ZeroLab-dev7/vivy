Created At: 2026-06-16T16:18:59Z
Completed At: 2026-06-16T16:18:59Z
File Path: `file:///home/ubuntu/zero-lab-bots/vivy/server/public/dashboard.js`
Total Lines: 750
Total Bytes: 32119
Showing lines 1 to 150
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
41:     const navEl = document.getElementById(
<truncated 2674 bytes>
ceChans = guildChannels.filter(c => c.type === 2);
113:     const catChans = guildChannels.filter(c => c.type === 4);
114:     const allRoles  = guildRoles;
115: 
116:     const chanIds = [
117:         'welcomeChannel','leaveChannel','giveawayChannel','amLogChannel',
118:         'warnLogsChannel','muteMuteLogsChannel','jailLogsChannel','verLogsChannel',
119:         'applyChannel','applyStaffChannel','applyLogChannel',
120:         'antibotLogChannel','antiwebhookLogChannel','roomLogChannel',
121:         'logChan_welcome', 'logChan_leave', 'logChan_nickname', 'logChan_role-given',
122:         'logChan_role-remove', 'logChan_role-update', 'logChan_ban', 'logChan_messages', 'logChan_channels'
123:     ];
124:     chanIds.forEach(id => {
125:         const el = document.getElementById(id);
126:         if (!el) return;
127:         el.innerHTML = '<option value="">Select a channel…</option>';
128:         textChans.forEach(ch => { el.innerHTML += `<option value="${ch.id}">#${ch.name}</option>`; });
129:     });
130: 
131:     const voiceChanIds = [
132:         'roomJoinChannel', 'logChan_voice-join'
133:     ];
134:     voiceChanIds.forEach(id => {
135:         const el = document.getElementById(id);
136:         if (!el) return;
137:         el.innerHTML = '<option value="">Select voice channel…</option>';
138:         voiceChans.forEach(ch => { el.innerHTML += `<option value="${ch.id}">🔊 ${ch.name}</option>`; });
139:     });
140: 
141:     const catChanIds = [
142:         'roomCategory'
143:     ];
144:     catChanIds.forEach(id => {
145:         const el = document.getElementById(id);
146:         if (!el) return;
147:         el.innerHTML = '<option value="">Select category…</option>';
148:         catChans.forEach(ch => { el.innerHTML += `<option value="${ch.id}">📁 ${ch.name}</option>`; });
149:     });
150: 
The above content does NOT show the entire file contents. If you need to view any lines of the file which were not shown to complete your task, call this tool again to view those lines.
