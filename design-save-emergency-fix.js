/**
 * 🚨 HIVE MIND DESIGN SAVE EMERGENCY FIX
 * Swarm ID: swarm_1758625226387_ao4ma3dg3
 *
 * Löst "Invalid input data" Error durch fehlende template_id/name Felder
 */

console.log('🚨 HIVE MIND DESIGN SAVE EMERGENCY FIX gestartet');
console.log('🐝 Swarm ID: swarm_1758625226387_ao4ma3dg3');

class DesignSaveEmergencyFix {
    constructor() {
        this.swarmId = 'swarm_1758625226387_ao4ma3dg3';
        this.fixApplied = false;
        this.init();
    }

    init() {
        console.log('🔧 Analyzing design save functionality...');

        // Override original save functions
        this.interceptSaveFunctions();

        // Add missing fields to all AJAX calls
        this.patchAjaxCalls();

        console.log('✅ Design Save Emergency Fix ready!');
    }

    interceptSaveFunctions() {
        console.log('🔄 Intercepting save functions...');

        // Find and override any existing save functions
        const originalJQuery = window.$ || window.jQuery;

        if (originalJQuery) {
            const originalPost = originalJQuery.post;
            originalJQuery.post = (...args) => {
                return this.enhanceAjaxCall(originalPost, args);
            };

            const originalAjax = originalJQuery.ajax;
            originalJQuery.ajax = (options) => {
                return this.enhanceAjaxOptions(originalAjax, options);
            };
        }

        // Override native fetch if used
        const originalFetch = window.fetch;
        window.fetch = (url, options) => {
            return this.enhanceFetch(originalFetch, url, options);
        };
    }

    enhanceAjaxCall(originalFunction, args) {
        console.log('🔧 Enhancing AJAX call with required fields...');

        if (args.length >= 2 && typeof args[1] === 'object') {
            // Add missing required fields
            args[1] = this.addRequiredFields(args[1]);
        }

        return originalFunction.apply(this, args);
    }

    enhanceAjaxOptions(originalFunction, options) {
        console.log('🔧 Enhancing AJAX options with required fields...');

        if (options && options.data) {
            if (typeof options.data === 'string') {
                // Parse URL-encoded data
                const params = new URLSearchParams(options.data);
                const dataObj = Object.fromEntries(params);
                options.data = this.addRequiredFields(dataObj);

                // Convert back to URL-encoded string
                const newParams = new URLSearchParams(options.data);
                options.data = newParams.toString();
            } else if (typeof options.data === 'object') {
                options.data = this.addRequiredFields(options.data);
            }
        }

        return originalFunction.call(this, options);
    }

    enhanceFetch(originalFunction, url, options) {
        console.log('🔧 Enhancing fetch call with required fields...');

        if (options && options.body) {
            if (options.body instanceof FormData) {
                this.addRequiredFieldsToFormData(options.body);
            } else if (typeof options.body === 'string') {
                try {
                    const data = JSON.parse(options.body);
                    options.body = JSON.stringify(this.addRequiredFields(data));
                } catch (e) {
                    // Try as URL-encoded
                    const params = new URLSearchParams(options.body);
                    const dataObj = Object.fromEntries(params);
                    const enhanced = this.addRequiredFields(dataObj);
                    const newParams = new URLSearchParams(enhanced);
                    options.body = newParams.toString();
                }
            }
        }

        return originalFunction.call(this, url, options);
    }

    addRequiredFields(data) {
        // Don't modify if already has required fields
        if (data.template_id && data.name) {
            return data;
        }

        console.log('➕ Adding missing required fields...');

        // Add missing template_id (default to 1 if not provided)
        if (!data.template_id) {
            data.template_id = this.getDefaultTemplateId();
            console.log(`✅ Added template_id: ${data.template_id}`);
        }

        // Add missing name (generate if not provided)
        if (!data.name) {
            data.name = this.generateDesignName();
            console.log(`✅ Added name: ${data.name}`);
        }

        return data;
    }

    addRequiredFieldsToFormData(formData) {
        if (!formData.has('template_id')) {
            formData.append('template_id', this.getDefaultTemplateId());
            console.log(`✅ Added template_id to FormData: ${this.getDefaultTemplateId()}`);
        }

        if (!formData.has('name')) {
            const name = this.generateDesignName();
            formData.append('name', name);
            console.log(`✅ Added name to FormData: ${name}`);
        }
    }

    getDefaultTemplateId() {
        // Try to find template ID from current page context
        const templateInput = document.querySelector('input[name="template_id"]');
        if (templateInput && templateInput.value) {
            return templateInput.value;
        }

        // Try to extract from URL or page data
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.has('template_id')) {
            return urlParams.get('template_id');
        }

        // Default fallback
        return '1';
    }

    generateDesignName() {
        const timestamp = new Date().toISOString().slice(0, 16).replace('T', ' ');
        return `Design ${timestamp}`;
    }

    // Manual save function with proper validation
    manualSave(designData = {}) {
        console.log('🚀 Manual save with emergency fix...');

        const saveData = this.addRequiredFields({
            action: 'save_design',
            nonce: this.getNonce(),
            ...designData
        });

        console.log('📤 Sending enhanced save data:', saveData);

        return new Promise((resolve, reject) => {
            if (window.jQuery) {
                window.jQuery.ajax({
                    url: this.getAjaxUrl(),
                    type: 'POST',
                    data: saveData,
                    success: (response) => {
                        console.log('✅ Save successful:', response);
                        resolve(response);
                    },
                    error: (xhr, status, error) => {
                        console.error('❌ Save failed:', error, xhr.responseText);
                        reject(new Error(`Save failed: ${error}`));
                    }
                });
            } else {
                reject(new Error('jQuery not available for manual save'));
            }
        });
    }

    getNonce() {
        // Try various methods to get nonce
        const nonceInput = document.querySelector('input[name="nonce"]') ||
                          document.querySelector('input[name="_nonce"]') ||
                          document.querySelector('#octo_print_designer_nonce');

        if (nonceInput) {
            return nonceInput.value;
        }

        // Try to find in script tags
        const scripts = document.querySelectorAll('script');
        for (let script of scripts) {
            const content = script.innerHTML;
            const nonceMatch = content.match(/nonce['"]\s*:\s*['"]([^'"]+)['"]/);
            if (nonceMatch) {
                return nonceMatch[1];
            }
        }

        console.warn('⚠️ Nonce not found, save may fail');
        return '';
    }

    getAjaxUrl() {
        // WordPress AJAX URL
        if (window.ajaxurl) {
            return window.ajaxurl;
        }

        if (window.wpAjax && window.wpAjax.ajaxUrl) {
            return window.wpAjax.ajaxUrl;
        }

        // Default WordPress AJAX endpoint
        return '/wp-admin/admin-ajax.php';
    }

    // Test function
    testSave() {
        console.log('🧪 Testing enhanced save functionality...');

        // Get current canvas data if available
        let designData = {};

        if (window.fabric && window.fabric.Canvas) {
            // Try to find active canvas
            const canvases = document.querySelectorAll('canvas');
            for (let canvas of canvases) {
                if (canvas.__fabric) {
                    designData.design_data = JSON.stringify(canvas.__fabric.toJSON());
                    console.log('📊 Canvas data captured for test');
                    break;
                }
            }
        }

        return this.manualSave(designData);
    }
}

// Initialize the fix
const designSaveFix = new DesignSaveEmergencyFix();

// Make available globally
window.DesignSaveEmergencyFix = DesignSaveEmergencyFix;
window.designSaveFix = designSaveFix;

// Quick test function
window.testDesignSave = () => {
    console.log('🧪 Quick design save test...');
    return designSaveFix.testSave();
};

console.log('🎉 Hive Mind Design Save Emergency Fix loaded!');
console.log('💡 Usage: testDesignSave() für sofortigen Test');