// ===== DOM READY =====
document.addEventListener('DOMContentLoaded', function () {

    // ===== LOADING SCREEN =====
    const loadingScreen = document.getElementById('loadingScreen');
    const loaderPct = document.getElementById('loaderPct');
    const loaderBar = document.getElementById('loaderBar');
    let pct = 0;
    let loaderCompleted = false;

    const pctTimer = setInterval(() => {
        if (!loaderCompleted) {
            pct = Math.min(pct + Math.random() * 3 + 1, 99);
            const floored = Math.floor(pct);
            if (loaderPct) loaderPct.textContent = floored + '%';
            if (loaderBar) loaderBar.style.width = floored + '%';
        }
    }, 50);

    function hideLoader() {
        if (loaderCompleted) return;
        loaderCompleted = true;
        clearInterval(pctTimer);
        if (loaderPct) loaderPct.textContent = '100%';
        if (loaderBar) loaderBar.style.width = '100%';

        setTimeout(() => {
            if (loadingScreen) {
                loadingScreen.classList.add('hidden');
                setTimeout(() => {
                    if (loadingScreen && loadingScreen.parentNode) {
                        loadingScreen.style.display = 'none';
                    }
                }, 600);
            }
        }, 200);
    }

    if (document.readyState === 'complete') {
        hideLoader();
    } else {
        window.addEventListener('load', hideLoader);
        setTimeout(() => {
            if (!loaderCompleted) hideLoader();
        }, 3000);
    }

    // ===== NAVIGATION =====
    const navbar = document.querySelector('.navbar');
    const navLinks = document.querySelectorAll('.nav-link');
    const navToggle = document.getElementById('navToggle');
    const navList = document.getElementById('navList');

    function updateNavbarOnScroll() {
        if (!navbar) return;
        navbar.classList.toggle('scrolled', window.scrollY > 20);
    }
    updateNavbarOnScroll();
    window.addEventListener('scroll', () => requestAnimationFrame(updateNavbarOnScroll), { passive: true });

    if (navToggle && navList) {
        navToggle.addEventListener('click', () => {
            const isOpen = navList.classList.toggle('open');
            navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
            document.body.style.overflow = isOpen ? 'hidden' : '';
        });
    }

    navLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href && href.startsWith('#')) {
                e.preventDefault();
                navLinks.forEach(l => l.classList.remove('active'));
                this.classList.add('active');
                const target = document.querySelector(href);
                if (target) {
                    window.scrollTo({ top: target.offsetTop - 56, behavior: 'smooth' });
                }
                if (navList && navList.classList.contains('open')) {
                    navList.classList.remove('open');
                    if (navToggle) navToggle.setAttribute('aria-expanded', 'false');
                    document.body.style.overflow = '';
                }
            }
        });
    });

    function updateActiveNavLink() {
        const scrollPos = window.scrollY + 100;
        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href && href.startsWith('#')) {
                const el = document.querySelector(href);
                if (el && scrollPos >= el.offsetTop && scrollPos < el.offsetTop + el.offsetHeight) {
                    navLinks.forEach(l => l.classList.remove('active'));
                    link.classList.add('active');
                }
            }
        });
    }
    window.addEventListener('scroll', () => requestAnimationFrame(updateActiveNavLink), { passive: true });

    // ===== HERO CAROUSEL =====
    (function initHeroCarousel() {
        const slides = document.querySelectorAll('.hero-slide');
        const dots = document.querySelectorAll('.hero-dot');
        const prevBtn = document.getElementById('heroPrev');
        const nextBtn = document.getElementById('heroNext');
        const playBtn = document.getElementById('heroPlay');
        if (!slides.length) return;

        let current = 0;
        let playing = true;
        let timer = null;
        const interval = 6000;

        function goTo(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach((s, i) => s.classList.toggle('is-active', i === current));
            dots.forEach((d, i) => d.classList.toggle('is-active', i === current));
        }

        function next() { goTo(current + 1); }
        function prev() { goTo(current - 1); }

        function startAutoplay() {
            stopAutoplay();
            timer = setInterval(next, interval);
        }
        function stopAutoplay() {
            if (timer) {
                clearInterval(timer);
                timer = null;
            }
        }

        if (nextBtn) nextBtn.addEventListener('click', () => { next(); startAutoplay(); });
        if (prevBtn) prevBtn.addEventListener('click', () => { prev(); startAutoplay(); });

        dots.forEach((dot, i) => {
            dot.addEventListener('click', () => { goTo(i); startAutoplay(); });
        });

        if (playBtn) {
            playBtn.addEventListener('click', () => {
                playing = !playing;
                playBtn.innerHTML = playing ? '<i class="fas fa-pause"></i>' : '<i class="fas fa-play"></i>';
                playBtn.setAttribute('aria-label', playing ? 'Pause carousel' : 'Play carousel');
                if (playing) startAutoplay(); else stopAutoplay();
            });
        }

        const carousel = document.querySelector('.hero-carousel');
        if (carousel) {
            carousel.addEventListener('mouseenter', stopAutoplay);
            carousel.addEventListener('mouseleave', () => { if (playing) startAutoplay(); });
        }

        document.addEventListener('visibilitychange', () => {
            if (document.hidden) stopAutoplay();
            else if (playing) startAutoplay();
        });

        startAutoplay();
    })();

    // ===== WORK PORTFOLIO: ACCORDION + FILTERING =====
    (function initWorkPortfolio() {
        const banners = document.querySelectorAll('.work-banner');
        const workBg = document.getElementById('workBg');
        const filterBtns = document.querySelectorAll('.work-filter');
        const emptyMsg = document.getElementById('workEmpty');
        if (!banners.length) return;

        function setBg(bg) {
            if (!bg || !workBg) return;
            workBg.classList.add('is-fading');
            setTimeout(() => {
                workBg.style.backgroundImage = `url('${bg}')`;
                workBg.classList.remove('is-fading');
            }, 200);
        }

        function activate(banner) {
            banners.forEach(b => {
                const active = b === banner;
                b.classList.toggle('is-active', active);
                b.setAttribute('aria-expanded', active ? 'true' : 'false');
            });
            setBg(banner.dataset.bg);
        }

        banners.forEach(banner => {
            banner.addEventListener('click', () => activate(banner));
            banner.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    activate(banner);
                }
            });
        });

        if (filterBtns.length) {
            filterBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    filterBtns.forEach(b => b.classList.remove('is-active'));
                    btn.classList.add('is-active');
                    const filter = btn.dataset.filter;

                    let firstVisible = null;
                    banners.forEach(b => {
                        const match = filter === 'all' || b.dataset.category === filter;
                        b.hidden = !match;
                        if (match && !firstVisible) firstVisible = b;
                    });

                    if (emptyMsg) emptyMsg.hidden = !!firstVisible;

                    if (firstVisible) {
                        if (!firstVisible.classList.contains('is-active')) {
                            activate(firstVisible);
                        } else {
                            setBg(firstVisible.dataset.bg);
                        }
                    }
                });
            });
        }
    })();

    // ===== LIVE STATS STRIP =====
    (function initStats() {
        const projectsEl = document.querySelector('[data-stat="projects"]');
        const stackEl = document.querySelector('[data-stat="stack"]');
        const loadEl = document.querySelector('[data-stat="load"]');
        const statsStrip = document.getElementById('statsStrip');
        if (!projectsEl && !stackEl && !loadEl) return;

        function countUp(el, target) {
            if (!el) return;
            const duration = 800;
            const start = performance.now();
            function step(now) {
                const progress = Math.min((now - start) / duration, 1);
                el.textContent = Math.round(progress * target);
                if (progress < 1) requestAnimationFrame(step);
            }
            requestAnimationFrame(step);
        }

        let counted = false;
        function runCounts() {
            if (counted) return;
            counted = true;
            if (projectsEl) countUp(projectsEl, document.querySelectorAll('.work-banner').length);
            if (stackEl) countUp(stackEl, document.querySelectorAll('.stack-badge').length);
        }

        if (statsStrip) {
            const obs = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        runCounts();
                        obs.disconnect();
                    }
                });
            }, { threshold: 0.3 });
            obs.observe(statsStrip);
        } else {
            runCounts();
        }

        function reportLoadTime() {
            if (!loadEl) return;
            const nav = performance.getEntriesByType ? performance.getEntriesByType('navigation')[0] : null;
            let ms = null;
            if (nav) {
                ms = Math.round(nav.loadEventEnd - nav.startTime);
            } else if (performance.timing) {
                ms = Math.round(performance.timing.loadEventEnd - performance.timing.navigationStart);
            }
            loadEl.textContent = (ms && ms > 0) ? ms + 'ms' : '< 1s';
        }
        if (document.readyState === 'complete') {
            setTimeout(reportLoadTime, 50);
        } else {
            window.addEventListener('load', () => setTimeout(reportLoadTime, 50));
        }
    })();

    // ===== LIVE FROM GITHUB =====
    (function initGithub() {
        const section = document.getElementById('github');
        const grid = document.getElementById('githubGrid');
        const fallback = document.getElementById('githubFallback');
        const reposStat = document.querySelector('[data-stat="repos"]');
        const ghRepos = document.getElementById('ghRepos');
        const ghFollowers = document.getElementById('ghFollowers');
        const ghSince = document.getElementById('ghSince');
        if (!section) return;

        const USERNAME = 'Alex-Sello7';
        const CACHE_KEY = 'cc_github_cache_v1';
        const CACHE_TTL = 10 * 60 * 1000;

        const LANG_COLORS = {
            JavaScript: '#f1e05a', TypeScript: '#3178c6', Python: '#3572A5',
            HTML: '#e34c26', CSS: '#563d7c', PHP: '#4F5D95', Java: '#b07219',
            'C#': '#178600', Vue: '#41b883', SCSS: '#c6538c'
        };

        function escapeHtml(str) {
            const div = document.createElement('div');
            div.textContent = str == null ? '' : String(str);
            return div.innerHTML;
        }

        function relativeTime(dateStr) {
            const diff = Date.now() - new Date(dateStr).getTime();
            const day = 86400000;
            if (diff < day) return 'today';
            const days = Math.floor(diff / day);
            if (days < 30) return `${days}d ago`;
            const months = Math.floor(days / 30);
            if (months < 12) return `${months}mo ago`;
            return `${Math.floor(months / 12)}y ago`;
        }

        function renderRepos(repos) {
            if (!grid) return;
            if (!repos || !repos.length) {
                grid.innerHTML = '';
                if (fallback) fallback.hidden = false;
                return;
            }
            grid.innerHTML = repos.map(repo => {
                const lang = repo.language || 'Code';
                const dotColor = LANG_COLORS[lang] || '#8a939e';
                return `
                    <a class="github-card" href="${escapeHtml(repo.html_url)}" target="_blank" rel="noopener noreferrer">
                        <span class="github-card-name"><i class="fas fa-code-branch"></i> ${escapeHtml(repo.name)}</span>
                        <p class="github-card-desc">${repo.description ? escapeHtml(repo.description) : 'No description provided.'}</p>
                        <div class="github-card-meta">
                            <span><span class="gh-lang-dot" style="background:${dotColor}"></span>${escapeHtml(lang)}</span>
                            <span><i class="fas fa-star"></i> ${repo.stargazers_count}</span>
                            <span><i class="fas fa-clock"></i> Updated ${relativeTime(repo.pushed_at)}</span>
                        </div>
                    </a>
                `;
            }).join('');
        }

        function applyData(data) {
            const user = data.user;
            const repos = data.repos;
            if (ghRepos) ghRepos.textContent = user.public_repos;
            if (ghFollowers) ghFollowers.textContent = user.followers;
            if (ghSince) ghSince.textContent = new Date(user.created_at).getFullYear();
            if (reposStat) reposStat.textContent = user.public_repos;
            renderRepos((repos || []).slice(0, 6));
        }

        function getCache() {
            try {
                const raw = sessionStorage.getItem(CACHE_KEY);
                if (!raw) return null;
                const parsed = JSON.parse(raw);
                if (Date.now() - parsed.ts > CACHE_TTL) return null;
                return parsed.data;
            } catch (e) {
                return null;
            }
        }
        function setCache(data) {
            try {
                sessionStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data }));
            } catch (e) {}
        }

        async function fetchGithub() {
            const cached = getCache();
            if (cached) {
                applyData(cached);
                return;
            }
            try {
                const [userRes, reposRes] = await Promise.all([
                    fetch(`https://api.github.com/users/${USERNAME}`),
                    fetch(`https://api.github.com/users/${USERNAME}/repos?sort=updated&per_page=6`)
                ]);
                if (!userRes.ok || !reposRes.ok) throw new Error('GitHub API error');
                const user = await userRes.json();
                const repos = await reposRes.json();
                const data = { user, repos };
                setCache(data);
                applyData(data);
            } catch (err) {
                console.error('GitHub fetch failed:', err);
                if (grid) grid.innerHTML = '';
                if (fallback) fallback.hidden = false;
            }
        }

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    fetchGithub();
                    observer.disconnect();
                }
            });
        }, { threshold: 0.1, rootMargin: '200px' });
        observer.observe(section);
    })();

    // ===== FORM SUBMISSION =====
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', async function (e) {
            e.preventDefault();
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalHTML = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
            submitBtn.disabled = true;

            try {
                const formData = new FormData(this);
                const response = await fetch(this.action, { method: 'POST', body: formData });
                const result = await response.json();

                if (response.ok && result.success) {
                    showAlert('Success! Your message has been sent. We\'ll get back to you soon.', 'success');
                    this.reset();
                } else {
                    throw new Error(result.message || 'Failed to send message');
                }
            } catch (error) {
                console.error('Form error:', error);
                showAlert('Oops! Something went wrong. Please try again or contact us directly.', 'error');
            } finally {
                submitBtn.innerHTML = originalHTML;
                submitBtn.disabled = false;
            }
        });
    }

    // ===== FORM VALIDATION WITH REAL-TIME FEEDBACK =====
    (function initFormValidation() {
        const form = document.getElementById('contactForm');
        if (!form) return;
        
        const inputs = form.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            input.addEventListener('blur', function() {
                validateField(this);
            });
            input.addEventListener('input', function() {
                if (this.classList.contains('error')) {
                    this.classList.remove('error');
                    const errorMsg = this.parentElement.querySelector('.field-error');
                    if (errorMsg) errorMsg.remove();
                }
            });
        });
        
        function validateField(field) {
            const value = field.value.trim();
            let isValid = true;
            let errorMessage = '';
            
            if (field.hasAttribute('required') && !value) {
                isValid = false;
                errorMessage = 'This field is required';
            } else if (field.type === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                isValid = false;
                errorMessage = 'Please enter a valid email address';
            } else if (field.id === 'cf-phone' && value && !/^[\+\d\s\-\(\)]{7,20}$/.test(value)) {
                isValid = false;
                errorMessage = 'Please enter a valid phone number';
            }
            
            const existingError = field.parentElement.querySelector('.field-error');
            if (existingError) existingError.remove();
            
            if (!isValid) {
                field.classList.add('error');
                const error = document.createElement('span');
                error.className = 'field-error';
                error.textContent = errorMessage;
                field.parentElement.appendChild(error);
            } else {
                field.classList.remove('error');
            }
            
            return isValid;
        }
        
        // Validate all fields on submit
        form.addEventListener('submit', function(e) {
            let allValid = true;
            const inputs = this.querySelectorAll('input, textarea');
            inputs.forEach(input => {
                if (!validateField(input)) {
                    allValid = false;
                }
            });
            if (!allValid) {
                e.preventDefault();
                showAlert('Please fix the highlighted fields before submitting.', 'error');
            }
        });
    })();

    // ===== SKELETON LOADER FOR SOLUTIONS CARDS =====
    (function addSolutionSkeletons() {
        const track = document.getElementById('solutionsTrack');
        if (!track) return;
        
        const cards = track.querySelectorAll('.solution-card');
        cards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            setTimeout(() => {
                card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, 100 + (index * 80));
        });
    })();

    // ===== FLOATING PARTICLES / ORBS FOR HERO =====
    (function initFloatingOrbs() {
        const hero = document.querySelector('.hero-carousel');
        if (!hero) return;
        
        // Only add if not already present
        if (hero.querySelector('.floating-orb')) return;
        
        const orbs = [
            { size: 200, x: '5%', y: '10%', delay: 0, color: 'rgba(124, 58, 237, 0.06)' },
            { size: 300, x: '80%', y: '60%', delay: 2, color: 'rgba(6, 182, 212, 0.05)' },
            { size: 150, x: '50%', y: '80%', delay: 4, color: 'rgba(236, 72, 153, 0.06)' },
        ];
        
        orbs.forEach(orb => {
            const el = document.createElement('div');
            el.className = 'floating-orb';
            el.style.cssText = `
                position: absolute;
                width: ${orb.size}px;
                height: ${orb.size}px;
                border-radius: 50%;
                background: ${orb.color};
                left: ${orb.x};
                top: ${orb.y};
                filter: blur(60px);
                pointer-events: none;
                z-index: 0;
                animation: floatOrb ${15 + orb.delay}s ease-in-out infinite alternate;
                animation-delay: ${orb.delay}s;
            `;
            hero.appendChild(el);
        });
        
        // Add keyframe animation if not exists
        if (!document.getElementById('orb-styles')) {
            const style = document.createElement('style');
            style.id = 'orb-styles';
            style.textContent = `
                @keyframes floatOrb {
                    0% { transform: translate(0, 0) scale(1); }
                    33% { transform: translate(30px, -20px) scale(1.1); }
                    66% { transform: translate(-20px, 30px) scale(0.9); }
                    100% { transform: translate(10px, -10px) scale(1.05); }
                }
            `;
            document.head.appendChild(style);
        }
    })();

    // ===== SCROLL PROGRESS INDICATOR =====
    (function initScrollProgress() {
        const bar = document.createElement('div');
        bar.className = 'scroll-progress';
        bar.style.cssText = `
            position: fixed;
            top: 56px;
            left: 0;
            height: 3px;
            background: linear-gradient(90deg, #7c3aed, #06b6d4, #ec4899);
            width: 0%;
            z-index: 999;
            transition: width 0.1s ease;
        `;
        document.body.appendChild(bar);
        
        window.addEventListener('scroll', () => {
            const scrollTop = window.scrollY;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const progress = (scrollTop / docHeight) * 100;
            bar.style.width = progress + '%';
        }, { passive: true });
    })();

    // ===== SMOOTH SCROLL FOR ALL ANCHOR LINKS =====
    (function initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                const targetId = this.getAttribute('href');
                if (targetId === '#') return;
                const target = document.querySelector(targetId);
                if (target) {
                    e.preventDefault();
                    const offsetTop = target.getBoundingClientRect().top + window.pageYOffset - 56;
                    window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    });
                }
            });
        });
    })();

    // ===== ANIMATE ON DISPLAY =====
    (function initAOD() {
        const aodElements = document.querySelectorAll('[data-aod]');
        if (!aodElements.length) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const el = entry.target;
                    const delay = parseInt(el.dataset.aodDelay || 0);
                    setTimeout(() => el.classList.add('aod-in'), delay);
                    observer.unobserve(el);
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -10% 0px' });

        aodElements.forEach(el => observer.observe(el));

        function revealVisible() {
            document.querySelectorAll('[data-aod]:not(.aod-in)').forEach(el => {
                const rect = el.getBoundingClientRect();
                if (rect.top < window.innerHeight && rect.bottom > 0) {
                    el.classList.add('aod-in');
                    observer.unobserve(el);
                }
            });
        }
        window.addEventListener('scroll', () => requestAnimationFrame(revealVisible), { passive: true });
        window.addEventListener('resize', revealVisible);
        setTimeout(revealVisible, 800);
    })();

    // ===== SET CURRENT YEAR =====
    const yearEl = document.getElementById('currentYear');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    // ===== CORRECT SCROLL POSITION FOR DIRECT HASH LINKS =====
    if (window.location.hash) {
        const target = document.querySelector(window.location.hash);
        if (target) {
            setTimeout(() => {
                window.scrollTo({ top: target.offsetTop - 56, behavior: 'auto' });
                const matchingLink = document.querySelector(`.nav-link[href="${window.location.hash}"]`);
                if (matchingLink) {
                    navLinks.forEach(l => l.classList.remove('active'));
                    matchingLink.classList.add('active');
                }
            }, 50);
        }
    }
});

// ===== UTILITIES =====
window.showAlert = function (message, type) {
    const existing = document.querySelector('.alert');
    if (existing) existing.remove();

    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.innerHTML = `
        <div class="alert-content">
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
            <span>${message}</span>
            <button class="alert-close" aria-label="Close alert"><i class="fas fa-times"></i></button>
        </div>
    `;
    document.body.appendChild(alert);
    setTimeout(() => alert.classList.add('show'), 10);

    alert.querySelector('.alert-close').addEventListener('click', () => {
        alert.classList.remove('show');
        setTimeout(() => alert.remove(), 300);
    });

    setTimeout(() => {
        if (alert.parentNode) {
            alert.classList.remove('show');
            setTimeout(() => alert.remove(), 300);
        }
    }, 5000);
};

window.addEventListener('error', function (e) {
    console.error('Global error:', e.error);
    if (e.message && e.message.includes('ResizeObserver')) e.preventDefault();
}, true);

window.addEventListener('unhandledrejection', function (e) {
    console.error('Unhandled rejection:', e.reason);
    e.preventDefault();
});