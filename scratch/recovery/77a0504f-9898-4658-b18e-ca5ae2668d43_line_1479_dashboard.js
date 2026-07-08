Created At: 2026-06-17T22:31:41Z
Completed At: 2026-06-17T22:31:42Z
File Path: `file:///home/ubuntu/zero-lab-bots/vivy/server/public/dashboard.html`
Total Lines: 1164
Total Bytes: 72604
Showing lines 1 to 150
The following code has been modified to include a line number before every line, in the format: <line_number>: <original_line>. Please note that any changes targeting the original code should remove the line number, colon, and leading space.
1: <!DOCTYPE html>
2: <html lang="en">
3: <head>
4:     <meta charset="UTF-8">
5:     <meta name="viewport" content="width=device-width, initial-scale=1.0">
6:     <meta http-equiv="X-UA-Compatible" content="IE=edge">
7:     <meta name="referrer" content="strict-origin-when-cross-origin">
8:     <title>Dashboard — Vivy</title>
9:     <meta name="description" content="Configure and manage your Discord server with Vivy's control panel.">
10:     <link rel="preconnect" href="https://fonts.googleapis.com">
11:     <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
12:     <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Outfit:wght@600;700;800&display=swap" rel="stylesheet">
13:     <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
14:     <link rel="stylesheet" href="/dashboard.css?v=5">
15: </head>
16: <body>
17: 
18:     <!-- Grid lines overlay & background orbs -->
19:     <div class="bg-grid-overlay"></div>
20:     <div class="bg-orbs">
21:         <div class="orb orb-1"></div>
22:         <div class="orb orb-2"></div>
23:         <div class="orb orb-3"></div>
24:     </div>
25: 
26:     <!-- Topbar -->
27:     <nav class="dash-nav">
28:         <div class="dash-nav-logo">
29:             <a href="/servers" class="btn-logout btn-sm" style="border:none;padding:6px 10px;font-size:18px;">
30:                 <i class="fa-solid fa-chevron-left"></i>
31:             </a>
32:             <div class="logo-icon"><img src="/logo.png" alt="Vivy"></div>
33:             
<truncated 4448 bytes>

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
