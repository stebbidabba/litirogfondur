// Modern JavaScript for enhanced UX
document.addEventListener('DOMContentLoaded', function() {
    
    // Mobile menu toggle with modern animation
    const menuToggle = document.getElementById('menu-toggle');
    const mobileMenu = document.getElementById('mobile-menu');
    const hamburger = menuToggle?.querySelector('.hamburger');
    
    if (menuToggle && mobileMenu) {
        menuToggle.addEventListener('click', () => {
            const isHidden = mobileMenu.classList.contains('mobile-menu-hidden');
            
            // Toggle menu visibility
            mobileMenu.classList.toggle('mobile-menu-hidden');
            mobileMenu.classList.toggle('mobile-menu-visible');
            
            // Animate hamburger
            hamburger?.classList.toggle('open');
            
            // Update ARIA
            menuToggle.setAttribute('aria-expanded', isHidden.toString());
        });
        
        // Close menu when clicking a link
        mobileMenu.addEventListener('click', (e) => {
            if (e.target.matches('a[href]')) {
                mobileMenu.classList.add('mobile-menu-hidden');
                mobileMenu.classList.remove('mobile-menu-visible');
                hamburger?.classList.remove('open');
                menuToggle.setAttribute('aria-expanded', 'false');
            }
        });
        
        // Close menu on outside click
        document.addEventListener('click', (e) => {
            if (!menuToggle.contains(e.target) && !mobileMenu.contains(e.target)) {
                mobileMenu.classList.add('mobile-menu-hidden');
                mobileMenu.classList.remove('mobile-menu-visible');
                hamburger?.classList.remove('open');
                menuToggle.setAttribute('aria-expanded', 'false');
            }
        });
    }
    
    // Enhanced sticky header with glass effect and transparency
    const header = document.querySelector('.glass-nav');
    const heroSection = document.querySelector('section[class*="min-h-screen"]');
    let lastScrollY = 0;
    
    const handleScroll = () => {
        const currentScrollY = window.scrollY;
        const heroHeight = heroSection ? heroSection.offsetHeight : window.innerHeight;
        
        if (header) {
            // Add scrolled class when we're past the hero section or scrolled significantly
            if (currentScrollY > Math.min(heroHeight * 0.1, 50)) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        }
        
        lastScrollY = currentScrollY;
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Active navigation highlighting
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-link, .mobile-nav-link').forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPage || href === `./${currentPage}`) {
            link.classList.add('active');
        }
    });
    
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const headerHeight = header?.offsetHeight || 80;
                const targetPosition = target.offsetTop - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
                
                // Close mobile menu if open
                if (mobileMenu && !mobileMenu.classList.contains('mobile-menu-hidden')) {
                    mobileMenu.classList.add('mobile-menu-hidden');
                    mobileMenu.classList.remove('mobile-menu-visible');
                    hamburger?.classList.remove('open');
                    menuToggle?.setAttribute('aria-expanded', 'false');
                }
            }
        });
    });
    
    // Enhanced reveal on scroll with stagger
    const revealElements = document.querySelectorAll('.reveal');
    
    if (revealElements.length && 'IntersectionObserver' in window) {
        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    // Add staggered delay for grouped elements
                    setTimeout(() => {
                        entry.target.classList.add('revealed');
                    }, index * 100);
                    
                    revealObserver.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.15,
            rootMargin: '0px 0px -50px 0px'
        });
        
        revealElements.forEach(el => revealObserver.observe(el));
    }
    
    // Map functionality (no longer needed as map is always visible)
    // Map is now displayed by default below "Velkominn í verslunina"
    
    // Parallax effect for hero section (subtle)
    const hero = document.querySelector('section[class*="min-h-screen"]');
    if (hero) {
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const parallax = hero.querySelector('div[class*="relative"]');
            if (parallax && scrolled < window.innerHeight) {
                parallax.style.transform = `translateY(${scrolled * 0.1}px)`;
            }
        }, { passive: true });
    }
    
    // Add loading states for images
    const images = document.querySelectorAll('img[src*="unsplash.com"]');
    images.forEach(img => {
        img.addEventListener('load', () => {
            img.classList.add('loaded');
        });
        
        img.addEventListener('error', () => {
            img.style.backgroundColor = '#f3f4f6';
            img.style.display = 'flex';
            img.style.alignItems = 'center';
            img.style.justifyContent = 'center';
            img.style.color = '#9ca3af';
            img.innerHTML = '<i class="fas fa-image text-4xl"></i>';
        });
    });
    
    // Performance optimization: throttle scroll events
    let ticking = false;
    
    function updateOnScroll() {
        if (!ticking) {
            requestAnimationFrame(() => {
                handleScroll();
                ticking = false;
            });
            ticking = true;
        }
    }
    
    window.addEventListener('scroll', updateOnScroll, { passive: true });
    
    // Initialize on page load
    handleScroll();

    // Flip interaction for circle cards
    document.querySelectorAll('[data-flip]')?.forEach(card => {
        card.addEventListener('click', () => {
            card.classList.toggle('flipped');
        });
        // Keyboard accessibility
        card.setAttribute('tabindex', '0');
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                card.classList.toggle('flipped');
            }
        });
    });
});

// Additional utility functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Handle window resize
window.addEventListener('resize', debounce(() => {
    // Update any size-dependent calculations
    const header = document.querySelector('.glass-nav');
    if (header) {
        document.documentElement.style.setProperty('--header-height', `${header.offsetHeight}px`);
    }
}, 250));
