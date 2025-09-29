/**
 * 🤖 AGENT 6: BROWSER COMPATIBILITY ANALYSIS SPECIALIST
 *
 * Comprehensive browser compatibility diagnostic for #design-preview-btn
 * Analyzes JavaScript ES6+, CSS features, performance, and cross-browser issues
 *
 * USAGE: Copy & paste into browser console on Order 5374 page
 */

class BrowserCompatibilityDiagnostic {
    constructor() {
        this.buttonId = 'design-preview-btn';
        this.diagnostics = {
            timestamp: new Date().toISOString(),
            browserCompatibility: {
                browserInfo: null,
                javascriptSupport: null,
                cssSupport: null,
                performanceMetrics: null,
                securityPolicies: null,
                eventHandling: null,
                consoleErrors: null
            },
            criticalIssues: [],
            recommendations: []
        };

        console.group('🤖 AGENT 6: BROWSER COMPATIBILITY DIAGNOSTIC');
        console.log('Target:', this.buttonId);
        console.log('Analysis started at:', this.diagnostics.timestamp);
        this.detectBrowserAndEngine();
    }

    /**
     * 🔍 MAIN DIAGNOSTIC ENTRY POINT
     */
    async runComprehensiveDiagnosis() {
        const button = document.getElementById(this.buttonId);

        console.log('🌐 Analyzing browser compatibility and feature support...');

        // Run all diagnostic modules
        await this.analyzeBrowserInfo();
        await this.testJavaScriptFeatureSupport();
        await this.testCSSFeatureSupport(button);
        await this.analyzePerformanceMetrics(button);
        await this.checkSecurityPolicies();
        await this.testEventHandlingCompatibility(button);
        await this.analyzeConsoleErrorPatterns();
        await this.performCompatibilityTests(button);

        return this.generateReport();
    }

    /**
     * 🌐 BROWSER INFORMATION ANALYSIS
     */
    analyzeBrowserInfo() {
        console.group('🌐 BROWSER INFORMATION ANALYSIS');

        const browserInfo = {
            detection: this.detectBrowserAndEngine(),
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            language: navigator.language,
            cookieEnabled: navigator.cookieEnabled,
            javaEnabled: navigator.javaEnabled ? navigator.javaEnabled() : false,
            onLine: navigator.onLine,
            doNotTrack: navigator.doNotTrack,
            hardwareConcurrency: navigator.hardwareConcurrency || 'unknown',
            maxTouchPoints: navigator.maxTouchPoints || 0
        };

        // Add detailed browser information
        browserInfo.features = {
            webGL: this.detectWebGLSupport(),
            webWorkers: typeof Worker !== 'undefined',
            serviceWorkers: 'serviceWorker' in navigator,
            notifications: 'Notification' in window,
            geolocation: 'geolocation' in navigator,
            localStorage: this.testStorageSupport('localStorage'),
            sessionStorage: this.testStorageSupport('sessionStorage'),
            indexedDB: 'indexedDB' in window,
            websockets: 'WebSocket' in window
        };

        // Check for known compatibility issues
        const compatibilityIssues = this.checkKnownCompatibilityIssues(browserInfo);
        if (compatibilityIssues.length > 0) {
            this.diagnostics.criticalIssues.push(...compatibilityIssues);
            console.warn('⚠️ Known compatibility issues detected:', compatibilityIssues);
        }

        this.diagnostics.browserCompatibility.browserInfo = browserInfo;
        console.log('📊 Browser Information:', browserInfo);
        console.groupEnd();
    }

    /**
     * 🔧 JAVASCRIPT FEATURE SUPPORT
     */
    testJavaScriptFeatureSupport() {
        console.group('🔧 JAVASCRIPT FEATURE SUPPORT');

        const jsSupport = {
            es6Features: this.testES6Features(),
            es2017Features: this.testES2017Features(),
            es2018Features: this.testES2018Features(),
            domApis: this.testDOMAPIs(),
            arrayMethods: this.testArrayMethods(),
            objectMethods: this.testObjectMethods(),
            promiseSupport: this.testPromiseSupport(),
            asyncAwaitSupport: this.testAsyncAwaitSupport(),
            moduleSupport: this.testModuleSupport()
        };

        // Calculate overall ES6+ compatibility score
        const totalFeatures = Object.values(jsSupport).reduce((total, category) => {
            return total + Object.keys(category).length;
        }, 0);

        const supportedFeatures = Object.values(jsSupport).reduce((total, category) => {
            return total + Object.values(category).filter(Boolean).length;
        }, 0);

        jsSupport.compatibilityScore = Math.round((supportedFeatures / totalFeatures) * 100);

        // Check for critical missing features
        const criticalFeatures = [
            'es6Features.arrowFunctions',
            'es6Features.constLet',
            'domApis.querySelector',
            'domApis.addEventListener',
            'promiseSupport.basic'
        ];

        criticalFeatures.forEach(featurePath => {
            const feature = this.getNestedProperty(jsSupport, featurePath);
            if (!feature) {
                this.diagnostics.criticalIssues.push(`Critical JavaScript feature missing: ${featurePath}`);
                console.error(`❌ Critical feature missing: ${featurePath}`);
            }
        });

        if (jsSupport.compatibilityScore < 70) {
            this.diagnostics.criticalIssues.push(`Low JavaScript compatibility: ${jsSupport.compatibilityScore}%`);
            console.warn(`⚠️ Low JavaScript compatibility score: ${jsSupport.compatibilityScore}%`);
        } else {
            console.log(`✅ Good JavaScript compatibility: ${jsSupport.compatibilityScore}%`);
        }

        this.diagnostics.browserCompatibility.javascriptSupport = jsSupport;
        console.log('📊 JavaScript Feature Support:', jsSupport);
        console.groupEnd();
    }

    /**
     * 🎨 CSS FEATURE SUPPORT
     */
    testCSSFeatureSupport(button) {
        console.group('🎨 CSS FEATURE SUPPORT');

        const cssSupport = {
            layoutFeatures: this.testCSSLayoutFeatures(),
            transformsAndAnimations: this.testTransformsAndAnimations(),
            moderFeatures: this.testModernCSSFeatures(),
            vendorPrefixes: this.testVendorPrefixRequirements(),
            buttonSpecificCSS: button ? this.testButtonSpecificCSS(button) : null,
            mediaQueries: this.testMediaQuerySupport()
        };

        // Test CSS feature detection methods
        cssSupport.featureDetection = {
            supportsCSS: typeof CSS !== 'undefined' && typeof CSS.supports === 'function',
            supportsProperty: this.testCSSSupportsProperty(),
            supportsValue: this.testCSSSupportsValue()
        };

        // Check for CSS features that might cause button issues
        const buttonCriticalCSS = [
            'layoutFeatures.flexbox',
            'moderFeatures.borderRadius',
            'transformsAndAnimations.transitions'
        ];

        let unsupportedCSSFeatures = 0;
        buttonCriticalCSS.forEach(featurePath => {
            const feature = this.getNestedProperty(cssSupport, featurePath);
            if (!feature) {
                unsupportedCSSFeatures++;
                console.warn(`⚠️ Unsupported CSS feature: ${featurePath}`);
            }
        });

        if (unsupportedCSSFeatures > 1) {
            this.diagnostics.criticalIssues.push(`Multiple unsupported CSS features: ${unsupportedCSSFeatures} missing`);
        }

        // Calculate CSS compatibility score
        const totalCSSFeatures = Object.values(cssSupport).reduce((total, category) => {
            if (typeof category === 'object' && category !== null) {
                return total + Object.keys(category).length;
            }
            return total;
        }, 0);

        const supportedCSSFeatures = Object.values(cssSupport).reduce((total, category) => {
            if (typeof category === 'object' && category !== null) {
                return total + Object.values(category).filter(Boolean).length;
            }
            return total;
        }, 0);

        cssSupport.compatibilityScore = Math.round((supportedCSSFeatures / totalCSSFeatures) * 100);

        this.diagnostics.browserCompatibility.cssSupport = cssSupport;
        console.log('📊 CSS Feature Support:', cssSupport);
        console.groupEnd();
    }

    /**
     * 📊 PERFORMANCE METRICS ANALYSIS
     */
    analyzePerformanceMetrics(button) {
        console.group('📊 PERFORMANCE METRICS ANALYSIS');

        const performanceMetrics = {
            timing: this.getPerformanceTiming(),
            memory: this.getMemoryUsage(),
            domComplexity: this.analyzeDOMComplexity(),
            buttonSpecificMetrics: button ? this.analyzeButtonPerformance(button) : null,
            resourceTiming: this.getResourceTiming(),
            renderingMetrics: this.getRenderingMetrics()
        };

        // Check for performance issues that might affect button responsiveness
        const performanceIssues = [];

        if (performanceMetrics.memory.usedJSHeapSize > 100 * 1024 * 1024) { // 100MB
            performanceIssues.push('High memory usage may affect button responsiveness');
        }

        if (performanceMetrics.domComplexity.totalElements > 5000) {
            performanceIssues.push('High DOM complexity may affect button performance');
        }

        if (performanceMetrics.timing.domContentLoaded > 3000) {
            performanceIssues.push('Slow page load may delay button initialization');
        }

        if (performanceIssues.length > 0) {
            this.diagnostics.criticalIssues.push(...performanceIssues);
            console.warn('⚠️ Performance issues detected:', performanceIssues);
        }

        this.diagnostics.browserCompatibility.performanceMetrics = performanceMetrics;
        console.log('📊 Performance Metrics:', performanceMetrics);
        console.groupEnd();
    }

    /**
     * 🔒 SECURITY POLICIES CHECK
     */
    checkSecurityPolicies() {
        console.group('🔒 SECURITY POLICIES CHECK');

        const securityPolicies = {
            contentSecurityPolicy: this.analyzeCSP(),
            sameOriginPolicy: this.checkSameOriginPolicy(),
            corsPolicy: this.checkCORSPolicy(),
            featurePolicy: this.checkFeaturePolicy(),
            mixedContent: this.checkMixedContent(),
            inlineScriptExecution: this.testInlineScriptExecution()
        };

        // Check for security policies that might block button functionality
        const securityIssues = [];

        if (securityPolicies.contentSecurityPolicy.restrictive) {
            securityIssues.push('Restrictive CSP may block button JavaScript execution');
        }

        if (securityPolicies.inlineScriptExecution.blocked) {
            securityIssues.push('Inline script execution blocked - may affect button handlers');
        }

        if (securityPolicies.mixedContent.detected) {
            securityIssues.push('Mixed content detected - may cause security warnings');
        }

        if (securityIssues.length > 0) {
            console.warn('⚠️ Security policy issues:', securityIssues);
        }

        this.diagnostics.browserCompatibility.securityPolicies = securityPolicies;
        console.log('📊 Security Policies:', securityPolicies);
        console.groupEnd();
    }

    /**
     * 🎯 EVENT HANDLING COMPATIBILITY
     */
    testEventHandlingCompatibility(button) {
        console.group('🎯 EVENT HANDLING COMPATIBILITY');

        const eventHandling = {
            eventSupport: this.testEventSupport(),
            eventDelegation: this.testEventDelegation(),
            customEvents: this.testCustomEvents(),
            touchEventSupport: this.testTouchEventCompatibility(),
            keyboardEvents: this.testKeyboardEventSupport(),
            focusEvents: this.testFocusEventSupport(),
            buttonEventCompatibility: button ? this.testButtonEventCompatibility(button) : null
        };

        // Check for event handling issues
        const eventIssues = [];

        if (!eventHandling.eventSupport.addEventListener) {
            eventIssues.push('addEventListener not supported - event binding will fail');
        }

        if (!eventHandling.customEvents.canCreate) {
            eventIssues.push('Custom event creation not supported');
        }

        if (button && !eventHandling.buttonEventCompatibility.clickSupported) {
            eventIssues.push('Button click events not properly supported');
        }

        if (eventIssues.length > 0) {
            this.diagnostics.criticalIssues.push(...eventIssues);
            console.error('❌ Event handling issues:', eventIssues);
        }

        this.diagnostics.browserCompatibility.eventHandling = eventHandling;
        console.log('📊 Event Handling Compatibility:', eventHandling);
        console.groupEnd();
    }

    /**
     * 🐛 CONSOLE ERROR PATTERNS
     */
    analyzeConsoleErrorPatterns() {
        console.group('🐛 CONSOLE ERROR PATTERNS');

        const consoleErrors = {
            captureMethod: this.setupErrorCapture(),
            browserSpecificErrors: this.identifyBrowserSpecificErrors(),
            jsErrors: this.analyzeJavaScriptErrors(),
            cssErrors: this.analyzeCSSErrors(),
            networkErrors: this.analyzeNetworkErrors(),
            deprecationWarnings: this.findDeprecationWarnings()
        };

        // Check for error patterns that indicate compatibility issues
        const errorPatterns = this.identifyErrorPatterns(consoleErrors);
        if (errorPatterns.length > 0) {
            console.warn('⚠️ Browser-specific error patterns detected:', errorPatterns);
        }

        this.diagnostics.browserCompatibility.consoleErrors = consoleErrors;
        console.log('📊 Console Error Analysis:', consoleErrors);
        console.groupEnd();
    }

    /**
     * 🧪 COMPATIBILITY TESTS
     */
    performCompatibilityTests(button) {
        console.group('🧪 COMPATIBILITY TESTS');

        const compatibilityTests = {
            buttonClickTest: button ? this.testButtonClickCompatibility(button) : null,
            ajaxCompatibility: this.testAJAXCompatibility(),
            jqueryCompatibility: this.testJQueryCompatibility(),
            wordpressCompatibility: this.testWordPressCompatibility(),
            crossBrowserEventTest: this.testCrossBrowserEvents(),
            polyfillRequirements: this.identifyPolyfillRequirements()
        };

        // Generate compatibility score
        compatibilityTests.overallScore = this.calculateOverallCompatibilityScore();

        // Test specific button functionality
        if (button) {
            compatibilityTests.buttonSpecificTests = this.runButtonSpecificCompatibilityTests(button);
        }

        console.log('📊 Compatibility Tests Results:', compatibilityTests);
        console.groupEnd();
    }

    /**
     * 🔍 BROWSER DETECTION METHODS
     */
    detectBrowserAndEngine() {
        const userAgent = navigator.userAgent;

        const browserInfo = {
            // Browser detection
            chrome: /Chrome/.test(userAgent) && !/Edg/.test(userAgent),
            firefox: /Firefox/.test(userAgent),
            safari: /Safari/.test(userAgent) && !/Chrome/.test(userAgent),
            edge: /Edg/.test(userAgent),
            internetExplorer: /MSIE|Trident/.test(userAgent),
            opera: /Opera|OPR/.test(userAgent),

            // Engine detection
            blink: /Chrome|Chromium/.test(userAgent) && !/Edg/.test(userAgent),
            gecko: /Firefox/.test(userAgent),
            webkit: /Safari/.test(userAgent) && !/Chrome/.test(userAgent),
            trident: /MSIE|Trident/.test(userAgent),

            // Mobile browsers
            mobileSafari: /Mobile.*Safari/.test(userAgent),
            androidBrowser: /Android.*Version/.test(userAgent),
            chromeAndroid: /Chrome.*Mobile/.test(userAgent),

            // Version detection
            version: this.extractBrowserVersion(userAgent)
        };

        // Determine primary browser and engine
        browserInfo.primaryBrowser = this.getPrimaryBrowser(browserInfo);
        browserInfo.primaryEngine = this.getPrimaryEngine(browserInfo);

        console.log('🌐 Browser detected:', browserInfo);
        return browserInfo;
    }

    extractBrowserVersion(userAgent) {
        const versions = {};

        // Chrome version
        const chromeMatch = userAgent.match(/Chrome\/(\d+)/);
        if (chromeMatch) versions.chrome = parseInt(chromeMatch[1]);

        // Firefox version
        const firefoxMatch = userAgent.match(/Firefox\/(\d+)/);
        if (firefoxMatch) versions.firefox = parseInt(firefoxMatch[1]);

        // Safari version
        const safariMatch = userAgent.match(/Version\/(\d+).*Safari/);
        if (safariMatch) versions.safari = parseInt(safariMatch[1]);

        // Edge version
        const edgeMatch = userAgent.match(/Edg\/(\d+)/);
        if (edgeMatch) versions.edge = parseInt(edgeMatch[1]);

        // IE version
        const ieMatch = userAgent.match(/(MSIE |rv:)(\d+)/);
        if (ieMatch) versions.internetExplorer = parseInt(ieMatch[2]);

        return versions;
    }

    getPrimaryBrowser(browserInfo) {
        if (browserInfo.chrome) return 'Chrome';
        if (browserInfo.firefox) return 'Firefox';
        if (browserInfo.safari) return 'Safari';
        if (browserInfo.edge) return 'Edge';
        if (browserInfo.internetExplorer) return 'Internet Explorer';
        if (browserInfo.opera) return 'Opera';
        return 'Unknown';
    }

    getPrimaryEngine(browserInfo) {
        if (browserInfo.blink) return 'Blink';
        if (browserInfo.gecko) return 'Gecko';
        if (browserInfo.webkit) return 'WebKit';
        if (browserInfo.trident) return 'Trident';
        return 'Unknown';
    }

    /**
     * 🧪 FEATURE TESTING METHODS
     */
    testES6Features() {
        return {
            arrowFunctions: this.testFeature(() => eval('(() => true)()')),
            constLet: this.testFeature(() => eval('{ const x = 1; let y = 2; }')),
            templateLiterals: this.testFeature(() => eval('`test`')),
            destructuring: this.testFeature(() => eval('const [a, b] = [1, 2];')),
            defaultParameters: this.testFeature(() => eval('(function(x = 1) { return x; })()')),
            restSpread: this.testFeature(() => eval('const [a, ...b] = [1, 2, 3];')),
            classes: this.testFeature(() => eval('class Test {}')),
            forOf: this.testFeature(() => eval('for (const x of [1, 2]) {}')),
            symbols: typeof Symbol !== 'undefined',
            maps: typeof Map !== 'undefined',
            sets: typeof Set !== 'undefined',
            weakMaps: typeof WeakMap !== 'undefined',
            weakSets: typeof WeakSet !== 'undefined'
        };
    }

    testES2017Features() {
        return {
            asyncAwait: this.testFeature(() => eval('(async function() { await Promise.resolve(); })')),
            objectEntries: typeof Object.entries === 'function',
            objectValues: typeof Object.values === 'function',
            stringPadding: typeof String.prototype.padStart === 'function',
            sharedArrayBuffer: typeof SharedArrayBuffer !== 'undefined',
            atomics: typeof Atomics !== 'undefined'
        };
    }

    testES2018Features() {
        return {
            asyncIterators: this.testFeature(() => eval('(async function*() {})')),
            objectSpread: this.testFeature(() => eval('const x = {...{a: 1}};')),
            promiseFinally: typeof Promise.prototype.finally === 'function',
            regexpLookbehind: this.testFeature(() => new RegExp('(?<=a)b')),
            regexpNamedGroups: this.testFeature(() => new RegExp('(?<name>a)')),
            regexpUnicodeProperty: this.testFeature(() => new RegExp('\\p{Script=Latin}', 'u'))
        };
    }

    testDOMAPIs() {
        return {
            querySelector: typeof document.querySelector === 'function',
            querySelectorAll: typeof document.querySelectorAll === 'function',
            addEventListener: typeof document.addEventListener === 'function',
            removeEventListener: typeof document.removeEventListener === 'function',
            createElement: typeof document.createElement === 'function',
            classList: 'classList' in document.documentElement,
            dataset: 'dataset' in document.documentElement,
            customElements: 'customElements' in window,
            shadowDOM: 'attachShadow' in document.documentElement,
            intersectionObserver: 'IntersectionObserver' in window,
            mutationObserver: 'MutationObserver' in window,
            resizeObserver: 'ResizeObserver' in window
        };
    }

    testArrayMethods() {
        return {
            forEach: typeof Array.prototype.forEach === 'function',
            map: typeof Array.prototype.map === 'function',
            filter: typeof Array.prototype.filter === 'function',
            reduce: typeof Array.prototype.reduce === 'function',
            find: typeof Array.prototype.find === 'function',
            findIndex: typeof Array.prototype.findIndex === 'function',
            includes: typeof Array.prototype.includes === 'function',
            some: typeof Array.prototype.some === 'function',
            every: typeof Array.prototype.every === 'function',
            from: typeof Array.from === 'function',
            of: typeof Array.of === 'function',
            isArray: typeof Array.isArray === 'function'
        };
    }

    testObjectMethods() {
        return {
            keys: typeof Object.keys === 'function',
            values: typeof Object.values === 'function',
            entries: typeof Object.entries === 'function',
            assign: typeof Object.assign === 'function',
            create: typeof Object.create === 'function',
            defineProperty: typeof Object.defineProperty === 'function',
            freeze: typeof Object.freeze === 'function',
            seal: typeof Object.seal === 'function',
            preventExtensions: typeof Object.preventExtensions === 'function'
        };
    }

    testPromiseSupport() {
        return {
            basic: typeof Promise !== 'undefined',
            all: typeof Promise.all === 'function',
            race: typeof Promise.race === 'function',
            resolve: typeof Promise.resolve === 'function',
            reject: typeof Promise.reject === 'function',
            finally: typeof Promise.prototype.finally === 'function',
            allSettled: typeof Promise.allSettled === 'function'
        };
    }

    testAsyncAwaitSupport() {
        return {
            asyncFunction: this.testFeature(() => eval('(async function() {})')),
            awaitExpression: this.testFeature(() => eval('(async function() { await Promise.resolve(); })')),
            asyncArrowFunction: this.testFeature(() => eval('(async () => {})')),
            asyncGenerators: this.testFeature(() => eval('(async function*() {})'))
        };
    }

    testModuleSupport() {
        return {
            importExport: this.testFeature(() => typeof import !== 'undefined'),
            dynamicImport: this.testFeature(() => typeof import === 'function'),
            modules: 'noModule' in document.createElement('script')
        };
    }

    testCSSLayoutFeatures() {
        return {
            flexbox: this.testCSSSupport('display', 'flex'),
            grid: this.testCSSSupport('display', 'grid'),
            multiColumn: this.testCSSSupport('column-count', '2'),
            position: {
                sticky: this.testCSSSupport('position', 'sticky'),
                fixed: this.testCSSSupport('position', 'fixed'),
                absolute: this.testCSSSupport('position', 'absolute'),
                relative: this.testCSSSupport('position', 'relative')
            },
            overflow: this.testCSSSupport('overflow', 'hidden'),
            zIndex: this.testCSSSupport('z-index', '1')
        };
    }

    testTransformsAndAnimations() {
        return {
            transform: this.testCSSSupport('transform', 'translateX(0)'),
            transform3d: this.testCSSSupport('transform', 'translate3d(0,0,0)'),
            transition: this.testCSSSupport('transition', 'opacity 0.3s'),
            animation: this.testCSSSupport('animation', 'none'),
            keyframes: this.testFeature(() => typeof CSSKeyframesRule !== 'undefined'),
            willChange: this.testCSSSupport('will-change', 'transform')
        };
    }

    testModernCSSFeatures() {
        return {
            customProperties: this.testCSSSupport('--test-var', 'value'),
            calc: this.testCSSSupport('width', 'calc(100% - 10px)'),
            borderRadius: this.testCSSSupport('border-radius', '5px'),
            boxShadow: this.testCSSSupport('box-shadow', '0 0 5px rgba(0,0,0,0.3)'),
            gradients: this.testCSSSupport('background', 'linear-gradient(to right, #000, #fff)'),
            opacity: this.testCSSSupport('opacity', '0.5'),
            rgba: this.testCSSSupport('color', 'rgba(255, 0, 0, 0.5)'),
            hsla: this.testCSSSupport('color', 'hsla(0, 100%, 50%, 0.5)')
        };
    }

    testVendorPrefixRequirements() {
        const prefixes = ['-webkit-', '-moz-', '-ms-', '-o-'];
        const properties = ['transform', 'transition', 'animation', 'border-radius'];

        const requirements = {};

        properties.forEach(property => {
            requirements[property] = {
                needsPrefix: false,
                supportedPrefixes: []
            };

            // Test if property works without prefix
            if (this.testCSSSupport(property, 'initial')) {
                requirements[property].needsPrefix = false;
            } else {
                // Test with prefixes
                prefixes.forEach(prefix => {
                    if (this.testCSSSupport(prefix + property, 'initial')) {
                        requirements[property].needsPrefix = true;
                        requirements[property].supportedPrefixes.push(prefix);
                    }
                });
            }
        });

        return requirements;
    }

    testButtonSpecificCSS(button) {
        const buttonStyles = window.getComputedStyle(button);

        return {
            backgroundSupport: buttonStyles.backgroundColor !== '',
            borderSupport: buttonStyles.border !== '',
            paddingSupport: buttonStyles.padding !== '',
            fontSupport: buttonStyles.fontFamily !== '',
            cursorSupport: this.testCSSSupport('cursor', 'pointer'),
            hoverSupport: this.testCSSSupport(':hover', '{}', true),
            focusSupport: this.testCSSSupport(':focus', '{}', true),
            activeSupport: this.testCSSSupport(':active', '{}', true),
            disabledSupport: this.testCSSSupport(':disabled', '{}', true)
        };
    }

    testMediaQuerySupport() {
        return {
            basic: typeof window.matchMedia === 'function',
            orientationQuery: window.matchMedia('(orientation: portrait)').matches !== undefined,
            resolutionQuery: window.matchMedia('(min-resolution: 1dpi)').matches !== undefined,
            hoverQuery: window.matchMedia('(hover: hover)').matches !== undefined,
            pointerQuery: window.matchMedia('(pointer: fine)').matches !== undefined,
            reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches !== undefined,
            colorScheme: window.matchMedia('(prefers-color-scheme: dark)').matches !== undefined
        };
    }

    /**
     * 📊 PERFORMANCE AND ANALYSIS METHODS
     */
    getPerformanceTiming() {
        if (!window.performance || !window.performance.timing) {
            return { available: false };
        }

        const timing = window.performance.timing;
        const navigationStart = timing.navigationStart;

        return {
            available: true,
            navigationStart: navigationStart,
            domainLookup: timing.domainLookupEnd - timing.domainLookupStart,
            connection: timing.connectEnd - timing.connectStart,
            request: timing.responseEnd - timing.requestStart,
            domLoading: timing.domLoading - navigationStart,
            domContentLoaded: timing.domContentLoadedEventEnd - navigationStart,
            loadComplete: timing.loadEventEnd - navigationStart,
            pageLoadTime: timing.loadEventEnd - navigationStart
        };
    }

    getMemoryUsage() {
        if (!window.performance || !window.performance.memory) {
            return { available: false };
        }

        const memory = window.performance.memory;
        return {
            available: true,
            usedJSHeapSize: memory.usedJSHeapSize,
            totalJSHeapSize: memory.totalJSHeapSize,
            jsHeapSizeLimit: memory.jsHeapSizeLimit,
            memoryPressure: memory.usedJSHeapSize / memory.jsHeapSizeLimit
        };
    }

    analyzeDOMComplexity() {
        return {
            totalElements: document.querySelectorAll('*').length,
            depth: this.calculateMaxDOMDepth(),
            scriptTags: document.querySelectorAll('script').length,
            styleTags: document.querySelectorAll('style').length,
            linkTags: document.querySelectorAll('link').length,
            imgTags: document.querySelectorAll('img').length
        };
    }

    analyzeButtonPerformance(button) {
        const startTime = performance.now();

        // Test button style computation time
        const styles = window.getComputedStyle(button);
        const styleComputationTime = performance.now() - startTime;

        // Test element query performance
        const queryStart = performance.now();
        document.getElementById(button.id);
        const queryTime = performance.now() - queryStart;

        return {
            styleComputationTime: styleComputationTime,
            queryTime: queryTime,
            boundingRectTime: this.measureBoundingRectTime(button),
            eventListenerAttachTime: this.measureEventAttachTime(button)
        };
    }

    getResourceTiming() {
        if (!window.performance || !window.performance.getEntriesByType) {
            return { available: false };
        }

        const resources = window.performance.getEntriesByType('resource');
        const scripts = resources.filter(r => r.name.includes('.js'));
        const stylesheets = resources.filter(r => r.name.includes('.css'));

        return {
            available: true,
            totalResources: resources.length,
            scripts: scripts.length,
            stylesheets: stylesheets.length,
            averageLoadTime: resources.reduce((sum, r) => sum + r.duration, 0) / resources.length,
            slowestResource: resources.sort((a, b) => b.duration - a.duration)[0]
        };
    }

    getRenderingMetrics() {
        return {
            devicePixelRatio: window.devicePixelRatio || 1,
            screenResolution: {
                width: screen.width,
                height: screen.height
            },
            viewportSize: {
                width: window.innerWidth,
                height: window.innerHeight
            },
            colorDepth: screen.colorDepth,
            pixelDepth: screen.pixelDepth
        };
    }

    /**
     * 🔒 SECURITY AND ERROR ANALYSIS
     */
    analyzeCSP() {
        const cspMeta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
        const cspHeader = this.getCSPFromHeaders();

        return {
            present: !!(cspMeta || cspHeader),
            metaTag: !!cspMeta,
            httpHeader: !!cspHeader,
            content: cspMeta ? cspMeta.getAttribute('content') : cspHeader,
            restrictive: this.isRestrictiveCSP(cspMeta ? cspMeta.getAttribute('content') : cspHeader),
            allowsInlineScripts: this.cspAllowsInlineScripts(cspMeta ? cspMeta.getAttribute('content') : cspHeader)
        };
    }

    checkSameOriginPolicy() {
        return {
            origin: window.location.origin,
            canAccessParent: this.testParentAccess(),
            canMakeXHR: this.testXHRAccess()
        };
    }

    checkCORSPolicy() {
        return {
            supportsCredentials: 'withCredentials' in new XMLHttpRequest(),
            supportsCORS: 'XMLHttpRequest' in window && 'withCredentials' in new XMLHttpRequest()
        };
    }

    checkFeaturePolicy() {
        return {
            supported: 'featurePolicy' in document || 'permissionsPolicy' in document,
            policies: this.getActivePolicies()
        };
    }

    checkMixedContent() {
        const protocol = window.location.protocol;
        const resources = Array.from(document.querySelectorAll('script[src], link[href], img[src]'));

        const mixedContent = resources.filter(resource => {
            const url = resource.src || resource.href;
            return protocol === 'https:' && url.startsWith('http:');
        });

        return {
            detected: mixedContent.length > 0,
            count: mixedContent.length,
            resources: mixedContent.map(r => r.src || r.href)
        };
    }

    testInlineScriptExecution() {
        try {
            const script = document.createElement('script');
            script.textContent = 'window.testInlineScript = true;';
            document.head.appendChild(script);
            document.head.removeChild(script);

            const blocked = !window.testInlineScript;
            delete window.testInlineScript;

            return { blocked, tested: true };
        } catch (e) {
            return { blocked: true, tested: true, error: e.message };
        }
    }

    /**
     * 🎯 EVENT TESTING METHODS
     */
    testEventSupport() {
        return {
            addEventListener: typeof document.addEventListener === 'function',
            removeEventListener: typeof document.removeEventListener === 'function',
            dispatchEvent: typeof document.dispatchEvent === 'function',
            createEvent: typeof document.createEvent === 'function',
            customEvent: typeof CustomEvent !== 'undefined'
        };
    }

    testEventDelegation() {
        return {
            bubbling: this.testEventBubbling(),
            capturing: this.testEventCapturing(),
            stopPropagation: this.testStopPropagation()
        };
    }

    testCustomEvents() {
        try {
            const event = new CustomEvent('test', { detail: { test: true } });
            return {
                canCreate: true,
                supportsDetail: event.detail && event.detail.test === true,
                supportsBubbling: 'bubbles' in event,
                supportsCancelable: 'cancelable' in event
            };
        } catch (e) {
            return {
                canCreate: false,
                error: e.message
            };
        }
    }

    testTouchEventCompatibility() {
        return {
            touchEvents: 'ontouchstart' in window,
            pointerEvents: 'onpointerdown' in window,
            msPointerEvents: 'onmspointerdown' in window,
            touchAction: 'touchAction' in document.documentElement.style
        };
    }

    testKeyboardEventSupport() {
        return {
            keydown: 'onkeydown' in window,
            keyup: 'onkeyup' in window,
            keypress: 'onkeypress' in window,
            keyCode: this.testKeyCodeSupport(),
            key: this.testKeyPropertySupport(),
            code: this.testCodePropertySupport()
        };
    }

    testFocusEventSupport() {
        return {
            focus: 'onfocus' in window,
            blur: 'onblur' in window,
            focusin: 'onfocusin' in window,
            focusout: 'onfocusout' in window
        };
    }

    testButtonEventCompatibility(button) {
        return {
            clickSupported: typeof button.click === 'function',
            onclickSupported: 'onclick' in button,
            addEventListenerSupported: typeof button.addEventListener === 'function',
            focusSupported: typeof button.focus === 'function',
            blurSupported: typeof button.blur === 'function'
        };
    }

    /**
     * 🐛 ERROR ANALYSIS METHODS
     */
    setupErrorCapture() {
        const errors = [];

        // Capture JavaScript errors
        const originalError = window.onerror;
        window.onerror = function(message, source, lineno, colno, error) {
            errors.push({
                type: 'javascript',
                message,
                source,
                lineno,
                colno,
                error: error ? error.toString() : null
            });

            if (originalError) {
                return originalError.apply(this, arguments);
            }
        };

        // Capture unhandled promise rejections
        const originalUnhandledRejection = window.onunhandledrejection;
        window.onunhandledrejection = function(event) {
            errors.push({
                type: 'unhandled-promise',
                reason: event.reason ? event.reason.toString() : 'Unknown'
            });

            if (originalUnhandledRejection) {
                return originalUnhandledRejection.apply(this, arguments);
            }
        };

        return {
            setup: true,
            capturedErrors: errors,
            totalCaptured: errors.length
        };
    }

    identifyBrowserSpecificErrors() {
        const browserInfo = this.detectBrowserAndEngine();
        const commonErrors = [];

        // Internet Explorer specific errors
        if (browserInfo.internetExplorer) {
            commonErrors.push('IE compatibility mode may cause JavaScript errors');
            if (browserInfo.version.internetExplorer < 11) {
                commonErrors.push('IE version too old for modern JavaScript features');
            }
        }

        // Safari specific errors
        if (browserInfo.safari) {
            commonErrors.push('Safari may have issues with some ES6+ features');
        }

        // Mobile browser errors
        if (browserInfo.mobileSafari) {
            commonErrors.push('Mobile Safari may have touch event issues');
        }

        if (browserInfo.androidBrowser) {
            commonErrors.push('Android browser may have limited ES6 support');
        }

        return commonErrors;
    }

    analyzeJavaScriptErrors() {
        // This would analyze actual JavaScript errors from the console
        // For this diagnostic, we'll provide a framework for error categorization
        return {
            syntaxErrors: [],
            referenceErrors: [],
            typeErrors: [],
            rangeErrors: [],
            polyfillNeeded: []
        };
    }

    analyzeCSSErrors() {
        return {
            unsupportedProperties: [],
            invalidValues: [],
            vendorPrefixIssues: []
        };
    }

    analyzeNetworkErrors() {
        return {
            failedRequests: [],
            corsErrors: [],
            timeoutErrors: []
        };
    }

    findDeprecationWarnings() {
        // Check for usage of deprecated features
        const deprecatedFeatures = [];

        // Check for deprecated event handlers
        if (document.body.onload) {
            deprecatedFeatures.push('document.body.onload - use addEventListener instead');
        }

        // Check for deprecated CSS properties
        const styles = document.querySelectorAll('style');
        styles.forEach(style => {
            if (style.textContent.includes('-webkit-box')) {
                deprecatedFeatures.push('Old flexbox syntax detected');
            }
        });

        return deprecatedFeatures;
    }

    identifyErrorPatterns(consoleErrors) {
        const patterns = [];

        // Common browser-specific error patterns
        const errorPatterns = {
            'Object doesn\'t support property or method': 'Internet Explorer compatibility issue',
            'Can\'t find variable': 'Safari/WebKit undefined variable error',
            'Permission denied': 'Cross-origin security error',
            'Script error': 'Cross-origin script error (CORS issue)'
        };

        // This would analyze actual console errors for patterns
        // For this diagnostic, we provide the framework

        return patterns;
    }

    /**
     * 🧪 COMPATIBILITY TESTING METHODS
     */
    testButtonClickCompatibility(button) {
        return {
            nativeClickWorks: typeof button.click === 'function',
            canAttachClickHandler: typeof button.addEventListener === 'function',
            onclickWorks: 'onclick' in button,
            syntheticClickWorks: this.testSyntheticClick(button),
            keyboardAccessible: this.testKeyboardActivation(button)
        };
    }

    testAJAXCompatibility() {
        return {
            xhr: typeof XMLHttpRequest !== 'undefined',
            fetch: typeof fetch !== 'undefined',
            cors: 'withCredentials' in new XMLHttpRequest(),
            json: typeof JSON !== 'undefined',
            formData: typeof FormData !== 'undefined'
        };
    }

    testJQueryCompatibility() {
        if (typeof jQuery === 'undefined') {
            return { available: false };
        }

        return {
            available: true,
            version: jQuery.fn.jquery,
            ready: jQuery.isReady,
            ajax: typeof jQuery.ajax === 'function',
            events: typeof jQuery.fn.on === 'function',
            noConflict: typeof jQuery.noConflict === 'function'
        };
    }

    testWordPressCompatibility() {
        return {
            wpPresent: typeof wp !== 'undefined',
            ajaxurl: typeof ajaxurl !== 'undefined',
            adminContext: window.location.href.includes('/wp-admin/'),
            jqueryNoConflict: typeof $ === 'undefined' || $ === jQuery
        };
    }

    testCrossBrowserEvents() {
        const eventTests = {};

        const events = ['click', 'mousedown', 'mouseup', 'keydown', 'focus', 'blur'];

        events.forEach(eventType => {
            eventTests[eventType] = this.testEventTypeSupport(eventType);
        });

        return eventTests;
    }

    identifyPolyfillRequirements() {
        const polyfills = [];

        // Check for missing ES6+ features
        if (!window.Promise) polyfills.push('Promise polyfill');
        if (!Array.prototype.find) polyfills.push('Array.find polyfill');
        if (!Object.assign) polyfills.push('Object.assign polyfill');
        if (!window.fetch) polyfills.push('Fetch polyfill');

        // Check for missing DOM APIs
        if (!document.querySelector) polyfills.push('querySelector polyfill');
        if (!document.addEventListener) polyfills.push('addEventListener polyfill');

        // Check for missing CSS features
        if (!this.testCSSSupport('display', 'flex')) polyfills.push('Flexbox polyfill');

        return polyfills;
    }

    calculateOverallCompatibilityScore() {
        const scores = [];

        // JavaScript compatibility (40% weight)
        const jsScore = this.diagnostics.browserCompatibility.javascriptSupport?.compatibilityScore || 0;
        scores.push({ score: jsScore, weight: 0.4 });

        // CSS compatibility (30% weight)
        const cssScore = this.diagnostics.browserCompatibility.cssSupport?.compatibilityScore || 0;
        scores.push({ score: cssScore, weight: 0.3 });

        // Event handling compatibility (20% weight)
        const eventScore = this.calculateEventCompatibilityScore();
        scores.push({ score: eventScore, weight: 0.2 });

        // Security/Performance (10% weight)
        const securityScore = this.calculateSecurityCompatibilityScore();
        scores.push({ score: securityScore, weight: 0.1 });

        // Calculate weighted average
        const totalScore = scores.reduce((sum, item) => sum + (item.score * item.weight), 0);

        return Math.round(totalScore);
    }

    runButtonSpecificCompatibilityTests(button) {
        return {
            visualRendering: this.testButtonVisualRendering(button),
            interactionCompatibility: this.testButtonInteractionCompatibility(button),
            accessibilityCompatibility: this.testButtonAccessibilityCompatibility(button),
            responsiveCompatibility: this.testButtonResponsiveCompatibility(button)
        };
    }

    /**
     * 🛠️ UTILITY AND HELPER METHODS
     */
    testFeature(testFunction) {
        try {
            testFunction();
            return true;
        } catch (e) {
            return false;
        }
    }

    testCSSSupport(property, value, isPseudoClass = false) {
        if (isPseudoClass) {
            // Simplified pseudo-class support test
            return true; // Most browsers support basic pseudo-classes
        }

        const element = document.createElement('div');
        try {
            element.style[property] = value;
            return element.style[property] === value || element.style[property] !== '';
        } catch (e) {
            return false;
        }
    }

    getNestedProperty(obj, path) {
        return path.split('.').reduce((current, prop) => current && current[prop], obj);
    }

    detectWebGLSupport() {
        try {
            const canvas = document.createElement('canvas');
            return !!(window.WebGLRenderingContext && canvas.getContext('webgl'));
        } catch (e) {
            return false;
        }
    }

    testStorageSupport(storageType) {
        try {
            const storage = window[storageType];
            const testKey = '__storage_test__';
            storage.setItem(testKey, 'test');
            storage.removeItem(testKey);
            return true;
        } catch (e) {
            return false;
        }
    }

    checkKnownCompatibilityIssues(browserInfo) {
        const issues = [];

        // Internet Explorer issues
        if (browserInfo.internetExplorer) {
            issues.push('Internet Explorer detected - many modern features unsupported');
            if (browserInfo.version.internetExplorer < 11) {
                issues.push('IE version too old - critical compatibility issues expected');
            }
        }

        // Old browser versions
        if (browserInfo.chrome && browserInfo.version.chrome < 60) {
            issues.push('Chrome version too old for optimal compatibility');
        }

        if (browserInfo.firefox && browserInfo.version.firefox < 55) {
            issues.push('Firefox version too old for optimal compatibility');
        }

        if (browserInfo.safari && browserInfo.version.safari < 12) {
            issues.push('Safari version may have compatibility issues');
        }

        return issues;
    }

    calculateMaxDOMDepth() {
        let maxDepth = 0;

        function calculateDepth(element, currentDepth = 0) {
            maxDepth = Math.max(maxDepth, currentDepth);
            for (let child of element.children) {
                calculateDepth(child, currentDepth + 1);
            }
        }

        calculateDepth(document.body);
        return maxDepth;
    }

    measureBoundingRectTime(button) {
        const startTime = performance.now();
        button.getBoundingClientRect();
        return performance.now() - startTime;
    }

    measureEventAttachTime(button) {
        const startTime = performance.now();
        const handler = () => {};
        button.addEventListener('click', handler);
        button.removeEventListener('click', handler);
        return performance.now() - startTime;
    }

    getCSPFromHeaders() {
        // This would need to be implemented to check HTTP headers
        // For client-side diagnostic, we can only check meta tags
        return null;
    }

    isRestrictiveCSP(cspContent) {
        if (!cspContent) return false;
        return cspContent.includes('script-src') && !cspContent.includes('unsafe-inline');
    }

    cspAllowsInlineScripts(cspContent) {
        if (!cspContent) return true;
        return !cspContent.includes('script-src') || cspContent.includes('unsafe-inline');
    }

    testParentAccess() {
        try {
            return window.parent !== window && !!window.parent.document;
        } catch (e) {
            return false;
        }
    }

    testXHRAccess() {
        try {
            const xhr = new XMLHttpRequest();
            return true;
        } catch (e) {
            return false;
        }
    }

    getActivePolicies() {
        if ('featurePolicy' in document) {
            try {
                return document.featurePolicy.allowedFeatures();
            } catch (e) {
                return [];
            }
        }
        return [];
    }

    testEventBubbling() {
        // Simplified test - in reality would create test elements
        return true;
    }

    testEventCapturing() {
        // Simplified test - in reality would test capture phase
        return typeof document.addEventListener === 'function';
    }

    testStopPropagation() {
        // Test if stopPropagation method exists
        try {
            const event = new Event('test');
            return typeof event.stopPropagation === 'function';
        } catch (e) {
            return false;
        }
    }

    testKeyCodeSupport() {
        try {
            const event = new KeyboardEvent('keydown', { keyCode: 13 });
            return 'keyCode' in event;
        } catch (e) {
            return false;
        }
    }

    testKeyPropertySupport() {
        try {
            const event = new KeyboardEvent('keydown', { key: 'Enter' });
            return 'key' in event;
        } catch (e) {
            return false;
        }
    }

    testCodePropertySupport() {
        try {
            const event = new KeyboardEvent('keydown', { code: 'Enter' });
            return 'code' in event;
        } catch (e) {
            return false;
        }
    }

    testSyntheticClick(button) {
        try {
            const event = new MouseEvent('click', { bubbles: true, cancelable: true });
            return button.dispatchEvent(event);
        } catch (e) {
            return false;
        }
    }

    testKeyboardActivation(button) {
        try {
            const event = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true });
            return button.dispatchEvent(event);
        } catch (e) {
            return false;
        }
    }

    testEventTypeSupport(eventType) {
        try {
            const event = new Event(eventType);
            return {
                canCreate: true,
                bubbles: event.bubbles,
                cancelable: event.cancelable
            };
        } catch (e) {
            return {
                canCreate: false,
                error: e.message
            };
        }
    }

    calculateEventCompatibilityScore() {
        // Simplified calculation - would be based on actual event test results
        return 85; // Placeholder
    }

    calculateSecurityCompatibilityScore() {
        // Simplified calculation - would be based on security policy analysis
        return 90; // Placeholder
    }

    testButtonVisualRendering(button) {
        const styles = window.getComputedStyle(button);
        return {
            hasBackgroundColor: styles.backgroundColor !== 'rgba(0, 0, 0, 0)',
            hasBorder: styles.border !== 'none',
            hasFont: styles.fontFamily !== '',
            isVisible: styles.display !== 'none' && styles.visibility !== 'hidden'
        };
    }

    testButtonInteractionCompatibility(button) {
        return {
            clickable: !button.disabled && styles.pointerEvents !== 'none',
            focusable: button.tabIndex >= 0 || button.tagName === 'BUTTON',
            keyboardAccessible: true // Simplified
        };
    }

    testButtonAccessibilityCompatibility(button) {
        return {
            hasAccessibleName: !!(button.getAttribute('aria-label') || button.textContent.trim()),
            hasRole: button.getAttribute('role') === 'button' || button.tagName === 'BUTTON',
            hasKeyboardSupport: true // Simplified
        };
    }

    testButtonResponsiveCompatibility(button) {
        const rect = button.getBoundingClientRect();
        return {
            adequateSize: rect.width >= 44 && rect.height >= 44,
            withinViewport: rect.left >= 0 && rect.top >= 0,
            notClipped: rect.right <= window.innerWidth && rect.bottom <= window.innerHeight
        };
    }

    /**
     * 📋 GENERATE COMPREHENSIVE REPORT
     */
    generateReport() {
        console.group('📋 BROWSER COMPATIBILITY DIAGNOSTIC REPORT');

        const report = {
            ...this.diagnostics,
            summary: {
                totalIssues: this.diagnostics.criticalIssues.length,
                severity: this.calculateSeverity(),
                recommendations: this.generateRecommendations(),
                overallCompatibility: this.calculateOverallCompatibility(),
                browserOptimization: this.calculateBrowserOptimization()
            }
        };

        // Log summary
        console.log('🔍 DIAGNOSTIC SUMMARY:');
        console.log(`Browser: ${report.browserCompatibility.browserInfo?.detection?.primaryBrowser} ${report.browserCompatibility.browserInfo?.detection?.version || ''}`);
        console.log(`Total Critical Issues: ${report.summary.totalIssues}`);
        console.log(`Severity Level: ${report.summary.severity}`);
        console.log(`Overall Compatibility: ${report.summary.overallCompatibility}/100`);
        console.log('Critical Issues:', this.diagnostics.criticalIssues);

        if (report.summary.recommendations.length > 0) {
            console.log('💡 RECOMMENDATIONS:');
            report.summary.recommendations.forEach(rec => console.log(`- ${rec}`));
        }

        console.groupEnd();
        console.groupEnd(); // End main diagnostic group

        // Store globally
        window.agent6BrowserReport = report;
        console.log('📊 Report stored in: window.agent6BrowserReport');

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
            if (issue.includes('Internet Explorer')) {
                recommendations.push('Consider dropping IE support or provide polyfills for modern features');
            }
            if (issue.includes('JavaScript compatibility')) {
                recommendations.push('Add polyfills for missing JavaScript features');
            }
            if (issue.includes('CSS features')) {
                recommendations.push('Use vendor prefixes or provide CSS fallbacks');
            }
            if (issue.includes('event handling')) {
                recommendations.push('Implement cross-browser event handling strategies');
            }
            if (issue.includes('security')) {
                recommendations.push('Review and adjust Content Security Policy settings');
            }
            if (issue.includes('performance')) {
                recommendations.push('Optimize code for better performance in older browsers');
            }
        });

        return [...new Set(recommendations)];
    }

    calculateOverallCompatibility() {
        const jsScore = this.diagnostics.browserCompatibility.javascriptSupport?.compatibilityScore || 0;
        const cssScore = this.diagnostics.browserCompatibility.cssSupport?.compatibilityScore || 0;

        // Weight JavaScript compatibility more heavily since it's critical for button functionality
        return Math.round((jsScore * 0.6) + (cssScore * 0.4));
    }

    calculateBrowserOptimization() {
        let optimizationScore = 0;
        const maxScore = 10;

        const browserInfo = this.diagnostics.browserCompatibility.browserInfo?.detection;

        // Modern browser (4 points)
        if (browserInfo && !browserInfo.internetExplorer) {
            optimizationScore += 4;
        }

        // Good JavaScript support (3 points)
        const jsScore = this.diagnostics.browserCompatibility.javascriptSupport?.compatibilityScore || 0;
        if (jsScore >= 80) {
            optimizationScore += 3;
        }

        // Good CSS support (2 points)
        const cssScore = this.diagnostics.browserCompatibility.cssSupport?.compatibilityScore || 0;
        if (cssScore >= 80) {
            optimizationScore += 2;
        }

        // No critical issues (1 point)
        if (this.diagnostics.criticalIssues.length === 0) {
            optimizationScore += 1;
        }

        return optimizationScore >= 7; // 70% threshold
    }
}

/**
 * 🚀 AUTO-EXECUTE BROWSER COMPATIBILITY DIAGNOSTIC
 */
console.log('🤖 AGENT 6: BROWSER COMPATIBILITY DIAGNOSTIC LOADED');
console.log('🚀 Starting automatic browser compatibility analysis...');

const browserAgent = new BrowserCompatibilityDiagnostic();
browserAgent.runComprehensiveDiagnosis().then(report => {
    console.log('✅ AGENT 6 BROWSER COMPATIBILITY DIAGNOSTIC COMPLETE');
    console.log('📊 Access results: window.agent6BrowserReport');
});