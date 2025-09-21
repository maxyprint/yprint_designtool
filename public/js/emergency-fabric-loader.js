/**
 * 🚨 EMERGENCY FABRIC.JS LOADER - Direct CDN Loading Solution
 *
 * CRITICAL PURPOSE: Load fabric.js directly from CDN to bypass webpack bundle issues
 * This script ensures fabric.js is available regardless of webpack configuration
 */

(function() {
    'use strict';

    console.log('🚨 EMERGENCY FABRIC LOADER: Starting critical fabric.js loading');

    // Wait for vendor bundle to load first, then check if fabric works
    function checkFabricAfterVendor() {
        return new Promise((resolve) => {
            // Give vendor bundle more time to load and extract fabric
            setTimeout(() => {
                // First check if fabric is already available
                if (window.fabric && typeof window.fabric.Canvas === 'function') {
                    console.log('✅ EMERGENCY FABRIC LOADER: fabric.js from vendor bundle working, skipping CDN load');
                    triggerFabricReady();
                    resolve(true);
                    return;
                }

                // Try webpack extraction since vendor bundle is loaded
                if (tryWebpackExtraction()) {
                    triggerFabricReady();
                    resolve(true);
                    return;
                }

                console.log('⚠️ EMERGENCY FABRIC LOADER: fabric.js from vendor bundle not working, loading from CDN');
                resolve(false);
            }, 1000); // Wait 1000ms for vendor bundle and extraction
        });
    }

    // Prevent multiple executions
    if (window.emergencyFabricLoaderActive) {
        console.log('✅ EMERGENCY FABRIC LOADER: Already active, skipping');
        return;
    }
    window.emergencyFabricLoaderActive = true;

    /**
     * Load fabric.js directly from CDN
     */
    function loadFabricFromCDN() {
        return new Promise((resolve, reject) => {
            console.log('🔄 EMERGENCY FABRIC LOADER: Loading fabric.js from CDN');

            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/fabric.js/5.3.0/fabric.min.js';
            script.crossOrigin = 'anonymous';
            // Note: Integrity check removed due to CDN version changes

            script.onload = function() {
                console.log('✅ EMERGENCY FABRIC LOADER: fabric.js loaded from CDN');

                // Verify fabric is available
                if (typeof window.fabric !== 'undefined' && typeof window.fabric.Canvas === 'function') {
                    console.log('✅ EMERGENCY FABRIC LOADER: window.fabric verified available');
                    resolve();
                } else {
                    console.error('❌ EMERGENCY FABRIC LOADER: fabric.js loaded but window.fabric not available');
                    reject(new Error('fabric.js loaded but not accessible'));
                }
            };

            script.onerror = function() {
                console.error('❌ EMERGENCY FABRIC LOADER: Failed to load fabric.js from CDN');
                reject(new Error('Failed to load fabric.js from CDN'));
            };

            // Insert script into head
            document.head.appendChild(script);
        });
    }

    /**
     * Try to extract fabric from existing webpack bundle as fallback
     */
    function tryWebpackExtraction() {
        console.log('🔄 EMERGENCY FABRIC LOADER: Attempting webpack extraction as fallback');

        // Method 1: Try to find fabric in webpack require cache
        if (typeof window.__webpack_require__ === 'function') {
            try {
                // Try common webpack module patterns for fabric
                const possibleModules = [
                    'fabric',
                    './node_modules/fabric/dist/fabric.min.js',
                    './node_modules/fabric/dist/index.min.mjs',
                    'fabric/dist/fabric.min'
                ];

                for (const moduleId of possibleModules) {
                    try {
                        const fabricModule = window.__webpack_require__(moduleId);
                        if (fabricModule && typeof fabricModule.Canvas === 'function') {
                            window.fabric = fabricModule;
                            console.log('✅ EMERGENCY FABRIC LOADER: Extracted fabric from webpack cache');
                            return true;
                        }
                    } catch (err) {
                        // Continue trying other modules
                    }
                }
            } catch (error) {
                console.log('⚠️ EMERGENCY FABRIC LOADER: Webpack require failed:', error.message);
            }
        }

        // Method 2: Look for any existing Canvas instances
        const canvasElements = document.querySelectorAll('canvas');
        for (const canvasEl of canvasElements) {
            if (canvasEl.__fabric && canvasEl.__fabric.constructor) {
                try {
                    const CanvasConstructor = canvasEl.__fabric.constructor;

                    // Try to build fabric namespace from constructor
                    if (typeof CanvasConstructor === 'function') {
                        window.fabric = {
                            Canvas: CanvasConstructor,
                            Image: CanvasConstructor.Image || null,
                            Object: CanvasConstructor.Object || null,
                            Text: CanvasConstructor.Text || null,
                            IText: CanvasConstructor.IText || null,
                            Group: CanvasConstructor.Group || null,
                            util: CanvasConstructor.util || {}
                        };

                        console.log('✅ EMERGENCY FABRIC LOADER: Extracted fabric from existing canvas');
                        return true;
                    }
                } catch (error) {
                    console.log('⚠️ EMERGENCY FABRIC LOADER: Canvas extraction failed:', error.message);
                }
            }
        }

        // Method 3: Search for fabric in global variables
        const globalSearch = ['fabric', 'Fabric', '__fabric__', '_fabric'];
        for (const prop of globalSearch) {
            if (window[prop] && typeof window[prop].Canvas === 'function') {
                window.fabric = window[prop];
                console.log('✅ EMERGENCY FABRIC LOADER: Found fabric in global variable:', prop);
                return true;
            }
        }

        return false;
    }

    /**
     * Trigger fabric ready event
     */
    function triggerFabricReady() {
        if (window.fabric) {
            window.dispatchEvent(new CustomEvent('fabricGlobalReady', {
                detail: {
                    fabric: window.fabric,
                    source: 'emergency-loader',
                    timestamp: Date.now()
                }
            }));

            // Set flag for design-loader
            window.fabricManuallyExposed = true;
            window.emergencyFabricLoaded = true;

            console.log('🎉 EMERGENCY FABRIC LOADER: window.fabric ready and event dispatched');
        }
    }

    /**
     * Main loading sequence
     */
    async function loadFabric() {
        try {
            // Method 1: Wait for vendor bundle and check if fabric works
            const vendorWorking = await checkFabricAfterVendor();
            if (vendorWorking) {
                return; // fabric.js from vendor bundle is working
            }

            // Method 2: Try webpack extraction (if vendor bundle loaded but fabric not exposed)
            if (tryWebpackExtraction()) {
                triggerFabricReady();
                return;
            }

            // Method 3: Load from CDN as last resort
            await loadFabricFromCDN();
            triggerFabricReady();

        } catch (error) {
            console.error('❌ EMERGENCY FABRIC LOADER: All loading methods failed:', error);

            // Dispatch failure event
            window.dispatchEvent(new CustomEvent('fabricLoadFailed', {
                detail: { error: error.message }
            }));
        }
    }

    // Start loading immediately
    loadFabric();

    console.log('🚀 EMERGENCY FABRIC LOADER: Initialized');

})();