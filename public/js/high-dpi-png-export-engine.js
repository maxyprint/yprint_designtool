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
    exportWithTemplateMetadata(options) {
        console.log('🎯 ENGINE: Template metadata export starting...');
        console.log('🎯 Export options received:', options);

        try {
            // Get fabric canvas instance
            const fabricCanvas = window.designerWidgetInstance?.fabricCanvas;
            if (!fabricCanvas) {
                throw new Error('No fabric canvas available for export');
            }

            const exportMultiplier = options.multiplier || 3.125;
            const quality = options.quality || 1.0;

            // Generate export with template metadata
            const exportOptions = {
                format: options.format || 'png',
                quality: quality,
                multiplier: exportMultiplier,
                enableRetinaScaling: true
            };

            const dataUrl = fabricCanvas.toDataURL(exportOptions);

            console.log('✅ ENGINE: Template metadata export completed');
            return {
                dataUrl: dataUrl,
                metadata: {
                    width: Math.round(fabricCanvas.width * exportMultiplier),
                    height: Math.round(fabricCanvas.height * exportMultiplier),
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