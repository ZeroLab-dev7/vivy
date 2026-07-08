function escapeHtml(str) {
            if (str === null || str === undefined) return '';
            return String(str)
                .replace(/&/g,  '&amp;')
                .replace(/</g,  '&lt;')
                .replace(/>/g,  '&gt;')
                .replace(/"/g,  '&quot;')
                .replace(/'/g,  '&#x27;');
        }

        function showToast(msg, type = 'info') {
            const icons = { success: 'fa-check-circle', error: 'fa-circle-xmark', info: 'fa-circle-info' };
            const wrap = document.getElementById('toastWrap');
            const t = document.createElement('div');
            t.className = `toast ${type}`;
            // Use textContent to avoid XSS
            const icon = document.createElement('i');
            icon.className = `fa-solid ${icons[type] || icons.info}`;
            t.appendChild(icon);
            t.appendChild(document.createTextNode(' ' + String(msg)));
            wrap.appendChild(t);
            setTimeout(() => t.remove(), 4000);
        }

        async function loadSelector() {
            try {
                const userRes = await fetch('/auth/discord/user');
                const userData = await userRes.json();

                if (!userData.authenticated) {
                    window.location.href = '/';
                    return;
                }

                // Populate user chip
                const name = userData.user.global_name || userData.user.username;
                document.getElementById('username').textContent = name;
                const hash = userData.user.avatar;
                document.getElementById('userAvatar').src = hash
                    ? `https://cdn.discordapp.com/avatars/${userData.user.id}/${hash}.png`
                    : `https://cdn.discordapp.com/embed/avatars/0.png`;

                if (userData.isDeveloper) {
                    const devBtn = document.getElementById('devPortalBtn');
                    if (devBtn) devBtn.style.display = 'inline-flex';
                }

                // Load guilds
                const guildsRes = await fetch('/api/guilds');
                if (!guildsRes.ok) {
                    throw new Error('Failed to fetch guilds');
                }
                const guilds = await guildsRes.json();
                if (!Array.isArray(guilds)) {
                    throw new Error('Guilds response is not an array');
                }

                const installed = guilds.filter(g => g.botInstalled && g.isAdmin);
                const invite    = guilds.filter(g => !g.botInstalled && g.isAdmin);

                renderServers('installedServers', installed, true);
                renderServers('inviteServers', invite, false);

            } catch (e) {
                console.error('Selector load error:', e);
                showToast('Failed to load servers. Please refresh and try again.', 'error');
                // Show error state without leaking internal error details
                const errHtml = `
                    <div class="glass-card-sm" style="text-align:center;padding:28px;color:var(--text-2);font-size:14px;">
                        <i class="fa-solid fa-circle-xmark" style="font-size:24px;margin-bottom:8px;display:block;color:var(--text-3)"></i>
                        Unable to load servers. Please try again.
                    </div>`;
                document.getElementById('installedServers').innerHTML = errHtml;
                document.getElementById('inviteServers').innerHTML = errHtml;
            }
        }

        function renderServers(containerId, guilds, isInstalled) {
            const el = document.getElementById(containerId);
            el.innerHTML = '';

            if (guilds.length === 0) {
                el.innerHTML = `
                    <div class="glass-card-sm" style="text-align:center;padding:28px;color:var(--text-2);font-size:14px;">
                        <i class="fa-solid ${isInstalled ? 'fa-robot' : 'fa-party-horn'}" style="font-size:24px;margin-bottom:8px;display:block;color:var(--text-3)"></i>
                        ${isInstalled ? 'No servers with Vivy installed yet.' : 'All your admin servers have Vivy! 🎉'}
                    </div>`;
                return;
            }

            guilds.forEach(guild => {
                let firstChar = 'S';
                try {
                    // Using array spread handles surrogate pairs (like emojis or special font letters) properly without splitting them
                    firstChar = [...guild.name][0] || 'S';
                } catch (e) {}

                let encodedName = 'Server';
                try {
                    encodedName = encodeURIComponent(guild.name);
                } catch (e) {
                    encodedName = encodeURIComponent(guild.name.replace(/[\uD800-\uDFFF]/g, ''));
                }

                let encodedFirstChar = 'S';
                try {
                    encodedFirstChar = encodeURIComponent(firstChar);
                } catch (e) {
                    encodedFirstChar = encodeURIComponent(firstChar.replace(/[\uD800-\uDFFF]/g, ''));
                }

                const iconUrl = guild.icon
                    ? guild.icon
                    : `https://ui-avatars.com/api/?name=${encodedName}&background=0d1117&color=00e5ff&bold=true`;

                const card = document.createElement('div');
                card.className = `server-card ${isInstalled ? 'clickable' : ''}`;
                if (isInstalled) card.onclick = () => { window.location.href = `/servers/${guild.id}`; };

                card.innerHTML = `
                    <img class="server-icon" src="${iconUrl}" alt="${escapeHtml(guild.name)}" onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(firstChar)}&background=111620&color=00e5ff'">
                    <div class="server-info">
                        <div class="server-name">${escapeHtml(guild.name)}</div>
                        <div class="server-meta">${isInstalled ? 'Bot installed · Click to configure' : 'Bot not added'}</div>
                    </div>
                    <div>
                        ${isInstalled
                            ? `<span class="server-status status-online"><i class="fa-solid fa-circle" style="font-size:7px"></i> Online</span>`
                            : `<a href="${escapeHtml(guild.inviteLink || '#')}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary btn-sm" onclick="event.stopPropagation()">
                                    <i class="fa-solid fa-plus"></i> Add Bot
                               </a>`
                        }
                    </div>
                `;

                el.appendChild(card);
            });
        }

        window.addEventListener('DOMContentLoaded', loadSelector);
