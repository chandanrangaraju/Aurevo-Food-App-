// Lazy Loading Implementation
class LazyLoader {
    constructor() {
        this.imageObserver = null;
        this.contentObserver = null;
        this.init();
    }

    init() {
        this.setupImageLazyLoading();
        this.setupContentLazyLoading();
    }

    setupImageLazyLoading() {
        // Check for Intersection Observer support
        if ('IntersectionObserver' in window) {
            this.imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        this.loadImage(entry.target);
                        observer.unobserve(entry.target);
                    }
                });
            }, {
                rootMargin: '50px 0px',
                threshold: 0.01
            });

            this.observeImages();
        } else {
            // Fallback for older browsers
            this.loadAllImages();
        }
    }

    setupContentLazyLoading() {
        if ('IntersectionObserver' in window) {
            this.contentObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        this.loadContent(entry.target);
                    }
                });
            }, {
                rootMargin: '100px 0px',
                threshold: 0.1
            });

            this.observeContent();
        }
    }

    observeImages() {
        const lazyImages = document.querySelectorAll('img.lazy-image, img[loading="lazy"]');
        lazyImages.forEach(img => {
            this.imageObserver.observe(img);
        });
    }

    observeContent() {
        const lazyContent = document.querySelectorAll('[data-lazy-content]');
        lazyContent.forEach(content => {
            this.contentObserver.observe(content);
        });
    }

    loadImage(img) {
        // Add loading class for smooth transition
        img.classList.add('loading');

        const imagePromise = new Promise((resolve, reject) => {
            const imageLoader = new Image();
            
            imageLoader.onload = () => {
                // Image loaded successfully
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                }
                if (img.dataset.srcset) {
                    img.srcset = img.dataset.srcset;
                }
                
                img.classList.remove('loading');
                img.classList.add('loaded');
                resolve();
            };

            imageLoader.onerror = () => {
                // Image failed to load, use fallback
                this.handleImageError(img);
                reject(new Error('Image failed to load'));
            };

            // Start loading
            imageLoader.src = img.dataset.src || img.src;
        });

        // Add timeout for slow connections
        const timeout = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Image load timeout')), 10000);
        });

        Promise.race([imagePromise, timeout]).catch(error => {
            console.warn('Image loading issue:', error);
            this.handleImageError(img);
        });
    }

    handleImageError(img) {
        img.classList.remove('loading');
        img.classList.add('error');
        
        // Use a fallback image or show error state
        const fallbackSrc = img.dataset.fallback || this.createFallbackImage();
        if (fallbackSrc !== img.src) {
            img.src = fallbackSrc;
        }
    }

    createFallbackImage() {
        // Create a simple SVG fallback image
        const svg = `
            <svg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200">
                <rect width="300" height="200" fill="#1a1a1a"/>
                <text x="150" y="100" text-anchor="middle" fill="#d4af37" font-family="Arial, sans-serif" font-size="14">
                    Image unavailable
                </text>
                <circle cx="150" cy="70" r="20" fill="none" stroke="#d4af37" stroke-width="2"/>
                <circle cx="145" cy="65" r="2" fill="#d4af37"/>
                <path d="M135 85 Q150 75 165 85" fill="none" stroke="#d4af37" stroke-width="2"/>
            </svg>
        `;
        return `data:image/svg+xml;base64,${btoa(svg)}`;
    }

    loadContent(element) {
        const contentType = element.dataset.lazyContent;
        
        switch (contentType) {
            case 'menu-items':
                this.loadMenuItems(element);
                break;
            case 'featured-items':
                this.loadFeaturedItems(element);
                break;
            case 'categories':
                this.loadCategories(element);
                break;
            default:
                element.classList.add('content-loaded');
        }
    }

    loadMenuItems(element) {
        // Simulate loading delay for smooth UX
        element.innerHTML = this.createSkeletonLoader('menu-items');
        
        setTimeout(() => {
            // Content would be loaded here
            element.classList.add('content-loaded');
            this.removeSkeletonLoader(element);
        }, 500);
    }

    loadFeaturedItems(element) {
        element.innerHTML = this.createSkeletonLoader('featured-items');
        
        setTimeout(() => {
            element.classList.add('content-loaded');
            this.removeSkeletonLoader(element);
        }, 300);
    }

    loadCategories(element) {
        element.innerHTML = this.createSkeletonLoader('categories');
        
        setTimeout(() => {
            element.classList.add('content-loaded');
            this.removeSkeletonLoader(element);
        }, 400);
    }

    createSkeletonLoader(type) {
        const skeletonClass = 'skeleton-loader';
        
        switch (type) {
            case 'menu-items':
                return `
                    <div class="${skeletonClass}">
                        <div class="skeleton-image"></div>
                        <div class="skeleton-content">
                            <div class="skeleton-title"></div>
                            <div class="skeleton-text"></div>
                            <div class="skeleton-text short"></div>
                            <div class="skeleton-button"></div>
                        </div>
                    </div>
                `;
            case 'featured-items':
                return `
                    <div class="${skeletonClass}">
                        <div class="skeleton-image large"></div>
                        <div class="skeleton-content">
                            <div class="skeleton-title"></div>
                            <div class="skeleton-text"></div>
                        </div>
                    </div>
                `;
            case 'categories':
                return `
                    <div class="${skeletonClass}">
                        <div class="skeleton-image medium"></div>
                        <div class="skeleton-content">
                            <div class="skeleton-title"></div>
                            <div class="skeleton-text"></div>
                        </div>
                    </div>
                `;
            default:
                return `<div class="${skeletonClass}"><div class="skeleton-image"></div></div>`;
        }
    }

    removeSkeletonLoader(element) {
        const skeletons = element.querySelectorAll('.skeleton-loader');
        skeletons.forEach(skeleton => {
            skeleton.style.opacity = '0';
            setTimeout(() => {
                if (skeleton.parentNode) {
                    skeleton.parentNode.removeChild(skeleton);
                }
            }, 300);
        });
    }

    // Refresh observers when new content is added
    refresh() {
        if (this.imageObserver) {
            this.observeImages();
        }
        if (this.contentObserver) {
            this.observeContent();
        }
    }

    // Manual trigger for loading images
    loadImageManually(img) {
        if (this.imageObserver) {
            this.imageObserver.unobserve(img);
        }
        this.loadImage(img);
    }

    // Preload critical images
    preloadCriticalImages() {
        const criticalImages = document.querySelectorAll('[data-critical="true"]');
        criticalImages.forEach(img => {
            this.loadImageManually(img);
        });
    }
}

// Progressive image enhancement
class ProgressiveImageLoader {
    constructor() {
        this.setupProgressiveLoading();
    }

    setupProgressiveLoading() {
        const progressiveImages = document.querySelectorAll('[data-progressive]');
        progressiveImages.forEach(img => {
            this.loadProgressively(img);
        });
    }

    loadProgressively(img) {
        const lowQualitySrc = img.dataset.lowsrc;
        const highQualitySrc = img.dataset.src || img.src;

        if (lowQualitySrc) {
            // Load low quality first
            img.src = lowQualitySrc;
            img.classList.add('low-quality');

            // Then load high quality
            const highQualityImg = new Image();
            highQualityImg.onload = () => {
                img.src = highQualitySrc;
                img.classList.remove('low-quality');
                img.classList.add('high-quality');
            };
            highQualityImg.src = highQualitySrc;
        }
    }
}

// Initialize lazy loading
function initializeLazyLoading() {
    const lazyLoader = new LazyLoader();
    const progressiveLoader = new ProgressiveImageLoader();
    
    // Make available globally for dynamic content
    window.lazyLoader = lazyLoader;
    window.progressiveLoader = progressiveLoader;
    
    return { lazyLoader, progressiveLoader };
}

// CSS for lazy loading effects
const lazyLoadingStyles = `
/* Image lazy loading styles */
.lazy-image {
    opacity: 0;
    transition: opacity 0.5s ease-in-out;
    background: linear-gradient(135deg, #1a1a1a, #2a2a2a);
}

.lazy-image.loading {
    opacity: 0.3;
    background: linear-gradient(135deg, #1a1a1a, #2a2a2a);
    position: relative;
}

.lazy-image.loading::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 20px;
    height: 20px;
    margin: -10px 0 0 -10px;
    border: 2px solid rgba(212, 175, 55, 0.3);
    border-radius: 50%;
    border-top-color: var(--color-primary);
    animation: spin 1s linear infinite;
}

.lazy-image.loaded {
    opacity: 1;
}

.lazy-image.error {
    opacity: 1;
    background: #1a1a1a;
}

/* Progressive image loading */
.low-quality {
    filter: blur(2px);
    transition: filter 0.5s ease-in-out;
}

.high-quality {
    filter: blur(0);
}

/* Skeleton loaders */
.skeleton-loader {
    background: var(--color-card);
    border-radius: 10px;
    padding: 20px;
    margin-bottom: 20px;
    animation: skeletonPulse 1.5s ease-in-out infinite;
}

.skeleton-image {
    width: 100%;
    height: 200px;
    background: linear-gradient(90deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.1) 100%);
    border-radius: 8px;
    margin-bottom: 15px;
    animation: shimmer 2s ease-in-out infinite;
}

.skeleton-image.large {
    height: 250px;
}

.skeleton-image.medium {
    height: 180px;
}

.skeleton-title {
    width: 70%;
    height: 20px;
    background: linear-gradient(90deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.1) 100%);
    border-radius: 4px;
    margin-bottom: 10px;
    animation: shimmer 2s ease-in-out infinite;
}

.skeleton-text {
    width: 100%;
    height: 14px;
    background: linear-gradient(90deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.1) 100%);
    border-radius: 4px;
    margin-bottom: 8px;
    animation: shimmer 2s ease-in-out infinite;
}

.skeleton-text.short {
    width: 60%;
}

.skeleton-button {
    width: 120px;
    height: 40px;
    background: linear-gradient(90deg, rgba(212,175,55,0.2) 0%, rgba(212,175,55,0.4) 50%, rgba(212,175,55,0.2) 100%);
    border-radius: 20px;
    margin-top: 15px;
    animation: shimmer 2s ease-in-out infinite;
}

@keyframes skeletonPulse {
    0% {
        opacity: 0.6;
    }
    50% {
        opacity: 0.8;
    }
    100% {
        opacity: 0.6;
    }
}

@keyframes shimmer {
    0% {
        background-position: -200% 0;
    }
    100% {
        background-position: 200% 0;
    }
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}

/* Content loading states */
.content-loaded {
    animation: fadeInUp 0.6s ease-out;
}

@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

/* Responsive lazy loading */
@media (max-width: 768px) {
    .skeleton-image {
        height: 150px;
    }
    
    .skeleton-image.large {
        height: 180px;
    }
    
    .skeleton-image.medium {
        height: 140px;
    }
}
`;

// Inject lazy loading styles
const lazyStyleSheet = document.createElement('style');
lazyStyleSheet.textContent = lazyLoadingStyles;
document.head.appendChild(lazyStyleSheet);

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeLazyLoading);
} else {
    initializeLazyLoading();
}

// Export for manual initialization
window.initializeLazyLoading = initializeLazyLoading;
