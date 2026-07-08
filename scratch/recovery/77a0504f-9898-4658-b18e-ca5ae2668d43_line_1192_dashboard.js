Created At: 2026-06-17T22:16:50Z
Completed At: 2026-06-17T22:16:51Z
File Path: `file:///home/ubuntu/zero-lab-bots/vivy/server/public/dashboard.js`
Total Lines: 1605
Total Bytes: 66514
Showing lines 860 to 900
The following code has been modified to include a line number before every line, in the format: <line_number>: <original_line>. Please note that any changes targeting the original code should remove the line number, colon, and leading space.
860: }
861: 
862: async function saveAntiBot() {
863:     const ok = await saveModuleConfig('antibot', {
864:         is_enabled: document.getElementById('antibotEnabled')?.checked || false,
865:         log_channel_id: document.getElementById('antibotLogChannel')?.value || null
866:     });
867:     if (ok) showToast('Anti-Bot settings saved!', 'success');
868: }
869: 
870: async function saveAntiWebhook() {
871:     const ok = await saveModuleConfig('antiwebhook', {
872:         is_enabled: document.getElementById('antiwebhookEnabled')?.checked || false,
873:         log_channel_id: document.getElementById('antiwebhookLogChannel')?.value || null
874:     });
875:     if (ok) showToast('Anti-Webhook settings saved!', 'success');
876: }
877: 
878: async function saveRooms() {
879:     const staffRole = document.getElementById('roomStaffRole')?.value;
880:     const ok = await saveModuleConfig('rooms', {
881:         join_channel: document.getElementById('roomJoinChannel')?.value || null,
882:         room_category: document.getElementById('roomCategory')?.value || null,
883:         log_channel: document.getElementById('roomLogChannel')?.value || null,
884:         staff_role: staffRole ? JSON.stringify([staffRole]) : '[]',
885:         manager_role: document.getElementById('roomManagerRole')?.value || null
886:     });
887:     if (ok) showToast('Room setup saved!', 'success');
888: }
889: 
890: async function saveLogs() {
891:     const keys = [
892:         'welcome', 'leave', 'nickname', 'role-given', 'role-remove',
893:         'role-update', 'ban', 'messages', 'voice-join', 'channels',
894:         'unban', 'kick', 'timeout', 'role-create', 'role-delete',
895:         'emojis', 'invites', 'voice-leave', 'voice-move', 'voice-mute',
896:         'voice-deafen', 'voice-disconnect'
897:     ];
898:     const channels = {};
899:     keys.forEach(key => {
900:         const val = document.getElementById(`logChan_${key}`)?.value;
The above content does NOT show the entire file contents. If you need to view any lines of the file which were not shown to complete your task, call this tool again to view those lines.
