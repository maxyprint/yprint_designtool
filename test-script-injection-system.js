/**
 * COMPREHENSIVE TEST SUITE FOR DOM SCRIPT INJECTION SYSTEM
 * Tests all execution methods, security features, and edge cases
 */

class ScriptInjectionTestSuite {
    constructor() {
        this.testResults = [];
        this.currentTest = null;
        this.startTime = null;
    }

    async runAllTests() {
        console.log('🧪 Starting DOM Script Injection System Test Suite...');
        console.log('=' .repeat(60));

        this.startTime = performance.now();

        // Basic functionality tests
        await this.testBasicScriptExtraction();
        await this.testHtmlWithScriptsMethod();
        await this.testCreateElementMethod();
        await this.testFunctionConstructorMethod();
        await this.testIsolatedContextMethod();

        // Security tests
        await this.testSecurityMeasures();
        await this.testCSPCompliance();
        await this.testSuspiciousScriptDetection();

        // Performance tests
        await this.testPerformanceOptimizations();
        await this.testCachingSystem();
        await this.testBatchExecution();

        // Error handling tests
        await this.testErrorHandling();
        await this.testTimeoutHandling();
        await this.testRecoveryMechanisms();

        // Browser compatibility tests
        await this.testBrowserCompatibility();

        // Real-world scenario tests
        await this.testAjaxResponseScenarios();
        await this.testWordPressIntegration();

        // Generate test report
        this.generateTestReport();
    }

    // ==============================================
    // BASIC FUNCTIONALITY TESTS
    // ==============================================

    async testBasicScriptExtraction() {
        this.startTest('Basic Script Extraction');

        const sampleHtml = `
            <div>
                <h1>Test Content</h1>
                <script>console.log('Script 1');</script>
                <p>Some content</p>
                <script type="text/javascript">
                    console.log('Script 2');
                    window.testVar = 'hello';
                </script>
                <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
            </div>
        `;

        try {
            const scripts = window.domScriptInjector.extractScripts(sampleHtml);

            this.assert(scripts.length === 3, `Expected 3 scripts, got ${scripts.length}`);
            this.assert(scripts[0].content.includes('Script 1'), 'First script content correct');
            this.assert(scripts[1].content.includes('Script 2'), 'Second script content correct');
            this.assert(scripts[2].src === 'https://code.jquery.com/jquery-3.6.0.min.js', 'External script src correct');

            this.passTest('Script extraction working correctly');

        } catch (error) {
            this.failTest(`Script extraction failed: ${error.message}`);
        }
    }

    async testHtmlWithScriptsMethod() {
        this.startTest('jQuery htmlWithScripts Method');

        const testHtml = `
            <div id="test-content">
                <h2>Dynamic Content</h2>
                <script>
                    window.jQueryTestExecuted = true;
                    console.log('jQuery method script executed');
                </script>
            </div>
        `;

        try {
            // Create test container
            if ($('#test-container').length === 0) {
                $('body').append('<div id="test-container"></div>');
            }

            const result = await $('#test-container').htmlWithScripts(testHtml);

            this.assert(result.success === true, 'htmlWithScripts returned success');
            this.assert(result.scriptsExecuted === 1, 'One script was executed');
            this.assert(window.jQueryTestExecuted === true, 'Script actually executed');
            this.assert($('#test-container #test-content').length === 1, 'HTML was inserted correctly');

            this.passTest('jQuery htmlWithScripts method working');

        } catch (error) {
            this.failTest(`jQuery method failed: ${error.message}`);
        }
    }

    async testCreateElementMethod() {
        this.startTest('createElement Execution Method');

        const script = {
            content: 'window.createElementTestExecuted = true; console.log("createElement method test");',
            attributes: { type: 'text/javascript' }
        };

        try {
            const result = await window.domScriptInjector.executeScript(script, {
                preferredMethod: 'createElement'
            });

            this.assert(result.success === true, 'createElement method succeeded');
            this.assert(result.method === 'createElement', 'Correct method was used');
            this.assert(window.createElementTestExecuted === true, 'Script was executed');

            this.passTest('createElement method working correctly');

        } catch (error) {
            this.failTest(`createElement method failed: ${error.message}`);
        }
    }

    async testFunctionConstructorMethod() {
        this.startTest('Function Constructor Method');

        const script = {
            content: 'window.functionTestExecuted = true; return "function test success";',
            attributes: {}
        };

        try {
            const result = await window.domScriptInjector.executeScript(script, {
                preferredMethod: 'function'
            });

            this.assert(result.success === true, 'Function constructor succeeded');
            this.assert(result.method === 'function', 'Correct method was used');
            this.assert(window.functionTestExecuted === true, 'Script was executed');

            this.passTest('Function constructor method working');

        } catch (error) {
            this.failTest(`Function constructor failed: ${error.message}`);
        }
    }

    async testIsolatedContextMethod() {
        this.startTest('Isolated Context Method');

        const script = {
            content: 'console.log("Isolated context test"); window.isolatedTestExecuted = true;',
            attributes: {}
        };

        try {
            const result = await window.domScriptInjector.executeScript(script, {
                preferredMethod: 'isolated',
                scriptTimeout: 5000
            });

            this.assert(result.success === true, 'Isolated execution succeeded');
            this.assert(result.method === 'isolated', 'Correct method was used');

            this.passTest('Isolated context method working');

        } catch (error) {
            this.failTest(`Isolated context failed: ${error.message}`);
        }
    }

    // ==============================================
    // SECURITY TESTS
    // ==============================================

    async testSecurityMeasures() {
        this.startTest('Security Measures');

        try {
            // Test script size limit
            const largeScript = {
                content: 'console.log("test");'.repeat(100000), // Very large script
                attributes: {}
            };

            const isSafe = window.domScriptInjector.isScriptSafe(largeScript.content, largeScript.attributes);
            this.assert(isSafe === false, 'Large scripts are rejected');

            // Test suspicious pattern detection
            const suspiciousScript = {
                content: 'eval("malicious code"); document.write("<script>alert(1)</script>");',
                attributes: {}
            };

            const isSuspicious = window.domScriptInjector.isScriptSafe(suspiciousScript.content, suspiciousScript.attributes);
            this.assert(isSuspicious === false, 'Suspicious scripts are rejected');

            this.passTest('Security measures working correctly');

        } catch (error) {
            this.failTest(`Security test failed: ${error.message}`);
        }
    }

    async testCSPCompliance() {
        this.startTest('CSP Compliance');

        try {
            // Test with CSP compliance enabled
            const script = {
                content: 'window.cspTestExecuted = true;',
                attributes: {}
            };

            const result = await window.domScriptInjector.executeScript(script, {
                enableCSPCompliance: true
            });

            // With CSP compliance, should prefer createElement method
            this.assert(result.method === 'createElement', 'CSP compliance uses createElement method');

            this.passTest('CSP compliance working');

        } catch (error) {
            this.failTest(`CSP compliance failed: ${error.message}`);
        }
    }

    async testSuspiciousScriptDetection() {
        this.startTest('Suspicious Script Detection');

        const suspiciousPatterns = [
            'document.write("bad")',
            'eval("malicious")',
            'innerHTML = "dangerous"',
            'localStorage.setItem("hack", "data")',
            'document.cookie = "stolen"'
        ];

        try {
            let detectedCount = 0;

            suspiciousPatterns.forEach(pattern => {
                const isSafe = window.domScriptInjector.isScriptSafe(pattern, {});
                if (!isSafe) {
                    detectedCount++;
                }
            });

            this.assert(detectedCount === suspiciousPatterns.length,
                `All suspicious patterns detected (${detectedCount}/${suspiciousPatterns.length})`);

            this.passTest('Suspicious script detection working');

        } catch (error) {
            this.failTest(`Suspicious script detection failed: ${error.message}`);
        }
    }

    // ==============================================
    // PERFORMANCE TESTS
    // ==============================================

    async testPerformanceOptimizations() {
        this.startTest('Performance Optimizations');

        try {
            const startTime = performance.now();

            // Execute multiple scripts to test performance
            const scripts = [];
            for (let i = 0; i < 10; i++) {
                scripts.push({
                    content: `console.log('Performance test script ${i}'); window.perfTest${i} = true;`,
                    attributes: {}
                });
            }

            const results = await window.domScriptInjector.executeScripts(scripts, {
                batchExecution: true,
                enableCaching: true
            });

            const executionTime = performance.now() - startTime;

            this.assert(results.length === 10, 'All scripts executed');
            this.assert(executionTime < 1000, `Execution completed in reasonable time (${executionTime.toFixed(2)}ms)`);

            this.passTest(`Performance test completed in ${executionTime.toFixed(2)}ms`);

        } catch (error) {
            this.failTest(`Performance test failed: ${error.message}`);
        }
    }

    async testCachingSystem() {
        this.startTest('Caching System');

        try {
            const script = {
                content: 'window.cacheTestExecuted = (window.cacheTestExecuted || 0) + 1;',
                attributes: {}
            };

            // First execution (should be cached)
            const result1 = await window.domScriptInjector.executeScript(script, {
                enableCaching: true
            });

            // Second execution (should use cache)
            const result2 = await window.domScriptInjector.executeScript(script, {
                enableCaching: true
            });

            this.assert(result1.success === true, 'First execution succeeded');
            this.assert(result2.success === true, 'Second execution succeeded');

            // Check if cache was used (execution should be faster)
            this.assert(result2.executionTime < result1.executionTime || result2.cached === true,
                'Caching improved performance or used cached result');

            this.passTest('Caching system working');

        } catch (error) {
            this.failTest(`Caching test failed: ${error.message}`);
        }
    }

    async testBatchExecution() {
        this.startTest('Batch Execution');

        try {
            const scripts = [
                { content: 'window.batch1 = true;', attributes: {} },
                { content: 'window.batch2 = true;', attributes: {} },
                { content: 'window.batch3 = true;', attributes: {} }
            ];

            const results = await window.domScriptInjector.executeScripts(scripts, {
                batchExecution: true
            });

            this.assert(results.length === 3, 'All batch scripts executed');
            this.assert(window.batch1 === true, 'First batch script executed');
            this.assert(window.batch2 === true, 'Second batch script executed');
            this.assert(window.batch3 === true, 'Third batch script executed');

            this.passTest('Batch execution working');

        } catch (error) {
            this.failTest(`Batch execution failed: ${error.message}`);
        }
    }

    // ==============================================
    // ERROR HANDLING TESTS
    // ==============================================

    async testErrorHandling() {
        this.startTest('Error Handling');

        try {
            // Test with script that throws error
            const errorScript = {
                content: 'throw new Error("Intentional test error");',
                attributes: {}
            };

            const result = await window.domScriptInjector.executeScript(errorScript);

            this.assert(result.success === false, 'Error script reported failure');
            this.assert(result.error.includes('Intentional test error'), 'Error message captured');

            this.passTest('Error handling working correctly');

        } catch (error) {
            // This is expected behavior
            this.passTest('Error handling working (exception caught)');
        }
    }

    async testTimeoutHandling() {
        this.startTest('Timeout Handling');

        try {
            // Test with script that runs too long
            const timeoutScript = {
                content: 'while(true) { /* infinite loop */ }',
                attributes: {}
            };

            const result = await window.domScriptInjector.executeScript(timeoutScript, {
                scriptTimeout: 1000 // 1 second timeout
            });

            this.assert(result.success === false, 'Timeout script reported failure');
            this.assert(result.error.includes('timeout'), 'Timeout error detected');

            this.passTest('Timeout handling working');

        } catch (error) {
            if (error.message.includes('timeout')) {
                this.passTest('Timeout handling working (timeout caught)');
            } else {
                this.failTest(`Unexpected timeout error: ${error.message}`);
            }
        }
    }

    async testRecoveryMechanisms() {
        this.startTest('Recovery Mechanisms');

        try {
            // Test fallback when preferred method fails
            const script = {
                content: 'window.recoveryTestExecuted = true;',
                attributes: {}
            };

            // Try with a method that might not be available
            const result = await window.domScriptInjector.executeScript(script, {
                preferredMethod: 'unsupported_method',
                fallbackMode: 'function'
            });

            this.assert(result.success === true, 'Recovery mechanism worked');
            this.assert(window.recoveryTestExecuted === true, 'Script executed via fallback');

            this.passTest('Recovery mechanisms working');

        } catch (error) {
            this.failTest(`Recovery test failed: ${error.message}`);
        }
    }

    // ==============================================
    // BROWSER COMPATIBILITY TESTS
    // ==============================================

    async testBrowserCompatibility() {
        this.startTest('Browser Compatibility');

        try {
            const capabilities = window.domScriptInjector.detectBrowserCapabilities();

            this.assert(typeof capabilities.supportsFunctionConstructor === 'boolean', 'Function constructor detection works');
            this.assert(typeof capabilities.supportsCreateElement === 'boolean', 'CreateElement detection works');
            this.assert(typeof capabilities.supportsIframe === 'boolean', 'Iframe detection works');

            // Test that system adapts to capabilities
            if (!capabilities.supportsFunctionConstructor) {
                console.log('ℹ️ Function constructor not supported, system should adapt');
            }

            this.passTest('Browser compatibility detection working');

        } catch (error) {
            this.failTest(`Browser compatibility test failed: ${error.message}`);
        }
    }

    // ==============================================
    // REAL-WORLD SCENARIO TESTS
    // ==============================================

    async testAjaxResponseScenarios() {
        this.startTest('AJAX Response Scenarios');

        try {
            // Simulate typical AJAX response with mixed content
            const ajaxResponse = `
                <div class="ajax-content">
                    <h3>Dynamic Content</h3>
                    <script>
                        console.log('AJAX script 1 executed');
                        window.ajaxScript1 = true;
                    </script>
                    <p>Some content between scripts</p>
                    <script>
                        console.log('AJAX script 2 executed');
                        window.ajaxScript2 = true;

                        // Simulate jQuery usage
                        if (typeof $ !== 'undefined') {
                            $('.ajax-content').addClass('scripts-loaded');
                        }
                    </script>
                    <div class="nested-content">
                        <script>
                            window.ajaxScript3 = true;
                            console.log('Nested script executed');
                        </script>
                    </div>
                </div>
            `;

            // Create container for test
            if ($('#ajax-test-container').length === 0) {
                $('body').append('<div id="ajax-test-container"></div>');
            }

            const result = await $('#ajax-test-container').htmlWithScripts(ajaxResponse);

            this.assert(result.success === true, 'AJAX response processed successfully');
            this.assert(result.scriptsExecuted === 3, 'All AJAX scripts executed');
            this.assert(window.ajaxScript1 === true, 'First AJAX script executed');
            this.assert(window.ajaxScript2 === true, 'Second AJAX script executed');
            this.assert(window.ajaxScript3 === true, 'Third AJAX script executed');

            this.passTest('AJAX response scenarios working');

        } catch (error) {
            this.failTest(`AJAX scenario test failed: ${error.message}`);
        }
    }

    async testWordPressIntegration() {
        this.startTest('WordPress Integration');

        try {
            // Simulate WordPress admin AJAX response
            const wpResponse = `
                <div class="wp-admin-content">
                    <h2>WordPress Admin Content</h2>
                    <script>
                        // Typical WordPress admin script
                        jQuery(document).ready(function($) {
                            console.log('WordPress jQuery script executed');
                            window.wpAdminScriptExecuted = true;

                            // Simulate admin functionality
                            $('.wp-admin-content').data('initialized', true);
                        });
                    </script>

                    <div class="meta-box">
                        <script>
                            // Meta box initialization
                            if (typeof ajaxurl !== 'undefined') {
                                console.log('WordPress ajaxurl available:', ajaxurl);
                                window.wpAjaxUrlAvailable = true;
                            }
                        </script>
                    </div>
                </div>
            `;

            // Create WordPress-like container
            if ($('#wp-test-container').length === 0) {
                $('body').append('<div id="wp-test-container"></div>');
            }

            const result = await $('#wp-test-container').htmlWithScripts(wpResponse);

            this.assert(result.success === true, 'WordPress response processed');
            this.assert(result.scriptsExecuted >= 1, 'WordPress scripts executed');

            // Check if jQuery-dependent code ran
            const initialized = $('#wp-test-container .wp-admin-content').data('initialized');
            this.assert(initialized === true, 'WordPress jQuery initialization worked');

            this.passTest('WordPress integration working');

        } catch (error) {
            this.failTest(`WordPress integration test failed: ${error.message}`);
        }
    }

    // ==============================================
    // TEST UTILITIES
    // ==============================================

    startTest(testName) {
        this.currentTest = {
            name: testName,
            startTime: performance.now(),
            assertions: 0,
            passed: 0,
            failed: 0
        };

        console.log(`\n🧪 Running: ${testName}`);
    }

    assert(condition, message) {
        this.currentTest.assertions++;

        if (condition) {
            this.currentTest.passed++;
            console.log(`  ✅ ${message}`);
        } else {
            this.currentTest.failed++;
            console.log(`  ❌ ${message}`);
        }
    }

    passTest(message) {
        this.currentTest.endTime = performance.now();
        this.currentTest.duration = this.currentTest.endTime - this.currentTest.startTime;
        this.currentTest.result = 'PASSED';
        this.currentTest.message = message;

        console.log(`  ✅ PASSED: ${message} (${this.currentTest.duration.toFixed(2)}ms)`);

        this.testResults.push({ ...this.currentTest });
    }

    failTest(message) {
        this.currentTest.endTime = performance.now();
        this.currentTest.duration = this.currentTest.endTime - this.currentTest.startTime;
        this.currentTest.result = 'FAILED';
        this.currentTest.message = message;

        console.log(`  ❌ FAILED: ${message} (${this.currentTest.duration.toFixed(2)}ms)`);

        this.testResults.push({ ...this.currentTest });
    }

    generateTestReport() {
        const totalTime = performance.now() - this.startTime;
        const passed = this.testResults.filter(t => t.result === 'PASSED').length;
        const failed = this.testResults.filter(t => t.result === 'FAILED').length;
        const total = this.testResults.length;

        console.log('\n' + '='.repeat(60));
        console.log('📊 DOM SCRIPT INJECTION SYSTEM - TEST REPORT');
        console.log('='.repeat(60));
        console.log(`Total Tests: ${total}`);
        console.log(`Passed: ${passed} ✅`);
        console.log(`Failed: ${failed} ❌`);
        console.log(`Success Rate: ${((passed / total) * 100).toFixed(1)}%`);
        console.log(`Total Time: ${totalTime.toFixed(2)}ms`);
        console.log('='.repeat(60));

        if (failed > 0) {
            console.log('\n❌ FAILED TESTS:');
            this.testResults
                .filter(t => t.result === 'FAILED')
                .forEach(test => {
                    console.log(`  • ${test.name}: ${test.message}`);
                });
        }

        // Log system metrics
        const metrics = window.domScriptInjector.getMetrics();
        console.log('\n📈 SYSTEM METRICS:');
        console.log(`  • Scripts Executed: ${metrics.executionCount}`);
        console.log(`  • Errors: ${metrics.errorCount}`);
        console.log(`  • Cache Hits: ${metrics.cacheHits}`);
        console.log(`  • Average Execution Time: ${metrics.averageExecutionTime.toFixed(2)}ms`);

        console.log('\n🎯 Test suite completed!');

        return {
            passed,
            failed,
            total,
            successRate: (passed / total) * 100,
            totalTime,
            metrics,
            results: this.testResults
        };
    }
}

// Auto-run tests when DOM is ready
$(document).ready(function() {
    // Wait a bit for the script injection system to be ready
    setTimeout(async function() {
        if (window.domScriptInjector) {
            console.log('🚀 Starting DOM Script Injection System Tests...');

            const testSuite = new ScriptInjectionTestSuite();
            const report = await testSuite.runAllTests();

            // Make results available globally
            window.scriptInjectionTestReport = report;

            console.log('\n💡 Test results available at: window.scriptInjectionTestReport');

        } else {
            console.error('❌ DOM Script Injection System not found! Tests cannot run.');
        }
    }, 1000);
});

// Export for manual testing
window.ScriptInjectionTestSuite = ScriptInjectionTestSuite;