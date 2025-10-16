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
            if (window.fabric && window.YPrint?.fabric?.isReady()) {
                resolve();
            } else {
                window.addEventListener('yprintSystemReady', resolve, { once: true });
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

            // Get fabric canvas
            const fabricCanvas = this.getFabricCanvas();
            if (!fabricCanvas) {
                throw new Error('Fabric canvas not available');
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

        // Get only the design elements (no background)
        const designElements = this.getDesignElementsOnly(fabricCanvas);

        if (designElements.length === 0) {
            console.warn('⚠️ HIGH-DPI PRINT ENGINE: No design elements found');
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
        // Get all objects but filter out backgrounds and view elements
        const allObjects = fabricCanvas.getObjects();

        return allObjects.filter(obj => {
            // Skip background images (usually large, positioned at 0,0)
            if (obj.type === 'image' && obj.left === 0 && obj.top === 0) {
                const canvasWidth = fabricCanvas.getWidth();
                const canvasHeight = fabricCanvas.getHeight();

                // Skip if image covers most of the canvas (likely background)
                if (obj.width >= canvasWidth * 0.8 && obj.height >= canvasHeight * 0.8) {
                    console.log('🚫 HIGH-DPI PRINT ENGINE: Skipping background image:', obj);
                    return false;
                }
            }

            // Skip elements marked as background
            if (obj.isBackground || obj.excludeFromExport) {
                console.log('🚫 HIGH-DPI PRINT ENGINE: Skipping marked background element:', obj);
                return false;
            }

            // Include all other design elements
            console.log('✅ HIGH-DPI PRINT ENGINE: Including design element:', obj.type, obj);
            return true;
        });
    }

    createPrintAreaCanvas(multiplier) {
        const { width, height } = this.printAreaPx;
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

    async addElementsToPrintCanvas(printCanvas, designElements, multiplier) {
        console.log(`🎨 HIGH-DPI PRINT ENGINE: Adding ${designElements.length} elements to print canvas...`);

        const { x: printOffsetX, y: printOffsetY } = this.printAreaPx;

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
        const scaledWidth = Math.round(width * multiplier);
        const scaledHeight = Math.round(height * multiplier);

        // Create transparent PNG
        const canvas = document.createElement('canvas');
        canvas.width = scaledWidth;
        canvas.height = scaledHeight;

        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, scaledWidth, scaledHeight);

        return canvas.toDataURL('image/png');
    }

    getFabricCanvas() {
        // Multiple methods to get fabric canvas

        // 1. From YPrint unified API
        if (window.YPrint?.designer?.getCanvas) {
            return window.YPrint.designer.getCanvas();
        }

        // 2. From global designer widget
        if (window.designerWidgetInstance?.fabricCanvas) {
            return window.designerWidgetInstance.fabricCanvas;
        }

        // 3. From fabric canvas global
        if (window.fabricCanvas) {
            return window.fabricCanvas;
        }

        // 4. From canvas element
        const canvasElement = document.getElementById('octo-print-designer-canvas');
        if (canvasElement && canvasElement.__fabric) {
            return canvasElement.__fabric;
        }

        console.error('❌ HIGH-DPI PRINT ENGINE: No fabric canvas found');
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
        return this.exportPrintReadyPNG(options);
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

    dispose() {
        console.log('🧹 HIGH-DPI PRINT ENGINE: Disposing...');

        this.initialized = false;
        delete window.highDPIPrintExportEngine;

        console.log('✅ HIGH-DPI PRINT ENGINE: Disposed');
    }
}

// Auto-initialize when fabric is ready
console.log('🖨️ HIGH-DPI PRINT ENGINE: Auto-initializing...');

if (window.YPrint?.fabric?.isReady()) {
    window.highDPIPrintExportEngine = new HighDPIPrintExportEngine();
} else {
    window.addEventListener('yprintSystemReady', () => {
        window.highDPIPrintExportEngine = new HighDPIPrintExportEngine();
    });
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = HighDPIPrintExportEngine;
}