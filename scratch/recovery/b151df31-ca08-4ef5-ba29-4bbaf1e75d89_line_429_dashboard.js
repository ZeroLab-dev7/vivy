Created At: 2026-06-16T15:17:48Z
Completed At: 2026-06-16T15:17:48Z
File Path: `file:///home/ubuntu/zero-lab-bots/vivy/server/public/dashboard.js`
Total Lines: 634
Total Bytes: 27513
Showing lines 220 to 260
The following code has been modified to include a line number before every line, in the format: <line_number>: <original_line>. Please note that any changes targeting the original code should remove the line number, colon, and leading space.
220:     setMulti('antilinkWlChannels', c.whitelist_channels);
221:     setMulti('antilinkWlRoles',    c.whitelist_roles);
222: }
223: function loadApplyTab(c) {
224:     setVal('applyChannel',         c.apply_channel_id    || '');
225:     setVal('applyStaffChannel',    c.staff_channel_id    || '');
226:     setVal('applyLogChannel',      c.log_channel_id      || '');
227:     setVal('applyStaffRole',       c.staff_role_id       || '');
228:     setVal('applyRoleStaff',       c.role_staff_id       || '');
229:     setVal('applyRoleDesigner',    c.role_designer_id    || '');
230:     setVal('applyRoleEvent',       c.role_event_id       || '');
231:     setVal('applyRolePartnership', c.role_partnership_id || '');
232:     setVal('applyBanner',          c.banner_url          || '');
233: }
234: 
235: /* ---------- Save functions for new modules ---------- */
236: async function saveWarn() {
237:     const ok = await saveModuleConfig('warn', {
238:         warn_first:   document.getElementById('warnFirst')?.value       || null,
239:         warn_second:  document.getElementById('warnSecond')?.value      || null,
240:         warn_last:    document.getElementById('warnLast')?.value        || null,
241:         warner_role:  document.getElementById('warnWarnerRole')?.value  || null,
242:         warning_logs: document.getElementById('warnLogsChannel')?.value || null,
243:     });
244:     if (ok) showToast('Warn system saved!', 'success');
245: }
246: async function saveJail() {
247:     const ok = await saveModuleConfig('jail', {
248:         jailed_role_id:  document.getElementById('jailJailedRole')?.value  || null,
249:         jailer_role_id:  document.getElementById('jailJailerRole')?.value  || null,
250:         logs_channel_id: document.getElementById('jailLogsChannel')?.value || null,
251:     });
252:     if (ok) showToast('Jail system saved!', 'success');
253: }
254: async function saveMute() {
255:     const ok = await saveModuleConfig('mute', {
256:         mute_role_id:      document.getElementById('muteMuteRole')?.value        || null,
257:         mute_logs_channel: document.getElementById('muteMuteLogsChannel')?.value || null,
258:     });
259:     if (ok) showToast('Mute system saved!', 'success');
260: }
The above content does NOT show the entire file contents. If you need to view any lines of the file which were not shown to complete your task, call this tool again to view those lines.
