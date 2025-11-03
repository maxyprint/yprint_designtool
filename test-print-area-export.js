// 🎯 TEST PRINT AREA EXPORT
// Copy this code into browser console on https://yprint.de/designer/

async function testPrintAreaExport() {
    console.log('🎯 TESTING PRINT AREA EXPORT...');

    // Step 1: Test template ID detection
    console.log('🔍 STEP 1: Testing template ID detection...');

    let templateId = null;
    if (window.highDPIPrintExportEngine && typeof window.highDPIPrintExportEngine.getCurrentTemplateId === 'function') {
        templateId = window.highDPIPrintExportEngine.getCurrentTemplateId();
        console.log('✅ Template ID from high-DPI engine:', templateId);
    } else {
        console.log('❌ High-DPI engine getCurrentTemplateId not available');

        // Fallback: check URL manually
        const urlParams = new URLSearchParams(window.location.search);
        templateId = urlParams.get('template_id') || urlParams.get('template');
        console.log('🔄 Template ID from URL fallback:', templateId);
    }

    // Step 2: Test print area fetching
    console.log('🔍 STEP 2: Testing print area fetching...');

    let printArea = null;
    if (window.highDPIPrintExportEngine && typeof window.highDPIPrintExportEngine.fetchTemplatePrintArea === 'function') {
        try {
            printArea = await window.highDPIPrintExportEngine.fetchTemplatePrintArea();
            console.log('✅ Print area from high-DPI engine:', printArea);
        } catch (error) {
            console.log('❌ Print area fetch failed:', error.message);
        }
    } else {
        console.log('❌ High-DPI engine fetchTemplatePrintArea not available');
    }

    // Step 3: Test PNG generation with new system
    console.log('🔍 STEP 3: Testing PNG generation with print area...');

    if (window.highDPIPrintExportEngine && typeof window.highDPIPrintExportEngine.exportWithTemplateMetadata === 'function') {
        try {
            console.log('🎯 Starting exportWithTemplateMetadata with improved system...');

            const pngResult = await window.highDPIPrintExportEngine.exportWithTemplateMetadata({
                dpi: 300,
                format: 'png',
                quality: 1.0,
                multiplier: 3.125
            });

            if (pngResult && pngResult.dataUrl) {
                console.log('✅ PNG GENERATION SUCCESS with new system:', {
                    dimensions: `${pngResult.metadata.width}x${pngResult.metadata.height}px`,
                    dpi: pngResult.metadata.dpi,
                    dataUrl_length: pngResult.dataUrl.length,
                    size_mb: (pngResult.dataUrl.length / 1024 / 1024).toFixed(2),
                    template_metadata: pngResult.templateMetadata
                });

                // Show the PNG in a modal for visual verification
                showPNGModal(pngResult.dataUrl, {
                    title: '🎯 Print Area Export Test',
                    metadata: pngResult.metadata,
                    printArea: printArea
                });

            } else {
                console.log('❌ PNG generation returned invalid result');
            }

        } catch (error) {
            console.log('❌ PNG generation failed with new system:', error.message);
        }
    } else {
        console.log('❌ exportWithTemplateMetadata not available');
    }

    // Step 4: Compare with old system
    console.log('🔍 STEP 4: Comparing with manual-png-test.js approach...');

    if (window.generateDesignData && window.designerWidgetInstance?.fabricCanvas) {
        try {
            const designData = window.generateDesignData();
            const canvas = window.designerWidgetInstance.fabricCanvas;

            // Old system: full canvas export
            const oldPNG = canvas.toDataURL({
                format: 'png',
                quality: 1.0,
                multiplier: 3.125
            });

            console.log('📊 COMPARISON:', {
                old_system: {
                    size_mb: (oldPNG.length / 1024 / 1024).toFixed(2),
                    dimensions: `${canvas.width * 3.125}x${canvas.height * 3.125}px`,
                    exports: 'Full canvas (including background)'
                },
                new_system: pngResult ? {
                    size_mb: (pngResult.dataUrl.length / 1024 / 1024).toFixed(2),
                    dimensions: `${pngResult.metadata.width}x${pngResult.metadata.height}px`,
                    exports: 'Print area only (design elements)'
                } : 'Failed'
            });

        } catch (error) {
            console.log('❌ Old system comparison failed:', error.message);
        }
    }
}

function showPNGModal(dataUrl, options = {}) {
    // Remove existing modal
    const existingModal = document.getElementById('png-test-modal');
    if (existingModal) {
        existingModal.remove();
    }

    // Create modal
    const modal = document.createElement('div');
    modal.id = 'png-test-modal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.8);
        z-index: 10000;
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 20px;
        box-sizing: border-box;
    `;

    const content = document.createElement('div');
    content.style.cssText = `
        background: white;
        padding: 20px;
        border-radius: 8px;
        max-width: 90%;
        max-height: 90%;
        overflow: auto;
        position: relative;
    `;

    content.innerHTML = `
        <h3>${options.title || '🎯 PNG Export Test'}</h3>
        <div style="margin-bottom: 15px;">
            <img src="${dataUrl}" style="max-width: 100%; height: auto; border: 1px solid #ccc;" alt="Generated PNG">
        </div>
        <div style="font-size: 12px; color: #666;">
            <strong>Metadata:</strong><br>
            ${options.metadata ? Object.entries(options.metadata).map(([k,v]) => `${k}: ${v}`).join('<br>') : 'No metadata'}
            <br><br>
            <strong>Print Area:</strong><br>
            ${options.printArea ? `x: ${options.printArea.x}, y: ${options.printArea.y}, width: ${options.printArea.width}, height: ${options.printArea.height}` : 'No print area data'}
        </div>
        <button onclick="this.parentElement.parentElement.remove()" style="
            position: absolute;
            top: 10px;
            right: 10px;
            background: #ff4444;
            color: white;
            border: none;
            border-radius: 4px;
            padding: 5px 10px;
            cursor: pointer;
        ">Close</button>
    `;

    modal.appendChild(content);
    document.body.appendChild(modal);

    // Close on click outside
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

// Auto-run if in browser
if (typeof window !== 'undefined') {
    window.testPrintAreaExport = testPrintAreaExport;
    console.log('🚀 PRINT AREA EXPORT TEST READY');
    console.log('Run: testPrintAreaExport() - to test the new print area export system');
}