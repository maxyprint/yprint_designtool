/**
 * 🔍 COMPREHENSIVE PNG DEBUG SYSTEM
 * Ausführliche Analyse für Canvas Snapshot PNG Generation
 * Run in Browser Console to diagnose PNG issues
 */

console.log('🔍 COMPREHENSIVE PNG DEBUG: Starting detailed analysis...');

// Main debug function
window.debugCanvasSnapshotPNG = function() {
    console.log('\n===========================================');
    console.log('🔍 COMPREHENSIVE PNG DEBUG ANALYSIS START');
    console.log('===========================================\n');

    const designer = window.designerInstance;
    if (!designer || !designer.fabricCanvas) {
        console.error('❌ CRITICAL: No designer or canvas found');
        return;
    }

    console.log('✅ Designer instance found');
    const canvas = designer.fabricCanvas;

    // STEP 1: Canvas Analysis
    console.log('\n📐 STEP 1: CANVAS ANALYSIS');
    console.log('----------------------------');
    console.log('Canvas dimensions:', {
        width: canvas.width,
        height: canvas.height,
        zoom: canvas.getZoom(),
        viewportTransform: canvas.viewportTransform
    });

    // STEP 2: Objects Analysis
    console.log('\n🎨 STEP 2: OBJECTS ANALYSIS');
    console.log('----------------------------');
    const allObjects = canvas.getObjects();
    console.log('Total objects on canvas:', allObjects.length);

    allObjects.forEach((obj, index) => {
        const isBackground = obj.isBackground === true || (obj.type === 'image' && obj.selectable === false);
        const isSystemObject = obj.excludeFromExport === true;
        const isUserContent = obj.selectable === true && obj.visible === true;

        console.log(`\nObject ${index}:`, {
            type: obj.type,
            isBackground: isBackground,
            isSystemObject: isSystemObject,
            isUserContent: isUserContent,
            visible: obj.visible,
            selectable: obj.selectable,
            position: { left: obj.left, top: obj.top },
            dimensions: { width: obj.width, height: obj.height },
            scale: { scaleX: obj.scaleX, scaleY: obj.scaleY },
            bounds: obj.getBoundingRect ? obj.getBoundingRect() : 'No bounds method'
        });

        if (obj.type === 'text') {
            console.log('  Text content:', obj.text);
        }
        if (obj.type === 'image' && obj._element) {
            console.log('  Image src:', obj._element.src?.substring(0, 100) + '...');
        }
    });

    // Filter design objects (same logic as PNG generation)
    const designObjects = allObjects.filter(obj => {
        const isBackground = obj.isBackground === true || (obj.type === 'image' && obj.selectable === false);
        const isSystemObject = obj.excludeFromExport === true;
        const isUserContent = obj.selectable === true && obj.visible === true;
        return isUserContent && !isBackground && !isSystemObject;
    });

    console.log('\n🎯 FILTERED DESIGN OBJECTS:');
    console.log('Design objects count:', designObjects.length);
    designObjects.forEach((obj, index) => {
        const bounds = obj.getBoundingRect();
        console.log(`Design Object ${index}:`, {
            type: obj.type,
            bounds: bounds,
            absolutePosition: {
                left: bounds.left,
                top: bounds.top,
                right: bounds.left + bounds.width,
                bottom: bounds.top + bounds.height
            }
        });
    });

    // STEP 3: View and Print Area Analysis
    console.log('\n🔍 STEP 3: VIEW AND PRINT AREA ANALYSIS');
    console.log('----------------------------------------');

    const template = designer.templates?.get(designer.activeTemplateId);
    const variation = template?.variations?.get(designer.currentVariation?.toString());

    console.log('Template info:', {
        activeTemplateId: designer.activeTemplateId,
        currentVariation: designer.currentVariation,
        currentView: designer.currentView
    });

    if (variation?.views) {
        console.log('\nAll available views:');
        variation.views.forEach((viewData, viewId) => {
            console.log(`\nView ${viewData.name} (${viewId}):`);
            console.log('  Full view data:', viewData);

            if (viewData.safeZone) {
                console.log('  SafeZone:', viewData.safeZone);
            }
            if (viewData.printArea) {
                console.log('  PrintArea:', viewData.printArea);
            }
        });
    }

    // STEP 4: Test Print Area Calculation
    console.log('\n🧮 STEP 4: PRINT AREA CALCULATION TEST');
    console.log('---------------------------------------');

    function testPrintAreaCalculation(viewId) {
        console.log(`\nTesting print area for view ${viewId}:`);

        const template = designer.templates?.get(designer.activeTemplateId);
        const variation = template?.variations?.get(designer.currentVariation?.toString());
        const view = variation?.views?.get(viewId?.toString());

        if (view?.safeZone) {
            console.log('✅ Found safeZone:', view.safeZone);
            return {
                left: view.safeZone.left,
                top: view.safeZone.top,
                width: view.safeZone.width,
                height: view.safeZone.height
            };
        }

        console.warn('⚠️ No safeZone found, using fallback');
        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;
        return {
            left: canvasWidth * 0.1,
            top: canvasHeight * 0.1,
            width: canvasWidth * 0.8,
            height: canvasHeight * 0.8
        };
    }

    if (variation?.views) {
        variation.views.forEach((viewData, viewId) => {
            const printArea = testPrintAreaCalculation(viewId);
            console.log(`View ${viewData.name} print area:`, printArea);

            // Check if design objects are within print area
            console.log('\n🎯 CHECKING IF DESIGN OBJECTS ARE IN PRINT AREA:');
            designObjects.forEach((obj, index) => {
                const bounds = obj.getBoundingRect();
                const inPrintArea = {
                    leftIn: bounds.left >= printArea.left,
                    rightIn: (bounds.left + bounds.width) <= (printArea.left + printArea.width),
                    topIn: bounds.top >= printArea.top,
                    bottomIn: (bounds.top + bounds.height) <= (printArea.top + printArea.height)
                };
                const fullyInside = inPrintArea.leftIn && inPrintArea.rightIn && inPrintArea.topIn && inPrintArea.bottomIn;

                console.log(`Design Object ${index} vs ${viewData.name} print area:`, {
                    objectBounds: bounds,
                    printArea: printArea,
                    checks: inPrintArea,
                    fullyInside: fullyInside,
                    overlaps: !(bounds.left > printArea.left + printArea.width ||
                               bounds.left + bounds.width < printArea.left ||
                               bounds.top > printArea.top + printArea.height ||
                               bounds.top + bounds.height < printArea.top)
                });
            });
        });
    }

    // STEP 5: Test Full Canvas Export
    console.log('\n📸 STEP 5: TEST FULL CANVAS EXPORT');
    console.log('-----------------------------------');

    try {
        // Hide background objects like the PNG generation does
        const hiddenObjects = [];
        allObjects.forEach(obj => {
            const isBackground = obj.isBackground === true ||
                               (obj.type === 'image' && obj.selectable === false) ||
                               obj.excludeFromExport === true;
            if (isBackground && obj.visible) {
                obj.visible = false;
                hiddenObjects.push(obj);
            }
        });

        canvas.renderAll();

        console.log('🎭 Hidden objects for export:', hiddenObjects.length);

        // Test full canvas export
        const fullCanvasDataURL = canvas.toDataURL({
            format: 'png',
            quality: 1,
            multiplier: 1 // Use 1 for testing to see results faster
        });

        console.log('📸 Full canvas export result:', {
            length: fullCanvasDataURL.length,
            startsWithDataImage: fullCanvasDataURL.startsWith('data:image'),
            first50Chars: fullCanvasDataURL.substring(0, 50)
        });

        // Restore hidden objects
        hiddenObjects.forEach(obj => obj.visible = true);
        canvas.renderAll();

        console.log('🔍 Testing if full canvas contains visible content...');

        // Create a test image to check if it's actually empty
        const testImg = new Image();
        testImg.onload = function() {
            console.log('✅ Full canvas image loaded successfully:', {
                width: testImg.width,
                height: testImg.height,
                naturalWidth: testImg.naturalWidth,
                naturalHeight: testImg.naturalHeight
            });

            // Test pixel data to see if it's actually empty
            const testCanvas = document.createElement('canvas');
            testCanvas.width = testImg.width;
            testCanvas.height = testImg.height;
            const testCtx = testCanvas.getContext('2d');
            testCtx.drawImage(testImg, 0, 0);

            // Sample a few pixels to see if they're transparent
            const samplePixels = [];
            for (let i = 0; i < 10; i++) {
                const x = Math.floor(Math.random() * testImg.width);
                const y = Math.floor(Math.random() * testImg.height);
                const pixelData = testCtx.getImageData(x, y, 1, 1).data;
                samplePixels.push({
                    x, y,
                    r: pixelData[0],
                    g: pixelData[1],
                    b: pixelData[2],
                    a: pixelData[3]
                });
            }

            console.log('🎨 Sample pixels from full canvas:', samplePixels);

            const nonTransparentPixels = samplePixels.filter(p => p.a > 0);
            console.log(`📊 Non-transparent pixels: ${nonTransparentPixels.length}/10`);

            if (nonTransparentPixels.length === 0) {
                console.error('❌ PROBLEM: Full canvas appears to be completely transparent!');
            } else {
                console.log('✅ Full canvas has visible content');
            }
        };

        testImg.onerror = function() {
            console.error('❌ Failed to load full canvas image for testing');
        };

        testImg.src = fullCanvasDataURL;

    } catch (error) {
        console.error('❌ Error during full canvas export test:', error);
    }

    // STEP 6: Test Crop Function with Sample Data
    console.log('\n✂️ STEP 6: TEST CROP FUNCTION');
    console.log('------------------------------');

    // Get current view print area for testing
    const currentView = variation?.views?.get(designer.currentView?.toString());
    if (currentView) {
        const printArea = testPrintAreaCalculation(designer.currentView);
        const multiplier = 1; // Use 1 for testing

        const cropArea = {
            left: printArea.left * multiplier,
            top: printArea.top * multiplier,
            width: printArea.width * multiplier,
            height: printArea.height * multiplier
        };

        console.log('🔍 Testing crop with area:', cropArea);
        console.log('📐 Canvas dimensions for crop:', {
            width: canvas.width,
            height: canvas.height
        });

        // Validate crop bounds
        const cropValid = cropArea.left >= 0 &&
                         cropArea.top >= 0 &&
                         (cropArea.left + cropArea.width) <= canvas.width &&
                         (cropArea.top + cropArea.height) <= canvas.height;

        console.log('✅ Crop area validation:', {
            leftValid: cropArea.left >= 0,
            topValid: cropArea.top >= 0,
            rightValid: (cropArea.left + cropArea.width) <= canvas.width,
            bottomValid: (cropArea.top + cropArea.height) <= canvas.height,
            overallValid: cropValid
        });

        if (!cropValid) {
            console.error('❌ PROBLEM: Crop area exceeds canvas bounds!');
            console.error('Crop bounds vs canvas:', {
                cropRight: cropArea.left + cropArea.width,
                cropBottom: cropArea.top + cropArea.height,
                canvasWidth: canvas.width,
                canvasHeight: canvas.height
            });
        }
    }

    console.log('\n===========================================');
    console.log('🔍 COMPREHENSIVE PNG DEBUG ANALYSIS DONE');
    console.log('===========================================');

    // Return summary for further analysis
    return {
        canvasSize: { width: canvas.width, height: canvas.height },
        totalObjects: allObjects.length,
        designObjects: designObjects.length,
        currentView: designer.currentView,
        template: designer.activeTemplateId,
        variation: designer.currentVariation
    };
};

// Quick test functions for specific issues
window.testPNGGeneration = function() {
    console.log('🧪 QUICK PNG TEST: Starting...');

    if (typeof window.generatePNGForDownload === 'function') {
        console.log('✅ generatePNGForDownload function exists');

        window.generatePNGForDownload().then(result => {
            console.log('🎯 PNG Generation Result:', {
                success: !!result,
                length: result ? result.length : 0,
                type: typeof result
            });
        }).catch(error => {
            console.error('❌ PNG Generation Error:', error);
        });
    } else {
        console.error('❌ generatePNGForDownload function not found');
    }
};

window.analyzeCanvasContent = function() {
    console.log('🎨 CANVAS CONTENT ANALYSIS: Starting...');

    const designer = window.designerInstance;
    if (!designer?.fabricCanvas) {
        console.error('❌ No canvas found');
        return;
    }

    const canvas = designer.fabricCanvas;
    const objects = canvas.getObjects();

    console.log('📊 Canvas Content Summary:');
    const summary = {
        totalObjects: objects.length,
        backgrounds: 0,
        userContent: 0,
        systemObjects: 0,
        invisible: 0
    };

    objects.forEach(obj => {
        if (obj.isBackground === true || (obj.type === 'image' && obj.selectable === false)) {
            summary.backgrounds++;
        } else if (obj.excludeFromExport === true) {
            summary.systemObjects++;
        } else if (obj.selectable === true && obj.visible === true) {
            summary.userContent++;
        }

        if (!obj.visible) {
            summary.invisible++;
        }
    });

    console.log('Content breakdown:', summary);

    // Test canvas with only user content visible
    const designObjects = objects.filter(obj => {
        const isBackground = obj.isBackground === true || (obj.type === 'image' && obj.selectable === false);
        const isSystemObject = obj.excludeFromExport === true;
        return obj.selectable === true && obj.visible === true && !isBackground && !isSystemObject;
    });

    console.log(`📋 Design objects (${designObjects.length}):`,
        designObjects.map(obj => ({
            type: obj.type,
            bounds: obj.getBoundingRect(),
            visible: obj.visible
        }))
    );
};

// Auto-run when script is loaded
console.log('🎯 PNG Debug System loaded. Available commands:');
console.log('- debugCanvasSnapshotPNG() - Full analysis');
console.log('- testPNGGeneration() - Quick PNG test');
console.log('- analyzeCanvasContent() - Canvas content analysis');

// Auto-run basic analysis if designer is ready
if (window.designerInstance) {
    console.log('🚀 Designer found - running quick analysis...');
    setTimeout(() => analyzeCanvasContent(), 1000);
} else {
    console.log('⏳ Waiting for designer instance...');
}