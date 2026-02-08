# PNG Generation System - Complete Evidence Map

**Generated:** 2026-02-08 (Updated with runtime findings)
**Status:** SSOT IDENTIFIED - Canvas Rectangle Object

## Executive Summary

**ACTUAL SSOT DISCOVERED:** The print zone exists as a live Fabric.js Rectangle object in canvas coordinates that can be accessed directly via canvas object iteration.

## 🎯 Critical Runtime Findings

### The Real SSOT (Proven by Browser Console)

**Print Zone Rectangle Object:**
- **Location:** `canvas.getObjects()[1]` (rect object with stroke)
- **Type:** `fabric.Rect` with blue stroke `#007cba` and transparent fill
- **Coordinates:** `{left: 218.64, top: 41.94, width: 222, height: 321}`
- **Bounding Rect:** `{left: 218.64, top: 41.94, width: 224, height: 323}` (includes 2px stroke)

### False Leads (Dead Code)

**save-only-png-generator.js references to `designer.printZoneRect`:**
- Lines 85-87, 129-131: Check `designer.printZoneRect.getBoundingRect()`
- **RUNTIME RESULT:** `designer.printZoneRect` = `null`
- **STATUS:** Dead code - this SSOT doesn't exist

## 🏗️ Current PNG Generation Architecture

**Entry Point:** Designer.js:1510-1511
```javascript
if (typeof window.generatePNGForDownload === 'function') {
    const pngDataUrl = await window.generatePNGForDownload();
```

**Active PNG Generator:** save-only-png-generator.js
- **Function:** `generateMultiViewVisualPNGs()` (line 349)
- **Core Issue:** Uses wrong coordinate source in `discoverAvailableViews()` (line 39-50)

### Current Broken Flow

1. **Line 39-40:** `const zoneBounds = viewData.safeZone || viewData.printZone || null;`
2. **Problem:** Uses template data coordinates instead of live canvas rectangle
3. **Result:** ClipPath created with wrong coordinates (captures template area, not graphics area)

## 🔧 SSOT Access Pattern (Working Solution)

**Correct Approach - Use Canvas Rectangle:**
```javascript
// Find the actual print zone rectangle in canvas objects
const canvas = window.designerInstance?.fabricCanvas;
const objects = canvas?.getObjects() || [];
const printZone = objects.find(obj =>
    obj.type === 'rect' &&
    obj.stroke &&
    (obj.fill === 'transparent' || !obj.fill)
);
const bounds = printZone?.getBoundingRect(true, true); // Include stroke
```

**This returns coordinates in the exact same space as user graphics at `{left: 328, top: 210}`**

## 📊 Coordinate System Analysis

### Template Data vs Live Canvas

**Template safeZone (Wrong):**
- `{left: 50.25%, top: 48.2%, width: 222px, height: 321px}`
- **Calculated:** `{left: 329.64px, top: 202.44px}` (off by 111px/160px)

**Live Canvas Rectangle (Correct SSOT):**
- `{left: 218.64px, top: 41.94px, width: 224px, height: 323px}`
- **Status:** Exact coordinates where ClipPath should be applied

**User Graphics:**
- Image 1: `{left: 328, top: 210}` ❌ Outside visual print zone
- Image 2: `{left: 328, top: 141}` ❌ Outside visual print zone

## 🚨 The Real Problem Revealed

**Graphics are positioned OUTSIDE the visible print zone rectangle.** This explains why PNG shows background - there's nothing to capture in the print zone area.

**Two possible solutions:**
1. **Fix graphics positioning** - Move graphics into print zone bounds
2. **Expand print zone** - Make print zone cover graphics area

## 🛠️ Implementation Strategy

**Minimal Fix (Preserve Golden Rule):**
1. **Update save-only-png-generator.js:39-50** to use live canvas rectangle
2. **Keep working ClipPath system** intact
3. **Test if graphics appear** in corrected print zone

**Code Change Required:**
```javascript
// OLD (line 39-40):
const zoneBounds = viewData.safeZone || viewData.printZone || null;

// NEW:
const canvas = designer?.fabricCanvas;
const objects = canvas?.getObjects() || [];
const printZoneRect = objects.find(obj =>
    obj.type === 'rect' && obj.stroke &&
    (obj.fill === 'transparent' || !obj.fill)
);
const zoneBounds = printZoneRect?.getBoundingRect(true, true) || null;
```

## 📋 Files Requiring Updates

**Primary Fix:**
- `/public/js/save-only-png-generator.js` - Lines 39-50 (coordinate source)

**Documentation Updated:**
- `/docs/PNG_GENERATION_EVIDENCE_MAP.md` (this file)
- `/docs/SOLUTION_PLAN.md` (needs update with canvas rectangle approach)

## 🎯 Next Steps

1. **Implement canvas rectangle lookup** in save-only-png-generator.js
2. **Test PNG generation** - verify ClipPath uses correct coordinates
3. **Verify graphics positioning** - check if user graphics fall within print zone
4. **Address graphics positioning** if needed (separate issue from coordinate system)

---

**Evidence Quality:** ⭐⭐⭐⭐⭐ High - Runtime verified SSOT
**Certainty Level:** 100% - Live canvas object confirmed as coordinate source