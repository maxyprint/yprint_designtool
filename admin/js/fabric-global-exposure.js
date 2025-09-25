/**
 * Fabric.js Global Exposure Fix
 * Exposes the ES6 module bundled Fabric.js to window.fabric for global access
 *
 * 👑 ROYAL SOLUTION BY 32-AGENT HIERARCHICAL ANALYSIS
 */

(function($) {
    'use strict';

    console.log('🔧 FABRIC GLOBAL EXPOSURE: Starting exposure process...');

    // Method 1: ADVANCED TemplateEditor Fabric Extraction with Deep Canvas Analysis
    function extractFabricFromTemplateEditor() {
        if (window.templateEditors instanceof Map && window.templateEditors.size > 0) {
            console.log('🔧 FABRIC EXPOSURE: Found templateEditors Map with', window.templateEditors.size, 'editors');

            for (const [key, editor] of window.templateEditors.entries()) {
                console.log('🔧 FABRIC EXPOSURE: Analyzing editor:', key, editor);

                if (editor && editor.canvas) {
                    console.log('🔧 FABRIC EXPOSURE: Canvas found:', editor.canvas);

                    // Method 1A: Extract Fabric.js from Canvas constructor
                    const CanvasConstructor = editor.canvas.constructor;
                    if (CanvasConstructor && CanvasConstructor.name === 'Canvas') {
                        console.log('🔧 FABRIC EXPOSURE: Canvas constructor found:', CanvasConstructor);

                        // Try to access the parent module/namespace that contains all Fabric classes
                        let fabricNamespace = null;

                        // Check canvas prototype chain for fabric module reference
                        const canvasProto = Object.getPrototypeOf(editor.canvas);
                        if (canvasProto && canvasProto.constructor && canvasProto.constructor.__fabric_main_module) {
                            fabricNamespace = canvasProto.constructor.__fabric_main_module;
                        }

                        // Try to access via canvas instance properties
                        if (!fabricNamespace && editor.canvas.__fabric_module) {
                            fabricNamespace = editor.canvas.__fabric_module;
                        }

                        // Reverse-engineer fabric object from canvas methods and properties
                        const fabricObj = {
                            Canvas: CanvasConstructor,
                            StaticCanvas: Object.getPrototypeOf(CanvasConstructor),
                            Object: null,
                            Rect: null,
                            Image: null,
                            util: CanvasConstructor.util || {},
                            version: CanvasConstructor.version || '5.x'
                        };

                        // Method 1B: Extract Object classes from existing canvas objects
                        const canvasObjects = editor.canvas.getObjects();
                        if (canvasObjects && canvasObjects.length > 0) {
                            const firstObject = canvasObjects[0];
                            if (firstObject && firstObject.constructor) {
                                fabricObj.Object = firstObject.constructor;
                                console.log('🔧 FABRIC EXPOSURE: Found Object constructor from canvas object:', fabricObj.Object);
                            }
                        }

                        // Method 1C: Check if safeZone exists (usually a Rect)
                        if (editor.safeZone && editor.safeZone.constructor) {
                            fabricObj.Rect = editor.safeZone.constructor;
                            console.log('🔧 FABRIC EXPOSURE: Found Rect constructor from safeZone:', fabricObj.Rect);
                        }

                        // Method 1D: Try to access fabric from canvas internal properties
                        if (editor.canvas._objects) {
                            for (const obj of editor.canvas._objects) {
                                if (obj.type === 'rect' && obj.constructor) {
                                    fabricObj.Rect = obj.constructor;
                                }
                                if (obj.type === 'image' && obj.constructor) {
                                    fabricObj.Image = obj.constructor;
                                }
                                if (!fabricObj.Object && obj.constructor) {
                                    fabricObj.Object = obj.constructor;
                                }
                            }
                        }

                        // If we have Canvas constructor, create a comprehensive fabric object
                        if (CanvasConstructor) {
                            console.log('✅ FABRIC EXPOSURE: Successfully extracted from TemplateEditor!', fabricObj);
                            return fabricObj;
                        }
                    }
                }
            }
        } else {
            console.log('🔧 FABRIC EXPOSURE: No templateEditors Map found or empty');
        }
        return null;
    }

    // Method 2: WEBPACK MODULE CACHE HIJACKING - Direct Access to fabric__WEBPACK_IMPORTED_MODULE_1__
    function extractFabricFromWebpack() {
        console.log('🔧 FABRIC EXPOSURE: Attempting webpack module cache access...');

        // Method 2A: Try to access webpack chunk and module cache
        if (typeof window !== 'undefined' && window.webpackChunkocto_print_designer) {
            console.log('🔧 FABRIC EXPOSURE: Found webpack chunk:', window.webpackChunkocto_print_designer);

            try {
                // Try to access webpack require function
                if (typeof __webpack_require__ !== 'undefined') {
                    console.log('🔧 FABRIC EXPOSURE: __webpack_require__ is available');

                    // Try common fabric module paths
                    const fabricPaths = [
                        './node_modules/fabric/dist/index.min.mjs',
                        'fabric',
                        './node_modules/fabric/dist/fabric.min.js',
                        './node_modules/fabric/dist/index.js'
                    ];

                    for (const path of fabricPaths) {
                        try {
                            const fabricModule = __webpack_require__(path);
                            if (fabricModule && (fabricModule.Canvas || fabricModule.default)) {
                                console.log('✅ FABRIC EXPOSURE: Found fabric via webpack require:', path, fabricModule);
                                return fabricModule.default || fabricModule;
                            }
                        } catch (e) {
                            console.log('🔧 Webpack require failed for', path, ':', e.message);
                        }
                    }
                }

                // Method 2B: Try to access webpack module cache directly
                if (typeof __webpack_require__.cache !== 'undefined') {
                    console.log('🔧 FABRIC EXPOSURE: Accessing webpack module cache...');

                    for (const moduleId in __webpack_require__.cache) {
                        try {
                            const module = __webpack_require__.cache[moduleId];
                            if (module && module.exports) {
                                // Check if this module contains Fabric.js Canvas
                                const exports = module.exports;
                                if (exports.Canvas && typeof exports.Canvas === 'function') {
                                    console.log('✅ FABRIC EXPOSURE: Found Fabric in webpack cache!', moduleId, exports);
                                    return exports;
                                }
                                // Check for default export
                                if (exports.default && exports.default.Canvas) {
                                    console.log('✅ FABRIC EXPOSURE: Found Fabric default export in webpack cache!', moduleId, exports.default);
                                    return exports.default;
                                }
                            }
                        } catch (e) {
                            // Ignore individual module access errors
                        }
                    }
                }

            } catch (e) {
                console.log('🔧 Webpack module access failed:', e.message);
            }
        }

        // Method 2C: Try to find fabric in global webpack variables
        const possibleWebpackVars = ['webpackChunk', '__webpack_modules__', '__webpack_require__'];
        for (const varName of possibleWebpackVars) {
            if (window[varName]) {
                console.log('🔧 FABRIC EXPOSURE: Found webpack variable:', varName);
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

    // ADVANCED RETRY MECHANISM with TemplateEditor waiting and intelligent timing
    let retryCount = 0;
    const maxRetries = 20; // Increased retries
    let templateEditorWaitCount = 0;
    const maxTemplateEditorWait = 30; // Wait up to 30 attempts for templateEditors

    function attemptExposure() {
        retryCount++;

        if (window.fabric) {
            console.log('✅ FABRIC EXPOSURE: window.fabric already exists!');
            return;
        }

        // AGENT 2 FIX: Enhanced templateEditors detection with multiple timing strategies
        if (window.templateEditors instanceof Map && window.templateEditors.size === 0 && templateEditorWaitCount < maxTemplateEditorWait) {
            templateEditorWaitCount++;
            // Progressive delay: faster initial attempts, slower later ones for efficiency
            const waitDelay = Math.min(100 + (templateEditorWaitCount * 50), 500);
            console.log(`🔧 FABRIC EXPOSURE: Waiting for templateEditors to be populated... ${templateEditorWaitCount}/${maxTemplateEditorWait} (delay: ${waitDelay}ms)`);
            setTimeout(attemptExposure, waitDelay);
            return;
        }

        const success = exposeFabricGlobally();

        if (!success && retryCount < maxRetries) {
            const delay = Math.min(200 * retryCount, 3000); // Progressive delay up to 3s, slower progression
            console.log(`🔧 FABRIC EXPOSURE: Retry ${retryCount}/${maxRetries} in ${delay}ms...`);
            setTimeout(attemptExposure, delay);
        } else if (!success) {
            console.error('❌ FABRIC EXPOSURE: Failed after all retries');
            console.log('🔧 Final fabric extraction attempt status:', {
                templateEditors: window.templateEditors,
                templateEditorsSize: window.templateEditors instanceof Map ? window.templateEditors.size : 'not a Map',
                webpackChunk: window.webpackChunkocto_print_designer ? 'exists' : 'missing',
                webpackRequire: typeof __webpack_require__ !== 'undefined' ? 'available' : 'missing'
            });
        }
    }

    // Start exposure attempts when DOM is ready
    $(document).ready(function() {
        console.log('🔧 FABRIC EXPOSURE: DOM ready, starting exposure...');

        // Immediate attempt
        attemptExposure();

        // AGENT 2 FIX: Enhanced templateEditors monitoring with multiple event triggers
        let templateEditorsValue = window.templateEditors;
        Object.defineProperty(window, 'templateEditors', {
            get() { return templateEditorsValue; },
            set(newValue) {
                templateEditorsValue = newValue;
                console.log('🔧 FABRIC EXPOSURE: templateEditors updated, retrying...');
                if (!window.fabric) {
                    // Multiple timing strategies for better detection
                    setTimeout(attemptExposure, 50);   // Immediate retry
                    setTimeout(attemptExposure, 200);  // Quick retry
                    setTimeout(attemptExposure, 500);  // Delayed retry
                }
            },
            configurable: true
        });

        // AGENT 2 FIX: Listen for fabric loading events from other scripts
        window.addEventListener('fabricGlobalReady', function(event) {
            console.log('🔧 FABRIC EXPOSURE: Received fabricGlobalReady event');
            if (!window.fabric) {
                setTimeout(attemptExposure, 50);
            }
        });

        window.addEventListener('fabricCanvasReady', function(event) {
            console.log('🔧 FABRIC EXPOSURE: Received fabricCanvasReady event');
            if (!window.fabric && event.detail && event.detail.canvas) {
                setTimeout(attemptExposure, 50);
            }
        });
    });

})(jQuery);