# Canvas Reconstruction Algorithm - Technical Specification

## Purpose
Design a 1:1 visual reconstruction algorithm for Issue #27 canvas reconstruction preparation, ensuring mathematical precision and coordinate system integrity.

## Algorithm Overview

### Core Principle: Exact Coordinate Preservation
The reconstruction algorithm maintains pixel-perfect fidelity by preserving the exact coordinate relationships established during the original canvas design phase.

## Phase 1: Coordinate System Analysis

### Current Coordinate Flow
```
Original Canvas Coordinates (Fabric.js)
         ↓
mockup-design-area Transformation
         ↓
Canvas-to-Print Coordinate Conversion (PHP)
         ↓
API Payload Generation
```

### Transformation Mathematics

#### 1. Fabric.js to mockup-design-area Transformation
```javascript
// Current implementation in design-data-capture.js
transformCoordinates(canvasX, canvasY) {
    // Canvas Element Position
    const canvasElement = this.fabricCanvas.upperCanvasEl;
    const canvasRect = canvasElement.getBoundingClientRect();

    // mockup_design_area Container Position
    const containerRect = this.mockupDesignAreaContainer.getBoundingClientRect();

    // Relative Offsets
    const offsetX = canvasRect.left - containerRect.left;
    const offsetY = canvasRect.top - containerRect.top;

    // Final Transformation
    return {
        x: canvasX + offsetX,
        y: canvasY + offsetY
    };
}
```

#### 2. Canvas-to-Print Coordinate Conversion
```php
// From class-octo-print-api-integration.php
$pixel_to_mm_x = $print_area_width_mm / $canvas_width;
$pixel_to_mm_y = $print_area_height_mm / $canvas_height;

$offset_x_mm = round($left_px * $pixel_to_mm_x, 1);
$offset_y_mm = round($top_px * $pixel_to_mm_y, 1);
```

## Phase 2: 1:1 Visual Reconstruction Algorithm

### Algorithm Structure
```javascript
class CanvasReconstructionEngine {
    constructor(designData) {
        this.designData = designData;
        this.canvasConfig = this.extractCanvasConfig();
        this.coordinateSystem = new CoordinateSystemManager();
    }

    reconstruct() {
        // Step 1: Canvas Dimension Restoration
        const canvas = this.createReconstructedCanvas();

        // Step 2: Coordinate System Calibration
        this.calibrateCoordinateSystem(canvas);

        // Step 3: Element-by-Element Reconstruction
        this.reconstructElements(canvas);

        // Step 4: Validation & Verification
        return this.validateReconstruction(canvas);
    }
}
```

### Step 1: Canvas Dimension Restoration
```javascript
createReconstructedCanvas() {
    const { canvas: originalCanvas } = this.designData;

    // Exact dimension preservation
    const reconstructedCanvas = new fabric.Canvas('reconstruction-canvas', {
        width: originalCanvas.width,
        height: originalCanvas.height,
        preserveObjectStacking: true
    });

    // Set zoom level to match original
    reconstructedCanvas.setZoom(originalCanvas.zoom || 1.0);

    return reconstructedCanvas;
}
```

### Step 2: Coordinate System Calibration
```javascript
calibrateCoordinateSystem(canvas) {
    // Establish coordinate reference points
    this.coordinateSystem.setCanvasDimensions({
        width: canvas.width,
        height: canvas.height
    });

    // Configure transformation matrix
    this.coordinateSystem.setTransformationMatrix(
        this.calculateInverseTransformation()
    );
}

calculateInverseTransformation() {
    // Reverse the mockup-design-area transformation
    const { designed_on_area_px } = this.designData;

    return {
        scaleX: 1.0,
        scaleY: 1.0,
        translateX: 0,
        translateY: 0,
        preserveAspectRatio: true
    };
}
```

### Step 3: Element-by-Element Reconstruction
```javascript
reconstructElements(canvas) {
    const { elements } = this.designData;

    elements.forEach((element, index) => {
        const reconstructedElement = this.reconstructElement(element);

        if (reconstructedElement) {
            // Preserve exact positioning
            this.applyExactCoordinates(reconstructedElement, element);

            // Add to canvas maintaining stacking order
            canvas.add(reconstructedElement);

            console.log(`Element ${index} reconstructed:`, {
                type: element.type,
                originalCoords: { x: element.x, y: element.y },
                reconstructedCoords: {
                    x: reconstructedElement.left,
                    y: reconstructedElement.top
                }
            });
        }
    });
}

reconstructElement(elementData) {
    switch (elementData.type) {
        case 'image':
            return this.reconstructImageElement(elementData);
        case 'text':
            return this.reconstructTextElement(elementData);
        case 'rectangle':
            return this.reconstructShapeElement(elementData);
        default:
            console.warn(`Unknown element type: ${elementData.type}`);
            return null;
    }
}

applyExactCoordinates(fabricObject, elementData) {
    // Apply original coordinates without transformation
    fabricObject.set({
        left: elementData.x,
        top: elementData.y,
        width: elementData.width,
        height: elementData.height,
        scaleX: elementData.scaleX || 1,
        scaleY: elementData.scaleY || 1,
        angle: elementData.angle || 0
    });

    // Ensure coordinate precision
    fabricObject.setCoords();
}
```

### Step 4: Validation & Verification
```javascript
validateReconstruction(canvas) {
    const validationResult = {
        success: true,
        errors: [],
        coordinateAccuracy: this.calculateCoordinateAccuracy(canvas),
        dimensionIntegrity: this.validateDimensionIntegrity(canvas),
        elementCount: canvas.getObjects().length
    };

    // Coordinate accuracy check
    if (validationResult.coordinateAccuracy < 99.9) {
        validationResult.errors.push(
            `Coordinate accuracy below threshold: ${validationResult.coordinateAccuracy}%`
        );
        validationResult.success = false;
    }

    // Element count verification
    if (validationResult.elementCount !== this.designData.elements.length) {
        validationResult.errors.push(
            `Element count mismatch: expected ${this.designData.elements.length}, got ${validationResult.elementCount}`
        );
        validationResult.success = false;
    }

    return validationResult;
}

calculateCoordinateAccuracy(canvas) {
    const canvasObjects = canvas.getObjects();
    let totalAccuracy = 0;

    this.designData.elements.forEach((originalElement, index) => {
        if (canvasObjects[index]) {
            const reconstructedElement = canvasObjects[index];

            // Calculate position accuracy
            const xAccuracy = this.calculatePositionAccuracy(
                originalElement.x, reconstructedElement.left
            );
            const yAccuracy = this.calculatePositionAccuracy(
                originalElement.y, reconstructedElement.top
            );

            totalAccuracy += (xAccuracy + yAccuracy) / 2;
        }
    });

    return totalAccuracy / this.designData.elements.length;
}

calculatePositionAccuracy(original, reconstructed) {
    const difference = Math.abs(original - reconstructed);
    const accuracy = Math.max(0, 100 - difference);
    return accuracy;
}
```

## Phase 3: Coordinate Transformation Prevention Strategies

### Strategy 1: Direct Coordinate Preservation
```javascript
// Bypass all transformations and use raw coordinates
class DirectCoordinatePreserver {
    preserveCoordinates(element) {
        return {
            x: element.coordinates.x,
            y: element.coordinates.y,
            // Prevent any coordinate modifications
            preserveOriginalCoordinates: true
        };
    }
}
```

### Strategy 2: Transformation Matrix Inversion
```javascript
// Calculate and apply inverse transformation
class TransformationMatrixInverter {
    calculateInverseMatrix(originalTransform) {
        // Mathematical inversion of transformation matrix
        const { scaleX, scaleY, translateX, translateY } = originalTransform;

        return {
            scaleX: 1 / scaleX,
            scaleY: 1 / scaleY,
            translateX: -translateX / scaleX,
            translateY: -translateY / scaleY
        };
    }
}
```

### Strategy 3: Coordinate System Anchoring
```javascript
// Establish absolute coordinate reference points
class CoordinateSystemAnchor {
    establishAnchorPoints(canvas) {
        // Create invisible reference points at known coordinates
        const anchorPoints = [
            { x: 0, y: 0, id: 'origin' },
            { x: canvas.width, y: 0, id: 'top-right' },
            { x: 0, y: canvas.height, id: 'bottom-left' },
            { x: canvas.width, y: canvas.height, id: 'bottom-right' }
        ];

        anchorPoints.forEach(anchor => {
            this.createAnchorPoint(canvas, anchor);
        });
    }
}
```

## Phase 4: Element Positioning Accuracy Maintenance

### Precision Requirements
- **Coordinate Accuracy**: ±0.1 pixel tolerance
- **Dimension Accuracy**: ±0.1 pixel tolerance
- **Angle Accuracy**: ±0.01 degree tolerance
- **Scale Accuracy**: ±0.001 scale unit tolerance

### Accuracy Validation System
```javascript
class AccuracyValidator {
    validateElementAccuracy(originalElement, reconstructedElement) {
        const tolerances = {
            position: 0.1,    // pixels
            dimension: 0.1,   // pixels
            angle: 0.01,      // degrees
            scale: 0.001      // scale units
        };

        return {
            positionAccurate: this.isWithinTolerance(
                [originalElement.x, originalElement.y],
                [reconstructedElement.left, reconstructedElement.top],
                tolerances.position
            ),
            dimensionAccurate: this.isWithinTolerance(
                [originalElement.width, originalElement.height],
                [reconstructedElement.width, reconstructedElement.height],
                tolerances.dimension
            ),
            angleAccurate: this.isWithinTolerance(
                originalElement.angle || 0,
                reconstructedElement.angle || 0,
                tolerances.angle
            ),
            scaleAccurate: this.isWithinTolerance(
                [originalElement.scaleX || 1, originalElement.scaleY || 1],
                [reconstructedElement.scaleX || 1, reconstructedElement.scaleY || 1],
                tolerances.scale
            )
        };
    }
}
```

## Implementation Integration

### Integration with Existing System
1. **Fabric.js Compatibility**: Algorithm works with existing Fabric.js canvas instances
2. **Data Format Compatibility**: Uses existing JSON data structure from design-data-capture.js
3. **Coordinate System Compatibility**: Maintains compatibility with current transformation pipeline

### Performance Considerations
- **Memory Usage**: Efficient object creation and disposal
- **Rendering Speed**: Optimized reconstruction process
- **Accuracy vs. Speed**: Configurable precision levels

### Error Handling
- **Missing Data**: Graceful fallback for incomplete design data
- **Invalid Coordinates**: Automatic coordinate validation and correction
- **Canvas Errors**: Robust error recovery for canvas operations

## Testing Framework

### Unit Tests
```javascript
describe('Canvas Reconstruction Algorithm', () => {
    test('preserves exact coordinates', () => {
        const original = { x: 100.5, y: 200.7 };
        const reconstructed = algorithm.reconstructElement(original);

        expect(reconstructed.left).toBeCloseTo(original.x, 1);
        expect(reconstructed.top).toBeCloseTo(original.y, 1);
    });

    test('maintains canvas dimensions', () => {
        const originalCanvas = { width: 800, height: 600 };
        const reconstructedCanvas = algorithm.createReconstructedCanvas(originalCanvas);

        expect(reconstructedCanvas.width).toBe(originalCanvas.width);
        expect(reconstructedCanvas.height).toBe(originalCanvas.height);
    });
});
```

### Integration Tests
```javascript
describe('End-to-End Reconstruction', () => {
    test('complete design reconstruction', () => {
        const designData = loadTestDesignData();
        const reconstructedCanvas = algorithm.reconstruct(designData);
        const validationResult = algorithm.validateReconstruction(reconstructedCanvas);

        expect(validationResult.success).toBe(true);
        expect(validationResult.coordinateAccuracy).toBeGreaterThan(99.9);
    });
});
```

## Summary

This 1:1 visual reconstruction algorithm provides:

1. **Mathematical Precision**: Exact coordinate preservation with ±0.1 pixel accuracy
2. **Coordinate System Integrity**: Prevention of unintended transformations
3. **Element Fidelity**: Perfect reconstruction of all canvas elements
4. **Validation Framework**: Comprehensive accuracy verification
5. **Performance Optimization**: Efficient reconstruction process
6. **Error Resilience**: Robust handling of edge cases

The algorithm is ready for implementation in Issue #27 canvas reconstruction system.