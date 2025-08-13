// Products.js - Product filtering and search functionality
document.addEventListener('DOMContentLoaded', function() {
    // Product data structure for extensibility
    const productCategories = {
        'all': 'Allar vörur',
        'myndlistavörur': 'Myndlistavörur',
        'föndurvörur': 'Föndurvörur',
        'penslar': 'Penslar',
        'málning': 'Málning'
    };

    // Sample product data (this would typically come from a database/API)
    const sampleProducts = [
        {
            id: 1,
            name: 'Acrýlmálning sett',
            description: '24 litir í háum gæðum',
            price: 7900,
            category: 'myndlistavörur',
            image: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=300&fit=crop',
            brand: 'Winsor & Newton'
        },
        {
            id: 2,
            name: 'Winsor & Newton pensla sett',
            description: '12 stk. í mismunandi stærðum',
            price: 12500,
            category: 'penslar',
            image: 'https://images.unsplash.com/photo-1596215143922-d3e8c35717db?w=400&h=300&fit=crop',
            brand: 'Winsor & Newton'
        },
        {
            id: 3,
            name: 'Krítapappír A4',
            description: '250g/m² - 25 blöð',
            price: 2450,
            category: 'föndurvörur',
            image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop',
            brand: 'Stenboden'
        }
        // More products would be added here or loaded from API
    ];

    // DOM elements
    const categoryButtons = document.querySelectorAll('.category-btn');
    const searchInput = document.getElementById('product-search');
    const productsGrid = document.getElementById('products-grid');
    const loadMoreBtn = document.getElementById('load-more-btn');
    const noResultsDiv = document.getElementById('no-results');
    const loadingSpinner = document.getElementById('loading-spinner');

    // State management
    // Default to the first main category we show (no "all" button in UI)
    let currentCategory = 'myndlistavörur';
    let currentSearchTerm = '';
    let productsPerPage = 8;
    let currentPage = 1;
    let allProducts = [];

    // Initialize products functionality
    function initProducts() {
        // Get all existing products from the page
        getAllProductsFromDOM();
        
        // Set up event listeners
        setupEventListeners();
        
        // Ensure active state matches default category on load
        try {
            categoryButtons.forEach(btn => btn.classList.remove('active'));
            const defaultBtn = document.querySelector(`.category-btn[data-category="${currentCategory}"]`);
            defaultBtn?.classList.add('active');
        } catch (e) { /* noop */ }

        // Initial filter
        filterProducts();
    }

    // Extract products from existing DOM
    function getAllProductsFromDOM() {
        const productElements = document.querySelectorAll('.product-item');
        allProducts = Array.from(productElements).map((element, index) => {
            const category = element.dataset.category || 'all';
            const name = element.querySelector('h3')?.textContent || `Vara ${index + 1}`;
            const description = element.querySelector('p')?.textContent || '';
            const price = 0; // compact tiles don't carry price
            const image = element.querySelector('img')?.src || '';
            
            return {
                id: index + 1,
                name,
                description,
                price,
                category,
                image,
                element,
                brand: 'Litir og Föndur'
            };
        });
    }

    // Set up event listeners
    function setupEventListeners() {
        // Category buttons
        categoryButtons.forEach(button => {
            button.addEventListener('click', handleCategoryChange);
        });

        // Search input
        if (searchInput) {
            searchInput.addEventListener('input', debounce(handleSearch, 300));
        }

        // Load more button
        if (loadMoreBtn) {
            loadMoreBtn.addEventListener('click', loadMoreProducts);
        }
    }

    // Handle category change
    function handleCategoryChange(e) {
        const category = e.target.dataset.category;
        
        // Update active state
        categoryButtons.forEach(btn => btn.classList.remove('active'));
        e.target.classList.add('active');
        
        // Update current category and reset page
        currentCategory = category;
        currentPage = 1;
        
        // Filter products with animation
        filterProducts(true);
    }

    // Handle search
    function handleSearch(e) {
        currentSearchTerm = e.target.value.toLowerCase().trim();
        currentPage = 1;
        filterProducts(true);
    }

    // Filter products based on category and search
    function filterProducts(animate = false) {
        if (animate) {
            showLoadingState();
        }

        setTimeout(() => {
            const filteredProducts = allProducts.filter(product => {
                const matchesCategory = currentCategory === 'all' || product.category === currentCategory;
                const matchesSearch = currentSearchTerm === '' || 
                    product.name.toLowerCase().includes(currentSearchTerm) ||
                    product.description.toLowerCase().includes(currentSearchTerm) ||
                    product.brand.toLowerCase().includes(currentSearchTerm);
                
                return matchesCategory && matchesSearch;
            });

            displayProducts(filteredProducts, animate);
            updateLoadMoreButton(filteredProducts);
            hideLoadingState();
        }, animate ? 500 : 0);
    }

    // Display products with animation
    function displayProducts(products, animate = false) {
        // In compact catalog view we show everything in the selected category at once
        const productsToShow = products;

        if (animate) {
            // Fade out current products
            allProducts.forEach(product => {
                if (product.element) {
                    product.element.classList.add('fade-out');
                    setTimeout(() => {
                        product.element.style.display = 'none';
                    }, 300);
                }
            });

            // Show filtered products after animation
            setTimeout(() => {
                showFilteredProducts(productsToShow);
            }, 300);
        } else {
            showFilteredProducts(productsToShow);
        }

        // Show/hide no results message
        toggleNoResultsMessage(products.length === 0);
    }

    // Show filtered products
    function showFilteredProducts(productsToShow) {
        // Hide all products first
        allProducts.forEach(product => {
            if (product.element) {
                product.element.style.display = 'none';
                product.element.classList.remove('fade-out', 'fade-in');
            }
        });

        // Show filtered products
        productsToShow.forEach((product, index) => {
            if (product.element) {
                product.element.style.display = 'block';
                product.element.classList.add('fade-in');
                
                // Stagger animation
                setTimeout(() => {
                    product.element.classList.add('revealed');
                }, index * 100);
            }
        });
    }

    // Update load more button
    function updateLoadMoreButton(filteredProducts) {
        if (!loadMoreBtn) return;
        loadMoreBtn.style.display = 'none';
    }

    // Load more products
    function loadMoreProducts() {
        currentPage++;
        filterProducts();
    }

    // Show/hide no results message
    function toggleNoResultsMessage(show) {
        if (noResultsDiv) {
            noResultsDiv.classList.toggle('hidden', !show);
        }
    }

    // Show loading state
    function showLoadingState() {
        if (loadingSpinner) {
            loadingSpinner.classList.remove('hidden');
        }
        if (productsGrid) {
            productsGrid.style.opacity = '0.5';
        }
    }

    // Hide loading state
    function hideLoadingState() {
        if (loadingSpinner) {
            loadingSpinner.classList.add('hidden');
        }
        if (productsGrid) {
            productsGrid.style.opacity = '1';
        }
    }

    // Debounce function for search
    function debounce(func, delay) {
        let timeoutId;
        return function (...args) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func.apply(this, args), delay);
        };
    }

    // Shopping cart functionality (placeholder)
    function addToCart(productId) {
        // This would integrate with your e-commerce system
        console.log(`Adding product ${productId} to cart`);
        
        // Show feedback to user
        showCartFeedback();
    }

    // Show cart feedback
    function showCartFeedback() {
        // Create temporary feedback element
        const feedback = document.createElement('div');
        feedback.className = 'fixed top-24 right-6 bg-green-500 text-white px-6 py-3 rounded-xl shadow-lg z-50 transform translate-x-full transition-transform duration-300';
        feedback.innerHTML = '<i class="fas fa-check mr-2"></i>Bætt í körfu!';
        
        document.body.appendChild(feedback);
        
        // Animate in
        setTimeout(() => {
            feedback.classList.remove('translate-x-full');
        }, 100);
        
        // Animate out and remove
        setTimeout(() => {
            feedback.classList.add('translate-x-full');
            setTimeout(() => {
                document.body.removeChild(feedback);
            }, 300);
        }, 2000);
    }

    // Add to cart event listeners
    function setupCartButtons() {
        document.addEventListener('click', function(e) {
            if (e.target.closest('.btn-primary')) {
                e.preventDefault();
                const productCard = e.target.closest('.product-item');
                if (productCard) {
                    const productId = Array.from(productsGrid.children).indexOf(productCard) + 1;
                    addToCart(productId);
                }
            }
        });
    }

    // API functions for future integration
    const ProductAPI = {
        // Fetch products from server
        async fetchProducts(page = 1, category = 'all', search = '') {
            try {
                const params = new URLSearchParams({
                    page,
                    category,
                    search,
                    limit: productsPerPage
                });
                
                const response = await fetch(`/api/products?${params}`);
                const data = await response.json();
                
                return {
                    products: data.products,
                    total: data.total,
                    hasMore: data.hasMore
                };
            } catch (error) {
                console.error('Error fetching products:', error);
                return { products: [], total: 0, hasMore: false };
            }
        },

        // Add product to cart
        async addToCart(productId, quantity = 1) {
            try {
                const response = await fetch('/api/cart/add', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ productId, quantity })
                });
                
                return await response.json();
            } catch (error) {
                console.error('Error adding to cart:', error);
                return { success: false, error: 'Failed to add to cart' };
            }
        }
    };

    // Performance optimization for large catalogs
    const PerformanceOptimizer = {
        // Virtual scrolling for hundreds of products
        setupVirtualScrolling() {
            // Implementation would go here for very large catalogs
            console.log('Virtual scrolling can be implemented for catalogs with 1000+ products');
        },

        // Image lazy loading
        setupLazyLoading() {
            const images = document.querySelectorAll('img[data-src]');
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src;
                        img.classList.remove('lazy');
                        observer.unobserve(img);
                    }
                });
            });

            images.forEach(img => imageObserver.observe(img));
        }
    };

    // Brand logo floating animation
    function initBrandAnimations() {
        const brandContainers = document.querySelectorAll('.brand-logo-container');
        
        // Set up intersection observer for brand logos
        const brandObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Add floating animation with delay based on position
                    setTimeout(() => {
                        entry.target.classList.add('floating');
                    }, Array.from(brandContainers).indexOf(entry.target) * 200);
                }
            });
        }, { threshold: 0.5 });
        
        brandContainers.forEach(container => {
            brandObserver.observe(container);
        });
        
        // Add hover pause effect
        brandContainers.forEach(container => {
            container.addEventListener('mouseenter', () => {
                container.style.animationPlayState = 'paused';
            });
            
            container.addEventListener('mouseleave', () => {
                container.style.animationPlayState = 'running';
            });
        });
    }

    // Logo error handling enhancement
    function enhanceLogoErrorHandling() {
        const logoImages = document.querySelectorAll('.brand-logo img');
        
        logoImages.forEach(img => {
            img.addEventListener('error', function() {
                console.log(`Failed to load logo: ${this.alt}`);
                // The fallback is already handled in HTML with onerror attribute
            });
            
            img.addEventListener('load', function() {
                // Add a subtle fade-in effect when logo loads
                this.style.opacity = '0';
                setTimeout(() => {
                    this.style.transition = 'opacity 0.5s ease';
                    this.style.opacity = '1';
                }, 100);
            });
        });
    }

    // Initialize everything
    initProducts();
    setupCartButtons();
    PerformanceOptimizer.setupLazyLoading();
    initBrandAnimations();
    enhanceLogoErrorHandling();

    // Export for potential external use
    window.ProductsManager = {
        filterProducts,
        addToCart,
        ProductAPI,
        PerformanceOptimizer,
        initBrandAnimations
    };
});
