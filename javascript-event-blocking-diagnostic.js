/**
 * 🎯 AGENT 3: JAVASCRIPT EVENT BLOCKING ANALYSIS SPECIALIST
 *
 * Comprehensive JavaScript event handler conflict and propagation diagnostic script
 * for #design-preview-btn click event blocking analysis
 *
 * MISSION: Analyze JavaScript event system to identify why click handlers are not executing
 *
 * USAGE: Copy and paste this entire script into browser console on the live site
 */

console.log('🎯 AGENT 3: JAVASCRIPT EVENT BLOCKING ANALYSIS SPECIALIST');
console.log('🔬 Analyzing JavaScript event handler conflicts and propagation issues...');

class JavaScriptEventBlockingAnalyst {
    constructor() {
        this.buttonId = 'design-preview-btn';
        this.analysis = {
            timestamp: new Date().toISOString(),
            buttonElement: null,
            nativeEventHandlers: [],
            jqueryEventHandlers: [],
            eventPropagationTests: {},
            preventDefaultTests: {},
            handlerFunctionTests: {},
            errorTests: {},
            conflictAnalysis: {},
            recommendations: []
        };

        console.group('🎯 JAVASCRIPT EVENT BLOCKING ANALYSIS INITIATED');
    }

    /**
     * 1. COMPREHENSIVE EVENT HANDLER DISCOVERY
     * Analyze ALL event handlers attached to the button
     */
    analyzeEventHandlers() {
        console.group('📡 EVENT HANDLER DISCOVERY');

        const button = document.getElementById(this.buttonId);
        if (!button) {
            console.error('❌ CRITICAL: Button element not found:', this.buttonId);
            return false;
        }

        this.analysis.buttonElement = button;

        // Analyze native DOM event listeners
        this.analyzeNativeEventHandlers(button);

        // Analyze jQuery event handlers
        this.analyzeJQueryEventHandlers(button);

        // Analyze inline event handlers
        this.analyzeInlineEventHandlers(button);

        console.groupEnd(); // EVENT HANDLER DISCOVERY
        return true;
    }

    /**
     * Analyze native DOM addEventListener handlers
     */
    analyzeNativeEventHandlers(button) {
        console.group('🔧 NATIVE DOM EVENT HANDLERS');

        // Unfortunately, native DOM doesn't provide a way to list all event listeners
        // But we can check for common patterns and inline handlers

        const nativeHandlers = {
            onclick: button.onclick,
            onmousedown: button.onmousedown,
            onmouseup: button.onmouseup,
            ontouchstart: button.ontouchstart,
            ontouchend: button.ontouchend
        };

        console.log('📋 Inline Event Handlers:', nativeHandlers);

        // Check for event listeners using getEventListeners (Chrome DevTools only)
        if (typeof getEventListeners === 'function') {
            try {
                const listeners = getEventListeners(button);
                console.log('🎧 Chrome DevTools Event Listeners:', listeners);
                this.analysis.nativeEventHandlers = listeners;
            } catch (error) {
                console.warn('⚠️ getEventListeners not available (Chrome DevTools only)');
            }
        }

        // Test for event listener patterns in global scope
        const globalEventPatterns = [
            'handlePreviewClick',
            'designPreview',
            'previewClick',
            'buttonClick'
        ];

        globalEventPatterns.forEach(pattern => {
            if (typeof window[pattern] === 'function') {
                console.log(`✅ Global function found: window.${pattern}`);
                this.analysis.handlerFunctionTests[pattern] = {
                    exists: true,
                    type: typeof window[pattern],
                    function: window[pattern]
                };
            } else {
                console.warn(`❌ Global function missing: window.${pattern}`);
                this.analysis.handlerFunctionTests[pattern] = {
                    exists: false
                };
            }
        });

        console.groupEnd(); // NATIVE DOM EVENT HANDLERS
    }

    /**
     * Analyze jQuery event handlers
     */
    analyzeJQueryEventHandlers(button) {
        console.group('💎 JQUERY EVENT HANDLERS');

        if (typeof jQuery === 'undefined') {
            console.error('❌ jQuery not available for event handler analysis');
            console.groupEnd();
            return;
        }

        const $button = jQuery(button);

        // Get jQuery events data
        try {
            // Try different jQuery versions' internal event storage
            let events = null;

            // jQuery 1.8+ uses $._data()
            if (jQuery._data) {
                events = jQuery._data(button, 'events');
            }

            // Fallback to $().data() for older versions
            if (!events && $button.data) {
                events = $button.data('events');
            }

            console.log('🎪 jQuery Events Data:', events);

            if (events && events.click) {
                console.log(`✅ Found ${events.click.length} jQuery click handlers`);
                events.click.forEach((handler, index) => {
                    console.log(`🎯 Handler ${index + 1}:`, {
                        namespace: handler.namespace,
                        selector: handler.selector,
                        data: handler.data,
                        handler: handler.handler.toString().substring(0, 200) + '...'
                    });
                });
                this.analysis.jqueryEventHandlers = events.click;
            } else {
                console.warn('⚠️ No jQuery click handlers found');
            }
        } catch (error) {
            console.error('❌ Error analyzing jQuery events:', error);
        }

        // Test jQuery event binding methods
        this.testJQueryEventBinding($button);

        console.groupEnd(); // JQUERY EVENT HANDLERS
    }

    /**
     * Test jQuery event binding functionality
     */
    testJQueryEventBinding($button) {
        console.group('🧪 JQUERY EVENT BINDING TESTS');

        try {
            // Test 1: Direct binding
            let directBindingWorks = false;
            const testHandler1 = function(e) {
                directBindingWorks = true;
                console.log('✅ Direct jQuery binding test successful');
                e.preventDefault();
                e.stopPropagation();
            };

            $button.off('click.bindingTest1');
            $button.on('click.bindingTest1', testHandler1);

            const testEvent1 = new MouseEvent('click', { bubbles: true, cancelable: true });
            $button[0].dispatchEvent(testEvent1);

            console.log('📊 Direct jQuery binding test:', directBindingWorks ? 'PASS' : 'FAIL');
            $button.off('click.bindingTest1');

            // Test 2: Delegated binding
            let delegatedBindingWorks = false;
            const testHandler2 = function(e) {
                delegatedBindingWorks = true;
                console.log('✅ Delegated jQuery binding test successful');
                e.preventDefault();
                e.stopPropagation();
            };

            jQuery(document).off('click.bindingTest2', `#${this.buttonId}`);
            jQuery(document).on('click.bindingTest2', `#${this.buttonId}`, testHandler2);

            const testEvent2 = new MouseEvent('click', { bubbles: true, cancelable: true });
            $button[0].dispatchEvent(testEvent2);

            console.log('📊 Delegated jQuery binding test:', delegatedBindingWorks ? 'PASS' : 'FAIL');
            jQuery(document).off('click.bindingTest2', `#${this.buttonId}`);

            this.analysis.jqueryBindingTests = {
                directBinding: directBindingWorks,
                delegatedBinding: delegatedBindingWorks
            };

        } catch (error) {
            console.error('❌ jQuery binding tests failed:', error);
            this.analysis.errorTests.jqueryBinding = error;
        }

        console.groupEnd(); // JQUERY EVENT BINDING TESTS
    }

    /**
     * Analyze inline event handlers (onclick, etc.)
     */
    analyzeInlineEventHandlers(button) {
        console.group('📝 INLINE EVENT HANDLERS');

        const inlineHandlers = [
            'onclick', 'onmousedown', 'onmouseup', 'onmouseover', 'onmouseout',
            'ontouchstart', 'ontouchend', 'onfocus', 'onblur'
        ];

        const foundHandlers = {};
        inlineHandlers.forEach(handler => {
            if (button[handler]) {
                foundHandlers[handler] = button[handler].toString();
                console.log(`✅ Found ${handler}:`, button[handler].toString().substring(0, 100) + '...');
            }
        });

        if (Object.keys(foundHandlers).length === 0) {
            console.log('ℹ️ No inline event handlers found');
        }

        this.analysis.inlineEventHandlers = foundHandlers;

        console.groupEnd(); // INLINE EVENT HANDLERS
    }

    /**
     * 2. EVENT PROPAGATION TESTING
     * Test if events are being stopped by preventDefault() or stopPropagation()
     */
    testEventPropagation() {
        console.group('🌊 EVENT PROPAGATION TESTING');

        const button = document.getElementById(this.buttonId);
        if (!button) return;

        const propagationTests = {
            bubbling: false,
            capturing: false,
            preventDefault: false,
            stopPropagation: false,
            stopImmediatePropagation: false
        };

        // Test event bubbling
        const bubblingHandler = (e) => {
            propagationTests.bubbling = true;
            console.log('📈 Event bubbling detected');
        };

        // Test event capturing
        const capturingHandler = (e) => {
            propagationTests.capturing = true;
            console.log('📉 Event capturing detected');
        };

        document.body.addEventListener('click', bubblingHandler, false); // Bubbling
        document.body.addEventListener('click', capturingHandler, true); // Capturing

        // Create test event with tracking
        const trackingHandler = (e) => {
            console.log('🎯 Button click event received');

            // Test if preventDefault is being called
            if (e.defaultPrevented) {
                propagationTests.preventDefault = true;
                console.warn('⚠️ preventDefault() has been called');
            }

            // Test propagation stopping
            const originalStopPropagation = e.stopPropagation;
            const originalStopImmediatePropagation = e.stopImmediatePropagation;

            e.stopPropagation = function() {
                propagationTests.stopPropagation = true;
                console.warn('⚠️ stopPropagation() called');
                originalStopPropagation.call(this);
            };

            e.stopImmediatePropagation = function() {
                propagationTests.stopImmediatePropagation = true;
                console.warn('⚠️ stopImmediatePropagation() called');
                originalStopImmediatePropagation.call(this);
            };
        };

        button.addEventListener('click', trackingHandler, true); // Capture phase

        // Dispatch test event
        const testEvent = new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            view: window
        });

        console.log('🧪 Dispatching test event...');
        button.dispatchEvent(testEvent);

        // Clean up
        document.body.removeEventListener('click', bubblingHandler, false);
        document.body.removeEventListener('click', capturingHandler, true);
        button.removeEventListener('click', trackingHandler, true);

        console.log('📊 Event Propagation Results:', propagationTests);
        this.analysis.eventPropagationTests = propagationTests;

        console.groupEnd(); // EVENT PROPAGATION TESTING
    }

    /**
     * 3. JAVASCRIPT ERROR DETECTION
     * Check for JavaScript errors that might prevent event handlers from working
     */
    detectJavaScriptErrors() {
        console.group('🐛 JAVASCRIPT ERROR DETECTION');

        const errorTests = {
            syntaxErrors: [],
            referenceErrors: [],
            typeErrors: [],
            consoleErrors: []
        };

        // Capture console errors
        const originalError = console.error;
        console.error = function(...args) {
            errorTests.consoleErrors.push({
                timestamp: new Date().toISOString(),
                message: args.join(' ')
            });
            originalError.apply(console, args);
        };

        // Test common error patterns
        try {
            // Test if handlePreviewClick function exists and is callable
            if (typeof handlePreviewClick !== 'undefined') {
                if (typeof handlePreviewClick === 'function') {
                    console.log('✅ handlePreviewClick function is available');
                } else {
                    errorTests.typeErrors.push('handlePreviewClick exists but is not a function');
                    console.error('❌ handlePreviewClick exists but is not a function:', typeof handlePreviewClick);
                }
            } else {
                errorTests.referenceErrors.push('handlePreviewClick function not defined');
                console.warn('⚠️ handlePreviewClick function not defined');
            }

            // Test jQuery availability
            if (typeof jQuery === 'undefined') {
                errorTests.referenceErrors.push('jQuery not available');
            } else if (typeof jQuery.fn === 'undefined') {
                errorTests.typeErrors.push('jQuery.fn not available');
            }

            // Test for common WordPress admin variables
            if (typeof ajaxurl === 'undefined') {
                errorTests.referenceErrors.push('ajaxurl not defined (WordPress admin variable)');
            }

        } catch (error) {
            errorTests.syntaxErrors.push(error.message);
            console.error('❌ Error during JavaScript error detection:', error);
        }

        // Restore console.error
        setTimeout(() => {
            console.error = originalError;
        }, 1000);

        console.log('🐛 JavaScript Error Analysis:', errorTests);
        this.analysis.errorTests = errorTests;

        console.groupEnd(); // JAVASCRIPT ERROR DETECTION
    }

    /**
     * 4. HANDLER FUNCTION AVAILABILITY TEST
     * Test if required handler functions are available and callable
     */
    testHandlerFunctions() {
        console.group('🎭 HANDLER FUNCTION AVAILABILITY');

        const handlerTests = {};

        // Common handler function names to test
        const handlerNames = [
            'handlePreviewClick',
            'designPreview',
            'previewDesign',
            'showPreview',
            'openPreview',
            'displayPreview'
        ];

        handlerNames.forEach(handlerName => {
            try {
                const func = window[handlerName];
                handlerTests[handlerName] = {
                    exists: typeof func !== 'undefined',
                    type: typeof func,
                    callable: typeof func === 'function',
                    source: func ? func.toString().substring(0, 200) + '...' : null
                };

                if (handlerTests[handlerName].callable) {
                    console.log(`✅ ${handlerName} is available and callable`);
                } else if (handlerTests[handlerName].exists) {
                    console.warn(`⚠️ ${handlerName} exists but is not callable:`, typeof func);
                } else {
                    console.log(`ℹ️ ${handlerName} not found`);
                }

            } catch (error) {
                handlerTests[handlerName] = {
                    exists: false,
                    error: error.message
                };
                console.error(`❌ Error testing ${handlerName}:`, error);
            }
        });

        // Test method calling with button element
        if (handlerTests.handlePreviewClick && handlerTests.handlePreviewClick.callable) {
            try {
                console.log('🧪 Testing handlePreviewClick function call...');

                // Create mock jQuery element if needed
                const mockElement = typeof jQuery !== 'undefined' ?
                    jQuery(`#${this.buttonId}`) :
                    document.getElementById(this.buttonId);

                // Test function call (but don't actually execute to avoid side effects)
                console.log('📞 handlePreviewClick function signature:',
                    window.handlePreviewClick.toString().match(/function[^{]*\{/)[0]);

                handlerTests.handlePreviewClick.testable = true;

            } catch (error) {
                console.error('❌ Error testing handlePreviewClick call:', error);
                handlerTests.handlePreviewClick.testError = error.message;
            }
        }

        console.log('🎭 Handler Function Analysis:', handlerTests);
        this.analysis.handlerFunctionTests = handlerTests;

        console.groupEnd(); // HANDLER FUNCTION AVAILABILITY
    }

    /**
     * 5. CONFLICTING EVENT HANDLER ANALYSIS
     * Identify multiple event handlers that might conflict with each other
     */
    analyzeEventConflicts() {
        console.group('⚔️ EVENT HANDLER CONFLICT ANALYSIS');

        const conflicts = {
            multipleHandlers: false,
            handlerConflicts: [],
            preventDefaultConflicts: [],
            stopPropagationConflicts: [],
            timingConflicts: []
        };

        const button = document.getElementById(this.buttonId);
        if (!button) {
            console.groupEnd();
            return;
        }

        // Count total handlers
        let totalHandlers = 0;

        // Count inline handlers
        const inlineHandlers = ['onclick', 'onmousedown', 'onmouseup'];
        const foundInlineHandlers = inlineHandlers.filter(handler => button[handler]);
        totalHandlers += foundInlineHandlers.length;

        // Count jQuery handlers
        if (typeof jQuery !== 'undefined') {
            try {
                const events = jQuery._data ? jQuery._data(button, 'events') : jQuery(button).data('events');
                if (events && events.click) {
                    totalHandlers += events.click.length;
                }
            } catch (error) {
                console.warn('⚠️ Could not count jQuery handlers:', error);
            }
        }

        // Count native handlers (approximation based on common patterns)
        if (typeof getEventListeners === 'function') {
            try {
                const listeners = getEventListeners(button);
                if (listeners.click) {
                    totalHandlers += listeners.click.length;
                }
            } catch (error) {
                // getEventListeners not available
            }
        }

        console.log(`📊 Total estimated handlers: ${totalHandlers}`);

        if (totalHandlers > 1) {
            conflicts.multipleHandlers = true;
            conflicts.handlerConflicts.push(`Multiple handlers detected: ${totalHandlers} handlers`);
            console.warn(`⚠️ Multiple event handlers detected (${totalHandlers})`);

            if (foundInlineHandlers.length > 0 && totalHandlers > foundInlineHandlers.length) {
                conflicts.handlerConflicts.push('Inline handlers mixed with event listeners');
                console.warn('⚠️ Mix of inline handlers and event listeners detected');
            }
        }

        // Test for preventDefault conflicts
        this.testPreventDefaultConflicts(button, conflicts);

        console.log('⚔️ Event Conflict Analysis:', conflicts);
        this.analysis.conflictAnalysis = conflicts;

        console.groupEnd(); // EVENT HANDLER CONFLICT ANALYSIS
    }

    /**
     * Test for preventDefault conflicts by temporarily intercepting events
     */
    testPreventDefaultConflicts(button, conflicts) {
        console.group('🛡️ PREVENT DEFAULT CONFLICT TEST');

        let preventDefaultCalled = false;
        let handlerCount = 0;

        // Create test handler that tracks preventDefault usage
        const conflictTestHandler = (e) => {
            handlerCount++;
            console.log(`🎯 Handler ${handlerCount} executed`);

            if (e.defaultPrevented) {
                preventDefaultCalled = true;
                conflicts.preventDefaultConflicts.push(`Handler ${handlerCount} received pre-prevented event`);
                console.warn(`⚠️ Handler ${handlerCount} received already prevented event`);
            }

            // Don't actually prevent to avoid interfering with the test
        };

        // Add test handler
        button.addEventListener('click', conflictTestHandler, true); // Capture phase

        // Dispatch test event
        const testEvent = new MouseEvent('click', {
            bubbles: true,
            cancelable: true
        });

        button.dispatchEvent(testEvent);

        // Clean up
        button.removeEventListener('click', conflictTestHandler, true);

        console.log(`📊 Handlers executed: ${handlerCount}`);
        console.log(`📊 preventDefault conflicts: ${preventDefaultCalled}`);

        console.groupEnd(); // PREVENT DEFAULT CONFLICT TEST
    }

    /**
     * 6. ASYNC/TIMING ISSUE ANALYSIS
     * Check for timing issues with event handler setup
     */
    analyzeTimingIssues() {
        console.group('⏰ TIMING ISSUE ANALYSIS');

        const timingAnalysis = {
            domReady: document.readyState,
            jqueryReady: typeof jQuery !== 'undefined' && jQuery.isReady,
            fabricLoaded: typeof fabric !== 'undefined',
            designerWidgetLoaded: typeof DesignerWidget !== 'undefined',
            canvasInitialized: typeof window.canvasInitializationController !== 'undefined',
            designerInstance: typeof window.designerWidgetInstance !== 'undefined'
        };

        console.log('⏰ Timing State Analysis:', timingAnalysis);

        // Check if handlers are being attached too early/late
        const recommendations = [];

        if (timingAnalysis.domReady !== 'complete') {
            recommendations.push('DOM not fully loaded - handlers may be attached too early');
        }

        if (!timingAnalysis.jqueryReady && typeof jQuery !== 'undefined') {
            recommendations.push('jQuery not ready - jQuery handlers may fail');
        }

        if (!timingAnalysis.designerWidgetLoaded && timingAnalysis.designerInstance) {
            recommendations.push('DesignerWidget instance exists but class not loaded - timing issue');
        }

        console.log('💡 Timing Recommendations:', recommendations);
        this.analysis.timingAnalysis = { ...timingAnalysis, recommendations };

        console.groupEnd(); // TIMING ISSUE ANALYSIS
    }

    /**
     * 7. GENERATE COMPREHENSIVE REPORT
     * Compile all findings into actionable recommendations
     */
    generateReport() {
        console.group('📋 COMPREHENSIVE EVENT BLOCKING ANALYSIS REPORT');

        const report = {
            summary: {
                buttonFound: !!this.analysis.buttonElement,
                totalIssuesFound: 0,
                criticalIssues: [],
                warningIssues: [],
                recommendedActions: []
            },
            details: this.analysis
        };

        // Analyze findings and generate recommendations
        this.analyzeFindings(report);

        // Display report
        console.log('📊 EXECUTIVE SUMMARY:');
        console.log(`   Button Found: ${report.summary.buttonFound ? '✅' : '❌'}`);
        console.log(`   Total Issues: ${report.summary.totalIssuesFound}`);
        console.log(`   Critical Issues: ${report.summary.criticalIssues.length}`);
        console.log(`   Warning Issues: ${report.summary.warningIssues.length}`);

        if (report.summary.criticalIssues.length > 0) {
            console.group('🚨 CRITICAL ISSUES');
            report.summary.criticalIssues.forEach((issue, index) => {
                console.error(`${index + 1}. ${issue}`);
            });
            console.groupEnd();
        }

        if (report.summary.warningIssues.length > 0) {
            console.group('⚠️ WARNING ISSUES');
            report.summary.warningIssues.forEach((issue, index) => {
                console.warn(`${index + 1}. ${issue}`);
            });
            console.groupEnd();
        }

        console.group('💡 RECOMMENDED ACTIONS');
        report.summary.recommendedActions.forEach((action, index) => {
            console.log(`${index + 1}. ${action}`);
        });
        console.groupEnd();

        // Make report available globally
        window.eventBlockingAnalysisReport = report;
        console.log('📁 Full report saved to: window.eventBlockingAnalysisReport');

        console.groupEnd(); // COMPREHENSIVE EVENT BLOCKING ANALYSIS REPORT

        return report;
    }

    /**
     * Analyze findings and generate specific recommendations
     */
    analyzeFindings(report) {
        const { analysis } = this;
        let issueCount = 0;

        // Check button element
        if (!analysis.buttonElement) {
            report.summary.criticalIssues.push('Button element not found in DOM');
            report.summary.recommendedActions.push('Verify button HTML exists with correct ID: design-preview-btn');
            issueCount++;
        }

        // Check for missing handlePreviewClick function
        if (analysis.handlerFunctionTests.handlePreviewClick && !analysis.handlerFunctionTests.handlePreviewClick.exists) {
            report.summary.criticalIssues.push('handlePreviewClick function not defined');
            report.summary.recommendedActions.push('Define handlePreviewClick function or check function name');
            issueCount++;
        }

        // Check for jQuery issues
        if (analysis.errorTests.referenceErrors && analysis.errorTests.referenceErrors.includes('jQuery not available')) {
            report.summary.criticalIssues.push('jQuery not loaded');
            report.summary.recommendedActions.push('Ensure jQuery is loaded before event handlers');
            issueCount++;
        }

        // Check for event propagation issues
        if (analysis.eventPropagationTests.preventDefault) {
            report.summary.warningIssues.push('Event preventDefault() is being called');
            report.summary.recommendedActions.push('Check for unwanted preventDefault() calls in event handlers');
            issueCount++;
        }

        if (analysis.eventPropagationTests.stopPropagation) {
            report.summary.warningIssues.push('Event stopPropagation() is being called');
            report.summary.recommendedActions.push('Check for unwanted stopPropagation() calls blocking event bubbling');
            issueCount++;
        }

        // Check for multiple handler conflicts
        if (analysis.conflictAnalysis.multipleHandlers) {
            report.summary.warningIssues.push('Multiple event handlers detected - potential conflicts');
            report.summary.recommendedActions.push('Consolidate event handlers or ensure proper event management');
            issueCount++;
        }

        // Check for timing issues
        if (analysis.timingAnalysis && analysis.timingAnalysis.recommendations.length > 0) {
            analysis.timingAnalysis.recommendations.forEach(rec => {
                report.summary.warningIssues.push(`Timing issue: ${rec}`);
                issueCount++;
            });
            report.summary.recommendedActions.push('Ensure proper DOM ready and jQuery ready event handling');
        }

        // Check for JavaScript errors
        if (analysis.errorTests.syntaxErrors && analysis.errorTests.syntaxErrors.length > 0) {
            report.summary.criticalIssues.push(`JavaScript syntax errors detected: ${analysis.errorTests.syntaxErrors.length}`);
            report.summary.recommendedActions.push('Fix JavaScript syntax errors preventing execution');
            issueCount++;
        }

        if (analysis.errorTests.referenceErrors && analysis.errorTests.referenceErrors.length > 0) {
            report.summary.warningIssues.push(`Reference errors detected: ${analysis.errorTests.referenceErrors.length}`);
            report.summary.recommendedActions.push('Resolve missing variable/function references');
            issueCount++;
        }

        // No issues found
        if (issueCount === 0 && analysis.buttonElement) {
            report.summary.recommendedActions.push('No blocking issues detected - button should be functional');
            report.summary.recommendedActions.push('If button still not working, check for CSS pointer-events or z-index issues');
        }

        report.summary.totalIssuesFound = issueCount;
    }

    /**
     * 8. EMERGENCY FIX ATTEMPT
     * If requested, attempt to apply emergency fixes for common issues
     */
    attemptEmergencyFix() {
        console.group('🚑 EMERGENCY FIX ATTEMPT');

        const button = document.getElementById(this.buttonId);
        if (!button) {
            console.error('❌ Cannot apply emergency fix: Button not found');
            console.groupEnd();
            return false;
        }

        // Emergency Fix 1: Clear all existing handlers and add new one
        console.log('🔧 Applying Emergency Fix 1: Clean handler attachment');

        try {
            // Clear jQuery handlers if available
            if (typeof jQuery !== 'undefined') {
                jQuery(button).off('click');
                jQuery(document).off('click', `#${this.buttonId}`);
            }

            // Clear inline handlers
            button.onclick = null;

            // Add emergency handler
            const emergencyHandler = function(e) {
                console.log('🚨 EMERGENCY HANDLER EXECUTED');

                // Call original handlePreviewClick if available
                if (typeof handlePreviewClick === 'function') {
                    console.log('📞 Calling original handlePreviewClick function');
                    handlePreviewClick(typeof jQuery !== 'undefined' ? jQuery(e.target) : e.target);
                } else {
                    console.warn('⚠️ Original handlePreviewClick function not found');
                    // Fallback emergency behavior
                    alert('🚨 EMERGENCY: Preview button clicked - original handler missing');
                }
            };

            // Attach both native and jQuery handlers for maximum compatibility
            button.addEventListener('click', emergencyHandler);

            if (typeof jQuery !== 'undefined') {
                jQuery(button).on('click', emergencyHandler);
            }

            console.log('✅ Emergency fix applied successfully');

            // Test the fix
            console.log('🧪 Testing emergency fix...');
            const testEvent = new MouseEvent('click', {
                bubbles: true,
                cancelable: true,
                view: window
            });

            button.dispatchEvent(testEvent);

            console.groupEnd(); // EMERGENCY FIX ATTEMPT
            return true;

        } catch (error) {
            console.error('❌ Emergency fix failed:', error);
            console.groupEnd();
            return false;
        }
    }

    /**
     * MAIN ANALYSIS EXECUTION
     */
    async runCompleteAnalysis() {
        console.log('🚀 Starting comprehensive JavaScript event blocking analysis...');

        // Run all analysis phases
        if (!this.analyzeEventHandlers()) {
            console.error('❌ Analysis aborted: Button element not found');
            return;
        }

        this.testEventPropagation();
        this.detectJavaScriptErrors();
        this.testHandlerFunctions();
        this.analyzeEventConflicts();
        this.analyzeTimingIssues();

        // Generate comprehensive report
        const report = this.generateReport();

        console.groupEnd(); // JAVASCRIPT EVENT BLOCKING ANALYSIS INITIATED

        console.log('✅ JavaScript Event Blocking Analysis Complete');
        console.log('📄 View full report: window.eventBlockingAnalysisReport');

        // Offer emergency fix if issues found
        if (report.summary.totalIssuesFound > 0) {
            console.log('🚑 To attempt emergency fix, run: window.eventBlockingAnalyst.attemptEmergencyFix()');
            window.eventBlockingAnalyst = this;
        }

        return report;
    }
}

// AUTO-EXECUTE ANALYSIS
console.log('🎯 Initializing JavaScript Event Blocking Analysis...');
const analyst = new JavaScriptEventBlockingAnalyst();
analyst.runCompleteAnalysis();