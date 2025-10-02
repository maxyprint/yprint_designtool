# FORMAT COMPATIBILITY MATRIX

**Version:** 1.0.0
**Date:** 2025-10-02
**Phase:** Source-Level Data Format Correction

---

## OVERVIEW

This document provides a comprehensive comparison of all three design data formats used in the yprint_designtool system and explains how they are detected, validated, and converted.

**Format Evolution:**

1. **Legacy Format** (Pre-2024) - View-key based structure from old system
2. **variationImages Format** (2024-Q3) - Nested transform coordinates (BUG)
3. **Golden Standard Format** (Phase 3) - Flat coordinates with metadata (CORRECT)

---

## FORMAT COMPARISON TABLE

| Feature | Golden Standard | variationImages | Legacy |
|---------|----------------|-----------------|---------|
| **Structure** | `{objects, metadata}` | `{variationImages}` | `{[view_key]: {images}}` |
| **Coordinates** | Flat (left, top at root) | Nested in transform | Flat |
| **Detection Key** | `metadata.capture_version` | `variationImages` key | View key pattern |
| **Created By** | Frontend v3.0+ (Phase 3) | Frontend v2.x (bug) | Old system |
| **Version** | 3.0.0+ | 2.x | 1.x |
| **Validation** | Pass | Fail (rejected) | Fail (needs migration) |
| **Rendering** | Native (direct) | Normalized | Normalized + Correction |
| **Migration** | N/A (already correct) | Available | Available |
| **Status** | Current Standard | Deprecated | Legacy (supported) |
| **Database Field** | `_design_data` | `_design_data` | `_design_data` |
| **First Appeared** | 2025-10-02 (Phase 3) | 2024-Q3 | Pre-2024 |
| **Last Used** | Current | 2025-10-02 (Phase 3 cutoff) | 2024-Q3 |

---

## FORMAT DETECTION LOGIC

### Detection Algorithm

```javascript
function detectFormat(data) {
    if (!data || typeof data !== 'object') {
        return 'unknown';
    }

    // DETECTION 1: Golden Standard (highest priority)
    // Must have metadata with capture_version
    if (data.metadata && data.metadata.capture_version) {
        return 'golden_standard';
    }

    // DETECTION 2: variationImages (bug format)
    // Has variationImages key
    if (data.variationImages) {
        return 'variation_images';
    }

    // DETECTION 3: Legacy (old system)
    // Has view key pattern: "varID_viewID"
    const keys = Object.keys(data);
    const firstKey = keys[0];

    if (firstKey && firstKey.includes('_')) {
        // Check if value has images array
        if (data[firstKey] && data[firstKey].images) {
            return 'legacy';
        }
    }

    // DETECTION 4: Check for objects array without metadata
    if (data.objects && Array.isArray(data.objects)) {
        // Has objects but no capture_version
        // Likely incomplete Golden Standard or converted data
        return 'golden_standard_incomplete';
    }

    return 'unknown';
}
```

### Detection Examples

**Example 1: Golden Standard**
```javascript
const data = {
    objects: [...],
    metadata: {
        capture_version: "3.0.0"  // KEY IDENTIFIER
    }
};

detectFormat(data); // Returns: "golden_standard"
```

**Example 2: variationImages**
```javascript
const data = {
    variationImages: {  // KEY IDENTIFIER
        "167359_189542": {
            images: [...]
        }
    }
};

detectFormat(data); // Returns: "variation_images"
```

**Example 3: Legacy**
```javascript
const data = {
    "167359_189542": {  // KEY IDENTIFIER (view key pattern)
        images: [...],
        canvasState: {...}
    }
};

detectFormat(data); // Returns: "legacy"
```

---

## DETAILED FORMAT SPECIFICATIONS

### Format 1: Golden Standard (CURRENT)

**Status:** ACTIVE - All new designs use this format
**Created By:** Frontend Phase 3 implementation
**Validation:** PASSES

**Full Example:**

```json
{
  "objects": [
    {
      "type": "image",
      "id": "img_1728234567890_0",
      "src": "https://yprint.com/uploads/design-image.jpg",
      "left": 330.18,
      "top": 160.50,
      "scaleX": 0.096,
      "scaleY": 0.096,
      "angle": 0,
      "width": 1924,
      "height": 1075,
      "originX": "left",
      "originY": "top",
      "visible": true,
      "selectable": true,
      "elementMetadata": {
        "variation_id": "167359",
        "view_id": "189542",
        "variation_key": "167359_189542",
        "element_type": "user_image"
      }
    }
  ],
  "metadata": {
    "capture_version": "3.0.0",
    "source": "frontend_designer",
    "template_id": "3657",
    "variation_id": "167359",
    "canvas_dimensions": {
      "width": 780,
      "height": 580
    },
    "designer_offset": {
      "x": 0,
      "y": 0
    },
    "saved_at": "2025-10-02T15:30:00Z",
    "format_schema_version": "golden_standard_v1"
  }
}
```

**Key Characteristics:**

1. **Flat Coordinates:** `left`, `top`, `scaleX`, `scaleY` at root level
2. **Objects Array:** All elements in single array
3. **Metadata Object:** Contains versioning and context
4. **capture_version:** Unique identifier for format detection
5. **Canvas Context:** Designer offset and dimensions preserved
6. **Timestamps:** When design was captured
7. **Element Metadata:** Per-element variation/view information

**Advantages:**

- Clean, simple structure
- Easy to validate
- Contains all context needed for rendering
- Version tracked for future changes
- Compatible with Fabric.js
- No transformation needed for rendering

---

### Format 2: variationImages (DEPRECATED)

**Status:** DEPRECATED - Rejected by validator (strict mode)
**Created By:** Frontend v2.x (bug in collectDesignState)
**Validation:** FAILS

**Full Example:**

```json
{
  "variationImages": {
    "167359_189542": {
      "images": [
        {
          "type": "image",
          "id": "img_1728234567890_0",
          "src": "https://yprint.com/uploads/design-image.jpg",
          "width": 1924,
          "height": 1075,
          "visible": true,
          "transform": {
            "left": 330.18,
            "top": 160.50,
            "scaleX": 0.096,
            "scaleY": 0.096,
            "angle": 0
          },
          "elementMetadata": {
            "variation_id": "167359",
            "view_id": "189542",
            "variation_key": "167359_189542"
          }
        }
      ]
    }
  },
  "templateId": "3657",
  "currentVariation": "167359"
}
```

**Key Characteristics:**

1. **Nested Coordinates:** `transform.left`, `transform.top` (BUG!)
2. **Grouped by View:** Elements grouped under view keys
3. **No Metadata:** Missing capture_version and context
4. **Root-Level Properties:** templateId, currentVariation separate
5. **No Canvas Context:** Missing designer offset and dimensions

**Problems:**

- Nested transform coordinates require extraction
- No version identifier for detection
- Missing canvas context for scaling
- Grouped structure complicates rendering
- Requires normalization for rendering

**Migration Path:**

```javascript
// Flatten transform coordinates
function convertVariationImages(data) {
    const objects = [];

    // Extract all images from all variations
    for (const viewKey in data.variationImages) {
        const view = data.variationImages[viewKey];
        for (const image of view.images) {
            // Flatten transform
            objects.push({
                ...image,
                left: image.transform.left,
                top: image.transform.top,
                scaleX: image.transform.scaleX,
                scaleY: image.transform.scaleY,
                angle: image.transform.angle,
                transform: undefined  // Remove nested transform
            });
        }
    }

    return {
        objects: objects,
        metadata: {
            capture_version: "3.0.0",
            source: "migration_from_variation_images",
            template_id: data.templateId,
            variation_id: data.currentVariation,
            saved_at: new Date().toISOString(),
            format_schema_version: "golden_standard_v1"
        }
    };
}
```

---

### Format 3: Legacy (SUPPORTED)

**Status:** LEGACY - Supported with runtime correction
**Created By:** Old system (pre-refactoring)
**Validation:** FAILS (but rendered with correction)

**Full Example:**

```json
{
  "167359_189542": {
    "images": [
      {
        "type": "image",
        "id": "img_123",
        "src": "https://yprint.com/uploads/design-image.jpg",
        "left": 160.5,
        "top": 290,
        "width": 200,
        "height": 150,
        "scaleX": 0.113,
        "scaleY": 0.113,
        "angle": 0
      }
    ],
    "canvasState": {
      "width": 780,
      "height": 580
    }
  }
}
```

**Key Characteristics:**

1. **View Key Structure:** Top-level keys are "varID_viewID"
2. **Flat Coordinates:** Direct left/top (correct)
3. **No Metadata:** No versioning information
4. **Canvas State:** Some context preserved
5. **Requires Correction:** Needs +80px top, 1.23x scale

**Legacy Correction Matrix:**

```javascript
const LEGACY_CORRECTION = {
    deltaY: 80,           // Move DOWN by 80px
    deltaX: 0,            // No horizontal shift
    scaleFactor: 1.23,    // Increase scale by 23%
    confidence: 1.0       // 100% confidence for db_processed_views
};

function applyLegacyCorrection(element) {
    return {
        ...element,
        top: element.top + LEGACY_CORRECTION.deltaY,
        scaleX: element.scaleX * LEGACY_CORRECTION.scaleFactor,
        scaleY: element.scaleY * LEGACY_CORRECTION.scaleFactor
    };
}
```

**Migration Path:**

```javascript
function convertLegacy(data) {
    const objects = [];

    // Extract from view keys
    for (const viewKey in data) {
        const view = data[viewKey];
        for (const image of view.images) {
            // Apply correction during migration
            objects.push({
                ...image,
                top: image.top + 80,
                scaleX: image.scaleX * 1.23,
                scaleY: image.scaleY * 1.23
            });
        }
    }

    return {
        objects: objects,
        metadata: {
            capture_version: "3.0.0",
            source: "migration_from_legacy",
            correction_applied: true,
            saved_at: new Date().toISOString(),
            format_schema_version: "golden_standard_v1"
        }
    };
}
```

---

## NORMALIZATION BEHAVIOR

### What is Normalization?

Normalization is the process of converting any format into a canonical format for rendering. This happens at runtime, before rendering.

**Normalization Flow:**

```
Input Data (any format)
    ↓
Format Detection
    ↓
├─ Golden Standard → Use directly (no normalization)
├─ variationImages → Flatten transform coordinates
└─ Legacy → Apply correction matrix
    ↓
Canonical Format
    ↓
Rendering
```

### Normalization vs Migration

| Aspect | Normalization | Migration |
|--------|---------------|-----------|
| **When** | Runtime (every render) | One-time (batch process) |
| **Where** | JavaScript (renderer) | PHP (WP-CLI command) |
| **Scope** | Single design | All designs in database |
| **Persistence** | Temporary (not saved) | Permanent (updates DB) |
| **Performance** | Slight overhead per render | One-time cost |
| **Rollback** | Automatic (use original) | Backup required |

**Recommendation:** Migrate all designs to Golden Standard for best performance.

---

## MIGRATION STATUS TRACKING

### Check Migration Progress

```bash
# Total designs in database
wp db query "SELECT COUNT(*) as total FROM deo6_postmeta WHERE meta_key = '_design_data'" --path=/var/www/html

# Golden Standard designs (migrated)
wp db query "SELECT COUNT(*) as migrated FROM deo6_postmeta WHERE meta_key = '_design_data' AND meta_value LIKE '%capture_version%'" --path=/var/www/html

# variationImages designs (needs migration)
wp db query "SELECT COUNT(*) as variation FROM deo6_postmeta WHERE meta_key = '_design_data' AND meta_value LIKE '%variationImages%'" --path=/var/www/html

# Legacy designs (needs migration)
# Legacy count = Total - Golden Standard - variationImages
```

### Migration Progress Dashboard

```bash
#!/bin/bash
# migration-progress.sh

TOTAL=$(wp db query "SELECT COUNT(*) FROM deo6_postmeta WHERE meta_key = '_design_data'" --skip-column-names --path=/var/www/html)
MIGRATED=$(wp db query "SELECT COUNT(*) FROM deo6_postmeta WHERE meta_key = '_design_data' AND meta_value LIKE '%capture_version%'" --skip-column-names --path=/var/www/html)
VARIATION=$(wp db query "SELECT COUNT(*) FROM deo6_postmeta WHERE meta_key = '_design_data' AND meta_value LIKE '%variationImages%'" --skip-column-names --path=/var/www/html)

LEGACY=$((TOTAL - MIGRATED - VARIATION))
PERCENT=$((MIGRATED * 100 / TOTAL))

echo "=== Migration Progress ==="
echo "Total Designs: $TOTAL"
echo "Golden Standard: $MIGRATED ($PERCENT%)"
echo "variationImages: $VARIATION"
echo "Legacy: $LEGACY"
echo "========================="
```

---

## FORMAT VALIDATION RULES

### Golden Standard Validation Schema

```javascript
const goldenStandardSchema = {
    // REQUIRED: Objects array
    objects: {
        type: 'array',
        required: true,
        minLength: 0,
        items: {
            type: 'object',
            properties: {
                type: { type: 'string', required: true },
                left: { type: 'number', required: true },
                top: { type: 'number', required: true },
                width: { type: 'number', required: true },
                height: { type: 'number', required: true },
                scaleX: { type: 'number', required: true },
                scaleY: { type: 'number', required: true },
                angle: { type: 'number', required: true }
            }
        }
    },

    // REQUIRED: Metadata object
    metadata: {
        type: 'object',
        required: true,
        properties: {
            capture_version: { type: 'string', required: true },
            source: { type: 'string', required: true },
            saved_at: { type: 'string', required: true },
            format_schema_version: { type: 'string', required: true }
        }
    }
};
```

### Validation Error Codes

| Code | Meaning | Fix |
|------|---------|-----|
| E001 | missing_objects | Add objects array |
| E002 | missing_capture_version | Add metadata.capture_version |
| E003 | nested_transform | Flatten transform coordinates |
| E004 | invalid_metadata | Add/fix metadata object |
| E005 | invalid_json | Fix JSON syntax |

---

## CONVERSION EXAMPLES

### Example 1: variationImages → Golden Standard

**Before:**
```json
{
  "variationImages": {
    "167359_189542": {
      "images": [{
        "type": "image",
        "transform": { "left": 100, "top": 200 }
      }]
    }
  }
}
```

**After:**
```json
{
  "objects": [{
    "type": "image",
    "left": 100,
    "top": 200
  }],
  "metadata": {
    "capture_version": "3.0.0",
    "source": "migration"
  }
}
```

### Example 2: Legacy → Golden Standard

**Before:**
```json
{
  "167359_189542": {
    "images": [{
      "type": "image",
      "left": 160,
      "top": 290,
      "scaleX": 0.113
    }]
  }
}
```

**After (with correction):**
```json
{
  "objects": [{
    "type": "image",
    "left": 160,
    "top": 370,
    "scaleX": 0.139
  }],
  "metadata": {
    "capture_version": "3.0.0",
    "source": "migration_from_legacy",
    "correction_applied": true
  }
}
```

---

## FORMAT LIFECYCLE

```
┌─────────────────────────────────────────────────────────────┐
│                    FORMAT TIMELINE                          │
└─────────────────────────────────────────────────────────────┘

Pre-2024              2024-Q3            2025-10-02
   │                     │                    │
   │  Legacy Format      │  variationImages   │  Golden Standard
   │  (View Keys)        │  (BUG)             │  (Phase 3)
   │                     │                    │
   ▼                     ▼                    ▼
┌──────┐            ┌──────┐            ┌──────┐
│ Old  │  Created   │ Bug  │  Created   │ New  │
│System│  ─────────>│ v2.x │  ─────────>│ v3.0 │
└──────┘            └──────┘            └──────┘
   │                     │                    │
   │                     │                    │
   │    Migration        │    Migration       │
   └─────────────────────┴────────────────────┘
                         │
                         ▼
                  Golden Standard
                  (All Designs)
```

---

## BACKWARD COMPATIBILITY

### Rendering Support Matrix

| Format | Phase 3 Renderer | Phase 2 Renderer | Phase 1 Renderer |
|--------|------------------|------------------|------------------|
| Golden Standard | Native (best) | Normalized | Not supported |
| variationImages | Normalized | Native | Not supported |
| Legacy | Normalized + Correction | Correction | Native |

### Feature Support Matrix

| Feature | Golden Standard | variationImages | Legacy |
|---------|----------------|-----------------|---------|
| Admin Preview | Full | Full | Full |
| Print Provider | Full | Full | Full |
| Design Edit | Full | Limited | Limited |
| Export | Full | Full | Full |
| Validation | Pass | Fail | Fail |
| Migration | N/A | Yes | Yes |

---

## BEST PRACTICES

### For New Designs

1. **Always use Golden Standard format**
   - Ensure Phase 3 frontend is deployed
   - Verify capture_version is present
   - Check validation passes

### For Existing Designs

1. **variationImages format**
   - Migrate ASAP using WP-CLI command
   - Avoid creating new designs in this format
   - Validate after migration

2. **Legacy format**
   - Migrate during scheduled maintenance
   - Verify correction is applied
   - Test rendering after migration

### For Developers

1. **Always detect format before processing**
2. **Use normalization layer for rendering**
3. **Never mix formats in same design**
4. **Always add metadata to migrated designs**
5. **Test all three formats in development**

---

## RELATED DOCUMENTS

- [PHASE_3_DEPLOYMENT_GUIDE.md](PHASE_3_DEPLOYMENT_GUIDE.md) - Deployment procedures
- [PHASE_3_TROUBLESHOOTING.md](PHASE_3_TROUBLESHOOTING.md) - Common issues and fixes
- [PHASE_3_REFACTORING_MASTERPLAN.md](/workspaces/yprint_designtool/PHASE_3_REFACTORING_MASTERPLAN.md) - Complete implementation plan

---

**Document Version:** 1.0.0
**Last Updated:** 2025-10-02
**Next Review:** After Migration Completion
