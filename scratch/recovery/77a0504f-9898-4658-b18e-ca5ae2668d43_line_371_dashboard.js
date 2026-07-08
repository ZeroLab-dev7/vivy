Created At: 2026-06-17T00:43:03Z
Completed At: 2026-06-17T00:43:03Z
File Path: `file:///home/ubuntu/zero-lab-bots/vivy/server/public/dashboard.html`
Total Lines: 925
Total Bytes: 55357
Showing lines 50 to 90
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
80:                 <i class="fa-solid fa-shield-halved"></i> Auto Moderation
81:             </div>
82: 
83:             <span class="sidebar-section-label">Moderation</span>
84:             <div class="sidebar-item" id="nav-warn" onclick="switchTab('warn')">
85:                 <i class="fa-solid fa-triangle-exclamation"></i> Warn System
86:             </div>
87:             <div class="sidebar-item" id="nav-mute" onclick="switchTab('mute')">
88:                 <i class="fa-solid fa-microphone-slash"></i> Mute System
89:             </div>
90:             <div class="sidebar-item" id="nav-jail" onclick="switchTab('jail')">
The above content does NOT show the entire file contents. If you need to view any lines of the file which were not shown to complete your task, call this tool again to view those lines.
