Created At: 2026-06-16T15:17:05Z
Completed At: 2026-06-16T15:17:05Z
File Path: `file:///home/ubuntu/zero-lab-bots/vivy/server/public/dashboard.html`
Total Lines: 747
Total Bytes: 43264
Showing lines 50 to 115
The following code has been modified to include a line number before every line, in the format: <line_number>: <original_line>. Please note that any changes targeting the original code should remove the line number, colon, and leading space.
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
68:             <div class="sidebar-item" id="nav-warn" onclick="switchTab('warn')">
69:                 <i class="fa-solid fa-triangle-exclamation"></i> Warn System
70:             </div>
71:             <div class="sidebar-item" id="nav-mute" onclick="switchTab('mute')">
72:                 <i class="fa-solid fa-microphone-slash"></i> Mute System
73:             </div>
74:             <div class="sidebar-item" id="nav-jail" onclick="switchTab('jail')">
75:                 <i class="fa-solid fa-lock"></i> Jail System
76:             </div>
77:             <div class="sidebar-it
<truncated 182 bytes>
r-section-label">Community</span>
82:             <div class="sidebar-item" id="nav-verification" onclick="switchTab('verification')">
83:                 <i class="fa-solid fa-user-check"></i> Verification
84:             </div>
85:             <div class="sidebar-item" id="nav-apply" onclick="switchTab('apply')">
86:                 <i class="fa-solid fa-file-pen"></i> Apply Panel
87:             </div>
88:             <div class="sidebar-item" id="nav-economy" onclick="switchTab('economy')">
89:                 <i class="fa-solid fa-coins"></i> Economy Shop
90:             </div>
91:             <div class="sidebar-item" id="nav-giveaways" onclick="switchTab('giveaways')">
92:                 <i class="fa-solid fa-gift"></i> Giveaways
93:             </div>
94: 
95:             <span class="sidebar-section-label">Advanced</span>
96:             <div class="sidebar-item" id="nav-commands" onclick="switchTab('commands')">
97:                 <i class="fa-solid fa-code"></i> Custom Commands
98:             </div>
99:             <div class="sidebar-item" id="nav-apikeys" onclick="switchTab('apikeys')">
100:                 <i class="fa-solid fa-key"></i> API Keys
101:             </div>
102:             <div class="sidebar-item" id="nav-premium" onclick="switchTab('premium')">
103:                 <i class="fa-solid fa-gem"></i> Premium Plan
104:             </div>
105:         </aside>
106: 
107:         <!-- Main -->
108:         <main class="dash-main">
109: 
110:             <!-- ── OVERVIEW TAB ── -->
111:             <section class="dash-tab active" id="tab-overview">
112:                 <div class="page-header">
113:                     <h1><span class="gradient-text">Server</span> Overview</h1>
114:                     <p>Real-time stats and recent activity for your Discord server.</p>
115:                 </div>
The above content does NOT show the entire file contents. If you need to view any lines of the file which were not shown to complete your task, call this tool again to view those lines.
