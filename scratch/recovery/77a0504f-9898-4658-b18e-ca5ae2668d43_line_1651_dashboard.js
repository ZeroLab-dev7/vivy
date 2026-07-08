Created At: 2026-06-17T22:41:55Z
Completed At: 2026-06-17T22:41:55Z
File Path: `file:///home/ubuntu/zero-lab-bots/vivy/server/public/dashboard.html`
Total Lines: 1164
Total Bytes: 72604
Showing lines 1 to 100
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
<truncated 1646 bytes>
<div class="sidebar-item" id="nav-autorole" onclick="switchTab('autorole')">
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
91:                 <i class="fa-solid fa-lock"></i> Jail System
92:             </div>
93:             <div class="sidebar-item" id="nav-audit" onclick="switchTab('audit')">
94:                 <i class="fa-solid fa-list-check"></i> Audit Logs
95:             </div>
96:             <div class="sidebar-item" id="nav-logs" onclick="switchTab('logs')">
97:                 <i class="fa-solid fa-book"></i> Server Logs
98:             </div>
99: 
100:             <span class="sidebar-section-label">Community</span>
The above content does NOT show the entire file contents. If you need to view any lines of the file which were not shown to complete your task, call this tool again to view those lines.
