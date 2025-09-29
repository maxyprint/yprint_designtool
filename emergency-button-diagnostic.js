/**
 * 🚨 EMERGENCY BUTTON DIAGNOSTIC SPECIALIST
 *
 * Immediate DOM element and event handler emergency diagnosis
 * for #design-preview-btn button failure
 */

class EmergencyButtonDiagnostic {
    constructor() {
        this.buttonId = 'design-preview-btn';
        this.diagnostics = {
            timestamp: new Date().toISOString(),
            environment: {
                jQuery: typeof jQuery !== 'undefined' ? jQuery.fn.jquery : 'NOT_AVAILABLE',
                ajaxurl: typeof ajaxurl !== 'undefined' ? 'AVAILABLE' : 'NOT_AVAILABLE',
                location: window.location.href,
                userAgent: navigator.userAgent.substring(0, 100)
            },
            buttonElement: null,
            eventHandlers: null,
            domState: null,
            accessibility: null,
            errors: []
        };

        console.group('🚨 EMERGENCY BUTTON DIAGNOSTIC INITIATED');
        console.log('🔍 Target Button:', this.buttonId);
        console.log('⏰ Timestamp:', this.diagnostics.timestamp);
        console.log('🌐 Environment:', this.diagnostics.environment);
    }

    /**
     * CRITICAL: Verify button element exists and analyze structure
     */
    analyzeButtonElement() {
        console.group('🔘 BUTTON ELEMENT ANALYSIS');

        try {
            // Multiple detection methods
            const detectionMethods = {
                getElementById: document.getElementById(this.buttonId),
                querySelector: document.querySelector(`#${this.buttonId}`),
                queryByClass: document.querySelector('.design-preview-btn'),
                dataOrderId: document.querySelector('[data-order-id]'),
                jQuerySelector: typeof jQuery !== 'undefined' ? jQuery(`#${this.buttonId}`)[0] : null
            };

            console.log('🔍 Button Detection Methods:', detectionMethods);

            const buttonElement = detectionMethods.getElementById ||
                                  detectionMethods.querySelector ||
                                  detectionMethods.queryByClass;

            if (!buttonElement) {
                this.diagnostics.errors.push('CRITICAL: Button element not found in DOM');
                console.error('❌ CRITICAL: Button element not found in DOM');
                this.diagnostics.buttonElement = { exists: false };
                return false;
            }

            // Analyze button properties
            const buttonAnalysis = {
                exists: true,
                element: buttonElement,
                id: buttonElement.id,
                className: buttonElement.className,
                tagName: buttonElement.tagName,
                type: buttonElement.type,
                disabled: buttonElement.disabled,
                attributes: this.getElementAttributes(buttonElement),
                computedStyles: this.getComputedStyles(buttonElement),
                position: this.getElementPosition(buttonElement),
                dimensions: this.getElementDimensions(buttonElement),
                visibility: this.checkElementVisibility(buttonElement),
                textContent: buttonElement.textContent.trim(),
                innerHTML: buttonElement.innerHTML,
                parentElement: buttonElement.parentElement ? {
                    tagName: buttonElement.parentElement.tagName,
                    className: buttonElement.parentElement.className,
                    id: buttonElement.parentElement.id
                } : null
            };

            this.diagnostics.buttonElement = buttonAnalysis;

            console.log('✅ Button Element Found:', buttonAnalysis);

            // Validate critical attributes
            const criticalValidation = {
                hasCorrectId: buttonElement.id === this.buttonId,
                hasOrderIdData: buttonElement.hasAttribute('data-order-id'),
                orderIdValue: buttonElement.getAttribute('data-order-id'),
                isEnabled: !buttonElement.disabled,
                isVisible: !buttonElement.style.display || buttonElement.style.display !== 'none',
                hasClickableClass: buttonElement.className.includes('button'),
                hasProperAria: buttonElement.hasAttribute('aria-label')
            };

            console.log('🔍 Critical Validation:', criticalValidation);

            return buttonElement;

        } catch (error) {
            this.diagnostics.errors.push(`Button analysis error: ${error.message}`);
            console.error('❌ Button analysis failed:', error);
            return false;
        } finally {
            console.groupEnd();
        }
    }

    /**
     * CRITICAL: Analyze event handler attachment
     */
    analyzeEventHandlers() {
        console.group('⚡ EVENT HANDLER ANALYSIS');

        try {
            const buttonElement = document.getElementById(this.buttonId);

            if (!buttonElement) {
                console.error('❌ Cannot analyze events - button not found');
                return false;
            }

            const eventAnalysis = {
                nativeOnClick: buttonElement.onclick !== null,
                nativeEventListeners: this.getNativeEventListeners(buttonElement),
                jQueryEvents: this.getJQueryEvents(buttonElement),
                eventDelegation: this.testEventDelegation(buttonElement),
                clickSimulation: this.testClickSimulation(buttonElement)
            };

            this.diagnostics.eventHandlers = eventAnalysis;

            console.log('📋 Event Handler Analysis:', eventAnalysis);

            // Test specific jQuery event binding
            if (typeof jQuery !== 'undefined') {
                const $button = jQuery(`#${this.buttonId}`);
                const jQueryData = $button.data();
                const jQueryEvents = jQuery._data(buttonElement, 'events');

                console.log('🔍 jQuery Data:', jQueryData);
                console.log('🔍 jQuery Events:', jQueryEvents);

                eventAnalysis.jQuerySpecific = {
                    dataExists: Object.keys(jQueryData).length > 0,
                    eventsExists: jQueryEvents !== undefined,
                    eventTypes: jQueryEvents ? Object.keys(jQueryEvents) : [],
                    clickHandlers: jQueryEvents && jQueryEvents.click ? jQueryEvents.click.length : 0
                };
            }

            return eventAnalysis;

        } catch (error) {
            this.diagnostics.errors.push(`Event handler analysis error: ${error.message}`);
            console.error('❌ Event handler analysis failed:', error);
            return false;
        } finally {
            console.groupEnd();
        }
    }

    /**
     * CRITICAL: Test DOM state and timing
     */
    analyzeDOMState() {
        console.group('🏗️ DOM STATE ANALYSIS');

        try {
            const domAnalysis = {
                readyState: document.readyState,
                loadTime: performance.timing ?
                    performance.timing.loadEventEnd - performance.timing.navigationStart : 'unknown',
                elementsLoaded: document.querySelectorAll('*').length,
                scriptsLoaded: document.querySelectorAll('script').length,
                jQueryReady: typeof jQuery !== 'undefined' && jQuery.isReady,
                documentHeight: document.documentElement.scrollHeight,
                viewportHeight: window.innerHeight,
                buttonPosition: this.getButtonPositionInDOM()
            };

            this.diagnostics.domState = domAnalysis;

            console.log('📊 DOM State:', domAnalysis);

            // Check for timing issues
            const timingIssues = this.checkTimingIssues();
            console.log('⏱️ Timing Issues:', timingIssues);

            return domAnalysis;

        } catch (error) {
            this.diagnostics.errors.push(`DOM state analysis error: ${error.message}`);
            console.error('❌ DOM state analysis failed:', error);
            return false;
        } finally {
            console.groupEnd();
        }
    }

    /**
     * CRITICAL: Test button accessibility and interaction
     */
    analyzeAccessibility() {
        console.group('♿ ACCESSIBILITY ANALYSIS');

        try {
            const buttonElement = document.getElementById(this.buttonId);

            if (!buttonElement) {
                console.error('❌ Cannot analyze accessibility - button not found');
                return false;
            }

            const accessibilityAnalysis = {
                tabIndex: buttonElement.tabIndex,
                ariaLabel: buttonElement.getAttribute('aria-label'),
                ariaDisabled: buttonElement.getAttribute('aria-disabled'),
                role: buttonElement.getAttribute('role'),
                focusable: this.testFocusability(buttonElement),
                keyboardAccessible: this.testKeyboardAccess(buttonElement),
                pointerEvents: this.getComputedStyle(buttonElement, 'pointer-events'),
                zIndex: this.getComputedStyle(buttonElement, 'z-index'),
                opacity: this.getComputedStyle(buttonElement, 'opacity'),
                visibility: this.getComputedStyle(buttonElement, 'visibility'),
                display: this.getComputedStyle(buttonElement, 'display')
            };

            this.diagnostics.accessibility = accessibilityAnalysis;

            console.log('♿ Accessibility Analysis:', accessibilityAnalysis);

            return accessibilityAnalysis;

        } catch (error) {
            this.diagnostics.errors.push(`Accessibility analysis error: ${error.message}`);
            console.error('❌ Accessibility analysis failed:', error);
            return false;
        } finally {
            console.groupEnd();
        }
    }

    /**
     * EMERGENCY: Attempt to fix button immediately
     */
    emergencyButtonFix() {
        console.group('🚑 EMERGENCY BUTTON FIX');

        try {
            const buttonElement = document.getElementById(this.buttonId);

            if (!buttonElement) {
                console.error('❌ Cannot fix button - element not found');
                return false;
            }

            console.log('🔧 Attempting emergency button fix...');

            // 1. Ensure button is enabled
            if (buttonElement.disabled) {
                buttonElement.disabled = false;
                console.log('✅ Button enabled');
            }

            // 2. Ensure proper styles
            buttonElement.style.pointerEvents = 'auto';
            buttonElement.style.opacity = '1';
            buttonElement.style.visibility = 'visible';
            buttonElement.style.display = 'inline-block';
            console.log('✅ Button styles corrected');

            // 3. Add emergency click handler
            buttonElement.addEventListener('click', function(event) {
                console.log('🚨 EMERGENCY CLICK HANDLER TRIGGERED');
                console.log('🔍 Event:', event);
                console.log('🔍 Target:', event.target);
                console.log('🔍 Order ID:', event.target.getAttribute('data-order-id'));

                // Call original handler if available
                if (typeof handlePreviewClick === 'function') {
                    console.log('📞 Calling original handlePreviewClick function');
                    handlePreviewClick(typeof jQuery !== 'undefined' ? jQuery(event.target) : event.target);
                } else {
                    console.warn('⚠️ Original handlePreviewClick function not found');
                }
            });

            console.log('✅ Emergency click handler attached');

            // 4. Test the fix
            const testClick = new MouseEvent('click', {
                bubbles: true,
                cancelable: true,
                view: window
            });

            console.log('🧪 Testing emergency fix...');
            buttonElement.dispatchEvent(testClick);

            console.log('✅ Emergency button fix completed');
            return true;

        } catch (error) {
            console.error('❌ Emergency fix failed:', error);
            return false;
        } finally {
            console.groupEnd();
        }
    }

    // Helper methods

    getElementAttributes(element) {
        const attrs = {};
        for (let i = 0; i < element.attributes.length; i++) {
            const attr = element.attributes[i];
            attrs[attr.name] = attr.value;
        }
        return attrs;
    }

    getComputedStyles(element) {
        const computedStyle = window.getComputedStyle(element);
        return {
            display: computedStyle.display,
            visibility: computedStyle.visibility,
            opacity: computedStyle.opacity,
            pointerEvents: computedStyle.pointerEvents,
            position: computedStyle.position,
            zIndex: computedStyle.zIndex,
            top: computedStyle.top,
            left: computedStyle.left,
            width: computedStyle.width,
            height: computedStyle.height
        };
    }

    getElementPosition(element) {
        const rect = element.getBoundingClientRect();
        return {
            top: rect.top,
            left: rect.left,
            bottom: rect.bottom,
            right: rect.right,
            x: rect.x,
            y: rect.y
        };
    }

    getElementDimensions(element) {
        return {
            offsetWidth: element.offsetWidth,
            offsetHeight: element.offsetHeight,
            clientWidth: element.clientWidth,
            clientHeight: element.clientHeight,
            scrollWidth: element.scrollWidth,
            scrollHeight: element.scrollHeight
        };
    }

    checkElementVisibility(element) {
        const rect = element.getBoundingClientRect();
        const computedStyle = window.getComputedStyle(element);

        return {
            inViewport: rect.top >= 0 && rect.left >= 0 &&
                        rect.bottom <= window.innerHeight &&
                        rect.right <= window.innerWidth,
            hasSize: rect.width > 0 && rect.height > 0,
            displayNotNone: computedStyle.display !== 'none',
            visibilityVisible: computedStyle.visibility !== 'hidden',
            opacityVisible: parseFloat(computedStyle.opacity) > 0
        };
    }

    getNativeEventListeners(element) {
        // Browser-specific methods to get event listeners
        if (typeof getEventListeners === 'function') {
            return getEventListeners(element);
        }
        return 'Method not available in this browser';
    }

    getJQueryEvents(element) {
        if (typeof jQuery !== 'undefined') {
            return jQuery._data(element, 'events');
        }
        return 'jQuery not available';
    }

    testEventDelegation(element) {
        // Test if event delegation is working
        let delegationWorking = false;

        const testHandler = function(event) {
            if (event.target.id === element.id) {
                delegationWorking = true;
            }
        };

        document.addEventListener('click', testHandler);

        const clickEvent = new MouseEvent('click', {
            bubbles: true,
            cancelable: true
        });

        element.dispatchEvent(clickEvent);

        document.removeEventListener('click', testHandler);

        return delegationWorking;
    }

    testClickSimulation(element) {
        let clicked = false;

        const originalHandler = element.onclick;
        element.onclick = function() {
            clicked = true;
            if (originalHandler) {
                originalHandler.apply(this, arguments);
            }
        };

        element.click();

        element.onclick = originalHandler;

        return clicked;
    }

    getButtonPositionInDOM() {
        const buttonElement = document.getElementById(this.buttonId);
        if (!buttonElement) return null;

        const allElements = Array.from(document.querySelectorAll('*'));
        const position = allElements.indexOf(buttonElement);

        return {
            position: position,
            totalElements: allElements.length,
            percentage: Math.round((position / allElements.length) * 100)
        };
    }

    checkTimingIssues() {
        return {
            domReady: document.readyState === 'complete',
            jQueryReady: typeof jQuery !== 'undefined' && jQuery.isReady,
            imagesLoaded: Array.from(document.images).every(img => img.complete),
            scriptsLoaded: document.querySelectorAll('script[src]').length,
            timeSinceLoad: performance.now()
        };
    }

    testFocusability(element) {
        try {
            element.focus();
            return document.activeElement === element;
        } catch (error) {
            return false;
        }
    }

    testKeyboardAccess(element) {
        let keyboardAccessible = false;

        const keyHandler = function(event) {
            if (event.key === 'Enter' || event.key === ' ') {
                keyboardAccessible = true;
            }
        };

        element.addEventListener('keydown', keyHandler);

        const enterEvent = new KeyboardEvent('keydown', {
            key: 'Enter',
            bubbles: true
        });

        element.dispatchEvent(enterEvent);

        element.removeEventListener('keydown', keyHandler);

        return keyboardAccessible;
    }

    getComputedStyle(element, property) {
        return window.getComputedStyle(element).getPropertyValue(property);
    }

    /**
     * Run complete emergency diagnostic
     */
    runEmergencyDiagnostic() {
        console.group('🚨 COMPLETE EMERGENCY DIAGNOSTIC');

        try {
            console.log('🔍 Starting emergency button diagnostic...');

            // 1. Analyze button element
            const buttonExists = this.analyzeButtonElement();

            // 2. Analyze event handlers
            const eventsAnalyzed = this.analyzeEventHandlers();

            // 3. Analyze DOM state
            const domAnalyzed = this.analyzeDOMState();

            // 4. Analyze accessibility
            const accessibilityAnalyzed = this.analyzeAccessibility();

            // 5. Attempt emergency fix if needed
            if (!buttonExists || !eventsAnalyzed) {
                console.log('🚑 Issues detected - attempting emergency fix...');
                this.emergencyButtonFix();
            }

            // Generate emergency report
            const report = this.generateEmergencyReport();

            console.group('📊 EMERGENCY DIAGNOSTIC REPORT');
            console.log('🎯 Button Status:', report.status);
            console.log('🔍 Critical Issues:', report.criticalIssues);
            console.log('💡 Immediate Actions:', report.immediateActions);
            console.groupEnd();

            // Store report globally
            window.emergencyButtonDiagnostic = report;

            return report;

        } catch (error) {
            console.error('❌ Emergency diagnostic failed:', error);
            return null;
        } finally {
            console.groupEnd();
        }
    }

    generateEmergencyReport() {
        const buttonElement = document.getElementById(this.buttonId);
        const isWorking = buttonElement && !buttonElement.disabled &&
                         this.diagnostics.accessibility &&
                         this.diagnostics.accessibility.focusable;

        const criticalIssues = this.diagnostics.errors.length > 0 ?
                               this.diagnostics.errors :
                               ['No critical issues detected'];

        const immediateActions = [];

        if (!buttonElement) {
            immediateActions.push('Verify button HTML is being rendered');
            immediateActions.push('Check WooCommerce hook integration');
        }

        if (buttonElement && buttonElement.disabled) {
            immediateActions.push('Enable button element');
        }

        if (this.diagnostics.eventHandlers &&
            !this.diagnostics.eventHandlers.jQueryEvents) {
            immediateActions.push('Attach jQuery event handlers');
        }

        if (immediateActions.length === 0) {
            immediateActions.push('Button appears to be working correctly');
        }

        return {
            timestamp: this.diagnostics.timestamp,
            status: isWorking ? 'WORKING' : 'NEEDS_ATTENTION',
            buttonExists: !!buttonElement,
            criticalIssues,
            immediateActions,
            diagnostics: this.diagnostics,
            recommendations: [
                'Monitor console for JavaScript errors',
                'Verify WooCommerce order data integrity',
                'Test button functionality after each change',
                'Check browser developer tools for blocked requests'
            ]
        };
    }
}

// Auto-execute emergency diagnostic
if (typeof window !== 'undefined') {
    // Wait for DOM to be ready
    const runDiagnostic = function() {
        console.log('🚨 EMERGENCY BUTTON DIAGNOSTIC STARTING...');
        const diagnostic = new EmergencyButtonDiagnostic();
        return diagnostic.runEmergencyDiagnostic();
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', runDiagnostic);
    } else {
        // DOM already loaded
        setTimeout(runDiagnostic, 100);
    }
}

// Export for manual usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EmergencyButtonDiagnostic;
} else if (typeof window !== 'undefined') {
    window.EmergencyButtonDiagnostic = EmergencyButtonDiagnostic;
}