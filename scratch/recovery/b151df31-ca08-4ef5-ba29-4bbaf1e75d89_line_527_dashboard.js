Created At: 2026-06-16T15:23:09Z
Completed At: 2026-06-16T15:23:09Z
File Path: `file:///home/ubuntu/zero-lab-bots/vivy/server/public/dashboard.js`
Total Lines: 749
Total Bytes: 32072
Showing lines 1 to 749
The following code has been modified to include a line number before every line, in the format: <line_number>: <original_line>. Please note that any changes targeting the original code should remove the line number, colon, and leading space.
1: /* ============================================================
2:    Vivy Dashboard – Client Script
3:    ============================================================ */
4: 
5: let activeGuildId = new URLSearchParams(window.location.search).get('guild');
6: let guildChannels = [];
7: let guildRoles = [];
8: let economyShopItems = [];
9: 
10: /* ---------- Toast ---------- */
11: function showToast(message, type = 'info') {
12:     const icons = {
13:         success: 'fa-circle-check',
14:         error:   'fa-circle-xmark',
15:         warning: 'fa-triangle-exclamation',
16:         info:    'fa-circle-info'
17:     };
18:     const wrap = document.getElementById('toastWrap');
19:     if (!wrap) return;
20:     const t = document.createElement('div');
21:     t.className = `toast ${type}`;
22:     t.innerHTML = `<i class="fa-solid ${icons[type] || icons.info}"></i> ${message}`;
23:     wrap.appendChild(t);
24:     setTimeout(() => {
25:         t.style.opacity = '0';
26:         t.style.transform = 'translateX(20px)';
27:         setTimeout(() => t.remove(), 400);
28:     }, 3800);
29: }
30: 
31: /* ---------- Tab Switcher ---------- */
32: function switchTab(tabId) {
33:     // Deactivate all
34:     document.querySelectorAll('.dash-tab').forEach(t => t.classList.remove('active'));
35:     document.querySelectorAll('.sidebar-item').forEach(i => i.classList.remove('active'));
36: 
37:     // Activate target tab
38:     const tab = document.getElementById(`tab-${tabId}`);
39:     if (tab) tab.classList.add('active');
40: 
41:     const navEl = document.getElementById(
<truncated 32144 bytes>
eturn { x, y, d };
706:     });
707: 
708:     const polyline = points.map(p => `${p.x},${p.y}`).join(' ');
709:     const areaPath = `M${padL},${padT + chartH} ` +
710:         points.map(p => `L${p.x},${p.y}`).join(' ') +
711:         ` L${padL + chartW},${padT + chartH} Z`;
712: 
713:     svg.innerHTML = `
714:         <defs>
715:             <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
716:                 <stop offset="0%" stop-color="#00e5ff" stop-opacity="0.25"/>
717:                 <stop offset="100%" stop-color="#00e5ff" stop-opacity="0"/>
718:             </linearGradient>
719:         </defs>
720:         <path d="${areaPath}" fill="url(#chartGrad)"/>
721:         <polyline points="${polyline}" fill="none" stroke="#00e5ff" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>
722:         ${points.map(p => `
723:             <circle cx="${p.x}" cy="${p.y}" r="4" fill="#00e5ff" stroke="#070a10" stroke-width="2"/>
724:             <text x="${p.x}" y="${padT + chartH + 18}" fill="#4a5568" font-size="11" text-anchor="middle" font-family="Inter,sans-serif">${p.d.date}</text>
725:         `).join('')}
726:     `;
727: }
728: 
729: /* ---------- Save Helper ---------- */
730: async function saveModuleConfig(moduleName, data) {
731:     try {
732:         const res = await fetch(`/api/guilds/${activeGuildId}/config/${moduleName}`, {
733:             method: 'POST',
734:             headers: { 'Content-Type': 'application/json' },
735:             body: JSON.stringify(data)
736:         });
737:         if (res.ok) return true;
738:         const err = await res.json().catch(() => ({}));
739:         showToast(err.error || 'Save failed.', 'error');
740:         return false;
741:     } catch {
742:         showToast('Network error.', 'error');
743:         return false;
744:     }
745: }
746: 
747: /* ---------- Boot ---------- */
748: window.addEventListener('DOMContentLoaded', initDashboard);
749: 
The above content shows the entire, complete file contents of the requested file.
