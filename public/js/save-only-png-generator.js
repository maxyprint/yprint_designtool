/**
 * ✅ MINIMAL PNG GENERATOR - Clean Implementation
 * Provides only the essential generatePNGForDownload function for designer.bundle.js
 */

console.log('✅ MINIMAL PNG: Providing clean generatePNGForDownload function');

// Provide minimal PNG generation function for designer.bundle.js
window.generatePNGForDownload = async function() {
    try {
        console.log('🎯 MINIMAL PNG: generatePNGForDownload called');

        // Use high-DPI engine if available
        if (window.highDPIPrintExportEngine) {
            console.log('✅ MINIMAL PNG: Using high-DPI engine');
            const canvas = window.designerInstance?.fabricCanvas;
            if (canvas) {
                const dataUrl = canvas.toDataURL({
                    format: 'png',
                    quality: 1,
                    multiplier: 4.17 // 300 DPI
                });
                console.log('✅ MINIMAL PNG: Generated clean PNG without debug UI');
                return dataUrl;
            }
        }

        console.warn('⚠️ MINIMAL PNG: No canvas available');
        return null;
    } catch (error) {
        console.error('❌ MINIMAL PNG: Generation failed:', error);
        return null;
    }
};

console.log('✅ MINIMAL PNG: Clean PNG system ready');