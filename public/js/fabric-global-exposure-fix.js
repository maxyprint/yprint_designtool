/**
 * 🚨 CRITICAL FABRIC.JS GLOBAL EXPOSURE FIX - Issue #11
 *
 * ROOT CAUSE: designer.bundle.js imports fabric but never exposes window.fabric
 * SOLUTION: Extract fabric from bundle and expose globally
 *
 * This fixes the 20-attempt polling failure in design-loader.js
 */

(function() {
    'use strict';

    console.log('🚨 FABRIC EXPOSURE FIX: Starting critical fix for Issue #11');

    // Prevent multiple execution
    if (window.fabricExposureFixApplied) {
        console.log('✅ FABRIC EXPOSURE FIX: Already applied, skipping');
        return;
    }

    /**
     * Method 1: Intercept Webpack Module Loading
     * Extract fabric from the designer.bundle.js webpack require system
     */
    function interceptWebpackFabric() {
        // Check if webpack module system exists
        if (typeof window.__webpack_require__ === 'function') {
            try {
                console.log('🔍 FABRIC EXPOSURE FIX: Attempting webpack module interception');

                // Try to require fabric module directly
                const fabricModule = window.__webpack_require__("./node_modules/fabric/dist/index.min.mjs");
                if (fabricModule && typeof fabricModule.Canvas === 'function') {
                    window.fabric = fabricModule;
                    console.log('✅ FABRIC EXPOSURE FIX: Successfully exposed via webpack interception');
                    triggerFabricReadyEvent();
                    return true;
                }
            } catch (error) {
                console.log('⚠️ FABRIC EXPOSURE FIX: Webpack interception failed:', error.message);
            }
        }
        return false;
    }

    /**
     * Method 2: Canvas Instance Reverse Engineering
     * Extract fabric from already created Canvas instances
     */
    function extractFabricFromCanvas() {
        console.log('🔍 FABRIC EXPOSURE FIX: Searching for Canvas instances to extract fabric');

        // Search all canvas elements for fabric instances
        const canvasElements = document.querySelectorAll('canvas');

        for (const canvasEl of canvasElements) {
            if (canvasEl.__fabric && canvasEl.__fabric.constructor) {
                try {
                    // Extract fabric from Canvas constructor
                    const CanvasConstructor = canvasEl.__fabric.constructor;

                    // Try multiple ways to get the fabric namespace
                    let fabricNamespace = null;

                    if (CanvasConstructor.fabric) {
                        fabricNamespace = CanvasConstructor.fabric;
                    } else if (CanvasConstructor.constructor && CanvasConstructor.constructor.fabric) {
                        fabricNamespace = CanvasConstructor.constructor.fabric;
                    } else if (CanvasConstructor.__proto__ && CanvasConstructor.__proto__.fabric) {
                        fabricNamespace = CanvasConstructor.__proto__.fabric;
                    }

                    if (fabricNamespace && typeof fabricNamespace.Canvas === 'function') {
                        window.fabric = fabricNamespace;
                        console.log('✅ FABRIC EXPOSURE FIX: Successfully exposed via canvas instance reverse engineering');
                        triggerFabricReadyEvent();
                        return true;
                    }

                    // Alternative: Create minimal fabric object from Canvas constructor
                    if (typeof CanvasConstructor === 'function') {
                        window.fabric = {
                            Canvas: CanvasConstructor,
                            Image: CanvasConstructor.Image || (canvasEl.__fabric.Image ? canvasEl.__fabric.Image.constructor : null),
                            Object: CanvasConstructor.Object || (canvasEl.__fabric.Object ? canvasEl.__fabric.Object.constructor : null)
                        };
                        console.log('✅ FABRIC EXPOSURE FIX: Created minimal fabric object from Canvas constructor');
                        triggerFabricReadyEvent();
                        return true;
                    }
                } catch (error) {
                    console.log('⚠️ FABRIC EXPOSURE FIX: Canvas extraction failed:', error.message);
                }
            }
        }

        return false;
    }

    /**
     * Method 3: Bundle Script Modification
     * Modify the designer.bundle.js to expose fabric on next load
     */
    function addFabricExposureToBundle() {
        console.log('🔍 FABRIC EXPOSURE FIX: Attempting bundle modification for next page load');

        // Find the designer bundle script
        const scripts = document.querySelectorAll('script[src*="designer.bundle.js"]');

        if (scripts.length > 0) {
            // Create a patched version that exposes fabric
            const patchScript = document.createElement('script');
            patchScript.innerHTML = `
                // Fabric exposure patch for designer.bundle.js
                (function() {
                    const originalRequire = window.__webpack_require__;
                    if (originalRequire) {
                        try {
                            const fabric = originalRequire("./node_modules/fabric/dist/index.min.mjs");
                            if (fabric && !window.fabric) {
                                window.fabric = fabric;
                                console.log('✅ FABRIC EXPOSURE PATCH: window.fabric exposed from bundle');
                                window.dispatchEvent(new CustomEvent('fabricGlobalReady', {
                                    detail: { fabric: window.fabric, source: 'bundle-patch' }
                                }));
                            }
                        } catch(e) {
                            console.log('⚠️ FABRIC EXPOSURE PATCH: Bundle patch failed:', e.message);
                        }
                    }
                })();
            `;

            // Insert after the bundle script
            scripts[0].parentNode.insertBefore(patchScript, scripts[0].nextSibling);

            console.log('✅ FABRIC EXPOSURE FIX: Bundle patch script added for immediate execution');

            // Also try immediate execution
            try {
                eval(patchScript.innerHTML);
            } catch (error) {
                console.log('⚠️ FABRIC EXPOSURE FIX: Immediate patch execution failed:', error.message);
            }
        }
    }

    /**
     * Trigger fabric ready event for design-loader.js
     */
    function triggerFabricReadyEvent() {
        if (window.fabric) {
            // Mark as applied
            window.fabricExposureFixApplied = true;

            // Dispatch ready event
            window.dispatchEvent(new CustomEvent('fabricGlobalReady', {
                detail: {
                    fabric: window.fabric,
                    source: 'exposure-fix',
                    timestamp: Date.now()
                }
            }));

            // Also set a flag that design-loader can check
            window.fabricManuallyExposed = true;

            console.log('🎉 FABRIC EXPOSURE FIX: window.fabric successfully exposed and ready event dispatched');
        }
    }

    /**
     * Main execution with retry logic
     */
    function executeFabricFix() {
        console.log('🚀 FABRIC EXPOSURE FIX: Starting fabric exposure attempts');

        // Method 1: Webpack interception
        if (interceptWebpackFabric()) return;

        // Method 2: Canvas reverse engineering
        if (extractFabricFromCanvas()) return;

        // Method 3: Bundle modification for next execution
        addFabricExposureToBundle();

        console.log('⚠️ FABRIC EXPOSURE FIX: All methods attempted, waiting for DOM changes');
    }

    // 🚨 OPTIMIZED: Passive fabric monitoring and exposure
    function passiveFabricMonitoring() {
        // Skip if fabric is already available
        if (window.fabric && typeof window.fabric.Canvas === 'function') {
            console.log('🎯 FABRIC EXPOSURE FIX: fabric already available, skipping');
            return true;
        }

        console.log('🔍 FABRIC EXPOSURE FIX: Starting passive monitoring');

        // Method 1: Immediate webpack check (if available)
        if (typeof window.__webpack_require__ === 'function') {
            try {
                const fabricModule = window.__webpack_require__("./node_modules/fabric/dist/index.min.mjs");
                if (fabricModule && typeof fabricModule.Canvas === 'function') {
                    window.fabric = fabricModule;
                    triggerFabricReadyEvent();
                    console.log('✅ FABRIC EXPOSURE FIX: Immediate webpack exposure successful');
                    return true;
                }
            } catch (error) {
                console.log('⚠️ FABRIC EXPOSURE FIX: Webpack method failed:', error.message);
            }
        }

        // Method 2: Start passive monitoring
        startPassiveMonitoring();
        return false;
    }

    function startPassiveMonitoring() {
        let monitorCount = 0;
        const maxMonitors = 100; // 10 seconds total

        function monitorForFabric() {
            monitorCount++;

            // Try canvas extraction methods
            if (extractFabricFromCanvas()) {
                return; // Success
            }

            // Continue monitoring
            if (monitorCount < maxMonitors) {
                setTimeout(monitorForFabric, 100);
            } else {
                console.warn('⚠️ FABRIC EXPOSURE FIX: Passive monitoring timeout after', maxMonitors * 100, 'ms');
            }
        }

        // Start monitoring with delay
        setTimeout(monitorForFabric, 200);
    }

    // Execute passive monitoring
    passiveFabricMonitoring();

    // Retry on DOM changes (for dynamically loaded content)
    const observer = new MutationObserver(function(mutations) {
        if (!window.fabric) {
            let hasNewCanvas = false;
            mutations.forEach(function(mutation) {
                mutation.addedNodes.forEach(function(node) {
                    if (node.tagName === 'CANVAS' ||
                        (node.querySelectorAll && node.querySelectorAll('canvas').length > 0)) {
                        hasNewCanvas = true;
                    }
                });
            });

            if (hasNewCanvas) {
                console.log('🔄 FABRIC EXPOSURE FIX: New canvas detected, retrying fabric extraction');
                setTimeout(extractFabricFromCanvas, 100);
            }
        } else if (!window.fabricExposureFixApplied) {
            triggerFabricReadyEvent();
        }
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    // Window load fallback
    window.addEventListener('load', function() {
        if (!window.fabric) {
            console.log('🔄 FABRIC EXPOSURE FIX: Window loaded, final attempt');
            setTimeout(executeFabricFix, 500);
        }
    });

    console.log('✅ FABRIC EXPOSURE FIX: Fix system initialized and monitoring');

})();