# AGENT 4: Design Load & Display Analysis

**Mission**: Analyze how saved designs are loaded from database and displayed on canvas

**Date**: 2025-10-03
**Status**: ANALYSIS COMPLETE

---

## EXECUTIVE SUMMARY

The design load and display system has **THREE CRITICAL ARCHITECTURAL FLAWS**:

1. **OFFSET-FIX Logic Violation** - Subtracts 50px during load, breaking Single Source of Truth
2. **Metadata-Based Branching** - Different code paths based on `offset_applied` flag
3. **No Direct Fabric.js Reconstruction** - Always applies transformations, never uses raw coordinates

**Impact**: Coordinates are "interpreted" during load rather than used as-is, creating multiple sources of truth.

---

## 1. COMPLETE LOAD PATH: Database → Display

### 1.1 Database Retrieval (PHP)

**File**: `/workspaces/yprint_designtool/public/class-octo-print-designer-designer.php`

```php
// Line 794-830: get_design_from_db()
private function get_design_from_db($design_id, $user_id) {
    global $wpdb;
    $table_name = $wpdb->prefix . 'octo_user_designs';

    $design = $wpdb->get_row(
        $wpdb->prepare(
            "SELECT * FROM {$table_name} WHERE id = %d AND user_id = %d",
            $design_id,
            $user_id
        ),
        ARRAY_A
    );

    if (!$design) {
        return new WP_Error('not_found', __('Design not found...'));
    }

    // Add template data to the design data
    $design['template_sizes'] = $template_sizes;
    $design['template_variations'] = $template_variations;

    return $design;
}
```

**Data Structure Returned**:
```json
{
  "id": 123,
  "user_id": 1,
  "template_id": 456,
  "name": "My Design",
  "design_data": "{\"objects\":[...],\"metadata\":{...}}",  // JSON string
  "product_images": "[...]",
  "created_at": "2025-10-03 12:00:00",
  "template_sizes": [...],
  "template_variations": [...]
}
```

**Coordinate Status**: Raw coordinates from database, no transformation yet.

---

### 1.2 AJAX Handler (PHP → JavaScript)

**File**: `/workspaces/yprint_designtool/public/class-octo-print-designer-designer.php`

```php
// Line 468-542: handle_load_design()
public function handle_load_design() {
    error_log('=== DESIGN LOAD DEBUG START ===');

    // Verify nonce and user authentication
    if (!wp_verify_nonce($_POST['nonce'], 'octo_print_designer_nonce')) {
        wp_send_json_error(array('message' => __('Security check failed')));
    }

    if (!is_user_logged_in()) {
        wp_send_json_error(array('message' => __('You must be logged in')));
    }

    $design_id = absint($_POST['design_id']);
    $user_id = get_current_user_id();

    // Retrieve design from database
    $design = $this->get_design_from_db($design_id, $user_id);

    if (is_wp_error($design)) {
        wp_send_json_error(array('message' => $design->get_error_message()));
    }

    // Validate JSON
    $test_decode = json_decode($design['design_data'], true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        wp_send_json_error(array(
            'message' => 'Invalid design data format',
            'json_error' => json_last_error_msg()
        ));
    }

    // Send design data to frontend (NO TRANSFORMATION)
    wp_send_json_success(array(
        'design' => $design,
        'debug' => array(
            'design_id' => $design_id,
            'design_data_length' => strlen($design['design_data']),
            'has_variation_images' => isset($test_decode['variationImages']),
        )
    ));
}
```

**AJAX Endpoint**: `wp_ajax_load_design`
**Registered**: Line 16 in same file

**Coordinate Status**: Still raw, sent to JavaScript as-is.

---

### 1.3 JavaScript Load Handler

**File**: `/workspaces/yprint_designtool/public/js/dist/designer.bundle.js`

```javascript
// Line 1922-1989: loadDesign()
async function loadDesign(designId) {
    if (!this.isLoggedIn) {
        this.showLoginModal();
        return;
    }

    try {
        const formData = new FormData();
        formData.append('action', 'load_design');
        formData.append('nonce', octoPrintDesigner.nonce);
        formData.append('design_id', designId);

        const response = await fetch(octoPrintDesigner.ajaxUrl, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();

        if (data.success) {
            this.toastManager.show('Design loaded', 'success');
            await this.applyDesignState(data.data);  // ← TRANSFORMATION HAPPENS HERE
        } else {
            throw new Error(data.data.message || 'Error loading design');
        }
    } catch (error) {
        this.toastManager.show('Error loading the design', 'error');
        console.error('Error loading design:', error);
        alert('Failed to load design: ' + error.message);
    }
}
```

**Coordinate Status**: Still raw, about to be transformed.

---

### 1.4 Design State Application (CRITICAL)

**File**: `/workspaces/yprint_designtool/public/js/dist/designer.bundle.js`

```javascript
// Line 2140-2238: applyDesignState()
async applyDesignState(design) {
    const designData = JSON.parse(design.design_data);

    // PHASE 3.1 FIX: Format Detection - support both Golden Standard and Legacy formats
    if (designData.metadata && designData.metadata.capture_version) {
        // Golden Standard Format detected
        console.log("[PHASE 3.1 FIX] Loading Golden Standard format (version: " +
                    designData.metadata.capture_version + ")");
        await this.applyGoldenStandardFormat(designData);  // ← NEW FORMAT PATH
        return;
    }

    // Legacy format (variationImages) - existing logic below
    console.log("[PHASE 3.1 FIX] Loading legacy variationImages format");

    // Load the template first
    await this.loadTemplate(designData.templateId);

    // Clear existing images
    this.variationImages.clear();

    // Restore variation images - handle both formats
    for (const [key, value] of Object.entries(designData.variationImages || {})) {
        const [variationId, viewId] = key.split('_');

        if (Array.isArray(value)) {
            // New format: array of images
            for (const imageData of value) {
                await this.restoreViewImage(variationId, viewId, imageData);  // ← LEGACY PATH
            }
        } else {
            await this.restoreViewImage(variationId, viewId, value);
        }
    }

    // Store the current design ID
    this.currentDesignId = design.id;
    this.modalNameInput.value = design.name;
    this.modalDesignId.value = design.id;
}
```

**Format Detection Logic**:
- **IF** `metadata.capture_version` exists → Golden Standard Format (NEW)
- **ELSE** → Legacy `variationImages` Format (OLD)

**Coordinate Status**: About to be transformed based on format.

---

### 1.5 Golden Standard Format Load (NEW PATH)

**File**: `/workspaces/yprint_designtool/public/js/dist/designer.bundle.js`

```javascript
// Line 2246-2352: applyGoldenStandardFormat()
async applyGoldenStandardFormat(designData) {
    try {
        console.log("[PHASE 3.1 FIX] applyGoldenStandardFormat() - Starting...");

        const objects = designData.objects || [];
        const metadata = designData.metadata || {};
        const templateId = metadata.template_id;

        // Validate Golden Standard structure
        if (!metadata.capture_version) {
            throw new Error("Invalid Golden Standard format: missing capture_version");
        }

        console.log("[PHASE 3.1 FIX] Loading " + objects.length + " objects from Golden Standard format");

        // Clear existing variationImages
        this.variationImages.clear();

        // Load template if specified
        if (templateId) {
            console.log("[PHASE 3.1 FIX] Loading template: " + templateId);
            await this.loadTemplate(templateId);
        }

        // Process each object and restore to variationImages Map
        const loadPromises = objects.map(obj => (async () => {
            if (obj.type !== "image") {
                return;
            }

            // Extract variation and view IDs from elementMetadata
            const variationId = obj.elementMetadata && obj.elementMetadata.variation_id;
            const viewId = obj.elementMetadata && obj.elementMetadata.view_id;

            if (!variationId || !viewId) {
                console.warn("[PHASE 3.1 FIX] Skipping object without variation_id or view_id:", obj);
                return;
            }

            // Reconstruct imageData structure for restoreViewImage()
            const imageData = {
                id: obj.id,
                url: obj.src,
                transform: {
                    left: obj.left,      // ← FLAT coordinates from Golden Standard
                    top: obj.top,
                    scaleX: obj.scaleX,
                    scaleY: obj.scaleY,
                    angle: obj.angle || 0
                }
            };

            // Use existing restoreViewImage method to load the image
            await this.restoreViewImage(variationId, viewId, imageData);  // ← FEEDS INTO LEGACY PATH
        })());

        // Wait for all images to load
        await Promise.all(loadPromises);

        console.log("[PHASE 3.1 FIX] Golden Standard format loaded successfully");
    } catch (error) {
        console.error("[PHASE 3.1 FIX] Error loading Golden Standard format:", error);
        throw error;
    }
}
```

**CRITICAL OBSERVATION**:
- Converts Golden Standard flat coordinates → nested `transform` object
- Then calls `restoreViewImage()` which applies OFFSET-FIX logic
- **This defeats the purpose of Golden Standard!**

---

### 1.6 Restore View Image (TRANSFORMATION APPLIED)

**File**: `/workspaces/yprint_designtool/public/js/dist/designer.bundle.js`

```javascript
// Line 2354-2419: restoreViewImage()
async restoreViewImage(variationId, viewId, imageData) {
    try {
        const img = await fabric.Image.fromURL(imageData.url);

        // Set image properties
        img.set({
            originX: 'center',
            originY: 'center',
            cornerSize: 10,
            cornerStyle: 'circle',
            transparentCorners: false,
            cornerColor: '#007cba',
            borderColor: '#007cba',
            cornerStrokeColor: '#fff',
            padding: 5,
            centeredScaling: true,
            preserveAspectRatio: true,
            ...imageData.transform  // ← APPLIES TRANSFORM (left, top, scaleX, scaleY)
        });

        // Store image ID in fabric object for reference
        img.data = {
            imageId: imageData.id || `img_${Date.now()}_${Math.floor(Math.random() * 1000)}`
        };

        // Get or create key in variationImages map
        const key = `${variationId}_${viewId}`;
        if (!this.variationImages.has(key)) {
            this.variationImages.set(key, []);
        }

        // Add image to the array
        this.variationImages.get(key).push({
            id: img.data.imageId,
            url: imageData.url,
            transform: imageData.transform,  // ← STORES TRANSFORM
            fabricImage: img,
            visible: imageData.visible !== undefined ? imageData.visible : true
        });

        // Bind events to the image
        this.bindImageEvents(img);

        return img;
    } catch (error) {
        console.error('Error restoring view image:', error);
        throw error;
    }
}
```

**Coordinate Status**: Stored in `variationImages` Map, ready for rendering.

---

### 1.7 Load View Image (RENDERING WITH OFFSET-FIX)

**File**: `/workspaces/yprint_designtool/public/js/dist/designer.bundle.js`

```javascript
// Line 1086-1156: loadViewImage()
function loadViewImage() {
    if (!this.currentView || !this.currentVariation) return;

    const key = `${this.currentVariation}_${this.currentView}`;
    const imagesArray = this.variationImages.get(key);

    if (!imagesArray || imagesArray.length === 0) return;

    // Get template and variation data for filter settings
    const template = this.templates.get(this.activeTemplateId);
    const variation = template.variations.get(this.currentVariation.toString());
    const isDarkShirt = variation.is_dark_shirt === true;

    // Load each image
    imagesArray.forEach(imageData => {
        // Skip if we already have this image on canvas (avoids duplicates)
        if (imageData.fabricImage && this.fabricCanvas.contains(imageData.fabricImage)) {
            return;
        }

        // If we have a URL but no fabric instance, create one
        if (imageData.url && !imageData.fabricImage) {
            fabric.Image.fromURL(imageData.url).then(img => {
                // Store the fabricImage reference
                imageData.fabricImage = img;

                // 🔧 OFFSET-FIX: Backward-compatible offset handling
                if (imageData && imageData.transform) {
                    // Check if this is a NEW design with offset already applied
                    if (imageData.metadata && imageData.metadata.offset_applied === true) {
                        console.log('🔧 OFFSET-FIX: Loading NEW design - subtracting offset', {
                            offset_x: imageData.metadata.offset_x,
                            offset_y: imageData.metadata.offset_y
                        });

                        // SUBTRACT offset for new designs (reverse of save operation)
                        imageData.transform.left -= (imageData.metadata.offset_x || 0);
                        imageData.transform.top -= (imageData.metadata.offset_y || 0);
                    } else {
                        // OLD design without offset metadata - use coordinates as-is
                        console.log('🔧 OFFSET-FIX: Loading OLD design - using coordinates as-is (backward compatible)');
                    }
                }

                // Apply common settings and load the image
                this.configureAndLoadFabricImage(imageData, isDarkShirt);
            });
        } else if (imageData.fabricImage) {
            // We have a fabric instance already, just configure and add

            // 🔧 OFFSET-FIX: Backward-compatible offset handling (DUPLICATE LOGIC!)
            if (imageData && imageData.transform) {
                // Check if this is a NEW design with offset already applied
                if (imageData.metadata && imageData.metadata.offset_applied === true) {
                    console.log('🔧 OFFSET-FIX: Loading NEW design - subtracting offset', {
                        offset_x: imageData.metadata.offset_x,
                        offset_y: imageData.metadata.offset_y
                    });

                    // SUBTRACT offset for new designs (reverse of save operation)
                    imageData.transform.left -= (imageData.metadata.offset_x || 0);
                    imageData.transform.top -= (imageData.metadata.offset_y || 0);
                } else {
                    // OLD design without offset metadata - use coordinates as-is
                    console.log('🔧 OFFSET-FIX: Loading OLD design - using coordinates as-is (backward compatible)');
                }
            }

            this.configureAndLoadFabricImage(imageData, isDarkShirt);
        }
    });
}
```

**OFFSET-FIX LOGIC** (Lines 1111-1151):

**Branching Condition**: `imageData.metadata.offset_applied === true`

**Branch A (NEW design)**:
```javascript
// SUBTRACT offset for new designs (reverse of save operation)
imageData.transform.left -= (imageData.metadata.offset_x || 0);
imageData.transform.top -= (imageData.metadata.offset_y || 0);
```

**Branch B (OLD design)**:
```javascript
// OLD design without offset metadata - use coordinates as-is
console.log('🔧 OFFSET-FIX: Loading OLD design - using coordinates as-is (backward compatible)');
```

**WHY THIS IS WRONG**:
1. **Mutates loaded coordinates** - Changes the "source of truth" after loading
2. **Creates interpretation layer** - Different behavior based on metadata
3. **Duplicated in two places** - Lines 1111-1127 and 1135-1151 (identical logic)
4. **Violates Single Source of Truth** - Database coordinates should be authoritative

---

### 1.8 Configure and Load Fabric Image (FINAL RENDERING)

**File**: `/workspaces/yprint_designtool/public/js/dist/designer.bundle.js`

```javascript
// Line 1158-1225: configureAndLoadFabricImage()
function configureAndLoadFabricImage(imageData, isDarkShirt) {
    const img = imageData.fabricImage;

    // Reset filters
    img.filters = [];

    if (isDarkShirt) {
        // Settings for dark shirts (keep existing logic)
        img.filters.push(
            new fabric.filters.Contrast({ contrast: 0.15 }),
            new fabric.filters.BlendColor({
                color: '#ffffff',
                mode: 'screen',
                alpha: 0.1
            })
        );
        img.applyFilters();

        img.set({
            ...imageData.transform,  // ← APPLIES TRANSFORMED COORDINATES
            cornerSize: 10,
            cornerStyle: 'circle',
            transparentCorners: false,
            cornerColor: '#007cba',
            borderColor: '#007cba',
            cornerStrokeColor: '#fff',
            padding: 5,
            globalCompositeOperation: 'screen',
            preserveAspectRatio: true,
            clipPath: this.clipMask,
            opacity: 0.95,
            visible: imageData.visible !== undefined ? imageData.visible : true
        });
    } else {
        // Settings for light shirts (keep existing logic)
        img.filters.push(
            new fabric.filters.Brightness({ brightness: -0.05 }),
            new fabric.filters.Contrast({ contrast: 0.1 }),
            new fabric.filters.BlendColor({
                color: '#ffffff',
                mode: 'multiply',
                alpha: 0.9
            })
        );
        img.applyFilters();

        img.set({
            ...imageData.transform,  // ← APPLIES TRANSFORMED COORDINATES
            cornerSize: 10,
            cornerStyle: 'circle',
            transparentCorners: false,
            cornerColor: '#007cba',
            borderColor: '#007cba',
            cornerStrokeColor: '#fff',
            padding: 5,
            globalCompositeOperation: 'multiply',
            preserveAspectRatio: true,
            clipPath: this.clipMask,
            opacity: 0.8,
            visible: imageData.visible !== undefined ? imageData.visible : true
        });
    }

    // Bind events to this image
    this.bindImageEvents(img);

    // Add to canvas
    this.fabricCanvas.add(img);
    img.setCoords();

    // Render canvas
    this.fabricCanvas.renderAll();
}
```

**Final Coordinate Application**:
- `img.set({ ...imageData.transform })` applies the **transformed** coordinates
- These coordinates have potentially been modified by OFFSET-FIX logic
- **NOT** the raw coordinates from database

---

## 2. ALL COORDINATE TRANSFORMATIONS IDENTIFIED

### 2.1 Transformation #1: OFFSET-FIX Subtraction (loadViewImage)

**Location**: `/workspaces/yprint_designtool/public/js/dist/designer.bundle.js:1111-1127`

**Code**:
```javascript
// Check if this is a NEW design with offset already applied
if (imageData.metadata && imageData.metadata.offset_applied === true) {
    console.log('🔧 OFFSET-FIX: Loading NEW design - subtracting offset', {
        offset_x: imageData.metadata.offset_x,
        offset_y: imageData.metadata.offset_y
    });

    // SUBTRACT offset for new designs (reverse of save operation)
    imageData.transform.left -= (imageData.metadata.offset_x || 0);
    imageData.transform.top -= (imageData.metadata.offset_y || 0);
}
```

**Purpose**: Reverse the offset that was added during save
**Problem**: Creates circular dependency - save adds offset, load subtracts it
**When Applied**: Only for NEW designs with `metadata.offset_applied === true`

---

### 2.2 Transformation #2: OFFSET-FIX Subtraction (DUPLICATE)

**Location**: `/workspaces/yprint_designtool/public/js/dist/designer.bundle.js:1135-1151`

**Code**: Identical to Transformation #1

**Purpose**: Same as above, but for already-instantiated Fabric.js images
**Problem**: Same logic duplicated in different code branch
**When Applied**: Only for NEW designs with `metadata.offset_applied === true`

---

### 2.3 Transformation #3: PHP Backend Offset Subtraction (API Integration)

**Location**: `/workspaces/yprint_designtool/includes/class-octo-print-api-integration.php:657-682`

**Code**:
```php
// 🔧 OFFSET-FIX: Handle frontend canvas offset compensation (Issue #canvas-offset-50px)
// New designs (saved with designer.bundle.js offset fix) have metadata.offset_applied = true
// Old designs (before fix) have no metadata.offset_applied flag
// For new designs: Subtract offset to get true print coordinates
// For old designs: Use coordinates as-is (backward compatible)
if (isset($transform_data['metadata']['offset_applied']) &&
    $transform_data['metadata']['offset_applied'] === true) {

    $offset_x = floatval($transform_data['metadata']['offset_x'] ?? 0);
    $offset_y = floatval($transform_data['metadata']['offset_y'] ?? 0);

    // Subtract offset for new designs (reverse of frontend save operation)
    $left_px -= $offset_x;
    $top_px -= $offset_y;

    error_log(sprintf(
        '🔧 OFFSET-FIX: Applied coordinate offset correction - X: %.2f, Y: %.2f',
        $offset_x,
        $offset_y
    ));
} else {
    // Old design without offset metadata - use coordinates as-is
    error_log('🔧 OFFSET-FIX: No offset metadata - using coordinates as-is (backward compatible)');
}
```

**Purpose**: Convert canvas coordinates to print coordinates for API submission
**Problem**: Same metadata-based branching logic as frontend
**When Applied**: During API order processing (print submission)

---

### 2.4 Transformation #4: Golden Standard → Legacy Conversion

**Location**: `/workspaces/yprint_designtool/public/js/dist/designer.bundle.js:2305-2316`

**Code**:
```javascript
// Reconstruct imageData structure for restoreViewImage()
const imageData = {
    id: obj.id,
    url: obj.src,
    transform: {
        left: obj.left,      // ← Flat coordinate → nested transform
        top: obj.top,
        scaleX: obj.scaleX,
        scaleY: obj.scaleY,
        angle: obj.angle || 0
    }
};

// Use existing restoreViewImage method to load the image
await this.restoreViewImage(variationId, viewId, imageData);
```

**Purpose**: Convert Golden Standard flat coordinates to legacy nested format
**Problem**: Forces Golden Standard through OFFSET-FIX logic path
**When Applied**: When loading Golden Standard format designs

---

## 3. OFFSET-FIX LOGIC ANALYSIS

### 3.1 The OFFSET-FIX Pattern

**Definition**: Code that "corrects" loaded coordinates based on metadata flags

**Implementation**:
```javascript
if (imageData.metadata && imageData.metadata.offset_applied === true) {
    // NEW DESIGN PATH: Subtract offset
    imageData.transform.left -= (imageData.metadata.offset_x || 0);
    imageData.transform.top -= (imageData.metadata.offset_y || 0);
} else {
    // OLD DESIGN PATH: Use as-is
    // (no transformation)
}
```

**Locations**:
1. `designer.bundle.js:1111-1127` (loadViewImage - fromURL path)
2. `designer.bundle.js:1135-1151` (loadViewImage - fabricImage path)
3. `class-octo-print-api-integration.php:662-682` (API submission)

---

### 3.2 Why OFFSET-FIX is Wrong

#### Violation #1: Interpretation Layer
**Problem**: Coordinates are "interpreted" based on metadata, not used directly

**Example**:
```javascript
// Database: { left: 390, top: 290, metadata: { offset_applied: true, offset_x: 50, offset_y: 0 } }
// After OFFSET-FIX: { left: 340, top: 290 }
// → The "true" coordinate is now 340, not 390 (database is wrong!)
```

**Impact**: Database is no longer the source of truth

---

#### Violation #2: Circular Dependency
**Problem**: Save adds offset, load subtracts it

**Save Flow**:
```javascript
// Save: Add 50px offset
const savedLeft = canvasLeft + 50;  // 340 + 50 = 390
// Save to DB: { left: 390, metadata: { offset_applied: true, offset_x: 50 } }
```

**Load Flow**:
```javascript
// Load from DB: { left: 390, metadata: { offset_applied: true, offset_x: 50 } }
// Load: Subtract 50px offset
const displayLeft = savedLeft - 50;  // 390 - 50 = 340
```

**Impact**: Coordinates are transformed twice (once on save, once on load)

---

#### Violation #3: Metadata Dependency
**Problem**: Coordinate meaning depends on separate metadata field

**Example**:
```javascript
// SAME coordinate, DIFFERENT meanings:
{ left: 390 }  // Without metadata → Display at 390px
{ left: 390, metadata: { offset_applied: true, offset_x: 50 } }  // With metadata → Display at 340px
```

**Impact**: Can't understand coordinates without context

---

#### Violation #4: Multiple Code Paths
**Problem**: Different logic for "new" vs "old" designs

**Branches**:
- **NEW Design**: `offset_applied === true` → Subtract offset
- **OLD Design**: `offset_applied !== true` → Use as-is

**Impact**: Two different "truths" for how coordinates work

---

#### Violation #5: Defeats Golden Standard
**Problem**: Golden Standard format still goes through OFFSET-FIX

**Flow**:
```javascript
// Golden Standard: { objects: [{ left: 340, top: 290 }] }  // Flat coordinates
// ↓ applyGoldenStandardFormat()
// → Convert to: { transform: { left: 340, top: 290 } }  // Nested
// ↓ restoreViewImage()
// → Store in variationImages
// ↓ loadViewImage()
// → Apply OFFSET-FIX if metadata exists
// → Potentially transform AGAIN!
```

**Impact**: Golden Standard doesn't bypass the interpretation layer

---

### 3.3 Correct Approach (What Should Happen)

**Principle**: Database coordinates are ALWAYS correct, use them directly

**Load Logic**:
```javascript
// Load from DB
const design = await loadFromDatabase(designId);
const objects = JSON.parse(design.design_data).objects;

// Apply to Fabric.js DIRECTLY (no transformation)
objects.forEach(obj => {
    const img = await fabric.Image.fromURL(obj.src);
    img.set({
        left: obj.left,      // ← Use database value AS-IS
        top: obj.top,
        scaleX: obj.scaleX,
        scaleY: obj.scaleY,
        angle: obj.angle
    });
    canvas.add(img);
});
```

**No metadata checks, no offset subtraction, no interpretation**

---

## 4. METADATA CHECKS IDENTIFIED

### 4.1 Frontend Metadata Checks

**Location**: `designer.bundle.js:1114, 1138`

**Check**:
```javascript
if (imageData.metadata && imageData.metadata.offset_applied === true)
```

**Fields Used**:
- `metadata.offset_applied` (boolean)
- `metadata.offset_x` (number)
- `metadata.offset_y` (number)

**Purpose**: Determine if OFFSET-FIX should be applied

---

### 4.2 Backend Metadata Checks

**Location**: `class-octo-print-api-integration.php:662`

**Check**:
```php
if (isset($transform_data['metadata']['offset_applied']) &&
    $transform_data['metadata']['offset_applied'] === true)
```

**Fields Used**:
- `metadata['offset_applied']` (boolean)
- `metadata['offset_x']` (float)
- `metadata['offset_y']` (float)

**Purpose**: Determine if OFFSET-FIX should be applied during API submission

---

### 4.3 Format Detection Metadata Check

**Location**: `designer.bundle.js:2150`

**Check**:
```javascript
if (designData.metadata && designData.metadata.capture_version)
```

**Fields Used**:
- `metadata.capture_version` (string)

**Purpose**: Detect Golden Standard vs Legacy format

---

## 5. BACKWARD COMPATIBILITY LOGIC

### 5.1 Legacy Format Support

**Location**: `designer.bundle.js:2140-2238`

**Logic**:
```javascript
async applyDesignState(design) {
    const designData = JSON.parse(design.design_data);

    // Format Detection
    if (designData.metadata && designData.metadata.capture_version) {
        // Golden Standard Format detected
        await this.applyGoldenStandardFormat(designData);
        return;
    }

    // Legacy format (variationImages) - existing logic
    await this.loadTemplate(designData.templateId);
    this.variationImages.clear();

    // Restore variation images
    for (const [key, value] of Object.entries(designData.variationImages || {})) {
        const [variationId, viewId] = key.split('_');

        if (Array.isArray(value)) {
            // New format: array of images
            for (const imageData of value) {
                await this.restoreViewImage(variationId, viewId, imageData);
            }
        } else {
            // Old format: single image object
            await this.restoreViewImage(variationId, viewId, value);
        }
    }
}
```

**Supported Formats**:
1. **Golden Standard** - `{ objects: [...], metadata: { capture_version: "3.0.0" } }`
2. **Legacy Array** - `{ variationImages: { "1_front": [...] } }`
3. **Legacy Object** - `{ variationImages: { "1_front": {...} } }`

---

### 5.2 OFFSET-FIX Backward Compatibility

**Location**: `designer.bundle.js:1114-1127, 1138-1151`

**Logic**:
```javascript
if (imageData.metadata && imageData.metadata.offset_applied === true) {
    // NEW DESIGN: Subtract offset
    imageData.transform.left -= (imageData.metadata.offset_x || 0);
    imageData.transform.top -= (imageData.metadata.offset_y || 0);
} else {
    // OLD DESIGN: Use coordinates as-is (backward compatible)
}
```

**Design Categories**:
1. **NEW Designs** - Have `metadata.offset_applied === true` → Offset subtracted
2. **OLD Designs** - No metadata → Used as-is

**WHY THIS VIOLATES SINGLE SOURCE OF TRUTH**:
- **NEW designs**: Database coordinates are WRONG (include offset), need correction
- **OLD designs**: Database coordinates are RIGHT, used directly
- **Result**: Same database field means different things based on metadata

---

## 6. FABRIC.JS RECONSTRUCTION REQUIREMENTS

### 6.1 Current Fabric.js Usage

**Method Used**: `fabric.Image.fromURL()`

**Location**: `designer.bundle.js:1107, 2363`

**Code**:
```javascript
const img = await fabric.Image.fromURL(imageData.url);
```

**Properties Applied**:
```javascript
img.set({
    originX: 'center',
    originY: 'center',
    left: imageData.transform.left,      // ← Transformed coordinates
    top: imageData.transform.top,
    scaleX: imageData.transform.scaleX,
    scaleY: imageData.transform.scaleY,
    angle: imageData.transform.angle || 0,
    // ... styling properties
});
```

---

### 6.2 What's Missing: fabric.Image.fromObject()

**Not Used**: `fabric.Image.fromObject()`

**Why It Would Be Better**:
```javascript
// Current approach (creates image, then sets properties)
const img = await fabric.Image.fromURL(url);
img.set({ left: 340, top: 290, ... });

// Better approach (creates image WITH properties)
const img = await fabric.Image.fromObject({
    type: 'image',
    src: url,
    left: 340,
    top: 290,
    scaleX: 1.0,
    scaleY: 1.0,
    angle: 0
});
```

**Benefits of `fromObject()`**:
1. Single operation (not create + set)
2. Matches save format (objects with properties)
3. No intermediate state
4. Better for serialization/deserialization

---

### 6.3 Required Properties for Fabric.js

**Minimum Required**:
```javascript
{
    type: 'image',
    src: 'https://...',
    left: 340,           // Canvas X coordinate
    top: 290,            // Canvas Y coordinate
    scaleX: 1.0,         // Horizontal scale
    scaleY: 1.0,         // Vertical scale
    angle: 0             // Rotation in degrees
}
```

**Optional (for styling)**:
```javascript
{
    originX: 'center',
    originY: 'center',
    cornerSize: 10,
    cornerStyle: 'circle',
    cornerColor: '#007cba',
    borderColor: '#007cba',
    globalCompositeOperation: 'multiply',
    clipPath: clipMaskObject,
    opacity: 0.8,
    filters: [...]
}
```

**Current Status**: All properties are provided, but coordinates are transformed

---

### 6.4 Coordinate Usage Analysis

**Are coordinates used as-is?**
❌ **NO** - Coordinates are transformed by OFFSET-FIX before being applied

**Are coordinates modified?**
✅ **YES** - Lines 1111-1127, 1135-1151 subtract offset

**Example**:
```javascript
// Database: { left: 390, metadata: { offset_applied: true, offset_x: 50 } }
// After OFFSET-FIX: imageData.transform.left = 390 - 50 = 340
// Applied to Fabric: img.set({ left: 340 })
```

**Impact**: Fabric.js never sees the database coordinates directly

---

## 7. IDEAL LOAD IMPLEMENTATION

### 7.1 Correct Load Flow

**Principle**: Trust database coordinates completely

```javascript
// 1. Load from database
const design = await loadDesignFromDatabase(designId);
const designData = JSON.parse(design.design_data);

// 2. Validate format (Golden Standard required)
if (!designData.metadata || !designData.metadata.capture_version) {
    throw new Error('Legacy format not supported - migrate to Golden Standard');
}

// 3. Load template
await this.loadTemplate(designData.metadata.template_id);

// 4. Reconstruct objects DIRECTLY
for (const obj of designData.objects) {
    if (obj.type !== 'image') continue;

    // Create Fabric.js image with database coordinates AS-IS
    const img = await fabric.Image.fromObject({
        type: 'image',
        src: obj.src,
        left: obj.left,      // ← NO TRANSFORMATION
        top: obj.top,
        scaleX: obj.scaleX,
        scaleY: obj.scaleY,
        angle: obj.angle || 0,
        // ... other properties
    });

    // Add to canvas
    this.fabricCanvas.add(img);
}

// 5. Render
this.fabricCanvas.renderAll();
```

**NO metadata checks, NO offset subtraction, NO interpretation**

---

### 7.2 Remove OFFSET-FIX Logic

**Delete These Lines**:
- `designer.bundle.js:1111-1127` (OFFSET-FIX in fromURL path)
- `designer.bundle.js:1135-1151` (OFFSET-FIX in fabricImage path)
- `class-octo-print-api-integration.php:657-682` (PHP OFFSET-FIX)

**Replace With**:
```javascript
// Simply use coordinates as-is (already correct in database)
const img = await fabric.Image.fromURL(imageData.url);
img.set(imageData.transform);  // No transformation needed
```

---

### 7.3 Eliminate Metadata Dependency

**Remove These Metadata Fields**:
- `metadata.offset_applied` (boolean)
- `metadata.offset_x` (number)
- `metadata.offset_y` (number)

**Keep These Metadata Fields**:
- `metadata.capture_version` (for format detection)
- `metadata.template_id` (for template loading)
- `metadata.canvas_dimensions` (for validation)
- `metadata.saved_at` (for audit trail)

---

### 7.4 Use fabric.Image.fromObject()

**Current**:
```javascript
const img = await fabric.Image.fromURL(imageData.url);
img.set(imageData.transform);
```

**Better**:
```javascript
const img = await fabric.Image.fromObject({
    type: 'image',
    src: imageData.url,
    ...imageData.transform  // Flat properties, not nested
});
```

**Benefits**:
1. Single operation
2. Matches Golden Standard format
3. Less room for transformation errors

---

## 8. SUMMARY OF VIOLATIONS

### 8.1 Single Source of Truth Violations

| Violation | Location | Impact |
|-----------|----------|--------|
| **OFFSET-FIX Subtraction** | `designer.bundle.js:1111-1127, 1135-1151` | Database coordinates are wrong, need correction |
| **Metadata-Based Branching** | `designer.bundle.js:1114, 1138` | Same coordinates mean different things |
| **PHP Backend OFFSET-FIX** | `class-octo-print-api-integration.php:662` | Backend also interprets coordinates |
| **Golden Standard Conversion** | `designer.bundle.js:2305-2316` | Forces new format through old logic |
| **Duplicated Logic** | Two identical blocks in `loadViewImage()` | Inconsistency risk |

---

### 8.2 Architecture Problems

1. **Interpretation Layer**: Coordinates are "corrected" based on metadata
2. **Circular Dependency**: Save adds offset, load subtracts it
3. **Format Mixing**: Golden Standard converted to Legacy format
4. **Multiple Truths**: Different logic for "new" vs "old" designs
5. **No Direct Reconstruction**: Never uses `fabric.Image.fromObject()`

---

## 9. RECOMMENDATIONS

### 9.1 Immediate Actions

1. **Remove OFFSET-FIX Logic**
   - Delete lines 1111-1127, 1135-1151 in `designer.bundle.js`
   - Delete lines 657-682 in `class-octo-print-api-integration.php`

2. **Trust Database Coordinates**
   - Use coordinates from database AS-IS
   - No metadata-based transformations

3. **Use fabric.Image.fromObject()**
   - Replace `fromURL()` + `set()` with single `fromObject()` call
   - Matches Golden Standard format

---

### 9.2 Migration Strategy

**Phase 1**: Stop creating new OFFSET-FIX data
- Remove offset addition during save
- Save raw canvas coordinates

**Phase 2**: Migrate existing data
- Run migration script to remove offset from database
- Clear `metadata.offset_applied` flags

**Phase 3**: Remove OFFSET-FIX code
- Delete all OFFSET-FIX logic
- Simplify load path

---

## 10. CONCLUSION

The design load and display system has **systematic architectural flaws**:

1. **OFFSET-FIX logic** subtracts 50px during load, violating Single Source of Truth
2. **Metadata-based branching** creates multiple interpretations of same coordinates
3. **No direct Fabric.js reconstruction** - always applies transformations

**Impact**: Database coordinates cannot be trusted, system has multiple "truths"

**Solution**:
- Remove ALL coordinate transformations during load
- Trust database coordinates completely
- Use `fabric.Image.fromObject()` for direct reconstruction

**Next Agent**: Proceed to Agent 5 for legacy data analysis and migration strategy.

---

**END OF ANALYSIS**
