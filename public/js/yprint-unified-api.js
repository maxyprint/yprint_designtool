/**
 * 🚀 YPRINT UNIFIED API - Complete Legacy Replacement
 * Single, clean API that replaces ALL legacy systems
 *
 * REPLACES COMPLETELY:
 * - optimized-design-data-capture.js (paradox detection)
 * - enhanced-json-coordinate-system.js (coordinate capture)
 * - safezone-coordinate-validator.js (validation)
 * - All canvas initialization controllers
 * - All fabric detection systems
 * - All coordinate logging systems
 */

class YPrintUnifiedAPI {
    constructor() {
        this.version = '2.0.0-core-rebuild';
        this.initialized = false;
        this.designerWidget = null;
        this.fabricCore = null;

        console.log('🚀 YPRINT UNIFIED API: Starting complete system replacement...');
        this.initialize();
    }

    async initialize() {
        try {
            // Wait for core systems
            await this.waitForCoreSystems();

            // Initialize unified API
            this.initializeAPI();

            // Set up design data handling
            this.initializeDesignDataHandling();

            // Set up coordinate system
            this.initializeCoordinateSystem();

            // Set up WordPress integration
            this.initializeWordPressIntegration();

            // Mark as ready
            this.markSystemReady();

            console.log('✅ YPRINT UNIFIED API: Complete system replacement active');

        } catch (error) {
            console.error('❌ YPRINT UNIFIED API: Initialization failed:', error);
            throw error;
        }
    }

    async waitForCoreSystems() {
        // Wait for both core systems to be ready
        return Promise.all([
            this.waitForUnifiedFabric(),
            this.waitForDesignerWidget()
        ]);
    }

    async waitForUnifiedFabric() {
        return new Promise((resolve) => {
            if (window.unifiedFabricCore && window.unifiedFabricCore.initialized) {
                this.fabricCore = window.unifiedFabricCore;
                resolve();
            } else {
                window.addEventListener('unifiedFabricReady', () => {
                    this.fabricCore = window.unifiedFabricCore;
                    resolve();
                }, { once: true });
            }
        });
    }

    async waitForDesignerWidget() {
        return new Promise((resolve) => {
            if (window.designerWidgetCore && window.designerWidgetCore.initialized) {
                this.designerWidget = window.designerWidgetCore;
                resolve();
            } else {
                window.addEventListener('designerWidgetReady', () => {
                    this.designerWidget = window.designerWidgetCore;
                    resolve();
                }, { once: true });
            }
        });
    }

    initializeAPI() {
        console.log('🎯 YPRINT UNIFIED API: Initializing clean API...');

        // Create unified API object
        this.api = {
            // Fabric Management
            fabric: {
                isReady: () => this.fabricCore.fabricReady,
                getCore: () => this.fabricCore,
                createCanvas: (elementId, options) => this.fabricCore.createCanvas(elementId, options),
                getCanvas: (elementId) => this.fabricCore.getCanvas(elementId)
            },

            // Designer Management
            designer: {
                isReady: () => this.designerWidget.initialized,
                getInstance: () => this.designerWidget,
                getCanvas: () => this.designerWidget.fabricCanvas,
                addElement: (type, options) => this.designerWidget.addElement(type, options),
                removeElement: (id) => this.designerWidget.removeElement(id)
            },

            // Design Data Management
            design: {
                save: () => this.saveDesign(),
                load: (data) => this.loadDesign(data),
                export: (format) => this.exportDesign(format),
                getData: () => this.getDesignData(),
                getCoordinates: () => this.getCoordinates(),
                validate: () => this.validateDesign()
            },

            // System Status
            system: {
                getStatus: () => this.getSystemStatus(),
                isReady: () => this.initialized,
                getVersion: () => this.version,
                runDiagnostics: () => this.runDiagnostics()
            }
        };

        // Expose globally
        window.YPrint = this.api;
        window.yprintAPI = this.api; // Alternative name

        console.log('✅ YPRINT UNIFIED API: Clean API exposed globally');
    }

    initializeDesignDataHandling() {
        console.log('🎯 YPRINT UNIFIED API: Initializing design data handling...');

        // Listen to designer events
        this.designerWidget.on('designSaved', (data) => {
            this.onDesignSaved(data);
        });

        this.designerWidget.on('elementAdded', (data) => {
            this.onElementChanged('added', data);
        });

        this.designerWidget.on('elementModified', (data) => {
            this.onElementChanged('modified', data);
        });

        this.designerWidget.on('elementRemoved', (data) => {
            this.onElementChanged('removed', data);
        });

        console.log('✅ YPRINT UNIFIED API: Design data handling ready');
    }

    initializeCoordinateSystem() {
        console.log('🎯 YPRINT UNIFIED API: Initializing modern coordinate system...');

        this.coordinateSystem = {
            // Get all element coordinates
            getAllCoordinates: () => {
                const canvas = this.designerWidget.fabricCanvas;
                if (!canvas) return [];

                return canvas.getObjects().map(obj => ({
                    id: obj.id,
                    type: obj.type,
                    coordinates: {
                        x: Math.round(obj.left || 0),
                        y: Math.round(obj.top || 0),
                        width: Math.round((obj.width || 0) * (obj.scaleX || 1)),
                        height: Math.round((obj.height || 0) * (obj.scaleY || 1)),
                        rotation: obj.angle || 0
                    },
                    bounds: obj.getBoundingRect(),
                    center: obj.getCenterPoint()
                }));
            },

            // Get specific element coordinates
            getElementCoordinates: (elementId) => {
                const canvas = this.designerWidget.fabricCanvas;
                if (!canvas) return null;

                const element = canvas.getObjects().find(obj => obj.id === elementId);
                if (!element) return null;

                return {
                    id: elementId,
                    coordinates: {
                        x: Math.round(element.left || 0),
                        y: Math.round(element.top || 0),
                        width: Math.round((element.width || 0) * (element.scaleX || 1)),
                        height: Math.round((element.height || 0) * (element.scaleY || 1)),
                        rotation: element.angle || 0
                    },
                    bounds: element.getBoundingRect(),
                    center: element.getCenterPoint()
                };
            },

            // Validate coordinates (replaces safezone validator)
            validateCoordinates: (coordinates) => {
                const canvas = this.designerWidget.fabricCanvas;
                if (!canvas) return { valid: false, reason: 'Canvas not available' };

                const canvasWidth = canvas.width;
                const canvasHeight = canvas.height;

                // Check if coordinates are within canvas bounds
                const withinBounds = (
                    coordinates.x >= 0 &&
                    coordinates.y >= 0 &&
                    (coordinates.x + coordinates.width) <= canvasWidth &&
                    (coordinates.y + coordinates.height) <= canvasHeight
                );

                return {
                    valid: withinBounds,
                    reason: withinBounds ? 'Valid coordinates' : 'Coordinates outside canvas bounds',
                    canvasBounds: { width: canvasWidth, height: canvasHeight },
                    elementBounds: coordinates
                };
            }
        };

        // Expose coordinate system
        this.api.coordinates = this.coordinateSystem;

        console.log('✅ YPRINT UNIFIED API: Modern coordinate system ready');
    }

    initializeWordPressIntegration() {
        console.log('🎯 YPRINT UNIFIED API: Initializing WordPress integration...');

        this.wordpressIntegration = {
            // Send design data to WordPress
            saveToWordPress: async (designData) => {
                if (!window.wp || !window.wp.ajax) {
                    throw new Error('WordPress AJAX not available');
                }

                return new Promise((resolve, reject) => {
                    window.wp.ajax.post('save_design_data', {
                        design_data: JSON.stringify(designData),
                        nonce: window.octo_print_designer_ajax?.nonce
                    }).done(resolve).fail(reject);
                });
            },

            // Load design data from WordPress
            loadFromWordPress: async (designId) => {
                if (!window.wp || !window.wp.ajax) {
                    throw new Error('WordPress AJAX not available');
                }

                return new Promise((resolve, reject) => {
                    window.wp.ajax.post('load_design_data', {
                        design_id: designId,
                        nonce: window.octo_print_designer_ajax?.nonce
                    }).done(resolve).fail(reject);
                });
            }
        };

        // Expose WordPress integration
        this.api.wordpress = this.wordpressIntegration;

        console.log('✅ YPRINT UNIFIED API: WordPress integration ready');
    }

    // Design Management Methods
    saveDesign() {
        console.log('💾 YPRINT UNIFIED API: Saving design...');

        const designData = this.designerWidget.getDesignData();
        const coordinates = this.coordinateSystem.getAllCoordinates();

        const completeDesignData = {
            ...designData,
            coordinates: coordinates,
            validation: this.validateDesign(),
            saved: Date.now(),
            apiVersion: this.version
        };

        // Dispatch save event
        window.dispatchEvent(new CustomEvent('yprintDesignSaved', {
            detail: completeDesignData
        }));

        console.log('✅ YPRINT UNIFIED API: Design saved successfully');
        return completeDesignData;
    }

    loadDesign(designData) {
        console.log('📂 YPRINT UNIFIED API: Loading design...');

        if (!designData) {
            throw new Error('No design data provided');
        }

        this.designerWidget.loadDesignData(designData);

        // Dispatch load event
        window.dispatchEvent(new CustomEvent('yprintDesignLoaded', {
            detail: designData
        }));

        console.log('✅ YPRINT UNIFIED API: Design loaded successfully');
    }

    exportDesign(format = 'json') {
        console.log(`📤 YPRINT UNIFIED API: Exporting design as ${format}...`);

        const designData = this.saveDesign();

        switch (format.toLowerCase()) {
            case 'json':
                return JSON.stringify(designData, null, 2);

            case 'png':
                return this.designerWidget.fabricCanvas.toDataURL('image/png');

            case 'svg':
                return this.designerWidget.fabricCanvas.toSVG();

            default:
                throw new Error(`Unsupported export format: ${format}`);
        }
    }

    getDesignData() {
        return this.designerWidget.getDesignData();
    }

    getCoordinates() {
        return this.coordinateSystem.getAllCoordinates();
    }

    validateDesign() {
        const coordinates = this.coordinateSystem.getAllCoordinates();
        const validationResults = coordinates.map(coord => ({
            elementId: coord.id,
            validation: this.coordinateSystem.validateCoordinates(coord.coordinates)
        }));

        const allValid = validationResults.every(result => result.validation.valid);

        return {
            valid: allValid,
            elementCount: coordinates.length,
            validElements: validationResults.filter(r => r.validation.valid).length,
            invalidElements: validationResults.filter(r => !r.validation.valid),
            details: validationResults
        };
    }

    // Event Handlers
    onDesignSaved(data) {
        console.log('📝 YPRINT UNIFIED API: Design saved event:', data);
        // Additional processing for saved designs
    }

    onElementChanged(changeType, data) {
        console.log(`🔄 YPRINT UNIFIED API: Element ${changeType}:`, data);
        // Real-time coordinate updates
    }

    // System Status and Diagnostics
    getSystemStatus() {
        return {
            initialized: this.initialized,
            version: this.version,
            coreRebuild: true,
            legacySystemsReplaced: true,
            fabricCore: this.fabricCore ? this.fabricCore.getStatus() : null,
            designerWidget: this.designerWidget ? this.designerWidget.getStatus() : null,
            timestamp: Date.now()
        };
    }

    runDiagnostics() {
        console.log('🔍 YPRINT UNIFIED API: Running system diagnostics...');

        const diagnostics = {
            fabricCore: {
                available: !!this.fabricCore,
                initialized: this.fabricCore ? this.fabricCore.initialized : false,
                fabricReady: this.fabricCore ? this.fabricCore.fabricReady : false
            },
            designerWidget: {
                available: !!this.designerWidget,
                initialized: this.designerWidget ? this.designerWidget.initialized : false,
                canvasReady: this.designerWidget ? !!this.designerWidget.fabricCanvas : false
            },
            api: {
                exposed: !!window.YPrint,
                version: this.version,
                initialized: this.initialized
            },
            wordpress: {
                available: !!(window.wp && window.wp.ajax),
                nonce: !!window.octo_print_designer_ajax?.nonce
            }
        };

        console.log('📊 YPRINT UNIFIED API: Diagnostics completed:', diagnostics);
        return diagnostics;
    }

    markSystemReady() {
        this.initialized = true;

        // Expose globally for legacy compatibility
        window.yprintUnifiedAPI = this;

        // Override legacy global functions
        this.overrideLegacyGlobals();

        // Dispatch ready event
        window.dispatchEvent(new CustomEvent('yprintSystemReady', {
            detail: {
                api: this.api,
                instance: this,
                version: this.version,
                coreRebuild: true
            }
        }));

        console.log('🎉 YPRINT UNIFIED API: Complete system ready - all legacy systems replaced');
    }

    overrideLegacyGlobals() {
        // Override legacy detection functions with modern equivalents
        window.detectCanvasParadox = () => false; // No more paradox detection
        window.logCoordinateSystemOutput = (data) => {
            console.log('📍 LEGACY COMPATIBILITY: Coordinate output:', data);
        };

        // Legacy status functions
        window.checkEmergencyStatus = () => this.getSystemStatus();
        window.getDesignerStatus = () => this.designerWidget.getStatus();

        console.log('🔄 YPRINT UNIFIED API: Legacy globals overridden');
    }

    // Cleanup
    dispose() {
        console.log('🧹 YPRINT UNIFIED API: Disposing...');

        this.initialized = false;

        // Clean up references
        delete window.YPrint;
        delete window.yprintAPI;
        delete window.yprintUnifiedAPI;

        console.log('✅ YPRINT UNIFIED API: Disposed');
    }
}

// Auto-initialize when core systems are ready
console.log('🚀 YPRINT UNIFIED API: Auto-initializing...');

// Check if both core systems are already ready
if (window.unifiedFabricCore?.initialized && window.designerWidgetCore?.initialized) {
    window.yprintUnifiedAPI = new YPrintUnifiedAPI();
} else {
    // Wait for both systems to be ready
    let fabricReady = false;
    let designerReady = false;

    const checkAndInitialize = () => {
        if (fabricReady && designerReady) {
            window.yprintUnifiedAPI = new YPrintUnifiedAPI();
        }
    };

    window.addEventListener('unifiedFabricReady', () => {
        fabricReady = true;
        checkAndInitialize();
    });

    window.addEventListener('designerWidgetReady', () => {
        designerReady = true;
        checkAndInitialize();
    });
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = YPrintUnifiedAPI;
}