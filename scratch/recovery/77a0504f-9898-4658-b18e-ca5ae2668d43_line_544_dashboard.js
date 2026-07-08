Created At: 2026-06-17T00:55:43Z
Completed At: 2026-06-17T00:55:43Z
File Path: `file:///home/ubuntu/zero-lab-bots/vivy/server/public/dashboard.js`
Total Lines: 1116
Total Bytes: 45943
Showing lines 340 to 495
The following code has been modified to include a line number before every line, in the format: <line_number>: <original_line>. Please note that any changes targeting the original code should remove the line number, colon, and leading space.
340:         staffRole = c.staff_role || '';
341:     }
342:     setVal('roomStaffRole', staffRole);
343:     setVal('roomManagerRole', c.manager_role || '');
344: }
345: function loadLogsTab(c) {
346:     let channels = {};
347:     try {
348:         channels = typeof c.channels === 'string' ? JSON.parse(c.channels) : (c.channels || {});
349:     } catch {}
350:     const keys = [
351:         'welcome', 'leave', 'nickname', 'role-given', 'role-remove',
352:         'role-update', 'ban', 'messages', 'voice-join', 'channels'
353:     ];
354:     keys.forEach(key => {
355:         setVal(`logChan_${key}`, channels[key] || '');
356:     });
357: }
358: 
359: /* ---------- Save functions for new modules ---------- */
360: async function saveWarn() {
361:     const ok = await saveModuleConfig('warn', {
362:         warn_first:   document.getElementById('warnFirst')?.value       || null,
363:         warn_second:  document.getElementById('warnSecond')?.value      || null,
364:         warn_last:    document.getElementById('warnLast')?.value        || null,
365:         warner_role:  document.getElementById('warnWarnerRole')?.value  || null,
366:         warning_logs: document.getElementById('warnLogsChannel')?.value || null,
367:     });
368:     if (ok) showToast('Warn system saved!', 'success');
369: }
370: async function saveJail() {
371:     const ok = await saveModuleConfig('jail', {
372:         jailed_role_id:  document.getElementById('jailJailedRole')?.value  || null,
373:         jailer_role_id:  document.getElementById('jailJailerRole')?.value  || null,
374:       
<truncated 4562 bytes>
oms() {
455:     const staffRole = document.getElementById('roomStaffRole')?.value;
456:     const ok = await saveModuleConfig('rooms', {
457:         join_channel: document.getElementById('roomJoinChannel')?.value || null,
458:         room_category: document.getElementById('roomCategory')?.value || null,
459:         log_channel: document.getElementById('roomLogChannel')?.value || null,
460:         staff_role: staffRole ? JSON.stringify([staffRole]) : '[]',
461:         manager_role: document.getElementById('roomManagerRole')?.value || null
462:     });
463:     if (ok) showToast('Room setup saved!', 'success');
464: }
465: 
466: async function saveLogs() {
467:     const keys = [
468:         'welcome', 'leave', 'nickname', 'role-given', 'role-remove',
469:         'role-update', 'ban', 'messages', 'voice-join', 'channels'
470:     ];
471:     const channels = {};
472:     keys.forEach(key => {
473:         const val = document.getElementById(`logChan_${key}`)?.value;
474:         if (val) channels[key] = val;
475:     });
476: 
477:     const ok = await saveModuleConfig('logs', {
478:         channels: JSON.stringify(channels)
479:     });
480:     if (ok) showToast('Server logging saved!', 'success');
481: }
482: 
483: /* ---------- Welcome Tab ---------- */
484: function loadWelcomeTab(config) {
485:     if (!config) return;
486:     const set = (id, val) => {
487:         const el = document.getElementById(id);
488:         if (el) {
489:             el.value !== undefined ? el.value = val : el.checked = val;
490:             if (el.tagName === 'SELECT' && document.getElementById(`wrap-${id}`)) {
491:                 syncCustomSelect(id);
492:             }
493:         }
494:     };
495:     document.getElementById('welcomeEnabled') && (document.getElementById('welcomeEnabled').checked = config.welcome_enabled || false);
The above content does NOT show the entire file contents. If you need to view any lines of the file which were not shown to complete your task, call this tool again to view those lines.
