document.addEventListener('DOMContentLoaded', () => {
    // Detect touch device
    const isTouchDevice = window.matchMedia('(hover: none) and (pointer: coarse)').matches;

    // Navbar Scroll Effect
    const navbar = document.getElementById('navbar');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }, { passive: true });

    // Mobile Menu Toggle
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const closeMenuBtn = document.querySelector('.close-menu-btn');
    const mobileMenu = document.querySelector('.mobile-menu');
    const mobileNavItems = document.querySelectorAll('.mobile-nav-item');

    function openMobileMenu() {
        if (mobileMenu) {
            mobileMenu.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }

    function closeMobileMenu() {
        if (mobileMenu) {
            mobileMenu.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    function toggleMobileMenu() {
        if (mobileMenu && mobileMenu.classList.contains('active')) {
            closeMobileMenu();
        } else {
            openMobileMenu();
        }
    }

    if (mobileMenuBtn) mobileMenuBtn.addEventListener('click', toggleMobileMenu);
    if (closeMenuBtn) closeMenuBtn.addEventListener('click', closeMobileMenu);

    // Close menu on link click and scroll to section
    mobileNavItems.forEach(item => {
        item.addEventListener('click', (e) => {
            closeMobileMenu();
            // Allow default anchor link behavior after small delay
            setTimeout(() => {
                const href = item.getAttribute('href');
                if (href && href.startsWith('#')) {
                    const target = document.querySelector(href);
                    if (target) {
                        target.scrollIntoView({ behavior: 'smooth' });
                    }
                }
            }, 100);
        });
    });

    // Close mobile menu on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeMobileMenu();
    });

    // --- High Performance Render Loop (60 FPS) ---
    // Skip cursor and parallax effects on touch devices
    const heroVisual = document.querySelector('.hero-visual');
    const orbs = document.querySelectorAll('.glow-orb');
    
    // Create cursor elements only for non-touch devices
    let cursorDot, cursorOutline;
    if (!isTouchDevice) {
        cursorDot = document.createElement('div');
        cursorDot.className = 'cursor-dot';
        document.body.appendChild(cursorDot);

        cursorOutline = document.createElement('div');
        cursorOutline.className = 'cursor-outline';
        document.body.appendChild(cursorOutline);
    }

    // State for smooth movement
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let dotX = mouseX, dotY = mouseY;
    let outlineX = mouseX, outlineY = mouseY;
    let parallaxX = 0, parallaxY = 0;

    // Only setup mouse tracking for non-touch devices
    if (!isTouchDevice) {
        window.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        }, { passive: true });
    }

    const lerp = (start, end, factor) => start + (end - start) * factor;

    function render() {
        // Only run cursor and parallax on non-touch devices
        if (!isTouchDevice && cursorDot && cursorOutline) {
            // Smooth Cursor Dot (Fast follow)
            dotX = lerp(dotX, mouseX, 0.3);
            dotY = lerp(dotY, mouseY, 0.3);
            cursorDot.style.transform = `translate3d(${dotX}px, ${dotY}px, 0) translate(-50%, -50%)`;

            // Smooth Cursor Outline (Delayed follow)
            outlineX = lerp(outlineX, mouseX, 0.15);
            outlineY = lerp(outlineY, mouseY, 0.15);
            cursorOutline.style.transform = `translate3d(${outlineX}px, ${outlineY}px, 0) translate(-50%, -50%)`;

            // Smooth Parallax
            const targetParallaxX = (mouseX - window.innerWidth / 2) / 40;
            const targetParallaxY = (mouseY - window.innerHeight / 2) / 40;
            parallaxX = lerp(parallaxX, targetParallaxX, 0.1);
            parallaxY = lerp(parallaxY, targetParallaxY, 0.1);

            if (heroVisual) {
                heroVisual.style.transform = `translate3d(${parallaxX}px, ${parallaxY}px, 0)`;
            }

            orbs.forEach((orb, index) => {
                const factor = (index + 1) * 10;
                orb.style.transform = `translate3d(${parallaxX / factor}px, ${parallaxY / factor}px, 0)`;
            });
        }

        requestAnimationFrame(render);
    }
    requestAnimationFrame(render);

    // Cursor Hover States - only for non-touch devices
    if (!isTouchDevice && cursorOutline) {
        document.querySelectorAll('a, button, input, textarea, select, .mobile-menu-btn, .close-menu-btn').forEach(el => {
            el.addEventListener('mouseenter', () => {
                cursorOutline.style.width = '60px';
                cursorOutline.style.height = '60px';
                cursorOutline.style.backgroundColor = 'rgba(255, 153, 51, 0.1)';
            });
            el.addEventListener('mouseleave', () => {
                cursorOutline.style.width = '40px';
                cursorOutline.style.height = '40px';
                cursorOutline.style.backgroundColor = 'transparent';
            });
        });
    }

    // Intersection Observer for Scroll Animations
    const observerOptions = {
        threshold: 0.15
    };

    const animateOnScroll = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('appear');
            }
        });
    }, observerOptions);

    document.querySelectorAll('.fade-in, .fade-in-up, .slide-in-left, .slide-in-right, .scale-up').forEach(el => {
        animateOnScroll.observe(el);
    });

    // Form Submission
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        const sessionId = 'session_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
        
        const getFormData = () => {
            const getVal = (id) => document.getElementById(id)?.value || '';
            return {
                sessionId: sessionId,
                name: getVal('name'),
                phone: (getVal('country-code') || '') + ' ' + getVal('phone'),
                dob: getVal('dob'),
                tob: getVal('tob'),
                pob: getVal('pob'),
                service: getVal('service')
            };
        };

        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = contactForm.querySelector('button[type="submit"]');
            const originalText = btn.innerHTML;
            const formData = getFormData();

            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> बचत हुँदैछ...';
            btn.disabled = true;

            try {
                const response = await fetch('http://localhost:5001/submit', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });

                if (response.ok) {
                    btn.innerHTML = '<i class="fas fa-check"></i> पुन: निर्देशित गर्दै...';
                    btn.style.background = 'var(--saffron)';
                    setTimeout(() => {
                        window.location.href = `payment.html?session=${sessionId}`;
                    }, 1500);
                } else {
                    throw new Error('Server error');
                }
            } catch (err) {
                btn.innerHTML = '<i class="fas fa-exclamation-triangle"></i> त्रुटि';
                btn.style.background = '#ff4444';
                setTimeout(() => {
                    btn.innerHTML = originalText;
                    btn.style.background = '';
                    btn.disabled = false;
                }, 3000);
            }
        });
    }
});
