/**
 * Webpack Designer Patch
 * Direct intervention to expose DesignerWidget from webpack bundle
 * This patches the webpack runtime to intercept module loading
 */

(function() {
    'use strict';

    console.log('🚀 WEBPACK PATCH: Starting aggressive DesignerWidget exposure');

    // Method 1: Patch webpack chunk loading to intercept Designer module
    if (window.webpackChunkocto_print_designer) {
        const originalPush = window.webpackChunkocto_print_designer.push;

        window.webpackChunkocto_print_designer.push = function(chunkData) {
            console.log('🔍 WEBPACK PATCH: Intercepting chunk load:', chunkData);

            // Call original push first
            const result = originalPush.call(this, chunkData);

            // Check if this chunk contains Designer module
            if (chunkData && chunkData[1]) {
                const modules = chunkData[1];
                for (const moduleId in modules) {
                    if (moduleId.includes('Designer')) {
                        console.log('🎯 WEBPACK PATCH: Found Designer module in chunk:', moduleId);

                        // Try to execute this module and extract DesignerWidget
                        setTimeout(() => {
                            tryExtractFromModule(moduleId);
                        }, 100);
                    }
                }
            }

            return result;
        };

        console.log('✅ WEBPACK PATCH: Chunk loading interceptor installed');
    }

    // Method 2: Override __webpack_require__ to intercept module loading
    if (window.__webpack_require__) {
        const originalRequire = window.__webpack_require__;

        window.__webpack_require__ = function(moduleId) {
            const result = originalRequire.call(this, moduleId);

            // Check if this is the Designer module
            if (result && result.DesignerWidget && typeof result.DesignerWidget === 'function') {
                console.log('🎯 WEBPACK PATCH: DesignerWidget intercepted from module:', moduleId);
                window.DesignerWidget = result.DesignerWidget;

                // Trigger event
                window.dispatchEvent(new CustomEvent('designerWidgetExposed', {
                    detail: { DesignerWidget: window.DesignerWidget, source: 'webpack-patch' }
                }));
            }

            return result;
        };

        // Copy over webpack properties
        Object.setPrototypeOf(window.__webpack_require__, originalRequire);
        Object.keys(originalRequire).forEach(key => {
            window.__webpack_require__[key] = originalRequire[key];
        });

        console.log('✅ WEBPACK PATCH: Module require interceptor installed');
    }

    // Method 3: Direct module extraction helper
    function tryExtractFromModule(moduleId) {
        try {
            if (window.__webpack_require__) {
                const moduleExports = window.__webpack_require__(moduleId);

                if (moduleExports && moduleExports.DesignerWidget) {
                    console.log('🎯 WEBPACK PATCH: Successfully extracted DesignerWidget from:', moduleId);
                    window.DesignerWidget = moduleExports.DesignerWidget;

                    // Trigger event
                    window.dispatchEvent(new CustomEvent('designerWidgetExposed', {
                        detail: { DesignerWidget: window.DesignerWidget, source: 'direct-extraction' }
                    }));

                    return true;
                }
            }
        } catch (error) {
            console.log('⚠️ WEBPACK PATCH: Failed to extract from module:', moduleId, error.message);
        }
        return false;
    }

    // Method 4: Brute force search all currently loaded modules
    function bruteForceSearch() {
        console.log('🔍 WEBPACK PATCH: Starting brute force module search...');

        if (window.__webpack_require__ && window.__webpack_require__.cache) {
            const cache = window.__webpack_require__.cache;
            let searchCount = 0;

            for (const moduleId in cache) {
                searchCount++;
                const module = cache[moduleId];

                if (module && module.exports) {
                    // Direct DesignerWidget export
                    if (module.exports.DesignerWidget && typeof module.exports.DesignerWidget === 'function') {
                        console.log('🎯 WEBPACK PATCH: Found DesignerWidget in cache module:', moduleId);
                        window.DesignerWidget = module.exports.DesignerWidget;

                        window.dispatchEvent(new CustomEvent('designerWidgetExposed', {
                            detail: { DesignerWidget: window.DesignerWidget, source: 'brute-force-cache' }
                        }));

                        return true;
                    }

                    // ES module export
                    if (module.exports.__esModule && module.exports.default && module.exports.default.DesignerWidget) {
                        console.log('🎯 WEBPACK PATCH: Found DesignerWidget in ES module:', moduleId);
                        window.DesignerWidget = module.exports.default.DesignerWidget;

                        window.dispatchEvent(new CustomEvent('designerWidgetExposed', {
                            detail: { DesignerWidget: window.DesignerWidget, source: 'brute-force-es-module' }
                        }));

                        return true;
                    }

                    // Search in all exported properties
                    for (const exportKey in module.exports) {
                        const exportValue = module.exports[exportKey];
                        if (typeof exportValue === 'function') {
                            const funcStr = exportValue.toString();
                            // Check function signature for DesignerWidget characteristics
                            if (funcStr.includes('fabricCanvas') &&
                                funcStr.includes('container') &&
                                funcStr.includes('octo-print-designer')) {
                                console.log('🎯 WEBPACK PATCH: Found DesignerWidget by signature in:', moduleId, 'export:', exportKey);
                                window.DesignerWidget = exportValue;

                                window.dispatchEvent(new CustomEvent('designerWidgetExposed', {
                                    detail: { DesignerWidget: window.DesignerWidget, source: 'brute-force-signature' }
                                }));

                                return true;
                            }
                        }
                    }
                }
            }

            console.log('🔍 WEBPACK PATCH: Searched', searchCount, 'cached modules');
        }

        // Search webpack modules registry
        if (window.__webpack_require__ && window.__webpack_require__.m) {
            const modules = window.__webpack_require__.m;
            let moduleCount = 0;

            for (const moduleId in modules) {
                moduleCount++;

                if (moduleId.includes('Designer') || moduleId.includes('designer')) {
                    console.log('🎯 WEBPACK PATCH: Found Designer-related module ID:', moduleId);

                    if (tryExtractFromModule(moduleId)) {
                        return true;
                    }
                }
            }

            console.log('🔍 WEBPACK PATCH: Searched', moduleCount, 'module definitions');
        }

        return false;
    }

    // Try immediate brute force search
    if (bruteForceSearch()) {
        console.log('✅ WEBPACK PATCH: DesignerWidget exposed successfully!');
    } else {
        // Retry periodically
        let attempts = 0;
        const maxAttempts = 10;

        const retrySearch = setInterval(() => {
            attempts++;
            console.log('🔄 WEBPACK PATCH: Retry attempt', attempts);

            if (bruteForceSearch()) {
                console.log('✅ WEBPACK PATCH: DesignerWidget exposed on retry', attempts);
                clearInterval(retrySearch);
            } else if (attempts >= maxAttempts) {
                console.error('❌ WEBPACK PATCH: Failed to expose DesignerWidget after', maxAttempts, 'attempts');

                // Final diagnostic
                console.log('🔍 FINAL DIAGNOSTIC:', {
                    webpackRequire: !!window.__webpack_require__,
                    webpackCache: window.__webpack_require__ ? Object.keys(window.__webpack_require__.cache || {}).length : 0,
                    webpackModules: window.__webpack_require__ ? Object.keys(window.__webpack_require__.m || {}).length : 0,
                    webpackChunk: !!window.webpackChunkocto_print_designer,
                    chunkLength: window.webpackChunkocto_print_designer ? window.webpackChunkocto_print_designer.length : 0
                });

                clearInterval(retrySearch);
            }
        }, 200);
    }

    console.log('🚀 WEBPACK PATCH: Initialization complete');

})();