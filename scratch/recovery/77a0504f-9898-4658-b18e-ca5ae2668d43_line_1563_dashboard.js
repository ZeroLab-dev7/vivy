Created At: 2026-06-17T22:34:46Z
Completed At: 2026-06-17T22:34:46Z
File Path: `file:///home/ubuntu/zero-lab-bots/vivy/server/public/developer.js`
Total Lines: 842
Total Bytes: 34960
Showing lines 1 to 800
The following code has been modified to include a line number before every line, in the format: <line_number>: <original_line>. Please note that any changes targeting the original code should remove the line number, colon, and leading space.
1: /* ============================================================
2:    Vivy Developer Portal — Interactivity & Canvas Charting
3:    ============================================================ */
4: 
5: let activeTab = 'dashboard';
6: let statsInterval = null;
7: let currentConfirmAction = null;
8: 
9: // On startup
10: document.addEventListener('DOMContentLoaded', () => {
11:     checkDevAuth();
12:     switchTab('dashboard');
13:     startRealtimeStats();
14: });
15: 
16: // Verify authentication and load safe user metadata
17: async function checkDevAuth() {
18:     try {
19:         const res = await fetch('/auth/discord/user');
20:         if (!res.ok) window.location.href = '/auth/discord/login?returnTo=/developer';
21:         const data = await res.json();
22:         if (!data.authenticated) {
23:             window.location.href = '/auth/discord/login?returnTo=/developer';
24:         }
25:         
26:         // Populate profile chip
27:         const avatarEl = document.getElementById('userAvatar');
28:         const nameEl = document.getElementById('username');
29:         if (avatarEl && data.user.avatar) {
30:             avatarEl.src = `https://cdn.discordapp.com/avatars/${data.user.id}/${data.user.avatar}.png`;
31:         }
32:         if (nameEl) nameEl.textContent = data.user.username;
33:     } catch (err) {
34:         console.error('Auth verification error:', err);
35:     }
36: }
37: 
38: // Switching panel sections
39: function switchTab(tabId) {
40:     activeTab = tabId;
41:     
42:     // Reset active classes in sidebar
43:     document.qu
<truncated 33917 bytes>
 if (res.ok) {
761:                 const data = await res.json();
762:                 showToast(`Maintenance mode toggled to: ${data.maintenance}`, 'success');
763:                 updateMaintenanceUI(data.maintenance);
764:             } else {
765:                 showToast('Failed to toggle maintenance state', 'error');
766:             }
767:         } catch {
768:             showToast('Request failed', 'error');
769:         }
770:     });
771: }
772: 
773: // ── Bot Operations Console Modal ──────────────────────────────────────────────
774: function confirmBotAction(action, message, onConfirmCallback = null) {
775:     currentConfirmAction = onConfirmCallback || async function() {
776:         try {
777:             showToast('Executing bot action...', 'info');
778:             const res = await fetch('/api/developer/bot-controls', {
779:                 method: 'POST',
780:                 headers: { 'Content-Type': 'application/json' },
781:                 body: JSON.stringify({ action })
782:             });
783:             if (res.ok) {
784:                 const data = await res.json();
785:                 showToast(data.message || 'Operation executed successfully!', 'success');
786:                 loadMaintenanceStatus();
787:             } else {
788:                 showToast('Action execution failed', 'error');
789:             }
790:         } catch {
791:             showToast('Request failed', 'error');
792:         }
793:     };
794: 
795:     document.getElementById('confirmModalMsg').textContent = message;
796:     document.getElementById('confirmModal').classList.add('active');
797: }
798: 
799: // Bind modal trigger buttons
800: document.getElementById('confirmModalBtn')?.addEventListener('click', () => {
The above content does NOT show the entire file contents. If you need to view any lines of the file which were not shown to complete your task, call this tool again to view those lines.
