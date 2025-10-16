/**
 * 🔗 PNG-ONLY SYSTEM INTEGRATION
 *
 * Integration layer for the new print machine PNG export system
 * Connects HighDPIPrintExportEngine with WordPress/WooCommerce
 */

class PNGOnlySystemIntegration {
    constructor() {
        this.initialized = false;
        this.exportEngine = null;
        this.yprintAPI = null;

        console.log('🔗 PNG-ONLY INTEGRATION: Starting...');
        this.initialize();
    }

    async initialize() {
        try {
            // Wait for systems to be ready
            await this.waitForSystems();

            // Set up integration
            this.setupWordPressIntegration();
            this.setupUIIntegration();
            this.setupEventHandlers();

            this.markReady();
            console.log('✅ PNG-ONLY INTEGRATION: Ready');

        } catch (error) {
            console.error('❌ PNG-ONLY INTEGRATION: Failed:', error);
            throw error;
        }
    }

    async waitForSystems() {
        // Wait for YPrint API
        await this.waitForYPrintAPI();

        // Wait for print export engine
        await this.waitForPrintEngine();
    }

    async waitForYPrintAPI() {
        return new Promise((resolve) => {
            if (window.YPrint?.fabric?.isReady()) {
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

    async waitForPrintEngine() {
        return new Promise((resolve) => {
            if (window.highDPIPrintExportEngine?.initialized) {
                this.exportEngine = window.highDPIPrintExportEngine;
                resolve();
            } else {
                window.addEventListener('yprintPrintEngineReady', (event) => {
                    this.exportEngine = event.detail.instance;
                    resolve();
                }, { once: true });
            }
        });
    }

    setupWordPressIntegration() {
        console.log('🔗 PNG-ONLY INTEGRATION: Setting up WordPress integration...');

        // WordPress AJAX handler for print PNG export
        this.setupPrintPNGAJAX();

        // WooCommerce order integration
        this.setupOrderIntegration();

        console.log('✅ PNG-ONLY INTEGRATION: WordPress integration ready');
    }

    setupPrintPNGAJAX() {
        // Add to cart with print PNG data
        this.addToCartWithPrintPNG = async () => {
            try {
                console.log('🛒 PNG-ONLY INTEGRATION: Adding to cart with print PNG...');

                // Generate print-ready PNG
                const printPNG = await this.exportEngine.exportForPrintMachine({
                    dpi: 300,
                    format: 'png',
                    quality: 1.0
                });

                // Get design data
                const designData = this.yprintAPI.design.getData();

                // Prepare cart data
                const cartData = {
                    product_id: this.getCurrentProductId(),
                    design_data: JSON.stringify(designData),
                    print_png: printPNG,
                    print_area_px: JSON.stringify(this.exportEngine.printAreaPx),
                    print_area_mm: JSON.stringify(this.exportEngine.printAreaMm),
                    template_id: this.exportEngine.currentTemplateId
                };

                // Send to WordPress
                await this.sendPrintDataToWordPress(cartData);

                console.log('✅ PNG-ONLY INTEGRATION: Cart data sent with print PNG');

            } catch (error) {
                console.error('❌ PNG-ONLY INTEGRATION: Add to cart failed:', error);
                this.showErrorMessage('Failed to add print design to cart: ' + error.message);
            }
        };
    }

    async sendPrintDataToWordPress(cartData) {
        const config = window.octo_print_designer_config;

        if (!config?.ajax_url || !config?.nonce) {
            throw new Error('WordPress AJAX configuration missing');
        }

        const formData = new FormData();
        formData.append('action', 'yprint_add_to_cart_with_print_png');
        formData.append('nonce', config.nonce);
        formData.append('product_id', cartData.product_id);
        formData.append('design_data', cartData.design_data);
        formData.append('print_png', cartData.print_png);
        formData.append('print_area_px', cartData.print_area_px);
        formData.append('print_area_mm', cartData.print_area_mm);
        formData.append('template_id', cartData.template_id);

        const response = await fetch(config.ajax_url, {
            method: 'POST',
            body: formData
        });

        const result = await response.json();

        if (!result.success) {
            throw new Error(result.data || 'Failed to add to cart');
        }

        // Redirect to cart or show success
        if (result.data.redirect_url) {
            window.location.href = result.data.redirect_url;
        }

        return result.data;
    }

    setupOrderIntegration() {
        // Listen for order placement
        window.addEventListener('yprintOrderPlaced', (event) => {
            const { orderId, orderData } = event.detail;
            this.handleOrderPlacement(orderId, orderData);
        });
    }

    async handleOrderPlacement(orderId, orderData) {
        console.log('📦 PNG-ONLY INTEGRATION: Handling order placement:', orderId);

        try {
            // Generate final print PNG for production
            const finalPrintPNG = await this.exportEngine.exportForPrintMachine({
                dpi: 300,
                format: 'png',
                quality: 1.0
            });

            // Save to order meta
            await this.saveOrderPrintData(orderId, {
                print_png: finalPrintPNG,
                print_area_px: this.exportEngine.printAreaPx,
                print_area_mm: this.exportEngine.printAreaMm,
                export_timestamp: Date.now()
            });

            console.log('✅ PNG-ONLY INTEGRATION: Order print data saved');

        } catch (error) {
            console.error('❌ PNG-ONLY INTEGRATION: Order handling failed:', error);
        }
    }

    async saveOrderPrintData(orderId, printData) {
        const config = window.octo_print_designer_config;

        const formData = new FormData();
        formData.append('action', 'yprint_save_order_print_data');
        formData.append('nonce', config.nonce);
        formData.append('order_id', orderId);
        formData.append('print_data', JSON.stringify(printData));

        const response = await fetch(config.ajax_url, {
            method: 'POST',
            body: formData
        });

        return response.json();
    }

    setupUIIntegration() {
        console.log('🔗 PNG-ONLY INTEGRATION: Setting up UI integration...');

        // Replace standard "Add to Cart" with print PNG export
        this.replaceAddToCartButtons();

        // Add print PNG preview button
        this.addPrintPreviewButton();

        console.log('✅ PNG-ONLY INTEGRATION: UI integration ready');
    }

    replaceAddToCartButtons() {
        const addToCartButtons = document.querySelectorAll('.single_add_to_cart_button, .add_to_cart_button');

        addToCartButtons.forEach(button => {
            // Only replace on product pages with designer
            if (this.getCurrentProductId() && document.querySelector('#octo-print-designer-canvas')) {
                // Store original handler
                const originalText = button.textContent;

                // Update button text
                button.textContent = 'Add Design to Cart (Print Ready)';
                button.classList.add('yprint-print-ready-cart');

                // Replace click handler
                button.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();

                    // Show loading state
                    button.textContent = 'Preparing Print File...';
                    button.disabled = true;

                    // Execute print PNG add to cart
                    this.addToCartWithPrintPNG().finally(() => {
                        button.textContent = originalText;
                        button.disabled = false;
                    });
                });

                console.log('🔄 PNG-ONLY INTEGRATION: Replaced add to cart button');
            }
        });
    }

    addPrintPreviewButton() {
        // Add print preview button to designer interface
        const designerContainer = document.querySelector('.octo-print-designer') ||
                                  document.querySelector('.designer-container');

        if (designerContainer) {
            const previewButton = document.createElement('button');
            previewButton.className = 'btn btn-secondary yprint-print-preview';
            previewButton.innerHTML = '🖨️ Preview Print PNG';
            previewButton.style.margin = '10px 0';

            previewButton.addEventListener('click', async () => {
                try {
                    previewButton.textContent = 'Generating Preview...';
                    previewButton.disabled = true;

                    const printPNG = await this.exportEngine.exportForPrintMachine({
                        dpi: 150, // Lower DPI for preview
                        format: 'png'
                    });

                    this.showPrintPreview(printPNG);

                } catch (error) {
                    console.error('❌ PNG-ONLY INTEGRATION: Preview failed:', error);
                    this.showErrorMessage('Failed to generate print preview');
                } finally {
                    previewButton.innerHTML = '🖨️ Preview Print PNG';
                    previewButton.disabled = false;
                }
            });

            designerContainer.appendChild(previewButton);
            console.log('✅ PNG-ONLY INTEGRATION: Print preview button added');
        }
    }

    showPrintPreview(printPNG) {
        // Create modal with print preview
        const modal = document.createElement('div');
        modal.className = 'yprint-print-preview-modal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.8);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10000;
        `;

        const content = document.createElement('div');
        content.style.cssText = `
            background: white;
            padding: 20px;
            border-radius: 8px;
            max-width: 80%;
            max-height: 80%;
            overflow: auto;
        `;

        const title = document.createElement('h3');
        title.textContent = '🖨️ Print PNG Preview';
        title.style.marginTop = '0';

        const img = document.createElement('img');
        img.src = printPNG;
        img.style.cssText = `
            max-width: 100%;
            height: auto;
            border: 1px solid #ddd;
            border-radius: 4px;
        `;

        const info = document.createElement('div');
        const dimensions = this.exportEngine.getPrintAreaDimensions();
        info.innerHTML = `
            <p><strong>Print Area:</strong> ${dimensions.pixels.width}x${dimensions.pixels.height} px</p>
            <p><strong>Physical Size:</strong> ${dimensions.millimeters.width}x${dimensions.millimeters.height} mm</p>
            <p><strong>Template ID:</strong> ${this.exportEngine.currentTemplateId}</p>
        `;

        const closeButton = document.createElement('button');
        closeButton.textContent = 'Close';
        closeButton.className = 'btn btn-primary';
        closeButton.style.marginTop = '10px';
        closeButton.onclick = () => modal.remove();

        content.appendChild(title);
        content.appendChild(img);
        content.appendChild(info);
        content.appendChild(closeButton);
        modal.appendChild(content);

        // Close on background click
        modal.onclick = (e) => {
            if (e.target === modal) modal.remove();
        };

        document.body.appendChild(modal);
    }

    setupEventHandlers() {
        console.log('🔗 PNG-ONLY INTEGRATION: Setting up event handlers...');

        // Listen for print PNG exports
        window.addEventListener('yprintPrintPNGExported', (event) => {
            const { printPNG, printAreaPx, options } = event.detail;
            console.log('📢 PNG-ONLY INTEGRATION: Print PNG export detected');

            // Could trigger automatic save or other actions here
        });

        console.log('✅ PNG-ONLY INTEGRATION: Event handlers ready');
    }

    getCurrentProductId() {
        // Try multiple methods to get product ID
        const productIdMeta = document.querySelector('[name="product_id"]');
        if (productIdMeta) return productIdMeta.value;

        const productIdData = document.querySelector('[data-product-id]');
        if (productIdData) return productIdData.dataset.productId;

        // Check URL for product ID
        const urlMatch = window.location.href.match(/product[\\/=](\\d+)/);
        if (urlMatch) return urlMatch[1];

        return null;
    }

    showErrorMessage(message) {
        const toast = document.createElement('div');
        toast.className = 'yprint-error-toast';
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #f8d7da;
            color: #721c24;
            padding: 15px;
            border-radius: 4px;
            border: 1px solid #f5c6cb;
            z-index: 9999;
            max-width: 300px;
        `;
        toast.textContent = message;

        document.body.appendChild(toast);

        setTimeout(() => {
            toast.remove();
        }, 5000);
    }

    markReady() {
        this.initialized = true;

        // Expose globally
        window.pngOnlySystemIntegration = this;

        // Dispatch ready event
        window.dispatchEvent(new CustomEvent('yprintPNGOnlySystemReady', {
            detail: { instance: this }
        }));

        console.log('🎉 PNG-ONLY INTEGRATION: Fully ready');
    }

    getStatus() {
        return {
            initialized: this.initialized,
            exportEngine: !!this.exportEngine,
            yprintAPI: !!this.yprintAPI,
            productId: this.getCurrentProductId(),
            timestamp: Date.now()
        };
    }

    // Public API
    async exportPrintPNG(options = {}) {
        if (!this.exportEngine) {
            throw new Error('Print export engine not available');
        }

        return this.exportEngine.exportForPrintMachine(options);
    }

    getPrintDimensions() {
        if (!this.exportEngine) {
            return null;
        }

        return this.exportEngine.getPrintAreaDimensions();
    }

    dispose() {
        console.log('🧹 PNG-ONLY INTEGRATION: Disposing...');

        this.initialized = false;
        delete window.pngOnlySystemIntegration;

        console.log('✅ PNG-ONLY INTEGRATION: Disposed');
    }
}

// Auto-initialize when systems are ready
console.log('🔗 PNG-ONLY INTEGRATION: Auto-initializing...');

// Wait for both YPrint and print engine
let systemsReady = 0;
const requiredSystems = 2;

const checkAndInit = () => {
    systemsReady++;
    if (systemsReady >= requiredSystems) {
        window.pngOnlySystemIntegration = new PNGOnlySystemIntegration();
    }
};

if (window.YPrint?.fabric?.isReady()) {
    checkAndInit();
} else {
    window.addEventListener('yprintSystemReady', checkAndInit, { once: true });
}

if (window.highDPIPrintExportEngine?.initialized) {
    checkAndInit();
} else {
    window.addEventListener('yprintPrintEngineReady', checkAndInit, { once: true });
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PNGOnlySystemIntegration;
}