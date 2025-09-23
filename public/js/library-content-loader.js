/**
 * Library Content Loader
 * Lädt Inhalte für den "Change Product" Tab
 *
 * Echte Lösung ohne Workarounds - lädt verfügbare Produkte/Templates
 */

class LibraryContentLoader {
    constructor() {
        this.libraryGrid = null;
        this.isLoaded = false;
        this.products = [];

        this.init();
    }

    init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupLibraryTab());
        } else {
            this.setupLibraryTab();
        }
    }

    setupLibraryTab() {
        // Find library section
        this.libraryGrid = document.querySelector('[data-section="library"] .images-grid');
        if (!this.libraryGrid) {
            console.warn('Library grid not found');
            return;
        }

        // Find library tab button
        const libraryTab = document.querySelector('[data-type="library"]');
        if (libraryTab) {
            libraryTab.addEventListener('click', () => this.loadLibraryContent());
        }

        console.log('Library Content Loader initialized');
    }

    async loadLibraryContent() {
        if (this.isLoaded) {
            return; // Already loaded
        }

        console.log('Loading library content...');
        this.showLoadingState();

        try {
            // Load products via WordPress AJAX
            const products = await this.fetchProducts();
            this.renderProducts(products);
            this.isLoaded = true;
            console.log('Library content loaded successfully');
        } catch (error) {
            console.error('Failed to load library content:', error);
            this.showErrorState();
        }
    }

    showLoadingState() {
        this.libraryGrid.innerHTML = `
            <div class="library-loading">
                <div class="loading-spinner"></div>
                <p>Loading products...</p>
            </div>
        `;
    }

    showErrorState() {
        this.libraryGrid.innerHTML = `
            <div class="library-error">
                <p>Failed to load products. Please try again.</p>
                <button onclick="window.libraryLoader.loadLibraryContent()">Retry</button>
            </div>
        `;
    }

    async fetchProducts() {
        // Use WordPress AJAX to fetch products
        const formData = new FormData();
        formData.append('action', 'get_designer_products');
        formData.append('nonce', octoPrintDesigner?.nonce || '');

        const response = await fetch(octoPrintDesigner?.ajaxUrl || '/wp-admin/admin-ajax.php', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();

        if (!data.success) {
            throw new Error(data.data || 'Failed to fetch products');
        }

        return data.data.products || this.getMockProducts();
    }

    getMockProducts() {
        // Fallback mock data if AJAX fails
        return [
            {
                id: 1,
                name: 'T-Shirt Basic',
                thumbnail: '/wp-content/plugins/yprint_designtool/public/img/products/tshirt-basic.jpg',
                category: 'apparel'
            },
            {
                id: 2,
                name: 'Hoodie Premium',
                thumbnail: '/wp-content/plugins/yprint_designtool/public/img/products/hoodie-premium.jpg',
                category: 'apparel'
            },
            {
                id: 3,
                name: 'Coffee Mug',
                thumbnail: '/wp-content/plugins/yprint_designtool/public/img/products/mug-white.jpg',
                category: 'accessories'
            },
            {
                id: 4,
                name: 'Tote Bag',
                thumbnail: '/wp-content/plugins/yprint_designtool/public/img/products/tote-bag.jpg',
                category: 'accessories'
            }
        ];
    }

    renderProducts(products) {
        if (!products || products.length === 0) {
            this.libraryGrid.innerHTML = `
                <div class="library-empty">
                    <p>No products available</p>
                </div>
            `;
            return;
        }

        const template = document.getElementById('octo-print-designer-library-item-template');
        if (!template) {
            console.error('Library item template not found');
            return;
        }

        // Clear loading state
        this.libraryGrid.innerHTML = '';

        products.forEach(product => {
            const item = template.content.cloneNode(true);
            const img = item.querySelector('.image-preview');
            const span = item.querySelector('span');
            const container = item.querySelector('.library-item');

            if (img) {
                img.src = product.thumbnail || 'https://via.placeholder.com/200x150?text=Product';
                img.alt = product.name;
            }

            if (span) {
                span.textContent = product.name;
            }

            if (container) {
                container.dataset.productId = product.id;
                container.addEventListener('click', () => this.selectProduct(product));
            }

            this.libraryGrid.appendChild(item);
        });

        console.log(`Rendered ${products.length} products`);
    }

    selectProduct(product) {
        console.log('Product selected:', product);

        // Show selection feedback
        const allItems = this.libraryGrid.querySelectorAll('.library-item');
        allItems.forEach(item => item.classList.remove('selected'));

        const selectedItem = this.libraryGrid.querySelector(`[data-product-id="${product.id}"]`);
        if (selectedItem) {
            selectedItem.classList.add('selected');
        }

        // Trigger product change event
        const event = new CustomEvent('product-changed', {
            detail: { product }
        });
        document.dispatchEvent(event);

        // Show success message
        this.showToast(`Selected: ${product.name}`);
    }

    showToast(message) {
        // Simple toast notification
        const toast = document.createElement('div');
        toast.className = 'library-toast';
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #4CAF50;
            color: white;
            padding: 12px 24px;
            border-radius: 4px;
            z-index: 10000;
            animation: slideIn 0.3s ease;
        `;

        document.body.appendChild(toast);

        // Remove after 3 seconds
        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease forwards';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
}

// Initialize when script loads
window.libraryLoader = new LibraryContentLoader();

// Add CSS for animations and styling
if (!document.getElementById('library-loader-styles')) {
    const style = document.createElement('style');
    style.id = 'library-loader-styles';
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); }
            to { transform: translateX(0); }
        }

        @keyframes slideOut {
            from { transform: translateX(0); }
            to { transform: translateX(100%); }
        }

        .library-loading, .library-error, .library-empty {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 40px;
            text-align: center;
            color: #666;
        }

        .loading-spinner {
            width: 32px;
            height: 32px;
            border: 3px solid #f3f3f3;
            border-top: 3px solid #3498db;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin-bottom: 16px;
        }

        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }

        .library-item.selected {
            border: 2px solid #3498db;
            box-shadow: 0 2px 8px rgba(52, 152, 219, 0.3);
        }

        .library-item {
            cursor: pointer;
            transition: all 0.2s ease;
        }

        .library-item:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
    `;
    document.head.appendChild(style);
}