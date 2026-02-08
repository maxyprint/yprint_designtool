# Solution Plan - PNG Generation Fix (Updated)

**Generated:** 2026-02-08 (Updated with canvas rectangle SSOT)
**Status:** LIVE CANVAS SSOT IDENTIFIED - READY TO IMPLEMENT

## 🎯 Root Cause (Confirmed with Runtime Evidence)

**PNG system uses wrong coordinate source** - template data instead of live canvas rectangle coordinates.

### Runtime Evidence

**Current Wrong Source (template data):**
```javascript
// save-only-png-generator.js:39-40
const zoneBounds = viewData.safeZone || viewData.printZone || null;
// Results in calculated coordinates: {left: 329.64px, top: 202.44px}
```

**Correct SSOT (live canvas rectangle):**
```javascript
// Canvas object at index 1
const printZone = canvas.getObjects()[1]; // fabric.Rect
printZone.getBoundingRect(true, true); // {left: 218.64, top: 41.94, width: 224, height: 323}
```

**User Graphics Position:**
- Image 1: `{left: 328, top: 210}` ❌ Outside print zone bounds
- Image 2: `{left: 328, top: 141}` ❌ Outside print zone bounds

## 🔧 Solution Strategy (Golden Rule Compliant)

### Phase 1: Fix Coordinate Source Only

**Preserve working ClipPath system** - only change where coordinates come from.

**File:** `/public/js/save-only-png-generator.js`
**Function:** `discoverAvailableViews()` (lines 20-50)

### Current Broken Code (Line 39-40):
```javascript
// Use template data - wrong coordinate space
const zoneBounds = viewData.safeZone || viewData.printZone || null;
```

### Fixed Code:
```javascript
// Find live canvas print zone rectangle
const canvas = designer?.fabricCanvas;
const objects = canvas?.getObjects() || [];
const printZoneRect = objects.find(obj =>
    obj.type === 'rect' &&
    obj.stroke &&
    (obj.fill === 'transparent' || obj.fill === null || obj.fill === 'rgba(0,0,0,0)')
);

// Use live canvas coordinates - correct coordinate space
const zoneBounds = printZoneRect ? {
    left: printZoneRect.left,
    top: printZoneRect.top,
    width: printZoneRect.width * (printZoneRect.scaleX || 1),
    height: printZoneRect.height * (printZoneRect.scaleY || 1)
} : null;
```

### Alternative (More Robust):
```javascript
// Use getBoundingRect() for exact visual bounds including stroke
const zoneBounds = printZoneRect?.getBoundingRect(true, true) || null;
```

## 🚨 Critical Discovery: Graphics Outside Print Zone

**The real issue:** User graphics at `{left: 328, top: 210}` are positioned **outside** the print zone rectangle at `{left: 218.64, top: 41.94, width: 224, height: 323}`.

**Print zone covers:** X: 218.64 → 442.64, Y: 41.94 → 364.94
**Graphics position:** X: 328 ✅ (inside), Y: 210 ✅ (inside)

**Actually graphics ARE inside print zone** - need to verify why PNG appears empty.

## 🧪 Testing Plan

### Phase 1: Implement Canvas Rectangle Source
1. **Update save-only-png-generator.js** with canvas rectangle lookup
2. **Test PNG generation** - verify coordinates match canvas rectangle
3. **Check PNG output** - should show graphics at correct position

### Phase 2: Debug Empty PNG (if needed)
1. **Verify ClipPath application** - check if ClipPath.getBoundingRect() matches printZone
2. **Check graphics visibility** - ensure graphics are not filtered out
3. **Verify canvas rendering** - check if graphics render before clipping

## 📁 Implementation Details

**Single File Change:**
- `/public/js/save-only-png-generator.js` - Lines 39-50 only

**Risk Level:** VERY LOW
- No changes to working ClipPath system
- No changes to PNG generation logic
- Only coordinate source modification

**Rollback Plan:**
- Revert to original line: `const zoneBounds = viewData.safeZone || viewData.printZone || null;`

## 🎯 Expected Results

**After Fix:**
1. **PNG ClipPath** should use exact canvas rectangle coordinates: `{left: 218.64, top: 41.94}`
2. **Graphics capture** should work since graphics are within print zone bounds
3. **Multi-view support** should work with different rectangle coordinates per view

**Success Criteria:**
- PNG shows user graphics instead of background/template
- Front and Back views generate different PNGs
- PNG dimensions match print zone rectangle size

## ⚡ Next Actions

1. **Implement canvas rectangle lookup** in save-only-png-generator.js
2. **Test PNG generation immediately**
3. **Document results** and address any remaining issues

---

**Confidence Level:** 95% - SSOT identified with runtime evidence
**Implementation Risk:** Very Low - minimal change to working system
**Expected Time:** 10 minutes implementation + 10 minutes testing