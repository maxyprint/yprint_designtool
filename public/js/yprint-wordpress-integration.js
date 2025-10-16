/**
 * 🔗 YPRINT WORDPRESS INTEGRATION - Core Rebuild
 * Clean WordPress-specific functionality for the YPrint system
 *
 * REPLACES:
 * - All legacy AJAX handlers
 * - WordPress-specific coordinate logging
 * - Legacy data save/load mechanisms
 */

class YPrintWordPressIntegration {
    constructor() {
        this.initialized = false;
        this.config = window.octo_print_designer_config || {};
        this.yprintAPI = null;

        console.log('🔗 YPRINT WORDPRESS: Starting integration...');
        this.initialize();
    }

    async initialize() {
        try {
            // Wait for YPrint unified API
            await this.waitForYPrintAPI();

            // Set up WordPress-specific functionality
            this.initializeAJAXHandlers();
            this.initializeWordPressEvents();
            this.initializeProductIntegration();
            this.initializeCartIntegration();

            // Mark as ready
            this.markReady();

            console.log('✅ YPRINT WORDPRESS: Integration ready');

        } catch (error) {
            console.error('❌ YPRINT WORDPRESS: Integration failed:', error);
            throw error;
        }
    }

    async waitForYPrintAPI() {
        return new Promise((resolve) => {
            if (window.YPrint && window.yprintUnifiedAPI?.initialized) {
                this.yprintAPI = window.YPrint;
                resolve();
            } else {
                window.addEventListener('yprintSystemReady', () => {
                    this.yprintAPI = window.YPrint;
                    resolve();
                }, { once: true });
            }
        });
    }

    initializeAJAXHandlers() {
        console.log('🔗 YPRINT WORDPRESS: Setting up AJAX handlers...');

        // Design save handler
        this.setupDesignSaveHandler();

        // Design load handler
        this.setupDesignLoadHandler();

        // Product data handler
        this.setupProductDataHandler();

        console.log('✅ YPRINT WORDPRESS: AJAX handlers ready');
    }

    setupDesignSaveHandler() {
        // Listen for design save events from the API
        window.addEventListener('yprintDesignSaved', (event) => {
            const designData = event.detail;
            this.saveDesignToWordPress(designData);
        });

        // Manual save method
        this.saveDesignToWordPress = async (designData) => {
            if (!this.config.ajax_url || !this.config.nonce) {
                console.warn('⚠️ YPRINT WORDPRESS: AJAX configuration missing');
                return;
            }

            try {
                const formData = new FormData();
                formData.append('action', 'yprint_save_design');
                formData.append('nonce', this.config.nonce);
                formData.append('design_data', JSON.stringify(designData));
                formData.append('product_id', this.getCurrentProductId());

                const response = await fetch(this.config.ajax_url, {
                    method: 'POST',
                    body: formData
                });

                const result = await response.json();

                if (result.success) {
                    console.log('✅ YPRINT WORDPRESS: Design saved successfully');
                    this.showSuccessMessage('Design saved successfully!');

                    // Dispatch WordPress save event
                    window.dispatchEvent(new CustomEvent('yprintWordPressSaved', {
                        detail: { designData, response: result }
                    }));
                } else {
                    throw new Error(result.data || 'Save failed');
                }

            } catch (error) {
                console.error('❌ YPRINT WORDPRESS: Save failed:', error);
                this.showErrorMessage('Failed to save design: ' + error.message);
            }
        };
    }

    setupDesignLoadHandler() {
        this.loadDesignFromWordPress = async (designId) => {
            if (!this.config.ajax_url || !this.config.nonce) {
                console.warn('⚠️ YPRINT WORDPRESS: AJAX configuration missing');
                return null;
            }

            try {
                const formData = new FormData();
                formData.append('action', 'yprint_load_design');
                formData.append('nonce', this.config.nonce);
                formData.append('design_id', designId);

                const response = await fetch(this.config.ajax_url, {
                    method: 'POST',
                    body: formData
                });

                const result = await response.json();

                if (result.success && result.data) {
                    console.log('✅ YPRINT WORDPRESS: Design loaded successfully');

                    // Load into YPrint API
                    this.yprintAPI.design.load(result.data);

                    return result.data;
                } else {
                    throw new Error(result.data || 'Load failed');
                }

            } catch (error) {
                console.error('❌ YPRINT WORDPRESS: Load failed:', error);
                this.showErrorMessage('Failed to load design: ' + error.message);
                return null;
            }
        };
    }

    setupProductDataHandler() {
        this.getProductData = async (productId = null) => {
            if (!productId) {
                productId = this.getCurrentProductId();
            }

            if (!productId) {
                console.warn('⚠️ YPRINT WORDPRESS: No product ID available');
                return null;
            }

            try {
                const formData = new FormData();
                formData.append('action', 'yprint_get_product_data');
                formData.append('nonce', this.config.nonce);
                formData.append('product_id', productId);

                const response = await fetch(this.config.ajax_url, {
                    method: 'POST',
                    body: formData
                });

                const result = await response.json();

                if (result.success) {
                    return result.data;
                } else {
                    throw new Error(result.data || 'Failed to get product data');
                }

            } catch (error) {
                console.error('❌ YPRINT WORDPRESS: Failed to get product data:', error);
                return null;
            }
        };
    }

    initializeWordPressEvents() {
        console.log('🔗 YPRINT WORDPRESS: Setting up WordPress events...');

        // WooCommerce cart integration
        if (typeof wc_add_to_cart_params !== 'undefined') {
            this.setupWooCommerceIntegration();
        }

        // WordPress media library integration
        if (window.wp && window.wp.media) {
            this.setupMediaLibraryIntegration();
        }

        console.log('✅ YPRINT WORDPRESS: WordPress events ready');
    }

    setupWooCommerceIntegration() {
        // Add to cart with design data
        this.addToCartWithDesign = async () => {
            const designData = this.yprintAPI.design.getData();
            const productId = this.getCurrentProductId();

            if (!designData || !productId) {
                this.showErrorMessage('Please create a design before adding to cart');
                return;
            }

            // Save design first
            await this.saveDesignToWordPress(designData);

            // Add custom data to cart
            const cartData = {
                product_id: productId,
                design_data: JSON.stringify(designData),
                design_preview: this.yprintAPI.design.export('png')
            };

            // Trigger WooCommerce add to cart
            this.triggerWooCommerceAddToCart(cartData);
        };

        // Override default add to cart button
        this.overrideAddToCartButton();
    }

    setupMediaLibraryIntegration() {
        // Media library picker for images
        this.openMediaLibrary = () => {
            const mediaUploader = window.wp.media({
                title: 'Select Image for Design',
                button: {
                    text: 'Use This Image'
                },
                multiple: false,
                library: {
                    type: 'image'
                }
            });

            mediaUploader.on('select', () => {
                const attachment = mediaUploader.state().get('selection').first().toJSON();

                // Add image to design
                this.yprintAPI.designer.addElement('image', {
                    src: attachment.url,
                    x: 100,
                    y: 100
                });

                console.log('✅ YPRINT WORDPRESS: Image added from media library');
            });

            mediaUploader.open();
        };

        // Expose globally for buttons
        window.yprintOpenMediaLibrary = this.openMediaLibrary;
    }

    initializeProductIntegration() {
        console.log('🔗 YPRINT WORDPRESS: Setting up product integration...');

        // Auto-load product templates
        this.loadProductTemplates();

        // Set up product-specific canvas size
        this.setupProductCanvasSize();

        console.log('✅ YPRINT WORDPRESS: Product integration ready');
    }

    async loadProductTemplates() {
        const productId = this.getCurrentProductId();
        if (!productId) return;

        try {
            const productData = await this.getProductData(productId);

            if (productData && productData.templates) {
                console.log('📋 YPRINT WORDPRESS: Loading product templates...');

                // Create template selector UI
                this.createTemplateSelector(productData.templates);
            }

        } catch (error) {
            console.error('❌ YPRINT WORDPRESS: Failed to load templates:', error);
        }
    }

    setupProductCanvasSize() {
        const productId = this.getCurrentProductId();
        if (!productId) return;

        // Look for product-specific canvas size in meta
        const canvasWidth = document.querySelector('[data-canvas-width]')?.dataset.canvasWidth;
        const canvasHeight = document.querySelector('[data-canvas-height]')?.dataset.canvasHeight;

        if (canvasWidth && canvasHeight) {
            // Resize canvas when designer is ready
            window.addEventListener('designerWidgetReady', () => {
                const canvas = this.yprintAPI.designer.getCanvas();
                if (canvas) {
                    canvas.setDimensions({
                        width: parseInt(canvasWidth),
                        height: parseInt(canvasHeight)
                    });
                    console.log(`✅ YPRINT WORDPRESS: Canvas resized to ${canvasWidth}x${canvasHeight}`);
                }
            });
        }
    }

    initializeCartIntegration() {
        console.log('🔗 YPRINT WORDPRESS: Setting up cart integration...');

        // Custom add to cart handling
        this.setupCustomAddToCart();

        // Cart preview integration
        this.setupCartPreview();

        console.log('✅ YPRINT WORDPRESS: Cart integration ready');
    }

    setupCustomAddToCart() {
        // Find add to cart buttons and override them
        const addToCartButtons = document.querySelectorAll('.single_add_to_cart_button, .add_to_cart_button');

        addToCartButtons.forEach(button => {
            // Only override on product pages with designer
            if (this.getCurrentProductId() && document.querySelector('#designer-canvas')) {
                button.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();

                    this.addToCartWithDesign();
                });
            }
        });
    }

    setupCartPreview() {
        // Generate preview images for cart items with designs
        window.addEventListener('yprintDesignSaved', (event) => {
            const designData = event.detail;

            // Create preview image
            const previewImage = this.yprintAPI.design.export('png');

            // Store for cart display
            sessionStorage.setItem('yprint_design_preview', previewImage);
        });
    }

    // Utility Methods
    getCurrentProductId() {
        // Try multiple methods to get product ID
        const productIdMeta = document.querySelector('[name="product_id"]');
        if (productIdMeta) return productIdMeta.value;

        const productIdData = document.querySelector('[data-product-id]');
        if (productIdData) return productIdData.dataset.productId;

        // Check URL for product ID
        const urlMatch = window.location.href.match(/product[\/=](\d+)/);
        if (urlMatch) return urlMatch[1];

        return null;
    }

    triggerWooCommerceAddToCart(cartData) {
        // Use WooCommerce AJAX add to cart
        const form = document.querySelector('form.cart');
        if (form) {
            // Add hidden fields for design data
            const designInput = document.createElement('input');
            designInput.type = 'hidden';
            designInput.name = 'yprint_design_data';
            designInput.value = cartData.design_data;
            form.appendChild(designInput);

            const previewInput = document.createElement('input');
            previewInput.type = 'hidden';
            previewInput.name = 'yprint_design_preview';
            previewInput.value = cartData.design_preview;
            form.appendChild(previewInput);

            // Submit form
            form.submit();
        }
    }

    overrideAddToCartButton() {
        const addToCartButton = document.querySelector('.single_add_to_cart_button');
        if (addToCartButton) {
            addToCartButton.textContent = 'Add Design to Cart';
            addToCartButton.classList.add('yprint-custom-add-to-cart');
        }
    }

    createTemplateSelector(templates) {
        // Create template selector UI
        const selector = document.createElement('div');
        selector.className = 'yprint-template-selector';
        selector.innerHTML = `
            <h4>Choose a Template</h4>
            <div class="template-grid">
                ${templates.map(template => `
                    <div class="template-item" data-template-id="${template.id}">
                        <img src="${template.preview}" alt="${template.name}">
                        <span>${template.name}</span>
                    </div>
                `).join('')}
            </div>
        `;

        // Add event listeners
        selector.addEventListener('click', (e) => {
            const templateItem = e.target.closest('.template-item');
            if (templateItem) {
                const templateId = templateItem.dataset.templateId;
                this.loadTemplate(templateId);
            }
        });

        // Insert into page
        const designerContainer = document.querySelector('.product-designer') || document.querySelector('.designer-container');
        if (designerContainer) {
            designerContainer.insertBefore(selector, designerContainer.firstChild);
        }
    }

    async loadTemplate(templateId) {
        try {
            const templateData = await this.loadDesignFromWordPress(templateId);
            console.log('✅ YPRINT WORDPRESS: Template loaded successfully');
        } catch (error) {
            console.error('❌ YPRINT WORDPRESS: Template load failed:', error);
        }
    }

    // UI Helper Methods
    showSuccessMessage(message) {
        this.showMessage(message, 'success');
    }

    showErrorMessage(message) {
        this.showMessage(message, 'error');
    }

    showMessage(message, type = 'info') {
        // Create toast notification
        const toast = document.createElement('div');
        toast.className = `yprint-toast yprint-toast-${type}`;
        toast.textContent = message;

        document.body.appendChild(toast);

        // Auto-remove after 3 seconds
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }

    markReady() {
        this.initialized = true;

        // Expose globally
        window.yprintWordPressIntegration = this;

        // Dispatch ready event
        window.dispatchEvent(new CustomEvent('yprintWordPressReady', {
            detail: { instance: this }
        }));

        console.log('🎉 YPRINT WORDPRESS: Integration fully ready');
    }

    // Status and debugging
    getStatus() {
        return {
            initialized: this.initialized,
            configAvailable: !!this.config.ajax_url,
            productId: this.getCurrentProductId(),
            wooCommerceActive: typeof wc_add_to_cart_params !== 'undefined',
            mediaLibraryAvailable: !!(window.wp && window.wp.media),
            timestamp: Date.now()
        };
    }

    // Cleanup
    dispose() {
        console.log('🧹 YPRINT WORDPRESS: Disposing...');

        this.initialized = false;
        delete window.yprintWordPressIntegration;
        delete window.yprintOpenMediaLibrary;

        console.log('✅ YPRINT WORDPRESS: Disposed');
    }
}

// Auto-initialize when YPrint API is ready
console.log('🔗 YPRINT WORDPRESS: Auto-initializing...');

if (window.YPrint && window.yprintUnifiedAPI?.initialized) {
    window.yprintWordPressIntegration = new YPrintWordPressIntegration();
} else {
    window.addEventListener('yprintSystemReady', () => {
        window.yprintWordPressIntegration = new YPrintWordPressIntegration();
    });
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = YPrintWordPressIntegration;
}