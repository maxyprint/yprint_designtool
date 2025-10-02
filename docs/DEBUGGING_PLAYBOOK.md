# Perfect Positioning System - Debugging Playbook

## Quick Diagnostic Checklist

When you encounter positioning issues, run through this checklist:

- [ ] Check browser console for error messages
- [ ] Verify canvas element is visible and has correct dimensions
- [ ] Check if design data loaded successfully
- [ ] Look for "COORDINATE PRESERVATION" logs
- [ ] Look for "LEGACY DATA CORRECTION" logs
- [ ] Check "DESIGNER OFFSET" values
- [ ] Check "CANVAS SCALING" values
- [ ] Verify images loaded (check Network tab)
- [ ] Compare with working order

---

## Problem Scenarios

### Scenario 1: Visual Output Doesn't Match Expected Position

**Symptoms:**
- Elements appear at wrong coordinates
- Design looks shifted or scaled incorrectly
- Elements outside canvas bounds

**Debugging Steps:**

#### Step 1: Check Audit Trail

Open browser console and look for coordinate transformation logs:

```
COORDINATE PRESERVATION: {
    original: {left: 500, top: 300},
    offsetCompensated: {x: 170, y: 135},
    scaleApplied: {x: 170, y: 135},
    final: {x: 170, y: 135},
    deltas: {offsetX: -330, offsetY: -165, totalX: -330, totalY: -165}
}
```

**Look for:**
- Large deltas (>100px) indicate correction was applied
- Zero deltas indicate no correction (may be wrong)
- Negative deltas indicate offset subtraction
- Positive deltas indicate offset addition (unusual)

#### Step 2: Check Correction Mutex

Verify only ONE correction system is active:

```javascript
// In browser console:
const renderer = window.canvasRendererInstance;

console.log('Legacy Correction:', window.lastRenderCorrection?.applied || false);
console.log('Designer Offset:', renderer.designerOffset);
console.log('Canvas Scaling:', renderer.canvasScaling);
```

**Expected patterns:**

**For Legacy Data:**
```javascript
{
    legacyCorrection: true,
    designerOffset: {x: 0, y: 0, detected: false},
    canvasScaling: {scaleX: 1.0, scaleY: 1.0, detected: false}
}
```

**For Modern Data:**
```javascript
{
    legacyCorrection: false,
    designerOffset: {x: 330, y: 165, detected: true, source: 'metadata'},
    canvasScaling: {scaleX: 1.0, scaleY: 1.0, detected: false}
}
```

**WARNING:** If multiple corrections are active, this is a bug!

#### Step 3: Check Visual Validation

Use Design Fidelity Comparator to measure discrepancy:

```javascript
// In browser console:
const comparator = new DesignFidelityComparator(window.currentDesignData);
const renderedState = comparator.captureRenderedState(
    document.querySelector('canvas'),
    window.canvasRendererInstance
);

const comparison = comparator.compareDesigns();
console.log('Position Deltas:', comparison.elements.map(e => ({
    id: e.id,
    deltaX: e.positionDelta.x,
    deltaY: e.positionDelta.y,
    error: e.positionError
})));
```

**Thresholds:**
- Delta < 1px: PERFECT
- Delta < 10px: HIGH (acceptable)
- Delta < 50px: MEDIUM (investigate)
- Delta > 50px: LOW (critical issue)

#### Step 4: Check CSS Isolation

Verify no external transforms are interfering:

```javascript
// In browser console:
const canvas = document.querySelector('canvas');
const computedStyle = window.getComputedStyle(canvas);

console.log('Canvas Transforms:', {
    transform: computedStyle.transform,
    transformOrigin: computedStyle.transformOrigin,
    position: computedStyle.position,
    left: computedStyle.left,
    top: computedStyle.top
});
```

**Expected:**
- `transform: none` (or identity matrix)
- `position: static` or `relative`
- No unexpected CSS properties

**If transforms are applied:** This is likely interference from external CSS. Add `!important` rules to reset transforms.

---

### Scenario 2: Legacy Order Not Rendering Correctly

**Symptoms:**
- Order 5378 or similar legacy orders show incorrect positioning
- Elements appear too far right/bottom
- Scaling looks wrong

**Debugging Steps:**

#### Step 1: Verify Legacy Detection

```javascript
// Check if order was detected as legacy
const isLegacy = !designData.metadata?.capture_version &&
                 !designData.metadata?.designer_offset;

console.log('Is Legacy Data:', isLegacy);
console.log('Has db_processed_views:', designData.db_processed_views);
```

**If not detected as legacy:**
- Check if metadata exists unexpectedly
- Verify `db_processed_views` flag is present
- Check coordinate patterns (avgX > 400, avgY > 200)

#### Step 2: Check Correction Matrix

```javascript
// Look for this log in console:
LEGACY DATA CORRECTION: {
    detected: true,
    confidence: 0.95,
    matrix: {
        deltaX: -330,
        deltaY: -165,
        scaleFactor: 0.709
    },
    elementsTransformed: 12
}
```

**Verify:**
- `confidence > 0.8` (high confidence)
- `deltaX` and `deltaY` are negative (subtracting offset)
- `scaleFactor < 1.0` (scaling down)
- `elementsTransformed` matches object count

#### Step 3: Check Coordinate Statistics

```javascript
// Calculate stats manually
const objects = designData.objects || [];
const avgX = objects.reduce((sum, e) => sum + e.left, 0) / objects.length;
const avgY = objects.reduce((sum, e) => sum + e.top, 0) / objects.length;

console.log('Coordinate Stats:', {
    avgX,
    avgY,
    exceedsThreshold: avgX > 400 || avgY > 200
});
```

**Expected for legacy data:**
- `avgX > 400` OR `avgY > 200`
- If not exceeding threshold, correction won't trigger

#### Step 4: Manual Correction Test

Apply correction manually to verify formula:

```javascript
// Test correction on single element
const element = designData.objects[0];
const corrected = {
    left: element.left - 330,  // Subtract offset
    top: element.top - 165,
    scaleX: element.scaleX * 0.709,  // Scale down
    scaleY: element.scaleY * 0.709
};

console.log('Original:', element);
console.log('Corrected:', corrected);
console.log('Should be in canvas bounds:',
    corrected.left >= 0 && corrected.left < 780 &&
    corrected.top >= 0 && corrected.top < 580
);
```

---

### Scenario 3: Modern Order Not Using Metadata

**Symptoms:**
- Order has metadata but still appears incorrectly positioned
- Metadata values not being applied
- Heuristic fallback used instead of metadata

**Debugging Steps:**

#### Step 1: Verify Metadata Structure

```javascript
console.log('Metadata:', JSON.stringify(designData.metadata, null, 2));
```

**Expected structure:**
```json
{
  "capture_version": "2.0",
  "designer_offset": {
    "x": 330,
    "y": 165
  },
  "canvas_dimensions": {
    "width": 780,
    "height": 580
  }
}
```

**Common issues:**
- Missing `capture_version` field
- `designer_offset` is null or undefined
- Property names misspelled
- Values are strings instead of numbers

#### Step 2: Check Offset Extraction

```javascript
// Should see this log:
DESIGNER OFFSET: {
    detected: true,
    source: 'metadata',
    offset: {x: 330, y: 165}
}
```

**If source is 'heuristic' instead of 'metadata':**
- Metadata extraction failed
- Check metadata structure
- Verify property names match exactly

#### Step 3: Check Canvas Scaling

```javascript
// Should see:
CANVAS SCALING: {
    detected: true,
    source: 'metadata',
    originalCanvas: '1100×850',
    currentCanvas: '780×580',
    scaleX: 0.709,
    scaleY: 0.682
}
```

**If scaling not detected:**
- Check `metadata.canvas_dimensions` exists
- Verify dimensions don't match current canvas (otherwise scaling = 1:1)

---

### Scenario 4: Single Element Order Issues

**Symptoms:**
- Order with single element not positioned correctly
- Offset detection fails for single element
- Element appears too far right/bottom

**Debugging Steps:**

#### Step 1: Check Smart Threshold

```javascript
// Look for this log:
HIVE MIND: Legacy offset detection: {
    avgX: 390,
    avgY: 195,
    elementCount: 1,
    thresholds: { x: 380, y: 180 },  // Lower for single element
    willTrigger: true
}
```

**Verify:**
- `elementCount === 1`
- `thresholds.x === 380` (not 400)
- `thresholds.y === 180` (not 200)
- `willTrigger === true`

#### Step 2: Calculate Threshold Match

```javascript
const element = designData.objects[0];
const singleElementThreshold = {
    x: 380,
    y: 180
};

console.log('Element Position:', element.left, element.top);
console.log('Exceeds Threshold:',
    element.left > singleElementThreshold.x ||
    element.top > singleElementThreshold.y
);
```

**If position is below threshold:**
- Element may not need correction
- Verify visual output is actually correct
- Compare with database screenshot

---

### Scenario 5: Canvas Not Visible

**Symptoms:**
- Canvas element exists but nothing renders
- White/blank canvas
- Console shows no errors

**Debugging Steps:**

#### Step 1: Check Canvas Visibility

```javascript
const canvas = document.querySelector('canvas');
const rect = canvas.getBoundingClientRect();

console.log('Canvas Visibility:', {
    exists: !!canvas,
    width: canvas.width,
    height: canvas.height,
    styleWidth: canvas.style.width,
    styleHeight: canvas.style.height,
    visible: rect.width > 0 && rect.height > 0,
    inViewport: rect.top < window.innerHeight && rect.bottom > 0
});
```

**Common issues:**
- Canvas dimensions are 0
- Canvas hidden by CSS (`display: none`)
- Canvas outside viewport
- Canvas covered by other elements (z-index)

#### Step 2: Check Canvas Context

```javascript
const ctx = canvas.getContext('2d');
const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

// Check if any pixels are non-white
let hasContent = false;
for (let i = 0; i < imageData.data.length; i += 4) {
    const r = imageData.data[i];
    const g = imageData.data[i + 1];
    const b = imageData.data[i + 2];
    if (r < 250 || g < 250 || b < 250) {
        hasContent = true;
        break;
    }
}

console.log('Canvas Has Content:', hasContent);
```

**If no content:**
- Rendering failed silently
- Check rendering statistics for errors
- Verify design data is not empty

#### Step 3: Check Rendering Statistics

```javascript
const renderer = window.canvasRendererInstance;
console.log('Rendering Stats:', {
    renderedObjects: renderer.renderingStatistics.renderedObjects.length,
    errors: renderer.renderingStatistics.errors,
    renderTime: renderer.renderingStatistics.endTime -
                renderer.renderingStatistics.startTime
});
```

---

### Scenario 6: Images Not Loading

**Symptoms:**
- Canvas shows text/shapes but images missing
- Image URLs returning 404
- CORS errors in console

**Debugging Steps:**

#### Step 1: Check Image URLs

```javascript
const objects = designData.objects || [];
const imageObjects = objects.filter(obj => obj.type === 'image');

imageObjects.forEach(img => {
    console.log('Image URL:', img.src);

    // Test if URL is accessible
    fetch(img.src, {mode: 'no-cors'})
        .then(() => console.log('✓', img.src))
        .catch(err => console.error('✗', img.src, err));
});
```

**Common issues:**
- Relative URLs (need absolute URLs)
- Missing protocol (http:// or https://)
- CORS restrictions
- File doesn't exist

#### Step 2: Check CORS Headers

```javascript
// In Network tab, check response headers for image:
// Access-Control-Allow-Origin: *
// or
// Access-Control-Allow-Origin: https://yourdomain.com
```

**If CORS error:**
- Add CORS headers on image server
- Use proxy server
- Set `crossOrigin='anonymous'` on image element

#### Step 3: Check Image Cache

```javascript
const renderer = window.canvasRendererInstance;
console.log('Image Cache:', {
    size: renderer.imageCache.size,
    urls: Array.from(renderer.imageCache.keys())
});
```

**If cache is empty:**
- Images failed to load
- Check Network tab for failed requests

---

### Scenario 7: Text Not Rendering

**Symptoms:**
- Text elements don't appear
- Font loading errors
- Text rendering as boxes or default font

**Debugging Steps:**

#### Step 1: Check Font Loading

```javascript
const textObjects = designData.objects.filter(obj =>
    obj.type === 'text' || obj.type === 'i-text' || obj.type === 'textbox'
);

textObjects.forEach(async (text) => {
    const fontFamily = text.fontFamily || 'Arial';
    const fontSize = text.fontSize || 16;

    try {
        await document.fonts.load(`${fontSize}px ${fontFamily}`);
        console.log('✓ Font loaded:', fontFamily);
    } catch (err) {
        console.error('✗ Font load failed:', fontFamily, err);
    }
});
```

#### Step 2: Check Font Cache

```javascript
const renderer = window.canvasRendererInstance;
console.log('Font Cache:', {
    size: renderer.textRenderer.fontCache.size,
    fonts: Array.from(renderer.textRenderer.fontCache.keys())
});
```

#### Step 3: Test Text Rendering

```javascript
// Manually render text on canvas
const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

ctx.font = '24px Arial';
ctx.fillStyle = '#000000';
ctx.fillText('Test Text', 100, 100);

// If this works, issue is in text renderer
// If this doesn't work, issue is with canvas context
```

---

## Advanced Debugging Techniques

### Technique 1: Breakpoint-Based Debugging

Set breakpoints at key stages:

1. **Before rendering:**
   ```javascript
   async renderDesign(designData, options = {}) {
       debugger; // STOP HERE
       // Inspect designData
   }
   ```

2. **During correction:**
   ```javascript
   applyLegacyDataCorrection(designData) {
       debugger; // STOP HERE
       // Inspect before/after coordinates
   }
   ```

3. **During element rendering:**
   ```javascript
   for (const obj of objectsToRender) {
       debugger; // STOP HERE - step through each element
       await this.renderElement(obj);
   }
   ```

### Technique 2: Console Logging Strategy

Add comprehensive logging:

```javascript
// At start of render
console.group('🎨 RENDER START: Order ' + orderId);

// At each stage
console.log('📍 Stage 1: Data loaded');
console.log('📍 Stage 2: Legacy correction applied');
console.log('📍 Stage 3: Offsets extracted');
console.log('📍 Stage 4: Elements rendering...');

// At end
console.groupEnd();
console.log('✅ RENDER COMPLETE');
```

### Technique 3: Comparative Analysis

Compare working order with broken order:

```javascript
function compareOrders(order1Data, order2Data) {
    console.log('Order 1 (Working):', {
        metadata: order1Data.metadata,
        avgX: calculateAvgX(order1Data.objects),
        avgY: calculateAvgY(order1Data.objects)
    });

    console.log('Order 2 (Broken):', {
        metadata: order2Data.metadata,
        avgX: calculateAvgX(order2Data.objects),
        avgY: calculateAvgY(order2Data.objects)
    });

    // Identify differences
}
```

### Technique 4: Unit Test Isolation

Isolate problem in unit test:

```javascript
it('should render Order 5378 correctly', async () => {
    const order5378Data = loadTestData('order-5378.json');

    const renderer = new AdminCanvasRenderer();
    renderer.init('test-container');

    await renderer.renderDesign(order5378Data);

    // Add assertions based on expected behavior
    expect(renderer.renderingStatistics.errors).toHaveLength(0);
});
```

---

## Performance Debugging

### Problem: Slow Rendering

**Check these metrics:**

```javascript
console.time('render');
await renderer.renderDesign(designData);
console.timeEnd('render');

console.log('Stats:', {
    objectCount: designData.objects.length,
    imagesCached: renderer.imageCache.size,
    fontsCached: renderer.textRenderer.fontCache.size,
    renderTime: renderer.renderingStatistics.endTime -
                renderer.renderingStatistics.startTime
});
```

**Thresholds:**
- Simple design (1-3 elements): <50ms
- Medium design (5-10 elements): <100ms
- Complex design (15+ elements): <200ms

**If slow:**
- Check image loading (uncached images are slow)
- Check font loading (web fonts are slow)
- Check correction complexity (many elements = slower)

---

## Common Error Messages

### Error: "Invalid dimensions"

**Cause:** Width or height is 0, negative, or NaN

**Solution:**
```javascript
// Check element dimensions
console.log('Element:', {
    width: element.width,
    height: element.height,
    scaleX: element.scaleX,
    scaleY: element.scaleY,
    displayWidth: element.width * element.scaleX,
    displayHeight: element.height * element.scaleY
});
```

### Error: "Failed to load image"

**Cause:** Image URL inaccessible, CORS issue, or 404

**Solution:**
- Verify URL is absolute
- Check CORS headers
- Test URL in browser directly

### Error: "Font load failed"

**Cause:** Font family not available

**Solution:**
- Use web-safe font fallback
- Preload custom fonts
- Check font file exists

---

## Emergency Debugging Checklist

When everything fails, try these:

1. **Clear all caches:**
   ```javascript
   renderer.imageCache.clear();
   renderer.textRenderer.fontCache.clear();
   renderer.transformCache.clear();
   ```

2. **Reset renderer:**
   ```javascript
   renderer = new AdminCanvasRenderer();
   renderer.init('canvas-container');
   ```

3. **Test with minimal data:**
   ```javascript
   const minimalData = {
       objects: [{
           type: 'rect',
           left: 100,
           top: 100,
           width: 100,
           height: 100,
           fill: '#ff0000'
       }]
   };
   await renderer.renderDesign(minimalData);
   ```

4. **Check browser compatibility:**
   - Test in Chrome DevTools (F12)
   - Try different browser
   - Check for console errors

5. **Verify data integrity:**
   ```javascript
   console.log('Data valid:', {
       hasObjects: Array.isArray(designData.objects),
       objectCount: designData.objects?.length,
       firstObject: designData.objects?.[0]
   });
   ```

---

## Getting Help

If you're still stuck:

1. **Capture debug info:**
   ```javascript
   const debugInfo = {
       designData: designData,
       rendererState: {
           designerOffset: renderer.designerOffset,
           canvasScaling: renderer.canvasScaling,
           coordinatePreservation: renderer.coordinatePreservation
       },
       statistics: renderer.renderingStatistics,
       consoleErrors: /* copy from console */
   };

   console.log('DEBUG INFO:', JSON.stringify(debugInfo, null, 2));
   ```

2. **Compare with working order**
3. **Check recent code changes**
4. **Review documentation:** [SYSTEM_ARCHITECTURE.md](/workspaces/yprint_designtool/docs/SYSTEM_ARCHITECTURE.md)
5. **Contact development team** with debug info

---

## Conclusion

Most positioning issues can be diagnosed by:
1. Checking correction mutex (only one correction active)
2. Verifying coordinate transformations in console logs
3. Validating metadata structure
4. Testing with known working orders

Remember: **Extensive logging is your friend!** The system is designed to be debuggable through console output.
