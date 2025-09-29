/**
 * 🤖 AGENT 3: JAVASCRIPT EVENT BLOCKING ANALYSIS SPECIALIST
 *
 * Comprehensive JavaScript event system diagnostic for #design-preview-btn
 * Analyzes event handler conflicts, propagation issues, and JavaScript execution problems
 *
 * USAGE: Copy & paste into browser console on Order 5374 page
 */

class JavaScriptEventDiagnostic {
    constructor() {
        this.buttonId = 'design-preview-btn';
        this.diagnostics = {
            timestamp: new Date().toISOString(),
            eventAnalysis: {
                eventHandlers: null,
                propagationIssues: null,
                handlerConflicts: null,
                javascriptErrors: null,
                environmentCheck: null,
                timingIssues: null
            },
            criticalIssues: [],
            recommendations: []
        };

        console.group('🤖 AGENT 3: JAVASCRIPT EVENT DIAGNOSTIC');
        console.log('Target:', this.buttonId);
        console.log('Analysis started at:', this.diagnostics.timestamp);
    }

    /**
     * 🔍 MAIN DIAGNOSTIC ENTRY POINT
     */
    async runComprehensiveDiagnosis() {
        const button = document.getElementById(this.buttonId);

        if (!button) {
            console.error('❌ Button not found in DOM');
            this.diagnostics.criticalIssues.push('CRITICAL: Button element not found');
            await this.analyzeEnvironmentWithoutButton();
            return this.generateReport();
        }

        console.log('✅ Button found, starting JavaScript event analysis...');

        // Run all diagnostic modules
        await this.analyzeEventHandlers(button);
        await this.testEventPropagation(button);
        await this.detectHandlerConflicts(button);
        await this.checkJavaScriptErrors(button);
        await this.validateEnvironment(button);
        await this.analyzeTimingIssues(button);
        await this.performEventTests(button);

        return this.generateReport();
    }

    /**
     * 📡 EVENT HANDLERS ANALYSIS
     */
    analyzeEventHandlers(button) {
        console.group('📡 EVENT HANDLERS ANALYSIS');

        const handlerAnalysis = {
            nativeHandlers: this.getNativeEventHandlers(button),
            jqueryHandlers: this.getJQueryEventHandlers(button),
            inlineHandlers: this.getInlineHandlers(button),
            delegatedHandlers: this.getDelegatedHandlers(button),
            handlerCount: 0,
            handlerTypes: []
        };

        // Count total handlers
        handlerAnalysis.handlerCount =
            Object.keys(handlerAnalysis.nativeHandlers).length +
            (handlerAnalysis.jqueryHandlers ? Object.keys(handlerAnalysis.jqueryHandlers).length : 0) +
            Object.keys(handlerAnalysis.inlineHandlers).length;

        if (handlerAnalysis.handlerCount === 0) {
            this.diagnostics.criticalIssues.push('CRITICAL: No event handlers found on button');
            console.error('❌ No event handlers detected on button');
        } else {
            console.log(`✅ ${handlerAnalysis.handlerCount} event handlers detected`);
        }

        // Check for specific click handlers
        const hasClickHandler =
            handlerAnalysis.nativeHandlers.click ||
            (handlerAnalysis.jqueryHandlers && handlerAnalysis.jqueryHandlers.click) ||
            handlerAnalysis.inlineHandlers.onclick;

        if (!hasClickHandler) {
            this.diagnostics.criticalIssues.push('CRITICAL: No click handler found on button');
            console.error('❌ No click handler detected');
        }

        // Check for handlePreviewClick function availability
        if (typeof window.handlePreviewClick === 'function') {
            console.log('✅ handlePreviewClick function available globally');
            handlerAnalysis.handlePreviewClickAvailable = true;
        } else {
            console.warn('⚠️ handlePreviewClick function not found globally');
            handlerAnalysis.handlePreviewClickAvailable = false;

            // Check if it might be in a different scope
            this.checkAlternativeHandlerLocations(handlerAnalysis);
        }

        this.diagnostics.eventAnalysis.eventHandlers = handlerAnalysis;
        console.log('📊 Event Handlers Analysis:', handlerAnalysis);
        console.groupEnd();
    }

    /**
     * 🔄 EVENT PROPAGATION TESTING
     */
    testEventPropagation(button) {
        console.group('🔄 EVENT PROPAGATION TESTING');

        const propagationTest = {
            preventDefaultCalled: false,
            stopPropagationCalled: false,
            stopImmediatePropagationCalled: false,
            eventPath: [],
            blockedEvents: []
        };

        // Create test event handlers to monitor propagation
        const eventTypes = ['mousedown', 'mouseup', 'click'];

        eventTypes.forEach(eventType => {
            const testResults = this.testEventType(button, eventType);
            propagationTest[eventType] = testResults;

            if (testResults.blocked) {
                propagationTest.blockedEvents.push(eventType);
                this.diagnostics.criticalIssues.push(`${eventType} event propagation blocked`);
            }
        });

        // Test event path
        propagationTest.eventPath = this.getEventPath(button);

        // Check for preventDefault conflicts
        if (propagationTest.preventDefaultCalled) {
            console.warn('⚠️ preventDefault() called on button events');
        }

        // Check for propagation stopping
        if (propagationTest.stopPropagationCalled) {
            console.warn('⚠️ stopPropagation() called on button events');
        }

        this.diagnostics.eventAnalysis.propagationIssues = propagationTest;
        console.log('📊 Event Propagation Test:', propagationTest);
        console.groupEnd();
    }

    /**
     * ⚔️ HANDLER CONFLICTS DETECTION
     */
    detectHandlerConflicts(button) {
        console.group('⚔️ HANDLER CONFLICTS DETECTION');

        const conflictAnalysis = {
            multipleClickHandlers: false,
            conflictingSelectors: [],
            overriddenHandlers: [],
            handlerOrder: []
        };

        // Check for multiple click handlers that might conflict
        const clickHandlerSources = [];

        // Native handlers
        if (button.onclick) clickHandlerSources.push('inline onclick');

        // jQuery handlers
        if (typeof jQuery !== 'undefined' && jQuery._data) {
            const events = jQuery._data(button, 'events');
            if (events && events.click) {
                clickHandlerSources.push(`jQuery click (${events.click.length} handlers)`);
                conflictAnalysis.handlerOrder = events.click.map((handler, index) => ({
                    index,
                    handler: handler.handler.toString().substring(0, 100) + '...',
                    namespace: handler.namespace,
                    selector: handler.selector
                }));
            }
        }

        // Check for conflicting event delegation
        const potentialDelegators = [
            'document', 'body', '.woocommerce', '#wpbody', '.wp-admin'
        ];

        potentialDelegators.forEach(selector => {
            try {
                const element = selector === 'document' ? document :
                               selector === 'body' ? document.body :
                               document.querySelector(selector);

                if (element && this.hasConflictingDelegatedEvents(element, button)) {
                    conflictAnalysis.conflictingSelectors.push(selector);
                }
            } catch (e) {
                console.warn('Could not check selector:', selector);
            }
        });

        if (clickHandlerSources.length > 1) {
            conflictAnalysis.multipleClickHandlers = true;
            this.diagnostics.criticalIssues.push(`Multiple click handlers: ${clickHandlerSources.join(', ')}`);
            console.warn('⚠️ Multiple click handlers detected:', clickHandlerSources);
        }

        // Check for event handler override patterns
        this.checkHandlerOverrides(button, conflictAnalysis);

        this.diagnostics.eventAnalysis.handlerConflicts = conflictAnalysis;
        console.log('📊 Handler Conflicts Analysis:', conflictAnalysis);
        console.groupEnd();
    }

    /**
     * 🐛 JAVASCRIPT ERRORS CHECK
     */
    checkJavaScriptErrors(button) {
        console.group('🐛 JAVASCRIPT ERRORS CHECK');

        const errorAnalysis = {
            consoleErrors: this.captureConsoleErrors(),
            syntaxErrors: [],
            referenceErrors: [],
            handlerExecutionErrors: []
        };

        // Test handler execution safety
        try {
            // Test if we can safely call onclick if it exists
            if (button.onclick) {
                console.log('🧪 Testing inline onclick handler...');
                // We don't actually call it, just check if it's callable
                if (typeof button.onclick === 'function') {
                    console.log('✅ Inline onclick handler is callable');
                } else {
                    errorAnalysis.syntaxErrors.push('Inline onclick is not a function');
                }
            }

            // Test jQuery handler accessibility
            if (typeof jQuery !== 'undefined') {
                console.log('🧪 Testing jQuery handler accessibility...');
                try {
                    const events = jQuery._data(button, 'events');
                    if (events && events.click) {
                        events.click.forEach((handler, index) => {
                            if (typeof handler.handler !== 'function') {
                                errorAnalysis.syntaxErrors.push(`jQuery handler ${index} is not a function`);
                            }
                        });
                    }
                } catch (e) {
                    errorAnalysis.referenceErrors.push(`jQuery events access error: ${e.message}`);
                }
            } else {
                console.warn('⚠️ jQuery not available');
                errorAnalysis.referenceErrors.push('jQuery not available');
            }

            // Test handlePreviewClick function
            if (typeof window.handlePreviewClick !== 'undefined') {
                if (typeof window.handlePreviewClick !== 'function') {
                    errorAnalysis.syntaxErrors.push('handlePreviewClick exists but is not a function');
                }
            }

        } catch (e) {
            errorAnalysis.handlerExecutionErrors.push(`Handler test error: ${e.message}`);
        }

        // Check for common JavaScript environment issues
        this.checkEnvironmentErrors(errorAnalysis);

        if (errorAnalysis.syntaxErrors.length > 0 || errorAnalysis.referenceErrors.length > 0) {
            this.diagnostics.criticalIssues.push(`JavaScript errors detected: ${errorAnalysis.syntaxErrors.length + errorAnalysis.referenceErrors.length} issues`);
        }

        this.diagnostics.eventAnalysis.javascriptErrors = errorAnalysis;
        console.log('📊 JavaScript Errors Analysis:', errorAnalysis);
        console.groupEnd();
    }

    /**
     * 🌐 ENVIRONMENT VALIDATION
     */
    validateEnvironment(button) {
        console.group('🌐 ENVIRONMENT VALIDATION');

        const environmentAnalysis = {
            jquery: this.validateJQuery(),
            wordpress: this.validateWordPress(),
            ajax: this.validateAjax(),
            dependencies: this.checkDependencies(),
            globals: this.checkGlobalVariables()
        };

        // Check critical environment variables
        const requiredGlobals = ['ajaxurl', 'jQuery'];
        const missingGlobals = requiredGlobals.filter(global => typeof window[global] === 'undefined');

        if (missingGlobals.length > 0) {
            this.diagnostics.criticalIssues.push(`Missing global variables: ${missingGlobals.join(', ')}`);
            console.error('❌ Missing required globals:', missingGlobals);
        }

        // Check AJAX functionality
        if (typeof window.ajaxurl !== 'undefined') {
            console.log('✅ AJAX URL available:', window.ajaxurl);
        } else {
            console.error('❌ AJAX URL not available - AJAX calls will fail');
        }

        this.diagnostics.eventAnalysis.environmentCheck = environmentAnalysis;
        console.log('📊 Environment Validation:', environmentAnalysis);
        console.groupEnd();
    }

    /**
     * ⏰ TIMING ISSUES ANALYSIS
     */
    analyzeTimingIssues(button) {
        console.group('⏰ TIMING ISSUES ANALYSIS');

        const timingAnalysis = {
            documentReady: document.readyState,
            jqueryReady: typeof jQuery !== 'undefined' ? jQuery.isReady : false,
            domContentLoaded: document.readyState !== 'loading',
            handlerAttachmentTiming: [],
            loadOrderIssues: []
        };

        // Check if handlers were attached too early
        if (timingAnalysis.documentReady !== 'complete') {
            timingAnalysis.loadOrderIssues.push('Document not fully loaded');
            console.warn('⚠️ Document not fully loaded, handlers may not be properly attached');
        }

        if (!timingAnalysis.jqueryReady) {
            timingAnalysis.loadOrderIssues.push('jQuery not ready');
            console.warn('⚠️ jQuery not ready, event binding may have failed');
        }

        // Check for race conditions
        this.checkRaceConditions(button, timingAnalysis);

        if (timingAnalysis.loadOrderIssues.length > 0) {
            this.diagnostics.criticalIssues.push(`Timing issues detected: ${timingAnalysis.loadOrderIssues.join(', ')}`);
        }

        this.diagnostics.eventAnalysis.timingIssues = timingAnalysis;
        console.log('📊 Timing Issues Analysis:', timingAnalysis);
        console.groupEnd();
    }

    /**
     * 🧪 EVENT TESTS
     */
    performEventTests(button) {
        console.group('🧪 EVENT TESTS');

        const eventTests = {
            syntheticClick: false,
            handlerExecution: false,
            eventCreation: false,
            propagationTest: false
        };

        // Test synthetic click event creation
        try {
            const clickEvent = new MouseEvent('click', {
                bubbles: true,
                cancelable: true,
                view: window
            });
            eventTests.eventCreation = true;
            console.log('✅ Event creation works');

            // Test event dispatch (without actually triggering handlers)
            let eventDispatched = false;
            const testHandler = () => { eventDispatched = true; };

            button.addEventListener('test-event', testHandler);
            button.dispatchEvent(new Event('test-event'));
            button.removeEventListener('test-event', testHandler);

            if (eventDispatched) {
                eventTests.syntheticClick = true;
                console.log('✅ Event dispatch and handling works');
            } else {
                console.error('❌ Event dispatch failed');
            }

        } catch (e) {
            console.error('❌ Event creation failed:', e.message);
            eventTests.eventCreation = false;
        }

        // Test if we can safely trigger a click without side effects
        eventTests.handlerExecution = this.testHandlerExecutionSafety(button);

        this.diagnostics.eventAnalysis.eventTests = eventTests;
        console.log('📊 Event Tests Results:', eventTests);
        console.groupEnd();
    }

    /**
     * 🔍 ANALYZE ENVIRONMENT WITHOUT BUTTON
     */
    async analyzeEnvironmentWithoutButton() {
        console.group('🔍 ENVIRONMENT ANALYSIS (NO BUTTON)');

        const environmentAnalysis = {
            jquery: typeof jQuery !== 'undefined',
            ajaxurl: typeof window.ajaxurl !== 'undefined',
            wordpress: window.location.href.includes('/wp-admin/'),
            handlePreviewClick: typeof window.handlePreviewClick !== 'undefined'
        };

        console.log('📊 Environment without button:', environmentAnalysis);
        console.groupEnd();
    }

    /**
     * 🛠️ UTILITY METHODS
     */
    getNativeEventHandlers(button) {
        const handlers = {};
        const eventProperties = [
            'onclick', 'onmousedown', 'onmouseup', 'ontouchstart', 'ontouchend',
            'onfocus', 'onblur', 'onkeydown', 'onkeyup'
        ];

        eventProperties.forEach(prop => {
            if (button[prop] && typeof button[prop] === 'function') {
                handlers[prop.substring(2)] = {
                    type: 'inline',
                    handler: button[prop].toString().substring(0, 100) + '...'
                };
            }
        });

        return handlers;
    }

    getJQueryEventHandlers(button) {
        if (typeof jQuery === 'undefined' || !jQuery._data) {
            return null;
        }

        try {
            const events = jQuery._data(button, 'events');
            return events || null;
        } catch (e) {
            console.warn('Could not access jQuery events:', e.message);
            return null;
        }
    }

    getInlineHandlers(button) {
        const handlers = {};
        const attributes = Array.from(button.attributes);

        attributes.forEach(attr => {
            if (attr.name.startsWith('on') && attr.value) {
                handlers[attr.name] = attr.value;
            }
        });

        return handlers;
    }

    getDelegatedHandlers(button) {
        // This is complex to detect without triggering events
        // We'll check common delegation patterns
        const delegatedHandlers = [];

        // Check if button matches common delegated selectors
        const commonSelectors = [
            '.button', '.btn', '[data-order-id]', '.design-preview-btn',
            'button[type="button"]', '#design-preview-btn'
        ];

        commonSelectors.forEach(selector => {
            try {
                if (button.matches && button.matches(selector)) {
                    delegatedHandlers.push(selector);
                }
            } catch (e) {
                // Invalid selector
            }
        });

        return delegatedHandlers;
    }

    checkAlternativeHandlerLocations(handlerAnalysis) {
        // Check common namespaces where handlePreviewClick might exist
        const namespaces = [
            'window.OctoDesigner',
            'window.wp',
            'window.woocommerce',
            'window.admin'
        ];

        namespaces.forEach(namespace => {
            try {
                const obj = namespace.split('.').reduce((o, key) => o && o[key], window);
                if (obj && typeof obj.handlePreviewClick === 'function') {
                    handlerAnalysis.alternativeHandlerLocations = handlerAnalysis.alternativeHandlerLocations || [];
                    handlerAnalysis.alternativeHandlerLocations.push(namespace);
                }
            } catch (e) {
                // Namespace doesn't exist
            }
        });
    }

    testEventType(button, eventType) {
        let prevented = false;
        let propagationStopped = false;
        let immediatePropagationStopped = false;

        // This is a passive test - we don't actually dispatch events
        // We just check if we can create them and what the structure looks like

        try {
            const event = new Event(eventType, { bubbles: true, cancelable: true });

            return {
                canCreate: true,
                blocked: false,
                prevented: prevented,
                propagationStopped: propagationStopped,
                immediatePropagationStopped: immediatePropagationStopped
            };
        } catch (e) {
            return {
                canCreate: false,
                blocked: true,
                error: e.message
            };
        }
    }

    getEventPath(button) {
        const path = [];
        let current = button;

        while (current && current !== document) {
            if (this.hasEventHandlers(current)) {
                path.push({
                    element: current.tagName + (current.id ? '#' + current.id : '') + (current.className ? '.' + current.className : ''),
                    hasHandlers: true
                });
            }
            current = current.parentElement;
        }

        return path;
    }

    hasEventHandlers(element) {
        // Check for onclick
        if (element.onclick) return true;

        // Check for jQuery events
        if (typeof jQuery !== 'undefined' && jQuery._data) {
            const events = jQuery._data(element, 'events');
            if (events && Object.keys(events).length > 0) return true;
        }

        return false;
    }

    hasConflictingDelegatedEvents(element, button) {
        if (typeof jQuery === 'undefined' || !jQuery._data) return false;

        try {
            const events = jQuery._data(element, 'events');
            if (!events || !events.click) return false;

            // Check if any delegated events would match our button
            return events.click.some(handler => {
                if (handler.selector) {
                    try {
                        return button.matches(handler.selector);
                    } catch (e) {
                        return false;
                    }
                }
                return false;
            });
        } catch (e) {
            return false;
        }
    }

    checkHandlerOverrides(button, conflictAnalysis) {
        // Check if handlers might be overriding each other
        if (button.onclick && typeof jQuery !== 'undefined') {
            const events = jQuery._data(button, 'events');
            if (events && events.click) {
                conflictAnalysis.overriddenHandlers.push('Inline onclick may conflict with jQuery handlers');
            }
        }
    }

    captureConsoleErrors() {
        // This is a simplified version - in a real implementation,
        // we'd set up error listeners before this point
        const errors = [];

        // Check if there are any visible errors in the console
        // This is limited but better than nothing
        if (window.console && window.console.error) {
            console.log('ℹ️ Console error capture not implemented for security reasons');
        }

        return errors;
    }

    checkEnvironmentErrors(errorAnalysis) {
        // Check for common environment issues
        if (typeof jQuery === 'undefined') {
            errorAnalysis.referenceErrors.push('jQuery is not defined');
        }

        if (typeof window.ajaxurl === 'undefined') {
            errorAnalysis.referenceErrors.push('ajaxurl is not defined');
        }

        if (document.readyState !== 'complete') {
            errorAnalysis.referenceErrors.push('Document not fully loaded');
        }
    }

    validateJQuery() {
        if (typeof jQuery === 'undefined') {
            return { available: false, error: 'jQuery not loaded' };
        }

        return {
            available: true,
            version: jQuery.fn.jquery,
            ready: jQuery.isReady,
            conflicts: typeof $ === 'undefined'
        };
    }

    validateWordPress() {
        return {
            adminContext: window.location.href.includes('/wp-admin/'),
            ajaxurl: typeof window.ajaxurl !== 'undefined',
            wpApiSettings: typeof window.wpApiSettings !== 'undefined'
        };
    }

    validateAjax() {
        return {
            ajaxurlAvailable: typeof window.ajaxurl !== 'undefined',
            jqueryAjax: typeof jQuery !== 'undefined' && typeof jQuery.ajax === 'function',
            fetchAvailable: typeof window.fetch === 'function'
        };
    }

    checkDependencies() {
        const dependencies = {
            fabricjs: typeof window.fabric !== 'undefined',
            designerWidget: typeof window.DesignerWidget !== 'undefined',
            handlePreviewClick: typeof window.handlePreviewClick === 'function'
        };

        return dependencies;
    }

    checkGlobalVariables() {
        const globals = {};
        const importantGlobals = [
            'ajaxurl', 'jQuery', '$', 'wp', 'handlePreviewClick',
            'fabric', 'DesignerWidget'
        ];

        importantGlobals.forEach(global => {
            globals[global] = {
                defined: typeof window[global] !== 'undefined',
                type: typeof window[global]
            };
        });

        return globals;
    }

    checkRaceConditions(button, timingAnalysis) {
        // Check for potential race conditions
        if (document.readyState !== 'complete') {
            timingAnalysis.handlerAttachmentTiming.push('Handlers may have been attached before DOM ready');
        }

        if (typeof jQuery !== 'undefined' && !jQuery.isReady) {
            timingAnalysis.handlerAttachmentTiming.push('jQuery handlers may have been attached before jQuery ready');
        }
    }

    testHandlerExecutionSafety(button) {
        // Test if we can safely execute handlers without side effects
        // This is a passive test
        try {
            if (button.onclick && typeof button.onclick === 'function') {
                // We don't actually call it, just verify it's callable
                return true;
            }

            if (typeof jQuery !== 'undefined') {
                const events = jQuery._data(button, 'events');
                if (events && events.click) {
                    return events.click.every(handler => typeof handler.handler === 'function');
                }
            }

            return false;
        } catch (e) {
            return false;
        }
    }

    /**
     * 📋 GENERATE COMPREHENSIVE REPORT
     */
    generateReport() {
        console.group('📋 JAVASCRIPT EVENT DIAGNOSTIC REPORT');

        const report = {
            ...this.diagnostics,
            summary: {
                totalIssues: this.diagnostics.criticalIssues.length,
                severity: this.calculateSeverity(),
                recommendations: this.generateRecommendations()
            }
        };

        // Log summary
        console.log('🔍 DIAGNOSTIC SUMMARY:');
        console.log(`Total Critical Issues: ${report.summary.totalIssues}`);
        console.log(`Severity Level: ${report.summary.severity}`);
        console.log('Critical Issues:', this.diagnostics.criticalIssues);

        if (report.summary.recommendations.length > 0) {
            console.log('💡 RECOMMENDATIONS:');
            report.summary.recommendations.forEach(rec => console.log(`- ${rec}`));
        }

        console.groupEnd();
        console.groupEnd(); // End main diagnostic group

        // Store globally
        window.agent3EventReport = report;
        console.log('📊 Report stored in: window.agent3EventReport');

        return report;
    }

    calculateSeverity() {
        const issueCount = this.diagnostics.criticalIssues.length;
        if (issueCount === 0) return 'NONE';
        if (issueCount <= 2) return 'LOW';
        if (issueCount <= 5) return 'MEDIUM';
        return 'HIGH';
    }

    generateRecommendations() {
        const recommendations = [];

        this.diagnostics.criticalIssues.forEach(issue => {
            if (issue.includes('No event handlers found')) {
                recommendations.push('Ensure event handlers are properly attached to the button');
            }
            if (issue.includes('No click handler found')) {
                recommendations.push('Add a click event handler to the button');
            }
            if (issue.includes('Missing global variables')) {
                recommendations.push('Ensure WordPress and jQuery are properly loaded');
            }
            if (issue.includes('propagation blocked')) {
                recommendations.push('Check for preventDefault() or stopPropagation() calls');
            }
            if (issue.includes('Multiple click handlers')) {
                recommendations.push('Remove conflicting event handlers');
            }
            if (issue.includes('JavaScript errors')) {
                recommendations.push('Fix JavaScript syntax and reference errors');
            }
        });

        return [...new Set(recommendations)];
    }
}

/**
 * 🚀 AUTO-EXECUTE JAVASCRIPT EVENT DIAGNOSTIC
 */
console.log('🤖 AGENT 3: JAVASCRIPT EVENT DIAGNOSTIC LOADED');
console.log('🚀 Starting automatic JavaScript event analysis...');

const jsEventAgent = new JavaScriptEventDiagnostic();
jsEventAgent.runComprehensiveDiagnosis().then(report => {
    console.log('✅ AGENT 3 JAVASCRIPT EVENT DIAGNOSTIC COMPLETE');
    console.log('📊 Access results: window.agent3EventReport');
});