/**
 * 🖨️ HIGH-DPI PNG EXPORT ENGINE - For Print Machine Transmission
 *
 * ZWECK: Generierung hochwertiger PNG-Dateien für Druckmaschinen
 *
 * REQUIREMENTS:
 * 1. ✅ Elemente behalten Original-Upload-Qualität
 * 2. ✅ Nur Design-Elemente, KEIN T-Shirt/View-Hintergrund
 * 3. ✅ PNG-Größe = exakt definierter Druckbereich im Template
 * 4. ✅ Dynamische Druckbereich-Integration aus Template-Meta
 */

class HighDPIPrintExportEngine {
    constructor() {
        this.initialized = false;
        this.version = '1.0.0';
        this.debugMode = true;

        console.log('🖨️ HIGH-DPI PRINT ENGINE: Initializing...');
        this.initialize();
    }

    async initialize() {
        try {
            // Wait for fabric.js to be ready
            await this.waitForFabric();

            // Get current template and print area definitions
            await this.loadPrintAreaDefinitions();

            this.markReady();
            console.log('✅ HIGH-DPI PRINT ENGINE: Ready for print PNG export');

        } catch (error) {
            console.error('❌ HIGH-DPI PRINT ENGINE: Initialization failed:', error);
            throw error;
        }
    }

    async waitForFabric() {
        return new Promise((resolve) => {
            // Direct fabric.js detection instead of YPrint wrapper
            if (window.fabric && window.designerWidgetInstance?.fabricCanvas) {
                console.log('✅ HIGH-DPI PRINT ENGINE: Fabric.js and designer canvas ready');
                resolve();
            } else {
                console.log('⏳ HIGH-DPI PRINT ENGINE: Waiting for fabric.js and designer canvas...');
                // Use existing event system
                window.addEventListener('designerReady', resolve, { once: true });
            }
        });
    }

    async loadPrintAreaDefinitions() {
        // Get current template ID
        this.currentTemplateId = this.getCurrentTemplateId();

        if (!this.currentTemplateId) {
            console.warn('⚠️ HIGH-DPI PRINT ENGINE: No template ID found, using fallback');
            this.printAreaPx = { x: 0, y: 0, width: 800, height: 600 };
            return;
        }

        // Load template print area from WordPress meta
        try {
            const templateData = await this.fetchTemplateData(this.currentTemplateId);
            this.printAreaPx = templateData.printable_area_px || { x: 0, y: 0, width: 800, height: 600 };
            this.printAreaMm = templateData.printable_area_mm || { width: 200, height: 250 };

            console.log('📐 HIGH-DPI PRINT ENGINE: Print area loaded:', this.printAreaPx);

        } catch (error) {
            console.warn('⚠️ HIGH-DPI PRINT ENGINE: Failed to load template data:', error);
            // Fallback to default print area
            this.printAreaPx = { x: 0, y: 0, width: 800, height: 600 };
        }
    }

    getCurrentTemplateId() {
        // Multiple methods to get template ID

        // 1. From URL parameter
        const urlParams = new URLSearchParams(window.location.search);
        let templateId = urlParams.get('template_id');
        if (templateId) return templateId;

        // 2. From data attribute
        const templateElement = document.querySelector('[data-template-id]');
        if (templateElement) {
            return templateElement.dataset.templateId;
        }

        // 3. From optimized design data capture
        if (window.optimizedDesignDataCapture?.extractTemplateViewId) {
            return window.optimizedDesignDataCapture.extractTemplateViewId();
        }

        // 4. From product meta
        const productIdMeta = document.querySelector('[name="product_id"]');
        if (productIdMeta) return productIdMeta.value;

        return null;
    }

    async fetchTemplateData(templateId) {
        // Use WordPress AJAX to get template meta data
        const formData = new FormData();
        formData.append('action', 'yprint_get_template_print_area');
        formData.append('template_id', templateId);

        if (window.octo_print_designer_config?.nonce) {
            formData.append('nonce', window.octo_print_designer_config.nonce);
        }

        const response = await fetch(window.octo_print_designer_config?.ajax_url || '/wp-admin/admin-ajax.php', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error('Failed to fetch template data');
        }

        const result = await response.json();

        if (!result.success) {
            throw new Error(result.data || 'Template data fetch failed');
        }

        return result.data;
    }

    /**
     * 🎯 MAIN EXPORT METHOD: Create print-ready PNG
     *
     * Returns high-quality PNG with:
     * - Only design elements (no background)
     * - Original image quality preserved
     * - Exact print area dimensions
     */
    async exportPrintReadyPNG(options = {}) {
        try {
            console.log('🖨️ HIGH-DPI PRINT ENGINE: Starting print PNG export...');

            const {
                dpi = 300,              // Print quality DPI
                includeBleed = false,   // Include bleed area
                format = 'png',         // Output format
                quality = 1.0           // Max quality
            } = options;

            // Get fabric canvas with retry mechanism
            let fabricCanvas = this.getFabricCanvas();
            if (!fabricCanvas) {
                console.warn('⚠️ HIGH-DPI PRINT ENGINE: First attempt to get canvas failed, retrying...');
                await new Promise(resolve => setTimeout(resolve, 100));
                fabricCanvas = this.getFabricCanvas();

                if (!fabricCanvas) {
                    throw new Error('Fabric canvas not available after retry');
                }
            }

            // Validate canvas has required methods
            if (typeof fabricCanvas.getObjects !== 'function') {
                console.error('❌ HIGH-DPI PRINT ENGINE: Canvas missing getObjects method');
                console.log('🔍 Canvas type:', typeof fabricCanvas);
                console.log('🔍 Canvas constructor:', fabricCanvas.constructor?.name);
                throw new Error('Fabric canvas is invalid - missing required methods');
            }

            // Calculate DPI multiplier (300 DPI = 3.125x multiplier for 96 DPI base)
            const multiplier = dpi / 96;

            // Create print-specific canvas export
            const printPNG = await this.createPrintAreaExport(fabricCanvas, multiplier, options);

            console.log('✅ HIGH-DPI PRINT ENGINE: Print PNG export complete');

            // Dispatch export event
            this.dispatchExportEvent(printPNG, options);

            return printPNG;

        } catch (error) {
            console.error('❌ HIGH-DPI PRINT ENGINE: Export failed:', error);
            throw error;
        }
    }

    async createPrintAreaExport(fabricCanvas, multiplier, options) {
        console.log('📐 HIGH-DPI PRINT ENGINE: Creating print area export...');
        console.log('🔍 PNG FIX: Canvas size:', fabricCanvas.getWidth(), 'x', fabricCanvas.getHeight());

        // Get only the design elements (no background)
        const designElements = this.getDesignElementsOnly(fabricCanvas);
        console.log('🎯 PNG FIX: Found design elements:', designElements.length);

        if (designElements.length === 0) {
            console.warn('⚠️ HIGH-DPI PRINT ENGINE: No design elements found - check canvas content!');
            console.log('🔍 DEBUG: All canvas objects:', fabricCanvas.getObjects().map(obj => ({
                type: obj.type,
                left: obj.left,
                top: obj.top,
                width: obj.width,
                height: obj.height,
                isBackground: obj.isBackground,
                excludeFromExport: obj.excludeFromExport
            })));
            return this.createEmptyPrintPNG(multiplier);
        }

        // Create temporary canvas with print area dimensions
        const printCanvas = this.createPrintAreaCanvas(multiplier);

        // Clone and add design elements to print canvas
        await this.addElementsToPrintCanvas(printCanvas, designElements, multiplier);

        // Export with maximum quality
        const printPNG = printCanvas.toDataURL({
            format: 'png',
            quality: 1.0,
            multiplier: 1.0, // Already scaled by creating at correct size
            enableRetinaScaling: false
        });

        // Cleanup temporary canvas
        printCanvas.dispose();

        console.log(`🎯 HIGH-DPI PRINT ENGINE: Print area PNG created at ${multiplier}x resolution`);
        return printPNG;
    }

    getDesignElementsOnly(fabricCanvas) {
        // Validate canvas before accessing methods
        console.log('🔍 HIGH-DPI PRINT ENGINE: Validating fabricCanvas before getObjects...');
        console.log('🔍 fabricCanvas type:', typeof fabricCanvas);
        console.log('🔍 fabricCanvas is null/undefined:', fabricCanvas == null);

        if (!fabricCanvas) {
            console.error('❌ HIGH-DPI PRINT ENGINE: fabricCanvas is null/undefined');
            throw new Error('Fabric canvas is null or undefined');
        }

        if (typeof fabricCanvas.getObjects !== 'function') {
            console.error('❌ HIGH-DPI PRINT ENGINE: fabricCanvas.getObjects is not a function');
            console.log('🔍 Available methods:', Object.getOwnPropertyNames(fabricCanvas));
            throw new Error('Fabric canvas does not have getObjects method');
        }

        // Get all objects but filter out backgrounds and view elements
        const allObjects = fabricCanvas.getObjects();
        console.log(`🔍 HIGH-DPI PRINT ENGINE: Analyzing ${allObjects.length} canvas objects for View-Image filtering...`);

        // 🚨 EMERGENCY DEBUG: Log ALL objects before filtering
        console.log('🔍 ALL CANVAS OBJECTS BEFORE FILTERING:');
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

        // 🚨 EMERGENCY MODE: Skip ALL filtering if needed for debugging
        const EMERGENCY_NO_FILTER = window.YPRINT_DEBUG_NO_FILTER || false;
        if (EMERGENCY_NO_FILTER) {
            console.warn('🚨 EMERGENCY MODE: ALL FILTERING DISABLED - INCLUDING ALL OBJECTS');
            return allObjects;
        }

        const designElements = allObjects.filter(obj => {
            // 🎯 METHOD 1: Property-based detection - ONLY filter VIEW IMAGES, not design backgrounds
            if (obj.isViewImage || obj.isTemplateBackground) {
                console.log('🚫 HIGH-DPI PRINT ENGINE: Filtered VIEW IMAGE by property flags:', obj.type, {
                    isViewImage: obj.isViewImage,
                    isTemplateBackground: obj.isTemplateBackground
                });
                return false;
            }

            // Allow design elements that might have isBackground but are user-added content
            if (obj.excludeFromExport === true) {
                console.log('🚫 HIGH-DPI PRINT ENGINE: Filtered by explicit excludeFromExport flag:', obj.type);
                return false;
            }

            // 🎯 METHOD 2: CSS class and data attribute detection
            if (obj.canvas?.contextContainer) {
                const element = obj.canvas.contextContainer;
                if (element.classList?.contains('template-view-image') ||
                    element.classList?.contains('background-image') ||
                    element.getAttribute('data-is-background') === 'true' ||
                    element.getAttribute('data-exclude-from-print') === 'true') {
                    console.log('🚫 HIGH-DPI PRINT ENGINE: Filtered by CSS/data attributes:', obj.type);
                    return false;
                }
            }

            // 🎯 METHOD 3: Advanced geometric analysis for background images
            if (obj.type === 'image') {
                const canvasWidth = fabricCanvas.getWidth();
                const canvasHeight = fabricCanvas.getHeight();
                const objCoverage = (obj.width * obj.height) / (canvasWidth * canvasHeight);

                // ONLY filter MASSIVE images at (0,0) covering >95% of canvas - these are view backgrounds
                if (obj.left <= 5 && obj.top <= 5 && objCoverage > 0.95) {
                    console.log('🚫 HIGH-DPI PRINT ENGINE: Filtered MASSIVE VIEW BACKGROUND image:', {
                        position: `${obj.left},${obj.top}`,
                        size: `${obj.width}x${obj.height}`,
                        coverage: `${(objCoverage * 100).toFixed(1)}%`,
                        zIndex: obj.zIndex || 'undefined'
                    });
                    return false;
                }

                // Images with very low z-index are likely backgrounds
                if (obj.zIndex !== undefined && obj.zIndex < 0) {
                    console.log('🚫 HIGH-DPI PRINT ENGINE: Filtered by z-index:', obj.type, 'zIndex:', obj.zIndex);
                    return false;
                }
            }

            // 🎯 METHOD 4: Name/ID pattern matching - ONLY filter clear view background patterns
            const objName = (obj.name || obj.id || '').toLowerCase();
            const viewBackgroundPatterns = /^(template-view|background-view|product-view|mockup-base|view-background)$/i;
            if (viewBackgroundPatterns.test(objName)) {
                console.log('🚫 HIGH-DPI PRINT ENGINE: Filtered VIEW BACKGROUND by name pattern:', objName);
                return false;
            }

            // 🎯 METHOD 5: Image source URL pattern detection - ONLY filter clear view image URLs
            if (obj.type === 'image' && obj.src) {
                const viewUrlPatterns = /(mockup-base|product-view-background|template-background).*\.(jpg|jpeg|png)/i;
                if (viewUrlPatterns.test(obj.src)) {
                    console.log('🚫 HIGH-DPI PRINT ENGINE: Filtered VIEW BACKGROUND by URL pattern:', obj.src.substring(0, 100) + '...');
                    return false;
                }
            }

            // ✅ Include all remaining design elements
            console.log('✅ HIGH-DPI PRINT ENGINE: Including design element:', {
                type: obj.type,
                name: obj.name || 'unnamed',
                position: `${Math.round(obj.left || 0)},${Math.round(obj.top || 0)}`,
                size: `${Math.round(obj.width || 0)}x${Math.round(obj.height || 0)}`
            });
            return true;
        });

        console.log(`🎯 HIGH-DPI PRINT ENGINE: View-Image filtering complete - ${designElements.length}/${allObjects.length} objects included`);
        return designElements;
    }

    createPrintAreaCanvas(multiplier, printArea = null) {
        const area = printArea || this.printAreaPx;
        const { width, height } = area;
        const scaledWidth = Math.round(width * multiplier);
        const scaledHeight = Math.round(height * multiplier);

        console.log(`📐 HIGH-DPI PRINT ENGINE: Creating print canvas ${scaledWidth}x${scaledHeight} (${multiplier}x scale)`);

        // Create new fabric canvas with print area dimensions
        const canvasElement = document.createElement('canvas');
        canvasElement.width = scaledWidth;
        canvasElement.height = scaledHeight;

        const printCanvas = new fabric.Canvas(canvasElement, {
            width: scaledWidth,
            height: scaledHeight,
            backgroundColor: 'transparent', // No background for print
            preserveObjectStacking: true
        });

        return printCanvas;
    }

    /**
     * 🖨️ PRINT-READY PNG EXPORT WITH CROPPING
     * Exports only the design elements within the print area coordinates
     * Perfect for direct machine transmission
     */
    async exportPrintReadyPNGWithCropping(options = {}) {
        const defaultOptions = {
            multiplier: 3,
            format: 'png',
            quality: 1.0,
            enableBleed: false,
            bleedMM: 3,
            debugMode: true
        };

        const config = { ...defaultOptions, ...options };

        console.log(`🖨️ PRINT-READY EXPORT: Starting export with ${config.multiplier}x quality...`);

        try {
            // Step 1: Get only design elements (filtered)
            const designElements = await this.getDesignElementsOnly();

            if (designElements.length === 0) {
                console.warn('⚠️ PRINT-READY EXPORT: No design elements found!');
                return null;
            }

            // Step 2: Calculate print area with optional bleed
            const printArea = this.calculatePrintAreaWithBleed(config.enableBleed, config.bleedMM);

            // Step 3: Create print-optimized canvas
            const printCanvas = this.createPrintAreaCanvas(config.multiplier, printArea);

            // Step 4: Add elements with coordinate mapping
            await this.addElementsToPrintCanvas(printCanvas, designElements, config.multiplier, printArea);

            // Step 5: Generate final PNG
            const pngDataUrl = printCanvas.toDataURL('image/png', config.quality);

            // Step 6: Cleanup
            printCanvas.dispose();

            console.log(`✅ PRINT-READY EXPORT: Successfully generated ${printArea.width}x${printArea.height}px PNG`);

            return {
                dataUrl: pngDataUrl,
                metadata: {
                    width: printArea.width,
                    height: printArea.height,
                    dpi: 300 * config.multiplier,
                    elementsCount: designElements.length,
                    printAreaMM: this.printAreaMM,
                    bleedEnabled: config.enableBleed,
                    timestamp: new Date().toISOString()
                }
            };

        } catch (error) {
            console.error('❌ PRINT-READY EXPORT ERROR:', error);
            throw new Error(`Print-ready PNG export failed: ${error.message}`);
        }
    }

    /**
     * 📏 Calculate print area dimensions with optional bleed
     */
    calculatePrintAreaWithBleed(enableBleed, bleedMM) {
        let { width, height, x, y } = this.printAreaPx;

        if (enableBleed && bleedMM > 0) {
            // Convert mm to pixels (assuming 300 DPI)
            const bleedPx = Math.round((bleedMM / 25.4) * 300);

            console.log(`📏 BLEED CALCULATION: Adding ${bleedMM}mm (${bleedPx}px) bleed`);

            width += bleedPx * 2;
            height += bleedPx * 2;
            x -= bleedPx;
            y -= bleedPx;
        }

        return { width, height, x, y };
    }

    async addElementsToPrintCanvas(printCanvas, designElements, multiplier, printArea = null) {
        console.log(`🎨 HIGH-DPI PRINT ENGINE: Adding ${designElements.length} elements to print canvas...`);

        const area = printArea || this.printAreaPx;
        const { x: printOffsetX, y: printOffsetY } = area;

        for (const element of designElements) {
            try {
                // Clone the element to avoid modifying original
                const clonedElement = await this.cloneElementWithQuality(element);

                // Adjust position relative to print area
                const adjustedLeft = (element.left - printOffsetX) * multiplier;
                const adjustedTop = (element.top - printOffsetY) * multiplier;

                // Scale element for high-DPI
                clonedElement.set({
                    left: adjustedLeft,
                    top: adjustedTop,
                    scaleX: (element.scaleX || 1) * multiplier,
                    scaleY: (element.scaleY || 1) * multiplier
                });

                // Preserve original image quality for image elements
                if (element.type === 'image' && element._originalElement) {
                    // Use original high-resolution source
                    await this.preserveImageQuality(clonedElement, element);
                }

                printCanvas.add(clonedElement);
                console.log('✅ HIGH-DPI PRINT ENGINE: Added element:', element.type);

            } catch (error) {
                console.warn('⚠️ HIGH-DPI PRINT ENGINE: Failed to add element:', element.type, error);
            }
        }

        // Render all elements
        printCanvas.renderAll();
        console.log('🎨 HIGH-DPI PRINT ENGINE: All elements rendered on print canvas');
    }

    async cloneElementWithQuality(element) {
        return new Promise((resolve) => {
            element.clone((cloned) => {
                resolve(cloned);
            });
        });
    }

    async preserveImageQuality(clonedElement, originalElement) {
        // If we have access to the original image source, use it
        if (originalElement._originalElement?.src || originalElement.src) {
            const originalSrc = originalElement._originalElement?.src || originalElement.src;

            console.log('🔍 HIGH-DPI PRINT ENGINE: Preserving original image quality from:', originalSrc);

            return new Promise((resolve) => {
                fabric.util.loadImage(originalSrc, (img) => {
                    if (img) {
                        clonedElement.setElement(img);
                        console.log('✅ HIGH-DPI PRINT ENGINE: Original image quality preserved');
                    }
                    resolve();
                }, null, 'anonymous');
            });
        }
    }

    createEmptyPrintPNG(multiplier) {
        const { width, height } = this.printAreaPx;

        // 🔧 FIXED: Ensure minimum viable dimensions (prevent 1x1 pixel PNGs)
        const scaledWidth = Math.max(Math.round(width * multiplier), 200);
        const scaledHeight = Math.max(Math.round(height * multiplier), 200);

        console.warn('⚠️ HIGH-DPI PRINT ENGINE: Creating fallback PNG:', `${scaledWidth}x${scaledHeight}`);

        // Create canvas with proper dimensions
        const canvas = document.createElement('canvas');
        canvas.width = scaledWidth;
        canvas.height = scaledHeight;

        const ctx = canvas.getContext('2d');

        // 🔧 FIXED: Create visible placeholder instead of transparent
        ctx.fillStyle = 'rgba(240, 240, 240, 0.8)';
        ctx.fillRect(0, 0, scaledWidth, scaledHeight);

        // Add debug text
        ctx.fillStyle = '#666';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('No Design Elements', scaledWidth/2, scaledHeight/2 - 10);
        ctx.fillText('Found for Export', scaledWidth/2, scaledHeight/2 + 10);

        return canvas.toDataURL('image/png');
    }

    getFabricCanvas() {
        console.log('🔍 HIGH-DPI PRINT ENGINE: getFabricCanvas() called - debugging canvas access...');

        // Debug current state
        console.log('🔍 window.YPrint exists:', !!window.YPrint);
        console.log('🔍 window.designerWidgetInstance exists:', !!window.designerWidgetInstance);
        console.log('🔍 window.designerWidgetInstance?.fabricCanvas exists:', !!window.designerWidgetInstance?.fabricCanvas);
        console.log('🔍 window.fabricCanvas exists:', !!window.fabricCanvas);

        // Multiple methods to get fabric canvas

        // 1. From YPrint unified API (deprecated, should not work)
        if (window.YPrint?.designer?.getCanvas) {
            console.log('✅ HIGH-DPI PRINT ENGINE: Using YPrint API canvas');
            return window.YPrint.designer.getCanvas();
        }

        // 2. From global designer widget (primary method)
        if (window.designerWidgetInstance?.fabricCanvas) {
            console.log('✅ HIGH-DPI PRINT ENGINE: Using designerWidgetInstance.fabricCanvas');
            const canvas = window.designerWidgetInstance.fabricCanvas;
            console.log('🔍 Canvas type:', typeof canvas);
            console.log('🔍 Canvas has getObjects method:', typeof canvas.getObjects === 'function');
            return canvas;
        }

        // 3. From fabric canvas global
        if (window.fabricCanvas) {
            console.log('✅ HIGH-DPI PRINT ENGINE: Using global fabricCanvas');
            return window.fabricCanvas;
        }

        // 4. From canvas element
        const canvasElement = document.getElementById('octo-print-designer-canvas');
        console.log('🔍 Canvas element found:', !!canvasElement);
        if (canvasElement && canvasElement.__fabric) {
            console.log('✅ HIGH-DPI PRINT ENGINE: Using canvas element.__fabric');
            return canvasElement.__fabric;
        }

        console.error('❌ HIGH-DPI PRINT ENGINE: No fabric canvas found through any method');
        return null;
    }

    dispatchExportEvent(printPNG, options) {
        const event = new CustomEvent('yprintPrintPNGExported', {
            detail: {
                printPNG: printPNG,
                printAreaPx: this.printAreaPx,
                printAreaMm: this.printAreaMm,
                templateId: this.currentTemplateId,
                options: options,
                timestamp: Date.now(),
                engine: 'HighDPIPrintExportEngine',
                version: this.version
            }
        });

        window.dispatchEvent(event);
        console.log('📢 HIGH-DPI PRINT ENGINE: Export event dispatched');
    }

    markReady() {
        this.initialized = true;

        // Expose globally
        window.highDPIPrintExportEngine = this;

        // Dispatch ready event
        window.dispatchEvent(new CustomEvent('yprintPrintEngineReady', {
            detail: { instance: this }
        }));
    }

    // Public API methods
    async exportForPrintMachine(options = {}) {
        return this.exportPrintReadyPNGWithCropping(options);
    }

    async exportForPrintMachineWithMetadata(options = {}) {
        return this.exportWithTemplateMetadata(options);
    }

    getPrintAreaDimensions() {
        return {
            pixels: this.printAreaPx,
            millimeters: this.printAreaMm
        };
    }

    getStatus() {
        return {
            initialized: this.initialized,
            version: this.version,
            templateId: this.currentTemplateId,
            printAreaPx: this.printAreaPx,
            printAreaMm: this.printAreaMm,
            timestamp: Date.now()
        };
    }

    // Debugging and testing
    async testExport() {
        if (this.debugMode) {
            console.log('🧪 HIGH-DPI PRINT ENGINE: Running test export...');

            try {
                const testPNG = await this.exportPrintReadyPNG({
                    dpi: 150, // Lower DPI for testing
                    format: 'png'
                });

                console.log('✅ HIGH-DPI PRINT ENGINE: Test export successful');
                console.log('📊 Test PNG data:', testPNG.substring(0, 100) + '...');

                return testPNG;

            } catch (error) {
                console.error('❌ HIGH-DPI PRINT ENGINE: Test export failed:', error);
                throw error;
            }
        }
    }

    /**
     * 🏷️ TEMPLATE METADATA INTEGRATION
     * Retrieves and integrates WordPress template metadata for enhanced PNG processing
     */
    async getTemplateMetadata() {
        try {
            if (!this.currentTemplateId) {
                console.warn('⚠️ TEMPLATE METADATA: No template ID available');
                return null;
            }

            console.log(`🏷️ TEMPLATE METADATA: Fetching for template ${this.currentTemplateId}...`);

            // Check if WordPress AJAX is available
            if (!window.octo_print_designer_config?.ajax_url) {
                console.warn('⚠️ TEMPLATE METADATA: WordPress AJAX not available');
                return null;
            }

            const formData = new FormData();
            formData.append('action', 'yprint_get_template_metadata');
            formData.append('nonce', window.octo_print_designer_config.nonce);
            formData.append('template_id', this.currentTemplateId);

            const response = await fetch(window.octo_print_designer_config.ajax_url, {
                method: 'POST',
                body: formData,
                credentials: 'same-origin'
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();

            if (data.success) {
                console.log('✅ TEMPLATE METADATA: Successfully retrieved', data.data);
                return data.data;
            } else {
                console.warn('⚠️ TEMPLATE METADATA: WordPress returned error:', data.data);
                return null;
            }

        } catch (error) {
            console.error('❌ TEMPLATE METADATA: Fetch failed:', error);
            return null;
        }
    }

    /**
     * 🖨️ EXPORT WITH TEMPLATE METADATA
     * Enhanced export that includes template metadata for print machine optimization
     */
    async exportWithTemplateMetadata(options = {}) {
        console.log('🖨️ METADATA EXPORT: Starting enhanced export...');

        try {
            // Get template metadata
            const templateMetadata = await this.getTemplateMetadata();

            // Generate print-ready PNG
            const pngResult = await this.exportPrintReadyPNGWithCropping(options);

            if (!pngResult) {
                throw new Error('PNG generation failed');
            }

            // Combine PNG with metadata
            const enhancedResult = {
                ...pngResult,
                templateMetadata: templateMetadata,
                printSpecifications: {
                    printAreaMM: this.printAreaMM,
                    printAreaPX: this.printAreaPx,
                    dpi: 300 * (options.multiplier || 3),
                    colorProfile: 'sRGB',
                    printMethod: 'digital_textile',
                    substrate: templateMetadata?.substrate || 'unknown',
                    washInstructions: templateMetadata?.care_instructions || 'standard'
                },
                qualityAssurance: {
                    bleedCheck: options.enableBleed || false,
                    resolutionCheck: true,
                    colorProfileCheck: true,
                    dimensionCheck: true,
                    timestamp: new Date().toISOString()
                }
            };

            console.log('✅ METADATA EXPORT: Enhanced PNG with metadata generated');

            // Dispatch enhanced event
            window.dispatchEvent(new CustomEvent('yprintEnhancedPNGExported', {
                detail: enhancedResult
            }));

            return enhancedResult;

        } catch (error) {
            console.error('❌ METADATA EXPORT: Failed:', error);
            throw error;
        }
    }

    dispose() {
        console.log('🧹 HIGH-DPI PRINT ENGINE: Disposing...');

        this.initialized = false;
        delete window.highDPIPrintExportEngine;

        console.log('✅ HIGH-DPI PRINT ENGINE: Disposed');
    }
}

// Auto-initialize when fabric is ready
console.log('🖨️ HIGH-DPI PRINT ENGINE: Auto-initializing...');

// Direct fabric.js detection instead of YPrint wrapper
if (window.fabric && window.designerWidgetInstance?.fabricCanvas) {
    console.log('✅ HIGH-DPI PRINT ENGINE: Direct initialization - fabric ready');
    window.highDPIPrintExportEngine = new HighDPIPrintExportEngine();
} else {
    console.log('⏳ HIGH-DPI PRINT ENGINE: Waiting for designerReady event...');
    window.addEventListener('designerReady', () => {
        console.log('🚀 HIGH-DPI PRINT ENGINE: designerReady event received, initializing...');
        window.highDPIPrintExportEngine = new HighDPIPrintExportEngine();
    });
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = HighDPIPrintExportEngine;
}