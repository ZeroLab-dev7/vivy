const searchIndex = [
    { title: 'Quick Start Guide', path: 'Getting Started', page: 'getting-started', type: 'guide', snippet: 'Get Vivy running in your server in under 5 minutes. Default prefix is ?.' },
    { title: 'Inviting Vivy', path: 'Getting Started', page: 'invite', type: 'guide', snippet: 'Invite link, required permissions and role hierarchy.' },
    { title: 'Permissions Guide', path: 'Getting Started', page: 'permissions', type: 'guide', snippet: 'Which permissions Vivy needs and why each matters.' },
    { title: 'Logging In', path: 'Getting Started', page: 'login', type: 'guide', snippet: 'Connect your Discord account and access the dashboard.' },
    { title: 'Basic Configuration', path: 'Getting Started', page: 'basic-config', type: 'guide', snippet: 'First steps after inviting: prefix, welcome, logging, automod.' },
    { title: 'Dashboard Overview', path: 'Dashboard', page: 'dashboard-overview', type: 'guide', snippet: 'All 20 dashboard modules and how to navigate them.' },
    { title: 'Welcome Messages', path: 'Dashboard', page: 'welcome', type: 'guide', snippet: 'Custom join/leave messages and canvas background cards.' },
    { title: 'Auto Role', path: 'Dashboard', page: 'autorole', type: 'guide', snippet: 'Automatically assign roles when a member joins.' },
    { title: 'Security & Prefix', path: 'Dashboard', page: 'security', type: 'guide', snippet: 'Bot command prefix, Anti-Bot and Anti-Webhook defenses.' },
    { title: 'Anti-Link Shield', path: 'Dashboard', page: 'antilink', type: 'guide', snippet: 'URL domain whitelist and blacklist configuration.' },
    { title: 'Auto Moderation', path: 'Dashboard', page: 'automod', type: 'guide', snippet: 'Anti-spam, caps percentage limits, and raid protection.' },
    { title: 'Warnings Setup', path: 'Dashboard', page: 'warn-dash', type: 'guide', snippet: 'Configure warned roles and warning thresholds.' },
    { title: 'Mute Setup', path: 'Dashboard', page: 'mute-dash', type: 'guide', snippet: 'Mute role setup and logs channel routing.' },
    { title: 'Jail Setup', path: 'Dashboard', page: 'jail-dash', type: 'guide', snippet: 'Configure isolation roles and isolation jail channels.' },
    { title: 'Server Logs', path: 'Dashboard', page: 'logging', type: 'guide', snippet: 'Route server logs for message edits/deletions, member activity and voice.' },
    { title: 'Audit Logs', path: 'Dashboard', page: 'audit-logs', type: 'guide', snippet: 'Searchable list of all bot moderation actions.' },
    { title: 'Verification System', path: 'Dashboard', page: 'verification', type: 'guide', snippet: 'Member gate configuration for verified users.' },
    { title: 'Apply Panel', path: 'Dashboard', page: 'applications', type: 'guide', snippet: 'Build staff applications forms using Discord modals.' },
    { title: 'Economy Setup', path: 'Dashboard', page: 'economy', type: 'guide', snippet: 'Daily coin rewards, coin taxes, and shop items.' },
    { title: 'Leveling Setup', path: 'Dashboard', page: 'leveling', type: 'guide', snippet: 'XP calculations, role rewards, and leveling logs.' },
    { title: 'Giveaways', path: 'Dashboard', page: 'giveaways', type: 'guide', snippet: 'Create giveaways and configure user blacklists.' },
    { title: 'Need Help Rooms', path: 'Dashboard', page: 'rooms', type: 'guide', snippet: 'Dynamic voice support room generator.' },
    { title: 'Custom Commands', path: 'Dashboard', page: 'custom-commands', type: 'guide', snippet: 'Guild-specific text trigger-response commands.' },
    { title: 'Developer API Keys', path: 'Dashboard', page: 'api-keys', type: 'guide', snippet: 'Generate secure API keys to integrate REST API data.' },
    { title: 'Premium Plan', path: 'Dashboard', page: 'billing', type: 'guide', snippet: 'Unlock personal voice channels and custom perks.' },
    { title: '?ban — Ban a member', path: 'Commands / Moderation', page: 'cmd-moderation', type: 'command', snippet: 'Permanently ban a member from the server.' },
    { title: '?banforlife — Lifetime ban', path: 'Commands / Moderation', page: 'cmd-moderation', type: 'command', snippet: 'Permanently ban and record to lifetime database.' },
    { title: '?unban — Lift ban', path: 'Commands / Moderation', page: 'cmd-moderation', type: 'command', snippet: 'Unban a user by ID.' },
    { title: '?kick — Kick a member', path: 'Commands / Moderation', page: 'cmd-moderation', type: 'command', snippet: 'Kick a member from the server.' },
    { title: '?mute — Mute a member', path: 'Commands / Moderation', page: 'cmd-moderation', type: 'command', snippet: 'Mute using configured muted role.' },
    { title: '?timeout — Timeout member', path: 'Commands / Moderation', page: 'cmd-moderation', type: 'command', snippet: 'Discord-native timeout.' },
    { title: '?warn — Warn member', path: 'Commands / Moderation', page: 'cmd-moderation', type: 'command', snippet: 'Issue a formal warning stored in the database.' },
    { title: '?jail — Jail member', path: 'Commands / Moderation', page: 'cmd-moderation', type: 'command', snippet: 'Restrict member to jail channel.' },
    { title: '?clear — Delete messages', path: 'Commands / Moderation', page: 'cmd-moderation', type: 'command', snippet: 'Bulk delete messages in current channel.' },
    { title: '?temprole — Temp role', path: 'Commands / Moderation', page: 'cmd-moderation', type: 'command', snippet: 'Assign a role temporarily for a set duration.' },
    { title: '?hide / ?unhide — Channel visibility', path: 'Commands / Moderation', page: 'cmd-moderation', type: 'command', snippet: 'Hide or restore a channel.' },
    { title: '?lock / ?unlock — Lock channel', path: 'Commands / Security', page: 'cmd-security', type: 'command', snippet: 'Lock or unlock a channel.' },
    { title: '?antilink — Toggle link filter', path: 'Commands / Security', page: 'cmd-security', type: 'command', snippet: 'Enable or disable the anti-link filter.' },
    { title: '?antibots — Anti-bot protection', path: 'Commands / Security', page: 'cmd-security', type: 'command', snippet: 'Configure automatic action against bot accounts.' },
    { title: '?antiwebhook — Anti-webhook', path: 'Commands / Security', page: 'cmd-security', type: 'command', snippet: 'Protect against unauthorized webhooks.' },
    { title: '?v-blacklist — Voice blacklist', path: 'Commands / Security', page: 'cmd-security', type: 'command', snippet: 'Prevent specific members from joining voice channels.' },
    { title: '?rank — View rank card', path: 'Commands / Leveling', page: 'cmd-leveling', type: 'command', snippet: 'Display current level and XP.' },
    { title: '?leaderboard — XP leaderboard', path: 'Commands / Leveling', page: 'cmd-leveling', type: 'command', snippet: 'View XP leaderboard.' },
    { title: '?bal — Check balance', path: 'Commands / Economy', page: 'cmd-economy', type: 'command', snippet: 'Check coin balance.' },
    { title: '?daily — Daily reward', path: 'Commands / Economy', page: 'cmd-economy', type: 'command', snippet: 'Claim daily coin reward.' },
    { title: '?vmute — Server voice mute', path: 'Commands / Voice', page: 'cmd-voice', type: 'command', snippet: 'Server-mute a member in voice.' },
    { title: '?vkick — Disconnect voice channel', path: 'Commands / Voice', page: 'cmd-voice', type: 'command', snippet: 'Disconnect from voice channel.' },
    { title: '?help — Help menu', path: 'Commands / Utility', page: 'cmd-utility', type: 'command', snippet: 'Display all commands.' },
    { title: '?ping — Latency check', path: 'Commands / Utility', page: 'cmd-utility', type: 'command', snippet: 'Check response time and API gateway latency.' },
    { title: '?vg — Start giveaway', path: 'Commands / Giveaways', page: 'cmd-giveaways', type: 'command', snippet: 'Start a new giveaway.' },
    { title: '?marriage — Propose marriage', path: 'Commands / Marriage', page: 'cmd-marriage', type: 'command', snippet: 'Propose marriage to another member.' },
    { title: '?divorce — End marriage', path: 'Commands / Marriage', page: 'cmd-marriage', type: 'command', snippet: 'End your current server marriage.' },
    { title: '?pcreate — Create premium room', path: 'Commands / Premium', page: 'cmd-premium', type: 'command', snippet: 'Create your personal premium voice room.' },
    { title: 'Developer Portal', path: 'Developer', page: 'dev-portal', type: 'api', snippet: 'API key management and developer tools.' },
    { title: 'REST API', path: 'Developer', page: 'rest-api', type: 'api', snippet: 'Full REST API documentation with endpoints.' },
    { title: 'Authentication', path: 'Developer', page: 'auth-api', type: 'api', snippet: 'API keys and scopes.' },
    { title: 'Webhooks', path: 'Developer', page: 'webhooks', type: 'api', snippet: 'Receive real-time event notifications.' },
    { title: 'Rate Limits', path: 'Developer', page: 'rate-limits', type: 'api', snippet: 'API rate limits and handling.' },
    { title: 'FAQ', path: 'Support', page: 'faq', type: 'faq', snippet: 'Frequently asked questions including default prefix ?.' },
    { title: 'Troubleshooting', path: 'Support', page: 'troubleshooting', type: 'faq', snippet: 'Diagnose and fix common issues.' },
    { title: 'Changelog', path: 'Support', page: 'changelog', type: 'guide', snippet: 'Latest updates and improvements.' }
];

let currentPage = 'home';

function navigate(pageId) {
    document.querySelectorAll('.doc-page').forEach(p => p.classList.remove('active'));
    const target = document.getElementById('page-' + pageId);
    if (target) { target.classList.add('active'); currentPage = pageId; }
    document.querySelectorAll('.sidebar-link').forEach(l => {
        l.classList.remove('active');
        if (l.dataset.page === pageId) l.classList.add('active');
    });
    buildToc(pageId);
    updateBreadcrumb(pageId);
    document.getElementById('docsMain').scrollTo({top:0});
    window.scrollTo({top:0});
    closeMobileSidebar();
    history.replaceState(null,'','/docs/' + pageId);
}

function buildToc(pageId) {
    const page = document.getElementById('page-' + pageId);
    const tocContent = document.getElementById('tocContent');
    if (!page || !tocContent) return;
    const headings = page.querySelectorAll('h2.doc-heading, h3.doc-heading');
    if (!headings.length) { tocContent.innerHTML = '<div style="font-size:12px;color:var(--text-muted);padding:4px 0">No sections on this page</div>'; return; }
    tocContent.innerHTML = '';
    headings.forEach(h => {
        const link = document.createElement('a');
        link.className = 'toc-link' + (h.tagName === 'H3' ? ' h3' : '');
        link.textContent = h.textContent.replace('#','').trim();
        link.href = '#' + (h.id || '');
        link.addEventListener('click', e => {
            e.preventDefault();
            h.scrollIntoView({behavior:'smooth',block:'start'});
        });
        tocContent.appendChild(link);
    });
}

function updateBreadcrumb(pageId) {
    const crumb = document.getElementById('breadcrumb');
    const link = document.querySelector(`.sidebar-link[data-page="${pageId}"]`);
    const section = link?.closest('.sidebar-section');
    const sectionTitle = section?.querySelector('.sidebar-section-title')?.textContent || '';
    const pageTitle = link?.textContent?.trim().replace(/new|pro/gi,'').trim() || pageId;
    crumb.innerHTML = `<span>Docs</span>`;
    if (sectionTitle) crumb.innerHTML += `<span class="sep">/</span><span>${sectionTitle}</span>`;
    if (pageTitle && pageTitle !== sectionTitle) crumb.innerHTML += `<span class="sep">/</span><span style="color:var(--text-primary)">${pageTitle}</span>`;
}

const searchInput = document.getElementById('searchInput');
const searchResults = document.getElementById('searchResults');

searchInput.addEventListener('input', () => {
    const q = searchInput.value.trim().toLowerCase();
    if (!q) { searchResults.classList.remove('active'); return; }
    const matches = searchIndex.filter(item =>
        item.title.toLowerCase().includes(q) || item.snippet.toLowerCase().includes(q) || item.path.toLowerCase().includes(q)
    ).slice(0,8);
    if (!matches.length) {
        searchResults.innerHTML = `<div class="search-empty">No results for "<strong>${q}</strong>"</div>`;
    } else {
        searchResults.innerHTML = matches.map(m => `
            <div class="search-result-item" data-search-page="${m.page}">
                <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">
                    <span class="sr-tag ${m.type}">${m.type}</span>
                    <div class="sr-title">${highlight(m.title,q)}</div>
                </div>
                <div class="sr-path">${m.path}</div>
                <div class="sr-snippet">${highlight(m.snippet,q)}</div>
            </div>`).join('');
    }
    searchResults.classList.add('active');
});

function highlight(text,q) {
    const re = new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')})`, 'gi');
    return text.replace(re,'<mark style="background:rgba(0,242,254,0.2);color:var(--cyan);border-radius:2px;padding:0 2px">$1</mark>');
}
function closeSearch() { searchResults.classList.remove('active'); searchInput.value = ''; }

document.addEventListener('click', e => { if (!e.target.closest('.search-wrap')) closeSearch(); });
document.addEventListener('keydown', e => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); searchInput.focus(); searchInput.select(); }
    if (e.key === 'Escape') closeSearch();
});

function toggleFaq(el) {
    const item = el.parentElement;
    const wasOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
    if (!wasOpen) item.classList.add('open');
}

function copyCode(btn) {
    const pre = btn.closest('.code-block').querySelector('pre');
    navigator.clipboard.writeText(pre.textContent.trim()).then(() => {
        const orig = btn.innerHTML;
        btn.innerHTML = '<i class="fa-solid fa-check"></i> Copied!';
        btn.classList.add('copied');
        setTimeout(() => { btn.innerHTML = orig; btn.classList.remove('copied'); }, 2000);
    });
}

const sidebar = document.getElementById('docsSidebar');
const overlay = document.getElementById('sidebarOverlay');
const mobileBtn = document.getElementById('mobileSidebarBtn');
mobileBtn.addEventListener('click', () => { sidebar.classList.toggle('mobile-open'); overlay.classList.toggle('active'); });
overlay.addEventListener('click', closeMobileSidebar);
function closeMobileSidebar() { sidebar.classList.remove('mobile-open'); overlay.classList.remove('active'); }

// Event delegation for clicks in docs.html
document.addEventListener('click', e => {
    // FAQ toggles
    const faqQ = e.target.closest('.faq-question');
    if (faqQ) {
        toggleFaq(faqQ);
        return;
    }

    // Code copying
    const copyBtn = e.target.closest('.copy-btn');
    if (copyBtn) {
        copyCode(copyBtn);
        return;
    }

    // Sidebar link navigations
    const sidebarLink = e.target.closest('.sidebar-link');
    if (sidebarLink) {
        const page = sidebarLink.getAttribute('data-page');
        if (page) navigate(page);
        return;
    }

    // Navigation cards
    const navCard = e.target.closest('.doc-nav-card');
    if (navCard) {
        const navTarget = navCard.getAttribute('data-nav');
        if (navTarget) navigate(navTarget);
        return;
    }

    // Logo / other items with data-nav
    const navEl = e.target.closest('[data-nav]');
    if (navEl) {
        const navTarget = navEl.getAttribute('data-nav');
        if (navTarget) navigate(navTarget);
        return;
    }

    // Search result item
    const searchItem = e.target.closest('.search-result-item');
    if (searchItem) {
        const page = searchItem.getAttribute('data-search-page');
        if (page) {
            navigate(page);
            closeSearch();
        }
        return;
    }
});

const pathParts = window.location.pathname.split('/');
const pathPage = pathParts.length > 2 ? pathParts[2] : '';
const hash = window.location.hash.replace('#','');
const initialPage = hash || pathPage;
if (initialPage && document.getElementById('page-' + initialPage)) { navigate(initialPage); } else { navigate('home'); }
