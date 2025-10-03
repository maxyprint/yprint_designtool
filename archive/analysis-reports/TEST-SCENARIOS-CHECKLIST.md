# TEST SCENARIOS CHECKLIST - Metadata Detection Fix

Quick reference for testing all data format scenarios.

---

## HIGH-PRIORITY TESTS (Must Pass)

### ✅ Test 1: variationImages Format
**Goal:** Verify normalized variationImages are NOT double-corrected

**Test Data:**
```javascript
{
  "variationImages": {
    "167359_189542": {
      "images": [{
        "type": "image",
        "id": "test_img_1",
        "src": "https://example.com/image.jpg",
        "transform": {
          "left": 330,
          "top": 160,
          "scaleX": 0.096,
          "scaleY": 0.096,
          "angle": 0
        }
      }]
    }
  },
  "templateId": "3657",
  "currentVariation": "167359"
}
```

**Expected Behavior:**
- [ ] Data normalized to objects[] format
- [ ] Metadata includes: `source: 'variationImages_normalized'`
- [ ] Metadata includes: `capture_version: '3.0.0'` ← CHECK THIS
- [ ] Classification: MODERN (not LEGACY_DB)
- [ ] Legacy correction: NOT APPLIED
- [ ] Rendering: Correct position (330, 160)

**Failure Symptoms:**
- Elements positioned at (330, 240) instead of (330, 160) - indicates +80px applied
- Elements scaled 1.18x instead of 0.096 - indicates 1.23x applied
- Console shows "LEGACY_DB" classification

---

### ✅ Test 2: Converted Data Without capture_version
**Goal:** Verify converted data doesn't get double-corrected even without version

**Test Data:**
```javascript
{
  "hive_mind_view": {
    "images": [{
      "id": "img_1",
      "url": "https://example.com/image.jpg",
      "left": 330,
      "top": 160,
      "scaleX": 0.096,
      "scaleY": 0.096,
      "angle": 0
    }],
    "metadata": {
      "source": "converted_from_processed_views"
      // Note: NO capture_version!
    }
  }
}
```

**Expected Behavior:**
- [ ] Metadata extracted from view wrapper
- [ ] Classification: MODERN (fallback triggered)
- [ ] Console shows: "Converted data missing capture_version, treating as MODERN"
- [ ] Legacy correction: NOT APPLIED
- [ ] Rendering: Correct position (330, 160)

**Failure Symptoms:**
- Classification: LEGACY_DB
- Elements at (330, 240) - double corrected!
- No fallback warning in console

---

### ✅ Test 3: Hive Mind Data Without Metadata
**Goal:** Verify Hive Mind conversion adds default metadata

**Test Data:**
```javascript
{
  "objects": [{
    "type": "image",
    "id": "img_1",
    "src": "https://example.com/image.jpg",
    "left": 330,
    "top": 160,
    "scaleX": 0.096,
    "scaleY": 0.096,
    "angle": 0
  }],
  // No metadata at all!
  "background": "https://example.com/mockup.jpg"
}
```

**Expected Behavior:**
- [ ] DesignPreviewGenerator.transformDataStructure() called
- [ ] Converted to view-based structure
- [ ] Metadata auto-generated with: `capture_version: '3.0.0'`
- [ ] Metadata auto-generated with: `source: 'hive_mind_converted'`
- [ ] Classification: MODERN
- [ ] Legacy correction: NOT APPLIED
- [ ] Rendering: Correct position (330, 160)

**Failure Symptoms:**
- Metadata is null
- Classification: LEGACY_DB
- Elements at (330, 240) - legacy corrected!

---

### ✅ Test 4: True Legacy Data (Control Test)
**Goal:** Verify legacy data STILL gets corrected (no regression)

**Test Data:**
```javascript
{
  "167359_189542": {
    "images": [{
      "id": "img_1",
      "url": "https://example.com/image.jpg",
      "left": 330,
      "top": 160,
      "scaleX": 0.078,  // Small scale (legacy pattern)
      "scaleY": 0.078,
      "angle": 0
    }]
  },
  "metadata": {
    "source": "db_processed_views"
  }
}
```

**Expected Behavior:**
- [ ] Classification: LEGACY_DB
- [ ] Legacy correction: APPLIED
- [ ] Elements moved to: top = 160 + 80 = 240
- [ ] Elements scaled to: 0.078 * 1.23 = 0.096
- [ ] Rendering: Corrected position (330, 240)

**Failure Symptoms:**
- No legacy correction applied
- Elements at wrong position
- Classification: MODERN

---

## MEDIUM-PRIORITY TESTS

### ✅ Test 5: Frontend Designer Data
**Goal:** Verify modern frontend data works correctly

**Test Data:**
```javascript
{
  "objects": [{
    "type": "image",
    "id": "img_1",
    "src": "https://example.com/image.jpg",
    "left": 330,
    "top": 160,
    "scaleX": 0.096,
    "scaleY": 0.096,
    "angle": 0
  }],
  "metadata": {
    "capture_version": "3.0.0",
    "source": "frontend_designer",
    "designer_offset": { "x": 0, "y": 0 }
  }
}
```

**Expected:**
- [ ] Classification: MODERN
- [ ] No legacy correction
- [ ] Designer offset extracted (even if 0,0)

---

### ✅ Test 6: Design Elements Wrapper
**Goal:** Verify WooCommerce order format works

**Test Data:**
```javascript
{
  "order_id": 5378,
  "design_data": {
    "design_elements": {
      "item_1": {
        "element_data": {
          "objects": [{
            "type": "image",
            "left": 330,
            "top": 160,
            "scaleX": 0.096
          }]
        }
      }
    }
  }
}
```

**Expected:**
- [ ] Order wrapper unwrapped
- [ ] design_elements extracted
- [ ] Converted to view-based format
- [ ] Proper metadata added
- [ ] Classification: MODERN

---

### ✅ Test 7: View Wrapper Metadata Extraction
**Goal:** Verify the core fix works

**Test Data:**
```javascript
{
  "custom_view_123": {
    "images": [{ /* image data */ }],
    "metadata": {
      "capture_version": "3.0.0",
      "source": "custom_source"
    }
  }
}
```

**Expected:**
- [ ] Metadata extracted from view wrapper (not just root)
- [ ] Classification uses extracted metadata
- [ ] Console shows: "Extracted metadata from view wrapper: custom_view_123"

---

## VALIDATION TESTS

### ✅ Test 8: Missing Metadata Edge Cases

**Test 8a: No metadata at all**
```javascript
{
  "167359_189542": {
    "images": [{ "left": 330, "top": 160 }]
  }
  // No metadata anywhere
}
```
Expected: LEGACY_DB classification, legacy correction applied

**Test 8b: Metadata but no source**
```javascript
{
  "objects": [{ "left": 330, "top": 160 }],
  "metadata": {
    "some_field": "value"
    // No source, no capture_version
  }
}
```
Expected: LEGACY_DB classification

**Test 8c: Has capture_version but no designer_offset**
```javascript
{
  "objects": [{ "left": 330, "top": 160 }],
  "metadata": {
    "capture_version": "3.0.0"
    // No designer_offset
  }
}
```
Expected: MODERN classification (priority #3)

---

## SAFEGUARD TESTS

### ✅ Test 9: Classification Validator
**Test Data:** Same as Test 2 (converted without version)

**Expected Console Output:**
```
⚠️ Converted data missing capture_version, treating as MODERN (safeguard)
```

**Should NOT see:**
```
❌ CLASSIFICATION ERROR: Data marked as converted but classified as legacy
```

---

### ✅ Test 10: Double Correction Detector
**Test Data:** Data with `correction_applied: true` flag

```javascript
{
  "167359_189542": {
    "images": [{ "left": 330, "top": 240 }],
    "metadata": {
      "correction_applied": true
    }
  }
}
```

**Expected:**
- [ ] applyLegacyDataCorrection() detects flag
- [ ] Correction NOT applied again
- [ ] Console shows: "DOUBLE CORRECTION PREVENTED!"

---

## CONSOLE VALIDATION

For each test, check console for:

### ✅ Good Signs
- `✅ AGENT 1 MUTEX: Format = MODERN` (for modern data)
- `✅ AGENT 1 MUTEX: Format = LEGACY_DB` (for legacy data)
- `✅ NORMALIZE: Conversion complete` (for variationImages)
- `✅ AGENT 3: Successfully transformed` (for Hive Mind)

### ❌ Bad Signs
- `❌ CLASSIFICATION ERROR` - Misclassification detected
- `❌ DOUBLE CORRECTION PREVENTED` - Data already corrected
- Format = LEGACY_DB for modern data sources
- Format = MODERN for db_processed_views

---

## QUICK VALIDATION SCRIPT

```javascript
// Run in browser console on order preview page
function validateClassification(designData) {
    const renderer = new AdminCanvasRenderer();
    const format = renderer.classifyDataFormat(designData);

    console.log('Classification:', format);
    console.log('Metadata:', renderer._extractMetadata?.(designData));

    return {
        format,
        isCorrect: /* manual check */,
        willGetCorrected: format === 'legacy_db'
    };
}

// Test each scenario:
validateClassification(variationImagesData);
validateClassification(convertedData);
validateClassification(hiveMindData);
```

---

## PASS CRITERIA

**All tests must pass to deploy:**

- [ ] All 4 HIGH-PRIORITY tests pass
- [ ] At least 4 of 6 MEDIUM-PRIORITY tests pass
- [ ] No "CLASSIFICATION ERROR" messages for valid data
- [ ] No "DOUBLE CORRECTION PREVENTED" for fresh data
- [ ] variationImages orders render correctly
- [ ] Legacy orders still get corrected (no regression)

---

## QUICK REFERENCE: Expected Classifications

| Data Type | Source | capture_version | Expected Format |
|-----------|--------|----------------|-----------------|
| Legacy DB | db_processed_views | No | LEGACY_DB ✅ |
| Converted | converted_from_processed_views | Yes | MODERN ✅ |
| Converted | converted_from_processed_views | **No** | MODERN (fallback) ✅ |
| Frontend | frontend_designer | Yes | MODERN ✅ |
| variationImages | variationImages_normalized | **Must add** | MODERN ✅ |
| Hive Mind | **Auto-add** | **Auto-add** | MODERN ✅ |
| No metadata | N/A | N/A | LEGACY_DB ✅ |

---

**Last Updated:** 2025-10-02
**Next Review:** After fixes applied
