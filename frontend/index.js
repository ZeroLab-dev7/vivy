// Navbar Scrolled Effect
        const navbar = document.getElementById('navbar');
        window.addEventListener('scroll', () => {
            navbar.classList.toggle('scrolled', window.scrollY > 20);
        });

        // Mobile Menu Toggle
        const mobileMenuBtn = document.getElementById('mobileMenuBtn');
        const mobileMenu = document.getElementById('mobileMenu');

        mobileMenuBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('open');
            const icon = mobileMenuBtn.querySelector('i');
            icon.className = mobileMenu.classList.contains('open') ? 'fa-solid fa-xmark' : 'fa-solid fa-bars';
        });

        // Close mobile menu on link click
        mobileMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.remove('open');
                mobileMenuBtn.querySelector('i').className = 'fa-solid fa-bars';
            });
        });

        // Interactive Pricing Toggle
        const pricingToggleBtn = document.getElementById('pricingToggleBtn');
        const labelMonthly = document.getElementById('label-monthly');
        const labelYearly = document.getElementById('label-yearly');
        const priceAmount = document.getElementById('pro-price-amount');
        const pricePeriod = document.getElementById('pro-price-period');

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

        // Mouse Spotlight Glow Effect for Bento Cards
        const bentoCards = document.querySelectorAll('.feature-card');
        bentoCards.forEach(card => {
            card.addEventListener('mousemove', e => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                card.style.setProperty('--mouse-x', `${x}px`);
                card.style.setProperty('--mouse-y', `${y}px`);
            });
        });

        // Live Event Ticker Logs Loop
        const tickerConsole = document.getElementById('ticker-console');
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

        function addTickerLine() {
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

            // Limit log lines shown to keep height consistent
            if (tickerConsole.children.length > 5) {
                tickerConsole.removeChild(tickerConsole.firstChild);
            }

            // Auto scroll inside console wrapper
            tickerConsole.scrollTop = tickerConsole.scrollHeight;

            eventIndex = (eventIndex + 1) % eventsList.length;
        }

        // Initialize ticker lines
        for (let i = 0; i < 3; i++) {
            setTimeout(addTickerLine, i * 400);
        }
        setInterval(addTickerLine, 3500);

        // Smooth Viewport Intersection Fade In Animation
        const sectionsToFade = document.querySelectorAll('.fade-in-section');
        const options = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const sectionObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, options);

        sectionsToFade.forEach(section => {
            sectionObserver.observe(section);
        });

        // FAQ Toggles
        document.querySelectorAll('.faq-q').forEach(btn => {
            btn.addEventListener('click', () => {
                const item = btn.parentElement;
                const isOpen = item.classList.contains('open');

                // Close other items
                document.querySelectorAll('.faq-item').forEach(i => {
                    i.classList.remove('open');
                    i.querySelector('.faq-q').setAttribute('aria-expanded', 'false');
                });

                if (!isOpen) {
                    item.classList.add('open');
                    btn.setAttribute('aria-expanded', 'true');
                }
            });
        });

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
        window.addEventListener('DOMContentLoaded', checkAuthState);
