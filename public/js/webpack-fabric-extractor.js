/**
 * 🎯 WEBPACK FABRIC EXTRACTOR - Proactive Global Exposure Solution
 *
 * MISSION: Extract fabric.js from webpack bundle and expose it globally BEFORE any dependent scripts
 * This replaces the complex emergency loader system with a deterministic solution
 */

(function() {
    'use strict';

    console.log('🎯 WEBPACK FABRIC EXTRACTOR: Starting proactive fabric.js extraction');

    // Prevent multiple executions
    if (window.webpackFabricExtractorActive) {
        console.log('✅ WEBPACK FABRIC EXTRACTOR: Already active, skipping');
        return;
    }
    window.webpackFabricExtractorActive = true;

    /**
     * Proactive webpack chunk monitoring and fabric extraction
     */
    function extractFabricFromWebpack() {
        // Check if webpack chunks are available
        if (typeof window.webpackChunkocto_print_designer === 'undefined') {
            console.log('⏳ WEBPACK FABRIC EXTRACTOR: Waiting for webpack chunks...');
            return false;
        }

        // Look for fabric module in webpack chunks
        try {
            // Access webpack require function
            if (typeof window.__webpack_require__ === 'function') {
                // Try to require the fabric module directly from webpack
                const fabricModuleId = './node_modules/fabric/dist/index.min.mjs';

                try {
                    const fabricModule = window.__webpack_require__(fabricModuleId);

                    if (fabricModule && fabricModule.Canvas && typeof fabricModule.Canvas === 'function') {
                        // Successfully extracted fabric from webpack
                        window.fabric = fabricModule;

                        console.log('✅ WEBPACK FABRIC EXTRACTOR: fabric.js successfully extracted from webpack');
                        console.log('🔍 FABRIC DEBUG: window.fabric.Canvas type:', typeof window.fabric.Canvas);
                        console.log('🔍 FABRIC DEBUG: Available classes:', Object.keys(window.fabric).slice(0, 10));

                        // Dispatch global ready event
                        dispatchFabricReadyEvents();
                        return true;
                    }
                } catch (moduleError) {
                    console.log('⚠️ WEBPACK FABRIC EXTRACTOR: Direct module require failed, trying alternative methods');
                }

                // Alternative: Search through webpack module cache
                if (window.__webpack_require__.cache) {
                    for (const moduleId in window.__webpack_require__.cache) {
                        try {
                            const module = window.__webpack_require__.cache[moduleId];
                            if (module && module.exports) {
                                const exports = module.exports;

                                // Check if this module exports fabric.js classes
                                if (exports.Canvas && typeof exports.Canvas === 'function' &&
                                    exports.Object && typeof exports.Object === 'function') {

                                    window.fabric = exports;
                                    console.log('✅ WEBPACK FABRIC EXTRACTOR: fabric.js found in webpack cache');
                                    dispatchFabricReadyEvents();
                                    return true;
                                }
                            }
                        } catch (cacheError) {
                            // Continue searching
                        }
                    }
                }
            }

            // Method 3: Check webpack chunk exports directly
            if (window.webpackChunkocto_print_designer) {
                for (const chunk of window.webpackChunkocto_print_designer) {
                    if (chunk && chunk[1]) {
                        const modules = chunk[1];
                        for (const moduleId in modules) {
                            if (moduleId.includes('fabric')) {
                                try {
                                    // Create a mock webpack context to execute the module
                                    const mockRequire = (id) => ({});
                                    const mockExports = {};
                                    const mockModule = { exports: mockExports };

                                    // Execute the fabric module
                                    if (typeof modules[moduleId] === 'function') {
                                        modules[moduleId](mockModule, mockExports, mockRequire);

                                        if (mockExports.Canvas && typeof mockExports.Canvas === 'function') {
                                            window.fabric = mockExports;
                                            console.log('✅ WEBPACK FABRIC EXTRACTOR: fabric.js extracted from chunk');
                                            dispatchFabricReadyEvents();
                                            return true;
                                        }
                                    }
                                } catch (chunkError) {
                                    // Continue searching
                                }
                            }
                        }
                    }
                }
            }

        } catch (error) {
            console.log('⚠️ WEBPACK FABRIC EXTRACTOR: Extraction failed:', error.message);
        }

        return false;
    }

    /**
     * Dispatch fabric ready events for coordination
     */
    function dispatchFabricReadyEvents() {
        // Mark fabric as loaded
        window.fabricGloballyExposed = true;
        window.emergencyFabricLoaded = true;

        // Dispatch events for dependent scripts
        const events = ['fabricGlobalReady', 'fabricready', 'fabric-loaded'];
        events.forEach(eventName => {
            const event = new CustomEvent(eventName, {
                detail: {
                    source: 'webpack-extractor',
                    fabricAvailable: true,
                    timestamp: Date.now()
                }
            });
            document.dispatchEvent(event);
            window.dispatchEvent(event);
        });

        console.log('🎉 WEBPACK FABRIC EXTRACTOR: Events dispatched - fabric.js ready for use');
    }

    /**
     * Polling mechanism with timeout
     */
    function startPolling() {
        const maxAttempts = 30; // 3 seconds maximum
        const pollInterval = 100; // Check every 100ms
        let attempts = 0;

        const pollTimer = setInterval(() => {
            attempts++;

            if (extractFabricFromWebpack()) {
                clearInterval(pollTimer);
                console.log(`✅ WEBPACK FABRIC EXTRACTOR: Success after ${attempts} attempts`);
                return;
            }

            if (attempts >= maxAttempts) {
                clearInterval(pollTimer);
                console.error('❌ WEBPACK FABRIC EXTRACTOR: Failed to extract after maximum attempts');
                console.error('🔍 DEBUG INFO:', {
                    webpackChunksAvailable: typeof window.webpackChunkocto_print_designer !== 'undefined',
                    webpackRequireAvailable: typeof window.__webpack_require__ === 'function',
                    vendorBundleLoaded: document.querySelector('script[src*="vendor.bundle.js"]') !== null
                });

                // Fallback to emergency loader if absolutely necessary
                fallbackToEmergencyLoader();
            }
        }, pollInterval);
    }

    /**
     * Fallback to emergency loader as last resort
     */
    function fallbackToEmergencyLoader() {
        console.log('🚨 WEBPACK FABRIC EXTRACTOR: Falling back to emergency CDN loader');

        // Only fallback if no fabric is available at all
        if (!window.fabric || typeof window.fabric.Canvas !== 'function') {
            // Load emergency loader if it exists
            const emergencyScript = document.createElement('script');
            emergencyScript.src = '/wp-content/plugins/octo-print-designer/public/js/emergency-fabric-loader.js';
            emergencyScript.async = true;
            document.head.appendChild(emergencyScript);
        }
    }

    /**
     * Initialize extraction process
     */
    function initialize() {
        // Check if fabric is already available
        if (window.fabric && typeof window.fabric.Canvas === 'function') {
            console.log('✅ WEBPACK FABRIC EXTRACTOR: fabric.js already available, skipping extraction');
            dispatchFabricReadyEvents();
            return;
        }

        // Start immediate extraction attempt
        if (!extractFabricFromWebpack()) {
            // If immediate extraction fails, start polling
            console.log('⏳ WEBPACK FABRIC EXTRACTOR: Starting polling for webpack chunks');
            startPolling();
        }
    }

    // Start extraction process
    initialize();

    console.log('🚀 WEBPACK FABRIC EXTRACTOR: Initialization complete');

})();