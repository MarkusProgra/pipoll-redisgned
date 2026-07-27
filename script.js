document.addEventListener('DOMContentLoaded', () => {
    // Dark Mode Toggle
    const themeToggle = document.getElementById('themeToggle');
    const html = document.documentElement;

    // Check for saved theme preference or default to light
    const savedTheme = localStorage.getItem('theme') || 'light';
    html.setAttribute('data-theme', savedTheme);

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const currentTheme = html.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            html.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
        });
    }

    // Typewriter effect for hero title
    const typewriterElement = document.getElementById('typewriter-text');
    if (typewriterElement) {
        const text = typewriterElement.textContent;
        typewriterElement.textContent = '';
        typewriterElement.style.opacity = '1';
        typewriterElement.style.transform = 'translateY(0)';
        typewriterElement.style.background = 'none';
        typewriterElement.style.webkitTextFillColor = 'var(--text)';

        let i = 0;
        function type() {
            if (i < text.length) {
                typewriterElement.textContent += text.charAt(i);
                i++;
                setTimeout(type, 50 + Math.random() * 30);
            }
            // Reapply gradient after typing completes
            if (i >= text.length) {
                typewriterElement.style.background = 'linear-gradient(135deg, var(--highlight) 0%, var(--highlight-dim) 100%)';
                typewriterElement.style.webkitBackgroundClip = 'text';
                typewriterElement.style.webkitTextFillColor = 'transparent';
                typewriterElement.style.backgroundClip = 'text';
            }
        }
        setTimeout(type, 800);
    }

    // Counter animation for stats
    const statValues = document.querySelectorAll('.stat-value');
    let statsAnimated = false;

    const countUp = (element, target, prefix = '', suffix = '') => {
        const duration = 2000;
        const steps = 60;
        const increment = target / steps;
        let current = 0;

        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                element.textContent = prefix + target + suffix;
                clearInterval(timer);
            } else {
                element.textContent = prefix + Math.floor(current) + suffix;
            }
        }, duration / steps);
    };

    const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !statsAnimated) {
                statsAnimated = true;
                const statElements = entry.target.querySelectorAll('.stat-value');
                statElements.forEach((stat, index) => {
                    const text = stat.textContent;
                    setTimeout(() => {
                        if (text.includes('+$25K')) {
                            countUp(stat, 25, '+$', 'K');
                        } else if (text.includes('+300')) {
                            countUp(stat, 300, '+', '');
                        } else if (text.includes('+7K')) {
                            countUp(stat, 7, '+', 'K');
                        }
                    }, index * 200);
                });
            }
        });
    }, { threshold: 0.5 });

    const statsSection = document.querySelector('.stats');
    if (statsSection) {
        statsObserver.observe(statsSection);
    }

    // Reveal animations on scroll
    const revealElements = document.querySelectorAll('.reveal, .solution-card, .hiw-step, .team-card, .blog-card');

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    revealElements.forEach(el => revealObserver.observe(el));

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href !== '#') {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    const offsetTop = target.offsetTop - 80;
                    window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });

    // Parallax effect on orbs - throttled for performance
    const orbs = document.querySelectorAll('.gradient-orb');
    let orbTicking = false;

    function updateOrbs() {
        const scrolled = window.pageYOffset;
        orbs.forEach((orb, index) => {
            const speed = 0.05 + (index * 0.03);
            orb.style.transform = `translateY(${scrolled * speed}px)`;
        });
        orbTicking = false;
    }

    window.addEventListener('scroll', () => {
        if (!orbTicking) {
            window.requestAnimationFrame(updateOrbs);
            orbTicking = true;
        }
    }, { passive: true });

    // Hide/show navbars on scroll
    const navbar = document.querySelector('.navbar');
    const floatingNav = document.querySelector('.navbar-floating');
    let lastScroll = 0;
    let ticking = false;

    function updateNavbars() {
        const current = window.pageYOffset;
        const heroHeight = window.innerHeight;
        const scrollThreshold = 100;

        if (current > heroHeight) {
            if (current > lastScroll && current > scrollThreshold) {
                navbar.classList.add('hidden');
                floatingNav.classList.remove('hidden');
                floatingNav.classList.add('visible');
            } else if (current < lastScroll) {
                navbar.classList.remove('hidden');
                floatingNav.classList.remove('visible');
                floatingNav.classList.add('hidden');
            }
        } else {
            navbar.classList.remove('hidden');
            floatingNav.classList.remove('visible');
            floatingNav.classList.add('hidden');
        }

        lastScroll = current;
        ticking = false;
    }

    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(updateNavbars);
            ticking = true;
        }
    }, { passive: true });

    navbar.classList.remove('hidden');
    floatingNav.classList.add('hidden');
});
