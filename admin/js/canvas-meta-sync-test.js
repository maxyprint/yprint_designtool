/**
 * 🧪 Canvas-Meta-Fields Synchronization Test Suite
 *
 * Comprehensive testing and validation for the Canvas-Meta-Fields bridge
 * Tests bidirectional sync, data integrity, error handling, and edge cases
 *
 * 👑 24-AGENT HIERARCHICAL TESTING SOLUTION
 */

(function($) {
    'use strict';

    console.log('🧪 CANVAS-META-SYNC TESTS: Loading test suite...');

    const CanvasMetaSyncTests = {

        // Test configuration
        config: {
            testTimeout: 5000,
            maxRetries: 3,
            debugMode: true
        },

        // Test results storage
        results: {
            passed: 0,
            failed: 0,
            errors: []
        },

        /**
         * Initialize test suite
         */
        init() {
            console.log('🧪 TEST SUITE: Initializing Canvas-Meta-Fields sync tests...');

            // Wait for dependencies
            this.waitForDependencies().then(() => {
                this.setupTestUI();
                this.logInfo('Test suite ready. Click "Run Tests" to begin validation.');
            }).catch(error => {
                this.logError('Failed to initialize test suite:', error);
            });
        },

        /**
         * Wait for required dependencies
         */
        async waitForDependencies() {
            const maxWait = 10000; // 10 seconds
            const checkInterval = 100;
            let waited = 0;

            return new Promise((resolve, reject) => {
                const checkDeps = () => {
                    const hasCanvas = !!window.fabricCanvas;
                    const hasSync = !!window.CanvasMetaSync;
                    const hasConfig = !!window.octoPrintDesignerSync;

                    if (hasCanvas && hasSync && hasConfig) {
                        this.logSuccess('All dependencies available');
                        resolve();
                    } else if (waited >= maxWait) {
                        reject(new Error(`Dependencies not ready after ${maxWait}ms. Missing: ${
                            [!hasCanvas && 'fabricCanvas', !hasSync && 'CanvasMetaSync', !hasConfig && 'octoPrintDesignerSync']
                            .filter(Boolean).join(', ')
                        }`));
                    } else {
                        waited += checkInterval;
                        setTimeout(checkDeps, checkInterval);
                    }
                };
                checkDeps();
            });
        },

        /**
         * Setup test UI
         */
        setupTestUI() {
            const testHTML = `
                <div id="canvas-meta-sync-tests" class="test-suite-container">
                    <h3>🧪 Canvas-Meta-Fields Sync Test Suite</h3>
                    <div class="test-controls">
                        <button id="run-all-tests" class="button button-primary">Run All Tests</button>
                        <button id="run-manual-tests" class="button button-secondary">Run Manual Tests</button>
                        <button id="run-auto-tests" class="button button-secondary">Run Auto-Sync Tests</button>
                        <button id="clear-test-results" class="button">Clear Results</button>
                    </div>
                    <div id="test-results" class="test-results"></div>
                    <div id="test-log" class="test-log"></div>
                </div>
            `;

            // Inject test UI
            if ($('#canvas-meta-sync-tests').length === 0) {
                $('#canvas-meta-sync-container').after(testHTML);
                this.addTestStyles();
                this.attachTestEventListeners();
            }
        },

        /**
         * Add test suite styles
         */
        addTestStyles() {
            const css = `
                <style id="canvas-meta-sync-test-styles">
                .test-suite-container {
                    background: #fff8dc;
                    border: 2px solid #ffa500;
                    border-radius: 8px;
                    padding: 20px;
                    margin: 20px 0;
                }
                .test-suite-container h3 {
                    color: #ff8c00;
                    margin-top: 0;
                }
                .test-controls {
                    margin: 15px 0;
                }
                .test-controls button {
                    margin-right: 10px;
                    margin-bottom: 5px;
                }
                .test-results {
                    background: #f9f9f9;
                    border: 1px solid #ddd;
                    border-radius: 4px;
                    padding: 15px;
                    margin: 15px 0;
                    min-height: 100px;
                    max-height: 300px;
                    overflow-y: auto;
                }
                .test-log {
                    background: #1e1e1e;
                    color: #00ff00;
                    border-radius: 4px;
                    padding: 15px;
                    margin: 15px 0;
                    min-height: 150px;
                    max-height: 400px;
                    overflow-y: auto;
                    font-family: 'Courier New', monospace;
                    font-size: 12px;
                }
                .test-result-item {
                    padding: 8px 12px;
                    margin: 5px 0;
                    border-radius: 4px;
                    border-left: 4px solid;
                }
                .test-result-item.passed {
                    background: #d4edda;
                    border-color: #28a745;
                    color: #155724;
                }
                .test-result-item.failed {
                    background: #f8d7da;
                    border-color: #dc3545;
                    color: #721c24;
                }
                .test-result-item.running {
                    background: #fff3cd;
                    border-color: #ffc107;
                    color: #856404;
                }
                .test-summary {
                    background: #e9ecef;
                    padding: 10px;
                    border-radius: 4px;
                    margin: 10px 0;
                    font-weight: bold;
                }
                </style>
            `;

            if ($('#canvas-meta-sync-test-styles').length === 0) {
                $('head').append(css);
            }
        },

        /**
         * Attach test event listeners
         */
        attachTestEventListeners() {
            $('#run-all-tests').on('click', () => this.runAllTests());
            $('#run-manual-tests').on('click', () => this.runManualTests());
            $('#run-auto-tests').on('click', () => this.runAutoSyncTests());
            $('#clear-test-results').on('click', () => this.clearResults());
        },

        /**
         * Run all tests
         */
        async runAllTests() {
            this.logInfo('🚀 Starting comprehensive test suite...');
            this.clearResults();

            try {
                await this.runCanvasDataExtractionTests();
                await this.runMetaFieldsTransformationTests();
                await this.runManualSyncTests();
                await this.runAutoSyncTests();
                await this.runBidirectionalSyncTests();
                await this.runErrorHandlingTests();
                await this.runPerformanceTests();

                this.displayFinalResults();
            } catch (error) {
                this.logError('Test suite execution failed:', error);
            }
        },

        /**
         * Test 1: Canvas Data Extraction
         */
        async runCanvasDataExtractionTests() {
            this.logInfo('📊 Testing Canvas data extraction...');

            try {
                // Test basic extraction
                const result = await this.runTest('Canvas Data Extraction - Basic', async () => {
                    const canvasData = window.CanvasMetaSync.extractCanvasData();

                    if (!canvasData) {
                        throw new Error('No canvas data extracted');
                    }

                    // Validate structure
                    const requiredFields = ['timestamp', 'source', 'baseCoordinates', 'baseDimensions'];
                    for (const field of requiredFields) {
                        if (!(field in canvasData)) {
                            throw new Error(`Missing required field: ${field}`);
                        }
                    }

                    this.logSuccess('Canvas data extraction successful:', canvasData);
                    return true;
                });

                // Test with reference lines (if available)
                if (window.fabricCanvas && window.fabricCanvas.getObjects().length > 0) {
                    await this.runTest('Canvas Data Extraction - With Objects', async () => {
                        const objects = window.fabricCanvas.getObjects();
                        const canvasData = window.CanvasMetaSync.extractCanvasData();

                        if (objects.length > 0 && !canvasData.referenceLines && !canvasData.scalableArea) {
                            this.logWarning('Canvas has objects but no reference lines or scalable areas detected');
                        }

                        return true;
                    });
                }

            } catch (error) {
                this.logError('Canvas data extraction tests failed:', error);
            }
        },

        /**
         * Test 2: Meta-Fields Transformation
         */
        async runMetaFieldsTransformationTests() {
            this.logInfo('🔄 Testing Meta-Fields transformation...');

            await this.runTest('Meta-Fields Transformation', async () => {
                const testCanvasData = {
                    baseCoordinates: { x: 100, y: 200 },
                    baseDimensions: { width: 800, height: 600 },
                    calculationMethod: 'reference_lines'
                };

                const metaFields = window.CanvasMetaSync.transformToMetaFieldsFormat(testCanvasData);

                // Validate transformation
                if (!metaFields.base_coordinate_x || metaFields.base_coordinate_x !== '100') {
                    throw new Error('Base coordinate X transformation failed');
                }

                if (!metaFields.base_coordinate_y || metaFields.base_coordinate_y !== '200') {
                    throw new Error('Base coordinate Y transformation failed');
                }

                if (!metaFields.base_width || metaFields.base_width !== '800') {
                    throw new Error('Base width transformation failed');
                }

                this.logSuccess('Meta-Fields transformation successful:', metaFields);
                return true;
            });
        },

        /**
         * Test 3: Manual Sync Tests
         */
        async runManualSyncTests() {
            this.logInfo('🖱️ Testing manual sync operations...');

            await this.runTest('Manual Canvas to Meta-Fields Sync', async () => {
                // Simulate manual sync
                const canvasData = window.CanvasMetaSync.extractCanvasData();
                if (!canvasData) {
                    throw new Error('No canvas data available for manual sync test');
                }

                // Test sync without actual AJAX call (mock)
                const metaFields = window.CanvasMetaSync.transformToMetaFieldsFormat(canvasData);

                if (Object.keys(metaFields).length === 0) {
                    throw new Error('No meta-fields generated from canvas data');
                }

                this.logSuccess('Manual sync test passed - would sync:', Object.keys(metaFields).length, 'fields');
                return true;
            });
        },

        /**
         * Test 4: Auto-Sync Tests
         */
        async runAutoSyncTests() {
            this.logInfo('⚡ Testing auto-sync functionality...');

            await this.runTest('Auto-Sync Configuration', async () => {
                const config = window.octoPrintDesignerSync;

                if (!config) {
                    throw new Error('Auto-sync configuration not available');
                }

                if (!config.autoSyncEnabled) {
                    this.logWarning('Auto-sync is disabled');
                }

                this.logSuccess('Auto-sync configuration valid:', config);
                return true;
            });

            // Test debounce mechanism
            await this.runTest('Debounce Mechanism', async () => {
                let callCount = 0;
                const testFunc = window.CanvasMetaSync.debounce(() => callCount++, 100);

                // Rapid calls
                testFunc();
                testFunc();
                testFunc();

                // Wait for debounce
                await new Promise(resolve => setTimeout(resolve, 150));

                if (callCount !== 1) {
                    throw new Error(`Debounce failed: expected 1 call, got ${callCount}`);
                }

                this.logSuccess('Debounce mechanism working correctly');
                return true;
            });
        },

        /**
         * Test 5: Bidirectional Sync Tests
         */
        async runBidirectionalSyncTests() {
            this.logInfo('🔄 Testing bidirectional sync...');

            await this.runTest('Data Hash Generation', async () => {
                const testData = { test: 'data', value: 123 };
                const hash1 = window.CanvasMetaSync.generateDataHash(testData);
                const hash2 = window.CanvasMetaSync.generateDataHash(testData);

                if (hash1 !== hash2) {
                    throw new Error('Hash generation not consistent');
                }

                // Test different data produces different hash
                const hash3 = window.CanvasMetaSync.generateDataHash({ test: 'different' });
                if (hash1 === hash3) {
                    throw new Error('Different data produced same hash');
                }

                this.logSuccess('Data hash generation working correctly');
                return true;
            });
        },

        /**
         * Test 6: Error Handling
         */
        async runErrorHandlingTests() {
            this.logInfo('🚨 Testing error handling...');

            await this.runTest('Invalid Data Handling', async () => {
                // Test null/undefined data
                const result1 = window.CanvasMetaSync.transformToMetaFieldsFormat(null);
                if (Object.keys(result1).length !== 0) {
                    throw new Error('Should return empty object for null data');
                }

                const result2 = window.CanvasMetaSync.transformToMetaFieldsFormat(undefined);
                if (Object.keys(result2).length !== 0) {
                    throw new Error('Should return empty object for undefined data');
                }

                this.logSuccess('Invalid data handling correct');
                return true;
            });
        },

        /**
         * Test 7: Performance Tests
         */
        async runPerformanceTests() {
            this.logInfo('⚡ Testing performance...');

            await this.runTest('Canvas Data Extraction Performance', async () => {
                const iterations = 100;
                const startTime = performance.now();

                for (let i = 0; i < iterations; i++) {
                    window.CanvasMetaSync.extractCanvasData();
                }

                const endTime = performance.now();
                const avgTime = (endTime - startTime) / iterations;

                if (avgTime > 10) { // 10ms threshold
                    this.logWarning(`Canvas extraction averaging ${avgTime.toFixed(2)}ms per call`);
                } else {
                    this.logSuccess(`Canvas extraction performance good: ${avgTime.toFixed(2)}ms avg`);
                }

                return true;
            });
        },

        /**
         * Run individual test with error handling
         */
        async runTest(testName, testFunction) {
            this.addTestResult(testName, 'running', 'Test in progress...');

            try {
                const startTime = performance.now();
                const result = await Promise.race([
                    testFunction(),
                    new Promise((_, reject) =>
                        setTimeout(() => reject(new Error('Test timeout')), this.config.testTimeout)
                    )
                ]);

                const duration = performance.now() - startTime;
                this.addTestResult(testName, 'passed', `✅ Passed in ${duration.toFixed(2)}ms`);
                this.results.passed++;

                return result;
            } catch (error) {
                this.addTestResult(testName, 'failed', `❌ Failed: ${error.message}`);
                this.results.failed++;
                this.results.errors.push({ test: testName, error: error.message });

                if (this.config.debugMode) {
                    this.logError(`Test "${testName}" failed:`, error);
                }

                throw error;
            }
        },

        /**
         * Add test result to UI
         */
        addTestResult(testName, status, message) {
            const resultItem = `
                <div class="test-result-item ${status}">
                    <strong>${testName}</strong>: ${message}
                </div>
            `;
            $('#test-results').append(resultItem);

            // Auto-scroll to latest result
            $('#test-results').scrollTop($('#test-results')[0].scrollHeight);
        },

        /**
         * Display final test results
         */
        displayFinalResults() {
            const total = this.results.passed + this.results.failed;
            const successRate = total > 0 ? (this.results.passed / total * 100).toFixed(1) : 0;

            const summary = `
                <div class="test-summary">
                    📊 Test Summary: ${this.results.passed}/${total} passed (${successRate}% success rate)
                    ${this.results.failed > 0 ? `<br>❌ ${this.results.failed} failed` : ''}
                </div>
            `;

            $('#test-results').append(summary);

            this.logInfo(`🏁 Test suite complete: ${this.results.passed}/${total} passed`);

            if (this.results.failed > 0) {
                this.logError('Failed tests:', this.results.errors);
            }
        },

        /**
         * Clear test results
         */
        clearResults() {
            this.results = { passed: 0, failed: 0, errors: [] };
            $('#test-results').empty();
            $('#test-log').empty();
            this.logInfo('Test results cleared');
        },

        /**
         * Logging utilities
         */
        logInfo(message, data = null) {
            const timestamp = new Date().toLocaleTimeString();
            const logEntry = `[${timestamp}] ℹ️ ${message}`;
            console.log(logEntry, data || '');
            this.appendToLog(logEntry, data);
        },

        logSuccess(message, data = null) {
            const timestamp = new Date().toLocaleTimeString();
            const logEntry = `[${timestamp}] ✅ ${message}`;
            console.log(logEntry, data || '');
            this.appendToLog(logEntry, data);
        },

        logWarning(message, data = null) {
            const timestamp = new Date().toLocaleTimeString();
            const logEntry = `[${timestamp}] ⚠️ ${message}`;
            console.warn(logEntry, data || '');
            this.appendToLog(logEntry, data);
        },

        logError(message, data = null) {
            const timestamp = new Date().toLocaleTimeString();
            const logEntry = `[${timestamp}] ❌ ${message}`;
            console.error(logEntry, data || '');
            this.appendToLog(logEntry, data);
        },

        appendToLog(message, data = null) {
            const logLine = data ? `${message} ${JSON.stringify(data, null, 2)}` : message;
            $('#test-log').append(logLine + '\n');
            $('#test-log').scrollTop($('#test-log')[0].scrollHeight);
        }
    };

    // Initialize when DOM is ready
    $(document).ready(function() {
        // Delay initialization to allow other scripts to load
        setTimeout(() => {
            CanvasMetaSyncTests.init();
        }, 1000);
    });

    // Expose to window for manual testing
    window.CanvasMetaSyncTests = CanvasMetaSyncTests;

    console.log('✅ Canvas-Meta-Fields Sync Test Suite loaded successfully');

})(jQuery);