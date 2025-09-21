#!/usr/bin/env node

/**
 * TEST RUNNER - Finales Test-Setup Management
 * Startet und verwaltet alle Test-Suites mit verschiedenen Modi
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

class TestRunner {
    constructor() {
        this.testResults = [];
        this.availableTests = {
            'production-simulator': {
                file: 'production-test-simulator.js',
                description: 'Race Condition Detection in Production Environment'
            },
            'comprehensive-suite': {
                file: 'comprehensive-test-suite.js',
                description: 'Complete Test Coverage of All WordPress Scenarios'
            },
            'race-condition-direct': {
                file: 'test-race-condition-direct.js',
                description: 'Direct Race Condition Reproduction Test'
            }
        };

        console.log('🎯 TEST RUNNER - Final Test Setup Management');
        console.log('============================================');
    }

    async runAllTests() {
        console.log('🚀 Running all available tests...\n');

        for (const [testName, testInfo] of Object.entries(this.availableTests)) {
            console.log(`📋 Starting test: ${testName}`);
            console.log(`   Description: ${testInfo.description}`);
            console.log(`   File: ${testInfo.file}\n`);

            const result = await this.runSingleTest(testName, testInfo.file);
            this.testResults.push({
                testName: testName,
                file: testInfo.file,
                description: testInfo.description,
                ...result
            });

            console.log(`\n${result.success ? '✅' : '❌'} Test ${testName} ${result.success ? 'PASSED' : 'FAILED'}\n`);
            console.log('─'.repeat(60) + '\n');
        }

        this.generateConsolidatedReport();
    }

    async runSingleTest(testName, testFile) {
        return new Promise((resolve) => {
            const startTime = Date.now();
            const child = spawn('node', [testFile], {
                stdio: ['inherit', 'pipe', 'pipe']
            });

            let stdout = '';
            let stderr = '';

            child.stdout.on('data', (data) => {
                const output = data.toString();
                stdout += output;
                process.stdout.write(output); // Real-time output
            });

            child.stderr.on('data', (data) => {
                const output = data.toString();
                stderr += output;
                process.stderr.write(output); // Real-time error output
            });

            child.on('close', (code) => {
                const endTime = Date.now();
                const duration = endTime - startTime;

                resolve({
                    success: code === 0,
                    exitCode: code,
                    duration: duration,
                    stdout: stdout,
                    stderr: stderr,
                    timestamp: new Date().toISOString()
                });
            });

            child.on('error', (error) => {
                resolve({
                    success: false,
                    exitCode: -1,
                    duration: Date.now() - startTime,
                    error: error.message,
                    timestamp: new Date().toISOString()
                });
            });
        });
    }

    async runSpecificTest(testName) {
        if (!this.availableTests[testName]) {
            console.error(`❌ Test '${testName}' not found.`);
            console.log(`Available tests: ${Object.keys(this.availableTests).join(', ')}`);
            return false;
        }

        const testInfo = this.availableTests[testName];
        console.log(`🧪 Running specific test: ${testName}`);
        console.log(`   Description: ${testInfo.description}\n`);

        const result = await this.runSingleTest(testName, testInfo.file);

        console.log(`\n${result.success ? '✅' : '❌'} Test ${testName} ${result.success ? 'PASSED' : 'FAILED'}`);
        console.log(`   Duration: ${result.duration}ms`);

        return result.success;
    }

    generateConsolidatedReport() {
        console.log('\n🎯 CONSOLIDATED TEST REPORT');
        console.log('============================\n');

        const totalTests = this.testResults.length;
        const passedTests = this.testResults.filter(r => r.success).length;
        const failedTests = totalTests - passedTests;

        console.log(`📊 Test Summary:`);
        console.log(`   Total Tests: ${totalTests}`);
        console.log(`   Passed: ${passedTests} ✅`);
        console.log(`   Failed: ${failedTests} ❌`);
        console.log(`   Success Rate: ${Math.round((passedTests / totalTests) * 100)}%\n`);

        console.log(`⏱️ Timing Analysis:`);
        this.testResults.forEach(result => {
            const status = result.success ? '✅' : '❌';
            console.log(`   ${status} ${result.testName}: ${result.duration}ms`);
        });

        console.log(`\n🎯 Issue Analysis:`);
        const failedTestResults = this.testResults.filter(r => !r.success);

        if (failedTestResults.length === 0) {
            console.log(`   🎉 No issues detected - All tests passed!`);
        } else {
            console.log(`   ⚠️ Issues detected in ${failedTestResults.length} test(s):`);

            failedTestResults.forEach(result => {
                console.log(`   ❌ ${result.testName}:`);
                console.log(`      Description: ${result.description}`);
                console.log(`      Exit Code: ${result.exitCode}`);

                // Try to extract key error information
                if (result.stdout && result.stdout.includes('RACE CONDITION')) {
                    console.log(`      🏁 Race conditions detected`);
                }
                if (result.stdout && result.stdout.includes('FAILED')) {
                    console.log(`      🚫 Test failures detected`);
                }
                if (result.stderr) {
                    console.log(`      🐛 Errors: ${result.stderr.substring(0, 100)}...`);
                }
            });
        }

        console.log(`\n💡 Recommendations:`);

        const hasRaceConditions = this.testResults.some(r =>
            r.stdout && r.stdout.includes('Race Conditions detected')
        );

        const hasTimingIssues = this.testResults.some(r =>
            r.stdout && r.stdout.includes('Timing Issues')
        );

        const hasCriticalErrors = this.testResults.some(r =>
            r.exitCode !== 0 && r.exitCode !== 1
        );

        if (hasRaceConditions) {
            console.log(`   🏁 HIGH PRIORITY: Fix DOMContentLoaded race conditions`);
            console.log(`      - Implement polling-based canvas detection`);
            console.log(`      - Add retry mechanism with exponential backoff`);
        }

        if (hasTimingIssues) {
            console.log(`   ⏰ MEDIUM PRIORITY: Optimize timing and performance`);
            console.log(`      - Review script loading order`);
            console.log(`      - Add performance monitoring`);
        }

        if (hasCriticalErrors) {
            console.log(`   🚨 CRITICAL: Fix code errors`);
            console.log(`      - Review error logs`);
            console.log(`      - Add comprehensive error handling`);
        }

        if (passedTests === totalTests) {
            console.log(`   🎉 All tests passed - System is ready for production!`);
        }

        // Save consolidated report
        const report = {
            timestamp: new Date().toISOString(),
            summary: {
                totalTests,
                passedTests,
                failedTests,
                successRate: Math.round((passedTests / totalTests) * 100)
            },
            results: this.testResults,
            analysis: {
                hasRaceConditions,
                hasTimingIssues,
                hasCriticalErrors
            }
        };

        const reportFile = `consolidated-test-report-${Date.now()}.json`;
        try {
            fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
            console.log(`\n📄 Detailed report saved: ${reportFile}`);
        } catch (error) {
            console.error(`❌ Failed to save report: ${error.message}`);
        }

        console.log(`\n${'='.repeat(60)}`);
        console.log(`🎯 Test Runner completed`);
        console.log(`   Overall Status: ${passedTests === totalTests ? 'PASSED ✅' : 'FAILED ❌'}`);
        console.log(`${'='.repeat(60)}\n`);

        return passedTests === totalTests;
    }

    showAvailableTests() {
        console.log('📋 Available Tests:');
        console.log('===================\n');

        Object.entries(this.availableTests).forEach(([testName, testInfo]) => {
            console.log(`🧪 ${testName}`);
            console.log(`   File: ${testInfo.file}`);
            console.log(`   Description: ${testInfo.description}\n`);
        });

        console.log('Usage:');
        console.log('  node test-runner.js                    # Run all tests');
        console.log('  node test-runner.js [test-name]        # Run specific test');
        console.log('  node test-runner.js --list             # Show available tests');
    }

    async run() {
        const args = process.argv.slice(2);

        if (args.includes('--list') || args.includes('-l')) {
            this.showAvailableTests();
            return true;
        }

        if (args.length === 0) {
            // Run all tests
            const success = await this.runAllTests();
            process.exit(success ? 0 : 1);
        } else {
            // Run specific test
            const testName = args[0];
            const success = await this.runSpecificTest(testName);
            process.exit(success ? 0 : 1);
        }
    }
}

// Main execution
if (require.main === module) {
    const runner = new TestRunner();
    runner.run().catch(error => {
        console.error('❌ Test runner failed:', error);
        process.exit(1);
    });
}

module.exports = TestRunner;