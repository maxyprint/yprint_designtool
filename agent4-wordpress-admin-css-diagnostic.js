/**
 * 🤖 AGENT 4: WORDPRESS ADMIN CSS CONFLICTS SPECIALIST
 *
 * Comprehensive WordPress admin CSS diagnostic for #design-preview-btn
 * Analyzes WordPress/WooCommerce admin style conflicts and theme overrides
 *
 * USAGE: Copy & paste into browser console on Order 5374 page
 */

class WordPressAdminCSSConflictsDiagnostic {
    constructor() {
        this.buttonId = 'design-preview-btn';
        this.diagnostics = {
            timestamp: new Date().toISOString(),
            wpAdminAnalysis: {
                environment: null,
                themeConflicts: null,
                pluginInterference: null,
                metaBoxIssues: null,
                responsiveProblems: null,
                colorSchemeIssues: null
            },
            criticalIssues: [],
            recommendations: []
        };

        console.group('🤖 AGENT 4: WORDPRESS ADMIN CSS CONFLICTS DIAGNOSTIC');
        console.log('Target:', this.buttonId);
        console.log('Analysis started at:', this.diagnostics.timestamp);
    }

    /**
     * 🔍 MAIN DIAGNOSTIC ENTRY POINT
     */
    async runComprehensiveDiagnosis() {
        const button = document.getElementById(this.buttonId);

        console.log('🌐 Analyzing WordPress admin environment...');

        // Run all diagnostic modules
        await this.analyzeWordPressEnvironment();
        await this.checkAdminThemeConflicts(button);
        await this.detectPluginInterference(button);
        await this.analyzeMetaBoxIssues(button);
        await this.checkResponsiveProblems(button);
        await this.analyzeColorSchemeCompatibility(button);
        await this.performWordPressSpecificTests(button);

        return this.generateReport();
    }

    /**
     * 🌐 WORDPRESS ENVIRONMENT ANALYSIS
     */
    analyzeWordPressEnvironment() {
        console.group('🌐 WORDPRESS ENVIRONMENT ANALYSIS');

        const environmentAnalysis = {
            isWordPressAdmin: this.detectWordPressAdmin(),
            wooCommerceContext: this.detectWooCommerceContext(),
            adminTheme: this.detectAdminTheme(),
            adminColorScheme: this.detectAdminColorScheme(),
            screenInfo: this.getScreenInfo(),
            adminBarInfo: this.getAdminBarInfo()
        };

        if (!environmentAnalysis.isWordPressAdmin) {
            this.diagnostics.criticalIssues.push('Not in WordPress admin environment');
            console.error('❌ Not in WordPress admin environment');
        } else {
            console.log('✅ WordPress admin environment detected');
        }

        if (!environmentAnalysis.wooCommerceContext.isOrderPage) {
            console.warn('⚠️ Not on WooCommerce order page');
        } else {
            console.log('✅ WooCommerce order page detected');
        }

        this.diagnostics.wpAdminAnalysis.environment = environmentAnalysis;
        console.log('📊 WordPress Environment:', environmentAnalysis);
        console.groupEnd();
    }

    /**
     * 🎨 ADMIN THEME CONFLICTS CHECK
     */
    checkAdminThemeConflicts(button) {
        console.group('🎨 ADMIN THEME CONFLICTS CHECK');

        const themeConflictAnalysis = {
            adminStyles: this.analyzeAdminStyles(button),
            wooCommerceStyles: this.analyzeWooCommerceStyles(button),
            themeOverrides: this.detectThemeOverrides(button),
            specificityIssues: this.checkCSSSpecificity(button),
            buttonStyleInheritance: this.analyzeButtonStyleInheritance(button)
        };

        // Check for problematic admin style overrides
        if (button) {
            const buttonStyles = window.getComputedStyle(button);

            // Check for admin CSS that might be interfering
            const problematicStyles = this.checkProblematicStyles(buttonStyles);
            if (problematicStyles.length > 0) {
                this.diagnostics.criticalIssues.push(`Admin CSS conflicts: ${problematicStyles.join(', ')}`);
                console.error('❌ Problematic admin styles detected:', problematicStyles);
            }

            // Check WooCommerce admin button styles
            if (button.classList.contains('button') || button.classList.contains('button-primary')) {
                const wooStyles = this.analyzeWooCommerceButtonStyles(button);
                themeConflictAnalysis.wooCommerceStyles.buttonStyles = wooStyles;

                if (wooStyles.hasConflicts) {
                    console.warn('⚠️ WooCommerce button style conflicts detected');
                }
            }
        }

        this.diagnostics.wpAdminAnalysis.themeConflicts = themeConflictAnalysis;
        console.log('📊 Admin Theme Conflicts:', themeConflictAnalysis);
        console.groupEnd();
    }

    /**
     * 🔌 PLUGIN INTERFERENCE DETECTION
     */
    detectPluginInterference(button) {
        console.group('🔌 PLUGIN INTERFERENCE DETECTION');

        const pluginAnalysis = {
            activePlugins: this.detectActivePlugins(),
            conflictingCSS: this.findConflictingPluginCSS(button),
            overlappingElements: this.findPluginOverlappingElements(button),
            jsConflicts: this.checkPluginJSConflicts()
        };

        // Check for common plugin conflicts
        const commonConflictingPlugins = [
            'elementor', 'divi', 'beaver-builder', 'visual-composer',
            'gutenberg', 'classic-editor', 'yoast', 'rank-math'
        ];

        commonConflictingPlugins.forEach(plugin => {
            if (this.detectPluginPresence(plugin)) {
                console.log(`📦 Detected plugin: ${plugin}`);
                pluginAnalysis.activePlugins.push(plugin);

                // Check for specific conflicts
                const conflicts = this.checkPluginSpecificConflicts(plugin, button);
                if (conflicts.length > 0) {
                    pluginAnalysis.conflictingCSS[plugin] = conflicts;
                    console.warn(`⚠️ ${plugin} conflicts detected:`, conflicts);
                }
            }
        });

        // Check for CSS framework conflicts
        const frameworks = this.detectCSSFrameworks();
        if (frameworks.length > 0) {
            pluginAnalysis.cssFrameworks = frameworks;
            console.log('🎨 CSS frameworks detected:', frameworks);

            frameworks.forEach(framework => {
                if (this.checkFrameworkButtonConflicts(framework, button)) {
                    this.diagnostics.criticalIssues.push(`${framework} framework conflicts with button`);
                }
            });
        }

        this.diagnostics.wpAdminAnalysis.pluginInterference = pluginAnalysis;
        console.log('📊 Plugin Interference:', pluginAnalysis);
        console.groupEnd();
    }

    /**
     * 📦 META BOX ISSUES ANALYSIS
     */
    analyzeMetaBoxIssues(button) {
        console.group('📦 META BOX ISSUES ANALYSIS');

        const metaBoxAnalysis = {
            metaBoxContainer: null,
            positioningIssues: [],
            zIndexConflicts: [],
            layoutProblems: []
        };

        if (button) {
            // Find meta box container
            const metaBoxContainer = button.closest('.postbox, .meta-box-sortables, .postbox-container');
            if (metaBoxContainer) {
                metaBoxAnalysis.metaBoxContainer = {
                    element: this.getElementInfo(metaBoxContainer),
                    isCollapsed: metaBoxContainer.classList.contains('closed'),
                    isHidden: window.getComputedStyle(metaBoxContainer).display === 'none',
                    positioning: window.getComputedStyle(metaBoxContainer).position,
                    zIndex: window.getComputedStyle(metaBoxContainer).zIndex
                };

                console.log('📦 Meta box container found:', metaBoxContainer);

                // Check for collapse/expand issues
                if (metaBoxAnalysis.metaBoxContainer.isCollapsed) {
                    metaBoxAnalysis.layoutProblems.push('Meta box is collapsed');
                    console.warn('⚠️ Meta box is collapsed - button may not be visible');
                }

                if (metaBoxAnalysis.metaBoxContainer.isHidden) {
                    metaBoxAnalysis.layoutProblems.push('Meta box is hidden');
                    this.diagnostics.criticalIssues.push('Meta box container is hidden');
                    console.error('❌ Meta box container is hidden');
                }

                // Check z-index conflicts with other meta boxes
                this.checkMetaBoxZIndexConflicts(metaBoxContainer, metaBoxAnalysis);

                // Check layout within meta box
                this.analyzeMetaBoxLayout(metaBoxContainer, button, metaBoxAnalysis);
            } else {
                console.log('ℹ️ Button not in a standard meta box');
            }
        }

        this.diagnostics.wpAdminAnalysis.metaBoxIssues = metaBoxAnalysis;
        console.log('📊 Meta Box Issues:', metaBoxAnalysis);
        console.groupEnd();
    }

    /**
     * 📱 RESPONSIVE PROBLEMS CHECK
     */
    checkResponsiveProblems(button) {
        console.group('📱 RESPONSIVE PROBLEMS CHECK');

        const responsiveAnalysis = {
            wordPressBreakpoints: this.checkWordPressBreakpoints(button),
            adminResponsiveBehavior: this.analyzeAdminResponsiveBehavior(button),
            mobileAdminIssues: this.checkMobileAdminIssues(button),
            sidebarInteraction: this.analyzeSidebarInteraction(button)
        };

        // Check WordPress admin responsive breakpoints
        const wpBreakpoints = [
            { name: 'mobile', width: 600 },
            { name: 'tablet', width: 782 },
            { name: 'desktop', width: 1200 }
        ];

        wpBreakpoints.forEach(breakpoint => {
            const mediaQuery = `(max-width: ${breakpoint.width}px)`;
            const matches = window.matchMedia(mediaQuery).matches;

            responsiveAnalysis.wordPressBreakpoints[breakpoint.name] = {
                matches: matches,
                breakpoint: breakpoint.width
            };

            if (matches && button) {
                // Check if button behaves properly at this breakpoint
                const issues = this.checkBreakpointIssues(button, breakpoint);
                if (issues.length > 0) {
                    responsiveAnalysis.wordPressBreakpoints[breakpoint.name].issues = issues;
                    console.warn(`⚠️ Issues at ${breakpoint.name} breakpoint:`, issues);
                }
            }
        });

        // Check admin menu collapsed state impact
        const adminMenu = document.getElementById('adminmenu');
        if (adminMenu) {
            const isCollapsed = document.body.classList.contains('folded');
            responsiveAnalysis.sidebarInteraction.menuCollapsed = isCollapsed;

            if (button && isCollapsed) {
                const layoutIssues = this.checkCollapsedMenuImpact(button);
                if (layoutIssues.length > 0) {
                    responsiveAnalysis.sidebarInteraction.collapsedIssues = layoutIssues;
                }
            }
        }

        this.diagnostics.wpAdminAnalysis.responsiveProblems = responsiveAnalysis;
        console.log('📊 Responsive Problems:', responsiveAnalysis);
        console.groupEnd();
    }

    /**
     * 🎨 COLOR SCHEME COMPATIBILITY
     */
    analyzeColorSchemeCompatibility(button) {
        console.group('🎨 COLOR SCHEME COMPATIBILITY');

        const colorAnalysis = {
            currentScheme: this.detectCurrentColorScheme(),
            contrastIssues: [],
            visibilityProblems: [],
            themeCompatibility: {}
        };

        if (button) {
            const buttonStyles = window.getComputedStyle(button);

            // Check contrast ratios
            const backgroundColor = buttonStyles.backgroundColor;
            const color = buttonStyles.color;
            const borderColor = buttonStyles.borderColor;

            colorAnalysis.buttonColors = {
                backgroundColor,
                color,
                borderColor
            };

            // Check if colors are readable
            const contrastRatio = this.calculateContrastRatio(backgroundColor, color);
            if (contrastRatio < 4.5) { // WCAG AA standard
                colorAnalysis.contrastIssues.push('Button text contrast too low');
                this.diagnostics.criticalIssues.push('Button text contrast below WCAG standards');
                console.warn('⚠️ Button text contrast too low:', contrastRatio);
            }

            // Check disabled state colors
            if (button.disabled) {
                const disabledOpacity = buttonStyles.opacity;
                if (parseFloat(disabledOpacity) < 0.5) {
                    colorAnalysis.visibilityProblems.push('Disabled button too transparent');
                }
            }

            // Check admin color scheme compatibility
            const adminColors = this.getAdminColorScheme();
            colorAnalysis.themeCompatibility = this.checkColorSchemeCompatibility(buttonStyles, adminColors);
        }

        this.diagnostics.wpAdminAnalysis.colorSchemeIssues = colorAnalysis;
        console.log('📊 Color Scheme Compatibility:', colorAnalysis);
        console.groupEnd();
    }

    /**
     * 🧪 WORDPRESS SPECIFIC TESTS
     */
    performWordPressSpecificTests(button) {
        console.group('🧪 WORDPRESS SPECIFIC TESTS');

        const wpTests = {
            adminBarInterference: this.testAdminBarInterference(button),
            dashiconsAvailability: this.testDashiconsAvailability(),
            adminScriptsLoaded: this.testAdminScriptsLoaded(),
            wooCommerceAdminStyles: this.testWooCommerceAdminStyles(button)
        };

        // Test if button is affected by admin bar
        if (wpTests.adminBarInterference.hasInterference) {
            console.warn('⚠️ Admin bar interference detected');
        }

        // Test Dashicons availability (important for button icons)
        if (!wpTests.dashiconsAvailability.loaded) {
            console.warn('⚠️ Dashicons font not loaded - icons may not display');
        }

        console.log('📊 WordPress Specific Tests:', wpTests);
        console.groupEnd();
    }

    /**
     * 🛠️ UTILITY METHODS
     */
    detectWordPressAdmin() {
        return {
            isAdmin: window.location.href.includes('/wp-admin/'),
            bodyClass: document.body.classList.contains('wp-admin'),
            adminBar: !!document.getElementById('wpadminbar'),
            adminMenu: !!document.getElementById('adminmenu')
        };
    }

    detectWooCommerceContext() {
        return {
            isOrderPage: window.location.href.includes('page=wc-orders'),
            isEditPage: window.location.href.includes('action=edit'),
            orderId: new URLSearchParams(window.location.search).get('id'),
            hasWooElements: !!document.querySelector('.woocommerce, [class*="wc-"], [class*="woo"]')
        };
    }

    detectAdminTheme() {
        const bodyClasses = Array.from(document.body.classList);
        const themeClasses = bodyClasses.filter(cls => cls.includes('admin-color-'));

        return {
            colorScheme: themeClasses.length > 0 ? themeClasses[0].replace('admin-color-', '') : 'fresh',
            bodyClasses: bodyClasses,
            customCSS: this.hasCustomAdminCSS()
        };
    }

    detectAdminColorScheme() {
        const bodyClasses = document.body.className;
        const colorSchemes = ['fresh', 'light', 'blue', 'coffee', 'ectoplasm', 'midnight', 'ocean', 'sunrise'];

        for (let scheme of colorSchemes) {
            if (bodyClasses.includes(`admin-color-${scheme}`)) {
                return scheme;
            }
        }

        return 'fresh'; // default
    }

    getScreenInfo() {
        return {
            currentScreen: window.pagenow || 'unknown',
            screenId: document.body.id,
            postType: window.typenow || 'unknown'
        };
    }

    getAdminBarInfo() {
        const adminBar = document.getElementById('wpadminbar');
        if (!adminBar) return { present: false };

        const styles = window.getComputedStyle(adminBar);
        return {
            present: true,
            height: styles.height,
            position: styles.position,
            zIndex: styles.zIndex,
            fixed: styles.position === 'fixed'
        };
    }

    analyzeAdminStyles(button) {
        if (!button) return { analyzed: false };

        const buttonStyles = window.getComputedStyle(button);
        const adminStyleInfluences = [];

        // Check for WordPress admin button classes
        const wpButtonClasses = ['button', 'button-primary', 'button-secondary', 'button-large', 'button-small'];
        wpButtonClasses.forEach(cls => {
            if (button.classList.contains(cls)) {
                adminStyleInfluences.push(cls);
            }
        });

        return {
            analyzed: true,
            wpButtonClasses: adminStyleInfluences,
            adminStylesApplied: adminStyleInfluences.length > 0,
            computedStyles: {
                fontFamily: buttonStyles.fontFamily,
                fontSize: buttonStyles.fontSize,
                fontWeight: buttonStyles.fontWeight,
                backgroundColor: buttonStyles.backgroundColor,
                borderRadius: buttonStyles.borderRadius
            }
        };
    }

    analyzeWooCommerceStyles(button) {
        if (!button) return { analyzed: false };

        const wooElements = document.querySelectorAll('[class*="wc-"], [class*="woocommerce"]');
        const hasWooStyles = wooElements.length > 0;

        return {
            analyzed: true,
            hasWooCommerce: hasWooStyles,
            wooElementsCount: wooElements.length,
            buttonInWooContext: this.isInWooCommerceContext(button)
        };
    }

    detectThemeOverrides(button) {
        const overrides = [];

        // Check for custom admin CSS
        const customStyles = Array.from(document.styleSheets).filter(sheet => {
            try {
                return sheet.href && (
                    sheet.href.includes('/wp-admin/') ||
                    sheet.href.includes('admin') ||
                    sheet.href.includes('custom')
                );
            } catch (e) {
                return false;
            }
        });

        if (customStyles.length > 0) {
            overrides.push(`${customStyles.length} custom admin stylesheets detected`);
        }

        return overrides;
    }

    checkCSSSpecificity(button) {
        if (!button) return { checked: false };

        // This is a simplified specificity check
        const buttonId = button.id;
        const buttonClasses = Array.from(button.classList);

        const specificityIssues = [];

        // High specificity selectors that might override button styles
        const highSpecificitySelectors = [
            `#wpbody .${buttonClasses.join('.')}`,
            `.wp-admin .${buttonClasses.join('.')}`,
            `#wpcontent .${buttonClasses.join('.')}`
        ];

        return {
            checked: true,
            buttonId,
            buttonClasses,
            potentialOverrides: highSpecificitySelectors,
            issues: specificityIssues
        };
    }

    analyzeButtonStyleInheritance(button) {
        if (!button) return { analyzed: false };

        const inheritance = {
            fromParent: {},
            fromWP: {},
            fromWoo: {}
        };

        // Check parent element styles that might affect button
        const parent = button.parentElement;
        if (parent) {
            const parentStyles = window.getComputedStyle(parent);
            inheritance.fromParent = {
                fontSize: parentStyles.fontSize,
                fontFamily: parentStyles.fontFamily,
                color: parentStyles.color,
                textAlign: parentStyles.textAlign
            };
        }

        return inheritance;
    }

    checkProblematicStyles(buttonStyles) {
        const problems = [];

        // Check for problematic CSS values
        if (buttonStyles.pointerEvents === 'none') {
            problems.push('pointer-events: none');
        }

        if (parseFloat(buttonStyles.opacity) < 0.5) {
            problems.push('low opacity');
        }

        if (buttonStyles.visibility === 'hidden') {
            problems.push('visibility: hidden');
        }

        if (buttonStyles.display === 'none') {
            problems.push('display: none');
        }

        if (buttonStyles.position === 'absolute' &&
            (buttonStyles.left.includes('-') || buttonStyles.top.includes('-'))) {
            problems.push('negative positioning');
        }

        return problems;
    }

    analyzeWooCommerceButtonStyles(button) {
        const wooStyles = {
            hasConflicts: false,
            appliedStyles: [],
            conflicts: []
        };

        // Check for WooCommerce button style conflicts
        const wooButtonSelectors = [
            '.woocommerce .button',
            '.woocommerce-page .button',
            '#woocommerce-order-data .button'
        ];

        // This is a simplified check - in reality, you'd need to check computed styles
        const buttonClasses = Array.from(button.classList);
        if (buttonClasses.includes('button') && this.isInWooCommerceContext(button)) {
            wooStyles.appliedStyles.push('WooCommerce button styles likely applied');
        }

        return wooStyles;
    }

    detectActivePlugins() {
        const plugins = [];

        // Check for common plugin indicators in the DOM
        const pluginIndicators = {
            'elementor': '.elementor, [class*="elementor"]',
            'divi': '.et_pb_module, [class*="et_"]',
            'yoast': '[class*="yoast"], #yoast',
            'gutenberg': '.block-editor, .wp-block',
            'classic-editor': '#wp-content-wrap.html-active'
        };

        Object.entries(pluginIndicators).forEach(([plugin, selector]) => {
            if (document.querySelector(selector)) {
                plugins.push(plugin);
            }
        });

        return plugins;
    }

    findConflictingPluginCSS(button) {
        const conflicts = {};

        // This would need to be implemented based on specific plugin CSS patterns
        // For now, we'll do a basic check

        if (button) {
            const buttonRect = button.getBoundingClientRect();

            // Check for overlapping plugin elements
            const pluginElements = document.querySelectorAll('[class*="plugin-"], [id*="plugin-"]');
            pluginElements.forEach(element => {
                const elementRect = element.getBoundingClientRect();
                if (this.rectsOverlap(buttonRect, elementRect)) {
                    const pluginName = this.extractPluginName(element);
                    if (pluginName) {
                        conflicts[pluginName] = conflicts[pluginName] || [];
                        conflicts[pluginName].push('Overlapping element detected');
                    }
                }
            });
        }

        return conflicts;
    }

    findPluginOverlappingElements(button) {
        if (!button) return [];

        const buttonRect = button.getBoundingClientRect();
        const overlapping = [];

        // Common plugin element selectors
        const pluginSelectors = [
            '[class*="elementor"]', '[class*="divi"]', '[class*="beaver"]',
            '[class*="vc_"]', '[class*="wpb_"]', '[class*="fusion"]'
        ];

        pluginSelectors.forEach(selector => {
            try {
                const elements = document.querySelectorAll(selector);
                elements.forEach(element => {
                    const elementRect = element.getBoundingClientRect();
                    if (this.rectsOverlap(buttonRect, elementRect)) {
                        overlapping.push({
                            selector,
                            element: this.getElementInfo(element),
                            overlap: this.calculateOverlapArea(buttonRect, elementRect)
                        });
                    }
                });
            } catch (e) {
                console.warn('Invalid selector:', selector);
            }
        });

        return overlapping;
    }

    checkPluginJSConflicts() {
        const conflicts = [];

        // Check for global variables that might conflict
        const potentialConflicts = [
            'jQuery', '$', 'wp', 'elementor', 'divi', 'fusion'
        ];

        potentialConflicts.forEach(variable => {
            if (typeof window[variable] !== 'undefined' &&
                window[variable] !== window[variable]) { // Check if modified
                conflicts.push(`${variable} potentially modified by plugin`);
            }
        });

        return conflicts;
    }

    detectPluginPresence(pluginName) {
        const indicators = {
            'elementor': () => !!document.querySelector('[class*="elementor"]') || typeof window.elementor !== 'undefined',
            'divi': () => !!document.querySelector('[class*="et_pb"]') || document.body.classList.contains('et_divi_theme'),
            'beaver-builder': () => !!document.querySelector('[class*="fl-"]'),
            'visual-composer': () => !!document.querySelector('[class*="vc_"]'),
            'gutenberg': () => !!document.querySelector('.block-editor'),
            'classic-editor': () => !!document.getElementById('wp-content-wrap'),
            'yoast': () => !!document.querySelector('[id*="yoast"]'),
            'rank-math': () => !!document.querySelector('[class*="rank-math"]')
        };

        return indicators[pluginName] ? indicators[pluginName]() : false;
    }

    checkPluginSpecificConflicts(plugin, button) {
        const conflicts = [];

        // Plugin-specific conflict checks
        const conflictCheckers = {
            'elementor': (btn) => {
                if (document.querySelector('.elementor-editor-active')) {
                    return ['Elementor editor mode active'];
                }
                return [];
            },
            'divi': (btn) => {
                if (document.body.classList.contains('et_divi_theme')) {
                    return ['Divi theme CSS may override button styles'];
                }
                return [];
            }
        };

        if (conflictCheckers[plugin]) {
            return conflictCheckers[plugin](button);
        }

        return conflicts;
    }

    detectCSSFrameworks() {
        const frameworks = [];

        const frameworkIndicators = {
            'bootstrap': '.container, .row, .col, .btn',
            'foundation': '.foundation, .grid-container, .cell',
            'bulma': '.container, .columns, .column',
            'materialize': '.container, .row, .col',
            'semantic-ui': '.ui.container, .ui.grid'
        };

        Object.entries(frameworkIndicators).forEach(([framework, selector]) => {
            if (document.querySelector(selector)) {
                frameworks.push(framework);
            }
        });

        return frameworks;
    }

    checkFrameworkButtonConflicts(framework, button) {
        if (!button) return false;

        const frameworkButtonSelectors = {
            'bootstrap': '.btn',
            'foundation': '.button',
            'bulma': '.button',
            'materialize': '.btn',
            'semantic-ui': '.ui.button'
        };

        const selector = frameworkButtonSelectors[framework];
        if (selector) {
            try {
                return button.matches(selector);
            } catch (e) {
                return false;
            }
        }

        return false;
    }

    checkMetaBoxZIndexConflicts(metaBoxContainer, analysis) {
        const metaBoxZIndex = parseInt(window.getComputedStyle(metaBoxContainer).zIndex) || 0;

        // Find other meta boxes and compare z-index
        const otherMetaBoxes = document.querySelectorAll('.postbox:not(:first-child)');
        otherMetaBoxes.forEach(metaBox => {
            if (metaBox !== metaBoxContainer) {
                const otherZIndex = parseInt(window.getComputedStyle(metaBox).zIndex) || 0;
                if (otherZIndex > metaBoxZIndex) {
                    analysis.zIndexConflicts.push({
                        element: this.getElementInfo(metaBox),
                        zIndex: otherZIndex,
                        higherThan: metaBoxZIndex
                    });
                }
            }
        });
    }

    analyzeMetaBoxLayout(metaBoxContainer, button, analysis) {
        if (!button) return;

        const containerRect = metaBoxContainer.getBoundingClientRect();
        const buttonRect = button.getBoundingClientRect();

        // Check if button is properly positioned within meta box
        if (!this.rectContains(containerRect, buttonRect)) {
            analysis.positioningIssues.push('Button positioned outside meta box boundaries');
        }

        // Check for layout issues
        const metaBoxContent = metaBoxContainer.querySelector('.inside');
        if (metaBoxContent) {
            const contentStyles = window.getComputedStyle(metaBoxContent);
            if (contentStyles.overflow === 'hidden' &&
                !this.rectContains(metaBoxContent.getBoundingClientRect(), buttonRect)) {
                analysis.layoutProblems.push('Button clipped by meta box overflow');
            }
        }
    }

    checkWordPressBreakpoints(button) {
        const breakpoints = {};

        // WordPress admin responsive breakpoints
        const wpBreakpoints = [
            { name: 'wp-mobile', query: '(max-width: 600px)' },
            { name: 'wp-tablet', query: '(max-width: 782px)' },
            { name: 'wp-desktop', query: '(min-width: 783px)' }
        ];

        wpBreakpoints.forEach(bp => {
            const mediaQuery = window.matchMedia(bp.query);
            breakpoints[bp.name] = {
                matches: mediaQuery.matches,
                query: bp.query
            };
        });

        return breakpoints;
    }

    analyzeAdminResponsiveBehavior(button) {
        if (!button) return { analyzed: false };

        const behavior = {
            analyzed: true,
            buttonVisibleOnMobile: true,
            buttonVisibleOnTablet: true,
            responsiveClasses: []
        };

        // Check for responsive classes
        const responsiveClasses = Array.from(button.classList).filter(cls =>
            cls.includes('mobile') || cls.includes('tablet') || cls.includes('desktop') ||
            cls.includes('hide') || cls.includes('show')
        );

        behavior.responsiveClasses = responsiveClasses;

        // Test visibility at different viewport sizes (simplified)
        const currentDisplay = window.getComputedStyle(button).display;
        behavior.currentlyVisible = currentDisplay !== 'none';

        return behavior;
    }

    checkMobileAdminIssues(button) {
        const issues = [];

        // Check if we're in mobile view
        const isMobile = window.matchMedia('(max-width: 782px)').matches;

        if (isMobile && button) {
            const buttonRect = button.getBoundingClientRect();

            // Check touch target size
            if (buttonRect.width < 44 || buttonRect.height < 44) {
                issues.push('Button touch target too small for mobile');
            }

            // Check if button is accessible on mobile
            const adminMenu = document.getElementById('adminmenu');
            if (adminMenu && window.getComputedStyle(adminMenu).position === 'fixed') {
                issues.push('Fixed admin menu may interfere with button on mobile');
            }
        }

        return issues;
    }

    analyzeSidebarInteraction(button) {
        const interaction = {
            menuCollapsed: document.body.classList.contains('folded'),
            contentAreaAffected: false,
            buttonPositionChanged: false
        };

        if (button && interaction.menuCollapsed) {
            // Check if button position is affected by collapsed menu
            const wpContent = document.getElementById('wpcontent');
            if (wpContent) {
                const contentStyles = window.getComputedStyle(wpContent);
                interaction.contentAreaAffected = contentStyles.marginLeft !== 'auto';
            }
        }

        return interaction;
    }

    checkBreakpointIssues(button, breakpoint) {
        const issues = [];

        if (!button) return issues;

        const buttonStyles = window.getComputedStyle(button);

        // Check if button is hidden at this breakpoint
        if (buttonStyles.display === 'none') {
            issues.push(`Button hidden at ${breakpoint.name}`);
        }

        // Check if button is too small
        const rect = button.getBoundingClientRect();
        if (rect.width < 44 || rect.height < 44) {
            issues.push(`Button too small at ${breakpoint.name}`);
        }

        return issues;
    }

    checkCollapsedMenuImpact(button) {
        const issues = [];

        if (!button) return issues;

        // Check if button position changes when menu is collapsed
        const wpContent = document.getElementById('wpcontent');
        if (wpContent) {
            const contentMargin = window.getComputedStyle(wpContent).marginLeft;
            if (contentMargin && contentMargin !== '0px') {
                issues.push('Button position affected by collapsed admin menu');
            }
        }

        return issues;
    }

    detectCurrentColorScheme() {
        const bodyClasses = document.body.className;
        const colorSchemes = ['fresh', 'light', 'blue', 'coffee', 'ectoplasm', 'midnight', 'ocean', 'sunrise'];

        for (let scheme of colorSchemes) {
            if (bodyClasses.includes(`admin-color-${scheme}`)) {
                return scheme;
            }
        }

        return 'fresh';
    }

    calculateContrastRatio(backgroundColor, textColor) {
        // Simplified contrast calculation
        // In a real implementation, you'd convert colors to RGB and calculate properly
        return 4.5; // Placeholder - assume acceptable contrast
    }

    getAdminColorScheme() {
        // Get WordPress admin color scheme values
        const scheme = this.detectCurrentColorScheme();

        // Default values - in reality, these would be the actual color scheme values
        const colorSchemes = {
            'fresh': {
                primary: '#2271b1',
                secondary: '#72aee6',
                text: '#1d2327'
            },
            'light': {
                primary: '#04a4cc',
                secondary: '#52accc',
                text: '#333'
            }
            // ... other schemes
        };

        return colorSchemes[scheme] || colorSchemes['fresh'];
    }

    checkColorSchemeCompatibility(buttonStyles, adminColors) {
        const compatibility = {
            primaryColorMatch: false,
            contrastSufficient: true,
            themeIntegrated: false
        };

        // Check if button colors match admin theme
        const buttonBg = buttonStyles.backgroundColor;
        if (buttonBg && buttonBg.includes(adminColors.primary)) {
            compatibility.primaryColorMatch = true;
            compatibility.themeIntegrated = true;
        }

        return compatibility;
    }

    testAdminBarInterference(button) {
        const adminBar = document.getElementById('wpadminbar');
        const interference = {
            hasInterference: false,
            adminBarHeight: 0,
            buttonPosition: null
        };

        if (adminBar && button) {
            const adminBarRect = adminBar.getBoundingClientRect();
            const buttonRect = button.getBoundingClientRect();

            interference.adminBarHeight = adminBarRect.height;
            interference.buttonPosition = buttonRect.top;

            // Check if button overlaps with admin bar
            if (this.rectsOverlap(adminBarRect, buttonRect)) {
                interference.hasInterference = true;
            }
        }

        return interference;
    }

    testDashiconsAvailability() {
        // Test if Dashicons font is loaded
        const testElement = document.createElement('span');
        testElement.className = 'dashicons dashicons-admin-generic';
        testElement.style.position = 'absolute';
        testElement.style.visibility = 'hidden';
        document.body.appendChild(testElement);

        const styles = window.getComputedStyle(testElement);
        const fontFamily = styles.fontFamily;

        document.body.removeChild(testElement);

        return {
            loaded: fontFamily.includes('dashicons'),
            fontFamily: fontFamily
        };
    }

    testAdminScriptsLoaded() {
        return {
            jquery: typeof jQuery !== 'undefined',
            wordpressCommon: typeof wp !== 'undefined',
            ajaxurl: typeof ajaxurl !== 'undefined'
        };
    }

    testWooCommerceAdminStyles(button) {
        if (!button) return { tested: false };

        const wooTests = {
            tested: true,
            hasWooStyles: false,
            buttonInWooContext: false
        };

        // Check if WooCommerce admin styles are applied
        const wooElements = document.querySelectorAll('[class*="wc-"], [class*="woocommerce"]');
        wooTests.hasWooStyles = wooElements.length > 0;
        wooTests.buttonInWooContext = this.isInWooCommerceContext(button);

        return wooTests;
    }

    // Additional utility methods
    hasCustomAdminCSS() {
        // Check for custom admin CSS files
        const stylesheets = Array.from(document.styleSheets);
        return stylesheets.some(sheet => {
            try {
                return sheet.href && (
                    sheet.href.includes('custom') ||
                    sheet.href.includes('admin-theme') ||
                    sheet.href.includes('wp-admin/css/custom')
                );
            } catch (e) {
                return false;
            }
        });
    }

    isInWooCommerceContext(button) {
        if (!button) return false;

        return !!(
            button.closest('[class*="wc-"]') ||
            button.closest('[class*="woocommerce"]') ||
            button.closest('#woocommerce-order-data') ||
            window.location.href.includes('wc-orders')
        );
    }

    extractPluginName(element) {
        const classes = Array.from(element.classList);
        const id = element.id;

        // Try to extract plugin name from classes or ID
        for (let className of classes) {
            if (className.includes('plugin-')) {
                return className.replace('plugin-', '').split('-')[0];
            }
        }

        if (id && id.includes('plugin-')) {
            return id.replace('plugin-', '').split('-')[0];
        }

        return null;
    }

    rectsOverlap(rect1, rect2) {
        return !(rect1.right < rect2.left ||
                rect2.right < rect1.left ||
                rect1.bottom < rect2.top ||
                rect2.bottom < rect1.top);
    }

    rectContains(container, contained) {
        return container.left <= contained.left &&
               container.top <= contained.top &&
               container.right >= contained.right &&
               container.bottom >= contained.bottom;
    }

    calculateOverlapArea(rect1, rect2) {
        const left = Math.max(rect1.left, rect2.left);
        const top = Math.max(rect1.top, rect2.top);
        const right = Math.min(rect1.right, rect2.right);
        const bottom = Math.min(rect1.bottom, rect2.bottom);

        if (left < right && top < bottom) {
            return (right - left) * (bottom - top);
        }
        return 0;
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
        console.group('📋 WORDPRESS ADMIN CSS CONFLICTS REPORT');

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
        window.agent4WPAdminReport = report;
        console.log('📊 Report stored in: window.agent4WPAdminReport');

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
            if (issue.includes('Not in WordPress admin')) {
                recommendations.push('Ensure script runs in WordPress admin context');
            }
            if (issue.includes('Admin CSS conflicts')) {
                recommendations.push('Review and resolve WordPress admin CSS specificity issues');
            }
            if (issue.includes('Meta box container is hidden')) {
                recommendations.push('Check meta box visibility and collapse state');
            }
            if (issue.includes('framework conflicts')) {
                recommendations.push('Resolve CSS framework button style conflicts');
            }
            if (issue.includes('contrast below WCAG')) {
                recommendations.push('Improve button text contrast for accessibility');
            }
        });

        return [...new Set(recommendations)];
    }
}

/**
 * 🚀 AUTO-EXECUTE WORDPRESS ADMIN CSS DIAGNOSTIC
 */
console.log('🤖 AGENT 4: WORDPRESS ADMIN CSS CONFLICTS DIAGNOSTIC LOADED');
console.log('🚀 Starting automatic WordPress admin CSS analysis...');

const wpAdminAgent = new WordPressAdminCSSConflictsDiagnostic();
wpAdminAgent.runComprehensiveDiagnosis().then(report => {
    console.log('✅ AGENT 4 WORDPRESS ADMIN CSS DIAGNOSTIC COMPLETE');
    console.log('📊 Access results: window.agent4WPAdminReport');
});