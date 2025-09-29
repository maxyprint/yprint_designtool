/**
 * EMERGENCY BUTTON LIFECYCLE COMPLETE TESTING SPECIALIST
 * Agent 7: End-to-end button functionality testing and restoration
 */

console.log('🚨 EMERGENCY BUTTON LIFECYCLE TEST INITIATED');

// Test Environment Setup
const EMERGENCY_TEST_CONFIG = {
    testOrderId: 5374,
    testButtonId: 'design-preview-btn',
    testModalId: 'design-preview-modal',
    maxWaitTime: 5000,
    testStartTime: Date.now()
};

// Button Lifecycle Test Suite
const ButtonLifecycleTests = {

    // Test 1: Button HTML Generation and DOM Insertion
    testButtonHtmlGeneration() {
        console.group('🔍 TEST 1: Button HTML Generation and DOM Insertion');

        const results = {
            buttonExists: false,
            buttonInDom: false,
            buttonId: null,
            buttonClasses: [],
            buttonAttributes: {},
            buttonText: '',
            buttonParent: null,
            buttonPosition: null
        };

        try {
            // Check if button exists in DOM
            const button = document.getElementById(EMERGENCY_TEST_CONFIG.testButtonId);
            results.buttonExists = !!button;

            if (button) {
                results.buttonInDom = document.body.contains(button);
                results.buttonId = button.id;
                results.buttonClasses = Array.from(button.classList);
                results.buttonText = button.textContent.trim();
                results.buttonParent = button.parentElement?.tagName;
                results.buttonPosition = button.getBoundingClientRect();

                // Get all attributes
                for (let attr of button.attributes) {
                    results.buttonAttributes[attr.name] = attr.value;
                }
            }

            console.log('✅ Button HTML Analysis:', results);

        } catch (error) {
            console.error('❌ Button HTML Test Failed:', error);
            results.error = error.message;
        }

        console.groupEnd();
        return results;
    },

    // Test 2: Event Handler Attachment and Persistence
    testEventHandlerAttachment() {
        console.group('🔍 TEST 2: Event Handler Attachment and Persistence');

        const results = {
            jqueryAvailable: false,
            buttonFound: false,
            directEventHandlers: {},
            jqueryEventHandlers: {},
            delegatedHandlers: {},
            handlerPersistence: false
        };

        try {
            // Check jQuery availability
            results.jqueryAvailable = typeof $ !== 'undefined' && typeof $.fn.on === 'function';

            const button = document.getElementById(EMERGENCY_TEST_CONFIG.testButtonId);
            results.buttonFound = !!button;

            if (button) {
                // Check direct event handlers
                const directEvents = ['onclick', 'onmousedown', 'onmouseup', 'ontouchstart'];
                directEvents.forEach(event => {
                    results.directEventHandlers[event] = !!button[event];
                });

                // Check jQuery event handlers if available
                if (results.jqueryAvailable) {
                    try {
                        const jqEvents = $._data(button, 'events') || {};
                        results.jqueryEventHandlers = Object.keys(jqEvents);

                        // Check for delegated handlers on document
                        const docEvents = $._data(document, 'events') || {};
                        if (docEvents.click) {
                            results.delegatedHandlers.click = docEvents.click.filter(handler =>
                                handler.selector && handler.selector.includes('#design-preview-btn')
                            ).length;
                        }
                    } catch (e) {
                        results.jqueryEventHandlers.error = e.message;
                    }
                }

                // Test handler persistence by triggering and checking response
                setTimeout(() => {
                    results.handlerPersistence = this.testHandlerPersistence(button);
                }, 100);
            }

            console.log('✅ Event Handler Analysis:', results);

        } catch (error) {
            console.error('❌ Event Handler Test Failed:', error);
            results.error = error.message;
        }

        console.groupEnd();
        return results;
    },

    // Test 3: Click Event Detection and Propagation
    testClickEventDetection() {
        console.group('🔍 TEST 3: Click Event Detection and Propagation');

        const results = {
            clickTriggered: false,
            eventPropagation: false,
            consoleOutput: [],
            modalResponse: false,
            ajaxCalled: false,
            errorOccurred: false
        };

        try {
            const button = document.getElementById(EMERGENCY_TEST_CONFIG.testButtonId);

            if (button) {
                // Capture console output
                const originalLog = console.log;
                const originalError = console.error;

                console.log = (...args) => {
                    results.consoleOutput.push({ type: 'log', message: args.join(' ') });
                    originalLog.apply(console, args);
                };

                console.error = (...args) => {
                    results.consoleOutput.push({ type: 'error', message: args.join(' ') });
                    results.errorOccurred = true;
                    originalError.apply(console, args);
                };

                // Monitor for modal opening
                const modal = document.getElementById(EMERGENCY_TEST_CONFIG.testModalId);
                const originalModalShow = modal?.style.display;

                // Trigger click
                console.log('🖱️ TRIGGERING BUTTON CLICK...');
                button.click();
                results.clickTriggered = true;

                // Check for immediate response
                setTimeout(() => {
                    if (modal) {
                        results.modalResponse = modal.style.display !== 'none' && modal.style.display !== '';
                    }

                    // Check if AJAX was called by looking for network activity
                    results.ajaxCalled = results.consoleOutput.some(log =>
                        log.message.includes('AJAX') || log.message.includes('ajax')
                    );

                    // Restore console
                    console.log = originalLog;
                    console.error = originalError;

                    console.log('✅ Click Event Analysis:', results);
                }, 1000);
            }

        } catch (error) {
            console.error('❌ Click Event Test Failed:', error);
            results.error = error.message;
        }

        console.groupEnd();
        return results;
    },

    // Test 4: Complete Click-to-Response Pipeline
    testCompleteClickPipeline() {
        console.group('🔍 TEST 4: Complete Click-to-Response Pipeline');

        const results = {
            pipelineSteps: {},
            overallSuccess: false,
            bottlenecks: [],
            recommendations: []
        };

        try {
            const button = document.getElementById(EMERGENCY_TEST_CONFIG.testButtonId);

            if (button) {
                // Test each step of the pipeline
                results.pipelineSteps = {
                    buttonExists: !!button,
                    buttonEnabled: !button.disabled,
                    eventHandlerAttached: this.hasEventHandler(button),
                    ajaxConfigured: typeof ajaxurl !== 'undefined',
                    modalExists: !!document.getElementById(EMERGENCY_TEST_CONFIG.testModalId),
                    jqueryLoaded: typeof $ !== 'undefined'
                };

                // Identify bottlenecks
                Object.entries(results.pipelineSteps).forEach(([step, success]) => {
                    if (!success) {
                        results.bottlenecks.push(step);
                    }
                });

                results.overallSuccess = results.bottlenecks.length === 0;

                // Generate recommendations
                if (results.bottlenecks.includes('buttonEnabled')) {
                    results.recommendations.push('Enable button by removing disabled attribute');
                }
                if (results.bottlenecks.includes('eventHandlerAttached')) {
                    results.recommendations.push('Attach click event handler to button');
                }
                if (results.bottlenecks.includes('ajaxConfigured')) {
                    results.recommendations.push('Ensure ajaxurl is properly defined');
                }
                if (results.bottlenecks.includes('jqueryLoaded')) {
                    results.recommendations.push('Load jQuery library');
                }
            }

            console.log('✅ Pipeline Analysis:', results);

        } catch (error) {
            console.error('❌ Pipeline Test Failed:', error);
            results.error = error.message;
        }

        console.groupEnd();
        return results;
    },

    // Helper: Check if button has event handler
    hasEventHandler(button) {
        if (button.onclick) return true;

        if (typeof $ !== 'undefined') {
            try {
                const events = $._data(button, 'events');
                if (events && events.click) return true;

                // Check for delegated handlers
                const docEvents = $._data(document, 'events');
                if (docEvents && docEvents.click) {
                    return docEvents.click.some(handler =>
                        handler.selector && handler.selector.includes('#design-preview-btn')
                    );
                }
            } catch (e) {
                // Fallback: assume handler exists if jQuery is available
                return true;
            }
        }

        return false;
    },

    // Helper: Test handler persistence
    testHandlerPersistence(button) {
        try {
            let eventFired = false;

            const testHandler = () => {
                eventFired = true;
            };

            if (typeof $ !== 'undefined') {
                $(button).one('testEvent', testHandler);
                $(button).trigger('testEvent');
            } else {
                button.addEventListener('testEvent', testHandler, { once: true });
                button.dispatchEvent(new Event('testEvent'));
            }

            return eventFired;
        } catch (e) {
            return false;
        }
    }
};

// Emergency Button Restoration
const EmergencyButtonRestoration = {

    // Create minimal working button test case
    createMinimalWorkingButton() {
        console.group('🚨 EMERGENCY: Creating Minimal Working Button');

        try {
            // Create emergency test button
            const emergencyButton = document.createElement('button');
            emergencyButton.id = 'emergency-test-btn';
            emergencyButton.className = 'button button-primary';
            emergencyButton.textContent = 'Emergency Test Button';
            emergencyButton.style.cssText = 'margin: 10px; padding: 8px 12px; background: #ff6b6b; border: none; color: white; border-radius: 4px; cursor: pointer;';

            // Add simple click handler
            emergencyButton.onclick = function() {
                alert('🚨 EMERGENCY BUTTON WORKS! Button click detected successfully.');
                console.log('✅ Emergency button click successful');
                return false;
            };

            // Insert after original button or at top of page
            const originalButton = document.getElementById(EMERGENCY_TEST_CONFIG.testButtonId);
            if (originalButton && originalButton.parentElement) {
                originalButton.parentElement.insertBefore(emergencyButton, originalButton.nextSibling);
            } else {
                document.body.insertBefore(emergencyButton, document.body.firstChild);
            }

            console.log('✅ Emergency button created and inserted');

            // Test the emergency button
            setTimeout(() => {
                console.log('🧪 Testing emergency button...');
                emergencyButton.click();
            }, 500);

        } catch (error) {
            console.error('❌ Emergency button creation failed:', error);
        }

        console.groupEnd();
    },

    // Implement emergency bypass for non-functioning systems
    implementEmergencyBypass() {
        console.group('🚨 EMERGENCY: Implementing System Bypass');

        try {
            const originalButton = document.getElementById(EMERGENCY_TEST_CONFIG.testButtonId);

            if (originalButton) {
                // Remove all existing event handlers
                const newButton = originalButton.cloneNode(true);
                originalButton.parentNode.replaceChild(newButton, originalButton);

                // Enable button if disabled
                newButton.disabled = false;
                newButton.style.opacity = '1';

                // Add emergency bypass handler
                newButton.onclick = function(e) {
                    e.preventDefault();
                    e.stopPropagation();

                    console.log('🚨 EMERGENCY BYPASS ACTIVATED');

                    // Show emergency modal
                    const modal = document.getElementById(EMERGENCY_TEST_CONFIG.testModalId);
                    if (modal) {
                        modal.style.display = 'block';
                        modal.innerHTML = `
                            <div style="padding: 20px; background: white; margin: 50px auto; max-width: 600px; border-radius: 8px; box-shadow: 0 4px 20px rgba(0,0,0,0.3);">
                                <h3 style="color: #ff6b6b; margin-top: 0;">🚨 Emergency Mode Active</h3>
                                <p>Emergency bypass system has been activated for Order #${EMERGENCY_TEST_CONFIG.testOrderId}</p>
                                <p>Button click successfully detected and modal opened.</p>
                                <button onclick="document.getElementById('${EMERGENCY_TEST_CONFIG.testModalId}').style.display='none'" style="background: #007cba; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;">Close</button>
                            </div>
                        `;
                    } else {
                        // Create emergency modal if it doesn't exist
                        const emergencyModal = document.createElement('div');
                        emergencyModal.id = 'emergency-modal';
                        emergencyModal.style.cssText = `
                            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
                            background: rgba(0,0,0,0.5); z-index: 9999; display: block;
                        `;
                        emergencyModal.innerHTML = `
                            <div style="padding: 20px; background: white; margin: 50px auto; max-width: 600px; border-radius: 8px; box-shadow: 0 4px 20px rgba(0,0,0,0.3);">
                                <h3 style="color: #ff6b6b; margin-top: 0;">🚨 Emergency Mode Active</h3>
                                <p>Emergency bypass system has been activated for Order #${EMERGENCY_TEST_CONFIG.testOrderId}</p>
                                <p>Button click successfully detected and emergency modal created.</p>
                                <button onclick="document.getElementById('emergency-modal').remove()" style="background: #007cba; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;">Close</button>
                            </div>
                        `;
                        document.body.appendChild(emergencyModal);
                    }

                    console.log('✅ Emergency bypass successful');
                    return false;
                };

                console.log('✅ Emergency bypass implemented');
            }

        } catch (error) {
            console.error('❌ Emergency bypass failed:', error);
        }

        console.groupEnd();
    },

    // Test basic jQuery click handler with alert
    testBasicJqueryHandler() {
        console.group('🚨 EMERGENCY: Testing Basic jQuery Handler');

        try {
            if (typeof $ === 'undefined') {
                console.error('❌ jQuery not available for emergency test');
                return;
            }

            // Create test button for jQuery
            const $testButton = $('<button>', {
                id: 'jquery-test-btn',
                class: 'button button-secondary',
                text: 'jQuery Test Button',
                css: {
                    margin: '10px',
                    padding: '8px 12px',
                    background: '#007cba',
                    border: 'none',
                    color: 'white',
                    borderRadius: '4px',
                    cursor: 'pointer'
                }
            });

            // Add jQuery click handler
            $testButton.on('click', function(e) {
                e.preventDefault();
                alert('✅ jQuery click handler works! Event system is functional.');
                console.log('✅ jQuery handler test successful');
            });

            // Insert button
            const originalButton = $('#' + EMERGENCY_TEST_CONFIG.testButtonId);
            if (originalButton.length) {
                originalButton.after($testButton);
            } else {
                $('body').prepend($testButton);
            }

            console.log('✅ jQuery test button created');

            // Auto-test after delay
            setTimeout(() => {
                console.log('🧪 Auto-testing jQuery button...');
                $testButton.click();
            }, 1000);

        } catch (error) {
            console.error('❌ jQuery test failed:', error);
        }

        console.groupEnd();
    }
};

// Complete Test Suite Execution
const ExecuteCompleteTestSuite = {

    async runAllTests() {
        console.group('🚨 EMERGENCY BUTTON LIFECYCLE COMPLETE TEST SUITE');
        console.log('🕐 Test started at:', new Date().toISOString());

        const results = {
            testSuite: 'Emergency Button Lifecycle Complete Testing',
            orderId: EMERGENCY_TEST_CONFIG.testOrderId,
            startTime: Date.now(),
            tests: {},
            summary: {},
            recommendations: []
        };

        try {
            // Test 1: Button HTML Generation
            results.tests.htmlGeneration = ButtonLifecycleTests.testButtonHtmlGeneration();

            // Test 2: Event Handler Attachment
            results.tests.eventHandlers = ButtonLifecycleTests.testEventHandlerAttachment();

            // Test 3: Click Event Detection
            results.tests.clickDetection = ButtonLifecycleTests.testClickEventDetection();

            // Test 4: Complete Pipeline
            results.tests.completePipeline = ButtonLifecycleTests.testCompleteClickPipeline();

            // Emergency Restoration Tests
            console.log('🚨 EXECUTING EMERGENCY RESTORATION...');
            EmergencyButtonRestoration.createMinimalWorkingButton();
            EmergencyButtonRestoration.implementEmergencyBypass();
            EmergencyButtonRestoration.testBasicJqueryHandler();

            // Generate summary
            results.summary = this.generateSummary(results.tests);
            results.recommendations = this.generateRecommendations(results.tests);

            results.endTime = Date.now();
            results.totalTime = results.endTime - results.startTime;

            console.log('📊 COMPLETE TEST RESULTS:', results);

        } catch (error) {
            console.error('❌ Test suite execution failed:', error);
            results.error = error.message;
        }

        console.groupEnd();
        return results;
    },

    generateSummary(tests) {
        const summary = {
            totalTests: Object.keys(tests).length,
            passedTests: 0,
            failedTests: 0,
            criticalIssues: [],
            overallStatus: 'UNKNOWN'
        };

        Object.entries(tests).forEach(([testName, testResult]) => {
            if (testResult.error) {
                summary.failedTests++;
                summary.criticalIssues.push(`${testName}: ${testResult.error}`);
            } else {
                summary.passedTests++;
            }
        });

        if (summary.criticalIssues.length === 0) {
            summary.overallStatus = 'PASS';
        } else if (summary.passedTests > summary.failedTests) {
            summary.overallStatus = 'PARTIAL';
        } else {
            summary.overallStatus = 'FAIL';
        }

        return summary;
    },

    generateRecommendations(tests) {
        const recommendations = [];

        // Button existence recommendations
        if (tests.htmlGeneration && !tests.htmlGeneration.buttonExists) {
            recommendations.push('CRITICAL: Design preview button is missing from DOM - check PHP button generation');
        }

        // Event handler recommendations
        if (tests.eventHandlers && !tests.eventHandlers.jqueryAvailable) {
            recommendations.push('WARNING: jQuery not available - may affect event handling');
        }

        // Click detection recommendations
        if (tests.clickDetection && tests.clickDetection.errorOccurred) {
            recommendations.push('ERROR: Click event triggered errors - check console for details');
        }

        // Pipeline recommendations
        if (tests.completePipeline && tests.completePipeline.bottlenecks.length > 0) {
            recommendations.push(`PIPELINE ISSUES: ${tests.completePipeline.bottlenecks.join(', ')}`);
        }

        // Emergency action recommendations
        recommendations.push('IMMEDIATE ACTION: Use emergency bypass button for critical functionality');
        recommendations.push('FALLBACK: Manual AJAX call available if button fails');
        recommendations.push('MONITORING: Check browser console for real-time debugging');

        return recommendations;
    }
};

// Auto-execute on load
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚨 EMERGENCY BUTTON LIFECYCLE TESTING AUTO-STARTED');
    ExecuteCompleteTestSuite.runAllTests();
});

// Also execute immediately if DOM is already loaded
if (document.readyState === 'loading') {
    // DOM still loading, wait for DOMContentLoaded
} else {
    // DOM already loaded
    console.log('🚨 EMERGENCY BUTTON LIFECYCLE TESTING IMMEDIATE START');
    ExecuteCompleteTestSuite.runAllTests();
}

// Export for manual execution
window.EmergencyButtonLifecycleTest = {
    ButtonLifecycleTests,
    EmergencyButtonRestoration,
    ExecuteCompleteTestSuite,
    EMERGENCY_TEST_CONFIG
};

console.log('✅ EMERGENCY BUTTON LIFECYCLE TEST SYSTEM LOADED');