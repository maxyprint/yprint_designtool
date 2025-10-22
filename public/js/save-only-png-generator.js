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
            const maxAttempts = 10; // 🔧 REDUCED: 5 seconds total (10 * 500ms)

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

                    // 🔧 ENHANCED DETECTION: Log what's available for faster debugging
                    console.log('🔍 Detection status:', {
                        pngIntegration: !!pngIntegration,
                        highDPIEngine: !!highDPIEngine,
                        designerWidget: !!window.designerWidgetInstance,
                        fabricCanvas: !!window.designerWidgetInstance?.fabricCanvas,
                        fabric: !!window.fabric
                    });

                    // After 3 attempts (1.5 seconds), trigger fallback loader if available
                    if (attempts === 3 && window.pngFallbackLoader) {
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
                        console.log('🔧 MINIMAL PNG: Exporting PRINT-READY PNG with template cropping...');

                        const canvas = designerWidget.fabricCanvas;

                        // 🎯 STEP 1: Get template print area from WordPress or URL
                        let printArea = await this.getTemplatePrintArea();
                        if (!printArea) {
                            console.warn('⚠️ MINIMAL PNG: No template print area found, using fallback');
                            printArea = { x: 100, y: 100, width: 600, height: 400 };
                        }

                        console.log('🎯 PRINT AREA:', printArea);

                        // 🚨 EMERGENCY DEBUG: Log ALL objects before filtering
                        const allObjects = canvas.getObjects();
                        console.log('🔍 MINIMAL PNG: ALL CANVAS OBJECTS BEFORE FILTERING:');
                        allObjects.forEach((obj, idx) => {
                            console.log(`Object ${idx}:`, {
                                type: obj.type,
                                name: obj.name || 'unnamed',
                                id: obj.id || 'no-id',
                                visible: obj.visible,
                                position: `${Math.round(obj.left || 0)},${Math.round(obj.top || 0)}`,
                                size: `${Math.round(obj.width || 0)}x${Math.round(obj.height || 0)}`,
                                isViewImage: obj.isViewImage,
                                isTemplateBackground: obj.isTemplateBackground,
                                isBackground: obj.isBackground,
                                excludeFromExport: obj.excludeFromExport,
                                src: obj.src ? obj.src.substring(0, 100) + '...' : 'no-src'
                            });
                        });

                        // 🎯 STEP 2: Filter out view images and backgrounds, keep only design elements
                        const originalObjects = [...allObjects];
                        const designElements = allObjects.filter(obj => {
                            // Skip invisible objects
                            if (!obj.visible) {
                                console.log(`🚫 MINIMAL PNG: Filtering out invisible object: ${obj.type}`);
                                return false;
                            }

                            // Skip explicitly excluded objects
                            if (obj.excludeFromExport) {
                                console.log(`🚫 MINIMAL PNG: Filtering out excluded object: ${obj.type}`);
                                return false;
                            }

                            // Skip view/background images (check flags first)
                            if (obj.isViewImage || obj.isTemplateBackground || obj.isBackground) {
                                console.log(`🚫 MINIMAL PNG: Filtering out view/background: ${obj.type}`);
                                return false;
                            }

                            // Enhanced background detection by size and position
                            if (obj.type === 'image') {
                                const bounds = obj.getBoundingRect();
                                const canvasWidth = canvas.width || 656;
                                const canvasHeight = canvas.height || 420;

                                // Check if image is very large (likely a background)
                                if (bounds.width > canvasWidth * 0.8 && bounds.height > canvasHeight * 0.8) {
                                    console.log(`🚫 MINIMAL PNG: Filtering out large background image: ${obj.type} (${Math.round(bounds.width)}x${Math.round(bounds.height)})`);
                                    return false;
                                }

                                // Check if image is positioned like a background (centered, large)
                                if (obj.width > 1000 && obj.height > 1000) {
                                    console.log(`🚫 MINIMAL PNG: Filtering out oversized background: ${obj.type} (${Math.round(obj.width)}x${Math.round(obj.height)})`);
                                    return false;
                                }

                                // Check by source URL pattern (shirt/template images)
                                if (obj.src && (obj.src.includes('shirt') || obj.src.includes('template') || obj.src.includes('mock'))) {
                                    console.log(`🚫 MINIMAL PNG: Filtering out template image by URL: ${obj.type}`);
                                    return false;
                                }
                            }

                            // Keep design elements (text, user uploads, graphics)
                            console.log(`✅ MINIMAL PNG: Keeping design element: ${obj.type}`);
                            return true;
                        });

                        console.log(`🎯 MINIMAL PNG: Filtered ${originalObjects.length} objects → ${designElements.length} design elements`);

                        // 🎯 STEP 3: Temporarily hide non-design elements
                        const hiddenObjects = [];
                        originalObjects.forEach(obj => {
                            if (!designElements.includes(obj)) {
                                obj.visible = false;
                                hiddenObjects.push(obj);
                            }
                        });

                        // 🎯 STEP 4: Create print-area-only canvas
                        canvas.renderAll();

                        const multiplier = options.dpi ? options.dpi / 72 : 4; // 300 DPI default
                        const cropArea = {
                            left: printArea.x * multiplier,
                            top: printArea.y * multiplier,
                            width: printArea.width * multiplier,
                            height: printArea.height * multiplier
                        };

                        console.log('🎯 CROP AREA (with multiplier):', cropArea);

                        // Export full canvas first
                        const fullCanvasDataURL = canvas.toDataURL({
                            format: 'png',
                            quality: options.quality || 1.0,
                            multiplier: multiplier
                        });

                        // 🎯 STEP 5: Crop to print area using canvas manipulation
                        const croppedDataURL = await this.cropImageToArea(fullCanvasDataURL, cropArea);

                        // 🎯 STEP 6: Restore visibility of hidden objects
                        hiddenObjects.forEach(obj => {
                            obj.visible = true;
                        });
                        canvas.renderAll();

                        console.log('✅ MINIMAL PNG: Print-ready PNG exported successfully with print area cropping');
                        console.log(`🎯 FINAL PNG SIZE: ${printArea.width}x${printArea.height}px (print area only)`);

                        return croppedDataURL;
                    },
                    printAreaPx: { width: 800, height: 600 },
                    printAreaMm: { width: 200, height: 150 },
                    currentTemplateId: 'fallback'
                },
                isReady: () => true,
                getTemplatePrintArea: this.getTemplatePrintArea.bind(this),
                cropImageToArea: this.cropImageToArea.bind(this)
            };
            console.log('✅ SAVE-ONLY PNG: Minimal PNG engine created with print-area cropping');
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

            // 🔧 ENHANCED SAFETY: Check for any available export method
            if (!this.pngEngine || !this.pngEngine.exportEngine) {
                throw new Error('Export engine not available');
            }

            // 🎯 PRIORITY 1: Try enhanced metadata export (most advanced)
            const enhancedResult = await this.generateEnhancedPNG(designData, saveType, orderId);
            if (enhancedResult) {
                console.log('✅ SAVE-ONLY PNG: Enhanced PNG with metadata completed successfully');
                return enhancedResult;
            }

            // 🎯 PRIORITY 2: Try print-ready PNG with cropping
            console.log('🖨️ SAVE-ONLY PNG: Trying print-ready PNG with cropping...');
            let printPNG;

            if (typeof this.pngEngine.exportEngine.exportPrintReadyPNGWithCropping === 'function') {
                console.log('✅ SAVE-ONLY PNG: Using print-ready PNG with cropping');
                const pngResult = await this.pngEngine.exportEngine.exportPrintReadyPNGWithCropping({
                    multiplier: 3,
                    quality: 1.0,
                    enableBleed: false,
                    debugMode: true
                });

                printPNG = pngResult ? pngResult.dataUrl : null;

                // Log enhanced metadata
                if (pngResult && pngResult.metadata) {
                    console.log('🎯 ENHANCED PNG METADATA:', pngResult.metadata);
                }

            } else if (typeof this.pngEngine.exportEngine.exportForPrintMachine === 'function') {
                console.log('📦 SAVE-ONLY PNG: Using standard export (fallback)');
                printPNG = await this.pngEngine.exportEngine.exportForPrintMachine({
                    dpi: 300,
                    format: 'png',
                    quality: 1.0
                });
            } else {
                throw new Error('No PNG export methods available');
            }

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
     * 🖨️ GENERATE ENHANCED PNG WITH METADATA
     * Uses the new template metadata integration for print-optimized PNGs
     */
    async generateEnhancedPNG(designData, saveType, orderId = null) {
        try {
            console.log('🖨️ SAVE-ONLY PNG: Generating enhanced PNG with metadata...');

            // Check if enhanced metadata export is available
            if (typeof this.pngEngine.exportEngine.exportWithTemplateMetadata === 'function') {
                console.log('✅ SAVE-ONLY PNG: Using template metadata enhanced export');

                const enhancedResult = await this.pngEngine.exportEngine.exportWithTemplateMetadata({
                    multiplier: 3,
                    quality: 1.0,
                    enableBleed: false,
                    debugMode: true
                });

                if (enhancedResult) {
                    console.log('🎯 ENHANCED EXPORT SUCCESS:', {
                        dimensions: `${enhancedResult.metadata.width}x${enhancedResult.metadata.height}px`,
                        dpi: enhancedResult.metadata.dpi,
                        elements: enhancedResult.metadata.elementsCount,
                        template: enhancedResult.templateMetadata?.template_name || 'unknown'
                    });

                    // Store enhanced PNG with all metadata
                    const enhancedPngData = {
                        design_id: this.generateDesignId(designData),
                        print_png: enhancedResult.dataUrl,
                        save_type: saveType,
                        order_id: orderId,
                        generated_at: new Date().toISOString(),
                        print_area_px: JSON.stringify(enhancedResult.printSpecifications.printAreaPX),
                        print_area_mm: JSON.stringify(enhancedResult.printSpecifications.printAreaMM),
                        template_id: enhancedResult.templateMetadata?.template_id || this.pngEngine.exportEngine.currentTemplateId,
                        metadata: JSON.stringify({
                            ...enhancedResult.metadata,
                            templateMetadata: enhancedResult.templateMetadata,
                            printSpecifications: enhancedResult.printSpecifications,
                            qualityAssurance: enhancedResult.qualityAssurance
                        })
                    };

                    return await this.storePNGInDatabase(enhancedPngData);
                }
            }

            // Fallback to standard generation
            console.log('📦 SAVE-ONLY PNG: Template metadata not available, using standard generation');
            return null;

        } catch (error) {
            console.error('❌ ENHANCED PNG GENERATION: Failed:', error);
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
     * 🎯 PRINT AREA DETECTION - Get template print area from WordPress
     */
    async getTemplatePrintArea() {
        try {
            // Method 1: Try to get from URL parameters
            const urlParams = new URLSearchParams(window.location.search);
            const templateId = urlParams.get('template_id');

            if (templateId) {
                console.log('🔍 PRINT AREA: Found template ID in URL:', templateId);

                // Try to get template data from WordPress
                const config = window.octo_print_designer_config;
                if (config && config.ajax_url && config.nonce) {
                    const response = await fetch(config.ajax_url, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded',
                        },
                        body: new URLSearchParams({
                            action: 'yprint_get_template_data',
                            nonce: config.nonce,
                            template_id: templateId
                        })
                    });

                    const result = await response.json();
                    if (result.success && result.data.printable_area_px) {
                        console.log('✅ PRINT AREA: Retrieved from WordPress:', result.data.printable_area_px);
                        return result.data.printable_area_px;
                    }
                }
            }

            // Method 2: Check for template data in DOM
            const templateElement = document.querySelector('[data-template-id]');
            if (templateElement && templateElement.dataset.printArea) {
                const printArea = JSON.parse(templateElement.dataset.printArea);
                console.log('✅ PRINT AREA: Retrieved from DOM:', printArea);
                return printArea;
            }

            // Method 3: Check for existing high-DPI engine data
            if (window.highDPIPrintExportEngine && window.highDPIPrintExportEngine.printAreaPx) {
                console.log('✅ PRINT AREA: Retrieved from existing engine:', window.highDPIPrintExportEngine.printAreaPx);
                return window.highDPIPrintExportEngine.printAreaPx;
            }

            console.warn('⚠️ PRINT AREA: No template data found, using intelligent fallback');
            return this.calculateIntelligentPrintArea();

        } catch (error) {
            console.error('❌ PRINT AREA: Error retrieving template data:', error);
            return this.calculateIntelligentPrintArea();
        }
    }

    /**
     * 🧠 INTELLIGENT FALLBACK - Calculate print area based on design elements
     */
    calculateIntelligentPrintArea() {
        try {
            console.log('🧠 === INTELLIGENT PRINT AREA CALCULATION START ===');

            const canvas = window.designerWidgetInstance?.fabricCanvas;
            if (!canvas) {
                console.warn('🧠 FALLBACK: No canvas found, using default area');
                return { x: 100, y: 100, width: 600, height: 400 };
            }

            console.log('🧠 CANVAS INFO:', {
                canvasWidth: canvas.width,
                canvasHeight: canvas.height,
                totalObjects: canvas.getObjects().length
            });

            // Debug all canvas objects first
            const allObjects = canvas.getObjects();
            console.log('🧠 ALL CANVAS OBJECTS ANALYSIS:');
            allObjects.forEach((obj, idx) => {
                const bounds = obj.getBoundingRect ? obj.getBoundingRect() : {};
                console.log(`  Object ${idx}: ${obj.type}`, {
                    name: obj.name || 'unnamed',
                    id: obj.id || 'no-id',
                    visible: obj.visible,
                    position: `${Math.round(obj.left || 0)},${Math.round(obj.top || 0)}`,
                    size: `${Math.round(obj.width || 0)}x${Math.round(obj.height || 0)}`,
                    bounds: `${Math.round(bounds.left || 0)},${Math.round(bounds.top || 0)} ${Math.round(bounds.width || 0)}x${Math.round(bounds.height || 0)}`,
                    flags: {
                        isBackground: !!obj.isBackground,
                        isViewImage: !!obj.isViewImage,
                        isTemplateBackground: !!obj.isTemplateBackground,
                        excludeFromExport: !!obj.excludeFromExport
                    },
                    src: obj.src ? obj.src.substring(obj.src.lastIndexOf('/') + 1, obj.src.lastIndexOf('/') + 30) + '...' : 'no-src'
                });
            });

            // Get all design elements (non-background) with detailed filtering log
            console.log('🧠 DESIGN ELEMENT FILTERING:');
            const designElements = canvas.getObjects().filter((obj, idx) => {
                if (!obj.visible) {
                    console.log(`  ❌ Object ${idx} (${obj.type}): FILTERED OUT - not visible`);
                    return false;
                }
                if (obj.isBackground) {
                    console.log(`  ❌ Object ${idx} (${obj.type}): FILTERED OUT - isBackground flag`);
                    return false;
                }
                if (obj.isViewImage) {
                    console.log(`  ❌ Object ${idx} (${obj.type}): FILTERED OUT - isViewImage flag`);
                    return false;
                }
                if (obj.isTemplateBackground) {
                    console.log(`  ❌ Object ${idx} (${obj.type}): FILTERED OUT - isTemplateBackground flag`);
                    return false;
                }
                if (obj.excludeFromExport) {
                    console.log(`  ❌ Object ${idx} (${obj.type}): FILTERED OUT - excludeFromExport flag`);
                    return false;
                }

                // Enhanced background detection by size and position
                if (obj.type === 'image') {
                    const bounds = obj.getBoundingRect();
                    const canvasWidth = canvas.width || 656;
                    const canvasHeight = canvas.height || 420;

                    // Check if image is very large (likely a background)
                    if (bounds.width > canvasWidth * 0.8 && bounds.height > canvasHeight * 0.8) {
                        console.log(`  ❌ Object ${idx} (${obj.type}): FILTERED OUT - large background image (${Math.round(bounds.width)}x${Math.round(bounds.height)})`);
                        return false;
                    }

                    // Check if image is positioned like a background (centered, large)
                    if (obj.width > 1000 && obj.height > 1000) {
                        console.log(`  ❌ Object ${idx} (${obj.type}): FILTERED OUT - oversized background (${Math.round(obj.width)}x${Math.round(obj.height)})`);
                        return false;
                    }

                    // Check by source URL pattern (shirt/template images)
                    if (obj.src && (obj.src.includes('shirt') || obj.src.includes('template') || obj.src.includes('mock'))) {
                        console.log(`  ❌ Object ${idx} (${obj.type}): FILTERED OUT - template image by URL`);
                        return false;
                    }
                }

                console.log(`  ✅ Object ${idx} (${obj.type}): INCLUDED as design element`);
                return true;
            });

            console.log(`🧠 FILTERING RESULT: ${allObjects.length} total → ${designElements.length} design elements`);

            if (designElements.length === 0) {
                console.warn('🧠 FALLBACK: No design elements found, using center area');
                return { x: 100, y: 100, width: 600, height: 400 };
            }

            // Calculate bounding box of all design elements with detailed logging
            console.log('🧠 BOUNDING BOX CALCULATION:');
            let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

            designElements.forEach((obj, idx) => {
                const bounds = obj.getBoundingRect();
                const left = bounds.left;
                const top = bounds.top;
                const right = bounds.left + bounds.width;
                const bottom = bounds.top + bounds.height;

                console.log(`  Element ${idx} (${obj.type}): bounds ${Math.round(left)},${Math.round(top)} to ${Math.round(right)},${Math.round(bottom)}`);

                minX = Math.min(minX, left);
                minY = Math.min(minY, top);
                maxX = Math.max(maxX, right);
                maxY = Math.max(maxY, bottom);
            });

            console.log('🧠 COMBINED BOUNDS:', {
                minX: Math.round(minX),
                minY: Math.round(minY),
                maxX: Math.round(maxX),
                maxY: Math.round(maxY),
                rawWidth: Math.round(maxX - minX),
                rawHeight: Math.round(maxY - minY)
            });

            // Calculate exact print area based on design elements only (no padding)
            const printArea = {
                x: Math.max(0, Math.floor(minX)),
                y: Math.max(0, Math.floor(minY)),
                width: Math.ceil(maxX - minX),
                height: Math.ceil(maxY - minY)
            };

            console.log('🧠 FINAL PRINT AREA (exact design size):', {
                x: Math.round(printArea.x),
                y: Math.round(printArea.y),
                width: Math.round(printArea.width),
                height: Math.round(printArea.height),
                paddingRemoved: "exact size"
            });

            console.log('🧠 === INTELLIGENT PRINT AREA CALCULATION END ===');
            return printArea;

        } catch (error) {
            console.error('❌ INTELLIGENT FALLBACK: Error calculating print area:', error);
            console.log('❌ FALLBACK: Using emergency default area');
            return { x: 100, y: 100, width: 600, height: 400 };
        }
    }

    /**
     * ✂️ IMAGE CROPPING - Crop canvas export to specific area
     */
    async cropImageToArea(dataURL, cropArea) {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');

                // Set canvas to crop area size
                canvas.width = cropArea.width;
                canvas.height = cropArea.height;

                // Draw cropped section
                ctx.drawImage(
                    img,
                    cropArea.left, cropArea.top, cropArea.width, cropArea.height,
                    0, 0, cropArea.width, cropArea.height
                );

                const croppedDataURL = canvas.toDataURL('image/png', 1.0);
                console.log('✂️ CROP: Image cropped to print area successfully');
                resolve(croppedDataURL);
            };
            img.src = dataURL;
        });
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

        // 🔍 ENHANCED DEBUG: Log the exact request being sent
        const requestData = {
            action: 'yprint_save_design_print_png',
            nonce: config.nonce,
            ...pngData
        };
        console.log('🔍 REQUEST DEBUG: Sending data:', {
            action: requestData.action,
            nonce: requestData.nonce ? 'PRESENT' : 'MISSING',
            design_id: requestData.design_id,
            data_size: JSON.stringify(requestData).length + ' bytes',
            ajax_url: config.ajax_url
        });

        const response = await fetch(config.ajax_url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams(requestData)
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
     * 🧪 TEST FUNCTION - Comprehensive save functionality test
     */
    async testSaveFunction(designName = 'test_save_verification') {
        console.log('🧪 SAVE-ONLY PNG: Starting comprehensive save test...');

        try {
            // 1. Check system requirements
            const systemStatus = {
                pngEngine: !!this.pngEngine,
                wpConfig: !!window.octo_print_designer_config,
                fabricCanvas: !!window.designerWidgetInstance?.fabricCanvas,
                generateDesignData: !!window.generateDesignData
            };

            console.log('🔍 System Requirements Check:', systemStatus);

            const missingRequirements = Object.entries(systemStatus)
                .filter(([key, value]) => !value)
                .map(([key]) => key);

            if (missingRequirements.length > 0) {
                throw new Error(`Missing requirements: ${missingRequirements.join(', ')}`);
            }

            // 2. Generate design data
            const designData = window.generateDesignData();
            if (!designData || !designData.canvas) {
                throw new Error('Failed to generate design data');
            }

            console.log('✅ Design data generated successfully');

            // 3. Test PNG generation
            console.log('🖨️ Testing PNG generation...');
            const result = await this.generateAndStorePNG(designData, designName, null);

            if (result && result.png_url) {
                console.log('✅ SAVE TEST SUCCESSFUL!', {
                    design_name: designName,
                    png_url: result.png_url ? 'Generated' : 'Missing',
                    result: result
                });
                return { success: true, result };
            } else {
                throw new Error('PNG generation succeeded but no result returned');
            }

        } catch (error) {
            console.error('❌ SAVE TEST FAILED:', error);
            return { success: false, error: error.message };
        }
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

// 🧪 GLOBAL TEST FUNCTION - Easy access for testing
window.testDesignSave = async function(designName = 'test_design') {
    console.log('🧪 Running comprehensive design save test...');
    if (window.saveOnlyPNGGenerator && window.saveOnlyPNGGenerator.testSaveFunction) {
        return await window.saveOnlyPNGGenerator.testSaveFunction(designName);
    } else {
        console.error('❌ Save test function not available');
        return { success: false, error: 'Test function not available' };
    }
};

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SaveOnlyPNGGenerator;
}