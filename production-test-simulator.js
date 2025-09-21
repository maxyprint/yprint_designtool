#!/usr/bin/env node

/**
 * PRODUCTION TEST SIMULATOR
 * Automatisches Erkennen von Race Conditions und Timing-Problemen
 * Simuliert echte WordPress-Produktionsumgebung ohne Docker
 */

const fs = require('fs');
const path = require('path');
const { performance } = require('perf_hooks');

class ProductionTestSimulator {
    constructor() {
        this.testResults = [];
        this.startTime = performance.now();
        this.domReadyTime = null;
        this.fabricLoadTime = null;
        this.designerBundleTime = null;
        this.canvasCreationTime = null;

        this.simulationLog = [];
        this.raceConditionsDetected = [];

        console.log('🎯 PRODUCTION TEST SIMULATOR');
        console.log('============================');
        console.log('Automatisches Erkennen von Race Conditions und Timing-Problemen');
        console.log('');
    }

    log(message, type = 'info') {
        const timestamp = Math.round(performance.now() - this.startTime);
        const logEntry = { timestamp, message, type };
        this.simulationLog.push(logEntry);

        const prefix = {
            'info': '📋',
            'success': '✅',
            'error': '❌',
            'warning': '⚠️',
            'timing': '⏰',
            'race': '🏁'
        }[type] || '📋';

        console.log(`${prefix} [${timestamp}ms] ${message}`);
    }

    /**
     * Simuliert echte WordPress Script-Loading-Reihenfolge
     */
    async simulateWordPressScriptLoading() {
        this.log('Starting WordPress script loading simulation...', 'info');

        // 1. DOM Ready Event
        await this.simulateDOMReady();

        // 2. Fabric.js vendor bundle loading (async)
        await this.simulateFabricLoading();

        // 3. Designer bundle loading (nach vendor)
        await this.simulateDesignerBundleLoading();

        // 4. DesignerWidget instantiation
        await this.simulateDesignerWidgetCreation();

        // 5. Canvas creation (in DesignerWidget constructor)
        await this.simulateCanvasCreation();

        this.log('WordPress script loading simulation completed', 'success');
    }

    async simulateDOMReady() {
        // Simuliere DOM Ready nach realistischer Zeit
        const domReadyDelay = Math.random() * 200 + 100; // 100-300ms
        await this.sleep(domReadyDelay);

        this.domReadyTime = performance.now() - this.startTime;
        this.log(`DOM Ready event fired`, 'timing');

        // Trigger alle DOMContentLoaded listeners
        this.triggerDOMContentLoaded();
    }

    async simulateFabricLoading() {
        // Fabric.js vendor bundle lädt parallel
        const fabricLoadDelay = Math.random() * 500 + 200; // 200-700ms
        await this.sleep(fabricLoadDelay);

        this.fabricLoadTime = performance.now() - this.startTime;
        this.log(`Fabric.js vendor bundle loaded`, 'timing');

        // Fabric global verfügbar machen
        this.setupFabricGlobal();
    }

    async simulateDesignerBundleLoading() {
        // Designer bundle lädt nach vendor bundle
        const bundleLoadDelay = Math.random() * 300 + 150; // 150-450ms
        await this.sleep(bundleLoadDelay);

        this.designerBundleTime = performance.now() - this.startTime;
        this.log(`Designer bundle loaded`, 'timing');

        // Webpack module system verfügbar
        this.setupWebpackSystem();
    }

    async simulateDesignerWidgetCreation() {
        // DesignerWidget wird instanziiert nach bundle load
        const widgetCreationDelay = Math.random() * 100 + 50; // 50-150ms
        await this.sleep(widgetCreationDelay);

        this.log(`DesignerWidget instance created`, 'timing');
    }

    async simulateCanvasCreation() {
        // Canvas wird im DesignerWidget constructor erstellt
        const canvasCreationDelay = Math.random() * 200 + 100; // 100-300ms
        await this.sleep(canvasCreationDelay);

        this.canvasCreationTime = performance.now() - this.startTime;
        this.log(`Fabric canvas created and available`, 'timing');

        // Canvas ist jetzt verfügbar
        this.makeCanvasAvailable();
    }

    triggerDOMContentLoaded() {
        // Simuliere multiple DOMContentLoaded listeners (Race Condition Source)

        // 1. Designer Bundle DOMContentLoaded (erstellt DesignerWidget)
        setTimeout(() => {
            this.log('Designer Bundle DOMContentLoaded listener triggered', 'race');
            // Hier wird normalerweise DesignerWidget erstellt
        }, 0);

        // 2. Comprehensive Capture DOMContentLoaded (sucht Canvas)
        setTimeout(() => {
            this.log('Comprehensive Capture DOMContentLoaded listener triggered', 'race');
            this.testCanvasDetectionAtCurrentTime();
        }, 0);

        // 3. Andere Plugin DOMContentLoaded listeners
        setTimeout(() => {
            this.log('Other plugins DOMContentLoaded listeners triggered', 'race');
        }, 0);
    }

    testCanvasDetectionAtCurrentTime() {
        const currentTime = performance.now() - this.startTime;
        const canvasAvailable = this.canvasCreationTime && currentTime >= this.canvasCreationTime;

        this.log(`Canvas detection test at ${Math.round(currentTime)}ms: ${canvasAvailable ? 'SUCCESS' : 'FAILED'}`,
                 canvasAvailable ? 'success' : 'error');

        if (!canvasAvailable) {
            this.raceConditionsDetected.push({
                testTime: currentTime,
                issue: 'Canvas not available during DOMContentLoaded',
                expectedCanvasTime: this.canvasCreationTime || 'unknown',
                raceCondition: true
            });
        }

        return canvasAvailable;
    }

    /**
     * Testet Comprehensive Capture System zu verschiedenen Zeitpunkten
     */
    async testComprehensiveCaptureAtDifferentTimes() {
        this.log('Testing Comprehensive Capture at different timing points...', 'info');

        const testPoints = [
            { name: 'Immediate (DOMContentLoaded)', delay: 0 },
            { name: 'After 500ms', delay: 500 },
            { name: 'After 1000ms', delay: 1000 },
            { name: 'After 1500ms', delay: 1500 }
        ];

        for (const testPoint of testPoints) {
            await this.sleep(testPoint.delay);

            const success = await this.testComprehensiveCaptureSystem();

            this.testResults.push({
                testPoint: testPoint.name,
                timestamp: performance.now() - this.startTime,
                success: success,
                canvasAvailable: this.isCanvasCurrentlyAvailable()
            });

            this.log(`${testPoint.name}: ${success ? 'SUCCESS' : 'FAILED'}`,
                     success ? 'success' : 'error');
        }
    }

    async testComprehensiveCaptureSystem() {
        try {
            // Lade das production-ready capture system
            const ProductionReadyDesignDataCapture = require('./public/js/production-ready-design-data-capture.js');

            // Teste System
            if (typeof ProductionReadyDesignDataCapture !== 'undefined') {
                const capture = new ProductionReadyDesignDataCapture();

                // Warte auf Initialisierung
                await new Promise(resolve => setTimeout(resolve, 2000));

                const result = capture.generateDesignData();

                return result && !result.error && result.elements && result.elements.length > 0;
            }

            return false;

        } catch (error) {
            this.log(`Comprehensive Capture Test Error: ${error.message}`, 'error');
            return false;
        }
    }

    prepareCodeForNodeJS(code) {
        // Entferne Browser-spezifische Event Listener
        let nodeCode = code.replace(/document\.addEventListener\('DOMContentLoaded'.*?\}\);/gs, '');
        nodeCode = nodeCode.replace(/if \(document\.readyState === 'loading'\).*?}\)/gs, '');

        return nodeCode;
    }

    isCanvasCurrentlyAvailable() {
        const currentTime = performance.now() - this.startTime;
        return this.canvasCreationTime && currentTime >= this.canvasCreationTime;
    }

    setupMockEnvironment() {
        // Simuliere WordPress DOM
        global.window = {
            fabric: null, // Wird später gesetzt
            addEventListener: () => {},
            dispatchEvent: () => {},
            generateDesignData: null,
            comprehensiveCapture: null
        };

        global.document = {
            addEventListener: () => {},
            querySelector: (selector) => {
                if (selector === '.mockup-design-area') {
                    return {
                        getBoundingClientRect: () => ({
                            left: 50, top: 100, width: 800, height: 600
                        }),
                        offsetWidth: 800,
                        offsetHeight: 600
                    };
                }
                return null;
            },
            querySelectorAll: (selector) => {
                if (selector === 'canvas') {
                    return this.isCanvasCurrentlyAvailable() ? [this.createMockCanvas()] : [];
                }
                return [];
            },
            readyState: 'complete'
        };

        global.console = console;
    }

    setupFabricGlobal() {
        global.window.fabric = {
            Canvas: function() {
                return {
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
                        }
                    ]
                };
            }
        };
    }

    setupWebpackSystem() {
        // Simuliere webpack module system
        global.window.__webpack_require__ = function(moduleId) {
            return {};
        };
        global.window.__webpack_require__.cache = {};
        global.window.__webpack_require__.m = {};
    }

    makeCanvasAvailable() {
        // Canvas ist jetzt verfügbar via querySelectorAll
        this.canvasAvailable = true;
    }

    createMockCanvas() {
        return {
            __fabric: new global.window.fabric.Canvas(),
            getBoundingClientRect: () => ({
                left: 60, top: 110, width: 780, height: 580
            }),
            closest: () => ({
                getBoundingClientRect: () => ({ left: 50, top: 100 })
            })
        };
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    analyzeResults() {
        this.log('', 'info');
        this.log('RACE CONDITION ANALYSIS', 'info');
        this.log('=======================', 'info');

        // Timing Analysis
        const timings = {
            domReady: this.domReadyTime,
            fabricLoaded: this.fabricLoadTime,
            designerBundle: this.designerBundleTime,
            canvasCreated: this.canvasCreationTime
        };

        this.log(`Timing Sequence:`, 'timing');
        Object.entries(timings).forEach(([event, time]) => {
            this.log(`  ${event}: ${Math.round(time)}ms`, 'timing');
        });

        // Race Condition Detection
        if (this.raceConditionsDetected.length > 0) {
            this.log(`${this.raceConditionsDetected.length} Race Conditions detected!`, 'error');
            this.raceConditionsDetected.forEach((race, i) => {
                this.log(`  Race ${i+1}: ${race.issue}`, 'race');
                this.log(`    Test time: ${Math.round(race.testTime)}ms`, 'race');
                this.log(`    Canvas available: ${Math.round(race.expectedCanvasTime || 0)}ms`, 'race');
            });
        } else {
            this.log('No race conditions detected', 'success');
        }

        // Test Results Analysis
        const failedTests = this.testResults.filter(r => !r.success);
        const successfulTests = this.testResults.filter(r => r.success);

        this.log(``, 'info');
        this.log(`Test Results:`, 'info');
        this.log(`  Total tests: ${this.testResults.length}`, 'info');
        this.log(`  Successful: ${successfulTests.length}`, 'success');
        this.log(`  Failed: ${failedTests.length}`, 'error');

        if (failedTests.length > 0) {
            this.log(`Failed test details:`, 'error');
            failedTests.forEach(test => {
                this.log(`  ${test.testPoint}: Canvas available = ${test.canvasAvailable}`, 'error');
            });
        }

        // Conclusion
        const hasRaceConditions = this.raceConditionsDetected.length > 0;
        const hasFailedTests = failedTests.length > 0;

        this.log(``, 'info');
        this.log(`CONCLUSION:`, 'info');
        this.log(`===========`, 'info');

        if (hasRaceConditions || hasFailedTests) {
            this.log(`❌ PRODUCTION ISSUES DETECTED!`, 'error');

            if (hasRaceConditions) {
                this.log(`   - Race conditions between DOMContentLoaded events`, 'error');
            }
            if (hasFailedTests) {
                this.log(`   - Canvas detection fails at specific timing points`, 'error');
            }

            this.log(``, 'info');
            this.log(`RECOMMENDED FIXES:`, 'warning');
            this.log(`   1. Replace DOMContentLoaded with polling-based detection`, 'warning');
            this.log(`   2. Implement retry mechanism with exponential backoff`, 'warning');
            this.log(`   3. Add MutationObserver for canvas creation monitoring`, 'warning');
            this.log(`   4. Use event-driven approach instead of immediate execution`, 'warning');

        } else {
            this.log(`✅ No production issues detected`, 'success');
        }

        return {
            raceConditionsDetected: hasRaceConditions,
            failedTests: hasFailedTests,
            summary: {
                totalTests: this.testResults.length,
                successfulTests: successfulTests.length,
                failedTests: failedTests.length,
                raceConditions: this.raceConditionsDetected.length
            }
        };
    }

    saveDetailedReport() {
        const report = {
            timestamp: new Date().toISOString(),
            testEnvironment: 'Production Simulator',
            timingSequence: {
                domReady: this.domReadyTime,
                fabricLoaded: this.fabricLoadTime,
                designerBundle: this.designerBundleTime,
                canvasCreated: this.canvasCreationTime
            },
            simulationLog: this.simulationLog,
            testResults: this.testResults,
            raceConditionsDetected: this.raceConditionsDetected,
            analysis: this.analyzeResults()
        };

        const reportFile = `production-test-report-${Date.now()}.json`;

        try {
            fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
            this.log(`Detailed report saved: ${reportFile}`, 'success');
        } catch (error) {
            this.log(`Failed to save report: ${error.message}`, 'error');
        }

        return report;
    }

    async run() {
        this.log('Initializing production test simulation...', 'info');

        // Setup mock environment
        this.setupMockEnvironment();

        // Simuliere WordPress script loading
        await this.simulateWordPressScriptLoading();

        // Teste zu verschiedenen Zeitpunkten
        await this.testComprehensiveCaptureAtDifferentTimes();

        // Analysiere Ergebnisse
        const analysis = this.analyzeResults();

        // Speichere detaillierten Report
        this.saveDetailedReport();

        this.log(`Production Test Simulation completed`, 'success');

        return analysis;
    }
}

// Führe Simulation aus
async function runProductionSimulation() {
    const simulator = new ProductionTestSimulator();
    const results = await simulator.run();

    // Exit code basierend auf Ergebnissen
    const hasIssues = results.raceConditionsDetected || results.failedTests;
    process.exit(hasIssues ? 1 : 0);
}

if (require.main === module) {
    runProductionSimulation().catch(error => {
        console.error('❌ Simulation failed:', error);
        process.exit(1);
    });
}

module.exports = ProductionTestSimulator;