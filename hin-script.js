document.addEventListener('DOMContentLoaded', () => {
    // Counter animation
    const counterElement = document.getElementById('humanCounter');
    if (counterElement) {
        const target = 347;
        const duration = 2500;
        const steps = 60;
        const increment = target / steps;
        let current = 0;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const timer = setInterval(() => {
                        current += increment;
                        if (current >= target) {
                            counterElement.textContent = target.toLocaleString();
                            clearInterval(timer);
                        } else {
                            counterElement.textContent = Math.floor(current).toLocaleString();
                        }
                    }, duration / steps);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        observer.observe(counterElement);
    }

    // Scroll reveal animations
    const revealElements = document.querySelectorAll('.anatomy-item, .entropy-item, .tier-row');

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }, index * 80);
                revealObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    revealElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        revealObserver.observe(el);
    });
});
