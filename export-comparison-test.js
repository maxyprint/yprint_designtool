// 🎯 EXPORT COMPARISON TEST
// Compare old vs new export approaches
// Copy this code into browser console on https://yprint.de/designer/

async function compareExportMethods() {
    console.log('🔄 COMPARING EXPORT METHODS...');

    if (!window.highDPIPrintExportEngine || !window.designerWidgetInstance?.fabricCanvas) {
        console.error('❌ Required components not available');
        return;
    }

    const fabricCanvas = window.designerWidgetInstance.fabricCanvas;

    try {
        // Get print area for new method
        const printArea = await window.highDPIPrintExportEngine.fetchTemplatePrintArea();

        console.log('🔍 TESTING BOTH EXPORT METHODS...');

        // Test 1: Old method (full canvas export)
        console.log('📊 OLD METHOD: Full canvas export');
        const oldExportStart = performance.now();

        const oldResult = fabricCanvas.toDataURL({
            format: 'png',
            quality: 1.0,
            multiplier: 3.125
        });

        const oldExportTime = performance.now() - oldExportStart;

        // Test 2: New method (snapshot-based print area export)
        console.log('📊 NEW METHOD: Snapshot-based print area export');
        const newExportStart = performance.now();

        const newResult = await window.highDPIPrintExportEngine.exportWithTemplateMetadata({
            dpi: 300,
            format: 'png',
            quality: 1.0,
            multiplier: 3.125
        });

        const newExportTime = performance.now() - newExportStart;

        // Compare results
        console.log('📊 COMPARISON RESULTS:');
        console.log('OLD METHOD:', {
            time_ms: Math.round(oldExportTime),
            size_mb: (oldResult.length / 1024 / 1024).toFixed(2),
            dimensions: `${fabricCanvas.width * 3.125}x${fabricCanvas.height * 3.125}px`,
            approach: 'Full canvas with all elements'
        });

        console.log('NEW METHOD:', {
            time_ms: Math.round(newExportTime),
            size_mb: newResult?.dataUrl ? (newResult.dataUrl.length / 1024 / 1024).toFixed(2) : 'Failed',
            dimensions: newResult?.metadata ? `${newResult.metadata.width}x${newResult.metadata.height}px` : 'Unknown',
            approach: 'Snapshot of print area only',
            elements_count: newResult?.metadata?.elementsCount || 0
        });

        // Show side-by-side comparison
        showComparisonModal(oldResult, newResult?.dataUrl, {
            printArea: printArea,
            oldStats: {
                time: Math.round(oldExportTime),
                size: (oldResult.length / 1024 / 1024).toFixed(2),
                dimensions: `${fabricCanvas.width * 3.125}x${fabricCanvas.height * 3.125}px`
            },
            newStats: {
                time: Math.round(newExportTime),
                size: newResult?.dataUrl ? (newResult.dataUrl.length / 1024 / 1024).toFixed(2) : 'Failed',
                dimensions: newResult?.metadata ? `${newResult.metadata.width}x${newResult.metadata.height}px` : 'Unknown',
                elements: newResult?.metadata?.elementsCount || 0
            }
        });

    } catch (error) {
        console.error('❌ Comparison test failed:', error.message);
    }
}

function showComparisonModal(oldDataUrl, newDataUrl, stats) {
    // Remove existing modal
    const existingModal = document.getElementById('comparison-modal');
    if (existingModal) {
        existingModal.remove();
    }

    // Create modal
    const modal = document.createElement('div');
    modal.id = 'comparison-modal';
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
        max-width: 95%;
        max-height: 95%;
        overflow: auto;
        position: relative;
    `;

    content.innerHTML = `
        <h3>🔄 Export Method Comparison</h3>
        <div style="display: flex; gap: 20px; margin-bottom: 15px;">
            <div style="flex: 1;">
                <h4>OLD METHOD (Full Canvas)</h4>
                <img src="${oldDataUrl}" style="max-width: 100%; height: auto; border: 1px solid #ccc;" alt="Old Method">
                <div style="font-size: 12px; color: #666; margin-top: 10px;">
                    <strong>Stats:</strong><br>
                    Time: ${stats.oldStats.time}ms<br>
                    Size: ${stats.oldStats.size}MB<br>
                    Dimensions: ${stats.oldStats.dimensions}<br>
                    Approach: Full canvas export
                </div>
            </div>
            <div style="flex: 1;">
                <h4>NEW METHOD (Snapshot)</h4>
                ${newDataUrl ?
                    `<img src="${newDataUrl}" style="max-width: 100%; height: auto; border: 1px solid #ccc;" alt="New Method">` :
                    '<div style="padding: 50px; text-align: center; border: 1px solid #ccc; color: #999;">Export Failed</div>'
                }
                <div style="font-size: 12px; color: #666; margin-top: 10px;">
                    <strong>Stats:</strong><br>
                    Time: ${stats.newStats.time}ms<br>
                    Size: ${stats.newStats.size}MB<br>
                    Dimensions: ${stats.newStats.dimensions}<br>
                    Elements: ${stats.newStats.elements}<br>
                    Approach: Print area snapshot
                </div>
            </div>
        </div>
        <div style="font-size: 12px; color: #666;">
            <strong>Print Area Info:</strong><br>
            ${stats.printArea ? `x: ${stats.printArea.x}, y: ${stats.printArea.y}, width: ${stats.printArea.width}, height: ${stats.printArea.height}` : 'No print area data'}
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
    window.compareExportMethods = compareExportMethods;
    console.log('🔄 EXPORT COMPARISON TEST READY');
    console.log('Run: compareExportMethods() - to compare old vs new export methods');
}