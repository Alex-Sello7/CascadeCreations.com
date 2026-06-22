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
                    window.scrollTo({ top: target.offsetTop - 60, behavior: 'smooth' });
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

    // ===== HERO CAROUSEL — Infinite loop with visible dots =====
    (function initHeroCarousel() {
        const slides = document.querySelectorAll('.hero-slide');
        const dots = document.querySelectorAll('.hero-dot');
        const prevBtn = document.getElementById('heroPrev');
        const nextBtn = document.getElementById('heroNext');
        if (!slides.length) return;

        let current = 0;
        let playing = true;
        let timer = null;
        let isTransitioning = false;
        const interval = 8000;

        function goTo(index, direction) {
            if (isTransitioning) return;
            isTransitioning = true;

            const newIndex = (index + slides.length) % slides.length;
            if (newIndex === current) { isTransitioning = false; return; }

            const dir = direction !== undefined ? direction : (newIndex > current ? 1 : -1);
            const enterFrom = dir >= 0 ? 'translateX(100%) scale(0.95)' : 'translateX(-100%) scale(0.95)';
            const exitTo    = dir >= 0 ? 'translateX(-100%) scale(0.95)' : 'translateX(100%) scale(0.95)';

            const currentSlide = slides[current];
            const nextSlide    = slides[newIndex];

            nextSlide.style.transition = 'none';
            nextSlide.style.transform  = enterFrom;
            nextSlide.style.opacity    = '0';
            nextSlide.style.visibility = 'visible';

            void nextSlide.offsetWidth;

            nextSlide.style.transition = '';
            nextSlide.style.transform  = 'translateX(0) scale(1)';
            nextSlide.style.opacity    = '1';

            currentSlide.style.transition = '';
            currentSlide.style.transform  = exitTo;
            currentSlide.style.opacity    = '0';

            dots.forEach((d, i) => d.classList.toggle('is-active', i === newIndex));

            setTimeout(() => {
                slides.forEach(s => {
                    s.classList.remove('is-active', 'is-exiting', 'is-entering');
                    s.style.cssText = '';
                });
                nextSlide.classList.add('is-active');
                current = newIndex;
                isTransitioning = false;
            }, 800);
        }

        function next() {
            if (!isTransitioning) goTo(current + 1, 1);
        }

        function prev() {
            if (!isTransitioning) goTo(current - 1, -1);
        }

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

        if (nextBtn) nextBtn.addEventListener('click', () => { next();
            startAutoplay(); });
        if (prevBtn) prevBtn.addEventListener('click', () => { prev();
            startAutoplay(); });

        dots.forEach((dot, i) => {
            dot.addEventListener('click', () => { goTo(i);
                startAutoplay(); });
        });

        const carousel = document.querySelector('.hero-carousel');
        if (carousel) {
            carousel.addEventListener('mouseenter', stopAutoplay);
            carousel.addEventListener('mouseleave', () => { if (playing) startAutoplay(); });
        }

        document.addEventListener('visibilitychange', () => {
            if (document.hidden) stopAutoplay();
            else if (playing) startAutoplay();
        });

        slides.forEach((s, i) => {
            s.classList.remove('is-active', 'is-exiting', 'is-entering');
            s.style.cssText = '';
            if (i === 0) {
                s.classList.add('is-active');
            }
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

    // ===== TAB 1: FORM SUBMISSION (General Enquiry - sends to Formspree) =====
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
                const response = await fetch(this.action, {
                    method: 'POST',
                    body: formData,
                    headers: { 'Accept': 'application/json' }
                });

                if (response.ok) {
                    showAlert('Success! Your message has been sent. We\'ll get back to you soon.', 'success');
                    this.reset();
                } else {
                    const result = await response.json().catch(() => ({}));
                    const msg = (result.errors && result.errors.map(e => e.message).join(', ')) || 'Failed to send message';
                    throw new Error(msg);
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

    // ===== TAB 2: PROJECT FORM (Saves to localStorage ONLY - no Formspree) =====
    (function initProjectForm() {
        const projectForm = document.getElementById('projectForm');
        if (!projectForm) return;

        const projectTypeSelect = document.getElementById('pf-project-type');
        const budgetSelect = document.getElementById('pf-budget');
        const timelineSelect = document.getElementById('pf-timeline');

        // Store references to specific options
        let budgetUnder5k = null;
        let timelineUrgent = null;
        let timelineFlexible = null;

        // Function to initialize option references
        function initOptions() {
            if (budgetSelect) {
                budgetUnder5k = budgetSelect.querySelector('#budget-under-5k') || 
                               Array.from(budgetSelect.options).find(opt => opt.value === 'under-5k');
            }
            if (timelineSelect) {
                timelineUrgent = timelineSelect.querySelector('#timeline-urgent') || 
                                Array.from(timelineSelect.options).find(opt => opt.value === 'urgent');
                timelineFlexible = timelineSelect.querySelector('#timeline-flexible') || 
                                  Array.from(timelineSelect.options).find(opt => opt.value === 'flexible');
            }
        }

        // Function to apply restrictions based on project type
        function applyRestrictions(projectType) {
            if (!projectType) {
                resetOptions();
                return;
            }

            // Project types that require restrictions
            const restrictedTypes = ['dashboard', 'ecommerce', 'custom-system'];

            if (restrictedTypes.includes(projectType)) {
                // Grey out budget "Under R5,000"
                if (budgetUnder5k && budgetSelect) {
                    budgetUnder5k.disabled = true;
                    budgetUnder5k.classList.add('greyed-out');
                    budgetUnder5k.textContent = '⛔ Under R5,000 (not available)';
                    if (budgetSelect.value === 'under-5k') {
                        budgetSelect.value = '';
                    }
                }

                // Grey out timeline "Urgent" and "Flexible"
                if (timelineUrgent && timelineSelect) {
                    timelineUrgent.disabled = true;
                    timelineUrgent.classList.add('greyed-out');
                    timelineUrgent.textContent = '⛔ Urgent (not available)';
                    if (timelineSelect.value === 'urgent') {
                        timelineSelect.value = '';
                    }
                }
                if (timelineFlexible && timelineSelect) {
                    timelineFlexible.disabled = true;
                    timelineFlexible.classList.add('greyed-out');
                    timelineFlexible.textContent = '⛔ Flexible (not available)';
                    if (timelineSelect.value === 'flexible') {
                        timelineSelect.value = '';
                    }
                }

                // Add visual hint to the select fields
                if (budgetSelect) budgetSelect.style.borderColor = '#d4a000';
                if (timelineSelect) timelineSelect.style.borderColor = '#d4a000';

            } else {
                resetOptions();
            }
        }

        // Function to reset all options to enabled
        function resetOptions() {
            // Reset budget options
            if (budgetUnder5k && budgetSelect) {
                budgetUnder5k.disabled = false;
                budgetUnder5k.classList.remove('greyed-out');
                budgetUnder5k.textContent = 'Under R5,000';
            }
            
            // Reset timeline options
            if (timelineUrgent && timelineSelect) {
                timelineUrgent.disabled = false;
                timelineUrgent.classList.remove('greyed-out');
                timelineUrgent.textContent = 'Urgent (Within 2 weeks)';
            }
            if (timelineFlexible && timelineSelect) {
                timelineFlexible.disabled = false;
                timelineFlexible.classList.remove('greyed-out');
                timelineFlexible.textContent = 'Flexible';
            }

            // Reset select border colors
            if (budgetSelect) budgetSelect.style.borderColor = '';
            if (timelineSelect) timelineSelect.style.borderColor = '';
        }

        // Initialize options references
        initOptions();

        // Listen for project type changes
        if (projectTypeSelect) {
            projectTypeSelect.addEventListener('change', function() {
                applyRestrictions(this.value);
            });

            // Also trigger on page load if a value is pre-selected
            if (projectTypeSelect.value) {
                setTimeout(() => {
                    applyRestrictions(projectTypeSelect.value);
                }, 100);
            }
        }

        // File upload handling
        const fileInput = document.getElementById('pf-assets');
        const fileList = document.getElementById('fileList');
        const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB
        const ALLOWED_TYPES = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'image/png',
            'image/jpeg',
            'image/gif',
            'image/svg+xml',
            'application/zip',
            'application/x-rar-compressed',
            'application/x-rar'
        ];

        if (fileInput && fileList) {
            let selectedFiles = [];

            fileInput.addEventListener('change', function (e) {
                const files = Array.from(e.target.files || []);
                files.forEach(file => {
                    if (!ALLOWED_TYPES.includes(file.type) && !file.name.match(/\.(pdf|doc|docx|png|jpg|jpeg|gif|svg|zip|rar)$/i)) {
                        showAlert(`"${file.name}" is not a supported file type.`, 'error');
                        return;
                    }
                    if (file.size > MAX_FILE_SIZE) {
                        showAlert(`"${file.name}" exceeds the 20MB limit.`, 'error');
                        return;
                    }
                    if (selectedFiles.some(f => f.name === file.name && f.size === file.size)) {
                        return;
                    }
                    selectedFiles.push(file);
                });
                renderFileList();
                fileInput.value = '';
            });

            function renderFileList() {
                fileList.innerHTML = selectedFiles.map((file, index) => {
                    const icon = file.type.startsWith('image/') ? 'fa-image' :
                        file.type === 'application/pdf' ? 'fa-file-pdf' :
                        file.type.includes('word') ? 'fa-file-word' :
                        file.type.includes('zip') || file.type.includes('rar') ? 'fa-file-archive' :
                        'fa-file';
                    const size = (file.size / 1024).toFixed(1) + ' KB';
                    return `
                            <span class="file-upload-item">
                                <i class="fas ${icon}"></i>
                                <span>${escapeHtml(file.name)} (${size})</span>
                                <span class="file-remove" data-index="${index}"><i class="fas fa-times"></i></span>
                            </span>
                        `;
                }).join('');

                fileList.querySelectorAll('.file-remove').forEach(btn => {
                    btn.addEventListener('click', function () {
                        const index = parseInt(this.dataset.index);
                        selectedFiles.splice(index, 1);
                        renderFileList();
                    });
                });
            }

            // Drag and drop support
            const uploadLabel = document.querySelector('.file-upload-label');
            if (uploadLabel) {
                uploadLabel.addEventListener('dragover', function (e) {
                    e.preventDefault();
                    this.style.borderColor = 'var(--primary)';
                    this.style.background = 'var(--primary-tint)';
                });
                uploadLabel.addEventListener('dragleave', function (e) {
                    e.preventDefault();
                    this.style.borderColor = '';
                    this.style.background = '';
                });
                uploadLabel.addEventListener('drop', function (e) {
                    e.preventDefault();
                    this.style.borderColor = '';
                    this.style.background = '';
                    const files = Array.from(e.dataTransfer.files || []);
                    const dataTransfer = new DataTransfer();
                    files.forEach(f => dataTransfer.items.add(f));
                    fileInput.files = dataTransfer.files;
                    fileInput.dispatchEvent(new Event('change'));
                });
            }
        }

        function escapeHtml(str) {
            const div = document.createElement('div');
            div.textContent = str == null ? '' : String(str);
            return div.innerHTML;
        }

        // ===== PROJECT FORM SUBMISSION - Saves to localStorage ONLY =====
        projectForm.addEventListener('submit', function (e) {
            e.preventDefault();

            // Validate required fields
            const required = this.querySelectorAll('[required]');
            let valid = true;
            required.forEach(field => {
                const value = field.value.trim();
                if (!value) {
                    field.classList.add('error');
                    valid = false;
                    const parent = field.parentElement;
                    let error = parent.querySelector('.field-error');
                    if (!error) {
                        error = document.createElement('span');
                        error.className = 'field-error';
                        error.textContent = 'This field is required';
                        parent.appendChild(error);
                    }
                } else {
                    field.classList.remove('error');
                    const error = field.parentElement.querySelector('.field-error');
                    if (error) error.remove();
                }
            });

            // Validate email
            const emailField = document.getElementById('pf-email');
            if (emailField && emailField.value.trim()) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(emailField.value.trim())) {
                    emailField.classList.add('error');
                    const parent = emailField.parentElement;
                    let error = parent.querySelector('.field-error');
                    if (!error) {
                        error = document.createElement('span');
                        error.className = 'field-error';
                        error.textContent = 'Please enter a valid email address';
                        parent.appendChild(error);
                    }
                    valid = false;
                }
            }

            // Check if any greyed-out options are still selected
            if (budgetSelect && budgetUnder5k && budgetUnder5k.disabled && budgetSelect.value === 'under-5k') {
                budgetSelect.classList.add('error');
                valid = false;
                const parent = budgetSelect.parentElement;
                let error = parent.querySelector('.field-error');
                if (!error) {
                    error = document.createElement('span');
                    error.className = 'field-error';
                    error.textContent = 'This budget option is not available for the selected project type';
                    parent.appendChild(error);
                }
            }

            if (timelineSelect) {
                if (timelineUrgent && timelineUrgent.disabled && timelineSelect.value === 'urgent') {
                    timelineSelect.classList.add('error');
                    valid = false;
                    const parent = timelineSelect.parentElement;
                    let error = parent.querySelector('.field-error');
                    if (!error) {
                        error = document.createElement('span');
                        error.className = 'field-error';
                        error.textContent = 'This timeline option is not available for the selected project type';
                        parent.appendChild(error);
                    }
                }
                if (timelineFlexible && timelineFlexible.disabled && timelineSelect.value === 'flexible') {
                    timelineSelect.classList.add('error');
                    valid = false;
                    const parent = timelineSelect.parentElement;
                    let error = parent.querySelector('.field-error');
                    if (!error) {
                        error = document.createElement('span');
                        error.className = 'field-error';
                        error.textContent = 'This timeline option is not available for the selected project type';
                        parent.appendChild(error);
                    }
                }
            }

            if (!valid) {
                showAlert('Please fix the highlighted fields before submitting.', 'error');
                return;
            }

            // Get selected files
            const fileInput = document.getElementById('pf-assets');
            const selectedFiles = Array.from(fileInput.files || []);

            // Build project data with all fields
            const formData = new FormData(this);
            const projectData = {
                id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
                name: formData.get('name') || '',
                email: formData.get('email') || '',
                phone: formData.get('phone') || '',
                projectName: formData.get('projectName') || '',
                projectType: formData.get('projectType') || '',
                description: formData.get('description') || '',
                budget: formData.get('budget') || '',
                timeline: formData.get('timeline') || '',
                files: selectedFiles.map(f => ({
                    name: f.name,
                    size: f.size,
                    type: f.type
                })),
                status: 'new',
                notes: '',
                submittedAt: new Date().toISOString(),
                depositPaid: false,
                depositAmount: 0,
                depositDate: null,
                projectStartDate: null,
                projectEndDate: null,
                estimatedCompletion: null,
                lastUpdated: new Date().toISOString()
            };

            // Show loading state
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalHTML = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
            submitBtn.disabled = true;

            // Save to localStorage ONLY - NO Formspree
            try {
                const existing = JSON.parse(localStorage.getItem('cascade_project_briefs') || '[]');
                existing.push(projectData);
                localStorage.setItem('cascade_project_briefs', JSON.stringify(existing));

                console.log('✅ Project saved to localStorage:', projectData);
                console.log('📋 Total projects:', existing.length);

                showAlert('✅ Your project brief has been submitted! We\'ll be in touch within 24 hours.', 'success');
                this.reset();
                
                const fileList = document.getElementById('fileList');
                if (fileList) fileList.innerHTML = '';
                if (fileInput) fileInput.value = '';
                // Clear the selectedFiles array
                selectedFiles.length = 0;

                // Reset restrictions after form reset
                resetOptions();

            } catch (error) {
                console.error('❌ Error saving project:', error);
                showAlert('❌ Error submitting project. Please try again.', 'error');
            } finally {
                submitBtn.innerHTML = originalHTML;
                submitBtn.disabled = false;
            }
        });

        // Real-time validation removal
        projectForm.querySelectorAll('input, textarea, select').forEach(field => {
            field.addEventListener('input', function () {
                if (this.classList.contains('error')) {
                    this.classList.remove('error');
                    const error = this.parentElement.querySelector('.field-error');
                    if (error) error.remove();
                }
            });
            field.addEventListener('change', function () {
                if (this.classList.contains('error')) {
                    this.classList.remove('error');
                    const error = this.parentElement.querySelector('.field-error');
                    if (error) error.remove();
                }
            });
        });
    })();

    // ===== CONTACT TAB SWITCHING =====
    (function initContactTabs() {
        const tabBtns = document.querySelectorAll('.contact-tab-btn');
        const panels = document.querySelectorAll('.contact-tab-panel');

        if (!tabBtns.length || !panels.length) return;

        tabBtns.forEach(btn => {
            btn.addEventListener('click', function () {
                const targetTab = this.dataset.tab;

                tabBtns.forEach(b => b.classList.remove('is-active'));
                this.classList.add('is-active');

                panels.forEach(p => p.classList.remove('is-active'));
                const targetPanel = document.getElementById(`tab-${targetTab}`);
                if (targetPanel) targetPanel.classList.add('is-active');
            });
        });

        if (window.location.hash === '#start-project') {
            const projectTab = document.querySelector('[data-tab="project"]');
            if (projectTab) projectTab.click();
        }
    })();

    // ===== FORM VALIDATION (General Enquiry) =====
    (function initFormValidation() {
        const form = document.getElementById('contactForm');
        if (!form) return;

        const inputs = form.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            input.addEventListener('blur', function () {
                validateField(this);
            });
            input.addEventListener('input', function () {
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

        form.addEventListener('submit', function (e) {
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
        if (hero.querySelector('.floating-orb')) return;

        const orbs = [
            { size: 200, x: '5%', y: '10%', delay: 0, color: 'rgba(0, 102, 204, 0.04)' },
            { size: 300, x: '80%', y: '60%', delay: 2, color: 'rgba(0, 150, 136, 0.04)' },
            { size: 150, x: '50%', y: '80%', delay: 4, color: 'rgba(94, 60, 158, 0.04)' },
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
            anchor.addEventListener('click', function (e) {
                const targetId = this.getAttribute('href');
                if (targetId === '#') return;
                const target = document.querySelector(targetId);
                if (target) {
                    e.preventDefault();
                    const offsetTop = target.getBoundingClientRect().top + window.pageYOffset - 60;
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
                window.scrollTo({ top: target.offsetTop - 60, behavior: 'auto' });
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