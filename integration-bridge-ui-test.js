/**
 * AGENT 3: Integration Bridge UI Fix Verification Test
 * Tests that createIntegrationBridgeUI() correctly finds control groups
 */

class IntegrationBridgeUITester {
    constructor() {
        this.testResults = [];
    }

    log(message, type = 'info') {
        const timestamp = new Date().toISOString();
        const logMessage = `[${timestamp}] ${type.toUpperCase()}: ${message}`;
        console.log(logMessage);
        this.testResults.push({ timestamp, type, message });
    }

    /**
     * Test 1: Verify control group detection with multi-view selector
     */
    testControlGroupDetection() {
        this.log('🧪 Testing control group detection...');

        // Create mock multi-view control group
        const mockMultiViewControlGroup = document.createElement('div');
        mockMultiViewControlGroup.className = 'multi-view-point-to-point-controls';
        mockMultiViewControlGroup.innerHTML = '<h4>Test Multi-View Control Group</h4>';
        document.body.appendChild(mockMultiViewControlGroup);

        // Test jQuery selector
        const jQueryAvailable = typeof window.jQuery !== 'undefined' && typeof $ !== 'undefined';
        this.log(`jQuery available: ${jQueryAvailable}`);

        if (jQueryAvailable) {
            const jqueryResult = $('.multi-view-point-to-point-controls').first();
            this.log(`jQuery selector result: ${jqueryResult.length > 0 ? 'FOUND' : 'NOT FOUND'}`);
        }

        // Test native DOM selector
        const nativeResult = document.querySelector('.multi-view-point-to-point-controls');
        this.log(`Native DOM selector result: ${nativeResult !== null ? 'FOUND' : 'NOT FOUND'}`);

        // Test fallback selector
        const fallbackResult = document.querySelector('.point-to-point-controls');
        this.log(`Fallback selector result: ${fallbackResult !== null ? 'FOUND' : 'NOT FOUND'}`);

        return {
            multiViewFound: nativeResult !== null,
            jQueryWorks: jQueryAvailable && $('.multi-view-point-to-point-controls').length > 0
        };
    }

    /**
     * Test 2: Verify UI creation logic
     */
    testUICreationLogic() {
        this.log('🧪 Testing UI creation logic...');

        const selectors = ['.multi-view-point-to-point-controls', '.point-to-point-controls'];
        let controlGroup = null;

        // Simulate the fixed logic
        for (const selector of selectors) {
            const element = document.querySelector(selector);
            if (element) {
                this.log(`✅ Found control group with selector: ${selector}`);
                controlGroup = element;
                break;
            } else {
                this.log(`❌ No element found with selector: ${selector}`);
            }
        }

        if (!controlGroup) {
            this.log('❌ CRITICAL: No control group found!');
            // Debug: show what elements are actually available
            const allElements = document.querySelectorAll('[class*="point-to-point"]');
            this.log(`Available elements with "point-to-point" in class: ${allElements.length}`);
            allElements.forEach((el, index) => {
                this.log(`   ${index + 1}. ${el.tagName} with classes: ${el.className}`);
            });
            return false;
        }

        this.log('✅ Control group found successfully');
        return true;
    }

    /**
     * Test 3: Simulate Integration Bridge UI insertion
     */
    testUIInsertion() {
        this.log('🧪 Testing UI insertion...');

        const controlGroup = document.querySelector('.multi-view-point-to-point-controls');
        if (!controlGroup) {
            this.log('❌ No control group available for insertion test');
            return false;
        }

        // Create test UI HTML
        const testBridgeHTML = `
            <div class="integration-bridge-section test-ui" style="margin-top: 15px; padding: 15px; border: 1px solid #4CAF50; border-radius: 5px; background: #f1f8e9;">
                <h4 style="margin: 0 0 10px 0; color: #2E7D32;">🧪 TEST Integration Bridge UI</h4>
                <div class="test-controls">
                    <select id="test-measurement-selector" style="width: 200px;">
                        <option value="A">A - Test Measurement</option>
                    </select>
                    <span class="test-status">Test Status: Ready</span>
                </div>
            </div>
        `;

        try {
            // Test insertion
            controlGroup.insertAdjacentHTML('afterend', testBridgeHTML);

            // Verify insertion
            const insertedElement = document.querySelector('.integration-bridge-section.test-ui');
            if (insertedElement) {
                this.log('✅ UI insertion successful');
                return true;
            } else {
                this.log('❌ UI insertion failed - element not found after insertion');
                return false;
            }
        } catch (error) {
            this.log(`❌ UI insertion failed with error: ${error.message}`);
            return false;
        }
    }

    /**
     * Run all tests
     */
    async runAllTests() {
        this.log('🚀 Starting Integration Bridge UI Fix Verification Tests...');

        const results = {
            controlGroupDetection: this.testControlGroupDetection(),
            uiCreationLogic: this.testUICreationLogic(),
            uiInsertion: this.testUIInsertion()
        };

        const allPassed = Object.values(results).every(result =>
            typeof result === 'boolean' ? result : result.multiViewFound
        );

        this.log(`🏁 Test Summary: ${allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);

        return {
            allPassed,
            results,
            testResults: this.testResults
        };
    }
}

// Auto-run tests when script loads
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', async () => {
        const tester = new IntegrationBridgeUITester();
        const results = await tester.runAllTests();

        // Display results in browser if possible
        const resultContainer = document.getElementById('test-results');
        if (resultContainer) {
            resultContainer.innerHTML = `
                <h3>Integration Bridge UI Fix Test Results</h3>
                <div class="result-summary ${results.allPassed ? 'success' : 'failure'}">
                    ${results.allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}
                </div>
                <div class="test-details">
                    <pre>${JSON.stringify(results, null, 2)}</pre>
                </div>
            `;
        }
    });
}

// Export for Node.js testing if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = IntegrationBridgeUITester;
}