Created At: 2026-06-17T00:22:04Z
Completed At: 2026-06-17T00:22:04Z
File Path: `file:///home/ubuntu/zero-lab-bots/vivy/server/public/dashboard.js`
Total Lines: 1074
Total Bytes: 43818
Showing lines 380 to 415
The following code has been modified to include a line number before every line, in the format: <line_number>: <original_line>. Please note that any changes targeting the original code should remove the line number, colon, and leading space.
380:     });
381:     if (ok) showToast('Mute system saved!', 'success');
382: }
383: async function saveVerification() {
384:     const ok = await saveModuleConfig('verification', {
385:         verificator_role:     document.getElementById('verVerificatorRole')?.value    || null,
386:         unverified_role:      document.getElementById('verUnverifiedRole')?.value     || null,
387:         verified_role:        document.getElementById('verVerifiedRole')?.value       || null,
388:         verified_female_role: document.getElementById('verVerifiedFemaleRole')?.value || null,
389:         verification_logs:    document.getElementById('verLogsChannel')?.value        || null,
390:     });
391:     if (ok) showToast('Verification system saved!', 'success');
392: }
393: async function saveAntiLink() {
394:     const wlChan = Array.from(document.getElementById('antilinkWlChannels')?.selectedOptions || []).map(o => o.value);
395:     const wlRole = Array.from(document.getElementById('antilinkWlRoles')?.selectedOptions    || []).map(o => o.value);
396:     const ok = await saveModuleConfig('antilink', {
397:         is_enabled:         document.getElementById('antilinkEnabled')?.checked || false,
398:         action:             document.getElementById('antilinkAction')?.value    || 'delete',
399:         whitelist_channels: JSON.stringify(wlChan),
400:         whitelist_roles:    JSON.stringify(wlRole),
401:     });
402:     if (ok) showToast('Anti-Link settings saved!', 'success');
403: }
404: async function saveApply() {
405:     const ok = await saveModuleConfig('apply', {
406:         apply_channel_id:    document.getElementById('applyChannel')?.value          || null,
407:         staff_channel_id:    document.getElementById('applyStaffChannel')?.value     || null,
408:         log_channel_id:      document.getElementById('applyLogChannel')?.value       || null,
409:         staff_role_id:       document.getElementById('applyStaffRole')?.value        || null,
410:         role_staff_id:       document.getElementById('applyRoleStaff')?.value        || null,
411:         role_designer_id:    document.getElementById('applyRoleDesigner')?.value     || null,
412:         role_event_id:       document.getElementById('applyRoleEvent')?.value        || null,
413:         role_partnership_id: document.getElementById('applyRolePartnership')?.value  || null,
414:         banner_url:          document.getElementById('applyBanner')?.value           || null,
415:     });
The above content does NOT show the entire file contents. If you need to view any lines of the file which were not shown to complete your task, call this tool again to view those lines.
