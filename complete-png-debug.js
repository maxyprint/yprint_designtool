// COMPLETE PNG DEBUG ANALYSIS - Copy this entire code into browser console
console.log('🔍 COMPLETE PNG DEBUG START - Analyzing entire system');

function completePNGDebug() {
    const designer = window.designerInstance;

    if (!designer?.fabricCanvas) {
        console.error('❌ No designer or canvas found');
        return;
    }

    const canvas = designer.fabricCanvas;

    console.log('\n=== 1. CANVAS STATE ANALYSIS ===');
    console.log('Canvas dimensions:', canvas.width, 'x', canvas.height);
    console.log('Current view:', designer.currentView);
    console.log('Active template ID:', designer.activeTemplateId);
    console.log('Current variation:', designer.currentVariation);

    console.log('\n=== 2. ALL CANVAS OBJECTS ANALYSIS ===');
    const allObjects = canvas.getObjects();
    console.log(`Total objects on canvas: ${allObjects.length}`);

    allObjects.forEach((obj, i) => {
        const bounds = obj.getBoundingRect();
        console.log(`Object ${i}:`, {
            type: obj.type,
            visible: obj.visible,
            selectable: obj.selectable,
            isBackground: obj.isBackground,
            excludeFromExport: obj.excludeFromExport,
            bounds: bounds,
            isPrintZoneRect: obj === designer.printZoneRect,
            isSafeZoneRect: obj === designer.safeZoneRect,
            stroke: obj.stroke,
            fill: obj.fill,
            className: obj.className,
            isPrintZone: obj.isPrintZone
        });
    });

    console.log('\n=== 3. DESIGN OBJECTS FILTERING ===');
    const designObjects = allObjects.filter(obj => {
        const isBackground = obj.isBackground === true ||
                           (obj.type === 'image' && obj.selectable === false);
        const isSystemObject = obj.excludeFromExport === true;
        const isPrintZoneOverlay = obj === designer.printZoneRect || obj === designer.safeZoneRect;
        const isUserContent = obj.selectable === true && obj.visible === true;

        const result = isUserContent && !isBackground && !isSystemObject && !isPrintZoneOverlay;

        console.log(`Object filter result:`, {
            type: obj.type,
            isBackground,
            isSystemObject,
            isPrintZoneOverlay,
            isUserContent,
            WILL_BE_INCLUDED: result
        });

        return result;
    });

    console.log(`✅ DESIGN OBJECTS FOUND: ${designObjects.length}`);

    if (designObjects.length === 0) {
        console.error('❌ NO DESIGN OBJECTS - This explains empty PNG!');
        console.log('DEBUG: Check why no objects pass the filter above');
    } else {
        designObjects.forEach((obj, i) => {
            const bounds = obj.getBoundingRect();
            console.log(`Design Object ${i}:`, {
                type: obj.type,
                bounds: bounds,
                visible: obj.visible,
                opacity: obj.opacity
            });
        });
    }

    console.log('\n=== 4. PRINT ZONE DETECTION TEST ===');

    // Test getCurrentPrintZoneFromCanvas function
    if (typeof getCurrentPrintZoneFromCanvas === 'function') {
        console.log('Testing getCurrentPrintZoneFromCanvas...');
        const livePrintZone = getCurrentPrintZoneFromCanvas(canvas, designer);
        console.log('Live print zone result:', livePrintZone);
    } else {
        console.log('getCurrentPrintZoneFromCanvas function not found');
    }

    // Manual print zone detection
    console.log('\nManual print zone detection:');
    console.log('designer.printZoneRect:', designer.printZoneRect ? {
        visible: designer.printZoneRect.visible,
        bounds: designer.printZoneRect.getBoundingRect()
    } : 'NOT FOUND');

    console.log('designer.safeZoneRect:', designer.safeZoneRect ? {
        visible: designer.safeZoneRect.visible,
        bounds: designer.safeZoneRect.getBoundingRect()
    } : 'NOT FOUND');

    console.log('\n=== 5. TEMPLATE DATA ANALYSIS ===');
    const template = designer.templates?.get(designer.activeTemplateId);
    const variation = template?.variations?.get(designer.currentVariation?.toString());

    console.log('Template found:', !!template);
    console.log('Variation found:', !!variation);

    if (variation?.views) {
        console.log('Available views:');
        variation.views.forEach((viewData, viewId) => {
            console.log(`View ${viewData.name} (${viewId}):`, {
                safeZone: viewData.safeZone,
                printArea: viewData.printArea
            });
        });
    }

    console.log('\n=== 6. PNG GENERATION FUNCTIONS TEST ===');
    console.log('generatePNGForDownload available:', typeof window.generatePNGForDownload === 'function');
    console.log('generatePNGForSave available:', typeof window.generatePNGForSave === 'function');

    console.log('\n=== 7. CANVAS SNAPSHOT TEST ===');
    console.log('Testing canvas toDataURL...');

    try {
        const testSnapshot = canvas.toDataURL({
            format: 'png',
            quality: 1,
            multiplier: 1 // Small multiplier for test
        });

        console.log('Canvas snapshot test result:', {
            success: !!testSnapshot,
            length: testSnapshot?.length || 0,
            startsWithData: testSnapshot?.startsWith('data:image') || false
        });

        if (testSnapshot && testSnapshot.length > 1000) {
            console.log('✅ Canvas can generate snapshots');

            // Test if snapshot contains content by checking if it's not just a blank canvas
            const img = new Image();
            img.onload = function() {
                console.log('Test snapshot image loaded:', {
                    width: this.naturalWidth,
                    height: this.naturalHeight
                });

                // Create a small canvas to test if image has content
                const testCanvas = document.createElement('canvas');
                const testCtx = testCanvas.getContext('2d');
                testCanvas.width = 50;
                testCanvas.height = 50;
                testCtx.drawImage(this, 0, 0, 50, 50);

                const imageData = testCtx.getImageData(0, 0, 50, 50);
                const pixels = imageData.data;

                // Check for non-white pixels
                let hasContent = false;
                for (let i = 0; i < pixels.length; i += 4) {
                    const r = pixels[i];
                    const g = pixels[i + 1];
                    const b = pixels[i + 2];
                    const a = pixels[i + 3];

                    // If pixel is not white/transparent, we have content
                    if (a > 0 && (r < 250 || g < 250 || b < 250)) {
                        hasContent = true;
                        break;
                    }
                }

                console.log('Canvas content analysis:', {
                    hasNonWhitePixels: hasContent,
                    verdict: hasContent ? '✅ Canvas contains visible content' : '❌ Canvas appears empty/white'
                });
            };
            img.src = testSnapshot;

        } else {
            console.error('❌ Canvas snapshot failed or empty');
        }
    } catch (error) {
        console.error('❌ Canvas snapshot test failed:', error);
    }

    console.log('\n=== 8. OBJECT VISIBILITY TEST ===');
    console.log('Testing if design objects are actually visible on canvas...');

    designObjects.forEach((obj, i) => {
        console.log(`Design Object ${i} visibility:`, {
            visible: obj.visible,
            opacity: obj.opacity,
            left: obj.left,
            top: obj.top,
            width: obj.width || obj.getScaledWidth?.(),
            height: obj.height || obj.getScaledHeight?.(),
            angle: obj.angle,
            scaleX: obj.scaleX,
            scaleY: obj.scaleY
        });
    });

    console.log('\n🔍 COMPLETE PNG DEBUG END - Check results above');

    return {
        canvasObjects: allObjects.length,
        designObjects: designObjects.length,
        templateAvailable: !!template,
        variationAvailable: !!variation,
        printZoneRectAvailable: !!designer.printZoneRect,
        safeZoneRectAvailable: !!designer.safeZoneRect
    };
}

// Run the complete debug analysis
const debugResults = completePNGDebug();
console.log('\n📊 DEBUG SUMMARY:', debugResults);