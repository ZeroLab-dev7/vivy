Created At: 2026-06-16T23:23:42Z
Completed At: 2026-06-16T23:23:42Z
File Path: `file:///home/ubuntu/zero-lab-bots/vivy/server/public/dashboard.js`
Total Lines: 1057
Total Bytes: 42818
Showing lines 530 to 580
The following code has been modified to include a line number before every line, in the format: <line_number>: <original_line>. Please note that any changes targeting the original code should remove the line number, colon, and leading space.
530: async function saveAutoMod() {
531:     const data = {
532:         spam_enabled:      document.getElementById('amSpam')?.checked     || false,
533:         links_enabled:     document.getElementById('amLinks')?.checked    || false,
534:         invites_enabled:   document.getElementById('amInvites')?.checked  || false,
535:         bad_words_enabled: document.getElementById('amBadWords')?.checked || false,
536:         bad_words_list:    document.getElementById('amBadWordsList')?.value || '',
537:         punishment:        document.getElementById('amPunishment')?.value  || 'warn',
538:     };
539:     const ok = await saveModuleConfig('automod', data);
540:     if (ok) showToast('AutoMod rules saved!', 'success');
541: }
542: 
543: /* ---------- Economy Tab ---------- */
544: function loadEconomyTab(config) {
545:     if (!config) return;
546:     try {
547:         economyShopItems = JSON.parse(config.shop_items || '[]');
548:         renderShopItems();
549:     } catch (e) { economyShopItems = []; }
550: }
551: 
552: function renderShopItems() {
553:     const el = document.getElementById('shopList');
554:     if (!el) return;
555:     if (economyShopItems.length === 0) {
556:         el.innerHTML = '<div style="color:var(--text-2);font-size:14px;text-align:center;padding:20px;">No shop items yet. Create one above!</div>';
557:         return;
558:     }
559:     el.innerHTML = `
560:         <table class="data-table">
561:             <thead><tr><th>Name</th><th>Price</th><th>Description</th><th></th></tr></thead>
562:             <tbody>${economyShopItems.map((item, i) => `
563:                 <tr>
564:                     <td><strong>${item.name}</strong></td>
565:                     <td>🪙 ${item.price.toLocaleString()}</td>
566:                     <td style="color:var(--text-2)">${item.description}</td>
567:                     <td><button class="btn btn-danger btn-sm" onclick="removeShopItem(${i})"><i class="fa-solid fa-trash"></i></button></td>
568:                 </tr>`).join('')}
569:             </tbody>
570:         </table>`;
571: }
572: 
573: function addShopItem() {
574:     const name  = document.getElementById('shopItemName')?.value.trim();
575:     const price = parseInt(document.getElementById('shopItemPrice')?.value);
576:     const role  = document.getElementById('shopItemRole')?.value;
577:     const desc  = document.getElementById('shopItemDesc')?.value.trim();
578: 
579:     if (!name || isNaN(price) || price <= 0) {
580:         showToast('Please enter a valid name and price.', 'warning');
The above content does NOT show the entire file contents. If you need to view any lines of the file which were not shown to complete your task, call this tool again to view those lines.
