/**
 * Designer Global Exposer
 * Ensures DesignerWidget class is available globally for design-data-capture system
 */

(function() {
    'use strict';

    console.log('🎯 DESIGNER EXPOSER: Starting DesignerWidget global exposure');

    // Function to expose DesignerWidget from webpack bundle
    function exposeDesignerWidget() {
        // Method 1: Check if already globally available
        if (typeof window.DesignerWidget !== 'undefined') {
            console.log('✅ DESIGNER EXPOSER: DesignerWidget already globally available');
            return true;
        }

        // Method 2: Extract from webpack exports
        if (typeof window.__webpack_require__ === 'function') {
            try {
                // Find the designer entry module
                const entryPoints = [
                    './public/js/src/Designer.js',
                    './public/js/src/designer.js',
                    './src/Designer.js',
                    './Designer.js'
                ];

                for (const entryPoint of entryPoints) {
                    try {
                        const designerModule = window.__webpack_require__(entryPoint);
                        if (designerModule && designerModule.DesignerWidget) {
                            window.DesignerWidget = designerModule.DesignerWidget;
                            console.log('✅ DESIGNER EXPOSER: DesignerWidget exposed from webpack entry:', entryPoint);
                            return true;
                        }
                    } catch (err) {
                        // Continue trying other entry points
                    }
                }

                // Search all modules for DesignerWidget
                const cache = window.__webpack_require__.cache;
                for (const moduleId in cache) {
                    const module = cache[moduleId];
                    if (module && module.exports) {
                        // Check direct export
                        if (typeof module.exports.DesignerWidget === 'function') {
                            window.DesignerWidget = module.exports.DesignerWidget;
                            console.log('✅ DESIGNER EXPOSER: DesignerWidget exposed from module:', moduleId);
                            return true;
                        }

                        // Check if module exports has __esModule and default export
                        if (module.exports.__esModule && module.exports.default && typeof module.exports.default.DesignerWidget === 'function') {
                            window.DesignerWidget = module.exports.default.DesignerWidget;
                            console.log('✅ DESIGNER EXPOSER: DesignerWidget exposed from ES module default:', moduleId);
                            return true;
                        }

                        // Check nested properties
                        const exportKeys = Object.keys(module.exports);
                        for (const key of exportKeys) {
                            if (key.includes('Designer') && typeof module.exports[key] === 'function') {
                                // Try to verify if this is the DesignerWidget class
                                const potentialClass = module.exports[key];
                                const classString = potentialClass.toString();
                                if (classString.includes('fabricCanvas') || classString.includes('designer') || classString.includes('canvas')) {
                                    window.DesignerWidget = potentialClass;
                                    console.log('✅ DESIGNER EXPOSER: DesignerWidget exposed from nested property:', key, 'in module:', moduleId);
                                    return true;
                                }
                            }
                        }
                    }
                }

            } catch (error) {
                console.warn('⚠️ DESIGNER EXPOSER: Webpack extraction failed:', error.message);
            }
        }

        // Method 3: Look for instantiated designer widgets in the DOM
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