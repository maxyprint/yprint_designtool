// VISUAL CANVAS SNAPSHOT SYSTEM TEST
// Copy and paste this entire script into browser console to test the new system

console.log('🧪 VISUAL PNG TEST: Starting comprehensive test of visual canvas snapshot system');

async function testVisualCanvasSnapshotSystem() {
    const designer = window.designerInstance;

    if (!designer?.fabricCanvas) {
        console.error('❌ VISUAL PNG TEST: No designer or canvas found - reload page and try again');
        return;
    }

    const canvas = designer.fabricCanvas;

    console.log('\n=== 1. PRINT ZONE DETECTION TEST ===');

    // Test the detectCanvasPrintZones function
    if (typeof detectCanvasPrintZones === 'function') {
        console.log('✅ detectCanvasPrintZones function available');

        const printZones = detectCanvasPrintZones(canvas, designer);
        console.log('Print zones detected:', printZones.length);

        printZones.forEach((zone, i) => {
            console.log(`Print Zone ${i + 1}:`, {
                source: zone.source,
                viewId: zone.viewId,
                viewName: zone.viewName,
                bounds: zone.bounds,
                coverage: zone.coverage
            });
        });

        if (printZones.length === 0) {
            console.warn('⚠️ VISUAL PNG TEST: No print zones detected - this may indicate a problem');

            // Manual fallback detection
            console.log('Manual print zone fallback check:');
            console.log('designer.printZoneRect:', !!designer.printZoneRect);
            console.log('designer.safeZoneRect:', !!designer.safeZoneRect);

            const allObjects = canvas.getObjects();
            const rects = allObjects.filter(obj => obj.type === 'rect');
            console.log(`Canvas has ${rects.length} rectangle objects total`);

            const excludeRects = allObjects.filter(obj =>
                obj.type === 'rect' && obj.excludeFromExport === true
            );
            console.log(`Found ${excludeRects.length} excludeFromExport rectangles`);
        }
    } else {
        console.error('❌ detectCanvasPrintZones function not found - script may not be loaded');
        return;
    }

    console.log('\n=== 2. VISUAL SNAPSHOT GENERATION TEST ===');

    // Test generateVisualCanvasSnapshot function
    if (typeof generateVisualCanvasSnapshot === 'function') {
        console.log('✅ generateVisualCanvasSnapshot function available');

        if (printZones.length > 0) {
            console.log('Testing visual snapshot with first print zone...');

            const testPrintZone = printZones[0];
            const testPNG = await generateVisualCanvasSnapshot(
                canvas,
                testPrintZone,
                'test_design',
                testPrintZone.viewId
            );

            if (testPNG) {
                console.log('✅ Visual snapshot generated successfully:', {
                    length: testPNG.length,
                    validDataURL: testPNG.startsWith('data:image/png'),
                    printZone: testPrintZone.viewName
                });

                // Quick content validation
                if (testPNG.length > 5000) {
                    console.log('✅ PNG appears to have substantial content');
                } else {
                    console.warn('⚠️ PNG might be too small - possible empty image');
                }
            } else {
                console.error('❌ Visual snapshot generation failed');
            }
        } else {
            console.warn('⚠️ Cannot test visual snapshot - no print zones available');
        }
    } else {
        console.error('❌ generateVisualCanvasSnapshot function not found');
    }

    console.log('\n=== 3. MULTI-VIEW GENERATION TEST ===');

    // Test generateMultiViewVisualPNGs function
    if (typeof generateMultiViewVisualPNGs === 'function') {
        console.log('✅ generateMultiViewVisualPNGs function available');

        console.log('Testing multi-view generation...');
        const multiViewResults = await generateMultiViewVisualPNGs('test_design_123');

        if (multiViewResults && multiViewResults.length > 0) {
            console.log(`✅ Multi-view generation successful: ${multiViewResults.length} views`);

            multiViewResults.forEach((result, i) => {
                console.log(`View ${i + 1}:`, {
                    viewId: result.viewId,
                    viewName: result.viewName,
                    pngLength: result.pngData?.length || 0,
                    printZone: result.printZone,
                    source: result.source
                });
            });
        } else {
            console.error('❌ Multi-view generation failed or returned no results');
        }
    } else {
        console.error('❌ generateMultiViewVisualPNGs function not found');
    }

    console.log('\n=== 4. NEW API FUNCTIONS TEST ===');

    // Test the new window functions
    console.log('Testing window.generatePNGForDownloadVisual...');
    if (typeof window.generatePNGForDownloadVisual === 'function') {
        console.log('✅ generatePNGForDownloadVisual available');

        const downloadResult = await window.generatePNGForDownloadVisual();
        if (downloadResult && downloadResult.success) {
            console.log('✅ Visual download function works:', {
                viewName: downloadResult.viewName,
                pngLength: downloadResult.pngData?.length || 0,
                totalViews: downloadResult.allResults?.length || 0
            });
        } else {
            console.error('❌ Visual download function failed:', downloadResult);
        }
    } else {
        console.error('❌ generatePNGForDownloadVisual not found');
    }

    console.log('\nTesting window.generatePNGForSaveVisual...');
    if (typeof window.generatePNGForSaveVisual === 'function') {
        console.log('✅ generatePNGForSaveVisual available');
        console.log('ℹ️ Skipping actual save test to avoid server calls during testing');
        console.log('   - Function is ready for use with real design IDs');
    } else {
        console.error('❌ generatePNGForSaveVisual not found');
    }

    console.log('\n=== 5. CANVAS STATE ANALYSIS ===');

    // Check canvas state and design objects
    const allObjects = canvas.getObjects();
    const designObjects = allObjects.filter(obj => {
        const isBackground = obj.isBackground === true ||
                           (obj.type === 'image' && obj.selectable === false);
        const isSystemObject = obj.excludeFromExport === true;
        const isPrintZoneOverlay = obj === designer.printZoneRect || obj === designer.safeZoneRect;
        const isUserContent = obj.selectable === true && obj.visible === true;

        return isUserContent && !isBackground && !isSystemObject && !isPrintZoneOverlay;
    });

    console.log('Canvas state analysis:', {
        totalObjects: allObjects.length,
        designObjects: designObjects.length,
        printZones: printZones.length,
        canvasSize: { width: canvas.width, height: canvas.height }
    });

    if (designObjects.length === 0) {
        console.warn('⚠️ No design objects found - add some text/images to test properly');
    } else {
        console.log('✅ Found design objects for testing');
        designObjects.forEach((obj, i) => {
            const bounds = obj.getBoundingRect();
            console.log(`Design Object ${i + 1}:`, {
                type: obj.type,
                bounds: bounds,
                visible: obj.visible
            });
        });
    }

    console.log('\n=== 6. FABRIC.JS CLIPPING CAPABILITY TEST ===');

    // Test if Fabric.js clipPath is supported
    console.log('Fabric.js clipPath support:', {
        canvasClipPath: typeof canvas.clipPath,
        objectClipPath: typeof fabric.Object.prototype.clipPath,
        rectConstructor: typeof fabric.Rect
    });

    // Test creating a clip rect (without applying it)
    try {
        const testClipRect = new fabric.Rect({
            left: 100,
            top: 100,
            width: 200,
            height: 200,
            fill: 'transparent'
        });
        console.log('✅ Can create Fabric.js clipping rectangles');
    } catch (e) {
        console.error('❌ Cannot create Fabric.js rectangles:', e);
    }

    console.log('\n🧪 VISUAL PNG TEST: Complete - Check results above');
    console.log('\n📋 SUMMARY:');
    console.log('- Print Zone Detection:', printZones.length > 0 ? '✅' : '❌');
    console.log('- Visual Functions Available:', typeof detectCanvasPrintZones === 'function' ? '✅' : '❌');
    console.log('- API Functions Available:', typeof window.generatePNGForDownloadVisual === 'function' ? '✅' : '❌');
    console.log('- Design Objects Present:', designObjects.length > 0 ? '✅' : '❌');
    console.log('- Fabric.js ClipPath Support:', typeof canvas.clipPath !== 'undefined' ? '✅' : '❌');

    return {
        printZones: printZones.length,
        designObjects: designObjects.length,
        functionsAvailable: typeof detectCanvasPrintZones === 'function',
        apiReady: typeof window.generatePNGForDownloadVisual === 'function'
    };
}

// Run the comprehensive test
console.log('🚀 Starting visual PNG system test...');
testVisualCanvasSnapshotSystem().then(results => {
    console.log('\n🎯 TEST RESULTS:', results);
}).catch(error => {
    console.error('❌ TEST FAILED:', error);
});

// Also provide manual testing functions
window.testVisualPNG = {
    detectPrintZones: () => detectCanvasPrintZones(window.designerInstance.fabricCanvas, window.designerInstance),
    generateSnapshot: (printZone) => generateVisualCanvasSnapshot(window.designerInstance.fabricCanvas, printZone, 'test', 'test'),
    multiView: () => generateMultiViewVisualPNGs('test_design'),
    download: () => window.generatePNGForDownloadVisual(),
    fullTest: testVisualCanvasSnapshotSystem
};

console.log('ℹ️ Manual testing functions available as window.testVisualPNG');
console.log('   Example: window.testVisualPNG.detectPrintZones()');