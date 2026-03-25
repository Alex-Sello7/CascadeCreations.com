// ===== DOM READY =====
document.addEventListener('DOMContentLoaded', function () {

    // ===== CINEMATIC LOADER =====
    const loadingScreen = document.getElementById('loadingScreen');
    const loaderPct = document.getElementById('loaderPct');
    let pct = 0;
    const pctTimer = setInterval(() => {
        pct = Math.min(pct + Math.random() * 4 + 1, 99);
        if (loaderPct) loaderPct.textContent = Math.floor(pct) + '%';
    }, 60);

    window.addEventListener('load', function () {
        clearInterval(pctTimer);
        if (loaderPct) loaderPct.textContent = '100%';
        // Reduced from 900ms to 400ms
        setTimeout(() => {
            if (loadingScreen) loadingScreen.classList.add('hidden');
        }, 400);
    });

    // ===== FLIP CARDS: CLICK TO FLIP (not hover) =====
    (function initClickFlipCards() {
        const flipCards = document.querySelectorAll('.service-flip-card');
        
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
                    // Let the link handle navigation
                    return;
                }
                
                const innerElem = this.querySelector('.flip-card-inner');
                if (innerElem) {
                    // Toggle the flip state
                    if (innerElem.style.transform === 'rotateY(180deg)') {
                        innerElem.style.transform = 'rotateY(0deg)';
                    } else {
                        innerElem.style.transform = 'rotateY(180deg)';
                    }
                }
            });
        });
    })();

    // ===== HERO CANVAS =====
    // PERF: ribbon count 20->12, point count 80->48, pauses when tab hidden
    const heroCanvas = document.getElementById('heroCanvas');
    if (heroCanvas) {
        const ctx = heroCanvas.getContext('2d');
        let W, H, t = 0, animId;

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
            ctx.clearRect(0, 0, W, H);

            const bg = ctx.createLinearGradient(0, 0, W * 0.7, H);
            bg.addColorStop(0, '#020a14');
            bg.addColorStop(0.5, '#050f1c');
            bg.addColorStop(1, '#030810');
            ctx.fillStyle = bg;
            ctx.fillRect(0, 0, W, H);

            const cx = W * 0.62, cy = H * 0.48;
            const numRibbons = 12; // was 20

            for (let r = numRibbons; r >= 0; r--) {
                const progress = r / numRibbons;
                const phaseOffset = progress * Math.PI * 2.8 + t * 0.45;
                const radiusX = W * (0.18 + progress * 0.15);
                const radiusY = H * (0.27 + progress * 0.1);
                const thickness = 16 + Math.sin(progress * Math.PI) * 30;

                const pts = [];
                for (let i = 0; i <= 48; i++) { // was 80
                    const angle = (i / 48) * Math.PI * 2;
                    pts.push({
                        x: cx + Math.cos(angle) * radiusX + Math.cos(angle * 1.8 + phaseOffset * 0.7) * W * 0.04,
                        y: cy + Math.sin(angle) * radiusY + Math.sin(angle * 2.5 + phaseOffset) * H * 0.055
                    });
                }

                const alpha = 0.1 + Math.sin(progress * Math.PI) * 0.25;
                const grad = ctx.createLinearGradient(cx - radiusX, cy, cx + radiusX, cy);
                grad.addColorStop(0, waveColor(r, numRibbons, t, alpha * 0.5));
                grad.addColorStop(0.3, waveColor(r + 2, numRibbons, t, alpha));
                grad.addColorStop(0.6, waveColor(r + 4, numRibbons, t, alpha * 1.1));
                grad.addColorStop(1, waveColor(r + 6, numRibbons, t, alpha * 0.5));

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

            for (let r = 0; r < 4; r++) {
                const progress = 0.35 + r * 0.07;
                const phaseOffset = progress * Math.PI * 2.8 + t * 0.45;
                const radiusX = W * (0.18 + progress * 0.15);
                const radiusY = H * (0.27 + progress * 0.1);
                const pts = [];
                for (let i = 0; i <= 48; i++) {
                    const angle = (i / 48) * Math.PI * 2;
                    pts.push({
                        x: cx + Math.cos(angle) * radiusX + Math.cos(angle * 1.8 + phaseOffset * 0.7) * W * 0.04,
                        y: cy + Math.sin(angle) * radiusY + Math.sin(angle * 2.5 + phaseOffset) * H * 0.055
                    });
                }
                ctx.beginPath();
                ctx.moveTo(pts[0].x, pts[0].y);
                for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
                ctx.closePath();
                ctx.strokeStyle = `rgba(255,255,255,${0.05 + r * 0.018})`;
                ctx.lineWidth = 2.5 + r * 1.2;
                ctx.stroke();
            }

            const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, W * 0.4);
            glow.addColorStop(0, 'rgba(0,180,216,0.12)');
            glow.addColorStop(0.5, 'rgba(0,119,182,0.05)');
            glow.addColorStop(1, 'transparent');
            ctx.fillStyle = glow;
            ctx.fillRect(0, 0, W, H);

            const ox = cx - W * 0.18 + Math.sin(t * 0.6) * W * 0.04;
            const oy = cy - H * 0.2 + Math.cos(t * 0.5) * H * 0.03;
            const og = ctx.createRadialGradient(ox, oy, 0, ox, oy, W * 0.06);
            og.addColorStop(0, 'rgba(255,107,43,0.45)');
            og.addColorStop(0.5, 'rgba(255,107,43,0.12)');
            og.addColorStop(1, 'transparent');
            ctx.fillStyle = og;
            ctx.beginPath();
            ctx.arc(ox, oy, W * 0.06, 0, Math.PI * 2);
            ctx.fill();

            t += 0.030;
            animId = requestAnimationFrame(drawScene);
        }

        resizeCanvas();
        drawScene();

        // PERF: pause canvas when tab is hidden
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) { cancelAnimationFrame(animId); animId = null; }
            else if (!animId) drawScene();
        });

        let resizeTimer;
        window.addEventListener('resize', () => {
            cancelAnimationFrame(animId);
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => { resizeCanvas(); drawScene(); }, 150);
        });
    }

    // ===== CTA CANVAS WAVES =====
    // PERF: fewer waves, wider point step, every-other-frame rendering, pauses offscreen/hidden
    function initCtaCanvas(canvasId, variant) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        let W, H, t = 0, animId = null, frameCount = 0;
        let isVisible = false;

        function resize() {
            W = canvas.width = canvas.offsetWidth;
            H = canvas.height = canvas.offsetHeight;
        }

        const observer = new IntersectionObserver(entries => {
            entries.forEach(e => {
                isVisible = e.isIntersecting;
                if (isVisible && !animId) loop();
            });
        }, { threshold: 0.05 });
        observer.observe(canvas.parentElement);

        function draw() {
            ctx.clearRect(0, 0, W, H);

            const bg = ctx.createLinearGradient(0, 0, W, H);
            bg.addColorStop(0, variant === 1 ? '#020b18' : '#030610');
            bg.addColorStop(1, variant === 1 ? '#040d1a' : '#050a16');
            ctx.fillStyle = bg;
            ctx.fillRect(0, 0, W, H);

            const numWaves = variant === 1 ? 10 : 9; // was 14/12

            for (let w = 0; w < numWaves; w++) {
                const prog = w / numWaves;
                const yBase = H * (0.15 + prog * 0.7);
                const amp = H * (0.04 + Math.sin(prog * Math.PI) * 0.08);
                const freq = variant === 1 ? (0.008 + prog * 0.004) : (0.012 + prog * 0.006);
                const speed = variant === 1 ? t * (0.4 + prog * 0.3) : t * (0.5 + prog * 0.25) * -1;

                let hue, sat, lit, alpha;
                if (variant === 1) {
                    const isOrange = w === Math.floor(numWaves * 0.55);
                    hue = isOrange ? 20 : 185 + prog * 30;
                    sat = isOrange ? 88 : 75;
                    lit = isOrange ? 58 : 60 + Math.sin(prog * Math.PI) * 12;
                    alpha = isOrange ? 0.55 : 0.08 + Math.sin(prog * Math.PI) * 0.28;
                } else {
                    const isOrange = w === 2;
                    hue = isOrange ? 22 : 195 + prog * 25;
                    sat = isOrange ? 85 : 70;
                    lit = isOrange ? 56 : 55 + Math.sin(prog * Math.PI) * 10;
                    alpha = isOrange ? 0.45 : 0.07 + Math.sin(prog * Math.PI) * 0.25;
                }

                const lineWidth = variant === 1
                    ? 1.5 + Math.sin(prog * Math.PI) * 5
                    : 1.2 + Math.sin(prog * Math.PI) * 4;

                ctx.beginPath();
                for (let x = 0; x <= W + 4; x += 4) { // was x += 3
                    const y = yBase
                        + Math.sin(x * freq + speed) * amp
                        + Math.sin(x * freq * 0.5 + speed * 0.7 + prog) * amp * 0.4;
                    x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
                }

                const grad = ctx.createLinearGradient(0, 0, W, 0);
                grad.addColorStop(0, `hsla(${hue},${sat}%,${lit}%,0)`);
                grad.addColorStop(0.15, `hsla(${hue},${sat}%,${lit}%,${alpha})`);
                grad.addColorStop(0.5, `hsla(${hue + 15},${sat}%,${lit + 8}%,${alpha * 1.2})`);
                grad.addColorStop(0.85, `hsla(${hue},${sat}%,${lit}%,${alpha})`);
                grad.addColorStop(1, `hsla(${hue},${sat}%,${lit}%,0)`);

                ctx.strokeStyle = grad;
                ctx.lineWidth = lineWidth;
                ctx.lineCap = 'round';
                ctx.stroke();
            }

            const gX1 = variant === 1 ? W * 0.15 : W * 0.85;
            const gX2 = variant === 1 ? W * 0.82 : W * 0.18;

            const g1 = ctx.createRadialGradient(gX1, H * 0.5, 0, gX1, H * 0.5, W * 0.35);
            g1.addColorStop(0, 'rgba(0,180,216,0.1)'); g1.addColorStop(1, 'transparent');
            ctx.fillStyle = g1; ctx.fillRect(0, 0, W, H);

            const g2 = ctx.createRadialGradient(gX2, H * 0.5, 0, gX2, H * 0.5, W * 0.28);
            g2.addColorStop(0, 'rgba(255,107,43,0.09)'); g2.addColorStop(1, 'transparent');
            ctx.fillStyle = g2; ctx.fillRect(0, 0, W, H);

            t += 0.020;
        }

        function loop() {
            if (!isVisible || document.hidden) { animId = null; return; }
            frameCount++;
            if (frameCount % 2 === 0) draw(); // PERF: render every other frame (~30 fps)
            animId = requestAnimationFrame(loop);
        }

        resize();
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden && isVisible && !animId) loop();
        });
        let resizeTimer;
        window.addEventListener('resize', () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(resize, 150); });
    }

    initCtaCanvas('ctaCanvas1', 1);
    initCtaCanvas('ctaCanvas2', 2);

    // ===== ETA SECTION CANVAS =====
    function initEtaCanvas() {
        const canvas = document.getElementById('etaCanvas');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        let W, H, t = 0, animId = null;
        let isVisible = false;
        
        function resize() {
            W = canvas.width = canvas.offsetWidth;
            H = canvas.height = canvas.offsetHeight;
        }
        
        // Observer for visibility
        const observer = new IntersectionObserver(entries => {
            entries.forEach(e => {
                isVisible = e.isIntersecting;
                if (isVisible && !animId) loop();
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
            
            // Subtle gradient background
            const bgGrad = ctx.createLinearGradient(0, 0, W, H);
            bgGrad.addColorStop(0, 'rgba(255, 255, 255, 0.02)');
            bgGrad.addColorStop(1, 'rgba(0, 119, 182, 0.02)');
            ctx.fillStyle = bgGrad;
            ctx.fillRect(0, 0, W, H);
            
            // Draw floating particles
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
            
            // Draw flowing wave lines
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
            
            t += 0.02;
        }
        
        function loop() {
            if (!isVisible || document.hidden) {
                animId = null;
                return;
            }
            draw();
            animId = requestAnimationFrame(loop);
        }
        
        resize();
        window.addEventListener('resize', () => {
            cancelAnimationFrame(animId);
            resize();
            if (isVisible) loop();
        });
        
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden && isVisible && !animId) loop();
        });
    }
    
    // Initialize ETA canvas
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
                        // Get the target width from CSS variable
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
    
    // Initialize ETA progress bars
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

    // ===== FORM SUBMISSION =====
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
                const data = {
                    name: formData.get('name'),
                    email: formData.get('email'),
                    phone: formData.get('phone') || 'Not provided',
                    message: formData.get('message')
                };
                const response = await fetch(this.action, {
                    method: 'POST',
                    body: JSON.stringify(data),
                    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }
                });
                if (response.ok) {
                    showAlert("Success! Your message has been sent. We'll get back to you within 24 hours.", 'success');
                    this.reset();
                } else {
                    const subject = encodeURIComponent('Cascade Creations Inquiry');
                    const body = encodeURIComponent(`Name: ${data.name}\nEmail: ${data.email}\nPhone: ${data.phone}\n\nMessage:\n${data.message}`);
                    window.location.href = `mailto:atsello4@gmail.com?subject=${subject}&body=${body}`;
                    showAlert('Email client opened. Please send the pre-filled email.', 'success');
                    this.reset();
                }
            } catch (error) {
                console.error('Form submission error:', error);
                showAlert('Oops! Something went wrong. Please try again or contact us directly.', 'error');
            } finally {
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }
        });
    }

    const newsletterForm = document.querySelector('.newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const emailInput = this.querySelector('input[type="email"]');
            const email = emailInput.value.trim();
            if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                showAlert('Please enter a valid email address.', 'error'); return;
            }
            showAlert('Thank you for subscribing to our newsletter!', 'success');
            emailInput.value = '';
        });
    }

    // ===== ANIMATE ON DISPLAY (AOD) =====
    // PERF: single shared observer — replaces both per-element and per-section observers
    (function () {
        const aodElements = document.querySelectorAll('[data-aod]');
        if (!aodElements.length) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const el = entry.target;
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        el.classList.add('aod-in');
                        el.classList.remove('aod-out');
                    }, parseInt(el.dataset.aodDelay || 0));
                } else {
                    el.classList.remove('aod-in');
                    el.classList.add('aod-out');
                }
            });
        }, { threshold: 0.15, rootMargin: '0px 0px -20px 0px' });

        aodElements.forEach(el => observer.observe(el));
    })();


    // ===== SECTION PULSE CANVASES =====
    // Matching the hero canvas aesthetic: animated sinusoidal ribbon loops.
    // White sections (about, process, aod)  → deep teal/navy strokes, visible on light bg
    // Dark sections  (services, why, contact) → bright cyan + orange strokes, vivid on dark bg
    (function initSectionPulses() {

        // Config per section: { id, anchor (where canvas is injected), theme }
        // theme: 'light' = white bg sections, 'dark' = dark bg sections
        const SECTIONS = [
            { selector: '.about-section', theme: 'light', corner: 'topRight' },
            { selector: '.process-section', theme: 'light', corner: 'bottomLeft' },
            { selector: '.services-section', theme: 'dark', corner: 'topLeft' },
            { selector: '.aod-section', theme: 'light', corner: 'center' },
            { selector: '.why-section', theme: 'dark', corner: 'bottomRight' },
            { selector: '.contact-section', theme: 'light', corner: 'topRight' },
        ];

        // Palette for light (white bg) sections — dark teal strokes pop on white
        function lightColor(waveIdx, totalWaves, t, alpha) {
            const hues = [195, 205, 210, 200, 190, 215, 202];
            const sats = [85, 80, 75, 88, 82, 78, 86];
            const lits = [28, 32, 25, 30, 35, 27, 31];   // dark = visible on white
            const i = waveIdx % hues.length;
            const hShift = Math.sin(t * 0.35 + waveIdx * 0.6) * 8;
            return `hsla(${hues[i] + hShift}, ${sats[i]}%, ${lits[i]}%, ${alpha})`;
        }

        // Palette for dark sections — bright cyan + occasional orange pop
        function darkColor(waveIdx, totalWaves, t, alpha, isOrange) {
            if (isOrange) return `hsla(20, 90%, 58%, ${alpha})`;
            const hues = [185, 195, 205, 190, 200, 210, 188];
            const sats = [82, 78, 75, 85, 80, 72, 88];
            const lits = [62, 58, 65, 60, 68, 55, 63];   // bright = vivid on dark
            const i = waveIdx % hues.length;
            const hShift = Math.sin(t * 0.4 + waveIdx * 0.5) * 10;
            return `hsla(${hues[i] + hShift}, ${sats[i]}%, ${lits[i]}%, ${alpha})`;
        }

        function initPulse(sectionEl, theme, corner) {
            // Create & inject canvas
            const canvas = document.createElement('canvas');
            canvas.className = 'section-pulse-canvas';
            sectionEl.insertBefore(canvas, sectionEl.firstChild);

            const ctx = canvas.getContext('2d');
            let W, H, t = 0, animId = null, isVisible = false, frameCount = 0;

            function resize() {
                W = canvas.width = sectionEl.offsetWidth;
                H = canvas.height = sectionEl.offsetHeight;
            }

            // Observe visibility — only animate when in viewport
            const observer = new IntersectionObserver(entries => {
                entries.forEach(e => {
                    isVisible = e.isIntersecting;
                    if (isVisible && !animId) loop();
                });
            }, { threshold: 0.05 });
            observer.observe(sectionEl);

            // Compute focal origin based on corner config
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
                ctx.clearRect(0, 0, W, H);

                const { cx, cy } = getOrigin();
                const numRibbons = 10;
                const isLight = theme === 'light';

                // Draw ribbons from outermost inward so inner ones paint on top
                for (let r = numRibbons; r >= 0; r--) {
                    const progress = r / numRibbons;
                    const phaseOffset = progress * Math.PI * 2.6 + t * 0.42;
                    const radiusX = W * (0.12 + progress * 0.22);
                    const radiusY = H * (0.18 + progress * 0.14);
                    const thickness = 10 + Math.sin(progress * Math.PI) * 22;

                    // Build ribbon points as sinusoidal closed loop
                    const pts = [];
                    const steps = 48;
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
                        ? 0.06 + Math.sin(progress * Math.PI) * 0.16   // more opaque on white
                        : 0.08 + Math.sin(progress * Math.PI) * 0.22;  // brighter on dark

                    const isOrange = !isLight && r === Math.floor(numRibbons * 0.4);

                    const grad = ctx.createLinearGradient(cx - radiusX, cy, cx + radiusX, cy);
                    if (isLight) {
                        grad.addColorStop(0, lightColor(r, numRibbons, t, baseAlpha * 0.4));
                        grad.addColorStop(0.3, lightColor(r + 2, numRibbons, t, baseAlpha));
                        grad.addColorStop(0.6, lightColor(r + 4, numRibbons, t, baseAlpha * 1.1));
                        grad.addColorStop(1, lightColor(r, numRibbons, t, baseAlpha * 0.4));
                    } else {
                        grad.addColorStop(0, darkColor(r, numRibbons, t, baseAlpha * 0.4, false));
                        grad.addColorStop(0.3, darkColor(r + 2, numRibbons, t, baseAlpha, isOrange));
                        grad.addColorStop(0.6, darkColor(r + 4, numRibbons, t, baseAlpha * 1.1, isOrange));
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

                // Soft inner glow at focal origin
                const glowColor = isLight
                    ? 'rgba(0, 119, 182, 0.10)'
                    : 'rgba(0, 180, 216, 0.13)';
                const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, W * 0.38);
                glow.addColorStop(0, glowColor);
                glow.addColorStop(1, 'transparent');
                ctx.fillStyle = glow;
                ctx.fillRect(0, 0, W, H);

                t += 0.20;
            }

            function loop() {
                if (!isVisible || document.hidden) { animId = null; return; }
                frameCount++;
                if (frameCount % 2 === 0) draw(); // ~30 fps, matches CTA canvas perf approach
                animId = requestAnimationFrame(loop);
            }

            document.addEventListener('visibilitychange', () => {
                if (!document.hidden && isVisible && !animId) loop();
            });

            let resizeTimer;
            window.addEventListener('resize', () => {
                clearTimeout(resizeTimer);
                resizeTimer = setTimeout(resize, 150);
            }, { passive: true });

            resize();
        }

        // Boot all section pulses
        SECTIONS.forEach(({ selector, theme, corner }) => {
            const el = document.querySelector(selector);
            if (el) initPulse(el, theme, corner);
        });

    })();

    // ===== SET CURRENT YEAR =====
    const yearEl = document.getElementById('currentYear');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    // ===== STUDIO LINK =====
    const studioLink = document.querySelector('a[href*="CascadeComingSoon"]');
    if (studioLink) {
        studioLink.addEventListener('click', function (e) {
            e.preventDefault();
            showAlert('Direct contact: atsello4@gmail.com or 072 078 6569', 'success');
        });
    }
});

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