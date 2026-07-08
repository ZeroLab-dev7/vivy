Created At: 2026-06-16T22:55:53Z
Completed At: 2026-06-16T22:55:53Z
File Path: `file:///home/ubuntu/zero-lab-bots/vivy/server/public/dashboard.js`
Total Lines: 1024
Total Bytes: 41778
Showing lines 1 to 800
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
41:     const navEl = document.getElementById
<truncated 34158 bytes>
er ---------- */
759: async function saveModuleConfig(moduleName, data) {
760:     try {
761:         const res = await fetch(`/api/guilds/${activeGuildId}/config/${moduleName}`, {
762:             method: 'POST',
763:             headers: { 'Content-Type': 'application/json' },
764:             body: JSON.stringify(data)
765:         });
766:         if (res.ok) return true;
767:         const err = await res.json().catch(() => ({}));
768:         showToast(err.error || 'Save failed.', 'error');
769:         return false;
770:     } catch {
771:         showToast('Network error.', 'error');
772:         return false;
773:     }
774: }
775: 
776: /* ---------- Unified Custom Select Component ---------- */
777: function initCustomSelect(select) {
778:     if (!select || select.dataset.customSelectInit) return;
779:     select.dataset.customSelectInit = 'true';
780: 
781:     const selectId = select.id || 'select-' + Math.random().toString(36).substr(2, 9);
782:     if (!select.id) select.id = selectId;
783: 
784:     const isMultiple = select.multiple;
785:     const placeholder = select.getAttribute('placeholder') || 
786:                         (select.options[0] && select.options[0].value === '' ? select.options[0].text : '') || 
787:                         (isMultiple ? 'Select options…' : 'Select an option…');
788: 
789:     // Create wrapper
790:     const wrap = document.createElement('div');
791:     wrap.className = `custom-multiselect-wrap ${isMultiple ? 'is-multiple' : 'is-single'}`;
792:     wrap.id = `wrap-${selectId}`;
793: 
794:     const display = document.createElement('div');
795:     display.className = 'custom-multiselect-display';
796: 
797:     const tags = document.createElement('div');
798:     tags.className = 'custom-multiselect-tags';
799: 
800:     const singleVal = document.createElement('span');
The above content does NOT show the entire file contents. If you need to view any lines of the file which were not shown to complete your task, call this tool again to view those lines.
