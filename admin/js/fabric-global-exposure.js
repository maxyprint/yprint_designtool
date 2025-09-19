/**
 * Fabric.js Global Exposure Fix
 * Exposes the ES6 module bundled Fabric.js to window.fabric for global access
 *
 * 👑 ROYAL SOLUTION BY 32-AGENT HIERARCHICAL ANALYSIS
 */

(function($) {
    'use strict';

    console.log('🔧 FABRIC GLOBAL EXPOSURE: Starting exposure process...');

    // Method 1: Check if TemplateEditor exists and extract Fabric from it
    function extractFabricFromTemplateEditor() {
        if (window.templateEditors instanceof Map) {
            for (const [key, editor] of window.templateEditors.entries()) {
                if (editor && editor.canvas && editor.canvas.constructor) {
                    const fabricConstructor = editor.canvas.constructor;

                    // Extract the module that contains the Canvas constructor
                    const fabricModule = fabricConstructor.__fabric_module ||
                                       fabricConstructor.constructor ||
                                       fabricConstructor;

                    if (fabricModule && typeof fabricModule === 'function') {
                        // Reconstruct fabric object from Canvas constructor
                        const fabricObj = {
                            Canvas: fabricConstructor,
                            Object: (editor.canvas.getObjects()[0] && editor.canvas.getObjects()[0].constructor) || fabricConstructor.prototype.constructor,
                            util: fabricConstructor.util || {},
                            version: fabricConstructor.version || '5.x'
                        };

                        // Try to get more fabric classes from the canvas prototype chain
                        try {
                            const canvasProto = Object.getPrototypeOf(editor.canvas);
                            if (canvasProto && canvasProto.constructor) {
                                fabricObj.StaticCanvas = canvasProto.constructor;
                            }
                        } catch (e) {
                            console.log('🔧 Could not extract StaticCanvas:', e.message);
                        }

                        console.log('✅ FABRIC EXPOSURE: Extracted from TemplateEditor!', fabricObj);
                        return fabricObj;
                    }
                }
            }
        }
        return null;
    }

    // Method 2: Check if we can access webpack modules directly
    function extractFabricFromWebpack() {
        // Try to access webpack module cache
        if (window.webpackChunkocto_print_designer && typeof __webpack_require__ !== 'undefined') {
            try {
                // Try to require the fabric module directly
                const fabricModule = __webpack_require__('./node_modules/fabric/dist/index.min.mjs');
                if (fabricModule) {
                    console.log('✅ FABRIC EXPOSURE: Extracted from Webpack!', fabricModule);
                    return fabricModule;
                }
            } catch (e) {
                console.log('🔧 Webpack direct access failed:', e.message);
            }
        }
        return null;
    }

    // Method 3: Extract from canvas __fabric property and reverse-engineer
    function extractFabricFromCanvas() {
        const canvasElements = document.querySelectorAll('canvas');
        for (const canvas of canvasElements) {
            if (canvas.__fabric) {
                const fabricCanvas = canvas.__fabric;
                const fabricObj = {
                    Canvas: fabricCanvas.constructor,
                    Object: (fabricCanvas.getObjects()[0] && fabricCanvas.getObjects()[0].constructor),
                    version: '5.x'
                };

                console.log('✅ FABRIC EXPOSURE: Extracted from Canvas element!', fabricObj);
                return fabricObj;
            }
        }
        return null;
    }

    // Method 4: Intercept the next Canvas creation and extract fabric
    function interceptNextCanvasCreation() {
        if (window.fabricInterceptReady) return;

        // Override the native Canvas constructor temporarily
        const originalCanvas = HTMLCanvasElement.prototype.constructor;
        let fabricExtracted = false;

        // Look for existing Fabric Canvas constructors in window scope
        const potentialFabricRefs = [];

        // Scan all window properties for potential Fabric references
        Object.getOwnPropertyNames(window).forEach(prop => {
            try {
                const obj = window[prop];
                if (obj && typeof obj === 'function' && obj.name === 'Canvas' && obj.prototype && obj.prototype.add) {
                    potentialFabricRefs.push(obj);
                }
            } catch (e) {
                // Ignore access errors
            }
        });

        if (potentialFabricRefs.length > 0) {
            const fabricObj = {
                Canvas: potentialFabricRefs[0],
                version: '5.x'
            };
            console.log('✅ FABRIC EXPOSURE: Found potential Fabric Canvas!', fabricObj);
            return fabricObj;
        }

        window.fabricInterceptReady = true;
        return null;
    }

    // Main exposure function
    function exposeFabricGlobally() {
        console.log('🔧 FABRIC EXPOSURE: Attempting multiple extraction methods...');

        let fabricObj = null;

        // Try all methods in order of reliability
        fabricObj = extractFabricFromTemplateEditor() ||
                   extractFabricFromWebpack() ||
                   extractFabricFromCanvas() ||
                   interceptNextCanvasCreation();

        if (fabricObj) {
            // Expose to window.fabric
            window.fabric = fabricObj;

            console.log('🎉 FABRIC EXPOSURE SUCCESS: window.fabric is now available!', window.fabric);

            // Trigger events for waiting systems
            window.dispatchEvent(new CustomEvent('fabricGlobalReady', {
                detail: { fabric: window.fabric, source: 'global-exposure' }
            }));

            // Also trigger the existing event for compatibility
            window.dispatchEvent(new CustomEvent('fabricCanvasReady', {
                detail: {
                    canvas: window.fabricCanvas || (window.templateEditors && window.templateEditors.values().next().value && window.templateEditors.values().next().value.canvas),
                    source: 'global-exposure'
                }
            }));

            return true;
        }

        console.log('⏳ FABRIC EXPOSURE: No fabric found yet, will retry...');
        return false;
    }

    // Retry mechanism with progressive delays
    let retryCount = 0;
    const maxRetries = 15;

    function attemptExposure() {
        retryCount++;

        if (window.fabric) {
            console.log('✅ FABRIC EXPOSURE: window.fabric already exists!');
            return;
        }

        const success = exposeFabricGlobally();

        if (!success && retryCount < maxRetries) {
            const delay = Math.min(100 * retryCount, 2000); // Progressive delay up to 2s
            console.log(`🔧 FABRIC EXPOSURE: Retry ${retryCount}/${maxRetries} in ${delay}ms...`);
            setTimeout(attemptExposure, delay);
        } else if (!success) {
            console.error('❌ FABRIC EXPOSURE: Failed after all retries');
        }
    }

    // Start exposure attempts when DOM is ready
    $(document).ready(function() {
        console.log('🔧 FABRIC EXPOSURE: DOM ready, starting exposure...');

        // Immediate attempt
        attemptExposure();

        // Also watch for templateEditors changes
        let templateEditorsValue = window.templateEditors;
        Object.defineProperty(window, 'templateEditors', {
            get() { return templateEditorsValue; },
            set(newValue) {
                templateEditorsValue = newValue;
                console.log('🔧 FABRIC EXPOSURE: templateEditors updated, retrying...');
                if (!window.fabric) {
                    setTimeout(attemptExposure, 100);
                }
            },
            configurable: true
        });
    });

})(jQuery);