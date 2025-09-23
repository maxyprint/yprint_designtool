/**
 * 🚨 PHASE 6: Precise Timing & Race Condition Measurement System
 *
 * MISSION: Quantify exact timing issues and race conditions identified in Phase 5
 * TARGET: Provide concrete performance data for architectural optimization
 *
 * MEASUREMENTS:
 * 1. emergency-fabric-loader.js:35 - 1000ms timeout race condition
 * 2. webpack-designer-patch.js:30-32 - 100ms module extraction delay
 * 3. class-octo-print-designer-public.php:121-124 - Script dependency conflicts
 * 4. AJAX handler timing - Nonce verification race conditions
 */

(function() {
    'use strict';

    // High-precision timing system
    const TimingMeasurement = {
        // Measurement storage
        measurements: {},
        raceConditions: {},
        performanceData: {},
        failureRates: {},

        // Timing configuration
        config: {
            highPrecision: true,
            logLevel: 'detailed', // 'basic', 'detailed', 'debug'
            measurementWindow: 30000, // 30 seconds measurement window
            retryAttempts: 3,
            timeoutThresholds: {
                fabricLoading: 1000,
                webpackExtraction: 100,
                scriptDependency: 500,
                ajaxNonce: 2000
            }
        },

        // Initialize timing measurement system
        init() {
            console.log('🔬 TIMING MEASUREMENT: Initializing precision timing system');

            this.setupHighPrecisionTimer();
            this.setupEventListeners();
            this.startMeasurementWindow();
            this.measureInitialState();

            // Start all measurement targets
            this.measureFabricLoadingRaceCondition();
            this.measureWebpackExtractionDelay();
            this.measureScriptDependencyConflicts();
            this.measureAjaxNonceRaceCondition();

            // Setup continuous monitoring
            this.setupContinuousMonitoring();
        },

        // High-precision timing utilities
        setupHighPrecisionTimer() {
            this.now = () => {
                if (this.config.highPrecision && performance && performance.now) {
                    return performance.now();
                }
                return Date.now();
            };

            this.mark = (name) => {
                const timestamp = this.now();
                this.measurements[name] = timestamp;
                if (performance && performance.mark) {
                    performance.mark(name);
                }
                return timestamp;
            };

            this.measure = (name, startMark, endMark) => {
                const startTime = this.measurements[startMark] || this.now();
                const endTime = this.measurements[endMark] || this.now();
                const duration = endTime - startTime;

                if (performance && performance.measure) {
                    try {
                        performance.measure(name, startMark, endMark);
                    } catch (e) {
                        // Fallback if marks don't exist
                    }
                }

                return duration;
            };
        },

        // Event listener setup for timing measurements
        setupEventListeners() {
            // Fabric loading events
            window.addEventListener('fabricGlobalReady', (e) => {
                this.mark('fabric-ready');
                this.recordFabricLoadingSuccess(e.detail);
            });

            window.addEventListener('fabricLoadFailed', (e) => {
                this.mark('fabric-failed');
                this.recordFabricLoadingFailure(e.detail);
            });

            // DesignerWidget exposure events
            window.addEventListener('designerWidgetExposed', (e) => {
                this.mark('designer-widget-exposed');
                this.recordDesignerWidgetSuccess(e.detail);
            });

            // DOM ready timing
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => {
                    this.mark('dom-ready');
                });
            } else {
                this.mark('dom-ready');
            }

            // Window load timing
            if (document.readyState !== 'complete') {
                window.addEventListener('load', () => {
                    this.mark('window-loaded');
                });
            } else {
                this.mark('window-loaded');
            }
        },

        // Measure initial system state
        measureInitialState() {
            this.mark('measurement-start');

            const initialState = {
                timestamp: this.now(),
                domReady: document.readyState,
                scriptsLoaded: {
                    jquery: !!window.jQuery,
                    fabric: !!window.fabric,
                    webpack: !!window.__webpack_require__,
                    webpackChunk: !!window.webpackChunkocto_print_designer,
                    designerWidget: !!window.DesignerWidget
                },
                userAgent: navigator.userAgent,
                timing: performance.timing ? {
                    navigationStart: performance.timing.navigationStart,
                    loadEventEnd: performance.timing.loadEventEnd,
                    domContentLoaded: performance.timing.domContentLoadedEventEnd
                } : null
            };

            this.performanceData.initialState = initialState;
            console.log('📊 TIMING MEASUREMENT: Initial state captured', initialState);
        },

        // 1. Measure emergency-fabric-loader.js:35 - 1000ms timeout race condition
        measureFabricLoadingRaceCondition() {
            console.log('🔬 TIMING MEASUREMENT: Starting fabric loading race condition measurement');

            this.mark('fabric-measurement-start');

            const fabricMeasurement = {
                startTime: this.now(),
                timeoutThreshold: this.config.timeoutThresholds.fabricLoading,
                attempts: [],
                vendorBundleTime: null,
                cdnLoadTime: null,
                webpackExtractionTime: null,
                failureCount: 0,
                successCount: 0
            };

            // Monitor vendor bundle loading
            this.monitorVendorBundleLoading(fabricMeasurement);

            // Monitor CDN loading attempts
            this.monitorCDNLoading(fabricMeasurement);

            // Monitor webpack extraction attempts
            this.monitorWebpackExtraction(fabricMeasurement);

            // Setup timeout measurement
            const timeoutStart = this.now();
            setTimeout(() => {
                const elapsed = this.now() - timeoutStart;
                fabricMeasurement.actualTimeout = elapsed;

                // Check if fabric is available after timeout
                const fabricAvailable = !!(window.fabric && typeof window.fabric.Canvas === 'function');
                fabricMeasurement.fabricAvailableAfterTimeout = fabricAvailable;

                if (!fabricAvailable) {
                    fabricMeasurement.failureCount++;
                    this.recordRaceConditionFailure('fabric-timeout', {
                        expectedTimeout: this.config.timeoutThresholds.fabricLoading,
                        actualTimeout: elapsed,
                        fabricAvailable: fabricAvailable
                    });
                } else {
                    fabricMeasurement.successCount++;
                }

                this.raceConditions.fabricLoading = fabricMeasurement;
                console.log('📈 FABRIC RACE CONDITION MEASUREMENT:', fabricMeasurement);
            }, this.config.timeoutThresholds.fabricLoading);
        },

        // Monitor vendor bundle loading timing
        monitorVendorBundleLoading(fabricMeasurement) {
            const vendorScript = document.querySelector('script[src*="vendor.bundle.js"]');
            if (vendorScript) {
                const loadStart = this.now();

                vendorScript.addEventListener('load', () => {
                    const loadTime = this.now() - loadStart;
                    fabricMeasurement.vendorBundleTime = loadTime;
                    this.mark('vendor-bundle-loaded');

                    // Check fabric availability after vendor bundle
                    setTimeout(() => {
                        const fabricFromVendor = !!(window.fabric && typeof window.fabric.Canvas === 'function');
                        fabricMeasurement.fabricFromVendor = fabricFromVendor;
                        fabricMeasurement.vendorToFabricDelay = this.now() - (loadStart + loadTime);
                    }, 50);
                });

                vendorScript.addEventListener('error', () => {
                    fabricMeasurement.vendorBundleError = true;
                    fabricMeasurement.vendorBundleTime = this.now() - loadStart;
                });
            }
        },

        // Monitor CDN loading attempts
        monitorCDNLoading(fabricMeasurement) {
            // Override fabric CDN loading to measure timing
            const originalCreateElement = document.createElement;
            document.createElement = function(tagName) {
                const element = originalCreateElement.call(this, tagName);

                if (tagName.toLowerCase() === 'script' &&
                    arguments.length === 1) { // Only track single-argument calls

                    const originalSrcSetter = Object.getOwnPropertyDescriptor(HTMLScriptElement.prototype, 'src').set;
                    Object.defineProperty(element, 'src', {
                        set: function(value) {
                            if (value && value.includes('fabric.js') && value.includes('cdnjs.cloudflare.com')) {
                                const cdnStart = TimingMeasurement.now();

                                element.addEventListener('load', () => {
                                    const cdnLoadTime = TimingMeasurement.now() - cdnStart;
                                    fabricMeasurement.cdnLoadTime = cdnLoadTime;
                                    fabricMeasurement.cdnLoadSuccess = true;
                                    TimingMeasurement.mark('fabric-cdn-loaded');
                                });

                                element.addEventListener('error', () => {
                                    const cdnLoadTime = TimingMeasurement.now() - cdnStart;
                                    fabricMeasurement.cdnLoadTime = cdnLoadTime;
                                    fabricMeasurement.cdnLoadSuccess = false;
                                    fabricMeasurement.failureCount++;
                                });
                            }

                            originalSrcSetter.call(this, value);
                        },
                        get: function() {
                            return this.getAttribute('src');
                        }
                    });
                }

                return element;
            };
        },

        // Monitor webpack extraction timing
        monitorWebpackExtraction(fabricMeasurement) {
            if (window.__webpack_require__) {
                const originalRequire = window.__webpack_require__;
                let extractionAttempts = 0;

                window.__webpack_require__ = function(moduleId) {
                    const extractionStart = TimingMeasurement.now();
                    const result = originalRequire.call(this, moduleId);
                    const extractionTime = TimingMeasurement.now() - extractionStart;

                    // Track extraction attempts for fabric-related modules
                    if (typeof moduleId === 'string' &&
                        (moduleId.includes('fabric') || moduleId.includes('Designer'))) {
                        extractionAttempts++;

                        fabricMeasurement.webpackExtractionAttempts = extractionAttempts;
                        fabricMeasurement.lastExtractionTime = extractionTime;

                        if (result && result.fabric) {
                            fabricMeasurement.webpackExtractionTime = extractionTime;
                            fabricMeasurement.webpackExtractionSuccess = true;
                        }
                    }

                    return result;
                };

                // Copy properties
                Object.setPrototypeOf(window.__webpack_require__, originalRequire);
                Object.keys(originalRequire).forEach(key => {
                    window.__webpack_require__[key] = originalRequire[key];
                });
            }
        },

        // 2. Measure webpack-designer-patch.js:30-32 - 100ms module extraction delay
        measureWebpackExtractionDelay() {
            console.log('🔬 TIMING MEASUREMENT: Starting webpack extraction delay measurement');

            const webpackMeasurement = {
                startTime: this.now(),
                extractionDelay: this.config.timeoutThresholds.webpackExtraction,
                attempts: [],
                moduleSearchCount: 0,
                cacheHits: 0,
                cacheMisses: 0,
                bruteForceTime: null,
                patternMatchTime: null
            };

            // Monitor chunk loading
            if (window.webpackChunkocto_print_designer) {
                const originalPush = window.webpackChunkocto_print_designer.push;

                window.webpackChunkocto_print_designer.push = function(chunkData) {
                    const chunkStart = TimingMeasurement.now();
                    const result = originalPush.call(this, chunkData);
                    const chunkTime = TimingMeasurement.now() - chunkStart;

                    webpackMeasurement.attempts.push({
                        timestamp: chunkStart,
                        chunkProcessingTime: chunkTime,
                        chunkData: chunkData ? Object.keys(chunkData[1] || {}).length : 0
                    });

                    // Measure extraction delay
                    if (chunkData && chunkData[1]) {
                        const modules = chunkData[1];
                        for (const moduleId in modules) {
                            if (moduleId.includes('Designer')) {
                                const extractionStart = TimingMeasurement.now();

                                setTimeout(() => {
                                    const extractionTime = TimingMeasurement.now() - extractionStart;
                                    webpackMeasurement.actualExtractionDelay = extractionTime;

                                    if (extractionTime > webpackMeasurement.extractionDelay) {
                                        TimingMeasurement.recordRaceConditionFailure('webpack-extraction-delay', {
                                            expectedDelay: webpackMeasurement.extractionDelay,
                                            actualDelay: extractionTime,
                                            moduleId: moduleId
                                        });
                                    }
                                }, webpackMeasurement.extractionDelay);
                            }
                        }
                    }

                    return result;
                };
            }

            // Monitor module cache access
            this.monitorModuleCacheAccess(webpackMeasurement);

            this.raceConditions.webpackExtraction = webpackMeasurement;
        },

        // Monitor webpack module cache access patterns
        monitorModuleCacheAccess(webpackMeasurement) {
            if (window.__webpack_require__ && window.__webpack_require__.cache) {
                let originalCacheAccess = {};
                const cache = window.__webpack_require__.cache;

                // Monitor cache read patterns
                Object.keys(cache).forEach(moduleId => {
                    const module = cache[moduleId];
                    if (module) {
                        originalCacheAccess[moduleId] = module.exports;

                        // Track access time to each module
                        Object.defineProperty(cache, moduleId, {
                            get: function() {
                                const accessStart = TimingMeasurement.now();
                                webpackMeasurement.moduleSearchCount++;

                                if (originalCacheAccess[moduleId]) {
                                    webpackMeasurement.cacheHits++;
                                } else {
                                    webpackMeasurement.cacheMisses++;
                                }

                                const accessTime = TimingMeasurement.now() - accessStart;
                                if (accessTime > 1) { // Track slow access
                                    webpackMeasurement.slowCacheAccess = webpackMeasurement.slowCacheAccess || [];
                                    webpackMeasurement.slowCacheAccess.push({
                                        moduleId: moduleId,
                                        accessTime: accessTime
                                    });
                                }

                                return module;
                            },
                            configurable: true
                        });
                    }
                });
            }
        },

        // 3. Measure class-octo-print-designer-public.php:121-124 - Script dependency conflicts
        measureScriptDependencyConflicts() {
            console.log('🔬 TIMING MEASUREMENT: Starting script dependency conflict measurement');

            const dependencyMeasurement = {
                startTime: this.now(),
                scriptLoadOrder: [],
                dependencyViolations: [],
                headScripts: [],
                footerScripts: [],
                loadingGaps: {},
                timingConflicts: []
            };

            // Monitor script loading order
            this.monitorScriptLoadingOrder(dependencyMeasurement);

            // Analyze dependency chains
            this.analyzeDependencyChains(dependencyMeasurement);

            // Monitor head vs footer execution timing
            this.monitorHeadFooterTiming(dependencyMeasurement);

            this.raceConditions.scriptDependencies = dependencyMeasurement;
        },

        // Monitor script loading order and timing
        monitorScriptLoadingOrder(dependencyMeasurement) {
            const scripts = document.querySelectorAll('script[src]');
            const octoPrintScripts = [];

            scripts.forEach((script, index) => {
                if (script.src.includes('octo-print-designer') ||
                    script.src.includes('fabric') ||
                    script.src.includes('vendor.bundle') ||
                    script.src.includes('designer.bundle')) {

                    octoPrintScripts.push({
                        index: index,
                        src: script.src,
                        async: script.async,
                        defer: script.defer,
                        inHead: document.head.contains(script),
                        loadStart: null,
                        loadEnd: null
                    });

                    const scriptEntry = octoPrintScripts[octoPrintScripts.length - 1];
                    const loadStart = this.now();
                    scriptEntry.loadStart = loadStart;

                    script.addEventListener('load', () => {
                        const loadEnd = this.now();
                        scriptEntry.loadEnd = loadEnd;
                        scriptEntry.loadTime = loadEnd - loadStart;

                        dependencyMeasurement.scriptLoadOrder.push(scriptEntry);

                        // Check for dependency violations
                        this.checkDependencyViolations(dependencyMeasurement, scriptEntry);
                    });

                    script.addEventListener('error', () => {
                        scriptEntry.loadError = true;
                        scriptEntry.loadEnd = this.now();
                        dependencyMeasurement.scriptLoadOrder.push(scriptEntry);
                    });
                }
            });
        },

        // Check for dependency violations
        checkDependencyViolations(dependencyMeasurement, loadedScript) {
            const expectedDependencies = {
                'designer.bundle.js': ['vendor.bundle.js', 'emergency-fabric-loader.js'],
                'webpack-designer-patch.js': ['designer.bundle.js'],
                'designer-global-exposer.js': ['webpack-designer-patch.js'],
                'octo-print-designer-public.js': ['designer-global-exposer.js']
            };

            const scriptName = loadedScript.src.split('/').pop();
            const dependencies = expectedDependencies[scriptName];

            if (dependencies) {
                dependencies.forEach(dep => {
                    const depLoaded = dependencyMeasurement.scriptLoadOrder.find(s =>
                        s.src.includes(dep) && s.loadEnd
                    );

                    if (!depLoaded || depLoaded.loadEnd > loadedScript.loadStart) {
                        dependencyMeasurement.dependencyViolations.push({
                            script: scriptName,
                            missingDependency: dep,
                            violation: 'loaded-before-dependency',
                            timingGap: depLoaded ? (loadedScript.loadStart - depLoaded.loadEnd) : null
                        });
                    }
                });
            }
        },

        // Monitor head vs footer script execution timing
        monitorHeadFooterTiming(dependencyMeasurement) {
            const headScripts = document.head.querySelectorAll('script[src*="octo-print-designer"]');
            const footerScripts = document.body.querySelectorAll('script[src*="octo-print-designer"]');

            headScripts.forEach(script => {
                dependencyMeasurement.headScripts.push({
                    src: script.src,
                    loadStart: this.now()
                });
            });

            footerScripts.forEach(script => {
                dependencyMeasurement.footerScripts.push({
                    src: script.src,
                    loadStart: this.now()
                });
            });

            // Calculate timing gaps
            if (headScripts.length > 0 && footerScripts.length > 0) {
                const lastHeadScript = Math.max(...dependencyMeasurement.headScripts.map(s => s.loadStart));
                const firstFooterScript = Math.min(...dependencyMeasurement.footerScripts.map(s => s.loadStart));

                dependencyMeasurement.loadingGaps.headToFooter = firstFooterScript - lastHeadScript;
            }
        },

        // Analyze dependency chains for timing issues
        analyzeDependencyChains(dependencyMeasurement) {
            const chainAnalysis = {
                expectedChain: [
                    'vendor.bundle.js',
                    'emergency-fabric-loader.js',
                    'designer.bundle.js',
                    'webpack-designer-patch.js',
                    'designer-global-exposer.js',
                    'octo-print-designer-public.js'
                ],
                actualChain: [],
                violations: [],
                optimalTiming: null,
                actualTiming: null
            };

            // Build actual loading chain
            setTimeout(() => {
                const sortedScripts = dependencyMeasurement.scriptLoadOrder
                    .filter(s => s.loadEnd)
                    .sort((a, b) => a.loadEnd - b.loadEnd);

                chainAnalysis.actualChain = sortedScripts.map(s => s.src.split('/').pop());

                // Compare with expected chain
                chainAnalysis.expectedChain.forEach((expectedScript, index) => {
                    const actualIndex = chainAnalysis.actualChain.findIndex(s => s.includes(expectedScript));
                    if (actualIndex !== index && actualIndex !== -1) {
                        chainAnalysis.violations.push({
                            script: expectedScript,
                            expectedPosition: index,
                            actualPosition: actualIndex,
                            timingImpact: this.calculateTimingImpact(sortedScripts, index, actualIndex)
                        });
                    }
                });

                dependencyMeasurement.chainAnalysis = chainAnalysis;
            }, 5000); // Analyze after 5 seconds
        },

        // Calculate timing impact of dependency violations
        calculateTimingImpact(sortedScripts, expectedIndex, actualIndex) {
            if (expectedIndex >= sortedScripts.length || actualIndex >= sortedScripts.length) {
                return { impact: 'unknown', delay: 0 };
            }

            const expectedScript = sortedScripts[expectedIndex];
            const actualScript = sortedScripts[actualIndex];

            const delay = Math.abs(expectedScript.loadEnd - actualScript.loadEnd);

            return {
                impact: delay > 500 ? 'high' : delay > 100 ? 'medium' : 'low',
                delay: delay,
                description: `Script loaded ${delay}ms ${actualIndex > expectedIndex ? 'later' : 'earlier'} than expected`
            };
        },

        // 4. Measure AJAX handler timing - Nonce verification race conditions
        measureAjaxNonceRaceCondition() {
            console.log('🔬 TIMING MEASUREMENT: Starting AJAX nonce race condition measurement');

            const ajaxMeasurement = {
                startTime: this.now(),
                nonceCreationTime: null,
                firstAjaxCallTime: null,
                jsInitCompletionTime: null,
                raceConditionWindow: this.config.timeoutThresholds.ajaxNonce,
                failedRequests: [],
                successfulRequests: [],
                timingGaps: {}
            };

            // Monitor nonce creation
            this.monitorNonceCreation(ajaxMeasurement);

            // Monitor AJAX requests
            this.monitorAjaxRequests(ajaxMeasurement);

            // Monitor JavaScript initialization completion
            this.monitorJavaScriptInit(ajaxMeasurement);

            this.raceConditions.ajaxNonce = ajaxMeasurement;
        },

        // Monitor nonce creation timing
        monitorNonceCreation(ajaxMeasurement) {
            // Look for nonce values in localized scripts
            const scripts = document.querySelectorAll('script');
            scripts.forEach(script => {
                if (script.textContent && script.textContent.includes('octoPrintDesigner')) {
                    try {
                        const matches = script.textContent.match(/nonce["\']:\s*["\']([^"\']+)["\']/) ||
                                      script.textContent.match(/wp_create_nonce/);
                        if (matches) {
                            ajaxMeasurement.nonceCreationTime = this.now();
                            this.mark('nonce-created');
                        }
                    } catch (e) {
                        // Ignore parsing errors
                    }
                }
            });
        },

        // Monitor AJAX requests for timing issues
        monitorAjaxRequests(ajaxMeasurement) {
            // Override jQuery AJAX if available
            if (window.jQuery && window.jQuery.ajax) {
                const originalAjax = window.jQuery.ajax;

                window.jQuery.ajax = function(options) {
                    if (options.data &&
                        (options.data.action && options.data.action.includes('octo_') ||
                         options.data.nonce)) {

                        const requestStart = TimingMeasurement.now();

                        if (!ajaxMeasurement.firstAjaxCallTime) {
                            ajaxMeasurement.firstAjaxCallTime = requestStart;
                            TimingMeasurement.mark('first-ajax-call');

                            // Calculate race condition timing
                            if (ajaxMeasurement.nonceCreationTime) {
                                ajaxMeasurement.timingGaps.nonceToAjax =
                                    requestStart - ajaxMeasurement.nonceCreationTime;
                            }
                        }

                        // Monitor request completion
                        const originalSuccess = options.success;
                        const originalError = options.error;

                        options.success = function(data, textStatus, jqXHR) {
                            const requestEnd = TimingMeasurement.now();
                            ajaxMeasurement.successfulRequests.push({
                                startTime: requestStart,
                                endTime: requestEnd,
                                duration: requestEnd - requestStart,
                                action: options.data.action,
                                hasNonce: !!options.data.nonce
                            });

                            if (originalSuccess) {
                                originalSuccess.call(this, data, textStatus, jqXHR);
                            }
                        };

                        options.error = function(jqXHR, textStatus, errorThrown) {
                            const requestEnd = TimingMeasurement.now();

                            // Check if error is nonce-related
                            const isNonceError = textStatus.includes('nonce') ||
                                                errorThrown.includes('Security') ||
                                                (jqXHR.responseText && jqXHR.responseText.includes('nonce'));

                            ajaxMeasurement.failedRequests.push({
                                startTime: requestStart,
                                endTime: requestEnd,
                                duration: requestEnd - requestStart,
                                action: options.data.action,
                                hasNonce: !!options.data.nonce,
                                isNonceError: isNonceError,
                                errorDetails: {
                                    textStatus: textStatus,
                                    errorThrown: errorThrown,
                                    status: jqXHR.status
                                }
                            });

                            if (isNonceError) {
                                TimingMeasurement.recordRaceConditionFailure('ajax-nonce-failure', {
                                    timingGap: ajaxMeasurement.timingGaps.nonceToAjax,
                                    requestDuration: requestEnd - requestStart,
                                    errorDetails: {
                                        textStatus: textStatus,
                                        errorThrown: errorThrown
                                    }
                                });
                            }

                            if (originalError) {
                                originalError.call(this, jqXHR, textStatus, errorThrown);
                            }
                        };
                    }

                    return originalAjax.call(this, options);
                };
            }

            // Also monitor fetch requests
            if (window.fetch) {
                const originalFetch = window.fetch;

                window.fetch = function(url, options) {
                    if (url.includes('admin-ajax.php') ||
                        (options && options.body && options.body.includes('octo_'))) {

                        const requestStart = TimingMeasurement.now();

                        return originalFetch.call(this, url, options)
                            .then(response => {
                                const requestEnd = TimingMeasurement.now();

                                if (response.ok) {
                                    ajaxMeasurement.successfulRequests.push({
                                        startTime: requestStart,
                                        endTime: requestEnd,
                                        duration: requestEnd - requestStart,
                                        url: url,
                                        method: 'fetch'
                                    });
                                } else {
                                    ajaxMeasurement.failedRequests.push({
                                        startTime: requestStart,
                                        endTime: requestEnd,
                                        duration: requestEnd - requestStart,
                                        url: url,
                                        method: 'fetch',
                                        status: response.status
                                    });
                                }

                                return response;
                            });
                    }

                    return originalFetch.call(this, url, options);
                };
            }
        },

        // Monitor JavaScript initialization completion
        monitorJavaScriptInit(ajaxMeasurement) {
            // Monitor for various initialization completion signals
            const initEvents = [
                'fabricGlobalReady',
                'designerWidgetExposed',
                'DOMContentLoaded'
            ];

            initEvents.forEach(eventName => {
                window.addEventListener(eventName, () => {
                    if (!ajaxMeasurement.jsInitCompletionTime) {
                        ajaxMeasurement.jsInitCompletionTime = this.now();
                        this.mark('js-init-complete');

                        // Calculate timing gap between init and first AJAX call
                        if (ajaxMeasurement.firstAjaxCallTime) {
                            ajaxMeasurement.timingGaps.initToAjax =
                                ajaxMeasurement.firstAjaxCallTime - ajaxMeasurement.jsInitCompletionTime;
                        }
                    }
                });
            });
        },

        // Record race condition failures
        recordRaceConditionFailure(type, details) {
            if (!this.failureRates[type]) {
                this.failureRates[type] = {
                    count: 0,
                    failures: [],
                    totalAttempts: 0
                };
            }

            this.failureRates[type].count++;
            this.failureRates[type].failures.push({
                timestamp: this.now(),
                details: details
            });

            console.warn(`⚠️ RACE CONDITION FAILURE [${type}]:`, details);
        },

        // Record fabric loading success
        recordFabricLoadingSuccess(details) {
            const fabricData = this.raceConditions.fabricLoading || {};
            fabricData.successDetails = details;
            fabricData.successTime = this.now();
            fabricData.successCount = (fabricData.successCount || 0) + 1;

            console.log('✅ FABRIC LOADING SUCCESS:', details);
        },

        // Record fabric loading failure
        recordFabricLoadingFailure(details) {
            const fabricData = this.raceConditions.fabricLoading || {};
            fabricData.failureDetails = details;
            fabricData.failureTime = this.now();
            fabricData.failureCount = (fabricData.failureCount || 0) + 1;

            this.recordRaceConditionFailure('fabric-loading', details);
        },

        // Record DesignerWidget exposure success
        recordDesignerWidgetSuccess(details) {
            const webpackData = this.raceConditions.webpackExtraction || {};
            webpackData.exposureSuccess = details;
            webpackData.exposureTime = this.now();

            console.log('✅ DESIGNER WIDGET EXPOSED:', details);
        },

        // Setup continuous monitoring
        setupContinuousMonitoring() {
            // Monitor every 5 seconds for 30 seconds
            const monitoringInterval = setInterval(() => {
                this.collectCurrentMetrics();
            }, 5000);

            setTimeout(() => {
                clearInterval(monitoringInterval);
                this.generateFinalReport();
            }, this.config.measurementWindow);
        },

        // Collect current performance metrics
        collectCurrentMetrics() {
            const currentMetrics = {
                timestamp: this.now(),
                memory: performance.memory ? {
                    usedJSHeapSize: performance.memory.usedJSHeapSize,
                    totalJSHeapSize: performance.memory.totalJSHeapSize,
                    jsHeapSizeLimit: performance.memory.jsHeapSizeLimit
                } : null,
                navigation: performance.navigation ? {
                    type: performance.navigation.type,
                    redirectCount: performance.navigation.redirectCount
                } : null,
                resourceTimings: performance.getEntriesByType ?
                    performance.getEntriesByType('resource')
                        .filter(entry => entry.name.includes('octo-print-designer'))
                        .map(entry => ({
                            name: entry.name,
                            startTime: entry.startTime,
                            duration: entry.duration,
                            transferSize: entry.transferSize
                        })) : [],
                systemState: {
                    fabricAvailable: !!(window.fabric && typeof window.fabric.Canvas === 'function'),
                    designerWidgetAvailable: !!window.DesignerWidget,
                    webpackAvailable: !!window.__webpack_require__,
                    jqueryAvailable: !!window.jQuery
                }
            };

            if (!this.performanceData.continuousMetrics) {
                this.performanceData.continuousMetrics = [];
            }
            this.performanceData.continuousMetrics.push(currentMetrics);
        },

        // Start measurement window
        startMeasurementWindow() {
            this.mark('measurement-window-start');
            console.log(`📊 TIMING MEASUREMENT: Starting ${this.config.measurementWindow}ms measurement window`);
        },

        // Generate comprehensive final report
        generateFinalReport() {
            this.mark('measurement-window-end');

            const report = {
                metadata: {
                    measurementDuration: this.measure('total-measurement', 'measurement-window-start', 'measurement-window-end'),
                    timestamp: new Date().toISOString(),
                    userAgent: navigator.userAgent,
                    config: this.config
                },

                // Summary of all race conditions
                raceConditionSummary: {
                    fabricLoading: this.analyzeFabricRaceCondition(),
                    webpackExtraction: this.analyzeWebpackRaceCondition(),
                    scriptDependencies: this.analyzeScriptDependencyIssues(),
                    ajaxNonce: this.analyzeAjaxNonceIssues()
                },

                // Performance metrics
                performanceMetrics: {
                    initialState: this.performanceData.initialState,
                    continuousMetrics: this.performanceData.continuousMetrics,
                    resourceTimings: this.getResourceTimings(),
                    criticalPathAnalysis: this.analyzeCriticalPath()
                },

                // Failure rate analysis
                failureAnalysis: {
                    rates: this.calculateFailureRates(),
                    patterns: this.identifyFailurePatterns(),
                    recommendations: this.generateRecommendations()
                },

                // Raw measurement data
                rawData: {
                    measurements: this.measurements,
                    raceConditions: this.raceConditions,
                    failureRates: this.failureRates
                }
            };

            console.log('📈 TIMING MEASUREMENT FINAL REPORT:', report);

            // Store report in global variable for external access
            window.timingMeasurementReport = report;

            // Trigger completion event
            window.dispatchEvent(new CustomEvent('timingMeasurementComplete', {
                detail: report
            }));

            return report;
        },

        // Analyze fabric loading race condition
        analyzeFabricRaceCondition() {
            const fabricData = this.raceConditions.fabricLoading || {};

            return {
                timeoutThreshold: fabricData.timeoutThreshold,
                actualTimeout: fabricData.actualTimeout,
                vendorBundleTime: fabricData.vendorBundleTime,
                cdnLoadTime: fabricData.cdnLoadTime,
                webpackExtractionTime: fabricData.webpackExtractionTime,
                successRate: fabricData.successCount / (fabricData.successCount + fabricData.failureCount),
                fabricAvailableAfterTimeout: fabricData.fabricAvailableAfterTimeout,
                recommendedTimeout: this.calculateOptimalTimeout(fabricData),
                issues: this.identifyFabricIssues(fabricData)
            };
        },

        // Analyze webpack extraction race condition
        analyzeWebpackRaceCondition() {
            const webpackData = this.raceConditions.webpackExtraction || {};

            return {
                extractionDelay: webpackData.extractionDelay,
                actualExtractionDelay: webpackData.actualExtractionDelay,
                moduleSearchCount: webpackData.moduleSearchCount,
                cacheHitRate: webpackData.cacheHits / (webpackData.cacheHits + webpackData.cacheMisses),
                slowCacheAccess: webpackData.slowCacheAccess || [],
                recommendedDelay: this.calculateOptimalExtractionDelay(webpackData),
                issues: this.identifyWebpackIssues(webpackData)
            };
        },

        // Analyze script dependency issues
        analyzeScriptDependencyIssues() {
            const depData = this.raceConditions.scriptDependencies || {};

            return {
                loadOrderViolations: depData.dependencyViolations ? depData.dependencyViolations.length : 0,
                headFooterGap: depData.loadingGaps ? depData.loadingGaps.headToFooter : null,
                timingConflicts: depData.timingConflicts || [],
                chainAnalysis: depData.chainAnalysis,
                recommendations: this.generateDependencyRecommendations(depData)
            };
        },

        // Analyze AJAX nonce issues
        analyzeAjaxNonceIssues() {
            const ajaxData = this.raceConditions.ajaxNonce || {};

            const nonceFailures = ajaxData.failedRequests ?
                ajaxData.failedRequests.filter(req => req.isNonceError) : [];

            return {
                totalRequests: (ajaxData.successfulRequests || []).length + (ajaxData.failedRequests || []).length,
                nonceFailures: nonceFailures.length,
                nonceFailureRate: nonceFailures.length / Math.max(1, (ajaxData.successfulRequests || []).length + (ajaxData.failedRequests || []).length),
                timingGaps: ajaxData.timingGaps || {},
                averageRequestDuration: this.calculateAverageRequestDuration(ajaxData),
                recommendations: this.generateAjaxRecommendations(ajaxData)
            };
        },

        // Calculate optimal timeout values
        calculateOptimalTimeout(fabricData) {
            if (!fabricData.vendorBundleTime && !fabricData.cdnLoadTime) {
                return fabricData.timeoutThreshold; // No data, keep current
            }

            const times = [fabricData.vendorBundleTime, fabricData.cdnLoadTime].filter(t => t !== null);
            if (times.length === 0) return fabricData.timeoutThreshold;

            const maxTime = Math.max(...times);
            const recommendedTimeout = Math.max(maxTime * 1.5, 500); // 1.5x buffer, minimum 500ms

            return Math.round(recommendedTimeout);
        },

        // Calculate optimal extraction delay
        calculateOptimalExtractionDelay(webpackData) {
            if (!webpackData.actualExtractionDelay) {
                return webpackData.extractionDelay;
            }

            return Math.max(webpackData.actualExtractionDelay * 1.2, 50); // 1.2x buffer, minimum 50ms
        },

        // Identify fabric-related issues
        identifyFabricIssues(fabricData) {
            const issues = [];

            if (fabricData.vendorBundleTime > 2000) {
                issues.push('Vendor bundle loading too slow (>2s)');
            }

            if (fabricData.cdnLoadTime && fabricData.cdnLoadTime > 1000) {
                issues.push('CDN fallback loading too slow (>1s)');
            }

            if (fabricData.failureCount > 0) {
                issues.push(`${fabricData.failureCount} fabric loading failures detected`);
            }

            if (!fabricData.fabricAvailableAfterTimeout) {
                issues.push('Fabric not available after timeout - timeout too short');
            }

            return issues;
        },

        // Identify webpack-related issues
        identifyWebpackIssues(webpackData) {
            const issues = [];

            if (webpackData.actualExtractionDelay > webpackData.extractionDelay * 2) {
                issues.push('Extraction delay significantly longer than threshold');
            }

            if (webpackData.cacheHits / (webpackData.cacheHits + webpackData.cacheMisses) < 0.8) {
                issues.push('Low webpack cache hit rate (<80%)');
            }

            if (webpackData.slowCacheAccess && webpackData.slowCacheAccess.length > 5) {
                issues.push('Multiple slow cache access patterns detected');
            }

            return issues;
        },

        // Get resource timing data
        getResourceTimings() {
            if (!performance.getEntriesByType) return [];

            return performance.getEntriesByType('resource')
                .filter(entry =>
                    entry.name.includes('octo-print-designer') ||
                    entry.name.includes('fabric.js') ||
                    entry.name.includes('vendor.bundle') ||
                    entry.name.includes('designer.bundle')
                )
                .map(entry => ({
                    name: entry.name,
                    startTime: entry.startTime,
                    duration: entry.duration,
                    transferSize: entry.transferSize,
                    encodedBodySize: entry.encodedBodySize,
                    decodedBodySize: entry.decodedBodySize
                }));
        },

        // Analyze critical path performance
        analyzeCriticalPath() {
            const criticalEvents = [
                'dom-ready',
                'vendor-bundle-loaded',
                'fabric-ready',
                'designer-widget-exposed',
                'first-ajax-call'
            ];

            const path = criticalEvents.map(event => ({
                event: event,
                timestamp: this.measurements[event] || null,
                delay: null
            }));

            // Calculate delays between events
            for (let i = 1; i < path.length; i++) {
                if (path[i].timestamp && path[i-1].timestamp) {
                    path[i].delay = path[i].timestamp - path[i-1].timestamp;
                }
            }

            return path;
        },

        // Calculate failure rates
        calculateFailureRates() {
            const rates = {};

            Object.keys(this.failureRates).forEach(type => {
                const data = this.failureRates[type];
                rates[type] = {
                    failureCount: data.count,
                    totalAttempts: Math.max(data.totalAttempts, data.count),
                    failureRate: data.count / Math.max(data.totalAttempts, data.count, 1),
                    averageTimeBetweenFailures: this.calculateAverageTimeBetweenFailures(data.failures)
                };
            });

            return rates;
        },

        // Calculate average time between failures
        calculateAverageTimeBetweenFailures(failures) {
            if (failures.length < 2) return null;

            const intervals = [];
            for (let i = 1; i < failures.length; i++) {
                intervals.push(failures[i].timestamp - failures[i-1].timestamp);
            }

            return intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
        },

        // Identify failure patterns
        identifyFailurePatterns() {
            const patterns = [];

            // Check for timing-related patterns
            Object.keys(this.failureRates).forEach(type => {
                const failures = this.failureRates[type].failures;
                if (failures.length >= 2) {
                    const timestamps = failures.map(f => f.timestamp);
                    const intervals = [];

                    for (let i = 1; i < timestamps.length; i++) {
                        intervals.push(timestamps[i] - timestamps[i-1]);
                    }

                    const avgInterval = intervals.reduce((sum, int) => sum + int, 0) / intervals.length;
                    const stdDev = Math.sqrt(intervals.reduce((sum, int) => sum + Math.pow(int - avgInterval, 2), 0) / intervals.length);

                    if (stdDev < avgInterval * 0.2) {
                        patterns.push({
                            type: type,
                            pattern: 'regular-intervals',
                            description: `Failures occurring at regular intervals (~${Math.round(avgInterval)}ms)`,
                            avgInterval: avgInterval,
                            stdDev: stdDev
                        });
                    }
                }
            });

            return patterns;
        },

        // Calculate average request duration
        calculateAverageRequestDuration(ajaxData) {
            const allRequests = [
                ...(ajaxData.successfulRequests || []),
                ...(ajaxData.failedRequests || [])
            ];

            if (allRequests.length === 0) return null;

            const totalDuration = allRequests.reduce((sum, req) => sum + req.duration, 0);
            return totalDuration / allRequests.length;
        },

        // Generate recommendations based on measurements
        generateRecommendations() {
            const recommendations = [];

            // Fabric loading recommendations
            const fabricData = this.raceConditions.fabricLoading || {};
            if (fabricData.failureCount > 0) {
                recommendations.push({
                    category: 'fabric-loading',
                    priority: 'high',
                    issue: 'Fabric loading failures detected',
                    recommendation: `Increase emergency-fabric-loader.js timeout from ${fabricData.timeoutThreshold}ms to ${this.calculateOptimalTimeout(fabricData)}ms`,
                    impact: 'Reduces fabric loading race conditions and improves initialization reliability'
                });
            }

            // Webpack extraction recommendations
            const webpackData = this.raceConditions.webpackExtraction || {};
            if (webpackData.actualExtractionDelay > webpackData.extractionDelay) {
                recommendations.push({
                    category: 'webpack-extraction',
                    priority: 'medium',
                    issue: 'Webpack module extraction delay too short',
                    recommendation: `Increase webpack-designer-patch.js extraction delay from ${webpackData.extractionDelay}ms to ${this.calculateOptimalExtractionDelay(webpackData)}ms`,
                    impact: 'Improves DesignerWidget exposure reliability'
                });
            }

            // Script dependency recommendations
            const depData = this.raceConditions.scriptDependencies || {};
            if (depData.dependencyViolations && depData.dependencyViolations.length > 0) {
                recommendations.push({
                    category: 'script-dependencies',
                    priority: 'high',
                    issue: `${depData.dependencyViolations.length} dependency violations detected`,
                    recommendation: 'Review script loading order in class-octo-print-designer-public.php and ensure proper dependency chains',
                    impact: 'Prevents initialization failures due to missing dependencies'
                });
            }

            // AJAX nonce recommendations
            const ajaxData = this.raceConditions.ajaxNonce || {};
            const nonceFailureRate = this.analyzeAjaxNonceIssues().nonceFailureRate;
            if (nonceFailureRate > 0.1) {
                recommendations.push({
                    category: 'ajax-nonce',
                    priority: 'high',
                    issue: `High nonce failure rate: ${(nonceFailureRate * 100).toFixed(1)}%`,
                    recommendation: 'Add initialization delay before first AJAX call to ensure nonce is properly set',
                    impact: 'Reduces AJAX failures and improves user experience'
                });
            }

            return recommendations;
        },

        // Generate dependency-specific recommendations
        generateDependencyRecommendations(depData) {
            const recommendations = [];

            if (depData.loadingGaps && depData.loadingGaps.headToFooter > 1000) {
                recommendations.push('Consider moving critical scripts to head for faster initialization');
            }

            if (depData.dependencyViolations && depData.dependencyViolations.length > 0) {
                recommendations.push('Reorder script enqueuing to match dependency requirements');
            }

            return recommendations;
        },

        // Generate AJAX-specific recommendations
        generateAjaxRecommendations(ajaxData) {
            const recommendations = [];

            if (ajaxData.timingGaps && ajaxData.timingGaps.nonceToAjax < 100) {
                recommendations.push('Add minimum delay between nonce creation and first AJAX call');
            }

            const avgDuration = this.calculateAverageRequestDuration(ajaxData);
            if (avgDuration > 2000) {
                recommendations.push('Optimize AJAX request processing time (currently >2s average)');
            }

            return recommendations;
        }
    };

    // Auto-initialize on script load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            TimingMeasurement.init();
        });
    } else {
        // DOM already loaded, initialize immediately
        TimingMeasurement.init();
    }

    // Expose for external access
    window.TimingMeasurement = TimingMeasurement;

    console.log('🔬 TIMING MEASUREMENT SYSTEM: Loaded and ready for Phase 6 analysis');

})();