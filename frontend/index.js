// Vivy Homepage Premium SaaS Logic (V2)

document.addEventListener('DOMContentLoaded', () => {
    // Check Auth state on load to dynamically swap login buttons
    async function checkAuthState() {
        try {
            const res = await fetch('/auth/discord/user');
            const data = await res.json();
            if (data.authenticated) {
                const buttons = [
                    { id: 'nav-login-btn', html: '<i class="fa-solid fa-chart-line"></i> Dashboard' },
                    { id: 'mobile-login-btn', html: '<i class="fa-solid fa-chart-line"></i> Dashboard' },
                    { id: 'hero-cta-btn', html: 'Go to Dashboard <i class="fa-solid fa-arrow-right"></i>' },
                    { id: 'bottom-cta-btn', html: 'Go to Dashboard <i class="fa-solid fa-arrow-right"></i>' }
                ];

                buttons.forEach(btn => {
                    const el = document.getElementById(btn.id);
                    if (el) {
                        el.href = '/servers';
                        el.innerHTML = btn.html;
                    }
                });
            }
        } catch (e) {
            console.error("Auth state fetch failed:", e);
        }
    }
    checkAuthState();

    // ─── NAVBAR SCROLL LOGIC ───
    const navbar = document.getElementById('navbar');
    let lastScrollY = window.scrollY;

    window.addEventListener('scroll', () => {
        const currentScrollY = window.scrollY;
        navbar.classList.toggle('scrolled', currentScrollY > 20);

        // Smart hide when scrolling down, show when scrolling up
        if (currentScrollY > 150) {
            if (currentScrollY > lastScrollY) {
                navbar.style.transform = 'translateY(-100%)';
            } else {
                navbar.style.transform = 'translateY(0)';
            }
        } else {
            navbar.style.transform = 'translateY(0)';
        }
        lastScrollY = currentScrollY;
    }, { passive: true });

    // ─── MOBILE MENU TOGGLE ───
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileMenu = document.getElementById('mobileMenu');

    mobileMenuBtn.addEventListener('click', () => {
        mobileMenu.classList.toggle('open');
        const icon = mobileMenuBtn.querySelector('i');
        icon.className = mobileMenu.classList.contains('open') ? 'fa-solid fa-xmark' : 'fa-solid fa-bars';
    });

    mobileMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            mobileMenu.classList.remove('open');
            mobileMenuBtn.querySelector('i').className = 'fa-solid fa-bars';
        });
    });

    // ─── PRICING TOGGLE ───
    const pricingToggleBtn = document.getElementById('pricingToggleBtn');
    const labelMonthly = document.getElementById('label-monthly');
    const labelYearly = document.getElementById('label-yearly');
    const priceAmount = document.getElementById('pro-price-amount');
    const pricePeriod = document.getElementById('pro-price-period');

    if (pricingToggleBtn) {
        let isYearly = false;
        pricingToggleBtn.addEventListener('click', () => {
            isYearly = !isYearly;
            pricingToggleBtn.classList.toggle('yearly', isYearly);
            labelMonthly.classList.toggle('active', !isYearly);
            labelYearly.classList.toggle('active', isYearly);

            if (isYearly) {
                priceAmount.textContent = '$3.99';
                pricePeriod.textContent = '/month, billed yearly';
            } else {
                priceAmount.textContent = '$4.99';
                pricePeriod.textContent = '/month';
            }
        });
    }

    // ─── HERO TYPING ANIMATION ───
    const typingTarget = document.getElementById('hero-typing-target');
    if (typingTarget) {
        const phrases = [
            "managed through a premium visual dashboard.",
            "backed by advanced anti-spam protection.",
            "gamified with levels and custom role rewards."
        ];
        let phraseIndex = 0;
        let charIndex = 0;
        let isDeleting = false;
        let typeSpeed = 80;

        function type() {
            const currentPhrase = phrases[phraseIndex];
            if (isDeleting) {
                typingTarget.textContent = currentPhrase.substring(0, charIndex - 1);
                charIndex--;
                typeSpeed = 40;
            } else {
                typingTarget.textContent = currentPhrase.substring(0, charIndex + 1);
                charIndex++;
                typeSpeed = 80;
            }

            if (!isDeleting && charIndex === currentPhrase.length) {
                isDeleting = true;
                typeSpeed = 2000; // Delay before starting delete
            } else if (isDeleting && charIndex === 0) {
                isDeleting = false;
                phraseIndex = (phraseIndex + 1) % phrases.length;
                typeSpeed = 500; // Delay before typing next phrase
            }

            setTimeout(type, typeSpeed);
        }
        setTimeout(type, 1000);
    }

    // ─── LIVE BOT LATENCY MOCKUP ───
    const latencyEl = document.getElementById('live-bot-latency');
    if (latencyEl) {
        setInterval(() => {
            const latency = Math.floor(Math.random() * 8) + 8; // 8-15ms
            latencyEl.textContent = `${latency}ms`;
        }, 3000);
    }

    // ─── CUSTOM MOUSE CURSOR ───
    const cursor = document.getElementById('custom-cursor');
    const cursorGlow = document.getElementById('custom-cursor-glow');

    // Check if device supports hover interactions (mouse cursor check)
    const hasHover = window.matchMedia('(any-hover: hover)').matches;
    if (hasHover && cursor && cursorGlow) {
        let cursorX = 0, cursorY = 0;
        let targetX = 0, targetY = 0;
        const speed = 0.12; // Interpolation delay speed factor

        document.addEventListener('mousemove', (e) => {
            targetX = e.clientX;
            targetY = e.clientY;
            cursor.style.opacity = 1;
            cursorGlow.style.opacity = 1;
        });

        document.addEventListener('mouseleave', () => {
            cursor.style.opacity = 0;
            cursorGlow.style.opacity = 0;
        });

        function animateCursor() {
            // Lerp (Linear Interpolation) calculation
            cursorX += (targetX - cursorX) * speed;
            cursorY += (targetY - cursorY) * speed;

            cursor.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0)`;
            cursorGlow.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0)`;

            requestAnimationFrame(animateCursor);
        }
        requestAnimationFrame(animateCursor);

        // Hover scale feedback
        const hoverables = document.querySelectorAll('a, button, input, select, textarea, .integration-item, .stat-counter-card, .demo-tab-btn, .dash-menu-item');
        hoverables.forEach(item => {
            item.addEventListener('mouseenter', () => {
                cursor.classList.add('hovering');
            });
            item.addEventListener('mouseleave', () => {
                cursor.classList.remove('hovering');
            });
        });
    }

    // ─── CARD 3D TILT EFFECT ───
    const tiltCards = document.querySelectorAll('.feature-card, .pricing-card, .community-card, .stat-counter-card');
    tiltCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            // Set css custom property coordinates for glow effects
            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);

            // Calculate tilt angle rotation values (clamp limit to 3 degrees max)
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = ((centerY - y) / centerY) * 3;
            const rotateY = ((x - centerX) / centerX) * 3;

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
        });
    });

    // ─── ANIMATED COUNTERS ───
    const counterElements = document.querySelectorAll('.stat-val');
    const startCounters = () => {
        counterElements.forEach(el => {
            const target = parseInt(el.getAttribute('data-target'), 10);
            const duration = 2000; // Animation duration in ms
            const stepTime = 20; // Tick step update in ms
            const totalSteps = duration / stepTime;
            const stepIncrement = target / totalSteps;
            let current = 0;

            const formatNum = (num) => {
                if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M+`;
                if (num >= 1000) return `${(num / 1000).toFixed(1)}k+`;
                return num.toString();
            };

            const counter = setInterval(() => {
                current += stepIncrement;
                if (current >= target) {
                    current = target;
                    clearInterval(counter);
                }
                el.textContent = formatNum(Math.floor(current));
            }, stepTime);
        });
    };

    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                startCounters();
                counterObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.2 });

    const statsGrid = document.querySelector('.stats-counter-grid');
    if (statsGrid) {
        counterObserver.observe(statsGrid);
    }

    // ─── REVEAL ANIMATIONS (IntersectionObserver) ───
    const revealSections = document.querySelectorAll('.fade-in-section');
    const sectionObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    revealSections.forEach(sec => sectionObserver.observe(sec));

    // ─── LIVE FEATURE PLAYGROUND WIDGETS ───
    const demoTabBtns = document.querySelectorAll('.demo-tab-btn');
    const demoPanels = document.querySelectorAll('.demo-panel');

    demoTabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const activeDemo = btn.getAttribute('data-demo');
            demoTabBtns.forEach(b => b.classList.remove('active'));
            demoPanels.forEach(p => p.classList.remove('active'));

            btn.classList.add('active');
            document.getElementById(`demo-panel-${activeDemo}`).classList.add('active');
        });
    });

    // AutoMod Playground logic
    const automodInput = document.getElementById('automod-input');
    const automodSendBtn = document.getElementById('automod-send-btn');
    const automodChatBox = document.getElementById('automod-chat-box');

    const handleAutomodMessage = () => {
        const text = automodInput.value.trim();
        if (!text) return;

        // Append user chat message
        const userMsg = document.createElement('div');
        userMsg.className = 'chat-message';
        userMsg.innerHTML = `
            <div class="chat-avatar" style="background:#f59e0b;">U</div>
            <div class="chat-body">
                <div class="chat-meta"><span class="chat-author">User</span> <span class="chat-time">Just now</span></div>
                <div class="chat-content">${text}</div>
            </div>
        `;
        automodChatBox.appendChild(userMsg);
        automodInput.value = '';
        automodChatBox.scrollTop = automodChatBox.scrollHeight;

        // Check if message contains blocked keywords
        const containsBlocked = /nitro|scam|free|gift|phish|http|discord\.gg/i.test(text);

        setTimeout(() => {
            if (containsBlocked) {
                const autoAlert = document.createElement('div');
                autoAlert.className = 'chat-message flagged';
                autoAlert.style.borderLeft = '3px solid #f23f43';
                autoAlert.style.background = 'rgba(242, 63, 67, 0.05)';
                autoAlert.style.padding = '8px 12px';
                autoAlert.style.borderRadius = '4px';
                autoAlert.innerHTML = `
                    <div class="chat-avatar" style="background:var(--cyan);">V</div>
                    <div class="chat-body">
                        <div class="chat-meta"><span class="chat-author" style="color:var(--cyan);">Vivy AutoMod</span> <span class="chat-time">Just now</span></div>
                        <div class="chat-content" style="color:#f23f43;font-weight:600;"><i class="fa-solid fa-triangle-exclamation"></i> Link Blocked: Message quarantined instantly.</div>
                    </div>
                `;
                automodChatBox.appendChild(autoAlert);
            } else {
                const autoOk = document.createElement('div');
                autoOk.className = 'chat-message';
                autoOk.innerHTML = `
                    <div class="chat-avatar" style="background:var(--cyan);">V</div>
                    <div class="chat-body">
                        <div class="chat-meta"><span class="chat-author" style="color:var(--cyan);">Vivy</span> <span class="chat-time">Just now</span></div>
                        <div class="chat-content">Message checked. AutoMod status: <span style="color:var(--green)">Clean</span>.</div>
                    </div>
                `;
                automodChatBox.appendChild(autoOk);
            }
            automodChatBox.scrollTop = automodChatBox.scrollHeight;
        }, 400);
    };

    if (automodSendBtn && automodInput) {
        automodSendBtn.addEventListener('click', handleAutomodMessage);
        automodInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') handleAutomodMessage();
        });
    }

    // Welcome Configurator logic
    const welcomeInput = document.getElementById('welcome-input');
    const welcomePreviewName = document.getElementById('welcome-preview-name');
    if (welcomeInput && welcomePreviewName) {
        welcomeInput.addEventListener('input', () => {
            welcomePreviewName.textContent = welcomeInput.value.trim() || 'Aiden';
        });
    }

    // Leveling XP simulator
    const levelChatBtn = document.getElementById('level-chat-btn');
    const levelProgressFill = document.getElementById('level-progress-fill');
    const levelPreviewNum = document.getElementById('level-preview-num');
    const levelPreviewXp = document.getElementById('level-preview-xp');
    const levelPreviewNotif = document.getElementById('level-preview-notif');
    const levelPreviewStatus = document.getElementById('level-preview-status');

    if (levelChatBtn) {
        let currentXp = 0;
        let currentLevel = 1;
        levelChatBtn.addEventListener('click', () => {
            currentXp += 15;
            levelPreviewNotif.textContent = '+15 XP Gained!';
            setTimeout(() => { levelPreviewNotif.textContent = ''; }, 1000);

            if (currentXp >= 100) {
                currentXp -= 100;
                currentLevel++;
                levelPreviewNum.textContent = currentLevel;
                levelPreviewNotif.textContent = '<a:pink8:1337678972108148757> Level Up!';

                // Update role tier label
                if (currentLevel >= 5) {
                    levelPreviewStatus.textContent = 'Elite Administrator';
                } else if (currentLevel >= 3) {
                    levelPreviewStatus.textContent = 'Active Moderator';
                } else {
                    levelPreviewStatus.textContent = 'Freshman Role';
                }
            }

            levelProgressFill.style.width = `${currentXp}%`;
            levelPreviewXp.textContent = `${currentXp} / 100 XP`;
        });
    }

    // Verification demo logic
    const verifyApprove = document.getElementById('verify-approve-btn');
    const verifyReject = document.getElementById('verify-reject-btn');
    const verifyCard = document.getElementById('verify-applicant-card');
    const verifyStatus = document.getElementById('applicant-status-badge');

    if (verifyApprove && verifyCard && verifyStatus) {
        verifyApprove.addEventListener('click', () => {
            verifyStatus.textContent = 'APPROVED';
            verifyStatus.style.background = 'rgba(16, 185, 129, 0.08)';
            verifyStatus.style.borderColor = 'rgba(16, 185, 129, 0.2)';
            verifyStatus.style.color = 'var(--green)';
            verifyCard.style.borderColor = 'var(--green)';
        });
    }
    if (verifyReject && verifyCard && verifyStatus) {
        verifyReject.addEventListener('click', () => {
            verifyStatus.textContent = 'DECLINED';
            verifyStatus.style.background = 'rgba(239, 68, 68, 0.08)';
            verifyStatus.style.borderColor = 'rgba(239, 68, 68, 0.2)';
            verifyStatus.style.color = '#ef4444';
            verifyCard.style.borderColor = '#ef4444';
        });
    }

    // ─── REAL DASHBOARD TOUR TABS ───
    const tourMenuBtns = document.querySelectorAll('#tour-dash-menu .dash-menu-item');
    const tourPanels = document.querySelectorAll('.tour-panel');

    tourMenuBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tourId = btn.getAttribute('data-tour');
            tourMenuBtns.forEach(b => b.classList.remove('active'));
            tourPanels.forEach(p => p.classList.remove('active'));

            btn.classList.add('active');
            document.getElementById(`tour-panel-${tourId}`).classList.add('active');
        });
    });

    // Simulate Slider changing AutoMod numbers
    const tourSlider = document.getElementById('tour-spam-slider');
    const tourSpamLbl = document.getElementById('tour-spam-lbl');
    if (tourSlider && tourSpamLbl) {
        tourSlider.addEventListener('input', () => {
            tourSpamLbl.textContent = tourSlider.value;
        });
    }

    // Dynamic dashboard member value ticks
    const tourMembersVal = document.getElementById('tour-members-val');
    if (tourMembersVal) {
        setInterval(() => {
            let val = parseInt(tourMembersVal.textContent.replace(/,/g, ''), 10);
            val += Math.floor(Math.random() * 3) + 1; // +1 to +3 members
            tourMembersVal.textContent = val.toLocaleString();
        }, 5000);
    }

    // ─── INTERACTIVE TIMELINE LINE TRAILER ───
    const timelineProgress = document.getElementById('timeline-progress-bar');
    const timelineSection = document.querySelector('.timeline-section');
    const timelineSteps = document.querySelectorAll('.timeline-step');

    window.addEventListener('scroll', () => {
        if (!timelineSection || !timelineProgress) return;
        const rect = timelineSection.getBoundingClientRect();
        const totalHeight = rect.height - window.innerHeight;
        const scrolled = -rect.top;
        const percent = Math.min(Math.max((scrolled / totalHeight) * 100, 0), 100);
        timelineProgress.style.height = `${percent}%`;

        // Highlight steps based on viewport position
        timelineSteps.forEach(step => {
            const stepRect = step.getBoundingClientRect();
            if (stepRect.top < window.innerHeight / 2 && stepRect.bottom > 80) {
                step.classList.add('active');
            } else {
                step.classList.remove('active');
            }
        });
    }, { passive: true });

    // ─── API PREVIEW EDITOR RUNNER ───
    const apiSendBtn = document.getElementById('api-send-req-btn');
    const apiResponse = document.getElementById('api-response-body');
    const apiStatus = document.getElementById('api-status-code');
    const apiLatency = document.getElementById('api-latency-val');

    if (apiSendBtn && apiResponse) {
        apiSendBtn.addEventListener('click', () => {
            apiSendBtn.textContent = 'Sending...';
            apiSendBtn.disabled = true;
            apiResponse.textContent = '{\n  "status": "request_pending",\n  "message": "Fetching guild leaderboard state..."\n}';
            apiStatus.textContent = '-';
            apiLatency.textContent = '-';

            setTimeout(() => {
                const responseData = {
                    "success": true,
                    "guild_id": "12408",
                    "total_members": 12408,
                    "leaderboard": [
                        { "rank": 1, "username": "Loki", "level": 74, "xp": 8290 },
                        { "rank": 2, "username": "Aria", "level": 71, "xp": 4010 },
                        { "rank": 3, "username": "Zenith", "level": 68, "xp": 1020 }
                    ],
                    "cache_status": "HIT"
                };

                apiResponse.textContent = JSON.stringify(responseData, null, 2);
                apiStatus.textContent = '200 OK';
                apiStatus.style.color = 'var(--green)';
                const mockLatency = Math.floor(Math.random() * 5) + 6; // 6-10ms
                apiLatency.textContent = `${mockLatency}ms`;
                apiLatency.style.color = 'var(--cyan)';

                apiSendBtn.textContent = 'Send';
                apiSendBtn.disabled = false;
            }, 500);
        });
    }

    // ─── BACK TO TOP CONTROL ───
    const backToTopBtn = document.getElementById('backToTopBtn');
    if (backToTopBtn) {
        window.addEventListener('scroll', () => {
            backToTopBtn.classList.toggle('visible', window.scrollY > 400);
        }, { passive: true });

        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // ─── LIVE LOGS TICKER console loop ───
    const tickerConsole = document.getElementById('ticker-console');
    if (tickerConsole) {
        const eventsList = [
            { tag: 'welcome', text: 'New member @Astra joined the server. Custom canvas welcome card delivered.' },
            { tag: 'automod', text: 'Message from @SpamAccount flagged for [Malicious Link]. Quarantined in under 8ms.' },
            { tag: 'levels', text: '@SkyReacher leveled up to Level 24! Role [Moderator Apprentice] unlocked.' },
            { tag: 'verify', text: 'Verified @ApexPredator via staff approval gate. Default roles assigned.' },
            { tag: 'welcome', text: 'New member @Kira joined. Welcome DM sent with rules verification.' },
            { tag: 'automod', text: 'AutoMod deleted duplicate messages (Spam Alert) from @SpamAccount.' },
            { tag: 'giveaway', text: 'Giveaway #129 deployed successfully. Winner count: 2. Whitelists: Enabled.' },
            { tag: 'levels', text: '@SkyReacher reached Level 50! Custom Rank Card rendered.' }
        ];

        let eventIndex = 0;

        const addTickerLine = () => {
            const now = new Date();
            const timeStr = now.toTimeString().split(' ')[0];
            const eventObj = eventsList[eventIndex];

            const line = document.createElement('div');
            line.className = 'ticker-line';
            line.innerHTML = `
                <span class="ticker-time">[${timeStr}]</span>
                <span class="ticker-tag ${eventObj.tag}">[${eventObj.tag.toUpperCase()}]</span>
                <span class="ticker-text">${eventObj.text}</span>
            `;

            tickerConsole.appendChild(line);

            if (tickerConsole.children.length > 5) {
                tickerConsole.removeChild(tickerConsole.firstChild);
            }

            tickerConsole.scrollTop = tickerConsole.scrollHeight;
            eventIndex = (eventIndex + 1) % eventsList.length;
        };

        // Initialize ticker lines
        for (let i = 0; i < 3; i++) {
            setTimeout(addTickerLine, i * 400);
        }
        setInterval(addTickerLine, 3500);
    }

    // ─── WELCOME CARD BUILDER LOGIC ───
    const welcomeTitleInput = document.getElementById('welcome-title-input');
    const welcomePreviewTitle = document.getElementById('welcome-preview-title');
    if (welcomeTitleInput && welcomePreviewTitle) {
        welcomeTitleInput.addEventListener('input', () => {
            welcomePreviewTitle.textContent = welcomeTitleInput.value.trim() || 'Welcome to the Server';
        });
    }

    const themeBtns = document.querySelectorAll('.theme-btn');
    const welcomeCardPreview = document.getElementById('welcomeCardPreview');
    themeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            themeBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const theme = btn.getAttribute('data-theme');
            let grad = 'linear-gradient(135deg, rgba(157, 78, 221, 0.15) 0%, rgba(0, 242, 254, 0.05) 100%)';
            if (theme === 'sunset') {
                grad = 'linear-gradient(135deg, rgba(123, 44, 191, 0.4) 0%, rgba(255, 0, 127, 0.3) 100%)';
            } else if (theme === 'aurora') {
                grad = 'linear-gradient(135deg, rgba(5, 150, 105, 0.4) 0%, rgba(0, 242, 254, 0.3) 100%)';
            } else if (theme === 'void') {
                grad = 'linear-gradient(135deg, rgba(30, 27, 75, 0.8) 0%, rgba(49, 16, 66, 0.8) 100%)';
            }
            if (welcomeCardPreview) {
                welcomeCardPreview.style.background = grad;
            }
        });
    });

    const shapeRadios = document.getElementsByName('avatar-shape');
    const welcomeAvatarPreview = document.getElementById('welcomeAvatarPreview');
    shapeRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            if (!welcomeAvatarPreview) return;
            const shape = radio.value;
            if (shape === 'circle') {
                welcomeAvatarPreview.style.borderRadius = '50%';
                welcomeAvatarPreview.style.clipPath = 'none';
            } else if (shape === 'square') {
                welcomeAvatarPreview.style.borderRadius = '8px';
                welcomeAvatarPreview.style.clipPath = 'none';
            } else if (shape === 'hexagon') {
                welcomeAvatarPreview.style.borderRadius = '0';
                welcomeAvatarPreview.style.clipPath = 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)';
            }
        });
    });

    // ─── DASHBOARD SANDBOX & AUDIT LOGS LOGIC ───
    const sandboxAuditConsole = document.getElementById('sandboxAuditConsole');
    function appendSandboxAuditLog(action) {
        if (!sandboxAuditConsole) return;
        const now = new Date();
        const timeStr = now.toTimeString().split(' ')[0];
        const line = document.createElement('div');
        line.className = 'audit-line';
        line.innerHTML = `<span style="color:var(--text-muted);">[${timeStr}]</span> <span style="color:var(--cyan);">[AUDIT]</span> ${action}`;
        sandboxAuditConsole.appendChild(line);
        if (sandboxAuditConsole.children.length > 20) {
            sandboxAuditConsole.removeChild(sandboxAuditConsole.firstChild);
        }
        sandboxAuditConsole.scrollTop = sandboxAuditConsole.scrollHeight;
    }

    // AutoMod slider change logging
    if (tourSlider && tourSpamLbl) {
        tourSlider.addEventListener('change', () => {
            appendSandboxAuditLog(`Anti-Spam limit threshold set to <strong>${tourSlider.value}</strong> messages/5s.`);
        });
    }

    const tourRaidToggle = document.getElementById('tour-raid-toggle');
    if (tourRaidToggle) {
        tourRaidToggle.addEventListener('change', () => {
            appendSandboxAuditLog(`Raid Protection Mode changed to <strong>${tourRaidToggle.checked ? 'ENABLED' : 'DISABLED'}</strong>.`);
        });
    }

    const tourTranscriptsToggle = document.getElementById('tour-transcripts-toggle');
    if (tourTranscriptsToggle) {
        tourTranscriptsToggle.addEventListener('change', () => {
            appendSandboxAuditLog(`Transcript Saves configuration changed to <strong>${tourTranscriptsToggle.checked ? 'ENABLED' : 'DISABLED'}</strong>.`);
        });
    }

    // Tickets queue simulator
    const tourCreateTicketBtn = document.getElementById('tour-create-ticket-btn');
    const tourTicketsQueue = document.getElementById('tour-tickets-queue');
    if (tourCreateTicketBtn && tourTicketsQueue) {
        let ticketCounter = 1042;
        const ticketUsers = ['Loki', 'SkyReacher', 'Zenith', 'Aria', 'Kira'];
        const ticketCategories = ['Moderator Request', 'Feature Inquiry', 'Bug Report', 'General Support'];

        tourCreateTicketBtn.addEventListener('click', () => {
            const ticketId = ticketCounter++;
            const user = ticketUsers[Math.floor(Math.random() * ticketUsers.length)];
            const cat = ticketCategories[Math.floor(Math.random() * ticketCategories.length)];

            const ticketRow = document.createElement('div');
            ticketRow.className = 'tour-ticket-row';
            ticketRow.id = `ticket-${ticketId}`;
            ticketRow.style.cssText = 'display:flex;justify-content:space-between;align-items:center;background:rgba(255,255,255,0.02);padding:8px 12px;border-radius:var(--radius-sm);font-size:12px;animation:fadeIn 0.25s ease;';
            ticketRow.innerHTML = `
                <span>Ticket #${ticketId} by <strong>@${user}</strong> (${cat})</span>
                <div style="display:flex;gap:8px;align-items:center;">
                    <span class="status-badge" style="color:var(--gold);font-weight:700;">OPEN</span>
                    <button class="btn-ghost solve-ticket-btn" data-id="${ticketId}" style="padding:2px 8px;font-size:10px;border-color:rgba(255,255,255,0.1);">Close</button>
                </div>
            `;

            tourTicketsQueue.appendChild(ticketRow);
            tourTicketsQueue.scrollTop = tourTicketsQueue.scrollHeight;
            appendSandboxAuditLog(`Support Ticket <strong>#${ticketId}</strong> opened by <strong>@${user}</strong>.`);
        });
    }

    if (tourTicketsQueue) {
        tourTicketsQueue.addEventListener('click', (e) => {
            if (e.target && e.target.classList.contains('solve-ticket-btn')) {
                const btn = e.target;
                const id = btn.getAttribute('data-id');
                const row = document.getElementById(`ticket-${id}`);
                if (row) {
                    const badge = row.querySelector('.status-badge');
                    if (badge) {
                        badge.textContent = 'CLOSED';
                        badge.style.color = 'var(--text-muted)';
                    }
                    btn.disabled = true;
                    btn.style.opacity = '0.5';
                    btn.textContent = 'Closed';
                    appendSandboxAuditLog(`Support Ticket <strong>#${id}</strong> closed & resolved.`);
                }
            }
        });
    }

    // Leveling configs logs
    const tourXpMult = document.getElementById('tour-xp-multiplier');
    if (tourXpMult) {
        tourXpMult.addEventListener('change', () => {
            appendSandboxAuditLog(`XP multiplier configured to <strong>${tourXpMult.value}x</strong>.`);
        });
    }
    const tourLevelRole = document.getElementById('tour-level-role');
    if (tourLevelRole) {
        tourLevelRole.addEventListener('change', () => {
            appendSandboxAuditLog(`Level 5 reward role name set to <strong>@${tourLevelRole.value.trim() || 'Role'}</strong>.`);
        });
    }

    // Verification configs logs
    const tourVerifyEmail = document.getElementById('tour-verify-email');
    if (tourVerifyEmail) {
        tourVerifyEmail.addEventListener('change', () => {
            appendSandboxAuditLog(`Email verification gate requirement set to <strong>${tourVerifyEmail.checked ? 'ACTIVE' : 'INACTIVE'}</strong>.`);
        });
    }
    const tourVerifyRole = document.getElementById('tour-verify-role');
    if (tourVerifyRole) {
        tourVerifyRole.addEventListener('change', () => {
            appendSandboxAuditLog(`Verification success role mapped to <strong>@${tourVerifyRole.value.trim() || 'Role'}</strong>.`);
        });
    }

    // ─── LIVE STATUS CENTER SHARD DETAILS LOGIC ───
    const statusIndicators = document.querySelectorAll('.status-indicator');
    const statusDetailsPanel = document.getElementById('statusDetailsPanel');
    const statusDetailsContent = document.getElementById('statusDetailsContent');
    let activeStatus = null;

    statusIndicators.forEach(card => {
        card.addEventListener('click', () => {
            const statusType = card.getAttribute('data-status');
            const chevron = card.querySelector('i');

            statusIndicators.forEach(c => {
                const icon = c.querySelector('i');
                if (icon) icon.className = 'fa-solid fa-chevron-down';
            });

            if (activeStatus === statusType) {
                statusDetailsPanel.classList.remove('open');
                statusDetailsPanel.style.maxHeight = '0px';
                activeStatus = null;
            } else {
                activeStatus = statusType;
                if (chevron) chevron.className = 'fa-solid fa-chevron-up';

                let detailsHTML = '';
                if (statusType === 'api') {
                    detailsHTML = `
                        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
                            <h4 style="color:var(--cyan);font-weight:700;"><i class="fa-solid fa-server"></i> API Gateway Diagnostics</h4>
                            <span class="status-badge" style="background:rgba(16,185,129,0.1);color:var(--green);border:1px solid rgba(16,185,129,0.2);padding:2px 8px;font-size:11px;border-radius:4px;font-weight:700;">ALL HEALTHY</span>
                        </div>
                        <div class="status-details-grid">
                            <div class="status-detail-card">
                                <h4>Global REST API</h4>
                                <p>Latency: <strong>7.4ms</strong></p>
                                <p>Success Rate: <strong>99.98%</strong></p>
                            </div>
                            <div class="status-detail-card">
                                <h4>OAuth2 Authorizer</h4>
                                <p>Latency: <strong>14.2ms</strong></p>
                                <p>Success Rate: <strong>99.95%</strong></p>
                            </div>
                            <div class="status-detail-card">
                                <h4>Dashboard Webhook API</h4>
                                <p>Latency: <strong>4.8ms</strong></p>
                                <p>Success Rate: <strong>100%</strong></p>
                            </div>
                        </div>
                    `;
                } else if (statusType === 'gateway') {
                    detailsHTML = `
                        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
                            <h4 style="color:var(--cyan);font-weight:700;"><i class="fa-brands fa-discord"></i> Discord Webhook Gateway Real-time latency</h4>
                            <span class="status-badge" style="background:rgba(16,185,129,0.1);color:var(--green);border:1px solid rgba(16,185,129,0.2);padding:2px 8px;font-size:11px;border-radius:4px;font-weight:700;">STABLE WS</span>
                        </div>
                        <div class="status-details-grid">
                            <div class="status-detail-card">
                                <h4>Websocket Latency</h4>
                                <p>Heartbeat: <strong>11ms</strong></p>
                                <p>SSL Connection: <strong>TLS 1.3</strong></p>
                            </div>
                            <div class="status-detail-card">
                                <h4>Event Dispatch Rate</h4>
                                <p>Events: <strong>1,420 events/sec</strong></p>
                                <p>Buffer Status: <strong>0% queue</strong></p>
                            </div>
                        </div>
                    `;
                } else if (statusType === 'shards') {
                    detailsHTML = `
                        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
                            <h4 style="color:var(--cyan);font-weight:700;"><i class="fa-solid fa-network-wired"></i> Discord Shard Clusters</h4>
                            <span class="status-badge" style="background:rgba(0,242,254,0.1);color:var(--cyan);border:1px solid rgba(0,242,254,0.2);padding:2px 8px;font-size:11px;border-radius:4px;font-weight:700;">4 / 4 ACTIVE</span>
                        </div>
                        <div class="status-details-grid">
                            <div class="status-detail-card">
                                <h4>Shard 0 (Primary)</h4>
                                <p>Guilds: <strong>4,210</strong></p>
                                <p>Ping: <strong>12ms</strong></p>
                            </div>
                            <div class="status-detail-card">
                                <h4>Shard 1</h4>
                                <p>Guilds: <strong>3,904</strong></p>
                                <p>Ping: <strong>14ms</strong></p>
                            </div>
                            <div class="status-detail-card">
                                <h4>Shard 2</h4>
                                <p>Guilds: <strong>4,102</strong></p>
                                <p>Ping: <strong>9ms</strong></p>
                            </div>
                            <div class="status-detail-card">
                                <h4>Shard 3</h4>
                                <p>Guilds: <strong>3,212</strong></p>
                                <p>Ping: <strong>11ms</strong></p>
                            </div>
                        </div>
                    `;
                } else if (statusType === 'voice') {
                    detailsHTML = `
                        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
                            <h4 style="color:var(--cyan);font-weight:700;"><i class="fa-solid fa-volume-high"></i> Voice Relay Server nodes</h4>
                            <span class="status-badge" style="background:rgba(16,185,129,0.1);color:var(--green);border:1px solid rgba(16,185,129,0.2);padding:2px 8px;font-size:11px;border-radius:4px;font-weight:700;">100% ONLINE</span>
                        </div>
                        <div class="status-details-grid">
                            <div class="status-detail-card">
                                <h4>US East Voice Node</h4>
                                <p>Active streams: <strong>249</strong></p>
                                <p>CPU Load: <strong>12%</strong></p>
                            </div>
                            <div class="status-detail-card">
                                <h4>US West Voice Node</h4>
                                <p>Active streams: <strong>110</strong></p>
                                <p>CPU Load: <strong>8%</strong></p>
                            </div>
                            <div class="status-detail-card">
                                <h4>EU Central Voice Node</h4>
                                <p>Active streams: <strong>392</strong></p>
                                <p>CPU Load: <strong>18%</strong></p>
                            </div>
                        </div>
                    `;
                }

                statusDetailsContent.innerHTML = detailsHTML;
                statusDetailsPanel.classList.add('open');
                statusDetailsPanel.style.maxHeight = statusDetailsContent.scrollHeight + 40 + 'px';
            }
        });
    });

    // ─── COMMAND PALETTE LOGIC ───
    const cmdPalette = document.getElementById('cmdPalette');
    const cmdPaletteInput = document.getElementById('cmdPaletteInput');
    const cmdPaletteResults = document.getElementById('cmdPaletteResults');
    const navSearchBtn = document.getElementById('navSearchBtn');
    const cmdPaletteCloseBtn = document.getElementById('cmdPaletteCloseBtn');

    const cmdSearchDb = [
        { category: 'Sections', title: 'Go to Hero Section', desc: 'Scroll up to header top banner view', action: () => scrollToSection(document.body) },
        { category: 'Sections', title: 'Go to Features Grid', desc: 'Browse bot modules and anti-spam controls', action: () => scrollToSection('#features') },
        { category: 'Sections', title: 'Go to Interactive Playground', desc: 'Try out live bots interactive modules', action: () => scrollToSection('.demo-playground-wrapper') },
        { category: 'Sections', title: 'Go to Dashboard Sandbox Tour', desc: 'Manage simulated servers support tickets & logs', action: () => scrollToSection('#dashboard') },
        { category: 'Sections', title: 'Go to Pricing Plans', desc: 'Choose between Standard and Pro SaaS subscription tiers', action: () => scrollToSection('#pricing') },
        { category: 'Sections', title: 'Go to Shard Gateway Status Center', desc: 'Check voice node performance uptime and gateway latency', action: () => scrollToSection('.status-box') },
        { category: 'Sections', title: 'Go to FAQs', desc: 'Frequently asked developer question guides', action: () => scrollToSection('#faq') },

        { category: 'Bot Commands', title: '?help', desc: 'Copy bot help instruction manual command', action: () => copyCommandText('?help') },
        { category: 'Bot Commands', title: '?dashboard', desc: 'Copy command shortcut to get dashboard server invite link', action: () => copyCommandText('?dashboard') },
        { category: 'Bot Commands', title: '?vstest', desc: 'Copy command to run voice node response speed benchmark test', action: () => copyCommandText('?vstest') },
        { category: 'Bot Commands', title: '?avatar', desc: 'Copy command to display high quality user server profile picture', action: () => copyCommandText('?avatar') },
        { category: 'Bot Commands', title: '?rank', desc: 'Copy command to display user level experience leaderboards', action: () => copyCommandText('?rank') },

        { category: 'Quick Actions', title: 'Reset Sandbox & Playground Demos', desc: 'Restore simulated settings, ticket lists, and logs to factory defaults', action: () => resetAllDemos() },
        { category: 'Quick Actions', title: 'Test Bot Gateway Latency Check', desc: 'Perform live simulated WebSocket heartbeat timing validation', action: () => checkLivePing() },
        { category: 'Quick Actions', title: 'Toggle Page Color Lighting Mode', desc: 'Simulate high premium neon blue or deep obsidian darkness contrast', action: () => toggleObsidianMode() }
    ];

    let cmdActiveIndex = 0;
    let filteredCmds = [];

    function scrollToSection(selector) {
        const el = typeof selector === 'string' ? document.querySelector(selector) : selector;
        if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        hideCmdPalette();
    }

    function copyCommandText(text) {
        navigator.clipboard.writeText(text).then(() => {
            showToast(`Copied "${text}" to clipboard successfully!`, 'success');
        }).catch(() => {
            showToast(`Failed to copy "${text}".`, 'error');
        });
        hideCmdPalette();
    }

    function resetAllDemos() {
        const wInput = document.getElementById('welcome-input');
        const wTitle = document.getElementById('welcome-title-input');
        if (wInput) wInput.value = 'Aiden';
        if (wTitle) wTitle.value = 'Welcome to the Server';
        const wName = document.getElementById('welcome-preview-name');
        const wTitleP = document.getElementById('welcome-preview-title');
        if (wName) wName.textContent = 'Aiden';
        if (wTitleP) wTitleP.textContent = 'Welcome to the Server';

        const wCard = document.getElementById('welcomeCardPreview');
        if (wCard) wCard.style.background = 'linear-gradient(135deg, rgba(157, 78, 221, 0.15) 0%, rgba(0, 242, 254, 0.05) 100%)';
        const wAvatar = document.getElementById('welcomeAvatarPreview');
        if (wAvatar) {
            wAvatar.style.borderRadius = '50%';
            wAvatar.style.clipPath = 'none';
        }
        document.querySelectorAll('.theme-btn').forEach((b, idx) => {
            b.classList.toggle('active', idx === 0);
        });
        const wRadios = document.getElementsByName('avatar-shape');
        wRadios.forEach((r, idx) => r.checked = idx === 0);

        const queue = document.getElementById('tour-tickets-queue');
        if (queue) {
            queue.innerHTML = `
                <div class="tour-ticket-row" id="ticket-1041" style="display:flex;justify-content:space-between;align-items:center;background:rgba(255,255,255,0.02);padding:8px 12px;border-radius:var(--radius-sm);font-size:12px;">
                    <span>Ticket #1041 by <strong>Aiden</strong></span>
                    <div style="display:flex;gap:8px;align-items:center;">
                        <span class="status-badge" style="color:var(--gold);font-weight:700;">OPEN</span>
                        <button class="btn-ghost solve-ticket-btn" data-id="1041" style="padding:2px 8px;font-size:10px;border-color:rgba(255,255,255,0.1);">Close</button>
                    </div>
                </div>
            `;
        }

        const consoleEl = document.getElementById('sandboxAuditConsole');
        if (consoleEl) {
            consoleEl.innerHTML = '<div class="audit-line"><span style="color:var(--text-muted);">[SYSTEM]</span> Sandbox Dashboard initialized. Ready for operations.</div>';
        }

        showToast('All playground variables restored successfully.', 'success');
        hideCmdPalette();
    }

    function checkLivePing() {
        showToast('Checking WebSocket ping latency metrics...', 'info');
        setTimeout(() => {
            const ms = Math.floor(Math.random() * 5) + 6;
            showToast(`Bot Latency verified: healthy response in ${ms}ms.`, 'success');
        }, 800);
        hideCmdPalette();
    }

    function toggleObsidianMode() {
        document.body.classList.toggle('obsidian-contrast-mode');
        showToast('Contrast style toggled successfully.', 'info');
        hideCmdPalette();
    }

    function showToast(msg, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast-banner ${type}`;
        toast.style.cssText = `
            position: fixed;
            bottom: 24px;
            left: 24px;
            background: rgba(11, 15, 26, 0.95);
            border: 1px solid ${type === 'success' ? 'var(--green)' : type === 'error' ? '#ef4444' : 'var(--cyan)'};
            border-radius: var(--radius-sm);
            padding: 12px 16px;
            color: #fff;
            font-size: 13px;
            z-index: 99999;
            box-shadow: 0 10px 30px rgba(0,0,0,0.5);
            display: flex;
            align-items: center;
            gap: 10px;
            animation: toastEnter 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        `;

        let icon = '<i class="fa-solid fa-circle-check" style="color:var(--green)"></i>';
        if (type === 'error') icon = '<i class="fa-solid fa-circle-xmark" style="color:#ef4444"></i>';
        if (type === 'info') icon = '<i class="fa-solid fa-circle-info" style="color:var(--cyan)"></i>';

        toast.innerHTML = `${icon} <span>${msg}</span>`;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'toastLeave 0.3s forwards';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    const toastStyle = document.createElement('style');
    toastStyle.textContent = `
        @keyframes toastEnter {
            from { transform: translateY(20px) scale(0.9); opacity: 0; }
            to { transform: translateY(0) scale(1); opacity: 1; }
        }
        @keyframes toastLeave {
            to { transform: translateY(10px) scale(0.9); opacity: 0; }
        }
        .obsidian-contrast-mode {
            --bg-dark: #000000;
            --border: rgba(255,255,255,0.08);
            filter: contrast(1.05);
        }
    `;
    document.head.appendChild(toastStyle);

    function toggleCmdPalette() {
        if (!cmdPalette) return;
        const isHidden = cmdPalette.style.display === 'none';
        if (isHidden) {
            cmdPalette.style.display = 'flex';
            cmdPalette.setAttribute('aria-hidden', 'false');
            cmdPaletteInput.value = '';
            cmdPaletteInput.focus();
            renderCmdResults('');
        } else {
            hideCmdPalette();
        }
    }

    function hideCmdPalette() {
        if (!cmdPalette) return;
        cmdPalette.style.display = 'none';
        cmdPalette.setAttribute('aria-hidden', 'true');
    }

    function renderCmdResults(query) {
        if (!cmdPaletteResults) return;
        const normalizedQuery = query.toLowerCase().trim();

        filteredCmds = cmdSearchDb.filter(item =>
            item.title.toLowerCase().includes(normalizedQuery) ||
            item.desc.toLowerCase().includes(normalizedQuery) ||
            item.category.toLowerCase().includes(normalizedQuery)
        );

        cmdActiveIndex = 0;

        if (filteredCmds.length === 0) {
            cmdPaletteResults.innerHTML = `
                <div style="padding:24px;text-align:center;color:var(--text-muted);font-size:13px;">
                    <i class="fa-solid fa-triangle-exclamation" style="font-size:20px;margin-bottom:8px;display:block;color:var(--gold);"></i>
                    No search results found matching your query
                </div>
            `;
            return;
        }

        const groups = {};
        filteredCmds.forEach((item, index) => {
            if (!groups[item.category]) {
                groups[item.category] = [];
            }
            groups[item.category].push({ item, originalIndex: index });
        });

        let html = '';
        Object.keys(groups).forEach(cat => {
            html += `<div class="cmd-section-title">${cat}</div>`;
            groups[cat].forEach(data => {
                const isActive = data.originalIndex === cmdActiveIndex;
                let iconClass = 'fa-solid fa-arrow-pointer';
                if (cat === 'Bot Commands') iconClass = 'fa-solid fa-terminal';
                if (cat === 'Quick Actions') iconClass = 'fa-solid fa-bolt';

                html += `
                    <div class="cmd-item ${isActive ? 'active' : ''}" data-index="${data.originalIndex}">
                        <div class="cmd-item-icon"><i class="${iconClass}"></i></div>
                        <div class="cmd-item-info">
                            <span class="cmd-item-title">${data.item.title}</span>
                            <span class="cmd-item-desc">${data.item.desc}</span>
                        </div>
                    </div>
                `;
            });
        });

        cmdPaletteResults.innerHTML = html;

        const activeEl = cmdPaletteResults.querySelector('.cmd-item.active');
        if (activeEl) {
            activeEl.scrollIntoView({ block: 'nearest' });
        }
    }

    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
            e.preventDefault();
            toggleCmdPalette();
        }

        if (cmdPalette && cmdPalette.style.display !== 'none') {
            if (e.key === 'Escape') {
                hideCmdPalette();
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                cmdActiveIndex = (cmdActiveIndex + 1) % filteredCmds.length;
                updateActiveCmdItem();
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                cmdActiveIndex = (cmdActiveIndex - 1 + filteredCmds.length) % filteredCmds.length;
                updateActiveCmdItem();
            } else if (e.key === 'Enter') {
                e.preventDefault();
                if (filteredCmds[cmdActiveIndex]) {
                    filteredCmds[cmdActiveIndex].action();
                }
            }
        }
    });

    function updateActiveCmdItem() {
        const items = cmdPaletteResults.querySelectorAll('.cmd-item');
        items.forEach(el => {
            const idx = parseInt(el.getAttribute('data-index'), 10);
            el.classList.toggle('active', idx === cmdActiveIndex);
        });

        const activeEl = cmdPaletteResults.querySelector('.cmd-item.active');
        if (activeEl) {
            activeEl.scrollIntoView({ block: 'nearest' });
        }
    }

    if (navSearchBtn) navSearchBtn.addEventListener('click', toggleCmdPalette);
    if (cmdPaletteCloseBtn) cmdPaletteCloseBtn.addEventListener('click', hideCmdPalette);

    if (cmdPalette) {
        cmdPalette.addEventListener('click', (e) => {
            if (e.target === cmdPalette) hideCmdPalette();
        });
    }

    if (cmdPaletteInput) {
        cmdPaletteInput.addEventListener('input', () => {
            renderCmdResults(cmdPaletteInput.value);
        });
    }

    if (cmdPaletteResults) {
        cmdPaletteResults.addEventListener('click', (e) => {
            const item = e.target.closest('.cmd-item');
            if (item) {
                const idx = parseInt(item.getAttribute('data-index'), 10);
                if (filteredCmds[idx]) {
                    filteredCmds[idx].action();
                }
            }
        });
    }

    // Newsletter subscription form handler
    const newsletterForm = document.getElementById('newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const emailInput = newsletterForm.querySelector('input[type="email"]');
            if (emailInput) emailInput.value = '';
            showToast('Subscribed to Vivy updates successfully!', 'success');
        });
    }
});
