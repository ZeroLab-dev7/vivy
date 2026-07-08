Created At: 2026-06-16T15:15:04Z
Completed At: 2026-06-16T15:15:04Z
File Path: `file:///home/ubuntu/zero-lab-bots/vivy/server/public/dashboard.html`
Total Lines: 747
Total Bytes: 43264
Showing lines 35 to 150
The following code has been modified to include a line number before every line, in the format: <line_number>: <original_line>. Please note that any changes targeting the original code should remove the line number, colon, and leading space.
35:             </div>
36:             <div class="user-chip" id="userChip">
37:                 <img src="https://cdn.discordapp.com/embed/avatars/0.png" alt="Avatar" id="userAvatar">
38:                 <span id="username">…</span>
39:             </div>
40:             <a href="/auth/discord/logout" class="btn-logout" id="logout-btn">
41:                 <i class="fa-solid fa-right-from-bracket"></i> Logout
42:             </a>
43:         </div>
44:     </nav>
45: 
46:     <!-- Shell -->
47:     <div class="dash-shell">
48: 
49:         <!-- Sidebar -->
50:         <aside class="dash-sidebar">
51:             <span class="sidebar-section-label">General</span>
52:             <div class="sidebar-item active" id="nav-overview" onclick="switchTab('overview')">
53:                 <i class="fa-solid fa-chart-line"></i> Overview
54:             </div>
55:             <div class="sidebar-item" id="nav-welcome" onclick="switchTab('welcome')">
56:                 <i class="fa-solid fa-door-open"></i> Welcome & Leave
57:             </div>
58: 
59:             <span class="sidebar-section-label">Security</span>
60:             <div class="sidebar-item" id="nav-antilink" onclick="switchTab('antilink')">
61:                 <i class="fa-solid fa-link-slash"></i> Anti-Link
62:             </div>
63:             <div class="sidebar-item" id="nav-automod" onclick="switchTab('automod')">
64:                 <i class="fa-solid fa-shield-halved"></i> Auto Moderation
65:             </div>
66: 
67:             <span class="sidebar-section-label">Moderation</span>
68:             <di
<truncated 2763 bytes>
an"><i class="fa-solid fa-users"></i></div>
120:                         <div class="stat-info">
121:                             <div class="stat-value" id="statMembers">—</div>
122:                             <div class="stat-label">Total Members</div>
123:                         </div>
124:                     </div>
125:                     <div class="stat-card">
126:                         <div class="stat-icon purple"><i class="fa-solid fa-shield-virus"></i></div>
127:                         <div class="stat-info">
128:                             <div class="stat-value" id="statBlocks">—</div>
129:                             <div class="stat-label">AutoMod Blocks Today</div>
130:                         </div>
131:                     </div>
132:                     <div class="stat-card">
133:                         <div class="stat-icon green"><i class="fa-solid fa-ticket"></i></div>
134:                         <div class="stat-info">
135:                             <div class="stat-value" id="statTickets">—</div>
136:                             <div class="stat-label">Open Tickets</div>
137:                         </div>
138:                     </div>
139:                     <div class="stat-card">
140:                         <div class="stat-icon amber"><i class="fa-solid fa-ranking-star"></i></div>
141:                         <div class="stat-info">
142:                             <div class="stat-value" id="statMessages">—</div>
143:                             <div class="stat-label">Messages Today</div>
144:                         </div>
145:                     </div>
146:                 </div>
147: 
148:                 <div class="chart-card">
149:                     <div class="chart-header">
150:                         <span class="chart-title">Member Activity — Last 7 Days</span>
The above content does NOT show the entire file contents. If you need to view any lines of the file which were not shown to complete your task, call this tool again to view those lines.
