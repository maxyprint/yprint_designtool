/**
 * 🤖 AGENT 6: BROWSER COMPATIBILITY ANALYSIS SPECIALIST
 *
 * Comprehensive browser compatibility diagnostic agent for #design-preview-btn
 * Analyzes browser-specific issues and JavaScript execution problems
 * that could prevent proper button functionality across different browsers.
 */

class BrowserCompatibilityDiagnostic {
    constructor() {
        this.buttonId = 'design-preview-btn';
        this.diagnostics = {
            timestamp: new Date().toISOString(),
            browser: this.detectBrowser(),
            jsEngine: this.detectJSEngine(),
            compatibility: {},
            features: {},
            performance: {},
            security: {},
            css: {},
            events: {},
            errors: [],
            recommendations: []
        };

        console.group('🤖 AGENT 6: BROWSER COMPATIBILITY ANALYSIS SPECIALIST');
        console.log('🔍 Browser Detection:', this.diagnostics.browser);
        console.log('⚙️ JavaScript Engine:', this.diagnostics.jsEngine);
        console.log('⏰ Analysis Started:', this.diagnostics.timestamp);
    }

    /**
     * Detect browser type and version
     */
    detectBrowser() {
        const userAgent = navigator.userAgent;
        const vendor = navigator.vendor;

        let browser = {
            userAgent: userAgent,
            vendor: vendor,
            name: 'Unknown',
            version: 'Unknown',
            engine: 'Unknown',
            mobile: /Mobile|Android|iPhone|iPad/.test(userAgent),
            platform: navigator.platform
        };

        // Chrome/Chromium detection
        if (/Chrome\/(\d+)/.test(userAgent) && vendor.includes('Google')) {
            browser.name = 'Chrome';
            browser.version = userAgent.match(/Chrome\/(\d+)/)[1];
            browser.engine = 'Blink';
        }
        // Firefox detection
        else if (/Firefox\/(\d+)/.test(userAgent)) {
            browser.name = 'Firefox';
            browser.version = userAgent.match(/Firefox\/(\d+)/)[1];
            browser.engine = 'Gecko';
        }
        // Safari detection
        else if (/Safari\//.test(userAgent) && vendor.includes('Apple')) {
            browser.name = 'Safari';
            if (/Version\/(\d+)/.test(userAgent)) {
                browser.version = userAgent.match(/Version\/(\d+)/)[1];
            }
            browser.engine = 'WebKit';
        }
        // Edge detection
        else if (/Edg\/(\d+)/.test(userAgent)) {
            browser.name = 'Edge';
            browser.version = userAgent.match(/Edg\/(\d+)/)[1];
            browser.engine = 'Blink';
        }
        // Internet Explorer detection
        else if (/MSIE|Trident/.test(userAgent)) {
            browser.name = 'Internet Explorer';
            if (/MSIE (\d+)/.test(userAgent)) {
                browser.version = userAgent.match(/MSIE (\d+)/)[1];
            } else if (/rv:(\d+)/.test(userAgent)) {
                browser.version = userAgent.match(/rv:(\d+)/)[1];
            }
            browser.engine = 'Trident';
        }

        return browser;
    }

    /**
     * Detect JavaScript engine capabilities
     */
    detectJSEngine() {
        return {
            v8: typeof V8 !== 'undefined',
            spidermonkey: typeof Components !== 'undefined',
            chakra: typeof WScript !== 'undefined',
            jsc: typeof window !== 'undefined' && /WebKit/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent)
        };
    }

    /**
     * Test ES6+ feature compatibility
     */
    testJavaScriptCompatibility() {
        console.group('🔧 JAVASCRIPT COMPATIBILITY ANALYSIS');

        const jsFeatures = {
            // ES6 Features
            arrowFunctions: this.testArrowFunctions(),
            constLet: this.testConstLet(),
            templateLiterals: this.testTemplateLiterals(),
            destructuring: this.testDestructuring(),
            defaultParameters: this.testDefaultParameters(),
            restSpread: this.testRestSpread(),
            classes: this.testClasses(),

            // ES2017+ Features
            asyncAwait: this.testAsyncAwait(),
            promises: this.testPromises(),

            // Modern DOM APIs
            fetch: typeof fetch !== 'undefined',
            querySelector: typeof document.querySelector !== 'undefined',
            querySelectorAll: typeof document.querySelectorAll !== 'undefined',
            addEventListener: typeof Element.prototype.addEventListener !== 'undefined',

            // Event handling
            customEvents: this.testCustomEvents(),
            mouseEvents: this.testMouseEvents(),
            keyboardEvents: this.testKeyboardEvents(),

            // Array methods
            arrayForEach: Array.prototype.forEach !== undefined,
            arrayMap: Array.prototype.map !== undefined,
            arrayFilter: Array.prototype.filter !== undefined,
            arrayFind: Array.prototype.find !== undefined,
            arrayIncludes: Array.prototype.includes !== undefined,

            // Object methods
            objectAssign: typeof Object.assign !== 'undefined',
            objectKeys: typeof Object.keys !== 'undefined',
            objectEntries: typeof Object.entries !== 'undefined',

            // JSON support
            jsonParse: typeof JSON !== 'undefined' && typeof JSON.parse !== 'undefined',
            jsonStringify: typeof JSON !== 'undefined' && typeof JSON.stringify !== 'undefined',

            // Browser-specific APIs
            localStorage: this.testLocalStorage(),
            sessionStorage: this.testSessionStorage(),
            console: typeof console !== 'undefined',

            // jQuery compatibility
            jquery: typeof jQuery !== 'undefined' ? jQuery.fn.jquery : null,
            jqueryEvents: this.testJQueryEvents()
        };

        this.diagnostics.features = jsFeatures;

        // Analyze compatibility issues
        const issues = this.analyzeJSCompatibilityIssues(jsFeatures);

        console.log('📊 JavaScript Feature Support:', jsFeatures);
        console.log('⚠️ Compatibility Issues:', issues);

        console.groupEnd();
        return jsFeatures;
    }

    /**
     * Test CSS feature compatibility
     */
    testCSSCompatibility() {
        console.group('🎨 CSS COMPATIBILITY ANALYSIS');

        const cssFeatures = {
            // Layout
            flexbox: this.testCSSFeature('display', 'flex'),
            grid: this.testCSSFeature('display', 'grid'),

            // Transforms and animations
            transform: this.testCSSFeature('transform', 'translateX(0)'),
            transition: this.testCSSFeature('transition', 'all 0.3s'),
            animation: this.testCSSFeature('animation', 'none'),

            // Modern CSS
            customProperties: this.testCSSCustomProperties(),
            calc: this.testCSSFeature('width', 'calc(100% - 10px)'),

            // Vendor prefixes needed
            webkitTransform: this.testCSSFeature('-webkit-transform', 'translateX(0)'),
            mozTransform: this.testCSSFeature('-moz-transform', 'translateX(0)'),
            msTransform: this.testCSSFeature('-ms-transform', 'translateX(0)'),

            // Box model
            boxSizing: this.testCSSFeature('box-sizing', 'border-box'),

            // Colors
            rgba: this.testCSSFeature('color', 'rgba(255, 0, 0, 0.5)'),
            hsla: this.testCSSFeature('color', 'hsla(0, 100%, 50%, 0.5)'),

            // Pseudo-selectors
            pseudoSelectors: this.testPseudoSelectors(),

            // Media queries
            mediaQueries: this.testMediaQueries(),

            // Button-specific CSS features
            buttonFocus: this.testButtonFocusStyles(),
            buttonHover: this.testButtonHoverStyles(),
            buttonDisabled: this.testButtonDisabledStyles()
        };

        this.diagnostics.css = cssFeatures;

        // Check for missing vendor prefixes
        const prefixIssues = this.checkVendorPrefixes();

        console.log('🎨 CSS Feature Support:', cssFeatures);
        console.log('🔧 Vendor Prefix Issues:', prefixIssues);

        console.groupEnd();
        return cssFeatures;
    }

    /**
     * Test performance metrics and memory usage
     */
    testPerformanceMetrics() {
        console.group('⚡ PERFORMANCE ANALYSIS');

        const performance = {
            // Memory usage
            memoryUsage: this.getMemoryUsage(),

            // Timing API
            performanceSupported: typeof window.performance !== 'undefined',
            navigationTiming: this.getNavigationTiming(),

            // Resource loading
            resourceTiming: this.getResourceTiming(),

            // JavaScript execution timing
            jsExecutionTime: this.measureJSExecutionTime(),

            // DOM manipulation performance
            domPerformance: this.testDOMPerformance(),

            // Event handling performance
            eventPerformance: this.testEventPerformance()
        };

        this.diagnostics.performance = performance;

        console.log('⚡ Performance Metrics:', performance);

        console.groupEnd();
        return performance;
    }

    /**
     * Test browser security policies
     */
    testSecurityPolicies() {
        console.group('🔒 SECURITY POLICY ANALYSIS');

        const security = {
            // Content Security Policy
            csp: this.detectCSP(),

            // Same-origin policy
            sameOrigin: this.testSameOriginPolicy(),

            // CORS
            cors: this.testCORS(),

            // Feature Policy/Permissions Policy
            featurePolicy: this.detectFeaturePolicy(),

            // Secure contexts
            secureContext: window.isSecureContext || false,
            https: location.protocol === 'https:',

            // Mixed content
            mixedContent: this.detectMixedContent(),

            // Script execution
            evalAllowed: this.testEvalSupport(),
            inlineScripts: this.testInlineScriptExecution(),

            // AJAX restrictions
            ajaxRestrictions: this.testAjaxRestrictions()
        };

        this.diagnostics.security = security;

        console.log('🔒 Security Analysis:', security);

        console.groupEnd();
        return security;
    }

    /**
     * Test event handling compatibility
     */
    testEventHandling() {
        console.group('⚡ EVENT HANDLING ANALYSIS');

        const buttonElement = document.getElementById(this.buttonId);

        const events = {
            // Button element exists
            buttonExists: !!buttonElement,

            // Native event support
            nativeEvents: this.testNativeEventSupport(),

            // jQuery event support
            jqueryEvents: this.testJQueryEventSupport(),

            // Event delegation
            eventDelegation: this.testEventDelegation(),

            // Touch events (mobile)
            touchEvents: this.testTouchEventSupport(),

            // Pointer events
            pointerEvents: this.testPointerEventSupport(),

            // Focus events
            focusEvents: this.testFocusEventSupport(),

            // Custom events
            customEvents: this.testCustomEventSupport(),

            // Event timing
            eventTiming: this.testEventTiming(),

            // Event bubbling/capturing
            eventPropagation: this.testEventPropagation()
        };

        if (buttonElement) {
            events.buttonSpecific = this.testButtonSpecificEvents(buttonElement);
        }

        this.diagnostics.events = events;

        console.log('⚡ Event Handling Analysis:', events);

        console.groupEnd();
        return events;
    }

    /**
     * Analyze console errors for browser-specific patterns
     */
    analyzeConsoleErrors() {
        console.group('🐛 CONSOLE ERROR ANALYSIS');

        const errorPatterns = {
            // Common browser-specific errors
            ieErrors: [],
            chromeErrors: [],
            firefoxErrors: [],
            safariErrors: [],
            edgeErrors: [],

            // Error categories
            syntaxErrors: [],
            typeErrors: [],
            referenceErrors: [],
            networkErrors: [],
            securityErrors: [],

            // jQuery-specific errors
            jqueryErrors: [],

            // AJAX errors
            ajaxErrors: []
        };

        // Override console methods to capture errors
        const originalError = console.error;
        const originalWarn = console.warn;

        const capturedErrors = [];
        const capturedWarnings = [];

        console.error = function(...args) {
            capturedErrors.push({
                timestamp: new Date().toISOString(),
                message: args.join(' '),
                stack: new Error().stack
            });
            originalError.apply(console, args);
        };

        console.warn = function(...args) {
            capturedWarnings.push({
                timestamp: new Date().toISOString(),
                message: args.join(' ')
            });
            originalWarn.apply(console, args);
        };

        // Restore original console methods after a delay
        setTimeout(() => {
            console.error = originalError;
            console.warn = originalWarn;
        }, 5000);

        const errorAnalysis = {
            errorPatterns,
            capturedErrors,
            capturedWarnings,
            errorListenerAttached: true
        };

        console.log('🐛 Error Analysis Setup:', errorAnalysis);

        console.groupEnd();
        return errorAnalysis;
    }

    /**
     * Generate browser compatibility recommendations
     */
    generateRecommendations() {
        const recommendations = [];
        const browser = this.diagnostics.browser;
        const features = this.diagnostics.features;
        const css = this.diagnostics.css;

        // Browser-specific recommendations
        if (browser.name === 'Internet Explorer') {
            recommendations.push({
                priority: 'HIGH',
                category: 'Browser Support',
                issue: 'Internet Explorer detected',
                solution: 'Add polyfills for modern JavaScript features',
                code: 'Include es6-promise, Array.from, Object.assign polyfills'
            });
        }

        if (browser.name === 'Safari' && parseInt(browser.version) < 12) {
            recommendations.push({
                priority: 'MEDIUM',
                category: 'Browser Support',
                issue: 'Older Safari version',
                solution: 'Test async/await and fetch API support',
                code: 'Consider using fetch polyfill'
            });
        }

        // JavaScript feature recommendations
        if (!features.fetch) {
            recommendations.push({
                priority: 'HIGH',
                category: 'JavaScript',
                issue: 'Fetch API not supported',
                solution: 'Use XMLHttpRequest or fetch polyfill',
                code: 'if (!window.fetch) { /* load polyfill */ }'
            });
        }

        if (!features.promises) {
            recommendations.push({
                priority: 'HIGH',
                category: 'JavaScript',
                issue: 'Promises not supported',
                solution: 'Use es6-promise polyfill',
                code: 'Include es6-promise library for IE support'
            });
        }

        if (!features.querySelector) {
            recommendations.push({
                priority: 'CRITICAL',
                category: 'JavaScript',
                issue: 'querySelector not supported',
                solution: 'Use getElementById or jQuery selectors',
                code: 'document.getElementById() instead of querySelector()'
            });
        }

        // CSS recommendations
        if (!css.flexbox) {
            recommendations.push({
                priority: 'MEDIUM',
                category: 'CSS',
                issue: 'Flexbox not supported',
                solution: 'Use float-based layouts or CSS Grid fallback',
                code: '.design-preview-btn { display: inline-block; }'
            });
        }

        if (!css.transform && (css.webkitTransform || css.mozTransform)) {
            recommendations.push({
                priority: 'LOW',
                category: 'CSS',
                issue: 'Transform requires vendor prefixes',
                solution: 'Add vendor prefixes for transforms',
                code: '-webkit-transform: translateY(-1px); transform: translateY(-1px);'
            });
        }

        // jQuery recommendations
        if (!features.jquery) {
            recommendations.push({
                priority: 'HIGH',
                category: 'Dependencies',
                issue: 'jQuery not loaded',
                solution: 'Ensure jQuery is loaded before button scripts',
                code: 'Check script loading order and jQuery availability'
            });
        }

        this.diagnostics.recommendations = recommendations;
        return recommendations;
    }

    // Helper methods for feature testing

    testArrowFunctions() {
        try {
            eval('(() => true)()');
            return true;
        } catch (e) {
            return false;
        }
    }

    testConstLet() {
        try {
            eval('const test = 1; let test2 = 2;');
            return true;
        } catch (e) {
            return false;
        }
    }

    testTemplateLiterals() {
        try {
            eval('`template ${1} literal`');
            return true;
        } catch (e) {
            return false;
        }
    }

    testDestructuring() {
        try {
            eval('const {a} = {a: 1}; const [b] = [2];');
            return true;
        } catch (e) {
            return false;
        }
    }

    testDefaultParameters() {
        try {
            eval('function test(a = 1) { return a; }');
            return true;
        } catch (e) {
            return false;
        }
    }

    testRestSpread() {
        try {
            eval('const arr = [1, 2]; const spread = [...arr];');
            return true;
        } catch (e) {
            return false;
        }
    }

    testClasses() {
        try {
            eval('class Test { constructor() {} }');
            return true;
        } catch (e) {
            return false;
        }
    }

    testAsyncAwait() {
        try {
            eval('async function test() { await Promise.resolve(); }');
            return true;
        } catch (e) {
            return false;
        }
    }

    testPromises() {
        return typeof Promise !== 'undefined' &&
               typeof Promise.resolve === 'function';
    }

    testCustomEvents() {
        try {
            new CustomEvent('test');
            return true;
        } catch (e) {
            return false;
        }
    }

    testMouseEvents() {
        try {
            new MouseEvent('click');
            return true;
        } catch (e) {
            return false;
        }
    }

    testKeyboardEvents() {
        try {
            new KeyboardEvent('keydown');
            return true;
        } catch (e) {
            return false;
        }
    }

    testLocalStorage() {
        try {
            const test = 'test';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            return false;
        }
    }

    testSessionStorage() {
        try {
            const test = 'test';
            sessionStorage.setItem(test, test);
            sessionStorage.removeItem(test);
            return true;
        } catch (e) {
            return false;
        }
    }

    testJQueryEvents() {
        if (typeof jQuery === 'undefined') return false;

        try {
            const $test = jQuery('<div>');
            $test.on('click', function() {});
            $test.off('click');
            return true;
        } catch (e) {
            return false;
        }
    }

    testCSSFeature(property, value) {
        try {
            const div = document.createElement('div');
            div.style[property] = value;
            return div.style[property] !== '';
        } catch (e) {
            return false;
        }
    }

    testCSSCustomProperties() {
        try {
            const div = document.createElement('div');
            div.style.setProperty('--test', 'value');
            return div.style.getPropertyValue('--test') === 'value';
        } catch (e) {
            return false;
        }
    }

    testPseudoSelectors() {
        try {
            return !!document.querySelector &&
                   document.createElement('div').matches(':not(span)');
        } catch (e) {
            return false;
        }
    }

    testMediaQueries() {
        return typeof window.matchMedia !== 'undefined';
    }

    testButtonFocusStyles() {
        const buttonElement = document.getElementById(this.buttonId);
        if (!buttonElement) return false;

        const styles = window.getComputedStyle(buttonElement, ':focus');
        return styles.outline !== 'none' || styles.outlineStyle !== 'none';
    }

    testButtonHoverStyles() {
        const buttonElement = document.getElementById(this.buttonId);
        if (!buttonElement) return false;

        // Test if hover styles are defined
        try {
            const styles = window.getComputedStyle(buttonElement, ':hover');
            return true;
        } catch (e) {
            return false;
        }
    }

    testButtonDisabledStyles() {
        const buttonElement = document.getElementById(this.buttonId);
        if (!buttonElement) return false;

        buttonElement.disabled = true;
        const disabledStyles = window.getComputedStyle(buttonElement);
        const hasDisabledStyles = disabledStyles.opacity !== '1' ||
                                 disabledStyles.cursor === 'not-allowed';
        buttonElement.disabled = false;

        return hasDisabledStyles;
    }

    checkVendorPrefixes() {
        const prefixIssues = [];
        const testElement = document.createElement('div');

        // Check if modern properties work without prefixes
        const properties = [
            { modern: 'transform', prefixed: ['-webkit-transform', '-moz-transform', '-ms-transform'] },
            { modern: 'transition', prefixed: ['-webkit-transition', '-moz-transition', '-ms-transition'] },
            { modern: 'animation', prefixed: ['-webkit-animation', '-moz-animation', '-ms-animation'] },
            { modern: 'box-shadow', prefixed: ['-webkit-box-shadow', '-moz-box-shadow'] },
            { modern: 'border-radius', prefixed: ['-webkit-border-radius', '-moz-border-radius'] }
        ];

        properties.forEach(prop => {
            testElement.style[prop.modern] = 'initial';
            if (!testElement.style[prop.modern]) {
                // Modern property not supported, check prefixed versions
                const supportedPrefixes = prop.prefixed.filter(prefixed => {
                    testElement.style.cssText = '';
                    testElement.style.setProperty(prefixed, 'initial');
                    return testElement.style.getPropertyValue(prefixed) !== '';
                });

                if (supportedPrefixes.length > 0) {
                    prefixIssues.push({
                        property: prop.modern,
                        needsPrefixes: supportedPrefixes,
                        severity: 'medium'
                    });
                }
            }
        });

        return prefixIssues;
    }

    getMemoryUsage() {
        if (performance.memory) {
            return {
                usedJSHeapSize: performance.memory.usedJSHeapSize,
                totalJSHeapSize: performance.memory.totalJSHeapSize,
                jsHeapSizeLimit: performance.memory.jsHeapSizeLimit
            };
        }
        return null;
    }

    getNavigationTiming() {
        if (performance.timing) {
            const timing = performance.timing;
            return {
                domContentLoaded: timing.domContentLoadedEventEnd - timing.navigationStart,
                loadComplete: timing.loadEventEnd - timing.navigationStart,
                domInteractive: timing.domInteractive - timing.navigationStart
            };
        }
        return null;
    }

    getResourceTiming() {
        if (performance.getEntriesByType) {
            const resources = performance.getEntriesByType('resource');
            return {
                totalResources: resources.length,
                scripts: resources.filter(r => r.initiatorType === 'script').length,
                stylesheets: resources.filter(r => r.initiatorType === 'css').length
            };
        }
        return null;
    }

    measureJSExecutionTime() {
        const start = performance.now();

        // Simulate typical button-related operations
        for (let i = 0; i < 1000; i++) {
            document.getElementById(this.buttonId);
        }

        const end = performance.now();
        return end - start;
    }

    testDOMPerformance() {
        const start = performance.now();

        // Test DOM manipulation performance
        const testDiv = document.createElement('div');
        document.body.appendChild(testDiv);

        for (let i = 0; i < 100; i++) {
            testDiv.innerHTML = `<span>Test ${i}</span>`;
            testDiv.style.display = i % 2 ? 'block' : 'none';
        }

        document.body.removeChild(testDiv);

        const end = performance.now();
        return end - start;
    }

    testEventPerformance() {
        const start = performance.now();

        // Test event handling performance
        const testElement = document.createElement('button');
        let clickCount = 0;

        const handler = () => clickCount++;
        testElement.addEventListener('click', handler);

        for (let i = 0; i < 100; i++) {
            testElement.click();
        }

        testElement.removeEventListener('click', handler);

        const end = performance.now();
        return {
            duration: end - start,
            clicksHandled: clickCount
        };
    }

    detectCSP() {
        // Check for Content Security Policy
        const metaTags = document.getElementsByTagName('meta');
        for (let tag of metaTags) {
            if (tag.httpEquiv && tag.httpEquiv.toLowerCase() === 'content-security-policy') {
                return {
                    present: true,
                    content: tag.content
                };
            }
        }
        return { present: false };
    }

    testSameOriginPolicy() {
        try {
            // Test if we can access same-origin resources
            const currentOrigin = window.location.origin;
            return {
                currentOrigin,
                canAccessLocalStorage: this.testLocalStorage(),
                canAccessSessionStorage: this.testSessionStorage()
            };
        } catch (e) {
            return { error: e.message };
        }
    }

    testCORS() {
        // Basic CORS detection
        return {
            fetchSupported: typeof fetch !== 'undefined',
            xhrSupported: typeof XMLHttpRequest !== 'undefined',
            withCredentials: typeof XMLHttpRequest !== 'undefined' &&
                           'withCredentials' in new XMLHttpRequest()
        };
    }

    detectFeaturePolicy() {
        return {
            supported: typeof document.featurePolicy !== 'undefined' ||
                      typeof document.permissionsPolicy !== 'undefined'
        };
    }

    detectMixedContent() {
        const protocol = window.location.protocol;
        const hasHttp = protocol === 'http:';
        const hasHttpsResources = Array.from(document.scripts)
            .some(script => script.src && script.src.startsWith('https:'));

        return {
            protocol,
            potentialMixedContent: hasHttp && hasHttpsResources
        };
    }

    testEvalSupported() {
        try {
            eval('1 + 1');
            return true;
        } catch (e) {
            return false;
        }
    }

    testInlineScriptExecution() {
        try {
            const script = document.createElement('script');
            script.innerHTML = 'window.testInlineScript = true;';
            document.head.appendChild(script);
            const result = window.testInlineScript === true;
            delete window.testInlineScript;
            document.head.removeChild(script);
            return result;
        } catch (e) {
            return false;
        }
    }

    testAjaxRestrictions() {
        return {
            xhrAvailable: typeof XMLHttpRequest !== 'undefined',
            fetchAvailable: typeof fetch !== 'undefined',
            ajaxurlAvailable: typeof ajaxurl !== 'undefined'
        };
    }

    testNativeEventSupport() {
        const buttonElement = document.getElementById(this.buttonId);
        if (!buttonElement) return false;

        return {
            addEventListener: typeof buttonElement.addEventListener === 'function',
            removeEventListener: typeof buttonElement.removeEventListener === 'function',
            onclick: 'onclick' in buttonElement,
            dispatchEvent: typeof buttonElement.dispatchEvent === 'function'
        };
    }

    testJQueryEventSupport() {
        if (typeof jQuery === 'undefined') return false;

        const buttonElement = document.getElementById(this.buttonId);
        if (!buttonElement) return false;

        try {
            const $button = jQuery(buttonElement);
            return {
                jqueryObject: $button.length > 0,
                onMethod: typeof $button.on === 'function',
                offMethod: typeof $button.off === 'function',
                triggerMethod: typeof $button.trigger === 'function'
            };
        } catch (e) {
            return false;
        }
    }

    testEventDelegation() {
        let delegationWorks = false;

        const handler = (event) => {
            if (event.target.id === this.buttonId) {
                delegationWorks = true;
            }
        };

        document.addEventListener('click', handler);

        const buttonElement = document.getElementById(this.buttonId);
        if (buttonElement) {
            const clickEvent = new MouseEvent('click', { bubbles: true });
            buttonElement.dispatchEvent(clickEvent);
        }

        document.removeEventListener('click', handler);

        return delegationWorks;
    }

    testTouchEventSupport() {
        return {
            touchstart: 'ontouchstart' in window,
            touchend: 'ontouchend' in window,
            touchmove: 'ontouchmove' in window,
            touchSupported: 'ontouchstart' in window || navigator.maxTouchPoints > 0
        };
    }

    testPointerEventSupport() {
        return {
            pointerdown: 'onpointerdown' in window,
            pointerup: 'onpointerup' in window,
            pointermove: 'onpointermove' in window,
            pointerSupported: 'onpointerdown' in window
        };
    }

    testFocusEventSupport() {
        const buttonElement = document.getElementById(this.buttonId);
        if (!buttonElement) return false;

        return {
            focus: 'onfocus' in buttonElement,
            blur: 'onblur' in buttonElement,
            focusin: 'onfocusin' in buttonElement,
            focusout: 'onfocusout' in buttonElement
        };
    }

    testCustomEventSupport() {
        try {
            const event = new CustomEvent('test', { detail: { test: true } });
            return {
                customEventConstructor: true,
                eventDetail: event.detail.test === true
            };
        } catch (e) {
            return false;
        }
    }

    testEventTiming() {
        const buttonElement = document.getElementById(this.buttonId);
        if (!buttonElement) return null;

        const start = performance.now();

        let eventFired = false;
        const handler = () => { eventFired = true; };

        buttonElement.addEventListener('click', handler);
        buttonElement.click();
        buttonElement.removeEventListener('click', handler);

        const end = performance.now();

        return {
            duration: end - start,
            eventFired: eventFired
        };
    }

    testEventPropagation() {
        const buttonElement = document.getElementById(this.buttonId);
        if (!buttonElement) return null;

        let bubblePhase = false;
        let capturePhase = false;

        const bubbleHandler = () => { bubblePhase = true; };
        const captureHandler = () => { capturePhase = true; };

        document.addEventListener('click', bubbleHandler, false);
        document.addEventListener('click', captureHandler, true);

        const clickEvent = new MouseEvent('click', { bubbles: true });
        buttonElement.dispatchEvent(clickEvent);

        document.removeEventListener('click', bubbleHandler, false);
        document.removeEventListener('click', captureHandler, true);

        return {
            bubbling: bubblePhase,
            capturing: capturePhase
        };
    }

    testButtonSpecificEvents(buttonElement) {
        const tests = {};

        // Test click event
        let clickTriggered = false;
        const clickHandler = () => { clickTriggered = true; };
        buttonElement.addEventListener('click', clickHandler);
        buttonElement.click();
        buttonElement.removeEventListener('click', clickHandler);
        tests.clickEvent = clickTriggered;

        // Test disabled state
        const wasDisabled = buttonElement.disabled;
        buttonElement.disabled = true;

        let disabledClickTriggered = false;
        const disabledClickHandler = () => { disabledClickTriggered = true; };
        buttonElement.addEventListener('click', disabledClickHandler);
        buttonElement.click();
        buttonElement.removeEventListener('click', disabledClickHandler);
        tests.disabledClickPrevented = !disabledClickTriggered;

        buttonElement.disabled = wasDisabled;

        // Test focus/blur
        try {
            buttonElement.focus();
            tests.canFocus = document.activeElement === buttonElement;
            buttonElement.blur();
            tests.canBlur = document.activeElement !== buttonElement;
        } catch (e) {
            tests.canFocus = false;
            tests.canBlur = false;
        }

        return tests;
    }

    analyzeJSCompatibilityIssues(features) {
        const issues = [];

        if (!features.querySelector) {
            issues.push({
                severity: 'CRITICAL',
                feature: 'querySelector',
                impact: 'Button selection will fail',
                solution: 'Use document.getElementById() instead'
            });
        }

        if (!features.addEventListener) {
            issues.push({
                severity: 'CRITICAL',
                feature: 'addEventListener',
                impact: 'Event binding will fail',
                solution: 'Use attachEvent() for IE8 or jQuery'
            });
        }

        if (!features.jquery) {
            issues.push({
                severity: 'HIGH',
                feature: 'jQuery',
                impact: 'jQuery-dependent code will fail',
                solution: 'Ensure jQuery is loaded before button scripts'
            });
        }

        if (!features.fetch && !features.promises) {
            issues.push({
                severity: 'HIGH',
                feature: 'AJAX/Promises',
                impact: 'Modern AJAX calls will fail',
                solution: 'Use XMLHttpRequest or polyfills'
            });
        }

        return issues;
    }

    /**
     * Run complete browser compatibility diagnostic
     */
    runCompleteDiagnostic() {
        console.group('🤖 AGENT 6: COMPLETE BROWSER COMPATIBILITY DIAGNOSTIC');

        try {
            console.log('🔄 Starting comprehensive browser compatibility analysis...');

            // Test all compatibility aspects
            this.testJavaScriptCompatibility();
            this.testCSSCompatibility();
            this.testPerformanceMetrics();
            this.testSecurityPolicies();
            this.testEventHandling();
            this.analyzeConsoleErrors();

            // Generate recommendations
            const recommendations = this.generateRecommendations();

            // Create comprehensive report
            const report = this.generateCompatibilityReport();

            // Display results
            console.group('📊 BROWSER COMPATIBILITY REPORT');
            console.log('🌐 Browser:', this.diagnostics.browser);
            console.log('⚙️ JavaScript Features:', this.diagnostics.features);
            console.log('🎨 CSS Features:', this.diagnostics.css);
            console.log('⚡ Performance:', this.diagnostics.performance);
            console.log('🔒 Security:', this.diagnostics.security);
            console.log('⚡ Events:', this.diagnostics.events);
            console.log('💡 Recommendations:', recommendations);
            console.groupEnd();

            // Store globally for access
            window.browserCompatibilityDiagnostic = report;

            return report;

        } catch (error) {
            console.error('❌ Browser compatibility diagnostic failed:', error);
            return null;
        } finally {
            console.groupEnd();
        }
    }

    generateCompatibilityReport() {
        const overallScore = this.calculateCompatibilityScore();
        const criticalIssues = this.identifyCriticalIssues();

        return {
            timestamp: this.diagnostics.timestamp,
            browser: this.diagnostics.browser,
            compatibilityScore: overallScore,
            criticalIssues: criticalIssues,
            features: this.diagnostics.features,
            css: this.diagnostics.css,
            performance: this.diagnostics.performance,
            security: this.diagnostics.security,
            events: this.diagnostics.events,
            recommendations: this.diagnostics.recommendations,
            buttonSpecific: {
                buttonExists: !!document.getElementById(this.buttonId),
                canClick: this.testButtonClickability(),
                hasEvents: this.testButtonEventBindings(),
                stylesWork: this.testButtonStyles()
            }
        };
    }

    calculateCompatibilityScore() {
        const features = this.diagnostics.features;
        const css = this.diagnostics.css;

        let score = 0;
        let maxScore = 0;

        // JavaScript features (weight: 40%)
        Object.values(features).forEach(supported => {
            maxScore += 40;
            if (supported === true) score += 40;
            else if (supported && typeof supported === 'object') score += 20;
        });

        // CSS features (weight: 30%)
        Object.values(css).forEach(supported => {
            maxScore += 30;
            if (supported === true) score += 30;
            else if (supported && typeof supported === 'object') score += 15;
        });

        // Performance (weight: 20%)
        if (this.diagnostics.performance.memoryUsage) {
            maxScore += 20;
            score += 20;
        }

        // Security (weight: 10%)
        if (this.diagnostics.security.secureContext) {
            maxScore += 10;
            score += 10;
        }

        return Math.round((score / maxScore) * 100);
    }

    identifyCriticalIssues() {
        const issues = [];
        const features = this.diagnostics.features;
        const browser = this.diagnostics.browser;

        if (browser.name === 'Internet Explorer') {
            issues.push('Internet Explorer detected - modern JavaScript features may not work');
        }

        if (!features.querySelector) {
            issues.push('querySelector not supported - DOM selection will fail');
        }

        if (!features.addEventListener) {
            issues.push('addEventListener not supported - event binding will fail');
        }

        if (!features.jquery) {
            issues.push('jQuery not available - jQuery-dependent code will fail');
        }

        if (!document.getElementById(this.buttonId)) {
            issues.push('Design preview button not found in DOM');
        }

        return issues;
    }

    testButtonClickability() {
        const buttonElement = document.getElementById(this.buttonId);
        if (!buttonElement) return false;

        return !buttonElement.disabled &&
               buttonElement.style.pointerEvents !== 'none' &&
               buttonElement.style.display !== 'none';
    }

    testButtonEventBindings() {
        const buttonElement = document.getElementById(this.buttonId);
        if (!buttonElement) return false;

        // Check for jQuery events
        if (typeof jQuery !== 'undefined') {
            const events = jQuery._data(buttonElement, 'events');
            return events && events.click && events.click.length > 0;
        }

        // Check for native events (limited detection)
        return buttonElement.onclick !== null ||
               (typeof getEventListeners !== 'undefined' &&
                Object.keys(getEventListeners(buttonElement)).length > 0);
    }

    testButtonStyles() {
        const buttonElement = document.getElementById(this.buttonId);
        if (!buttonElement) return false;

        const styles = window.getComputedStyle(buttonElement);
        return styles.display !== 'none' &&
               styles.visibility !== 'hidden' &&
               parseFloat(styles.opacity) > 0;
    }
}

// Auto-execute browser compatibility diagnostic
if (typeof window !== 'undefined') {
    const runCompatibilityDiagnostic = function() {
        console.log('🤖 AGENT 6: BROWSER COMPATIBILITY ANALYSIS STARTING...');
        const diagnostic = new BrowserCompatibilityDiagnostic();
        return diagnostic.runCompleteDiagnostic();
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', runCompatibilityDiagnostic);
    } else {
        setTimeout(runCompatibilityDiagnostic, 100);
    }
}

// Export for manual usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BrowserCompatibilityDiagnostic;
} else if (typeof window !== 'undefined') {
    window.BrowserCompatibilityDiagnostic = BrowserCompatibilityDiagnostic;
}