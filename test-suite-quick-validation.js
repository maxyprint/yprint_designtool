/**
 * Quick Validation Script for Test Suite
 *
 * This script validates that all test suite components are properly loaded
 * and ready to use. Run this first before running the full test suite.
 *
 * Usage in Browser Console:
 *   Copy and paste this entire file into console, or run:
 *   validateTestSuite();
 */

function validateTestSuite() {
    console.log('%c🔍 Test Suite Validation', 'font-size: 18px; font-weight: bold; color: #0073aa;');
    console.log('='.repeat(80));
    console.log('');

    const results = {
        total: 0,
        passed: 0,
        failed: 0,
        checks: []
    };

    /**
     * Helper function to check and report
     */
    function check(name, condition, details = '') {
        results.total++;
        const status = condition ? 'PASS' : 'FAIL';

        if (condition) {
            results.passed++;
            console.log('%c  ✅ ' + name, 'color: #16a34a;');
        } else {
            results.failed++;
            console.log('%c  ❌ ' + name, 'color: #dc2626;');
        }

        if (details) {
            console.log('      ' + details);
        }

        results.checks.push({ name, status, details });
        return condition;
    }

    console.log('%c1. Core System Components', 'font-weight: bold; color: #2563eb;');
    console.log('-'.repeat(80));

    // Check WooCommerceOrderPreview
    check(
        'WooCommerceOrderPreview class exists',
        typeof window.WooCommerceOrderPreview === 'function',
        'Required for order preview integration'
    );

    check(
        'WooCommerceOrderPreview instance exists',
        window.wooCommerceOrderPreview !== undefined,
        'Global instance: window.wooCommerceOrderPreview'
    );

    // Check DesignPreviewGenerator
    check(
        'DesignPreviewGenerator class exists',
        typeof window.DesignPreviewGenerator === 'function',
        'Required for design data processing'
    );

    // Check AdminCanvasRenderer
    check(
        'AdminCanvasRenderer class exists',
        typeof window.AdminCanvasRenderer === 'function',
        'Required for canvas rendering'
    );

    console.log('');
    console.log('%c2. Test Suite Components', 'font-weight: bold; color: #2563eb;');
    console.log('-'.repeat(80));

    // Check test suite
    check(
        'WCOrderPreviewTestSuite class exists',
        typeof window.WCOrderPreviewTestSuite === 'function',
        'Load: admin/js/order-preview-test-suite.js'
    );

    if (typeof window.WCOrderPreviewTestSuite === 'function') {
        check(
            'Test suite has runAllTests method',
            typeof WCOrderPreviewTestSuite.runAllTests === 'function',
            'Command: WCOrderPreviewTestSuite.runAllTests()'
        );

        check(
            'Test suite has benchmarkRender method',
            typeof WCOrderPreviewTestSuite.benchmarkRender === 'function',
            'Command: WCOrderPreviewTestSuite.benchmarkRender(orderId)'
        );
    }

    // Check test data
    check(
        'WCOrderPreviewTestData exists',
        typeof window.WCOrderPreviewTestData === 'object',
        'Load: test-data-fixtures.js'
    );

    if (typeof window.WCOrderPreviewTestData === 'object') {
        check(
            'Test data has valid designs',
            window.WCOrderPreviewTestData.valid !== undefined,
            'Access: WCOrderPreviewTestData.valid.simpleDesign'
        );

        check(
            'Test data has edge cases',
            window.WCOrderPreviewTestData.edgeCases !== undefined,
            'Access: WCOrderPreviewTestData.edgeCases'
        );

        check(
            'Test data has error cases',
            window.WCOrderPreviewTestData.errors !== undefined,
            'Access: WCOrderPreviewTestData.errors'
        );
    }

    console.log('');
    console.log('%c3. System Initialization', 'font-weight: bold; color: #2563eb;');
    console.log('-'.repeat(80));

    if (window.wooCommerceOrderPreview) {
        const status = window.wooCommerceOrderPreview.getStatus();

        check(
            'System is initialized',
            status.initialized === true,
            'Status: ' + (status.initialized ? 'Initialized' : 'Not initialized')
        );

        check(
            'Configuration exists',
            status.config !== undefined,
            'Has timeout, retry, and error recovery settings'
        );

        check(
            'Render queue exists',
            typeof status.renderQueueSize === 'number',
            'Current queue size: ' + status.renderQueueSize
        );

        check(
            'Preview instances map exists',
            typeof status.previewInstanceCount === 'number',
            'Current instance count: ' + status.previewInstanceCount
        );

        // Only check page detection if on admin
        if (window.location.pathname.includes('/wp-admin/')) {
            const isWCPage = window.wooCommerceOrderPreview.isWooCommerceOrderPage();
            check(
                'Page detection working',
                typeof isWCPage === 'boolean',
                'Is WC Order Page: ' + (isWCPage ? 'Yes' : 'No')
            );
        }
    }

    console.log('');
    console.log('%c4. Browser Capabilities', 'font-weight: bold; color: #2563eb;');
    console.log('-'.repeat(80));

    // Check Canvas API
    check(
        'Canvas API available',
        typeof HTMLCanvasElement !== 'undefined',
        'Browser supports HTML5 Canvas'
    );

    if (typeof HTMLCanvasElement !== 'undefined') {
        const testCanvas = document.createElement('canvas');
        check(
            'Canvas 2D context available',
            testCanvas.getContext('2d') !== null,
            'Canvas rendering is supported'
        );
    }

    // Check Custom Events
    check(
        'CustomEvent API available',
        typeof CustomEvent === 'function',
        'Browser supports custom events'
    );

    // Check Performance API
    check(
        'Performance API available',
        typeof performance !== 'undefined' && typeof performance.now === 'function',
        'Performance monitoring is available'
    );

    // Check Memory API (Chrome only)
    const hasMemoryAPI = performance.memory !== undefined;
    check(
        'Memory API available (Chrome)',
        true, // Don't fail on this
        hasMemoryAPI ? 'Available (Chrome)' : 'Not available (Firefox/Safari - OK)'
    );

    // Check Mutation Observer
    check(
        'MutationObserver API available',
        typeof MutationObserver === 'function',
        'DOM change detection is supported'
    );

    console.log('');
    console.log('%c5. WordPress/WooCommerce Environment', 'font-weight: bold; color: #2563eb;');
    console.log('-'.repeat(80));

    // Check jQuery (optional)
    check(
        'jQuery available (optional)',
        typeof jQuery === 'function',
        jQuery ? 'Version: ' + jQuery.fn.jquery : 'Not loaded (OK - not required)'
    );

    // Check ajaxurl
    check(
        'ajaxurl defined',
        typeof ajaxurl !== 'undefined',
        'Required for AJAX requests: ' + (typeof ajaxurl !== 'undefined' ? ajaxurl : 'NOT FOUND')
    );

    // Check WordPress admin
    check(
        'WordPress admin detected',
        document.body.classList.contains('wp-admin') ||
        window.location.pathname.includes('/wp-admin/') ||
        document.getElementById('wpadminbar') !== null,
        'Running in WordPress admin context'
    );

    console.log('');
    console.log('%c6. File Availability Check', 'font-weight: bold; color: #2563eb;');
    console.log('-'.repeat(80));

    // List expected files
    const expectedFiles = [
        'admin/js/woocommerce-order-preview.js',
        'admin/js/design-preview-generator.js',
        'admin/js/admin-canvas-renderer.js',
        'admin/js/order-preview-test-suite.js',
        'test-data-fixtures.js'
    ];

    console.log('  Expected files (check manually if loaded):');
    expectedFiles.forEach(file => {
        console.log('    - ' + file);
    });

    console.log('');
    console.log('='.repeat(80));
    console.log('%c📊 Validation Summary', 'font-size: 16px; font-weight: bold; color: #0073aa;');
    console.log('='.repeat(80));
    console.log('');
    console.log('  Total Checks: ', results.total);
    console.log('%c  ✅ Passed:    ', 'color: #16a34a;', results.passed);
    console.log('%c  ❌ Failed:    ', 'color: #dc2626;', results.failed);
    console.log('');

    const passRate = results.total > 0 ? ((results.passed / results.total) * 100).toFixed(1) : 0;
    console.log('  Pass Rate:    ' + passRate + '%');
    console.log('');

    if (results.failed === 0) {
        console.log('%c  🎉 ALL CHECKS PASSED!', 'font-size: 14px; font-weight: bold; color: #16a34a; background: #f0fdf4; padding: 4px 8px;');
        console.log('');
        console.log('%c  Ready to run tests:', 'font-weight: bold;');
        console.log('    WCOrderPreviewTestSuite.runAllTests()');
    } else {
        console.log('%c  ⚠️  SOME CHECKS FAILED', 'font-size: 14px; font-weight: bold; color: #dc2626; background: #fef2f2; padding: 4px 8px;');
        console.log('');
        console.log('  Failed checks:');
        results.checks
            .filter(c => c.status === 'FAIL')
            .forEach(c => {
                console.log('    - ' + c.name);
                if (c.details) console.log('      ' + c.details);
            });
        console.log('');
        console.log('%c  Action Required:', 'font-weight: bold;');
        console.log('    1. Load missing JavaScript files');
        console.log('    2. Ensure you are on a WooCommerce order page');
        console.log('    3. Check browser console for errors');
        console.log('    4. Refer to WOOCOMMERCE-ORDER-PREVIEW-TESTING.md');
    }

    console.log('');
    console.log('='.repeat(80));

    return results;
}

/**
 * Quick system status check
 */
function quickStatus() {
    console.log('%c🔍 Quick Status Check', 'font-size: 16px; font-weight: bold; color: #0073aa;');
    console.log('');

    if (window.wooCommerceOrderPreview) {
        const status = window.wooCommerceOrderPreview.getStatus();
        console.log('System Status:', status);
        console.log('');
        console.log('Key Metrics:');
        console.log('  - Initialized:', status.initialized ? '✅' : '❌');
        console.log('  - Is WC Order Page:', status.isWooCommerceOrderPage ? '✅' : '❌');
        console.log('  - Preview Instances:', status.previewInstanceCount);
        console.log('  - Render Queue Size:', status.renderQueueSize);
        console.log('  - Currently Processing:', status.isProcessing ? 'Yes' : 'No');
    } else {
        console.log('❌ WooCommerceOrderPreview not initialized');
        console.log('   Load: admin/js/woocommerce-order-preview.js');
    }
}

/**
 * List available test commands
 */
function listTestCommands() {
    console.log('%c📋 Available Test Commands', 'font-size: 16px; font-weight: bold; color: #0073aa;');
    console.log('');
    console.log('%cValidation:', 'font-weight: bold;');
    console.log('  validateTestSuite()                     - Run validation checks');
    console.log('  quickStatus()                           - Quick system status');
    console.log('');
    console.log('%cTest Execution:', 'font-weight: bold;');
    console.log('  WCOrderPreviewTestSuite.runAllTests()   - Run all tests');
    console.log('  WCOrderPreviewTestSuite.testEventSystem()        - Test events');
    console.log('  WCOrderPreviewTestSuite.testDataValidation()     - Test data validation');
    console.log('  WCOrderPreviewTestSuite.testCanvasRendering()    - Test rendering');
    console.log('  WCOrderPreviewTestSuite.testErrorHandling()      - Test errors');
    console.log('  WCOrderPreviewTestSuite.testPerformance()        - Test performance');
    console.log('  WCOrderPreviewTestSuite.testSecurity()           - Test security');
    console.log('');
    console.log('%cPerformance:', 'font-weight: bold;');
    console.log('  WCOrderPreviewTestSuite.benchmarkRender(123)     - Benchmark order 123');
    console.log('');
    console.log('%cSystem:', 'font-weight: bold;');
    console.log('  window.wooCommerceOrderPreview.getStatus()       - Get system status');
    console.log('  window.orderDesignData                           - View design data');
    console.log('');
    console.log('%cTest Data:', 'font-weight: bold;');
    console.log('  WCOrderPreviewTestData.valid.simpleDesign        - Valid test design');
    console.log('  WCOrderPreviewTestData.errors.missingCanvas      - Error test case');
    console.log('  WCOrderPreviewTestData.performance.manyImages    - Performance test');
}

// Auto-run validation on load
console.log('%c✅ Test Suite Validation Script Loaded', 'color: #16a34a; font-weight: bold;');
console.log('');
console.log('Commands:');
console.log('  validateTestSuite()   - Run validation checks');
console.log('  quickStatus()         - Quick system status');
console.log('  listTestCommands()    - List all available commands');
console.log('');

// Export functions
if (typeof window !== 'undefined') {
    window.validateTestSuite = validateTestSuite;
    window.quickStatus = quickStatus;
    window.listTestCommands = listTestCommands;
}

// Auto-run if flag is set
if (typeof window !== 'undefined' && window.AUTO_RUN_VALIDATION) {
    validateTestSuite();
}
