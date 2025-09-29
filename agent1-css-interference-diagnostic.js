/**
 * 🤖 AGENT 1: CSS INTERFERENCE ANALYSIS SPECIALIST
 *
 * Comprehensive CSS diagnostic system for #design-preview-btn click interference
 * Analyzes pointer-events, z-index, opacity, positioning, and WordPress admin conflicts
 *
 * USAGE: Copy & paste into browser console on Order 5374 page
 */

class CSSInterferenceDiagnostic {
    constructor() {
        this.buttonId = 'design-preview-btn';
        this.diagnostics = {
            timestamp: new Date().toISOString(),
            cssInterference: {
                pointerEvents: null,
                zIndexConflicts: null,
                opacityIssues: null,
                positioningProblems: null,
                overlappingElements: null,
                wordPressConflicts: null
            },
            recommendations: [],
            criticalIssues: [],
            browserInfo: {
                userAgent: navigator.userAgent,
                viewport: {
                    width: window.innerWidth,
                    height: window.innerHeight
                }
            }
        };

        console.group('🎯 AGENT 1: CSS INTERFERENCE DIAGNOSTIC');
        console.log('Target:', this.buttonId);
        console.log('Browser:', this.diagnostics.browserInfo);
    }

    /**
     * 🔍 MAIN DIAGNOSTIC ENTRY POINT
     */
    async runComprehensiveDiagnosis() {
        const button = document.getElementById(this.buttonId);

        if (!button) {
            console.error('❌ Button not found in DOM');
            this.diagnostics.criticalIssues.push('CRITICAL: Button element not found');
            return this.generateReport();
        }

        console.log('✅ Button found, starting CSS analysis...');

        // Run all diagnostic modules
        await this.analyzePointerEvents(button);
        await this.analyzeZIndexConflicts(button);
        await this.analyzeOpacityVisibility(button);
        await this.analyzePositioning(button);
        await this.detectOverlappingElements(button);
        await this.checkWordPressConflicts(button);
        await this.performClickabilityTest(button);

        return this.generateReport();
    }

    /**
     * 🚫 POINTER EVENTS ANALYSIS
     */
    analyzePointerEvents(button) {
        console.group('🚫 POINTER EVENTS ANALYSIS');

        const pointerEventsAnalysis = {
            button: this.getComputedStyleProperty(button, 'pointer-events'),
            parents: [],
            blockingElements: []
        };

        // Check button itself
        if (pointerEventsAnalysis.button === 'none') {
            this.diagnostics.criticalIssues.push('CRITICAL: Button has pointer-events: none');
            console.error('❌ CRITICAL: Button has pointer-events: none');
        }

        // Check parent chain for pointer-events blocking
        let parent = button.parentElement;
        while (parent && parent !== document.body) {
            const pointerEvents = this.getComputedStyleProperty(parent, 'pointer-events');
            pointerEventsAnalysis.parents.push({
                element: this.getElementInfo(parent),
                pointerEvents: pointerEvents
            });

            if (pointerEvents === 'none') {
                this.diagnostics.criticalIssues.push(
                    `Parent element blocking clicks: ${parent.tagName}.${parent.className}`
                );
                console.warn('⚠️ Parent blocking pointer events:', parent);
            }

            parent = parent.parentElement;
        }

        // Check for overlapping elements with pointer-events: auto that might intercept
        const buttonRect = button.getBoundingClientRect();
        const elementsAtPosition = document.elementsFromPoint(
            buttonRect.left + buttonRect.width / 2,
            buttonRect.top + buttonRect.height / 2
        );

        elementsAtPosition.forEach((el, index) => {
            if (el !== button && index < 5) { // Check top 5 elements
                const pointerEvents = this.getComputedStyleProperty(el, 'pointer-events');
                pointerEventsAnalysis.blockingElements.push({
                    element: this.getElementInfo(el),
                    pointerEvents: pointerEvents,
                    zIndex: this.getComputedStyleProperty(el, 'z-index'),
                    position: this.getComputedStyleProperty(el, 'position')
                });
            }
        });

        this.diagnostics.cssInterference.pointerEvents = pointerEventsAnalysis;
        console.log('📊 Pointer Events Analysis:', pointerEventsAnalysis);
        console.groupEnd();
    }

    /**
     * 📐 Z-INDEX CONFLICT ANALYSIS
     */
    analyzeZIndexConflicts(button) {
        console.group('📐 Z-INDEX CONFLICT ANALYSIS');

        const buttonRect = button.getBoundingClientRect();
        const buttonZIndex = this.getComputedStyleProperty(button, 'z-index');
        const buttonPosition = this.getComputedStyleProperty(button, 'position');

        const zIndexAnalysis = {
            button: {
                zIndex: buttonZIndex,
                position: buttonPosition,
                computedZIndex: this.getEffectiveZIndex(button)
            },
            overlappingElements: [],
            stackingContexts: [],
            recommendations: []
        };

        // Find all positioned elements that might overlap
        const allPositionedElements = Array.from(document.querySelectorAll('*')).filter(el => {
            const position = this.getComputedStyleProperty(el, 'position');
            return ['absolute', 'fixed', 'relative', 'sticky'].includes(position);
        });

        allPositionedElements.forEach(el => {
            if (el !== button) {
                const rect = el.getBoundingClientRect();
                if (this.rectsOverlap(buttonRect, rect)) {
                    const elementZIndex = this.getComputedStyleProperty(el, 'z-index');
                    const effectiveZIndex = this.getEffectiveZIndex(el);

                    zIndexAnalysis.overlappingElements.push({
                        element: this.getElementInfo(el),
                        zIndex: elementZIndex,
                        effectiveZIndex: effectiveZIndex,
                        position: this.getComputedStyleProperty(el, 'position'),
                        coversButton: this.elementCoversButton(el, button),
                        rect: {
                            top: rect.top,
                            left: rect.left,
                            width: rect.width,
                            height: rect.height
                        }
                    });

                    // Check if this element is blocking the button
                    if (effectiveZIndex > zIndexAnalysis.button.computedZIndex &&
                        this.elementCoversButton(el, button)) {
                        this.diagnostics.criticalIssues.push(
                            `Element with higher z-index covering button: ${el.tagName}.${el.className} (z-index: ${effectiveZIndex})`
                        );
                        console.error('❌ Higher z-index element covering button:', el);
                    }
                }
            }
        });

        // Check for stacking contexts
        this.findStackingContexts(button, zIndexAnalysis.stackingContexts);

        // Generate recommendations
        if (zIndexAnalysis.overlappingElements.length > 0) {
            const maxOverlappingZIndex = Math.max(...zIndexAnalysis.overlappingElements.map(el => el.effectiveZIndex));
            if (maxOverlappingZIndex >= zIndexAnalysis.button.computedZIndex) {
                zIndexAnalysis.recommendations.push(
                    `Increase button z-index to ${maxOverlappingZIndex + 1} or higher`
                );
            }
        }

        this.diagnostics.cssInterference.zIndexConflicts = zIndexAnalysis;
        console.log('📊 Z-Index Analysis:', zIndexAnalysis);
        console.groupEnd();
    }

    /**
     * 👁️ OPACITY & VISIBILITY ANALYSIS
     */
    analyzeOpacityVisibility(button) {
        console.group('👁️ OPACITY & VISIBILITY ANALYSIS');

        const visibilityAnalysis = {
            button: {
                opacity: this.getComputedStyleProperty(button, 'opacity'),
                visibility: this.getComputedStyleProperty(button, 'visibility'),
                display: this.getComputedStyleProperty(button, 'display')
            },
            parentChain: [],
            hiddenStates: [],
            loadingStates: []
        };

        // Check button visibility
        if (parseFloat(visibilityAnalysis.button.opacity) < 0.1) {
            this.diagnostics.criticalIssues.push('Button opacity too low for interaction');
            console.warn('⚠️ Button opacity too low:', visibilityAnalysis.button.opacity);
        }

        if (visibilityAnalysis.button.visibility === 'hidden') {
            this.diagnostics.criticalIssues.push('Button visibility set to hidden');
            console.error('❌ Button visibility hidden');
        }

        if (visibilityAnalysis.button.display === 'none') {
            this.diagnostics.criticalIssues.push('Button display set to none');
            console.error('❌ Button display none');
        }

        // Check parent chain for inherited visibility issues
        let parent = button.parentElement;
        while (parent && parent !== document.body) {
            const parentVisibility = {
                element: this.getElementInfo(parent),
                opacity: this.getComputedStyleProperty(parent, 'opacity'),
                visibility: this.getComputedStyleProperty(parent, 'visibility'),
                display: this.getComputedStyleProperty(parent, 'display'),
                overflow: this.getComputedStyleProperty(parent, 'overflow')
            };

            visibilityAnalysis.parentChain.push(parentVisibility);

            // Check for problematic parent styles
            if (parseFloat(parentVisibility.opacity) < 0.1) {
                this.diagnostics.criticalIssues.push(
                    `Parent element too transparent: ${parent.tagName}.${parent.className}`
                );
            }

            if (parentVisibility.visibility === 'hidden' || parentVisibility.display === 'none') {
                this.diagnostics.criticalIssues.push(
                    `Parent element hidden: ${parent.tagName}.${parent.className}`
                );
            }

            parent = parent.parentElement;
        }

        // Check for loading states that might be affecting the button
        const loadingElements = document.querySelectorAll('.loading, [class*="loading"], [class*="spinner"]');
        loadingElements.forEach(el => {
            const rect = el.getBoundingClientRect();
            const buttonRect = button.getBoundingClientRect();

            if (this.rectsOverlap(rect, buttonRect)) {
                visibilityAnalysis.loadingStates.push({
                    element: this.getElementInfo(el),
                    opacity: this.getComputedStyleProperty(el, 'opacity'),
                    pointerEvents: this.getComputedStyleProperty(el, 'pointer-events'),
                    zIndex: this.getComputedStyleProperty(el, 'z-index')
                });
            }
        });

        this.diagnostics.cssInterference.opacityIssues = visibilityAnalysis;
        console.log('📊 Visibility Analysis:', visibilityAnalysis);
        console.groupEnd();
    }

    /**
     * 📍 POSITIONING & TRANSFORM ANALYSIS
     */
    analyzePositioning(button) {
        console.group('📍 POSITIONING & TRANSFORM ANALYSIS');

        const positionAnalysis = {
            button: {
                position: this.getComputedStyleProperty(button, 'position'),
                top: this.getComputedStyleProperty(button, 'top'),
                left: this.getComputedStyleProperty(button, 'left'),
                transform: this.getComputedStyleProperty(button, 'transform'),
                margin: {
                    top: this.getComputedStyleProperty(button, 'margin-top'),
                    left: this.getComputedStyleProperty(button, 'margin-left'),
                    right: this.getComputedStyleProperty(button, 'margin-right'),
                    bottom: this.getComputedStyleProperty(button, 'margin-bottom')
                }
            },
            expectedPosition: null,
            actualPosition: button.getBoundingClientRect(),
            transformIssues: [],
            positioningProblems: []
        };

        // Check for problematic transforms
        if (positionAnalysis.button.transform !== 'none') {
            console.log('🔄 Transform detected:', positionAnalysis.button.transform);

            // Check if transform moves button out of expected area
            if (positionAnalysis.button.transform.includes('translate')) {
                positionAnalysis.transformIssues.push({
                    type: 'translate',
                    value: positionAnalysis.button.transform,
                    warning: 'Transform may move button away from expected click area'
                });
            }

            if (positionAnalysis.button.transform.includes('scale(0)')) {
                this.diagnostics.criticalIssues.push('Button scaled to zero size');
                positionAnalysis.transformIssues.push({
                    type: 'scale_zero',
                    value: positionAnalysis.button.transform,
                    critical: true
                });
            }
        }

        // Check for absolute positioning that might place button outside viewport
        if (positionAnalysis.button.position === 'absolute' || positionAnalysis.button.position === 'fixed') {
            const rect = positionAnalysis.actualPosition;
            const viewport = {
                width: window.innerWidth,
                height: window.innerHeight
            };

            if (rect.left < 0 || rect.top < 0 ||
                rect.right > viewport.width || rect.bottom > viewport.height) {
                positionAnalysis.positioningProblems.push({
                    type: 'outside_viewport',
                    coordinates: rect,
                    viewport: viewport
                });

                this.diagnostics.criticalIssues.push('Button positioned outside viewport');
            }
        }

        // Check for negative margins that might hide the button
        Object.entries(positionAnalysis.button.margin).forEach(([side, value]) => {
            if (value.includes('-') && parseFloat(value) < -50) {
                positionAnalysis.positioningProblems.push({
                    type: 'negative_margin',
                    side: side,
                    value: value,
                    warning: 'Large negative margin may hide button'
                });
            }
        });

        this.diagnostics.cssInterference.positioningProblems = positionAnalysis;
        console.log('📊 Positioning Analysis:', positionAnalysis);
        console.groupEnd();
    }

    /**
     * 🎯 OVERLAPPING ELEMENTS DETECTION
     */
    detectOverlappingElements(button) {
        console.group('🎯 OVERLAPPING ELEMENTS DETECTION');

        const buttonRect = button.getBoundingClientRect();
        const overlappingAnalysis = {
            totalOverlapping: 0,
            criticalOverlaps: [],
            allOverlaps: [],
            clickPathBlocked: false
        };

        // Get all elements at button center point
        const centerX = buttonRect.left + buttonRect.width / 2;
        const centerY = buttonRect.top + buttonRect.height / 2;
        const elementsAtCenter = document.elementsFromPoint(centerX, centerY);

        console.log('🎯 Elements at button center:', elementsAtCenter);

        // Check each overlapping element
        elementsAtCenter.forEach((el, index) => {
            if (el !== button) {
                const elementInfo = {
                    element: this.getElementInfo(el),
                    stackOrder: index,
                    zIndex: this.getComputedStyleProperty(el, 'z-index'),
                    position: this.getComputedStyleProperty(el, 'position'),
                    pointerEvents: this.getComputedStyleProperty(el, 'pointer-events'),
                    opacity: this.getComputedStyleProperty(el, 'opacity'),
                    blocksClicks: false
                };

                // Determine if this element blocks clicks
                if (elementInfo.pointerEvents !== 'none' &&
                    parseFloat(elementInfo.opacity) > 0.1 &&
                    index < elementsAtCenter.indexOf(button)) {
                    elementInfo.blocksClicks = true;
                    overlappingAnalysis.criticalOverlaps.push(elementInfo);
                    overlappingAnalysis.clickPathBlocked = true;

                    console.error('❌ Click-blocking element:', el);
                }

                overlappingAnalysis.allOverlaps.push(elementInfo);
            }
        });

        overlappingAnalysis.totalOverlapping = overlappingAnalysis.allOverlaps.length;

        this.diagnostics.cssInterference.overlappingElements = overlappingAnalysis;
        console.log('📊 Overlapping Elements Analysis:', overlappingAnalysis);
        console.groupEnd();
    }

    /**
     * 🌐 WORDPRESS ADMIN CSS CONFLICTS
     */
    checkWordPressConflicts(button) {
        console.group('🌐 WORDPRESS ADMIN CSS CONFLICTS');

        const wpConflictAnalysis = {
            adminContext: window.location.href.includes('/wp-admin/'),
            adminBodyClass: document.body.className.includes('wp-admin'),
            conflictingStyles: [],
            modalInterference: [],
            adminBarIssues: []
        };

        // Check for WordPress admin bar interference
        const adminBar = document.getElementById('wpadminbar');
        if (adminBar) {
            const adminBarRect = adminBar.getBoundingClientRect();
            const buttonRect = button.getBoundingClientRect();

            if (this.rectsOverlap(adminBarRect, buttonRect)) {
                wpConflictAnalysis.adminBarIssues.push({
                    type: 'adminbar_overlap',
                    adminBarHeight: adminBarRect.height,
                    adminBarZIndex: this.getComputedStyleProperty(adminBar, 'z-index')
                });
            }
        }

        // Check for WooCommerce modal interference
        const wcModals = document.querySelectorAll('.wc-modal, .woocommerce-modal, [class*="modal"]');
        wcModals.forEach(modal => {
            const modalRect = modal.getBoundingClientRect();
            const buttonRect = button.getBoundingClientRect();

            if (this.rectsOverlap(modalRect, buttonRect)) {
                wpConflictAnalysis.modalInterference.push({
                    modal: this.getElementInfo(modal),
                    zIndex: this.getComputedStyleProperty(modal, 'z-index'),
                    display: this.getComputedStyleProperty(modal, 'display'),
                    position: this.getComputedStyleProperty(modal, 'position')
                });
            }
        });

        this.diagnostics.cssInterference.wordPressConflicts = wpConflictAnalysis;
        console.log('📊 WordPress Conflicts Analysis:', wpConflictAnalysis);
        console.groupEnd();
    }

    /**
     * 🖱️ CLICKABILITY TEST
     */
    performClickabilityTest(button) {
        console.group('🖱️ CLICKABILITY TEST');

        const clickabilityTest = {
            syntheticClickWorks: false,
            elementAtClick: null,
            clickCoordinates: null,
            eventPropagation: {
                mousedown: false,
                mouseup: false,
                click: false
            }
        };

        // Get button position for click simulation
        const rect = button.getBoundingClientRect();
        const clickX = rect.left + rect.width / 2;
        const clickY = rect.top + rect.height / 2;

        clickabilityTest.clickCoordinates = { x: clickX, y: clickY };

        // Check what element is actually at the click position
        const elementAtClick = document.elementFromPoint(clickX, clickY);
        clickabilityTest.elementAtClick = elementAtClick === button ? 'BUTTON' : this.getElementInfo(elementAtClick);

        if (elementAtClick !== button) {
            this.diagnostics.criticalIssues.push(
                `Different element at click position: ${elementAtClick.tagName}.${elementAtClick.className}`
            );
            console.error('❌ Wrong element at click position:', elementAtClick);
        }

        this.diagnostics.clickabilityTest = clickabilityTest;
        console.log('📊 Clickability Test Results:', clickabilityTest);
        console.groupEnd();
    }

    /**
     * 📋 GENERATE COMPREHENSIVE REPORT
     */
    generateReport() {
        console.group('📋 CSS INTERFERENCE DIAGNOSTIC REPORT');

        const report = {
            ...this.diagnostics,
            summary: {
                totalIssues: this.diagnostics.criticalIssues.length,
                severity: this.calculateSeverity(),
                quickFixes: this.generateQuickFixes(),
                cssRecommendations: this.generateCSSRecommendations()
            }
        };

        // Log summary
        console.log('🔍 DIAGNOSTIC SUMMARY:');
        console.log(`Total Critical Issues: ${report.summary.totalIssues}`);
        console.log(`Severity Level: ${report.summary.severity}`);
        console.log('Critical Issues:', this.diagnostics.criticalIssues);

        if (report.summary.quickFixes.length > 0) {
            console.log('🔧 QUICK FIXES:');
            report.summary.quickFixes.forEach(fix => console.log(`- ${fix}`));
        }

        console.groupEnd();
        console.groupEnd(); // End main diagnostic group

        // Store globally
        window.agent1CSSReport = report;
        console.log('📊 Report stored in: window.agent1CSSReport');

        return report;
    }

    /**
     * 🛠️ UTILITY METHODS
     */
    getComputedStyleProperty(element, property) {
        return window.getComputedStyle(element).getPropertyValue(property);
    }

    getElementInfo(element) {
        return {
            tagName: element.tagName,
            id: element.id,
            className: element.className,
            dataset: Object.assign({}, element.dataset)
        };
    }

    getEffectiveZIndex(element) {
        let current = element;
        let effectiveZIndex = 0;

        while (current && current !== document.body) {
            const zIndex = this.getComputedStyleProperty(current, 'z-index');
            const position = this.getComputedStyleProperty(current, 'position');

            if (zIndex !== 'auto' && ['relative', 'absolute', 'fixed', 'sticky'].includes(position)) {
                effectiveZIndex = Math.max(effectiveZIndex, parseInt(zIndex, 10) || 0);
            }

            current = current.parentElement;
        }

        return effectiveZIndex;
    }

    rectsOverlap(rect1, rect2) {
        return !(rect1.right < rect2.left ||
                rect2.right < rect1.left ||
                rect1.bottom < rect2.top ||
                rect2.bottom < rect1.top);
    }

    elementCoversButton(element, button) {
        const elemRect = element.getBoundingClientRect();
        const buttonRect = button.getBoundingClientRect();

        return elemRect.left <= buttonRect.left &&
               elemRect.top <= buttonRect.top &&
               elemRect.right >= buttonRect.right &&
               elemRect.bottom >= buttonRect.bottom;
    }

    findStackingContexts(element, contexts) {
        let current = element.parentElement;

        while (current && current !== document.body) {
            const transform = this.getComputedStyleProperty(current, 'transform');
            const opacity = this.getComputedStyleProperty(current, 'opacity');
            const position = this.getComputedStyleProperty(current, 'position');
            const zIndex = this.getComputedStyleProperty(current, 'z-index');

            if (transform !== 'none' ||
                parseFloat(opacity) < 1 ||
                (zIndex !== 'auto' && ['relative', 'absolute', 'fixed'].includes(position))) {

                contexts.push({
                    element: this.getElementInfo(current),
                    reason: this.getStackingContextReason(current)
                });
            }

            current = current.parentElement;
        }
    }

    getStackingContextReason(element) {
        const reasons = [];
        const transform = this.getComputedStyleProperty(element, 'transform');
        const opacity = this.getComputedStyleProperty(element, 'opacity');
        const position = this.getComputedStyleProperty(element, 'position');
        const zIndex = this.getComputedStyleProperty(element, 'z-index');

        if (transform !== 'none') reasons.push('transform');
        if (parseFloat(opacity) < 1) reasons.push('opacity');
        if (zIndex !== 'auto' && ['relative', 'absolute', 'fixed'].includes(position)) {
            reasons.push('positioned-with-z-index');
        }

        return reasons.join(', ');
    }

    calculateSeverity() {
        const issueCount = this.diagnostics.criticalIssues.length;
        if (issueCount === 0) return 'NONE';
        if (issueCount <= 2) return 'LOW';
        if (issueCount <= 5) return 'MEDIUM';
        return 'HIGH';
    }

    generateQuickFixes() {
        const fixes = [];

        this.diagnostics.criticalIssues.forEach(issue => {
            if (issue.includes('pointer-events: none')) {
                fixes.push('Remove pointer-events: none from button or parent elements');
            }
            if (issue.includes('z-index')) {
                fixes.push('Increase button z-index to bring it above overlapping elements');
            }
            if (issue.includes('opacity')) {
                fixes.push('Increase opacity to 1.0 for full visibility');
            }
            if (issue.includes('visibility')) {
                fixes.push('Set visibility: visible on button and parents');
            }
        });

        return [...new Set(fixes)]; // Remove duplicates
    }

    generateCSSRecommendations() {
        const recommendations = [];

        if (this.diagnostics.cssInterference.pointerEvents?.blockingElements?.length > 0) {
            recommendations.push(`#${this.buttonId} { pointer-events: auto !important; z-index: 9999; }`);
        }

        return recommendations;
    }
}

/**
 * 🚀 AUTO-EXECUTE CSS DIAGNOSTIC
 */
console.log('🤖 AGENT 1: CSS INTERFERENCE DIAGNOSTIC LOADED');
console.log('🚀 Starting automatic CSS analysis...');

const cssAgent = new CSSInterferenceDiagnostic();
cssAgent.runComprehensiveDiagnosis().then(report => {
    console.log('✅ AGENT 1 CSS DIAGNOSTIC COMPLETE');
    console.log('📊 Access results: window.agent1CSSReport');
});