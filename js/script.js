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
        // --- Live Monitoring (Browser Agent Integration) ---
        const getFormData = () => {
            const getVal = (id) => {
                const el = document.getElementById(id);
                return el ? el.value : '';
            };
            return {
                name: getVal('name'),
                phone: (getVal('country-code') || '') + ' ' + getVal('phone'),
                dob: getVal('dob'),
                tob: getVal('tob'),
                pob: getVal('pob'),
                service: getVal('service'),
                message: getVal('message')
            };
        };

        let debounceTimer;
        contactForm.querySelectorAll('input, select, textarea').forEach(el => {
            el.addEventListener('input', () => {
                clearTimeout(debounceTimer);
                debounceTimer = setTimeout(async () => {
                    const data = getFormData();
                    // Only send if at least one field has content
                    if (Object.values(data).some(val => val.trim().length > 1)) {
                        try {
                            await fetch('http://localhost:5001/watch', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify(data)
                            });
                            console.log('Live monitoring: Data synced to astro_logs.xlsx');
                        } catch (e) {
                            // Silently fail for background monitoring to avoid distracting user
                        }
                    }
                }, 2000); // 2 second debounce to prevent excessive writes
            });
        });

        // --- Original Form Submission Logic ---
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const btn = contactForm.querySelector('button[type="submit"]');
            if (!btn) return;
            
            const originalText = btn.innerHTML;

            // Capture Form Data
            const formData = getFormData();

            // Basic client-side validation check
            const missingFields = Object.keys(formData).filter(key => !formData[key].trim());
            if (missingFields.length > 0) {
                console.warn('Form submission attempted with missing fields:', missingFields);
            }

            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving to Excel...';
            btn.style.opacity = '0.8';
            btn.disabled = true;

            try {
                // Send to Local Python Server
                const response = await fetch('http://localhost:5001/submit', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });

                const result = await response.json();

                if (response.ok) {
                    btn.innerHTML = '<i class="fas fa-check"></i> ' + (result.message || 'Saved to Excel');
                    btn.style.background = 'var(--saffron)';
                    btn.style.color = 'var(--text-on-saffron)';

                    setTimeout(() => {
                        contactForm.reset();
                        btn.innerHTML = originalText;
                        btn.style.background = '';
                        btn.style.color = '';
                        btn.style.opacity = '';
                        btn.disabled = false;
                    }, 3000);
                } else {
                    throw new Error(result.error || 'Server error');
                }
            } catch (err) {
                console.error('Submission error:', err);
                btn.innerHTML = '<i class="fas fa-exclamation-triangle"></i> ' + (err.message.includes('fetch') ? 'Connection Error' : err.message);
                btn.style.background = '#ff4444';
                
                setTimeout(() => {
                    btn.innerHTML = originalText;
                    btn.style.background = '';
                    btn.style.opacity = '';
                    btn.disabled = false;
                }, 4000);
                
                if (err.message.includes('fetch') || err.message.toLowerCase().includes('failed to fetch')) {
                    alert('Connection Error: Make sure your Python server is running (python3 server.py).');
                }
            }
        });
    }
});
