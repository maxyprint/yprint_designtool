/**
 * 🏁 RACE CONDITION ANALYZER - Precise Timing Analysis for fabric.js Loading
 *
 * MISSION: Identify exact timing issues and race conditions in fabric.js loading sequence
 * This system measures microsecond-level timing to pinpoint when and why things fail
 */

(function() {
    'use strict';

    // 🏁 Race condition tracking
    window.RaceConditionAnalyzer = {
        startTime: performance.now(),
        measurements: [],
        phases: {},
        criticalPoints: [],
        raceConditions: []
    };

    console.log('🏁 RACE CONDITION ANALYZER: Starting precision timing analysis');

    /**
     * Measure execution time of functions
     */
    function measureExecution(name, fn) {
        const start = performance.now();
        let result, error;

        try {
            result = fn();
        } catch (e) {
            error = e;
        }

        const end = performance.now();
        const duration = end - start;

        const measurement = {
            name: name,
            start: start,
            end: end,
            duration: duration,
            success: !error,
            error: error ? error.message : null,
            result: result
        };

        window.RaceConditionAnalyzer.measurements.push(measurement);

        console.log(`🏁 [${duration.toFixed(2)}ms] ${name}:`, {
            duration: `${duration.toFixed(2)}ms`,
            success: !error,
            error: error ? error.message : null
        });

        return { measurement, result, error };
    }

    /**
     * Track critical timing points
     */
    function trackCriticalPoint(point, condition, details = {}) {
        const timestamp = performance.now();
        const elapsed = timestamp - window.RaceConditionAnalyzer.startTime;

        const critical = {
            point: point,
            timestamp: timestamp,
            elapsed: elapsed,
            condition: condition,
            met: !!condition,
            details: details,
            stackTrace: new Error().stack
        };

        window.RaceConditionAnalyzer.criticalPoints.push(critical);

        const status = critical.met ? '✅' : '❌';
        console.log(`🏁 ${status} [${elapsed.toFixed(2)}ms] CRITICAL POINT: ${point}`, {
            condition: condition,
            met: critical.met,
            details: details
        });

        return critical;
    }

    /**
     * Detect race conditions between processes
     */
    function detectRaceCondition(processA, processB, description) {
        const race = {
            processA: processA,
            processB: processB,
            description: description,
            timestamp: performance.now(),
            detected: true
        };

        window.RaceConditionAnalyzer.raceConditions.push(race);

        console.warn('🏁 ⚠️ RACE CONDITION DETECTED:', description, {
            processA: processA,
            processB: processB
        });

        return race;
    }

    /**
     * Analyze vendor bundle loading timing
     */
    function analyzeVendorBundleTiming() {
        console.log('🏁 ANALYZING VENDOR BUNDLE LOADING TIMING...');

        return measureExecution('vendor_bundle_analysis', () => {
            const scripts = Array.from(document.querySelectorAll('script[src*="vendor.bundle.js"]'));

            const analysis = {
                scriptsFound: scripts.length,
                loadStates: scripts.map(script => ({
                    src: script.src,
                    readyState: script.readyState,
                    complete: script.complete,
                    async: script.async,
                    defer: script.defer
                })),
                timing: scripts.map(script => {
                    if (script.complete) {
                        return { loaded: true, timing: 'already_complete' };
                    } else {
                        return { loaded: false, timing: 'still_loading' };
                    }
                })
            };

            // Track critical point
            trackCriticalPoint(
                'VENDOR_BUNDLE_LOADED',
                scripts.some(s => s.complete),
                analysis
            );

            return analysis;
        });
    }

    /**
     * Analyze webpack chunks timing
     */
    function analyzeWebpackChunksTiming() {
        console.log('🏁 ANALYZING WEBPACK CHUNKS TIMING...');

        return measureExecution('webpack_chunks_analysis', () => {
            const chunksAvailable = typeof window.webpackChunkocto_print_designer !== 'undefined';
            const requireAvailable = typeof window.__webpack_require__ === 'function';

            const analysis = {
                chunksAvailable: chunksAvailable,
                chunksCount: chunksAvailable ? window.webpackChunkocto_print_designer.length : 0,
                requireAvailable: requireAvailable,
                webpackReady: chunksAvailable && requireAvailable
            };

            // Track critical point
            trackCriticalPoint(
                'WEBPACK_CHUNKS_READY',
                analysis.webpackReady,
                analysis
            );

            // Detect race condition if scripts are trying to use webpack before it's ready
            if (window.webpackFabricExtractorActive && !analysis.webpackReady) {
                detectRaceCondition(
                    'webpack_fabric_extractor',
                    'webpack_chunks_loading',
                    'Webpack extractor trying to run before webpack chunks are ready'
                );
            }

            return analysis;
        });
    }

    /**
     * Analyze fabric.js extraction timing
     */
    function analyzeFabricExtractionTiming() {
        console.log('🏁 ANALYZING FABRIC EXTRACTION TIMING...');

        return measureExecution('fabric_extraction_analysis', () => {
            const fabricExists = typeof window.fabric !== 'undefined';
            const fabricHasCanvas = fabricExists && typeof window.fabric.Canvas === 'function';
            const fabricGloballyExposed = window.fabricGloballyExposed || false;

            const analysis = {
                fabricExists: fabricExists,
                fabricHasCanvas: fabricHasCanvas,
                fabricGloballyExposed: fabricGloballyExposed,
                extractorActive: window.webpackFabricExtractorActive || false,
                emergencyActive: window.emergencyFabricLoaderActive || false
            };

            // Track critical point
            trackCriticalPoint(
                'FABRIC_EXTRACTED',
                fabricHasCanvas,
                analysis
            );

            // Detect race condition if dependent scripts are running before fabric is ready
            if (!fabricHasCanvas && (
                document.querySelector('script[src*="design-loader"]') ||
                document.querySelector('script[src*="production-ready"]')
            )) {
                detectRaceCondition(
                    'dependent_scripts',
                    'fabric_extraction',
                    'Dependent scripts loaded before fabric.js is available'
                );
            }

            return analysis;
        });
    }

    /**
     * Analyze dependent script timing
     */
    function analyzeDependentScriptsTiming() {
        console.log('🏁 ANALYZING DEPENDENT SCRIPTS TIMING...');

        return measureExecution('dependent_scripts_analysis', () => {
            const dependentScripts = [
                'design-loader',
                'production-ready-design-data-capture',
                'canvas-initialization-controller',
                'fabric-canvas-singleton'
            ];

            const analysis = dependentScripts.map(scriptName => {
                const elements = document.querySelectorAll(`script[src*="${scriptName}"]`);
                return {
                    name: scriptName,
                    found: elements.length > 0,
                    loaded: Array.from(elements).some(el => el.complete),
                    elements: Array.from(elements).map(el => ({
                        src: el.src,
                        complete: el.complete,
                        readyState: el.readyState
                    }))
                };
            });

            // Track critical point
            trackCriticalPoint(
                'DEPENDENT_SCRIPTS_LOADED',
                analysis.some(script => script.loaded),
                analysis
            );

            return analysis;
        });
    }

    /**
     * Comprehensive race condition detection
     */
    function runComprehensiveRaceDetection() {
        console.log('🏁 RUNNING COMPREHENSIVE RACE CONDITION DETECTION...');

        const detectionStart = performance.now();

        // Run all timing analyses
        const vendorTiming = analyzeVendorBundleTiming();
        const webpackTiming = analyzeWebpackChunksTiming();
        const fabricTiming = analyzeFabricExtractionTiming();
        const scriptsTiming = analyzeDependentScriptsTiming();

        const detectionEnd = performance.now();

        const summary = {
            detectionDuration: detectionEnd - detectionStart,
            totalMeasurements: window.RaceConditionAnalyzer.measurements.length,
            criticalPoints: window.RaceConditionAnalyzer.criticalPoints.length,
            raceConditions: window.RaceConditionAnalyzer.raceConditions.length,
            analyses: {
                vendor: vendorTiming.result,
                webpack: webpackTiming.result,
                fabric: fabricTiming.result,
                scripts: scriptsTiming.result
            }
        };

        console.log('🏁 RACE CONDITION DETECTION SUMMARY:', summary);

        // Generate timing report
        generateTimingReport();

        return summary;
    }

    /**
     * Generate detailed timing report
     */
    function generateTimingReport() {
        const report = {
            sessionStart: window.RaceConditionAnalyzer.startTime,
            totalDuration: performance.now() - window.RaceConditionAnalyzer.startTime,
            measurements: window.RaceConditionAnalyzer.measurements,
            criticalPoints: window.RaceConditionAnalyzer.criticalPoints,
            raceConditions: window.RaceConditionAnalyzer.raceConditions,
            timeline: generateTimeline()
        };

        console.log('📊 DETAILED TIMING REPORT:', report);
        console.log('📈 TIMING TIMELINE:', report.timeline);

        // Check for critical timing issues
        identifyCriticalTimingIssues(report);

        return report;
    }

    /**
     * Generate visual timeline
     */
    function generateTimeline() {
        const events = [
            ...window.RaceConditionAnalyzer.measurements.map(m => ({
                time: m.start,
                type: 'measurement',
                name: m.name,
                duration: m.duration,
                success: m.success
            })),
            ...window.RaceConditionAnalyzer.criticalPoints.map(cp => ({
                time: cp.timestamp,
                type: 'critical_point',
                name: cp.point,
                met: cp.met
            }))
        ].sort((a, b) => a.time - b.time);

        return events;
    }

    /**
     * Identify critical timing issues
     */
    function identifyCriticalTimingIssues(report) {
        const issues = [];

        // Check if vendor bundle loads too slowly
        const vendorMeasurement = report.measurements.find(m => m.name === 'vendor_bundle_analysis');
        if (vendorMeasurement && vendorMeasurement.duration > 1000) {
            issues.push({
                type: 'slow_vendor_loading',
                duration: vendorMeasurement.duration,
                severity: 'high'
            });
        }

        // Check if webpack extraction happens too late
        const webpackPoint = report.criticalPoints.find(cp => cp.point === 'WEBPACK_CHUNKS_READY');
        if (webpackPoint && webpackPoint.elapsed > 2000) {
            issues.push({
                type: 'late_webpack_ready',
                elapsed: webpackPoint.elapsed,
                severity: 'critical'
            });
        }

        // Check if fabric extraction fails
        const fabricPoint = report.criticalPoints.find(cp => cp.point === 'FABRIC_EXTRACTED');
        if (fabricPoint && !fabricPoint.met) {
            issues.push({
                type: 'fabric_extraction_failed',
                severity: 'critical'
            });
        }

        if (issues.length > 0) {
            console.error('🏁 ❌ CRITICAL TIMING ISSUES IDENTIFIED:', issues);
        } else {
            console.log('🏁 ✅ No critical timing issues detected');
        }

        return issues;
    }

    // 🏁 Initialize periodic monitoring
    let monitoringInterval = setInterval(() => {
        runComprehensiveRaceDetection();

        // Stop monitoring after fabric is available or after 10 seconds
        if ((window.fabric && typeof window.fabric.Canvas === 'function') ||
            (performance.now() - window.RaceConditionAnalyzer.startTime > 10000)) {
            clearInterval(monitoringInterval);
            console.log('🏁 RACE CONDITION MONITORING COMPLETED');
        }
    }, 500); // Check every 500ms

    // 🏁 Global access for manual analysis
    window.RaceConditionAnalyzer.runDetection = runComprehensiveRaceDetection;
    window.RaceConditionAnalyzer.generateReport = generateTimingReport;
    window.RaceConditionAnalyzer.trackPoint = trackCriticalPoint;

    console.log('🏁 RACE CONDITION ANALYZER: Active monitoring started');
    console.log('🔧 Manual functions: window.RaceConditionAnalyzer.*');

})();