Created At: 2026-06-16T15:14:24Z
Completed At: 2026-06-16T15:14:24Z
File Path: `file:///home/ubuntu/zero-lab-bots/vivy/server/public/dashboard.js`
Total Lines: 604
Total Bytes: 26219
Showing lines 251 to 400
The following code has been modified to include a line number before every line, in the format: <line_number>: <original_line>. Please note that any changes targeting the original code should remove the line number, colon, and leading space.
251: }
252: async function saveApply() {
253:     const ok = await saveModuleConfig('apply', {
254:         apply_channel_id:    document.getElementById('applyChannel')?.value          || null,
255:         staff_channel_id:    document.getElementById('applyStaffChannel')?.value     || null,
256:         log_channel_id:      document.getElementById('applyLogChannel')?.value       || null,
257:         staff_role_id:       document.getElementById('applyStaffRole')?.value        || null,
258:         role_staff_id:       document.getElementById('applyRoleStaff')?.value        || null,
259:         role_designer_id:    document.getElementById('applyRoleDesigner')?.value     || null,
260:         role_event_id:       document.getElementById('applyRoleEvent')?.value        || null,
261:         role_partnership_id: document.getElementById('applyRolePartnership')?.value  || null,
262:         banner_url:          document.getElementById('applyBanner')?.value           || null,
263:     });
264:     if (ok) showToast('Apply panel saved!', 'success');
265: }
266: 
267: /* ---------- Welcome Tab ---------- */
268: function loadWelcomeTab(config) {
269:     if (!config) return;
270:     const set = (id, val) => { const el = document.getElementById(id); if (el) el.value !== undefined ? el.value = val : el.checked = val; };
271:     document.getElementById('welcomeEnabled') && (document.getElementById('welcomeEnabled').checked = config.welcome_enabled || false);
272:     document.getElementById('leaveEnabled')   && (document.getElementById('leaveEnabled').checked   = config.leave_ena
<truncated 4642 bytes>
ass="fa-solid fa-trash"></i></button></td>
361:                 </tr>`).join('')}
362:             </tbody>
363:         </table>`;
364: }
365: 
366: function addShopItem() {
367:     const name  = document.getElementById('shopItemName')?.value.trim();
368:     const price = parseInt(document.getElementById('shopItemPrice')?.value);
369:     const role  = document.getElementById('shopItemRole')?.value;
370:     const desc  = document.getElementById('shopItemDesc')?.value.trim();
371: 
372:     if (!name || isNaN(price) || price <= 0) {
373:         showToast('Please enter a valid name and price.', 'warning');
374:         return;
375:     }
376: 
377:     economyShopItems.push({ id: `item_${Date.now()}`, name, price, role_id: role || null, description: desc || 'No description.' });
378:     ['shopItemName','shopItemPrice','shopItemDesc'].forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
379:     renderShopItems();
380:     showToast(`"${name}" added to shop!`, 'success');
381: }
382: 
383: function removeShopItem(idx) {
384:     const removed = economyShopItems.splice(idx, 1)[0];
385:     renderShopItems();
386:     showToast(`"${removed.name}" removed.`, 'info');
387: }
388: 
389: async function saveEconomy() {
390:     const ok = await saveModuleConfig('economy', { shop_items: JSON.stringify(economyShopItems) });
391:     if (ok) showToast('Shop saved!', 'success');
392: }
393: 
394: /* ---------- Giveaway ---------- */
395: async function launchGiveaway() {
396:     const channelId = document.getElementById('giveawayChannel')?.value;
397:     const prize     = document.getElementById('giveawayPrize')?.value.trim();
398:     const winners   = parseInt(document.getElementById('giveawayWinners')?.value);
399:     const duration  = parseInt(document.getElementById('giveawayDuration')?.value);
400: 
The above content does NOT show the entire file contents. If you need to view any lines of the file which were not shown to complete your task, call this tool again to view those lines.
