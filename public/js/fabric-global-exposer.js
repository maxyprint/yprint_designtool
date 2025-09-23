/**
 * Fabric.js Global Exposer
 * Echte Lösung - Stellt sicher, dass Fabric.js als window.fabric verfügbar ist
 *
 * Diese Datei lädt nach dem vendor.bundle.js und exponiert Fabric.js global
 */

(function(global) {
    'use strict';

    console.log('🔧 Fabric Global Exposer: Starting clean Fabric.js exposure');

    // Check if webpack chunks are available
    function initializeFabricGlobal() {
        try {
            // Check if webpack is available
            if (typeof global.webpackChunkocto_print_designer === 'undefined') {
                console.warn('Fabric Global Exposer: Webpack chunks not found, retrying...');
                return false;
            }

            // Try to get Fabric from webpack modules
            let fabricModule = null;

            // Look through webpack chunks for Fabric.js
            if (global.__webpack_require__) {
                try {
                    // Try common Fabric.js module paths
                    const fabricPaths = [
                        "./node_modules/fabric/dist/index.min.mjs",
                        "./node_modules/fabric/dist/fabric.min.js",
                        "fabric"
                    ];

                    for (const path of fabricPaths) {
                        try {
                            fabricModule = global.__webpack_require__(path);
                            if (fabricModule && (fabricModule.fabric || fabricModule.default)) {
                                console.log('🔧 Fabric Global Exposer: Found Fabric.js in webpack modules');
                                break;
                            }
                        } catch (e) {
                            // Continue trying other paths
                        }
                    }
                } catch (e) {
                    console.warn('Fabric Global Exposer: Error accessing webpack modules:', e.message);
                }
            }

            // Extract Fabric from the module
            if (fabricModule) {
                const fabric = fabricModule.fabric || fabricModule.default || fabricModule;

                if (fabric && typeof fabric === 'object' && fabric.Canvas) {
                    global.fabric = fabric;
                    console.log('✅ Fabric Global Exposer: Successfully exposed Fabric.js globally');
                    console.log('Fabric capabilities:', {
                        hasCanvas: typeof fabric.Canvas === 'function',
                        hasImage: typeof fabric.Image === 'function',
                        hasRect: typeof fabric.Rect === 'function',
                        version: fabric.version || 'unknown'
                    });
                    return true;
                }
            }

            console.warn('Fabric Global Exposer: Could not extract Fabric from webpack modules');
            return false;

        } catch (error) {
            console.error('Fabric Global Exposer: Error during initialization:', error);
            return false;
        }
    }

    // Initialize immediately if possible
    if (initializeFabricGlobal()) {
        // Success - Fabric is now available
        global.fabricGloballyExposed = true;

        // Trigger custom event
        const event = new CustomEvent('fabricGloballyExposed', {
            detail: { fabric: global.fabric }
        });
        document.dispatchEvent(event);

    } else {
        // Retry mechanism - wait for webpack to be available
        console.log('Fabric Global Exposer: Waiting for webpack modules to be available...');

        let attempts = 0;
        const maxAttempts = 10;
        const retryInterval = 100; // ms

        const retryTimer = setInterval(() => {
            attempts++;

            if (initializeFabricGlobal()) {
                clearInterval(retryTimer);
                global.fabricGloballyExposed = true;

                // Trigger custom event
                const event = new CustomEvent('fabricGloballyExposed', {
                    detail: { fabric: global.fabric }
                });
                document.dispatchEvent(event);

            } else if (attempts >= maxAttempts) {
                clearInterval(retryTimer);
                console.error('❌ Fabric Global Exposer: Failed to expose Fabric.js after', maxAttempts, 'attempts');

                // Last resort: try to load Fabric.js from CDN
                loadFabricFromCDN();
            }
        }, retryInterval);
    }

    /**
     * Fallback: Load Fabric.js from CDN if webpack version fails
     */
    function loadFabricFromCDN() {
        console.log('🌐 Fabric Global Exposer: Loading Fabric.js from CDN as fallback');

        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/fabric.js/5.3.0/fabric.min.js';
        script.crossOrigin = 'anonymous';

        script.onload = function() {
            console.log('✅ Fabric Global Exposer: Fabric.js loaded from CDN');
            global.fabricGloballyExposed = true;
            global.fabricLoadedFromCDN = true;

            // Trigger custom event
            const event = new CustomEvent('fabricGloballyExposed', {
                detail: { fabric: global.fabric, loadedFromCDN: true }
            });
            document.dispatchEvent(event);
        };

        script.onerror = function() {
            console.error('❌ Fabric Global Exposer: Failed to load Fabric.js from CDN');
        };

        document.head.appendChild(script);
    }

    // Export status checker
    global.isFabricGloballyExposed = function() {
        return !!(global.fabric && global.fabric.Canvas && global.fabricGloballyExposed);
    };

    // Wait for fabric to be available - helper function for other scripts
    global.waitForFabric = function(callback, timeout = 5000) {
        if (global.isFabricGloballyExposed()) {
            callback(global.fabric);
            return;
        }

        let timeoutId;

        const handleFabricReady = function(event) {
            clearTimeout(timeoutId);
            document.removeEventListener('fabricGloballyExposed', handleFabricReady);
            callback(global.fabric);
        };

        document.addEventListener('fabricGloballyExposed', handleFabricReady);

        // Timeout fallback
        timeoutId = setTimeout(() => {
            document.removeEventListener('fabricGloballyExposed', handleFabricReady);
            console.warn('Fabric Global Exposer: Timeout waiting for Fabric.js');
            callback(null);
        }, timeout);
    };

})(window);