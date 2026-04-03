// ===== DOM READY =====
document.addEventListener('DOMContentLoaded', function () {

    // ===== CINEMATIC LOADER - FIXED =====
    const loadingScreen = document.getElementById('loadingScreen');
    const loaderPct = document.getElementById('loaderPct');
    let pct = 0;
    let loaderCompleted = false;
    
    // Progress bar animation
    const pctTimer = setInterval(() => {
        if (!loaderCompleted) {
            pct = Math.min(pct + Math.random() * 4 + 1, 99);
            if (loaderPct) loaderPct.textContent = Math.floor(pct) + '%';
        }
    }, 60);

    // Function to hide loader
    function hideLoader() {
        if (loaderCompleted) return;
        loaderCompleted = true;
        clearInterval(pctTimer);
        if (loaderPct) loaderPct.textContent = '100%';
        
        // Add a small delay for smooth transition
        setTimeout(() => {
            if (loadingScreen) {
                loadingScreen.classList.add('hidden');
                // Remove from DOM after transition to prevent any interaction issues
                setTimeout(() => {
                    if (loadingScreen && loadingScreen.parentNode) {
                        loadingScreen.style.display = 'none';
                    }
                }, 900);
            }
        }, 300);
    }

    // Check if page is already loaded
    if (document.readyState === 'complete') {
        hideLoader();
    } else {
        window.addEventListener('load', hideLoader);
        
        // Fallback: force hide after 3 seconds max (in case load event doesn't fire)
        setTimeout(() => {
            if (!loaderCompleted) {
                console.log('Loader fallback triggered');
                hideLoader();
            }
        }, 3000);
    }

    // ===== FLIP CARDS: CLICK TO FLIP - SINGLE ACTIVE CARD =====
    (function initClickFlipCards() {
        const flipCards = document.querySelectorAll('.service-flip-card');
        let currentlyFlippedCard = null;
        
        flipCards.forEach(card => {
            // Remove hover flip behavior
            card.style.cursor = 'pointer';
            
            // Get the inner element
            const inner = card.querySelector('.flip-card-inner');
            if (inner) {
                // Set initial transform style
                inner.style.transform = 'rotateY(0deg)';
                inner.style.transition = 'transform 0.6s cubic-bezier(0.4, 0.2, 0.2, 1)';
            }
            
            // Add click handler
            card.addEventListener('click', function(e) {
                // Prevent toggling if clicking on the ENQUIRE link (to allow navigation)
                if (e.target.closest('.flip-cta')) {
                    return;
                }
                
                const innerElem = this.querySelector('.flip-card-inner');
                if (!innerElem) return;
                
                // Check if this card is currently flipped
                const isFlipped = innerElem.style.transform === 'rotateY(180deg)';
                
                // If there's a currently flipped card that is not this one, flip it back
                if (currentlyFlippedCard && currentlyFlippedCard !== this) {
                    const prevInner = currentlyFlippedCard.querySelector('.flip-card-inner');
                    if (prevInner) {
                        prevInner.style.transform = 'rotateY(0deg)';
                    }
                }
                
                // Toggle the clicked card
                if (isFlipped) {
                    // If clicking the already flipped card, flip it back
                    innerElem.style.transform = 'rotateY(0deg)';
                    currentlyFlippedCard = null;
                } else {
                    // Flip this card and set it as the active one
                    innerElem.style.transform = 'rotateY(180deg)';
                    currentlyFlippedCard = this;
                }
            });
        });
    })();

    // ===== HERO CANVAS =====
    const heroCanvas = document.getElementById('heroCanvas');
    if (heroCanvas) {
        const ctx = heroCanvas.getContext('2d');
        let W, H, t = 0, animId;
        let animationActive = true;
        let heroFrame = 0;

        function resizeCanvas() {
            W = heroCanvas.width = heroCanvas.offsetWidth;
            H = heroCanvas.height = heroCanvas.offsetHeight;
        }

        function waveColor(index, total, t, alpha) {
            const paletteDeg = [190, 198, 208, 218, 200, 185, 20, 195];
            const sat = [80, 75, 70, 68, 78, 82, 90, 72];
            const lit = [65, 60, 55, 58, 62, 68, 60, 56];
            const i = index % paletteDeg.length;
            const hShift = Math.sin(t * 0.4 + index * 0.5) * 10;
            return `hsla(${paletteDeg[i] + hShift}, ${sat[i]}%, ${lit[i]}%, ${alpha})`;
        }

        function drawScene() {
            if (!ctx || !animationActive) return;

            // Throttle to ~30 fps — skip every other rAF tick
            heroFrame++;
            if (heroFrame % 2 !== 0) {
                animId = requestAnimationFrame(drawScene);
                return;
            }

            ctx.clearRect(0, 0, W, H);

            const bg = ctx.createLinearGradient(0, 0, W * 0.7, H);
            bg.addColorStop(0, '#020a14');
            bg.addColorStop(0.5, '#050f1c');
            bg.addColorStop(1, '#030810');
            ctx.fillStyle = bg;
            ctx.fillRect(0, 0, W, H);

            const cx = W * 0.62, cy = H * 0.48;
            // Reduced from 12 → 8 ribbons; 48 pts → 32 pts per ribbon
            const numRibbons = 8;
            const steps = 32;

            for (let r = numRibbons; r >= 0; r--) {
                const progress = r / numRibbons;
                const phaseOffset = progress * Math.PI * 2.8 + t * 0.45;
                const radiusX = W * (0.18 + progress * 0.15);
                const radiusY = H * (0.27 + progress * 0.1);
                const thickness = 16 + Math.sin(progress * Math.PI) * 30;

                const pts = [];
                for (let i = 0; i <= steps; i++) {
                    const angle = (i / steps) * Math.PI * 2;
                    pts.push({
                        x: cx + Math.cos(angle) * radiusX + Math.cos(angle * 1.8 + phaseOffset * 0.7) * W * 0.04,
                        y: cy + Math.sin(angle) * radiusY + Math.sin(angle * 2.5 + phaseOffset) * H * 0.055
                    });
                }

                const alpha = 0.1 + Math.sin(progress * Math.PI) * 0.25;
                const grad = ctx.createLinearGradient(cx - radiusX, cy, cx + radiusX, cy);
                grad.addColorStop(0, waveColor(r, numRibbons, t, alpha * 0.5));
                grad.addColorStop(0.5, waveColor(r + 2, numRibbons, t, alpha));
                grad.addColorStop(1, waveColor(r + 4, numRibbons, t, alpha * 0.5));

                ctx.beginPath();
                ctx.moveTo(pts[0].x, pts[0].y);
                for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
                ctx.closePath();
                ctx.strokeStyle = grad;
                ctx.lineWidth = thickness;
                ctx.lineCap = 'round';
                ctx.lineJoin = 'round';
                ctx.stroke();
            }

            // Reduced highlight passes from 4 → 2
            for (let r = 0; r < 2; r++) {
                const progress = 0.38 + r * 0.1;
                const phaseOffset = progress * Math.PI * 2.8 + t * 0.45;
                const radiusX = W * (0.18 + progress * 0.15);
                const radiusY = H * (0.27 + progress * 0.1);
                const pts = [];
                for (let i = 0; i <= steps; i++) {
                    const angle = (i / steps) * Math.PI * 2;
                    pts.push({
                        x: cx + Math.cos(angle) * radiusX + Math.cos(angle * 1.8 + phaseOffset * 0.7) * W * 0.04,
                        y: cy + Math.sin(angle) * radiusY + Math.sin(angle * 2.5 + phaseOffset) * H * 0.055
                    });
                }
                ctx.beginPath();
                ctx.moveTo(pts[0].x, pts[0].y);
                for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
                ctx.closePath();
                ctx.strokeStyle = `rgba(255,255,255,${0.05 + r * 0.02})`;
                ctx.lineWidth = 2.5 + r * 1.2;
                ctx.stroke();
            }

            const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, W * 0.4);
            glow.addColorStop(0, 'rgba(0,180,216,0.12)');
            glow.addColorStop(1, 'transparent');
            ctx.fillStyle = glow;
            ctx.fillRect(0, 0, W, H);

            const ox = cx - W * 0.18 + Math.sin(t * 0.6) * W * 0.04;
            const oy = cy - H * 0.2 + Math.cos(t * 0.5) * H * 0.03;
            const og = ctx.createRadialGradient(ox, oy, 0, ox, oy, W * 0.06);
            og.addColorStop(0, 'rgba(255,107,43,0.45)');
            og.addColorStop(1, 'transparent');
            ctx.fillStyle = og;
            ctx.beginPath();
            ctx.arc(ox, oy, W * 0.06, 0, Math.PI * 2);
            ctx.fill();

            t += 0.014; // slightly faster step to compensate for halved frame rate
            animId = requestAnimationFrame(drawScene);
        }

        function startAnimation() {
            if (!animationActive) return;
            resizeCanvas();
            drawScene();
        }
        
        function stopAnimation() {
            if (animId) {
                cancelAnimationFrame(animId);
                animId = null;
            }
        }

        resizeCanvas();
        startAnimation();

        document.addEventListener('visibilitychange', () => {
            if (document.hidden) { 
                stopAnimation();
                animationActive = false;
            }
            else {
                animationActive = true;
                startAnimation();
            }
        });

        let resizeTimer;
        window.addEventListener('resize', () => {
            stopAnimation();
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => { 
                resizeCanvas(); 
                if (animationActive && !document.hidden) startAnimation();
            }, 150);
        });
    }

    // ===== CTA PARALLAX SCROLL =====
    (function initCtaParallax() {
        const ctaSections = document.querySelectorAll('.cta-parallax');
        if (!ctaSections.length) return;

        const isMobile = () => window.innerWidth <= 768;

        function updateParallax() {
            if (!isMobile()) return;
            ctaSections.forEach(section => {
                const img = section.querySelector('.cta-parallax-img');
                if (!img) return;
                const rect = section.getBoundingClientRect();
                const progress = rect.top / window.innerHeight;
                const shift = progress * 40;
                img.style.transform = `translateY(${shift}px)`;
            });
        }

        window.addEventListener('scroll', () => requestAnimationFrame(updateParallax), { passive: true });
        updateParallax();
    })();

    // ===== ETA SECTION CANVAS =====
    function initEtaCanvas() {
        const canvas = document.getElementById('etaCanvas');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        let W, H, t = 0, animId = null;
        let isVisible = false;
        let animationActive = true;
        
        function resize() {
            W = canvas.width = canvas.offsetWidth;
            H = canvas.height = canvas.offsetHeight;
        }
        
        const observer = new IntersectionObserver(entries => {
            entries.forEach(e => {
                isVisible = e.isIntersecting;
                if (isVisible && !animId && animationActive) loop();
                else if (!isVisible && animId) {
                    cancelAnimationFrame(animId);
                    animId = null;
                }
            });
        }, { threshold: 0.05 });
        
        const section = document.getElementById('timelines');
        if (section) observer.observe(section);
        
        function draw() {
            if (!ctx) return;
            ctx.clearRect(0, 0, W, H);
            
            const bgGrad = ctx.createLinearGradient(0, 0, W, H);
            bgGrad.addColorStop(0, 'rgba(255, 255, 255, 0.02)');
            bgGrad.addColorStop(1, 'rgba(0, 119, 182, 0.02)');
            ctx.fillStyle = bgGrad;
            ctx.fillRect(0, 0, W, H);
            
            const particleCount = 30;
            for (let i = 0; i < particleCount; i++) {
                const x = (Math.sin(t * 0.3 + i) * 0.5 + 0.5) * W;
                const y = (Math.cos(t * 0.2 + i * 2) * 0.3 + 0.5) * H;
                const size = 2 + Math.sin(t * 0.5 + i) * 1;
                
                ctx.beginPath();
                ctx.arc(x, y, size, 0, Math.PI * 2);
                ctx.fillStyle = `hsla(195, 85%, 55%, ${0.1 + Math.sin(t + i) * 0.05})`;
                ctx.fill();
            }
            
            const numWaves = 5;
            for (let w = 0; w < numWaves; w++) {
                const offset = w / numWaves;
                const yBase = H * (0.2 + offset * 0.6);
                const amp = H * 0.03;
                const freq = 0.008;
                
                ctx.beginPath();
                for (let x = 0; x <= W; x += 8) {
                    const y = yBase + Math.sin(x * freq + t * 0.5 + offset * Math.PI * 2) * amp;
                    if (x === 0) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);
                }
                
                ctx.strokeStyle = `hsla(195, 75%, 55%, ${0.1 + offset * 0.1})`;
                ctx.lineWidth = 1.5;
                ctx.stroke();
            }
            
            t += 0.010;
        }
        
        function loop() {
            if (!isVisible || !animationActive || document.hidden) {
                animId = null;
                return;
            }
            draw();
            animId = requestAnimationFrame(loop);
        }
        
        function startLoop() {
            if (isVisible && !animId && animationActive && !document.hidden) loop();
        }
        
        resize();
        window.addEventListener('resize', () => {
            cancelAnimationFrame(animId);
            resize();
            startLoop();
        });
        
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden && isVisible && animationActive && !animId) {
                loop();
            } else if (document.hidden && animId) {
                cancelAnimationFrame(animId);
                animId = null;
            }
        });
        
        startLoop();
    }
    
    initEtaCanvas();

    // ===== ETA SECTION PROGRESS BARS ANIMATION =====
    function initEtaProgressBars() {
        const etaSection = document.getElementById('timelines');
        if (!etaSection) return;
        
        const progressBars = document.querySelectorAll('.eta-dur-bar');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    progressBars.forEach(bar => {
                        const targetWidth = getComputedStyle(bar).getPropertyValue('--bar-w');
                        if (targetWidth && !bar.style.width) {
                            bar.style.width = targetWidth;
                        }
                    });
                }
            });
        }, { threshold: 0.3 });
        
        observer.observe(etaSection);
    }
    
    initEtaProgressBars();

    // ===== NAVIGATION =====
    const navbar = document.querySelector('.navbar');
    const navLinks = document.querySelectorAll('.nav-link');
    const navbarToggler = document.querySelector('.navbar-toggler');
    const navbarCollapse = document.querySelector('.navbar-collapse');

    function updateNavbarOnScroll() {
        if (!navbar) return;
        navbar.classList.toggle('scrolled', (window.pageYOffset || document.documentElement.scrollTop) > 20);
    }
    updateNavbarOnScroll();
    window.addEventListener('scroll', () => requestAnimationFrame(updateNavbarOnScroll), { passive: true });
    window.addEventListener('touchend', () => requestAnimationFrame(updateNavbarOnScroll), { passive: true });

    if (navbarToggler && navbarCollapse) {
        navbarToggler.addEventListener('click', function (e) {
            e.stopPropagation();
            setTimeout(() => {
                document.body.style.overflow = this.getAttribute('aria-expanded') === 'true' ? 'hidden' : '';
            }, 100);
        });

        navLinks.forEach(link => {
            link.addEventListener('click', function () {
                const href = this.getAttribute('href');
                if (href && href.startsWith('#') && navbarCollapse.classList.contains('show')) {
                    new bootstrap.Collapse(navbarCollapse, { toggle: false }).hide();
                    document.body.style.overflow = '';
                    navbarToggler.setAttribute('aria-expanded', 'false');
                    navbarToggler.classList.add('collapsed');
                }
            });
        });

        document.addEventListener('click', function (e) {
            if (navbarCollapse.classList.contains('show') && !navbar.contains(e.target)) {
                new bootstrap.Collapse(navbarCollapse, { toggle: false }).hide();
                document.body.style.overflow = '';
                navbarToggler.setAttribute('aria-expanded', 'false');
                navbarToggler.classList.add('collapsed');
            }
        });

        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && navbarCollapse.classList.contains('show')) {
                new bootstrap.Collapse(navbarCollapse, { toggle: false }).hide();
                document.body.style.overflow = '';
                navbarToggler.setAttribute('aria-expanded', 'false');
                navbarToggler.classList.add('collapsed');
            }
        });

        navbarCollapse.addEventListener('hidden.bs.collapse', () => document.body.style.overflow = '');
        navbarCollapse.addEventListener('shown.bs.collapse', () => document.body.style.overflow = 'hidden');
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
                    window.scrollTo({ top: target.offsetTop - 80, behavior: 'smooth' });
                    setTimeout(() => requestAnimationFrame(updateNavbarOnScroll), 300);
                }
            }
        });
    });

    function updateActiveNavLink() {
        const sp = window.scrollY + 100;
        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href && href.startsWith('#')) {
                const el = document.querySelector(href);
                if (el && sp >= el.offsetTop && sp < el.offsetTop + el.offsetHeight) {
                    navLinks.forEach(l => l.classList.remove('active'));
                    link.classList.add('active');
                }
            }
        });
    }
    window.addEventListener('scroll', throttle(() => requestAnimationFrame(updateActiveNavLink), 100), { passive: true });

    // ===== ANIMATED COUNTERS =====
    function animateCounter(counter) {
        const target = parseInt(counter.getAttribute('data-count'));
        const increment = target / (2000 / 16);
        let current = 0;
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) { current = target; clearInterval(timer); }
            counter.textContent = Math.floor(current);
        }, 16);
    }

    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.querySelectorAll('.stat-number').forEach(counter => {
                    if (!counter.classList.contains('animated')) {
                        counter.classList.add('animated');
                        animateCounter(counter);
                    }
                });
            }
        });
    }, { threshold: 0.3 });

    const aboutStats = document.querySelector('.about-stats');
    if (aboutStats) counterObserver.observe(aboutStats);

    // ===== FORM SUBMISSION - AJAX to PHP =====
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', async function (e) {
            e.preventDefault();
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
            submitBtn.disabled = true;
            
            try {
                const formData = new FormData(this);
                const response = await fetch(this.action, {
                    method: 'POST',
                    body: formData
                });
                
                const result = await response.json();
                
                if (response.ok && result.success) {
                    showAlert('Success! Your message has been sent. We\'ll get back to you within 24 hours.', 'success');
                    this.reset();
                } else {
                    throw new Error(result.message || 'Failed to send message');
                }
            } catch (error) {
                console.error('Form submission error:', error);
                showAlert(error.message || 'Oops! Something went wrong. Please try again or contact us directly.', 'error');
            } finally {
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }
        });
    }

    // ===== ANIMATE ON DISPLAY (AOD) =====
    (function () {
        const aodElements = document.querySelectorAll('[data-aod]');
        if (!aodElements.length) return;

        // Track pending timeouts so we can cancel them if element leaves before delay fires
        const pendingTimers = new WeakMap();

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const el = entry.target;

                if (entry.isIntersecting) {
                    // Element is genuinely in view — schedule the reveal
                    const delay = parseInt(el.dataset.aodDelay || 0);
                    const timer = setTimeout(() => {
                        // Only animate in if still intersecting (check via class absence)
                        el.classList.add('aod-in');
                        el.classList.remove('aod-out');
                        // Once shown, stop observing so scroll-back never hides it again
                        observer.unobserve(el);
                    }, delay);
                    pendingTimers.set(el, timer);
                } else {
                    // Not in view — cancel any pending show timer to prevent torn state
                    const pending = pendingTimers.get(el);
                    if (pending !== undefined) {
                        clearTimeout(pending);
                        pendingTimers.delete(el);
                    }
                    // Only apply the exit state if the element was never shown yet
                    if (!el.classList.contains('aod-in')) {
                        el.classList.add('aod-out');
                    }
                }
            });
        }, {
            // Require 20% of the element to be inside the viewport before triggering,
            // and add a 60px bottom margin so elements just peeking at the edge don't fire.
            threshold: 0.20,
            rootMargin: '0px 0px -60px 0px'
        });

        aodElements.forEach(el => observer.observe(el));
    })();

    // ===== SECTION PULSE CANVASES =====
    (function initSectionPulses() {
        const SECTIONS = [
            { selector: '.about-section', theme: 'light', corner: 'topRight' },
            { selector: '.process-section', theme: 'light', corner: 'bottomLeft' },
            { selector: '.services-section', theme: 'dark', corner: 'topLeft' },
            { selector: '.aod-section', theme: 'light', corner: 'center' },
            { selector: '.why-section', theme: 'dark', corner: 'bottomRight' },
            { selector: '.contact-section', theme: 'light', corner: 'topRight' },
            { selector: '.work-section', theme: 'dark', corner: 'center' },
            { selector: '.why-us-section', theme: 'light', corner: 'topLeft' },
        ];

        function lightColor(waveIdx, totalWaves, t, alpha) {
            const hues = [195, 205, 210, 200, 190, 215, 202];
            const sats = [85, 80, 75, 88, 82, 78, 86];
            const lits = [28, 32, 25, 30, 35, 27, 31];
            const i = waveIdx % hues.length;
            const hShift = Math.sin(t * 0.35 + waveIdx * 0.6) * 8;
            return `hsla(${hues[i] + hShift}, ${sats[i]}%, ${lits[i]}%, ${alpha})`;
        }

        function darkColor(waveIdx, totalWaves, t, alpha, isOrange) {
            if (isOrange) return `hsla(20, 90%, 58%, ${alpha})`;
            const hues = [185, 195, 205, 190, 200, 210, 188];
            const sats = [82, 78, 75, 85, 80, 72, 88];
            const lits = [62, 58, 65, 60, 68, 55, 63];
            const i = waveIdx % hues.length;
            const hShift = Math.sin(t * 0.4 + waveIdx * 0.5) * 10;
            return `hsla(${hues[i] + hShift}, ${sats[i]}%, ${lits[i]}%, ${alpha})`;
        }

        function initPulse(sectionEl, theme, corner) {
            const canvas = document.createElement('canvas');
            canvas.className = 'section-pulse-canvas';
            sectionEl.insertBefore(canvas, sectionEl.firstChild);

            const ctx = canvas.getContext('2d');
            let W, H, t = 0, animId = null, isVisible = false, frameCount = 0;
            let animationActive = true;

            function resize() {
                W = canvas.width = sectionEl.offsetWidth;
                H = canvas.height = sectionEl.offsetHeight;
            }

            const observer = new IntersectionObserver(entries => {
                entries.forEach(e => {
                    isVisible = e.isIntersecting;
                    if (isVisible && !animId && animationActive) loop();
                    else if (!isVisible && animId) {
                        cancelAnimationFrame(animId);
                        animId = null;
                    }
                });
            }, { threshold: 0.05 });
            observer.observe(sectionEl);

            function getOrigin() {
                switch (corner) {
                    case 'topRight': return { cx: W * 0.88, cy: H * 0.12 };
                    case 'topLeft': return { cx: W * 0.12, cy: H * 0.12 };
                    case 'bottomRight': return { cx: W * 0.88, cy: H * 0.88 };
                    case 'bottomLeft': return { cx: W * 0.12, cy: H * 0.88 };
                    case 'center': return { cx: W * 0.50, cy: H * 0.50 };
                    default: return { cx: W * 0.50, cy: H * 0.50 };
                }
            }

            function draw() {
                if (!ctx) return;
                ctx.clearRect(0, 0, W, H);

                const { cx, cy } = getOrigin();
                // Reduced from 10 → 6 ribbons; 48 pts → 28 pts per ribbon
                const numRibbons = 6;
                const steps = 28;
                const isLight = theme === 'light';

                for (let r = numRibbons; r >= 0; r--) {
                    const progress = r / numRibbons;
                    const phaseOffset = progress * Math.PI * 2.6 + t * 0.42;
                    const radiusX = W * (0.12 + progress * 0.22);
                    const radiusY = H * (0.18 + progress * 0.14);
                    const thickness = 10 + Math.sin(progress * Math.PI) * 22;

                    const pts = [];
                    for (let i = 0; i <= steps; i++) {
                        const angle = (i / steps) * Math.PI * 2;
                        pts.push({
                            x: cx + Math.cos(angle) * radiusX
                                + Math.cos(angle * 1.8 + phaseOffset * 0.65) * W * 0.035,
                            y: cy + Math.sin(angle) * radiusY
                                + Math.sin(angle * 2.4 + phaseOffset) * H * 0.045,
                        });
                    }

                    const baseAlpha = isLight
                        ? 0.06 + Math.sin(progress * Math.PI) * 0.16
                        : 0.08 + Math.sin(progress * Math.PI) * 0.22;

                    const isOrange = !isLight && r === Math.floor(numRibbons * 0.4);

                    const grad = ctx.createLinearGradient(cx - radiusX, cy, cx + radiusX, cy);
                    if (isLight) {
                        grad.addColorStop(0, lightColor(r, numRibbons, t, baseAlpha * 0.4));
                        grad.addColorStop(0.5, lightColor(r + 2, numRibbons, t, baseAlpha));
                        grad.addColorStop(1, lightColor(r, numRibbons, t, baseAlpha * 0.4));
                    } else {
                        grad.addColorStop(0, darkColor(r, numRibbons, t, baseAlpha * 0.4, false));
                        grad.addColorStop(0.5, darkColor(r + 2, numRibbons, t, baseAlpha, isOrange));
                        grad.addColorStop(1, darkColor(r, numRibbons, t, baseAlpha * 0.4, false));
                    }

                    ctx.beginPath();
                    ctx.moveTo(pts[0].x, pts[0].y);
                    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
                    ctx.closePath();
                    ctx.strokeStyle = grad;
                    ctx.lineWidth = thickness;
                    ctx.lineCap = 'round';
                    ctx.lineJoin = 'round';
                    ctx.stroke();
                }

                const glowColor = isLight
                    ? 'rgba(0, 119, 182, 0.10)'
                    : 'rgba(0, 180, 216, 0.13)';
                const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, W * 0.38);
                glow.addColorStop(0, glowColor);
                glow.addColorStop(1, 'transparent');
                ctx.fillStyle = glow;
                ctx.fillRect(0, 0, W, H);

                t += 0.045; // faster step to compensate for lower frame rate
            }

            function loop() {
                if (!isVisible || !animationActive || document.hidden) { 
                    animId = null; 
                    return; 
                }
                frameCount++;
                // Draw every 3rd frame (~20 fps) — these are subtle bg decorations
                if (frameCount % 3 === 0) draw();
                animId = requestAnimationFrame(loop);
            }

            document.addEventListener('visibilitychange', () => {
                if (!document.hidden && isVisible && animationActive && !animId) {
                    loop();
                } else if (document.hidden && animId) {
                    cancelAnimationFrame(animId);
                    animId = null;
                }
            });

            let resizeTimer;
            window.addEventListener('resize', () => {
                clearTimeout(resizeTimer);
                resizeTimer = setTimeout(resize, 150);
            }, { passive: true });

            resize();
        }

        SECTIONS.forEach(({ selector, theme, corner }) => {
            const el = document.querySelector(selector);
            if (el) initPulse(el, theme, corner);
        });
    })();

    // ===== SET CURRENT YEAR =====
    const yearEl = document.getElementById('currentYear');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    // ===== LAZY BACKGROUND IMAGES =====
    // Loads data-bg="url" only when element is close to entering the viewport
    (function initLazyBg() {
        const lazyBgEls = document.querySelectorAll('[data-bg]');
        if (!lazyBgEls.length) return;

        const bgObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const el = entry.target;
                    const url = el.dataset.bg;
                    if (url) {
                        el.style.backgroundImage = `url('${url}')`;
                        el.removeAttribute('data-bg');
                    }
                    bgObserver.unobserve(el);
                }
            });
        }, {
            // Start loading 200px before element enters view so there's no visible pop-in
            rootMargin: '200px 0px',
            threshold: 0
        });

        lazyBgEls.forEach(el => bgObserver.observe(el));
    })();

    // ===== OUR WORK — TILE CLICK + BG SWITCHER =====
    (function initWorkSection() {
        const tiles = document.querySelectorAll('.work-tile');
        const bgSlides = document.querySelectorAll('.work-bg-slide');
        if (!tiles.length) return;

        function activateTile(index) {
            tiles.forEach((t, i) => {
                t.classList.toggle('is-active', i === index);
                t.setAttribute('aria-expanded', i === index ? 'true' : 'false');
            });
            bgSlides.forEach((s, i) => {
                s.classList.toggle('is-active', i === index);
            });
        }

        tiles.forEach((tile, i) => {
            tile.addEventListener('click', () => activateTile(i));
            tile.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    activateTile(i);
                }
            });
        });

        activateTile(0);
    })();

});  // end DOMContentLoaded

// ===== UTILITIES =====
function throttle(func, limit) {
    let inThrottle;
    return function () {
        if (!inThrottle) {
            func.apply(this, arguments);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

window.showAlert = function (message, type) {
    const existing = document.querySelector('.alert');
    if (existing) existing.remove();
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.innerHTML = `
        <div class="alert-content">
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
            <span>${message}</span>
        </div>
        <button class="alert-close" aria-label="Close alert"><i class="fas fa-times"></i></button>`;
    document.body.appendChild(alert);
    setTimeout(() => alert.classList.add('show'), 10);
    alert.querySelector('.alert-close').addEventListener('click', () => {
        alert.classList.remove('show');
        setTimeout(() => alert.remove(), 300);
    });
    setTimeout(() => {
        if (alert.parentNode) { alert.classList.remove('show'); setTimeout(() => alert.remove(), 300); }
    }, 5000);
};

window.addEventListener('error', function (e) {
    console.error('Global error:', e.error);
    if (e.message && e.message.includes('ResizeObserver')) e.preventDefault();
}, true);
window.addEventListener('unhandledrejection', function (e) {
    console.error('Unhandled rejection:', e.reason); e.preventDefault();
});
window.addEventListener('online', () => showAlert('You are back online!', 'success'));
window.addEventListener('offline', () => showAlert('You are currently offline. Some features may not be available.', 'error'));