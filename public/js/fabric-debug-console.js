/**
 * 🔍 FABRIC.JS LOADING DEBUG CONSOLE - Race Condition Analysis System
 *
 * MISSION: Comprehensive console debugging to identify exactly WHY and WHEN fabric.js loading fails
 * This system tracks every step of the fabric.js loading process with precise timing
 */

(function() {
    'use strict';

    // 🔍 Global debug state
    window.FabricDebugConsole = {
        startTime: performance.now(),
        timeline: [],
        checks: [],
        attempts: {
            webpack: 0,
            emergency: 0,
            extraction: 0
        },
        status: {
            vendorLoaded: false,
            webpackReady: false,
            fabricExtracted: false,
            fabricGlobal: false,
            emergencyTriggered: false
        }
    };

    console.log('🔍 FABRIC DEBUG CONSOLE: Starting comprehensive race condition analysis');
    console.log('🕐 Debug session started at:', new Date().toISOString());

    /**
     * Timeline tracking with precise timing
     */
    function logTimeline(event, details = {}) {
        const timestamp = performance.now();
        const elapsed = timestamp - window.FabricDebugConsole.startTime;

        const entry = {
            time: timestamp,
            elapsed: Math.round(elapsed),
            event: event,
            details: details,
            fabricStatus: {
                exists: typeof window.fabric !== 'undefined',
                hasCanvas: window.fabric && typeof window.fabric.Canvas === 'function',
                globallyExposed: window.fabricGloballyExposed || false
            }
        };

        window.FabricDebugConsole.timeline.push(entry);

        console.log(`🕐 [${elapsed}ms] ${event}:`, details);
        console.log(`   └─ fabric status:`, entry.fabricStatus);

        return entry;
    }

    /**
     * Detailed webpack analysis
     */
    function analyzeWebpackState() {
        const analysis = {
            chunksAvailable: typeof window.webpackChunkocto_print_designer !== 'undefined',
            chunksCount: window.webpackChunkocto_print_designer ? window.webpackChunkocto_print_designer.length : 0,
            requireAvailable: typeof window.__webpack_require__ === 'function',
            cacheAvailable: window.__webpack_require__ && window.__webpack_require__.cache,
            cacheKeys: []
        };

        if (analysis.cacheAvailable) {
            analysis.cacheKeys = Object.keys(window.__webpack_require__.cache);
            analysis.fabricInCache = analysis.cacheKeys.some(key => key.includes('fabric'));
        }

        logTimeline('WEBPACK_STATE_ANALYSIS', analysis);
        return analysis;
    }

    /**
     * Vendor bundle analysis
     */
    function analyzeVendorBundle() {
        const scripts = Array.from(document.querySelectorAll('script'));
        const vendorScripts = scripts.filter(s => s.src && s.src.includes('vendor.bundle.js'));

        const analysis = {
            vendorScriptsFound: vendorScripts.length,
            vendorScripts: vendorScripts.map(s => ({
                src: s.src,
                loaded: s.readyState === 'complete' || s.complete,
                async: s.async,
                defer: s.defer
            })),
            allScriptsCount: scripts.length
        };

        logTimeline('VENDOR_BUNDLE_ANALYSIS', analysis);
        return analysis;
    }

    /**
     * Detailed fabric availability check
     */
    function checkFabricAvailability() {
        window.FabricDebugConsole.attempts.extraction++;

        const check = {
            attempt: window.FabricDebugConsole.attempts.extraction,
            windowFabric: {
                exists: typeof window.fabric !== 'undefined',
                type: typeof window.fabric,
                hasCanvas: window.fabric && typeof window.fabric.Canvas === 'function',
                hasObject: window.fabric && typeof window.fabric.Object === 'function',
                keys: window.fabric ? Object.keys(window.fabric).slice(0, 10) : []
            },
            webpackExtraction: tryWebpackExtraction(),
            domState: {
                readyState: document.readyState,
                canvasElements: document.querySelectorAll('canvas').length
            }
        };

        window.FabricDebugConsole.checks.push(check);
        logTimeline('FABRIC_AVAILABILITY_CHECK', check);

        return check.windowFabric.hasCanvas;
    }

    /**
     * Advanced webpack extraction attempt with detailed logging
     */
    function tryWebpackExtraction() {
        window.FabricDebugConsole.attempts.webpack++;

        console.log('🔍 WEBPACK EXTRACTION ATTEMPT:', window.FabricDebugConsole.attempts.webpack);

        const extraction = {
            attempt: window.FabricDebugConsole.attempts.webpack,
            methods: []
        };

        // Method 1: Direct module require
        if (typeof window.__webpack_require__ === 'function') {
            try {
                const moduleId = './node_modules/fabric/dist/index.min.mjs';
                console.log('🔍 Trying direct module require:', moduleId);

                const fabricModule = window.__webpack_require__(moduleId);
                extraction.methods.push({
                    method: 'direct_require',
                    moduleId: moduleId,
                    success: fabricModule && typeof fabricModule.Canvas === 'function',
                    module: fabricModule ? Object.keys(fabricModule).slice(0, 5) : null
                });

                if (fabricModule && typeof fabricModule.Canvas === 'function') {
                    window.fabric = fabricModule;
                    console.log('✅ WEBPACK EXTRACTION: Success via direct require');
                    logTimeline('WEBPACK_EXTRACTION_SUCCESS', { method: 'direct_require' });
                    return true;
                }
            } catch (error) {
                extraction.methods.push({
                    method: 'direct_require',
                    success: false,
                    error: error.message
                });
                console.log('⚠️ Direct require failed:', error.message);
            }

            // Method 2: Cache search
            if (window.__webpack_require__.cache) {
                console.log('🔍 Searching webpack cache...');
                const cacheKeys = Object.keys(window.__webpack_require__.cache);
                console.log('🔍 Cache keys found:', cacheKeys.length);

                const fabricKeys = cacheKeys.filter(key => key.includes('fabric'));
                console.log('🔍 Fabric-related cache keys:', fabricKeys);

                for (const moduleId of cacheKeys) {
                    try {
                        const module = window.__webpack_require__.cache[moduleId];
                        if (module && module.exports) {
                            const exports = module.exports;

                            if (exports.Canvas && typeof exports.Canvas === 'function') {
                                window.fabric = exports;
                                console.log('✅ WEBPACK EXTRACTION: Success via cache search');
                                logTimeline('WEBPACK_EXTRACTION_SUCCESS', { method: 'cache_search', moduleId });
                                extraction.methods.push({
                                    method: 'cache_search',
                                    moduleId: moduleId,
                                    success: true
                                });
                                return true;
                            }
                        }
                    } catch (cacheError) {
                        // Continue searching
                    }
                }

                extraction.methods.push({
                    method: 'cache_search',
                    success: false,
                    searchedKeys: cacheKeys.length,
                    fabricKeys: fabricKeys.length
                });
            }

            // Method 3: Chunk analysis
            if (window.webpackChunkocto_print_designer) {
                console.log('🔍 Analyzing webpack chunks...');
                const chunks = window.webpackChunkocto_print_designer;
                console.log('🔍 Chunks available:', chunks.length);

                for (let i = 0; i < chunks.length; i++) {
                    const chunk = chunks[i];
                    if (chunk && chunk[1]) {
                        const modules = chunk[1];
                        const moduleIds = Object.keys(modules);
                        const fabricModules = moduleIds.filter(id => id.includes('fabric'));

                        console.log(`🔍 Chunk ${i}: ${moduleIds.length} modules, ${fabricModules.length} fabric modules`);

                        for (const moduleId of fabricModules) {
                            console.log('🔍 Found fabric module:', moduleId);
                            // Try to execute the module safely
                            try {
                                const mockExports = {};
                                const mockModule = { exports: mockExports };
                                const mockRequire = () => ({});

                                if (typeof modules[moduleId] === 'function') {
                                    modules[moduleId](mockModule, mockExports, mockRequire);

                                    if (mockExports.Canvas && typeof mockExports.Canvas === 'function') {
                                        window.fabric = mockExports;
                                        console.log('✅ WEBPACK EXTRACTION: Success via chunk execution');
                                        logTimeline('WEBPACK_EXTRACTION_SUCCESS', { method: 'chunk_execution', moduleId });
                                        extraction.methods.push({
                                            method: 'chunk_execution',
                                            moduleId: moduleId,
                                            success: true
                                        });
                                        return true;
                                    }
                                }
                            } catch (chunkError) {
                                console.log('⚠️ Chunk execution failed:', chunkError.message);
                            }
                        }
                    }
                }

                extraction.methods.push({
                    method: 'chunk_analysis',
                    success: false,
                    chunksAnalyzed: chunks.length
                });
            }
        }

        logTimeline('WEBPACK_EXTRACTION_FAILED', extraction);
        return false;
    }

    /**
     * Emergency loader analysis
     */
    function analyzeEmergencyLoader() {
        const emergency = {
            active: window.emergencyFabricLoaderActive || false,
            loaded: window.emergencyFabricLoaded || false,
            cdnAttempts: window.FabricDebugConsole.attempts.emergency
        };

        if (!emergency.active) {
            window.FabricDebugConsole.attempts.emergency++;
            emergency.cdnAttempts = window.FabricDebugConsole.attempts.emergency;
            window.FabricDebugConsole.status.emergencyTriggered = true;

            console.log('🚨 EMERGENCY LOADER TRIGGERED - This indicates webpack extraction failed');
        }

        logTimeline('EMERGENCY_LOADER_ANALYSIS', emergency);
        return emergency;
    }

    /**
     * Comprehensive system status report
     */
    function generateStatusReport() {
        const report = {
            timestamp: new Date().toISOString(),
            elapsedTime: Math.round(performance.now() - window.FabricDebugConsole.startTime),
            status: window.FabricDebugConsole.status,
            attempts: window.FabricDebugConsole.attempts,
            checksPerformed: window.FabricDebugConsole.checks.length,
            timelineEvents: window.FabricDebugConsole.timeline.length,
            currentState: {
                fabric: {
                    available: typeof window.fabric !== 'undefined',
                    hasCanvas: window.fabric && typeof window.fabric.Canvas === 'function',
                    globallyExposed: window.fabricGloballyExposed || false
                },
                webpack: analyzeWebpackState(),
                vendor: analyzeVendorBundle(),
                emergency: analyzeEmergencyLoader()
            }
        };

        console.log('📊 COMPREHENSIVE STATUS REPORT:', report);
        console.log('📈 Full timeline:', window.FabricDebugConsole.timeline);

        return report;
    }

    /**
     * Critical failure analysis
     */
    function analyzeCriticalFailure() {
        console.error('❌ CRITICAL FAILURE ANALYSIS: fabric.js loading completely failed');

        const failure = {
            totalAttempts: window.FabricDebugConsole.attempts,
            timelineLength: window.FabricDebugConsole.timeline.length,
            lastChecks: window.FabricDebugConsole.checks.slice(-3),
            finalState: {
                scripts: Array.from(document.querySelectorAll('script')).map(s => ({
                    src: s.src || 'inline',
                    loaded: s.complete || s.readyState === 'complete'
                })),
                webpack: {
                    chunks: window.webpackChunkocto_print_designer ? window.webpackChunkocto_print_designer.length : 0,
                    require: typeof window.__webpack_require__ === 'function'
                },
                timing: {
                    domReady: document.readyState,
                    totalTime: Math.round(performance.now() - window.FabricDebugConsole.startTime)
                }
            }
        };

        logTimeline('CRITICAL_FAILURE_ANALYSIS', failure);
        return failure;
    }

    // 🔍 Initialize monitoring
    logTimeline('DEBUG_CONSOLE_INITIALIZED');

    // Monitor script loading
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
                if (node.tagName === 'SCRIPT') {
                    logTimeline('SCRIPT_ADDED', {
                        src: node.src || 'inline',
                        async: node.async,
                        defer: node.defer
                    });
                }
            });
        });
    });

    observer.observe(document.head, { childList: true });

    // Monitor document ready states
    document.addEventListener('DOMContentLoaded', () => {
        logTimeline('DOM_CONTENT_LOADED');
    });

    window.addEventListener('load', () => {
        logTimeline('WINDOW_LOAD_COMPLETE');

        // Final analysis after everything should be loaded
        setTimeout(() => {
            generateStatusReport();

            if (!window.fabric || typeof window.fabric.Canvas !== 'function') {
                analyzeCriticalFailure();
            }
        }, 1000);
    });

    // Periodic monitoring
    let monitorCount = 0;
    const monitor = setInterval(() => {
        monitorCount++;

        if (checkFabricAvailability()) {
            logTimeline('FABRIC_FINALLY_AVAILABLE', { afterChecks: monitorCount });
            clearInterval(monitor);
            generateStatusReport();
        } else if (monitorCount >= 50) { // 5 seconds
            logTimeline('MONITORING_TIMEOUT', { totalChecks: monitorCount });
            clearInterval(monitor);
            analyzeCriticalFailure();
        }
    }, 100);

    // 🔍 Global access for manual debugging
    window.FabricDebugConsole.analyzeWebpack = analyzeWebpackState;
    window.FabricDebugConsole.analyzeVendor = analyzeVendorBundle;
    window.FabricDebugConsole.checkFabric = checkFabricAvailability;
    window.FabricDebugConsole.generateReport = generateStatusReport;

    console.log('🔍 FABRIC DEBUG CONSOLE: Monitoring active');
    console.log('🔧 Manual functions available: window.FabricDebugConsole.*');

})();