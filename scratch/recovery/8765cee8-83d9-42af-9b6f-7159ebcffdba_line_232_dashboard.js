Created At: 2026-06-16T16:19:00Z
Completed At: 2026-06-16T16:19:00Z
File Path: `file:///home/ubuntu/zero-lab-bots/vivy/server/public/dashboard.js`
Total Lines: 750
Total Bytes: 32119
Showing lines 151 to 300
The following code has been modified to include a line number before every line, in the format: <line_number>: <original_line>. Please note that any changes targeting the original code should remove the line number, colon, and leading space.
151:     const roleIds = [
152:         'shopItemRole',
153:         'warnFirst', 'warnSecond', 'warnLast',
154:         'warnWarnerRole','muteMuteRole','jailJailedRole','jailJailerRole',
155:         'verVerificatorRole','verUnverifiedRole','verVerifiedRole','verVerifiedFemaleRole',
156:         'applyStaffRole','applyRoleStaff','applyRoleDesigner','applyRoleEvent','applyRolePartnership',
157:         'autoroleRoles','guildOwnerRoles','roomStaffRole','roomManagerRole'
158:     ];
159:     roleIds.forEach(id => {
160:         const el = document.getElementById(id);
161:         if (!el) return;
162:         if (el.multiple) {
163:             el.innerHTML = '';
164:         } else {
165:             el.innerHTML = '<option value="">Select a role…</option>';
166:         }
167:         allRoles.forEach(r => { el.innerHTML += `<option value="${r.id}">@${r.name}</option>`; });
168:     });
169: 
170:     // Multi-select whitelists for anti-link
171:     const wlChan = document.getElementById('antilinkWlChannels');
172:     if (wlChan) { wlChan.innerHTML = ''; textChans.forEach(ch => { wlChan.innerHTML += `<option value="${ch.id}">#${ch.name}</option>`; }); }
173:     const wlRole = document.getElementById('antilinkWlRoles');
174:     if (wlRole) { wlRole.innerHTML = ''; allRoles.forEach(r => { wlRole.innerHTML += `<option value="${r.id}">@${r.name}</option>`; }); }
175: }
176: 
177: /* ---------- Load all new bot modules ---------- */
178: function loadAllModules(configs) {
179:     if (!configs) return;
180:     if (configs.warn)          loadWarnTab(configs.warn);
181:  
<truncated 4069 bytes>
hookEnabled', c.is_enabled || false);
259:     setVal('antiwebhookLogChannel', c.log_channel_id || '');
260: }
261: function loadRoomsTab(c) {
262:     setVal('roomJoinChannel', c.join_channel || '');
263:     setVal('roomCategory', c.room_category || '');
264:     setVal('roomLogChannel', c.log_channel || '');
265:     let staffRole = '';
266:     try {
267:         const parsed = JSON.parse(c.staff_role || '[]');
268:         staffRole = Array.isArray(parsed) ? parsed[0] : parsed;
269:     } catch {
270:         staffRole = c.staff_role || '';
271:     }
272:     setVal('roomStaffRole', staffRole);
273:     setVal('roomManagerRole', c.manager_role || '');
274: }
275: function loadLogsTab(c) {
276:     let channels = {};
277:     try {
278:         channels = typeof c.channels === 'string' ? JSON.parse(c.channels) : (c.channels || {});
279:     } catch {}
280:     const keys = [
281:         'welcome', 'leave', 'nickname', 'role-given', 'role-remove',
282:         'role-update', 'ban', 'messages', 'voice-join', 'channels'
283:     ];
284:     keys.forEach(key => {
285:         setVal(`logChan_${key}`, channels[key] || '');
286:     });
287: }
288: 
289: /* ---------- Save functions for new modules ---------- */
290: async function saveWarn() {
291:     const ok = await saveModuleConfig('warn', {
292:         warn_first:   document.getElementById('warnFirst')?.value       || null,
293:         warn_second:  document.getElementById('warnSecond')?.value      || null,
294:         warn_last:    document.getElementById('warnLast')?.value        || null,
295:         warner_role:  document.getElementById('warnWarnerRole')?.value  || null,
296:         warning_logs: document.getElementById('warnLogsChannel')?.value || null,
297:     });
298:     if (ok) showToast('Warn system saved!', 'success');
299: }
300: async function saveJail() {
The above content does NOT show the entire file contents. If you need to view any lines of the file which were not shown to complete your task, call this tool again to view those lines.
