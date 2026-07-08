Created At: 2026-06-16T16:23:35Z
Completed At: 2026-06-16T16:23:35Z
File Path: `file:///home/ubuntu/zero-lab-bots/vivy/server/public/dashboard.js`
Total Lines: 953
Total Bytes: 39282
Showing lines 420 to 445
The following code has been modified to include a line number before every line, in the format: <line_number>: <original_line>. Please note that any changes targeting the original code should remove the line number, colon, and leading space.
420:     ];
421:     const channels = {};
422:     keys.forEach(key => {
423:         const val = document.getElementById(`logChan_${key}`)?.value;
424:         if (val) channels[key] = val;
425:     });
426: 
427:     const ok = await saveModuleConfig('logs', {
428:         channels: JSON.stringify(channels)
429:     });
430:     if (ok) showToast('Server logging saved!', 'success');
431: }
432: 
433: /* ---------- Welcome Tab ---------- */
434: function loadWelcomeTab(config) {
435:     if (!config) return;
436:     const set = (id, val) => { const el = document.getElementById(id); if (el) el.value !== undefined ? el.value = val : el.checked = val; };
437:     document.getElementById('welcomeEnabled') && (document.getElementById('welcomeEnabled').checked = config.welcome_enabled || false);
438:     document.getElementById('leaveEnabled')   && (document.getElementById('leaveEnabled').checked   = config.leave_enabled   || false);
439:     set('welcomeChannel', config.welcome_channel  || '');
440:     set('welcomeText',    config.welcome_message  || 'Welcome {user} to {server}!');
441:     set('welcomeBgImage', config.welcome_bg_image || '');
442:     set('leaveChannel',   config.leave_channel    || '');
443:     set('leaveText',      config.leave_message    || '{user} has left the server.');
444:     updateLivePreview();
445: }
The above content does NOT show the entire file contents. If you need to view any lines of the file which were not shown to complete your task, call this tool again to view those lines.
