Created At: 2026-06-16T16:19:03Z
Completed At: 2026-06-16T16:19:03Z
File Path: `file:///home/ubuntu/zero-lab-bots/vivy/server/public/dashboard.js`
Total Lines: 750
Total Bytes: 32119
Showing lines 650 to 750
The following code has been modified to include a line number before every line, in the format: <line_number>: <original_line>. Please note that any changes targeting the original code should remove the line number, colon, and leading space.
650: }
651: 
652: async function deleteApiKey(key) {
653:     await fetch(`/api/guilds/${activeGuildId}/apikeys/${key}`, { method: 'DELETE' });
654:     fetchApiKeys();
655:     showToast('Token revoked.', 'info');
656: }
657: 
658: /* ---------- Analytics ---------- */
659: async function fetchAnalytics() {
660:     try {
661:         const res = await fetch(`/api/guilds/${activeGuildId}/analytics`);
662:         const data = await res.json();
663: 
664:         const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val?.toLocaleString() ?? '—'; };
665:         set('statMembers',  data.totalMembers);
666:         set('statBlocks',   data.warningsIssued);
667:         set('statTickets',  data.openTickets);
668:         set('statMessages', data.messagesLogged || 0);
669: 
670:         drawChart(data.growth || [], data.totalMembers || 100);
671:     } catch {
672:         ['statMembers','statBlocks','statTickets','statMessages'].forEach(id => {
673:             const el = document.getElementById(id); if (el) el.textContent = '—';
674:         });
675:         drawChart([], 100);
676:     }
677: }
678: 
679: function drawChart(growth, totalMembers) {
680:     const svg = document.getElementById('analyticsChart');
681:     if (!svg) return;
682: 
683:     // Default sample data if empty
684:     if (!growth.length) {
685:         growth = [
686:             { date: 'Mon', count: 12 },
687:             { date: 'Tue', count: 19 },
688:             { date: 'Wed', count: 8  },
689:             { date: 'Thu', count: 27 },
690:             {
<truncated 736 bytes>
');
710:     const areaPath = `M${padL},${padT + chartH} ` +
711:         points.map(p => `L${p.x},${p.y}`).join(' ') +
712:         ` L${padL + chartW},${padT + chartH} Z`;
713: 
714:     svg.innerHTML = `
715:         <defs>
716:             <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
717:                 <stop offset="0%" stop-color="#00e5ff" stop-opacity="0.25"/>
718:                 <stop offset="100%" stop-color="#00e5ff" stop-opacity="0"/>
719:             </linearGradient>
720:         </defs>
721:         <path d="${areaPath}" fill="url(#chartGrad)"/>
722:         <polyline points="${polyline}" fill="none" stroke="#00e5ff" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>
723:         ${points.map(p => `
724:             <circle cx="${p.x}" cy="${p.y}" r="4" fill="#00e5ff" stroke="#070a10" stroke-width="2"/>
725:             <text x="${p.x}" y="${padT + chartH + 18}" fill="#4a5568" font-size="11" text-anchor="middle" font-family="Inter,sans-serif">${p.d.date}</text>
726:         `).join('')}
727:     `;
728: }
729: 
730: /* ---------- Save Helper ---------- */
731: async function saveModuleConfig(moduleName, data) {
732:     try {
733:         const res = await fetch(`/api/guilds/${activeGuildId}/config/${moduleName}`, {
734:             method: 'POST',
735:             headers: { 'Content-Type': 'application/json' },
736:             body: JSON.stringify(data)
737:         });
738:         if (res.ok) return true;
739:         const err = await res.json().catch(() => ({}));
740:         showToast(err.error || 'Save failed.', 'error');
741:         return false;
742:     } catch {
743:         showToast('Network error.', 'error');
744:         return false;
745:     }
746: }
747: 
748: /* ---------- Boot ---------- */
749: window.addEventListener('DOMContentLoaded', initDashboard);
750: 
The above content does NOT show the entire file contents. If you need to view any lines of the file which were not shown to complete your task, call this tool again to view those lines.
