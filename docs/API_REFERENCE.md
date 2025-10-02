# Perfect Positioning System - API Reference

## Table of Contents

1. [AdminCanvasRenderer](#admincanvasrenderer)
2. [Configuration Objects](#configuration-objects)
3. [Data Structures](#data-structures)
4. [Helper Functions](#helper-functions)
5. [Design Fidelity Comparator](#designfidelitycomparator)
6. [Usage Examples](#usage-examples)

---

## AdminCanvasRenderer

Main rendering engine for the Perfect Positioning System.

### Constructor

```javascript
new AdminCanvasRenderer()
```

Creates a new canvas renderer instance with default configuration.

**Example:**
```javascript
const renderer = new AdminCanvasRenderer();
```

### Methods

#### init(containerId, options)

Initialize the canvas renderer with a DOM container.

**Parameters:**
- `containerId` (string): ID of the container DOM element
- `options` (Object): Optional configuration
  - `options.canvasDimensions` (Object): Canvas dimensions
    - `width` (number): Canvas width in pixels
    - `height` (number): Canvas height in pixels

**Returns:** `boolean` - Success status

**Example:**
```javascript
renderer.init('canvas-container', {
    canvasDimensions: { width: 780, height: 580 }
});
```

---

#### renderDesign(designData, options)

Render complete design data with all specialized renderers.

**Parameters:**
- `designData` (Object): Complete design data object
  - `objects` (Array): Array of design elements
  - `metadata` (Object): Optional metadata
  - `background` (string): Optional background URL
  - `db_processed_views` (boolean): Legacy data flag
- `options` (Object): Rendering options
  - `backgroundUrl` (string): Override background URL
  - `canvasDimensions` (Object): Override canvas dimensions

**Returns:** `Promise<void>`

**Example:**
```javascript
await renderer.renderDesign(designData, {
    backgroundUrl: 'https://example.com/mockup.png'
});
```

---

#### applyLegacyDataCorrection(designData)

Transform legacy data coordinates to correct positioning issues.

**Parameters:**
- `designData` (Object): Design data to correct

**Returns:** `Object` - Correction result
```javascript
{
    applied: boolean,           // Was correction applied?
    method: string,             // Correction method used
    confidence: number,         // Confidence level (0-1)
    matrix: Object,             // Correction matrix
    elementsTransformed: number // Number of elements corrected
}
```

**Example:**
```javascript
const result = renderer.applyLegacyDataCorrection(designData);
if (result.applied) {
    console.log(`Corrected ${result.elementsTransformed} elements`);
}
```

---

#### extractDesignerOffset(designData)

Extract or calculate designer offset compensation values.

**Parameters:**
- `designData` (Object): Design data with metadata

**Returns:** `void` (sets `this.designerOffset`)

**Side Effects:**
Sets `renderer.designerOffset`:
```javascript
{
    x: number,              // Horizontal offset
    y: number,              // Vertical offset
    detected: boolean,      // Was offset detected?
    source: string          // 'metadata' | 'heuristic' | 'default'
}
```

**Example:**
```javascript
renderer.extractDesignerOffset(designData);
console.log('Offset:', renderer.designerOffset);
```

---

#### extractCanvasScaling(designData)

Extract or calculate canvas dimension scaling factors.

**Parameters:**
- `designData` (Object): Design data with metadata

**Returns:** `void` (sets `this.canvasScaling`)

**Side Effects:**
Sets `renderer.canvasScaling`:
```javascript
{
    scaleX: number,                    // Horizontal scale factor
    scaleY: number,                    // Vertical scale factor
    detected: boolean,                 // Was scaling detected?
    source: string,                    // 'metadata' | 'heuristic' | 'none'
    originalDimensions: Object,        // {width, height}
    currentDimensions: Object          // {width, height}
}
```

**Example:**
```javascript
renderer.extractCanvasScaling(designData);
if (renderer.canvasScaling.detected) {
    console.log(`Scaling: ${renderer.canvasScaling.scaleX}x`);
}
```

---

#### transformCoordinates(left, top)

Transform coordinates through offset and scaling compensation.

**Parameters:**
- `left` (number): Original left coordinate
- `top` (number): Original top coordinate

**Returns:** `Object`
```javascript
{
    x: number,  // Transformed X coordinate
    y: number   // Transformed Y coordinate
}
```

**Example:**
```javascript
const position = renderer.transformCoordinates(500, 300);
console.log(`Transformed: (${position.x}, ${position.y})`);
```

---

#### clearCanvas()

Clear the canvas to white background.

**Parameters:** None

**Returns:** `void`

**Example:**
```javascript
renderer.clearCanvas();
```

---

#### renderBackground(backgroundUrl)

Render background/mockup image on canvas.

**Parameters:**
- `backgroundUrl` (string): URL of background image

**Returns:** `Promise<void>`

**Example:**
```javascript
await renderer.renderBackground('https://example.com/mockup.png');
```

---

#### renderImage(element)

Render image element with exact positioning.

**Parameters:**
- `element` (Object): Image element data
  - `type` (string): 'image'
  - `left` (number): X position
  - `top` (number): Y position
  - `width` (number): Image width
  - `height` (number): Image height
  - `scaleX` (number): Horizontal scale
  - `scaleY` (number): Vertical scale
  - `src` (string): Image URL

**Returns:** `Promise<void>`

**Example:**
```javascript
await renderer.renderImage({
    type: 'image',
    left: 100,
    top: 100,
    width: 200,
    height: 150,
    scaleX: 1.0,
    scaleY: 1.0,
    src: 'logo.jpg'
});
```

---

#### renderText(element)

Render text element with font loading support.

**Parameters:**
- `element` (Object): Text element data
  - `type` (string): 'text' | 'i-text' | 'textbox'
  - `left` (number): X position
  - `top` (number): Y position
  - `text` (string): Text content
  - `fontFamily` (string): Font family
  - `fontSize` (number): Font size in pixels
  - `fontWeight` (string): Font weight
  - `fontStyle` (string): Font style
  - `fill` (string): Text color
  - `stroke` (string): Stroke color (optional)
  - `strokeWidth` (number): Stroke width (optional)

**Returns:** `Promise<void>`

**Example:**
```javascript
await renderer.renderText({
    type: 'text',
    left: 150,
    top: 300,
    text: 'Hello World',
    fontFamily: 'Arial',
    fontSize: 24,
    fontWeight: 'bold',
    fill: '#000000'
});
```

---

#### renderShape(element)

Render shape element (rectangle, circle, ellipse, etc.).

**Parameters:**
- `element` (Object): Shape element data
  - `type` (string): 'rect' | 'circle' | 'ellipse' | 'line' | 'polygon' | 'path'
  - `left` (number): X position
  - `top` (number): Y position
  - `width` (number): Shape width (for rect)
  - `height` (number): Shape height (for rect)
  - `radius` (number): Radius (for circle)
  - `fill` (string): Fill color
  - `stroke` (string): Stroke color (optional)
  - `strokeWidth` (number): Stroke width (optional)

**Returns:** `Promise<void>`

**Example:**
```javascript
await renderer.renderShape({
    type: 'rect',
    left: 400,
    top: 100,
    width: 100,
    height: 100,
    fill: '#ff0000',
    stroke: '#000000',
    strokeWidth: 2
});
```

---

### Properties

#### canvasWidth
Type: `number`
Default: `780`
Description: Design canvas width in pixels

#### canvasHeight
Type: `number`
Default: `580`
Description: Design canvas height in pixels

#### pixelRatio
Type: `number`
Default: `window.devicePixelRatio || 1`
Description: Device pixel ratio for high-DPI displays

#### canvas
Type: `HTMLCanvasElement`
Description: Canvas DOM element

#### ctx
Type: `CanvasRenderingContext2D`
Description: Canvas 2D rendering context

#### imageCache
Type: `Map<string, HTMLImageElement>`
Description: Cache for loaded images

#### coordinatePreservation
Type: `Object`
Description: Coordinate preservation configuration
```javascript
{
    noTransformMode: boolean,
    preserveOriginalCoords: boolean,
    validateCoordinates: boolean,
    allowedTolerance: number
}
```

#### designerOffset
Type: `Object`
Description: Designer offset compensation values
```javascript
{
    x: number,
    y: number,
    detected: boolean,
    source: string
}
```

#### canvasScaling
Type: `Object`
Description: Canvas scaling compensation values
```javascript
{
    scaleX: number,
    scaleY: number,
    detected: boolean,
    source: string,
    originalDimensions: {width, height},
    currentDimensions: {width, height}
}
```

#### renderingStatistics
Type: `Object`
Description: Rendering statistics and diagnostics
```javascript
{
    renderedObjects: Array,
    errors: Array,
    startTime: number,
    endTime: number
}
```

---

## Configuration Objects

### Coordinate Preservation Config

```javascript
coordinatePreservation: {
    noTransformMode: true,          // Disable fabric.js-style transforms
    preserveOriginalCoords: true,   // Keep original coordinates
    validateCoordinates: true,      // Log coordinate changes
    allowedTolerance: 0.1          // Sub-pixel tolerance (px)
}
```

### Image Renderer Config

```javascript
imageRenderer: {
    exactPositioning: true,         // Use exact positioning
    crossOriginSupport: true,       // Handle CORS
    preserveImageScaling: true,     // Keep scaleX/scaleY
    enableImageCaching: true,       // Enable caching
    logImageRender: true           // Log image rendering
}
```

### Text Renderer Config

```javascript
textRenderer: {
    fontLoadingSupport: true,       // Support web fonts
    exactTextPositioning: true,     // Preserve coordinates
    preserveTextScaling: true,      // Keep font scaling
    fontCache: Map,                // Font loading cache
    supportedTextProps: Array,     // Supported properties
    logTextRender: true           // Log text rendering
}
```

### Shape Renderer Config

```javascript
shapeRenderer: {
    exactShapePositioning: true,    // Preserve coordinates
    preserveShapeDimensions: true,  // Keep dimensions
    supportedShapes: Array,        // Supported shape types
    supportedShapeProps: Array,    // Supported properties
    logShapeRender: true          // Log shape rendering
}
```

---

## Data Structures

### Design Data Structure

Complete design data format:

```javascript
{
    // REQUIRED: Array of design elements
    objects: [
        {
            type: 'image',
            left: 100,
            top: 100,
            width: 200,
            height: 150,
            scaleX: 1.0,
            scaleY: 1.0,
            src: 'image.jpg'
        },
        {
            type: 'text',
            left: 150,
            top: 300,
            text: 'Hello',
            fontSize: 24,
            fontFamily: 'Arial',
            fill: '#000000'
        }
    ],

    // OPTIONAL: Metadata for modern data
    metadata: {
        capture_version: '2.0',
        designer_offset: {
            x: 330,
            y: 165
        },
        canvas_dimensions: {
            width: 780,
            height: 580
        },
        timestamp: 1234567890
    },

    // OPTIONAL: Background/mockup URL
    background: 'https://example.com/mockup.png',

    // OPTIONAL: Legacy data flag
    db_processed_views: true
}
```

### Element Types

#### Image Element

```javascript
{
    type: 'image',
    left: number,       // X position
    top: number,        // Y position
    width: number,      // Base width
    height: number,     // Base height
    scaleX: number,     // Horizontal scale (default: 1.0)
    scaleY: number,     // Vertical scale (default: 1.0)
    src: string,        // Image URL
    angle: number       // Rotation angle (optional)
}
```

#### Text Element

```javascript
{
    type: 'text' | 'i-text' | 'textbox',
    left: number,           // X position
    top: number,            // Y position
    text: string,           // Text content
    fontFamily: string,     // Font family (default: 'Arial')
    fontSize: number,       // Font size in pixels (default: 16)
    fontWeight: string,     // 'normal' | 'bold' (default: 'normal')
    fontStyle: string,      // 'normal' | 'italic' (default: 'normal')
    fill: string,           // Text color (default: '#000000')
    stroke: string,         // Stroke color (optional)
    strokeWidth: number,    // Stroke width (optional)
    textAlign: string,      // 'left' | 'center' | 'right' (default: 'left')
    textDecoration: string  // 'underline' | 'line-through' (optional)
}
```

#### Shape Elements

**Rectangle:**
```javascript
{
    type: 'rect' | 'rectangle',
    left: number,
    top: number,
    width: number,
    height: number,
    fill: string,           // Fill color
    stroke: string,         // Stroke color (optional)
    strokeWidth: number,    // Stroke width (optional)
    rx: number,            // Border radius X (optional)
    ry: number             // Border radius Y (optional)
}
```

**Circle:**
```javascript
{
    type: 'circle',
    left: number,       // Center X
    top: number,        // Center Y
    radius: number,     // Circle radius
    fill: string,
    stroke: string,
    strokeWidth: number
}
```

**Ellipse:**
```javascript
{
    type: 'ellipse',
    left: number,       // Center X
    top: number,        // Center Y
    rx: number,         // Radius X
    ry: number,         // Radius Y
    fill: string,
    stroke: string,
    strokeWidth: number
}
```

---

## DesignFidelityComparator

Validates rendering accuracy by comparing original vs rendered metrics.

### Constructor

```javascript
new DesignFidelityComparator(designData)
```

**Parameters:**
- `designData` (Object): Original design data

**Example:**
```javascript
const comparator = new DesignFidelityComparator(designData);
```

### Methods

#### captureRenderedState(canvas, renderer)

Capture current rendered state from canvas.

**Parameters:**
- `canvas` (HTMLCanvasElement): Canvas element
- `renderer` (AdminCanvasRenderer): Renderer instance

**Returns:** `Object` - Captured state

**Example:**
```javascript
const state = comparator.captureRenderedState(canvas, renderer);
```

#### compareDesigns()

Compare original design metrics with rendered output.

**Returns:** `Object` - Comparison result
```javascript
{
    canvas: {
        widthMatch: boolean,
        heightMatch: boolean,
        aspectRatioMatch: boolean
    },
    background: {
        originalExpected: boolean,
        renderedHasContent: boolean,
        match: boolean
    },
    elements: [{
        index: number,
        id: string,
        positionDelta: {x, y},
        positionError: number,
        accuracy: 'PERFECT' | 'HIGH' | 'MEDIUM' | 'LOW'
    }],
    overall: {
        accuracy: string,
        passed: boolean
    }
}
```

**Example:**
```javascript
const comparison = comparator.compareDesigns();
console.log('Overall Accuracy:', comparison.overall.accuracy);
```

---

## Usage Examples

### Example 1: Basic Rendering

```javascript
// Create renderer
const renderer = new AdminCanvasRenderer();

// Initialize with container
renderer.init('canvas-container', {
    canvasDimensions: { width: 780, height: 580 }
});

// Render design data
const designData = {
    objects: [
        {
            type: 'image',
            left: 100,
            top: 100,
            width: 200,
            height: 150,
            scaleX: 1.0,
            scaleY: 1.0,
            src: 'logo.jpg'
        }
    ],
    metadata: {
        capture_version: '2.0'
    }
};

await renderer.renderDesign(designData);
```

### Example 2: Legacy Data Handling

```javascript
const renderer = new AdminCanvasRenderer();
renderer.init('canvas-container');

// Legacy order data
const legacyData = {
    objects: [
        {
            type: 'image',
            left: 500,
            top: 300,
            width: 200,
            height: 150,
            scaleX: 1.4,
            scaleY: 1.4,
            src: 'logo.jpg'
        }
    ],
    db_processed_views: true
};

// Apply correction before rendering
const correction = renderer.applyLegacyDataCorrection(legacyData);
if (correction.applied) {
    console.log('✓ Legacy data corrected');
}

// Render corrected data
await renderer.renderDesign(legacyData);
```

### Example 3: With Background

```javascript
const renderer = new AdminCanvasRenderer();
renderer.init('canvas-container');

const designData = {
    objects: [
        { type: 'image', left: 100, top: 100, /* ... */ }
    ],
    background: 'https://example.com/mockup.png'
};

// Background will be rendered first, then elements on top
await renderer.renderDesign(designData);
```

### Example 4: Validation

```javascript
const renderer = new AdminCanvasRenderer();
renderer.init('canvas-container');

// Render design
await renderer.renderDesign(designData);

// Validate rendering
const comparator = new DesignFidelityComparator(designData);
const renderedState = comparator.captureRenderedState(
    renderer.canvas,
    renderer
);

const comparison = comparator.compareDesigns();

if (comparison.overall.passed) {
    console.log('✓ Rendering accurate:', comparison.overall.accuracy);
} else {
    console.error('✗ Rendering issues detected');
    comparison.elements.forEach(element => {
        if (element.accuracy === 'LOW') {
            console.error(`Element ${element.id} off by ${element.positionError}px`);
        }
    });
}
```

### Example 5: Custom Configuration

```javascript
const renderer = new AdminCanvasRenderer();

// Customize settings
renderer.coordinatePreservation.allowedTolerance = 0.5; // Increase tolerance
renderer.imageRenderer.logImageRender = false; // Disable image logging
renderer.textRenderer.fontLoadingSupport = true; // Enable web fonts

renderer.init('canvas-container');
await renderer.renderDesign(designData);
```

### Example 6: Error Handling

```javascript
const renderer = new AdminCanvasRenderer();
renderer.init('canvas-container');

try {
    await renderer.renderDesign(designData);

    // Check for errors
    const stats = renderer.renderingStatistics;
    if (stats.errors.length > 0) {
        console.error('Rendering errors:', stats.errors);
        stats.errors.forEach(error => {
            console.error(`- Element ${error.element.id}: ${error.error.message}`);
        });
    } else {
        console.log(`✓ Successfully rendered ${stats.renderedObjects.length} objects`);
    }
} catch (error) {
    console.error('Rendering failed:', error);
}
```

### Example 7: Manual Coordinate Transformation

```javascript
const renderer = new AdminCanvasRenderer();

// Set up offset and scaling
renderer.designerOffset = { x: 330, y: 165, detected: true };
renderer.canvasScaling = { scaleX: 0.709, scaleY: 0.682, detected: true };

// Transform coordinates
const originalPosition = { left: 500, top: 300 };
const transformedPosition = renderer.transformCoordinates(
    originalPosition.left,
    originalPosition.top
);

console.log('Original:', originalPosition);
console.log('Transformed:', transformedPosition);
// Output: Transformed: {x: 120.53, y: 92.07}
```

### Example 8: Performance Monitoring

```javascript
const renderer = new AdminCanvasRenderer();
renderer.init('canvas-container');

console.time('render');
await renderer.renderDesign(designData);
console.timeEnd('render');

const stats = renderer.renderingStatistics;
const renderTime = stats.endTime - stats.startTime;

console.log('Performance:', {
    renderTime: `${renderTime.toFixed(2)}ms`,
    objectCount: stats.renderedObjects.length,
    errorsCount: stats.errors.length,
    avgTimePerObject: `${(renderTime / stats.renderedObjects.length).toFixed(2)}ms`
});
```

---

## Helper Functions

### _validateDimensions(width, height, scaleX, scaleY)

Validate element dimensions before rendering.

**Parameters:**
- `width` (number): Base width
- `height` (number): Base height
- `scaleX` (number): Horizontal scale
- `scaleY` (number): Vertical scale

**Returns:** `Object`
```javascript
{
    valid: boolean,
    errors: Array<string>,
    warnings: Array<string>
}
```

### _calculateElementPosition(element)

Calculate element position with corrections applied.

**Parameters:**
- `element` (Object): Element data

**Returns:** `Object`
```javascript
{
    x: number,
    y: number
}
```

### _calculateDisplayDimensions(element)

Calculate final display dimensions with scaling.

**Parameters:**
- `element` (Object): Element data

**Returns:** `Object`
```javascript
{
    width: number,
    height: number
}
```

---

## Constants

```javascript
// Default canvas dimensions
DEFAULT_CANVAS_WIDTH = 780
DEFAULT_CANVAS_HEIGHT = 580

// Coordinate thresholds for legacy detection
LEGACY_THRESHOLD_X = 400
LEGACY_THRESHOLD_Y = 200
LEGACY_THRESHOLD_X_SINGLE = 380  // For single element
LEGACY_THRESHOLD_Y_SINGLE = 180

// Accuracy classifications
ACCURACY_PERFECT = error <= 1px
ACCURACY_HIGH = error <= 10px
ACCURACY_MEDIUM = error <= 50px
ACCURACY_LOW = error > 50px

// Performance targets
TARGET_RENDER_TIME_SIMPLE = 50ms
TARGET_RENDER_TIME_MEDIUM = 100ms
TARGET_RENDER_TIME_COMPLEX = 200ms
```

---

## Type Definitions (TypeScript-style)

```typescript
interface DesignData {
    objects: DesignElement[];
    metadata?: Metadata;
    background?: string;
    db_processed_views?: boolean;
}

interface DesignElement {
    type: 'image' | 'text' | 'rect' | 'circle' | 'ellipse' | 'line' | 'polygon' | 'path';
    left: number;
    top: number;
    [key: string]: any;
}

interface Metadata {
    capture_version?: string;
    designer_offset?: { x: number; y: number };
    canvas_dimensions?: { width: number; height: number };
    timestamp?: number;
}

interface RenderOptions {
    backgroundUrl?: string;
    canvasDimensions?: { width: number; height: number };
}

interface CorrectionResult {
    applied: boolean;
    method: string;
    confidence: number;
    matrix?: CorrectionMatrix;
    elementsTransformed: number;
}

interface CorrectionMatrix {
    deltaX: number;
    deltaY: number;
    scaleFactor: number;
    confidence: number;
    method: string;
}
```

---

## Conclusion

This API reference provides complete documentation for the Perfect Positioning System. For additional information:

- **Architecture:** [SYSTEM_ARCHITECTURE.md](/workspaces/yprint_designtool/docs/SYSTEM_ARCHITECTURE.md)
- **Development:** [DEVELOPER_GUIDE.md](/workspaces/yprint_designtool/docs/DEVELOPER_GUIDE.md)
- **Debugging:** [DEBUGGING_PLAYBOOK.md](/workspaces/yprint_designtool/docs/DEBUGGING_PLAYBOOK.md)
- **Testing:** [Test suites in /tests directory](/workspaces/yprint_designtool/tests/)
