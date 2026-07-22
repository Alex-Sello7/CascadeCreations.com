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
                
                // Hide the floating CTA immediately on nav click
                const floatingCTA = document.querySelector('.floating-cta');
                if (floatingCTA) {
                    floatingCTA.classList.remove('visible', 'inflate');
                }
                
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
        const interval = 10000; // 10 seconds per slide

        function goTo(index) {
            // Prevent multiple transitions at once
            if (isTransitioning) return;
            
            // Normalize index
            const newIndex = ((index % slides.length) + slides.length) % slides.length;
            
            // If already on this slide, do nothing
            if (newIndex === current) return;
            
            isTransitioning = true;

            const currentSlide = slides[current];
            const nextSlide = slides[newIndex];

            // Determine direction (for animation)
            const direction = newIndex > current ? 1 : -1;
            const enterFrom = direction === 1 ? 'translateX(100%) scale(0.95)' : 'translateX(-100%) scale(0.95)';
            const exitTo = direction === 1 ? 'translateX(-100%) scale(0.95)' : 'translateX(100%) scale(0.95)';

            // Reset next slide and position it off-screen
            nextSlide.style.transition = 'none';
            nextSlide.style.transform = enterFrom;
            nextSlide.style.opacity = '0';
            nextSlide.style.visibility = 'visible';

            // Force reflow
            void nextSlide.offsetWidth;

            // Set current slide to exit
            currentSlide.style.transition = 'transform 0.8s cubic-bezier(0.65, 0, 0.35, 1), opacity 0.8s cubic-bezier(0.65, 0, 0.35, 1)';
            currentSlide.style.transform = exitTo;
            currentSlide.style.opacity = '0';

            // Bring next slide in
            nextSlide.style.transition = 'transform 0.8s cubic-bezier(0.65, 0, 0.35, 1), opacity 0.8s cubic-bezier(0.65, 0, 0.35, 1)';
            nextSlide.style.transform = 'translateX(0) scale(1)';
            nextSlide.style.opacity = '1';

            // Update dots
            dots.forEach((d, i) => {
                d.classList.toggle('is-active', i === newIndex);
                // Reset dot animation by re-adding the class
                if (i === newIndex) {
                    d.style.animation = 'none';
                    void d.offsetWidth;
                    d.style.animation = '';
                }
            });

            // Update current index after transition
            setTimeout(() => {
                // Clean up all slides
                slides.forEach(s => {
                    s.classList.remove('is-active', 'is-exiting', 'is-entering');
                    s.style.cssText = '';
                });
                
                // Set the new active slide
                nextSlide.classList.add('is-active');
                current = newIndex;
                isTransitioning = false;
            }, 850); // Slightly longer than the transition duration
        }

        function next() {
            if (!isTransitioning) {
                goTo(current + 1);
            }
        }

        function prev() {
            if (!isTransitioning) {
                goTo(current - 1);
            }
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

        // Event listeners
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                next();
                startAutoplay(); // Reset timer on manual interaction
            });
        }
        
        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                prev();
                startAutoplay(); // Reset timer on manual interaction
            });
        }

        dots.forEach((dot, i) => {
            dot.addEventListener('click', () => {
                goTo(i);
                startAutoplay(); // Reset timer on manual interaction
            });
        });

        // Pause on hover
        const carousel = document.querySelector('.hero-carousel');
        if (carousel) {
            carousel.addEventListener('mouseenter', stopAutoplay);
            carousel.addEventListener('mouseleave', () => {
                if (playing) startAutoplay();
            });
        }

        // Pause when tab is hidden
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                stopAutoplay();
            } else if (playing) {
                startAutoplay();
            }
        });

        // Initialize first slide
        slides.forEach((s, i) => {
            s.classList.remove('is-active', 'is-exiting', 'is-entering');
            s.style.cssText = '';
            if (i === 0) {
                s.classList.add('is-active');
                s.style.transform = 'translateX(0) scale(1)';
                s.style.opacity = '1';
                s.style.visibility = 'visible';
            } else {
                s.style.transform = 'translateX(100%) scale(0.95)';
                s.style.opacity = '0';
                s.style.visibility = 'hidden';
            }
        });

        // Start autoplay
        startAutoplay();

        // Handle window resize - ensure slides maintain correct positioning
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                // Reset current slide position if needed
                const activeSlide = slides[current];
                if (activeSlide) {
                    activeSlide.style.transform = 'translateX(0) scale(1)';
                    activeSlide.style.opacity = '1';
                }
            }, 200);
        });
    })();

    // ===== FLOATING CTA - Hide on hero, contact, and footer =====
    (function initFloatingCTA() {
        const floatingCTA = document.querySelector('.floating-cta');
        if (!floatingCTA) return;

        let hasAnimated = false;
        let isVisible = false;
        let isNavClicking = false;
        let navClickTimeout = null;

        function checkScrollPosition() {
            // Don't check during nav click animation
            if (isNavClicking) return;

            const hero = document.querySelector('.hero-carousel');
            const contact = document.getElementById('contact');
            const footer = document.querySelector('.footer');
            
            if (!hero) {
                // Fallback: show after 100px scroll but hide on contact/footer
                const isAtContact = contact && isElementInViewport(contact);
                const isAtFooter = footer && isElementInViewport(footer);
                
                if (window.scrollY > 100 && !isAtContact && !isAtFooter && !isVisible) {
                    showCTA();
                } else if ((window.scrollY <= 100 || isAtContact || isAtFooter) && isVisible) {
                    hideCTA();
                }
                return;
            }

            const scrollY = window.scrollY;
            const windowHeight = window.innerHeight;

            // Check if we're on the hero section
            const heroBottom = hero.offsetTop + hero.offsetHeight;
            const isOnHero = scrollY < heroBottom - 100;

            // Check if we're on the contact section
            let isOnContact = false;
            if (contact) {
                const contactTop = contact.offsetTop;
                const contactBottom = contactTop + contact.offsetHeight;
                // Consider the contact section as active when it's in view or near it
                isOnContact = scrollY + windowHeight * 0.3 > contactTop && scrollY < contactBottom - 100;
            }

            // Check if we're on the footer
            let isOnFooter = false;
            if (footer) {
                const footerTop = footer.offsetTop;
                isOnFooter = scrollY + windowHeight * 0.3 > footerTop;
            }

            // Check if we should show the CTA
            const shouldShow = !isOnHero && !isOnContact && !isOnFooter;

            if (shouldShow && !isVisible) {
                showCTA();
            } else if (!shouldShow && isVisible) {
                hideCTA();
            }
        }

        // Helper function to check if an element is in the viewport
        function isElementInViewport(el) {
            const rect = el.getBoundingClientRect();
            const buffer = 100; // Buffer to account for partial visibility
            return rect.top < window.innerHeight + buffer && rect.bottom > -buffer;
        }

        function showCTA() {
            if (isVisible || isNavClicking) return;
            isVisible = true;
            
            // Remove any existing classes first
            floatingCTA.classList.remove('inflate');
            
            // Force reflow
            void floatingCTA.offsetWidth;
            
            // Add visible class to show it, then trigger inflate animation
            floatingCTA.classList.add('visible');
            
            // If this is the first time showing, add the inflate animation
            if (!hasAnimated) {
                hasAnimated = true;
                // Small delay to ensure the visible class is applied
                setTimeout(() => {
                    floatingCTA.classList.add('inflate');
                }, 50);
            }
            
            // Remove the inflate class after animation completes
            setTimeout(() => {
                floatingCTA.classList.remove('inflate');
            }, 1000);
        }

        function hideCTA() {
            if (!isVisible) return;
            isVisible = false;
            floatingCTA.classList.remove('visible', 'inflate');
        }

        // Function to handle nav clicks
        function handleNavClick() {
            // Immediately hide the CTA
            hideCTA();
            
            // Set flag to prevent scroll checks during animation
            isNavClicking = true;
            
            // Clear any existing timeout
            if (navClickTimeout) {
                clearTimeout(navClickTimeout);
            }
            
            // After the smooth scroll completes (check after animation)
            navClickTimeout = setTimeout(() => {
                isNavClicking = false;
                // Force a check after the scroll completes
                setTimeout(checkScrollPosition, 100);
            }, 800); // Slightly longer than the smooth scroll
        }

        // Hook into nav link clicks
        document.querySelectorAll('.nav-link[href^="#"]').forEach(link => {
            link.addEventListener('click', function(e) {
                // Only handle internal hash links
                const href = this.getAttribute('href');
                if (href && href.startsWith('#') && href !== '#') {
                    // Small delay to let the nav click event propagate
                    setTimeout(handleNavClick, 10);
                }
            });
        });

        // Throttled scroll listener
        let ticking = false;
        window.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    checkScrollPosition();
                    ticking = false;
                });
                ticking = true;
            }
        }, { passive: true });

        // Check on load
        setTimeout(checkScrollPosition, 100);
        window.addEventListener('resize', checkScrollPosition, { passive: true });
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

    // ===== TAB 2: PROJECT FORM - Sends to Formspree with proper labels =====
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
                               Array.from(budgetSelect.options).find(opt => opt.value === 'Under R5,000');
            }
            if (timelineSelect) {
                timelineUrgent = timelineSelect.querySelector('#timeline-urgent') || 
                                Array.from(timelineSelect.options).find(opt => opt.value === 'Urgent (Within 2 weeks)');
                timelineFlexible = timelineSelect.querySelector('#timeline-flexible') || 
                                  Array.from(timelineSelect.options).find(opt => opt.value === 'Flexible');
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
                    if (budgetSelect.value === 'Under R5,000') {
                        budgetSelect.value = '';
                    }
                }

                // Grey out timeline "Urgent" and "Flexible"
                if (timelineUrgent && timelineSelect) {
                    timelineUrgent.disabled = true;
                    timelineUrgent.classList.add('greyed-out');
                    timelineUrgent.textContent = '⛔ Urgent (not available)';
                    if (timelineSelect.value === 'Urgent (Within 2 weeks)') {
                        timelineSelect.value = '';
                    }
                }
                if (timelineFlexible && timelineSelect) {
                    timelineFlexible.disabled = true;
                    timelineFlexible.classList.add('greyed-out');
                    timelineFlexible.textContent = '⛔ Flexible (not available)';
                    if (timelineSelect.value === 'Flexible') {
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
        const agreeCheckbox = document.getElementById('pf-agree');
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

        let selectedFiles = [];

        // Track if files are selected
        function hasFilesSelected() {
            return selectedFiles.length > 0;
        }

        // Update checkbox requirement based on files
        function updateCheckboxRequirement() {
            if (!agreeCheckbox) return;
            const hasFiles = hasFilesSelected();
            // We don't make it required in HTML, but we'll validate in JS
            // Just add a data attribute for validation
            agreeCheckbox.dataset.requiredWhenFiles = hasFiles ? 'true' : 'false';
        }

        if (fileInput && fileList) {
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
                updateCheckboxRequirement();
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
                        updateCheckboxRequirement();
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

        // ===== PROJECT FORM SUBMISSION - Sends to Formspree =====
        projectForm.addEventListener('submit', async function (e) {
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
            if (budgetSelect && budgetUnder5k && budgetUnder5k.disabled && budgetSelect.value === 'Under R5,000') {
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
                if (timelineUrgent && timelineUrgent.disabled && timelineSelect.value === 'Urgent (Within 2 weeks)') {
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
                if (timelineFlexible && timelineFlexible.disabled && timelineSelect.value === 'Flexible') {
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

            // NEW: Check if files are selected and checkbox is NOT checked
            if (hasFilesSelected() && agreeCheckbox && !agreeCheckbox.checked) {
                agreeCheckbox.classList.add('error');
                const parent = agreeCheckbox.parentElement;
                let error = parent.querySelector('.field-error');
                if (!error) {
                    error = document.createElement('span');
                    error.className = 'field-error';
                    error.textContent = 'Please agree to the data storage terms before uploading files';
                    parent.appendChild(error);
                }
                valid = false;
            } else if (agreeCheckbox) {
                agreeCheckbox.classList.remove('error');
                const error = agreeCheckbox.parentElement.querySelector('.field-error');
                if (error) error.remove();
            }

            if (!valid) {
                showAlert('Please fix the highlighted fields before submitting.', 'error');
                return;
            }

            // Show loading state
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalHTML = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
            submitBtn.disabled = true;

            try {
                // Get form data
                const formData = new FormData(this);
                
                // Add file count info
                if (hasFilesSelected()) {
                    formData.append('Number of Files Uploaded', selectedFiles.length + ' files');
                    // Add file names as a comma-separated list
                    const fileNames = selectedFiles.map(f => f.name).join(', ');
                    formData.append('Uploaded Files', fileNames);
                }

                console.log('📤 Submitting project to Formspree...');

                // Send to Formspree
                const response = await fetch(this.action, {
                    method: 'POST',
                    body: formData,
                    headers: { 'Accept': 'application/json' }
                });

                if (response.ok) {
                    showAlert('✅ Your project brief has been submitted! We\'ll be in touch within 24 hours.', 'success');
                    this.reset();
                    
                    // Clear file list
                    const fileList = document.getElementById('fileList');
                    if (fileList) fileList.innerHTML = '';
                    if (fileInput) fileInput.value = '';
                    selectedFiles = [];
                    updateCheckboxRequirement();
                    
                    // Reset restrictions
                    resetOptions();
                    
                    console.log('✅ Project submitted successfully!');
                } else {
                    const result = await response.json().catch(() => ({}));
                    const msg = (result.errors && result.errors.map(e => e.message).join(', ')) || 'Failed to submit project';
                    throw new Error(msg);
                }

            } catch (error) {
                console.error('❌ Error submitting project:', error);
                showAlert('❌ Error submitting project: ' + error.message + '. Please try again or contact us directly.', 'error');
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

        // Real-time checkbox validation removal
        if (agreeCheckbox) {
            agreeCheckbox.addEventListener('change', function () {
                if (this.classList.contains('error')) {
                    this.classList.remove('error');
                    const error = this.parentElement.querySelector('.field-error');
                    if (error) error.remove();
                }
            });
        }
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

    // ===== ANIMATE ON DISPLAY - Fixed with proper delays =====
    (function initAOD() {
        const aodElements = document.querySelectorAll('[data-aod]');
        if (!aodElements.length) return;

        // Set initial states
        aodElements.forEach(el => {
            const dir = el.dataset.aodDir || 'up';
            const delay = parseInt(el.dataset.aodDelay || 0);
            
            // Apply initial transform based on direction
            switch(dir) {
                case 'left':
                    el.style.transform = 'translateX(-40px)';
                    break;
                case 'right':
                    el.style.transform = 'translateX(40px)';
                    break;
                case 'scale':
                    el.style.transform = 'scale(0.92)';
                    break;
                case 'up-scale':
                    el.style.transform = 'translateY(30px) scale(0.96)';
                    break;
                default: // 'up' or any other
                    el.style.transform = 'translateY(30px)';
                    break;
            }
            
            el.style.opacity = '0';
            
            // Store the delay for later use
            if (delay > 0) {
                el.dataset._delay = delay;
            }
        });

        // Check if element is in viewport
        function isInViewport(el, threshold = 0.1) {
            const rect = el.getBoundingClientRect();
            const windowHeight = window.innerHeight || document.documentElement.clientHeight;
            const windowWidth = window.innerWidth || document.documentElement.clientWidth;
            
            const vertInView = rect.top <= windowHeight - (rect.height * threshold) && rect.bottom >= 0;
            const horInView = rect.left <= windowWidth && rect.right >= 0;
            
            return vertInView && horInView;
        }

        // Reveal elements that are in viewport
        function revealInView() {
            aodElements.forEach(el => {
                if (el.classList.contains('aod-in')) return;
                
                if (isInViewport(el, 0.08)) {
                    const delay = parseInt(el.dataset._delay || 0);
                    
                    setTimeout(() => {
                        el.classList.add('aod-in');
                        // Clear inline styles after animation
                        setTimeout(() => {
                            el.style.transform = '';
                            el.style.opacity = '';
                            el.style.transitionDelay = '';
                        }, 800);
                    }, delay);
                }
            });
        }

        // Initial reveal
        setTimeout(revealInView, 100);

        // Throttled scroll handler
        let scrollTimeout;
        window.addEventListener('scroll', () => {
            if (scrollTimeout) return;
            scrollTimeout = setTimeout(() => {
                requestAnimationFrame(revealInView);
                scrollTimeout = null;
            }, 10);
        }, { passive: true });

        // Also check on resize
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                requestAnimationFrame(revealInView);
            }, 200);
        }, { passive: true });

        // Force check after fonts and images load
        window.addEventListener('load', () => {
            setTimeout(revealInView, 500);
        });

        // Observe DOM changes
        if (window.MutationObserver) {
            const observer = new MutationObserver(() => {
                requestAnimationFrame(revealInView);
            });
            observer.observe(document.body, { childList: true, subtree: true, attributes: false });
        }
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