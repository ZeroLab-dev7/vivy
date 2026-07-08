Created At: 2026-06-17T00:22:45Z
Completed At: 2026-06-17T00:22:45Z
File Path: `file:///home/ubuntu/zero-lab-bots/vivy/server/public/dashboard.js`
Total Lines: 1074
Total Bytes: 43818
Showing lines 310 to 435
The following code has been modified to include a line number before every line, in the format: <line_number>: <original_line>. Please note that any changes targeting the original code should remove the line number, colon, and leading space.
310:     setVal('applyRoleEvent',       c.role_event_id       || '');
311:     setVal('applyRolePartnership', c.role_partnership_id || '');
312:     setVal('applyBanner',          c.banner_url          || '');
313: }
314: function loadAutoRoleTab(c) {
315:     setMultiComma('autoroleRoles', c.auto_role_id);
316: }
317: function loadGuildSettingsTab(c) {
318:     setVal('guildPrefix', c.prefix || '&');
319:     setMultiComma('guildOwnerRoles', c.owner_role_id);
320: }
321: function loadAntiBotTab(c) {
322:     setVal('antibotEnabled', c.is_enabled || false);
323:     setVal('antibotLogChannel', c.log_channel_id || '');
324: }
325: function loadAntiWebhookTab(c) {
326:     setVal('antiwebhookEnabled', c.is_enabled || false);
327:     setVal('antiwebhookLogChannel', c.log_channel_id || '');
328: }
329: function loadRoomsTab(c) {
330:     setVal('roomJoinChannel', c.join_channel || '');
331:     setVal('roomCategory', c.room_category || '');
332:     setVal('roomLogChannel', c.log_channel || '');
333:     let staffRole = '';
334:     try {
335:         const parsed = JSON.parse(c.staff_role || '[]');
336:         staffRole = Array.isArray(parsed) ? parsed[0] : parsed;
337:     } catch {
338:         staffRole = c.staff_role || '';
339:     }
340:     setVal('roomStaffRole', staffRole);
341:     setVal('roomManagerRole', c.manager_role || '');
342: }
343: function loadLogsTab(c) {
344:     let channels = {};
345:     try {
346:         channels = typeof c.channels === 'string' ? JSON.parse(c.channels) : (c.channels || {});
347:     } catch {}
348:     const keys = [
349:     
<truncated 3136 bytes>
);
403: }
404: async function saveApply() {
405:     const ok = await saveModuleConfig('apply', {
406:         apply_channel_id:    document.getElementById('applyChannel')?.value          || null,
407:         staff_channel_id:    document.getElementById('applyStaffChannel')?.value     || null,
408:         log_channel_id:      document.getElementById('applyLogChannel')?.value       || null,
409:         staff_role_id:       document.getElementById('applyStaffRole')?.value        || null,
410:         role_staff_id:       document.getElementById('applyRoleStaff')?.value        || null,
411:         role_designer_id:    document.getElementById('applyRoleDesigner')?.value     || null,
412:         role_event_id:       document.getElementById('applyRoleEvent')?.value        || null,
413:         role_partnership_id: document.getElementById('applyRolePartnership')?.value  || null,
414:         banner_url:          document.getElementById('applyBanner')?.value           || null,
415:     });
416:     if (ok) showToast('Apply panel saved!', 'success');
417: }
418: 
419: async function saveAutoRole() {
420:     const roles = Array.from(document.getElementById('autoroleRoles')?.selectedOptions || []).map(o => o.value);
421:     const ok = await saveModuleConfig('autorole', {
422:         auto_role_id: roles.join(',')
423:     });
424:     if (ok) showToast('Auto Role settings saved!', 'success');
425: }
426: 
427: async function saveGuildSettings() {
428:     const owners = Array.from(document.getElementById('guildOwnerRoles')?.selectedOptions || []).map(o => o.value);
429:     const ok = await saveModuleConfig('guildsettings', {
430:         prefix: document.getElementById('guildPrefix')?.value || '&',
431:         owner_role_id: owners.join(',')
432:     });
433:     if (ok) showToast('General settings saved!', 'success');
434: }
435: 
The above content does NOT show the entire file contents. If you need to view any lines of the file which were not shown to complete your task, call this tool again to view those lines.
