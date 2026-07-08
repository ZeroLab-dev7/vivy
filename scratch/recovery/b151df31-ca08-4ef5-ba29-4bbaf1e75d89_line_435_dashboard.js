Created At: 2026-06-16T15:18:00Z
Completed At: 2026-06-16T15:18:00Z
File Path: `file:///home/ubuntu/zero-lab-bots/vivy/server/public/dashboard.js`
Total Lines: 687
Total Bytes: 29590
Showing lines 300 to 340
The following code has been modified to include a line number before every line, in the format: <line_number>: <original_line>. Please note that any changes targeting the original code should remove the line number, colon, and leading space.
300:     const ok = await saveModuleConfig('jail', {
301:         jailed_role_id:  document.getElementById('jailJailedRole')?.value  || null,
302:         jailer_role_id:  document.getElementById('jailJailerRole')?.value  || null,
303:         logs_channel_id: document.getElementById('jailLogsChannel')?.value || null,
304:     });
305:     if (ok) showToast('Jail system saved!', 'success');
306: }
307: async function saveMute() {
308:     const ok = await saveModuleConfig('mute', {
309:         mute_role_id:      document.getElementById('muteMuteRole')?.value        || null,
310:         mute_logs_channel: document.getElementById('muteMuteLogsChannel')?.value || null,
311:     });
312:     if (ok) showToast('Mute system saved!', 'success');
313: }
314: async function saveVerification() {
315:     const ok = await saveModuleConfig('verification', {
316:         verificator_role:     document.getElementById('verVerificatorRole')?.value    || null,
317:         unverified_role:      document.getElementById('verUnverifiedRole')?.value     || null,
318:         verified_role:        document.getElementById('verVerifiedRole')?.value       || null,
319:         verified_female_role: document.getElementById('verVerifiedFemaleRole')?.value || null,
320:         verification_logs:    document.getElementById('verLogsChannel')?.value        || null,
321:     });
322:     if (ok) showToast('Verification system saved!', 'success');
323: }
324: async function saveAntiLink() {
325:     const wlChan = Array.from(document.getElementById('antilinkWlChannels')?.selectedOptions || []).map(o => o.value);
326:     const wlRole = Array.from(document.getElementById('antilinkWlRoles')?.selectedOptions    || []).map(o => o.value);
327:     const ok = await saveModuleConfig('antilink', {
328:         is_enabled:         document.getElementById('antilinkEnabled')?.checked || false,
329:         action:             document.getElementById('antilinkAction')?.value    || 'delete',
330:         whitelist_channels: JSON.stringify(wlChan),
331:         whitelist_roles:    JSON.stringify(wlRole),
332:     });
333:     if (ok) showToast('Anti-Link settings saved!', 'success');
334: }
335: async function saveApply() {
336:     const ok = await saveModuleConfig('apply', {
337:         apply_channel_id:    document.getElementById('applyChannel')?.value          || null,
338:         staff_channel_id:    document.getElementById('applyStaffChannel')?.value     || null,
339:         log_channel_id:      document.getElementById('applyLogChannel')?.value       || null,
340:         staff_role_id:       document.getElementById('applyStaffRole')?.value        || null,
The above content does NOT show the entire file contents. If you need to view any lines of the file which were not shown to complete your task, call this tool again to view those lines.
