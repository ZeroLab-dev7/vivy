Created At: 2026-06-17T22:16:03Z
Completed At: 2026-06-17T22:16:03Z
File Path: `file:///home/ubuntu/zero-lab-bots/vivy/server/public/dashboard.html`
Total Lines: 1164
Total Bytes: 72604
Showing lines 105 to 140
The following code has been modified to include a line number before every line, in the format: <line_number>: <original_line>. Please note that any changes targeting the original code should remove the line number, colon, and leading space.
105:                 <i class="fa-solid fa-file-pen"></i> Apply Panel
106:             </div>
107:             <div class="sidebar-item" id="nav-economy" onclick="switchTab('economy')">
108:                 <i class="fa-solid fa-coins"></i> Economy Shop
109:             </div>
110:             <div class="sidebar-item" id="nav-giveaways" onclick="switchTab('giveaways')">
111:                 <i class="fa-solid fa-gift"></i> Giveaways
112:             </div>
113:             <div class="sidebar-item" id="nav-rooms" onclick="switchTab('rooms')">
114:                 <i class="fa-solid fa-comments"></i> Need Help Rooms
115:             </div>
116: 
117:             <span class="sidebar-section-label">Advanced</span>
118:             <div class="sidebar-item" id="nav-commands" onclick="switchTab('commands')">
119:                 <i class="fa-solid fa-code"></i> Custom Commands
120:             </div>
121:             <div class="sidebar-item" id="nav-apikeys" onclick="switchTab('apikeys')">
122:                 <i class="fa-solid fa-key"></i> API Keys
123:             </div>
124:             <div class="sidebar-item" id="nav-premium" onclick="switchTab('premium')">
125:                 <i class="fa-solid fa-gem"></i> Premium Plan
126:             </div>
127:         </aside>
128: 
129:         <!-- Main -->
130:         <main class="dash-main">
131: 
132:             <!-- ── OVERVIEW TAB ── -->
133:             <section class="dash-tab active" id="tab-overview">
134:                 <div class="page-header">
135:                     <h1><span class="gradient-text">Server</span> Overview</h1>
136:                     <p>Real-time stats and recent activity for your Discord server.</p>
137:                 </div>
138: 
139:                 <div class="stats-row">
140:                     <div class="stat-card">
The above content does NOT show the entire file contents. If you need to view any lines of the file which were not shown to complete your task, call this tool again to view those lines.
