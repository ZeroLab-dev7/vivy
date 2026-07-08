Created At: 2026-06-17T01:06:41Z
Completed At: 2026-06-17T01:06:41Z
File Path: `file:///home/ubuntu/zero-lab-bots/vivy/server/public/dashboard.js`
Total Lines: 1541
Total Bytes: 63889
Showing lines 825 to 845
The following code has been modified to include a line number before every line, in the format: <line_number>: <original_line>. Please note that any changes targeting the original code should remove the line number, colon, and leading space.
825:     });
826:     if (ok) showToast('Anti-Link settings saved!', 'success');
827: }
828: async function saveApply() {
829:     const ok = await saveModuleConfig('apply', {
830:         apply_channel_id:    document.getElementById('applyChannel')?.value          || null,
831:         staff_channel_id:    document.getElementById('applyStaffChannel')?.value     || null,
832:         log_channel_id:      document.getElementById('applyLogChannel')?.value       || null,
833:         staff_role_id:       document.getElementById('applyStaffRole')?.value        || null,
834:         role_staff_id:       document.getElementById('applyRoleStaff')?.value        || null,
835:         role_designer_id:    document.getElementById('applyRoleDesigner')?.value     || null,
836:         role_event_id:       document.getElementById('applyRoleEvent')?.value        || null,
837:         role_partnership_id: document.getElementById('applyRolePartnership')?.value  || null,
838:         banner_url:          document.getElementById('applyBanner')?.value           || null,
839:     });
840:     if (ok) showToast('Apply panel saved!', 'success');
841: }
842: 
843: async function saveAutoRole() {
844:     const roles = Array.from(document.getElementById('autoroleRoles')?.selectedOptions || []).map(o => o.value);
845:     const ok = await saveModuleConfig('autorole', {
The above content does NOT show the entire file contents. If you need to view any lines of the file which were not shown to complete your task, call this tool again to view those lines.
