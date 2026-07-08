Created At: 2026-06-17T22:22:59Z
Completed At: 2026-06-17T22:22:59Z
File Path: `file:///home/ubuntu/zero-lab-bots/vivy/server/public/dashboard.js`
Total Lines: 1605
Total Bytes: 66514
Showing lines 935 to 965
The following code has been modified to include a line number before every line, in the format: <line_number>: <original_line>. Please note that any changes targeting the original code should remove the line number, colon, and leading space.
935:     const guildNameEl = document.getElementById('guildName');
936:     if (!textEl || !previewEl) return;
937: 
938:     const guildName = guildNameEl ? guildNameEl.textContent : 'Server';
939:     // Escape the user-controlled template and guildName before inserting as HTML
940:     const safeText = escapeHtml(textEl.value)
941:         .replace(/\{user\}/g,        `<span class="mention">@Username</span>`)
942:         .replace(/\{username\}/g,    '<b>Username</b>')
943:         .replace(/\{server\}/g,      `<b>${escapeHtml(guildName)}</b>`)
944:         .replace(/\{memberCount\}/g, '<b>1,245</b>');
945:     previewEl.innerHTML = safeText;
946: }
947: 
948: async function saveWelcomeSettings() {
949:     const data = {
950:         welcome_enabled:  document.getElementById('welcomeEnabled')?.checked || false,
951:         welcome_channel:  document.getElementById('welcomeChannel')?.value   || '',
952:         welcome_message:  document.getElementById('welcomeText')?.value      || '',
953:         welcome_bg_image: document.getElementById('welcomeBgImage')?.value   || '',
954:         leave_enabled:    document.getElementById('leaveEnabled')?.checked   || false,
955:         leave_channel:    document.getElementById('leaveChannel')?.value     || '',
956:         leave_message:    document.getElementById('leaveText')?.value        || '',
957:     };
958:     const ok = await saveModuleConfig('welcome', data);
959:     if (ok) showToast('Welcome & Leave settings saved!', 'success');
960: }
961: 
962: /* ---------- AutoMod Tab ---------- */
963: function loadAutoModTab(config, antilinkConfig, guildSettingsConfig) {
964:     if (!config) return;
965:     const cb = (id, val) => { const el = document.getElementById(id); if (el) el.checked = val; };
The above content does NOT show the entire file contents. If you need to view any lines of the file which were not shown to complete your task, call this tool again to view those lines.
