Created At: 2026-06-16T23:18:47Z
Completed At: 2026-06-16T23:18:47Z
File Path: `file:///home/ubuntu/zero-lab-bots/vivy/server/public/dashboard.html`
Total Lines: 923
Total Bytes: 55233
Showing lines 1 to 150
The following code has been modified to include a line number before every line, in the format: <line_number>: <original_line>. Please note that any changes targeting the original code should remove the line number, colon, and leading space.
1: <!DOCTYPE html>
2: <html lang="en">
3: <head>
4:     <meta charset="UTF-8">
5:     <meta name="viewport" content="width=device-width, initial-scale=1.0">
6:     <title>Dashboard — Vivy</title>
7:     <meta name="description" content="Configure and manage your Discord server with Vivy's control panel.">
8:     <link rel="preconnect" href="https://fonts.googleapis.com">
9:     <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
10:     <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Outfit:wght@600;700;800&display=swap" rel="stylesheet">
11:     <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
12:     <link rel="stylesheet" href="dashboard.css?v=5">
13: </head>
14: <body>
15: 
16:     <!-- Grid lines overlay & background orbs -->
17:     <div class="bg-grid-overlay"></div>
18:     <div class="bg-orbs">
19:         <div class="orb orb-1"></div>
20:         <div class="orb orb-2"></div>
21:         <div class="orb orb-3"></div>
22:     </div>
23: 
24:     <!-- Topbar -->
25:     <nav class="dash-nav">
26:         <div class="dash-nav-logo">
27:             <a href="/selector.html" class="btn-logout btn-sm" style="border:none;padding:6px 10px;font-size:18px;">
28:                 <i class="fa-solid fa-chevron-left"></i>
29:             </a>
30:             <div class="logo-icon"><img src="logo.png" alt="Vivy"></div>
31:             <span class="logo-text">Vivy</span>
32:         </div>
33:         <div class="dash-nav-center">
34:             <div class="nav-bre
<truncated 4434 bytes>
-commands" onclick="switchTab('commands')">
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
131:             <section class="dash-tab active" id="tab-overview">
132:                 <div class="page-header">
133:                     <h1><span class="gradient-text">Server</span> Overview</h1>
134:                     <p>Real-time stats and recent activity for your Discord server.</p>
135:                 </div>
136: 
137:                 <div class="stats-row">
138:                     <div class="stat-card">
139:                         <div class="stat-icon cyan"><i class="fa-solid fa-users"></i></div>
140:                         <div class="stat-info">
141:                             <div class="stat-value" id="statMembers">—</div>
142:                             <div class="stat-label">Total Members</div>
143:                         </div>
144:                     </div>
145:                     <div class="stat-card">
146:                         <div class="stat-icon purple"><i class="fa-solid fa-shield-virus"></i></div>
147:                         <div class="stat-info">
148:                             <div class="stat-value" id="statBlocks">—</div>
149:                             <div class="stat-label">AutoMod Blocks Today</div>
150:                         </div>
The above content does NOT show the entire file contents. If you need to view any lines of the file which were not shown to complete your task, call this tool again to view those lines.
