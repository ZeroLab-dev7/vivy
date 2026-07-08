Created At: 2026-06-16T14:18:33Z
Completed At: 2026-06-16T14:18:33Z
File Path: `file:///home/ubuntu/zero-lab-bots/vivy/server/public/dashboard.js`
Total Lines: 438
Total Bytes: 16131
Showing lines 1 to 438
The following code has been modified to include a line number before every line, in the format: <line_number>: <original_line>. Please note that any changes targeting the original code should remove the line number, colon, and leading space.
1: // Client-side state
2: let activeGuildId = new URLSearchParams(window.location.search).get('guild');
3: let guildChannels = [];
4: let guildRoles = [];
5: let economyShopItems = [];
6: 
7: // Init Dashboard
8: async function initDashboard() {
9:     if (!activeGuildId) {
10:         window.location.href = '/selector.html';
11:         return;
12:     }
13: 
14:     try {
15:         // Load User Details
16:         const userRes = await fetch('/api/auth/user');
17:         const userData = await userRes.json();
18:         if (!userData.authenticated) {
19:             window.location.href = '/';
20:             return;
21:         }
22: 
23:         const avatarHash = userData.user.avatar;
24:         document.getElementById('userAvatar').src = avatarHash 
25:             ? `https://cdn.discordapp.com/avatars/${userData.user.id}/${avatarHash}.png`
26:             : `https://cdn.discordapp.com/embed/avatars/0.png`;
27: 
28:         // Fetch Guild Info and Configurations
29:         const guildRes = await fetch(`/api/guilds/${activeGuildId}`);
30:         if (!guildRes.ok) {
31:             showToast('Failed to fetch guild details.', 'error');
32:             setTimeout(() => window.location.href = '/selector.html', 2000);
33:             return;
34:         }
35: 
36:         const data = await guildRes.json();
37:         document.getElementById('guildTitle').innerText = data.guildName;
38: 
39:         guildChannels = data.channels;
40:         guildRoles = data.roles;
41: 
42:         // Populate dropdown channels and roles selectors
43:         populateSelectors();

<truncated 14648 bytes>
count}</text>
382:         `;
383:     });
384:     svgContent += `</svg>`;
385:     chart.innerHTML = svgContent;
386: }
387: 
388: // Save config helper
389: async function saveModuleConfig(moduleName, data) {
390:     try {
391:         const res = await fetch(`/api/guilds/${activeGuildId}/config/${moduleName}`, {
392:             method: 'POST',
393:             headers: { 'Content-Type': 'application/json' },
394:             body: JSON.stringify(data)
395:         });
396:         if (res.ok) {
397:             return true;
398:         } else {
399:             const err = await res.json();
400:             showToast(err.error || 'Failed to update configuration.', 'error');
401:             return false;
402:         }
403:     } catch (e) {
404:         showToast('Network synchronization error.', 'error');
405:         return false;
406:     }
407: }
408: 
409: // Toast alerts display
410: function showToast(message, type = 'info') {
411:     const container = document.getElementById('toastContainer');
412:     const toast = document.createElement('div');
413:     toast.className = `toast-alert toast-${type}`;
414:     
415:     const icons = {
416:         info: '<i class="fa-solid fa-circle-info"></i>',
417:         success: '<i class="fa-solid fa-circle-check"></i>',
418:         warning: '<i class="fa-solid fa-triangle-exclamation"></i>',
419:         error: '<i class="fa-solid fa-circle-xmark"></i>'
420:     };
421: 
422:     toast.innerHTML = `${icons[type]} <span>${message}</span>`;
423:     container.appendChild(toast);
424: 
425:     setTimeout(() => {
426:         toast.style.opacity = '1';
427:         toast.style.transform = 'translateY(0)';
428:     }, 100);
429: 
430:     setTimeout(() => {
431:         toast.style.opacity = '0';
432:         toast.style.transform = 'translateY(-20px)';
433:         setTimeout(() => toast.remove(), 400);
434:     }, 3500);
435: }
436: 
437: window.onload = initDashboard;
438: 
The above content shows the entire, complete file contents of the requested file.
