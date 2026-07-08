Created At: 2026-06-17T00:22:52Z
Completed At: 2026-06-17T00:22:52Z
File Path: `file:///home/ubuntu/zero-lab-bots/vivy/server/public/dashboard.js`
Total Lines: 1074
Total Bytes: 43818
Showing lines 470 to 520
The following code has been modified to include a line number before every line, in the format: <line_number>: <original_line>. Please note that any changes targeting the original code should remove the line number, colon, and leading space.
470:     keys.forEach(key => {
471:         const val = document.getElementById(`logChan_${key}`)?.value;
472:         if (val) channels[key] = val;
473:     });
474: 
475:     const ok = await saveModuleConfig('logs', {
476:         channels: JSON.stringify(channels)
477:     });
478:     if (ok) showToast('Server logging saved!', 'success');
479: }
480: 
481: /* ---------- Welcome Tab ---------- */
482: function loadWelcomeTab(config) {
483:     if (!config) return;
484:     const set = (id, val) => {
485:         const el = document.getElementById(id);
486:         if (el) {
487:             el.value !== undefined ? el.value = val : el.checked = val;
488:             if (el.tagName === 'SELECT' && document.getElementById(`wrap-${id}`)) {
489:                 syncCustomSelect(id);
490:             }
491:         }
492:     };
493:     document.getElementById('welcomeEnabled') && (document.getElementById('welcomeEnabled').checked = config.welcome_enabled || false);
494:     document.getElementById('leaveEnabled')   && (document.getElementById('leaveEnabled').checked   = config.leave_enabled   || false);
495:     set('welcomeChannel', config.welcome_channel  || '');
496:     set('welcomeText',    config.welcome_message  || 'Welcome {user} to {server}!');
497:     set('welcomeBgImage', config.welcome_bg_image || '');
498:     set('leaveChannel',   config.leave_channel    || '');
499:     set('leaveText',      config.leave_message    || '{user} has left the server.');
500:     updateLivePreview();
501: }
502: 
503: function updateLivePreview() {
504:     const textEl = document.getElementById('welcomeText');
505:     const previewEl = document.getElementById('previewText');
506:     const guildNameEl = document.getElementById('guildName');
507:     if (!textEl || !previewEl) return;
508: 
509:     const guildName = guildNameEl ? guildNameEl.textContent : 'Server';
510:     // Escape the user-controlled template and guildName before inserting as HTML
511:     const safeText = escapeHtml(textEl.value)
512:         .replace(/\{user\}/g,        `<span class="mention">@Username</span>`)
513:         .replace(/\{username\}/g,    '<b>Username</b>')
514:         .replace(/\{server\}/g,      `<b>${escapeHtml(guildName)}</b>`)
515:         .replace(/\{memberCount\}/g, '<b>1,245</b>');
516:     previewEl.innerHTML = safeText;
517: }
518: 
519: async function saveWelcomeSettings() {
520:     const data = {
The above content does NOT show the entire file contents. If you need to view any lines of the file which were not shown to complete your task, call this tool again to view those lines.
