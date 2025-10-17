/**
 * 🏆 HIVE MIND SOLUTION: Enhanced JSON Coordinate System
 *
 * CRITICAL PURPOSE: Reliable JSON generation with comprehensive canvas coordinate extraction
 * Implements advanced error handling and fallback mechanisms for design data capture
 *
 * SWARM ID: swarm_1758638159571_p7mbkettu
 * COORDINATED BY: JSON-Coordinate-Generator Agent
 */

(function() {
    'use strict';

    console.log('🏆 HIVE MIND JSON COORDINATE SYSTEM: Starting enhanced design data capture...');

    window.EnhancedJSONCoordinateSystem = class {
        constructor() {
            this.DEBUG = (typeof window.octoPrintDesignerDebug !== 'undefined') ? window.octoPrintDesignerDebug : false;
            this.canvasManager = window.canvasSingletonManager;

            this.debugLog('info', '🎯 Enhanced JSON Coordinate System initialized');

            // Bind methods
            this.generateDesignData = this.generateDesignData.bind(this);
            this.captureCanvasCoordinates = this.captureCanvasCoordinates.bind(this);
            this.extractElementCoordinates = this.extractElementCoordinates.bind(this);
        }

        debugLog(level, ...args) {
            if (!this.DEBUG && level === 'debug') return;
            if (level === 'error') console.error('[JSON-COORD]', ...args);
            else if (level === 'warn') console.warn('[JSON-COORD]', ...args);
            else if (this.DEBUG) console.log('[JSON-COORD]', ...args);
        }

        /**
         * 🎯 MAIN FUNCTION: Generate complete design data with coordinates
         */
        generateDesignData() {
            this.debugLog('info', '🎯 HIVE MIND: Starting comprehensive design data generation...');

            try {
                // Phase 1: Canvas Discovery and Validation
                const canvasData = this.discoverAndValidateCanvas();
                if (!canvasData.success) {
                    return this.createErrorResponse('Canvas discovery failed: ' + canvasData.error);
                }

                const { canvas, canvasElement } = canvasData;

                // Phase 2: Extract Canvas Coordinates
                const coordinateData = this.captureCanvasCoordinates(canvas);

                // Phase 3: Extract Template Information
                const templateData = this.extractTemplateInformation(canvasElement);

                // Phase 4: Generate Complete JSON Structure
                const designData = {
                    // Timestamp in ISO format
                    timestamp: new Date().toISOString(),

                    // Canvas dimensions and properties
                    canvas: {
                        id: canvasElement.id,
                        width: canvas.width || 0,
                        height: canvas.height || 0,
                        zoom: this.safeGetZoom(canvas),
                        objects_count: (canvas.getObjects && canvas.getObjects().length) || 0
                    },

                    // Template and view information
                    template_view_id: templateData.viewId,
                    template_id: templateData.templateId,
                    designed_on_area_px: templateData.designArea,

                    // Complete coordinate data
                    elements: coordinateData.elements,
                    coordinates: coordinateData.coordinates,

                    // System metadata
                    metadata: {
                        system: 'HiveMindJSONCoordinateSystem',
                        version: '1.0.0',
                        capture_method: coordinateData.method,
                        canvas_state: coordinateData.state,
                        debug_mode: this.DEBUG
                    },

                    // User action context
                    action: this.getCurrentAction(),
                    user_session: this.generateSessionId()
                };

                this.debugLog('info', '✅ HIVE MIND: Design data generated successfully');
                this.debugLog('debug', 'Canvas dimensions:', `${designData.canvas.width}x${designData.canvas.height}`);
                this.debugLog('debug', 'Elements captured:', designData.elements.length);
                this.debugLog('debug', 'Template ID:', designData.template_id);

                return designData;

            } catch (error) {
                this.debugLog('error', '❌ HIVE MIND: Error generating design data:', error);
                return this.createErrorResponse('Design data generation failed: ' + error.message);
            }
        }

        /**
         * Phase 1: Discover and validate canvas
         */
        discoverAndValidateCanvas() {
            this.debugLog('debug', '🔍 Phase 1: Canvas discovery...');

            // Method 1: Use Canvas Singleton Manager with Readiness Check
            console.log('🔍 JSON DEBUG: Checking Canvas Singleton Manager...');
            if (this.canvasManager) {
                const status = this.canvasManager.getStatus();
                console.log('🔍 JSON DEBUG: Canvas Manager Status:', status);
                this.debugLog('debug', '📊 Canvas Manager Status:', status);

                for (const canvasId of status.canvases) {
                    console.log('🔍 JSON DEBUG: Checking canvas ID:', canvasId);
                    const canvas = this.canvasManager.getCanvas(canvasId);
                    if (canvas && canvas.getObjects) {
                        const element = document.getElementById(canvasId);
                        if (element) {
                            // 🔧 READINESS VALIDATION: Check if canvas has design elements
                            const objects = canvas.getObjects();
                            console.log('🔍 JSON DEBUG: Canvas objects count:', objects.length);
                            this.debugLog('info', '✅ Found canvas via Singleton Manager:', canvasId);
                            return { success: true, canvas, canvasElement: element };
                        }
                    }
                }
            } else {
                console.log('🔍 JSON DEBUG: Canvas Manager not available');
            }

            // Method 2: Search for fabric canvas instances with Enhanced Detection
            console.log('🔍 JSON DEBUG: Searching DOM for canvas elements...');
            const canvasElements = document.querySelectorAll('canvas');
            console.log('🔍 JSON DEBUG: Found', canvasElements.length, 'canvas elements');

            for (const element of canvasElements) {
                console.log('🔍 JSON DEBUG: Checking canvas:', element.id || 'no-id', 'has __fabric:', !!element.__fabric);
                if (element.__fabric) {
                    console.log('🔍 JSON DEBUG: __fabric type:', typeof element.__fabric, 'has getObjects:', typeof element.__fabric.getObjects);
                    if (element.__fabric.getObjects) {
                        // 🔧 ENHANCED VALIDATION: Check objects and readiness
                        const objects = element.__fabric.getObjects();
                        console.log('🔍 JSON DEBUG: Canvas objects via __fabric:', objects.length);
                        console.log('✅ JSON DEBUG: Found functional canvas via __fabric:', element.id);
                        this.debugLog('info', '✅ Found canvas via __fabric property:', element.id);
                        return { success: true, canvas: element.__fabric, canvasElement: element };
                    }
                }
            }

            // Method 3: Check global fabric instances
            if (typeof window.fabric !== 'undefined' && window.fabric.getInstances) {
                const instances = window.fabric.getInstances();
                if (instances && instances.length > 0) {
                    for (const canvas of instances) {
                        const element = canvas.lowerCanvasEl || canvas.upperCanvasEl;
                        if (element) {
                            this.debugLog('info', '✅ Found canvas via fabric.getInstances()');
                            return { success: true, canvas, canvasElement: element };
                        }
                    }
                }
            }

            // Method 4: Check window.designerWidgetInstance
            if (window.designerWidgetInstance && window.designerWidgetInstance.canvas) {
                const canvas = window.designerWidgetInstance.canvas;
                const element = canvas.lowerCanvasEl || document.querySelector('#octo-print-designer-canvas');
                if (element) {
                    this.debugLog('info', '✅ Found canvas via designerWidgetInstance');
                    return { success: true, canvas, canvasElement: element };
                }
            }

            return { success: false, error: 'No valid fabric canvas found' };
        }

        /**
         * Phase 2: Capture canvas coordinates
         */
        captureCanvasCoordinates(canvas) {
            this.debugLog('debug', '🎨 Phase 2: Capturing canvas coordinates...');

            const coordinateData = {
                elements: [],
                coordinates: [],
                method: 'unknown',
                state: 'unknown'
            };

            try {
                console.log('🔍 JSON DEBUG: Canvas coordinate extraction - canvas type:', typeof canvas);
                console.log('🔍 JSON DEBUG: Canvas has toJSON:', typeof canvas.toJSON);
                console.log('🔍 JSON DEBUG: Canvas has getObjects:', typeof canvas.getObjects);

                // Method 1: Use toJSON for complete data
                if (canvas.toJSON) {
                    const jsonData = canvas.toJSON();
                    coordinateData.method = 'toJSON';
                    coordinateData.state = 'complete';

                    console.log('🔍 JSON DEBUG: toJSON data:', jsonData);
                    console.log('🔍 JSON DEBUG: toJSON objects count:', jsonData.objects?.length || 0);

                    if (jsonData.objects && Array.isArray(jsonData.objects)) {
                        coordinateData.elements = jsonData.objects.map((obj, index) =>
                            this.extractElementCoordinates(obj, index)
                        );
                        coordinateData.coordinates = jsonData.objects;
                    }

                    this.debugLog('debug', `📊 Captured ${coordinateData.elements.length} elements via toJSON`);
                    if (coordinateData.elements.length > 0) {
                        return coordinateData;
                    }
                }

                // Method 2: Direct object iteration
                if (canvas.getObjects) {
                    const objects = canvas.getObjects();
                    coordinateData.method = 'getObjects';
                    coordinateData.state = 'partial';

                    console.log('🔍 JSON DEBUG: getObjects returned:', objects);
                    console.log('🔍 JSON DEBUG: getObjects count:', objects.length);

                    coordinateData.elements = objects.map((obj, index) =>
                        this.extractElementCoordinates(obj, index)
                    );

                    this.debugLog('debug', `📊 Captured ${coordinateData.elements.length} elements via getObjects`);
                    if (coordinateData.elements.length > 0) {
                        return coordinateData;
                    }
                }

                // Method 3: Direct _objects access (internal fabric.js property)
                if (canvas._objects && Array.isArray(canvas._objects)) {
                    console.log('🔍 JSON DEBUG: Accessing internal _objects array');
                    const objects = canvas._objects;
                    coordinateData.method = '_objects';
                    coordinateData.state = 'internal';

                    console.log('🔍 JSON DEBUG: _objects count:', objects.length);

                    coordinateData.elements = objects.map((obj, index) =>
                        this.extractElementCoordinates(obj, index)
                    );

                    this.debugLog('debug', `📊 Captured ${coordinateData.elements.length} elements via _objects`);
                    if (coordinateData.elements.length > 0) {
                        return coordinateData;
                    }
                }

                // Method 4: Check designerWidgetInstance
                if (window.designerWidgetInstance && window.designerWidgetInstance.fabricCanvas) {
                    console.log('🔍 JSON DEBUG: Trying designerWidgetInstance.fabricCanvas');
                    const designerCanvas = window.designerWidgetInstance.fabricCanvas;
                    if (designerCanvas.getObjects) {
                        const objects = designerCanvas.getObjects();
                        coordinateData.method = 'designerWidget';
                        coordinateData.state = 'widget';

                        console.log('🔍 JSON DEBUG: designerWidget objects count:', objects.length);

                        coordinateData.elements = objects.map((obj, index) =>
                            this.extractElementCoordinates(obj, index)
                        );

                        this.debugLog('debug', `📊 Captured ${coordinateData.elements.length} elements via designerWidget`);
                        if (coordinateData.elements.length > 0) {
                            return coordinateData;
                        }
                    }
                }

                // Method 5: Fallback empty structure
                coordinateData.method = 'fallback';
                coordinateData.state = 'empty';
                console.log('⚠️ JSON DEBUG: No coordinate extraction method found objects');
                this.debugLog('warn', '⚠️ No coordinate extraction method available');

            } catch (error) {
                console.log('❌ JSON DEBUG: Error in coordinate extraction:', error);
                this.debugLog('error', '❌ Error capturing coordinates:', error);
                coordinateData.method = 'error';
                coordinateData.state = 'failed';
            }

            return coordinateData;
        }

        /**
         * Extract coordinates from individual elements
         */
        extractElementCoordinates(obj, index) {
            const element = {
                index: index,
                type: obj.type || 'unknown',
                coordinates: {
                    x: obj.left || 0,
                    y: obj.top || 0,
                    width: obj.width || 0,
                    height: obj.height || 0
                },
                transform: {
                    scaleX: obj.scaleX || 1,
                    scaleY: obj.scaleY || 1,
                    angle: obj.angle || 0,
                    skewX: obj.skewX || 0,
                    skewY: obj.skewY || 0
                },
                properties: {}
            };

            // Extract additional properties based on type
            switch (obj.type) {
                case 'text':
                case 'i-text':
                    element.properties = {
                        text: obj.text || '',
                        fontSize: obj.fontSize || 12,
                        fontFamily: obj.fontFamily || 'Arial',
                        fill: obj.fill || '#000000'
                    };
                    break;
                case 'image':
                    element.properties = {
                        src: obj.src || '',
                        crossOrigin: obj.crossOrigin || null
                    };
                    break;
                case 'rect':
                case 'circle':
                case 'polygon':
                    element.properties = {
                        fill: obj.fill || 'transparent',
                        stroke: obj.stroke || null,
                        strokeWidth: obj.strokeWidth || 0
                    };
                    break;
            }

            return element;
        }

        /**
         * Phase 3: Extract template information
         */
        extractTemplateInformation(canvasElement) {
            this.debugLog('debug', '📋 Phase 3: Extracting template information...');

            const templateData = {
                viewId: 'unknown',
                templateId: '1', // Default fallback
                designArea: { width: 0, height: 0 }
            };

            try {
                // Extract from data attributes
                const container = canvasElement.closest('[data-template-view-id]') ||
                                 document.querySelector('[data-template-view-id]');

                if (container) {
                    templateData.viewId = container.dataset.templateViewId;
                    this.debugLog('debug', '✅ Found template view ID:', templateData.viewId);
                }

                // Extract template ID from URL or form
                const urlParams = new URLSearchParams(window.location.search);
                if (urlParams.has('template_id')) {
                    templateData.templateId = urlParams.get('template_id');
                } else {
                    const templateInput = document.querySelector('input[name="template_id"]');
                    if (templateInput && templateInput.value) {
                        templateData.templateId = templateInput.value;
                    }
                }

                // Design area dimensions
                templateData.designArea = {
                    width: canvasElement.width || 0,
                    height: canvasElement.height || 0
                };

                this.debugLog('debug', '📏 Template data:', templateData);

            } catch (error) {
                this.debugLog('warn', '⚠️ Error extracting template info:', error);
            }

            return templateData;
        }

        /**
         * Utility functions
         */
        safeGetZoom(canvas) {
            try {
                return canvas.getZoom ? canvas.getZoom() : 1.0;
            } catch (error) {
                return 1.0;
            }
        }

        getCurrentAction() {
            // Detect current user action context
            const triggers = ['save', 'cart', 'preview', 'export'];
            for (const trigger of triggers) {
                if (document.querySelector(`[class*="${trigger}"], [id*="${trigger}"]`)) {
                    return trigger;
                }
            }
            return 'manual';
        }

        generateSessionId() {
            return 'session-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
        }

        createErrorResponse(message) {
            return {
                error: true,
                message: message,
                timestamp: new Date().toISOString(),
                template_view_id: 'error',
                designed_on_area_px: { width: 0, height: 0 },
                elements: [],
                metadata: {
                    system: 'HiveMindJSONCoordinateSystem',
                    version: '1.0.0',
                    error: true
                }
            };
        }

        /**
         * Test function for debugging
         */
        testGeneration() {
            this.debugLog('info', '🧪 HIVE MIND: Testing JSON coordinate generation...');
            const result = this.generateDesignData();
            this.debugLog('info', '🧪 Test result:', result);
            return result;
        }
    };

    // Create global instance
    console.log('🔍 ENHANCED-JSON: Script is executing...');
    console.log('🔍 ENHANCED-JSON: window.enhancedJSONSystem exists?', !!window.enhancedJSONSystem);

    if (!window.enhancedJSONSystem) {
        console.log('🔍 ENHANCED-JSON: Creating new EnhancedJSONCoordinateSystem instance...');
        window.enhancedJSONSystem = new window.EnhancedJSONCoordinateSystem();

        // Override global generateDesignData function
        console.log('🔍 ENHANCED-JSON: Setting up window.generateDesignData function...');
        window.generateDesignData = () => window.enhancedJSONSystem.generateDesignData();

        // Add test function
        window.testJSONGeneration = () => window.enhancedJSONSystem.testGeneration();

        console.log('🏆 HIVE MIND: Enhanced JSON Coordinate System ready!');
        console.log('💡 Usage: generateDesignData() or testJSONGeneration()');
        console.log('🔍 ENHANCED-JSON: generateDesignData function type:', typeof window.generateDesignData);
    } else {
        console.log('ℹ️ ENHANCED-JSON: System already initialized');
    }

})();