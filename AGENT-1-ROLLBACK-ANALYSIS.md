# Agent 1: Rollback & Current State Analysis
## Canvas Coordinate System - Complete Audit for Redesign

**Date**: 2025-10-03
**Mission**: Identify all OFFSET-FIX code, document rollback requirements, analyze violations of "Single Source of Truth"
**Context**: User reports offset subtraction logs appearing (WRONG behavior) - System should use coordinates AS-IS

---

## Executive Summary

### Critical Findings

1. **OFFSET-FIX is a BAND-AID**: The entire 74-line JavaScript + 28-line PHP offset compensation system was added to work around a coordinate capture bug
2. **Clean Baseline Identified**: Commit `41b82ca` (before fc3f8b7) has NO offset compensation code - coordinates stored as raw Fabric.js values
3. **Current Bug Confirmed**: System is SUBTRACTING offsets on load (user's logs show this), violating "What You See Is What You Get"
4. **Architectural Violation**: Multiple coordinate transformations create discrepancies between visual position and stored values

### User's Core Complaint (VALIDATED)

```
User sees: Logo placed at Y=200px
System logs: "🔧 OFFSET-FIX: Loading NEW design - subtracting offset {offset_y: 50}"
Result: Coordinates manipulated, not stored AS-IS
```

**This is WRONG**. Single Source of Truth principle: Capture coordinates exactly as displayed, render them exactly as stored.

---

## Part 1: OFFSET-FIX Code Inventory

### JavaScript: `/workspaces/yprint_designtool/public/js/dist/designer.bundle.js`

| Line | Function | Code Type | Purpose |
|------|----------|-----------|---------|
| 921-950 | `getCanvasOffset()` | NEW FUNCTION (74 lines total) | Calculates CSS padding offset dynamically |
| 926 | Warning log | Console output | "Canvas element not found" |
| 931 | **CONTAINER SELECTOR BUG** | Core calculation | `canvasElement.parentNode` - GETS WRONG CONTAINER |
| 934 | Warning log | Console output | "Container not found" |
| 943 | Info log | Console output | "Calculated offset {offsetX, offsetY}" |
| 947 | Error log | Console output | "Error calculating offset" |
| 960 | Comment | Documentation | "🔧 OFFSET-FIX: Calculate and apply canvas offset (50px CSS padding)" |
| 961 | Offset call | Coordinate capture | `var offset = this.getCanvasOffset();` (in storeViewImage) |
| 962-968 | Offset addition | Coordinate transform | `left: fabricImage.left + offset.x` |
| 1111-1127 | Load path - Type 1 | Coordinate transform | Subtract offset for NEW designs (fromURL path) |
| 1115 | Info log | Console output | "Loading NEW design - subtracting offset" |
| 1125 | Info log | Console output | "Loading OLD design - using coordinates as-is" |
| 1135-1151 | Load path - Type 2 | Coordinate transform | Subtract offset for NEW designs (fabricImage path) |
| 1326-1348 | updateImageTransform | Coordinate transform | Add offset + store metadata on every drag/drop |
| 1340-1348 | Metadata injection | Data storage | Store offset_applied, offset_x, offset_y, version, timestamp |

**Total JavaScript OFFSET-FIX code**: 13 markers, ~74 lines of logic

### PHP: `/workspaces/yprint_designtool/includes/class-octo-print-api-integration.php`

| Line | Function | Code Type | Purpose |
|------|----------|-----------|---------|
| 657-682 | `convert_canvas_to_print_coordinates()` | Coordinate transform | Subtract offset for Print API |
| 662 | Metadata check | Conditional logic | `if (metadata['offset_applied'] === true)` |
| 663-664 | Offset extraction | Data retrieval | Read offset_x/offset_y from metadata |
| 667-668 | Offset subtraction | Coordinate transform | `$left_px -= $offset_x; $top_px -= $offset_y;` |
| 670-678 | Info log | Server logging | "Applied coordinate offset correction" |
| 681 | Info log | Server logging | "No offset metadata - using coordinates as-is" |
| 1048-1055 | `estimate_position_from_canvas()` | Coordinate transform | Subtract offset for position detection |

**Total PHP OFFSET-FIX code**: 5 markers, ~28 lines of logic

### Metadata Schema Added

```json
{
  "offset_applied": true,
  "offset_x": 50.0,
  "offset_y": 50.0,
  "offset_fix_version": "1.0.0",
  "offset_fix_timestamp": "2025-10-03T11:38:32Z"
}
```

**Impact**: Every saved design now carries this metadata, creating data format versioning complexity.

---

## Part 2: Git History - Commits to Rollback

### Primary OFFSET-FIX Commits

| Commit | Date | Description | Changes | Rollback Priority |
|--------|------|-------------|---------|-------------------|
| `fc3f8b7` | 2025-10-03 11:38 | Canvas Offset Bug - 50px CSS Padding Compensation | Added getCanvasOffset(), +74 JS lines, +28 PHP lines, 40+ docs | **P0 - CRITICAL** |
| `e679eb2` | 2025-10-03 12:15 | ARCHITECTURE A: Minimal Fix Implementation | Changed line 931: `.designer-editor` → `parentNode` | **P0 - CRITICAL** |
| `7468cfe` | 2025-10-01 10:06 | DESIGNER OFFSET METADATA: Complete Coordinate System | Added offset metadata to production-ready-design-data-capture.js | **P1 - HIGH** |
| `fb45ac9` | 2025-09-30 (est) | HIVE MIND FIX: Designer-Offset Kompensation | Unknown changes (needs investigation) | **P2 - MEDIUM** |

### Related "Canvas Scaling" Commits (May contain hidden offset logic)

| Commit | Date | Description | Rollback Priority |
|--------|------|-------------|-------------------|
| `e6f855f` | 2025-09-30 | CANVAS DIMENSION SCALING FIX | **P2 - MEDIUM** (may have scaling-based offsets) |
| `8e6691f` | 2025-09-29 | CRITICAL FIX: Perfect 1:1 Design Replication | **P2 - MEDIUM** (canvas scaling overhaul) |

### Clean Baseline Commit

**Baseline**: `41b82ca` - "CLEANUP: Archive Agent Reports"
- **Date**: 2025-10-03 09:53
- **State**: NO getCanvasOffset() function exists
- **Coordinate Storage**: Raw Fabric.js values (`left: img.left, top: img.top`)
- **Metadata**: No offset_applied flags
- **Backup Files**: Both `.backup-pre-offset-fix-*` files were created FROM this state

**Alternative Baseline**: `18d6d67` - "PHASE 3.1-3.3 COMPLETE: Golden Standard Format"
- **Date**: Earlier (before offset issues)
- **State**: Stable Golden Standard format implementation
- **Recommended**: Yes, if 41b82ca has other unrelated bugs

---

## Part 3: The "What You See Is NOT What You Get" Bug

### Current Broken Flow

```
┌─────────────────────────────────────────────────────────────────┐
│ STEP 1: USER INTERACTION                                        │
│ User drags logo to visual Y=200px (measured from viewport)      │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│ STEP 2: FABRIC.JS EVENT                                         │
│ Fabric.js fires 'modified' event                                │
│ Object properties: { top: 150, left: 100 }                      │
│ (Canvas-relative coordinates, 50px less due to CSS padding)     │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│ STEP 3: OFFSET CALCULATION (WRONG - Line 931 bug)               │
│ getCanvasOffset() → uses parentNode (.designer-canvas-container)│
│ Container has 0px padding → offset = {x: 0, y: 0}               │
│ SHOULD use .designer-editor → offset = {x: 50, y: 50}           │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│ STEP 4: COORDINATE CAPTURE (BROKEN)                             │
│ updateImageTransform() called                                   │
│ Stored: top = 150 + 0 = 150px (WRONG, should be 200px)          │
│ Metadata: offset_applied=true, offset_y=0 (WRONG, should be 50) │
│ ❌ VIOLATION: Stored ≠ Visual (150 ≠ 200)                       │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│ STEP 5: DATABASE SAVE                                           │
│ Design saved with corrupted coordinates:                        │
│ { top: 150, metadata: { offset_applied: true, offset_y: 0 } }  │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│ STEP 6: DESIGN RELOAD                                           │
│ JavaScript reads: top=150, offset_y=0                           │
│ Code: if (offset_applied) { top -= offset_y }                   │
│ Fabric.js receives: top = 150 - 0 = 150px                       │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│ STEP 7: VISUAL RENDERING (WRONG POSITION)                       │
│ Logo appears at Y=200px (150px canvas + 50px CSS padding)       │
│ BUT user sees it shifted 50px DOWN from where they placed it!   │
│ ❌ BUG: Visual ≠ Original placement                             │
└─────────────────────────────────────────────────────────────────┘
```

### User's Console Logs (Evidence of the Bug)

```javascript
🔧 OFFSET-FIX: Calculated offset {offsetX: 50, offsetY: 50}
🔧 OFFSET-FIX: Loading NEW design - subtracting offset {offset_x: 50, offset_y: 50}
```

**Analysis**: User reports seeing BOTH logs, meaning:
1. System IS calculating offset (sometimes 50px, sometimes 0px - viewport-dependent)
2. System IS subtracting offset on load
3. This creates a **round-trip transformation** that violates Single Source of Truth

### Math.round() Precision Loss

**Location**: Not found in current code (possible earlier issue)
**Issue**: If coordinates were rounded during capture/load, sub-pixel precision lost
**Impact**: Cumulative rounding errors over multiple save/load cycles

---

## Part 4: Complete Coordinate Flow Map

### SAVE PATH (User places logo → Database)

```
USER ACTION (Visual Y=200px)
    ↓
FABRIC.JS EVENT 'modified'
    ↓ [Object: { top: 150 }] (canvas-relative)
    ↓
updateImageTransform() [designer.bundle.js:1315]
    ↓
getCanvasOffset() [designer.bundle.js:921]
    ↓ [Line 931 BUG: uses wrong container]
    ↓ [Returns: {x: 0-50px, y: 0-50px} - VIEWPORT DEPENDENT]
    ↓
COORDINATE ADDITION [Line 1331]
    ↓ [transform.top = img.top + offset.y]
    ↓ [Result: 150 + 0-50 = 150-200px - INCONSISTENT]
    ↓
METADATA INJECTION [Line 1340-1348]
    ↓ [offset_applied: true, offset_x: 0-50, offset_y: 0-50]
    ↓
SAVE TO DATABASE
    ↓ [JSON: { top: 150-200, metadata: {...} }]
```

**Transformations**: 2 (Fabric→Offset, Offset→Database)
**Violation**: Visual position (200px) ≠ Stored position (150-200px, inconsistent)

### LOAD PATH (Database → Visual display)

```
DATABASE READ
    ↓ [JSON: { top: 150-200, metadata: { offset_applied: true } }]
    ↓
restoreViewImage() / configureAndLoadFabricImage()
    ↓
METADATA CHECK [Line 1114 or 1138]
    ↓
IF offset_applied === true:
    ↓
    COORDINATE SUBTRACTION [Line 1121 or 1145]
        ↓ [transform.top -= metadata.offset_y]
        ↓ [Result: 150-200 - 0-50 = 100-200px - INCONSISTENT]
        ↓
FABRIC.JS SET COORDINATES
    ↓ [img.set({ top: 100-200 })]
    ↓
BROWSER RENDERING
    ↓ [Visual Y = 100-200 + 50px CSS = 150-250px]
    ↓
USER SEES LOGO (WRONG POSITION)
```

**Transformations**: 2 (Database→Offset, Offset→Fabric)
**Violation**: Rendered position ≠ Original visual position

### PHP RENDERER PATH (Database → Print API)

```
DATABASE READ (WooCommerce order meta)
    ↓
convert_canvas_to_print_coordinates() [class-octo-print-api-integration.php:641]
    ↓
METADATA CHECK [Line 662]
    ↓
IF offset_applied === true:
    ↓
    OFFSET SUBTRACTION [Line 667-668]
        ↓ [$left_px -= $offset_x; $top_px -= $offset_y;]
        ↓
PRECISION CONVERSION
    ↓ [Pixels → Millimeters using PrecisionCalculator]
    ↓
PRINT API PAYLOAD
    ↓ [POST to external print service]
```

**Transformations**: 3 (Database→Offset, Offset→MM, MM→PrintAPI)

---

## Part 5: Why Current Approach Violates "Single Source of Truth"

### Principle Definition

> **Single Source of Truth (SSOT)**: A coordinate system where the stored value IS the authoritative representation. No transformations during read or write. What you capture is what you store. What you store is what you render.

### Violations in Current System

| Violation | Location | Impact | Severity |
|-----------|----------|--------|----------|
| **V1: Capture Transformation** | Line 1331 (JS) | Stored ≠ Visual | CRITICAL |
| **V2: Load Transformation** | Line 1121/1145 (JS) | Rendered ≠ Stored | CRITICAL |
| **V3: Metadata Dependency** | Lines 1114, 1138, 662 (JS/PHP) | Cannot read coordinates without metadata context | HIGH |
| **V4: Viewport Dependency** | Line 931 (getCanvasOffset) | Same design yields different coordinates at different viewport widths | CRITICAL |
| **V5: Round-Trip Inconsistency** | Save→Load cycle | Coordinates change: 200 → 150+50 → 150 → 200 (but offset varies) | CRITICAL |
| **V6: CSS Coupling** | Entire OFFSET-FIX system | Coordinate storage logic depends on CSS padding values | HIGH |

### Evidence: Viewport-Dependent Corruption

From AGENT-4-26-1PX-DISCREPANCY-ANALYSIS.json:

```json
{
  "viewport_width": "1920px",
  "css_padding": "50px",
  "calculated_offset": "50px",
  "result": "Correct offset"
},
{
  "viewport_width": "950px",
  "css_padding": "50px (still desktop CSS)",
  "calculated_offset": "26.1px (scaled by viewport)",
  "result": "WRONG - 50px padding scales to 26.1px in getBoundingClientRect()"
},
{
  "viewport_width": "<950px",
  "css_padding": "0px (mobile CSS)",
  "calculated_offset": "0px",
  "result": "Correct for mobile, but breaks desktop designs"
}
```

**Consequence**: Same logo placement action yields 3 different stored coordinates (200px, 176.1px, 150px) depending on viewport width.

### SSOT-Compliant Alternative

```javascript
// CAPTURE (SSOT version)
const position = fabricObject.top;  // 150px (canvas-relative)
save({ top: position });            // Store AS-IS

// RENDER (SSOT version)
const data = load();                // Read AS-IS
fabricObject.set({ top: data.top });// Use AS-IS

// Result: 150px → 150px (consistent, no transformations)
```

**Why this works**:
- Fabric.js coordinates are ALREADY canvas-relative (the correct reference frame)
- CSS padding is VISUAL ONLY - doesn't affect coordinate math
- User's visual perception of "Y=200px from container" is irrelevant - Fabric.js is the SSOT

---

## Part 6: Recommended Rollback Strategy

### Option A: Complete Rollback to Baseline (RECOMMENDED)

**Target Commit**: `41b82ca` (or `18d6d67` for extra safety)

**Steps**:
1. **Backup Current State**
   ```bash
   git checkout main
   git branch backup-before-rollback-$(date +%Y%m%d)
   ```

2. **Revert OFFSET-FIX Commits** (reverse chronological order)
   ```bash
   git revert e679eb2  # Architecture A fix
   git revert fc3f8b7  # Original offset fix
   git revert 7468cfe  # Metadata integration
   # Test after each revert
   ```

3. **Verify Clean State**
   ```bash
   grep -r "OFFSET-FIX" public/js/dist/designer.bundle.js  # Should return nothing
   grep -r "offset_applied" includes/class-octo-print-api-integration.php  # Should return nothing
   ```

4. **Database Migration** (CRITICAL)
   - NEW designs with `offset_applied=true`: Coordinates are already corrupted
   - OLD designs: Already correct (no offset_applied flag)
   - Action: Write migration script to identify and fix corrupted coordinates

**Rollback Impact**:
- Code: -102 lines (74 JS + 28 PHP)
- Files: 2 (designer.bundle.js, class-octo-print-api-integration.php)
- Metadata: Remove offset_applied/offset_x/offset_y from all designs
- Risk: LOW (returning to proven baseline)

### Option B: Architecture B - Pure Fabric.js (CLEAN SLATE)

From AGENT-6-ARCHITECTURE-COMPARISON-DE.md:

**Philosophy**: "Fabric.js provides canvas-relative coordinates. These are ALREADY CORRECT. No transformation needed."

**Implementation**:
1. Remove ALL offset calculation code (getCanvasOffset, metadata, load/save transforms)
2. Use Fabric.js coordinates directly: `save({ top: obj.top })`
3. Render directly: `obj.set({ top: data.top })`
4. Migrate ALL designs (both OLD and NEW) to remove metadata

**Advantages**:
- Maximum simplicity (-102 lines code)
- Viewport-independent (works at any screen size)
- No future offset bugs possible
- Fabric.js best practices

**Disadvantages**:
- Requires migrating ALL designs in database
- Breaking change (old code can't read migrated designs)
- Higher testing burden
- 14-30 day timeline

---

## Part 7: Files Requiring Changes (Post-Rollback)

### Files to Modify

| File | Current State | Post-Rollback State | Action |
|------|---------------|---------------------|--------|
| `/workspaces/yprint_designtool/public/js/dist/designer.bundle.js` | 2833 lines with OFFSET-FIX | Remove lines 921-950, 960-968, 1111-1151, 1326-1348 | REVERT |
| `/workspaces/yprint_designtool/includes/class-octo-print-api-integration.php` | Contains offset subtraction | Remove lines 657-682, 1048-1055 | REVERT |
| Database designs | ~75-90% have offset_applied=true | All designs: Remove metadata.offset_* | MIGRATE |

### Backup Files (Already Created)

✅ `designer.bundle.js.backup-pre-offset-fix-1759487255`
✅ `class-octo-print-api-integration.php.backup-pre-offset-fix-1759488230`

**Note**: These backups are FROM commit fc3f8b7 (AFTER the offset fix), not from 41b82ca baseline. They can be used for comparison but NOT for clean rollback.

### Documentation to Archive

**Created by OFFSET-FIX implementation** (40+ files, 500+ KB):
- AGENT-1-CANVAS-OFFSET-ROOT-CAUSE.json
- AGENT-2-EXECUTIVE-SUMMARY-DE.md
- AGENT-3-IMPLEMENTATION-REPORT.json
- AGENT-4-PHP-BACKEND-VALIDATION.json
- AGENT-5-PHP-RENDERER-FIX-REPORT.json
- AGENT-6-INTEGRATION-TEST-REPORT.json
- AGENT-7-FINAL-VALIDATION-REPORT.json
- TECHNICAL-ARCHITECTURE-OFFSET-FIX.md
- PRODUCTION-DEPLOYMENT-RUNBOOK.md
- And 30+ more analysis/validation files

**Action**: Move to `/archive/offset-fix-attempt-2025-10-03/` for historical reference

---

## Part 8: Database Impact Analysis

### Design Data Corruption Types

From AGENT-5-LEGACY-DATA-CORRUPTION-ANALYSIS.json:

| Type | Description | Prevalence | Coordinates Status | Metadata |
|------|-------------|------------|-------------------|----------|
| **OLD** | Created before fc3f8b7 | ~10-25% | CORRECT (no offset applied) | No offset_applied flag |
| **Type A** | Desktop viewport (1920px) | ~40-50% | CORRUPTED (+50px) | offset_applied=true, offset_x=50, offset_y=50 |
| **Type B** | Breakpoint viewport (950px) | ~25-35% | CORRUPTED (+26.1px) | offset_applied=true, offset_x=26.1, offset_y=26.1 |
| **Type C** | Mobile viewport (<950px) | ~10-15% | CORRECT (+0px) | offset_applied=true, offset_x=0, offset_y=0 |

**Total Corrupted**: 75-90% of all NEW designs

### Migration Requirements

**Goal**: Remove ALL offset metadata, restore coordinates to canvas-relative values

**Type A/B Designs** (Corrupted):
```javascript
// Current: { top: 200, metadata: { offset_applied: true, offset_y: 50 } }
// Fixed:   { top: 150, metadata: { offset_applied: false } }
// Logic:   top_corrected = top_stored - offset_y
```

**Type C Designs** (Metadata only):
```javascript
// Current: { top: 150, metadata: { offset_applied: true, offset_y: 0 } }
// Fixed:   { top: 150, metadata: { offset_applied: false } }
// Logic:   Remove metadata only
```

**OLD Designs** (Already correct):
```javascript
// Current: { top: 150, metadata: {} }
// Fixed:   No change needed
```

---

## Part 9: Recommendations for Agent 2-7

### Agent 2: Architecture Design

**Task**: Choose between:
1. **Option A**: Rollback to 41b82ca + Database migration
2. **Option B**: Pure Fabric.js architecture (clean slate)

**Criteria**:
- Option A if: Quick fix needed, minimize risk, preserve existing (non-corrupted) designs
- Option B if: Long-term maintainability, willing to invest 14-30 days, accept one-time migration cost

### Agent 3-5: Implementation

**If Option A (Rollback)**:
- Revert commits fc3f8b7, e679eb2, 7468cfe
- Write database migration script
- Test with OLD/Type A/Type B/Type C designs

**If Option B (Pure Fabric.js)**:
- Remove all OFFSET-FIX code
- Remove metadata dependencies
- Migrate ALL designs to unified format

### Agent 6-7: Validation & Deployment

**Validation**:
- Test coordinate consistency: Visual placement = Stored value = Rendered value
- Test viewport independence: Same coordinates at 1920px, 950px, 480px
- Test round-trip: Save→Load→Save→Load (coordinates unchanged)

**Deployment**:
- Phase 1: Deploy code changes
- Phase 2: Run database migration (with backup)
- Phase 3: Monitor for 7-14 days
- Phase 4: Archive OFFSET-FIX documentation

---

## Appendix A: All OFFSET-FIX Markers

### JavaScript (designer.bundle.js)

```
Line 926:  console.warn('🔧 OFFSET-FIX: Canvas element not found, returning zero offset');
Line 931:  // .designer-canvas-container - OFFSET-FIX: Use direct parent (0px padding)
Line 934:  console.warn('🔧 OFFSET-FIX: .designer-editor container not found, returning zero offset');
Line 943:  console.log('🔧 OFFSET-FIX: Calculated offset', { offsetX, offsetY });
Line 947:  console.error('🔧 OFFSET-FIX: Error calculating offset', error);
Line 960:  // 🔧 OFFSET-FIX: Calculate and apply canvas offset (50px CSS padding)
Line 1111: // 🔧 OFFSET-FIX: Backward-compatible offset handling
Line 1115: console.log('🔧 OFFSET-FIX: Loading NEW design - subtracting offset', {...});
Line 1125: console.log('🔧 OFFSET-FIX: Loading OLD design - using coordinates as-is');
Line 1135: // 🔧 OFFSET-FIX: Backward-compatible offset handling
Line 1139: console.log('🔧 OFFSET-FIX: Loading NEW design - subtracting offset', {...});
Line 1149: console.log('🔧 OFFSET-FIX: Loading OLD design - using coordinates as-is');
Line 1326: // 🔧 OFFSET-FIX: Calculate and apply canvas offset
Line 1340: // 🔧 OFFSET-FIX: Update metadata flags
```

### PHP (class-octo-print-api-integration.php)

```
Line 657:  // 🔧 OFFSET-FIX: Handle frontend canvas offset compensation
Line 671:  '🔧 OFFSET-FIX: Applied coordinate offset correction - X: %.2f, Y: %.2f'
Line 681:  error_log('🔧 OFFSET-FIX: No offset metadata - using coordinates as-is');
Line 1048: // 🔧 OFFSET-FIX: Handle frontend canvas offset compensation
Line 1054: error_log(sprintf('🔧 OFFSET-FIX [Position Estimator]: Subtracted offset'));
```

**Total**: 19 markers across 2 files

---

## Appendix B: Baseline Comparison

### Commit 41b82ca (CLEAN - Before OFFSET-FIX)

**storeViewImage() - Line 932-933**:
```javascript
transform: {
  left: fabricImage.left,   // Raw Fabric.js coordinate
  top: fabricImage.top,      // No transformation
  scaleX: fabricImage.scaleX,
  // ...
}
```

**updateImageTransform() - Line 1249-1250**:
```javascript
imageData.transform = {
  left: img.left,            // Direct copy
  top: img.top,              // No offset addition
  // ...
};
```

**No getCanvasOffset() function exists**

### Commit fc3f8b7 (OFFSET-FIX Added)

**NEW getCanvasOffset() - Line 921-950** (29 lines):
```javascript
key: "getCanvasOffset",
value: function getCanvasOffset() {
  var containerElement = canvasElement.closest('.designer-editor'); // WRONG SELECTOR
  var offsetX = canvasRect.left - containerRect.left;
  return { x: offsetX, y: offsetY };
}
```

**storeViewImage() - Modified**:
```javascript
var offset = this.getCanvasOffset();
transform: {
  left: fabricImage.left + offset.x,   // TRANSFORMATION ADDED
  top: fabricImage.top + offset.y,     // TRANSFORMATION ADDED
  // ...
}
```

### Commit e679eb2 (Architecture A - Line 931 "Fix")

**getCanvasOffset() - Line 931 changed**:
```javascript
// BEFORE (fc3f8b7):
var containerElement = canvasElement.closest('.designer-editor');

// AFTER (e679eb2):
var containerElement = canvasElement.parentNode; // .designer-canvas-container
```

**Result**: Offset calculation changed from 50px to 0px (but still WRONG per user's analysis)

---

## Conclusion

The OFFSET-FIX system is a complex band-aid (102 lines of code) attempting to compensate for a fundamental architectural issue: storing transformed coordinates instead of raw Fabric.js values.

**Key Insight**: The "bug" the OFFSET-FIX tried to solve wasn't actually a bug - it was the CORRECT behavior. Fabric.js provides canvas-relative coordinates, which should be stored AS-IS. The CSS padding is a VISUAL LAYER that doesn't require coordinate transformation.

**Recommended Action**: Complete rollback to commit `41b82ca` or earlier, followed by database migration to remove corrupted offset metadata.

**Next Agent**: Agent 2 should design the rollback strategy and choose between Option A (rollback) or Option B (pure Fabric.js redesign).

---

**Agent 1 Mission Complete**
**Deliverable**: `/workspaces/yprint_designtool/AGENT-1-ROLLBACK-ANALYSIS.md`
**Status**: READY FOR AGENT 2 ARCHITECTURE DESIGN
