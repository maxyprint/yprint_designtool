/**
 * 🤖 AGENT 5: PERFORMANCE OPTIMIZATION SPECIALIST
 * WebWorker für CPU-intensive PrecisionCalculator Operations
 *
 * Mission: Offload heavy calculations to separate thread for UI responsiveness
 *
 * Features:
 * - Multi-View Reference Line Processing in Background
 * - Cross-View Consistency Calculations
 * - Complex Statistical Operations
 * - Memory-Efficient Batch Processing
 * - Real-time Progress Updates
 *
 * @version 1.0.0
 * @performance High-Priority Background Processing
 */

class PrecisionCalculationWorker {
    constructor() {
        this.version = '1.0.0';
        this.startTime = performance.now();
        this.taskQueue = [];
        this.processingTask = false;
        this.cache = new Map();
        this.cacheExpiry = 300000; // 5 minutes

        // Initialize worker
        this.log('WebWorker initialized for PrecisionCalculator operations');
    }

    /**
     * 🎯 MAIN MESSAGE HANDLER: Route incoming calculation tasks
     */
    handleMessage(event) {
        const { taskId, type, data, options = {} } = event.data;

        try {
            this.log(`Processing task: ${type} (ID: ${taskId})`);

            let result;
            const startTime = performance.now();

            switch (type) {
                case 'calculatePrecisionMetrics':
                    result = this.calculatePrecisionMetrics(data, options);
                    break;

                case 'validateCrossViewConsistency':
                    result = this.validateCrossViewConsistency(data, options);
                    break;

                case 'processBridgeData':
                    result = this.processBridgeData(data, options);
                    break;

                case 'batchCalculateReferences':
                    result = this.batchCalculateReferences(data, options);
                    break;

                case 'optimizeMemoryUsage':
                    result = this.optimizeMemoryUsage(data, options);
                    break;

                case 'runPerformanceBenchmark':
                    result = this.runPerformanceBenchmark(data, options);
                    break;

                default:
                    throw new Error(`Unknown task type: ${type}`);
            }

            const executionTime = performance.now() - startTime;

            // Send result back to main thread
            self.postMessage({
                taskId,
                type: 'taskComplete',
                result,
                executionTime,
                success: true
            });

            this.log(`Task completed: ${type} (${executionTime.toFixed(2)}ms)`);

        } catch (error) {
            // Send error back to main thread
            self.postMessage({
                taskId,
                type: 'taskError',
                error: error.message,
                stack: error.stack,
                success: false
            });

            this.error(`Task failed: ${type} - ${error.message}`);
        }
    }

    /**
     * 🔢 PRECISION METRICS CALCULATION: Heavy calculations in background
     */
    calculatePrecisionMetrics(data, options) {
        const { templateId, measurementKey, multiViewLines, assignments, templateMeasurements } = data;
        const cacheKey = `precision_${templateId}_${measurementKey || 'all'}`;

        // Check cache first
        if (this.checkCache(cacheKey)) {
            this.log('Cache hit for precision metrics');
            return this.getFromCache(cacheKey);
        }

        const metrics = {
            templateId,
            measurementKey,
            calculatedAt: Date.now(),
            views: {},
            crossViewConsistency: null,
            bridgeIntegration: null,
            performanceStats: {
                calculationTime: 0,
                memoryUsage: this.getMemoryUsage()
            }
        };

        const startCalc = performance.now();

        // Process each view
        if (multiViewLines && typeof multiViewLines === 'object') {
            for (const [viewId, viewLines] of Object.entries(multiViewLines)) {
                if (!Array.isArray(viewLines)) continue;

                const viewCalculations = this.processViewCalculations(viewId, viewLines, templateMeasurements);
                metrics.views[viewId] = viewCalculations;

                // Send progress update for long operations
                if (Object.keys(metrics.views).length % 5 === 0) {
                    self.postMessage({
                        type: 'progress',
                        progress: (Object.keys(metrics.views).length / Object.keys(multiViewLines).length) * 100
                    });
                }
            }
        }

        // Cross-view consistency calculation
        if (Object.keys(metrics.views).length > 1) {
            metrics.crossViewConsistency = this.calculateCrossViewConsistency(metrics.views);
        }

        // Bridge integration analysis
        if (assignments) {
            metrics.bridgeIntegration = this.analyzeBridgeIntegration(assignments, metrics.views);
        }

        metrics.performanceStats.calculationTime = performance.now() - startCalc;
        metrics.performanceStats.finalMemoryUsage = this.getMemoryUsage();

        // Cache result
        this.setCache(cacheKey, metrics);

        return metrics;
    }

    /**
     * 🔗 CROSS-VIEW CONSISTENCY: Statistical analysis across views
     */
    validateCrossViewConsistency(data, options) {
        const { multiViewCalculations, templateId } = data;

        const consistencyResults = {};
        const measurementKeys = this.extractUniqueMeasurementKeys(multiViewCalculations);

        for (const measurementKey of measurementKeys) {
            const viewValues = [];
            const viewQualities = [];

            // Collect values across views
            for (const [viewId, viewData] of Object.entries(multiViewCalculations)) {
                if (viewData.calculations && viewData.calculations[measurementKey]) {
                    const calc = viewData.calculations[measurementKey];
                    viewValues.push(calc.calculatedCmValue);
                    viewQualities.push(calc.transformationQuality);
                }
            }

            if (viewValues.length < 2) {
                consistencyResults[measurementKey] = {
                    consistencyScore: 100,
                    variationCm: 0,
                    viewCount: viewValues.length,
                    status: 'single_view'
                };
                continue;
            }

            // Statistical calculations
            const stats = this.calculateStatistics(viewValues);
            const consistencyScore = Math.max(0, Math.min(100, 100 - stats.coefficientOfVariation));

            consistencyResults[measurementKey] = {
                consistencyScore: Math.round(consistencyScore * 100) / 100,
                meanValueCm: Math.round(stats.mean * 100) / 100,
                standardDeviation: Math.round(stats.standardDeviation * 1000) / 1000,
                variationCm: Math.round((stats.max - stats.min) * 100) / 100,
                coefficientOfVariation: Math.round(stats.coefficientOfVariation * 100) / 100,
                viewCount: viewValues.length,
                viewValues: Object.fromEntries(
                    Object.keys(multiViewCalculations).map((viewId, idx) => [viewId, viewValues[idx]])
                ),
                status: this.getConsistencyStatus(consistencyScore)
            };
        }

        const overallScore = Object.values(consistencyResults).reduce((sum, result) =>
            sum + result.consistencyScore, 0) / Object.keys(consistencyResults).length;

        return {
            templateId,
            overallConsistencyScore: Math.round(overallScore * 100) / 100,
            measurementConsistency: consistencyResults,
            totalMeasurements: Object.keys(consistencyResults).length,
            viewsAnalyzed: Object.keys(multiViewCalculations).length,
            bridgeVersion: '2.1'
        };
    }

    /**
     * 🌉 BRIDGE DATA PROCESSING: Complex bridge integration logic
     */
    processBridgeData(data, options) {
        const { templateId, bridgeData, multiViewLines } = data;

        const processedResults = {
            templateId,
            processedAt: Date.now(),
            assignments: {},
            referenceMappings: {},
            precisionAnalysis: {},
            integrationScore: 0
        };

        // Process measurement assignments
        if (bridgeData.assignments) {
            processedResults.assignments = this.processMeasurementAssignments(
                bridgeData.assignments,
                multiViewLines
            );
        }

        // Process reference mappings
        if (bridgeData.referenceMappings) {
            processedResults.referenceMappings = this.processReferenceMappings(
                bridgeData.referenceMappings,
                multiViewLines
            );
        }

        // Process precision requirements
        if (bridgeData.precisionRequirements) {
            processedResults.precisionAnalysis = this.processPrecisionRequirements(
                bridgeData.precisionRequirements,
                multiViewLines
            );
        }

        // Calculate integration score
        processedResults.integrationScore = this.calculateIntegrationScore(processedResults);

        return processedResults;
    }

    /**
     * 📦 BATCH CALCULATE REFERENCES: Process multiple reference lines efficiently
     */
    batchCalculateReferences(data, options) {
        const { references, templateId, batchSize = 50 } = data;
        const results = [];
        const total = references.length;

        // Process in batches to avoid memory issues
        for (let i = 0; i < total; i += batchSize) {
            const batch = references.slice(i, i + batchSize);
            const batchResults = batch.map(ref => this.calculateSingleReference(ref, templateId));
            results.push(...batchResults);

            // Send progress update
            self.postMessage({
                type: 'batchProgress',
                processed: i + batchSize,
                total: total,
                progress: ((i + batchSize) / total) * 100
            });

            // Small delay to prevent blocking
            if (i + batchSize < total) {
                // Use setTimeout equivalent in Worker
                const start = performance.now();
                while (performance.now() - start < 1) {
                    // Micro delay
                }
            }
        }

        return {
            templateId,
            processedReferences: results,
            totalProcessed: results.length,
            batchSize,
            processingTime: performance.now() - this.startTime
        };
    }

    /**
     * 🧠 MEMORY OPTIMIZATION: Clean up and optimize memory usage
     */
    optimizeMemoryUsage(data, options) {
        const beforeMemory = this.getMemoryUsage();

        // Clear expired cache entries
        const now = Date.now();
        for (const [key, entry] of this.cache.entries()) {
            if (now - entry.timestamp > this.cacheExpiry) {
                this.cache.delete(key);
            }
        }

        // Force garbage collection hints
        if (typeof gc === 'function') {
            gc();
        }

        const afterMemory = this.getMemoryUsage();

        return {
            memoryBefore: beforeMemory,
            memoryAfter: afterMemory,
            memoryFreed: beforeMemory - afterMemory,
            cacheEntriesRemoved: 0, // Would track in real implementation
            optimizationTime: performance.now() - data.startTime
        };
    }

    /**
     * ⚡ PERFORMANCE BENCHMARK: Test calculation performance
     */
    runPerformanceBenchmark(data, options) {
        const { iterations = 100, testType = 'full' } = data;
        const benchmarkResults = {
            startTime: performance.now(),
            iterations,
            testType,
            results: {}
        };

        // Test precision calculations
        if (testType === 'full' || testType === 'precision') {
            const precisionTimes = [];
            for (let i = 0; i < iterations; i++) {
                const start = performance.now();
                this.calculatePrecisionMetrics({
                    templateId: 1,
                    multiViewLines: { view1: [{ measurement_key: 'A', lengthPx: 100 }] }
                }, {});
                precisionTimes.push(performance.now() - start);
            }
            benchmarkResults.results.precision = this.analyzePerformanceResults(precisionTimes);
        }

        benchmarkResults.totalTime = performance.now() - benchmarkResults.startTime;
        return benchmarkResults;
    }

    // HELPER METHODS

    processViewCalculations(viewId, viewLines, templateMeasurements) {
        const calculations = {};

        for (const line of viewLines) {
            if (!this.validateReferenceLine(line)) continue;

            const calculation = {
                measurementKey: line.measurement_key,
                viewId,
                pixelLength: line.lengthPx,
                precisionLevel: line.precision_level || 0.1,
                measurementCategory: line.measurement_category || 'horizontal',
                bridgeReady: this.isBridgeReady(line),
                transformationQuality: this.calculateTransformationQuality(line),
                calculatedCmValue: this.calculateCentimetersFromPixels(line),
                accuracyScore: 0
            };

            // Database comparison if available
            if (templateMeasurements && templateMeasurements[line.measurement_key]) {
                const dbValue = templateMeasurements[line.measurement_key];
                calculation.databaseValueCm = dbValue;
                calculation.accuracyScore = this.calculateAccuracyScore(
                    calculation.calculatedCmValue,
                    dbValue
                );
            }

            calculations[line.measurement_key] = calculation;
        }

        return {
            viewId,
            calculations,
            totalMeasurements: Object.keys(calculations).length,
            bridgeReadyCount: Object.values(calculations).filter(c => c.bridgeReady).length,
            averageAccuracy: this.calculateAverageAccuracy(Object.values(calculations))
        };
    }

    calculateStatistics(values) {
        if (!values.length) return { mean: 0, standardDeviation: 0, coefficientOfVariation: 0 };

        const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
        const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
        const standardDeviation = Math.sqrt(variance);
        const coefficientOfVariation = mean > 0 ? (standardDeviation / mean) * 100 : 0;

        return {
            mean,
            standardDeviation,
            coefficientOfVariation,
            min: Math.min(...values),
            max: Math.max(...values)
        };
    }

    extractUniqueMeasurementKeys(multiViewCalculations) {
        const keys = new Set();

        for (const viewData of Object.values(multiViewCalculations)) {
            if (viewData.calculations) {
                Object.keys(viewData.calculations).forEach(key => keys.add(key));
            }
        }

        return Array.from(keys);
    }

    calculateTransformationQuality(line) {
        let quality = 100;

        if (!line.bridge_version) quality -= 10;
        if (!line.precision_level) quality -= 15;
        if (!line.measurement_category) quality -= 10;
        if (!line.created_timestamp) quality -= 5;
        if (line.lengthPx < 10) quality -= 20;
        if (line.precision_level <= 0) quality -= 25;

        return Math.max(0, Math.min(100, quality));
    }

    calculateCentimetersFromPixels(line) {
        const defaultPixelsPerCm = 3.779;
        return Math.round((line.lengthPx / defaultPixelsPerCm) * 100) / 100;
    }

    calculateAccuracyScore(calculated, database) {
        if (database === 0) return 0;

        const difference = Math.abs(calculated - database);
        const percentageError = (difference / database) * 100;

        return Math.max(0, Math.round((100 - percentageError * 2) * 100) / 100);
    }

    calculateAverageAccuracy(calculations) {
        const scores = calculations.filter(c => c.accuracyScore > 0).map(c => c.accuracyScore);
        return scores.length > 0 ? scores.reduce((sum, score) => sum + score, 0) / scores.length : 0;
    }

    isBridgeReady(line) {
        return !!(line.linked_to_measurements && line.precision_level > 0 && line.measurement_category);
    }

    validateReferenceLine(line) {
        return !!(line.measurement_key && line.lengthPx && line.lengthPx > 0);
    }

    getConsistencyStatus(score) {
        if (score >= 90) return 'excellent';
        if (score >= 75) return 'good';
        if (score >= 60) return 'acceptable';
        if (score >= 40) return 'poor';
        return 'critical';
    }

    // Cache management
    checkCache(key) {
        const entry = this.cache.get(key);
        if (!entry) return false;

        if (Date.now() - entry.timestamp > this.cacheExpiry) {
            this.cache.delete(key);
            return false;
        }

        return true;
    }

    getFromCache(key) {
        return this.cache.get(key).data;
    }

    setCache(key, data) {
        this.cache.set(key, {
            data,
            timestamp: Date.now()
        });
    }

    // Utility methods
    getMemoryUsage() {
        return typeof performance !== 'undefined' && performance.memory
            ? performance.memory.usedJSHeapSize
            : 0;
    }

    log(message) {
        console.log(`[PrecisionWorker] ${message}`);
    }

    error(message) {
        console.error(`[PrecisionWorker] ERROR: ${message}`);
    }

    // Stub implementations for completeness
    processMeasurementAssignments(assignments, multiViewLines) {
        return Object.keys(assignments).length;
    }

    processReferenceMappings(mappings, multiViewLines) {
        return Object.keys(mappings).length;
    }

    processPrecisionRequirements(requirements, multiViewLines) {
        return Object.keys(requirements).length;
    }

    calculateIntegrationScore(results) {
        let score = 70;
        score += Math.min(20, Object.keys(results.assignments).length * 2);
        score += Math.min(10, Object.keys(results.referenceMappings).length);
        return Math.min(100, score);
    }

    calculateSingleReference(reference, templateId) {
        return {
            measurementKey: reference.measurement_key,
            calculatedValue: this.calculateCentimetersFromPixels(reference),
            templateId,
            processedAt: Date.now()
        };
    }

    analyzePerformanceResults(times) {
        const sorted = times.sort((a, b) => a - b);
        return {
            min: sorted[0],
            max: sorted[sorted.length - 1],
            mean: times.reduce((sum, t) => sum + t, 0) / times.length,
            median: sorted[Math.floor(sorted.length / 2)],
            p95: sorted[Math.floor(sorted.length * 0.95)]
        };
    }
}

// Initialize worker
const worker = new PrecisionCalculationWorker();

// Listen for messages from main thread
self.addEventListener('message', (event) => {
    worker.handleMessage(event);
});

// Send ready signal
self.postMessage({
    type: 'workerReady',
    version: worker.version,
    capabilities: [
        'calculatePrecisionMetrics',
        'validateCrossViewConsistency',
        'processBridgeData',
        'batchCalculateReferences',
        'optimizeMemoryUsage',
        'runPerformanceBenchmark'
    ]
});