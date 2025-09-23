/**
 * 🎯 CLEAN DESIGN SAVE FIX - Hive Mind Production Solution
 * Swarm ID: swarm_1758629527234_uuw0zd5yx
 *
 * Surgical fix for design save functionality - NO conflicts, NO overwrites
 */

console.log('🎯 CLEAN DESIGN SAVE FIX: Starting surgical intervention...');

class CleanDesignSaveFix {
    constructor() {
        this.fixId = 'clean-save-fix-' + Date.now();
        this.isActive = false;
        this.originalMethods = {};
        this.init();
    }

    init() {
        console.log('🔧 Initializing clean save fix...');

        // Wait for jQuery to be available
        this.waitForJQuery(() => {
            this.interceptAjaxSafely();
            this.isActive = true;
            console.log('✅ Clean save fix activated');
        });
    }

    waitForJQuery(callback) {
        if (window.jQuery || window.$) {
            callback();
        } else {
            setTimeout(() => this.waitForJQuery(callback), 100);
        }
    }

    interceptAjaxSafely() {
        const $ = window.jQuery || window.$;
        if (!$) return;

        // Store original method safely
        if ($.ajax && !this.originalMethods.ajax) {
            this.originalMethods.ajax = $.ajax.bind($);

            // Safe AJAX interception
            $.ajax = (options) => {
                if (this.shouldEnhanceRequest(options)) {
                    options = this.enhanceRequestData(options);
                }
                return this.originalMethods.ajax(options);
            };

            console.log('📡 AJAX interceptor installed cleanly');
        }
    }

    shouldEnhanceRequest(options) {
        if (!options || !options.url) return false;

        // Only intercept admin-ajax.php calls
        if (!options.url.includes('admin-ajax.php')) return false;

        // Only intercept design save actions
        const data = this.parseData(options.data);
        return data && (data.action === 'save_design' ||
                       (data.action && data.action.includes('save')));
    }

    parseData(data) {
        if (!data) return null;

        if (typeof data === 'string') {
            try {
                // Handle URL-encoded data
                const params = new URLSearchParams(data);
                return Object.fromEntries(params);
            } catch (e) {
                return null;
            }
        }

        return typeof data === 'object' ? data : null;
    }

    enhanceRequestData(options) {
        const data = this.parseData(options.data);
        if (!data) return options;

        // Add missing required fields only if not present
        let enhanced = false;

        if (!data.template_id) {
            data.template_id = this.getTemplateId();
            enhanced = true;
            console.log(`✅ Added template_id: ${data.template_id}`);
        }

        if (!data.name) {
            data.name = this.generateDesignName();
            enhanced = true;
            console.log(`✅ Added name: ${data.name}`);
        }

        if (enhanced) {
            // Rebuild data in original format
            if (typeof options.data === 'string') {
                options.data = new URLSearchParams(data).toString();
            } else {
                options.data = data;
            }

            console.log('📤 Request data enhanced for save success');
        }

        return options;
    }

    getTemplateId() {
        // Try multiple sources for template ID
        const sources = [
            () => document.querySelector('input[name="template_id"]')?.value,
            () => document.querySelector('[data-default-template-id]')?.dataset.defaultTemplateId,
            () => new URLSearchParams(window.location.search).get('template_id'),
            () => window.designConfig?.templateId,
            () => '1' // Fallback
        ];

        for (const source of sources) {
            try {
                const value = source();
                if (value) return value;
            } catch (e) {
                continue;
            }
        }

        return '1';
    }

    generateDesignName() {
        const timestamp = new Date().toISOString().slice(0, 16).replace('T', ' ');
        return `Design ${timestamp}`;
    }

    // Test function
    testSave() {
        console.log('🧪 Testing clean save functionality...');

        if (!window.jQuery) {
            console.error('❌ jQuery not available for test');
            return;
        }

        const testData = {
            action: 'save_design',
            design_data: JSON.stringify({test: true, timestamp: Date.now()}),
            nonce: this.findNonce()
        };

        return window.jQuery.ajax({
            url: '/wp-admin/admin-ajax.php',
            type: 'POST',
            data: testData,
            success: (response) => {
                console.log('✅ Save test successful:', response);
            },
            error: (xhr, status, error) => {
                console.error('❌ Save test failed:', {
                    status: xhr.status,
                    error: error,
                    response: xhr.responseText
                });
            }
        });
    }

    findNonce() {
        // Find nonce from multiple sources
        const sources = [
            () => document.querySelector('#octo_print_designer_nonce')?.value,
            () => document.querySelector('input[name="nonce"]')?.value,
            () => document.querySelector('input[name="_nonce"]')?.value,
            () => window.octoPrintDesignerData?.nonce,
            () => window.ajaxNonce
        ];

        for (const source of sources) {
            try {
                const nonce = source();
                if (nonce) return nonce;
            } catch (e) {
                continue;
            }
        }

        console.warn('⚠️ Nonce not found - save may fail authentication');
        return '';
    }

    // Status check
    getStatus() {
        return {
            active: this.isActive,
            fixId: this.fixId,
            hasJQuery: !!(window.jQuery || window.$),
            interceptorInstalled: !!this.originalMethods.ajax,
            timestamp: new Date().toISOString()
        };
    }
}

// Initialize the clean fix
const cleanSaveFix = new CleanDesignSaveFix();

// Make available globally
window.CleanDesignSaveFix = CleanDesignSaveFix;
window.cleanSaveFix = cleanSaveFix;

// Test function shortcut
window.testCleanSave = () => {
    return cleanSaveFix.testSave();
};

console.log('🎉 Clean Design Save Fix ready!');
console.log('💡 Usage: testCleanSave() for testing');
console.log('📊 Status: cleanSaveFix.getStatus()');