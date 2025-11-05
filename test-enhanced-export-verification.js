// 🎯 ENHANCED EXPORT VERIFICATION TEST
// Test the new snapshot-based PNG export approach
// Copy this code into browser console on https://yprint.de/designer/

async function testEnhancedExportSystem() {
    console.log('🚀 TESTING ENHANCED EXPORT SYSTEM...');

    // Step 1: Verify the enhanced engine is loaded
    console.log('🔍 STEP 1: Verifying enhanced export engine...');

    if (!window.highDPIPrintExportEngine) {
        console.error('❌ High-DPI export engine not found');
        return;
    }

    console.log('✅ Enhanced export engine detected');

    // Step 2: Check if we have canvas and design elements
    console.log('🔍 STEP 2: Checking canvas and design elements...');

    const fabricCanvas = window.designerWidgetInstance?.fabricCanvas;
    if (!fabricCanvas) {
        console.error('❌ No fabric canvas found');
        return;
    }

    const allObjects = fabricCanvas.getObjects();
    console.log(`✅ Canvas found with ${allObjects.length} objects`);

    // Analyze objects
    const designElements = [];
    const backgroundElements = [];

    allObjects.forEach((obj, index) => {
        const bounds = obj.getBoundingRect ? obj.getBoundingRect() : {};
        const isBackground = window.highDPIPrintExportEngine.shouldHideFromExport(obj);

        console.log(`Object ${index}:`, {
            type: obj.type,
            visible: obj.visible,
            position: `${Math.round(obj.left || 0)},${Math.round(obj.top || 0)}`,
            size: `${Math.round(bounds.width || 0)}x${Math.round(bounds.height || 0)}`,
            isBackground: isBackground
        });

        if (isBackground) {
            backgroundElements.push(obj);
        } else {
            designElements.push(obj);
        }
    });

    console.log(`📊 ANALYSIS: ${designElements.length} design elements, ${backgroundElements.length} background elements`);

    // Step 3: Get print area data
    console.log('🔍 STEP 3: Getting print area data...');

    try {
        const printArea = await window.highDPIPrintExportEngine.fetchTemplatePrintArea();
        console.log('✅ Print area fetched:', printArea);

        // Step 4: Test the enhanced export
        console.log('🔍 STEP 4: Testing enhanced snapshot export...');

        const exportResult = await window.highDPIPrintExportEngine.exportWithTemplateMetadata({
            dpi: 300,
            format: 'png',
            quality: 1.0,
            multiplier: 3.125
        });

        if (exportResult && exportResult.dataUrl) {
            console.log('✅ ENHANCED EXPORT SUCCESS:', {
                dimensions: `${exportResult.metadata.width}x${exportResult.metadata.height}px`,
                dpi: exportResult.metadata.dpi,
                elementsCount: exportResult.metadata.elementsCount,
                dataUrl_length: exportResult.dataUrl.length,
                size_mb: (exportResult.dataUrl.length / 1024 / 1024).toFixed(2)
            });

            // Show result in modal
            showEnhancedExportModal(exportResult.dataUrl, {
                title: '🚀 Enhanced Snapshot Export Test',
                metadata: exportResult.metadata,
                printArea: printArea,
                designElementsFound: designElements.length,
                backgroundElementsHidden: backgroundElements.length
            });

        } else {
            console.error('❌ Enhanced export returned invalid result');
        }

    } catch (error) {
        console.error('❌ Enhanced export test failed:', error.message);
        console.error('Full error:', error);
    }
}

function showEnhancedExportModal(dataUrl, options = {}) {
    // Remove existing modal
    const existingModal = document.getElementById('enhanced-export-test-modal');
    if (existingModal) {
        existingModal.remove();
    }

    // Create modal
    const modal = document.createElement('div');
    modal.id = 'enhanced-export-test-modal';
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
        <h3>${options.title || '🚀 Enhanced Export Test'}</h3>
        <div style="margin-bottom: 15px;">
            <img src="${dataUrl}" style="max-width: 100%; height: auto; border: 1px solid #ccc;" alt="Enhanced Export Result">
        </div>
        <div style="font-size: 12px; color: #666;">
            <strong>Export Metadata:</strong><br>
            ${options.metadata ? Object.entries(options.metadata).map(([k,v]) => `${k}: ${v}`).join('<br>') : 'No metadata'}
            <br><br>
            <strong>Print Area:</strong><br>
            ${options.printArea ? `x: ${options.printArea.x}, y: ${options.printArea.y}, width: ${options.printArea.width}, height: ${options.printArea.height}` : 'No print area data'}
            <br><br>
            <strong>Element Analysis:</strong><br>
            Design elements found: ${options.designElementsFound || 0}<br>
            Background elements hidden: ${options.backgroundElementsHidden || 0}
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
    window.testEnhancedExportSystem = testEnhancedExportSystem;
    console.log('🚀 ENHANCED EXPORT TEST READY');
    console.log('Run: testEnhancedExportSystem() - to test the new snapshot-based export system');
}