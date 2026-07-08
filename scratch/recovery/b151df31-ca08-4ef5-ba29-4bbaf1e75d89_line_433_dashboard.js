Created At: 2026-06-16T15:17:57Z
Completed At: 2026-06-16T15:17:57Z
File Path: `file:///home/ubuntu/zero-lab-bots/vivy/server/public/dashboard.js`
Total Lines: 687
Total Bytes: 29590
Showing lines 270 to 305
The following code has been modified to include a line number before every line, in the format: <line_number>: <original_line>. Please note that any changes targeting the original code should remove the line number, colon, and leading space.
270:     }
271:     setVal('roomStaffRole', staffRole);
272:     setVal('roomManagerRole', c.manager_role || '');
273: }
274: function loadLogsTab(c) {
275:     let channels = {};
276:     try {
277:         channels = typeof c.channels === 'string' ? JSON.parse(c.channels) : (c.channels || {});
278:     } catch {}
279:     const keys = [
280:         'welcome', 'leave', 'nickname', 'role-given', 'role-remove',
281:         'role-update', 'ban', 'messages', 'voice-join', 'channels'
282:     ];
283:     keys.forEach(key => {
284:         setVal(`logChan_${key}`, channels[key] || '');
285:     });
286: }
287: 
288: /* ---------- Save functions for new modules ---------- */
289: async function saveWarn() {
290:     const ok = await saveModuleConfig('warn', {
291:         warn_first:   document.getElementById('warnFirst')?.value       || null,
292:         warn_second:  document.getElementById('warnSecond')?.value      || null,
293:         warn_last:    document.getElementById('warnLast')?.value        || null,
294:         warner_role:  document.getElementById('warnWarnerRole')?.value  || null,
295:         warning_logs: document.getElementById('warnLogsChannel')?.value || null,
296:     });
297:     if (ok) showToast('Warn system saved!', 'success');
298: }
299: async function saveJail() {
300:     const ok = await saveModuleConfig('jail', {
301:         jailed_role_id:  document.getElementById('jailJailedRole')?.value  || null,
302:         jailer_role_id:  document.getElementById('jailJailerRole')?.value  || null,
303:         logs_channel_id: document.getElementById('jailLogsChannel')?.value || null,
304:     });
305:     if (ok) showToast('Jail system saved!', 'success');
The above content does NOT show the entire file contents. If you need to view any lines of the file which were not shown to complete your task, call this tool again to view those lines.
