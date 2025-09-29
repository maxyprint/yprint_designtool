/**
 * 🤖 AGENT 4: WORDPRESS ADMIN CSS CONFLICTS SPECIALIST
 * Comprehensive WordPress Admin CSS Diagnostic Script
 *
 * This script analyzes WordPress admin theme and WooCommerce style conflicts
 * preventing #design-preview-btn interaction in the WordPress admin interface.
 *
 * USAGE: Copy and paste this entire script into browser console on the WordPress admin page
 * where the design preview button should appear (WooCommerce order edit page).
 */

(function() {
    'use strict';

    console.log('🤖 AGENT 4: WORDPRESS ADMIN CSS CONFLICTS SPECIALIST - Starting Analysis...');
    console.log('🕒 Analysis started at:', new Date().toISOString());

    // ===== DIAGNOSTIC DATA COLLECTION =====
    const diagnostics = {
        timestamp: new Date().toISOString(),
        environment: {
            wordpress: {},
            woocommerce: {},
            plugins: [],
            theme: {},
            adminColorScheme: null
        },
        buttonAnalysis: {
            exists: false,
            element: null,
            computedStyles: null,
            visibility: null,
            interactions: null
        },
        cssConflicts: {
            specificityIssues: [],
            overridingRules: [],
            pluginInterference: [],
            themeConflicts: [],
            responsiveIssues: []
        },
        wordpressAdminStyles: {
            adminBarConflicts: [],
            metaBoxPositioning: [],
            colorSchemeIssues: [],
            adminThemeOverrides: []
        },
        recommendations: []
    };

    // ===== WORDPRESS ENVIRONMENT DETECTION =====
    function analyzeWordPressEnvironment() {
        console.group('🔍 WordPress Environment Analysis');

        // WordPress version and admin context
        diagnostics.environment.wordpress = {
            version: window.wp ? window.wp.data || 'Detected' : 'Unknown',
            adminUrl: window.ajaxurl ? window.ajaxurl.replace('/admin-ajax.php', '') : 'Unknown',
            isAdmin: document.body.classList.contains('wp-admin'),
            adminColorScheme: document.querySelector('#wpadminbar')?.getAttribute('class') || 'default',
            rtl: document.documentElement.dir === 'rtl',
            responsive: window.innerWidth <= 782
        };

        // WooCommerce detection
        diagnostics.environment.woocommerce = {
            version: window.wc ? 'Detected' : 'Unknown',
            isOrderPage: document.querySelector('#post-type-shop_order, .post-type-shop_order') !== null,
            orderEditPage: window.location.href.includes('post.php') && window.location.href.includes('post='),
            adminStyles: !!document.querySelector('link[href*="woocommerce"]')
        };

        // WordPress admin color scheme detection
        const adminBarClasses = document.querySelector('#wpadminbar')?.className || '';
        const colorSchemeMatch = adminBarClasses.match(/color-scheme-(\w+)/);
        diagnostics.environment.adminColorScheme = colorSchemeMatch ? colorSchemeMatch[1] : 'default';

        // Active plugins detection (limited to what's visible in DOM)
        const pluginCSS = Array.from(document.querySelectorAll('link[rel="stylesheet"]'))
            .map(link => link.href)
            .filter(href => href.includes('/plugins/'))
            .map(href => {
                const match = href.match(/\/plugins\/([^\/]+)/);
                return match ? match[1] : null;
            })
            .filter(Boolean);

        diagnostics.environment.plugins = [...new Set(pluginCSS)];

        // Theme detection
        const themeCSS = Array.from(document.querySelectorAll('link[rel="stylesheet"]'))
            .find(link => link.href.includes('/themes/'));

        if (themeCSS) {
            const themeMatch = themeCSS.href.match(/\/themes\/([^\/]+)/);
            diagnostics.environment.theme.name = themeMatch ? themeMatch[1] : 'Unknown';
        }

        console.log('WordPress Environment:', diagnostics.environment.wordpress);
        console.log('WooCommerce Environment:', diagnostics.environment.woocommerce);
        console.log('Active Plugins (detected):', diagnostics.environment.plugins);
        console.log('Theme:', diagnostics.environment.theme);
        console.groupEnd();
    }

    // ===== BUTTON EXISTENCE AND ANALYSIS =====
    function analyzeDesignPreviewButton() {
        console.group('🎯 Design Preview Button Analysis');

        const button = document.getElementById('design-preview-btn');
        diagnostics.buttonAnalysis.exists = !!button;
        diagnostics.buttonAnalysis.element = button;

        if (!button) {
            console.error('❌ #design-preview-btn not found in DOM');

            // Check for alternative selectors
            const alternatives = [
                '.design-preview-btn',
                '[data-order-id]',
                'button[class*="design"]',
                'button[class*="preview"]'
            ];

            alternatives.forEach(selector => {
                const alt = document.querySelector(selector);
                if (alt) {
                    console.log(`🔍 Found alternative: ${selector}`, alt);
                }
            });

            diagnostics.recommendations.push('CRITICAL: #design-preview-btn element not found - check if meta box is properly rendered');
            console.groupEnd();
            return;
        }

        // Get computed styles
        const computedStyles = window.getComputedStyle(button);
        diagnostics.buttonAnalysis.computedStyles = {
            display: computedStyles.display,
            visibility: computedStyles.visibility,
            opacity: computedStyles.opacity,
            pointerEvents: computedStyles.pointerEvents,
            position: computedStyles.position,
            zIndex: computedStyles.zIndex,
            overflow: computedStyles.overflow,
            transform: computedStyles.transform,
            width: computedStyles.width,
            height: computedStyles.height,
            backgroundColor: computedStyles.backgroundColor,
            color: computedStyles.color,
            border: computedStyles.border,
            margin: computedStyles.margin,
            padding: computedStyles.padding
        };

        // Visibility analysis
        diagnostics.buttonAnalysis.visibility = {
            displayed: computedStyles.display !== 'none',
            visible: computedStyles.visibility !== 'hidden',
            opacity: parseFloat(computedStyles.opacity) > 0,
            inViewport: isElementInViewport(button),
            hasSize: button.offsetWidth > 0 && button.offsetHeight > 0,
            clipped: computedStyles.overflow === 'hidden' && (button.scrollWidth > button.offsetWidth || button.scrollHeight > button.offsetHeight)
        };

        // Interaction analysis
        diagnostics.buttonAnalysis.interactions = {
            disabled: button.disabled,
            clickable: computedStyles.pointerEvents !== 'none',
            tabIndex: button.tabIndex,
            hasClickHandlers: getEventListeners(button).click?.length > 0,
            hasKeyboardHandlers: getEventListeners(button).keydown?.length > 0
        };

        console.log('✅ Button found:', button);
        console.log('Computed Styles:', diagnostics.buttonAnalysis.computedStyles);
        console.log('Visibility:', diagnostics.buttonAnalysis.visibility);
        console.log('Interactions:', diagnostics.buttonAnalysis.interactions);

        console.groupEnd();
    }

    // ===== CSS SPECIFICITY AND CONFLICT ANALYSIS =====
    function analyzeCSSConflicts() {
        console.group('⚔️ CSS Conflicts Analysis');

        const button = document.getElementById('design-preview-btn');
        if (!button) {
            console.log('Skipping CSS analysis - button not found');
            console.groupEnd();
            return;
        }

        // Get all CSS rules affecting the button
        const allRules = [];

        for (let i = 0; i < document.styleSheets.length; i++) {
            try {
                const styleSheet = document.styleSheets[i];
                const rules = styleSheet.cssRules || styleSheet.rules;

                if (!rules) continue;

                for (let j = 0; j < rules.length; j++) {
                    const rule = rules[j];
                    if (rule.selectorText && button.matches && button.matches(rule.selectorText)) {
                        allRules.push({
                            selector: rule.selectorText,
                            specificity: calculateSpecificity(rule.selectorText),
                            source: styleSheet.href || 'inline',
                            cssText: rule.cssText
                        });
                    }
                }
            } catch (e) {
                // Cross-origin stylesheet - log but continue
                console.warn('Cannot analyze cross-origin stylesheet:', document.styleSheets[i].href);
            }
        }

        // Sort by specificity
        allRules.sort((a, b) => b.specificity - a.specificity);

        console.log('CSS Rules affecting button (by specificity):', allRules);

        // Analyze specificity conflicts
        const displayRules = allRules.filter(rule => rule.cssText.includes('display'));
        const visibilityRules = allRules.filter(rule => rule.cssText.includes('visibility'));
        const pointerRules = allRules.filter(rule => rule.cssText.includes('pointer-events'));
        const zIndexRules = allRules.filter(rule => rule.cssText.includes('z-index'));

        diagnostics.cssConflicts.specificityIssues = {
            displayConflicts: displayRules.length > 1,
            visibilityConflicts: visibilityRules.length > 1,
            pointerConflicts: pointerRules.length > 1,
            zIndexConflicts: zIndexRules.length > 1,
            totalRules: allRules.length
        };

        // Check for WordPress admin specific conflicts
        analyzeWordPressAdminConflicts(allRules);

        // Plugin interference detection
        analyzePluginInterference(allRules);

        console.groupEnd();
    }

    // ===== WORDPRESS ADMIN SPECIFIC CONFLICTS =====
    function analyzeWordPressAdminConflicts(rules) {
        console.group('🏛️ WordPress Admin Conflicts');

        const button = document.getElementById('design-preview-btn');
        if (!button) {
            console.groupEnd();
            return;
        }

        // Check admin bar interference
        const adminBar = document.getElementById('wpadminbar');
        if (adminBar) {
            const adminBarRect = adminBar.getBoundingClientRect();
            const buttonRect = button.getBoundingClientRect();

            if (buttonRect.top < adminBarRect.bottom) {
                diagnostics.wordpressAdminStyles.adminBarConflicts.push({
                    type: 'positioning',
                    issue: 'Button may be hidden behind admin bar',
                    adminBarHeight: adminBarRect.height,
                    buttonTop: buttonRect.top
                });
            }
        }

        // Meta box positioning analysis
        const metaBox = button.closest('.postbox, .meta-box-sortables');
        if (metaBox) {
            const metaBoxStyles = window.getComputedStyle(metaBox);
            diagnostics.wordpressAdminStyles.metaBoxPositioning.push({
                position: metaBoxStyles.position,
                zIndex: metaBoxStyles.zIndex,
                overflow: metaBoxStyles.overflow,
                display: metaBoxStyles.display
            });
        }

        // Color scheme compatibility
        const currentScheme = diagnostics.environment.adminColorScheme;
        const buttonBg = window.getComputedStyle(button).backgroundColor;
        const buttonColor = window.getComputedStyle(button).color;

        diagnostics.wordpressAdminStyles.colorSchemeIssues = {
            scheme: currentScheme,
            buttonBackground: buttonBg,
            buttonColor: buttonColor,
            contrastOk: checkColorContrast(buttonBg, buttonColor)
        };

        // WordPress admin theme overrides
        const wpAdminRules = rules.filter(rule =>
            rule.source && (
                rule.source.includes('wp-admin') ||
                rule.source.includes('admin-bar') ||
                rule.source.includes('wp-includes')
            )
        );

        diagnostics.wordpressAdminStyles.adminThemeOverrides = wpAdminRules;

        console.log('Admin Bar Conflicts:', diagnostics.wordpressAdminStyles.adminBarConflicts);
        console.log('Meta Box Positioning:', diagnostics.wordpressAdminStyles.metaBoxPositioning);
        console.log('Color Scheme Issues:', diagnostics.wordpressAdminStyles.colorSchemeIssues);
        console.log('WP Admin Theme Overrides:', wpAdminRules.length);

        console.groupEnd();
    }

    // ===== PLUGIN INTERFERENCE ANALYSIS =====
    function analyzePluginInterference(rules) {
        console.group('🔌 Plugin Interference Analysis');

        // Group rules by plugin
        const pluginRules = {};

        rules.forEach(rule => {
            if (rule.source && rule.source.includes('/plugins/')) {
                const pluginMatch = rule.source.match(/\/plugins\/([^\/]+)/);
                if (pluginMatch) {
                    const plugin = pluginMatch[1];
                    if (!pluginRules[plugin]) {
                        pluginRules[plugin] = [];
                    }
                    pluginRules[plugin].push(rule);
                }
            }
        });

        // Analyze each plugin's interference
        Object.keys(pluginRules).forEach(plugin => {
            const pluginRulesList = pluginRules[plugin];
            const interference = {
                plugin: plugin,
                ruleCount: pluginRulesList.length,
                hasDisplayRules: pluginRulesList.some(r => r.cssText.includes('display')),
                hasVisibilityRules: pluginRulesList.some(r => r.cssText.includes('visibility')),
                hasPointerRules: pluginRulesList.some(r => r.cssText.includes('pointer-events')),
                hasZIndexRules: pluginRulesList.some(r => r.cssText.includes('z-index')),
                rules: pluginRulesList
            };

            if (interference.ruleCount > 0) {
                diagnostics.cssConflicts.pluginInterference.push(interference);
            }
        });

        console.log('Plugin Interference:', diagnostics.cssConflicts.pluginInterference);
        console.groupEnd();
    }

    // ===== RESPONSIVE DESIGN ANALYSIS =====
    function analyzeResponsiveIssues() {
        console.group('📱 Responsive Design Analysis');

        const button = document.getElementById('design-preview-btn');
        if (!button) {
            console.groupEnd();
            return;
        }

        const viewportWidth = window.innerWidth;
        const isTablet = viewportWidth <= 782; // WordPress tablet breakpoint
        const isMobile = viewportWidth <= 600;

        // Test button at different viewport sizes
        const responsiveTests = [
            { width: 1200, label: 'Desktop' },
            { width: 782, label: 'Tablet (WP Breakpoint)' },
            { width: 600, label: 'Mobile' },
            { width: 480, label: 'Small Mobile' }
        ];

        responsiveTests.forEach(test => {
            // Simulate viewport change (limited simulation)
            const mediaQuery = window.matchMedia(`(max-width: ${test.width}px)`);

            diagnostics.cssConflicts.responsiveIssues.push({
                breakpoint: test.width,
                label: test.label,
                matches: mediaQuery.matches,
                currentWidth: viewportWidth
            });
        });

        // Check WordPress admin responsive styles
        const wpResponsiveClasses = document.body.className.split(' ').filter(cls =>
            cls.includes('mobile') || cls.includes('tablet') || cls.includes('responsive')
        );

        console.log('Current Viewport:', viewportWidth);
        console.log('WordPress Responsive Classes:', wpResponsiveClasses);
        console.log('Responsive Issues:', diagnostics.cssConflicts.responsiveIssues);

        if (isTablet) {
            diagnostics.recommendations.push('Check tablet responsive behavior - WordPress uses 782px breakpoint');
        }

        console.groupEnd();
    }

    // ===== WOOCOMMERCE SPECIFIC ANALYSIS =====
    function analyzeWooCommerceIntegration() {
        console.group('🛒 WooCommerce Integration Analysis');

        if (!diagnostics.environment.woocommerce.isOrderPage) {
            console.log('Not on WooCommerce order page - skipping WooCommerce analysis');
            console.groupEnd();
            return;
        }

        const button = document.getElementById('design-preview-btn');

        // Check WooCommerce admin styles
        const wcStylesheets = Array.from(document.querySelectorAll('link[rel="stylesheet"]'))
            .filter(link => link.href.includes('woocommerce'));

        console.log('WooCommerce Stylesheets:', wcStylesheets.map(link => link.href));

        // Check for WooCommerce meta box conflicts
        const wcMetaBoxes = document.querySelectorAll('.woocommerce_options_panel, .wc-metaboxes');
        console.log('WooCommerce Meta Boxes:', wcMetaBoxes.length);

        // Check order data meta box
        const orderDataColumn = document.querySelector('.order_data_column_container');
        if (orderDataColumn && button) {
            const isInOrderData = orderDataColumn.contains(button);
            console.log('Button in Order Data Column:', isInOrderData);

            if (!isInOrderData) {
                diagnostics.recommendations.push('Button should be in WooCommerce order data column for proper styling');
            }
        }

        console.groupEnd();
    }

    // ===== UTILITY FUNCTIONS =====

    function isElementInViewport(el) {
        const rect = el.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }

    function calculateSpecificity(selector) {
        // Simple specificity calculation
        const ids = (selector.match(/#/g) || []).length * 100;
        const classes = (selector.match(/\./g) || []).length * 10;
        const elements = (selector.match(/[a-zA-Z]/g) || []).length;
        return ids + classes + elements;
    }

    function getEventListeners(element) {
        // Try to get event listeners (works in some browsers)
        if (window.getEventListeners) {
            return window.getEventListeners(element);
        }

        // Fallback - check jQuery data
        if (window.jQuery) {
            const events = window.jQuery._data(element, 'events');
            return events || {};
        }

        return {};
    }

    function checkColorContrast(bg, color) {
        // Simple contrast check - would need more sophisticated implementation for real WCAG compliance
        return bg !== color;
    }

    // ===== GENERATE RECOMMENDATIONS =====
    function generateRecommendations() {
        console.group('💡 Recommendations');

        const button = document.getElementById('design-preview-btn');

        if (!button) {
            diagnostics.recommendations.push('CRITICAL: Ensure meta box hook is properly registered');
            diagnostics.recommendations.push('Check if order has design data to enable button');
            diagnostics.recommendations.push('Verify WooCommerce integration is active');
        } else {
            const styles = diagnostics.buttonAnalysis.computedStyles;
            const visibility = diagnostics.buttonAnalysis.visibility;

            if (styles.display === 'none') {
                diagnostics.recommendations.push('CRITICAL: Button has display: none - check CSS rules');
            }

            if (styles.visibility === 'hidden') {
                diagnostics.recommendations.push('CRITICAL: Button has visibility: hidden');
            }

            if (parseFloat(styles.opacity) < 0.1) {
                diagnostics.recommendations.push('WARNING: Button has very low opacity');
            }

            if (styles.pointerEvents === 'none') {
                diagnostics.recommendations.push('CRITICAL: Button has pointer-events: none');
            }

            if (!visibility.inViewport) {
                diagnostics.recommendations.push('WARNING: Button is outside viewport');
            }

            if (!visibility.hasSize) {
                diagnostics.recommendations.push('CRITICAL: Button has no size (0px width/height)');
            }

            if (button.disabled) {
                diagnostics.recommendations.push('INFO: Button is disabled - check if order has design data');
            }
        }

        // CSS-specific recommendations
        if (diagnostics.cssConflicts.specificityIssues.totalRules > 10) {
            diagnostics.recommendations.push('WARNING: High number of CSS rules affecting button - potential specificity conflicts');
        }

        if (diagnostics.cssConflicts.pluginInterference.length > 0) {
            diagnostics.recommendations.push(`WARNING: ${diagnostics.cssConflicts.pluginInterference.length} plugins affecting button styles`);
        }

        if (diagnostics.wordpressAdminStyles.adminBarConflicts.length > 0) {
            diagnostics.recommendations.push('WARNING: Potential admin bar positioning conflicts');
        }

        diagnostics.recommendations.forEach(rec => console.log('💡', rec));
        console.groupEnd();
    }

    // ===== MAIN EXECUTION =====
    function runDiagnostics() {
        try {
            analyzeWordPressEnvironment();
            analyzeDesignPreviewButton();
            analyzeCSSConflicts();
            analyzeResponsiveIssues();
            analyzeWooCommerceIntegration();
            generateRecommendations();

            // Final report
            console.group('📊 FINAL DIAGNOSTIC REPORT');
            console.log('Timestamp:', diagnostics.timestamp);
            console.log('Environment:', diagnostics.environment);
            console.log('Button Analysis:', diagnostics.buttonAnalysis);
            console.log('CSS Conflicts:', diagnostics.cssConflicts);
            console.log('WordPress Admin Issues:', diagnostics.wordpressAdminStyles);
            console.log('Recommendations:', diagnostics.recommendations);
            console.groupEnd();

            // Store in global for easy access
            window.wpCssConflictsDiagnostics = diagnostics;

            console.log('🎯 DIAGNOSIS COMPLETE! Results stored in window.wpCssConflictsDiagnostics');
            console.log('🔧 Use window.wpCssConflictsDiagnostics.recommendations for quick fixes');

        } catch (error) {
            console.error('❌ Diagnostic script error:', error);
        }
    }

    // ===== ADDITIONAL TESTING FUNCTIONS =====

    // Function to test button visibility fixes
    window.testButtonVisibilityFix = function() {
        console.group('🧪 Testing Button Visibility Fixes');

        const button = document.getElementById('design-preview-btn');
        if (!button) {
            console.error('Button not found for testing');
            console.groupEnd();
            return;
        }

        const originalStyles = {
            display: button.style.display,
            visibility: button.style.visibility,
            opacity: button.style.opacity,
            pointerEvents: button.style.pointerEvents,
            zIndex: button.style.zIndex
        };

        console.log('Original styles:', originalStyles);

        // Apply visibility fixes
        button.style.display = 'inline-flex';
        button.style.visibility = 'visible';
        button.style.opacity = '1';
        button.style.pointerEvents = 'auto';
        button.style.zIndex = '999';

        console.log('Applied fixes - test button interaction now');
        console.log('Call restoreButtonStyles() to revert changes');

        window.restoreButtonStyles = function() {
            Object.keys(originalStyles).forEach(prop => {
                button.style[prop] = originalStyles[prop];
            });
            console.log('Original styles restored');
        };

        console.groupEnd();
    };

    // Function to highlight button with CSS
    window.highlightButton = function() {
        const button = document.getElementById('design-preview-btn');
        if (button) {
            button.style.border = '3px solid red';
            button.style.backgroundColor = 'yellow';
            button.style.boxShadow = '0 0 10px red';
            console.log('Button highlighted - check if you can see it now');
        }
    };

    // Run the main diagnostics
    runDiagnostics();

})();

// ===== QUICK ACCESS FUNCTIONS =====
console.log('🚀 WORDPRESS ADMIN CSS DIAGNOSTICS LOADED');
console.log('📋 Quick commands:');
console.log('  • window.wpCssConflictsDiagnostics - Full diagnostic results');
console.log('  • testButtonVisibilityFix() - Test visibility fixes');
console.log('  • highlightButton() - Highlight button with CSS');
console.log('  • restoreButtonStyles() - Restore original styles (after testing)');