/**
 * FABRIC FORCE LOADER - Immediate fabric.js loading
 * Lädt fabric.js sofort ohne auf andere Scripts zu warten
 */

(function() {
    'use strict';

    console.log('🚀 FABRIC FORCE LOADER: Starting immediate fabric.js loading');

    // Prevent multiple executions
    if (window.fabricForceLoaderActive) {
        console.log('✅ FABRIC FORCE LOADER: Already active, skipping');
        return;
    }
    window.fabricForceLoaderActive = true;

    // Check if fabric is already available
    if (window.fabric && typeof window.fabric.Canvas === 'function') {
        console.log('✅ FABRIC FORCE LOADER: fabric.js already available');
        triggerFabricReady();
        return;
    }

    /**
     * Load fabric.js directly from CDN immediately
     */
    function loadFabricImmediately() {
        return new Promise((resolve, reject) => {
            console.log('🔄 FABRIC FORCE LOADER: Loading fabric.js from CDN immediately');

            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/fabric.js/5.3.0/fabric.min.js';
            script.crossOrigin = 'anonymous';

            script.onload = function() {
                console.log('✅ FABRIC FORCE LOADER: fabric.js loaded from CDN');

                // Verify fabric is available
                if (typeof window.fabric !== 'undefined' && typeof window.fabric.Canvas === 'function') {
                    console.log('✅ FABRIC FORCE LOADER: window.fabric verified available');
                    console.log('Fabric.js details:', {
                        hasCanvas: typeof window.fabric.Canvas !== 'undefined',
                        hasImage: typeof window.fabric.Image !== 'undefined',
                        hasText: typeof window.fabric.Text !== 'undefined',
                        version: window.fabric.version || 'unknown'
                    });
                    triggerFabricReady();
                    resolve();
                } else {
                    console.error('❌ FABRIC FORCE LOADER: fabric.js loaded but window.fabric not available');
                    reject(new Error('fabric.js loaded but not accessible'));
                }
            };

            script.onerror = function() {
                console.error('❌ FABRIC FORCE LOADER: Failed to load fabric.js from CDN');
                reject(new Error('Failed to load fabric.js from CDN'));
            };

            // Insert script into head for immediate loading
            document.head.appendChild(script);
        });
    }

    /**
     * Trigger fabric ready event
     */
    function triggerFabricReady() {
        if (window.fabric) {
            console.log('🎉 FABRIC FORCE LOADER: Dispatching fabricGlobalReady event');

            window.dispatchEvent(new CustomEvent('fabricGlobalReady', {
                detail: {
                    fabric: window.fabric,
                    source: 'force-loader',
                    timestamp: Date.now()
                }
            }));

            // Set global flags
            window.fabricManuallyExposed = true;
            window.fabricForceLoaded = true;

            console.log('✅ FABRIC FORCE LOADER: window.fabric ready and event dispatched');

            // Test basic functionality
            try {
                const testCanvas = new window.fabric.Canvas();
                console.log('✅ FABRIC FORCE LOADER: Basic Canvas test successful');
                testCanvas.dispose(); // Clean up test canvas
            } catch (error) {
                console.error('❌ FABRIC FORCE LOADER: Canvas test failed:', error);
            }
        }
    }

    // Load immediately
    loadFabricImmediately().catch(error => {
        console.error('❌ FABRIC FORCE LOADER: Loading failed:', error);

        // Try fallback CDN
        console.log('🔄 FABRIC FORCE LOADER: Trying fallback CDN...');
        const fallbackScript = document.createElement('script');
        fallbackScript.src = 'https://unpkg.com/fabric@5.3.0/dist/fabric.min.js';
        fallbackScript.onload = function() {
            console.log('✅ FABRIC FORCE LOADER: Fallback CDN worked');
            triggerFabricReady();
        };
        fallbackScript.onerror = function() {
            console.error('❌ FABRIC FORCE LOADER: Even fallback CDN failed');
        };
        document.head.appendChild(fallbackScript);
    });

    console.log('🚀 FABRIC FORCE LOADER: Initialized and loading');

})();