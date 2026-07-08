Created At: 2026-06-17T00:21:57Z
Completed At: 2026-06-17T00:21:57Z
File Path: `file:///home/ubuntu/zero-lab-bots/vivy/server/public/dashboard.js`
Total Lines: 1074
Total Bytes: 43818
Showing lines 530 to 570
The following code has been modified to include a line number before every line, in the format: <line_number>: <original_line>. Please note that any changes targeting the original code should remove the line number, colon, and leading space.
530:     if (ok) showToast('Welcome & Leave settings saved!', 'success');
531: }
532: 
533: /* ---------- AutoMod Tab ---------- */
534: function loadAutoModTab(config) {
535:     if (!config) return;
536:     const cb = (id, val) => { const el = document.getElementById(id); if (el) el.checked = val; };
537:     cb('amSpam',     config.spam_enabled     || false);
538:     cb('amLinks',    config.links_enabled    || false);
539:     cb('amInvites',  config.invites_enabled  || false);
540:     cb('amBadWords', config.bad_words_enabled|| false);
541:     const bwl = document.getElementById('amBadWordsList');
542:     if (bwl) bwl.value = config.bad_words_list || '';
543:     const pun = document.getElementById('amPunishment');
544:     if (pun) pun.value = config.punishment || 'warn';
545: }
546: 
547: async function saveAutoMod() {
548:     const data = {
549:         spam_enabled:      document.getElementById('amSpam')?.checked     || false,
550:         links_enabled:     document.getElementById('amLinks')?.checked    || false,
551:         invites_enabled:   document.getElementById('amInvites')?.checked  || false,
552:         bad_words_enabled: document.getElementById('amBadWords')?.checked || false,
553:         bad_words_list:    document.getElementById('amBadWordsList')?.value || '',
554:         punishment:        document.getElementById('amPunishment')?.value  || 'warn',
555:     };
556:     const ok = await saveModuleConfig('automod', data);
557:     if (ok) showToast('AutoMod rules saved!', 'success');
558: }
559: 
560: /* ---------- Economy Tab ---------- */
561: function loadEconomyTab(config) {
562:     if (!config) return;
563:     try {
564:         economyShopItems = JSON.parse(config.shop_items || '[]');
565:         renderShopItems();
566:     } catch (e) { economyShopItems = []; }
567: }
568: 
569: function renderShopItems() {
570:     const el = document.getElementById('shopList');
The above content does NOT show the entire file contents. If you need to view any lines of the file which were not shown to complete your task, call this tool again to view those lines.
