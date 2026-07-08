Created At: 2026-06-17T00:43:52Z
Completed At: 2026-06-17T00:43:53Z
File Path: `file:///home/ubuntu/zero-lab-bots/vivy/server/public/dashboard.js`
Total Lines: 1076
Total Bytes: 44050
Showing lines 536 to 560
The following code has been modified to include a line number before every line, in the format: <line_number>: <original_line>. Please note that any changes targeting the original code should remove the line number, colon, and leading space.
536: function loadAutoModTab(config) {
537:     if (!config) return;
538:     const cb = (id, val) => { const el = document.getElementById(id); if (el) el.checked = val; };
539:     cb('amSpam',     config.spam_enabled     || false);
540:     cb('amLinks',    config.links_enabled    || false);
541:     cb('amInvites',  config.invites_enabled  || false);
542:     cb('amBadWords', config.bad_words_enabled|| false);
543:     const bwl = document.getElementById('amBadWordsList');
544:     if (bwl) bwl.value = config.bad_words_list || '';
545:     const pun = document.getElementById('amPunishment');
546:     if (pun) pun.value = config.punishment || 'warn';
547: }
548: 
549: async function saveAutoMod() {
550:     const data = {
551:         spam_enabled:      document.getElementById('amSpam')?.checked     || false,
552:         links_enabled:     document.getElementById('amLinks')?.checked    || false,
553:         invites_enabled:   document.getElementById('amInvites')?.checked  || false,
554:         bad_words_enabled: document.getElementById('amBadWords')?.checked || false,
555:         bad_words_list:    document.getElementById('amBadWordsList')?.value || '',
556:         punishment:        document.getElementById('amPunishment')?.value  || 'warn',
557:     };
558:     const ok = await saveModuleConfig('automod', data);
559:     if (ok) showToast('AutoMod rules saved!', 'success');
560: }
The above content does NOT show the entire file contents. If you need to view any lines of the file which were not shown to complete your task, call this tool again to view those lines.
