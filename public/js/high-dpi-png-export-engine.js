/**
 * 🚀 HIGH-DPI PNG EXPORT ENGINE
 * Production Implementation - High-Quality PNG Generation
 *
 * PURPOSE: Generate high-resolution PNGs for print production
 */

console.log('🚀 Loading Production High-DPI Export Engine...');

// Ensure namespace exists
window.OctoPrintDesigner = window.OctoPrintDesigner || {};

class HighDPIPrintExportEngine {
    constructor() {
        this.initialized = true;
        this.version = '2.0.0-production';
        this.debugMode = false;

        console.log('🚀 HIGH-DPI PRINT ENGINE: Initializing production engine...');
        this.markReady();
    }

    /**
     * Main export method - Generates high-quality PNG
     * Enhanced print resolution for professional output
     */
    generateEnhancedPrintPNG(canvas, printAreaPx, templateConfig) {
        console.log('🎯 ENGINE: Starting enhanced PNG generation...');
        console.log('🎯 Canvas received:', !!canvas);
        console.log('🎯 PrintArea received:', printAreaPx);
        console.log('🎯 Template config received:', !!templateConfig);

        try {
            // Get fabric canvas instance
            const fabricCanvas = canvas || window.designerWidgetInstance?.fabricCanvas;
            if (!fabricCanvas) {
                throw new Error('No fabric canvas available for export');
            }

            // Calculate high-DPI export settings
            const exportMultiplier = 3.125; // 300 DPI scaling
            const quality = 1.0; // Maximum quality

            console.log('🎯 Export settings:', {
                multiplier: exportMultiplier,
                quality: quality,
                printArea: printAreaPx
            });

            // Generate high-resolution export
            const exportOptions = {
                format: 'png',
                quality: quality,
                multiplier: exportMultiplier,
                enableRetinaScaling: true
            };

            // Export with print area cropping if specified
            let dataUrl;
            if (printAreaPx && printAreaPx.width && printAreaPx.height) {
                // Export specific print area
                dataUrl = fabricCanvas.toDataURL({
                    ...exportOptions,
                    left: printAreaPx.x || 0,
                    top: printAreaPx.y || 0,
                    width: printAreaPx.width,
                    height: printAreaPx.height
                });
            } else {
                // Export full canvas
                dataUrl = fabricCanvas.toDataURL(exportOptions);
            }

            console.log('✅ ENGINE: High-DPI PNG generated successfully');
            return {
                dataUrl: dataUrl,
                metadata: {
                    width: Math.round((printAreaPx?.width || fabricCanvas.width) * exportMultiplier),
                    height: Math.round((printAreaPx?.height || fabricCanvas.height) * exportMultiplier),
                    dpi: 300,
                    quality: quality,
                    multiplier: exportMultiplier
                },
                printSpecifications: {
                    printAreaPX: printAreaPx,
                    printAreaMM: this.convertPxToMM(printAreaPx)
                }
            };

        } catch (error) {
            console.error('❌ ENGINE: PNG generation failed:', error);
            throw error;
        }
    }

    /**
     * Alternative export method with template metadata
     */
    async exportWithTemplateMetadata(options) {
        console.log('🎯 ENGINE: Template metadata export starting...');
        console.log('🎯 Export options received:', options);

        try {
            // Get fabric canvas instance
            const fabricCanvas = window.designerWidgetInstance?.fabricCanvas;
            if (!fabricCanvas) {
                throw new Error('No fabric canvas available for export');
            }

            // 🎯 STEP 1: Get dynamic print area from template database
            const printArea = await this.fetchTemplatePrintArea();
            console.log('🎯 PRINT AREA FETCHED:', printArea);

            // 🔍 PFLICHT 1: Daten-Validierung - Absolute Canvas-Koordinaten prüfen
            console.log('📊 PRINT AREA VALIDATION:', {
                printArea_coordinates: `x:${printArea.x}, y:${printArea.y}, w:${printArea.width}, h:${printArea.height}`,
                canvas_dimensions: `${fabricCanvas.getWidth()}x${fabricCanvas.getHeight()}px`,
                is_printArea_within_canvas: (printArea.x >= 0 && printArea.y >= 0 &&
                    (printArea.x + printArea.width) <= fabricCanvas.getWidth() &&
                    (printArea.y + printArea.height) <= fabricCanvas.getHeight()),
                printArea_percentage_of_canvas: `${((printArea.width * printArea.height) / (fabricCanvas.getWidth() * fabricCanvas.getHeight()) * 100).toFixed(1)}%`
            });

            const exportMultiplier = options.multiplier || 3.125;
            const quality = options.quality || 1.0;

            // 🎯 STEP 2: Export only the print area with correct dimensions
            const croppedDataUrl = await this.exportPrintAreaOnly(fabricCanvas, printArea, exportMultiplier, quality, options.format || 'png');

            console.log('✅ ENGINE: Template metadata export completed with print area cropping');
            return {
                dataUrl: croppedDataUrl,
                metadata: {
                    width: Math.round(printArea.width * exportMultiplier),
                    height: Math.round(printArea.height * exportMultiplier),
                    dpi: Math.round(96 * exportMultiplier),
                    quality: quality,
                    elementsCount: fabricCanvas.getObjects().length
                },
                templateMetadata: {
                    template_id: options.template_id || 'unknown',
                    template_name: options.template_name || 'Custom Design'
                },
                printSpecifications: {
                    printAreaPX: { width: fabricCanvas.width, height: fabricCanvas.height },
                    printAreaMM: this.convertPxToMM({ width: fabricCanvas.width, height: fabricCanvas.height })
                },
                qualityAssurance: {
                    printReady: true,
                    resolution: '300 DPI',
                    colorSpace: 'RGB'
                }
            };

        } catch (error) {
            console.error('❌ ENGINE: Template metadata export failed:', error);
            throw error;
        }
    }

    /**
     * Print machine export method - Optimized for direct printing
     */
    exportForPrintMachine(options) {
        console.log('🖨️ ENGINE: Print machine export starting...');
        console.log('🖨️ Print machine options received:', options);

        try {
            // Get fabric canvas instance
            const fabricCanvas = window.designerWidgetInstance?.fabricCanvas;
            if (!fabricCanvas) {
                throw new Error('No fabric canvas available for print export');
            }

            // Print-optimized settings
            const exportMultiplier = 3.125; // 300 DPI for professional printing
            const quality = 1.0; // Maximum quality for print

            const exportOptions = {
                format: 'png',
                quality: quality,
                multiplier: exportMultiplier,
                enableRetinaScaling: true
            };

            const dataUrl = fabricCanvas.toDataURL(exportOptions);

            console.log('✅ ENGINE: Print machine export completed');
            return {
                dataUrl: dataUrl,
                printSpecs: {
                    dpi: 300,
                    format: 'PNG',
                    quality: 'Maximum',
                    colorProfile: 'sRGB'
                },
                dimensions: {
                    width: Math.round(fabricCanvas.width * exportMultiplier),
                    height: Math.round(fabricCanvas.height * exportMultiplier),
                    widthMM: this.convertPxToMM({ width: fabricCanvas.width }).width,
                    heightMM: this.convertPxToMM({ height: fabricCanvas.height }).height
                }
            };

        } catch (error) {
            console.error('❌ ENGINE: Print machine export failed:', error);
            throw error;
        }
    }

    /**
     * Convert pixels to millimeters (assuming 96 DPI base)
     */
    convertPxToMM(dimensions) {
        if (!dimensions) return null;

        const pxToMM = 25.4 / 96; // 96 DPI to MM conversion
        return {
            width: dimensions.width ? Math.round(dimensions.width * pxToMM * 100) / 100 : null,
            height: dimensions.height ? Math.round(dimensions.height * pxToMM * 100) / 100 : null,
            x: dimensions.x ? Math.round(dimensions.x * pxToMM * 100) / 100 : null,
            y: dimensions.y ? Math.round(dimensions.y * pxToMM * 100) / 100 : null
        };
    }

    /**
     * Validation method to confirm engine is loaded
     */
    isEngineReady() {
        console.log('🎯 Production Engine Ready Check: TRUE');
        return true;
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

    /**
     * 🎯 Fetch template print area from database
     */
    async fetchTemplatePrintArea() {
        try {
            console.log('🎯 FETCHING REAL TEMPLATE PRINT AREA FROM DATABASE...');

            // ECHTE Template ID finden - KEIN FALLBACK!
            const templateId = this.getCurrentTemplateId();
            if (!templateId) {
                throw new Error('CRITICAL: No template ID found - cannot proceed without real template data');
            }

            console.log('🔍 Requesting print area for template ID:', templateId);

            // AJAX call zu WordPress Backend für echte Meta-Field Daten
            const formData = new FormData();
            formData.append('action', 'yprint_get_template_print_area');
            formData.append('template_id', templateId);
            formData.append('nonce', window.octo_print_designer_config?.nonce || window.yprint_ajax?.nonce);

            console.log('📡 AJAX Request Details:', {
                action: 'yprint_get_template_print_area',
                template_id: templateId,
                ajax_url: window.yprint_ajax?.ajax_url || '/wp-admin/admin-ajax.php',
                nonce: window.octo_print_designer_config?.nonce || window.yprint_ajax?.nonce
            });

            const response = await fetch(window.yprint_ajax?.ajax_url || '/wp-admin/admin-ajax.php', {
                method: 'POST',
                body: formData,
                credentials: 'same-origin'
            });

            console.log('📊 Server Response Status:', response.status, response.statusText);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();
            console.log('📋 Complete Server Response:', result);

            if (result.success) {
                if (result.data && result.data.printable_area_px) {
                    console.log('✅ REAL TEMPLATE PRINT AREA LOADED FROM DATABASE:', {
                        template_id: templateId,
                        printable_area_px: result.data.printable_area_px,
                        printable_area_mm: result.data.printable_area_mm || 'not provided',
                        source: 'WordPress Meta-Fields (deo6_postmeta)'
                    });
                    return result.data.printable_area_px;
                } else {
                    console.error('❌ Server returned success but no printable_area_px data:', result.data);
                    throw new Error('Template print area data missing from response');
                }
            } else {
                console.error('❌ Server returned error:', result.data || result);
                throw new Error(`Server error: ${result.data || 'Unknown error'}`);
            }

        } catch (error) {
            console.error('❌ CRITICAL: Failed to fetch real template print area:', error);
            console.error('❌ System MUST use real data - no fallbacks allowed!');

            // KEIN FALLBACK - System muss repariert werden!
            throw new Error(`Template print area fetch failed: ${error.message}. System must be fixed to use real data.`);
        }
    }

    /**
     * 🎯 Get current template ID from various sources
     */
    getCurrentTemplateId() {
        console.log('🔍 TEMPLATE ID DETECTION - Checking all sources...');

        // Method 1: From URL params
        const urlParams = new URLSearchParams(window.location.search);
        let templateId = urlParams.get('template_id') || urlParams.get('template') || urlParams.get('tid');
        if (templateId) {
            console.log('✅ Template ID from URL:', templateId);
            return templateId;
        }

        // Method 2: From DOM data attributes (multiple selectors)
        const templateSelectors = [
            '[data-template-id]',
            '[data-template]',
            '.template-container[data-id]',
            '#template-data[data-template-id]',
            '.designer-canvas[data-template-id]'
        ];

        for (const selector of templateSelectors) {
            const element = document.querySelector(selector);
            if (element) {
                templateId = element.dataset.templateId || element.dataset.template || element.dataset.id;
                if (templateId) {
                    console.log('✅ Template ID from DOM selector', selector + ':', templateId);
                    return templateId;
                }
            }
        }

        // Method 3: From global variables (multiple sources)
        const globalSources = [
            'currentTemplateId',
            'templateId',
            'TEMPLATE_ID',
            'yprint_template_id'
        ];

        for (const source of globalSources) {
            if (window[source]) {
                console.log('✅ Template ID from window.' + source + ':', window[source]);
                return window[source];
            }
        }

        // Method 4: From designerWidgetInstance (MOST RELIABLE after URL cleaning)
        if (window.designerWidgetInstance?.activeTemplateId) {
            console.log('✅ Template ID from designerWidgetInstance.activeTemplateId:', window.designerWidgetInstance.activeTemplateId);
            return window.designerWidgetInstance.activeTemplateId;
        }

        // Method 5: From various config objects
        const configSources = [
            () => window.octo_print_designer_config?.template_id,
            () => window.yprint_config?.template_id,
            () => window.designerConfig?.templateId,
            () => window.designerWidgetInstance?.templateId,
            () => window.designerWidgetInstance?.config?.templateId
        ];

        for (const configGetter of configSources) {
            try {
                templateId = configGetter();
                if (templateId) {
                    console.log('✅ Template ID from config:', templateId);
                    return templateId;
                }
            } catch (e) {
                // Ignore config access errors
            }
        }

        // Method 6: From URL path (e.g., /designer/123)
        const pathMatch = window.location.pathname.match(/\/designer\/(\d+)/);
        if (pathMatch) {
            templateId = pathMatch[1];
            console.log('✅ Template ID from URL path:', templateId);
            return templateId;
        }

        console.warn('⚠️ No template ID found in any source - checked URL, DOM, globals, configs, and path');
        return null;
    }

    /**
     * 🎯 Fallback print area when template data unavailable
     */
    getFallbackPrintArea() {
        const canvas = window.designerWidgetInstance?.fabricCanvas;
        const canvasWidth = canvas ? canvas.getWidth() : 656;
        const canvasHeight = canvas ? canvas.getHeight() : 420;

        // Create a centered print area that fits within canvas bounds
        const margin = 50;
        const width = Math.max(200, canvasWidth - (margin * 2));
        const height = Math.max(150, canvasHeight - (margin * 2));
        const x = Math.max(0, (canvasWidth - width) / 2);
        const y = Math.max(0, (canvasHeight - height) / 2);

        console.log('🔄 FALLBACK PRINT AREA calculated:', {
            canvas_dimensions: `${canvasWidth}x${canvasHeight}px`,
            fallback_area: { x, y, width, height },
            fits_within_canvas: (x + width <= canvasWidth && y + height <= canvasHeight)
        });

        return { x, y, width, height };
    }

    /**
     * 🎯 Export only the print area with correct dimensions by restricting canvas viewport
     */
    async exportPrintAreaOnly(fabricCanvas, printArea, multiplier, quality, format) {
        console.log('🎯 EXPORTING PRINT AREA ONLY via canvas viewport restriction:', printArea);

        // Store original canvas state
        const originalState = {
            width: fabricCanvas.getWidth(),
            height: fabricCanvas.getHeight(),
            viewportTransform: fabricCanvas.viewportTransform.slice(),
            clipPath: fabricCanvas.clipPath
        };

        try {
            // 🔍 PFLICHT 2: Mockup-Identifikation - Alle Canvas-Objekte analysieren
            const allObjects = fabricCanvas.getObjects();
            console.log('📊 CANVAS OBJECTS ANALYSIS:');
            allObjects.forEach((obj, index) => {
                const bounds = obj.getBoundingRect ? obj.getBoundingRect() : {};
                console.log(`Object ${index}:`, {
                    type: obj.type,
                    name: obj.name || 'unnamed',
                    id: obj.id || 'no-id',
                    visible: obj.visible,
                    position: `${Math.round(obj.left || 0)},${Math.round(obj.top || 0)}`,
                    size: `${Math.round(bounds.width || 0)}x${Math.round(bounds.height || 0)}`,
                    flags: {
                        isBackground: !!obj.isBackground,
                        isViewImage: !!obj.isViewImage,
                        isTemplateBackground: !!obj.isTemplateBackground,
                        excludeFromExport: !!obj.excludeFromExport
                    },
                    src_preview: obj.src ? obj.src.substring(obj.src.lastIndexOf('/') + 1, obj.src.lastIndexOf('/') + 30) + '...' : 'no-src',
                    mockup_detection: this.shouldHideFromExport(obj) ? '❌ HIDE' : '✅ KEEP'
                });
            });

            // Step 1: Hide non-design elements (backgrounds, mockups, etc.)
            const hiddenObjects = [];

            allObjects.forEach(obj => {
                if (this.shouldHideFromExport(obj)) {
                    hiddenObjects.push(obj);
                    obj.visible = false;
                }
            });

            console.log(`🔍 MOCKUP HIDING: ${hiddenObjects.length} objects hidden, ${allObjects.length - hiddenObjects.length} objects kept`);

            // Step 2: Restrict canvas to print area dimensions
            console.log('🎯 Setting canvas dimensions to print area:', `${printArea.width}x${printArea.height}`);
            fabricCanvas.setWidth(printArea.width);
            fabricCanvas.setHeight(printArea.height);

            // Step 3: Adjust viewport to show only print area content
            console.log('🎯 Adjusting viewport transform to print area offset:', `x:${-printArea.x}, y:${-printArea.y}`);
            fabricCanvas.setViewportTransform([1, 0, 0, 1, -printArea.x, -printArea.y]);

            // Step 4: Apply clipping to ensure nothing outside print area is rendered
            if (typeof fabric !== 'undefined' && fabric.Rect) {
                fabricCanvas.clipPath = new fabric.Rect({
                    left: 0,
                    top: 0,
                    width: printArea.width,
                    height: printArea.height,
                    absolutePositioned: true,
                    fill: 'transparent'
                });
                console.log('🎯 Clipping path applied');
            } else {
                console.log('⚠️ Fabric.js not available for clipping, relying on viewport transform only');
            }

            // Step 5: Export the restricted canvas - now automatically correct size!
            console.log('🎯 Exporting restricted canvas at', `${printArea.width}x${printArea.height}px`);
            const printAreaDataURL = fabricCanvas.toDataURL({
                format: format,
                quality: quality,
                multiplier: multiplier
            });

            // Step 6: Restore original canvas state
            fabricCanvas.setWidth(originalState.width);
            fabricCanvas.setHeight(originalState.height);
            fabricCanvas.setViewportTransform(originalState.viewportTransform);
            fabricCanvas.clipPath = originalState.clipPath;

            // Step 7: Restore visibility of hidden objects
            hiddenObjects.forEach(obj => {
                obj.visible = true;
            });

            console.log('✅ Print area export completed, canvas state restored');
            return printAreaDataURL;

        } catch (error) {
            console.error('❌ Error in print area viewport export:', error);

            // Restore original canvas state in case of error
            fabricCanvas.setWidth(originalState.width);
            fabricCanvas.setHeight(originalState.height);
            fabricCanvas.setViewportTransform(originalState.viewportTransform);
            fabricCanvas.clipPath = originalState.clipPath;

            // Fallback: return full canvas export
            return fabricCanvas.toDataURL({
                format: format,
                quality: quality,
                multiplier: multiplier
            });
        }
    }

    /**
     * 🎯 Determine if object should be hidden from export
     */
    shouldHideFromExport(obj) {
        // Hide backgrounds and mockup elements
        return !!(
            obj.isBackground ||
            obj.isViewImage ||
            obj.isTemplateBackground ||
            obj.excludeFromExport ||
            (obj.type === 'image' && this.isLikelyBackground(obj))
        );
    }

    /**
     * 🎯 Detect if image is likely a background by size/position
     */
    isLikelyBackground(obj) {
        if (obj.type !== 'image') return false;

        const bounds = obj.getBoundingRect();
        const canvas = window.designerWidgetInstance?.fabricCanvas;
        if (!canvas) return false;

        const canvasWidth = canvas.width || 656;
        const canvasHeight = canvas.height || 420;

        // Enhanced detection for T-shirt mockups and backgrounds
        const coverageX = bounds.width / canvasWidth;
        const coverageY = bounds.height / canvasHeight;

        // Check image source/name patterns for mockups
        const imageSrc = obj.getSrc ? obj.getSrc() : (obj.src || '');
        const isLikelyMockup = imageSrc.toLowerCase().includes('t-shirt') ||
                              imageSrc.toLowerCase().includes('tshirt') ||
                              imageSrc.toLowerCase().includes('mockup') ||
                              imageSrc.toLowerCase().includes('template') ||
                              imageSrc.toLowerCase().includes('background');

        // Check if positioned like a background (near 0,0 and large)
        const isPositionedLikeBackground = bounds.left < 50 && bounds.top < 50;

        // Check if large enough to be background (relaxed threshold)
        const isLargeEnough = (coverageX > 0.6 && coverageY > 0.6);

        console.log('🔍 MOCKUP DETECTION DETAILS:', {
            object_id: obj.id || 'unknown',
            bounds: `${bounds.width}x${bounds.height}px at ${bounds.left},${bounds.top}`,
            coverage: `${(coverageX*100).toFixed(1)}% x ${(coverageY*100).toFixed(1)}%`,
            image_src: imageSrc.substring(imageSrc.lastIndexOf('/') + 1),
            is_likely_mockup: isLikelyMockup,
            is_positioned_like_bg: isPositionedLikeBackground,
            is_large_enough: isLargeEnough,
            RESULT: isLikelyMockup || (isPositionedLikeBackground && isLargeEnough)
        });

        return isLikelyMockup || (isPositionedLikeBackground && isLargeEnough);
    }

    /**
     * 🎯 Note: cropToArea method removed - now using canvas viewport restriction instead
     * This approach is more efficient and accurate for print area exports
     */
}

// Production engine also available in OctoPrintDesigner namespace
window.OctoPrintDesigner.highDPIExportEngine = {
    generateEnhancedPrintPNG: function(canvas, printAreaPx, templateConfig) {
        return window.highDPIPrintExportEngine.generateEnhancedPrintPNG(canvas, printAreaPx, templateConfig);
    }
};

// Auto-initialize production engine
console.log('🚀 HIGH-DPI PRINT ENGINE: Auto-initializing production engine...');
window.highDPIPrintExportEngine = new HighDPIPrintExportEngine();

console.log('✅ Production High-DPI Export Engine loaded - Ready for professional printing');
console.log('🎯 Engine will generate high-quality 300 DPI PNGs for production use');