Created At: 2026-06-16T16:31:05Z
Completed At: 2026-06-16T16:31:05Z
File Path: `file:///home/ubuntu/zero-lab-bots/vivy/server/public/dashboard.js`
Total Lines: 1024
Total Bytes: 41778
Showing lines 450 to 520
The following code has been modified to include a line number before every line, in the format: <line_number>: <original_line>. Please note that any changes targeting the original code should remove the line number, colon, and leading space.
450:     set('leaveChannel',   config.leave_channel    || '');
451:     set('leaveText',      config.leave_message    || '{user} has left the server.');
452:     updateLivePreview();
453: }
454: 
455: function updateLivePreview() {
456:     const textEl = document.getElementById('welcomeText');
457:     const previewEl = document.getElementById('previewText');
458:     const guildNameEl = document.getElementById('guildName');
459:     if (!textEl || !previewEl) return;
460: 
461:     const guildName = guildNameEl ? guildNameEl.textContent : 'Server';
462:     previewEl.innerHTML = textEl.value
463:         .replace(/{user}/g,        `<span class="mention">@Username</span>`)
464:         .replace(/{username}/g,    '<b>Username</b>')
465:         .replace(/{server}/g,      `<b>${guildName}</b>`)
466:         .replace(/{memberCount}/g, '<b>1,245</b>');
467: }
468: 
469: async function saveWelcomeSettings() {
470:     const data = {
471:         welcome_enabled:  document.getElementById('welcomeEnabled')?.checked || false,
472:         welcome_channel:  document.getElementById('welcomeChannel')?.value   || '',
473:         welcome_message:  document.getElementById('welcomeText')?.value      || '',
474:         welcome_bg_image: document.getElementById('welcomeBgImage')?.value   || '',
475:         leave_enabled:    document.getElementById('leaveEnabled')?.checked   || false,
476:         leave_channel:    document.getElementById('leaveChannel')?.value     || '',
477:         leave_message:    document.getElementById('leaveText')?.value        || '',
478:     };
479:     cons
<truncated 120 bytes>
;
481: }
482: 
483: /* ---------- AutoMod Tab ---------- */
484: function loadAutoModTab(config) {
485:     if (!config) return;
486:     const cb = (id, val) => { const el = document.getElementById(id); if (el) el.checked = val; };
487:     cb('amSpam',     config.spam_enabled     || false);
488:     cb('amLinks',    config.links_enabled    || false);
489:     cb('amInvites',  config.invites_enabled  || false);
490:     cb('amBadWords', config.bad_words_enabled|| false);
491:     const bwl = document.getElementById('amBadWordsList');
492:     if (bwl) bwl.value = config.bad_words_list || '';
493:     const pun = document.getElementById('amPunishment');
494:     if (pun) pun.value = config.punishment || 'warn';
495: }
496: 
497: async function saveAutoMod() {
498:     const data = {
499:         spam_enabled:      document.getElementById('amSpam')?.checked     || false,
500:         links_enabled:     document.getElementById('amLinks')?.checked    || false,
501:         invites_enabled:   document.getElementById('amInvites')?.checked  || false,
502:         bad_words_enabled: document.getElementById('amBadWords')?.checked || false,
503:         bad_words_list:    document.getElementById('amBadWordsList')?.value || '',
504:         punishment:        document.getElementById('amPunishment')?.value  || 'warn',
505:     };
506:     const ok = await saveModuleConfig('automod', data);
507:     if (ok) showToast('AutoMod rules saved!', 'success');
508: }
509: 
510: /* ---------- Economy Tab ---------- */
511: function loadEconomyTab(config) {
512:     if (!config) return;
513:     try {
514:         economyShopItems = JSON.parse(config.shop_items || '[]');
515:         renderShopItems();
516:     } catch (e) { economyShopItems = []; }
517: }
518: 
519: function renderShopItems() {
520:     const el = document.getElementById('shopList');
The above content does NOT show the entire file contents. If you need to view any lines of the file which were not shown to complete your task, call this tool again to view those lines.
