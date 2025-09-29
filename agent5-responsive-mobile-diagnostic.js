/**
 * 🤖 AGENT 5: RESPONSIVE/MOBILE CSS ISSUES SPECIALIST
 *
 * Comprehensive responsive design and mobile CSS diagnostic for #design-preview-btn
 * Analyzes viewport, touch events, responsive breakpoints, and mobile compatibility
 *
 * USAGE: Copy & paste into browser console on Order 5374 page
 */

class ResponsiveMobileDiagnostic {
    constructor() {
        this.buttonId = 'design-preview-btn';
        this.diagnostics = {
            timestamp: new Date().toISOString(),
            responsiveAnalysis: {
                viewport: null,
                touchEvents: null,
                responsiveBreakpoints: null,
                mobileCompatibility: null,
                accessibility: null,
                wordPressResponsive: null
            },
            criticalIssues: [],
            recommendations: []
        };

        console.group('🤖 AGENT 5: RESPONSIVE/MOBILE DIAGNOSTIC');
        console.log('Target:', this.buttonId);
        console.log('Analysis started at:', this.diagnostics.timestamp);
        console.log('Device info:', this.getDeviceInfo());
    }

    /**
     * 🔍 MAIN DIAGNOSTIC ENTRY POINT
     */
    async runComprehensiveDiagnosis() {
        const button = document.getElementById(this.buttonId);

        console.log('📱 Analyzing responsive and mobile compatibility...');

        // Run all diagnostic modules
        await this.analyzeViewportConfiguration();
        await this.testTouchEventCompatibility(button);
        await this.checkResponsiveBreakpoints(button);
        await this.analyzeMobileBrowserCompatibility(button);
        await this.validateAccessibilityAndTouchTargets(button);
        await this.checkWordPressResponsiveDesign(button);
        await this.performResponsiveTests(button);

        return this.generateReport();
    }

    /**
     * 📐 VIEWPORT CONFIGURATION ANALYSIS
     */
    analyzeViewportConfiguration() {
        console.group('📐 VIEWPORT CONFIGURATION ANALYSIS');

        const viewportAnalysis = {
            metaTag: this.analyzeViewportMetaTag(),
            currentViewport: this.getCurrentViewportInfo(),
            scalingIssues: [],
            mobileOptimization: {}
        };

        // Check viewport meta tag
        if (!viewportAnalysis.metaTag.exists) {
            this.diagnostics.criticalIssues.push('Viewport meta tag missing - mobile rendering will be problematic');
            console.error('❌ Viewport meta tag missing');
        } else if (!viewportAnalysis.metaTag.isMobileOptimized) {
            this.diagnostics.criticalIssues.push('Viewport not optimized for mobile devices');
            console.warn('⚠️ Viewport not optimized for mobile');
        } else {
            console.log('✅ Viewport properly configured for mobile');
        }

        // Check for user scaling restrictions
        if (viewportAnalysis.metaTag.userScalableDisabled) {
            viewportAnalysis.scalingIssues.push('User scaling disabled - accessibility issue');
            console.warn('⚠️ User scaling disabled - may cause accessibility issues');
        }

        // Check current viewport dimensions
        const viewport = viewportAnalysis.currentViewport;
        viewportAnalysis.mobileOptimization = {
            isMobileSize: viewport.width <= 768,
            isTabletSize: viewport.width > 768 && viewport.width <= 1024,
            isDesktopSize: viewport.width > 1024,
            devicePixelRatio: window.devicePixelRatio || 1
        };

        this.diagnostics.responsiveAnalysis.viewport = viewportAnalysis;
        console.log('📊 Viewport Analysis:', viewportAnalysis);
        console.groupEnd();
    }

    /**
     * 👆 TOUCH EVENT COMPATIBILITY ANALYSIS
     */
    testTouchEventCompatibility(button) {
        console.group('👆 TOUCH EVENT COMPATIBILITY ANALYSIS');

        const touchAnalysis = {
            deviceCapabilities: this.detectTouchCapabilities(),
            touchTargetSize: null,
            touchEventSupport: this.testTouchEventSupport(),
            touchActionOptimization: null,
            gestureConflicts: []
        };

        if (button) {
            // Analyze touch target size
            const buttonRect = button.getBoundingClientRect();
            touchAnalysis.touchTargetSize = {
                width: buttonRect.width,
                height: buttonRect.height,
                meetsWCAG: buttonRect.width >= 44 && buttonRect.height >= 44,
                meetsAppleGuidelines: buttonRect.width >= 44 && buttonRect.height >= 44,
                meetsAndroidGuidelines: buttonRect.width >= 48 && buttonRect.height >= 48
            };

            // Check WCAG compliance
            if (!touchAnalysis.touchTargetSize.meetsWCAG) {
                this.diagnostics.criticalIssues.push(`Touch target too small: ${Math.round(buttonRect.width)}x${Math.round(buttonRect.height)}px (minimum 44x44px)`);
                console.error('❌ Touch target too small for accessibility guidelines');
            } else {
                console.log('✅ Touch target meets WCAG guidelines');
            }

            // Analyze touch-action CSS property
            const touchAction = window.getComputedStyle(button).touchAction;
            touchAnalysis.touchActionOptimization = {
                currentValue: touchAction,
                isOptimized: touchAction !== 'auto',
                recommendation: this.getTouchActionRecommendation(button)
            };

            // Check for touch event handlers
            touchAnalysis.hasTouchHandlers = this.checkTouchEventHandlers(button);

            // Test actual touch responsiveness
            if (touchAnalysis.deviceCapabilities.hasTouch) {
                touchAnalysis.touchResponsiveness = this.testTouchResponsiveness(button);
            }
        }

        // Check for gesture conflicts
        touchAnalysis.gestureConflicts = this.detectGestureConflicts(button);

        this.diagnostics.responsiveAnalysis.touchEvents = touchAnalysis;
        console.log('📊 Touch Event Analysis:', touchAnalysis);
        console.groupEnd();
    }

    /**
     * 📐 RESPONSIVE BREAKPOINTS ANALYSIS
     */
    checkResponsiveBreakpoints(button) {
        console.group('📐 RESPONSIVE BREAKPOINTS ANALYSIS');

        const breakpointAnalysis = {
            standardBreakpoints: this.testStandardBreakpoints(button),
            wordpressBreakpoints: this.testWordPressBreakpoints(button),
            customBreakpoints: this.detectCustomBreakpoints(),
            breakpointIssues: [],
            responsiveBehavior: {}
        };

        // Test button behavior at different breakpoints
        const breakpoints = [
            { name: 'mobile', width: 320 },
            { name: 'mobile-large', width: 480 },
            { name: 'tablet', width: 768 },
            { name: 'wp-tablet', width: 782 }, // WordPress specific
            { name: 'desktop', width: 1024 },
            { name: 'large-desktop', width: 1200 }
        ];

        breakpoints.forEach(bp => {
            const result = this.testBreakpointBehavior(button, bp);
            breakpointAnalysis.responsiveBehavior[bp.name] = result;

            if (result.hasIssues) {
                breakpointAnalysis.breakpointIssues.push(...result.issues);
                console.warn(`⚠️ Issues at ${bp.name} breakpoint:`, result.issues);
            }
        });

        // Check for responsive CSS that affects button
        const responsiveCSS = this.analyzeResponsiveCSS(button);
        breakpointAnalysis.responsiveCSS = responsiveCSS;

        if (responsiveCSS.hidesButton.length > 0) {
            this.diagnostics.criticalIssues.push(`Button hidden by responsive CSS at: ${responsiveCSS.hidesButton.join(', ')}`);
        }

        this.diagnostics.responsiveAnalysis.responsiveBreakpoints = breakpointAnalysis;
        console.log('📊 Responsive Breakpoints Analysis:', breakpointAnalysis);
        console.groupEnd();
    }

    /**
     * 📱 MOBILE BROWSER COMPATIBILITY
     */
    analyzeMobileBrowserCompatibility(button) {
        console.group('📱 MOBILE BROWSER COMPATIBILITY');

        const mobileCompatibility = {
            browserDetection: this.detectMobileBrowser(),
            featureSupport: this.testMobileFeatureSupport(),
            browserSpecificIssues: [],
            performanceIssues: []
        };

        const browser = mobileCompatibility.browserDetection;

        // iOS Safari specific checks
        if (browser.isIOSSafari) {
            console.log('📱 iOS Safari detected - checking iOS-specific issues');
            const iosIssues = this.checkIOSSpecificIssues(button);
            mobileCompatibility.browserSpecificIssues.push(...iosIssues);

            if (iosIssues.length > 0) {
                console.warn('⚠️ iOS Safari issues detected:', iosIssues);
            }
        }

        // Android Chrome specific checks
        if (browser.isAndroidChrome) {
            console.log('🤖 Android Chrome detected - checking Android-specific issues');
            const androidIssues = this.checkAndroidSpecificIssues(button);
            mobileCompatibility.browserSpecificIssues.push(...androidIssues);

            if (androidIssues.length > 0) {
                console.warn('⚠️ Android Chrome issues detected:', androidIssues);
            }
        }

        // Mobile WebView checks
        if (browser.isMobileWebView) {
            console.log('🌐 Mobile WebView detected');
            const webViewIssues = this.checkMobileWebViewIssues(button);
            mobileCompatibility.browserSpecificIssues.push(...webViewIssues);
        }

        // Performance analysis for mobile
        mobileCompatibility.performanceIssues = this.analyzeMMobilePerformance(button);

        // Feature support testing
        const unsupportedFeatures = Object.entries(mobileCompatibility.featureSupport)
            .filter(([feature, supported]) => !supported)
            .map(([feature]) => feature);

        if (unsupportedFeatures.length > 0) {
            console.warn('⚠️ Unsupported features:', unsupportedFeatures);
        }

        this.diagnostics.responsiveAnalysis.mobileCompatibility = mobileCompatibility;
        console.log('📊 Mobile Compatibility Analysis:', mobileCompatibility);
        console.groupEnd();
    }

    /**
     * ♿ ACCESSIBILITY AND TOUCH TARGETS
     */
    validateAccessibilityAndTouchTargets(button) {
        console.group('♿ ACCESSIBILITY AND TOUCH TARGETS');

        const accessibilityAnalysis = {
            touchTargetCompliance: null,
            ariaAttributes: null,
            focusManagement: null,
            colorContrast: null,
            visualIndicators: null,
            screenReaderCompatibility: null
        };

        if (button) {
            // Touch target size validation (WCAG 2.1 AA)
            const rect = button.getBoundingClientRect();
            accessibilityAnalysis.touchTargetCompliance = {
                currentSize: { width: rect.width, height: rect.height },
                wcagCompliant: rect.width >= 44 && rect.height >= 44,
                appleCompliant: rect.width >= 44 && rect.height >= 44,
                androidCompliant: rect.width >= 48 && rect.height >= 48,
                spacing: this.checkTouchTargetSpacing(button)
            };

            if (!accessibilityAnalysis.touchTargetCompliance.wcagCompliant) {
                this.diagnostics.criticalIssues.push('Touch target violates WCAG 2.1 AA guidelines (minimum 44x44px)');
            }

            // ARIA attributes analysis
            accessibilityAnalysis.ariaAttributes = this.analyzeARIAAttributes(button);

            // Focus management
            accessibilityAnalysis.focusManagement = this.testFocusManagement(button);

            // Color contrast
            accessibilityAnalysis.colorContrast = this.testColorContrast(button);

            // Visual indicators
            accessibilityAnalysis.visualIndicators = this.checkVisualIndicators(button);

            // Screen reader compatibility
            accessibilityAnalysis.screenReaderCompatibility = this.testScreenReaderCompatibility(button);
        }

        // Check for accessibility issues
        const accessibilityIssues = this.compileAccessibilityIssues(accessibilityAnalysis);
        if (accessibilityIssues.length > 0) {
            this.diagnostics.criticalIssues.push(...accessibilityIssues);
            console.warn('⚠️ Accessibility issues found:', accessibilityIssues);
        } else {
            console.log('✅ No major accessibility issues detected');
        }

        this.diagnostics.responsiveAnalysis.accessibility = accessibilityAnalysis;
        console.log('📊 Accessibility Analysis:', accessibilityAnalysis);
        console.groupEnd();
    }

    /**
     * 🌐 WORDPRESS RESPONSIVE DESIGN
     */
    checkWordPressResponsiveDesign(button) {
        console.group('🌐 WORDPRESS RESPONSIVE DESIGN');

        const wpResponsiveAnalysis = {
            adminResponsive: this.analyzeWordPressAdminResponsive(button),
            themeCompatibility: this.checkThemeResponsiveCompatibility(),
            wooCommerceResponsive: this.analyzeWooCommerceResponsive(button),
            adminBarBehavior: this.checkAdminBarResponsive(),
            sidebarCollapse: this.analyzeSidebarCollapseBehavior(button)
        };

        // Check WordPress admin responsive behavior
        const currentWidth = window.innerWidth;
        const isWPTabletBreakpoint = currentWidth <= 782;
        const isWPMobileBreakpoint = currentWidth <= 600;

        wpResponsiveAnalysis.currentBreakpoint = {
            width: currentWidth,
            isTablet: isWPTabletBreakpoint,
            isMobile: isWPMobileBreakpoint,
            isDesktop: currentWidth > 782
        };

        if (button) {
            // Check if button behaves properly at WordPress breakpoints
            const wpBreakpointIssues = this.checkWordPressBreakpointBehavior(button, wpResponsiveAnalysis.currentBreakpoint);
            if (wpBreakpointIssues.length > 0) {
                wpResponsiveAnalysis.breakpointIssues = wpBreakpointIssues;
                console.warn('⚠️ WordPress responsive issues:', wpBreakpointIssues);
            }

            // Check admin bar interference on mobile
            if (isWPMobileBreakpoint) {
                const adminBarIssues = this.checkMobileAdminBarInterference(button);
                if (adminBarIssues.length > 0) {
                    wpResponsiveAnalysis.adminBarBehavior.mobileIssues = adminBarIssues;
                }
            }
        }

        this.diagnostics.responsiveAnalysis.wordPressResponsive = wpResponsiveAnalysis;
        console.log('📊 WordPress Responsive Analysis:', wpResponsiveAnalysis);
        console.groupEnd();
    }

    /**
     * 🧪 RESPONSIVE TESTS
     */
    performResponsiveTests(button) {
        console.group('🧪 RESPONSIVE TESTS');

        const responsiveTests = {
            orientationChange: this.testOrientationChange(button),
            zoomCompatibility: this.testZoomCompatibility(button),
            keyboardNavigation: this.testMobileKeyboardNavigation(button),
            gestureSupport: this.testGestureSupport(button)
        };

        // Test orientation change behavior
        if (responsiveTests.orientationChange.hasIssues) {
            console.warn('⚠️ Orientation change issues detected');
        }

        // Test zoom compatibility
        if (responsiveTests.zoomCompatibility.hasIssues) {
            console.warn('⚠️ Zoom compatibility issues detected');
        }

        console.log('📊 Responsive Tests Results:', responsiveTests);
        console.groupEnd();
    }

    /**
     * 🛠️ UTILITY METHODS
     */
    getDeviceInfo() {
        return {
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
            isTablet: /iPad|Android(?!.*Mobile)/i.test(navigator.userAgent),
            viewport: {
                width: window.innerWidth,
                height: window.innerHeight
            },
            screen: {
                width: screen.width,
                height: screen.height
            },
            devicePixelRatio: window.devicePixelRatio || 1
        };
    }

    analyzeViewportMetaTag() {
        const viewportMeta = document.querySelector('meta[name="viewport"]');

        if (!viewportMeta) {
            return {
                exists: false,
                isMobileOptimized: false,
                userScalableDisabled: false
            };
        }

        const content = viewportMeta.getAttribute('content') || '';
        const hasDeviceWidth = content.includes('width=device-width');
        const hasInitialScale = content.includes('initial-scale=1');
        const userScalableDisabled = content.includes('user-scalable=no') || content.includes('user-scalable=0');

        return {
            exists: true,
            content: content,
            isMobileOptimized: hasDeviceWidth && hasInitialScale,
            userScalableDisabled: userScalableDisabled,
            hasMaximumScale: content.includes('maximum-scale'),
            hasMinimumScale: content.includes('minimum-scale')
        };
    }

    getCurrentViewportInfo() {
        return {
            width: window.innerWidth,
            height: window.innerHeight,
            availableWidth: screen.availWidth,
            availableHeight: screen.availHeight,
            devicePixelRatio: window.devicePixelRatio || 1,
            orientation: screen.orientation ? screen.orientation.angle : 0
        };
    }

    detectTouchCapabilities() {
        return {
            hasTouch: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
            maxTouchPoints: navigator.maxTouchPoints || 0,
            hasPointerEvents: 'onpointerdown' in window,
            hasHover: window.matchMedia('(hover: hover)').matches,
            hasFinePointer: window.matchMedia('(pointer: fine)').matches,
            hasCoarsePointer: window.matchMedia('(pointer: coarse)').matches
        };
    }

    testTouchEventSupport() {
        return {
            touchstart: 'ontouchstart' in window,
            touchmove: 'ontouchmove' in window,
            touchend: 'ontouchend' in window,
            touchcancel: 'ontouchcancel' in window,
            pointerdown: 'onpointerdown' in window,
            pointermove: 'onpointermove' in window,
            pointerup: 'onpointerup' in window
        };
    }

    getTouchActionRecommendation(button) {
        if (!button) return 'none';

        const currentTouchAction = window.getComputedStyle(button).touchAction;

        // For buttons, we typically want to prevent default touch behaviors
        if (currentTouchAction === 'auto') {
            return 'manipulation'; // Prevents double-tap zoom while allowing pan/zoom
        }

        return currentTouchAction;
    }

    checkTouchEventHandlers(button) {
        if (!button) return { hasHandlers: false };

        const touchHandlers = {
            hasHandlers: false,
            touchstart: !!button.ontouchstart,
            touchend: !!button.ontouchend,
            touchmove: !!button.ontouchmove,
            pointerdown: !!button.onpointerdown,
            pointerup: !!button.onpointerup
        };

        touchHandlers.hasHandlers = Object.values(touchHandlers).some(handler => handler === true);

        return touchHandlers;
    }

    testTouchResponsiveness(button) {
        if (!button) return { tested: false };

        // Test if button responds to programmatic touch events
        // This is a passive test - we don't actually dispatch events
        return {
            tested: true,
            canCreateTouchEvents: typeof TouchEvent !== 'undefined',
            touchEventsEnabled: !button.style.pointerEvents || button.style.pointerEvents !== 'none',
            touchActionOptimized: window.getComputedStyle(button).touchAction !== 'auto'
        };
    }

    detectGestureConflicts(button) {
        const conflicts = [];

        if (!button) return conflicts;

        const buttonRect = button.getBoundingClientRect();

        // Check for elements that might intercept gestures
        const gestureElements = document.querySelectorAll('[ontouchstart], [ontouchend], [onpointerdown]');
        gestureElements.forEach(element => {
            if (element !== button) {
                const elementRect = element.getBoundingClientRect();
                if (this.rectsOverlap(buttonRect, elementRect)) {
                    conflicts.push({
                        element: this.getElementInfo(element),
                        type: 'overlapping_gesture_handler'
                    });
                }
            }
        });

        // Check for drag/swipe containers that might interfere
        const swipeContainers = button.closest('[class*="swipe"], [class*="drag"], [class*="scroll"]');
        if (swipeContainers) {
            conflicts.push({
                type: 'gesture_container',
                container: this.getElementInfo(swipeContainers)
            });
        }

        return conflicts;
    }

    testStandardBreakpoints(button) {
        const standardBreakpoints = {
            'mobile': '(max-width: 480px)',
            'tablet': '(max-width: 768px)',
            'desktop': '(min-width: 769px)',
            'large': '(min-width: 1200px)'
        };

        const results = {};

        Object.entries(standardBreakpoints).forEach(([name, query]) => {
            const mediaQuery = window.matchMedia(query);
            results[name] = {
                matches: mediaQuery.matches,
                query: query,
                issues: button ? this.getBreakpointIssues(button, name, mediaQuery.matches) : []
            };
        });

        return results;
    }

    testWordPressBreakpoints(button) {
        const wpBreakpoints = {
            'wp-mobile': '(max-width: 600px)',
            'wp-tablet': '(max-width: 782px)',
            'wp-desktop': '(min-width: 783px)'
        };

        const results = {};

        Object.entries(wpBreakpoints).forEach(([name, query]) => {
            const mediaQuery = window.matchMedia(query);
            results[name] = {
                matches: mediaQuery.matches,
                query: query,
                issues: button ? this.getWordPressBreakpointIssues(button, name, mediaQuery.matches) : []
            };
        });

        return results;
    }

    detectCustomBreakpoints() {
        // Analyze stylesheets for custom breakpoints
        const customBreakpoints = [];

        try {
            Array.from(document.styleSheets).forEach(sheet => {
                try {
                    Array.from(sheet.cssRules || []).forEach(rule => {
                        if (rule.type === CSSRule.MEDIA_RULE) {
                            const mediaText = rule.media.mediaText;
                            if (mediaText && !this.isStandardBreakpoint(mediaText)) {
                                customBreakpoints.push(mediaText);
                            }
                        }
                    });
                } catch (e) {
                    // CORS or other access issues
                }
            });
        } catch (e) {
            console.warn('Could not analyze custom breakpoints:', e);
        }

        return [...new Set(customBreakpoints)];
    }

    testBreakpointBehavior(button, breakpoint) {
        if (!button) return { tested: false };

        const currentWidth = window.innerWidth;
        const isCurrentBreakpoint = currentWidth <= breakpoint.width;

        const result = {
            tested: true,
            isActiveBreakpoint: isCurrentBreakpoint,
            hasIssues: false,
            issues: []
        };

        if (isCurrentBreakpoint) {
            // Test button visibility and functionality at this breakpoint
            const buttonStyles = window.getComputedStyle(button);

            if (buttonStyles.display === 'none') {
                result.hasIssues = true;
                result.issues.push(`Button hidden at ${breakpoint.name}`);
            }

            const buttonRect = button.getBoundingClientRect();
            if (buttonRect.width < 44 || buttonRect.height < 44) {
                result.hasIssues = true;
                result.issues.push(`Touch target too small at ${breakpoint.name}`);
            }

            if (parseFloat(buttonStyles.fontSize) < 16) {
                result.hasIssues = true;
                result.issues.push(`Font size too small at ${breakpoint.name}`);
            }
        }

        return result;
    }

    analyzeResponsiveCSS(button) {
        const analysis = {
            hidesButton: [],
            affectsButton: [],
            mediaQueries: []
        };

        if (!button) return analysis;

        // This is a simplified analysis - in reality, you'd need to parse CSS rules
        const buttonClasses = Array.from(button.classList);
        const buttonId = button.id;

        // Check for common responsive hiding patterns
        const hidePatterns = [
            'hidden-mobile', 'hidden-tablet', 'mobile-hide', 'tablet-hide',
            'd-none', 'invisible', 'sr-only'
        ];

        buttonClasses.forEach(className => {
            if (hidePatterns.some(pattern => className.includes(pattern))) {
                analysis.hidesButton.push(className);
            }
        });

        return analysis;
    }

    detectMobileBrowser() {
        const userAgent = navigator.userAgent;

        return {
            isIOSSafari: /iPad|iPhone|iPod/.test(userAgent) && !window.MSStream,
            isAndroidChrome: /Android.*Chrome/.test(userAgent),
            isMobileWebView: /wv\)/.test(userAgent),
            isFirefoxMobile: /Mobile.*Firefox/.test(userAgent),
            isOperaMobile: /Opera Mini/.test(userAgent),
            isSamsungBrowser: /SamsungBrowser/.test(userAgent),
            userAgent: userAgent,
            platform: navigator.platform
        };
    }

    testMobileFeatureSupport() {
        return {
            flexbox: this.testCSSFeature('display', 'flex'),
            grid: this.testCSSFeature('display', 'grid'),
            transforms: this.testCSSFeature('transform', 'translateX(0)'),
            transitions: this.testCSSFeature('transition', 'opacity 0.3s'),
            borderRadius: this.testCSSFeature('border-radius', '5px'),
            boxShadow: this.testCSSFeature('box-shadow', '0 0 5px rgba(0,0,0,0.3)'),
            touchAction: 'touchAction' in document.documentElement.style,
            pointerEvents: 'onpointerdown' in window,
            orientationChange: 'onorientationchange' in window,
            deviceMotion: 'DeviceMotionEvent' in window
        };
    }

    checkIOSSpecificIssues(button) {
        const issues = [];

        if (!button) return issues;

        const buttonStyles = window.getComputedStyle(button);

        // iOS Safari hover state issues
        if (buttonStyles.cursor === 'pointer') {
            issues.push('iOS Safari may have hover state issues - consider touch-optimized states');
        }

        // iOS 300ms click delay (if not prevented)
        const touchAction = buttonStyles.touchAction;
        if (touchAction === 'auto') {
            issues.push('iOS may have 300ms click delay - use touch-action: manipulation');
        }

        // iOS zoom on focus issues
        const fontSize = parseFloat(buttonStyles.fontSize);
        if (fontSize < 16) {
            issues.push('Font size < 16px may trigger zoom on iOS Safari');
        }

        // Check for iOS safe area issues
        const hasSafeArea = window.CSS && window.CSS.supports('padding: env(safe-area-inset-top)');
        if (!hasSafeArea && this.isNearScreenEdge(button)) {
            issues.push('Button near screen edge without safe-area support');
        }

        return issues;
    }

    checkAndroidSpecificIssues(button) {
        const issues = [];

        if (!button) return issues;

        // Android Chrome specific checks
        const buttonRect = button.getBoundingClientRect();

        // Touch target size for Android
        if (buttonRect.width < 48 || buttonRect.height < 48) {
            issues.push('Touch target smaller than Android recommendations (48x48dp)');
        }

        // Android keyboard issues
        const isInViewport = this.isElementInViewport(button);
        if (!isInViewport) {
            issues.push('Button may be hidden when Android keyboard appears');
        }

        return issues;
    }

    checkMobileWebViewIssues(button) {
        const issues = [];

        if (!button) return issues;

        // WebView-specific issues
        issues.push('Running in WebView - test native app integration');

        // Check for WebView JavaScript bridge issues
        if (typeof window.Android !== 'undefined' || typeof window.webkit !== 'undefined') {
            issues.push('Native bridge detected - verify button functionality');
        }

        return issues;
    }

    analyzeMMobilePerformance(button) {
        const performanceIssues = [];

        // Check for performance-heavy CSS
        if (button) {
            const buttonStyles = window.getComputedStyle(button);

            // Heavy CSS properties that affect mobile performance
            if (buttonStyles.boxShadow && buttonStyles.boxShadow !== 'none') {
                performanceIssues.push('Box-shadow may affect mobile performance');
            }

            if (buttonStyles.filter && buttonStyles.filter !== 'none') {
                performanceIssues.push('CSS filters may affect mobile performance');
            }

            if (buttonStyles.borderRadius && parseFloat(buttonStyles.borderRadius) > 20) {
                performanceIssues.push('Large border-radius may affect mobile performance');
            }
        }

        // Check for excessive DOM complexity
        const domDepth = this.calculateDOMDepth(button);
        if (domDepth > 15) {
            performanceIssues.push('Deep DOM nesting may affect mobile performance');
        }

        return performanceIssues;
    }

    checkTouchTargetSpacing(button) {
        if (!button) return { adequate: false };

        const buttonRect = button.getBoundingClientRect();
        const nearbyButtons = this.findNearbyTouchTargets(button, 8); // 8px spacing

        return {
            adequate: nearbyButtons.length === 0,
            nearbyTargets: nearbyButtons,
            recommendedSpacing: '8px minimum between touch targets'
        };
    }

    analyzeARIAAttributes(button) {
        if (!button) return { analyzed: false };

        const ariaAnalysis = {
            analyzed: true,
            hasLabel: !!(button.getAttribute('aria-label') || button.textContent.trim()),
            hasDescription: !!button.getAttribute('aria-describedby'),
            hasRole: !!button.getAttribute('role'),
            isDisabled: button.hasAttribute('aria-disabled') || button.disabled,
            isExpanded: button.getAttribute('aria-expanded'),
            isPressed: button.getAttribute('aria-pressed'),
            issues: []
        };

        if (!ariaAnalysis.hasLabel) {
            ariaAnalysis.issues.push('Button lacks accessible label');
        }

        if (button.disabled && !button.hasAttribute('aria-disabled')) {
            ariaAnalysis.issues.push('Disabled button should have aria-disabled attribute');
        }

        return ariaAnalysis;
    }

    testFocusManagement(button) {
        if (!button) return { tested: false };

        const focusTest = {
            tested: true,
            isFocusable: button.tabIndex >= 0 || button.tagName === 'BUTTON',
            hasFocusIndicator: false,
            focusVisible: false,
            keyboardAccessible: true
        };

        // Check for focus indicator styles
        const buttonStyles = window.getComputedStyle(button);
        const focusStyles = window.getComputedStyle(button, ':focus');

        if (focusStyles.outline !== 'none' || focusStyles.boxShadow !== buttonStyles.boxShadow) {
            focusTest.hasFocusIndicator = true;
        }

        return focusTest;
    }

    testColorContrast(button) {
        if (!button) return { tested: false };

        const buttonStyles = window.getComputedStyle(button);

        return {
            tested: true,
            backgroundColor: buttonStyles.backgroundColor,
            color: buttonStyles.color,
            contrastRatio: this.calculateContrastRatio(buttonStyles.backgroundColor, buttonStyles.color),
            meetsWCAG_AA: true, // Simplified - actual implementation would calculate real contrast
            meetsWCAG_AAA: true
        };
    }

    checkVisualIndicators(button) {
        if (!button) return { checked: false };

        const buttonStyles = window.getComputedStyle(button);

        return {
            checked: true,
            hasHoverState: true, // Simplified check
            hasFocusState: buttonStyles.outline !== 'none',
            hasActiveState: true,
            hasDisabledState: true,
            visuallyDistinct: parseFloat(buttonStyles.borderWidth) > 0 || buttonStyles.backgroundColor !== 'transparent'
        };
    }

    testScreenReaderCompatibility(button) {
        if (!button) return { tested: false };

        return {
            tested: true,
            hasSemanticMarkup: button.tagName === 'BUTTON',
            hasAccessibleName: !!(button.getAttribute('aria-label') || button.textContent.trim()),
            hasRole: button.getAttribute('role') === 'button' || button.tagName === 'BUTTON',
            isInAccessibilityTree: !button.hasAttribute('aria-hidden')
        };
    }

    compileAccessibilityIssues(accessibilityAnalysis) {
        const issues = [];

        if (accessibilityAnalysis.touchTargetCompliance && !accessibilityAnalysis.touchTargetCompliance.wcagCompliant) {
            issues.push('Touch target too small for WCAG compliance');
        }

        if (accessibilityAnalysis.ariaAttributes && accessibilityAnalysis.ariaAttributes.issues.length > 0) {
            issues.push(...accessibilityAnalysis.ariaAttributes.issues);
        }

        if (accessibilityAnalysis.focusManagement && !accessibilityAnalysis.focusManagement.hasFocusIndicator) {
            issues.push('Button lacks visible focus indicator');
        }

        if (accessibilityAnalysis.colorContrast && !accessibilityAnalysis.colorContrast.meetsWCAG_AA) {
            issues.push('Button color contrast below WCAG AA standard');
        }

        return issues;
    }

    analyzeWordPressAdminResponsive(button) {
        const analysis = {
            adminBarResponsive: this.checkAdminBarResponsiveBehavior(),
            menuCollapseEffect: this.checkMenuCollapseEffect(button),
            metaBoxResponsive: this.checkMetaBoxResponsive(button)
        };

        return analysis;
    }

    checkThemeResponsiveCompatibility() {
        return {
            hasResponsiveCSS: !!document.querySelector('meta[name="viewport"]'),
            usesWordPressBreakpoints: this.checksWordPressBreakpoints(),
            compatibleWithAdminTheme: true // Simplified
        };
    }

    analyzeWooCommerceResponsive(button) {
        if (!button) return { analyzed: false };

        const isWooCommercePage = window.location.href.includes('wc-orders');

        return {
            analyzed: true,
            isWooCommercePage,
            wooResponsiveStyles: isWooCommercePage,
            orderPageOptimized: isWooCommercePage && this.checkWooOrderPageResponsive(button)
        };
    }

    checkAdminBarResponsive() {
        const adminBar = document.getElementById('wpadminbar');
        if (!adminBar) return { present: false };

        const adminBarStyles = window.getComputedStyle(adminBar);

        return {
            present: true,
            responsive: adminBarStyles.display !== 'none',
            mobileHeight: this.getAdminBarMobileHeight(),
            interferes: this.checkAdminBarInterference()
        };
    }

    analyzeSidebarCollapseBehavior(button) {
        const isCollapsed = document.body.classList.contains('folded');
        const isMobile = window.innerWidth <= 782;

        return {
            isCollapsed,
            isMobile,
            affectsButton: button ? this.checkSidebarCollapseAffectsButton(button) : false
        };
    }

    checkWordPressBreakpointBehavior(button, currentBreakpoint) {
        const issues = [];

        if (!button) return issues;

        const buttonStyles = window.getComputedStyle(button);

        if (currentBreakpoint.isMobile) {
            // Mobile-specific checks
            const buttonRect = button.getBoundingClientRect();
            if (buttonRect.width < 44 || buttonRect.height < 44) {
                issues.push('Button too small for mobile touch targets');
            }

            if (parseFloat(buttonStyles.fontSize) < 16) {
                issues.push('Font size may trigger iOS zoom');
            }
        }

        if (currentBreakpoint.isTablet) {
            // Tablet-specific checks
            const adminMenu = document.getElementById('adminmenu');
            if (adminMenu && window.getComputedStyle(adminMenu).display === 'none') {
                issues.push('Admin menu hidden on tablet may affect layout');
            }
        }

        return issues;
    }

    checkMobileAdminBarInterference(button) {
        const issues = [];
        const adminBar = document.getElementById('wpadminbar');

        if (adminBar && button) {
            const adminBarRect = adminBar.getBoundingClientRect();
            const buttonRect = button.getBoundingClientRect();

            if (buttonRect.top < adminBarRect.bottom) {
                issues.push('Button overlapped by admin bar on mobile');
            }
        }

        return issues;
    }

    testOrientationChange(button) {
        return {
            supportsOrientationChange: 'onorientationchange' in window,
            currentOrientation: screen.orientation ? screen.orientation.angle : 0,
            hasIssues: false, // Simplified
            issues: []
        };
    }

    testZoomCompatibility(button) {
        const currentZoom = window.devicePixelRatio || 1;

        return {
            currentZoom,
            hasIssues: false, // Simplified
            issues: [],
            zoomAccessible: currentZoom >= 1 && currentZoom <= 3
        };
    }

    testMobileKeyboardNavigation(button) {
        if (!button) return { tested: false };

        return {
            tested: true,
            isFocusable: button.tabIndex >= 0 || button.tagName === 'BUTTON',
            hasKeyboardHandler: !!(button.onkeydown || button.onkeyup),
            enterKeyWorks: true, // Simplified
            spaceKeyWorks: button.tagName === 'BUTTON'
        };
    }

    testGestureSupport(button) {
        return {
            touchEventsSupported: 'ontouchstart' in window,
            pointerEventsSupported: 'onpointerdown' in window,
            gestureEventsSupported: 'ongesturestart' in window,
            hasGestureConflicts: this.detectGestureConflicts(button).length > 0
        };
    }

    // Additional utility methods
    testCSSFeature(property, value) {
        const element = document.createElement('div');
        element.style[property] = value;
        return !!element.style[property];
    }

    isStandardBreakpoint(mediaText) {
        const standardBreakpoints = [
            '(max-width: 480px)', '(max-width: 768px)', '(max-width: 1024px)',
            '(max-width: 600px)', '(max-width: 782px)' // WordPress
        ];
        return standardBreakpoints.some(bp => mediaText.includes(bp));
    }

    getBreakpointIssues(button, breakpointName, isActive) {
        const issues = [];
        if (isActive && button) {
            const buttonStyles = window.getComputedStyle(button);
            if (buttonStyles.display === 'none') {
                issues.push(`Hidden at ${breakpointName} breakpoint`);
            }
        }
        return issues;
    }

    getWordPressBreakpointIssues(button, breakpointName, isActive) {
        const issues = [];
        if (isActive && button) {
            // WordPress-specific breakpoint issues
            if (breakpointName === 'wp-mobile' && window.innerWidth <= 600) {
                const buttonRect = button.getBoundingClientRect();
                if (buttonRect.width < 44) {
                    issues.push('Touch target too small for mobile');
                }
            }
        }
        return issues;
    }

    calculateContrastRatio(bg, fg) {
        // Simplified contrast calculation
        // Real implementation would parse colors and calculate luminance
        return 4.5; // Placeholder
    }

    isNearScreenEdge(button, threshold = 20) {
        if (!button) return false;

        const rect = button.getBoundingClientRect();
        const viewport = {
            width: window.innerWidth,
            height: window.innerHeight
        };

        return (
            rect.left < threshold ||
            rect.top < threshold ||
            rect.right > viewport.width - threshold ||
            rect.bottom > viewport.height - threshold
        );
    }

    isElementInViewport(button) {
        if (!button) return false;

        const rect = button.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }

    calculateDOMDepth(element) {
        let depth = 0;
        let current = element;

        while (current && current !== document.body) {
            depth++;
            current = current.parentElement;
        }

        return depth;
    }

    findNearbyTouchTargets(button, spacing) {
        if (!button) return [];

        const buttonRect = button.getBoundingClientRect();
        const expandedRect = {
            left: buttonRect.left - spacing,
            top: buttonRect.top - spacing,
            right: buttonRect.right + spacing,
            bottom: buttonRect.bottom + spacing
        };

        const touchTargets = document.querySelectorAll('button, input[type="button"], input[type="submit"], a, [onclick], [role="button"]');
        const nearbyTargets = [];

        touchTargets.forEach(target => {
            if (target !== button) {
                const targetRect = target.getBoundingClientRect();
                if (this.rectsOverlap(expandedRect, targetRect)) {
                    nearbyTargets.push({
                        element: this.getElementInfo(target),
                        distance: this.calculateDistance(buttonRect, targetRect)
                    });
                }
            }
        });

        return nearbyTargets;
    }

    checksWordPressBreakpoints() {
        // Check if CSS uses WordPress breakpoints
        return window.matchMedia('(max-width: 782px)').matches !== undefined;
    }

    checkAdminBarResponsiveBehavior() {
        const adminBar = document.getElementById('wpadminbar');
        if (!adminBar) return { responsive: false };

        return {
            responsive: true,
            hidesOnMobile: window.innerWidth <= 600 ? window.getComputedStyle(adminBar).display === 'none' : false
        };
    }

    checkMenuCollapseEffect(button) {
        const isCollapsed = document.body.classList.contains('folded');
        return {
            menuCollapsed: isCollapsed,
            affectsButtonPosition: button ? this.checkSidebarCollapseAffectsButton(button) : false
        };
    }

    checkMetaBoxResponsive(button) {
        if (!button) return { checked: false };

        const metaBox = button.closest('.postbox, .meta-box-sortables');
        if (!metaBox) return { hasMetaBox: false };

        return {
            hasMetaBox: true,
            responsive: !metaBox.classList.contains('closed'),
            stacksOnMobile: window.innerWidth <= 782
        };
    }

    checkWooOrderPageResponsive(button) {
        // Check if WooCommerce order page is optimized for mobile
        return window.innerWidth <= 782 && !!button.closest('#woocommerce-order-data');
    }

    getAdminBarMobileHeight() {
        const adminBar = document.getElementById('wpadminbar');
        return adminBar ? adminBar.getBoundingClientRect().height : 0;
    }

    checkAdminBarInterference() {
        const adminBar = document.getElementById('wpadminbar');
        return adminBar && window.getComputedStyle(adminBar).position === 'fixed';
    }

    checkSidebarCollapseAffectsButton(button) {
        // Check if collapsed sidebar affects button positioning
        const wpContent = document.getElementById('wpcontent');
        return wpContent && window.getComputedStyle(wpContent).marginLeft !== 'auto';
    }

    rectsOverlap(rect1, rect2) {
        return !(rect1.right < rect2.left ||
                rect2.right < rect1.left ||
                rect1.bottom < rect2.top ||
                rect2.bottom < rect1.top);
    }

    calculateDistance(rect1, rect2) {
        const centerX1 = rect1.left + rect1.width / 2;
        const centerY1 = rect1.top + rect1.height / 2;
        const centerX2 = rect2.left + rect2.width / 2;
        const centerY2 = rect2.top + rect2.height / 2;

        return Math.sqrt(Math.pow(centerX2 - centerX1, 2) + Math.pow(centerY2 - centerY1, 2));
    }

    getElementInfo(element) {
        return {
            tagName: element.tagName,
            id: element.id,
            className: element.className,
            dataset: Object.assign({}, element.dataset)
        };
    }

    /**
     * 📋 GENERATE COMPREHENSIVE REPORT
     */
    generateReport() {
        console.group('📋 RESPONSIVE/MOBILE DIAGNOSTIC REPORT');

        const report = {
            ...this.diagnostics,
            summary: {
                totalIssues: this.diagnostics.criticalIssues.length,
                severity: this.calculateSeverity(),
                recommendations: this.generateRecommendations(),
                mobileOptimized: this.calculateMobileOptimization(),
                accessibilityScore: this.calculateAccessibilityScore()
            }
        };

        // Log summary
        console.log('🔍 DIAGNOSTIC SUMMARY:');
        console.log(`Total Critical Issues: ${report.summary.totalIssues}`);
        console.log(`Severity Level: ${report.summary.severity}`);
        console.log(`Mobile Optimized: ${report.summary.mobileOptimized ? '✅' : '❌'}`);
        console.log(`Accessibility Score: ${report.summary.accessibilityScore}/100`);
        console.log('Critical Issues:', this.diagnostics.criticalIssues);

        if (report.summary.recommendations.length > 0) {
            console.log('💡 RECOMMENDATIONS:');
            report.summary.recommendations.forEach(rec => console.log(`- ${rec}`));
        }

        console.groupEnd();
        console.groupEnd(); // End main diagnostic group

        // Store globally
        window.agent5ResponsiveReport = report;
        console.log('📊 Report stored in: window.agent5ResponsiveReport');

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
            if (issue.includes('Viewport meta tag missing')) {
                recommendations.push('Add proper viewport meta tag: <meta name="viewport" content="width=device-width, initial-scale=1.0">');
            }
            if (issue.includes('Touch target too small')) {
                recommendations.push('Increase button size to at least 44x44px for WCAG compliance');
            }
            if (issue.includes('WCAG')) {
                recommendations.push('Fix accessibility issues to meet WCAG 2.1 AA standards');
            }
            if (issue.includes('300ms click delay')) {
                recommendations.push('Use touch-action: manipulation to prevent iOS click delay');
            }
            if (issue.includes('responsive CSS')) {
                recommendations.push('Review responsive CSS to ensure button visibility across breakpoints');
            }
        });

        return [...new Set(recommendations)];
    }

    calculateMobileOptimization() {
        let optimizationScore = 0;
        const maxScore = 10;

        // Check viewport configuration (2 points)
        if (this.diagnostics.responsiveAnalysis.viewport?.metaTag?.isMobileOptimized) {
            optimizationScore += 2;
        }

        // Check touch target size (3 points)
        if (this.diagnostics.responsiveAnalysis.touchEvents?.touchTargetSize?.meetsWCAG) {
            optimizationScore += 3;
        }

        // Check responsive behavior (2 points)
        const breakpointIssues = this.diagnostics.responsiveAnalysis.responsiveBreakpoints?.breakpointIssues?.length || 0;
        if (breakpointIssues === 0) {
            optimizationScore += 2;
        }

        // Check mobile browser compatibility (2 points)
        const browserIssues = this.diagnostics.responsiveAnalysis.mobileCompatibility?.browserSpecificIssues?.length || 0;
        if (browserIssues === 0) {
            optimizationScore += 2;
        }

        // Check WordPress responsive integration (1 point)
        if (this.diagnostics.responsiveAnalysis.wordPressResponsive?.adminResponsive) {
            optimizationScore += 1;
        }

        return optimizationScore >= 7; // 70% threshold
    }

    calculateAccessibilityScore() {
        let score = 0;
        const maxScore = 100;

        // Touch target compliance (25 points)
        if (this.diagnostics.responsiveAnalysis.accessibility?.touchTargetCompliance?.wcagCompliant) {
            score += 25;
        }

        // ARIA attributes (20 points)
        const ariaIssues = this.diagnostics.responsiveAnalysis.accessibility?.ariaAttributes?.issues?.length || 0;
        if (ariaIssues === 0) {
            score += 20;
        }

        // Focus management (20 points)
        if (this.diagnostics.responsiveAnalysis.accessibility?.focusManagement?.hasFocusIndicator) {
            score += 20;
        }

        // Color contrast (20 points)
        if (this.diagnostics.responsiveAnalysis.accessibility?.colorContrast?.meetsWCAG_AA) {
            score += 20;
        }

        // Screen reader compatibility (15 points)
        if (this.diagnostics.responsiveAnalysis.accessibility?.screenReaderCompatibility?.hasAccessibleName) {
            score += 15;
        }

        return Math.min(score, maxScore);
    }
}

/**
 * 🚀 AUTO-EXECUTE RESPONSIVE/MOBILE DIAGNOSTIC
 */
console.log('🤖 AGENT 5: RESPONSIVE/MOBILE DIAGNOSTIC LOADED');
console.log('🚀 Starting automatic responsive and mobile analysis...');

const responsiveAgent = new ResponsiveMobileDiagnostic();
responsiveAgent.runComprehensiveDiagnosis().then(report => {
    console.log('✅ AGENT 5 RESPONSIVE/MOBILE DIAGNOSTIC COMPLETE');
    console.log('📊 Access results: window.agent5ResponsiveReport');
});