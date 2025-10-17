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
        // Auto-generate PNG when design is created/modified
        this.autoGeneratePrintPNG = async () => {
            try {
                console.log('🖨️ PNG-ONLY INTEGRATION: Auto-generating print PNG...');

                // Generate print-ready PNG
                const printPNG = await this.exportEngine.exportForPrintMachine({
                    dpi: 300,
                    format: 'png',
                    quality: 1.0
                });

                // Get design data
                const designData = this.yprintAPI.design.getData();

                // Prepare design PNG data
                const designPNGData = {
                    design_id: this.generateDesignId(designData),
                    print_png: printPNG,
                    print_area_px: JSON.stringify(this.exportEngine.printAreaPx),
                    print_area_mm: JSON.stringify(this.exportEngine.printAreaMm),
                    template_id: this.exportEngine.currentTemplateId
                };

                // Save to WordPress for 'Designdaten laden' access
                await this.saveDesignPrintPNG(designPNGData);

                console.log('✅ PNG-ONLY INTEGRATION: Print PNG auto-generated and saved');

            } catch (error) {
                console.error('❌ PNG-ONLY INTEGRATION: Auto PNG generation failed:', error);
            }
        };
    }

    async saveDesignPrintPNG(designPNGData) {
        const config = window.octo_print_designer_config;

        if (!config?.ajax_url || !config?.nonce) {
            throw new Error('WordPress AJAX configuration missing');
        }

        const formData = new FormData();
        formData.append('action', 'yprint_save_design_print_png');
        formData.append('nonce', config.nonce);
        formData.append('design_id', designPNGData.design_id);
        formData.append('print_png', designPNGData.print_png);
        formData.append('print_area_px', designPNGData.print_area_px);
        formData.append('print_area_mm', designPNGData.print_area_mm);
        formData.append('template_id', designPNGData.template_id);

        const response = await fetch(config.ajax_url, {
            method: 'POST',
            body: formData
        });

        const result = await response.json();

        if (!result.success) {
            throw new Error(result.data || 'Failed to save design PNG');
        }

        console.log('💾 PNG-ONLY INTEGRATION: Design PNG saved to WordPress');
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

        // Add print PNG preview button only (NO CART REPLACEMENT)
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
            previewButton.innerHTML = '🖨️ Generate Print PNG';
            previewButton.style.margin = '10px 0';

            previewButton.addEventListener('click', async () => {
                try {
                    previewButton.textContent = 'Generating Print PNG...';
                    previewButton.disabled = true;

                    // Generate high-quality print PNG when design is ready
                    const printPNG = await this.exportEngine.exportForPrintMachine({
                        dpi: 300, // Full print quality
                        format: 'png',
                        quality: 1.0
                    });

                    // Save PNG for later 'Designdaten laden' access
                    await this.savePrintPNGToCurrentDesign(printPNG);

                    this.showPrintPreview(printPNG);

                } catch (error) {
                    console.error('❌ PNG-ONLY INTEGRATION: PNG generation failed:', error);
                    this.showErrorMessage('Failed to generate print PNG');
                } finally {
                    previewButton.innerHTML = '🖨️ Generate Print PNG';
                    previewButton.disabled = false;
                }
            });

            designerContainer.appendChild(previewButton);
            console.log('✅ PNG-ONLY INTEGRATION: Print PNG generator button added');
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

        // Listen for design creation/modification
        window.addEventListener('yprintDesignCreated', (event) => {
            console.log('📢 PNG-ONLY INTEGRATION: Design created, auto-generating PNG...');
            this.autoGeneratePrintPNG();
        });

        window.addEventListener('yprintDesignModified', (event) => {
            console.log('📢 PNG-ONLY INTEGRATION: Design modified, auto-generating PNG...');
            this.autoGeneratePrintPNG();
        });

        // Listen for order design loading (from "Designdaten laden")
        window.addEventListener('yprintOrderDesignLoaded', (event) => {
            const { designId } = event.detail;
            console.log('📢 PNG-ONLY INTEGRATION: Order design loaded for "Designdaten laden", generating PNG...', designId);
            this.generatePNGForOrder(designId);
        });

        // Listen for fabric canvas changes (fallback)
        if (window.YPrint?.fabric?.canvas) {
            window.YPrint.fabric.canvas.on('object:added', () => {
                this.debounceAutoGenerate();
            });

            window.YPrint.fabric.canvas.on('object:modified', () => {
                this.debounceAutoGenerate();
            });

            window.YPrint.fabric.canvas.on('object:removed', () => {
                this.debounceAutoGenerate();
            });
        }

        // Listen for print PNG exports (manual generation)
        window.addEventListener('yprintPrintPNGExported', (event) => {
            const { printPNG, printAreaPx, options } = event.detail;
            console.log('📢 PNG-ONLY INTEGRATION: Manual print PNG export detected');
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

        // Expose globally with both names for compatibility
        window.pngOnlySystemIntegration = this;
        window.yprintPNGIntegration = this;  // 🔧 FIX: Also expose with expected name

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

    // Save Print PNG to current design data
    async savePrintPNGToCurrentDesign(printPNG) {
        try {
            const designData = this.yprintAPI.design.getData();
            const templateId = this.exportEngine.currentTemplateId;

            // Add print PNG to design data
            designData.printPNG = {
                data: printPNG,
                timestamp: Date.now(),
                templateId: templateId,
                printAreaPx: this.exportEngine.printAreaPx,
                printAreaMm: this.exportEngine.printAreaMm,
                dpi: 300
            };

            // Save updated design data back to YPrint system
            await this.yprintAPI.design.save(designData);

            console.log('✅ PNG-ONLY INTEGRATION: Print PNG saved to design data');

        } catch (error) {
            console.error('❌ PNG-ONLY INTEGRATION: Failed to save print PNG:', error);
            throw error;
        }
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

    // Debounce auto-generation to prevent too frequent calls
    debounceAutoGenerate() {
        clearTimeout(this.autoGenerateTimeout);
        this.autoGenerateTimeout = setTimeout(() => {
            this.autoGeneratePrintPNG();
        }, 2000); // Wait 2 seconds after last change
    }

    // Generate unique design ID from design data
    generateDesignId(designData) {
        try {
            // Create hash from design data for unique ID
            const dataString = JSON.stringify(designData);
            const timestamp = Date.now();
            const productId = this.getCurrentProductId() || 'unknown';
            const templateId = this.exportEngine?.currentTemplateId || 'unknown';

            // Simple hash function
            let hash = 0;
            for (let i = 0; i < dataString.length; i++) {
                const char = dataString.charCodeAt(i);
                hash = ((hash << 5) - hash) + char;
                hash = hash & hash; // Convert to 32-bit integer
            }

            return `design_${productId}_${templateId}_${Math.abs(hash)}_${timestamp}`;
        } catch (error) {
            console.error('❌ PNG-ONLY INTEGRATION: Failed to generate design ID:', error);
            return `design_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        }
    }

    // Generate PNG specifically for order design (triggered by "Designdaten laden")
    async generatePNGForOrder(designId) {
        try {
            console.log('🖨️ PNG-ONLY INTEGRATION: Generating PNG for order design:', designId);

            // Check if we have valid design and export engine
            if (!this.exportEngine || !this.yprintAPI) {
                console.warn('⚠️ PNG-ONLY INTEGRATION: Export engine or YPrint API not ready');
                return;
            }

            // Generate print-ready PNG
            const printPNG = await this.exportEngine.exportForPrintMachine({
                dpi: 300,
                format: 'png',
                quality: 1.0
            });

            // Get current design data
            const designData = this.yprintAPI.design.getData();

            // Prepare order PNG data
            const orderPNGData = {
                design_id: designId,
                print_png: printPNG,
                print_area_px: JSON.stringify(this.exportEngine.printAreaPx),
                print_area_mm: JSON.stringify(this.exportEngine.printAreaMm),
                template_id: this.exportEngine.currentTemplateId
            };

            // Save PNG data for order
            await this.saveDesignPrintPNG(orderPNGData);

            // Notify that PNG is ready for order
            window.dispatchEvent(new CustomEvent('yprintOrderPNGGenerated', {
                detail: {
                    designId: designId,
                    pngUrl: printPNG
                }
            }));

            console.log('✅ PNG-ONLY INTEGRATION: Order PNG generated and saved for:', designId);

        } catch (error) {
            console.error('❌ PNG-ONLY INTEGRATION: Order PNG generation failed:', error);
        }
    }

    dispose() {
        console.log('🧹 PNG-ONLY INTEGRATION: Disposing...');

        // Clear timeout
        if (this.autoGenerateTimeout) {
            clearTimeout(this.autoGenerateTimeout);
        }

        this.initialized = false;
        delete window.pngOnlySystemIntegration;
        delete window.yprintPNGIntegration;  // 🔧 FIX: Clean up both global references

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
        const pngIntegration = new PNGOnlySystemIntegration();
        window.pngOnlySystemIntegration = pngIntegration;
        window.yprintPNGIntegration = pngIntegration;  // 🔧 FIX: Expose with both names
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