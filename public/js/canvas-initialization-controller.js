/**
 * 🎯 CANVAS INITIALIZATION CONTROLLER - Master Singleton Solution
 *
 * CRITICAL PURPOSE: Prevents fabric.js double initialization by managing all canvas creation
 * through a centralized singleton pattern. This is the authoritative canvas manager.
 *
 * ISSUE #123 SOLUTION: Eliminates "fabric: Trying to initialize a canvas that has already been initialized" error
 */

(function(global) {
    'use strict';

    console.log('🎯 CANVAS CONTROLLER: Initializing master canvas singleton manager');

    // Prevent multiple controller instances
    if (global.canvasInitializationController) {
        console.log('✅ CANVAS CONTROLLER: Controller already exists, using existing instance');
        return global.canvasInitializationController;
    }

    /**
     * Master Canvas Initialization Controller
     */
    class CanvasInitializationController {
        constructor() {
            this.canvasInstance = null;
            this.fabricReady = false;
            this.initializationInProgress = false;
            this.pendingCallbacks = [];
            this.initializationAttempts = 0;
            this.maxAttempts = 1; // Only allow ONE initialization attempt

            // Track all initialization sources
            this.initializationSources = new Set();

            console.log('🎯 CANVAS CONTROLLER: Master controller initialized');
        }

        /**
         * Register an initialization source (for debugging)
         */
        registerSource(sourceName) {
            this.initializationSources.add(sourceName);
            console.log('🎯 CANVAS CONTROLLER: Registered source:', sourceName, 'Total sources:', this.initializationSources.size);
        }

        /**
         * Check if canvas is already initialized
         */
        isCanvasInitialized() {
            const canvasElement = document.getElementById('octo-print-designer-canvas');
            const hasElementFabric = canvasElement && canvasElement.__fabric;
            const hasInstanceFabric = this.canvasInstance && this.canvasInstance.fabric;

            return hasElementFabric || hasInstanceFabric;
        }

        /**
         * Get existing canvas instance or null
         */
        getExistingCanvas() {
            // Priority 1: Check our managed instance
            if (this.canvasInstance) {
                console.log('🎯 CANVAS CONTROLLER: Returning managed canvas instance');
                return this.canvasInstance;
            }

            // Priority 2: Check DOM element for fabric instance
            const canvasElement = document.getElementById('octo-print-designer-canvas');
            if (canvasElement && canvasElement.__fabric) {
                console.log('🎯 CANVAS CONTROLLER: Found existing fabric canvas on DOM element');
                this.canvasInstance = canvasElement.__fabric;
                return this.canvasInstance;
            }

            // Priority 3: Check global DesignerWidget instances
            if (global.designerWidgetInstance && global.designerWidgetInstance.canvas) {
                console.log('🎯 CANVAS CONTROLLER: Found canvas in global DesignerWidget instance');
                this.canvasInstance = global.designerWidgetInstance.canvas;
                return this.canvasInstance;
            }

            return null;
        }

        /**
         * Initialize canvas with strict singleton enforcement
         */
        async initializeCanvas(options = {}) {
            const sourceName = options.source || 'unknown';
            this.registerSource(sourceName);

            // CRITICAL: Check if already initialized
            if (this.isCanvasInitialized()) {
                const existingCanvas = this.getExistingCanvas();
                console.log('✅ CANVAS CONTROLLER: Canvas already initialized, returning existing instance');
                return {
                    success: true,
                    canvas: existingCanvas,
                    message: `Canvas already initialized by previous source. Current source: ${sourceName}`,
                    isExisting: true
                };
            }

            // CRITICAL: Prevent concurrent initialization
            if (this.initializationInProgress) {
                console.log('⏳ CANVAS CONTROLLER: Initialization in progress, queueing callback');
                return new Promise((resolve) => {
                    this.pendingCallbacks.push(resolve);
                });
            }

            // CRITICAL: Enforce single attempt
            if (this.initializationAttempts >= this.maxAttempts) {
                console.error('❌ CANVAS CONTROLLER: Maximum initialization attempts exceeded');
                return {
                    success: false,
                    error: 'Maximum initialization attempts exceeded',
                    attempts: this.initializationAttempts
                };
            }

            this.initializationInProgress = true;
            this.initializationAttempts++;

            console.log(`🔄 CANVAS CONTROLLER: Starting canvas initialization (attempt ${this.initializationAttempts}) for source: ${sourceName}`);

            try {
                // Wait for fabric.js to be available
                const fabric = await this.ensureFabricReady();
                if (!fabric) {
                    throw new Error('fabric.js not available');
                }

                // Get canvas element
                const canvasElement = document.getElementById('octo-print-designer-canvas');
                if (!canvasElement) {
                    throw new Error('Canvas element #octo-print-designer-canvas not found');
                }

                // Final check before creating new instance
                if (canvasElement.__fabric) {
                    console.log('✅ CANVAS CONTROLLER: Canvas became initialized during fabric wait, using existing');
                    this.canvasInstance = canvasElement.__fabric;
                } else {
                    // Create new fabric canvas
                    console.log('🎯 CANVAS CONTROLLER: Creating new fabric.js Canvas instance');
                    this.canvasInstance = new fabric.Canvas('octo-print-designer-canvas', {
                        width: options.width || 800,
                        height: options.height || 600,
                        backgroundColor: options.backgroundColor || '#ffffff',
                        selection: true,
                        preserveObjectStacking: true,
                        ...options.fabricOptions
                    });

                    console.log('✅ CANVAS CONTROLLER: New fabric.js Canvas created successfully');
                }

                const result = {
                    success: true,
                    canvas: this.canvasInstance,
                    message: `Canvas initialized successfully by source: ${sourceName}`,
                    fabricVersion: fabric.version || 'unknown',
                    isExisting: false
                };

                // Resolve pending callbacks
                this.resolvePendingCallbacks(result);

                return result;

            } catch (error) {
                console.error('❌ CANVAS CONTROLLER: Canvas initialization failed:', error);

                const result = {
                    success: false,
                    error: error.message,
                    source: sourceName,
                    attempts: this.initializationAttempts
                };

                // Resolve pending callbacks with error
                this.resolvePendingCallbacks(result);

                return result;

            } finally {
                this.initializationInProgress = false;
            }
        }

        /**
         * Ensure fabric.js is ready
         */
        async ensureFabricReady(timeout = 5000) {
            if (global.fabric && typeof global.fabric.Canvas === 'function') {
                this.fabricReady = true;
                return global.fabric;
            }

            console.log('⏳ CANVAS CONTROLLER: Waiting for fabric.js to be ready...');

            return new Promise((resolve) => {
                let timeoutId;
                let checkInterval;

                const cleanup = () => {
                    if (timeoutId) clearTimeout(timeoutId);
                    if (checkInterval) clearInterval(checkInterval);
                    document.removeEventListener('fabricGloballyExposed', handleFabricReady);
                    document.removeEventListener('fabricGlobalReady', handleFabricReady);
                };

                const handleFabricReady = () => {
                    cleanup();
                    this.fabricReady = true;
                    console.log('✅ CANVAS CONTROLLER: fabric.js is ready');
                    resolve(global.fabric);
                };

                // Listen for fabric ready events
                document.addEventListener('fabricGloballyExposed', handleFabricReady);
                document.addEventListener('fabricGlobalReady', handleFabricReady);

                // Polling fallback
                checkInterval = setInterval(() => {
                    if (global.fabric && typeof global.fabric.Canvas === 'function') {
                        handleFabricReady();
                    }
                }, 100);

                // Timeout fallback
                timeoutId = setTimeout(() => {
                    cleanup();
                    console.error('❌ CANVAS CONTROLLER: Timeout waiting for fabric.js');
                    resolve(null);
                }, timeout);
            });
        }

        /**
         * Resolve all pending callbacks
         */
        resolvePendingCallbacks(result) {
            this.pendingCallbacks.forEach(callback => callback(result));
            this.pendingCallbacks = [];
        }

        /**
         * Get canvas instance - public API
         */
        getCanvas() {
            return this.getExistingCanvas();
        }

        /**
         * Destroy canvas instance
         */
        destroyCanvas() {
            if (this.canvasInstance) {
                try {
                    this.canvasInstance.dispose();
                    console.log('🗑️ CANVAS CONTROLLER: Canvas disposed successfully');
                } catch (error) {
                    console.error('❌ CANVAS CONTROLLER: Error disposing canvas:', error);
                }
                this.canvasInstance = null;
            }

            // Clear DOM element fabric reference
            const canvasElement = document.getElementById('octo-print-designer-canvas');
            if (canvasElement && canvasElement.__fabric) {
                delete canvasElement.__fabric;
            }

            this.fabricReady = false;
            this.initializationInProgress = false;
            this.initializationAttempts = 0;
            this.initializationSources.clear();
        }

        /**
         * Get initialization status
         */
        getStatus() {
            return {
                isInitialized: this.isCanvasInitialized(),
                fabricReady: this.fabricReady,
                inProgress: this.initializationInProgress,
                attempts: this.initializationAttempts,
                sources: Array.from(this.initializationSources),
                hasCanvas: !!this.canvasInstance
            };
        }
    }

    // Create singleton instance
    const controller = new CanvasInitializationController();

    // Global exposure
    global.canvasInitializationController = controller;

    // Helper functions for easy access
    global.initializeDesignerCanvas = (options) => controller.initializeCanvas(options);
    global.getDesignerCanvas = () => controller.getCanvas();
    global.getCanvasStatus = () => controller.getStatus();

    // Hook into any existing DesignerWidget instantiation
    if (global.DesignerWidget && !global.DesignerWidget.__canvasControllerHooked) {
        const originalConstructor = global.DesignerWidget;

        global.DesignerWidget = function(...args) {
            console.log('🎯 CANVAS CONTROLLER: Intercepting DesignerWidget constructor');

            // Check if canvas is already initialized
            const existingCanvas = controller.getExistingCanvas();
            if (existingCanvas) {
                console.log('✅ CANVAS CONTROLLER: Using existing canvas for DesignerWidget');
                const instance = new originalConstructor(...args);
                if (instance.canvas !== existingCanvas) {
                    instance.canvas = existingCanvas;
                }
                return instance;
            }

            return new originalConstructor(...args);
        };

        // Copy static properties
        Object.setPrototypeOf(global.DesignerWidget, originalConstructor);
        global.DesignerWidget.prototype = originalConstructor.prototype;
        global.DesignerWidget.__canvasControllerHooked = true;
    }

    console.log('🎯 CANVAS CONTROLLER: Master singleton manager ready');

    return controller;

})(window);