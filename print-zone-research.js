// Browser console code to research print zone detection approach
console.log('🔬 PRINT ZONE RESEARCH START');

const designer = window.designerInstance;
const canvas = designer.fabricCanvas;

console.log('=== CANVAS OBJECTS ANALYSIS ===');
const allObjects = canvas.getObjects();
console.log('Total objects:', allObjects.length);

allObjects.forEach((obj, i) => {
    console.log(`Object ${i}:`, {
        type: obj.type,
        visible: obj.visible,
        selectable: obj.selectable,
        excludeFromExport: obj.excludeFromExport,
        stroke: obj.stroke,
        fill: obj.fill,
        bounds: obj.getBoundingRect(),
        isDesignerPrintZoneRect: obj === designer.printZoneRect,
        isDesignerSafeZoneRect: obj === designer.safeZoneRect,
        className: obj.className,
        id: obj.id
    });
});

console.log('=== DESIGNER OBJECT ANALYSIS ===');
console.log('designer.printZoneRect:', designer.printZoneRect ? {
    bounds: designer.printZoneRect.getBoundingRect(),
    visible: designer.printZoneRect.visible,
    type: designer.printZoneRect.type
} : 'NOT FOUND');

console.log('designer.safeZoneRect:', designer.safeZoneRect ? {
    bounds: designer.safeZoneRect.getBoundingRect(), 
    visible: designer.safeZoneRect.visible,
    type: designer.safeZoneRect.type
} : 'NOT FOUND');

console.log('=== RECT OBJECTS WITH excludeFromExport ===');
const printZoneRects = allObjects.filter(obj => 
    obj.type === 'rect' && 
    obj.excludeFromExport === true &&
    obj.visible === true
);

printZoneRects.forEach((rect, i) => {
    const bounds = rect.getBoundingRect();
    console.log(`Print Zone Rect ${i}:`, {
        bounds: bounds,
        coverage: {
            x: bounds.width / canvas.width,
            y: bounds.height / canvas.height
        },
        stroke: rect.stroke,
        fill: rect.fill
    });
});

console.log('🔬 PRINT ZONE RESEARCH END');
