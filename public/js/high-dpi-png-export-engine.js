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
            // 🎯 MINIMAL FILTER: Only filter explicit template background elements
            if (obj.isTemplateBackground === true || obj.excludeFromExport === true) {
                console.log('🚫 HIGH-DPI PRINT ENGINE: Filtered template background:', obj.type);
                return false;
            }

            // Include ALL other elements (text, images, shapes, etc.)
            console.log('✅ HIGH-DPI PRINT ENGINE: Including design element:', obj.type, `${obj.left},${obj.top}`);
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
            // Step 1: Get fabric canvas first
            let fabricCanvas = this.getFabricCanvas();
            if (!fabricCanvas) {
                console.warn('⚠️ PRINT-READY EXPORT: First attempt to get canvas failed, retrying...');
                await new Promise(resolve => setTimeout(resolve, 100));
                fabricCanvas = this.getFabricCanvas();

                if (!fabricCanvas) {
                    throw new Error('Fabric canvas not available after retry');
                }
            }

            // Step 2: Get only design elements (filtered)
            const designElements = this.getDesignElementsOnly(fabricCanvas);

            if (designElements.length === 0) {
                console.warn('⚠️ PRINT-READY EXPORT: No design elements found!');
                return null;
            }

            // Step 3: Calculate print area with optional bleed
            const printArea = this.calculatePrintAreaWithBleed(config.enableBleed, config.bleedMM);

            // Step 4: Create print-optimized canvas
            const printCanvas = this.createPrintAreaCanvas(config.multiplier, printArea);

            // Step 5: Add elements with coordinate mapping
            await this.addElementsToPrintCanvas(printCanvas, designElements, config.multiplier, printArea);

            // Step 6: Generate final PNG
            const pngDataUrl = printCanvas.toDataURL('image/png', config.quality);

            // Step 7: Cleanup
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

        // 🚀 ALL-IN-ONE MEGA-DEBUG SYSTEM START
        console.group('🔬 === COMPREHENSIVE DEBUG ANALYSIS START ===');

        // 🌐 BROWSER ENVIRONMENT
        console.log('🌐 BROWSER ENV:', {
            userAgent: navigator.userAgent,
            supportsSpread: (() => { try { return [...[1,2,3]].length === 3; } catch(e) { return false; } })(),
            fabricVersion: fabric?.version,
            webGL: !!window.WebGLRenderingContext,
            memory: performance.memory ? {
                used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024) + 'MB',
                total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024) + 'MB'
            } : 'not available'
        });

        // 🔧 ES6 FEATURE SUPPORT
        const es6Support = {
            spread: (() => { try { return [...[1]].length === 1; } catch(e) { return false; } })(),
            iterator: (() => { try { return typeof [1][Symbol.iterator] === 'function'; } catch(e) { return false; } })(),
            destructuring: (() => { try { const [a] = [1]; return a === 1; } catch(e) { return false; } })()
        };
        console.log('🔧 ES6 SUPPORT:', es6Support);

        // 📚 FABRIC.JS INFO
        console.log('📚 FABRIC INFO:', {
            version: fabric.version,
            buildDate: fabric.buildDate,
            revision: fabric.revision,
            hasCanvasMethod: typeof fabric.Canvas === 'function',
            hasImageMethod: typeof fabric.Image === 'function'
        });

        // 🎨 CANVAS STATE BEFORE
        console.log('🎨 CANVAS BEFORE:', {
            objects: printCanvas.getObjects().length,
            width: printCanvas.width,
            height: printCanvas.height,
            canvasType: typeof printCanvas,
            hasFabricCanvas: printCanvas._objects !== undefined
        });

        console.groupEnd();

        const area = printArea || this.printAreaPx;
        const { x: printOffsetX, y: printOffsetY } = area;

        for (const element of designElements) {
            try {
                console.group(`🔍 === ELEMENT ${designElements.indexOf(element) + 1} DEBUG ===`);

                // 🎯 ELEMENT DEEP ANALYSIS
                console.log('🔍 ELEMENT BEFORE CLONE:', {
                    element: element,
                    type: typeof element,
                    constructor: element.constructor.name,
                    fabricType: element.type,
                    properties: Object.keys(element),
                    hasCloneMethod: typeof element.clone === 'function',
                    position: `${element.left},${element.top}`,
                    size: `${element.width}x${element.height}`,
                    visible: element.visible,
                    hasIterator: element[Symbol.iterator] !== undefined,
                    isIterable: (() => { try { return typeof element[Symbol.iterator] === 'function'; } catch(e) { return false; } })()
                });

                // Clone the element to avoid modifying original
                const clonedElement = await this.cloneElementWithQuality(element);
                console.log('✅ CLONE SUCCESS:', {
                    cloned: clonedElement,
                    type: typeof clonedElement,
                    constructor: clonedElement.constructor.name
                });

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
                console.log('🎯 ELEMENT SCALED:', {
                    adjustedLeft,
                    adjustedTop,
                    scaleX: (element.scaleX || 1) * multiplier,
                    scaleY: (element.scaleY || 1) * multiplier
                });

                // Preserve original image quality for image elements
                if (element.type === 'image' && element._originalElement) {
                    // Use original high-resolution source
                    await this.preserveImageQuality(clonedElement, element);
                    console.log('🖼️ IMAGE QUALITY PRESERVED');
                }

                // 🎨 INDIVIDUAL ADD TEST WITH ALL METHODS
                console.log('🎨 TESTING CANVAS ADD METHODS...');

                try {
                    // Method 1: Direct add
                    printCanvas.add(clonedElement);
                    console.log('✅ METHOD 1 SUCCESS: Direct add - Object count:', printCanvas.getObjects().length);
                    console.log('✅ HIGH-DPI PRINT ENGINE: Added element:', element.type);
                } catch (addError) {
                    console.error('❌ METHOD 1 FAILED:', {
                        error: addError,
                        message: addError.message,
                        stack: addError.stack,
                        element: clonedElement
                    });

                    // 🔄 FALLBACK METHODS
                    console.log('🔄 TRYING FALLBACK METHODS...');

                    try {
                        // Fallback 1: Manual clone for images
                        if (element.type === 'image' && element.getSrc) {
                            console.log('🔄 FALLBACK 1: Manual image clone...');
                            const manualClone = new fabric.Image(element.getSrc(), {
                                left: adjustedLeft,
                                top: adjustedTop,
                                scaleX: (element.scaleX || 1) * multiplier,
                                scaleY: (element.scaleY || 1) * multiplier
                            });
                            printCanvas.add(manualClone);
                            console.log('✅ FALLBACK 1 SUCCESS: Manual image clone');
                        } else {
                            // Fallback 2: JSON serialization clone
                            console.log('🔄 FALLBACK 2: JSON clone...');
                            const jsonClone = fabric.util.object.clone(element);
                            jsonClone.set({
                                left: adjustedLeft,
                                top: adjustedTop,
                                scaleX: (element.scaleX || 1) * multiplier,
                                scaleY: (element.scaleY || 1) * multiplier
                            });
                            printCanvas.add(jsonClone);
                            console.log('✅ FALLBACK 2 SUCCESS: JSON clone');
                        }
                    } catch (fallbackError) {
                        console.error('❌ ALL FALLBACKS FAILED:', fallbackError);

                        // Fallback 3: toObject/fromObject with safe parameter handling
                        try {
                            console.log('🔄 FALLBACK 3: toObject/fromObject...');

                            // Safe toObject() call - handle different parameter formats
                            let objectData;
                            try {
                                // Try without parameters first
                                objectData = element.toObject();
                            } catch (toObjectError) {
                                console.log('🔄 FALLBACK 3a: toObject() without params failed, trying with empty array...');
                                try {
                                    // Try with empty array
                                    objectData = element.toObject([]);
                                } catch (toObjectError2) {
                                    console.log('🔄 FALLBACK 3b: toObject([]) failed, trying with basic properties...');
                                    // Fallback to manual property extraction
                                    objectData = {
                                        type: element.type,
                                        left: element.left,
                                        top: element.top,
                                        width: element.width,
                                        height: element.height,
                                        scaleX: element.scaleX,
                                        scaleY: element.scaleY,
                                        angle: element.angle,
                                        opacity: element.opacity,
                                        visible: element.visible,
                                        fill: element.fill,
                                        stroke: element.stroke
                                    };

                                    // Add image-specific properties if it's an image
                                    if (element.type === 'image' && element.getSrc) {
                                        objectData.src = element.getSrc();
                                    }
                                }
                            }

                            objectData.left = adjustedLeft;
                            objectData.top = adjustedTop;
                            objectData.scaleX = (element.scaleX || 1) * multiplier;
                            objectData.scaleY = (element.scaleY || 1) * multiplier;

                            fabric.util.enlivenObjects([objectData], (objects) => {
                                if (objects && objects[0]) {
                                    printCanvas.add(objects[0]);
                                    console.log('✅ FALLBACK 3 SUCCESS: toObject/fromObject');
                                }
                            });
                        } catch (fallback3Error) {
                            console.error('❌ FALLBACK 3 FAILED:', fallback3Error);
                        }
                    }
                }

                console.groupEnd();

            } catch (error) {
                console.error('❌ ELEMENT PROCESSING FAILED:', {
                    elementIndex: designElements.indexOf(element),
                    elementType: element.type,
                    error: error,
                    message: error.message,
                    stack: error.stack
                });
                console.groupEnd();
            }
        }

        // Render all elements
        printCanvas.renderAll();

        // 🎨 CANVAS STATE AFTER
        console.group('🎨 === FINAL CANVAS STATE ===');
        console.log('🎨 CANVAS AFTER:', {
            objects: printCanvas.getObjects().length,
            lastObject: printCanvas.getObjects()[printCanvas.getObjects().length - 1],
            allObjects: printCanvas.getObjects().map(obj => ({
                type: obj.type,
                position: `${obj.left},${obj.top}`,
                visible: obj.visible
            }))
        });

        // 🖼️ CANVAS DATA VERIFICATION
        try {
            const canvasElement = printCanvas.toCanvasElement({ multiplier: 1 });
            console.log('🖼️ GENERATED CANVAS:', {
                width: canvasElement.width,
                height: canvasElement.height,
                hasData: canvasElement.toDataURL().length > 100,
                dataUrlLength: canvasElement.toDataURL().length,
                dataUrlPreview: canvasElement.toDataURL().substring(0, 100) + '...'
            });
        } catch (canvasError) {
            console.error('❌ CANVAS GENERATION FAILED:', canvasError);
        }

        console.log('🎨 HIGH-DPI PRINT ENGINE: All elements rendered on print canvas');
        console.groupEnd();
    }

    async cloneElementWithQuality(element) {
        return new Promise((resolve, reject) => {
            try {
                // Primary clone method
                element.clone((cloned) => {
                    if (cloned) {
                        resolve(cloned);
                    } else {
                        console.log('🔄 CLONE: Primary method returned null, trying fallback...');
                        this.cloneElementFallback(element).then(resolve).catch(reject);
                    }
                });
            } catch (cloneError) {
                console.log('🔄 CLONE: Primary method failed, trying fallback...', cloneError.message);
                this.cloneElementFallback(element).then(resolve).catch(reject);
            }
        });
    }

    async cloneElementFallback(element) {
        try {
            console.log('🔄 CLONE FALLBACK: Attempting enhanced metadata-preserving clone...');

            // Enhanced toObject call with comprehensive print metadata preservation
            let objectData;

            // Strategy 1: Enhanced toObject with print metadata preservation
            try {
                objectData = element.toObject();

                // ENHANCED METADATA PRESERVATION: Extract critical print properties
                const enhancedMetadata = this.extractPrintMetadata(element);
                objectData = { ...objectData, ...enhancedMetadata };

                console.log('✅ CLONE FALLBACK: Enhanced metadata-preserving toObject succeeded');
            } catch (toObjectError) {
                console.log('🔄 CLONE FALLBACK: Standard toObject failed, trying with empty array...');

                // Strategy 2: toObject with empty array
                try {
                    objectData = element.toObject([]);
                    console.log('✅ CLONE FALLBACK: toObject([]) succeeded');
                } catch (toObjectError2) {
                    console.log('🔄 CLONE FALLBACK: toObject([]) failed, using manual property extraction...');

                    // Strategy 3: Manual property extraction
                    objectData = this.extractElementProperties(element);
                    console.log('✅ CLONE FALLBACK: Manual extraction succeeded');
                }
            }

            // Create new element from object data
            return new Promise((resolve) => {
                fabric.util.enlivenObjects([objectData], (objects) => {
                    if (objects && objects[0]) {
                        console.log('✅ CLONE FALLBACK: Successfully created cloned element');
                        resolve(objects[0]);
                    } else {
                        console.log('❌ CLONE FALLBACK: enlivenObjects failed, returning original');
                        resolve(element); // Return original as last resort
                    }
                });
            });

        } catch (fallbackError) {
            console.error('❌ CLONE FALLBACK: All strategies failed', fallbackError);
            return element; // Return original element as absolute fallback
        }
    }

    extractElementProperties(element) {
        console.log('🔧 EXTRACTING PROPERTIES: Manual element property extraction...');

        const baseProps = {
            type: element.type,
            left: element.left || 0,
            top: element.top || 0,
            width: element.width || 0,
            height: element.height || 0,
            scaleX: element.scaleX || 1,
            scaleY: element.scaleY || 1,
            angle: element.angle || 0,
            opacity: element.opacity !== undefined ? element.opacity : 1,
            visible: element.visible !== undefined ? element.visible : true,
            fill: element.fill,
            stroke: element.stroke,
            strokeWidth: element.strokeWidth || 0
        };

        // Add type-specific properties
        if (element.type === 'image') {
            if (element.getSrc && typeof element.getSrc === 'function') {
                baseProps.src = element.getSrc();
            } else if (element.src) {
                baseProps.src = element.src;
            }

            if (element.crossOrigin) {
                baseProps.crossOrigin = element.crossOrigin;
            }
        }

        if (element.type === 'text' || element.type === 'textbox') {
            baseProps.text = element.text || '';
            baseProps.fontFamily = element.fontFamily || 'Arial';
            baseProps.fontSize = element.fontSize || 16;
            baseProps.fontWeight = element.fontWeight || 'normal';
            baseProps.fontStyle = element.fontStyle || 'normal';
        }

        console.log('✅ EXTRACTING PROPERTIES: Extracted', Object.keys(baseProps).length, 'properties');
        return baseProps;
    }

    /**
     * 🎯 ENHANCED METADATA EXTRACTION - Preserve critical print properties
     * Ensures that print-specific data survives the clone fallback process
     */
    extractPrintMetadata(element) {
        const printMetadata = {};

        try {
            // 🎯 CRITICAL PRINT PROPERTIES
            const criticalProps = [
                'printScale', 'dpi', 'customId', 'printAreaX', 'printAreaY',
                'originalImageSrc', 'printQuality', 'bleedSettings',
                'colorProfile', 'templateId', 'designId', 'printOrder',
                'fabricType', 'materialSettings', 'cutLines', 'safeZone'
            ];

            criticalProps.forEach(prop => {
                if (element[prop] !== undefined && element[prop] !== null) {
                    printMetadata[prop] = element[prop];
                }
            });

            // 🎯 FABRIC CANVAS SPECIFIC PROPERTIES
            if (element._originalElement) {
                printMetadata._originalElement = element._originalElement;
            }
            if (element._element) {
                printMetadata._element = element._element;
            }

            // 🎯 IMAGE QUALITY PRESERVATION
            if (element.type === 'image') {
                if (element.src) printMetadata.originalSrc = element.src;
                if (element.crossOrigin) printMetadata.crossOrigin = element.crossOrigin;
                if (element.filters) printMetadata.filters = element.filters;
            }

            // 🎯 TEXT ENHANCEMENT PROPERTIES
            if (element.type === 'text' || element.type === 'i-text') {
                if (element.fontWeight) printMetadata.fontWeight = element.fontWeight;
                if (element.textAlign) printMetadata.textAlign = element.textAlign;
                if (element.lineHeight) printMetadata.lineHeight = element.lineHeight;
                if (element.charSpacing) printMetadata.charSpacing = element.charSpacing;
            }

            // 🎯 TRANSFORMATION PRESERVATION
            if (element.matrix) printMetadata.matrix = element.matrix;
            if (element.transformMatrix) printMetadata.transformMatrix = element.transformMatrix;

            console.log(`🎯 METADATA EXTRACTION: Preserved ${Object.keys(printMetadata).length} critical print properties`);

            return printMetadata;

        } catch (error) {
            console.warn('⚠️ METADATA EXTRACTION: Error extracting print metadata:', error);
            return {};
        }
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