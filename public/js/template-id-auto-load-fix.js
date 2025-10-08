/**
 * 🎯 TEMPLATE ID AUTO-LOAD FIX
 *
 * Root Cause: getDefaultTemplateByData() ignoriert octoPrintDesignerAutoLoad.templateId
 * Solution: Erweitert template ID detection um Auto-Load Support
 */

console.log('🎯 TEMPLATE ID AUTO-LOAD FIX: Starting template ID detection enhancement...');

// Wait for Designer ready
document.addEventListener('designerReady', function() {
    console.log('🎯 TEMPLATE ID FIX: Designer ready, patching getDefaultTemplateByData...');

    if (window.DesignerWidget && window.DesignerWidget.prototype) {
        // Store original method
        const originalGetDefaultTemplateByData = window.DesignerWidget.prototype.getDefaultTemplateByData;

        // Enhanced version
        window.DesignerWidget.prototype.getDefaultTemplateByData = function() {
            console.log('🎯 TEMPLATE ID FIX: Enhanced getDefaultTemplateByData called');

            // 1. Try original method first (data-default-template-id)
            let templateId = originalGetDefaultTemplateByData.call(this);
            if (templateId) {
                console.log('🎯 TEMPLATE ID FIX: Found template via original method:', templateId);
                return templateId;
            }

            // 2. Try Auto-Load data (THADDÄUS enhancement)
            if (window.octoPrintDesignerAutoLoad && window.octoPrintDesignerAutoLoad.templateId) {
                templateId = window.octoPrintDesignerAutoLoad.templateId;
                console.log('🎯 TEMPLATE ID FIX: Found template via auto-load data:', templateId);
                return templateId;
            }

            // 3. Try URL parameters as fallback
            const urlParams = new URLSearchParams(window.location.search);
            templateId = urlParams.get('template_id');
            if (templateId) {
                console.log('🎯 TEMPLATE ID FIX: Found template via URL fallback:', templateId);
                return templateId;
            }

            console.log('🎯 TEMPLATE ID FIX: No template ID found via any method');
            return false;
        };

        console.log('✅ TEMPLATE ID FIX: getDefaultTemplateByData successfully enhanced');

        // Fire event for verification
        document.dispatchEvent(new CustomEvent('templateIdFixApplied', {
            detail: {
                timestamp: Date.now(),
                hasAutoLoadData: !!(window.octoPrintDesignerAutoLoad && window.octoPrintDesignerAutoLoad.templateId),
                templateId: window.octoPrintDesignerAutoLoad?.templateId
            }
        }));

    } else {
        console.error('❌ TEMPLATE ID FIX: DesignerWidget.prototype not found');
    }
});

// Fallback for already loaded designer
if (window.DesignerWidget && window.DesignerWidget.prototype) {
    console.log('🎯 TEMPLATE ID FIX: Designer already loaded, applying patch immediately');
    document.dispatchEvent(new CustomEvent('designerReady'));
}