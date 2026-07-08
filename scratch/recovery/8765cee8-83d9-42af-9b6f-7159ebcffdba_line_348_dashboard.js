Created At: 2026-06-16T16:23:08Z
Completed At: 2026-06-16T16:23:08Z
File Path: `file:///home/ubuntu/zero-lab-bots/vivy/server/public/dashboard.js`
Total Lines: 945
Total Bytes: 39377
Showing lines 510 to 550
The following code has been modified to include a line number before every line, in the format: <line_number>: <original_line>. Please note that any changes targeting the original code should remove the line number, colon, and leading space.
510:     el.innerHTML = `
511:         <table class="data-table">
512:             <thead><tr><th>Name</th><th>Price</th><th>Description</th><th></th></tr></thead>
513:             <tbody>${economyShopItems.map((item, i) => `
514:                 <tr>
515:                     <td><strong>${item.name}</strong></td>
516:                     <td>🪙 ${item.price.toLocaleString()}</td>
517:                     <td style="color:var(--text-2)">${item.description}</td>
518:                     <td><button class="btn btn-danger btn-sm" onclick="removeShopItem(${i})"><i class="fa-solid fa-trash"></i></button></td>
519:                 </tr>`).join('')}
520:             </tbody>
521:         </table>`;
522: }
523: 
524: function addShopItem() {
525:     const name  = document.getElementById('shopItemName')?.value.trim();
526:     const price = parseInt(document.getElementById('shopItemPrice')?.value);
527:     const role  = document.getElementById('shopItemRole')?.value;
528:     const desc  = document.getElementById('shopItemDesc')?.value.trim();
529: 
530:     if (!name || isNaN(price) || price <= 0) {
531:         showToast('Please enter a valid name and price.', 'warning');
532:         return;
533:     }
534: 
535:     economyShopItems.push({ id: `item_${Date.now()}`, name, price, role_id: role || null, description: desc || 'No description.' });
536:     ['shopItemName','shopItemPrice','shopItemDesc'].forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
537:     renderShopItems();
538:     showToast(`"${name}" added to shop!`, 'success');
539: }
540: 
541: function removeShopItem(idx) {
542:     const removed = economyShopItems.splice(idx, 1)[0];
543:     renderShopItems();
544:     showToast(`"${removed.name}" removed.`, 'info');
545: }
546: 
547: async function saveEconomy() {
548:     const ok = await saveModuleConfig('economy', { shop_items: JSON.stringify(economyShopItems) });
549:     if (ok) showToast('Shop saved!', 'success');
550: }
The above content does NOT show the entire file contents. If you need to view any lines of the file which were not shown to complete your task, call this tool again to view those lines.
