Created At: 2026-06-16T16:19:52Z
Completed At: 2026-06-16T16:19:52Z
File Path: `file:///home/ubuntu/zero-lab-bots/vivy/server/public/dashboard.js`
Total Lines: 762
Total Bytes: 32648
Showing lines 740 to 762
The following code has been modified to include a line number before every line, in the format: <line_number>: <original_line>. Please note that any changes targeting the original code should remove the line number, colon, and leading space.
740: }
741: 
742: /* ---------- Save Helper ---------- */
743: async function saveModuleConfig(moduleName, data) {
744:     try {
745:         const res = await fetch(`/api/guilds/${activeGuildId}/config/${moduleName}`, {
746:             method: 'POST',
747:             headers: { 'Content-Type': 'application/json' },
748:             body: JSON.stringify(data)
749:         });
750:         if (res.ok) return true;
751:         const err = await res.json().catch(() => ({}));
752:         showToast(err.error || 'Save failed.', 'error');
753:         return false;
754:     } catch {
755:         showToast('Network error.', 'error');
756:         return false;
757:     }
758: }
759: 
760: /* ---------- Boot ---------- */
761: window.addEventListener('DOMContentLoaded', initDashboard);
762: 
The above content does NOT show the entire file contents. If you need to view any lines of the file which were not shown to complete your task, call this tool again to view those lines.
