/**
 * 🏆 HIVE MIND SOLUTION: Canvas Singleton Manager
 *
 * CRITICAL PURPOSE: Prevent fabric.js canvas double-initialization across all system components
 * Implements comprehensive singleton protection with lifecycle management
 *
 * SWARM ID: swarm_1758638159571_p7mbkettu
 * AGENTS: 7 specialized agents coordinated solution
 */

(function() {
    'use strict';

    console.log('🏆 HIVE MIND CANVAS SINGLETON MANAGER: Starting comprehensive canvas protection...');

    // Global Canvas Registry - Single Source of Truth
    window.CanvasSingletonManager = class {
        constructor() {
            this.canvasRegistry = new Map();
            this.initializationPromises = new Map();
            this.disposed = false;
            this.DEBUG = (typeof window.octoPrintDesignerDebug !== 'undefined') ? window.octoPrintDesignerDebug : false;

            this.debugLog('info', '🎯 Canvas Singleton Manager initialized');

            // Bind methods to preserve context
            this.registerCanvas = this.registerCanvas.bind(this);
            this.getCanvas = this.getCanvas.bind(this);
            this.disposeCanvas = this.disposeCanvas.bind(this);
            this.preventDoubleInit = this.preventDoubleInit.bind(this);
        }

        debugLog(level, ...args) {
            if (!this.DEBUG && level === 'debug') return;
            if (level === 'error') console.error(...args);
            else if (level === 'warn') console.warn(...args);
            else if (this.DEBUG) console.log(...args);
        }

        /**
         * Register a canvas instance with singleton protection
         */
        registerCanvas(canvasId, fabricCanvas, options = {}) {
            if (this.disposed) {
                this.debugLog('warn', '🚨 Manager disposed, rejecting registration for:', canvasId);
                return false;
            }

            if (this.canvasRegistry.has(canvasId)) {
                this.debugLog('warn', '🛡️ SINGLETON PROTECTION: Canvas already exists:', canvasId);
                const existing = this.canvasRegistry.get(canvasId);

                // Return existing if it's still valid
                if (existing.canvas && existing.canvas.dispose) {
                    this.debugLog('debug', '✅ Returning existing canvas:', canvasId);
                    return existing.canvas;
                }

                // Clean up invalid reference
                this.debugLog('warn', '🧹 Cleaning up invalid canvas reference:', canvasId);
                this.disposeCanvas(canvasId);
            }

            // Register new canvas
            this.canvasRegistry.set(canvasId, {
                canvas: fabricCanvas,
                created: Date.now(),
                options: options,
                type: options.type || 'fabric'
            });

            this.debugLog('info', `✅ Canvas registered: ${canvasId} (Total: ${this.canvasRegistry.size})`);
            return fabricCanvas;
        }

        /**
         * Get existing canvas or return null
         */
        getCanvas(canvasId) {
            const registered = this.canvasRegistry.get(canvasId);
            if (!registered) {
                this.debugLog('debug', '🔍 Canvas not found:', canvasId);
                return null;
            }

            // Validate canvas is still functional
            if (registered.canvas && registered.canvas.dispose) {
                this.debugLog('debug', '✅ Retrieved existing canvas:', canvasId);
                return registered.canvas;
            }

            // Clean up invalid canvas
            this.debugLog('warn', '🧹 Removing invalid canvas:', canvasId);
            this.canvasRegistry.delete(canvasId);
            return null;
        }

        /**
         * Check if canvas exists and is valid
         */
        hasCanvas(canvasId) {
            const canvas = this.getCanvas(canvasId);
            return canvas !== null;
        }

        /**
         * Prevent double initialization with promise-based synchronization
         */
        async preventDoubleInit(canvasId, initFunction) {
            if (this.disposed) {
                throw new Error('Canvas manager is disposed');
            }

            // Check if already initialized
            const existing = this.getCanvas(canvasId);
            if (existing) {
                this.debugLog('debug', '🛡️ PREVENTION: Canvas already initialized:', canvasId);
                return existing;
            }

            // Check if initialization is in progress
            if (this.initializationPromises.has(canvasId)) {
                this.debugLog('debug', '⏳ PREVENTION: Waiting for initialization in progress:', canvasId);
                return await this.initializationPromises.get(canvasId);
            }

            // Start new initialization
            this.debugLog('debug', '🚀 PREVENTION: Starting new initialization:', canvasId);
            const initPromise = this.performInitialization(canvasId, initFunction);
            this.initializationPromises.set(canvasId, initPromise);

            try {
                const result = await initPromise;
                this.initializationPromises.delete(canvasId);
                return result;
            } catch (error) {
                this.initializationPromises.delete(canvasId);
                throw error;
            }
        }

        async performInitialization(canvasId, initFunction) {
            try {
                this.debugLog('info', '🎨 Initializing canvas:', canvasId);
                const canvas = await initFunction();

                if (!canvas) {
                    throw new Error(`Initialization function returned null for ${canvasId}`);
                }

                // Register the initialized canvas
                this.registerCanvas(canvasId, canvas, { initialized: true });

                this.debugLog('info', '✅ Canvas initialization completed:', canvasId);
                return canvas;

            } catch (error) {
                this.debugLog('error', '❌ Canvas initialization failed:', canvasId, error);
                throw error;
            }
        }

        /**
         * Properly dispose of a canvas
         */
        disposeCanvas(canvasId) {
            const registered = this.canvasRegistry.get(canvasId);
            if (!registered) {
                this.debugLog('debug', '🔍 Canvas not found for disposal:', canvasId);
                return false;
            }

            try {
                if (registered.canvas && registered.canvas.dispose) {
                    this.debugLog('debug', '🗑️ Disposing canvas:', canvasId);
                    registered.canvas.dispose();
                }
            } catch (error) {
                this.debugLog('warn', '⚠️ Error during canvas disposal:', canvasId, error);
            }

            this.canvasRegistry.delete(canvasId);
            this.debugLog('info', `✅ Canvas disposed: ${canvasId} (Remaining: ${this.canvasRegistry.size})`);
            return true;
        }

        /**
         * Get system status for debugging
         */
        getStatus() {
            return {
                totalCanvases: this.canvasRegistry.size,
                activeInitializations: this.initializationPromises.size,
                disposed: this.disposed,
                canvases: Array.from(this.canvasRegistry.keys()),
                initializingCanvases: Array.from(this.initializationPromises.keys())
            };
        }

        /**
         * Dispose entire manager
         */
        dispose() {
            this.debugLog('info', '🗑️ Disposing Canvas Singleton Manager...');

            // Dispose all registered canvases
            for (const canvasId of this.canvasRegistry.keys()) {
                this.disposeCanvas(canvasId);
            }

            // Clear all promises
            this.initializationPromises.clear();
            this.disposed = true;

            this.debugLog('info', '✅ Canvas Singleton Manager disposed');
        }
    };

    // Create global singleton instance
    if (!window.canvasSingletonManager) {
        window.canvasSingletonManager = new window.CanvasSingletonManager();
        console.log('🏆 HIVE MIND: Global Canvas Singleton Manager created');
    }

    // Function to install fabric.js wrapper when it becomes available
    function installFabricCanvasWrapper() {
        if (typeof window.fabric !== 'undefined' && window.fabric.Canvas && !window.fabric.Canvas.__hiveMindWrapped) {
            console.log('🏆 HIVE MIND: Installing fabric.Canvas wrapper with singleton protection...');
            const OriginalCanvas = window.fabric.Canvas;

            window.fabric.Canvas = function(canvasElement, options = {}) {
                const canvasId = canvasElement.id || 'canvas-' + Date.now();

                console.log('🔍 DEBUG: fabric.Canvas() called for:', canvasId);
                console.log('🔍 DEBUG: canvasElement exists:', !!canvasElement);
                console.log('🔍 DEBUG: canvasElement.__fabric exists:', !!canvasElement.__fabric);
                console.log('🔍 DEBUG: canvasElement.__fabric type:', typeof canvasElement.__fabric);

                // Check singleton protection
                const existing = window.canvasSingletonManager.getCanvas(canvasId);
                console.log('🔍 DEBUG: Singleton manager has existing canvas:', !!existing);
                if (existing) {
                    console.log('🛡️ HIVE MIND SINGLETON: Returning existing canvas for:', canvasId);
                    return existing;
                }

                // Check if canvas element already has fabric - FIXED: Check for functional fabric instance
                if (canvasElement.__fabric) {
                    console.log('🔍 DEBUG: __fabric exists, checking functionality...');
                    console.log('🔍 DEBUG: __fabric.dispose exists:', typeof canvasElement.__fabric.dispose);
                    console.log('🔍 DEBUG: __fabric.getObjects exists:', typeof canvasElement.__fabric.getObjects);

                    if (canvasElement.__fabric.dispose && typeof canvasElement.__fabric.getObjects === 'function') {
                        console.log('🚨 HIVE MIND PROTECTION: Canvas element already has functional fabric instance:', canvasId);
                        // Don't throw error, register existing functional canvas instead
                        window.canvasSingletonManager.registerCanvas(canvasId, canvasElement.__fabric, {
                            type: 'fabric',
                            element: canvasElement,
                            options: options
                        });
                        return canvasElement.__fabric;
                    } else {
                        console.log('🧹 DEBUG: __fabric exists but non-functional, cleaning up...');
                        delete canvasElement.__fabric;
                    }
                }

                console.log('🎨 HIVE MIND: Creating new fabric canvas:', canvasId);
                const fabricCanvas = new OriginalCanvas(canvasElement, options);
                console.log('✅ DEBUG: New fabric canvas created successfully:', !!fabricCanvas);

                // Register with singleton manager
                window.canvasSingletonManager.registerCanvas(canvasId, fabricCanvas, {
                    type: 'fabric',
                    element: canvasElement,
                    options: options
                });

                return fabricCanvas;
            };

            // Copy static methods
            Object.setPrototypeOf(window.fabric.Canvas, OriginalCanvas);
            Object.assign(window.fabric.Canvas, OriginalCanvas);

            // Mark as wrapped to prevent double-wrapping
            window.fabric.Canvas.__hiveMindWrapped = true;

            console.log('🏆 HIVE MIND: fabric.js Canvas wrapper with singleton protection installed');
            return true;
        }
        return false;
    }

    // Try to install wrapper immediately
    if (!installFabricCanvasWrapper()) {
        console.log('🔍 HIVE MIND: fabric.js not yet available, setting up delayed wrapper installation...');

        // Poll for fabric.js availability
        let wrapperAttempts = 0;
        const maxWrapperAttempts = 50;
        const wrapperInterval = setInterval(() => {
            wrapperAttempts++;
            console.log(`🔍 HIVE MIND: Attempt ${wrapperAttempts}/${maxWrapperAttempts} to install fabric.Canvas wrapper`);

            if (installFabricCanvasWrapper()) {
                clearInterval(wrapperInterval);
                console.log('✅ HIVE MIND: fabric.Canvas wrapper installed successfully after', wrapperAttempts, 'attempts');
            } else if (wrapperAttempts >= maxWrapperAttempts) {
                clearInterval(wrapperInterval);
                console.log('⚠️ HIVE MIND: Giving up fabric.Canvas wrapper installation after', maxWrapperAttempts, 'attempts');
            }
        }, 100);

        // Also listen for fabric ready events
        window.addEventListener('fabricready', () => {
            console.log('🔍 HIVE MIND: Received fabricready event, attempting wrapper installation...');
            if (installFabricCanvasWrapper()) {
                clearInterval(wrapperInterval);
                console.log('✅ HIVE MIND: fabric.Canvas wrapper installed via fabricready event');
            }
        });

        window.addEventListener('fabricGlobalReady', () => {
            console.log('🔍 HIVE MIND: Received fabricGlobalReady event, attempting wrapper installation...');
            if (installFabricCanvasWrapper()) {
                clearInterval(wrapperInterval);
                console.log('✅ HIVE MIND: fabric.Canvas wrapper installed via fabricGlobalReady event');
            }
        });
    }

    // Window unload cleanup
    window.addEventListener('beforeunload', () => {
        if (window.canvasSingletonManager) {
            window.canvasSingletonManager.dispose();
        }
    });

    console.log('🎉 HIVE MIND CANVAS SINGLETON MANAGER: Comprehensive protection active!');

})();