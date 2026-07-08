Created At: 2026-06-16T15:14:21Z
Completed At: 2026-06-16T15:14:22Z
File Path: `file:///home/ubuntu/zero-lab-bots/vivy/server/public/dashboard.js`
Total Lines: 604
Total Bytes: 26219
Showing lines 101 to 250
The following code has been modified to include a line number before every line, in the format: <line_number>: <original_line>. Please note that any changes targeting the original code should remove the line number, colon, and leading space.
101:         fetchAuditLogs();
102: 
103:     } catch (e) {
104:         console.error('Dashboard Init Error:', e);
105:         showToast('Error loading dashboard configuration.', 'error');
106:     }
107: }
108: 
109: /* ---------- Populate Dropdowns ---------- */
110: function populateSelectors() {
111:     const textChans = guildChannels.filter(c => c.type === 0);
112:     const allRoles  = guildRoles;
113: 
114:     const chanIds = [
115:         'welcomeChannel','leaveChannel','giveawayChannel','amLogChannel',
116:         'warnLogsChannel','muteMuteLogsChannel','jailLogsChannel','verLogsChannel',
117:         'applyChannel','applyStaffChannel','applyLogChannel'
118:     ];
119:     chanIds.forEach(id => {
120:         const el = document.getElementById(id);
121:         if (!el) return;
122:         el.innerHTML = '<option value="">Select a channel…</option>';
123:         textChans.forEach(ch => { el.innerHTML += `<option value="${ch.id}">#${ch.name}</option>`; });
124:     });
125: 
126:     const roleIds = [
127:         'shopItemRole',
128:         'warnWarnerRole','muteMuteRole','jailJailedRole','jailJailerRole',
129:         'verVerificatorRole','verUnverifiedRole','verVerifiedRole','verVerifiedFemaleRole',
130:         'applyStaffRole','applyRoleStaff','applyRoleDesigner','applyRoleEvent','applyRolePartnership'
131:     ];
132:     roleIds.forEach(id => {
133:         const el = document.getElementById(id);
134:         if (!el) return;
135:         el.innerHTML = '<option value="">Select a role…</option>';
136:         allRoles.forEach(r => { el.innerHT
<truncated 4672 bytes>
l,
221:     });
222:     if (ok) showToast('Jail system saved!', 'success');
223: }
224: async function saveMute() {
225:     const ok = await saveModuleConfig('mute', {
226:         mute_role_id:      document.getElementById('muteMuteRole')?.value        || null,
227:         mute_logs_channel: document.getElementById('muteMuteLogsChannel')?.value || null,
228:     });
229:     if (ok) showToast('Mute system saved!', 'success');
230: }
231: async function saveVerification() {
232:     const ok = await saveModuleConfig('verification', {
233:         verificator_role:     document.getElementById('verVerificatorRole')?.value    || null,
234:         unverified_role:      document.getElementById('verUnverifiedRole')?.value     || null,
235:         verified_role:        document.getElementById('verVerifiedRole')?.value       || null,
236:         verified_female_role: document.getElementById('verVerifiedFemaleRole')?.value || null,
237:         verification_logs:    document.getElementById('verLogsChannel')?.value        || null,
238:     });
239:     if (ok) showToast('Verification system saved!', 'success');
240: }
241: async function saveAntiLink() {
242:     const wlChan = Array.from(document.getElementById('antilinkWlChannels')?.selectedOptions || []).map(o => o.value);
243:     const wlRole = Array.from(document.getElementById('antilinkWlRoles')?.selectedOptions    || []).map(o => o.value);
244:     const ok = await saveModuleConfig('antilink', {
245:         is_enabled:         document.getElementById('antilinkEnabled')?.checked || false,
246:         action:             document.getElementById('antilinkAction')?.value    || 'delete',
247:         whitelist_channels: JSON.stringify(wlChan),
248:         whitelist_roles:    JSON.stringify(wlRole),
249:     });
250:     if (ok) showToast('Anti-Link settings saved!', 'success');
The above content does NOT show the entire file contents. If you need to view any lines of the file which were not shown to complete your task, call this tool again to view those lines.
