/**
 * 🚀 OPTIMIZED CANVAS DETECTION - Performance Enhancement
 *
 * MISSION: Replace heavy polling with efficient event-driven canvas detection
 * Reduces canvas detection overhead from continuous polling to targeted events
 */

(function() {
    'use strict';

    console.log('🚀 OPTIMIZED CANVAS DETECTION: Initializing');

    // Prevent multiple initializations
    if (window.optimizedCanvasDetectionActive) {
        console.log('✅ OPTIMIZED CANVAS DETECTION: Already active');
        return;
    }
    window.optimizedCanvasDetectionActive = true;

    // Configuration
    const config = {
        maxRetries: 5,
        retryDelay: 200,
        debounceDelay: 100
    };

    // State management
    const state = {
        canvasFound: false,
        retryCount: 0,
        watchers: new Set()
    };

    /**
     * Optimized canvas finder - single efficient search
     */
    function findCanvas() {
        // Strategy 1: Direct global access
        if (window.fabricCanvas && window.fabricCanvas.getObjects) {
            return window.fabricCanvas;
        }

        // Strategy 2: Template editors map
        if (window.templateEditors instanceof Map && window.templateEditors.size > 0) {
            for (const [key, editor] of window.templateEditors.entries()) {
                if (editor && editor.canvas && editor.canvas.getObjects) {
                    return editor.canvas;
                }
            }
        }

        // Strategy 3: Variations manager
        if (window.variationsManager && window.variationsManager.editors instanceof Map) {
            for (const [key, editor] of window.variationsManager.editors.entries()) {
                if (editor && editor.canvas && editor.canvas.getObjects) {
                    return editor.canvas;
                }
            }
        }

        // Strategy 4: DOM canvas elements (last resort)
        const canvasElements = document.querySelectorAll('canvas');
        for (const canvas of canvasElements) {
            if (canvas.__fabric && canvas.__fabric.getObjects) {
                return canvas.__fabric;
            }
        }

        return null;
    }

    /**
     * Canvas ready handler
     */
    function handleCanvasReady(canvas, source = 'optimized-detection') {
        if (state.canvasFound) return;

        state.canvasFound = true;
        window.fabricCanvas = canvas;

        console.log('✅ OPTIMIZED CANVAS DETECTION: Canvas found via', source);

        // Dispatch ready event
        const event = new CustomEvent('fabricCanvasReady', {
            detail: {
                canvas: canvas,
                source: source,
                optimized: true,
                retryCount: state.retryCount
            }
        });

        document.dispatchEvent(event);
        window.dispatchEvent(event);

        // Clear any active watchers
        state.watchers.forEach(watcherId => clearTimeout(watcherId));
        state.watchers.clear();
    }

    /**
     * Debounced detection with retry logic
     */
    function attemptDetection() {
        const canvas = findCanvas();

        if (canvas) {
            handleCanvasReady(canvas, 'direct-find');
            return true;
        }

        if (state.retryCount < config.maxRetries) {
            state.retryCount++;
            const watcherId = setTimeout(() => {
                state.watchers.delete(watcherId);
                attemptDetection();
            }, config.retryDelay);
            state.watchers.add(watcherId);
        } else {
            console.warn('⚠️ OPTIMIZED CANVAS DETECTION: Max retries reached');
        }

        return false;
    }

    /**
     * Efficient property watchers using getters/setters
     */
    function setupPropertyWatchers() {
        // Watch templateEditors
        if (!window.templateEditors) {
            let templateEditorsValue;
            Object.defineProperty(window, 'templateEditors', {
                get() { return templateEditorsValue; },
                set(newValue) {
                    templateEditorsValue = newValue;
                    if (newValue instanceof Map && !state.canvasFound) {
                        console.log('🔍 OPTIMIZED DETECTION: templateEditors set');
                        setTimeout(() => attemptDetection(), config.debounceDelay);
                    }
                },
                configurable: true
            });
        }

        // Watch variationsManager
        if (!window.variationsManager) {
            let variationsManagerValue;
            Object.defineProperty(window, 'variationsManager', {
                get() { return variationsManagerValue; },
                set(newValue) {
                    variationsManagerValue = newValue;
                    if (newValue && newValue.editors && !state.canvasFound) {
                        console.log('🔍 OPTIMIZED DETECTION: variationsManager set');
                        setTimeout(() => attemptDetection(), config.debounceDelay);
                    }
                },
                configurable: true
            });
        }
    }

    /**
     * Event listeners for external canvas creation
     */
    function setupEventListeners() {
        // Listen for fabric canvas ready events from other sources
        const eventTypes = [
            'fabricready',
            'fabric-loaded',
            'webpack-fabric-ready',
            'canvas-initialized'
        ];

        eventTypes.forEach(eventType => {
            document.addEventListener(eventType, () => {
                if (!state.canvasFound) {
                    setTimeout(() => attemptDetection(), config.debounceDelay);
                }
            });
        });

        // DOM mutation observer for canvas elements (lightweight)
        if (window.MutationObserver && !state.canvasFound) {
            const observer = new MutationObserver((mutations) => {
                let shouldCheck = false;

                mutations.forEach((mutation) => {
                    if (mutation.type === 'childList') {
                        mutation.addedNodes.forEach((node) => {
                            if (node.nodeType === 1) { // Element node
                                if (node.tagName === 'CANVAS' ||
                                    node.querySelector && node.querySelector('canvas')) {
                                    shouldCheck = true;
                                }
                            }
                        });
                    }
                });

                if (shouldCheck && !state.canvasFound) {
                    setTimeout(() => attemptDetection(), config.debounceDelay);
                }
            });

            observer.observe(document.body, {
                childList: true,
                subtree: true
            });

            // Stop observing once canvas is found
            document.addEventListener('fabricCanvasReady', () => {
                observer.disconnect();
            });
        }
    }

    /**
     * Smart fabric prototype monitoring (minimal overhead)
     */
    function setupFabricMonitoring() {
        // Only hook if fabric is available
        if (window.fabric && window.fabric.Canvas) {
            const originalInitialize = window.fabric.Canvas.prototype.initialize;

            if (originalInitialize && !originalInitialize._optimizedHooked) {
                window.fabric.Canvas.prototype.initialize = function(...args) {
                    const result = originalInitialize.apply(this, args);

                    if (!state.canvasFound) {
                        console.log('🔍 OPTIMIZED DETECTION: New Fabric Canvas initialized');
                        setTimeout(() => {
                            if (this.getObjects) {
                                handleCanvasReady(this, 'fabric-prototype');
                            }
                        }, 50);
                    }

                    return result;
                };
                window.fabric.Canvas.prototype.initialize._optimizedHooked = true;
            }
        }
    }

    /**
     * Initialize optimized detection system
     */
    function initialize() {
        // Skip if already in admin context that doesn't need canvas
        if (window.octoAdminContext && window.octoAdminContext.skip_canvas_polling) {
            console.log('✅ OPTIMIZED CANVAS DETECTION: Skipping - admin context');
            return;
        }

        // Try immediate detection first
        if (attemptDetection()) {
            return;
        }

        // Setup watchers and listeners
        setupPropertyWatchers();
        setupEventListeners();
        setupFabricMonitoring();

        console.log('🚀 OPTIMIZED CANVAS DETECTION: Monitoring active');
    }

    // Initialize when fabric is ready
    if (window.fabric && window.fabric.Canvas) {
        initialize();
    } else {
        // Wait for fabric to load
        const fabricCheckInterval = setInterval(() => {
            if (window.fabric && window.fabric.Canvas) {
                clearInterval(fabricCheckInterval);
                initialize();
            }
        }, 100);

        // Timeout after 5 seconds
        setTimeout(() => {
            clearInterval(fabricCheckInterval);
            if (!window.fabric || !window.fabric.Canvas) {
                console.warn('⚠️ OPTIMIZED CANVAS DETECTION: Fabric.js not available after timeout');
            }
        }, 5000);
    }

    // Expose utility functions for debugging
    window.optimizedCanvasDetection = {
        findCanvas,
        getState: () => ({ ...state }),
        forceDetection: attemptDetection
    };

    console.log('🚀 OPTIMIZED CANVAS DETECTION: System ready');

})();