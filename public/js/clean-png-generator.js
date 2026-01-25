/**
 * 🚫 CLEAN PNG GENERATOR - DISABLED
 * This system is superseded by save-only-png-generator.js canvas snapshot system
 */

console.log('🚫 CLEAN PNG GENERATOR: Disabled - using save-only-png-generator.js canvas snapshot system');

// System disabled - save-only-png-generator.js provides generatePNGForDownload
/* DISABLED:
window.generatePNGForDownload = async function() {
    try {
        console.log('🎯 CLEAN PNG: generatePNGForDownload function called successfully!');

        // Check for designer instance
        const designer = window.designerInstance;
        if (!designer || !designer.fabricCanvas) {
            console.error('❌ CLEAN PNG: No designer canvas available');
            return null;
        }

        console.log('✅ CLEAN PNG: Canvas found, generating PNG...');

        // Generate high-quality PNG
        const dataUrl = designer.fabricCanvas.toDataURL({
            format: 'png',
            quality: 1,
            multiplier: 4.17 // 300 DPI
        });

        if (dataUrl) {
            console.log('🎯 CLEAN PNG: PNG generated successfully!');
            console.log('📏 CLEAN PNG: Data URL length:', dataUrl.length);

            // Send to server for storage
            if (window.octo_print_designer_config?.ajax_url) {
                try {
                    const formData = new FormData();
                    formData.append('action', 'save_design_png');
                    formData.append('nonce', window.octo_print_designer_config.nonce || '');
                    formData.append('png_data', dataUrl);
                    formData.append('design_id', designer.currentDesignId || 'temp');

                    const response = await fetch(window.octo_print_designer_config.ajax_url, {
                        method: 'POST',
                        body: formData
                    });

                    if (response.ok) {
                        const result = await response.json();
                        if (result.success && result.data?.png_url) {
                            console.log('🎯 CLEAN PNG: Server saved successfully!');
                            console.log('🔗 PNG URL:', result.data.png_url);
                            return result.data.png_url;
                        }
                    }
                } catch (serverError) {
                    console.warn('⚠️ CLEAN PNG: Server save failed, returning data URL');
                }
            }

            return dataUrl;
        } else {
            console.error('❌ CLEAN PNG: Canvas toDataURL returned empty');
            return null;
        }

    } catch (error) {
        console.error('❌ CLEAN PNG: Generation failed:', error);
        return null;
    }
};
*/

console.log('🚫 CLEAN PNG GENERATOR: System disabled - no functions exposed');