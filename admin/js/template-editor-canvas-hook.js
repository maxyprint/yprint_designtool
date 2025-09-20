/**
 * Template Editor Canvas Hook
 * Ensures Fabric.js canvas instances are exposed globally for reference line system
 */

(function($) {
    'use strict';

    // Hook into TemplateEditor to expose canvas globally
    function hookTemplateEditor() {
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

    // Polling fallback - check every 200ms for 30 seconds
    function startPollingFallback() {
        console.log('🎯 CANVAS HOOK: Starting polling fallback...');
        let attempts = 0;
        const maxAttempts = 150; // 30 seconds

        const pollInterval = setInterval(() => {
            attempts++;

            // Check templateEditors
            if (window.templateEditors instanceof Map && window.templateEditors.size > 0) {
                for (const [key, editor] of window.templateEditors.entries()) {
                    if (editor && editor.canvas && !window.fabricCanvas) {
                        console.log('✅ CANVAS HOOK: Found canvas via polling!', key);
                        window.fabricCanvas = editor.canvas;
                        window.dispatchEvent(new CustomEvent('fabricCanvasReady', {
                            detail: { canvas: editor.canvas, editor: editor }
                        }));
                        clearInterval(pollInterval);
                        return;
                    }
                }
            }

            // Check variationsManager
            if (window.variationsManager && window.variationsManager.editors instanceof Map) {
                for (const [key, editor] of window.variationsManager.editors.entries()) {
                    if (editor && editor.canvas && !window.fabricCanvas) {
                        console.log('✅ CANVAS HOOK: Found canvas via variationsManager polling!', key);
                        window.fabricCanvas = editor.canvas;
                        window.dispatchEvent(new CustomEvent('fabricCanvasReady', {
                            detail: { canvas: editor.canvas, editor: editor }
                        }));
                        clearInterval(pollInterval);
                        return;
                    }
                }
            }

            // Check canvas elements directly
            const canvasElements = document.querySelectorAll('canvas');
            for (const canvas of canvasElements) {
                if (canvas.__fabric && !window.fabricCanvas) {
                    console.log('✅ CANVAS HOOK: Found fabric canvas via direct polling!');
                    window.fabricCanvas = canvas.__fabric;
                    window.dispatchEvent(new CustomEvent('fabricCanvasReady', {
                        detail: { canvas: canvas.__fabric, editor: null }
                    }));
                    clearInterval(pollInterval);
                    return;
                }
            }

            if (attempts >= maxAttempts) {
                console.warn('🔶 CANVAS HOOK: Polling timeout after 30 seconds');
                clearInterval(pollInterval);
            }
        }, 200);
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

    // Initialize when DOM is ready
    $(document).ready(function() {
        console.log('🎯 CANVAS HOOK: Initializing canvas detection hooks...');

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
    });

})(jQuery);