#!/usr/bin/env node

/**
 * WordPress Integration Tests for YPrint Designer Plugin
 * Tests real WordPress environment to catch production issues
 */

const puppeteer = require('puppeteer');
const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');

class WordPressIntegrationTester {
    constructor() {
        this.browser = null;
        this.page = null;
        this.websocket = null;
        this.testResults = [];
        this.wordpressUrl = process.env.WORDPRESS_TEST_URL || 'http://localhost:8081';
        this.websocketUrl = process.env.WEBSOCKET_SERVER || 'ws://localhost:8083';

        console.log('🚀 WordPress Integration Tester initialized');
        console.log(`WordPress URL: ${this.wordpressUrl}`);
        console.log(`WebSocket URL: ${this.websocketUrl}`);
    }

    async init() {
        try {
            // Launch browser
            this.browser = await puppeteer.launch({
                headless: true,
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-gpu'
                ]
            });

            this.page = await this.browser.newPage();

            // Enable console logging
            this.page.on('console', msg => {
                const text = msg.text();
                console.log(`📝 Browser Console: ${text}`);

                // Capture important plugin messages
                if (text.includes('COMPREHENSIVE DESIGN DATA CAPTURE') ||
                    text.includes('DESIGNER EXPOSER') ||
                    text.includes('fabric canvases') ||
                    text.includes('generateDesignData')) {
                    this.testResults.push({
                        type: 'console',
                        timestamp: new Date().toISOString(),
                        message: text
                    });
                }
            });

            // Connect to WebSocket for real-time reporting
            await this.connectWebSocket();

            console.log('✅ Browser and WebSocket initialized');
            return true;
        } catch (error) {
            console.error('❌ Initialization failed:', error);
            return false;
        }
    }

    async connectWebSocket() {
        return new Promise((resolve, reject) => {
            try {
                this.websocket = new WebSocket(this.websocketUrl);

                this.websocket.on('open', () => {
                    console.log('✅ WebSocket connected');
                    this.sendTestUpdate('WordPress Integration Test Started');
                    resolve();
                });

                this.websocket.on('error', (error) => {
                    console.log('⚠️ WebSocket connection failed, continuing without it');
                    resolve(); // Don't fail tests if WebSocket unavailable
                });

            } catch (error) {
                console.log('⚠️ WebSocket unavailable, continuing without it');
                resolve();
            }
        });
    }

    sendTestUpdate(message, data = null) {
        if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
            this.websocket.send(JSON.stringify({
                type: 'wordpress-test-update',
                timestamp: new Date().toISOString(),
                message,
                data
            }));
        }
    }

    async waitForWordPress() {
        console.log('⏳ Waiting for WordPress to be ready...');
        let attempts = 0;
        const maxAttempts = 30;

        while (attempts < maxAttempts) {
            try {
                const response = await this.page.goto(this.wordpressUrl, {
                    waitUntil: 'networkidle0',
                    timeout: 10000
                });

                if (response && response.status() === 200) {
                    console.log('✅ WordPress is ready');
                    return true;
                }
            } catch (error) {
                console.log(`⏳ WordPress not ready, attempt ${attempts + 1}/${maxAttempts}`);
            }

            attempts++;
            await new Promise(resolve => setTimeout(resolve, 2000));
        }

        throw new Error('WordPress failed to start');
    }

    async loginToWordPress() {
        console.log('🔐 Logging into WordPress...');

        await this.page.goto(`${this.wordpressUrl}/wp-admin`);
        await this.page.waitForSelector('#loginform', { timeout: 10000 });

        await this.page.type('#user_login', 'admin');
        await this.page.type('#user_pass', 'admin123');
        await this.page.click('#wp-submit');

        await this.page.waitForSelector('#wpadminbar', { timeout: 10000 });
        console.log('✅ WordPress login successful');
    }

    async activatePlugin() {
        console.log('🔌 Activating YPrint Designer Plugin...');

        await this.page.goto(`${this.wordpressUrl}/wp-admin/plugins.php`);
        await this.page.waitForSelector('.plugins', { timeout: 10000 });

        // Look for the plugin and activate if not already active
        try {
            const activateLink = await this.page.$('tr[data-slug="octo-print-designer"] .activate a');
            if (activateLink) {
                await activateLink.click();
                await this.page.waitForNavigation();
                console.log('✅ Plugin activated');
            } else {
                console.log('✅ Plugin already active');
            }
        } catch (error) {
            console.log('⚠️ Plugin activation check failed:', error.message);
        }
    }

    async testDesignerPageLoad() {
        console.log('🎨 Testing Designer Page Load...');
        this.sendTestUpdate('Testing Designer Page Load');

        // Create a test product page or go to existing designer page
        await this.page.goto(`${this.wordpressUrl}/wp-admin/admin.php?page=octo-print-designer`);

        // Wait for page load and script initialization
        await this.page.waitForTimeout(3000);

        const testResult = {
            test: 'designer_page_load',
            timestamp: new Date().toISOString(),
            success: false,
            details: {}
        };

        try {
            // Check if fabric.js loaded
            const fabricLoaded = await this.page.evaluate(() => {
                return typeof window.fabric !== 'undefined';
            });

            // Check if plugin scripts loaded
            const pluginScriptsLoaded = await this.page.evaluate(() => {
                const scripts = Array.from(document.querySelectorAll('script')).map(s => s.src);
                return {
                    vendorBundle: scripts.some(s => s.includes('vendor.bundle.js')),
                    designerBundle: scripts.some(s => s.includes('designer.bundle.js')),
                    comprehensiveCapture: scripts.some(s => s.includes('comprehensive-design-data-capture.js'))
                };
            });

            testResult.details = {
                fabricLoaded,
                scripts: pluginScriptsLoaded
            };

            testResult.success = fabricLoaded && pluginScriptsLoaded.designerBundle;

        } catch (error) {
            testResult.error = error.message;
        }

        this.testResults.push(testResult);
        this.sendTestUpdate('Designer Page Load Test', testResult);

        console.log(`${testResult.success ? '✅' : '❌'} Designer Page Load Test:`, testResult.details);
        return testResult.success;
    }

    async testCanvasDetection() {
        console.log('🔍 Testing Canvas Detection (Real Timing)...');
        this.sendTestUpdate('Testing Canvas Detection with Real Timing');

        const testResult = {
            test: 'canvas_detection_timing',
            timestamp: new Date().toISOString(),
            success: false,
            timingSteps: [],
            finalResult: null
        };

        try {
            // Monitor canvas detection over time
            const detectionSteps = await this.page.evaluate(async () => {
                const steps = [];
                const startTime = Date.now();

                // Check canvas availability every 500ms for 10 seconds
                for (let i = 0; i < 20; i++) {
                    const elapsed = Date.now() - startTime;

                    const step = {
                        elapsed,
                        canvasElements: document.querySelectorAll('canvas').length,
                        fabricCanvases: 0,
                        designerWidget: typeof window.DesignerWidget !== 'undefined',
                        comprehensiveCapture: typeof window.generateDesignData !== 'undefined',
                        captureInstance: !!window.comprehensiveCapture
                    };

                    // Count fabric canvases
                    document.querySelectorAll('canvas').forEach(canvas => {
                        if (canvas.__fabric) step.fabricCanvases++;
                    });

                    steps.push(step);

                    // Stop if we found what we're looking for
                    if (step.fabricCanvases > 0 && step.comprehensiveCapture) {
                        break;
                    }

                    await new Promise(resolve => setTimeout(resolve, 500));
                }

                return steps;
            });

            testResult.timingSteps = detectionSteps;

            // Test final detection
            const finalDetection = await this.page.evaluate(() => {
                if (typeof window.generateDesignData === 'function') {
                    try {
                        const result = window.generateDesignData();
                        return {
                            functionAvailable: true,
                            result: result,
                            error: null
                        };
                    } catch (error) {
                        return {
                            functionAvailable: true,
                            result: null,
                            error: error.message
                        };
                    }
                } else {
                    return {
                        functionAvailable: false,
                        result: null,
                        error: 'generateDesignData function not found'
                    };
                }
            });

            testResult.finalResult = finalDetection;
            testResult.success = finalDetection.functionAvailable && finalDetection.result && !finalDetection.error;

        } catch (error) {
            testResult.error = error.message;
        }

        this.testResults.push(testResult);
        this.sendTestUpdate('Canvas Detection Timing Test', testResult);

        console.log(`${testResult.success ? '✅' : '❌'} Canvas Detection Test:`, testResult.finalResult);
        return testResult.success;
    }

    async testRaceConditionSimulation() {
        console.log('🏁 Testing Race Condition Simulation...');
        this.sendTestUpdate('Testing Race Condition Simulation');

        const testResult = {
            test: 'race_condition_simulation',
            timestamp: new Date().toISOString(),
            success: false,
            scenarios: []
        };

        try {
            // Simulate different loading scenarios
            const scenarios = [
                'immediate_after_dom',
                'after_500ms_delay',
                'after_1000ms_delay',
                'after_2000ms_delay'
            ];

            for (const scenario of scenarios) {
                console.log(`  Testing scenario: ${scenario}`);

                const scenarioResult = await this.page.evaluate(async (scenarioName) => {
                    const delays = {
                        'immediate_after_dom': 0,
                        'after_500ms_delay': 500,
                        'after_1000ms_delay': 1000,
                        'after_2000ms_delay': 2000
                    };

                    await new Promise(resolve => setTimeout(resolve, delays[scenarioName]));

                    return {
                        scenario: scenarioName,
                        delay: delays[scenarioName],
                        canvasElements: document.querySelectorAll('canvas').length,
                        fabricCanvases: Array.from(document.querySelectorAll('canvas')).filter(c => c.__fabric).length,
                        generateDataFunction: typeof window.generateDesignData !== 'undefined',
                        designerWidget: typeof window.DesignerWidget !== 'undefined'
                    };
                }, scenario);

                testResult.scenarios.push(scenarioResult);
            }

            // Test passes if later scenarios find canvases while early ones don't
            const immediateResult = testResult.scenarios.find(s => s.scenario === 'immediate_after_dom');
            const delayedResult = testResult.scenarios.find(s => s.scenario === 'after_2000ms_delay');

            testResult.success = immediateResult.fabricCanvases === 0 && delayedResult.fabricCanvases > 0;

        } catch (error) {
            testResult.error = error.message;
        }

        this.testResults.push(testResult);
        this.sendTestUpdate('Race Condition Test', testResult);

        console.log(`${testResult.success ? '✅' : '❌'} Race Condition Test:`, testResult.scenarios);
        return testResult.success;
    }

    async saveResults() {
        const resultsFile = path.join('/app/results', `wordpress-test-${Date.now()}.json`);
        const summary = {
            timestamp: new Date().toISOString(),
            environment: {
                wordpressUrl: this.wordpressUrl,
                userAgent: await this.page.evaluate(() => navigator.userAgent)
            },
            results: this.testResults,
            summary: {
                total: this.testResults.length,
                passed: this.testResults.filter(r => r.success).length,
                failed: this.testResults.filter(r => !r.success).length
            }
        };

        try {
            fs.writeFileSync(resultsFile, JSON.stringify(summary, null, 2));
            console.log(`📊 Results saved to: ${resultsFile}`);
        } catch (error) {
            console.error('❌ Failed to save results:', error);
        }

        return summary;
    }

    async cleanup() {
        if (this.websocket) {
            this.websocket.close();
        }
        if (this.browser) {
            await this.browser.close();
        }
    }

    async run() {
        console.log('🚀 Starting WordPress Integration Tests...');

        try {
            await this.init();
            await this.waitForWordPress();
            await this.loginToWordPress();
            await this.activatePlugin();

            // Run tests
            const tests = [
                () => this.testDesignerPageLoad(),
                () => this.testCanvasDetection(),
                () => this.testRaceConditionSimulation()
            ];

            let passedTests = 0;
            for (const test of tests) {
                const success = await test();
                if (success) passedTests++;
            }

            const summary = await this.saveResults();

            console.log('\n📊 TEST SUMMARY:');
            console.log('================');
            console.log(`Total Tests: ${summary.summary.total}`);
            console.log(`Passed: ${summary.summary.passed}`);
            console.log(`Failed: ${summary.summary.failed}`);
            console.log(`Success Rate: ${Math.round((summary.summary.passed / summary.summary.total) * 100)}%`);

            this.sendTestUpdate('Tests Completed', summary);

            return summary.summary.passed === summary.summary.total;

        } catch (error) {
            console.error('❌ Test execution failed:', error);
            this.sendTestUpdate('Test Execution Failed', { error: error.message });
            return false;
        } finally {
            await this.cleanup();
        }
    }
}

// Run tests if called directly
if (require.main === module) {
    const tester = new WordPressIntegrationTester();
    tester.run().then(success => {
        process.exit(success ? 0 : 1);
    }).catch(error => {
        console.error('❌ Fatal error:', error);
        process.exit(1);
    });
}

module.exports = WordPressIntegrationTester;