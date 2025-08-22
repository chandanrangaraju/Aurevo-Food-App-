// Initialize AOS (Animate On Scroll)
document.addEventListener('DOMContentLoaded', function() {
    AOS.init({
        duration: 1000,
        easing: 'ease-in-out',
        once: true,
        offset: 100
    });

    // Initialize the application
    initializeApp();
});

// Main application initialization
function initializeApp() {
    setupNavigation();
    loadMenuData();
    setupSearch();
    setupScrollEffects();
    setupMenuFilters();
}

// Navigation setup
function setupNavigation() {
    // Smooth scroll for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const navHeight = document.querySelector('.luxury-navbar').offsetHeight;
                const targetPosition = target.offsetTop - navHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Navbar background on scroll
    window.addEventListener('scroll', function() {
        const navbar = document.querySelector('.luxury-navbar');
        if (window.scrollY > 100) {
            navbar.style.background = 'rgba(13, 13, 13, 0.98)';
        } else {
            navbar.style.background = 'rgba(13, 13, 13, 0.95)';
        }
    });
}

// Load menu data and populate sections
function loadMenuData() {
    try {
        const menuData = window.menuData;
        if (menuData) {
            populateFeaturedItems(menuData.items);
            populateMenuCategories(menuData.categories);
            populateMenuItems(menuData.items);
        }
    } catch (error) {
        console.error('Error loading menu data:', error);
        showErrorMessage('Failed to load menu data');
    }
}

// Populate featured items section
function populateFeaturedItems(items) {
    const featuredContainer = document.getElementById('featuredItems');
    if (!featuredContainer) return;

    const featuredItems = items.filter(item => item.featured);
    
    featuredContainer.innerHTML = featuredItems.map(item => `
        <div class="col-lg-4 col-md-6" data-aos="fade-up" data-aos-delay="${featuredItems.indexOf(item) * 200}">
            <div class="menu-item-card featured-item">
                <div class="menu-item-image">
                    <img src="${item.image}" alt="${item.name}" class="lazy-image" loading="lazy">
                    <div class="menu-item-badge">Featured</div>
                </div>
                <div class="menu-item-content">
                    <div class="menu-item-header">
                        <div>
                            <h3 class="menu-item-title">${item.name}</h3>
                        </div>
                        <div class="menu-item-price">$${item.price}</div>
                    </div>
                    <p class="menu-item-description">${item.description}</p>
                    <button class="add-to-cart-btn" onclick="addToCart(${item.id})">
                        <i class="fas fa-plus"></i>
                        Add to Cart
                    </button>
                </div>
            </div>
        </div>
    `).join('');

    // Initialize lazy loading for new images
    initializeLazyLoading();
}

// Populate menu categories
function populateMenuCategories(categories) {
    const categoriesContainer = document.getElementById('menuCategories');
    if (!categoriesContainer) return;

    categoriesContainer.innerHTML = categories.map(category => `
        <div class="col-lg-6 col-md-6" data-aos="fade-up" data-aos-delay="${categories.indexOf(category) * 200}">
            <div class="category-card" onclick="filterMenuItems('${category.id}')">
                <div class="category-image">
                    <img src="${category.image}" alt="${category.name}" class="lazy-image" loading="lazy">
                    <div class="category-overlay">
                        <div class="overlay-content">
                            <i class="fas fa-utensils"></i>
                        </div>
                    </div>
                </div>
                <div class="category-content">
                    <h3 class="category-title">${category.name}</h3>
                    <p class="category-description">${category.description}</p>
                </div>
            </div>
        </div>
    `).join('');

    // Initialize lazy loading for new images
    initializeLazyLoading();
}

// Populate menu items
function populateMenuItems(items) {
    const itemsContainer = document.getElementById('menuItems');
    if (!itemsContainer) return;

    itemsContainer.innerHTML = items.map(item => `
        <div class="col-lg-4 col-md-6 menu-item" data-category="${item.category}" data-aos="fade-up">
            <div class="menu-item-card">
                <div class="menu-item-image">
                    <img src="${item.image}" alt="${item.name}" class="lazy-image" loading="lazy">
                    ${item.featured ? '<div class="menu-item-badge">Featured</div>' : ''}
                </div>
                <div class="menu-item-content">
                    <div class="menu-item-header">
                        <div>
                            <h3 class="menu-item-title">${item.name}</h3>
                        </div>
                        <div class="menu-item-price">₹${item.price}</div>
                    </div>
                    <p class="menu-item-description">${item.description}</p>
                    <button class="add-to-cart-btn" onclick="addToCart(${item.id})">
                        <i class="fas fa-plus"></i>
                        Add to Cart
                    </button>
                </div>
            </div>
        </div>
    `).join('');

    // Initialize lazy loading for new images
    initializeLazyLoading();
}

// Setup menu filters
function setupMenuFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            const category = this.getAttribute('data-category');
            
            // Update active button
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Filter items
            filterMenuItems(category);
        });
    });
}

// Filter menu items by category
function filterMenuItems(category) {
    const menuItems = document.querySelectorAll('.menu-item');
    
    menuItems.forEach(item => {
        const itemCategory = item.getAttribute('data-category');
        
        if (category === 'all' || itemCategory === category) {
            item.style.display = 'block';
            // Re-trigger AOS animation
            item.setAttribute('data-aos', 'fade-up');
        } else {
            item.style.display = 'none';
        }
    });
    
    // Refresh AOS
    AOS.refresh();
    
    // Update filter buttons if called from category card
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => {
        if (btn.getAttribute('data-category') === category) {
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        }
    });
    
    // Scroll to menu items section
    const menuItemsSection = document.querySelector('.menu-items-section');
    if (menuItemsSection) {
        const navHeight = document.querySelector('.luxury-navbar').offsetHeight;
        const targetPosition = menuItemsSection.offsetTop - navHeight;
        
        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });
    }
}

// Search functionality
function setupSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchResults = document.getElementById('searchResults');
    let searchTimeout;

    if (!searchInput) return;

    searchInput.addEventListener('input', function() {
        clearTimeout(searchTimeout);
        const query = this.value.trim();
        
        if (query.length < 2) {
            hideSearchResults();
            return;
        }
        
        searchTimeout = setTimeout(() => {
            performSearch(query);
        }, 300);
    });

    // Hide search results when clicking outside
    document.addEventListener('click', function(e) {
        if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
            hideSearchResults();
        }
    });
}

// Perform search
async function performSearch(query) {
    try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const results = await response.json();
        displaySearchResults(results);
    } catch (error) {
        console.error('Search error:', error);
        hideSearchResults();
    }
}

// Display search results
function displaySearchResults(results) {
    const searchResults = document.getElementById('searchResults');
    const searchContainer = document.querySelector('.search-container');
    
    if (!searchResults || !searchContainer) return;

    if (results.length === 0) {
        searchResults.innerHTML = '<div class="search-result-item">No items found</div>';
    } else {
        searchResults.innerHTML = results.map(item => `
            <div class="search-result-item" onclick="selectSearchResult(${item.id})">
                <div class="search-result-image">
                    <img src="${item.image}" alt="${item.name}" loading="lazy">
                </div>
                <div class="search-result-details">
                    <h4>${item.name}</h4>
                    <p>$${item.price}</p>
                </div>
            </div>
        `).join('');
    }
    
    // Position search results
    const inputRect = searchContainer.getBoundingClientRect();
    searchResults.style.position = 'fixed';
    searchResults.style.top = `${inputRect.bottom + 5}px`;
    searchResults.style.left = `${inputRect.left}px`;
    searchResults.style.width = `${inputRect.width}px`;
    searchResults.style.display = 'block';
}

// Hide search results
function hideSearchResults() {
    const searchResults = document.getElementById('searchResults');
    if (searchResults) {
        searchResults.style.display = 'none';
    }
}

// Select search result
function selectSearchResult(itemId) {
    const menuData = window.menuData;
    const item = menuData.items.find(i => i.id === itemId);
    
    if (item) {
        // Filter by category and scroll to item
        filterMenuItems(item.category);
        
        // Highlight the item briefly
        setTimeout(() => {
            const menuItem = document.querySelector(`[data-category="${item.category}"]`);
            if (menuItem) {
                menuItem.scrollIntoView({ behavior: 'smooth', block: 'center' });
                menuItem.style.animation = 'pulse 2s ease-in-out';
                setTimeout(() => {
                    menuItem.style.animation = '';
                }, 2000);
            }
        }, 500);
    }
    
    hideSearchResults();
    document.getElementById('searchInput').value = '';
}

// Scroll effects
function setupScrollEffects() {
    // Parallax effect for hero section
    window.addEventListener('scroll', function() {
        const scrolled = window.pageYOffset;
        const heroSection = document.querySelector('.hero-section');
        
        if (heroSection) {
            const speed = scrolled * 0.5;
            heroSection.style.transform = `translateY(${speed}px)`;
        }
    });

    // Add scroll-based animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);

    // Observe elements for animation
    document.querySelectorAll('.menu-item-card, .category-card, .contact-card').forEach(el => {
        observer.observe(el);
    });
}

// Add to cart function (called from HTML)
window.addToCart = function(itemId) {
    const menuData = window.menuData;
    const item = menuData.items.find(i => i.id === itemId);
    
    if (item) {
        cart.addItem(item);
        showNotification(`${item.name} added to cart!`, 'success');
    }
};

// Show notification
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-info-circle'}"></i>
            <span>${message}</span>
        </div>
    `;
    
    // Add styles
    Object.assign(notification.style, {
        position: 'fixed',
        top: '100px',
        right: '20px',
        background: type === 'success' ? 'var(--color-primary)' : 'var(--color-card)',
        color: type === 'success' ? 'var(--color-secondary)' : 'var(--color-text-light)',
        padding: '15px 20px',
        borderRadius: '10px',
        boxShadow: 'var(--shadow-strong)',
        zIndex: '1001',
        transform: 'translateX(100%)',
        transition: 'var(--transition-smooth)',
        border: `1px solid ${type === 'success' ? 'var(--color-primary-dark)' : 'rgba(212, 175, 55, 0.2)'}`
    });
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Auto remove
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Error message display
function showErrorMessage(message) {
    console.error(message);
    showNotification(message, 'error');
}

// Loading state management
function showLoading(element) {
    if (element) {
        element.innerHTML = '<div class="loading-spinner"></div>';
    }
}

function hideLoading(element, content) {
    if (element) {
        element.innerHTML = content || '';
    }
}

// Utility function to format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR'
    }).format(amount);
}

// Debounce utility
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

// Add CSS for notifications
const notificationStyles = `
.notification-content {
    display: flex;
    align-items: center;
    gap: 10px;
}

.notification-content i {
    font-size: 1.2rem;
}

@keyframes slideInRight {
    from {
        transform: translateX(100%);
    }
    to {
        transform: translateX(0);
    }
}

.animate-in {
    animation: fadeInUp 0.6s ease-out forwards;
}
`;

// Inject notification styles
const styleSheet = document.createElement('style');
styleSheet.textContent = notificationStyles;
document.head.appendChild(styleSheet);
