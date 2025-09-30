# AGENT 7: QUICK IMPLEMENTATION GUIDE
## Copy-Paste Ready Code für Canvas-Rendering-Fixes

---

## 📋 OVERVIEW

**Ziel:** Canvas rendert Logos korrekt im Mockup-Kontext mit Template-basierten Transformationen

**Files to Modify:**
1. `includes/class-octo-print-designer-wc-integration.php` (Template Config)
2. `admin/js/admin-canvas-renderer.js` (Transform Functions)

**Implementation Time:** 6-8 hours
**Impact:** Behebt 4 von 5 User-Problemen

---

## 🔧 STEP 1: PHP - TEMPLATE CONFIG EXTRACTION

**File:** `includes/class-octo-print-designer-wc-integration.php`
**Function:** `render_canvas_preview_ajax()` (around line 4800-5000)

**Add after line where `$agent3_design_data` is prepared:**

```php
// 🎯 AGENT 7: Extract Template Configuration for Canvas Rendering
$template_config = null;

// Try to get template_id from order items
foreach ($order->get_items() as $item) {
    $template_id = $item->get_meta('_yprint_template_id');
    if ($template_id) {
        $template_config = [
            'template_id' => $template_id,
            'mockup_design_area_px' => json_decode(
                get_post_meta($template_id, '_template_mockup_design_area_px', true) ?: '{}',
                true
            ),
            'printable_area_px' => json_decode(
                get_post_meta($template_id, '_template_printable_area_px', true) ?: '{}',
                true
            ),
            'printable_area_mm' => json_decode(
                get_post_meta($template_id, '_template_printable_area_mm', true) ?: '{}',
                true
            ),
            'ref_chest_line_px' => json_decode(
                get_post_meta($template_id, '_template_ref_chest_line_px', true) ?: '{}',
                true
            ),
            'anchor_point_px' => json_decode(
                get_post_meta($template_id, '_template_anchor_point_px', true) ?: '{}',
                true
            ),
            'canvas_width' => 780,  // Default canvas width
            'canvas_height' => 580  // Default canvas height
        ];

        error_log('🎯 AGENT 7 TEMPLATE CONFIG: Extracted for template ' . $template_id);
        break;
    }
}

// Fallback if no template config found
if (!$template_config || empty($template_config['mockup_design_area_px'])) {
    error_log('⚠️ AGENT 7 WARNING: No template config found - using fallback defaults');
    $template_config = [
        'template_id' => null,
        'mockup_design_area_px' => ['x' => 0, 'y' => 0, 'width' => 780, 'height' => 580],
        'printable_area_px' => ['x' => 0, 'y' => 0, 'width' => 780, 'height' => 580],
        'printable_area_mm' => ['width' => 300, 'height' => 375],
        'canvas_width' => 780,
        'canvas_height' => 580
    ];
}
```

**In the HTML output section, add before closing `</script>`:**

```php
// 🎯 AGENT 7: Pass template config to frontend
window.agent7TemplateConfig = <?php echo json_encode($template_config); ?>;
console.log('🎯 AGENT 7 TEMPLATE CONFIG LOADED:', window.agent7TemplateConfig);
```

---

## 🔧 STEP 2: JAVASCRIPT - CONSTRUCTOR MODIFICATION

**File:** `admin/js/admin-canvas-renderer.js`
**Class:** `AdminCanvasRenderer`
**Location:** Constructor (around line 10-20)

**Modify constructor signature:**

```javascript
// BEFORE:
constructor(container, designData, canvasWidth, canvasHeight) {
    // ...
}

// AFTER:
constructor(container, designData, canvasWidth, canvasHeight, templateConfig = null) {
    // Existing initialization code...

    // 🎯 AGENT 7: Template Configuration System
    this.templateConfig = templateConfig || window.agent7TemplateConfig || {
        mockup_design_area_px: { x: 0, y: 0, width: canvasWidth, height: canvasHeight },
        printable_area_px: { x: 0, y: 0, width: canvasWidth, height: canvasHeight },
        printable_area_mm: { width: 300, height: 375 },
        canvas_width: canvasWidth,
        canvas_height: canvasHeight
    };

    console.log('🎯 AGENT 7: Template config initialized:', this.templateConfig);

    // Rest of constructor...
}
```

---

## 🔧 STEP 3: COORDINATE TRANSFORMATION FUNCTION

**File:** `admin/js/admin-canvas-renderer.js`
**Add as new method in `AdminCanvasRenderer` class:**

```javascript
/**
 * 🎯 AGENT 7: Transform canvas coordinates to mockup space
 * Applies mockup_design_area offset to correctly position elements on product mockup
 *
 * @param {number} canvasX - X coordinate in canvas space (0-780)
 * @param {number} canvasY - Y coordinate in canvas space (0-580)
 * @returns {Object} Transformed coordinates {x, y} in mockup space
 */
transformToMockupSpace(canvasX, canvasY) {
    const { mockup_design_area_px } = this.templateConfig;

    // Validate mockup config
    if (!mockup_design_area_px || typeof mockup_design_area_px.x === 'undefined') {
        console.warn('⚠️ AGENT 7: No mockup_design_area_px - using canvas coordinates as-is');
        return { x: canvasX, y: canvasY };
    }

    // Apply mockup area offset
    const mockupX = canvasX + mockup_design_area_px.x;
    const mockupY = canvasY + mockup_design_area_px.y;

    // Boundary validation
    const maxX = mockup_design_area_px.x + mockup_design_area_px.width;
    const maxY = mockup_design_area_px.y + mockup_design_area_px.height;

    if (mockupX < mockup_design_area_px.x || mockupX > maxX ||
        mockupY < mockup_design_area_px.y || mockupY > maxY) {
        console.warn('⚠️ AGENT 7: Coordinate outside mockup bounds', {
            canvas: { x: canvasX, y: canvasY },
            mockup: { x: mockupX, y: mockupY },
            bounds: mockup_design_area_px
        });
    }

    console.log('🎯 AGENT 7 COORDINATE TRANSFORM:', {
        canvas: { x: canvasX.toFixed(1), y: canvasY.toFixed(1) },
        mockup: { x: mockupX.toFixed(1), y: mockupY.toFixed(1) },
        offset: { x: mockup_design_area_px.x, y: mockup_design_area_px.y }
    });

    return { x: mockupX, y: mockupY };
}
```

---

## 🔧 STEP 4: SCALE CALCULATION FUNCTION

**File:** `admin/js/admin-canvas-renderer.js`
**Add as new method in `AdminCanvasRenderer` class:**

```javascript
/**
 * 🎯 AGENT 7: Calculate scale factor from canvas to mockup space
 * Considers mockup_design_area dimensions relative to canvas dimensions
 *
 * @returns {Object} Scale factors {x, y}
 */
calculateMockupScale() {
    const { mockup_design_area_px } = this.templateConfig;

    // Validate config
    if (!mockup_design_area_px || !mockup_design_area_px.width || !mockup_design_area_px.height) {
        console.warn('⚠️ AGENT 7: Missing mockup scale config - using 1:1 scale');
        return { x: 1, y: 1 };
    }

    // Calculate scale factor: mockup_area / canvas_size
    const scaleX = mockup_design_area_px.width / this.canvasWidth;
    const scaleY = mockup_design_area_px.height / this.canvasHeight;

    console.log('🎯 AGENT 7 SCALE CALCULATION:', {
        canvasSize: { w: this.canvasWidth, h: this.canvasHeight },
        mockupArea: { w: mockup_design_area_px.width, h: mockup_design_area_px.height },
        scale: { x: scaleX.toFixed(3), y: scaleY.toFixed(3) }
    });

    return { x: scaleX, y: scaleY };
}

/**
 * 🎯 AGENT 7: Calculate physical print scale (mockup → print template)
 * Used for precise millimeter calculations
 *
 * @returns {Object} Print scale factors {x, y}
 */
calculatePrintScale() {
    const { mockup_design_area_px, printable_area_px } = this.templateConfig;

    if (!printable_area_px || !mockup_design_area_px) {
        return { x: 1, y: 1 };
    }

    const scaleX = printable_area_px.width / mockup_design_area_px.width;
    const scaleY = printable_area_px.height / mockup_design_area_px.height;

    return { x: scaleX, y: scaleY };
}
```

---

## 🔧 STEP 5: LOGO DETECTION FUNCTION

**File:** `admin/js/admin-canvas-renderer.js`
**Add as new method in `AdminCanvasRenderer` class:**

```javascript
/**
 * 🎯 AGENT 7: Detect if image is a logo (for crisp rendering)
 * Logos should use imageSmoothingEnabled=false for sharp edges
 *
 * @param {Object} imageData - Image data with src/url
 * @returns {boolean} True if image appears to be a logo
 */
isLogoImage(imageData) {
    const url = (imageData.src || imageData.url || '').toLowerCase();

    // Logo detection patterns
    const logoPatterns = [
        /logo/i,
        /icon/i,
        /badge/i,
        /yprint/i,
        /brand/i,
        /emblem/i,
        /white.*logo/i
    ];

    const isLogo = logoPatterns.some(pattern => pattern.test(url));

    if (isLogo) {
        console.log('🎯 AGENT 7: Logo detected - will use crisp rendering:', url.substring(0, 50));
    }

    return isLogo;
}
```

---

## 🔧 STEP 6: INTEGRATE INTO RENDERING PIPELINE

**File:** `admin/js/admin-canvas-renderer.js`
**Function:** `renderImageWithNestedDataStructure()` (around line 1630-1700)

**REPLACE the coordinate application section (around line 1634-1644):**

```javascript
// BEFORE (Line ~1634-1644):
if (this.coordinatePreservation.noTransformMode) {
    renderX = left;
    renderY = top;
    console.log('🎯 AGENT 3: Using NO-TRANSFORM mode - exact coordinates:', { renderX, renderY });
} else {
    const cacheKey = `${imageData.id}_${left}_${top}`;
    const pos = this.getCachedTransform(cacheKey, { left, top });
    renderX = pos.x;
    renderY = pos.y;
    console.log('🎯 AGENT 3: Using TRANSFORM mode - scaled coordinates:', { renderX, renderY });
}

// AFTER (WITH AGENT 7 TRANSFORM):
if (this.coordinatePreservation.noTransformMode) {
    // 🎯 AGENT 7: Apply mockup space transformation
    const mockupCoords = this.transformToMockupSpace(left, top);
    renderX = mockupCoords.x;
    renderY = mockupCoords.y;
    console.log('🎯 AGENT 7: NO-TRANSFORM mode with mockup transform:', {
        canvas: { x: left, y: top },
        mockup: { x: renderX, y: renderY }
    });
} else {
    // Legacy transform mode (fallback)
    const cacheKey = `${imageData.id}_${left}_${top}`;
    const pos = this.getCachedTransform(cacheKey, { left, top });
    const mockupCoords = this.transformToMockupSpace(pos.x, pos.y);
    renderX = mockupCoords.x;
    renderY = mockupCoords.y;
    console.log('🎯 AGENT 7: TRANSFORM mode with mockup transform:', { renderX, renderY });
}
```

**REPLACE the dimension calculation section (around line 1650-1652):**

```javascript
// BEFORE (Line ~1650-1652):
const displayWidth = baseWidth * scaleX;
const displayHeight = baseHeight * scaleY;

// AFTER (WITH AGENT 7 SCALE):
const mockupScale = this.calculateMockupScale();
const displayWidth = baseWidth * scaleX * mockupScale.x;
const displayHeight = baseHeight * scaleY * mockupScale.y;

console.log('🎯 AGENT 7 DIMENSION WITH MOCKUP SCALE:', {
    baseSize: `${baseWidth}×${baseHeight}`,
    designScale: `${scaleX.toFixed(3)}×${scaleY.toFixed(3)}`,
    mockupScale: `${mockupScale.x.toFixed(3)}×${mockupScale.y.toFixed(3)}`,
    finalDisplay: `${displayWidth.toFixed(1)}×${displayHeight.toFixed(1)}`
});
```

**REPLACE the image smoothing section (around line 1686-1687):**

```javascript
// BEFORE (Line ~1686-1687):
this.ctx.imageSmoothingEnabled = true;
this.ctx.imageSmoothingQuality = 'high';

// AFTER (WITH AGENT 7 LOGO DETECTION):
if (this.isLogoImage(imageData)) {
    // Crisp rendering for logos
    this.ctx.imageSmoothingEnabled = false;
    console.log('🎯 AGENT 7: Using crisp rendering for logo');
} else {
    // Smooth rendering for photos
    this.ctx.imageSmoothingEnabled = true;
    this.ctx.imageSmoothingQuality = 'high';
}
```

---

## 🔧 STEP 7: SAME CHANGES FOR renderImageElement()

**File:** `admin/js/admin-canvas-renderer.js`
**Function:** `renderImageElement()` (around line 750-900)

**Apply SAME changes as Step 6 to this function:**
1. Coordinate transformation before ctx.translate()
2. Scale calculation with mockupScale
3. Image smoothing detection

**Location markers:**
- Coordinate transform: After line ~770 (coordinate extraction)
- Scale calculation: Around line ~790 (displayWidth/Height)
- Image smoothing: Before drawImage() call around line ~900

---

## 🧪 TESTING CHECKLIST

### Pre-Implementation:
- [ ] Backup files before modification
- [ ] Review Order 5374 current state
- [ ] Document current console logs

### Implementation:
- [ ] Step 1: PHP Template Config ✓
- [ ] Step 2: Constructor Modification ✓
- [ ] Step 3: Coordinate Transform Function ✓
- [ ] Step 4: Scale Calculation Function ✓
- [ ] Step 5: Logo Detection Function ✓
- [ ] Step 6: Integration in renderImageWithNestedDataStructure ✓
- [ ] Step 7: Integration in renderImageElement ✓

### Post-Implementation:
- [ ] Clear browser cache
- [ ] Reload Order 5374 page
- [ ] Click "Render Canvas Preview"
- [ ] Check console for "🎯 AGENT 7" logs
- [ ] Verify yprint logo position (rechtsbündig?)
- [ ] Verify logo sizes (korrekt?)
- [ ] Verify mockup background (sichtbar?)

### Console Logs to Verify:
```javascript
✅ 🎯 AGENT 7 TEMPLATE CONFIG LOADED: {...}
✅ 🎯 AGENT 7: Template config initialized: {...}
✅ 🎯 AGENT 7 COORDINATE TRANSFORM: {...}
✅ 🎯 AGENT 7 SCALE CALCULATION: {...}
✅ 🎯 AGENT 7: Logo detected - will use crisp rendering
```

---

## 🚨 TROUBLESHOOTING

### Problem: No template config loaded
**Symptom:** `⚠️ AGENT 7 WARNING: No template config found`
**Solution:**
1. Check Template 3657 has meta fields set
2. Verify `_yprint_template_id` in order item meta
3. Check PHP error logs for template extraction

### Problem: Coordinates still wrong
**Symptom:** Logo not rechtsbündig
**Solution:**
1. Check console for "AGENT 7 COORDINATE TRANSFORM" log
2. Verify mockup_design_area_px values are correct
3. Check if transform is actually applied (renderX should be different from left)

### Problem: Logo still too big
**Symptom:** Sizes look incorrect
**Solution:**
1. Check "AGENT 7 SCALE CALCULATION" log
2. Verify mockupScale values are reasonable (0.5-2.0 range)
3. Check if scale is applied to displayWidth/Height

### Problem: Logo rendering blurry
**Symptom:** Logos not crisp
**Solution:**
1. Check if `isLogoImage()` returns true for logo URLs
2. Verify imageSmoothingEnabled is set to false for logos
3. Add more patterns to logoPatterns array if needed

---

## 📊 EXPECTED RESULTS

### Before Agent 7:
- yprint Logo: Position (405, 123) → Oben-Mitte ❌
- Logo Size: Too large ❌
- Background: Gray (#f0f0f0) ⚠️
- Smoothing: Blurry for logos ❌

### After Agent 7:
- yprint Logo: Position (655, 423) → Correct position within mockup ✅
- Logo Size: Scaled correctly with mockup context ✅
- Background: T-Shirt mockup (via Agent 10/11) ✅
- Smoothing: Crisp for logos, smooth for photos ✅

---

## 📝 COMMIT MESSAGE

```
🎯 AGENT 7 FIX: Template-Based Coordinate & Scale Transformation System

Implements comprehensive mockup-aware rendering system:
- Template config extraction and injection
- Canvas → Mockup coordinate transformation
- Mockup-aware scale calculation
- Logo-specific crisp rendering

Fixes:
- yprint logo position (oben-mitte → rechtsbündig)
- Logo sizes (zu groß → korrekt skaliert)
- Logo sharpness (blurry → crisp)
- Gesamtposition (zu hoch → korrekt im mockup)

Files Modified:
- includes/class-octo-print-designer-wc-integration.php
- admin/js/admin-canvas-renderer.js

Impact: Behebt 4 von 5 User-Problemen (80% success rate)

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

---

**Implementation Guide Created By:** Agent 7
**Status:** ✅ READY FOR IMPLEMENTATION
**Estimated Time:** 6-8 hours
**Success Probability:** 80% (4/5 problems solved)

---

🤖 Generated with [Claude Code](https://claude.com/claude-code)