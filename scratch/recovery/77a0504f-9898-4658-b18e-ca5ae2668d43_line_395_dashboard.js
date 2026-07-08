Created At: 2026-06-17T00:44:00Z
Completed At: 2026-06-17T00:44:00Z
File Path: `file:///home/ubuntu/zero-lab-bots/vivy/server/public/dashboard.js`
Total Lines: 1076
Total Bytes: 44050
Showing lines 130 to 145
The following code has been modified to include a line number before every line, in the format: <line_number>: <original_line>. Please note that any changes targeting the original code should remove the line number, colon, and leading space.
130:         const data = await guildRes.json();
131: 
132:         const guildNameEl = document.getElementById('guildName');
133:         if (guildNameEl) guildNameEl.textContent = data.guildName || 'Server Dashboard';
134: 
135:         guildChannels = data.channels || [];
136:         guildRoles    = data.roles    || [];
137: 
138:         populateSelectors();
139:         loadWelcomeTab(data.configs?.welcome);
140:         loadAutoModTab(data.configs?.automod);
141:         loadEconomyTab(data.configs?.economy);
142:         loadAllModules(data.configs);
143: 
144:         // Switch to initial tab
145:         switchTab(initialTab, false);
The above content does NOT show the entire file contents. If you need to view any lines of the file which were not shown to complete your task, call this tool again to view those lines.
