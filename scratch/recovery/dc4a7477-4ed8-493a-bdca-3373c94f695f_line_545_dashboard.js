Created At: 2026-06-16T23:25:16Z
Completed At: 2026-06-16T23:25:16Z
File Path: `file:///home/ubuntu/zero-lab-bots/vivy/server/public/dashboard.js`
Total Lines: 1057
Total Bytes: 42818
Showing lines 580 to 620
The following code has been modified to include a line number before every line, in the format: <line_number>: <original_line>. Please note that any changes targeting the original code should remove the line number, colon, and leading space.
580:         showToast('Please enter a valid name and price.', 'warning');
581:         return;
582:     }
583: 
584:     economyShopItems.push({ id: `item_${Date.now()}`, name, price, role_id: role || null, description: desc || 'No description.' });
585:     ['shopItemName','shopItemPrice','shopItemDesc'].forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
586:     renderShopItems();
587:     showToast(`"${name}" added to shop!`, 'success');
588: }
589: 
590: function removeShopItem(idx) {
591:     const removed = economyShopItems.splice(idx, 1)[0];
592:     renderShopItems();
593:     showToast(`"${removed.name}" removed.`, 'info');
594: }
595: 
596: async function saveEconomy() {
597:     const ok = await saveModuleConfig('economy', { shop_items: JSON.stringify(economyShopItems) });
598:     if (ok) showToast('Shop saved!', 'success');
599: }
600: 
601: /* ---------- Giveaway ---------- */
602: async function launchGiveaway() {
603:     const channelId = document.getElementById('giveawayChannel')?.value;
604:     const prize     = document.getElementById('giveawayPrize')?.value.trim();
605:     const winners   = parseInt(document.getElementById('giveawayWinners')?.value);
606:     const duration  = parseInt(document.getElementById('giveawayDuration')?.value);
607: 
608:     if (!channelId || !prize || isNaN(winners) || isNaN(duration) || winners < 1 || duration < 1) {
609:         showToast('Please fill all giveaway fields.', 'warning');
610:         return;
611:     }
612: 
613:     try {
614:         const res = await fetch(`/api/guilds/${activeGuildId}/config/giveaway`, {
615:             method: 'POST',
616:             headers: { 'Content-Type': 'application/json' },
617:             body: JSON.stringify({ channelId, prize, winners, duration })
618:         });
619:         res.ok ? showToast('Giveaway launched on Discord! 🎉', 'success') : showToast('Failed to launch giveaway.', 'error');
620:     } catch { showToast('Network error.', 'error'); }
The above content does NOT show the entire file contents. If you need to view any lines of the file which were not shown to complete your task, call this tool again to view those lines.
