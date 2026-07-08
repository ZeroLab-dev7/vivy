Created At: 2026-06-17T01:06:04Z
Completed At: 2026-06-17T01:06:04Z
File Path: `file:///home/ubuntu/zero-lab-bots/vivy/server/public/dashboard.js`
Total Lines: 1126
Total Bytes: 46595
Showing lines 406 to 430
The following code has been modified to include a line number before every line, in the format: <line_number>: <original_line>. Please note that any changes targeting the original code should remove the line number, colon, and leading space.
406:         is_enabled:         document.getElementById('antilinkEnabled')?.checked || false,
407:         action:             document.getElementById('antilinkAction')?.value    || 'delete',
408:         whitelist_channels: JSON.stringify(wlChan),
409:         whitelist_roles:    JSON.stringify(wlRole),
410:     });
411:     if (ok) showToast('Anti-Link settings saved!', 'success');
412: }
413: async function saveApply() {
414:     const ok = await saveModuleConfig('apply', {
415:         apply_channel_id:    document.getElementById('applyChannel')?.value          || null,
416:         staff_channel_id:    document.getElementById('applyStaffChannel')?.value     || null,
417:         log_channel_id:      document.getElementById('applyLogChannel')?.value       || null,
418:         staff_role_id:       document.getElementById('applyStaffRole')?.value        || null,
419:         role_staff_id:       document.getElementById('applyRoleStaff')?.value        || null,
420:         role_designer_id:    document.getElementById('applyRoleDesigner')?.value     || null,
421:         role_event_id:       document.getElementById('applyRoleEvent')?.value        || null,
422:         role_partnership_id: document.getElementById('applyRolePartnership')?.value  || null,
423:         banner_url:          document.getElementById('applyBanner')?.value           || null,
424:     });
425:     if (ok) showToast('Apply panel saved!', 'success');
426: }
427: 
428: async function saveAutoRole() {
429:     const roles = Array.from(document.getElementById('autoroleRoles')?.selectedOptions || []).map(o => o.value);
430:     const ok = await saveModuleConfig('autorole', {
The above content does NOT show the entire file contents. If you need to view any lines of the file which were not shown to complete your task, call this tool again to view those lines.
