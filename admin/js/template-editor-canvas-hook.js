/**
 * Template Editor Canvas Hook - jQuery-Free Version
 * Ensures Fabric.js canvas instances are exposed globally for reference line system
 * AGENT 4 FIX: Eliminated jQuery dependency completely
 */

(function() {
    'use strict';

    // 🧠 AGENT 2 FIX: Enhanced admin context detection with selective polling
    const isAdminContext = (typeof window.octoAdminContext !== 'undefined') && window.octoAdminContext.context === 'woocommerce_admin';
    const allowSelectiveDetection = window.octoAdminContext && window.octoAdminContext.enable_selective_detection;

    // Hook into TemplateEditor to expose canvas globally
    function hookTemplateEditor() {
        if (isAdminContext) {
            if (window.octoAdminContext && window.octoAdminContext.skip_canvas_polling && !allowSelectiveDetection) {
                console.log('🧠 [CANVAS ADAPTER] Admin context detected - skipping canvas hooks entirely');
                // Early exit to prevent any canvas polling in admin
                return;
            }
            console.log('🧠 [CANVAS ADAPTER] Admin context detected with selective detection enabled');
        }

        console.log('🎯 CANVAS HOOK: Setting up TemplateEditor hooks...');

        // Method 0: Non-invasive Canvas instance detection via prototype monitoring
        if (window.fabric && window.fabric.Canvas) {
            console.log('🎯 CANVAS HOOK: Setting up non-invasive canvas detection...');

            // Monitor fabric.Canvas prototype for new instances
            const originalInitialize = window.fabric.Canvas.prototype.initialize;
            if (originalInitialize && typeof originalInitialize === 'function') {
                window.fabric.Canvas.prototype.initialize = function(...args) {
                    const result = originalInitialize.apply(this, args);

                    // Track this canvas instance
                    if (!window.fabricCanvas) {
                        console.log('✅ CANVAS HOOK: Canvas instance detected via prototype!');
                        window.fabricCanvas = this;
                        setTimeout(() => {
                            window.dispatchEvent(new CustomEvent('fabricCanvasReady', {
                                detail: { canvas: this, source: 'prototype' }
                            }));
                        }, 100);
                    }

                    return result;
                };
            }
        }

        // Method 1: Hook into window.templateEditors when it's created
        let templateEditorsValue = window.templateEditors;
        Object.defineProperty(window, 'templateEditors', {
            get() { return templateEditorsValue; },
            set(newValue) {
                templateEditorsValue = newValue;
                console.log('🎯 CANVAS HOOK: templateEditors set!', newValue);
                if (newValue instanceof Map) {
                    exposeFirstCanvas(newValue);
                    // Watch for new editors being added
                    watchMapChanges(newValue);
                }
            },
            configurable: true
        });

        // Method 2: Hook into variationsManager
        let variationsManagerValue = window.variationsManager;
        Object.defineProperty(window, 'variationsManager', {
            get() { return variationsManagerValue; },
            set(newValue) {
                variationsManagerValue = newValue;
                console.log('🎯 CANVAS HOOK: variationsManager set!', newValue);
                if (newValue && newValue.editors) {
                    exposeFirstCanvas(newValue.editors);
                }
            },
            configurable: true
        });

        // Method 3: Safe Map monitoring without prototype modification
        try {
            const originalMapSet = Map.prototype.set;
            if (originalMapSet && typeof originalMapSet === 'function') {
                Map.prototype.set = function(key, value) {
                    const result = originalMapSet.call(this, key, value);

                    // Check if this is the templateEditors map and the value has a canvas
                    if (this === window.templateEditors && value && value.canvas) {
                        console.log('🎯 CANVAS HOOK: New editor with canvas added to templateEditors!', key, value);
                        if (!window.fabricCanvas) {
                            window.fabricCanvas = value.canvas;
                            console.log('✅ CANVAS HOOK: Global fabricCanvas exposed!', window.fabricCanvas);

                            // Trigger custom event for reference line system
                            window.dispatchEvent(new CustomEvent('fabricCanvasReady', {
                                detail: { canvas: value.canvas, editor: value }
                            }));
                        }
                    }

                    return result;
                };
            }
        } catch (error) {
            console.log('🔶 CANVAS HOOK: Map.prototype.set override failed (readonly), using fallback polling');
        }
    }

    function exposeFirstCanvas(editorsMap) {
        if (!(editorsMap instanceof Map)) return;

        for (const [key, editor] of editorsMap.entries()) {
            if (editor && editor.canvas) {
                console.log('✅ CANVAS HOOK: Exposing canvas from editor:', key);
                window.fabricCanvas = editor.canvas;

                // Trigger event
                window.dispatchEvent(new CustomEvent('fabricCanvasReady', {
                    detail: { canvas: editor.canvas, editor: editor }
                }));
                break; // Only expose the first one
            }
        }
    }

    function watchMapChanges(map) {
        // Safe override of set method for this specific map instance
        try {
            const originalSet = map.set;
            if (originalSet && typeof originalSet === 'function') {
                map.set = function(key, value) {
                    const result = originalSet.call(this, key, value);
                    if (value && value.canvas && !window.fabricCanvas) {
                        console.log('🎯 CANVAS HOOK: Canvas detected in map change!');
                        window.fabricCanvas = value.canvas;
                        window.dispatchEvent(new CustomEvent('fabricCanvasReady', {
                            detail: { canvas: value.canvas, editor: value }
                        }));
                    }
                    return result;
                };
            }
        } catch (error) {
            console.log('🔶 CANVAS HOOK: Map instance override failed (readonly), relying on polling');
        }
    }

    // Enhanced polling with fabric instance validation and DOM Ready detection
    function startPollingFallback() {
        // 🧠 AGENT 2 FIX: CanvasSystemAdapter - Allow selective polling in admin context
        if (isAdminContext && window.octoAdminContext && window.octoAdminContext.skip_canvas_polling && !allowSelectiveDetection) {
            console.log('🧠 [CANVAS ADAPTER] Skipping polling fallback - admin context with skip_canvas_polling enabled');
            return;
        }

        console.log('🎯 CANVAS HOOK: Starting enhanced deterministic polling...');
        let attempts = 0;
        // 🔴 PHASE 4: Optimized timeout - reduced from 30 to 10 for better performance
        const maxAttempts = isAdminContext && allowSelectiveDetection ? 20 : (isAdminContext ? 3 : 10); // Reduced timeout
        const pollInterval = isAdminContext && allowSelectiveDetection ? 200 : (isAdminContext ? 200 : 100); // Optimized intervals

        const poll = setInterval(() => {
            attempts++;

            // 1. Check templateEditors with full validation
            if (window.templateEditors instanceof Map && window.templateEditors.size > 0) {
                for (const [key, editor] of window.templateEditors.entries()) {
                    if (editor && editor.canvas &&
                        typeof editor.canvas.add === 'function' &&
                        typeof editor.canvas.getObjects === 'function' &&
                        !window.fabricCanvas) {
                        console.log('✅ CANVAS HOOK: Found validated canvas via templateEditors!', key);
                        window.fabricCanvas = editor.canvas;
                        window.dispatchEvent(new CustomEvent('fabricCanvasReady', {
                            detail: { canvas: editor.canvas, editor: editor, source: 'templateEditors' }
                        }));
                        clearInterval(poll);
                        return;
                    }
                }
            }

            // 2. Check variationsManager with full validation
            if (window.variationsManager && window.variationsManager.editors instanceof Map) {
                for (const [key, editor] of window.variationsManager.editors.entries()) {
                    if (editor && editor.canvas &&
                        typeof editor.canvas.add === 'function' &&
                        typeof editor.canvas.getObjects === 'function' &&
                        !window.fabricCanvas) {
                        console.log('✅ CANVAS HOOK: Found validated canvas via variationsManager!', key);
                        window.fabricCanvas = editor.canvas;
                        window.dispatchEvent(new CustomEvent('fabricCanvasReady', {
                            detail: { canvas: editor.canvas, editor: editor, source: 'variationsManager' }
                        }));
                        clearInterval(poll);
                        return;
                    }
                }
            }

            // 3. Check canvas elements with fabric validation
            const canvasElements = document.querySelectorAll('canvas');
            for (const canvas of canvasElements) {
                if (canvas.__fabric &&
                    typeof canvas.__fabric.add === 'function' &&
                    typeof canvas.__fabric.getObjects === 'function' &&
                    !window.fabricCanvas) {
                    console.log('✅ CANVAS HOOK: Found validated fabric canvas via DOM!');
                    window.fabricCanvas = canvas.__fabric;
                    window.dispatchEvent(new CustomEvent('fabricCanvasReady', {
                        detail: { canvas: canvas.__fabric, editor: null, source: 'domFabric' }
                    }));
                    clearInterval(poll);
                    return;
                }
            }

            // 4. Check fabric.Canvas.getInstances() if available
            if (window.fabric && typeof window.fabric.Canvas?.getInstances === 'function') {
                const instances = window.fabric.Canvas.getInstances();
                if (instances && instances.length > 0 && !window.fabricCanvas) {
                    const canvas = instances[0];
                    if (typeof canvas.add === 'function' && typeof canvas.getObjects === 'function') {
                        console.log('✅ CANVAS HOOK: Found validated canvas via fabric.Canvas.getInstances()!');
                        window.fabricCanvas = canvas;
                        window.dispatchEvent(new CustomEvent('fabricCanvasReady', {
                            detail: { canvas: canvas, editor: null, source: 'fabricInstances' }
                        }));
                        clearInterval(poll);
                        return;
                    }
                }
            }

            // 5. AGENT 2 FIX: Enhanced template editor specific detection
            if (isAdminContext && allowSelectiveDetection) {
                // Look for WordPress template editor specific elements
                const templateContainers = document.querySelectorAll('.wp-block-template-part, .edit-site-canvas-container, .interface-interface-skeleton__content');
                for (const container of templateContainers) {
                    const canvasInContainer = container.querySelector('canvas');
                    if (canvasInContainer && canvasInContainer.__fabric && !window.fabricCanvas) {
                        console.log('✅ CANVAS HOOK: Found template editor canvas!');
                        window.fabricCanvas = canvasInContainer.__fabric;
                        window.dispatchEvent(new CustomEvent('fabricCanvasReady', {
                            detail: { canvas: canvasInContainer.__fabric, source: 'templateEditor' }
                        }));
                        clearInterval(poll);
                        return;
                    }
                }
            }

            // AGENT 4: Reduced logging frequency to minimize performance impact
            if (attempts % 10 === 0 || attempts === maxAttempts) {
                console.log(`🔄 CANVAS HOOK: Polling attempt ${attempts}/${maxAttempts} - Checking fabric instances...`);
            }

            if (attempts >= maxAttempts) {
                console.error('🚨 CANVAS HOOK: CRITICAL - Polling timeout after optimized duration');
                console.error('🔍 Final state debug:', {
                    fabricAvailable: !!window.fabric,
                    templateEditors: window.templateEditors instanceof Map ? window.templateEditors.size : 'not-map',
                    variationsManager: !!window.variationsManager,
                    canvasElements: document.querySelectorAll('canvas').length,
                    fabricInstances: window.fabric?.Canvas?.getInstances?.()?.length || 0
                });
                clearInterval(poll);
            }
        }, pollInterval);
    }

    // Wait for Fabric.js to be available
    function waitForFabric() {
        if (window.fabric && window.fabric.Canvas) {
            console.log('✅ CANVAS HOOK: Fabric.js is available, setting up hooks...');
            hookTemplateEditor();
            return;
        }

        console.log('🔍 CANVAS HOOK: Waiting for Fabric.js...');
        setTimeout(waitForFabric, 100);
    }

    // Initialize when DOM is ready - VANILLA JS VERSION
    function initializeCanvasHooks() {
        console.log('🎯 CANVAS HOOK: Initializing canvas detection hooks (jQuery-free)...');

        // Start Fabric.js detection
        waitForFabric();

        // Start polling fallback regardless
        startPollingFallback();

        // Also check if canvas is already available
        setTimeout(() => {
            if (!window.fabricCanvas) {
                console.log('🎯 CANVAS HOOK: Immediate check for existing canvas...');
                if (window.templateEditors instanceof Map) {
                    exposeFirstCanvas(window.templateEditors);
                }
                if (window.variationsManager && window.variationsManager.editors) {
                    exposeFirstCanvas(window.variationsManager.editors);
                }
            }
        }, 100);
    }

    // DOM Ready detection without jQuery
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeCanvasHooks);
    } else {
        // DOM already loaded
        initializeCanvasHooks();
    }

})();