#!/usr/bin/env node

/**
 * TEST PRODUCTION-READY VERSION
 * Testet die neue Race Condition-freie Implementierung
 */

const fs = require('fs');
const { performance } = require('perf_hooks');

class ProductionReadyVersionTest {
    constructor() {
        this.startTime = performance.now();
        this.testResults = [];

        console.log('🧪 TESTING PRODUCTION-READY VERSION');
        console.log('===================================');
        console.log('Testing new race condition-free implementation');
        console.log('');
    }

    async runTests() {
        console.log('🚀 Starting production-ready version tests...');

        // Setup Test Environment
        await this.setupTestEnvironment();

        // Test 1: Immediate Initialization
        await this.testImmediateInitialization();

        // Test 2: Polling Detection
        await this.testPollingDetection();

        // Test 3: MutationObserver
        await this.testMutationObserver();

        // Test 4: Race Condition Simulation
        await this.testRaceConditionHandling();

        // Test 5: generateDesignData Function
        await this.testGenerateDesignDataFunction();

        // Analyze Results
        this.analyzeResults();
    }

    async setupTestEnvironment() {
        console.log('🌍 Setting up test environment...');

        // Simuliere WordPress DOM Environment
        global.window = {
            fabric: null,
            addEventListener: () => {},
            dispatchEvent: (event) => {
                console.log(`📡 Event dispatched: ${event.type}`);
            },
            location: {
                pathname: '/product/test-tshirt',
                search: '?template_view_id=test-template-front'
            },
            URLSearchParams: function(search) {
                return {
                    has: (key) => key === 'template_view_id',
                    get: (key) => key === 'template_view_id' ? 'test-template-front' : null
                };
            },
            MutationObserver: function(callback) {
                this.callback = callback;
                this.observe = () => console.log('👁️ MutationObserver started');
                this.disconnect = () => console.log('👁️ MutationObserver stopped');
            },
            CustomEvent: function(type, options) {
                this.type = type;
                this.detail = options?.detail;
            }
        };

        global.document = {
            readyState: 'loading',
            body: {},
            addEventListener: (event, callback) => {
                if (event === 'DOMContentLoaded') {
                    setTimeout(() => {
                        console.log('📅 DOMContentLoaded fired');
                        global.document.readyState = 'interactive';
                        callback();
                    }, 200);
                }
            },
            querySelector: (selector) => {
                if (selector === '.mockup-design-area') {
                    return {
                        getBoundingClientRect: () => ({
                            left: 50, top: 100, width: 800, height: 600
                        }),
                        offsetWidth: 800,
                        offsetHeight: 600,
                        dataset: { templateViewId: 'test-template-front' }
                    };
                }
                return null;
            },
            querySelectorAll: (selector) => {
                if (selector === 'canvas') {
                    const currentTime = performance.now() - this.startTime;

                    // Simuliere Canvas wird nach 1000ms verfügbar
                    if (currentTime > 1000) {
                        return [this.createMockCanvas()];
                    } else {
                        return [];
                    }
                }
                return [];
            }
        };

        global.console = console;
        global.setTimeout = setTimeout;
        global.performance = performance;

        // Simuliere Fabric.js wird nach 800ms verfügbar
        setTimeout(() => {
            global.window.fabric = this.createMockFabric();
            console.log('📦 Fabric.js now available');
        }, 800);

        console.log('✅ Test environment setup completed');
    }

    createMockCanvas() {
        return {
            __fabric: {
                width: 800,
                height: 600,
                getObjects: () => [
                    {
                        type: 'i-text',
                        text: 'Test Text',
                        left: 100, top: 50,
                        width: 120, height: 30,
                        scaleX: 1, scaleY: 1, angle: 0,
                        fontFamily: 'Arial',
                        fontSize: 24,
                        fill: '#333333'
                    },
                    {
                        type: 'rect',
                        left: 200, top: 100,
                        width: 150, height: 80,
                        scaleX: 1.2, scaleY: 1.2, angle: 15,
                        fill: '#ff6b6b',
                        stroke: '#d63031',
                        strokeWidth: 2
                    }
                ]
            },
            getBoundingClientRect: () => ({
                left: 60, top: 110, width: 780, height: 580
            }),
            closest: () => ({
                getBoundingClientRect: () => ({ left: 50, top: 100 })
            })
        };
    }

    createMockFabric() {
        return {
            Canvas: function() {
                return {
                    width: 800,
                    height: 600,
                    getObjects: () => []
                };
            }
        };
    }

    async testImmediateInitialization() {
        console.log('\n🧪 TEST 1: Immediate Initialization');
        console.log('=====================================');

        try {
            const startTest = performance.now();

            // Lade Production-Ready Code
            const ProductionReadyDesignDataCapture = require('./public/js/production-ready-design-data-capture.js');

            // Erstelle Instanz (sollte polling starten)
            const capture = new ProductionReadyDesignDataCapture();

            // Warte auf Initialisierung
            await this.sleep(2500); // Genug Zeit für alle retries

            const endTest = performance.now();
            const testDuration = endTest - startTest;

            const success = capture.initialized;

            this.testResults.push({
                testName: 'immediate_initialization',
                success: success,
                duration: testDuration,
                details: {
                    initialized: capture.initialized,
                    fabricCanvases: capture.fabricCanvases.length,
                    retryCount: capture.retryCount,
                    status: capture.status
                }
            });

            console.log(`${success ? '✅' : '❌'} Immediate initialization: ${success ? 'SUCCESS' : 'FAILED'}`);
            console.log(`   Duration: ${Math.round(testDuration)}ms`);
            console.log(`   Retry count: ${capture.retryCount}`);
            console.log(`   Canvas found: ${capture.fabricCanvases.length > 0}`);

        } catch (error) {
            console.error('❌ Test error:', error.message);
            this.testResults.push({
                testName: 'immediate_initialization',
                success: false,
                error: error.message
            });
        }
    }

    async testPollingDetection() {
        console.log('\n🧪 TEST 2: Polling Detection');
        console.log('==============================');

        // Erstelle saubere Umgebung für diesen Test
        const originalQuerySelectorAll = global.document.querySelectorAll;

        try {
            let queryCount = 0;

            // Überwache querySelectorAll Aufrufe
            global.document.querySelectorAll = function(selector) {
                if (selector === 'canvas') {
                    queryCount++;
                    console.log(`🔍 Canvas query #${queryCount}`);
                }
                return originalQuerySelectorAll.call(this, selector);
            };

            const startTest = performance.now();

            // Lade Code erneut
            const ProductionReadyDesignDataCapture = require('./public/js/production-ready-design-data-capture.js');

            const capture = new ProductionReadyDesignDataCapture();

            // Warte auf Polling-Completion
            await this.sleep(3000);

            const endTest = performance.now();
            const testDuration = endTest - startTest;

            const success = queryCount >= 3; // Sollte mindestens 3 mal gepollt haben

            this.testResults.push({
                testName: 'polling_detection',
                success: success,
                duration: testDuration,
                details: {
                    queryCount: queryCount,
                    initialized: capture.initialized,
                    retryCount: capture.retryCount
                }
            });

            console.log(`${success ? '✅' : '❌'} Polling detection: ${success ? 'SUCCESS' : 'FAILED'}`);
            console.log(`   Canvas queries: ${queryCount}`);
            console.log(`   Retry count: ${capture.retryCount}`);

        } catch (error) {
            console.error('❌ Test error:', error.message);
            this.testResults.push({
                testName: 'polling_detection',
                success: false,
                error: error.message
            });
        } finally {
            // Restore original function
            global.document.querySelectorAll = originalQuerySelectorAll;
        }
    }

    async testMutationObserver() {
        console.log('\n🧪 TEST 3: MutationObserver');
        console.log('=============================');

        try {
            let observerStarted = false;

            // Override MutationObserver to track usage
            global.window.MutationObserver = function(callback) {
                this.callback = callback;
                this.observe = () => {
                    observerStarted = true;
                    console.log('👁️ MutationObserver started monitoring');
                };
                this.disconnect = () => {
                    console.log('👁️ MutationObserver stopped');
                };
            };

            const startTest = performance.now();

            // Lade Code
            const ProductionReadyDesignDataCapture = require('./public/js/production-ready-design-data-capture.js');

            const capture = new ProductionReadyDesignDataCapture();

            await this.sleep(500);

            const endTest = performance.now();
            const testDuration = endTest - startTest;

            const success = observerStarted;

            this.testResults.push({
                testName: 'mutation_observer',
                success: success,
                duration: testDuration,
                details: {
                    observerStarted: observerStarted
                }
            });

            console.log(`${success ? '✅' : '❌'} MutationObserver: ${success ? 'SUCCESS' : 'FAILED'}`);
            console.log(`   Observer started: ${observerStarted}`);

        } catch (error) {
            console.error('❌ Test error:', error.message);
            this.testResults.push({
                testName: 'mutation_observer',
                success: false,
                error: error.message
            });
        }
    }

    async testRaceConditionHandling() {
        console.log('\n🧪 TEST 4: Race Condition Handling');
        console.log('====================================');

        try {
            // Simuliere verschiedene Race Condition Szenarien
            const scenarios = [
                { name: 'Canvas before Fabric', canvasDelay: 100, fabricDelay: 500 },
                { name: 'Fabric before Canvas', canvasDelay: 500, fabricDelay: 100 },
                { name: 'Both delayed', canvasDelay: 800, fabricDelay: 1000 }
            ];

            let allScenariosHandled = true;

            for (const scenario of scenarios) {
                console.log(`🎭 Testing scenario: ${scenario.name}`);

                // Reset environment
                global.window.fabric = undefined;
                global.document.querySelectorAll = (selector) => {
                    if (selector === 'canvas') {
                        const currentTime = performance.now() - this.startTime;
                        return currentTime > scenario.canvasDelay ? [this.createMockCanvas()] : [];
                    }
                    return [];
                };

                // Setup delayed fabric
                setTimeout(() => {
                    global.window.fabric = this.createMockFabric();
                }, scenario.fabricDelay);

                const startTest = performance.now();

                // Lade Code
                const codeContent = fs.readFileSync('./public/js/production-ready-design-data-capture.js', 'utf8');
                const nodeCompatibleCode = codeContent
                    .replace(/document\.addEventListener\('DOMContentLoaded'.*?\}\);/gs, '')
                    .replace(/if \(typeof window !== 'undefined'\)[\s\S]*$/g, '');

                eval(nodeCompatibleCode);

                const capture = new ProductionReadyDesignDataCapture();

                // Warte auf Completion
                await this.sleep(1500);

                const scenarioSuccess = capture.initialized;
                if (!scenarioSuccess) {
                    allScenariosHandled = false;
                }

                console.log(`   ${scenarioSuccess ? '✅' : '❌'} ${scenario.name}: ${scenarioSuccess ? 'HANDLED' : 'FAILED'}`);
            }

            this.testResults.push({
                testName: 'race_condition_handling',
                success: allScenariosHandled,
                details: {
                    scenariosTested: scenarios.length,
                    allHandled: allScenariosHandled
                }
            });

            console.log(`${allScenariosHandled ? '✅' : '❌'} Race condition handling: ${allScenariosHandled ? 'SUCCESS' : 'FAILED'}`);

        } catch (error) {
            console.error('❌ Test error:', error.message);
            this.testResults.push({
                testName: 'race_condition_handling',
                success: false,
                error: error.message
            });
        }
    }

    async testGenerateDesignDataFunction() {
        console.log('\n🧪 TEST 5: generateDesignData Function');
        console.log('======================================');

        try {
            // Setup complete environment
            global.window.fabric = this.createMockFabric();
            global.document.querySelectorAll = (selector) => {
                if (selector === 'canvas') {
                    return [this.createMockCanvas()];
                }
                return [];
            };

            const startTest = performance.now();

            // Lade Code
            const ProductionReadyDesignDataCapture = require('./public/js/production-ready-design-data-capture.js');

            const capture = new ProductionReadyDesignDataCapture();

            // Warte auf Initialisierung
            await this.sleep(200);

            // Teste generateDesignData
            const designData = capture.generateDesignData();

            const endTest = performance.now();
            const testDuration = endTest - startTest;

            const success = designData &&
                           designData.template_view_id &&
                           designData.designed_on_area_px &&
                           Array.isArray(designData.elements) &&
                           designData.elements.length > 0;

            this.testResults.push({
                testName: 'generate_design_data',
                success: success,
                duration: testDuration,
                details: {
                    hasTemplateViewId: !!designData?.template_view_id,
                    hasDesignArea: !!designData?.designed_on_area_px,
                    elementsCount: designData?.elements?.length || 0,
                    designData: designData
                }
            });

            console.log(`${success ? '✅' : '❌'} generateDesignData function: ${success ? 'SUCCESS' : 'FAILED'}`);
            if (success) {
                console.log(`   Template View ID: ${designData.template_view_id}`);
                console.log(`   Design Area: ${designData.designed_on_area_px.width}x${designData.designed_on_area_px.height}`);
                console.log(`   Elements: ${designData.elements.length}`);
                console.log(`   Element types:`, designData.elements.map(e => e.type));
            }

        } catch (error) {
            console.error('❌ Test error:', error.message);
            this.testResults.push({
                testName: 'generate_design_data',
                success: false,
                error: error.message
            });
        }
    }

    analyzeResults() {
        console.log('\n🎯 PRODUCTION-READY VERSION TEST RESULTS');
        console.log('==========================================');

        const totalTests = this.testResults.length;
        const passedTests = this.testResults.filter(r => r.success).length;
        const failedTests = totalTests - passedTests;

        console.log(`📊 Summary:`);
        console.log(`   Total Tests: ${totalTests}`);
        console.log(`   Passed: ${passedTests} ✅`);
        console.log(`   Failed: ${failedTests} ❌`);
        console.log(`   Success Rate: ${Math.round((passedTests / totalTests) * 100)}%`);

        console.log(`\n📋 Detailed Results:`);
        this.testResults.forEach(result => {
            const status = result.success ? '✅' : '❌';
            console.log(`   ${status} ${result.testName}: ${result.success ? 'PASSED' : 'FAILED'}`);
            if (result.duration) {
                console.log(`      Duration: ${Math.round(result.duration)}ms`);
            }
            if (result.error) {
                console.log(`      Error: ${result.error}`);
            }
        });

        console.log(`\n🎯 Analysis:`);
        if (passedTests === totalTests) {
            console.log(`✅ All tests passed - Production-ready version is working correctly!`);
            console.log(`🚀 Race condition issues have been resolved`);
            console.log(`🎯 System is ready for production deployment`);
        } else {
            console.log(`❌ ${failedTests} test(s) failed - Issues need to be addressed`);
            const failedTestNames = this.testResults.filter(r => !r.success).map(r => r.testName);
            console.log(`   Failed tests: ${failedTestNames.join(', ')}`);
        }

        console.log(`\n🎉 Production-Ready Version Test completed`);
        return passedTests === totalTests;
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Run tests
const tester = new ProductionReadyVersionTest();
tester.runTests().then(success => {
    process.exit(success ? 0 : 1);
}).catch(error => {
    console.error('❌ Test execution failed:', error);
    process.exit(1);
});