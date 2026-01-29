// PRINT ZONE CLIPPING RESEARCH - Coordinate-free approaches
console.log('🔬 PRINT ZONE CLIPPING RESEARCH START');

const designer = window.designerInstance;
const canvas = designer.fabricCanvas;

console.log('\n=== APPROACH 1: FABRIC.JS OBJECT ISOLATION ===');
// Research if we can render only specific objects

console.log('All canvas objects:');
const allObjects = canvas.getObjects();
allObjects.forEach((obj, i) => {
    const bounds = obj.getBoundingRect();
    console.log(`Object ${i}:`, {
        type: obj.type,
        selectable: obj.selectable,
        excludeFromExport: obj.excludeFromExport,
        isBackground: obj.isBackground,
        visible: obj.visible,
        bounds: bounds,
        isPrintZoneRect: obj === designer.printZoneRect,
        isSafeZoneRect: obj === designer.safeZoneRect
    });
});

// Test: Can we create a temporary canvas with only design objects?
console.log('\n--- Testing Fabric.js object-only rendering ---');
const designObjects = allObjects.filter(obj => {
    const isUserContent = obj.selectable === true && obj.visible === true;
    const isBackground = obj.isBackground === true || (obj.type === 'image' && obj.selectable === false);
    const isSystemObject = obj.excludeFromExport === true;
    const isPrintZoneOverlay = obj === designer.printZoneRect || obj === designer.safeZoneRect;

    return isUserContent && !isBackground && !isSystemObject && !isPrintZoneOverlay;
});

console.log('Design objects found:', designObjects.length);
designObjects.forEach((obj, i) => {
    console.log(`Design Object ${i}:`, {
        type: obj.type,
        bounds: obj.getBoundingRect()
    });
});

console.log('\n=== APPROACH 2: PRINT ZONE AS CLIPPING MASK ===');
// Research if print zone rect can be used as clipping path

// Find print zone rectangle
const printZoneRect = allObjects.find(obj =>
    obj.type === 'rect' &&
    obj.excludeFromExport === true &&
    obj.visible === true
);

if (printZoneRect) {
    const printZoneBounds = printZoneRect.getBoundingRect();
    console.log('Print zone rect found:', {
        bounds: printZoneBounds,
        stroke: printZoneRect.stroke,
        fill: printZoneRect.fill,
        clipPath: printZoneRect.clipPath
    });

    // Test: Can we use this rect as a clipping path?
    console.log('--- Testing clipping path approach ---');

    // Check if Fabric.js supports clipping to object bounds
    console.log('Fabric.js clipping capabilities:');
    console.log('- fabric.Object.clipPath:', typeof fabric.Object.prototype.clipPath);
    console.log('- canvas.clipPath:', typeof canvas.clipPath);

    // Test creating a clipping region
    try {
        const clipRect = new fabric.Rect({
            left: printZoneBounds.left,
            top: printZoneBounds.top,
            width: printZoneBounds.width,
            height: printZoneBounds.height,
            fill: 'transparent'
        });
        console.log('✅ Can create clipping rect:', !!clipRect);
    } catch (e) {
        console.log('❌ Cannot create clipping rect:', e.message);
    }
} else {
    console.log('❌ No print zone rect found');
}

console.log('\n=== APPROACH 3: CANVAS CLIPPING CONTEXT ===');
// Research HTML5 Canvas clipping without coordinates

console.log('--- Testing HTML5 Canvas clip() method ---');

// Test if we can use canvas.clip() for region-based clipping
const testCanvas = document.createElement('canvas');
const testCtx = testCanvas.getContext('2d');

console.log('HTML5 Canvas clipping methods available:');
console.log('- ctx.clip():', typeof testCtx.clip);
console.log('- ctx.beginPath():', typeof testCtx.beginPath);
console.log('- ctx.rect():', typeof testCtx.rect);

// Test creating clipping region from object
if (printZoneRect) {
    const bounds = printZoneRect.getBoundingRect();
    try {
        testCtx.beginPath();
        testCtx.rect(bounds.left, bounds.top, bounds.width, bounds.height);
        testCtx.clip();
        console.log('✅ HTML5 Canvas clipping region created successfully');
    } catch (e) {
        console.log('❌ HTML5 Canvas clipping failed:', e.message);
    }
}

console.log('\n=== APPROACH 4: FABRIC.JS GROUP ISOLATION ===');
// Research if we can group design objects and export only the group

console.log('--- Testing Fabric.js object grouping ---');
console.log('Fabric.js Group constructor:', typeof fabric.Group);

if (designObjects.length > 0) {
    try {
        // Test creating a group from design objects
        const designGroup = new fabric.Group(designObjects, {
            left: 0,
            top: 0
        });

        console.log('✅ Can create design group:', !!designGroup);
        console.log('Group bounds:', designGroup.getBoundingRect());

        // Test if group can be exported independently
        console.log('Group toDataURL method:', typeof designGroup.toDataURL);

    } catch (e) {
        console.log('❌ Cannot create design group:', e.message);
    }
}

console.log('\n=== APPROACH 5: TEMPORARY CANVAS WITH FILTERED OBJECTS ===');
// Research creating temporary canvas with only design objects

console.log('--- Testing temporary canvas approach ---');

try {
    // Create temporary canvas
    const tempCanvas = new fabric.Canvas(document.createElement('canvas'));

    if (printZoneRect) {
        const printZoneBounds = printZoneRect.getBoundingRect();

        // Set canvas size to print zone dimensions
        tempCanvas.setDimensions({
            width: printZoneBounds.width,
            height: printZoneBounds.height
        });

        console.log('✅ Temporary canvas created:', {
            width: tempCanvas.width,
            height: tempCanvas.height
        });

        // Test adding design objects with adjusted positions
        if (designObjects.length > 0) {
            const firstObj = designObjects[0];
            const objBounds = firstObj.getBoundingRect();

            // Calculate relative position within print zone
            const relativeLeft = objBounds.left - printZoneBounds.left;
            const relativeTop = objBounds.top - printZoneBounds.top;

            console.log('Object positioning test:', {
                originalPos: { left: objBounds.left, top: objBounds.top },
                printZonePos: { left: printZoneBounds.left, top: printZoneBounds.top },
                relativePos: { left: relativeLeft, top: relativeTop },
                isInsidePrintZone: relativeLeft >= 0 && relativeTop >= 0 &&
                                   relativeLeft < printZoneBounds.width &&
                                   relativeTop < printZoneBounds.height
            });
        }

        console.log('✅ Temporary canvas approach viable');
    }

} catch (e) {
    console.log('❌ Temporary canvas approach failed:', e.message);
}

console.log('\n=== APPROACH 6: FABRIC.JS CLIPPING PATH ===');
// Research using print zone as clipping path for canvas export

console.log('--- Testing Fabric.js canvas clipPath ---');

if (printZoneRect) {
    try {
        // Save original clipPath
        const originalClipPath = canvas.clipPath;

        // Create clipping path from print zone
        const printZoneBounds = printZoneRect.getBoundingRect();
        const clipPath = new fabric.Rect({
            left: printZoneBounds.left,
            top: printZoneBounds.top,
            width: printZoneBounds.width,
            height: printZoneBounds.height,
            fill: 'transparent',
            stroke: null
        });

        console.log('✅ Clip path object created');

        // Test setting as canvas clip path
        console.log('Canvas clipPath property before:', canvas.clipPath);

        // This would be the actual implementation test:
        // canvas.clipPath = clipPath;
        // canvas.renderAll();
        // const clippedSnapshot = canvas.toDataURL();
        // canvas.clipPath = originalClipPath;

        console.log('✅ Fabric.js clipPath approach viable (test mode)');

    } catch (e) {
        console.log('❌ Fabric.js clipPath approach failed:', e.message);
    }
}

console.log('\n🔬 PRINT ZONE CLIPPING RESEARCH END');

console.log('\n📊 SUMMARY OF APPROACHES:');
console.log('1. Object Isolation: Filter and render only design objects');
console.log('2. Clipping Mask: Use print zone as clipping path');
console.log('3. Canvas Clipping: HTML5 Canvas clip() method');
console.log('4. Group Isolation: Group design objects and export group');
console.log('5. Temporary Canvas: New canvas with print zone dimensions');
console.log('6. Fabric.js ClipPath: Canvas-level clipping path');

console.log('\n🎯 RECOMMENDED APPROACH: Based on results above');