/**
 * 🎯 Admin Preview Integration - WooCommerce Admin Integration
 *
 * Integrates the design preview system into WooCommerce admin
 * Handles meta field detection, automatic preview generation, and admin UI
 *
 * Pure vanilla JavaScript - NO jQuery dependency
 */

class AdminPreviewIntegration {
    constructor() {
        this.previewGenerator = null;
        this.initialized = false;
        this.previewContainer = null;
        this.observers = [];
        this.previewInstances = new Map();

        // Configuration
        this.config = {
            metaFieldSelectors: [
                '#design_json_data',
                '#octo_print_designer_json',
                '#canvas_design_data',
                'textarea[name*="design"]',
                'input[name*="canvas_data"]'
            ],
            containerClass: 'admin-design-preview',
            autoPreviewDelay: 500,
            enableAutoPreview: true
        };
    }

    /**
     * Initialize the admin integration
     * @param {Object} options - Configuration options
     */
    init(options = {}) {
        console.log('🎯 ADMIN INTEGRATION: Initializing...');

        // Merge configuration
        this.config = {...this.config, ...options};

        // Check if we're in admin context
        if (!this.isAdminContext()) {
            console.log('⚠️ ADMIN INTEGRATION: Not in admin context, skipping initialization');
            return false;
        }

        // Wait for DOM ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupIntegration());
        } else {
            this.setupIntegration();
        }

        return true;
    }

    /**
     * Check if we're in WordPress admin context
     * @returns {boolean}
     */
    isAdminContext() {
        // Check for admin body class or admin URL patterns
        return (
            document.body.classList.contains('wp-admin') ||
            window.location.pathname.includes('/wp-admin/') ||
            document.getElementById('wpadminbar') !== null ||
            window.pagenow !== undefined
        );
    }

    /**
     * Setup the integration after DOM is ready
     */
    setupIntegration() {
        console.log('🎯 SETTING UP ADMIN INTEGRATION...');

        try {
            // Find meta fields
            this.detectMetaFields();

            // Setup preview containers
            this.createPreviewContainers();

            // Setup event listeners
            this.setupEventListeners();

            // Setup mutation observers for dynamic content
            this.setupObservers();

            // Initial preview generation
            this.generateInitialPreviews();

            this.initialized = true;
            console.log('✅ ADMIN INTEGRATION: Setup complete');

            // Trigger ready event
            this.triggerEvent('adminPreviewReady', {
                integration: this,
                metaFields: this.detectedMetaFields || []
            });

        } catch (error) {
            console.error('❌ ADMIN INTEGRATION SETUP ERROR:', error);
        }
    }

    /**
     * Detect design meta fields in the page
     */
    detectMetaFields() {
        this.detectedMetaFields = [];

        this.config.metaFieldSelectors.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(element => {
                if (element.value && this.looksLikeDesignData(element.value)) {
                    this.detectedMetaFields.push({
                        element: element,
                        selector: selector,
                        containsData: true
                    });
                    console.log('✅ META FIELD DETECTED:', selector);
                }
            });
        });

        console.log(`📊 DETECTED ${this.detectedMetaFields.length} meta fields with design data`);
        return this.detectedMetaFields;
    }

    /**
     * Check if text looks like design data
     * @param {string} text - Text to check
     * @returns {boolean}
     */
    looksLikeDesignData(text) {
        if (!text || typeof text !== 'string') return false;

        try {
            const data = JSON.parse(text);

            // Check for typical design data structure
            return (
                typeof data === 'object' &&
                data !== null &&
                (
                    // Check for view-based structure
                    Object.values(data).some(view => view && view.images && Array.isArray(view.images)) ||
                    // Check for direct images array
                    (data.images && Array.isArray(data.images))
                )
            );
        } catch (e) {
            return false;
        }
    }

    /**
     * Create preview containers for detected meta fields
     */
    createPreviewContainers() {
        this.detectedMetaFields.forEach((metaField, index) => {
            const containerId = `admin-preview-${index}`;
            const container = this.createPreviewContainer(containerId, metaField);

            // Insert container near the meta field
            this.insertPreviewContainer(metaField.element, container);

            // Create preview generator instance
            const previewGen = new window.DesignPreviewGenerator();
            if (previewGen.init(containerId)) {
                this.previewInstances.set(containerId, {
                    generator: previewGen,
                    metaField: metaField,
                    container: container
                });
            }
        });
    }

    /**
     * Create a preview container element
     * @param {string} containerId - Container ID
     * @param {Object} metaField - Meta field info
     * @returns {HTMLElement}
     */
    createPreviewContainer(containerId, metaField) {
        const wrapper = document.createElement('div');
        wrapper.className = 'admin-design-preview-wrapper';
        wrapper.style.cssText = `
            margin: 15px 0;
            padding: 15px;
            border: 1px solid #ddd;
            border-radius: 4px;
            background: #fff;
        `;

        const header = document.createElement('div');
        header.className = 'preview-header';
        header.style.cssText = `
            margin-bottom: 10px;
            font-weight: 600;
            color: #333;
            display: flex;
            justify-content: space-between;
            align-items: center;
        `;

        const title = document.createElement('span');
        title.textContent = 'Design Preview';

        const actions = document.createElement('div');
        actions.className = 'preview-actions';

        // Refresh button
        const refreshBtn = document.createElement('button');
        refreshBtn.type = 'button';
        refreshBtn.className = 'button button-secondary button-small';
        refreshBtn.textContent = '🔄 Refresh';
        refreshBtn.style.marginRight = '5px';

        // Export button
        const exportBtn = document.createElement('button');
        exportBtn.type = 'button';
        exportBtn.className = 'button button-secondary button-small';
        exportBtn.textContent = '📷 Export';

        actions.appendChild(refreshBtn);
        actions.appendChild(exportBtn);
        header.appendChild(title);
        header.appendChild(actions);

        const container = document.createElement('div');
        container.id = containerId;
        container.className = this.config.containerClass;
        container.style.cssText = `
            min-height: 200px;
            border: 1px solid #e0e0e0;
            border-radius: 4px;
            background: #f9f9f9;
            display: flex;
            align-items: center;
            justify-content: center;
        `;

        wrapper.appendChild(header);
        wrapper.appendChild(container);

        // Setup button events
        refreshBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.refreshPreview(containerId);
        });

        exportBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.exportPreview(containerId);
        });

        return wrapper;
    }

    /**
     * Insert preview container near meta field
     * @param {HTMLElement} metaElement - Meta field element
     * @param {HTMLElement} container - Preview container
     */
    insertPreviewContainer(metaElement, container) {
        // Find the best insertion point
        let insertionPoint = metaElement.parentNode;

        // Look for WordPress meta field wrapper
        let current = metaElement;
        while (current.parentNode) {
            if (
                current.classList.contains('postbox') ||
                current.classList.contains('meta-box-sortables') ||
                current.classList.contains('form-table')
            ) {
                insertionPoint = current;
                break;
            }
            current = current.parentNode;
        }

        // Insert after the meta field or its wrapper
        if (insertionPoint.nextSibling) {
            insertionPoint.parentNode.insertBefore(container, insertionPoint.nextSibling);
        } else {
            insertionPoint.parentNode.appendChild(container);
        }
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Listen for meta field changes
        this.detectedMetaFields.forEach(metaField => {
            let timeout;

            const handleChange = () => {
                if (timeout) clearTimeout(timeout);

                if (this.config.enableAutoPreview) {
                    timeout = setTimeout(() => {
                        this.updatePreviewFromMetaField(metaField);
                    }, this.config.autoPreviewDelay);
                }
            };

            metaField.element.addEventListener('input', handleChange);
            metaField.element.addEventListener('change', handleChange);
            metaField.element.addEventListener('paste', handleChange);
        });

        // Listen for WordPress admin events
        document.addEventListener('heartbeat-tick', () => {
            console.log('💓 HEARTBEAT: Checking for preview updates...');
            // Could refresh previews on heartbeat if needed
        });
    }

    /**
     * Setup mutation observers for dynamic content
     */
    setupObservers() {
        // Observe meta field container changes
        const observer = new MutationObserver((mutations) => {
            mutations.forEach(mutation => {
                if (mutation.type === 'childList') {
                    // Check for new meta fields
                    mutation.addedNodes.forEach(node => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            this.detectNewMetaFields(node);
                        }
                    });
                }
            });
        });

        // Start observing
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        this.observers.push(observer);
    }

    /**
     * Detect new meta fields in added content
     * @param {HTMLElement} container - Container to search
     */
    detectNewMetaFields(container) {
        this.config.metaFieldSelectors.forEach(selector => {
            const elements = container.querySelectorAll(selector);
            elements.forEach(element => {
                // Check if this field is already detected
                const alreadyDetected = this.detectedMetaFields.some(
                    mf => mf.element === element
                );

                if (!alreadyDetected && element.value && this.looksLikeDesignData(element.value)) {
                    console.log('🆕 NEW META FIELD DETECTED:', selector);
                    // Add to detected fields and create preview
                    // Implementation would mirror the initial setup
                }
            });
        });
    }

    /**
     * Generate initial previews
     */
    generateInitialPreviews() {
        console.log('🎯 GENERATING INITIAL PREVIEWS...');

        this.previewInstances.forEach((instance, containerId) => {
            try {
                const designData = JSON.parse(instance.metaField.element.value);
                instance.generator.generatePreview(designData, {
                    loadingText: 'Loading initial preview...'
                });
            } catch (error) {
                console.error(`❌ INITIAL PREVIEW ERROR (${containerId}):`, error);
                instance.generator.showError('Invalid design data');
            }
        });
    }

    /**
     * Update preview from meta field
     * @param {Object} metaField - Meta field info
     */
    updatePreviewFromMetaField(metaField) {
        console.log('🔄 UPDATING PREVIEW FROM META FIELD...');

        // Find the corresponding preview instance
        const instance = Array.from(this.previewInstances.values()).find(
            inst => inst.metaField === metaField
        );

        if (!instance) {
            console.error('❌ No preview instance found for meta field');
            return;
        }

        try {
            if (!metaField.element.value.trim()) {
                instance.generator.clearPreview();
                return;
            }

            const designData = JSON.parse(metaField.element.value);
            instance.generator.generatePreview(designData, {
                loadingText: 'Updating preview...'
            });

        } catch (error) {
            console.error('❌ META FIELD UPDATE ERROR:', error);
            instance.generator.showError('Invalid JSON data');
        }
    }

    /**
     * Refresh specific preview
     * @param {string} containerId - Container ID
     */
    refreshPreview(containerId) {
        console.log('🔄 REFRESHING PREVIEW:', containerId);

        const instance = this.previewInstances.get(containerId);
        if (!instance) return;

        this.updatePreviewFromMetaField(instance.metaField);
    }

    /**
     * Export preview as image
     * @param {string} containerId - Container ID
     */
    exportPreview(containerId) {
        const instance = this.previewInstances.get(containerId);
        if (!instance) return;

        try {
            const dataUrl = instance.generator.exportPreview();

            // Create download link
            const link = document.createElement('a');
            link.download = `design-preview-${Date.now()}.png`;
            link.href = dataUrl;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            console.log('✅ PREVIEW EXPORTED');

        } catch (error) {
            console.error('❌ EXPORT ERROR:', error);
            alert('Export failed: ' + error.message);
        }
    }

    /**
     * Trigger custom event
     * @param {string} eventName - Event name
     * @param {Object} data - Event data
     */
    triggerEvent(eventName, data) {
        const event = new CustomEvent(eventName, {
            detail: data,
            bubbles: true
        });
        document.dispatchEvent(event);
    }

    /**
     * Get integration status
     * @returns {Object} Status info
     */
    getStatus() {
        return {
            initialized: this.initialized,
            metaFieldsDetected: this.detectedMetaFields ? this.detectedMetaFields.length : 0,
            previewInstances: this.previewInstances.size,
            isAdminContext: this.isAdminContext()
        };
    }

    /**
     * Cleanup observers and event listeners
     */
    destroy() {
        console.log('🎯 ADMIN INTEGRATION: Cleaning up...');

        this.observers.forEach(observer => observer.disconnect());
        this.previewInstances.clear();
        this.initialized = false;
    }
}

// Auto-initialize when script loads (can be disabled by setting window.DISABLE_AUTO_ADMIN_PREVIEW = true)
document.addEventListener('DOMContentLoaded', () => {
    if (!window.DISABLE_AUTO_ADMIN_PREVIEW) {
        console.log('🚀 AUTO-INITIALIZING ADMIN PREVIEW INTEGRATION...');

        window.adminPreviewIntegration = new AdminPreviewIntegration();
        window.adminPreviewIntegration.init();
    }
});

// Global exposure for manual control
window.AdminPreviewIntegration = AdminPreviewIntegration;

console.log('✅ ADMIN PREVIEW INTEGRATION: Class loaded and ready');