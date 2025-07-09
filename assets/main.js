// Main JavaScript for Mafrooshat 2030

// Wait for DOM to be loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all functionality
    initializeNavigation();
    initializeHeroSlider();
    initializeScrollAnimations();
    initializeStickyElements();
    initializeLazyLoading();
    initializeSmoothScrolling();
    loadStickySocial();
});

// Navigation functionality
function initializeNavigation() {
    const navToggle = document.getElementById('mobile-menu');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    // Mobile menu toggle
    if (navToggle) {
        navToggle.addEventListener('click', function() {
            navToggle.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
    }

    // Close mobile menu when clicking on a link
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            if (navToggle && navMenu) {
                navToggle.classList.remove('active');
                navMenu.classList.remove('active');
            }
        });
    });

    // Close mobile menu when clicking outside
    document.addEventListener('click', function(event) {
        if (navToggle && navMenu &&
            !navToggle.contains(event.target) &&
            !navMenu.contains(event.target)) {
            navToggle.classList.remove('active');
            navMenu.classList.remove('active');
        }
    });

    // Navbar scroll effect
    window.addEventListener('scroll', function() {
        const navbar = document.querySelector('.navbar');
        if (window.scrollY > 100) {
            navbar.style.background = 'rgba(255, 255, 255, 0.95)';
            navbar.style.backdropFilter = 'blur(10px)';
        } else {
            navbar.style.background = 'var(--white-color)';
            navbar.style.backdropFilter = 'none';
        }
    });
}

// Hero Slider functionality with enhanced animations
function initializeHeroSlider() {
    let currentSlide = 0;
    const slides = document.querySelectorAll('.slide');
    const dots = document.querySelectorAll('.dot');
    let slideInterval;
    let isTransitioning = false;

    if (slides.length === 0) return;

    // Create progress bar for auto-slide
    const progressBar = document.createElement('div');
    progressBar.className = 'slide-progress';
    document.querySelector('.hero-slider').appendChild(progressBar);

    function showSlide(index, direction = 'next') {
        if (isTransitioning) return;
        isTransitioning = true;

        const previousSlide = currentSlide;

        // Hide all slides with enhanced animation
        slides.forEach((slide, i) => {
            slide.classList.remove('active', 'prev', 'next');
            if (i === previousSlide) {
                slide.classList.add(direction === 'next' ? 'prev' : 'next');
            }
        });

        dots.forEach(dot => dot.classList.remove('active'));

        // Show current slide with animation
        setTimeout(() => {
            slides[index].classList.add('active');
            if (dots[index]) {
                dots[index].classList.add('active');
            }

            // Reset transition flag
            setTimeout(() => {
                isTransitioning = false;
            }, 800);
        }, 100);

        // Restart progress bar animation
        restartProgressBar();
    }

    function restartProgressBar() {
        progressBar.style.animation = 'none';
        progressBar.offsetHeight; // Trigger reflow
        progressBar.style.animation = 'progressBar 5s linear';
    }

    function nextSlide() {
        const nextIndex = (currentSlide + 1) % slides.length;
        showSlide(nextIndex, 'next');
        currentSlide = nextIndex;
    }

    function prevSlide() {
        const prevIndex = (currentSlide - 1 + slides.length) % slides.length;
        showSlide(prevIndex, 'prev');
        currentSlide = prevIndex;
    }

    function startAutoSlide() {
        slideInterval = setInterval(nextSlide, 5000);
        restartProgressBar();
    }

    function stopAutoSlide() {
        clearInterval(slideInterval);
        progressBar.style.animation = 'none';
    }

    // Initialize first slide
    showSlide(0);

    // Start auto-sliding
    startAutoSlide();

    // Pause auto-slide on hover
    const heroSlider = document.querySelector('.hero-slider');
    if (heroSlider) {
        heroSlider.addEventListener('mouseenter', stopAutoSlide);
        heroSlider.addEventListener('mouseleave', startAutoSlide);
    }

    // Dot click handlers with improved feedback
    dots.forEach((dot, index) => {
        dot.addEventListener('click', function() {
            if (currentSlide !== index && !isTransitioning) {
                const direction = index > currentSlide ? 'next' : 'prev';
                showSlide(index, direction);
                currentSlide = index;
                stopAutoSlide();
                setTimeout(startAutoSlide, 1000); // Restart after 1 second
            }
        });
    });

    // Expose functions globally for button clicks
    window.changeSlide = function(direction) {
        if (isTransitioning) return;
        stopAutoSlide();
        if (direction === 1) {
            nextSlide();
        } else {
            prevSlide();
        }
        setTimeout(startAutoSlide, 1000);
    };

    window.currentSlide = function(index) {
        if (isTransitioning) return;
        const direction = (index - 1) > currentSlide ? 'next' : 'prev';
        currentSlide = index - 1;
        showSlide(currentSlide, direction);
        stopAutoSlide();
        setTimeout(startAutoSlide, 1000);
    };

    // Enhanced keyboard navigation
    document.addEventListener('keydown', function(event) {
        if (isTransitioning) return;

        if (event.key === 'ArrowLeft') {
            event.preventDefault();
            stopAutoSlide();
            nextSlide(); // In RTL, left arrow goes to next
            setTimeout(startAutoSlide, 1000);
        } else if (event.key === 'ArrowRight') {
            event.preventDefault();
            stopAutoSlide();
            prevSlide(); // In RTL, right arrow goes to previous
            setTimeout(startAutoSlide, 1000);
        } else if (event.key === ' ') { // Spacebar to pause/resume
            event.preventDefault();
            if (slideInterval) {
                stopAutoSlide();
            } else {
                startAutoSlide();
            }
        }
    });

    // Enhanced touch/swipe support for mobile
    let startX = 0;
    let endX = 0;
    let startY = 0;
    let endY = 0;

    if (heroSlider) {
        heroSlider.addEventListener('touchstart', function(event) {
            startX = event.touches[0].clientX;
            startY = event.touches[0].clientY;
            stopAutoSlide();
        }, { passive: true });

        heroSlider.addEventListener('touchmove', function(event) {
            // Prevent default only for horizontal swipes
            const currentX = event.touches[0].clientX;
            const currentY = event.touches[0].clientY;
            const diffX = Math.abs(currentX - startX);
            const diffY = Math.abs(currentY - startY);

            if (diffX > diffY) {
                event.preventDefault();
            }
        }, { passive: false });

        heroSlider.addEventListener('touchend', function(event) {
            endX = event.changedTouches[0].clientX;
            endY = event.changedTouches[0].clientY;
            handleSwipe();
            setTimeout(startAutoSlide, 1000);
        }, { passive: true });

        function handleSwipe() {
            if (isTransitioning) return;

            const swipeThreshold = 50;
            const swipeDistance = endX - startX;
            const verticalDistance = Math.abs(endY - startY);

            // Only handle horizontal swipes
            if (Math.abs(swipeDistance) > swipeThreshold && verticalDistance < 100) {
                if (swipeDistance > 0) {
                    prevSlide(); // Swipe right goes to previous (RTL)
                } else {
                    nextSlide(); // Swipe left goes to next (RTL)
                }
            }
        }
    }

    // Add slide change event for analytics or other purposes
    const slideChangeEvent = new CustomEvent('slideChange', {
        detail: { currentSlide: currentSlide, totalSlides: slides.length }
    });
    document.dispatchEvent(slideChangeEvent);

    // Add visual feedback for slide transitions
    window.addEventListener('slideChange', function(e) {
        const currentSlideNumber = e.detail.currentSlide + 1;
        const totalSlides = e.detail.totalSlides;

        // Add flash effect to indicate slide change
        const flashEffect = document.createElement('div');
        flashEffect.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(45deg, rgba(201, 169, 110, 0.1), transparent);
            z-index: 9999;
            pointer-events: none;
            opacity: 0;
            animation: flashTransition 0.8s ease-out;
        `;

        document.body.appendChild(flashEffect);

        setTimeout(() => {
            document.body.removeChild(flashEffect);
        }, 800);
    });

    // Add CSS animation for flash effect
    const style = document.createElement('style');
    style.textContent = `
        @keyframes flashTransition {
            0% { opacity: 0; }
            20% { opacity: 0.3; }
            100% { opacity: 0; }
        }

        /* Preloader animation for smooth transitions */
        .slide-loading {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 50px;
            height: 50px;
            border: 3px solid rgba(201, 169, 110, 0.3);
            border-top: 3px solid #c9a96e;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            z-index: 10;
        }

        @keyframes spin {
            0% { transform: translate(-50%, -50%) rotate(0deg); }
            100% { transform: translate(-50%, -50%) rotate(360deg); }
        }
    `;
    document.head.appendChild(style);
}

// توليد النقاط تلقائياً للسلايدر الجديد
window.addEventListener('DOMContentLoaded', function() {
    const slider = document.querySelector('.hero-slider');
    const slides = slider ? slider.querySelectorAll('.slide') : [];
    const dotsContainer = document.querySelector('.slider-dots-new');
    if (slider && slides.length && dotsContainer) {
        dotsContainer.innerHTML = '';
        slides.forEach((_, idx) => {
            const dot = document.createElement('span');
            dot.className = 'dot' + (idx === 0 ? ' active' : '');
            dot.setAttribute('aria-label', 'انتقل إلى الشريحة ' + (idx + 1));
            dot.onclick = function() { window.currentSlide(idx + 1); };
            dotsContainer.appendChild(dot);
        });
    }
});

// Scroll animations
function initializeScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    // Add animation classes to elements
    const animatedElements = document.querySelectorAll(
        '.category-card, .payment-item, .contact-item, .feature, .product-card'
    );

    animatedElements.forEach((element, index) => {
        element.classList.add('fade-in');
        element.style.transitionDelay = `${index * 0.1}s`;
        observer.observe(element);
    });

    // Section titles animation
    const sectionTitles = document.querySelectorAll('.section-title');
    sectionTitles.forEach(title => {
        title.classList.add('slide-up');
        observer.observe(title);
    });
}

// Sticky elements
function initializeStickyElements() {
    // Sticky navigation highlight
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link[href^="#"]');

    function highlightNavigation() {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (window.scrollY >= sectionTop - 200) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    }

    window.addEventListener('scroll', highlightNavigation);
}

// Lazy loading for images
function initializeLazyLoading() {
    const imageObserver = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    imageObserver.unobserve(img);
                }
            }
        });
    });

    document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
    });
}

// Smooth scrolling for anchor links
function initializeSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const navbarHeight = document.querySelector('.navbar').offsetHeight;
                const targetPosition = target.offsetTop - navbarHeight;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Load sticky social media bar
function loadStickySocial() {
    const stickyContainer = document.getElementById('sticky-social');
    if (stickyContainer) {
        stickyContainer.innerHTML = `
            <div class="sticky-social">
                <a href="https://wa.me/966567123456" target="_blank" class="whatsapp" title="واتساب">
                    <i class="fab fa-whatsapp"></i>
                </a>
                <a href="https://www.facebook.com/profile.php?id=61578065040062" target="_blank" class="facebook" title="فيسبوك">
                    <i class="fab fa-facebook"></i>
                </a>
                <a href="https://www.instagram.com/mfrwshat2030" target="_blank" class="instagram" title="إنستغرام">
                    <i class="fab fa-instagram"></i>
                </a>
                <a href="https://www.tiktok.com/@mfrwshat2030" target="_blank" class="tiktok" title="تيك توك">
                    <i class="fab fa-tiktok"></i>
                </a>
                <a href="https://pin.it/4LInDB37o" target="_blank" class="pinterest" title="بينتيريست">
                    <i class="fab fa-pinterest"></i>
                </a>
            </div>
        `;
    }
}

// Utility functions
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

function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Performance optimizations
const optimizedScrollHandler = throttle(function() {
    // Handle scroll events
    const scrollY = window.scrollY;

    // Show/hide back to top button
    const backToTop = document.querySelector('.back-to-top');
    if (backToTop) {
        if (scrollY > 500) {
            backToTop.style.display = 'block';
        } else {
            backToTop.style.display = 'none';
        }
    }

    // Parallax effect for hero
    const hero = document.querySelector('.hero');
    if (hero && scrollY < window.innerHeight) {
        hero.style.transform = `translateY(${scrollY * 0.5}px)`;
    }
}, 16);

window.addEventListener('scroll', optimizedScrollHandler);

// Category hover effects
document.addEventListener('DOMContentLoaded', function() {
    const categoryCards = document.querySelectorAll('.category-card');

    categoryCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px) scale(1.02)';
        });

        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
});

// Form validation and submission (if forms are added later)
function validateForm(formElement) {
    const inputs = formElement.querySelectorAll('input[required], textarea[required]');
    let isValid = true;

    inputs.forEach(input => {
        if (!input.value.trim()) {
            input.classList.add('error');
            isValid = false;
        } else {
            input.classList.remove('error');
        }
    });

    return isValid;
}

// Local storage utilities
function saveToLocalStorage(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.error('Error saving to localStorage:', error);
    }
}

function getFromLocalStorage(key) {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : null;
    } catch (error) {
        console.error('Error reading from localStorage:', error);
        return null;
    }
}

// Analytics and tracking (placeholder for future implementation)
function trackEvent(eventName, eventData = {}) {
    // This can be connected to Google Analytics, Facebook Pixel, etc.
    console.log('Event tracked:', eventName, eventData);

    // Example: Google Analytics 4
    if (typeof gtag !== 'undefined') {
        gtag('event', eventName, eventData);
    }
}

// Error handling
window.addEventListener('error', function(event) {
    console.error('JavaScript error:', event.error);
    // You can send error reports to your analytics service here
});

// Service Worker registration for offline functionality (if needed in future)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('/sw.js')
            .then(function(registration) {
                console.log('ServiceWorker registration successful');
            })
            .catch(function(error) {
                console.log('ServiceWorker registration failed');
            });
    });
}

// Accessibility improvements
document.addEventListener('keydown', function(event) {
    // Escape key to close modals
    if (event.key === 'Escape') {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            if (modal.style.display === 'block') {
                modal.style.display = 'none';
            }
        });

        // Close mobile menu
        const navToggle = document.getElementById('mobile-menu');
        const navMenu = document.querySelector('.nav-menu');
        if (navToggle && navMenu && navMenu.classList.contains('active')) {
            navToggle.classList.remove('active');
            navMenu.classList.remove('active');
        }
    }
});

// Preload critical images
function preloadImages() {
    const criticalImages = [
        'assets/images/hero1.jpg',
        'assets/images/hero2.jpg',
        'assets/images/hero3.jpg',
        'assets/images/logo.svg'
    ];

    criticalImages.forEach(src => {
        const img = new Image();
        img.src = src;
    });
}

// Initialize preloading
preloadImages();

// Export functions for global use
window.mafrooshat2030 = {
    trackEvent,
    saveToLocalStorage,
    getFromLocalStorage,
    validateForm,
    debounce,
    throttle
};
