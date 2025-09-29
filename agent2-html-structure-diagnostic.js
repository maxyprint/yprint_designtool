/**
 * 🤖 AGENT 2: HTML STRUCTURE DIAGNOSTIC SPECIALIST
 *
 * Comprehensive DOM hierarchy and structure diagnostic for #design-preview-btn
 * Analyzes DOM issues, event delegation conflicts, duplicate IDs, and structural problems
 *
 * USAGE: Copy & paste into browser console on Order 5374 page
 */

class HTMLStructureDiagnostic {
    constructor() {
        this.buttonId = 'design-preview-btn';
        this.diagnostics = {
            timestamp: new Date().toISOString(),
            htmlStructure: {
                domHierarchy: null,
                duplicateElements: null,
                eventDelegation: null,
                formStructure: null,
                dynamicContent: null,
                wordPressIntegration: null
            },
            criticalIssues: [],
            recommendations: []
        };

        console.group('🤖 AGENT 2: HTML STRUCTURE DIAGNOSTIC');
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
            this.diagnostics.criticalIssues.push('CRITICAL: Button element not found in DOM');
            await this.analyzeMissingButton();
            return this.generateReport();
        }

        console.log('✅ Button found, starting HTML structure analysis...');

        // Run all diagnostic modules
        await this.analyzeDOMHierarchy(button);
        await this.checkDuplicateElements();
        await this.analyzeEventDelegation(button);
        await this.validateFormStructure(button);
        await this.checkDynamicContent(button);
        await this.analyzeWordPressIntegration(button);
        await this.performStructuralTests(button);

        return this.generateReport();
    }

    /**
     * 🏗️ DOM HIERARCHY ANALYSIS
     */
    analyzeDOMHierarchy(button) {
        console.group('🏗️ DOM HIERARCHY ANALYSIS');

        const hierarchyAnalysis = {
            buttonPath: this.getDOMPath(button),
            parentChain: this.getParentChain(button),
            siblingElements: this.analyzeSiblings(button),
            nesting: this.analyzeNesting(button),
            semanticStructure: this.analyzeSemanticStructure(button)
        };

        // Check for problematic nesting
        const formParents = hierarchyAnalysis.parentChain.filter(parent =>
            parent.tagName === 'FORM'
        );

        if (formParents.length > 1) {
            this.diagnostics.criticalIssues.push('Button nested in multiple forms');
            console.error('❌ Button nested in multiple forms');
        }

        // Check for event delegation containers
        const eventContainers = hierarchyAnalysis.parentChain.filter(parent =>
            this.hasEventHandlers(parent.element)
        );

        if (eventContainers.length > 0) {
            console.log('📡 Event delegation containers found:', eventContainers);
        }

        // Check for WordPress meta box structure
        const metaBoxParent = hierarchyAnalysis.parentChain.find(parent =>
            parent.className && parent.className.includes('postbox')
        );

        if (metaBoxParent) {
            console.log('📦 WordPress meta box structure detected');
            hierarchyAnalysis.wordPressMetaBox = true;
        }

        this.diagnostics.htmlStructure.domHierarchy = hierarchyAnalysis;
        console.log('📊 DOM Hierarchy Analysis:', hierarchyAnalysis);
        console.groupEnd();
    }

    /**
     * 🔄 DUPLICATE ELEMENTS CHECK
     */
    checkDuplicateElements() {
        console.group('🔄 DUPLICATE ELEMENTS CHECK');

        const duplicateAnalysis = {
            duplicateIds: this.findDuplicateIds(),
            similarButtons: this.findSimilarButtons(),
            conflictingElements: []
        };

        // Check for duplicate button IDs
        const buttonsWithSameId = document.querySelectorAll(`#${this.buttonId}`);
        if (buttonsWithSameId.length > 1) {
            this.diagnostics.criticalIssues.push(`Multiple elements with ID '${this.buttonId}' found`);
            console.error(`❌ ${buttonsWithSameId.length} elements with same ID found:`, buttonsWithSameId);

            duplicateAnalysis.duplicateIds.push({
                id: this.buttonId,
                count: buttonsWithSameId.length,
                elements: Array.from(buttonsWithSameId).map(el => this.getElementInfo(el))
            });
        }

        // Check for similar buttons that might conflict
        const similarButtons = document.querySelectorAll('button[class*="preview"], input[class*="preview"]');
        if (similarButtons.length > 1) {
            console.warn('⚠️ Multiple preview buttons found:', similarButtons);
            duplicateAnalysis.similarButtons = Array.from(similarButtons).map(el => this.getElementInfo(el));
        }

        this.diagnostics.htmlStructure.duplicateElements = duplicateAnalysis;
        console.log('📊 Duplicate Elements Analysis:', duplicateAnalysis);
        console.groupEnd();
    }

    /**
     * 📡 EVENT DELEGATION ANALYSIS
     */
    analyzeEventDelegation(button) {
        console.group('📡 EVENT DELEGATION ANALYSIS');

        const delegationAnalysis = {
            delegationContainers: [],
            eventHandlers: this.getEventHandlers(button),
            propagationPath: this.getEventPropagationPath(button),
            conflictingHandlers: []
        };

        // Find potential event delegation containers
        let current = button.parentElement;
        while (current && current !== document.body) {
            const hasHandlers = this.hasEventHandlers(current);
            const isContainer = current.hasAttribute('data-container') ||
                              current.classList.contains('container') ||
                              current.classList.contains('wrapper');

            if (hasHandlers || isContainer) {
                delegationAnalysis.delegationContainers.push({
                    element: this.getElementInfo(current),
                    hasEventHandlers: hasHandlers,
                    isContainer: isContainer,
                    depth: this.getElementDepth(current, button)
                });
            }

            current = current.parentElement;
        }

        // Check for event handler conflicts
        const conflictingSelectors = [
            'button', '.button', '[type="button"]', '.btn',
            '.design-preview-btn', '[data-order-id]'
        ];

        conflictingSelectors.forEach(selector => {
            try {
                const elements = document.querySelectorAll(selector);
                if (elements.length > 1 && Array.from(elements).includes(button)) {
                    delegationAnalysis.conflictingHandlers.push({
                        selector: selector,
                        elementCount: elements.length,
                        includesTargetButton: true
                    });
                }
            } catch (e) {
                console.warn('Invalid selector:', selector);
            }
        });

        this.diagnostics.htmlStructure.eventDelegation = delegationAnalysis;
        console.log('📊 Event Delegation Analysis:', delegationAnalysis);
        console.groupEnd();
    }

    /**
     * 📋 FORM STRUCTURE VALIDATION
     */
    validateFormStructure(button) {
        console.group('📋 FORM STRUCTURE VALIDATION');

        const formAnalysis = {
            parentForm: null,
            formAttributes: {},
            submitBehavior: null,
            validationIssues: []
        };

        // Find parent form
        const parentForm = button.closest('form');
        if (parentForm) {
            formAnalysis.parentForm = {
                element: this.getElementInfo(parentForm),
                action: parentForm.action,
                method: parentForm.method,
                enctype: parentForm.enctype,
                hasValidation: parentForm.noValidate !== undefined
            };

            // Check for form submission conflicts
            if (!button.hasAttribute('type') || button.getAttribute('type') === 'submit') {
                formAnalysis.validationIssues.push('Button may trigger form submission');
                console.warn('⚠️ Button may trigger unwanted form submission');
            }

            // Check for required fields that might prevent button interaction
            const requiredFields = parentForm.querySelectorAll('[required]');
            if (requiredFields.length > 0) {
                formAnalysis.validationIssues.push(`Form has ${requiredFields.length} required fields`);
            }
        }

        // Check for nested form issues
        const allForms = document.querySelectorAll('form');
        let buttonInNestedForm = false;
        allForms.forEach(form => {
            if (form !== parentForm && form.contains(button)) {
                buttonInNestedForm = true;
                formAnalysis.validationIssues.push('Button in nested form structure');
                console.error('❌ Button in nested form - this can cause issues');
            }
        });

        this.diagnostics.htmlStructure.formStructure = formAnalysis;
        console.log('📊 Form Structure Analysis:', formAnalysis);
        console.groupEnd();
    }

    /**
     * ⚡ DYNAMIC CONTENT ANALYSIS
     */
    checkDynamicContent(button) {
        console.group('⚡ DYNAMIC CONTENT ANALYSIS');

        const dynamicAnalysis = {
            isDynamic: this.isDynamicallyGenerated(button),
            loadingStates: this.checkLoadingStates(button),
            ajaxContainers: this.findAjaxContainers(button),
            mutations: this.setupMutationObserver(button)
        };

        // Check if button appears to be dynamically generated
        if (dynamicAnalysis.isDynamic) {
            console.log('🔄 Button appears to be dynamically generated');

            // Check timing issues
            const readyState = document.readyState;
            const jQueryReady = typeof jQuery !== 'undefined' && jQuery.isReady;

            if (readyState !== 'complete' || !jQueryReady) {
                dynamicAnalysis.loadingStates.push({
                    issue: 'Document/jQuery not fully ready',
                    documentReady: readyState,
                    jQueryReady: jQueryReady
                });
                console.warn('⚠️ Timing issue: Document/jQuery not fully ready');
            }
        }

        // Check for AJAX loading containers
        const ajaxContainers = button.closest('.ajax-container, [data-ajax], .dynamic-content');
        if (ajaxContainers) {
            dynamicAnalysis.ajaxContainers = this.getElementInfo(ajaxContainers);
            console.log('🌐 AJAX container detected:', ajaxContainers);
        }

        this.diagnostics.htmlStructure.dynamicContent = dynamicAnalysis;
        console.log('📊 Dynamic Content Analysis:', dynamicAnalysis);
        console.groupEnd();
    }

    /**
     * 🌐 WORDPRESS INTEGRATION ANALYSIS
     */
    analyzeWordPressIntegration(button) {
        console.group('🌐 WORDPRESS INTEGRATION ANALYSIS');

        const wpAnalysis = {
            adminContext: window.location.href.includes('/wp-admin/'),
            metaBoxStructure: null,
            hookIntegration: null,
            wooCommerceIntegration: null
        };

        // Check WordPress admin context
        if (wpAnalysis.adminContext) {
            console.log('✅ WordPress admin context detected');

            // Check for meta box structure
            const metaBox = button.closest('.postbox, .meta-box-sortables');
            if (metaBox) {
                wpAnalysis.metaBoxStructure = {
                    element: this.getElementInfo(metaBox),
                    isCollapsible: metaBox.classList.contains('closed'),
                    hasHandle: !!metaBox.querySelector('.hndle, .handlediv')
                };
            }

            // Check for WooCommerce order page
            if (window.location.href.includes('page=wc-orders')) {
                wpAnalysis.wooCommerceIntegration = {
                    orderPage: true,
                    orderId: new URLSearchParams(window.location.search).get('id'),
                    isEditPage: window.location.href.includes('action=edit')
                };
                console.log('🛒 WooCommerce order page detected');
            }
        }

        // Check for WordPress hooks integration
        const designSection = document.getElementById('design-preview-section');
        if (designSection) {
            wpAnalysis.hookIntegration = {
                sectionExists: true,
                parentContainer: this.getElementInfo(designSection.parentElement),
                hookLocation: this.identifyHookLocation(designSection)
            };
        }

        this.diagnostics.htmlStructure.wordPressIntegration = wpAnalysis;
        console.log('📊 WordPress Integration Analysis:', wpAnalysis);
        console.groupEnd();
    }

    /**
     * 🧪 STRUCTURAL TESTS
     */
    performStructuralTests(button) {
        console.group('🧪 STRUCTURAL TESTS');

        const structuralTests = {
            accessibility: this.testAccessibility(button),
            semantics: this.testSemantics(button),
            validation: this.testHTMLValidation(button)
        };

        // Test button accessibility
        const accessibilityIssues = [];

        if (!button.hasAttribute('aria-label') && !button.textContent.trim()) {
            accessibilityIssues.push('Button lacks accessible label');
        }

        if (button.disabled && !button.hasAttribute('aria-disabled')) {
            accessibilityIssues.push('Disabled button missing aria-disabled attribute');
        }

        if (!button.hasAttribute('type')) {
            accessibilityIssues.push('Button missing type attribute');
        }

        structuralTests.accessibility = accessibilityIssues;

        // Log issues
        if (accessibilityIssues.length > 0) {
            console.warn('⚠️ Accessibility issues found:', accessibilityIssues);
        }

        console.log('📊 Structural Tests:', structuralTests);
        console.groupEnd();
    }

    /**
     * 🔍 MISSING BUTTON ANALYSIS
     */
    async analyzeMissingButton() {
        console.group('🔍 MISSING BUTTON ANALYSIS');

        const missingAnalysis = {
            expectedLocation: null,
            designSection: null,
            possibleCauses: []
        };

        // Check for design preview section
        const designSection = document.getElementById('design-preview-section');
        if (designSection) {
            missingAnalysis.designSection = {
                exists: true,
                innerHTML: designSection.innerHTML.substring(0, 200) + '...',
                hasButton: designSection.querySelector(`#${this.buttonId}`) !== null
            };
            console.log('📦 Design section found but button missing');
        } else {
            missingAnalysis.designSection = { exists: false };
            missingAnalysis.possibleCauses.push('Design preview section not rendered');
            console.error('❌ Design preview section not found');
        }

        // Check for similar buttons
        const similarButtons = document.querySelectorAll('button[class*="design"], button[class*="preview"]');
        if (similarButtons.length > 0) {
            missingAnalysis.possibleCauses.push('Similar buttons found - possible ID/class mismatch');
            console.log('🔍 Similar buttons found:', similarButtons);
        }

        console.log('📊 Missing Button Analysis:', missingAnalysis);
        console.groupEnd();
    }

    /**
     * 🛠️ UTILITY METHODS
     */
    getDOMPath(element) {
        const path = [];
        let current = element;

        while (current && current !== document.body) {
            let selector = current.tagName.toLowerCase();

            if (current.id) {
                selector += '#' + current.id;
            } else if (current.className) {
                selector += '.' + current.className.trim().split(/\s+/).join('.');
            }

            path.unshift(selector);
            current = current.parentElement;
        }

        return path.join(' > ');
    }

    getParentChain(element) {
        const chain = [];
        let current = element.parentElement;

        while (current && current !== document.body) {
            chain.push({
                element: current,
                tagName: current.tagName,
                id: current.id,
                className: current.className,
                depth: chain.length
            });
            current = current.parentElement;
        }

        return chain;
    }

    analyzeSiblings(element) {
        const parent = element.parentElement;
        if (!parent) return [];

        return Array.from(parent.children)
            .filter(child => child !== element)
            .map(sibling => this.getElementInfo(sibling));
    }

    analyzeNesting(element) {
        let depth = 0;
        let current = element.parentElement;

        while (current && current !== document.body) {
            depth++;
            current = current.parentElement;
        }

        return { depth, excessive: depth > 15 };
    }

    analyzeSemanticStructure(element) {
        const semanticParents = [];
        let current = element.parentElement;

        const semanticTags = ['main', 'section', 'article', 'aside', 'nav', 'header', 'footer'];

        while (current && current !== document.body) {
            if (semanticTags.includes(current.tagName.toLowerCase())) {
                semanticParents.push({
                    tagName: current.tagName.toLowerCase(),
                    role: current.getAttribute('role')
                });
            }
            current = current.parentElement;
        }

        return semanticParents;
    }

    findDuplicateIds() {
        const allIds = {};
        const duplicates = [];

        document.querySelectorAll('[id]').forEach(element => {
            const id = element.id;
            if (allIds[id]) {
                allIds[id].push(element);
            } else {
                allIds[id] = [element];
            }
        });

        Object.entries(allIds).forEach(([id, elements]) => {
            if (elements.length > 1) {
                duplicates.push({ id, count: elements.length, elements });
            }
        });

        return duplicates;
    }

    findSimilarButtons() {
        return Array.from(document.querySelectorAll('button, input[type="button"], input[type="submit"]'))
            .filter(btn => btn.id !== this.buttonId)
            .map(btn => this.getElementInfo(btn));
    }

    hasEventHandlers(element) {
        // Check for common event handler attributes
        const eventAttrs = ['onclick', 'onmousedown', 'onmouseup', 'ontouchstart', 'ontouchend'];

        for (let attr of eventAttrs) {
            if (element.hasAttribute(attr)) return true;
        }

        // Check for jQuery events (if available)
        if (typeof jQuery !== 'undefined' && jQuery._data) {
            const events = jQuery._data(element, 'events');
            if (events && Object.keys(events).length > 0) return true;
        }

        return false;
    }

    getEventHandlers(element) {
        const handlers = {
            inline: {},
            jquery: null,
            native: []
        };

        // Check inline handlers
        const eventAttrs = ['onclick', 'onmousedown', 'onmouseup'];
        eventAttrs.forEach(attr => {
            if (element.hasAttribute(attr)) {
                handlers.inline[attr] = element.getAttribute(attr);
            }
        });

        // Check jQuery handlers
        if (typeof jQuery !== 'undefined' && jQuery._data) {
            handlers.jquery = jQuery._data(element, 'events');
        }

        return handlers;
    }

    getEventPropagationPath(element) {
        const path = [];
        let current = element;

        while (current && current !== document) {
            if (this.hasEventHandlers(current)) {
                path.push(this.getElementInfo(current));
            }
            current = current.parentElement;
        }

        return path;
    }

    getElementDepth(ancestor, descendant) {
        let depth = 0;
        let current = descendant;

        while (current && current !== ancestor && current !== document.body) {
            depth++;
            current = current.parentElement;
        }

        return current === ancestor ? depth : -1;
    }

    isDynamicallyGenerated(element) {
        // Check if element was likely added via JavaScript
        const parent = element.parentElement;
        if (!parent) return false;

        // Check for AJAX containers or dynamic content markers
        const dynamicMarkers = ['ajax', 'dynamic', 'loaded', 'generated'];
        const parentClasses = parent.className.toLowerCase();

        return dynamicMarkers.some(marker => parentClasses.includes(marker));
    }

    checkLoadingStates(element) {
        const loadingStates = [];

        // Check document ready state
        if (document.readyState !== 'complete') {
            loadingStates.push({ type: 'document', state: document.readyState });
        }

        // Check jQuery ready state
        if (typeof jQuery !== 'undefined' && !jQuery.isReady) {
            loadingStates.push({ type: 'jquery', ready: false });
        }

        return loadingStates;
    }

    findAjaxContainers(element) {
        const ajaxSelectors = ['.ajax-container', '[data-ajax]', '.dynamic-content', '.loading'];
        const containers = [];

        ajaxSelectors.forEach(selector => {
            const container = element.closest(selector);
            if (container) {
                containers.push({
                    selector,
                    element: this.getElementInfo(container)
                });
            }
        });

        return containers;
    }

    setupMutationObserver(element) {
        // This would set up a mutation observer to watch for changes
        // For diagnostic purposes, we just report if one could be useful
        return {
            recommended: true,
            reason: 'To track dynamic changes to button or parent elements'
        };
    }

    identifyHookLocation(element) {
        // Try to identify which WordPress hook this element might be from
        const parent = element.parentElement;
        if (!parent) return 'unknown';

        if (parent.id && parent.id.includes('order')) {
            return 'woocommerce_admin_order_data_after_order_details';
        }

        return 'unknown';
    }

    testAccessibility(element) {
        const issues = [];

        if (!element.hasAttribute('aria-label') && !element.textContent.trim()) {
            issues.push('Missing accessible label');
        }

        if (element.disabled && !element.hasAttribute('aria-disabled')) {
            issues.push('Missing aria-disabled attribute');
        }

        return issues;
    }

    testSemantics(element) {
        const issues = [];

        if (!element.hasAttribute('type')) {
            issues.push('Button missing type attribute');
        }

        if (element.textContent.trim() === '') {
            issues.push('Button has no text content');
        }

        return issues;
    }

    testHTMLValidation(element) {
        // Basic HTML validation checks
        const issues = [];

        // Check for required attributes
        if (element.tagName === 'BUTTON' && !element.hasAttribute('type')) {
            issues.push('Button element missing type attribute');
        }

        return issues;
    }

    getElementInfo(element) {
        return {
            tagName: element.tagName,
            id: element.id,
            className: element.className,
            attributes: Array.from(element.attributes).reduce((acc, attr) => {
                acc[attr.name] = attr.value;
                return acc;
            }, {})
        };
    }

    /**
     * 📋 GENERATE COMPREHENSIVE REPORT
     */
    generateReport() {
        console.group('📋 HTML STRUCTURE DIAGNOSTIC REPORT');

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
        window.agent2HTMLReport = report;
        console.log('📊 Report stored in: window.agent2HTMLReport');

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
            if (issue.includes('Multiple elements with ID')) {
                recommendations.push('Ensure unique IDs across all elements');
            }
            if (issue.includes('nested in multiple forms')) {
                recommendations.push('Fix form nesting structure');
            }
            if (issue.includes('not found in DOM')) {
                recommendations.push('Check WordPress hook integration and plugin activation');
            }
        });

        return [...new Set(recommendations)];
    }
}

/**
 * 🚀 AUTO-EXECUTE HTML STRUCTURE DIAGNOSTIC
 */
console.log('🤖 AGENT 2: HTML STRUCTURE DIAGNOSTIC LOADED');
console.log('🚀 Starting automatic HTML structure analysis...');

const htmlAgent = new HTMLStructureDiagnostic();
htmlAgent.runComprehensiveDiagnosis().then(report => {
    console.log('✅ AGENT 2 HTML STRUCTURE DIAGNOSTIC COMPLETE');
    console.log('📊 Access results: window.agent2HTMLReport');
});