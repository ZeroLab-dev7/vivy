Created At: 2026-06-17T00:46:35Z
Completed At: 2026-06-17T00:46:35Z
File Path: `file:///home/ubuntu/zero-lab-bots/vivy/server/public/dashboard.js`
Total Lines: 1098
Total Bytes: 45145
Showing lines 530 to 585
The following code has been modified to include a line number before every line, in the format: <line_number>: <original_line>. Please note that any changes targeting the original code should remove the line number, colon, and leading space.
530:     };
531:     const ok = await saveModuleConfig('welcome', data);
532:     if (ok) showToast('Welcome & Leave settings saved!', 'success');
533: }
534: 
535: /* ---------- AutoMod Tab ---------- */
536: function loadAutoModTab(config, antilinkConfig) {
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
547: 
548:     if (antilinkConfig) {
549:         setMulti('amLinksWlRoles', antilinkConfig.whitelist_roles);
550:     }
551: }
552: 
553: async function saveAutoMod() {
554:     const data = {
555:         spam_enabled:      document.getElementById('amSpam')?.checked     || false,
556:         links_enabled:     document.getElementById('amLinks')?.checked    || false,
557:         invites_enabled:   document.getElementById('amInvites')?.checked  || false,
558:         bad_words_enabled: document.getElementById('amBadWords')?.checked || false,
559:         bad_words_list:    document.getElementById('amBadWordsList')?.value || '',
560:         punishment:        document.getElementById('amPunishment')?.value  || 'warn',
561:     };
562:     const ok = await saveModuleConfig('automod', data);
563: 
564:     // Also save Anti-Link whitelist roles if modified
565:     const amLinksWlRolesEl = document.getElementById('amLinksWlRoles');
566:     if (amLinksWlRolesEl) {
567:         const wlRole = Array.from(amLinksWlRolesEl.selectedOptions || []).map(o => o.value);
568:         // Fetch existing antilink settings first to preserve other settings (is_enabled, action, whitelist_channels)
569:         const antilinkRes = await fetch(`/api/guilds/${activeGuildId}`);
570:         const antilinkData = await antilinkRes.json().catch(() => ({}));
571:         const existingAntilink = antilinkData.configs?.antilink || {};
572: 
573:         await saveModuleConfig('antilink', {
574:             is_enabled:         existingAntilink.is_enabled || false,
575:             action:             existingAntilink.action     || 'delete',
576:             whitelist_channels: existingAntilink.whitelist_channels || '[]',
577:             whitelist_roles:    JSON.stringify(wlRole),
578:         });
579:     }
580: 
581:     if (ok) showToast('AutoMod rules saved!', 'success');
582: }
583: 
584: /* ---------- Economy Tab ---------- */
585: function loadEconomyTab(config) {
The above content does NOT show the entire file contents. If you need to view any lines of the file which were not shown to complete your task, call this tool again to view those lines.
