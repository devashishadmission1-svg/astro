document.addEventListener('DOMContentLoaded', () => {
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

    function toggleMobileMenu() {
        mobileMenu.classList.toggle('active');
        document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
    }

    if (mobileMenuBtn) mobileMenuBtn.addEventListener('click', toggleMobileMenu);
    if (closeMenuBtn) closeMenuBtn.addEventListener('click', toggleMobileMenu);

    mobileNavItems.forEach(item => {
        item.addEventListener('click', toggleMobileMenu);
    });

    // --- High Performance Render Loop (60 FPS) ---
    const heroVisual = document.querySelector('.hero-visual');
    const orbs = document.querySelectorAll('.glow-orb');
    
    // Create cursor elements
    const cursorDot = document.createElement('div');
    cursorDot.className = 'cursor-dot';
    document.body.appendChild(cursorDot);

    const cursorOutline = document.createElement('div');
    cursorOutline.className = 'cursor-outline';
    document.body.appendChild(cursorOutline);

    // State for smooth movement
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let dotX = mouseX, dotY = mouseY;
    let outlineX = mouseX, outlineY = mouseY;
    let parallaxX = 0, parallaxY = 0;

    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    }, { passive: true });

    const lerp = (start, end, factor) => start + (end - start) * factor;

    function render() {
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

        requestAnimationFrame(render);
    }
    requestAnimationFrame(render);

    // Cursor Hover States
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

            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
            btn.disabled = true;

            try {
                const response = await fetch('http://localhost:5001/submit', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });

                if (response.ok) {
                    btn.innerHTML = '<i class="fas fa-check"></i> Redirecting...';
                    btn.style.background = 'var(--saffron)';
                    setTimeout(() => {
                        window.location.href = `payment.html?session=${sessionId}`;
                    }, 1500);
                } else {
                    throw new Error('Server error');
                }
            } catch (err) {
                btn.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Error';
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
