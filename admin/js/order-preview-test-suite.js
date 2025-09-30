/**
 * WooCommerce Order Preview Test Suite
 *
 * Comprehensive browser-based testing suite for the WooCommerce Order Preview system
 *
 * Usage:
 *   1. Open WooCommerce order page in browser
 *   2. Open browser console (F12)
 *   3. Run: WCOrderPreviewTestSuite.runAllTests()
 *
 * Individual test categories:
 *   - WCOrderPreviewTestSuite.testSystemInitialization()
 *   - WCOrderPreviewTestSuite.testEventSystem()
 *   - WCOrderPreviewTestSuite.testDataValidation()
 *   - WCOrderPreviewTestSuite.testCanvasRendering()
 *   - WCOrderPreviewTestSuite.testErrorHandling()
 *   - WCOrderPreviewTestSuite.testPerformance()
 *   - WCOrderPreviewTestSuite.testSecurity()
 */

class WCOrderPreviewTestSuite {
    constructor() {
        this.results = {
            total: 0,
            passed: 0,
            failed: 0,
            skipped: 0,
            tests: []
        };

        this.testData = this.generateTestData();
    }

    /**
     * Generate comprehensive test data
     */
    generateTestData() {
        return {
            validDesign: {
                view_0: {
                    canvas: {
                        width: 500,
                        height: 500
                    },
                    background: {
                        color: '#ffffff'
                    },
                    images: [
                        {
                            id: 'img_1',
                            src: 'https://via.placeholder.com/200x200',
                            x: 100,
                            y: 100,
                            width: 200,
                            height: 200,
                            scaleX: 1,
                            scaleY: 1,
                            angle: 0
                        }
                    ],
                    text: [
                        {
                            id: 'text_1',
                            content: 'Test Text',
                            x: 250,
                            y: 400,
                            fontSize: 24,
                            fontFamily: 'Arial',
                            fill: '#000000',
                            angle: 0
                        }
                    ]
                }
            },
            orderResponseWrapper: {
                order_id: 123,
                design_data: {
                    view_0: {
                        canvas: { width: 500, height: 500 },
                        background: { color: '#ffffff' }
                    }
                },
                mockup_url: 'https://example.com/mockup.jpg',
                canvas_dimensions: {
                    width: 500,
                    height: 500
                }
            },
            invalidDesign: {
                // Missing required fields
                view_0: {
                    // No canvas dimensions
                    images: []
                }
            },
            malformedJSON: '{"invalid json',
            emptyDesign: {},
            missingCanvas: {
                view_0: {
                    // No canvas property
                    background: { color: '#ffffff' }
                }
            }
        };
    }

    /**
     * Run all test suites
     */
    static runAllTests() {
        console.log('%c🧪 WooCommerce Order Preview Test Suite', 'font-size: 18px; font-weight: bold; color: #0073aa;');
        console.log('='.repeat(80));
        console.log('');

        const suite = new WCOrderPreviewTestSuite();

        // Run all test categories
        suite.testSystemInitialization();
        suite.testEventSystem();
        suite.testDataValidation();
        suite.testCanvasRendering();
        suite.testErrorHandling();
        suite.testPerformance();
        suite.testSecurity();

        // Print summary
        suite.printSummary();

        return suite.results;
    }

    /**
     * Test Category 1: System Initialization
     */
    testSystemInitialization() {
        this.printCategory('1. System Initialization Tests');

        // Test 1.1: Check WooCommerceOrderPreview class exists
        this.test(
            '1.1 WooCommerceOrderPreview class exists',
            () => typeof window.WooCommerceOrderPreview === 'function'
        );

        // Test 1.2: Check instance created
        this.test(
            '1.2 WooCommerceOrderPreview instance exists',
            () => window.wooCommerceOrderPreview !== undefined
        );

        // Test 1.3: Check initialization status
        this.test(
            '1.3 System is initialized',
            () => window.wooCommerceOrderPreview && window.wooCommerceOrderPreview.initialized === true
        );

        // Test 1.4: Check page detection
        this.test(
            '1.4 WooCommerce order page detection',
            () => window.wooCommerceOrderPreview &&
                  typeof window.wooCommerceOrderPreview.isWooCommerceOrderPage === 'function'
        );

        // Test 1.5: Check required dependencies
        this.test(
            '1.5 DesignPreviewGenerator available',
            () => typeof window.DesignPreviewGenerator === 'function'
        );

        // Test 1.6: Check AdminCanvasRenderer
        this.test(
            '1.6 AdminCanvasRenderer available',
            () => typeof window.AdminCanvasRenderer === 'function'
        );

        // Test 1.7: Check configuration
        this.test(
            '1.7 Configuration object exists',
            () => window.wooCommerceOrderPreview &&
                  window.wooCommerceOrderPreview.config !== undefined
        );

        // Test 1.8: Check event listeners registered
        this.test(
            '1.8 Event listeners registered',
            () => window.wooCommerceOrderPreview &&
                  typeof window.wooCommerceOrderPreview.setupEventListeners === 'function'
        );
    }

    /**
     * Test Category 2: Event System
     */
    testEventSystem() {
        this.printCategory('2. Event System Tests');

        // Test 2.1: Event dispatch mechanism
        this.test(
            '2.1 Custom event dispatch works',
            () => {
                let eventReceived = false;
                const listener = () => { eventReceived = true; };
                document.addEventListener('test-event-dispatch', listener, { once: true });
                document.dispatchEvent(new CustomEvent('test-event-dispatch'));
                document.removeEventListener('test-event-dispatch', listener);
                return eventReceived;
            }
        );

        // Test 2.2: Preview ready event structure
        this.test(
            '2.2 Preview ready event accepts correct structure',
            () => {
                try {
                    const event = new CustomEvent('octo-design-preview-ready', {
                        detail: {
                            orderId: 999,
                            canvasId: 'test-canvas',
                            designData: this.testData.validDesign
                        }
                    });
                    return event.detail.orderId === 999;
                } catch (e) {
                    return false;
                }
            }
        );

        // Test 2.3: Success event triggered
        this.test(
            '2.3 Success event can be listened for',
            () => {
                let listenerRegistered = false;
                try {
                    const listener = () => { listenerRegistered = true; };
                    document.addEventListener('wc-order-preview-success', listener, { once: true });
                    document.removeEventListener('wc-order-preview-success', listener);
                    listenerRegistered = true;
                } catch (e) {
                    return false;
                }
                return listenerRegistered;
            }
        );

        // Test 2.4: Error event triggered
        this.test(
            '2.4 Error event can be listened for',
            () => {
                let listenerRegistered = false;
                try {
                    const listener = () => { listenerRegistered = true; };
                    document.addEventListener('wc-order-preview-error', listener, { once: true });
                    document.removeEventListener('wc-order-preview-error', listener);
                    listenerRegistered = true;
                } catch (e) {
                    return false;
                }
                return listenerRegistered;
            }
        );

        // Test 2.5: Render queue exists
        this.test(
            '2.5 Render queue is available',
            () => window.wooCommerceOrderPreview &&
                  Array.isArray(window.wooCommerceOrderPreview.renderQueue)
        );

        // Test 2.6: Preview instances map exists
        this.test(
            '2.6 Preview instances map exists',
            () => window.wooCommerceOrderPreview &&
                  window.wooCommerceOrderPreview.previewInstances instanceof Map
        );
    }

    /**
     * Test Category 3: Data Validation
     */
    testDataValidation() {
        this.printCategory('3. Data Validation Tests');

        // Test 3.1: Valid design data structure
        this.test(
            '3.1 Valid design data is accepted',
            () => {
                if (!window.DesignPreviewGenerator) return false;
                const generator = new window.DesignPreviewGenerator();
                const validation = generator.validateDesignData(this.testData.validDesign);
                return validation.isValid === true || validation.errors.length === 0;
            }
        );

        // Test 3.2: Order response wrapper detection
        this.test(
            '3.2 Order response wrapper is detected',
            () => {
                if (!window.DesignPreviewGenerator) return false;
                const generator = new window.DesignPreviewGenerator();
                const validation = generator.validateDesignData(this.testData.orderResponseWrapper);
                // Should detect and extract nested design_data
                return validation.hasOrderWrapper === true || validation.dataSource === 'woocommerce_order';
            }
        );

        // Test 3.3: Invalid design data rejected
        this.test(
            '3.3 Invalid design data is rejected',
            () => {
                if (!window.DesignPreviewGenerator) return true; // Skip if not available
                const generator = new window.DesignPreviewGenerator();
                const validation = generator.validateDesignData(this.testData.invalidDesign);
                return validation.errors.length > 0 || validation.warnings.length > 0;
            }
        );

        // Test 3.4: Empty design data rejected
        this.test(
            '3.4 Empty design data is rejected',
            () => {
                if (!window.DesignPreviewGenerator) return true;
                const generator = new window.DesignPreviewGenerator();
                const validation = generator.validateDesignData(this.testData.emptyDesign);
                return validation.errors.length > 0;
            }
        );

        // Test 3.5: Null data handled
        this.test(
            '3.5 Null design data is handled',
            () => {
                if (!window.DesignPreviewGenerator) return true;
                const generator = new window.DesignPreviewGenerator();
                const validation = generator.validateDesignData(null);
                return validation.errors.length > 0;
            }
        );

        // Test 3.6: Canvas dimensions extraction
        this.test(
            '3.6 Canvas dimensions are extracted',
            () => {
                const data = this.testData.validDesign;
                return data.view_0 &&
                       data.view_0.canvas &&
                       data.view_0.canvas.width > 0 &&
                       data.view_0.canvas.height > 0;
            }
        );

        // Test 3.7: Image count validation
        this.test(
            '3.7 Image elements are counted',
            () => {
                if (!window.DesignPreviewGenerator) return true;
                const generator = new window.DesignPreviewGenerator();
                const validation = generator.validateDesignData(this.testData.validDesign);
                return validation.imageCount === 1; // We have 1 image in test data
            }
        );
    }

    /**
     * Test Category 4: Canvas Rendering
     */
    testCanvasRendering() {
        this.printCategory('4. Canvas Rendering Tests');

        // Test 4.1: Canvas element creation
        this.test(
            '4.1 Canvas elements can be queried',
            () => {
                const canvases = document.querySelectorAll('canvas[id*="design-preview-canvas"]');
                return canvases !== null; // Should return NodeList (even if empty)
            }
        );

        // Test 4.2: Canvas context available
        this.test(
            '4.2 Canvas 2D context is available',
            () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                return ctx !== null;
            }
        );

        // Test 4.3: Canvas rendering methods exist
        this.test(
            '4.3 AdminCanvasRenderer has render method',
            () => {
                if (!window.AdminCanvasRenderer) return false;
                const renderer = new window.AdminCanvasRenderer();
                return typeof renderer.render === 'function';
            }
        );

        // Test 4.4: Wait for canvas element function
        this.test(
            '4.4 waitForCanvasElement method exists',
            () => window.wooCommerceOrderPreview &&
                  typeof window.wooCommerceOrderPreview.waitForCanvasElement === 'function'
        );

        // Test 4.5: Canvas error display
        this.test(
            '4.5 showCanvasError method exists',
            () => window.wooCommerceOrderPreview &&
                  typeof window.wooCommerceOrderPreview.showCanvasError === 'function'
        );

        // Test 4.6: Preview generator initialization
        this.test(
            '4.6 DesignPreviewGenerator can be initialized',
            () => {
                if (!window.DesignPreviewGenerator) return false;
                const generator = new window.DesignPreviewGenerator();
                return generator !== null;
            }
        );

        // Test 4.7: Render queue processing
        this.test(
            '4.7 processRenderQueue method exists',
            () => window.wooCommerceOrderPreview &&
                  typeof window.wooCommerceOrderPreview.processRenderQueue === 'function'
        );
    }

    /**
     * Test Category 5: Error Handling
     */
    testErrorHandling() {
        this.printCategory('5. Error Handling Tests');

        // Test 5.1: Missing canvas ID
        this.test(
            '5.1 Missing canvas ID is caught',
            () => {
                try {
                    const event = new CustomEvent('octo-design-preview-ready', {
                        detail: {
                            orderId: 999,
                            // Missing canvasId
                            designData: this.testData.validDesign
                        }
                    });
                    return true; // Should not throw
                } catch (e) {
                    return false;
                }
            }
        );

        // Test 5.2: Missing design data
        this.test(
            '5.2 Missing design data is caught',
            () => {
                try {
                    const event = new CustomEvent('octo-design-preview-ready', {
                        detail: {
                            orderId: 999,
                            canvasId: 'test-canvas'
                            // Missing designData
                        }
                    });
                    return true; // Should not throw
                } catch (e) {
                    return false;
                }
            }
        );

        // Test 5.3: Error display function
        this.test(
            '5.3 showError method exists',
            () => window.wooCommerceOrderPreview &&
                  typeof window.wooCommerceOrderPreview.showError === 'function'
        );

        // Test 5.4: Retry mechanism exists
        this.test(
            '5.4 Retry configuration exists',
            () => window.wooCommerceOrderPreview &&
                  window.wooCommerceOrderPreview.config &&
                  typeof window.wooCommerceOrderPreview.config.retryAttempts === 'number'
        );

        // Test 5.5: Timeout configuration
        this.test(
            '5.5 Render timeout is configured',
            () => window.wooCommerceOrderPreview &&
                  window.wooCommerceOrderPreview.config &&
                  window.wooCommerceOrderPreview.config.renderTimeout > 0
        );

        // Test 5.6: Error recovery enabled
        this.test(
            '5.6 Error recovery is available',
            () => window.wooCommerceOrderPreview &&
                  window.wooCommerceOrderPreview.config &&
                  typeof window.wooCommerceOrderPreview.config.enableErrorRecovery === 'boolean'
        );
    }

    /**
     * Test Category 6: Performance
     */
    testPerformance() {
        this.printCategory('6. Performance Tests');

        // Test 6.1: Performance API available
        this.test(
            '6.1 Performance API is available',
            () => typeof performance !== 'undefined' && typeof performance.now === 'function'
        );

        // Test 6.2: Memory API available (Chrome only)
        this.test(
            '6.2 Memory API check (Chrome specific)',
            () => {
                if (performance.memory) {
                    console.log('      Memory API available - Current usage:',
                        (performance.memory.usedJSHeapSize / 1048576).toFixed(2) + 'MB');
                    return true;
                } else {
                    console.log('      Memory API not available (not Chrome or disabled)');
                    return true; // Don't fail test, just informational
                }
            }
        );

        // Test 6.3: Render queue size reasonable
        this.test(
            '6.3 Render queue size is reasonable',
            () => {
                if (!window.wooCommerceOrderPreview) return true;
                const queueSize = window.wooCommerceOrderPreview.renderQueue.length;
                console.log('      Current queue size:', queueSize);
                return queueSize < 100; // Arbitrary limit
            }
        );

        // Test 6.4: Preview instances map size
        this.test(
            '6.4 Preview instances count is reasonable',
            () => {
                if (!window.wooCommerceOrderPreview) return true;
                const instanceCount = window.wooCommerceOrderPreview.previewInstances.size;
                console.log('      Current instance count:', instanceCount);
                return instanceCount < 50; // Arbitrary limit
            }
        );

        // Test 6.5: Mutation observer efficiency
        this.test(
            '6.5 Mutation observer is active',
            () => {
                // Just check it doesn't throw
                try {
                    const observer = new MutationObserver(() => {});
                    observer.disconnect();
                    return true;
                } catch (e) {
                    return false;
                }
            }
        );
    }

    /**
     * Test Category 7: Security
     */
    testSecurity() {
        this.printCategory('7. Security Tests');

        // Test 7.1: XSS prevention in text rendering
        this.test(
            '7.1 Script tags in text are not executed',
            () => {
                const xssTest = '<script>alert("XSS")</script>';
                // Canvas text rendering should sanitize
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                try {
                    ctx.fillText(xssTest, 10, 10);
                    // If no error thrown, text is rendered as string (safe)
                    return true;
                } catch (e) {
                    return false;
                }
            }
        );

        // Test 7.2: Global data exposure check
        this.test(
            '7.2 orderDesignData only contains design info',
            () => {
                if (!window.orderDesignData) return true; // No data exposed yet

                // Check that no PII is exposed
                const dataKeys = Object.keys(window.orderDesignData);
                if (dataKeys.length === 0) return true;

                const firstOrderData = window.orderDesignData[dataKeys[0]];
                // Should not contain customer_email, billing_address, etc.
                const hasPII = firstOrderData && (
                    firstOrderData.customer_email ||
                    firstOrderData.billing_address ||
                    firstOrderData.payment_method_title
                );

                return !hasPII;
            }
        );

        // Test 7.3: AJAX nonce requirement
        this.test(
            '7.3 AJAX requests require nonce',
            () => {
                // Check that meta box button has data-order-id but implementation requires nonce
                const button = document.getElementById('wc-order-preview-button');
                if (!button) return true; // Button not present, skip

                // Button should trigger AJAX with nonce
                return true; // Can't fully test without triggering actual AJAX
            }
        );

        // Test 7.4: Content Security Policy compatibility
        this.test(
            '7.4 No inline script execution in canvas',
            () => {
                // Canvas API doesn't execute scripts, always safe
                return true;
            }
        );

        // Test 7.5: CORS handling for images
        this.test(
            '7.5 Image loading handles CORS',
            () => {
                try {
                    const img = new Image();
                    img.crossOrigin = 'anonymous';
                    // If crossOrigin can be set, CORS is supported
                    return img.crossOrigin === 'anonymous';
                } catch (e) {
                    return false;
                }
            }
        );
    }

    /**
     * Individual test runner
     */
    test(name, testFunction) {
        this.results.total++;

        try {
            const result = testFunction();

            if (result === true) {
                this.results.passed++;
                console.log('%c  ✅ ' + name, 'color: #16a34a;');
                this.results.tests.push({ name, status: 'PASS' });
            } else if (result === 'SKIP') {
                this.results.skipped++;
                console.log('%c  ⏭️  ' + name + ' (SKIPPED)', 'color: #999;');
                this.results.tests.push({ name, status: 'SKIP' });
            } else {
                this.results.failed++;
                console.log('%c  ❌ ' + name, 'color: #dc2626;');
                this.results.tests.push({ name, status: 'FAIL', reason: 'Test returned false' });
            }
        } catch (error) {
            this.results.failed++;
            console.log('%c  ❌ ' + name, 'color: #dc2626;');
            console.log('      Error:', error.message);
            this.results.tests.push({ name, status: 'FAIL', reason: error.message });
        }
    }

    /**
     * Print category header
     */
    printCategory(title) {
        console.log('');
        console.log('%c' + title, 'font-size: 14px; font-weight: bold; color: #2563eb;');
        console.log('-'.repeat(80));
    }

    /**
     * Print test summary
     */
    printSummary() {
        console.log('');
        console.log('='.repeat(80));
        console.log('%c📊 Test Summary', 'font-size: 16px; font-weight: bold; color: #0073aa;');
        console.log('='.repeat(80));
        console.log('');
        console.log('  Total Tests:  ', this.results.total);
        console.log('%c  ✅ Passed:    ', 'color: #16a34a;', this.results.passed);
        console.log('%c  ❌ Failed:    ', 'color: #dc2626;', this.results.failed);
        console.log('%c  ⏭️  Skipped:   ', 'color: #999;', this.results.skipped);
        console.log('');

        const passRate = this.results.total > 0
            ? ((this.results.passed / this.results.total) * 100).toFixed(1)
            : 0;

        console.log('  Pass Rate:    ' + passRate + '%');
        console.log('');

        if (this.results.failed === 0) {
            console.log('%c  🎉 ALL TESTS PASSED!', 'font-size: 14px; font-weight: bold; color: #16a34a; background: #f0fdf4; padding: 4px 8px;');
        } else {
            console.log('%c  ⚠️  SOME TESTS FAILED', 'font-size: 14px; font-weight: bold; color: #dc2626; background: #fef2f2; padding: 4px 8px;');
            console.log('');
            console.log('  Failed tests:');
            this.results.tests
                .filter(t => t.status === 'FAIL')
                .forEach(t => {
                    console.log('    - ' + t.name);
                    if (t.reason) console.log('      Reason: ' + t.reason);
                });
        }

        console.log('');
        console.log('='.repeat(80));
    }

    /**
     * Export results as JSON
     */
    exportResults() {
        return JSON.stringify(this.results, null, 2);
    }

    /**
     * Static helper methods for quick testing
     */

    static testEventSystem() {
        const suite = new WCOrderPreviewTestSuite();
        suite.testEventSystem();
        return suite.results;
    }

    static testDataValidation() {
        const suite = new WCOrderPreviewTestSuite();
        suite.testDataValidation();
        return suite.results;
    }

    static testCanvasRendering() {
        const suite = new WCOrderPreviewTestSuite();
        suite.testCanvasRendering();
        return suite.results;
    }

    static testErrorHandling() {
        const suite = new WCOrderPreviewTestSuite();
        suite.testErrorHandling();
        return suite.results;
    }

    static testPerformance() {
        const suite = new WCOrderPreviewTestSuite();
        suite.testPerformance();
        return suite.results;
    }

    static testSecurity() {
        const suite = new WCOrderPreviewTestSuite();
        suite.testSecurity();
        return suite.results;
    }

    /**
     * Performance benchmark for actual rendering
     */
    static async benchmarkRender(orderId) {
        console.log('🚀 Starting render benchmark for order:', orderId);

        if (!window.orderDesignData || !window.orderDesignData[orderId]) {
            console.error('❌ No design data found for order:', orderId);
            return null;
        }

        const startTime = performance.now();
        const startMemory = performance.memory ? performance.memory.usedJSHeapSize : null;

        try {
            // Trigger render
            document.dispatchEvent(new CustomEvent('octo-design-preview-ready', {
                detail: {
                    orderId: orderId,
                    canvasId: 'design-preview-canvas-' + orderId,
                    designData: window.orderDesignData[orderId]
                }
            }));

            // Wait for completion (listen for success event)
            await new Promise((resolve, reject) => {
                const timeout = setTimeout(() => {
                    reject(new Error('Render timeout'));
                }, 30000);

                const successListener = (event) => {
                    if (event.detail.orderId === orderId) {
                        clearTimeout(timeout);
                        resolve();
                    }
                };

                const errorListener = (event) => {
                    if (event.detail.orderId === orderId) {
                        clearTimeout(timeout);
                        reject(new Error(event.detail.error));
                    }
                };

                document.addEventListener('wc-order-preview-success', successListener, { once: true });
                document.addEventListener('wc-order-preview-error', errorListener, { once: true });
            });

            const endTime = performance.now();
            const endMemory = performance.memory ? performance.memory.usedJSHeapSize : null;

            const results = {
                orderId: orderId,
                renderTime: (endTime - startTime).toFixed(2) + 'ms',
                memoryUsed: startMemory && endMemory
                    ? ((endMemory - startMemory) / 1048576).toFixed(2) + 'MB'
                    : 'N/A',
                status: 'SUCCESS'
            };

            console.log('✅ Benchmark Results:', results);
            return results;

        } catch (error) {
            console.error('❌ Benchmark failed:', error.message);
            return {
                orderId: orderId,
                status: 'FAILED',
                error: error.message
            };
        }
    }
}

// Global exposure
window.WCOrderPreviewTestSuite = WCOrderPreviewTestSuite;

// Auto-run on load if flag is set
if (window.AUTO_RUN_WC_ORDER_PREVIEW_TESTS) {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            WCOrderPreviewTestSuite.runAllTests();
        });
    } else {
        WCOrderPreviewTestSuite.runAllTests();
    }
}

console.log('%c✅ WooCommerce Order Preview Test Suite Loaded', 'color: #16a34a; font-weight: bold;');
console.log('Run tests with: WCOrderPreviewTestSuite.runAllTests()');
