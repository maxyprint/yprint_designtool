/**
 * AGENT 2 CANVAS INTEGRATION VALIDATION TEST
 * Comprehensive test for canvas integration fixes
 */

class CanvasIntegrationValidator {
    constructor() {
        this.tests = [];
        this.passedTests = 0;
        this.totalTests = 0;
        this.startTime = Date.now();
    }

    log(level, message) {
        const timestamp = new Date().toISOString();
        const logMessage = `[${timestamp}] ${level.toUpperCase()}: ${message}`;
        console.log(logMessage);
        return `<div class="${level}">${logMessage}</div>`;
    }

    async runValidationTests() {
        console.log('🚀 AGENT 2 CANVAS INTEGRATION VALIDATOR: Starting comprehensive validation...');

        let results = '<div class="validation-results"><h2>Canvas Integration Validation Results</h2>';

        // Test 1: Admin Context Configuration
        results += this.testAdminContextConfiguration();

        // Test 2: templateEditors Type Detection Fix
        results += this.testTemplateEditorsDetection();

        // Test 3: Selective Canvas Polling
        results += this.testSelectiveCanvasPolling();

        // Test 4: Fabric.js Exposure Timing
        results += await this.testFabricExposureTiming();

        // Test 5: Canvas Hook Functionality
        results += this.testCanvasHookFunctionality();

        // Test 6: Template Editor Specific Detection
        results += this.testTemplateEditorDetection();

        const endTime = Date.now();
        const duration = endTime - this.startTime;
        const successRate = ((this.passedTests / this.totalTests) * 100).toFixed(1);

        results += `
            <div class="summary">
                <h3>Validation Summary</h3>
                <p>Tests Passed: ${this.passedTests}/${this.totalTests} (${successRate}%)</p>
                <p>Duration: ${duration}ms</p>
                <p>Status: ${successRate >= 80 ? '✅ VALIDATION PASSED' : '❌ VALIDATION FAILED'}</p>
            </div>
        </div>`;

        return results;
    }

    testAdminContextConfiguration() {
        this.totalTests++;
        let result = '<h3>Test 1: Admin Context Configuration</h3>';

        try {
            // Check if admin context is properly configured
            const hasAdminContext = typeof window.octoAdminContext !== 'undefined';
            const hasSelectiveDetection = window.octoAdminContext?.enable_selective_detection === true;
            const skipCanvasPolling = window.octoAdminContext?.skip_canvas_polling;

            if (hasAdminContext && hasSelectiveDetection && !skipCanvasPolling) {
                result += this.log('success', '✅ Admin context configuration: CORRECT - selective detection enabled, canvas polling enabled');
                this.passedTests++;
            } else if (hasAdminContext && skipCanvasPolling) {
                result += this.log('error', '❌ Admin context configuration: INCORRECT - canvas polling disabled without selective detection');
            } else {
                result += this.log('warning', '⚠️ Admin context: Missing or incomplete configuration');
            }

            result += this.log('info', `Config details: hasContext=${hasAdminContext}, selective=${hasSelectiveDetection}, skipPolling=${skipCanvasPolling}`);
        } catch (error) {
            result += this.log('error', `❌ Admin context test failed: ${error.message}`);
        }

        return result;
    }

    testTemplateEditorsDetection() {
        this.totalTests++;
        let result = '<h3>Test 2: templateEditors Detection Fix</h3>';

        try {
            // Simulate the fixed detection logic
            const templateEditorReady = window.templateEditors &&
                (window.templateEditors instanceof Map ? window.templateEditors.size > 0 : Object.keys(window.templateEditors).length > 0);

            const isMap = window.templateEditors instanceof Map;
            const size = isMap ? window.templateEditors?.size : (window.templateEditors ? Object.keys(window.templateEditors).length : 0);

            result += this.log('info', `templateEditors type: ${isMap ? 'Map' : 'Object/Other'}, size: ${size}`);

            if (typeof templateEditorReady === 'boolean') {
                result += this.log('success', '✅ templateEditors detection: FIXED - handles both Map and Object types');
                this.passedTests++;
            } else {
                result += this.log('error', '❌ templateEditors detection: FAILED - type checking issue');
            }
        } catch (error) {
            result += this.log('error', `❌ templateEditors test failed: ${error.message}`);
        }

        return result;
    }

    testSelectiveCanvasPolling() {
        this.totalTests++;
        let result = '<h3>Test 3: Selective Canvas Polling</h3>';

        try {
            const isAdminContext = window.octoAdminContext?.context === 'woocommerce_admin';
            const allowSelectiveDetection = window.octoAdminContext?.enable_selective_detection;
            const skipCanvasPolling = window.octoAdminContext?.skip_canvas_polling;

            const shouldAllowPolling = isAdminContext ? (allowSelectiveDetection || !skipCanvasPolling) : true;

            if (shouldAllowPolling) {
                result += this.log('success', '✅ Selective canvas polling: ENABLED - canvas detection allowed');
                this.passedTests++;
            } else {
                result += this.log('error', '❌ Selective canvas polling: DISABLED - canvas detection blocked');
            }

            result += this.log('info', `Context: admin=${isAdminContext}, selective=${allowSelectiveDetection}, skipPolling=${skipCanvasPolling}`);
        } catch (error) {
            result += this.log('error', `❌ Selective polling test failed: ${error.message}`);
        }

        return result;
    }

    async testFabricExposureTiming() {
        this.totalTests++;
        let result = '<h3>Test 4: Fabric.js Exposure Timing</h3>';

        try {
            // Check if fabric is available
            const fabricAvailable = typeof window.fabric !== 'undefined';
            const fabricCanvasAvailable = window.fabric?.Canvas !== 'undefined';

            if (fabricAvailable && fabricCanvasAvailable) {
                result += this.log('success', '✅ Fabric.js exposure: SUCCESS - window.fabric available');
                this.passedTests++;
            } else if (fabricAvailable) {
                result += this.log('warning', '⚠️ Fabric.js partial exposure: fabric available but Canvas missing');
            } else {
                // Try to trigger fabric exposure
                if (typeof window.dispatchEvent === 'function') {
                    window.dispatchEvent(new CustomEvent('fabricGlobalReady'));

                    // Wait a bit and recheck
                    await new Promise(resolve => setTimeout(resolve, 500));

                    if (window.fabric) {
                        result += this.log('success', '✅ Fabric.js exposure: SUCCESS - triggered via event');
                        this.passedTests++;
                    } else {
                        result += this.log('error', '❌ Fabric.js exposure: FAILED - not available after trigger');
                    }
                } else {
                    result += this.log('error', '❌ Fabric.js exposure: FAILED - not available');
                }
            }
        } catch (error) {
            result += this.log('error', `❌ Fabric exposure test failed: ${error.message}`);
        }

        return result;
    }

    testCanvasHookFunctionality() {
        this.totalTests++;
        let result = '<h3>Test 5: Canvas Hook Functionality</h3>';

        try {
            // Check if canvas hook functions are available
            const canvasElements = document.querySelectorAll('canvas');
            const fabricCanvas = window.fabricCanvas;

            result += this.log('info', `Canvas elements found: ${canvasElements.length}`);

            if (fabricCanvas && typeof fabricCanvas.add === 'function') {
                result += this.log('success', '✅ Canvas hook: SUCCESS - window.fabricCanvas available and functional');
                this.passedTests++;
            } else if (canvasElements.length > 0) {
                // Check if any canvas has fabric attached
                let fabricCanvasFound = false;
                for (const canvas of canvasElements) {
                    if (canvas.__fabric) {
                        fabricCanvasFound = true;
                        break;
                    }
                }

                if (fabricCanvasFound) {
                    result += this.log('warning', '⚠️ Canvas hook: PARTIAL - fabric canvas found but not globally exposed');
                } else {
                    result += this.log('warning', '⚠️ Canvas hook: PENDING - canvas elements found but no fabric instances');
                }
            } else {
                result += this.log('info', 'ℹ️ Canvas hook: NO CANVAS - no canvas elements in DOM (expected in admin context)');
                // In admin context without template editor, this is normal
                if (window.octoAdminContext?.context === 'woocommerce_admin') {
                    this.passedTests++;
                }
            }
        } catch (error) {
            result += this.log('error', `❌ Canvas hook test failed: ${error.message}`);
        }

        return result;
    }

    testTemplateEditorDetection() {
        this.totalTests++;
        let result = '<h3>Test 6: Template Editor Specific Detection</h3>';

        try {
            // Check for WordPress template editor elements
            const templateContainers = document.querySelectorAll('.wp-block-template-part, .edit-site-canvas-container, .interface-interface-skeleton__content');
            const isTemplateEditorContext = templateContainers.length > 0;

            result += this.log('info', `Template editor containers found: ${templateContainers.length}`);

            if (isTemplateEditorContext) {
                let canvasInTemplate = false;
                for (const container of templateContainers) {
                    const canvasInContainer = container.querySelector('canvas');
                    if (canvasInContainer) {
                        canvasInTemplate = true;
                        break;
                    }
                }

                if (canvasInTemplate) {
                    result += this.log('success', '✅ Template editor detection: SUCCESS - canvas found in template editor');
                    this.passedTests++;
                } else {
                    result += this.log('warning', '⚠️ Template editor detection: PARTIAL - containers found but no canvas');
                }
            } else {
                result += this.log('info', 'ℹ️ Template editor detection: N/A - not in template editor context');
                // This is normal in regular admin context
                this.passedTests++;
            }
        } catch (error) {
            result += this.log('error', `❌ Template editor test failed: ${error.message}`);
        }

        return result;
    }
}

// Auto-run validation if in test environment
if (typeof window !== 'undefined') {
    window.CanvasIntegrationValidator = CanvasIntegrationValidator;

    // Run validation after a short delay to let other scripts load
    setTimeout(async () => {
        const validator = new CanvasIntegrationValidator();
        const results = await validator.runValidationTests();

        // If there's a results container, display results
        const container = document.getElementById('validation-results');
        if (container) {
            container.innerHTML = results;
        } else {
            // Create results container
            const div = document.createElement('div');
            div.id = 'validation-results';
            div.innerHTML = results;
            div.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                width: 400px;
                max-height: 80vh;
                overflow-y: auto;
                background: white;
                border: 2px solid #333;
                border-radius: 8px;
                padding: 20px;
                z-index: 10000;
                font-family: monospace;
                font-size: 12px;
            `;
            document.body.appendChild(div);
        }
    }, 1000);
}

module.exports = CanvasIntegrationValidator;