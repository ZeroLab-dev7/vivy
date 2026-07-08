Created At: 2026-06-17T00:23:53Z
Completed At: 2026-06-17T00:23:53Z
File Path: `file:///home/ubuntu/zero-lab-bots/vivy/server/public/dashboard.js`
Total Lines: 1074
Total Bytes: 43818
Showing lines 805 to 830
The following code has been modified to include a line number before every line, in the format: <line_number>: <original_line>. Please note that any changes targeting the original code should remove the line number, colon, and leading space.
805:     `;
806: }
807: 
808: /* ---------- Save Helper ---------- */
809: async function saveModuleConfig(moduleName, data) {
810:     try {
811:         const res = await fetch(`/api/guilds/${activeGuildId}/config/${moduleName}`, {
812:             method: 'POST',
813:             headers: { 'Content-Type': 'application/json' },
814:             body: JSON.stringify(data)
815:         });
816:         if (res.ok) return true;
817:         const err = await res.json().catch(() => ({}));
818:         showToast(err.error || 'Save failed.', 'error');
819:         return false;
820:     } catch {
821:         showToast('Network error.', 'error');
822:         return false;
823:     }
824: }
825: 
826: /* ---------- Unified Custom Select Component ---------- */
827: function initCustomSelect(select) {
828:     if (!select || select.dataset.customSelectInit) return;
829:     select.dataset.customSelectInit = 'true';
830: 
The above content does NOT show the entire file contents. If you need to view any lines of the file which were not shown to complete your task, call this tool again to view those lines.
