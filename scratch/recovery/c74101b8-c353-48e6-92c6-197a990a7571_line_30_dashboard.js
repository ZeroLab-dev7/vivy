Created At: 2026-06-18T22:18:44Z
Completed At: 2026-06-18T22:18:45Z
File Path: `file:///home/ubuntu/zero-lab-bots/vivy/server/public/developer.js`
Total Lines: 1315
Total Bytes: 57863
Showing lines 1 to 800
The following code has been modified to include a line number before every line, in the format: <line_number>: <original_line>. Please note that any changes targeting the original code should remove the line number, colon, and leading space.
1: /* ============================================================
2:    Vivy Developer Portal — Interactivity & Canvas Charting
3:    ============================================================ */
4: 
5: let activeTab = 'dashboard';
6: let statsInterval = null;
7: let timelineInterval = null;
8: let healthInterval = null;
9: let currentConfirmAction = null;
10: let editingNoteId = null;
11: let notesCache = [];
12: 
13: // On startup
14: document.addEventListener('DOMContentLoaded', () => {
15:     checkDevAuth();
16:     switchTab('dashboard');
17:     startRealtimeStats();
18: });
19: 
20: // Verify authentication and load safe user metadata
21: async function checkDevAuth() {
22:     try {
23:         const res = await fetch('/auth/discord/user');
24:         if (!res.ok) window.location.href = '/auth/discord/login?returnTo=/developer';
25:         const data = await res.json();
26:         if (!data.authenticated) {
27:             window.location.href = '/auth/discord/login?returnTo=/developer';
28:         }
29:         
30:         // Populate profile chip
31:         const avatarEl = document.getElementById('userAvatar');
32:         const nameEl = document.getElementById('username');
33:         if (avatarEl && data.user.avatar) {
34:             avatarEl.src = `https://cdn.discordapp.com/avatars/${data.user.id}/${data.user.avatar}.png`;
35:         }
36:         if (nameEl) nameEl.textContent = data.user.username;
37:     } catch (err) {
38:         console.error('Auth verification error:', err);
39:     }
40: }
41: 
42: // Switching panel sections
43: functi
<truncated 36298 bytes>
       <div>
772:                                 <div style="font-size: 9px; color: var(--text-3); text-transform: uppercase; font-weight: 700;">Failed</div>
773:                                 <div style="font-size: 14px; font-weight: 700; color: var(--red);">${failedCount}</div>
774:                             </div>
775:                             <div>
776:                                 <div style="font-size: 9px; color: var(--text-3); text-transform: uppercase; font-weight: 700;">Success Rate</div>
777:                                 <div style="font-size: 14px; font-weight: 700; color: var(--cyan);">${successRate}%</div>
778:                             </div>
779:                             <div>
780:                                 <div style="font-size: 9px; color: var(--text-3); text-transform: uppercase; font-weight: 700;">Duration</div>
781:                                 <div style="font-size: 14px; font-weight: 700; color: var(--purple);">${durationSec}s</div>
782:                             </div>
783:                         </div>
784:                     ` : `
785:                         <div style="font-size: 11px; color: var(--text-3); margin-top: 12px;">
786:                             Scheduled for: <strong>${new Date(b.scheduled_at).toLocaleString()}</strong>
787:                         </div>
788:                     `}
789:                     
790:                     ${failedListHtml}
791:                 </div>
792:             `;
793:         }).join('');
794:     } catch (e) {
795:         console.error('Error loading broadcasts:', e);
796:     }
797: }
798: 
799: // ── Dev Console Audit logs ────────────────────────────────────────────────────
800: async function loadAuditLogs() {
The above content does NOT show the entire file contents. If you need to view any lines of the file which were not shown to complete your task, call this tool again to view those lines.
