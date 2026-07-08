Created At: 2026-06-16T16:19:01Z
Completed At: 2026-06-16T16:19:02Z
File Path: `file:///home/ubuntu/zero-lab-bots/vivy/server/public/dashboard.js`
Total Lines: 750
Total Bytes: 32119
Showing lines 301 to 450
The following code has been modified to include a line number before every line, in the format: <line_number>: <original_line>. Please note that any changes targeting the original code should remove the line number, colon, and leading space.
301:     const ok = await saveModuleConfig('jail', {
302:         jailed_role_id:  document.getElementById('jailJailedRole')?.value  || null,
303:         jailer_role_id:  document.getElementById('jailJailerRole')?.value  || null,
304:         logs_channel_id: document.getElementById('jailLogsChannel')?.value || null,
305:     });
306:     if (ok) showToast('Jail system saved!', 'success');
307: }
308: async function saveMute() {
309:     const ok = await saveModuleConfig('mute', {
310:         mute_role_id:      document.getElementById('muteMuteRole')?.value        || null,
311:         mute_logs_channel: document.getElementById('muteMuteLogsChannel')?.value || null,
312:     });
313:     if (ok) showToast('Mute system saved!', 'success');
314: }
315: async function saveVerification() {
316:     const ok = await saveModuleConfig('verification', {
317:         verificator_role:     document.getElementById('verVerificatorRole')?.value    || null,
318:         unverified_role:      document.getElementById('verUnverifiedRole')?.value     || null,
319:         verified_role:        document.getElementById('verVerifiedRole')?.value       || null,
320:         verified_female_role: document.getElementById('verVerifiedFemaleRole')?.value || null,
321:         verification_logs:    document.getElementById('verLogsChannel')?.value        || null,
322:     });
323:     if (ok) showToast('Verification system saved!', 'success');
324: }
325: async function saveAntiLink() {
326:     const wlChan = Array.from(document.getElementById('antilinkWlChannels')?.selectedOptions || []).map(o =
<truncated 4927 bytes>
'leaveEnabled').checked   = config.leave_enabled   || false);
419:     set('welcomeChannel', config.welcome_channel  || '');
420:     set('welcomeText',    config.welcome_message  || 'Welcome {user} to {server}!');
421:     set('welcomeBgImage', config.welcome_bg_image || '');
422:     set('leaveChannel',   config.leave_channel    || '');
423:     set('leaveText',      config.leave_message    || '{user} has left the server.');
424:     updateLivePreview();
425: }
426: 
427: function updateLivePreview() {
428:     const textEl = document.getElementById('welcomeText');
429:     const previewEl = document.getElementById('previewText');
430:     const guildNameEl = document.getElementById('guildName');
431:     if (!textEl || !previewEl) return;
432: 
433:     const guildName = guildNameEl ? guildNameEl.textContent : 'Server';
434:     previewEl.innerHTML = textEl.value
435:         .replace(/{user}/g,        `<span class="mention">@Username</span>`)
436:         .replace(/{username}/g,    '<b>Username</b>')
437:         .replace(/{server}/g,      `<b>${guildName}</b>`)
438:         .replace(/{memberCount}/g, '<b>1,245</b>');
439: }
440: 
441: async function saveWelcomeSettings() {
442:     const data = {
443:         welcome_enabled:  document.getElementById('welcomeEnabled')?.checked || false,
444:         welcome_channel:  document.getElementById('welcomeChannel')?.value   || '',
445:         welcome_message:  document.getElementById('welcomeText')?.value      || '',
446:         welcome_bg_image: document.getElementById('welcomeBgImage')?.value   || '',
447:         leave_enabled:    document.getElementById('leaveEnabled')?.checked   || false,
448:         leave_channel:    document.getElementById('leaveChannel')?.value     || '',
449:         leave_message:    document.getElementById('leaveText')?.value        || '',
450:     };
The above content does NOT show the entire file contents. If you need to view any lines of the file which were not shown to complete your task, call this tool again to view those lines.
