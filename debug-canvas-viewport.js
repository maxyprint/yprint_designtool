// 🔍 DEBUG CANVAS VIEWPORT RESTRICTION
// Run in browser console to debug why viewport restriction isn't working

async function debugCanvasViewport() {
    console.log('🔍 DEBUGGING CANVAS VIEWPORT RESTRICTION...');

    // Step 1: Check if high-DPI engine is available
    if (!window.highDPIPrintExportEngine) {
        console.log('❌ highDPIPrintExportEngine not available');
        return;
    }

    // Step 2: Check canvas
    const canvas = window.designerWidgetInstance?.fabricCanvas;
    if (!canvas) {
        console.log('❌ fabricCanvas not available');
        return;
    }

    console.log('✅ Canvas found:', {
        width: canvas.getWidth(),
        height: canvas.getHeight(),
        objects: canvas.getObjects().length
    });

    // Step 3: Test template ID detection
    console.log('🔍 Testing template ID detection...');
    try {
        const templateId = window.highDPIPrintExportEngine.getCurrentTemplateId();
        console.log('Template ID result:', templateId);
    } catch (error) {
        console.log('❌ Template ID detection failed:', error.message);
    }

    // Step 4: Test print area fetching
    console.log('🔍 Testing print area fetching...');
    try {
        const printArea = await window.highDPIPrintExportEngine.fetchTemplatePrintArea();
        console.log('Print area result:', printArea);
    } catch (error) {
        console.log('❌ Print area fetching failed:', error.message);
    }

    // Step 5: Test manual canvas viewport manipulation
    console.log('🔍 Testing manual canvas viewport manipulation...');

    const originalState = {
        width: canvas.getWidth(),
        height: canvas.getHeight(),
        viewportTransform: canvas.viewportTransform.slice()
    };

    console.log('Original canvas state:', originalState);

    try {
        // Try to manually restrict canvas
        const testPrintArea = { x: 100, y: 100, width: 300, height: 200 };

        console.log('Setting canvas to test dimensions:', testPrintArea);
        canvas.setWidth(testPrintArea.width);
        canvas.setHeight(testPrintArea.height);
        canvas.setViewportTransform([1, 0, 0, 1, -testPrintArea.x, -testPrintArea.y]);

        // Export test
        const testExport = canvas.toDataURL({
            format: 'png',
            quality: 1.0,
            multiplier: 1
        });

        console.log('Test export result:', {
            dataUrl_length: testExport.length,
            expected_dimensions: `${testPrintArea.width}x${testPrintArea.height}px`
        });

        // Show test result
        const img = document.createElement('img');
        img.src = testExport;
        img.style.cssText = 'position: fixed; top: 10px; left: 10px; z-index: 10000; border: 2px solid red; background: white;';
        document.body.appendChild(img);

        console.log('✅ Test image added to page (top-left with red border)');

        // Restore canvas
        canvas.setWidth(originalState.width);
        canvas.setHeight(originalState.height);
        canvas.setViewportTransform(originalState.viewportTransform);
        canvas.renderAll();

        console.log('✅ Canvas state restored');

    } catch (error) {
        console.log('❌ Manual viewport test failed:', error);

        // Restore on error
        canvas.setWidth(originalState.width);
        canvas.setHeight(originalState.height);
        canvas.setViewportTransform(originalState.viewportTransform);
    }

    // Step 6: Check which export method is actually being called
    console.log('🔍 Testing which export method is used...');

    // Check if the debug modal calls the right system
    if (window.saveOnlyPNGGenerator && window.saveOnlyPNGGenerator.storePNGInDatabase) {
        console.log('✅ saveOnlyPNGGenerator.storePNGInDatabase available');

        // Check if it has the improved logic
        const methodSource = window.saveOnlyPNGGenerator.storePNGInDatabase.toString();
        if (methodSource.includes('exportWithTemplateMetadata')) {
            console.log('✅ storePNGInDatabase contains exportWithTemplateMetadata call');
        } else {
            console.log('❌ storePNGInDatabase does NOT contain exportWithTemplateMetadata call');
        }

        if (methodSource.includes('print_area_optimized')) {
            console.log('✅ storePNGInDatabase contains print_area_optimized logic');
        } else {
            console.log('❌ storePNGInDatabase does NOT contain print_area_optimized logic');
        }
    }
}

// Auto-run
if (typeof window !== 'undefined') {
    window.debugCanvasViewport = debugCanvasViewport;
    console.log('🚀 CANVAS VIEWPORT DEBUG READY');
    console.log('Run: debugCanvasViewport() - to debug the viewport restriction system');
}