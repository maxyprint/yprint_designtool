/**
 * 🖼️ YPRINT PNG EXPORT PLUGIN v1.0
 * CLEAN ARCHITECTURE: Zero Core-Designer modification
 *
 * PURPOSE: High-DPI PNG export functionality
 * SECURITY: Sandboxed plugin execution with Designer API only
 */

(function() {
    'use strict';

    console.log('🖼️ PNG EXPORT PLUGIN: Loading...');

    /**
     * YPrint PNG Export Plugin
     * Provides multi-resolution PNG export without modifying Core-Designer
     */
    window.YPrintPNGPlugin = {
        // Plugin metadata
        name: 'yprint-png-export',
        version: '1.0.0',
        description: 'High-DPI PNG export functionality for YPrint Designer',

        // Plugin state
        canvas: null,
        eventBus: null,
        initialized: false,

        /**
         * Plugin initialization via Designer API
         */
        initialize(designerAPI) {
            console.log('🖼️ PNG PLUGIN: Initializing with Designer API...');

            try {
                // Get safe access to canvas
                this.canvas = designerAPI.getCanvas();
                this.eventBus = designerAPI.getEventBus();

                // Validate canvas access
                if (!this.canvas) {
                    console.warn('⚠️ PNG PLUGIN: Canvas not available - Designer not ready');
                    return false;
                }

                // Add PNG export menu item to UI
                designerAPI.addMenuItem('Export PNG', () => {
                    this.exportPNG();
                });

                // Listen for designer events
                this.eventBus.addEventListener('designer:canvas-updated', () => {
                    console.log('🖼️ PNG PLUGIN: Canvas updated, ready for export');
                });

                this.initialized = true;
                console.log('✅ PNG PLUGIN: Initialized successfully - zero Core modification');

                return true;

            } catch (error) {
                console.error('❌ PNG PLUGIN: Initialization failed:', error);
                return false;
            }
        },

        /**
         * Export canvas as multi-resolution PNG
         * Returns PNG data at different resolutions for different use cases
         */
        async exportMultiResolutionPNG(canvas = null) {
            console.log('🖼️ PNG PLUGIN: Starting multi-resolution PNG export...');

            try {
                // Use provided canvas or plugin's canvas
                const targetCanvas = canvas || this.canvas;

                if (!targetCanvas) {
                    throw new Error('No canvas available for PNG export');
                }

                // Validate canvas has content
                if (!targetCanvas.getObjects || targetCanvas.getObjects().length === 0) {
                    console.warn('⚠️ PNG PLUGIN: Canvas appears to be empty');
                }

                // Export at different resolutions
                const exports = {
                    // High-DPI for print (300 DPI equivalent)
                    print: this.exportCanvasAtResolution(targetCanvas, 3.125),

                    // Standard resolution for web preview
                    preview: this.exportCanvasAtResolution(targetCanvas, 1.0),

                    // Thumbnail for admin/gallery
                    thumbnail: this.exportCanvasAtResolution(targetCanvas, 0.5)
                };

                console.log('✅ PNG PLUGIN: Multi-resolution export complete');

                // Fire export event
                if (this.eventBus) {
                    this.eventBus.dispatchEvent(new CustomEvent('png:exported', {
                        detail: {
                            exports: exports,
                            timestamp: Date.now()
                        }
                    }));
                }

                return exports;

            } catch (error) {
                console.error('❌ PNG PLUGIN: Export failed:', error);
                throw error;
            }
        },

        /**
         * Export canvas at specific resolution multiplier
         */
        exportCanvasAtResolution(canvas, multiplier) {
            try {
                // Use Fabric.js toDataURL with multiplier for high-DPI
                const dataURL = canvas.toDataURL({
                    format: 'png',
                    quality: 1.0,
                    multiplier: multiplier,
                    enableRetinaScaling: true
                });

                console.log(`🖼️ PNG PLUGIN: Exported at ${multiplier}x resolution`);
                return dataURL;

            } catch (error) {
                console.error(`❌ PNG PLUGIN: Failed to export at ${multiplier}x:`, error);
                throw error;
            }
        },

        /**
         * Quick PNG export for UI button
         */
        async exportPNG() {
            try {
                console.log('🖼️ PNG PLUGIN: Quick PNG export triggered...');

                const result = await this.exportMultiResolutionPNG();

                if (result && result.preview) {
                    // Create download link for preview resolution
                    this.downloadPNG(result.preview, 'yprint-design.png');

                    console.log('✅ PNG PLUGIN: PNG download initiated');
                    return result;
                } else {
                    throw new Error('PNG export returned invalid result');
                }

            } catch (error) {
                console.error('❌ PNG PLUGIN: Quick export failed:', error);
                alert('PNG Export failed: ' + error.message);
            }
        },

        /**
         * Download PNG data as file
         */
        downloadPNG(dataURL, filename) {
            try {
                const link = document.createElement('a');
                link.download = filename;
                link.href = dataURL;

                // Trigger download
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);

                console.log(`✅ PNG PLUGIN: Download triggered for ${filename}`);

            } catch (error) {
                console.error('❌ PNG PLUGIN: Download failed:', error);
                throw error;
            }
        },

        /**
         * Plugin cleanup method
         */
        destroy() {
            console.log('🖼️ PNG PLUGIN: Cleaning up...');

            this.canvas = null;
            this.eventBus = null;
            this.initialized = false;

            console.log('✅ PNG PLUGIN: Cleanup complete');
        },

        /**
         * Get plugin status
         */
        getStatus() {
            return {
                name: this.name,
                version: this.version,
                initialized: this.initialized,
                hasCanvas: !!this.canvas,
                timestamp: Date.now()
            };
        }
    };

    // Auto-register with plugin framework if available
    if (window.YPrintPlugins && typeof window.YPrintPlugins.register === 'function') {
        const registered = window.YPrintPlugins.register('yprint-png-export', window.YPrintPNGPlugin);

        if (registered) {
            console.log('✅ PNG PLUGIN: Auto-registered with Plugin Framework');

            // Auto-initialize if framework supports it
            if (typeof window.YPrintPlugins.initializePlugin === 'function') {
                setTimeout(() => {
                    window.YPrintPlugins.initializePlugin('yprint-png-export');
                }, 100);
            }
        } else {
            console.warn('⚠️ PNG PLUGIN: Auto-registration failed');
        }
    } else {
        console.warn('⚠️ PNG PLUGIN: Plugin Framework not available for auto-registration');
    }

    console.log('🖼️ YPRINT PNG EXPORT PLUGIN: Loaded successfully');

})();