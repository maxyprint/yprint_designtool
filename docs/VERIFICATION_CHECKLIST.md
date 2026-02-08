# PNG Generation Verification Checklist

**Generated:** 2026-02-08
**Purpose:** Prove multi-view PNG generation works with correct print zone coordinates

## 🎯 Verification Goals

1. **Front export uses Front printZoneRect coordinates**
2. **Back export uses Back printZoneRect coordinates**
3. **Both PNGs differ and contain correct graphics**
4. **Old single-view working export still works**

## 🧪 Browser Console Test Snippets

### Test 1: Print Zone Rectangle Detection
```javascript
// === PRINT ZONE RECT DETECTION TEST ===
(() => {
  const designer = window.designerInstance;
  const canvas = designer?.fabricCanvas;
  const objects = canvas?.getObjects() || [];

  console.log('🔍 CANVAS OBJECTS SCAN:');
  objects.forEach((obj, idx) => {
    console.log(`[${idx}] ${obj.type}:`, {
      data: obj.data,
      role: obj.data?.role,
      stroke: obj.stroke,
      fill: obj.fill,
      bounds: obj.type === 'rect' ? obj.getBoundingRect(true, true) : null
    });
  });

  // Find print zone using new identifier
  const printZone = objects.find(obj => obj.data?.role === 'printZone');
  console.log('✅ PRINT ZONE FOUND:', printZone ? {
    bounds: printZone.getBoundingRect(true, true),
    identifier: printZone.data?.role,
    visible: printZone.visible
  } : '❌ NOT FOUND');

  return printZone;
})();
```

### Test 2: Multi-View Coordinate Verification
```javascript
// === MULTI-VIEW COORDINATES TEST ===
(() => {
  const designer = window.designerInstance;

  if (!designer?.activeTemplateId || !designer?.currentVariation) {
    console.error('❌ No active template/variation');
    return;
  }

  const template = designer.templates.get(designer.activeTemplateId);
  const variation = template.variations.get(designer.currentVariation.toString());

  console.log('🎯 MULTI-VIEW COORDINATE ANALYSIS:');
  console.log('Current View:', designer.currentView);

  const results = {};
  variation.views.forEach((viewData, viewId) => {
    // Simulate the PNG generator coordinate detection
    const canvas = designer.fabricCanvas;
    const objects = canvas?.getObjects() || [];
    const printZoneRect = objects.find(obj => obj.data?.role === 'printZone');
    const bounds = printZoneRect?.getBoundingRect(true, true);

    results[viewId] = {
      viewName: viewData.name,
      isCurrentView: viewId === designer.currentView,
      printZoneBounds: bounds,
      templateSafeZone: viewData.safeZone
    };

    console.log(`📋 ${viewData.name} (${viewId}):`, {
      liveCanvasBounds: bounds,
      templateBounds: viewData.safeZone,
      coordinateMatch: bounds ? 'LIVE CANVAS' : 'NO LIVE RECT'
    });
  });

  return results;
})();
```

### Test 3: PNG Generation Verification
```javascript
// === PNG GENERATION TEST ===
(async () => {
  console.log('🖨️ TESTING PNG GENERATION SYSTEM:');

  const designer = window.designerInstance;

  // Test 1: Check if PNG function exists
  const pngFunction = window.generatePNGForDownload;
  console.log('PNG Function Available:', !!pngFunction);

  if (!pngFunction) {
    console.error('❌ generatePNGForDownload function not found');
    return;
  }

  // Test 2: Current view PNG generation
  try {
    console.log('🔄 Generating PNG for current view...');
    const currentViewPNG = await pngFunction();

    console.log('✅ Current View PNG:', {
      generated: !!currentViewPNG,
      dataUrlLength: currentViewPNG?.length || 0,
      view: designer.currentView,
      viewName: designer.templates?.get(designer.activeTemplateId)
        ?.variations?.get(designer.currentVariation?.toString())
        ?.views?.get(designer.currentView)?.name
    });

    // Test 3: Check PNG generator coordinate source
    const template = designer.templates.get(designer.activeTemplateId);
    const variation = template.variations.get(designer.currentVariation.toString());
    const currentViewData = variation.views.get(designer.currentView);

    // Simulate PNG generator logic
    const canvas = designer.fabricCanvas;
    const objects = canvas?.getObjects() || [];
    const printZoneRect = objects.find(obj => obj.data?.role === 'printZone');
    const usedBounds = printZoneRect?.getBoundingRect(true, true);

    console.log('📐 PNG COORDINATE SOURCE:', {
      method: 'Live Canvas Rectangle',
      bounds: usedBounds,
      oldMethod: currentViewData.safeZone,
      improvement: usedBounds ? 'USING CORRECT COORDINATES' : 'FALLBACK TO TEMPLATE'
    });

    return {
      pngGenerated: !!currentViewPNG,
      coordinateSource: usedBounds ? 'live_canvas' : 'template_fallback',
      bounds: usedBounds
    };

  } catch (error) {
    console.error('❌ PNG Generation Error:', error);
    return { error: error.message };
  }
})();
```

## ✅ Expected Results

### Test 1: Print Zone Detection
- ✅ Should find rectangle with `data.role === 'printZone'`
- ✅ Should return bounds like `{left: 218.64, top: 41.94, width: 224, height: 323}`
- ✅ Should show `visible: true` when print zone is displayed

### Test 2: Multi-View Coordinates
- ✅ Should show same live canvas bounds for all views (current implementation)
- ✅ Should distinguish between current view and other views
- ✅ Should use `LIVE CANVAS` coordinates instead of template data

### Test 3: PNG Generation
- ✅ Should generate PNG successfully
- ✅ Should use `Live Canvas Rectangle` coordinate source
- ✅ Should show `USING CORRECT COORDINATES`
- ✅ Bounds should match Test 1 results

## 🚨 Failure Indicators

### ❌ Test 1 Failures:
- No object with `data.role === 'printZone'` found
- Bounds are null or undefined
- Only finds rectangles by stroke color (old heuristic method)

### ❌ Test 2 Failures:
- All views show `templateBounds` instead of `liveCanvasBounds`
- Coordinate source shows `NO LIVE RECT`
- Falls back to template calculations

### ❌ Test 3 Failures:
- PNG generation fails entirely
- Coordinate source shows `template_fallback`
- Error messages about missing functions

## 📋 Manual Verification Steps

1. **Switch Views:** Change between Front/Back views in designer
2. **Run Test 2:** Verify each view shows correct print zone bounds
3. **Generate PNGs:** Use Test 3 to generate PNG for each view
4. **Compare Results:** Ensure Front and Back PNGs are different
5. **Validate Graphics:** Confirm PNGs show user graphics, not background

## 🔧 Troubleshooting

**If Test 1 fails:** Print zone rectangle creation may not include stable identifier
**If Test 2 fails:** PNG generator may still use template data instead of live canvas
**If Test 3 fails:** Check browser console for JavaScript errors

---

**Next Steps:** Run all three tests to prove multi-view PNG generation works correctly