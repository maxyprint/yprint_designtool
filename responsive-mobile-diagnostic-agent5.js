/**
 * 🤖 AGENT 5: RESPONSIVE/MOBILE CSS ISSUES SPECIALIST
 * Comprehensive diagnostic script for #design-preview-btn responsive and mobile compatibility issues
 *
 * ANALYSIS TARGETS:
 * - Mobile viewport meta tag configuration
 * - Touch event vs mouse event handling
 * - Responsive breakpoint conflicts
 * - Mobile-specific CSS issues
 * - iOS/Android browser compatibility
 * - Touch target sizing and accessibility
 * - WordPress admin responsive design issues
 */

(function() {
    'use strict';

    const AGENT_5_DIAGNOSTIC = {
        name: 'RESPONSIVE/MOBILE CSS ISSUES SPECIALIST',
        version: '1.0.0',
        startTime: Date.now(),
        results: {
            viewport: {},
            touchEvents: {},
            responsiveCSS: {},
            mobileCompatibility: {},
            accessibility: {},
            wordpressAdmin: {},
            issues: [],
            recommendations: []
        }
    };

    console.group('🤖 AGENT 5: RESPONSIVE/MOBILE CSS DIAGNOSTIC STARTING...');
    console.log('Target: #design-preview-btn mobile/responsive compatibility analysis');
    console.log('Environment:', {
        userAgent: navigator.userAgent,
        isMobile: /Mobi|Android/i.test(navigator.userAgent),
        isTablet: /iPad|Android.*Tablet/i.test(navigator.userAgent),
        isTouchDevice: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
        screenSize: `${screen.width}x${screen.height}`,
        viewportSize: `${window.innerWidth}x${window.innerHeight}`,
        devicePixelRatio: window.devicePixelRatio || 1
    });

    // ===== 1. VIEWPORT CONFIGURATION ANALYSIS =====
    function analyzeViewportConfiguration() {
        console.group('📱 1. VIEWPORT CONFIGURATION ANALYSIS');

        const viewportMeta = document.querySelector('meta[name="viewport"]');
        const viewportData = {
            exists: !!viewportMeta,
            content: viewportMeta ? viewportMeta.getAttribute('content') : null,
            parsed: {},
            issues: []
        };

        if (viewportMeta) {
            const content = viewportMeta.getAttribute('content');
            const viewportParts = content.split(',').map(part => part.trim());

            viewportParts.forEach(part => {
                const [key, value] = part.split('=').map(s => s.trim());
                viewportData.parsed[key] = value;
            });

            // Check for mobile-optimized viewport
            if (!viewportData.parsed['width']) {
                viewportData.issues.push('Missing width directive in viewport meta tag');
            } else if (viewportData.parsed['width'] !== 'device-width') {
                viewportData.issues.push(`Viewport width is "${viewportData.parsed['width']}" instead of "device-width"`);
            }

            if (!viewportData.parsed['initial-scale']) {
                viewportData.issues.push('Missing initial-scale directive');
            } else if (parseFloat(viewportData.parsed['initial-scale']) !== 1.0) {
                viewportData.issues.push(`Initial scale is ${viewportData.parsed['initial-scale']} instead of 1.0`);
            }

            // Check for user-scalable restrictions
            if (viewportData.parsed['user-scalable'] === 'no') {
                viewportData.issues.push('User scaling is disabled - accessibility concern');
            }

            // Check for maximum-scale restrictions
            if (viewportData.parsed['maximum-scale'] && parseFloat(viewportData.parsed['maximum-scale']) < 2.0) {
                viewportData.issues.push('Maximum scale is restrictive - may affect accessibility');
            }

        } else {
            viewportData.issues.push('CRITICAL: No viewport meta tag found - will cause mobile display issues');
        }

        // Check if WordPress admin is responsive
        const wpAdminBar = document.getElementById('wpadminbar');
        const isWordPressAdmin = !!wpAdminBar || document.body.classList.contains('wp-admin');

        viewportData.wordpressAdmin = {
            detected: isWordPressAdmin,
            adminBar: !!wpAdminBar,
            bodyClasses: Array.from(document.body.classList),
            isResponsive: isWordPressAdmin && window.innerWidth < 783 // WP admin breakpoint
        };

        AGENT_5_DIAGNOSTIC.results.viewport = viewportData;
        console.log('Viewport Analysis:', viewportData);
        console.groupEnd();

        return viewportData;
    }

    // ===== 2. TOUCH EVENT COMPATIBILITY ANALYSIS =====
    function analyzeTouchEventCompatibility() {
        console.group('👆 2. TOUCH EVENT COMPATIBILITY ANALYSIS');

        const button = document.getElementById('design-preview-btn');
        const touchData = {
            deviceSupport: {
                touchEvents: 'ontouchstart' in window,
                pointerEvents: 'onpointerdown' in window,
                maxTouchPoints: navigator.maxTouchPoints || 0,
                msMaxTouchPoints: navigator.msMaxTouchPoints || 0
            },
            buttonEventHandlers: {},
            touchTargetSize: {},
            issues: []
        };

        // Analyze device touch capabilities
        console.log('Touch Device Capabilities:', touchData.deviceSupport);

        if (button) {
            // Get computed styles for touch target analysis
            const computedStyles = window.getComputedStyle(button);
            const rect = button.getBoundingClientRect();

            touchData.touchTargetSize = {
                width: rect.width,
                height: rect.height,
                minWidth: parseFloat(computedStyles.minWidth) || 0,
                minHeight: parseFloat(computedStyles.minHeight) || 0,
                padding: {
                    top: parseFloat(computedStyles.paddingTop),
                    right: parseFloat(computedStyles.paddingRight),
                    bottom: parseFloat(computedStyles.paddingBottom),
                    left: parseFloat(computedStyles.paddingLeft)
                },
                touchArea: rect.width * rect.height
            };

            // Check touch target size guidelines (44px minimum recommended)
            const MIN_TOUCH_TARGET = 44;
            if (rect.width < MIN_TOUCH_TARGET || rect.height < MIN_TOUCH_TARGET) {
                touchData.issues.push(`Touch target too small: ${Math.round(rect.width)}x${Math.round(rect.height)}px (recommended: ${MIN_TOUCH_TARGET}x${MIN_TOUCH_TARGET}px minimum)`);
            }

            // Analyze event handlers
            const events = ['click', 'touchstart', 'touchend', 'pointerdown', 'pointerup', 'mousedown', 'mouseup'];
            events.forEach(eventType => {
                try {
                    const hasHandler = !!button[`on${eventType}`];
                    const jQueryEvents = (typeof jQuery !== 'undefined' && jQuery._data) ?
                        jQuery._data(button, 'events') : null;

                    touchData.buttonEventHandlers[eventType] = {
                        inline: hasHandler,
                        jQuery: jQueryEvents && jQueryEvents[eventType] ? jQueryEvents[eventType].length : 0
                    };
                } catch (e) {
                    touchData.buttonEventHandlers[eventType] = { error: e.message };
                }
            });

            // Test if button responds to touch events
            if (touchData.deviceSupport.touchEvents) {
                try {
                    let touchHandled = false;
                    const testTouch = () => { touchHandled = true; };

                    button.addEventListener('touchstart', testTouch, { once: true, passive: true });

                    // Simulate touch event
                    const touchEvent = new TouchEvent('touchstart', {
                        bubbles: true,
                        cancelable: true,
                        touches: [{
                            identifier: 0,
                            target: button,
                            clientX: rect.left + rect.width / 2,
                            clientY: rect.top + rect.height / 2
                        }]
                    });

                    button.dispatchEvent(touchEvent);
                    touchData.touchEventResponse = touchHandled;

                    if (!touchHandled) {
                        touchData.issues.push('Button does not respond to touch events');
                    }
                } catch (e) {
                    touchData.issues.push(`Touch event testing failed: ${e.message}`);
                }
            }

            // Check for CSS touch-action property
            const touchAction = computedStyles.getPropertyValue('touch-action');
            touchData.touchAction = touchAction;

            if (touchAction === 'none') {
                touchData.issues.push('touch-action is set to "none" which may prevent touch interactions');
            }

        } else {
            touchData.issues.push('CRITICAL: Button #design-preview-btn not found in DOM');
        }

        AGENT_5_DIAGNOSTIC.results.touchEvents = touchData;
        console.log('Touch Event Analysis:', touchData);
        console.groupEnd();

        return touchData;
    }

    // ===== 3. RESPONSIVE CSS BREAKPOINT ANALYSIS =====
    function analyzeResponsiveCSS() {
        console.group('📐 3. RESPONSIVE CSS BREAKPOINT ANALYSIS');

        const button = document.getElementById('design-preview-btn');
        const responsiveData = {
            currentBreakpoint: null,
            mediaQueries: [],
            buttonVisibility: {},
            cssIssues: [],
            wordPressBreakpoints: {}
        };

        // Define common breakpoints
        const breakpoints = {
            mobile: '(max-width: 767px)',
            tablet: '(min-width: 768px) and (max-width: 1023px)',
            desktop: '(min-width: 1024px)',
            wpAdminMobile: '(max-width: 782px)', // WordPress admin breakpoint
            wpAdminTablet: '(min-width: 783px) and (max-width: 960px)',
            wpAdminDesktop: '(min-width: 961px)'
        };

        // Test each breakpoint
        Object.entries(breakpoints).forEach(([name, query]) => {
            const mediaQuery = window.matchMedia(query);
            responsiveData.mediaQueries.push({
                name,
                query,
                matches: mediaQuery.matches
            });

            if (mediaQuery.matches) {
                responsiveData.currentBreakpoint = name;
            }
        });

        console.log('Current Breakpoint:', responsiveData.currentBreakpoint);
        console.log('Media Query Status:', responsiveData.mediaQueries);

        if (button) {
            const computedStyles = window.getComputedStyle(button);

            // Check button visibility at current viewport
            responsiveData.buttonVisibility = {
                display: computedStyles.display,
                visibility: computedStyles.visibility,
                opacity: computedStyles.opacity,
                position: computedStyles.position,
                zIndex: computedStyles.zIndex,
                overflow: computedStyles.overflow,
                isVisible: computedStyles.display !== 'none' &&
                          computedStyles.visibility !== 'hidden' &&
                          parseFloat(computedStyles.opacity) > 0
            };

            // Check for responsive hiding patterns
            if (!responsiveData.buttonVisibility.isVisible) {
                responsiveData.cssIssues.push('Button is hidden via CSS at current viewport size');
            }

            // Check for problematic CSS that might affect mobile
            const problematicStyles = {
                position: computedStyles.position,
                float: computedStyles.float,
                transform: computedStyles.transform,
                whiteSpace: computedStyles.whiteSpace,
                overflow: computedStyles.overflow,
                maxWidth: computedStyles.maxWidth,
                minWidth: computedStyles.minWidth
            };

            Object.entries(problematicStyles).forEach(([property, value]) => {
                if (property === 'position' && ['fixed', 'absolute'].includes(value)) {
                    responsiveData.cssIssues.push(`Position ${value} may cause issues on mobile devices`);
                }
                if (property === 'whiteSpace' && value === 'nowrap') {
                    responsiveData.cssIssues.push('white-space: nowrap may cause horizontal scrolling on mobile');
                }
                if (property === 'overflow' && value === 'hidden') {
                    responsiveData.cssIssues.push('overflow: hidden may hide interactive elements on mobile');
                }
            });

            // Test button at different viewport sizes (simulation)
            const testViewports = [
                { width: 320, height: 568, name: 'iPhone SE' },
                { width: 375, height: 667, name: 'iPhone 8' },
                { width: 414, height: 896, name: 'iPhone 11 Pro Max' },
                { width: 768, height: 1024, name: 'iPad' },
                { width: 1024, height: 768, name: 'iPad Landscape' }
            ];

            responsiveData.viewportTests = testViewports.map(viewport => {
                // This is a theoretical test since we can't actually resize the window
                return {
                    ...viewport,
                    wouldFit: button.getBoundingClientRect().width <= viewport.width,
                    potential_issues: button.getBoundingClientRect().width > viewport.width ?
                        ['Button may be too wide for this viewport'] : []
                };
            });

        } else {
            responsiveData.cssIssues.push('CRITICAL: Button #design-preview-btn not found for CSS analysis');
        }

        // Check for WordPress admin responsive behavior
        const wpContainer = document.querySelector('#wpbody-content, .wrap');
        if (wpContainer) {
            const containerStyles = window.getComputedStyle(wpContainer);
            responsiveData.wordPressBreakpoints = {
                containerWidth: containerStyles.width,
                containerMaxWidth: containerStyles.maxWidth,
                containerPadding: {
                    left: containerStyles.paddingLeft,
                    right: containerStyles.paddingRight
                },
                isFlexLayout: containerStyles.display.includes('flex'),
                hasResponsiveMargins: parseFloat(containerStyles.marginLeft) > 0 ||
                                    parseFloat(containerStyles.marginRight) > 0
            };
        }

        AGENT_5_DIAGNOSTIC.results.responsiveCSS = responsiveData;
        console.log('Responsive CSS Analysis:', responsiveData);
        console.groupEnd();

        return responsiveData;
    }

    // ===== 4. MOBILE BROWSER COMPATIBILITY ANALYSIS =====
    function analyzeMobileBrowserCompatibility() {
        console.group('📱 4. MOBILE BROWSER COMPATIBILITY ANALYSIS');

        const compatibilityData = {
            userAgent: navigator.userAgent,
            browser: {},
            features: {},
            knownIssues: [],
            iOSSpecific: {},
            androidSpecific: {}
        };

        // Detect browser and version
        const ua = navigator.userAgent;
        compatibilityData.browser = {
            isIOS: /iPad|iPhone|iPod/.test(ua),
            isAndroid: /Android/.test(ua),
            isSafari: /Safari/.test(ua) && !/Chrome/.test(ua),
            isChrome: /Chrome/.test(ua),
            isFirefox: /Firefox/.test(ua),
            isEdge: /Edg/.test(ua),
            isSamsung: /SamsungBrowser/.test(ua),
            version: (() => {
                if (/Chrome\/(\d+)/.test(ua)) return RegExp.$1;
                if (/Firefox\/(\d+)/.test(ua)) return RegExp.$1;
                if (/Version\/(\d+).*Safari/.test(ua)) return RegExp.$1;
                return 'unknown';
            })()
        };

        console.log('Browser Detection:', compatibilityData.browser);

        // Test modern web features
        compatibilityData.features = {
            flexbox: CSS.supports('display', 'flex'),
            grid: CSS.supports('display', 'grid'),
            transforms: CSS.supports('transform', 'translateX(0)'),
            transitions: CSS.supports('transition', 'all 0s'),
            calc: CSS.supports('width', 'calc(100% - 10px)'),
            vhvw: CSS.supports('height', '100vh'),
            cssTouchAction: CSS.supports('touch-action', 'manipulation'),
            webGL: (() => {
                try {
                    const canvas = document.createElement('canvas');
                    return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
                } catch (e) {
                    return false;
                }
            })(),
            pointerEvents: 'PointerEvent' in window,
            passiveEventListeners: (() => {
                let supportsPassive = false;
                try {
                    const opts = Object.defineProperty({}, 'passive', {
                        get: function() { supportsPassive = true; }
                    });
                    window.addEventListener('test', null, opts);
                } catch (e) {}
                return supportsPassive;
            })()
        };

        // iOS-specific checks
        if (compatibilityData.browser.isIOS) {
            compatibilityData.iOSSpecific = {
                version: (() => {
                    const match = ua.match(/OS (\d+)_(\d+)/);
                    return match ? `${match[1]}.${match[2]}` : 'unknown';
                })(),
                isOldSafari: /Version\/([0-9])\./.test(ua) && parseInt(RegExp.$1) < 13,
                hasHoverIssues: true, // iOS hover state issues
                hasClickDelay: true, // 300ms click delay on older iOS
                supportsTouch: true
            };

            // Known iOS issues
            if (compatibilityData.iOSSpecific.isOldSafari) {
                compatibilityData.knownIssues.push('Old Safari version may have CSS grid/flexbox issues');
            }
            if (compatibilityData.iOSSpecific.hasClickDelay) {
                compatibilityData.knownIssues.push('iOS may have 300ms click delay - consider touch-action: manipulation');
            }
        }

        // Android-specific checks
        if (compatibilityData.browser.isAndroid) {
            compatibilityData.androidSpecific = {
                version: (() => {
                    const match = ua.match(/Android (\d+\.?\d*)/);
                    return match ? match[1] : 'unknown';
                })(),
                isOldAndroid: /Android [1-4]\./.test(ua),
                hasViewportIssues: /Android [1-4]\./.test(ua),
                chromeVersion: compatibilityData.browser.isChrome ? compatibilityData.browser.version : null
            };

            // Known Android issues
            if (compatibilityData.androidSpecific.isOldAndroid) {
                compatibilityData.knownIssues.push('Old Android version may have viewport and touch issues');
            }
            if (compatibilityData.androidSpecific.hasViewportIssues) {
                compatibilityData.knownIssues.push('Android viewport handling may be inconsistent');
            }
        }

        // Button-specific mobile compatibility tests
        const button = document.getElementById('design-preview-btn');
        if (button) {
            const rect = button.getBoundingClientRect();

            // Test if button is in a position that might be affected by mobile browser UI
            if (rect.bottom > window.innerHeight - 100) {
                compatibilityData.knownIssues.push('Button may be hidden by mobile browser UI elements');
            }

            // Test for common mobile interaction issues
            const computedStyles = window.getComputedStyle(button);
            if (computedStyles.userSelect !== 'none') {
                compatibilityData.knownIssues.push('Button text may be selectable on mobile (consider user-select: none)');
            }

            if (!computedStyles.touchAction || computedStyles.touchAction === 'auto') {
                compatibilityData.knownIssues.push('Consider setting touch-action: manipulation for better mobile performance');
            }
        }

        AGENT_5_DIAGNOSTIC.results.mobileCompatibility = compatibilityData;
        console.log('Mobile Browser Compatibility:', compatibilityData);
        console.groupEnd();

        return compatibilityData;
    }

    // ===== 5. ACCESSIBILITY AND TOUCH TARGET ANALYSIS =====
    function analyzeAccessibilityAndTouchTargets() {
        console.group('♿ 5. ACCESSIBILITY AND TOUCH TARGET ANALYSIS');

        const accessibilityData = {
            touchTargets: {},
            ariaAttributes: {},
            colorContrast: {},
            focusManagement: {},
            screenReaderSupport: {},
            issues: []
        };

        const button = document.getElementById('design-preview-btn');

        if (button) {
            const rect = button.getBoundingClientRect();
            const computedStyles = window.getComputedStyle(button);

            // Touch target size analysis (WCAG 2.1 AA: 44x44px minimum)
            accessibilityData.touchTargets = {
                width: rect.width,
                height: rect.height,
                area: rect.width * rect.height,
                meetsWCAG: rect.width >= 44 && rect.height >= 44,
                hasAdequateSpacing: true, // Would need to check surrounding elements
                tapDelay: computedStyles.touchAction === 'manipulation' ? 'optimized' : 'default'
            };

            if (!accessibilityData.touchTargets.meetsWCAG) {
                accessibilityData.issues.push(`Touch target size ${Math.round(rect.width)}x${Math.round(rect.height)}px below WCAG minimum 44x44px`);
            }

            // ARIA attributes analysis
            accessibilityData.ariaAttributes = {
                hasAriaLabel: !!button.getAttribute('aria-label'),
                ariaLabel: button.getAttribute('aria-label'),
                hasAriaDescribedBy: !!button.getAttribute('aria-describedby'),
                ariaDescribedBy: button.getAttribute('aria-describedby'),
                hasRole: !!button.getAttribute('role'),
                role: button.getAttribute('role') || 'button',
                isDisabled: button.disabled,
                ariaDisabled: button.getAttribute('aria-disabled'),
                hasAriaExpanded: !!button.getAttribute('aria-expanded'),
                ariaExpanded: button.getAttribute('aria-expanded')
            };

            // Check ARIA compliance
            if (!accessibilityData.ariaAttributes.hasAriaLabel && !button.textContent.trim()) {
                accessibilityData.issues.push('Button has no accessible name (aria-label or text content)');
            }

            if (button.disabled && !accessibilityData.ariaAttributes.ariaDisabled) {
                accessibilityData.issues.push('Disabled button should have aria-disabled attribute');
            }

            // Color contrast analysis
            const backgroundColor = computedStyles.backgroundColor;
            const color = computedStyles.color;
            accessibilityData.colorContrast = {
                backgroundColor,
                color,
                canAnalyze: backgroundColor !== 'rgba(0, 0, 0, 0)' && color !== 'rgba(0, 0, 0, 0)'
            };

            // Focus management
            accessibilityData.focusManagement = {
                isFocusable: button.tabIndex >= 0,
                tabIndex: button.tabIndex,
                hasVisibleFocus: computedStyles.outlineStyle !== 'none' ||
                               computedStyles.outlineWidth !== '0px' ||
                               computedStyles.outlineColor !== 'transparent',
                outlineStyle: `${computedStyles.outlineStyle} ${computedStyles.outlineWidth} ${computedStyles.outlineColor}`,
                focusVisible: computedStyles.getPropertyValue(':focus-visible') || 'not-supported'
            };

            if (!accessibilityData.focusManagement.hasVisibleFocus) {
                accessibilityData.issues.push('Button may not have visible focus indicator');
            }

            // Screen reader support
            accessibilityData.screenReaderSupport = {
                hasSemanticMarkup: button.tagName.toLowerCase() === 'button',
                hasDescriptiveText: !!button.textContent.trim(),
                textContent: button.textContent.trim(),
                hasContextualInfo: !!button.getAttribute('title'),
                title: button.getAttribute('title')
            };

            if (!accessibilityData.screenReaderSupport.hasSemanticMarkup) {
                accessibilityData.issues.push('Element should be a <button> tag for proper semantics');
            }

            // Mobile-specific accessibility checks
            if (/Mobi|Android/i.test(navigator.userAgent)) {
                // Check for mobile screen reader optimizations
                if (!button.getAttribute('aria-label') && button.textContent.length > 30) {
                    accessibilityData.issues.push('Long button text may be problematic for mobile screen readers');
                }

                // Check for gesture conflicts
                if (button.addEventListener) {
                    try {
                        let hasGestureHandlers = false;
                        ['swipe', 'pinch', 'pan'].forEach(gesture => {
                            if (button[`on${gesture}`]) {
                                hasGestureHandlers = true;
                            }
                        });
                        accessibilityData.screenReaderSupport.hasGestureHandlers = hasGestureHandlers;

                        if (hasGestureHandlers) {
                            accessibilityData.issues.push('Custom gesture handlers may conflict with screen reader gestures');
                        }
                    } catch (e) {
                        // Ignore errors in gesture detection
                    }
                }
            }

        } else {
            accessibilityData.issues.push('CRITICAL: Button #design-preview-btn not found for accessibility analysis');
        }

        AGENT_5_DIAGNOSTIC.results.accessibility = accessibilityData;
        console.log('Accessibility Analysis:', accessibilityData);
        console.groupEnd();

        return accessibilityData;
    }

    // ===== 6. WORDPRESS ADMIN RESPONSIVE DESIGN ANALYSIS =====
    function analyzeWordPressAdminResponsive() {
        console.group('🔧 6. WORDPRESS ADMIN RESPONSIVE DESIGN ANALYSIS');

        const wpData = {
            adminDetection: {},
            responsiveFeatures: {},
            layoutIssues: [],
            adminBarImpact: {},
            sidebarCollapse: {}
        };

        // Detect WordPress admin environment
        wpData.adminDetection = {
            isWPAdmin: document.body.classList.contains('wp-admin'),
            hasAdminBar: !!document.getElementById('wpadminbar'),
            adminBodyClasses: Array.from(document.body.classList),
            wpVersion: (() => {
                const versionMeta = document.querySelector('meta[name="generator"]');
                return versionMeta ? versionMeta.getAttribute('content') : 'unknown';
            })(),
            currentScreen: (() => {
                const screenMeta = document.querySelector('meta[name="pagenow"]');
                return screenMeta ? screenMeta.getAttribute('content') : 'unknown';
            })()
        };

        console.log('WordPress Admin Detection:', wpData.adminDetection);

        if (wpData.adminDetection.isWPAdmin) {
            // Check WordPress admin responsive features
            wpData.responsiveFeatures = {
                adminMenuCollapse: document.body.classList.contains('folded'),
                isMobileView: window.innerWidth <= 782, // WP mobile breakpoint
                hasResponsiveCSS: !!document.querySelector('link[href*="admin-bar"]') ||
                                 !!document.querySelector('style[id*="admin-bar"]'),
                adminBarHeight: (() => {
                    const adminBar = document.getElementById('wpadminbar');
                    return adminBar ? adminBar.offsetHeight : 0;
                })()
            };

            // Admin bar impact on layout
            const adminBar = document.getElementById('wpadminbar');
            if (adminBar) {
                const adminBarStyles = window.getComputedStyle(adminBar);
                wpData.adminBarImpact = {
                    position: adminBarStyles.position,
                    zIndex: adminBarStyles.zIndex,
                    height: adminBar.offsetHeight,
                    isFixed: adminBarStyles.position === 'fixed',
                    affectsViewport: adminBarStyles.position === 'fixed' &&
                                   document.body.style.paddingTop.includes(adminBar.offsetHeight + 'px')
                };

                // Check if admin bar interferes with button
                const button = document.getElementById('design-preview-btn');
                if (button) {
                    const buttonRect = button.getBoundingClientRect();
                    const adminBarRect = adminBar.getBoundingClientRect();

                    if (buttonRect.top < adminBarRect.bottom) {
                        wpData.layoutIssues.push('Button may be obscured by WordPress admin bar');
                    }
                }
            }

            // Check sidebar collapse behavior
            const adminMenu = document.getElementById('adminmenu');
            if (adminMenu) {
                wpData.sidebarCollapse = {
                    isCollapsed: document.body.classList.contains('folded'),
                    autoCollapseWidth: 960, // WP auto-collapse width
                    currentWidth: window.innerWidth,
                    shouldAutoCollapse: window.innerWidth <= 960,
                    menuWidth: adminMenu.offsetWidth,
                    affectsContentArea: true
                };

                // Check if sidebar affects button positioning
                const contentArea = document.getElementById('wpbody-content');
                const button = document.getElementById('design-preview-btn');

                if (contentArea && button) {
                    const contentRect = contentArea.getBoundingClientRect();
                    const buttonRect = button.getBoundingClientRect();

                    wpData.sidebarCollapse.contentAreaWidth = contentRect.width;
                    wpData.sidebarCollapse.buttonPositionInContent = {
                        left: buttonRect.left - contentRect.left,
                        right: contentRect.right - buttonRect.right,
                        isWithinContent: buttonRect.left >= contentRect.left &&
                                        buttonRect.right <= contentRect.right
                    };

                    if (!wpData.sidebarCollapse.buttonPositionInContent.isWithinContent) {
                        wpData.layoutIssues.push('Button may be positioned outside content area');
                    }
                }
            }

            // Check for WordPress responsive CSS conflicts
            const wpResponsiveStyles = Array.from(document.styleSheets)
                .filter(sheet => {
                    try {
                        return sheet.href && (
                            sheet.href.includes('wp-admin') ||
                            sheet.href.includes('admin-bar') ||
                            sheet.href.includes('common.css') ||
                            sheet.href.includes('forms.css')
                        );
                    } catch (e) {
                        return false;
                    }
                });

            wpData.responsiveFeatures.wpStyleSheets = wpResponsiveStyles.length;

            // Check for media query conflicts
            wpData.responsiveFeatures.mediaQueryConflicts = [];
            try {
                wpResponsiveStyles.forEach(sheet => {
                    if (sheet.cssRules) {
                        Array.from(sheet.cssRules).forEach(rule => {
                            if (rule.type === CSSRule.MEDIA_RULE) {
                                if (rule.conditionText.includes('782px') ||
                                    rule.conditionText.includes('960px')) {
                                    wpData.responsiveFeatures.mediaQueryConflicts.push({
                                        condition: rule.conditionText,
                                        rules: rule.cssRules.length
                                    });
                                }
                            }
                        });
                    }
                });
            } catch (e) {
                wpData.layoutIssues.push('Could not analyze WordPress CSS rules for conflicts');
            }

        } else {
            wpData.layoutIssues.push('Not in WordPress admin environment - some features may not apply');
        }

        AGENT_5_DIAGNOSTIC.results.wordpressAdmin = wpData;
        console.log('WordPress Admin Responsive Analysis:', wpData);
        console.groupEnd();

        return wpData;
    }

    // ===== 7. COMPREHENSIVE ISSUE DETECTION AND RECOMMENDATIONS =====
    function generateRecommendations() {
        console.group('💡 7. GENERATING RECOMMENDATIONS');

        const results = AGENT_5_DIAGNOSTIC.results;
        const recommendations = [];
        const criticalIssues = [];

        // Viewport issues
        if (results.viewport.issues.length > 0) {
            results.viewport.issues.forEach(issue => {
                if (issue.includes('CRITICAL')) {
                    criticalIssues.push(issue);
                    recommendations.push({
                        priority: 'CRITICAL',
                        category: 'Viewport',
                        issue: issue,
                        solution: 'Add proper viewport meta tag: <meta name="viewport" content="width=device-width, initial-scale=1.0">'
                    });
                } else {
                    recommendations.push({
                        priority: 'HIGH',
                        category: 'Viewport',
                        issue: issue,
                        solution: 'Update viewport meta tag configuration'
                    });
                }
            });
        }

        // Touch event issues
        if (results.touchEvents.issues.length > 0) {
            results.touchEvents.issues.forEach(issue => {
                if (issue.includes('Touch target too small')) {
                    recommendations.push({
                        priority: 'HIGH',
                        category: 'Touch Targets',
                        issue: issue,
                        solution: 'Increase button padding or min-width/min-height to meet 44px minimum'
                    });
                }
                if (issue.includes('touch-action')) {
                    recommendations.push({
                        priority: 'MEDIUM',
                        category: 'Touch Performance',
                        issue: issue,
                        solution: 'Add CSS: touch-action: manipulation; to improve touch response'
                    });
                }
            });
        }

        // CSS responsive issues
        if (results.responsiveCSS.cssIssues.length > 0) {
            results.responsiveCSS.cssIssues.forEach(issue => {
                recommendations.push({
                    priority: 'MEDIUM',
                    category: 'Responsive CSS',
                    issue: issue,
                    solution: 'Review and update CSS for mobile compatibility'
                });
            });
        }

        // Mobile browser compatibility
        if (results.mobileCompatibility.knownIssues.length > 0) {
            results.mobileCompatibility.knownIssues.forEach(issue => {
                if (issue.includes('300ms click delay')) {
                    recommendations.push({
                        priority: 'MEDIUM',
                        category: 'Performance',
                        issue: issue,
                        solution: 'Add CSS: touch-action: manipulation; or use FastClick library'
                    });
                }
            });
        }

        // Accessibility issues
        if (results.accessibility.issues.length > 0) {
            results.accessibility.issues.forEach(issue => {
                recommendations.push({
                    priority: 'HIGH',
                    category: 'Accessibility',
                    issue: issue,
                    solution: 'Implement proper ARIA attributes and semantic markup'
                });
            });
        }

        // WordPress-specific issues
        if (results.wordpressAdmin.layoutIssues.length > 0) {
            results.wordpressAdmin.layoutIssues.forEach(issue => {
                recommendations.push({
                    priority: 'MEDIUM',
                    category: 'WordPress',
                    issue: issue,
                    solution: 'Adjust positioning to account for WordPress admin layout'
                });
            });
        }

        // Generate CSS fixes
        const cssRecommendations = generateCSSFixes();
        recommendations.push(...cssRecommendations);

        AGENT_5_DIAGNOSTIC.results.recommendations = recommendations;
        AGENT_5_DIAGNOSTIC.results.issues = criticalIssues;

        console.log('Generated Recommendations:', recommendations);
        console.log('Critical Issues:', criticalIssues);
        console.groupEnd();

        return { recommendations, criticalIssues };
    }

    // ===== CSS FIXES GENERATOR =====
    function generateCSSFixes() {
        const fixes = [];
        const results = AGENT_5_DIAGNOSTIC.results;

        // Touch target fixes
        if (results.touchEvents.touchTargetSize &&
            (results.touchEvents.touchTargetSize.width < 44 ||
             results.touchEvents.touchTargetSize.height < 44)) {
            fixes.push({
                priority: 'HIGH',
                category: 'CSS Fix',
                issue: 'Touch target size below recommended minimum',
                solution: `
                CSS Fix:
                #design-preview-btn {
                    min-width: 44px;
                    min-height: 44px;
                    padding: 12px 16px;
                    touch-action: manipulation;
                }
                `
            });
        }

        // Responsive design fixes
        if (results.responsiveCSS.currentBreakpoint === 'mobile' ||
            results.responsiveCSS.currentBreakpoint === 'wpAdminMobile') {
            fixes.push({
                priority: 'MEDIUM',
                category: 'CSS Fix',
                issue: 'Mobile layout optimization needed',
                solution: `
                CSS Fix:
                @media (max-width: 782px) {
                    #design-preview-btn {
                        width: 100%;
                        max-width: none;
                        margin: 10px 0;
                        font-size: 16px; /* Prevent iOS zoom */
                    }
                }
                `
            });
        }

        // WordPress admin specific fixes
        if (results.wordpressAdmin.adminDetection.isWPAdmin) {
            fixes.push({
                priority: 'MEDIUM',
                category: 'CSS Fix',
                issue: 'WordPress admin responsive compatibility',
                solution: `
                CSS Fix:
                .wp-admin #design-preview-btn {
                    position: relative;
                    z-index: 1;
                    margin-top: 10px;
                }

                @media (max-width: 782px) {
                    .wp-admin #design-preview-btn {
                        width: calc(100% - 20px);
                        margin: 10px;
                    }
                }
                `
            });
        }

        // Accessibility fixes
        if (results.accessibility.issues.some(issue => issue.includes('focus indicator'))) {
            fixes.push({
                priority: 'HIGH',
                category: 'CSS Fix',
                issue: 'Missing focus indicator for accessibility',
                solution: `
                CSS Fix:
                #design-preview-btn:focus {
                    outline: 2px solid #005cee;
                    outline-offset: 2px;
                    box-shadow: 0 0 0 1px #fff, 0 0 0 3px #005cee;
                }

                #design-preview-btn:focus:not(:focus-visible) {
                    outline: none;
                    box-shadow: none;
                }
                `
            });
        }

        return fixes;
    }

    // ===== MAIN EXECUTION =====
    function runDiagnostic() {
        console.log('🚀 Starting comprehensive responsive/mobile diagnostic...');

        try {
            // Run all analysis functions
            analyzeViewportConfiguration();
            analyzeTouchEventCompatibility();
            analyzeResponsiveCSS();
            analyzeMobileBrowserCompatibility();
            analyzeAccessibilityAndTouchTargets();
            analyzeWordPressAdminResponsive();
            generateRecommendations();

            // Generate final report
            AGENT_5_DIAGNOSTIC.results.summary = {
                totalIssues: AGENT_5_DIAGNOSTIC.results.issues.length,
                totalRecommendations: AGENT_5_DIAGNOSTIC.results.recommendations.length,
                criticalIssues: AGENT_5_DIAGNOSTIC.results.issues.filter(issue =>
                    issue.includes('CRITICAL')).length,
                executionTime: Date.now() - AGENT_5_DIAGNOSTIC.startTime,
                buttonFound: !!document.getElementById('design-preview-btn'),
                deviceType: (() => {
                    if (/iPad|Android.*Tablet/i.test(navigator.userAgent)) return 'tablet';
                    if (/Mobi|Android/i.test(navigator.userAgent)) return 'mobile';
                    return 'desktop';
                })(),
                viewport: `${window.innerWidth}x${window.innerHeight}`,
                orientationSupport: 'orientation' in window && 'onorientationchange' in window
            };

            console.log('🏁 AGENT 5 DIAGNOSTIC COMPLETE');
            console.log('Summary:', AGENT_5_DIAGNOSTIC.results.summary);

        } catch (error) {
            console.error('❌ AGENT 5 DIAGNOSTIC ERROR:', error);
            AGENT_5_DIAGNOSTIC.results.error = {
                message: error.message,
                stack: error.stack,
                timestamp: new Date().toISOString()
            };
        }

        console.groupEnd();
        return AGENT_5_DIAGNOSTIC;
    }

    // ===== EXPORT RESULTS =====
    function exportResults() {
        // Make results available globally
        window.AGENT_5_RESPONSIVE_DIAGNOSTIC = AGENT_5_DIAGNOSTIC;

        // Create downloadable report
        const reportData = {
            ...AGENT_5_DIAGNOSTIC,
            generated: new Date().toISOString(),
            url: window.location.href,
            userAgent: navigator.userAgent
        };

        console.log('📊 AGENT 5 FINAL REPORT:', reportData);

        // Return formatted console output
        return `
🤖 AGENT 5: RESPONSIVE/MOBILE CSS ISSUES SPECIALIST - DIAGNOSTIC COMPLETE

📱 DEVICE CONTEXT:
   • Type: ${reportData.results.summary.deviceType}
   • Viewport: ${reportData.results.summary.viewport}
   • User Agent: ${navigator.userAgent}
   • Touch Support: ${'ontouchstart' in window}

🔍 ANALYSIS RESULTS:
   • Button Found: ${reportData.results.summary.buttonFound ? '✅' : '❌'}
   • Total Issues: ${reportData.results.summary.totalIssues}
   • Critical Issues: ${reportData.results.summary.criticalIssues}
   • Recommendations: ${reportData.results.summary.totalRecommendations}

📋 KEY FINDINGS:
   ${AGENT_5_DIAGNOSTIC.results.recommendations.filter(r => r.priority === 'CRITICAL' || r.priority === 'HIGH')
     .map(r => `   • ${r.category}: ${r.issue}`)
     .join('\n   ')}

⚠️  CRITICAL ISSUES:
   ${AGENT_5_DIAGNOSTIC.results.issues.map(issue => `   • ${issue}`).join('\n   ')}

💡 TOP RECOMMENDATIONS:
   ${AGENT_5_DIAGNOSTIC.results.recommendations.slice(0, 5)
     .map(r => `   • [${r.priority}] ${r.category}: ${r.solution.replace(/\s+/g, ' ').trim()}`)
     .join('\n   ')}

🔧 Access full results: window.AGENT_5_RESPONSIVE_DIAGNOSTIC
⏱️  Execution time: ${reportData.results.summary.executionTime}ms
        `;
    }

    // Execute diagnostic and return results
    const diagnosticResults = runDiagnostic();
    const report = exportResults();

    console.log(report);
    return diagnosticResults;

})();