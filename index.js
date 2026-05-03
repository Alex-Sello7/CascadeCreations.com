// ===== DOM READY =====
document.addEventListener('DOMContentLoaded', function () {

    // ===== LOADING SCREEN =====
    const loadingScreen = document.getElementById('loadingScreen');
    const loaderPct = document.getElementById('loaderPct');
    let pct = 0;
    let loaderCompleted = false;
    
    const pctTimer = setInterval(() => {
        if (!loaderCompleted) {
            pct = Math.min(pct + Math.random() * 3 + 1, 99);
            if (loaderPct) loaderPct.textContent = Math.floor(pct) + '%';
        }
    }, 50);

    function hideLoader() {
        if (loaderCompleted) return;
        loaderCompleted = true;
        clearInterval(pctTimer);
        if (loaderPct) loaderPct.textContent = '100%';
        
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

    // ===== FLIP CARDS: CLICK TO FLIP =====
    (function initFlipCards() {
        const flipCards = document.querySelectorAll('.service-flip-card');
        let currentlyFlipped = null;
        
        flipCards.forEach(card => {
            const inner = card.querySelector('.flip-card-inner');
            if (inner) {
                inner.style.transform = 'rotateY(0deg)';
                inner.style.transition = 'transform 0.6s cubic-bezier(0.23, 1, 0.32, 1)';
            }
            
            card.addEventListener('click', function(e) {
                if (e.target.closest('.flip-cta')) return;
                
                const innerElem = this.querySelector('.flip-card-inner');
                if (!innerElem) return;
                
                const isFlipped = innerElem.style.transform === 'rotateY(180deg)';
                
                if (currentlyFlipped && currentlyFlipped !== this) {
                    const prevInner = currentlyFlipped.querySelector('.flip-card-inner');
                    if (prevInner) prevInner.style.transform = 'rotateY(0deg)';
                }
                
                if (isFlipped) {
                    innerElem.style.transform = 'rotateY(0deg)';
                    currentlyFlipped = null;
                } else {
                    innerElem.style.transform = 'rotateY(180deg)';
                    currentlyFlipped = this;
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
        let frameCount = 0;

        function resizeCanvas() {
            W = heroCanvas.width = heroCanvas.offsetWidth;
            H = heroCanvas.height = heroCanvas.offsetHeight;
        }

        function waveColor(index, total, t, alpha) {
            const hues = [185, 195, 205, 190, 200, 210, 188, 195];
            const i = index % hues.length;
            const hShift = Math.sin(t * 0.4 + index * 0.5) * 8;
            return `hsla(${hues[i] + hShift}, 75%, 60%, ${alpha})`;
        }

        function drawScene() {
            if (!ctx || !animationActive) return;
            
            frameCount++;
            if (frameCount % 2 !== 0) {
                animId = requestAnimationFrame(drawScene);
                return;
            }

            ctx.clearRect(0, 0, W, H);
            
            const bg = ctx.createLinearGradient(0, 0, W, H);
            bg.addColorStop(0, '#020617');
            bg.addColorStop(1, '#0f172a');
            ctx.fillStyle = bg;
            ctx.fillRect(0, 0, W, H);

            const cx = W * 0.6, cy = H * 0.5;
            const numRibbons = 6;
            const steps = 30;

            for (let r = numRibbons; r >= 0; r--) {
                const progress = r / numRibbons;
                const phaseOffset = progress * Math.PI * 2.5 + t * 0.4;
                const radiusX = W * (0.15 + progress * 0.2);
                const radiusY = H * (0.2 + progress * 0.15);
                const thickness = 12 + Math.sin(progress * Math.PI) * 20;

                const pts = [];
                for (let i = 0; i <= steps; i++) {
                    const angle = (i / steps) * Math.PI * 2;
                    pts.push({
                        x: cx + Math.cos(angle) * radiusX + Math.cos(angle * 1.8 + phaseOffset * 0.6) * W * 0.03,
                        y: cy + Math.sin(angle) * radiusY + Math.sin(angle * 2.3 + phaseOffset) * H * 0.04
                    });
                }

                const alpha = 0.08 + Math.sin(progress * Math.PI) * 0.2;
                const grad = ctx.createLinearGradient(cx - radiusX, cy, cx + radiusX, cy);
                grad.addColorStop(0, waveColor(r, numRibbons, t, alpha * 0.6));
                grad.addColorStop(0.5, waveColor(r + 2, numRibbons, t, alpha));
                grad.addColorStop(1, waveColor(r + 4, numRibbons, t, alpha * 0.6));

                ctx.beginPath();
                ctx.moveTo(pts[0].x, pts[0].y);
                for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
                ctx.closePath();
                ctx.strokeStyle = grad;
                ctx.lineWidth = thickness;
                ctx.stroke();
            }

            const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, W * 0.4);
            glow.addColorStop(0, 'rgba(6, 182, 212, 0.08)');
            glow.addColorStop(1, 'transparent');
            ctx.fillStyle = glow;
            ctx.fillRect(0, 0, W, H);

            t += 0.012;
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
            } else {
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

    // ===== SMOOTH PARALLAX =====
    (function initSmoothParallax() {
        const parallaxElements = document.querySelectorAll('.parallax-bg');
        if (!parallaxElements.length) return;
        
        let rafId = null;
        let ticking = false;
        
        function updateParallax() {
            if (window.innerWidth <= 768) return;
            
            parallaxElements.forEach(bg => {
                const section = bg.closest('.has-parallax');
                if (!section) return;
                
                const speed = parseFloat(bg.dataset.parallaxSpeed) || 0.35;
                const rect = section.getBoundingClientRect();
                const scrollY = window.scrollY;
                const sectionTop = rect.top + scrollY;
                const viewportCenter = window.innerHeight / 2;
                const offset = (scrollY - sectionTop + viewportCenter) * speed;
                
                bg.style.transform = `translate3d(0, ${offset * 0.3}px, 0)`;
            });
            ticking = false;
        }
        
        function requestUpdate() {
            if (!ticking) {
                rafId = requestAnimationFrame(updateParallax);
                ticking = true;
            }
        }
        
        window.addEventListener('scroll', requestUpdate, { passive: true });
        window.addEventListener('resize', requestUpdate);
        updateParallax();
    })();

    // ===== NAVIGATION =====
    const navbar = document.querySelector('.navbar');
    const navLinks = document.querySelectorAll('.nav-link');
    
    function updateNavbarOnScroll() {
        if (!navbar) return;
        navbar.classList.toggle('scrolled', window.scrollY > 20);
    }
    updateNavbarOnScroll();
    window.addEventListener('scroll', () => requestAnimationFrame(updateNavbarOnScroll), { passive: true });

    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href && href.startsWith('#')) {
                e.preventDefault();
                navLinks.forEach(l => l.classList.remove('active'));
                this.classList.add('active');
                const target = document.querySelector(href);
                if (target) {
                    window.scrollTo({ top: target.offsetTop - 80, behavior: 'smooth' });
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

    // ===== FORM SUBMISSION =====
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
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
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }
        });
    }

    // ===== ANIMATE ON DISPLAY =====
    (function initAOD() {
        const aodElements = document.querySelectorAll('[data-aod]');
        if (!aodElements.length) return;
        
        const pendingTimers = new WeakMap();
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const el = entry.target;
                
                if (entry.isIntersecting) {
                    const delay = parseInt(el.dataset.aodDelay || 0);
                    const timer = setTimeout(() => {
                        el.classList.add('aod-in');
                        el.classList.remove('aod-out');
                        observer.unobserve(el);
                    }, delay);
                    pendingTimers.set(el, timer);
                } else {
                    const pending = pendingTimers.get(el);
                    if (pending !== undefined) {
                        clearTimeout(pending);
                        pendingTimers.delete(el);
                    }
                    if (!el.classList.contains('aod-in')) {
                        el.classList.add('aod-out');
                    }
                }
            });
        }, { threshold: 0.2, rootMargin: '0px 0px -40px 0px' });
        
        aodElements.forEach(el => observer.observe(el));
    })();

    // ===== OUR WORK TILES =====
    (function initWorkTiles() {
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

    // ===== SECTION PULSE CANVASES =====
    (function initSectionPulses() {
        const sections = [
            { selector: '.services-section', theme: 'dark' },
            { selector: '.contact-section', theme: 'dark' },
            { selector: '.work-section', theme: 'dark' },
        ];
        
        function createPulseCanvas(section, theme) {
            const canvas = document.createElement('canvas');
            canvas.className = 'section-pulse-canvas';
            section.insertBefore(canvas, section.firstChild);
            
            const ctx = canvas.getContext('2d');
            let W, H, t = 0, animId = null, isVisible = false, frameCount = 0;
            
            function resize() {
                W = canvas.width = section.offsetWidth;
                H = canvas.height = section.offsetHeight;
            }
            
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
            observer.observe(section);
            
            function draw() {
                if (!ctx) return;
                ctx.clearRect(0, 0, W, H);
                
                const cx = W * 0.5, cy = H * 0.5;
                const numRibbons = 4;
                const steps = 24;
                
                for (let r = numRibbons; r >= 0; r--) {
                    const progress = r / numRibbons;
                    const phaseOffset = progress * Math.PI * 2.4 + t * 0.3;
                    const radiusX = W * (0.1 + progress * 0.25);
                    const radiusY = H * (0.15 + progress * 0.2);
                    const thickness = 8 + Math.sin(progress * Math.PI) * 15;
                    
                    const pts = [];
                    for (let i = 0; i <= steps; i++) {
                        const angle = (i / steps) * Math.PI * 2;
                        pts.push({
                            x: cx + Math.cos(angle) * radiusX + Math.cos(angle * 1.6 + phaseOffset * 0.5) * W * 0.02,
                            y: cy + Math.sin(angle) * radiusY + Math.sin(angle * 2.2 + phaseOffset) * H * 0.03
                        });
                    }
                    
                    const alpha = 0.05 + Math.sin(progress * Math.PI) * 0.1;
                    const grad = ctx.createLinearGradient(cx - radiusX, cy, cx + radiusX, cy);
                    grad.addColorStop(0, `rgba(6, 182, 212, ${alpha * 0.5})`);
                    grad.addColorStop(0.5, `rgba(6, 182, 212, ${alpha})`);
                    grad.addColorStop(1, `rgba(6, 182, 212, ${alpha * 0.5})`);
                    
                    ctx.beginPath();
                    ctx.moveTo(pts[0].x, pts[0].y);
                    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
                    ctx.closePath();
                    ctx.strokeStyle = grad;
                    ctx.lineWidth = thickness;
                    ctx.stroke();
                }
                t += 0.03;
            }
            
            function loop() {
                if (!isVisible || document.hidden) {
                    animId = null;
                    return;
                }
                frameCount++;
                if (frameCount % 2 === 0) draw();
                animId = requestAnimationFrame(loop);
            }
            
            document.addEventListener('visibilitychange', () => {
                if (!document.hidden && isVisible && !animId) loop();
                else if (document.hidden && animId) {
                    cancelAnimationFrame(animId);
                    animId = null;
                }
            });
            
            let resizeTimer;
            window.addEventListener('resize', () => {
                clearTimeout(resizeTimer);
                resizeTimer = setTimeout(resize, 150);
            });
            
            resize();
        }
        
        sections.forEach(({ selector }) => {
            const el = document.querySelector(selector);
            if (el) createPulseCanvas(el);
        });
    })();

    // ===== FOOTER CANVAS =====
    (function initFooterCanvas() {
        const canvas = document.getElementById('footerCanvas');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        let W, H, t = 0, animId = null, isVisible = false, frameCount = 0;
        
        function resize() {
            W = canvas.width = canvas.offsetWidth;
            H = canvas.height = canvas.offsetHeight;
        }
        
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
        observer.observe(canvas.parentElement);
        
        function draw() {
            if (!ctx) return;
            ctx.clearRect(0, 0, W, H);
            
            const cx = W * 0.15, cy = H * 0.85;
            const numRibbons = 5;
            const steps = 28;
            
            for (let r = numRibbons; r >= 0; r--) {
                const progress = r / numRibbons;
                const phaseOffset = progress * Math.PI * 2.3 + t * 0.35;
                const radiusX = W * (0.1 + progress * 0.3);
                const radiusY = H * (0.15 + progress * 0.25);
                const thickness = 6 + Math.sin(progress * Math.PI) * 12;
                
                const pts = [];
                for (let i = 0; i <= steps; i++) {
                    const angle = (i / steps) * Math.PI * 2;
                    pts.push({
                        x: cx + Math.cos(angle) * radiusX + Math.cos(angle * 1.5 + phaseOffset * 0.5) * W * 0.02,
                        y: cy + Math.sin(angle) * radiusY + Math.sin(angle * 2 + phaseOffset) * H * 0.03
                    });
                }
                
                const alpha = 0.04 + Math.sin(progress * Math.PI) * 0.08;
                const grad = ctx.createLinearGradient(cx - radiusX, cy, cx + radiusX, cy);
                grad.addColorStop(0, `rgba(6, 182, 212, ${alpha * 0.6})`);
                grad.addColorStop(0.5, `rgba(6, 182, 212, ${alpha})`);
                grad.addColorStop(1, `rgba(6, 182, 212, ${alpha * 0.6})`);
                
                ctx.beginPath();
                ctx.moveTo(pts[0].x, pts[0].y);
                for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
                ctx.closePath();
                ctx.strokeStyle = grad;
                ctx.lineWidth = thickness;
                ctx.stroke();
            }
            t += 0.025;
        }
        
        function loop() {
            if (!isVisible || document.hidden) {
                animId = null;
                return;
            }
            frameCount++;
            if (frameCount % 2 === 0) draw();
            animId = requestAnimationFrame(loop);
        }
        
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden && isVisible && !animId) loop();
            else if (document.hidden && animId) {
                cancelAnimationFrame(animId);
                animId = null;
            }
        });
        
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(resize, 150);
        });
        
        resize();
    })();

    // ===== LAZY BACKGROUND IMAGES =====
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
        }, { rootMargin: '200px', threshold: 0 });
        
        lazyBgEls.forEach(el => bgObserver.observe(el));
    })();

    // ===== SET CURRENT YEAR =====
    const yearEl = document.getElementById('currentYear');
    if (yearEl) yearEl.textContent = new Date().getFullYear();
    
    // ===== BOOTSTRAP COLLAPSE HANDLING =====
    const navbarToggler = document.querySelector('.navbar-toggler');
    const navbarCollapse = document.querySelector('.navbar-collapse');
    if (navbarToggler && navbarCollapse) {
        navbarToggler.addEventListener('click', function() {
            setTimeout(() => {
                document.body.style.overflow = this.getAttribute('aria-expanded') === 'true' ? 'hidden' : '';
            }, 100);
        });
        
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                if (navbarCollapse.classList.contains('show')) {
                    const bsCollapse = new bootstrap.Collapse(navbarCollapse, { toggle: false });
                    bsCollapse.hide();
                    document.body.style.overflow = '';
                    navbarToggler.setAttribute('aria-expanded', 'false');
                }
            });
        });
        
        navbarCollapse.addEventListener('hidden.bs.collapse', () => document.body.style.overflow = '');
        navbarCollapse.addEventListener('shown.bs.collapse', () => document.body.style.overflow = 'hidden');
    }
});

// ===== UTILITIES =====
function throttle(func, limit) {
    let inThrottle;
    return function() {
        if (!inThrottle) {
            func.apply(this, arguments);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

window.showAlert = function(message, type) {
    const existing = document.querySelector('.alert');
    if (existing) existing.remove();
    
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.innerHTML = `
        <div class="alert-content">
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
            <span>${message}</span>
        </div>
        <button class="alert-close" aria-label="Close alert"><i class="fas fa-times"></i></button>
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

window.addEventListener('error', function(e) {
    console.error('Global error:', e.error);
    if (e.message && e.message.includes('ResizeObserver')) e.preventDefault();
}, true);

window.addEventListener('unhandledrejection', function(e) {
    console.error('Unhandled rejection:', e.reason);
    e.preventDefault();
});