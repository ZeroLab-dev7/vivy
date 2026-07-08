Created At: 2026-06-17T22:01:30Z
Completed At: 2026-06-17T22:01:30Z
File Path: `file:///home/ubuntu/zero-lab-bots/vivy/server/public/dashboard.js`
Total Lines: 1541
Total Bytes: 63847
Showing lines 116 to 200
The following code has been modified to include a line number before every line, in the format: <line_number>: <original_line>. Please note that any changes targeting the original code should remove the line number, colon, and leading space.
116:         // Show premium chip if applicable
117:         if (userData.premium) {
118:             const chip = document.getElementById('premiumChip');
119:             if (chip) chip.style.display = 'inline-flex';
120:         }
121: 
122:         // Load guild info
123:         const guildRes = await fetch(`/api/guilds/${activeGuildId}`);
124:         if (!guildRes.ok) {
125:             showToast('Failed to load server details.', 'error');
126:             setTimeout(() => window.location.href = '/servers', 2000);
127:             return;
128:         }
129: 
130:         const data = await guildRes.json();
131: 
132:         const guildNameEl = document.getElementById('guildName');
133:         if (guildNameEl) guildNameEl.textContent = data.guildName || 'Server Dashboard';
134: 
135:         guildChannels = data.channels || [];
136:         guildRoles    = data.roles    || [];
137: 
138:         populateSelectors();
139:         loadWelcomeTab(data.configs?.welcome);
140:         loadAutoModTab(data.configs?.automod, data.configs?.antilink, data.configs?.guildSettings);
141:         loadEconomyTab(data.configs?.economy);
142:         loadAllModules(data.configs);
143: 
144:         // Switch to initial tab
145:         switchTab(initialTab, false);
146: 
147:         fetchAnalytics();
148:         fetchApiKeys();
149:         fetchAuditLogs();
150: 
151:     } catch (e) {
152:         console.error('Dashboard Init Error:', e);
153:         showToast('Error loading dashboard configuration.', 'error');
154:     }
155: }
156: 
157: /* ---------- Populate Dropdowns -
<truncated 507 bytes>
:         'applyChannel','applyStaffChannel','applyLogChannel',
168:         'antibotLogChannel','antiwebhookLogChannel','roomLogChannel',
169:         'logChan_welcome', 'logChan_leave', 'logChan_nickname', 'logChan_role-given',
170:         'logChan_role-remove', 'logChan_role-update', 'logChan_ban', 'logChan_messages', 
171:         'logChan_channels', 'logChan_unban', 'logChan_kick', 'logChan_timeout', 
172:         'logChan_role-create', 'logChan_role-delete', 'logChan_emojis', 'logChan_invites',
173:         'logChan_voice-join', 'logChan_voice-leave', 'logChan_voice-move', 'logChan_voice-mute',
174:         'logChan_voice-deafen', 'logChan_voice-disconnect'
175:     ];
176:     chanIds.forEach(id => {
177:         const el = document.getElementById(id);
178:         if (!el) return;
179:         el.innerHTML = '<option value="">Select a channel…</option>';
180:         textChans.forEach(ch => { el.innerHTML += `<option value="${escapeHtml(ch.id)}">#${escapeHtml(ch.name)}</option>`; });
181:     });
182: 
183:     const voiceChanIds = [
184:         'roomJoinChannel'
185:     ];
186:     voiceChanIds.forEach(id => {
187:         const el = document.getElementById(id);
188:         if (!el) return;
189:         el.innerHTML = '<option value="">Select voice channel…</option>';
190:         voiceChans.forEach(ch => { el.innerHTML += `<option value="${escapeHtml(ch.id)}">🔊 ${escapeHtml(ch.name)}</option>`; });
191:     });
192: 
193:     const catChanIds = [
194:         'roomCategory'
195:     ];
196:     catChanIds.forEach(id => {
197:         const el = document.getElementById(id);
198:         if (!el) return;
199:         el.innerHTML = '<option value="">Select category…</option>';
200:         catChans.forEach(ch => { el.innerHTML += `<option value="${escapeHtml(ch.id)}">📁 ${escapeHtml(ch.name)}</option>`; });
The above content does NOT show the entire file contents. If you need to view any lines of the file which were not shown to complete your task, call this tool again to view those lines.
