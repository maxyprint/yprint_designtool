/**
 * 🔍 WEBPACK BUNDLE INSPECTOR - Deep Analysis Tool for fabric.js Loading
 *
 * MISSION: Comprehensive webpack bundle analysis to identify fabric.js loading bottlenecks
 * This system provides detailed inspection of webpack chunks, modules, and dependencies
 */

(function() {
    'use strict';

    // 🔍 Global bundle inspector state
    window.WebpackBundleInspector = {
        startTime: performance.now(),
        analyses: [],
        modules: [],
        chunks: [],
        dependencies: [],
        fabricModules: []
    };

    console.log('🔍 WEBPACK BUNDLE INSPECTOR: Starting deep bundle analysis');

    /**
     * Comprehensive webpack chunk analysis
     */
    function analyzeWebpackChunks() {
        console.log('🔍 ANALYZING WEBPACK CHUNKS...');

        const analysis = {
            timestamp: performance.now(),
            chunksAvailable: typeof window.webpackChunkocto_print_designer !== 'undefined',
            chunks: [],
            totalModules: 0,
            fabricModules: [],
            requireFunction: typeof window.__webpack_require__ === 'function'
        };

        if (analysis.chunksAvailable) {
            const chunks = window.webpackChunkocto_print_designer;
            analysis.chunks = chunks.map((chunk, index) => {
                const chunkInfo = {
                    index: index,
                    id: chunk[0],
                    modules: chunk[1] ? Object.keys(chunk[1]) : [],
                    moduleCount: chunk[1] ? Object.keys(chunk[1]).length : 0,
                    fabricModules: []
                };

                if (chunk[1]) {
                    // Search for fabric-related modules
                    Object.keys(chunk[1]).forEach(moduleId => {
                        if (moduleId.toLowerCase().includes('fabric')) {
                            chunkInfo.fabricModules.push({
                                id: moduleId,
                                isFunction: typeof chunk[1][moduleId] === 'function',
                                size: chunk[1][moduleId].toString().length
                            });
                            analysis.fabricModules.push(moduleId);
                        }
                    });
                }

                analysis.totalModules += chunkInfo.moduleCount;
                return chunkInfo;
            });
        }

        window.WebpackBundleInspector.analyses.push(analysis);

        console.log('📊 WEBPACK CHUNKS ANALYSIS:', {
            chunksFound: analysis.chunks.length,
            totalModules: analysis.totalModules,
            fabricModules: analysis.fabricModules.length,
            requireAvailable: analysis.requireFunction
        });

        return analysis;
    }

    /**
     * Deep module dependency analysis
     */
    function analyzeDependencies() {
        console.log('🔍 ANALYZING MODULE DEPENDENCIES...');

        const dependencies = {
            timestamp: performance.now(),
            cache: {},
            fabricDependencies: [],
            circularDeps: [],
            missingDeps: []
        };

        if (window.__webpack_require__ && window.__webpack_require__.cache) {
            const cache = window.__webpack_require__.cache;
            dependencies.cache = Object.keys(cache).reduce((acc, moduleId) => {
                const module = cache[moduleId];
                acc[moduleId] = {
                    loaded: !!module,
                    exports: module && module.exports ? Object.keys(module.exports) : [],
                    hasFabric: module && module.exports && (
                        module.exports.Canvas ||
                        module.exports.fabric ||
                        JSON.stringify(module.exports).includes('fabric')
                    )
                };

                if (acc[moduleId].hasFabric) {
                    dependencies.fabricDependencies.push(moduleId);
                }

                return acc;
            }, {});
        }

        window.WebpackBundleInspector.dependencies.push(dependencies);

        console.log('📊 DEPENDENCIES ANALYSIS:', {
            cachedModules: Object.keys(dependencies.cache).length,
            fabricDependencies: dependencies.fabricDependencies.length,
            fabricModuleIds: dependencies.fabricDependencies
        });

        return dependencies;
    }

    /**
     * Module loading timeline analysis
     */
    function analyzeModuleLoadingTimeline() {
        console.log('🔍 ANALYZING MODULE LOADING TIMELINE...');

        const timeline = {
            timestamp: performance.now(),
            scriptElements: [],
            loadSequence: [],
            fabricScripts: []
        };

        // Analyze all script elements
        const scripts = Array.from(document.querySelectorAll('script'));
        timeline.scriptElements = scripts.map((script, index) => {
            const scriptInfo = {
                index: index,
                src: script.src || 'inline',
                loaded: script.complete || script.readyState === 'complete',
                async: script.async,
                defer: script.defer,
                type: script.type || 'text/javascript',
                isFabricRelated: (script.src && (
                    script.src.includes('fabric') ||
                    script.src.includes('vendor') ||
                    script.src.includes('designer')
                )) || false
            };

            if (scriptInfo.isFabricRelated) {
                timeline.fabricScripts.push(scriptInfo);
            }

            return scriptInfo;
        });

        // Analyze loading sequence
        timeline.loadSequence = timeline.scriptElements
            .filter(script => script.loaded)
            .sort((a, b) => a.index - b.index)
            .map(script => ({
                src: script.src,
                isFabricRelated: script.isFabricRelated
            }));

        window.WebpackBundleInspector.modules.push(timeline);

        console.log('📊 MODULE TIMELINE ANALYSIS:', {
            totalScripts: timeline.scriptElements.length,
            loadedScripts: timeline.loadSequence.length,
            fabricRelatedScripts: timeline.fabricScripts.length,
            loadingOrder: timeline.loadSequence.map(s => s.src.split('/').pop())
        });

        return timeline;
    }

    /**
     * Fabric module extraction attempts tracker
     */
    function trackFabricExtractionAttempts() {
        console.log('🔍 TRACKING FABRIC EXTRACTION ATTEMPTS...');

        const extraction = {
            timestamp: performance.now(),
            attempts: [],
            successMethods: [],
            failedMethods: [],
            currentFabricState: {
                windowFabric: typeof window.fabric !== 'undefined',
                hasCanvas: window.fabric && typeof window.fabric.Canvas === 'function',
                globallyExposed: window.fabricGloballyExposed || false,
                extractorActive: window.webpackFabricExtractorActive || false,
                emergencyActive: window.emergencyFabricLoaderActive || false
            }
        };

        // Method 1: Direct webpack require
        extraction.attempts.push(attemptDirectWebpackRequire());

        // Method 2: Cache search
        extraction.attempts.push(attemptCacheSearch());

        // Method 3: Chunk module execution
        extraction.attempts.push(attemptChunkExecution());

        // Method 4: Global exposure check
        extraction.attempts.push(checkGlobalExposure());

        window.WebpackBundleInspector.fabricModules.push(extraction);

        console.log('📊 FABRIC EXTRACTION TRACKING:', {
            totalAttempts: extraction.attempts.length,
            successfulAttempts: extraction.attempts.filter(a => a.success).length,
            currentState: extraction.currentFabricState
        });

        return extraction;
    }

    /**
     * Attempt direct webpack require for fabric
     */
    function attemptDirectWebpackRequire() {
        const attempt = {
            method: 'direct_webpack_require',
            timestamp: performance.now(),
            success: false,
            details: {}
        };

        try {
            if (typeof window.__webpack_require__ === 'function') {
                const fabricModuleId = './node_modules/fabric/dist/index.min.mjs';
                const fabricModule = window.__webpack_require__(fabricModuleId);

                attempt.details = {
                    moduleId: fabricModuleId,
                    moduleFound: !!fabricModule,
                    hasCanvas: fabricModule && typeof fabricModule.Canvas === 'function',
                    moduleKeys: fabricModule ? Object.keys(fabricModule).slice(0, 10) : []
                };

                if (fabricModule && fabricModule.Canvas) {
                    attempt.success = true;
                    attempt.details.fabricAssigned = true;
                    console.log('✅ DIRECT REQUIRE: fabric.js found via webpack require');
                }
            } else {
                attempt.details.error = 'webpack_require_not_available';
            }
        } catch (error) {
            attempt.details.error = error.message;
        }

        return attempt;
    }

    /**
     * Attempt cache search for fabric
     */
    function attemptCacheSearch() {
        const attempt = {
            method: 'cache_search',
            timestamp: performance.now(),
            success: false,
            details: {}
        };

        try {
            if (window.__webpack_require__ && window.__webpack_require__.cache) {
                const cache = window.__webpack_require__.cache;
                const cacheKeys = Object.keys(cache);
                const fabricKeys = cacheKeys.filter(key => key.includes('fabric'));

                attempt.details = {
                    totalCacheKeys: cacheKeys.length,
                    fabricKeys: fabricKeys,
                    searchResults: []
                };

                for (const moduleId of cacheKeys) {
                    const module = cache[moduleId];
                    if (module && module.exports && module.exports.Canvas) {
                        attempt.details.searchResults.push({
                            moduleId: moduleId,
                            hasCanvas: typeof module.exports.Canvas === 'function',
                            exportKeys: Object.keys(module.exports)
                        });

                        if (typeof module.exports.Canvas === 'function') {
                            attempt.success = true;
                            console.log('✅ CACHE SEARCH: fabric.js found in webpack cache');
                            break;
                        }
                    }
                }
            } else {
                attempt.details.error = 'webpack_cache_not_available';
            }
        } catch (error) {
            attempt.details.error = error.message;
        }

        return attempt;
    }

    /**
     * Attempt chunk execution for fabric
     */
    function attemptChunkExecution() {
        const attempt = {
            method: 'chunk_execution',
            timestamp: performance.now(),
            success: false,
            details: {}
        };

        try {
            if (window.webpackChunkocto_print_designer) {
                const chunks = window.webpackChunkocto_print_designer;
                attempt.details = {
                    totalChunks: chunks.length,
                    fabricChunks: [],
                    executionResults: []
                };

                for (let i = 0; i < chunks.length; i++) {
                    const chunk = chunks[i];
                    if (chunk && chunk[1]) {
                        const modules = chunk[1];
                        const moduleIds = Object.keys(modules);
                        const fabricModuleIds = moduleIds.filter(id => id.includes('fabric'));

                        if (fabricModuleIds.length > 0) {
                            attempt.details.fabricChunks.push({
                                chunkIndex: i,
                                fabricModules: fabricModuleIds
                            });

                            for (const moduleId of fabricModuleIds) {
                                const result = executeModuleSafely(modules[moduleId], moduleId);
                                attempt.details.executionResults.push(result);

                                if (result.success && result.exports && result.exports.Canvas) {
                                    attempt.success = true;
                                    console.log('✅ CHUNK EXECUTION: fabric.js found via chunk execution');
                                    return attempt;
                                }
                            }
                        }
                    }
                }
            } else {
                attempt.details.error = 'webpack_chunks_not_available';
            }
        } catch (error) {
            attempt.details.error = error.message;
        }

        return attempt;
    }

    /**
     * Check global exposure status
     */
    function checkGlobalExposure() {
        const attempt = {
            method: 'global_exposure_check',
            timestamp: performance.now(),
            success: false,
            details: {}
        };

        attempt.details = {
            windowFabric: typeof window.fabric !== 'undefined',
            fabricCanvas: window.fabric && typeof window.fabric.Canvas === 'function',
            fabricGloballyExposed: window.fabricGloballyExposed || false,
            extractorActive: window.webpackFabricExtractorActive || false,
            emergencyActive: window.emergencyFabricLoaderActive || false
        };

        attempt.success = attempt.details.fabricCanvas && attempt.details.fabricGloballyExposed;

        if (attempt.success) {
            console.log('✅ GLOBAL EXPOSURE: fabric.js is properly exposed globally');
        }

        return attempt;
    }

    /**
     * Safely execute webpack module
     */
    function executeModuleSafely(moduleFunction, moduleId) {
        const result = {
            moduleId: moduleId,
            success: false,
            exports: null,
            error: null
        };

        try {
            if (typeof moduleFunction === 'function') {
                const mockExports = {};
                const mockModule = { exports: mockExports };
                const mockRequire = () => ({});

                moduleFunction(mockModule, mockExports, mockRequire);

                result.exports = mockExports;
                result.success = true;
            }
        } catch (error) {
            result.error = error.message;
        }

        return result;
    }

    /**
     * Generate comprehensive bundle analysis report
     */
    function generateComprehensiveReport() {
        console.log('📊 GENERATING COMPREHENSIVE BUNDLE ANALYSIS REPORT...');

        const report = {
            timestamp: new Date().toISOString(),
            sessionDuration: performance.now() - window.WebpackBundleInspector.startTime,
            analyses: {
                chunks: analyzeWebpackChunks(),
                dependencies: analyzeDependencies(),
                timeline: analyzeModuleLoadingTimeline(),
                extraction: trackFabricExtractionAttempts()
            },
            summary: {
                totalAnalyses: window.WebpackBundleInspector.analyses.length,
                fabricModulesFound: window.WebpackBundleInspector.fabricModules.length,
                criticalIssues: identifyCriticalIssues()
            }
        };

        console.log('📊 COMPREHENSIVE BUNDLE REPORT:', report);

        return report;
    }

    /**
     * Identify critical bundle issues
     */
    function identifyCriticalIssues() {
        const issues = [];

        // Check if webpack chunks are available
        if (typeof window.webpackChunkocto_print_designer === 'undefined') {
            issues.push({
                type: 'missing_webpack_chunks',
                severity: 'critical',
                description: 'Webpack chunks not available for analysis'
            });
        }

        // Check if webpack require is available
        if (typeof window.__webpack_require__ !== 'function') {
            issues.push({
                type: 'missing_webpack_require',
                severity: 'critical',
                description: 'Webpack require function not available'
            });
        }

        // Check if fabric modules are present but not loading
        const fabricModulesPresent = window.WebpackBundleInspector.fabricModules.length > 0;
        const fabricGloballyAvailable = window.fabric && typeof window.fabric.Canvas === 'function';

        if (fabricModulesPresent && !fabricGloballyAvailable) {
            issues.push({
                type: 'fabric_extraction_failure',
                severity: 'critical',
                description: 'Fabric modules found in bundle but extraction failed'
            });
        }

        // Check for emergency loader activation
        if (window.emergencyFabricLoaderActive) {
            issues.push({
                type: 'emergency_loader_active',
                severity: 'high',
                description: 'Emergency loader active indicates webpack extraction failed'
            });
        }

        return issues;
    }

    // 🔍 Initialize bundle inspector
    console.log('🔍 WEBPACK BUNDLE INSPECTOR: Starting analysis...');

    // Run initial analysis
    setTimeout(() => {
        generateComprehensiveReport();
    }, 1000);

    // Run periodic analysis
    const analysisInterval = setInterval(() => {
        const report = generateComprehensiveReport();

        // Stop analysis if fabric is successfully loaded or after 10 seconds
        if ((window.fabric && typeof window.fabric.Canvas === 'function') ||
            (performance.now() - window.WebpackBundleInspector.startTime > 10000)) {
            clearInterval(analysisInterval);
            console.log('🔍 WEBPACK BUNDLE INSPECTOR: Analysis completed');
        }
    }, 2000);

    // 🔍 Global access for manual analysis
    window.WebpackBundleInspector.analyzeChunks = analyzeWebpackChunks;
    window.WebpackBundleInspector.analyzeDependencies = analyzeDependencies;
    window.WebpackBundleInspector.analyzeTimeline = analyzeModuleLoadingTimeline;
    window.WebpackBundleInspector.trackExtraction = trackFabricExtractionAttempts;
    window.WebpackBundleInspector.generateReport = generateComprehensiveReport;

    console.log('🔍 WEBPACK BUNDLE INSPECTOR: Deep analysis tools active');
    console.log('🔧 Manual functions: window.WebpackBundleInspector.*');

})();