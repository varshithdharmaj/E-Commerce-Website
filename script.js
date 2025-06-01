document.addEventListener('DOMContentLoaded', () => {
    // Mock product data - in a real app, this would come from an API/backend
    const products = [
        { id: 1, name: "Cosmic Hoodie", price: 49.99, image: "https://via.placeholder.com/280x200/5C6BC0/FFFFFF?text=Cosmic+Hoodie", description: "Stay warm and stylish with our cosmic hoodie, featuring nebula patterns. Made from 100% organic cotton." },
        { id: 2, name: "Nebula T-Shirt", price: 29.99, image: "https://via.placeholder.com/280x200/9575CD/FFFFFF?text=Nebula+T-Shirt", description: "Lightweight and breathable, perfect for everyday celestial adventures. Available in multiple sizes." },
        { id: 3, name: "Galaxy Sneakers", price: 79.99, image: "https://via.placeholder.com/280x200/7986CB/FFFFFF?text=Galaxy+Sneakers", description: "Walk on stars with these comfortable and eye-catching galaxy-themed sneakers. Durable rubber sole." },
        { id: 4, name: "Astral Backpack", price: 65.00, image: "https://via.placeholder.com/280x200/64B5F6/FFFFFF?text=Astral+Backpack", description: "Carry your essentials in our durable astral backpack, designed for exploration. Multiple compartments." },
        { id: 5, name: "Rocket Mug", price: 15.50, image: "https://via.placeholder.com/280x200/4FC3F7/FFFFFF?text=Rocket+Mug", description: "Start your day with a blast! Ceramic mug featuring a vintage rocket design. Dishwasher safe." },
        { id: 6, name: "Moon Phase Watch", price: 120.00, image: "https://via.placeholder.com/280x200/29B6F6/FFFFFF?text=Moon+Watch", description: "Track lunar cycles with this elegant, minimalist moon phase wristwatch. Water-resistant." }
    ];

    let cart = [];

    const productListDiv = document.getElementById('product-list');
    const cartCountSpan = document.getElementById('cart-count');
    const cartItemsList = document.getElementById('cart-items');
    const cartTotalSpan = document.getElementById('cart-total');
    const cartIcon = document.getElementById('cart-icon');
    const cartModal = document.getElementById('cart-modal');
    const closeButton = document.querySelector('.modal .close-button');
    const checkoutButton = document.getElementById('checkout-button');
    const clearCartButton = document.getElementById('clear-cart-button');

    // --- Utility Functions ---

    // Load cart from local storage
    function loadCartFromLocalStorage() {
        const storedCart = localStorage.getItem('stellarCart');
        if (storedCart) {
            cart = JSON.parse(storedCart);
        }
    }

    // Save cart to local storage
    function saveCartToLocalStorage() {
        localStorage.setItem('stellarCart', JSON.stringify(cart));
    }

    // --- Product Rendering ---

    function renderProducts() {
        productListDiv.innerHTML = '';
        products.forEach(product => {
            const productCard = document.createElement('div');
            productCard.classList.add('product-card');
            productCard.dataset.id = product.id; // For easy identification

            productCard.innerHTML = `
                <div class="product-inner">
                    <div class="product-front">
                        <img src="${product.image}" alt="${product.name}">
                        <h3>${product.name}</h3>
                        <p class="price">$${product.price.toFixed(2)}</p>
                        <button class="add-to-cart btn btn-primary" data-id="${product.id}">Add to Cart</button>
                    </div>
                    <div class="product-back">
                        <p>${product.description}</p>
                        <button class="back-button">Back to Info</button>
                    </div>
                </div>
            `;
            productListDiv.appendChild(productCard);
        });

        // Add event listeners for "Add to Cart" and 3D flip
        document.querySelectorAll('.add-to-cart').forEach(button => {
            button.addEventListener('click', (event) => {
                event.stopPropagation(); // Prevent card flip when clicking button
                const productId = parseInt(event.target.dataset.id);
                addToCart(productId);
            });
        });

        document.querySelectorAll('.product-card').forEach(card => {
            card.addEventListener('click', () => {
                card.classList.toggle('flipped');
            });
            // Handle the back button inside the flipped card
            card.querySelector('.back-button').addEventListener('click', (event) => {
                event.stopPropagation(); // Prevent card flip when clicking back button
                card.classList.remove('flipped');
            });
        });
    }

    // --- Cart Logic ---

    function addToCart(productId) {
        const productToAdd = products.find(p => p.id === productId);
        if (productToAdd) {
            const existingCartItem = cart.find(item => item.id === productId);
            if (existingCartItem) {
                existingCartItem.quantity++;
            } else {
                cart.push({ ...productToAdd, quantity: 1 });
            }
            saveCartToLocalStorage();
            updateCartDisplay();
            showTemporaryMessage(`${productToAdd.name} added to cart!`, 'success');
        }
    }

    function updateCartItemQuantity(productId, change) {
        const itemIndex = cart.findIndex(item => item.id === productId);
        if (itemIndex > -1) {
            cart[itemIndex].quantity += change;
            if (cart[itemIndex].quantity <= 0) {
                cart.splice(itemIndex, 1); // Remove if quantity is 0 or less
            }
            saveCartToLocalStorage();
            updateCartDisplay();
        }
    }

    function updateCartDisplay() {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCountSpan.textContent = totalItems;
        cartItemsList.innerHTML = '';
        let total = 0;

        if (cart.length === 0) {
            cartItemsList.innerHTML = '<p style="text-align: center; color: #888;">Your cart is empty.</p>';
        } else {
            cart.forEach(item => {
                const listItem = document.createElement('li');
                listItem.innerHTML = `
                    <div class="cart-item-info">
                        <span>${item.name}</span>
                        <span>Unit Price: $${item.price.toFixed(2)}</span>
                    </div>
                    <div class="cart-item-controls">
                        <button data-id="${item.id}" data-action="decrease">-</button>
                        <span class="cart-item-quantity">${item.quantity}</span>
                        <button data-id="${item.id}" data-action="increase">+</button>
                    </div>
                    <span class="cart-item-price">$${(item.price * item.quantity).toFixed(2)}</span>
                `;
                cartItemsList.appendChild(listItem);
                total += item.price * item.quantity;
            });
        }
        cartTotalSpan.textContent = total.toFixed(2);

        // Add event listeners for quantity buttons
        cartItemsList.querySelectorAll('button').forEach(button => {
            button.addEventListener('click', (event) => {
                const productId = parseInt(event.target.dataset.id);
                const action = event.target.dataset.action;
                if (action === 'increase') {
                    updateCartItemQuantity(productId, 1);
                } else if (action === 'decrease') {
                    updateCartItemQuantity(productId, -1);
                }
            });
        });
    }

    // --- Modal Control ---

    cartIcon.addEventListener('click', () => {
        cartModal.style.display = 'flex'; // Use flex to center with modal.active
        setTimeout(() => {
            cartModal.classList.add('active'); // Trigger 3D transition
        }, 10); // Small delay to allow display property to apply
        updateCartDisplay();
    });

    closeButton.addEventListener('click', () => {
        cartModal.classList.remove('active');
        setTimeout(() => {
            cartModal.style.display = 'none';
        }, 400); // Wait for transition to complete (should match CSS transition duration)
    });

    window.addEventListener('click', (event) => {
        if (event.target === cartModal) {
            cartModal.classList.remove('active');
            setTimeout(() => {
                cartModal.style.display = 'none';
            }, 400); // Wait for transition to complete
        }
    });

    // --- Checkout and Clear Cart ---

    checkoutButton.addEventListener('click', () => {
        if (cart.length > 0) {
            alert(`Order placed successfully! Total: $${cartTotalSpan.textContent}`);
            cart = [];
            saveCartToLocalStorage();
            updateCartDisplay();
            cartModal.classList.remove('active');
            setTimeout(() => {
                cartModal.style.display = 'none';
            }, 400);
        } else {
            alert('Your cart is empty. Add some stellar items first!');
        }
    });

    clearCartButton.addEventListener('click', () => {
        if (confirm('Are you sure you want to clear your cart?')) {
            cart = [];
            saveCartToLocalStorage();
            updateCartDisplay();
            showTemporaryMessage('Cart cleared!', 'info');
        }
    });

    // --- Temporary Message Display (for "added to cart" etc.) ---
    function showTemporaryMessage(message, type = 'default') {
        const msgDiv = document.createElement('div');
        msgDiv.classList.add('temp-message', type);
        msgDiv.textContent = message;
        document.body.appendChild(msgDiv);

        // Make it visible and then fade out
        setTimeout(() => msgDiv.classList.add('show'), 10); // Trigger transition
        setTimeout(() => msgDiv.classList.remove('show'), 2500); // Start fade out
        setTimeout(() => msgDiv.remove(), 3000); // Remove after transition
    }

    // --- Initial Load ---
    loadCartFromLocalStorage();
    renderProducts();
    updateCartDisplay();
});
