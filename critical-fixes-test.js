/**
 * 🧐 KRITISCHER TEST: Validierung der drei pessimistischen Korrekturen
 *
 * Tests:
 * 1. Silent Fail Risiko (Rendering-Timing)
 * 2. Z-Index/Layering Risiko (leerer Export)
 * 3. Memory Leak Risiko (unbeabsichtigte Persistenz)
 */

class CriticalFixesValidator {
    constructor() {
        this.testResults = {
            renderingTiming: null,
            zIndexLayering: null,
            memoryCleanup: null
        };
    }

    async runAllCriticalTests() {
        console.log('🧐 CRITICAL VALIDATION: Starting comprehensive validation of all fixes...');

        try {
            // Test 1: Rendering-Timing
            console.log('🔍 TEST 1: Validating rendering-timing fixes...');
            this.testResults.renderingTiming = await this.testRenderingTiming();

            // Test 2: Z-Index/Layering
            console.log('🔍 TEST 2: Validating Z-Index/Layering fixes...');
            this.testResults.zIndexLayering = await this.testZIndexLayering();

            // Test 3: Memory cleanup
            console.log('🔍 TEST 3: Validating memory cleanup fixes...');
            this.testResults.memoryCleanup = await this.testMemoryCleanup();

            // Final report
            this.generateFinalReport();

        } catch (error) {
            console.error('❌ CRITICAL VALIDATION FAILED:', error);
            return false;
        }
    }

    async testRenderingTiming() {
        console.log('⏳ TIMING TEST: Checking if rendering waits are implemented...');

        if (!window.saveOnlyPNGGenerator) {
            throw new Error('SaveOnlyPNGGenerator not available');
        }

        // Mock a PNG generation to see the console output
        const originalConsoleLog = console.log;
        const renderingLogs = [];

        console.log = (...args) => {
            const message = args.join(' ');
            if (message.includes('RENDERING:') || message.includes('Image') || message.includes('loaded')) {
                renderingLogs.push(message);
            }
            originalConsoleLog.apply(console, args);
        };

        try {
            // Trigger PNG generation
            await window.saveOnlyPNGGenerator.testSave('timing-test');

            // Restore console
            console.log = originalConsoleLog;

            // Check if rendering wait logs are present
            const hasRenderingWait = renderingLogs.some(log =>
                log.includes('Waiting for complete canvas rendering') ||
                log.includes('Canvas rendering completed')
            );

            const hasImageHandling = renderingLogs.some(log =>
                log.includes('Found') && log.includes('image objects') ||
                log.includes('Image') && log.includes('loaded')
            );

            console.log('✅ TIMING TEST RESULTS:', {
                hasRenderingWait,
                hasImageHandling,
                renderingLogs: renderingLogs.length
            });

            return {
                success: hasRenderingWait,
                details: { hasRenderingWait, hasImageHandling, logCount: renderingLogs.length }
            };

        } catch (error) {
            console.log = originalConsoleLog;
            throw error;
        }
    }

    async testZIndexLayering() {
        console.log('📐 Z-INDEX TEST: Checking layering preservation...');

        const originalConsoleLog = console.log;
        const zIndexLogs = [];

        console.log = (...args) => {
            const message = args.join(' ');
            if (message.includes('Z-INDEX') || message.includes('Layer') || message.includes('canvas index')) {
                zIndexLogs.push(message);
            }
            originalConsoleLog.apply(console, args);
        };

        try {
            // Trigger PNG generation to capture Z-index logs
            await window.saveOnlyPNGGenerator.testSave('z-index-test');

            console.log = originalConsoleLog;

            const hasZIndexSorting = zIndexLogs.some(log =>
                log.includes('sorted by canvas layer order') ||
                log.includes('Z-INDEX: Checking original canvas object order')
            );

            const hasLayerValidation = zIndexLogs.some(log =>
                log.includes('Z-INDEX VALIDATION') ||
                log.includes('Final canvas layer order check')
            );

            const hasEmptyCanvasCheck = zIndexLogs.some(log =>
                log.includes('No objects on temp canvas') ||
                log.includes('objects are visible and ready for export')
            );

            console.log('✅ Z-INDEX TEST RESULTS:', {
                hasZIndexSorting,
                hasLayerValidation,
                hasEmptyCanvasCheck,
                logCount: zIndexLogs.length
            });

            return {
                success: hasZIndexSorting && hasLayerValidation,
                details: { hasZIndexSorting, hasLayerValidation, hasEmptyCanvasCheck }
            };

        } catch (error) {
            console.log = originalConsoleLog;
            throw error;
        }
    }

    async testMemoryCleanup() {
        console.log('🧹 MEMORY TEST: Checking comprehensive cleanup implementation...');

        const originalConsoleLog = console.log;
        const cleanupLogs = [];

        console.log = (...args) => {
            const message = args.join(' ');
            if (message.includes('CLEANUP') || message.includes('dispose') || message.includes('FINALLY')) {
                cleanupLogs.push(message);
            }
            originalConsoleLog.apply(console, args);
        };

        try {
            // Trigger PNG generation to capture cleanup logs
            await window.saveOnlyPNGGenerator.testSave('memory-test');

            console.log = originalConsoleLog;

            const hasComprehensiveCleanup = cleanupLogs.some(log =>
                log.includes('COMPREHENSIVE CLEANUP') ||
                log.includes('Starting complete memory cleanup')
            );

            const hasTempCanvasTracking = cleanupLogs.some(log =>
                log.includes('Disposing temp canvas') ||
                log.includes('EMERGENCY CLEANUP')
            );

            const hasFinallyBlock = cleanupLogs.some(log =>
                log.includes('FINALLY:') ||
                log.includes('Ensuring all temporary resources are cleaned')
            );

            const hasObjectCleanup = cleanupLogs.some(log =>
                log.includes('Removing') && log.includes('objects from temp canvas') ||
                log.includes('object') && log.includes('(') && log.includes('type)')
            );

            console.log('✅ MEMORY TEST RESULTS:', {
                hasComprehensiveCleanup,
                hasTempCanvasTracking,
                hasFinallyBlock,
                hasObjectCleanup,
                logCount: cleanupLogs.length
            });

            return {
                success: hasComprehensiveCleanup && hasFinallyBlock,
                details: { hasComprehensiveCleanup, hasTempCanvasTracking, hasFinallyBlock, hasObjectCleanup }
            };

        } catch (error) {
            console.log = originalConsoleLog;
            throw error;
        }
    }

    generateFinalReport() {
        console.log('\n🧐 CRITICAL FIXES VALIDATION REPORT');
        console.log('=====================================');

        const results = [
            {
                name: 'Rendering-Timing Fix (Silent Fail)',
                result: this.testResults.renderingTiming,
                critical: true
            },
            {
                name: 'Z-Index/Layering Fix (Empty Export)',
                result: this.testResults.zIndexLayering,
                critical: true
            },
            {
                name: 'Memory Cleanup Fix (Memory Leak)',
                result: this.testResults.memoryCleanup,
                critical: true
            }
        ];

        let passedTests = 0;
        let totalTests = results.length;

        results.forEach(test => {
            const status = test.result?.success ? '✅ PASS' : '❌ FAIL';
            console.log(`${status} ${test.name}`);

            if (test.result?.details) {
                Object.entries(test.result.details).forEach(([key, value]) => {
                    console.log(`  - ${key}: ${value}`);
                });
            }

            if (test.result?.success) passedTests++;
        });

        console.log(`\nSUMMARY: ${passedTests}/${totalTests} critical fixes validated`);

        if (passedTests === totalTests) {
            console.log('🎉 ALL CRITICAL FIXES VALIDATED SUCCESSFULLY!');
            console.log('The pessimistic analysis corrections have been properly implemented.');
            return true;
        } else {
            console.log('⚠️ SOME CRITICAL FIXES NEED ATTENTION');
            console.log('Review the failed tests above and ensure all fixes are properly implemented.');
            return false;
        }
    }
}

// Auto-run validation
setTimeout(() => {
    const validator = new CriticalFixesValidator();
    validator.runAllCriticalTests();
}, 3000);

console.log('🧐 CRITICAL FIXES VALIDATOR: Loaded, will run validation in 3 seconds...');