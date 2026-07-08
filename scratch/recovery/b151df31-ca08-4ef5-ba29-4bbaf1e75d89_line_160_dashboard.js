Created At: 2026-06-16T15:14:25Z
Completed At: 2026-06-16T15:14:25Z
File Path: `file:///home/ubuntu/zero-lab-bots/vivy/server/public/dashboard.js`
Total Lines: 604
Total Bytes: 26219
Showing lines 401 to 604
The following code has been modified to include a line number before every line, in the format: <line_number>: <original_line>. Please note that any changes targeting the original code should remove the line number, colon, and leading space.
401:     if (!channelId || !prize || isNaN(winners) || isNaN(duration) || winners < 1 || duration < 1) {
402:         showToast('Please fill all giveaway fields.', 'warning');
403:         return;
404:     }
405: 
406:     try {
407:         const res = await fetch(`/api/guilds/${activeGuildId}/config/giveaway`, {
408:             method: 'POST',
409:             headers: { 'Content-Type': 'application/json' },
410:             body: JSON.stringify({ channelId, prize, winners, duration })
411:         });
412:         res.ok ? showToast('Giveaway launched on Discord! 🎉', 'success') : showToast('Failed to launch giveaway.', 'error');
413:     } catch { showToast('Network error.', 'error'); }
414: }
415: 
416: /* ---------- Custom Commands ---------- */
417: async function addCustomCommand() {
418:     const name  = document.getElementById('cmdName')?.value.trim();
419:     const type  = document.getElementById('cmdType')?.value;
420:     const reply = document.getElementById('cmdReply')?.value.trim();
421: 
422:     if (!name || !reply) {
423:         showToast('Please fill the command name and response.', 'warning');
424:         return;
425:     }
426: 
427:     try {
428:         const res = await fetch(`/api/guilds/${activeGuildId}/config/commands`, {
429:             method: 'POST',
430:             headers: { 'Content-Type': 'application/json' },
431:             body: JSON.stringify({ name, type, reply })
432:         });
433:         if (res.ok) {
434:             showToast(`Command "/${name}" created!`, 'success');
435:             ['cmdName', 'cmdReply'].forEa
<truncated 5564 bytes>
');
564:     const areaPath = `M${padL},${padT + chartH} ` +
565:         points.map(p => `L${p.x},${p.y}`).join(' ') +
566:         ` L${padL + chartW},${padT + chartH} Z`;
567: 
568:     svg.innerHTML = `
569:         <defs>
570:             <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
571:                 <stop offset="0%" stop-color="#00e5ff" stop-opacity="0.25"/>
572:                 <stop offset="100%" stop-color="#00e5ff" stop-opacity="0"/>
573:             </linearGradient>
574:         </defs>
575:         <path d="${areaPath}" fill="url(#chartGrad)"/>
576:         <polyline points="${polyline}" fill="none" stroke="#00e5ff" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>
577:         ${points.map(p => `
578:             <circle cx="${p.x}" cy="${p.y}" r="4" fill="#00e5ff" stroke="#070a10" stroke-width="2"/>
579:             <text x="${p.x}" y="${padT + chartH + 18}" fill="#4a5568" font-size="11" text-anchor="middle" font-family="Inter,sans-serif">${p.d.date}</text>
580:         `).join('')}
581:     `;
582: }
583: 
584: /* ---------- Save Helper ---------- */
585: async function saveModuleConfig(moduleName, data) {
586:     try {
587:         const res = await fetch(`/api/guilds/${activeGuildId}/config/${moduleName}`, {
588:             method: 'POST',
589:             headers: { 'Content-Type': 'application/json' },
590:             body: JSON.stringify(data)
591:         });
592:         if (res.ok) return true;
593:         const err = await res.json().catch(() => ({}));
594:         showToast(err.error || 'Save failed.', 'error');
595:         return false;
596:     } catch {
597:         showToast('Network error.', 'error');
598:         return false;
599:     }
600: }
601: 
602: /* ---------- Boot ---------- */
603: window.addEventListener('DOMContentLoaded', initDashboard);
604: 
The above content does NOT show the entire file contents. If you need to view any lines of the file which were not shown to complete your task, call this tool again to view those lines.
