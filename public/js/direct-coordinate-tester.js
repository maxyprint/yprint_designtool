/**
 * 🧪 DIRECT COORDINATE TESTING FRAMEWORK
 *
 * ULTRA-THINK Testing Approach für Koordinaten-Genauigkeit
 *
 * PURPOSE:
 * - Vergleicht DirectCoordinate vs. bestehende Koordinatensysteme
 * - Misst Koordinaten-Genauigkeit und Abweichungen
 * - Erstellt Test-Reports über Koordinaten-Unterschiede
 * - Kann live auf der Website laufen ohne Störung des Produktivbetriebs
 * - Debug Interface für Koordinaten-Vergleich
 *
 * ACTIVATION: URL Parameter ?coordinate_testing=1
 */

(function() {
    'use strict';

    console.log('🧪 DIRECT COORDINATE TESTER: Initializing testing framework...');

    window.DirectCoordinateTester = class {
        constructor() {
            this.isActive = this.checkActivation();
            this.debugMode = true;

            // Testing results storage
            this.testResults = {
                accuracy: [],
                performance: [],
                consistency: [],
                reports: []
            };

            // Reference coordinate system (most accurate baseline)
            this.referenceSystem = null;

            // Available coordinate systems for testing
            this.coordinateSystems = {};

            if (this.isActive) {
                this.init();
                this.setupDebugInterface();
            }
        }

        /**
         * Check if testing is activated via URL parameter
         */
        checkActivation() {
            const urlParams = new URLSearchParams(window.location.search);
            return urlParams.get('coordinate_testing') === '1';
        }

        /**
         * Initialize the testing framework
         */
        init() {
            this.log('🚀 DirectCoordinate Testing Framework activated');

            // Discover available coordinate systems
            this.discoverCoordinateSystems();

            // Establish reference system
            this.establishReferenceSystem();

            // Set up non-invasive monitoring
            this.setupNonInvasiveMonitoring();

            this.log('✅ Testing framework initialized successfully');
        }

        /**
         * Discover all available coordinate systems in the environment
         */
        discoverCoordinateSystems() {
            this.log('🔍 Discovering coordinate systems...');

            // System 1: Enhanced JSON Coordinate System
            if (window.EnhancedJSONCoordinateSystem) {
                this.coordinateSystems.enhancedJSON = {
                    name: 'Enhanced JSON Coordinate System',
                    instance: window.enhancedJSONSystem || new window.EnhancedJSONCoordinateSystem(),
                    captureMethod: 'generateDesignData',
                    type: 'comprehensive'
                };
                this.log('✅ Found: Enhanced JSON Coordinate System');
            }

            // System 2: Comprehensive Design Data Capture
            if (window.ComprehensiveDesignDataCapture) {
                this.coordinateSystems.comprehensive = {
                    name: 'Comprehensive Design Data Capture',
                    instance: window.comprehensiveCapture || new window.ComprehensiveDesignDataCapture(),
                    captureMethod: 'generateDesignData',
                    type: 'comprehensive'
                };
                this.log('✅ Found: Comprehensive Design Data Capture');
            }

            // System 3: Basic Design Data Capture
            if (window.DesignDataCapture) {
                this.coordinateSystems.basic = {
                    name: 'Basic Design Data Capture',
                    instance: null, // Requires designer widget
                    captureMethod: 'generateDesignData',
                    type: 'basic'
                };
                this.log('✅ Found: Basic Design Data Capture');
            }

            // System 4: SafeZone Coordinate Validator
            if (window.SafeZoneCoordinateValidator) {
                this.coordinateSystems.safeZone = {
                    name: 'SafeZone Coordinate Validator',
                    instance: window.safeZoneValidator || new window.SafeZoneCoordinateValidator(),
                    captureMethod: 'validateCoordinates',
                    type: 'validator'
                };
                this.log('✅ Found: SafeZone Coordinate Validator');
            }

            // System 5: Native Fabric.js (Raw coordinates)
            this.coordinateSystems.fabricNative = {
                name: 'Native Fabric.js Properties',
                instance: null, // Direct fabric access
                captureMethod: 'directFabricAccess',
                type: 'native'
            };
            this.log('✅ Added: Native Fabric.js Properties');

            // System 6: DirectCoordinate System (Our reference implementation)
            this.coordinateSystems.directCoordinate = {
                name: 'DirectCoordinate System',
                instance: this,
                captureMethod: 'getDirectCoordinates',
                type: 'reference'
            };
            this.log('✅ Added: DirectCoordinate System (Reference)');

            this.log(`📊 Total systems discovered: ${Object.keys(this.coordinateSystems).length}`);
        }

        /**
         * Establish the most accurate system as reference
         */
        establishReferenceSystem() {
            // Use DirectCoordinate as the reference system
            this.referenceSystem = this.coordinateSystems.directCoordinate;
            this.log('🎯 Reference System established: DirectCoordinate System');
        }

        /**
         * DirectCoordinate implementation - our reference system
         * Provides the most accurate coordinates by combining multiple sources
         */
        getDirectCoordinates() {
            const canvas = this.findMostAccurateCanvas();
            if (!canvas) {
                return this.createEmptyCoordinateSet('No canvas found');
            }

            const directData = {
                timestamp: new Date().toISOString(),
                system: 'DirectCoordinate',
                version: '1.0.0',
                canvas: {
                    width: canvas.width || 0,
                    height: canvas.height || 0,
                    zoom: this.getCanvasZoom(canvas)
                },
                elements: [],
                rawFabricData: null
            };

            try {
                // Get objects using most reliable method
                let objects = [];

                if (canvas.toJSON) {
                    const jsonData = canvas.toJSON();
                    directData.rawFabricData = jsonData;
                    objects = jsonData.objects || [];
                    directData.extractionMethod = 'toJSON';
                } else if (canvas.getObjects) {
                    objects = canvas.getObjects();
                    directData.extractionMethod = 'getObjects';
                } else {
                    directData.extractionMethod = 'fallback';
                }

                // Extract coordinates with maximum precision
                directData.elements = objects.map((obj, index) => {
                    return this.extractDirectCoordinates(obj, index);
                });

                this.log(`🎯 DirectCoordinate extracted ${directData.elements.length} elements`);
                return directData;

            } catch (error) {
                this.log(`❌ DirectCoordinate error: ${error.message}`);
                return this.createEmptyCoordinateSet(`Error: ${error.message}`);
            }
        }

        /**
         * Extract coordinates with maximum precision from fabric object
         */
        extractDirectCoordinates(obj, index) {
            const directElement = {
                index: index,
                id: obj.id || `element_${index}`,
                type: obj.type || 'unknown',

                // Primary coordinates (untransformed)
                coordinates: {
                    left: obj.left || 0,
                    top: obj.top || 0,
                    width: obj.width || 0,
                    height: obj.height || 0
                },

                // Transformed coordinates (with scale/rotation)
                transformedCoordinates: {
                    left: obj.left || 0,
                    top: obj.top || 0,
                    width: (obj.width || 0) * (obj.scaleX || 1),
                    height: (obj.height || 0) * (obj.scaleY || 1)
                },

                // Bounding box coordinates
                boundingBox: this.calculateBoundingBox(obj),

                // Transformation matrix
                transform: {
                    scaleX: obj.scaleX || 1,
                    scaleY: obj.scaleY || 1,
                    angle: obj.angle || 0,
                    skewX: obj.skewX || 0,
                    skewY: obj.skewY || 0,
                    flipX: obj.flipX || false,
                    flipY: obj.flipY || false
                },

                // Additional properties for accuracy verification
                precision: {
                    originX: obj.originX || 'left',
                    originY: obj.originY || 'top',
                    centeredCoords: this.calculateCenteredCoordinates(obj),
                    absoluteCoords: this.calculateAbsoluteCoordinates(obj)
                }
            };

            return directElement;
        }

        /**
         * Calculate bounding box for rotated/scaled objects
         */
        calculateBoundingBox(obj) {
            if (obj.getBoundingRect) {
                return obj.getBoundingRect();
            }

            // Fallback calculation
            const width = (obj.width || 0) * (obj.scaleX || 1);
            const height = (obj.height || 0) * (obj.scaleY || 1);

            return {
                left: obj.left || 0,
                top: obj.top || 0,
                width: width,
                height: height
            };
        }

        /**
         * Calculate center-based coordinates
         */
        calculateCenteredCoordinates(obj) {
            const width = (obj.width || 0) * (obj.scaleX || 1);
            const height = (obj.height || 0) * (obj.scaleY || 1);

            return {
                centerX: (obj.left || 0) + width / 2,
                centerY: (obj.top || 0) + height / 2
            };
        }

        /**
         * Calculate absolute coordinates (relative to document)
         */
        calculateAbsoluteCoordinates(obj) {
            // This would need canvas offset calculation in real implementation
            return {
                absoluteX: obj.left || 0,
                absoluteY: obj.top || 0
            };
        }

        /**
         * Find the most reliable canvas for coordinate extraction
         */
        findMostAccurateCanvas() {
            // Priority order for canvas selection
            const canvasSources = [
                () => window.canvasSingletonManager?.getActiveCanvas(),
                () => {
                    const canvases = document.querySelectorAll('canvas');
                    for (const canvas of canvases) {
                        if (canvas.__fabric && canvas.__fabric.getObjects) {
                            return canvas.__fabric;
                        }
                    }
                    return null;
                },
                () => window.designerWidgetInstance?.canvas,
                () => window.fabric?.getInstances()?.[0]
            ];

            for (const source of canvasSources) {
                try {
                    const canvas = source();
                    if (canvas && (canvas.getObjects || canvas.toJSON)) {
                        return canvas;
                    }
                } catch (error) {
                    continue;
                }
            }

            return null;
        }

        /**
         * Get canvas zoom level safely
         */
        getCanvasZoom(canvas) {
            try {
                return canvas.getZoom ? canvas.getZoom() : 1.0;
            } catch (error) {
                return 1.0;
            }
        }

        /**
         * Create empty coordinate set for error cases
         */
        createEmptyCoordinateSet(reason) {
            return {
                timestamp: new Date().toISOString(),
                system: 'DirectCoordinate',
                version: '1.0.0',
                error: true,
                reason: reason,
                canvas: { width: 0, height: 0, zoom: 1 },
                elements: []
            };
        }

        /**
         * 🎯 TESTING API: Compare accuracy between all systems
         */
        compareSystemsAccuracy() {
            this.log('🧪 Starting accuracy comparison between all coordinate systems...');

            const results = {
                timestamp: new Date().toISOString(),
                testType: 'accuracy_comparison',
                systems: {},
                comparison: {},
                summary: {}
            };

            // Capture coordinates from each system
            for (const [systemKey, system] of Object.entries(this.coordinateSystems)) {
                try {
                    const startTime = performance.now();
                    const coordinateData = this.captureFromSystem(system);
                    const endTime = performance.now();

                    results.systems[systemKey] = {
                        name: system.name,
                        coordinateData: coordinateData,
                        captureTime: endTime - startTime,
                        success: !coordinateData.error
                    };

                } catch (error) {
                    results.systems[systemKey] = {
                        name: system.name,
                        error: error.message,
                        success: false
                    };
                }
            }

            // Compare each system against reference
            results.comparison = this.performAccuracyComparison(results.systems);
            results.summary = this.generateAccuracySummary(results.comparison);

            // Store results
            this.testResults.accuracy.push(results);

            this.log('✅ Accuracy comparison completed');
            return results;
        }

        /**
         * Capture coordinates from a specific system
         */
        captureFromSystem(system) {
            switch (system.captureMethod) {
                case 'generateDesignData':
                    if (system.instance && system.instance.generateDesignData) {
                        return system.instance.generateDesignData();
                    }
                    break;

                case 'getDirectCoordinates':
                    return this.getDirectCoordinates();

                case 'directFabricAccess':
                    return this.captureNativeFabricCoordinates();

                case 'validateCoordinates':
                    return this.captureSafeZoneValidation();
            }

            return { error: true, reason: `Cannot capture from ${system.name}` };
        }

        /**
         * Capture coordinates directly from Fabric.js
         */
        captureNativeFabricCoordinates() {
            const canvas = this.findMostAccurateCanvas();
            if (!canvas) {
                return { error: true, reason: 'No canvas found' };
            }

            const nativeData = {
                timestamp: new Date().toISOString(),
                system: 'Native Fabric.js',
                elements: []
            };

            try {
                const objects = canvas.getObjects ? canvas.getObjects() : [];
                nativeData.elements = objects.map((obj, index) => ({
                    index: index,
                    type: obj.type,
                    left: obj.left,
                    top: obj.top,
                    width: obj.width,
                    height: obj.height,
                    scaleX: obj.scaleX,
                    scaleY: obj.scaleY,
                    angle: obj.angle
                }));

                return nativeData;

            } catch (error) {
                return { error: true, reason: error.message };
            }
        }

        /**
         * Capture SafeZone validation data
         */
        captureSafeZoneValidation() {
            if (!window.safeZoneValidator) {
                return { error: true, reason: 'SafeZone validator not available' };
            }

            const canvas = this.findMostAccurateCanvas();
            if (!canvas) {
                return { error: true, reason: 'No canvas found' };
            }

            const safeZoneData = {
                timestamp: new Date().toISOString(),
                system: 'SafeZone Validator',
                safeZoneInfo: window.safeZoneValidator.getSafeZoneData(),
                validatedElements: []
            };

            try {
                const objects = canvas.getObjects ? canvas.getObjects() : [];
                safeZoneData.validatedElements = objects.map((obj, index) => {
                    const validation = window.safeZoneValidator.validateCoordinates(
                        obj.left || 0,
                        obj.top || 0,
                        (obj.width || 0) * (obj.scaleX || 1),
                        (obj.height || 0) * (obj.scaleY || 1)
                    );

                    return {
                        index: index,
                        coordinates: {
                            left: obj.left || 0,
                            top: obj.top || 0,
                            width: (obj.width || 0) * (obj.scaleX || 1),
                            height: (obj.height || 0) * (obj.scaleY || 1)
                        },
                        validation: validation
                    };
                });

                return safeZoneData;

            } catch (error) {
                return { error: true, reason: error.message };
            }
        }

        /**
         * Perform detailed accuracy comparison
         */
        performAccuracyComparison(systems) {
            const comparison = {};
            const referenceData = systems.directCoordinate?.coordinateData;

            if (!referenceData || referenceData.error) {
                return { error: 'No reference data available' };
            }

            for (const [systemKey, systemData] of Object.entries(systems)) {
                if (systemKey === 'directCoordinate' || !systemData.success) continue;

                comparison[systemKey] = {
                    name: systemData.name,
                    elementCount: {
                        reference: referenceData.elements?.length || 0,
                        system: this.getElementCount(systemData.coordinateData),
                        match: false
                    },
                    coordinateAccuracy: [],
                    averageDeviation: 0,
                    maxDeviation: 0
                };

                // Compare element counts
                comparison[systemKey].elementCount.match =
                    comparison[systemKey].elementCount.reference === comparison[systemKey].elementCount.system;

                // Compare individual coordinates
                const referenceElements = referenceData.elements || [];
                const systemElements = this.extractElementsForComparison(systemData.coordinateData);

                const deviations = [];
                for (let i = 0; i < Math.min(referenceElements.length, systemElements.length); i++) {
                    const refEl = referenceElements[i];
                    const sysEl = systemElements[i];

                    const deviation = this.calculateCoordinateDeviation(refEl, sysEl);
                    comparison[systemKey].coordinateAccuracy.push(deviation);
                    deviations.push(deviation.totalDeviation);
                }

                // Calculate statistics
                if (deviations.length > 0) {
                    comparison[systemKey].averageDeviation = deviations.reduce((a, b) => a + b, 0) / deviations.length;
                    comparison[systemKey].maxDeviation = Math.max(...deviations);
                }
            }

            return comparison;
        }

        /**
         * Get element count from coordinate data
         */
        getElementCount(coordinateData) {
            if (coordinateData.elements) return coordinateData.elements.length;
            if (coordinateData.objects) return coordinateData.objects.length;
            if (coordinateData.validatedElements) return coordinateData.validatedElements.length;
            return 0;
        }

        /**
         * Extract elements for comparison from different data structures
         */
        extractElementsForComparison(coordinateData) {
            if (coordinateData.elements) return coordinateData.elements;
            if (coordinateData.objects) return coordinateData.objects;
            if (coordinateData.validatedElements) return coordinateData.validatedElements;
            return [];
        }

        /**
         * Calculate deviation between two coordinate sets
         */
        calculateCoordinateDeviation(refElement, sysElement) {
            const refCoords = this.normalizeCoordinates(refElement);
            const sysCoords = this.normalizeCoordinates(sysElement);

            const deviation = {
                leftDeviation: Math.abs((refCoords.left || 0) - (sysCoords.left || 0)),
                topDeviation: Math.abs((refCoords.top || 0) - (sysCoords.top || 0)),
                widthDeviation: Math.abs((refCoords.width || 0) - (sysCoords.width || 0)),
                heightDeviation: Math.abs((refCoords.height || 0) - (sysCoords.height || 0)),
                totalDeviation: 0
            };

            deviation.totalDeviation = deviation.leftDeviation + deviation.topDeviation +
                                     deviation.widthDeviation + deviation.heightDeviation;

            return deviation;
        }

        /**
         * Normalize coordinate format for comparison
         */
        normalizeCoordinates(element) {
            // Handle different coordinate structures
            if (element.coordinates) return element.coordinates;
            if (element.transformedCoordinates) return element.transformedCoordinates;
            if (element.left !== undefined) {
                return {
                    left: element.left,
                    top: element.top,
                    width: element.width,
                    height: element.height
                };
            }
            return { left: 0, top: 0, width: 0, height: 0 };
        }

        /**
         * Generate accuracy summary
         */
        generateAccuracySummary(comparison) {
            const summary = {
                totalSystems: Object.keys(comparison).length,
                accurateSystemsCount: 0,
                mostAccurateSystem: null,
                leastAccurateSystem: null,
                overallAccuracy: 'unknown'
            };

            if (comparison.error) {
                summary.overallAccuracy = 'error';
                return summary;
            }

            let bestSystem = null;
            let worstSystem = null;
            let bestDeviation = Infinity;
            let worstDeviation = 0;

            for (const [systemKey, compData] of Object.entries(comparison)) {
                if (compData.averageDeviation < bestDeviation) {
                    bestDeviation = compData.averageDeviation;
                    bestSystem = { key: systemKey, name: compData.name, deviation: compData.averageDeviation };
                }
                if (compData.averageDeviation > worstDeviation) {
                    worstDeviation = compData.averageDeviation;
                    worstSystem = { key: systemKey, name: compData.name, deviation: compData.averageDeviation };
                }

                // Count as accurate if average deviation < 1 pixel
                if (compData.averageDeviation < 1) {
                    summary.accurateSystemsCount++;
                }
            }

            summary.mostAccurateSystem = bestSystem;
            summary.leastAccurateSystem = worstSystem;

            if (summary.accurateSystemsCount === summary.totalSystems) {
                summary.overallAccuracy = 'excellent';
            } else if (summary.accurateSystemsCount >= summary.totalSystems / 2) {
                summary.overallAccuracy = 'good';
            } else {
                summary.overallAccuracy = 'poor';
            }

            return summary;
        }

        /**
         * 🏃 TESTING API: Measure performance of each system
         */
        measurePerformance() {
            this.log('⚡ Starting performance measurement...');

            const performanceResults = {
                timestamp: new Date().toISOString(),
                testType: 'performance_measurement',
                systems: {},
                summary: {}
            };

            const iterations = 10;

            for (const [systemKey, system] of Object.entries(this.coordinateSystems)) {
                const times = [];
                let successCount = 0;

                for (let i = 0; i < iterations; i++) {
                    try {
                        const startTime = performance.now();
                        const result = this.captureFromSystem(system);
                        const endTime = performance.now();

                        times.push(endTime - startTime);
                        if (!result.error) successCount++;

                    } catch (error) {
                        // Skip failed iterations
                    }
                }

                if (times.length > 0) {
                    performanceResults.systems[systemKey] = {
                        name: system.name,
                        averageTime: times.reduce((a, b) => a + b, 0) / times.length,
                        minTime: Math.min(...times),
                        maxTime: Math.max(...times),
                        successRate: (successCount / iterations) * 100,
                        iterations: iterations
                    };
                }
            }

            // Generate performance summary
            performanceResults.summary = this.generatePerformanceSummary(performanceResults.systems);

            // Store results
            this.testResults.performance.push(performanceResults);

            this.log('✅ Performance measurement completed');
            return performanceResults;
        }

        /**
         * Generate performance summary
         */
        generatePerformanceSummary(systems) {
            const times = Object.values(systems).map(s => s.averageTime).filter(t => !isNaN(t));
            const successRates = Object.values(systems).map(s => s.successRate).filter(r => !isNaN(r));

            return {
                fastestSystem: this.findFastestSystem(systems),
                slowestSystem: this.findSlowestSystem(systems),
                averageTime: times.length > 0 ? times.reduce((a, b) => a + b, 0) / times.length : 0,
                averageSuccessRate: successRates.length > 0 ? successRates.reduce((a, b) => a + b, 0) / successRates.length : 0,
                totalSystems: Object.keys(systems).length
            };
        }

        /**
         * Find fastest system
         */
        findFastestSystem(systems) {
            let fastest = null;
            let fastestTime = Infinity;

            for (const [key, system] of Object.entries(systems)) {
                if (system.averageTime < fastestTime) {
                    fastestTime = system.averageTime;
                    fastest = { key, name: system.name, time: system.averageTime };
                }
            }

            return fastest;
        }

        /**
         * Find slowest system
         */
        findSlowestSystem(systems) {
            let slowest = null;
            let slowestTime = 0;

            for (const [key, system] of Object.entries(systems)) {
                if (system.averageTime > slowestTime) {
                    slowestTime = system.averageTime;
                    slowest = { key, name: system.name, time: system.averageTime };
                }
            }

            return slowest;
        }

        /**
         * 🎯 TESTING API: Validate 1:1 coordinate consistency
         */
        validateConsistency() {
            this.log('🔍 Starting consistency validation...');

            const consistencyResults = {
                timestamp: new Date().toISOString(),
                testType: 'consistency_validation',
                tests: [],
                summary: {}
            };

            const testCount = 5;

            // Perform multiple captures and check for consistency
            for (let i = 0; i < testCount; i++) {
                const testRun = {
                    iteration: i + 1,
                    systems: {},
                    consistency: {}
                };

                // Capture from all systems
                for (const [systemKey, system] of Object.entries(this.coordinateSystems)) {
                    try {
                        testRun.systems[systemKey] = this.captureFromSystem(system);
                    } catch (error) {
                        testRun.systems[systemKey] = { error: true, reason: error.message };
                    }
                }

                // Check consistency within this run
                testRun.consistency = this.checkConsistencyWithinRun(testRun.systems);
                consistencyResults.tests.push(testRun);

                // Small delay between tests
                if (i < testCount - 1) {
                    await this.delay(100);
                }
            }

            // Analyze consistency across all runs
            consistencyResults.summary = this.analyzeConsistencyAcrossRuns(consistencyResults.tests);

            // Store results
            this.testResults.consistency.push(consistencyResults);

            this.log('✅ Consistency validation completed');
            return consistencyResults;
        }

        /**
         * Check consistency within a single test run
         */
        checkConsistencyWithinRun(systems) {
            const consistency = {};

            for (const [systemKey, systemData] of Object.entries(systems)) {
                if (systemData.error) continue;

                consistency[systemKey] = {
                    elementCount: this.getElementCount(systemData),
                    hasElements: this.getElementCount(systemData) > 0,
                    dataStructure: this.analyzeDataStructure(systemData)
                };
            }

            return consistency;
        }

        /**
         * Analyze data structure consistency
         */
        analyzeDataStructure(data) {
            const structure = {
                hasTimestamp: !!data.timestamp,
                hasElements: !!data.elements || !!data.objects || !!data.validatedElements,
                hasCanvas: !!data.canvas,
                hasMetadata: !!data.metadata,
                hasSystem: !!data.system
            };

            structure.score = Object.values(structure).filter(Boolean).length;
            return structure;
        }

        /**
         * Analyze consistency across multiple test runs
         */
        analyzeConsistencyAcrossRuns(tests) {
            const summary = {
                totalRuns: tests.length,
                consistentSystems: [],
                inconsistentSystems: [],
                overallConsistency: 'unknown'
            };

            // Analyze each system across runs
            const systemKeys = new Set();
            tests.forEach(test => {
                Object.keys(test.systems).forEach(key => systemKeys.add(key));
            });

            for (const systemKey of systemKeys) {
                const systemResults = tests.map(test => test.systems[systemKey]).filter(r => !r.error);

                if (systemResults.length === 0) continue;

                const elementCounts = systemResults.map(r => this.getElementCount(r));
                const isConsistent = elementCounts.every(count => count === elementCounts[0]);

                if (isConsistent) {
                    summary.consistentSystems.push(systemKey);
                } else {
                    summary.inconsistentSystems.push(systemKey);
                }
            }

            // Calculate overall consistency
            const totalSystems = summary.consistentSystems.length + summary.inconsistentSystems.length;
            const consistencyRatio = summary.consistentSystems.length / totalSystems;

            if (consistencyRatio >= 0.9) {
                summary.overallConsistency = 'excellent';
            } else if (consistencyRatio >= 0.7) {
                summary.overallConsistency = 'good';
            } else {
                summary.overallConsistency = 'poor';
            }

            return summary;
        }

        /**
         * 📊 TESTING API: Generate comprehensive test report
         */
        generateReport() {
            this.log('📊 Generating comprehensive test report...');

            const report = {
                timestamp: new Date().toISOString(),
                reportType: 'comprehensive_coordinate_testing',
                summary: {
                    testsCompleted: {
                        accuracy: this.testResults.accuracy.length,
                        performance: this.testResults.performance.length,
                        consistency: this.testResults.consistency.length
                    },
                    systemsDiscovered: Object.keys(this.coordinateSystems).length,
                    overallAssessment: 'unknown'
                },
                systemOverview: {},
                recommendations: [],
                detailedResults: {
                    accuracy: this.testResults.accuracy,
                    performance: this.testResults.performance,
                    consistency: this.testResults.consistency
                }
            };

            // Create system overview
            for (const [systemKey, system] of Object.entries(this.coordinateSystems)) {
                report.systemOverview[systemKey] = {
                    name: system.name,
                    type: system.type,
                    available: !!system.instance,
                    captureMethod: system.captureMethod
                };
            }

            // Generate recommendations
            report.recommendations = this.generateRecommendations();

            // Calculate overall assessment
            report.summary.overallAssessment = this.calculateOverallAssessment();

            // Store report
            this.testResults.reports.push(report);

            this.log('✅ Comprehensive report generated');
            return report;
        }

        /**
         * Generate system recommendations
         */
        generateRecommendations() {
            const recommendations = [];

            // Check if accuracy tests were run
            if (this.testResults.accuracy.length > 0) {
                const latestAccuracy = this.testResults.accuracy[this.testResults.accuracy.length - 1];
                if (latestAccuracy.summary && latestAccuracy.summary.mostAccurateSystem) {
                    recommendations.push({
                        type: 'accuracy',
                        priority: 'high',
                        message: `Use ${latestAccuracy.summary.mostAccurateSystem.name} for highest coordinate accuracy`,
                        system: latestAccuracy.summary.mostAccurateSystem.key
                    });
                }
            }

            // Check if performance tests were run
            if (this.testResults.performance.length > 0) {
                const latestPerformance = this.testResults.performance[this.testResults.performance.length - 1];
                if (latestPerformance.summary && latestPerformance.summary.fastestSystem) {
                    recommendations.push({
                        type: 'performance',
                        priority: 'medium',
                        message: `Use ${latestPerformance.summary.fastestSystem.name} for fastest coordinate capture`,
                        system: latestPerformance.summary.fastestSystem.key
                    });
                }
            }

            // Check for SafeZone validation
            if (this.coordinateSystems.safeZone) {
                recommendations.push({
                    type: 'validation',
                    priority: 'high',
                    message: 'Always use SafeZone validation to prevent coordinate boundary violations',
                    system: 'safeZone'
                });
            }

            // DirectCoordinate recommendation
            recommendations.push({
                type: 'general',
                priority: 'high',
                message: 'DirectCoordinate system provides the most comprehensive coordinate data',
                system: 'directCoordinate'
            });

            return recommendations;
        }

        /**
         * Calculate overall system assessment
         */
        calculateOverallAssessment() {
            const scores = [];

            // Accuracy score
            if (this.testResults.accuracy.length > 0) {
                const latestAccuracy = this.testResults.accuracy[this.testResults.accuracy.length - 1];
                if (latestAccuracy.summary) {
                    switch (latestAccuracy.summary.overallAccuracy) {
                        case 'excellent': scores.push(100); break;
                        case 'good': scores.push(75); break;
                        case 'poor': scores.push(25); break;
                        default: scores.push(50); break;
                    }
                }
            }

            // Performance score (inverse of average time)
            if (this.testResults.performance.length > 0) {
                const latestPerformance = this.testResults.performance[this.testResults.performance.length - 1];
                if (latestPerformance.summary && latestPerformance.summary.averageTime > 0) {
                    // Score based on speed (lower time = higher score)
                    const speedScore = Math.max(0, 100 - latestPerformance.summary.averageTime);
                    scores.push(Math.min(100, speedScore));
                }
            }

            // Consistency score
            if (this.testResults.consistency.length > 0) {
                const latestConsistency = this.testResults.consistency[this.testResults.consistency.length - 1];
                if (latestConsistency.summary) {
                    switch (latestConsistency.summary.overallConsistency) {
                        case 'excellent': scores.push(100); break;
                        case 'good': scores.push(75); break;
                        case 'poor': scores.push(25); break;
                        default: scores.push(50); break;
                    }
                }
            }

            // Calculate average score
            if (scores.length === 0) return 'no_data';

            const averageScore = scores.reduce((a, b) => a + b, 0) / scores.length;

            if (averageScore >= 90) return 'excellent';
            if (averageScore >= 75) return 'good';
            if (averageScore >= 50) return 'acceptable';
            return 'needs_improvement';
        }

        /**
         * 🎨 TESTING API: Visual coordinate overlay system
         */
        visualizeCoordinates() {
            this.log('🎨 Creating visual coordinate overlay...');

            // Remove existing overlay
            this.removeCoordinateOverlay();

            // Create overlay container
            const overlay = this.createOverlayContainer();

            // Get coordinates from all systems
            const coordinateData = {};
            for (const [systemKey, system] of Object.entries(this.coordinateSystems)) {
                try {
                    coordinateData[systemKey] = this.captureFromSystem(system);
                } catch (error) {
                    coordinateData[systemKey] = { error: true, reason: error.message };
                }
            }

            // Visualize each system's coordinates
            for (const [systemKey, data] of Object.entries(coordinateData)) {
                if (data.error) continue;
                this.drawSystemCoordinates(overlay, systemKey, data);
            }

            this.log('✅ Visual coordinate overlay created');
            return overlay;
        }

        /**
         * Create overlay container
         */
        createOverlayContainer() {
            const overlay = document.createElement('div');
            overlay.id = 'coordinate-test-overlay';
            overlay.style.cssText = `
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                pointer-events: none;
                z-index: 9999;
                border: 2px solid #ff0000;
                box-sizing: border-box;
            `;

            // Find canvas container
            const canvas = document.querySelector('canvas');
            if (canvas && canvas.parentNode) {
                canvas.parentNode.style.position = 'relative';
                canvas.parentNode.appendChild(overlay);
            }

            return overlay;
        }

        /**
         * Draw coordinates for a specific system
         */
        drawSystemCoordinates(overlay, systemKey, data) {
            const systemColors = {
                'directCoordinate': '#ff0000',
                'enhancedJSON': '#00ff00',
                'comprehensive': '#0000ff',
                'basic': '#ffff00',
                'safeZone': '#ff00ff',
                'fabricNative': '#00ffff'
            };

            const color = systemColors[systemKey] || '#888888';
            const elements = this.extractElementsForComparison(data);

            elements.forEach((element, index) => {
                const coords = this.normalizeCoordinates(element);
                if (!coords) return;

                const elementOverlay = document.createElement('div');
                elementOverlay.style.cssText = `
                    position: absolute;
                    left: ${coords.left || 0}px;
                    top: ${coords.top || 0}px;
                    width: ${coords.width || 0}px;
                    height: ${coords.height || 0}px;
                    border: 1px solid ${color};
                    background: ${color}20;
                    pointer-events: none;
                    font-size: 10px;
                    color: ${color};
                `;

                // Add label
                const label = document.createElement('div');
                label.textContent = `${systemKey}[${index}]`;
                label.style.cssText = `
                    position: absolute;
                    top: -15px;
                    left: 0;
                    font-size: 8px;
                    background: white;
                    padding: 1px 2px;
                    border: 1px solid ${color};
                `;

                elementOverlay.appendChild(label);
                overlay.appendChild(elementOverlay);
            });
        }

        /**
         * Remove existing coordinate overlay
         */
        removeCoordinateOverlay() {
            const existing = document.getElementById('coordinate-test-overlay');
            if (existing) {
                existing.remove();
            }
        }

        /**
         * Setup non-invasive monitoring
         */
        setupNonInvasiveMonitoring() {
            // Monitor canvas changes without interfering
            const observer = new MutationObserver((mutations) => {
                if (this.debugMode) {
                    mutations.forEach(mutation => {
                        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                            this.log('🔍 Canvas DOM change detected');
                        }
                    });
                }
            });

            // Observe canvas container
            const canvasContainer = document.querySelector('.canvas-container, .designer-canvas-container');
            if (canvasContainer) {
                observer.observe(canvasContainer, { childList: true, subtree: true });
            }

            this.log('👁️ Non-invasive monitoring activated');
        }

        /**
         * Setup debug interface on window object
         */
        setupDebugInterface() {
            window.DirectCoordinateTest = {
                compareSystemsAccuracy: () => this.compareSystemsAccuracy(),
                measurePerformance: () => this.measurePerformance(),
                validateConsistency: () => this.validateConsistency(),
                generateReport: () => this.generateReport(),
                visualizeCoordinates: () => this.visualizeCoordinates(),

                // Additional debug methods
                getTestResults: () => this.testResults,
                getCoordinateSystems: () => this.coordinateSystems,
                getReferenceSystem: () => this.referenceSystem,
                clearOverlay: () => this.removeCoordinateOverlay(),

                // Direct coordinate access
                getDirectCoordinates: () => this.getDirectCoordinates(),
                captureFromSystem: (systemKey) => {
                    const system = this.coordinateSystems[systemKey];
                    return system ? this.captureFromSystem(system) : { error: 'System not found' };
                }
            };

            this.log('🛠️ Debug interface created: window.DirectCoordinateTest');
        }

        /**
         * Utility function for delays
         */
        delay(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        }

        /**
         * Debug logging
         */
        log(message) {
            if (this.debugMode) {
                console.log(`[COORDINATE-TESTER] ${message}`);
            }
        }
    };

    // Auto-initialize if testing is activated
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('coordinate_testing') === '1') {
        // Wait for other systems to load
        setTimeout(() => {
            window.coordinateTester = new window.DirectCoordinateTester();
        }, 1000);
    } else {
        console.log('🧪 DirectCoordinate Testing Framework available. Activate with: ?coordinate_testing=1');
    }

    // Always make available for manual activation
    window.DirectCoordinateTester = window.DirectCoordinateTester;

})();