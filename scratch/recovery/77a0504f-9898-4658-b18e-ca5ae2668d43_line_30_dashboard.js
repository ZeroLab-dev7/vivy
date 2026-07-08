Created At: 2026-06-16T23:27:56Z
Completed At: 2026-06-16T23:27:57Z
File Path: `file:///home/ubuntu/zero-lab-bots/vivy/server/public/dashboard.js`
Total Lines: 1057
Total Bytes: 42818
Showing lines 1 to 800
The following code has been modified to include a line number before every line, in the format: <line_number>: <original_line>. Please note that any changes targeting the original code should remove the line number, colon, and leading space.
1: /* ============================================================
2:    Vivy Dashboard – Client Script
3:    ============================================================ */
4: 
5: const pathParts = window.location.pathname.split('/').filter(Boolean);
6: let activeGuildId = null;
7: let initialTab = 'overview';
8: 
9: if (pathParts[0] === 'servers' && pathParts[1]) {
10:     activeGuildId = pathParts[1];
11:     if (pathParts[2]) {
12:         initialTab = pathParts[2];
13:     }
14: } else {
15:     // Fallback to legacy query parameters
16:     activeGuildId = new URLSearchParams(window.location.search).get('guild');
17:     const legacyTab = new URLSearchParams(window.location.search).get('tab');
18:     if (legacyTab) initialTab = legacyTab;
19: }
20: 
21: let guildChannels = [];
22: let guildRoles = [];
23: let economyShopItems = [];
24: 
25: /* ---------- Toast ---------- */
26: function showToast(message, type = 'info') {
27:     const icons = {
28:         success: 'fa-circle-check',
29:         error:   'fa-circle-xmark',
30:         warning: 'fa-triangle-exclamation',
31:         info:    'fa-circle-info'
32:     };
33:     const wrap = document.getElementById('toastWrap');
34:     if (!wrap) return;
35:     const t = document.createElement('div');
36:     t.className = `toast ${type}`;
37:     t.innerHTML = `<i class="fa-solid ${icons[type] || icons.info}"></i> ${message}`;
38:     wrap.appendChild(t);
39:     setTimeout(() => {
40:         t.style.opacity = '0';
41:         t.style.transform = 'translateX(20px)';
42:         setTimeout(() => t.remove(), 400);
<truncated 33941 bytes>
 - 1 || 1);
762: 
763:     // Build SVG polyline
764:     const points = growth.map((d, i) => {
765:         const x = padL + i * step;
766:         const y = padT + chartH - (d.count / max) * chartH;
767:         return { x, y, d };
768:     });
769: 
770:     const polyline = points.map(p => `${p.x},${p.y}`).join(' ');
771:     const areaPath = `M${padL},${padT + chartH} ` +
772:         points.map(p => `L${p.x},${p.y}`).join(' ') +
773:         ` L${padL + chartW},${padT + chartH} Z`;
774: 
775:     svg.innerHTML = `
776:         <defs>
777:             <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
778:                 <stop offset="0%" stop-color="#00e5ff" stop-opacity="0.25"/>
779:                 <stop offset="100%" stop-color="#00e5ff" stop-opacity="0"/>
780:             </linearGradient>
781:         </defs>
782:         <path d="${areaPath}" fill="url(#chartGrad)"/>
783:         <polyline points="${polyline}" fill="none" stroke="#00e5ff" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>
784:         ${points.map(p => `
785:             <circle cx="${p.x}" cy="${p.y}" r="4" fill="#00e5ff" stroke="#070a10" stroke-width="2"/>
786:             <text x="${p.x}" y="${padT + chartH + 18}" fill="#4a5568" font-size="11" text-anchor="middle" font-family="Inter,sans-serif">${p.d.date}</text>
787:         `).join('')}
788:     `;
789: }
790: 
791: /* ---------- Save Helper ---------- */
792: async function saveModuleConfig(moduleName, data) {
793:     try {
794:         const res = await fetch(`/api/guilds/${activeGuildId}/config/${moduleName}`, {
795:             method: 'POST',
796:             headers: { 'Content-Type': 'application/json' },
797:             body: JSON.stringify(data)
798:         });
799:         if (res.ok) return true;
800:         const err = await res.json().catch(() => ({}));
The above content does NOT show the entire file contents. If you need to view any lines of the file which were not shown to complete your task, call this tool again to view those lines.
