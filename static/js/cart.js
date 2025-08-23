// Cart management system
class Cart {
    constructor() {
        this.items = this.loadFromStorage();
        this.init();
    }

    init() {
        this.bindEvents();
        this.updateDisplay();
    }

    bindEvents() {
        // Cart button click
        const cartBtn = document.getElementById('cartBtn');
        const cartSidebar = document.getElementById('cartSidebar');
        const cartOverlay = document.getElementById('cartOverlay');
        const closeCart = document.getElementById('closeCart');

        if (cartBtn) {
            cartBtn.addEventListener('click', () => this.toggleCart());
        }

        if (closeCart) {
            closeCart.addEventListener('click', () => this.closeCart());
        }

        if (cartOverlay) {
            cartOverlay.addEventListener('click', () => this.closeCart());
        }

        // Checkout button
        const checkoutBtn = document.querySelector('.checkout-btn');
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', () => this.checkout());
        }
    }

    addItem(item) {
        const existingItem = this.items.find(i => i.id === item.id);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.items.push({
                ...item,
                quantity: 1
            });
        }
        
        this.saveToStorage();
        this.updateDisplay();
        this.animateCartButton();
    }

    removeItem(itemId) {
        this.items = this.items.filter(item => item.id !== itemId);
        this.saveToStorage();
        this.updateDisplay();
    }

    updateQuantity(itemId, quantity) {
        const item = this.items.find(i => i.id === itemId);
        if (item) {
            if (quantity <= 0) {
                this.removeItem(itemId);
            } else {
                item.quantity = quantity;
                this.saveToStorage();
                this.updateDisplay();
            }
        }
    }

    getTotal() {
        return this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    }

    getTotalItems() {
        return this.items.reduce((total, item) => total + item.quantity, 0);
    }

    clear() {
        this.items = [];
        this.saveToStorage();
        this.updateDisplay();
    }

    toggleCart() {
        const cartSidebar = document.getElementById('cartSidebar');
        const cartOverlay = document.getElementById('cartOverlay');
        
        if (cartSidebar && cartOverlay) {
            const isOpen = cartSidebar.classList.contains('open');
            
            if (isOpen) {
                this.closeCart();
            } else {
                this.openCart();
            }
        }
    }

    openCart() {
        const cartSidebar = document.getElementById('cartSidebar');
        const cartOverlay = document.getElementById('cartOverlay');
        
        if (cartSidebar && cartOverlay) {
            cartSidebar.classList.add('open');
            cartOverlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }

    closeCart() {
        const cartSidebar = document.getElementById('cartSidebar');
        const cartOverlay = document.getElementById('cartOverlay');
        
        if (cartSidebar && cartOverlay) {
            cartSidebar.classList.remove('open');
            cartOverlay.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    updateDisplay() {
        this.updateCartCount();
        this.updateCartContent();
        this.updateCartFooter();
    }

    updateCartCount() {
        const cartCount = document.getElementById('cartCount');
        if (cartCount) {
            const totalItems = this.getTotalItems();
            cartCount.textContent = totalItems;
            cartCount.style.display = totalItems > 0 ? 'flex' : 'none';
        }
    }

    updateCartContent() {
        const cartContent = document.getElementById('cartContent');
        if (!cartContent) return;

        if (this.items.length === 0) {
            cartContent.innerHTML = `
                <div class="empty-cart">
                    <i class="fas fa-shopping-cart"></i>
                    <p>Your cart is empty</p>
                    <p class="empty-cart-sub">Add some delicious items to get started!</p>
                </div>
            `;
        } else {
            cartContent.innerHTML = this.items.map(item => `
                <div class="cart-item" data-item-id="${item.id}">
                    <div class="cart-item-image">
                        <img src="${item.image}" alt="${item.name}" loading="lazy">
                    </div>
                    <div class="cart-item-details">
                        <div class="cart-item-name">${item.name}</div>
                        <div class="cart-item-price">₹${(item.price * item.quantity).toFixed(2)}</div>
                        <div class="cart-item-controls">
                            <button class="quantity-btn" onclick="cart.updateQuantity(${item.id}, ${item.quantity - 1})">
                                <i class="fas fa-minus"></i>
                            </button>
                            <span class="cart-item-quantity">${item.quantity}</span>
                            <button class="quantity-btn" onclick="cart.updateQuantity(${item.id}, ${item.quantity + 1})">
                                <i class="fas fa-plus"></i>
                            </button>
                            <button class="remove-item" onclick="cart.removeItem(${item.id})" title="Remove item">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `).join('');
        }
    }

    updateCartFooter() {
        const cartFooter = document.getElementById('cartFooter');
        const cartTotal = document.getElementById('cartTotal');
        
        if (cartFooter && cartTotal) {
            if (this.items.length > 0) {
                cartFooter.style.display = 'block';
                cartTotal.textContent = this.getTotal().toFixed(2);
            } else {
                cartFooter.style.display = 'none';
            }
        }
    }

    animateCartButton() {
        const cartBtn = document.getElementById('cartBtn');
        if (cartBtn) {
            cartBtn.style.animation = 'pulse 0.5s ease-in-out';
            setTimeout(() => {
                cartBtn.style.animation = '';
            }, 500);
        }
    }

    checkout() {
        if (this.items.length === 0) {
            this.showNotification('Your cart is empty!', 'warning');
            return;
        }

        // Create checkout modal or redirect to checkout page
        this.showCheckoutModal();
    }

    showCheckoutModal() {
        const modal = document.createElement('div');
        modal.className = 'checkout-modal';
        modal.innerHTML = `
            <div class="checkout-modal-overlay">
                <div class="checkout-modal-content">
                    <div class="checkout-header">
                        <h3>Order Summary</h3>
                        <button class="close-modal">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="checkout-body">
                        <div class="checkout-items">
                            ${this.items.map(item => `
                                <div class="checkout-item">
                                    <img src="${item.image}" alt="${item.name}">
                                    <div class="checkout-item-details">
                                        <h4>${item.name}</h4>
                                        <p>Quantity: ${item.quantity}</p>
                                        <p class="checkout-item-price">₹${(item.price * item.quantity).toFixed(2)}</p>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                        <div class="checkout-total">
                            <h3>Total: ₹${this.getTotal().toFixed(2)}</h3>
                        </div>
                        <div class="checkout-note">
                            <p><i class="fas fa-info-circle"></i> Please provide your delivery details and confirm your order to complete checkout.</p>
                        </div>
                    </div>
                    <div class="checkout-footer">
                        <button class="btn btn-outline-luxury close-modal-btn">Continue Shopping</button>
                        <button class="btn btn-luxury place-order-btn">Place Order</button>
                    </div>
                </div>
            </div>
        `;

        // Add styles for checkout modal
        const modalStyles = `
            .checkout-modal {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                z-index: 1002;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 20px;
            }

            .checkout-modal-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.8);
                backdrop-filter: blur(5px);
                display: flex;
                align-items: center;
                justify-content: center;
            }


            .checkout-modal-content {
                background: var(--color-card);
                border-radius: 20px;
                max-width: 500px;
                width: 100%;
                max-height: 80vh;
                overflow-y: auto;
                position: relative;
                z-index: 1;
                border: 1px solid rgba(212, 175, 55, 0.3);
            }

            .checkout-header {
                padding: 25px;
                border-bottom: 1px solid rgba(212, 175, 55, 0.2);
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            .checkout-header h3 {
                color: var(--color-primary);
                margin: 0;
            }

            .close-modal {
                background: none;
                border: none;
                color: var(--color-accent);
                font-size: 1.5rem;
                cursor: pointer;
                transition: var(--transition-smooth);
            }

            .close-modal:hover {
                color: var(--color-primary);
            }

            .checkout-body {
                padding: 25px;
            }

            .checkout-item {
                display: flex;
                gap: 15px;
                margin-bottom: 20px;
                padding: 15px;
                background: rgba(255, 255, 255, 0.05);
                border-radius: 10px;
            }

            .checkout-item img {
                width: 60px;
                height: 60px;
                object-fit: cover;
                border-radius: 8px;
            }

            .checkout-item-details h4 {
                color: var(--color-text-light);
                margin: 0 0 5px 0;
                font-size: 1rem;
            }

            .checkout-item-details p {
                color: rgba(255, 255, 255, 0.8);
                margin: 2px 0;
                font-size: 0.9rem;
            }

            .checkout-item-price {
                color: var(--color-primary) !important;
                font-weight: 600;
            }

            .checkout-total {
                text-align: center;
                margin: 30px 0;
                padding: 20px;
                background: rgba(212, 175, 55, 0.1);
                border-radius: 10px;
                border: 1px solid rgba(212, 175, 55, 0.3);
            }

            .checkout-total h3 {
                color: var(--color-primary);
                margin: 0;
                font-size: 1.5rem;
            }

            .checkout-note {
                background: rgba(255, 255, 255, 0.05);
                padding: 15px;
                border-radius: 10px;
                margin-bottom: 20px;
            }

            .checkout-note p {
                margin: 0;
                color: rgba(255, 255, 255, 0.8);
                font-size: 0.9rem;
                display: flex;
                align-items: center;
                gap: 10px;
            }

            .checkout-note i {
                color: var(--color-primary);
            }

            .checkout-footer {
                padding: 25px;
                border-top: 1px solid rgba(212, 175, 55, 0.2);
                display: flex;
                gap: 15px;
                justify-content: space-between;
            }

            .checkout-footer .btn {
                flex: 1;
                justify-content: center;
            }
        `;

        // Inject modal styles
        const styleSheet = document.createElement('style');
        styleSheet.textContent = modalStyles;
        document.head.appendChild(styleSheet);

        document.body.appendChild(modal);

        // Bind modal events
        const closeButtons = modal.querySelectorAll('.close-modal, .close-modal-btn');
        const placeOrderBtn = modal.querySelector('.place-order-btn');
        const overlay = modal.querySelector('.checkout-modal-overlay');

        closeButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                document.body.removeChild(modal);
                document.head.removeChild(styleSheet);
            });
        });

        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                document.body.removeChild(modal);
                document.head.removeChild(styleSheet);
            }
        });

     placeOrderBtn.onclick = (e) => {
    e.preventDefault();
    window.location.assign("/payment");
};

    }

    placeOrder() {
        // Simulate order placement
        const orderNumber = Math.random().toString(36).substr(2, 9).toUpperCase();
        
        this.showNotification(`Order #${orderNumber} placed successfully! We'll have your exquisite meal ready shortly.`, 'success');
        
        // Clear cart
        this.clear();
        this.closeCart();
        
        // You could also redirect to an order confirmation page
        // window.location.href = `/order-confirmation/${orderNumber}`;
    }

    showNotification(message, type = 'info') {
        // Use the same notification system from main.js
        if (window.showNotification) {
            window.showNotification(message, type);
        } else {
            alert(message); // Fallback
        }
    }

    saveToStorage() {
        try {
            localStorage.setItem('aurevo_cart', JSON.stringify(this.items));
        } catch (error) {
            console.error('Error saving cart to storage:', error);
        }
    }

    loadFromStorage() {
        try {
            const saved = localStorage.getItem('aurevo_cart');
            return saved ? JSON.parse(saved) : [];
        } catch (error) {
            console.error('Error loading cart from storage:', error);
            return [];
        }
    }
}

// Initialize cart
const cart = new Cart();

// Make cart available globally
window.cart = cart;

// Add some additional CSS for better cart styling
const cartStyles = `
.empty-cart-sub {
    font-size: 0.9rem;
    color: rgba(255, 255, 255, 0.6);
    margin-top: 10px;
}

.cart-item {
    animation: slideInRight 0.3s ease-out;
}

@keyframes slideInRight {
    from {
        opacity: 0;
        transform: translateX(20px);
    }
    to {
        opacity: 1;
        transform: translateX(0);
    }
}

.cart-item-controls {
    margin-top: 10px;
}

.quantity-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.cart-total {
    font-size: 1.4rem;
    color: var(--color-primary);
    font-weight: 700;
    text-align: center;
    margin-bottom: 20px;
    padding: 15px;
    background: rgba(212, 175, 55, 0.1);
    border-radius: 10px;
    border: 1px solid rgba(212, 175, 55, 0.3);
}
`;

// Inject cart styles
const cartStyleSheet = document.createElement('style');
cartStyleSheet.textContent = cartStyles;
document.head.appendChild(cartStyleSheet);
