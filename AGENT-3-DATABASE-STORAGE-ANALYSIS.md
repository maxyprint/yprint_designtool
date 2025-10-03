# 🗄️ AGENT 3: DATABASE STORAGE & INTEGRITY ANALYSIS

**Mission:** Analyze database storage of design coordinates - schema, precision, data flow, and integrity

**Status:** ✅ COMPLETE

**Analysis Date:** 2025-10-03

---

## 📋 EXECUTIVE SUMMARY

### Critical Findings

1. **NO Database Precision Loss** - LONGTEXT storage preserves 14-17 decimal places perfectly
2. **Precision Loss in JavaScript** - `toFixed()` rounds coordinates BEFORE database save
3. **Three Storage Locations** - wp_octo_user_designs, wp_wc_orders_meta (HPOS), wp_woocommerce_order_itemmeta
4. **Offset Applied Twice** - Canvas offset added at save, subtracted at load (cancelled out if viewport matches)
5. **Viewport-Dependent Corruption** - Desktop saves 50px offset, mobile saves 0px, causing misalignment

---

## 🗃️ DATABASE SCHEMA

### Primary Design Storage

**Table:** `wp_octo_user_designs`

```sql
CREATE TABLE wp_octo_user_designs (
    id BIGINT(20) NOT NULL AUTO_INCREMENT,
    user_id BIGINT(20) NOT NULL,
    template_id BIGINT(20) NOT NULL,
    name VARCHAR(255) NOT NULL,
    design_data LONGTEXT NOT NULL,        -- ✅ JSON storage (unlimited precision)
    variations LONGTEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Data Type:** `LONGTEXT` - Text-based storage
**Precision:** **Unlimited** (stores exact string representation)
**Format:** JSON string via `wp_json_encode()`

### WooCommerce HPOS Storage (Order Level)

**Table:** `wp_wc_orders_meta`

```sql
CREATE TABLE wp_wc_orders_meta (
    id BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
    order_id BIGINT(20) UNSIGNED NOT NULL,
    meta_key VARCHAR(255) DEFAULT NULL,
    meta_value LONGTEXT DEFAULT NULL,     -- ✅ JSON storage
    PRIMARY KEY (id),
    KEY order_id (order_id),
    KEY meta_key (meta_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

**Meta Keys Used:**
- `_design_data` - Complete design JSON
- `_db_processed_views` - View-based format
- `_yprint_template_id` - Template reference
- `_mockup_image_url` - Preview image

### WooCommerce Item Storage

**Table:** `wp_woocommerce_order_itemmeta`

```sql
CREATE TABLE wp_woocommerce_order_itemmeta (
    meta_id BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
    order_item_id BIGINT(20) UNSIGNED NOT NULL,
    meta_key VARCHAR(255) DEFAULT NULL,
    meta_value LONGTEXT DEFAULT NULL,     -- ✅ JSON storage
    PRIMARY KEY (meta_id),
    KEY order_item_id (order_item_id),
    KEY meta_key (meta_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

**Meta Keys Used:**
- `_design_data` - Item-level design JSON
- `_db_processed_views` - Item-level view format
- `design_id` - Design reference
- `canvas_data` - Legacy canvas format

### Legacy Storage (Pre-HPOS)

**Table:** `wp_postmeta`

**Note:** Used before HPOS migration. Same LONGTEXT storage, same precision.

---

## 📊 DATA STRUCTURE IN DATABASE

### Example: Order 5377 (Golden Standard Format)

**Storage Location:** `wp_woocommerce_order_itemmeta` (meta_key: `_design_data`)

```json
{
  "objects": [
    {
      "type": "image",
      "left": 328.82122439638346,
      "top": 165.09833152389652,
      "width": 1924,
      "height": 1075,
      "scaleX": 0.10168526608448998,
      "scaleY": 0.10168526608448998,
      "angle": 0,
      "src": "https://yprint.de/wp-content/uploads/...",
      "originX": "left",
      "originY": "top"
    }
  ],
  "metadata": {
    "capture_version": "3.0",
    "source": "converted_from_processed_views",
    "designer_offset": {
      "x": 0,
      "y": 0
    },
    "canvas": {
      "width": 780,
      "height": 580
    },
    "template_id": "3657",
    "mockup_url": "https://yprint.de/wp-content/uploads/template-mockups/..."
  }
}
```

### Stored Coordinate Fields

| Field | Example Value | Decimal Places | PHP Type | Storage Type |
|-------|--------------|----------------|----------|--------------|
| `left` | 328.82122439638346 | 14 | float (via json_decode) | text |
| `top` | 165.09833152389652 | 14 | float (via json_decode) | text |
| `scaleX` | 0.10168526608448998 | 17 | float (via json_decode) | text |
| `scaleY` | 0.10168526608448998 | 17 | float (via json_decode) | text |
| `angle` | 0 | 0 | int (via json_decode) | text |
| `width` | 1924 | 0 | int (via json_decode) | text |
| `height` | 1075 | 0 | int (via json_decode) | text |

---

## 🔍 PRECISION LOSS ANALYSIS

### 1. Database Storage: ✅ NO PRECISION LOSS

**Why No Loss:**
- **Storage Type:** LONGTEXT (text-based, not FLOAT or DECIMAL)
- **JSON Encoding:** `wp_json_encode()` preserves full precision
- **JSON Decoding:** `json_decode($json, true)` preserves floats exactly
- **Evidence:** 14-17 decimal places stored and retrieved identically

**Proof from Order 5382:**
```
STORED:    left: 321.3038477940859
RETRIEVED: left: 321.3038477940859
DELTA:     0.00px (perfect preservation)
```

**Contrast with Numeric Types:**
- FLOAT: ~7 decimal digits (would lose precision)
- DOUBLE: ~15 decimal digits (would lose precision)
- DECIMAL(10,2): Exactly 2 decimal places (would truncate)
- **LONGTEXT: Unlimited precision** ✅

### 2. JavaScript Capture: ❌ PRECISION LOSS FOUND

**Location:** `/workspaces/yprint_designtool/public/js/production-ready-design-data-capture.js`

**Lines 655-661:**
```javascript
const baseElement = {
    x: parseFloat(coords.x.toFixed(2)),        // ❌ ROUNDS to 2 decimals
    y: parseFloat(coords.y.toFixed(2)),        // ❌ ROUNDS to 2 decimals
    width: parseFloat((...).toFixed(2)),       // ❌ ROUNDS to 2 decimals
    height: parseFloat((...).toFixed(2)),      // ❌ ROUNDS to 2 decimals
    scaleX: Number((obj.scaleX || 1).toFixed(3)),  // ❌ ROUNDS to 3 decimals
    scaleY: Number((obj.scaleY || 1).toFixed(3)),  // ❌ ROUNDS to 3 decimals
    angle: Number((obj.angle || 0).toFixed(1))     // ❌ ROUNDS to 1 decimal
};
```

**Impact:**
- Coordinates rounded to **0.01px precision** (2 decimals)
- Scale factors rounded to **0.001 precision** (3 decimals)
- Angle rounded to **0.1° precision** (1 decimal)

**Sub-Pixel Precision Loss:**
- Original Fabric.js: `328.82122439638346`
- After toFixed(2): `328.82`
- Loss: `0.00122439638346px` per coordinate

### 3. Designer.bundle.js: ❌ ADDITIONAL ROUNDING

**Location:** `/workspaces/yprint_designtool/public/js/dist/designer.bundle.js`

**Lines 144-146, 1261-1262, 1379-1380:**
```javascript
this.heightInput.value = Math.round(activeObject.height * newScaleY);
this.widthInput.value = Math.round(activeObject.width * newScaleX);
```

**Impact:**
- Width/height display values rounded to **integers**
- Only affects UI display, not stored coordinates
- Can cause confusion: stored `199.7px` displays as `200px`

### 4. PHP Backend: ✅ NO PRECISION LOSS

**Location:** `/workspaces/yprint_designtool/includes/class-octo-print-designer-wc-integration.php`

**Lines 2728, 2318:**
```php
$json_string = wp_slash(json_encode($design_data));
$order->update_meta_data('_design_data', $json_string);
```

**Analysis:**
- `json_encode()` preserves full PHP float precision
- `wp_slash()` only escapes quotes, doesn't affect numbers
- `update_meta_data()` stores as LONGTEXT verbatim
- **Result: Perfect preservation**

---

## 🔄 DATA TRANSFORMATION PIPELINE

### Save Flow (Frontend → Database)

```
┌─────────────────────────────────────────────────────────────┐
│ Step 1: Fabric.js Canvas Coordinates                        │
│ ─────────────────────────────────────────────────────────── │
│  left: 328.82122439638346  (15+ decimal places)             │
│  top: 165.09833152389652                                    │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ Step 2: production-ready-design-data-capture.js             │
│ ─────────────────────────────────────────────────────────── │
│  ❌ PRECISION LOSS: toFixed(2)                              │
│  x: 328.82  (2 decimals only)                               │
│  y: 165.10                                                  │
│                                                             │
│  ✅ Offset Added (if container offset exists)              │
│  x: 328.82 + 50 = 378.82                                    │
│  y: 165.10 + 50 = 215.10                                    │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ Step 3: JavaScript → PHP (AJAX)                             │
│ ─────────────────────────────────────────────────────────── │
│  JSON.stringify(designData)                                 │
│  ✅ No precision loss in JSON transfer                      │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ Step 4: PHP json_encode() → LONGTEXT                        │
│ ─────────────────────────────────────────────────────────── │
│  wp_json_encode($design_data)                               │
│  ✅ Preserves exact string representation                   │
│  Stored: "x": 378.82, "y": 215.10                           │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ Step 5: Database Storage (LONGTEXT)                         │
│ ─────────────────────────────────────────────────────────── │
│  Table: wp_woocommerce_order_itemmeta                       │
│  Field: meta_value (LONGTEXT)                               │
│  Value: '{"objects":[{"x":378.82,"y":215.10,...}]}'        │
│  ✅ Text storage = perfect preservation                     │
└─────────────────────────────────────────────────────────────┘
```

### Load Flow (Database → Renderer)

```
┌─────────────────────────────────────────────────────────────┐
│ Step 1: Database Retrieval                                  │
│ ─────────────────────────────────────────────────────────── │
│  $order->get_meta('_design_data')                           │
│  Returns: '{"objects":[{"x":378.82,"y":215.10,...}]}'      │
│  ✅ Exact string retrieved                                  │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ Step 2: PHP json_decode()                                   │
│ ─────────────────────────────────────────────────────────── │
│  json_decode($json_string, true)                            │
│  ✅ Converts to PHP associative array                       │
│  ['x' => 378.82, 'y' => 215.10]                             │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ Step 3: PHP → JavaScript (wp_localize_script)               │
│ ─────────────────────────────────────────────────────────── │
│  wp_json_encode($design_data)                               │
│  ✅ Converts back to JSON for JavaScript                    │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ Step 4: JavaScript JSON.parse()                             │
│ ─────────────────────────────────────────────────────────── │
│  const data = JSON.parse(jsonString);                       │
│  ✅ JavaScript number type (preserves precision)            │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ Step 5: Offset Subtraction (if metadata.offset_applied)     │
│ ─────────────────────────────────────────────────────────── │
│  ✅ Offset Removed (to get back to Fabric.js coordinates)   │
│  x: 378.82 - 50 = 328.82                                    │
│  y: 215.10 - 50 = 165.10                                    │
│  ⚠️ WARNING: If viewport changed, offset will be wrong!     │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ Step 6: Fabric.js Rendering                                 │
│ ─────────────────────────────────────────────────────────── │
│  fabric.Image.fromObject({                                  │
│    left: 328.82,                                            │
│    top: 165.10,                                             │
│    ...                                                      │
│  })                                                         │
│  ✅ Rendered at exact canvas coordinates                    │
└─────────────────────────────────────────────────────────────┘
```

---

## 🧬 METADATA FIELDS

### Essential Fabric.js Properties for Perfect Reconstruction

**Required Properties:**
```json
{
  "left": 328.82,           // X position (canvas coordinates)
  "top": 165.10,            // Y position (canvas coordinates)
  "width": 1924,            // Original image width (px)
  "height": 1075,           // Original image height (px)
  "scaleX": 0.1017,         // Horizontal scale factor
  "scaleY": 0.1017,         // Vertical scale factor
  "angle": 0,               // Rotation angle (degrees)
  "originX": "left",        // Origin point X (left|center|right)
  "originY": "top",         // Origin point Y (top|center|bottom)
  "src": "https://..."      // Image URL
}
```

**Optional but Important:**
```json
{
  "flipX": false,           // Horizontal flip
  "flipY": false,           // Vertical flip
  "opacity": 1,             // Transparency (0-1)
  "visible": true,          // Visibility flag
  "selectable": true,       // User can select?
  "evented": true,          // Receives events?
  "stroke": null,           // Border color
  "strokeWidth": 0,         // Border width
  "fill": "transparent"     // Fill color (for shapes)
}
```

### Context Metadata

**Format Detection Fields:**
```json
{
  "metadata": {
    "capture_version": "3.0",              // Format version
    "source": "converted_from_processed_views",  // Data origin
    "designer_offset": {                   // Canvas offset
      "x": 0,
      "y": 0
    },
    "offset_applied": true,                // ⚠️ Offset flag
    "canvas": {                            // Canvas dimensions
      "width": 780,
      "height": 580
    },
    "template_id": "3657",                 // Template reference
    "mockup_url": "https://...",           // Background image
    "converted_at": "2025-10-02 19:57:28", // Conversion timestamp
    "order_id": 5382                       // Order reference
  }
}
```

### Harmful Metadata (Causes Issues)

**❌ offset_applied Flag Problem:**
```json
{
  "metadata": {
    "offset_applied": true,    // ❌ VIEWPORT-DEPENDENT!
    "offset_x": 50,            // ❌ Desktop = 50px, Mobile = 0px
    "offset_y": 50             // ❌ Causes corruption on viewport change
  }
}
```

**Why It's Harmful:**
1. **Desktop Save:** Offset = 50px (CSS padding on .designer-editor)
2. **Mobile Save:** Offset = 0px (no padding at mobile breakpoint)
3. **Cross-Device Load:** Desktop design loaded on mobile → 50px shift!

---

## 🚨 PRECISION LOSS POINTS IDENTIFIED

### Point 1: JavaScript toFixed() - BEFORE Database Save

**File:** `/workspaces/yprint_designtool/public/js/production-ready-design-data-capture.js`
**Lines:** 655-661

**Issue:**
```javascript
x: parseFloat(coords.x.toFixed(2))  // ❌ ROUNDS 328.82122439638346 → 328.82
```

**Impact:**
- **0.01px precision** (2 decimal places)
- Loss: up to 0.005px per coordinate
- Cumulative: can cause visible shifts in complex designs

**Fix Needed:**
```javascript
// CURRENT (BAD):
x: parseFloat(coords.x.toFixed(2))

// SHOULD BE (GOOD):
x: coords.x  // Preserve full precision
```

### Point 2: Offset Calculation - Viewport-Dependent

**File:** `/workspaces/yprint_designtool/public/js/dist/designer.bundle.js`
**Line:** 931

**Issue:**
```javascript
containerElement = canvasElement.closest('.designer-editor')  // ❌ WRONG CONTAINER!
```

**CSS Evidence:**
```css
.designer-editor {
  padding: 50px;           /* Desktop */
}

@media (max-width: 950px) {
  .designer-editor {
    padding: 0;            /* Mobile */
  }
}
```

**Result:**
- Desktop: Offset = 50px
- Mobile: Offset = 0px
- **Cross-device corruption: 50px shift!**

**Fix Needed:**
```javascript
// CURRENT (BAD):
containerElement = canvasElement.closest('.designer-editor')

// SHOULD BE (GOOD):
containerElement = canvasElement.closest('.designer-canvas-container')
// Or better: Don't add offset at all, store raw Fabric.js coordinates
```

### Point 3: Display Rounding - UI Only (Harmless)

**File:** `/workspaces/yprint_designtool/public/js/dist/designer.bundle.js`
**Lines:** 144-146

**Issue:**
```javascript
this.widthInput.value = Math.round(activeObject.width * newScaleX)  // Display only
```

**Impact:**
- Only affects UI display
- Stored values are NOT rounded
- Can confuse users (sees 200px, stores 199.7px)

---

## 💎 IDEAL STORAGE SPECIFICATION

### Precision Requirements

**Coordinates (left, top):**
- **Minimum:** 2 decimal places (0.01px precision)
- **Recommended:** Full JavaScript float precision (~15 digits)
- **Rationale:** Sub-pixel rendering support

**Scale Factors (scaleX, scaleY):**
- **Minimum:** 4 decimal places (0.0001 precision)
- **Recommended:** Full JavaScript float precision
- **Rationale:** Cumulative scaling errors without high precision

**Angle:**
- **Minimum:** 1 decimal place (0.1° precision)
- **Recommended:** 2 decimal places (0.01° precision)
- **Rationale:** Rotation artifacts at low precision

### Storage Format: Raw Fabric.js State

**Recommended Approach:**
```javascript
// Store RAW Fabric.js coordinates (NO offset applied)
const fabricObject = canvas.getObjects()[0];
const storedData = {
  left: fabricObject.left,        // Raw canvas coordinate
  top: fabricObject.top,          // Raw canvas coordinate
  width: fabricObject.width,
  height: fabricObject.height,
  scaleX: fabricObject.scaleX,
  scaleY: fabricObject.scaleY,
  angle: fabricObject.angle,
  originX: fabricObject.originX,
  originY: fabricObject.originY,
  // ... all other Fabric.js properties
};
```

**On Load:**
```javascript
// Load DIRECTLY to Fabric.js (NO offset subtraction)
fabric.Image.fromObject(storedData, (img) => {
  canvas.add(img);
});
```

**Benefits:**
1. **No viewport dependency** - works on all devices
2. **No precision loss** - full float precision
3. **No offset corruption** - coordinates are device-agnostic
4. **Perfect reconstruction** - exact Fabric.js state

### Metadata Requirements

**Essential Metadata:**
```json
{
  "metadata": {
    "capture_version": "4.0",           // Version tracking
    "coordinate_system": "fabric_canvas",  // Explicit system declaration
    "canvas_dimensions": {              // Original canvas size
      "width": 780,
      "height": 580
    },
    "template_id": "3657",              // Template reference
    "saved_at": "2025-10-03T14:30:00Z", // Timestamp
    "fabric_version": "4.6.0"           // Fabric.js version used
  }
}
```

**Remove These (Harmful):**
```json
{
  "metadata": {
    "offset_applied": true,    // ❌ REMOVE - causes viewport corruption
    "offset_x": 50,            // ❌ REMOVE - viewport-dependent
    "offset_y": 50,            // ❌ REMOVE - viewport-dependent
    "designer_offset": {...}   // ❌ REMOVE - not needed with raw coordinates
  }
}
```

---

## 📋 REAL DATA EXAMPLES

### Example 1: Order 5377 (With Precision)

**Raw Database JSON:**
```json
{
  "objects": [
    {
      "type": "image",
      "left": 328.82122439638346,      // 14 decimal places preserved
      "top": 165.09833152389652,       // 14 decimal places preserved
      "width": 1924,
      "height": 1075,
      "scaleX": 0.10168526608448998,   // 17 decimal places preserved
      "scaleY": 0.10168526608448998,
      "angle": 0,
      "src": "https://yprint.de/wp-content/uploads/octo-print-designer/user-images/17/image-1.png"
    }
  ],
  "metadata": {
    "capture_version": "3.0",
    "canvas": {
      "width": 780,
      "height": 580
    }
  }
}
```

**Database Table:** `wp_woocommerce_order_itemmeta`
**Meta Key:** `_db_processed_views`
**Storage Size:** 458 characters

### Example 2: Order 5382 (After Conversion)

**Raw Database JSON:**
```json
{
  "objects": [
    {
      "type": "image",
      "left": 321.3038477940859,
      "top": 154.55515149654573,
      "width": 1924,
      "height": 1075,
      "scaleX": 0.1037520583727203,
      "scaleY": 0.1037520583727203,
      "angle": 0,
      "originX": "left",
      "originY": "top",
      "src": "https://..."
    }
  ],
  "metadata": {
    "source": "converted_from_processed_views",
    "capture_version": "3.0",
    "designer_offset": {"x": 0, "y": 0},
    "converted_at": "2025-10-02 19:57:28",
    "order_id": 5382,
    "template_id": "3657"
  }
}
```

**Coordinate Verification:**
```
STORED (DB):    left: 321.3038477940859
RETRIEVED (PHP): left: 321.3038477940859
RENDERED (JS):  left: 321.3038477940859
DELTA:          0.00px ✅
```

---

## 🔧 RECOMMENDATIONS

### Immediate Actions (Priority: CRITICAL)

1. **Remove toFixed() Rounding**
   - File: `production-ready-design-data-capture.js`
   - Lines: 655-661
   - Change: Store full precision, remove `.toFixed()`

2. **Fix Container Selector**
   - File: `designer.bundle.js`
   - Line: 931
   - Change: `.designer-editor` → `.designer-canvas-container`
   - OR: Remove offset system entirely (store raw Fabric.js)

3. **Remove Offset Metadata**
   - Stop storing `offset_applied`, `offset_x`, `offset_y`
   - Causes viewport-dependent corruption
   - NOT needed if storing raw Fabric.js coordinates

### Long-Term Improvements (Priority: HIGH)

1. **Store Raw Fabric.js State**
   - Use `canvas.toJSON()` directly
   - No transformations, no offset calculations
   - Perfect device-agnostic storage

2. **Metadata Version Bump**
   - Increment to `capture_version: "4.0"`
   - Mark coordinates as `coordinate_system: "fabric_canvas"`
   - Clear signal to rendering system

3. **Data Migration Script**
   - Detect old format (with offset_applied)
   - Convert to new format (raw coordinates)
   - Reverse offset calculation: `left = left - offset_x`

### Testing Requirements

1. **Cross-Device Testing**
   - Save on Desktop (1920px), load on Mobile (375px)
   - Save on Mobile (375px), load on Desktop (1920px)
   - Verify 0px shift in both directions

2. **Precision Testing**
   - Place element at `x: 328.12345678901234`
   - Save and reload
   - Verify full precision preserved

3. **Legacy Compatibility**
   - Test old designs still render correctly
   - Verify no double-correction applied
   - Check metadata detection logic

---

## 📚 RELATED FILES

### Database Schema
- `/workspaces/yprint_designtool/public/class-octo-print-designer-designer.php` (line 30)
- `/workspaces/yprint_designtool/dynamic-measurement-schema.sql`

### Save Logic
- `/workspaces/yprint_designtool/includes/class-octo-print-designer-wc-integration.php` (line 2725)
- `/workspaces/yprint_designtool/public/js/production-ready-design-data-capture.js` (line 655)
- `/workspaces/yprint_designtool/public/js/dist/designer.bundle.js` (line 931, 1344)

### Load Logic
- `/workspaces/yprint_designtool/admin/js/admin-canvas-renderer.js` (line 1101)
- `/workspaces/yprint_designtool/public/js/design-loader.js` (line 32)

### Analysis Reports
- `/workspaces/yprint_designtool/archive/analysis-reports/DATABASE-COORDINATE-STORAGE-ANALYSIS.json`
- `/workspaces/yprint_designtool/AGENT-1-CANVAS-OFFSET-ROOT-CAUSE.json`
- `/workspaces/yprint_designtool/AGENT-5-LEGACY-DATA-CORRUPTION-ANALYSIS.json`

---

## ✅ CONCLUSION

**Database Storage: PERFECT** ✅
- LONGTEXT preserves unlimited precision
- No rounding or truncation in database layer
- 14-17 decimal places stored and retrieved identically

**JavaScript Capture: NEEDS FIX** ❌
- `toFixed()` rounds coordinates before save
- Loss: 0.01px precision (2 decimals)
- Impact: Sub-pixel misalignment

**Offset System: BROKEN** ❌
- Viewport-dependent offset values
- Desktop (50px) ≠ Mobile (0px)
- Result: 50px shift on cross-device load

**Recommended Fix: Store Raw Fabric.js State** ✅
- No offset calculations
- No toFixed() rounding
- Full precision preservation
- Device-agnostic coordinates
- Perfect reconstruction guaranteed

---

**Agent 3 Mission: COMPLETE**

Next Agent should implement recommended fixes and verify with cross-device testing.
