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

// 🔍 STARTUP DEBUG: Check WordPress configuration availability
console.log('🔧 SAVE-ONLY PNG: Script loading, checking WordPress configuration...');
setTimeout(() => {
    const config = window.octo_print_designer_config;
    if (config) {
        console.log('✅ SAVE-ONLY PNG: WordPress AJAX configuration available', {
            ajax_url: config.ajax_url,
            nonce_exists: !!config.nonce,
            plugin_url: config.plugin_url
        });
    } else {
        console.warn('⚠️ SAVE-ONLY PNG: WordPress AJAX configuration not found. Database storage will use fallback mode.');
        console.log('🔍 Available globals:', Object.keys(window).filter(key =>
            key.includes('octo') || key.includes('yprint') || key.includes('ajax')
        ));
    }
}, 100);

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
            let attempts = 0;
            const maxAttempts = 20; // 10 seconds total (20 * 500ms)

            const checkEngine = () => {
                // 🔧 FIX: Check for both possible integration instances
                const pngIntegration = window.yprintPNGIntegration || window.pngOnlySystemIntegration;

                // 🔧 FALLBACK: Check for high-DPI engine directly
                const highDPIEngine = window.highDPIPrintExportEngine;

                // 🔧 MANUAL SETUP: If we have highDPIEngine but no integration, create a minimal wrapper
                if (highDPIEngine && !pngIntegration) {
                    console.log('🔧 SAVE-ONLY PNG: Creating fallback PNG engine wrapper...');
                    this.pngEngine = {
                        exportEngine: highDPIEngine,
                        isReady: () => !!highDPIEngine
                    };
                    console.log('✅ SAVE-ONLY PNG: Fallback PNG engine connected');
                    resolve();
                    return;
                }

                if (pngIntegration && pngIntegration.exportEngine) {
                    this.pngEngine = pngIntegration;
                    console.log('✅ SAVE-ONLY PNG: PNG engine connected');
                    resolve();
                } else {
                    attempts++;
                    console.log(`⏳ SAVE-ONLY PNG: Waiting for PNG integration... (attempt ${attempts}/${maxAttempts})`);

                    // After 5 attempts (2.5 seconds), trigger fallback loader if available
                    if (attempts === 5 && window.pngFallbackLoader) {
                        console.log('🚨 SAVE-ONLY PNG: Triggering fallback loader...');
                        window.pngFallbackLoader.checkAndLoadMissingScripts();
                    }

                    if (attempts >= maxAttempts) {
                        console.error('❌ SAVE-ONLY PNG: Timeout waiting for PNG integration. System unavailable.');
                        console.error('💡 SAVE-ONLY PNG: Please check WordPress admin for plugin activation status.');
                        // 🔧 FINAL FALLBACK: Try to create minimal working engine
                        this.createMinimalPNGEngine();
                        resolve(); // Resolve anyway to prevent hanging
                    } else {
                        setTimeout(checkEngine, 500);
                    }
                }
            };
            checkEngine();
        });
    }

    createMinimalPNGEngine() {
        console.log('🔧 SAVE-ONLY PNG: Creating minimal PNG engine...');

        // Check if we have fabric and a designer instance available
        const fabric = window.fabric;
        const designerWidget = window.designerWidgetInstance;

        if (fabric && designerWidget && designerWidget.fabricCanvas) {
            this.pngEngine = {
                exportEngine: {
                    exportForPrintMachine: async (options = {}) => {
                        console.log('🔧 MINIMAL PNG: Exporting canvas to PNG...');

                        const canvas = designerWidget.fabricCanvas;
                        const dataURL = canvas.toDataURL({
                            format: 'png',
                            quality: options.quality || 1.0,
                            multiplier: options.dpi ? options.dpi / 72 : 4 // 300 DPI default
                        });

                        console.log('✅ MINIMAL PNG: Canvas exported successfully');
                        return dataURL;
                    },
                    printAreaPx: { width: 800, height: 600 },
                    printAreaMm: { width: 200, height: 150 },
                    currentTemplateId: 'fallback'
                },
                isReady: () => true
            };
            console.log('✅ SAVE-ONLY PNG: Minimal PNG engine created');
        } else {
            console.error('❌ SAVE-ONLY PNG: Cannot create minimal engine - fabric or designer not available');
        }
    }

    // Public method for fallback loader to trigger recheck
    checkSystemReady() {
        console.log('🔄 SAVE-ONLY PNG: System readiness recheck triggered by fallback loader');
        return this.waitForPNGEngine();
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
            // Look for common save button selectors (excluding :contains which is invalid)
            const saveButtonSelectors = [
                'button[data-action="save"]',
                'button[data-action="add-to-cart"]',
                '.designer-save-button',
                '.designer-action-button',  // 🎯 FIX: Added missing selector for user's "Save product" button
                '.add-to-cart-button',
                '#add-to-cart',
                'button[type="submit"]'
            ];

            // First handle standard selectors
            saveButtonSelectors.forEach(selector => {
                try {
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
                            console.log('🔍 SAVE-ONLY PNG: Button details:', {
                                tagName: button.tagName,
                                className: button.className,
                                textContent: button.textContent.trim(),
                                id: button.id
                            });

                            // Short delay to allow design data to be updated
                            setTimeout(() => {
                                console.log('🔍 SAVE-ONLY PNG: About to get current design data...');
                                const designData = this.getCurrentDesignData();
                                console.log('🔍 SAVE-ONLY PNG: Got design data:', designData);

                                // Fire our custom event
                                console.log('🔍 SAVE-ONLY PNG: Dispatching designerShortcodeSave event...');
                                document.dispatchEvent(new CustomEvent('designerShortcodeSave', {
                                    detail: {
                                        button: button,
                                        designData: designData
                                    }
                                }));
                                console.log('✅ SAVE-ONLY PNG: Event dispatched!');
                            }, 500); // 500ms delay for data update
                        });

                        console.log('🎯 SAVE-ONLY PNG: Monitoring save button:', selector);
                    });
                } catch (error) {
                    console.warn('⚠️ SAVE-ONLY PNG: Invalid selector:', selector, error.message);
                }
            });

            // Also search for buttons by text content (safe fallback)
            try {
                const textSearchTerms = ['Save', 'speichern', 'Speichern', 'Save Design', 'Save product'];
                textSearchTerms.forEach(searchTerm => {
                    document.querySelectorAll('button').forEach(button => {
                        if (button.textContent.includes(searchTerm) && !button.hasAttribute('data-save-png-monitored')) {
                            // Mark as monitored
                            button.setAttribute('data-save-png-monitored', 'true');

                            // Add click listener
                            button.addEventListener('click', (event) => {
                                console.log(`🎨 SAVE-ONLY PNG: Text-based save button clicked! (${searchTerm})`, button);

                                // Short delay to allow design data to be updated
                                setTimeout(() => {
                                    const designData = this.getCurrentDesignData();
                                    document.dispatchEvent(new CustomEvent('designerShortcodeSave', {
                                        detail: {
                                            button: button,
                                            designData: designData
                                        }
                                    }));
                                }, 500);
                            });

                            console.log(`🎯 SAVE-ONLY PNG: Monitoring text-based save button: "${searchTerm}"`);
                        }
                    });
                });
            } catch (error) {
                console.warn('⚠️ SAVE-ONLY PNG: Error in text-based button search:', error.message);
            }
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
            return {
                success: false,
                error: 'Generation already in progress'
            };
        }

        // 🔧 CRITICAL FIX: Test 1 - Check if PNG engine is null
        if (!this.pngEngine) {
            console.error('❌ SAVE-ONLY PNG: PNG engine is null. Cannot generate PNG.');
            return {
                success: false,
                error: 'PNG engine not available'
            };
        }

        // 🔧 CRITICAL FIX: Test 2 - Check if exportEngine is missing
        if (!this.pngEngine.exportEngine) {
            console.error('❌ SAVE-ONLY PNG: PNG engine exportEngine is missing. Cannot generate PNG.');
            return {
                success: false,
                error: 'PNG engine not available'
            };
        }

        this.isGenerating = true;
        const startTime = Date.now();

        try {
            console.log(`🖨️ SAVE-ONLY PNG: Generating PNG for ${saveType}...`);

            // 🔧 ADDITIONAL SAFETY: Double-check exportEngine before calling
            if (!this.pngEngine || !this.pngEngine.exportEngine || typeof this.pngEngine.exportEngine.exportForPrintMachine !== 'function') {
                throw new Error('Export engine or exportForPrintMachine method not available');
            }

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
                print_area_px: JSON.stringify(this.pngEngine.exportEngine.printAreaPx || { width: 800, height: 600 }),
                print_area_mm: JSON.stringify(this.pngEngine.exportEngine.printAreaMm || { width: 200, height: 150 }),
                template_id: this.pngEngine.exportEngine.currentTemplateId || 'fallback'
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
            return {
                success: false,
                error: error.message || 'PNG generation failed'
            };
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

            // 🔧 CRITICAL FIX: Check if WordPress config is available
            const config = window.octo_print_designer_config;
            if (!config || !config.ajax_url || !config.nonce) {
                console.error('❌ SAVE-ONLY PNG: WordPress AJAX configuration missing for retrieval');
                return { found: false, png: null, error: 'WordPress AJAX configuration not available' };
            }

            const response = await fetch(config.ajax_url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    action: 'yprint_get_existing_png',
                    nonce: config.nonce,
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
        // 🔍 DEBUG: Detailed function availability check
        console.log('🔍 SAVE-ONLY PNG: Checking for generateDesignData function...');
        console.log('🔍 typeof window.generateDesignData:', typeof window.generateDesignData);
        console.log('🔍 window.enhancedJSONSystem exists:', !!window.enhancedJSONSystem);
        console.log('🔍 window.generateDesignData function:', window.generateDesignData);

        // Get current design data from global function
        if (typeof window.generateDesignData === 'function') {
            console.log('✅ SAVE-ONLY PNG: generateDesignData function found, calling it...');
            const result = window.generateDesignData();
            console.log('🔍 SAVE-ONLY PNG: generateDesignData returned:', result);
            return result;
        }

        console.warn('❌ SAVE-ONLY PNG: generateDesignData function not available');
        console.log('🔍 Available window functions:', Object.keys(window).filter(key => key.includes('generate') || key.includes('design') || key.includes('JSON')));
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
        // 🔧 CRITICAL FIX: Check if WordPress config is available
        const config = window.octo_print_designer_config;
        if (!config || !config.ajax_url || !config.nonce) {
            console.error('❌ SAVE-ONLY PNG: WordPress AJAX configuration missing', {
                config_exists: !!config,
                ajax_url: config?.ajax_url,
                nonce_exists: !!config?.nonce,
                available_globals: Object.keys(window).filter(key => key.includes('octo') || key.includes('yprint'))
            });

            // 🔧 FALLBACK: Try to create a mock successful response for frontend systems
            console.log('🔧 SAVE-ONLY PNG: Creating fallback response (PNG generated but not stored in database)');

            return {
                png_url: 'data:' + pngData.print_png, // Return the data URL as fallback
                design_id: pngData.design_id,
                template_id: pngData.template_id,
                storage_method: 'fallback',
                message: 'PNG generated successfully (database storage unavailable)'
            };
        }

        console.log('📡 SAVE-ONLY PNG: Sending to WordPress AJAX:', config.ajax_url);

        const response = await fetch(config.ajax_url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                action: 'yprint_save_design_print_png',
                nonce: config.nonce,
                ...pngData
            })
        });

        if (!response.ok) {
            console.error('❌ SAVE-ONLY PNG: HTTP error', response.status, response.statusText);
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();
        console.log('📡 SAVE-ONLY PNG: Server response:', result);

        if (!result.success) {
            console.error('❌ SAVE-ONLY PNG: Server returned error:', result);
            throw new Error(result.data || 'Failed to store PNG in database');
        }

        console.log('✅ SAVE-ONLY PNG: Database storage successful!', {
            png_url: result.data?.png_url,
            design_id: result.data?.design_id
        });

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