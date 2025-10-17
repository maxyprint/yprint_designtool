/**
 * 🎯 SAVE-ONLY PNG GENERATOR
 * Clean PNG generation system - only creates PNGs on actual design saves
 * Eliminates PNG spam from canvas events and unnecessary generations
 *
 * PHILOSOPHY:
 * - Canvas Events = Update memory only (NO PNG)
 * - Save Events = Generate PNG + Store in DB
 * - Load Events = Retrieve existing PNG (NO generation)
 */

class SaveOnlyPNGGenerator {
    constructor() {
        this.pngEngine = null;
        this.isGenerating = false;
        this.lastSaveTimestamp = 0;

        console.log('🎯 SAVE-ONLY PNG: Initializing clean PNG generation system...');
        this.init();
    }

    async init() {
        // Wait for PNG engine to be available
        await this.waitForPNGEngine();

        // Setup ONLY save event listeners (no canvas events)
        this.setupSaveEventListeners();

        // Setup load-only retrieval system
        this.setupLoadOnlyRetrieval();

        // Expose global instance
        window.saveOnlyPNGGenerator = this;

        console.log('✅ SAVE-ONLY PNG: Clean system initialized');
    }

    async waitForPNGEngine() {
        return new Promise((resolve) => {
            const checkEngine = () => {
                // 🔧 FIX: Check for both possible integration instances
                const pngIntegration = window.yprintPNGIntegration || window.pngOnlySystemIntegration;

                if (pngIntegration && pngIntegration.exportEngine) {
                    this.pngEngine = pngIntegration;
                    console.log('✅ SAVE-ONLY PNG: PNG engine connected');
                    resolve();
                } else {
                    console.log('⏳ SAVE-ONLY PNG: Waiting for PNG integration... (checking window.yprintPNGIntegration and window.pngOnlySystemIntegration)');
                    setTimeout(checkEngine, 500);
                }
            };
            checkEngine();
        });
    }

    setupSaveEventListeners() {
        console.log('🎯 SAVE-ONLY PNG: Setting up save-only event listeners...');

        // 1. REAL DESIGN SAVE - When user explicitly saves design
        document.addEventListener('designSaved', this.handleDesignSave.bind(this));

        // 2. CART SUBMISSION - When design goes to cart (real save)
        document.addEventListener('addToCart', this.handleCartSubmission.bind(this));

        // 3. ORDER SUBMISSION - When order is placed (final save)
        document.addEventListener('orderSubmitted', this.handleOrderSubmission.bind(this));

        // 4. EXPLICIT PNG REQUEST - Manual PNG generation button
        document.addEventListener('generatePrintPNG', this.handleExplicitPNGRequest.bind(this));

        // 5. DESIGNER SHORTCODE SAVE - Specific save in designer widget
        document.addEventListener('designerShortcodeSave', this.handleDesignerShortcodeSave.bind(this));

        // 6. DESIGNER SAVE BUTTON - Monitor for save button clicks in designer
        this.setupDesignerSaveButtonMonitoring();

        console.log('✅ SAVE-ONLY PNG: Save event listeners active');
    }

    setupLoadOnlyRetrieval() {
        console.log('🎯 SAVE-ONLY PNG: Setting up load-only retrieval system...');

        // "Designdaten laden" - ONLY retrieves existing PNGs
        document.addEventListener('loadOrderDesign', this.handleDesignLoad.bind(this));

        // Design preview requests - ONLY shows existing PNGs
        document.addEventListener('requestDesignPreview', this.handlePreviewRequest.bind(this));

        console.log('✅ SAVE-ONLY PNG: Load-only system active');
    }

    setupDesignerSaveButtonMonitoring() {
        console.log('🎯 SAVE-ONLY PNG: Setting up designer save button monitoring...');

        // Monitor for save button clicks in designer interface
        const monitorSaveButtons = () => {
            // Look for common save button selectors
            const saveButtonSelectors = [
                'button[data-action="save"]',
                'button[data-action="add-to-cart"]',
                '.designer-save-button',
                '.designer-action-button',  // 🎯 FIX: Added missing selector for user's "Save product" button
                '.add-to-cart-button',
                '#add-to-cart',
                'button:contains("Save")',
                'button:contains("speichern")',
                'button[type="submit"]'
            ];

            saveButtonSelectors.forEach(selector => {
                document.querySelectorAll(selector).forEach(button => {
                    // Check if already monitored
                    if (button.hasAttribute('data-save-png-monitored')) {
                        return;
                    }

                    // Mark as monitored
                    button.setAttribute('data-save-png-monitored', 'true');

                    // Add click listener
                    button.addEventListener('click', (event) => {
                        console.log('🎨 SAVE-ONLY PNG: Designer save button clicked!', button);

                        // Short delay to allow design data to be updated
                        setTimeout(() => {
                            // Fire our custom event
                            document.dispatchEvent(new CustomEvent('designerShortcodeSave', {
                                detail: {
                                    button: button,
                                    designData: this.getCurrentDesignData()
                                }
                            }));
                        }, 500); // 500ms delay for data update
                    });

                    console.log('🎯 SAVE-ONLY PNG: Monitoring save button:', selector);
                });
            });
        };

        // Initial scan
        monitorSaveButtons();

        // Re-scan periodically for dynamically added buttons
        setInterval(monitorSaveButtons, 2000);

        // Also monitor form submissions
        document.addEventListener('submit', (event) => {
            const form = event.target;
            if (form.querySelector('input[name*="design"]') ||
                form.querySelector('textarea[name*="design"]') ||
                form.classList.contains('designer-form')) {

                console.log('🎨 SAVE-ONLY PNG: Designer form submitted!', form);

                setTimeout(() => {
                    document.dispatchEvent(new CustomEvent('designerShortcodeSave', {
                        detail: {
                            form: form,
                            designData: this.getCurrentDesignData()
                        }
                    }));
                }, 500);
            }
        });

        console.log('✅ SAVE-ONLY PNG: Designer save button monitoring active');
    }

    /**
     * 💾 SAVE EVENT HANDLERS - Generate PNG on real saves only
     */
    async handleDesignSave(event) {
        try {
            console.log('💾 SAVE-ONLY PNG: Design save event received');
            const designData = event.detail?.designData || this.getCurrentDesignData();

            if (this.shouldGeneratePNG('designSave', designData)) {
                await this.generateAndStorePNG(designData, 'design_save');
            }
        } catch (error) {
            console.error('❌ SAVE-ONLY PNG: Design save failed:', error);
        }
    }

    async handleCartSubmission(event) {
        try {
            console.log('🛒 SAVE-ONLY PNG: Cart submission event received');
            const designData = event.detail?.designData || this.getCurrentDesignData();

            if (this.shouldGeneratePNG('cartSubmission', designData)) {
                await this.generateAndStorePNG(designData, 'cart_submission');
            }
        } catch (error) {
            console.error('❌ SAVE-ONLY PNG: Cart submission failed:', error);
        }
    }

    async handleOrderSubmission(event) {
        try {
            console.log('📦 SAVE-ONLY PNG: Order submission event received');
            const { orderId, designData } = event.detail;

            if (this.shouldGeneratePNG('orderSubmission', designData)) {
                await this.generateAndStorePNG(designData, 'order_submission', orderId);
            }
        } catch (error) {
            console.error('❌ SAVE-ONLY PNG: Order submission failed:', error);
        }
    }

    async handleExplicitPNGRequest(event) {
        try {
            console.log('🖨️ SAVE-ONLY PNG: Explicit PNG request received');
            const designData = event.detail?.designData || this.getCurrentDesignData();

            // Always generate for explicit requests
            await this.generateAndStorePNG(designData, 'explicit_request');
        } catch (error) {
            console.error('❌ SAVE-ONLY PNG: Explicit PNG request failed:', error);
        }
    }

    async handleDesignerShortcodeSave(event) {
        try {
            console.log('🎨 SAVE-ONLY PNG: Designer shortcode save event received');
            const designData = event.detail?.designData || this.getCurrentDesignData();

            if (this.shouldGeneratePNG('designerShortcodeSave', designData)) {
                await this.generateAndStorePNG(designData, 'designer_shortcode_save');

                // Extra console output for designer shortcode saves
                console.log('🎨✅ DESIGNER SHORTCODE SAVE: PNG generation completed!');
                console.log('🎨📋 Use the PNG URL above for preview/print/API transmission');
            }
        } catch (error) {
            console.error('❌ SAVE-ONLY PNG: Designer shortcode save failed:', error);
        }
    }

    /**
     * 📥 LOAD EVENT HANDLERS - Retrieve existing PNGs only
     */
    async handleDesignLoad(event) {
        try {
            console.log('📥 SAVE-ONLY PNG: Design load request (retrieve only)');
            const { orderId } = event.detail;

            const existingPNG = await this.retrieveExistingPNG(orderId);

            // Fire event with retrieved PNG (no generation)
            document.dispatchEvent(new CustomEvent('designPNGLoaded', {
                detail: { orderId, png: existingPNG }
            }));

        } catch (error) {
            console.error('❌ SAVE-ONLY PNG: Design load failed:', error);
        }
    }

    async handlePreviewRequest(event) {
        try {
            console.log('👁️ SAVE-ONLY PNG: Preview request (retrieve only)');
            const { designId, orderId } = event.detail;

            const existingPNG = await this.retrieveExistingPNG(orderId || designId);

            // Return existing PNG for preview (no generation)
            return existingPNG;

        } catch (error) {
            console.error('❌ SAVE-ONLY PNG: Preview request failed:', error);
            return null;
        }
    }

    /**
     * 🎯 CORE PNG GENERATION - Only called from save events
     */
    async generateAndStorePNG(designData, saveType, orderId = null) {
        if (this.isGenerating) {
            console.log('⏳ SAVE-ONLY PNG: Generation already in progress, skipping...');
            return;
        }

        this.isGenerating = true;
        const startTime = Date.now();

        try {
            console.log(`🖨️ SAVE-ONLY PNG: Generating PNG for ${saveType}...`);

            // Generate high-quality print PNG
            const printPNG = await this.pngEngine.exportEngine.exportForPrintMachine({
                dpi: 300,
                format: 'png',
                quality: 1.0
            });

            // Store PNG with metadata
            const pngData = {
                design_id: this.generateDesignId(designData),
                print_png: printPNG,
                save_type: saveType,
                order_id: orderId,
                generated_at: new Date().toISOString(),
                print_area_px: JSON.stringify(this.pngEngine.exportEngine.printAreaPx),
                print_area_mm: JSON.stringify(this.pngEngine.exportEngine.printAreaMm),
                template_id: this.pngEngine.exportEngine.currentTemplateId
            };

            // Save to WordPress database
            const saveResult = await this.storePNGInDatabase(pngData);

            const duration = Date.now() - startTime;
            console.log(`✅ SAVE-ONLY PNG: Generated and stored in ${duration}ms`);

            // 🔍 LOG PNG URL TO CONSOLE for easy access
            if (saveResult && saveResult.png_url) {
                console.log(`🖼️ PNG URL: ${saveResult.png_url}`);
                console.log(`📋 Design ID: ${pngData.design_id}`);
                console.log(`💾 Save Type: ${saveType}`);

                // Also log as an object for easy copying
                console.log('🎯 PNG DETAILS:', {
                    url: saveResult.png_url,
                    designId: pngData.design_id,
                    saveType: saveType,
                    orderId: pngData.order_id,
                    generatedAt: pngData.generated_at
                });
            }

            // Fire success event with PNG URL
            document.dispatchEvent(new CustomEvent('pngGenerated', {
                detail: {
                    designData,
                    pngData,
                    saveType,
                    pngUrl: saveResult?.png_url
                }
            }));

            this.lastSaveTimestamp = Date.now();

        } catch (error) {
            console.error('❌ SAVE-ONLY PNG: Generation failed:', error);
            throw error;
        } finally {
            this.isGenerating = false;
        }
    }

    /**
     * 📥 RETRIEVE EXISTING PNG - No generation, pure retrieval
     */
    async retrieveExistingPNG(identifier) {
        try {
            console.log('📥 SAVE-ONLY PNG: Retrieving existing PNG for:', identifier);

            const response = await fetch(window.octo_print_designer_config.ajax_url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    action: 'yprint_get_existing_png',
                    nonce: window.octo_print_designer_config.nonce,
                    identifier: identifier
                })
            });

            const result = await response.json();

            if (result.success && result.data.png) {
                console.log('✅ SAVE-ONLY PNG: Existing PNG retrieved');
                return result.data.png;
            } else {
                console.log('ℹ️ SAVE-ONLY PNG: No existing PNG found');
                return null;
            }

        } catch (error) {
            console.error('❌ SAVE-ONLY PNG: Retrieval failed:', error);
            return null;
        }
    }

    /**
     * 🔍 SHOULD GENERATE PNG - Smart generation logic
     */
    shouldGeneratePNG(saveType, designData) {
        // Don't generate if no design data
        if (!designData || !this.hasDesignElements(designData)) {
            console.log('ℹ️ SAVE-ONLY PNG: No design elements, skipping PNG generation');
            return false;
        }

        // Don't generate too frequently (prevent spam)
        const timeSinceLastSave = Date.now() - this.lastSaveTimestamp;
        if (timeSinceLastSave < 5000) { // 5 second minimum between saves
            console.log('ℹ️ SAVE-ONLY PNG: Too frequent save, skipping PNG generation');
            return false;
        }

        // Don't generate if already in progress
        if (this.isGenerating) {
            console.log('ℹ️ SAVE-ONLY PNG: Generation in progress, skipping');
            return false;
        }

        return true;
    }

    /**
     * 🛠️ UTILITY METHODS
     */
    getCurrentDesignData() {
        // Get current design data from global function
        if (typeof window.generateDesignData === 'function') {
            return window.generateDesignData();
        }

        console.warn('⚠️ SAVE-ONLY PNG: generateDesignData function not available');
        return null;
    }

    hasDesignElements(designData) {
        return designData &&
               designData.elements &&
               Array.isArray(designData.elements) &&
               designData.elements.length > 0;
    }

    generateDesignId(designData) {
        const timestamp = Date.now();
        const hash = this.simpleHash(JSON.stringify(designData));
        return `design_${timestamp}_${hash}`;
    }

    simpleHash(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return Math.abs(hash).toString(36);
    }

    async storePNGInDatabase(pngData) {
        const response = await fetch(window.octo_print_designer_config.ajax_url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                action: 'yprint_save_design_print_png',
                nonce: window.octo_print_designer_config.nonce,
                ...pngData
            })
        });

        const result = await response.json();

        if (!result.success) {
            throw new Error(result.data || 'Failed to store PNG in database');
        }

        return result.data;
    }

    /**
     * 🧹 CLEANUP - Remove all auto-generation triggers
     */
    static removeAutoGenerationTriggers() {
        console.log('🧹 SAVE-ONLY PNG: Removing auto-generation triggers...');

        // Remove canvas event listeners that trigger PNG generation
        if (window.fabric && window.fabric.Canvas) {
            const canvas = window.fabric.Canvas.prototype;

            // Remove problematic event handlers
            ['object:added', 'object:modified', 'object:removed', 'path:created'].forEach(eventName => {
                canvas.off(eventName, '*'); // Remove all handlers for these events
            });
        }

        console.log('✅ SAVE-ONLY PNG: Auto-generation triggers removed');
    }
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new SaveOnlyPNGGenerator();
    });
} else {
    new SaveOnlyPNGGenerator();
}

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SaveOnlyPNGGenerator;
}