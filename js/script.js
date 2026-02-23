document.addEventListener('DOMContentLoaded', () => {
    // Splash Screen Logic
    const splashScreen = document.getElementById('splash-screen');
    const mantraLines = document.querySelectorAll('.mantra-line');
    const skipSplash = sessionStorage.getItem('splashSeen');

    if (splashScreen) {
        if (!skipSplash) {
            document.body.classList.add('no-scroll');
            let currentLine = 0;

            function showNextLine() {
                if (currentLine < mantraLines.length) {
                    mantraLines[currentLine].style.display = 'block';

                    setTimeout(() => {
                        mantraLines[currentLine].style.display = 'none';
                        currentLine++;
                        showNextLine();
                    }, 3000); // Matches CSS animation duration
                } else {
                    splashScreen.classList.add('hidden');
                    document.body.classList.remove('no-scroll');
                    sessionStorage.setItem('splashSeen', 'true');
                }
            }

            showNextLine();
        } else {
            splashScreen.style.display = 'none';
        }
    }

    // Navbar Scroll Effect
    const navbar = document.getElementById('navbar');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

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

    // Parallax Effect for Hero
    const heroVisual = document.querySelector('.hero-visual');
    const orbs = document.querySelectorAll('.glow-orb');

    document.addEventListener('mousemove', (e) => {
        const { clientX, clientY } = e;
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;

        const moveX = (clientX - centerX) / 40;
        const moveY = (clientY - centerY) / 40;

        if (heroVisual) {
            heroVisual.style.transform = `translate(${moveX}px, ${moveY}px)`;
        }

        orbs.forEach((orb, index) => {
            const factor = (index + 1) * 15;
            orb.style.transform = `translate(${moveX / factor}px, ${moveY / factor}px)`;
        });
    });

    // Intersection Observer for Scroll Animations
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const animateOnScroll = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('appear');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const animatedElements = document.querySelectorAll(
        '.fade-in, .fade-in-up, .slide-in-left, .slide-in-right, .scale-up'
    );

    animatedElements.forEach(el => animateOnScroll.observe(el));

    // Form Submission Details
    const contactForm = document.getElementById('contactForm');

    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const btn = contactForm.querySelector('button[type="submit"]');
            const originalText = btn.innerHTML;

            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
            btn.style.opacity = '0.8';
            btn.disabled = true;

            setTimeout(() => {
                btn.innerHTML = '<i class="fas fa-check"></i> Message Sent';
                btn.style.background = 'var(--saffron)';
                btn.style.color = 'var(--text-on-saffron)';

                setTimeout(() => {
                    contactForm.reset();
                    btn.innerHTML = originalText;
                    btn.style.background = '';
                    btn.style.opacity = '';
                    btn.disabled = false;
                }, 3000);
            }, 1500);
        });
    }
});
