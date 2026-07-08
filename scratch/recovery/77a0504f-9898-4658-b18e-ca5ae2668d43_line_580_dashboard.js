Created At: 2026-06-17T00:56:31Z
Completed At: 2026-06-17T00:56:31Z
File Path: `file:///home/ubuntu/zero-lab-bots/vivy/server/public/dashboard.html`
Total Lines: 932
Total Bytes: 55990
Showing lines 50 to 150
The following code has been modified to include a line number before every line, in the format: <line_number>: <original_line>. Please note that any changes targeting the original code should remove the line number, colon, and leading space.
50:             <a href="/auth/discord/logout" class="btn-logout" id="logout-btn">
51:                 <i class="fa-solid fa-right-from-bracket"></i> Logout
52:             </a>
53:         </div>
54:     </nav>
55: 
56:     <!-- Shell -->
57:     <div class="dash-shell">
58: 
59:         <!-- Sidebar -->
60:         <aside class="dash-sidebar">
61:             <span class="sidebar-section-label">General</span>
62:             <div class="sidebar-item active" id="nav-overview" onclick="switchTab('overview')">
63:                 <i class="fa-solid fa-chart-line"></i> Overview
64:             </div>
65:             <div class="sidebar-item" id="nav-welcome" onclick="switchTab('welcome')">
66:                 <i class="fa-solid fa-door-open"></i> Welcome & Leave
67:             </div>
68:             <div class="sidebar-item" id="nav-autorole" onclick="switchTab('autorole')">
69:                 <i class="fa-solid fa-user-plus"></i> Auto Role
70:             </div>
71: 
72:             <span class="sidebar-section-label">Security</span>
73:             <div class="sidebar-item" id="nav-security" onclick="switchTab('security')">
74:                 <i class="fa-solid fa-user-shield"></i> Security & Prefix
75:             </div>
76:             <div class="sidebar-item" id="nav-antilink" onclick="switchTab('antilink')">
77:                 <i class="fa-solid fa-link-slash"></i> Anti-Link
78:             </div>
79:             <div class="sidebar-item" id="nav-automod" onclick="switchTab('automod')">
80:                 <i class="fa-solid fa-shield-halved"></i> Auto Moderatio
<truncated 2015 bytes>

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
141:                         <div class="stat-icon cyan"><i class="fa-solid fa-users"></i></div>
142:                         <div class="stat-info">
143:                             <div class="stat-value" id="statMembers">—</div>
144:                             <div class="stat-label">Total Members</div>
145:                         </div>
146:                     </div>
147:                     <div class="stat-card">
148:                         <div class="stat-icon purple"><i class="fa-solid fa-shield-virus"></i></div>
149:                         <div class="stat-info">
150:                             <div class="stat-value" id="statBlocks">—</div>
The above content does NOT show the entire file contents. If you need to view any lines of the file which were not shown to complete your task, call this tool again to view those lines.
