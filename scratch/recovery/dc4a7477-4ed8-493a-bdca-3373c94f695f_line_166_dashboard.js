Created At: 2026-06-16T22:59:05Z
Completed At: 2026-06-16T22:59:06Z
File Path: `file:///home/ubuntu/zero-lab-bots/vivy/server/public/dashboard.html`
Total Lines: 923
Total Bytes: 55249
Showing lines 40 to 130
The following code has been modified to include a line number before every line, in the format: <line_number>: <original_line>. Please note that any changes targeting the original code should remove the line number, colon, and leading space.
40:         <div class="dash-nav-right">
41:             <div class="premium-chip" id="premiumChip" style="display:none">
42:                 <i class="fa-solid fa-crown"></i> Premium
43:             </div>
44:             <div class="user-chip" id="userChip">
45:                 <img src="https://cdn.discordapp.com/embed/avatars/0.png" alt="Avatar" id="userAvatar">
46:                 <span id="username">…</span>
47:             </div>
48:             <a href="/auth/discord/logout" class="btn-logout" id="logout-btn">
49:                 <i class="fa-solid fa-right-from-bracket"></i> Logout
50:             </a>
51:         </div>
52:     </nav>
53: 
54:     <!-- Shell -->
55:     <div class="dash-shell">
56: 
57:         <!-- Sidebar -->
58:         <aside class="dash-sidebar">
59:             <span class="sidebar-section-label">General</span>
60:             <div class="sidebar-item active" id="nav-overview" onclick="switchTab('overview')">
61:                 <i class="fa-solid fa-chart-line"></i> Overview
62:             </div>
63:             <div class="sidebar-item" id="nav-welcome" onclick="switchTab('welcome')">
64:                 <i class="fa-solid fa-door-open"></i> Welcome & Leave
65:             </div>
66:             <div class="sidebar-item" id="nav-autorole" onclick="switchTab('autorole')">
67:                 <i class="fa-solid fa-user-plus"></i> Auto Role
68:             </div>
69: 
70:             <span class="sidebar-section-label">Security</span>
71:             <div class="sidebar-item" id="nav-security" onclick="switchTab('security')">
72:       
<truncated 1364 bytes>
           <i class="fa-solid fa-book"></i> Server Logs
96:             </div>
97: 
98:             <span class="sidebar-section-label">Community</span>
99:             <div class="sidebar-item" id="nav-verification" onclick="switchTab('verification')">
100:                 <i class="fa-solid fa-user-check"></i> Verification
101:             </div>
102:             <div class="sidebar-item" id="nav-apply" onclick="switchTab('apply')">
103:                 <i class="fa-solid fa-file-pen"></i> Apply Panel
104:             </div>
105:             <div class="sidebar-item" id="nav-economy" onclick="switchTab('economy')">
106:                 <i class="fa-solid fa-coins"></i> Economy Shop
107:             </div>
108:             <div class="sidebar-item" id="nav-giveaways" onclick="switchTab('giveaways')">
109:                 <i class="fa-solid fa-gift"></i> Giveaways
110:             </div>
111:             <div class="sidebar-item" id="nav-rooms" onclick="switchTab('rooms')">
112:                 <i class="fa-solid fa-comments"></i> Need Help Rooms
113:             </div>
114: 
115:             <span class="sidebar-section-label">Advanced</span>
116:             <div class="sidebar-item" id="nav-commands" onclick="switchTab('commands')">
117:                 <i class="fa-solid fa-code"></i> Custom Commands
118:             </div>
119:             <div class="sidebar-item" id="nav-apikeys" onclick="switchTab('apikeys')">
120:                 <i class="fa-solid fa-key"></i> API Keys
121:             </div>
122:             <div class="sidebar-item" id="nav-premium" onclick="switchTab('premium')">
123:                 <i class="fa-solid fa-gem"></i> Premium Plan
124:             </div>
125:         </aside>
126: 
127:         <!-- Main -->
128:         <main class="dash-main">
129: 
130:             <!-- ── OVERVIEW TAB ── -->
The above content does NOT show the entire file contents. If you need to view any lines of the file which were not shown to complete your task, call this tool again to view those lines.
