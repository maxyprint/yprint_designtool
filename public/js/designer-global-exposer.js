/**
 * Designer Global Exposer
 * Ensures DesignerWidget class is available globally for design-data-capture system
 */

(function() {
    'use strict';

    console.log('🎯 DESIGNER EXPOSER: Starting DesignerWidget global exposure');
    console.log('🔍 WEBPACK DEBUG: Available globals:', {
        webpackChunk: !!window.webpackChunkocto_print_designer,
        webpackRequire: !!window.__webpack_require__,
        octoPrintDesigner: !!window.octoPrintDesigner
    });

    // Function to expose DesignerWidget from webpack bundle
    function exposeDesignerWidget() {
        // Method 1: Check if already globally available
        if (typeof window.DesignerWidget !== 'undefined') {
            console.log('✅ DESIGNER EXPOSER: DesignerWidget already globally available');
            return true;
        }

        // Method 2: Extract from webpack entry point exports
        if (typeof window.__webpack_require__ === 'function') {
            try {
                // Try to get the Designer.js module directly
                const designerModule = window.__webpack_require__('./public/js/src/Designer.js');
                if (designerModule && designerModule.DesignerWidget) {
                    window.DesignerWidget = designerModule.DesignerWidget;
                    console.log('✅ DESIGNER EXPOSER: DesignerWidget exposed from entry module');
                    return true;
                }
            } catch (err) {
                console.log('🔍 DESIGNER EXPOSER: Entry module not accessible, searching cache...');
            }

            // Try alternative webpack entry points
            const alternativeEntries = [
                './public/js/src/Designer.js',
                'designer',
                'Designer',
                './Designer.js',
                './src/Designer.js'
            ];

            for (const entry of alternativeEntries) {
                try {
                    const module = window.__webpack_require__(entry);
                    if (module && module.DesignerWidget) {
                        window.DesignerWidget = module.DesignerWidget;
                        console.log('✅ DESIGNER EXPOSER: DesignerWidget exposed from alternative entry:', entry);
                        return true;
                    }
                } catch (err) {
                    // Continue trying
                }
            }

            try {
                // Search webpack module cache for DesignerWidget export
                const cache = window.__webpack_require__.cache;
                console.log('🔍 DESIGNER EXPOSER: Searching', Object.keys(cache).length, 'cached modules');

                for (const moduleId in cache) {
                    const module = cache[moduleId];
                    if (module && module.exports) {
                        // Check direct export of DesignerWidget
                        if (typeof module.exports.DesignerWidget === 'function') {
                            window.DesignerWidget = module.exports.DesignerWidget;
                            console.log('✅ DESIGNER EXPOSER: DesignerWidget exposed from module:', moduleId);
                            return true;
                        }

                        // Check ES module default export
                        if (module.exports.__esModule && module.exports.default && typeof module.exports.default.DesignerWidget === 'function') {
                            window.DesignerWidget = module.exports.default.DesignerWidget;
                            console.log('✅ DESIGNER EXPOSER: DesignerWidget exposed from ES module default:', moduleId);
                            return true;
                        }

                        // Check all exported properties for DesignerWidget
                        const exportKeys = Object.keys(module.exports);
                        for (const key of exportKeys) {
                            if (key === 'DesignerWidget' && typeof module.exports[key] === 'function') {
                                window.DesignerWidget = module.exports[key];
                                console.log('✅ DESIGNER EXPOSER: DesignerWidget exposed from export key:', key, 'in module:', moduleId);
                                return true;
                            }

                            // Look for constructor-like functions that might be DesignerWidget
                            if (typeof module.exports[key] === 'function') {
                                const funcStr = module.exports[key].toString();
                                if (funcStr.includes('fabricCanvas') && funcStr.includes('container') && funcStr.includes('octo-print-designer')) {
                                    window.DesignerWidget = module.exports[key];
                                    console.log('✅ DESIGNER EXPOSER: DesignerWidget identified from function signature:', key, 'in module:', moduleId);
                                    return true;
                                }
                            }
                        }
                    }
                }

                // Try to access the modules object directly
                const modules = window.__webpack_require__.m;
                if (modules) {
                    console.log('🔍 DESIGNER EXPOSER: Searching', Object.keys(modules).length, 'webpack modules');
                    for (const moduleId in modules) {
                        try {
                            const moduleExports = window.__webpack_require__(moduleId);
                            if (moduleExports && typeof moduleExports.DesignerWidget === 'function') {
                                window.DesignerWidget = moduleExports.DesignerWidget;
                                console.log('✅ DESIGNER EXPOSER: DesignerWidget exposed from direct module require:', moduleId);
                                return true;
                            }
                        } catch (err) {
                            // Continue searching
                        }
                    }
                }

            } catch (error) {
                console.warn('⚠️ DESIGNER EXPOSER: Webpack extraction failed:', error.message);
            }
        }

        // Method 3: Try accessing webpack chunk system directly
        if (window.webpackChunkocto_print_designer) {
            try {
                console.log('🔍 DESIGNER EXPOSER: Found webpack chunk system, searching for DesignerWidget...');

                // The webpack chunk array contains loaded modules
                const chunkArray = window.webpackChunkocto_print_designer;
                for (let i = 0; i < chunkArray.length; i++) {
                    const chunk = chunkArray[i];
                    if (chunk && chunk[1]) { // chunk[1] contains modules
                        const modules = chunk[1];
                        for (const moduleId in modules) {
                            const moduleFactory = modules[moduleId];
                            if (typeof moduleFactory === 'function') {
                                try {
                                    // Create a mock webpack context to execute the module
                                    const mockExports = {};
                                    const mockModule = { exports: mockExports };
                                    const mockRequire = window.__webpack_require__ || function() { return {}; };

                                    // Execute the module factory
                                    moduleFactory(mockModule, mockExports, mockRequire);

                                    // Check if this module exports DesignerWidget
                                    if (mockExports.DesignerWidget && typeof mockExports.DesignerWidget === 'function') {
                                        window.DesignerWidget = mockExports.DesignerWidget;
                                        console.log('✅ DESIGNER EXPOSER: DesignerWidget exposed from webpack chunk module:', moduleId);
                                        return true;
                                    }
                                } catch (err) {
                                    // Continue searching
                                }
                            }
                        }
                    }
                }
            } catch (error) {
                console.warn('⚠️ DESIGNER EXPOSER: Webpack chunk extraction failed:', error.message);
            }
        }

        // Method 4: Look for instantiated designer widgets in the DOM
        if (typeof window.$ !== 'undefined') {
            try {
                // Check for existing canvas elements that might have designer instances
                const canvasElements = document.querySelectorAll('canvas');
                for (const canvas of canvasElements) {
                    if (canvas.__fabric && canvas.__fabric.constructor) {
                        // Try to extract the DesignerWidget from canvas instances
                        const fabricInstance = canvas.__fabric;

                        // Look for parent designer object
                        if (fabricInstance.designer && typeof fabricInstance.designer.constructor === 'function') {
                            window.DesignerWidget = fabricInstance.designer.constructor;
                            console.log('✅ DESIGNER EXPOSER: DesignerWidget exposed from canvas designer instance');
                            return true;
                        }
                    }
                }
            } catch (error) {
                console.warn('⚠️ DESIGNER EXPOSER: DOM extraction failed:', error.message);
            }
        }

        return false;
    }

    // Try immediate exposure
    if (exposeDesignerWidget()) {
        // Trigger event to notify other scripts
        window.dispatchEvent(new CustomEvent('designerWidgetExposed', {
            detail: { DesignerWidget: window.DesignerWidget }
        }));
        return;
    }

    // If not available immediately, wait for webpack to load
    let attempts = 0;
    const maxAttempts = 20;
    const retryInterval = 250;

    const retryExposure = setInterval(function() {
        attempts++;
        console.log('🔄 DESIGNER EXPOSER: Attempt', attempts, 'to expose DesignerWidget');

        if (exposeDesignerWidget()) {
            clearInterval(retryExposure);
            // Trigger event to notify other scripts
            window.dispatchEvent(new CustomEvent('designerWidgetExposed', {
                detail: { DesignerWidget: window.DesignerWidget }
            }));
        } else if (attempts >= maxAttempts) {
            console.error('❌ DESIGNER EXPOSER: Failed to expose DesignerWidget after', maxAttempts, 'attempts');
            console.error('Available global objects:', Object.keys(window).filter(key => key.toLowerCase().includes('design')));
            clearInterval(retryExposure);
        }
    }, retryInterval);

    console.log('🚀 DESIGNER EXPOSER: Initialized');

})();