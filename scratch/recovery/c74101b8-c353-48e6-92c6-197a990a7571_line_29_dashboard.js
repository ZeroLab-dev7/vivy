Created At: 2026-06-18T22:18:44Z
Completed At: 2026-06-18T22:18:44Z
File Path: `file:///home/ubuntu/zero-lab-bots/vivy/server/public/dashboard.js`
Total Lines: 1637
Total Bytes: 67985
Showing lines 800 to 1000
The following code has been modified to include a line number before every line, in the format: <line_number>: <original_line>. Please note that any changes targeting the original code should remove the line number, colon, and leading space.
800:     try {
801:         channels = typeof c.channels === 'string' ? JSON.parse(c.channels) : (c.channels || {});
802:     } catch {}
803:     const keys = [
804:         'welcome', 'leave', 'nickname', 'role-given', 'role-remove',
805:         'role-update', 'ban', 'messages', 'voice-join', 'channels',
806:         'unban', 'kick', 'timeout', 'role-create', 'role-delete',
807:         'emojis', 'invites', 'voice-leave', 'voice-move', 'voice-mute',
808:         'voice-deafen', 'voice-disconnect'
809:     ];
810:     keys.forEach(key => {
811:         setVal(`logChan_${key}`, channels[key] || '');
812:     });
813: }
814: 
815: /* ---------- Save functions for new modules ---------- */
816: async function saveWarn() {
817:     const ok = await saveModuleConfig('warn', {
818:         warn_first:   document.getElementById('warnFirst')?.value       || null,
819:         warn_second:  document.getElementById('warnSecond')?.value      || null,
820:         warn_last:    document.getElementById('warnLast')?.value        || null,
821:         warner_role:  document.getElementById('warnWarnerRole')?.value  || null,
822:         warning_logs: document.getElementById('warnLogsChannel')?.value || null,
823:     });
824:     if (ok) showToast('Warn system saved!', 'success');
825: }
826: async function saveJail() {
827:     const ok = await saveModuleConfig('jail', {
828:         jailed_role_id:  document.getElementById('jailJailedRole')?.value  || null,
829:         jailer_role_id:  document.getElementById('jailJailerRole')?.value  || null,
830:         logs_channel_id: document
<truncated 7394 bytes>
) return;
969: 
970:     const guildName = guildNameEl ? guildNameEl.textContent : 'Server';
971:     // Escape the user-controlled template and guildName before inserting as HTML
972:     const safeText = escapeHtml(textEl.value)
973:         .replace(/\{user\}/g,        `<span class="mention">@Username</span>`)
974:         .replace(/\{username\}/g,    '<b>Username</b>')
975:         .replace(/\{server\}/g,      `<b>${escapeHtml(guildName)}</b>`)
976:         .replace(/\{memberCount\}/g, '<b>1,245</b>');
977:     previewEl.innerHTML = safeText;
978: }
979: 
980: async function saveWelcomeSettings() {
981:     const data = {
982:         welcome_enabled:  document.getElementById('welcomeEnabled')?.checked || false,
983:         welcome_channel:  document.getElementById('welcomeChannel')?.value   || '',
984:         welcome_message:  document.getElementById('welcomeText')?.value      || '',
985:         welcome_bg_image: document.getElementById('welcomeBgImage')?.value   || '',
986:         leave_enabled:    document.getElementById('leaveEnabled')?.checked   || false,
987:         leave_channel:    document.getElementById('leaveChannel')?.value     || '',
988:         leave_message:    document.getElementById('leaveText')?.value        || '',
989:     };
990:     const ok = await saveModuleConfig('welcome', data);
991:     if (ok) showToast('Welcome & Leave settings saved!', 'success');
992: }
993: 
994: /* ---------- AutoMod Tab ---------- */
995: function loadAutoModTab(config, antilinkConfig, guildSettingsConfig) {
996:     if (!config) return;
997:     const cb = (id, val) => { const el = document.getElementById(id); if (el) el.checked = val; };
998:     cb('amSpam',     config.spam_enabled     || false);
999:     cb('amLinks',    config.links_enabled    || false);
1000:     cb('amInvites',  config.invites_enabled  || false);
The above content does NOT show the entire file contents. If you need to view any lines of the file which were not shown to complete your task, call this tool again to view those lines.
