# 🎯 AGENT 6 - VISUAL FLOW DIAGRAM
**Vollständige User-Flow Visualisierung für alle 3 Test-Scenarios**

---

## 📊 SCENARIO 1: GOLDEN STANDARD v3.0.0 (Happy Path)

```
┌─────────────────────────────────────────────────────────────────────┐
│                    FRONTEND - DESIGNER PHASE                         │
└─────────────────────────────────────────────────────────────────────┘

   User Action                    Code Execution                   Data State
   ───────────                    ──────────────                   ──────────
       │
       ├─► [User draggt Logo]
       │        │
       │        ├─► Fabric.js: object.left = 367.5
       │        │               object.top = 165.2
       │        │
       ├─► [Mouse Release]                                    ┌────────────────┐
       │        │                                             │ Canvas Object  │
       │        ├─► Event: "object:modified"                  │ left: 367.5    │
       │        │                                             │ top:  165.2    │
       │        │                                             └────────────────┘
       │        ▼
       │   designer.bundle.js:1296
       │   updateImageTransform(img)
       │        │
       │        ├─► Extract: img.left = 367.5
       │        │           img.top = 165.2
       │        │
       │        ├─► Store in variationImages Map:            ┌────────────────┐
       │        │   key: "variation1_view1"                  │ variationImages│
       │        │   value: {                                 │ Map Entry:     │
       │        │     transform: {                           │ {              │
       │        │       left: 367.5,  ◄─────────────────────┤   left: 367.5  │
       │        │       top: 165.2    ◄─────────────────────┤   top:  165.2  │
       │        │     }                                      │ }              │
       │        │   }                                        └────────────────┘
       │        │
       ├─► [User clicks "Speichern"]
       │        │
       │        ├─► designer.bundle.js:1843
       │        │   saveDesign()
       │        │        │
       │        │        ▼
       │        │   designer.bundle.js:2072
       │        │   collectDesignState()
       │        │        │
       │        │        ├─► Loop variationImages Map
       │        │        │   Extract transform data
       │        │        │
       │        │        ├─► Build Golden Standard JSON:    ┌────────────────┐
       │        │        │   {                              │ Design JSON    │
       │        │        │     "objects": [                 │ {              │
       │        │        │       {                          │   objects: [   │
       │        │        │         "left": 367.5, ◄─────────┤     left: 367.5│
       │        │        │         "top": 165.2   ◄─────────┤     top:  165.2│
       │        │        │       }                          │   ],           │
       │        │        │     ],                           │   metadata: {  │
       │        │        │     "metadata": {                │     capture_   │
       │        │        │       "capture_version": "3.0.0",│     version:   │
       │        │        │       "designer_offset": {       │     "3.0.0"    │
       │        │        │         "x": 0, "y": 0           │   }            │
       │        │        │       }                          │ }              │
       │        │        │     }                            └────────────────┘
       │        │        │   }
       │        │        │
       │        │        ├─► Validation: validateGoldenStandardFormat()
       │        │        │   ✅ Format valid
       │        │        │
       │        │        └─► Return state object
       │        │
       │        ├─► designer.bundle.js:1888
       │        │   AJAX POST to backend
       │        │   FormData:
       │        │     - action: "save_design"
       │        │     - design_data: JSON.stringify(state)
       │        │
       │        ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    BACKEND - DATABASE PHASE                          │
└─────────────────────────────────────────────────────────────────────┘

       │
       ├─► Backend PHP receives POST
       │        │
       │        ├─► Parse design_data JSON
       │        │
       │        ├─► Database INSERT/UPDATE                  ┌────────────────┐
       │        │   design_data column:                     │ Database Row   │
       │        │   '{                                      │ ┌────────────┐ │
       │        │     "objects": [                          │ │ design_data│ │
       │        │       {"left": 367.5, "top": 165.2}       │ │ column:    │ │
       │        │     ],                                    │ │ {          │ │
       │        │     "metadata": {                         │ │  left: 367.5│
       │        │       "capture_version": "3.0.0"          │ │  top:  165.2│
       │        │     }                                     │ │  metadata: │ │
       │        │   }'                                      │ │  v3.0.0    │ │
       │        │                                           │ └────────────┘ │
       │        │                                           └────────────────┘
       │        ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    FRONTEND - PREVIEW PHASE                          │
└─────────────────────────────────────────────────────────────────────┘

       │
       ├─► Preview page loads
       │        │
       │        ├─► Backend sends design JSON             ┌────────────────┐
       │        │   {                                     │ Received Data  │
       │        │     "objects": [                        │ {              │
       │        │       {"left": 367.5, "top": 165.2}     │   left: 367.5  │
       │        │     ],                                  │   top:  165.2  │
       │        │     "metadata": {                       │   metadata: {  │
       │        │       "capture_version": "3.0.0"        │     v3.0.0     │
       │        │     }                                   │   }            │
       │        │   }                                     └────────────────┘
       │        │
       │        ▼
       │   admin-canvas-renderer.js:673
       │   extractDesignerOffset(designData)
       │        │
       │        ├─► Line 684-698: Golden Standard Check
       │        │   ┌────────────────────────────────┐
       │        │   │ captureVersion = "3.0.0"       │
       │        │   │ parseFloat("3.0.0") = 3.0      │
       │        │   │ 3.0 >= 3.0 → TRUE ✅           │
       │        │   │ isGoldenStandard = true        │
       │        │   └────────────────────────────────┘
       │        │
       │        ├─► Line 689-698: Golden Standard Branch
       │        │   ┌────────────────────────────────┐
       │        │   │ designerOffset.x = 0           │
       │        │   │ designerOffset.y = 0           │
       │        │   │ designerOffset.detected = FALSE│ ◄─── CRITICAL!
       │        │   │ designerOffset.source = "..."  │
       │        │   │                                │
       │        │   │ Console.log: "✅ OFFSET BUG    │
       │        │   │ FIX: Golden Standard v3.0+     │
       │        │   │ detected..."                   │
       │        │   │                                │
       │        │   │ RETURN; ◄──────────────────────┼──── EARLY EXIT!
       │        │   └────────────────────────────────┘
       │        │
       │        │   ❌ Heuristic Detection NOT RUN
       │        │
       │        ▼
       │   admin-canvas-renderer.js:1856
       │   renderImageElement(imageData)
       │        │
       │        ├─► Line 1884-1888: Extract coordinates
       │        │   left = 367.5
       │        │   top = 165.2
       │        │
       │        ├─► Line 1918-1945: Offset Compensation
       │        │   ┌────────────────────────────────┐
       │        │   │ x = left  (367.5)              │
       │        │   │ y = top   (165.2)              │
       │        │   │                                │
       │        │   │ IF (designerOffset.detected    │
       │        │   │     && (x !== 0 || y !== 0))   │
       │        │   │   ↓                            │
       │        │   │ FALSE && (...) → FALSE ✅      │ ◄─── detected=false!
       │        │   │   ↓                            │
       │        │   │ ELSE branch taken:             │
       │        │   │   Audit Trail: "Offset Skip"   │
       │        │   │   reason: "Golden Standard      │
       │        │   │            v3.0+ uses native    │
       │        │   │            coordinates"         │
       │        │   │                                │
       │        │   │ position = {x: 367.5, y: 165.2}│ ◄─── NO SUBTRACTION!
       │        │   └────────────────────────────────┘
       │        │
       │        ├─► Canvas Rendering
       │        │   ctx.drawImage(..., 367.5, 165.2)
       │        │
       └─► ✅ RESULT: Logo rendered at (367.5, 165.2)
            ┌──────────────────────────────────────┐
            │ EXPECTED:  (367.5, 165.2)            │
            │ ACTUAL:    (367.5, 165.2)            │
            │ DELTA:     (0, 0)                    │
            │ STATUS:    ✅ PERFECT MATCH!         │
            └──────────────────────────────────────┘
```

---

## 📊 SCENARIO 2: LEGACY DESIGN (Ohne capture_version)

```
┌─────────────────────────────────────────────────────────────────────┐
│                    FRONTEND - PREVIEW PHASE                          │
└─────────────────────────────────────────────────────────────────────┘

   Preview Page                   Code Execution                   Data State
   ────────────                   ──────────────                   ──────────
       │
       ├─► Preview loads old design
       │        │
       │        ├─► Backend sends legacy JSON             ┌────────────────┐
       │        │   {                                     │ Legacy Data    │
       │        │     "objects": [                        │ {              │
       │        │       {"left": 417.5, "top": 195.2}     │   left: 417.5  │ ◄─ OFFSET!
       │        │     ],                                  │   top:  195.2  │ ◄─ OFFSET!
       │        │     "metadata": {                       │   metadata: {  │
       │        │       "source": "db_processed_views"    │     (no        │
       │        │     }                                   │     capture_   │
       │        │   }                                     │     version)   │
       │        │                                         │   }            │
       │        │                                         └────────────────┘
       │        │   NOTE: Designer v1.0 addierte Offset:
       │        │         Original User Position: (367.5, 165.2)
       │        │         + Container Offset: (50, 30)
       │        │         = Saved in DB: (417.5, 195.2) ❌
       │        │
       │        ▼
       │   admin-canvas-renderer.js:673
       │   extractDesignerOffset(designData)
       │        │
       │        ├─► Line 684-698: Golden Standard Check
       │        │   ┌────────────────────────────────┐
       │        │   │ captureVersion = undefined     │
       │        │   │ isGoldenStandard = false ❌    │
       │        │   └────────────────────────────────┘
       │        │   → Skip this branch
       │        │
       │        ├─► Line 722-736: Metadata Check
       │        │   ┌────────────────────────────────┐
       │        │   │ designData.metadata            │
       │        │   │   .designer_offset = undefined │
       │        │   └────────────────────────────────┘
       │        │   → Skip this branch
       │        │
       │        ├─► Line 738-750: Canvas Info Check
       │        │   ┌────────────────────────────────┐
       │        │   │ designData.canvas_info         │
       │        │   │              = undefined       │
       │        │   └────────────────────────────────┘
       │        │   → Skip this branch
       │        │
       │        ├─► Line 754-870: HEURISTIC DETECTION
       │        │   ┌────────────────────────────────┐
       │        │   │ Extract elements:              │
       │        │   │   elements = [{                │
       │        │   │     left: 417.5, top: 195.2    │
       │        │   │   }]                           │
       │        │   │                                │
       │        │   │ Calculate averages:            │
       │        │   │   avgX = 417.5                 │
       │        │   │   avgY = 195.2                 │
       │        │   │                                │
       │        │   │ Thresholds:                    │
       │        │   │   OFFSET_THRESHOLD_X = 380     │
       │        │   │   OFFSET_THRESHOLD_Y = 180     │
       │        │   │                                │
       │        │   │ Check Legacy:                  │
       │        │   │   isLegacyData = true          │ ◄─ No capture_version
       │        │   │   417.5 > 380 → TRUE ✅        │
       │        │   │   195.2 > 180 → TRUE ✅        │
       │        │   │                                │
       │        │   │ Estimate Offset:               │
       │        │   │   designerOffset.x = 50.0      │
       │        │   │   designerOffset.y = 30.0      │
       │        │   │   designerOffset.detected=TRUE │ ◄─── CRITICAL!
       │        │   │   designerOffset.source=       │
       │        │   │     "heuristic"                │
       │        │   │                                │
       │        │   │ Console.log: "🎯 HIVE MIND:   │
       │        │   │ Legacy offset detected..."     │
       │        │   └────────────────────────────────┘
       │        │
       │        ▼
       │   admin-canvas-renderer.js:1856
       │   renderImageElement(imageData)
       │        │
       │        ├─► Line 1884-1888: Extract coordinates
       │        │   left = 417.5
       │        │   top = 195.2
       │        │
       │        ├─► Line 1918-1945: Offset Compensation
       │        │   ┌────────────────────────────────┐
       │        │   │ x = left  (417.5)              │
       │        │   │ y = top   (195.2)              │
       │        │   │                                │
       │        │   │ IF (designerOffset.detected    │
       │        │   │     && (x !== 0 || y !== 0))   │
       │        │   │   ↓                            │
       │        │   │ TRUE && TRUE → TRUE ✅         │ ◄─── detected=true!
       │        │   │   ↓                            │
       │        │   │ IF branch taken:               │
       │        │   │   x = left - offset.x          │
       │        │   │     = 417.5 - 50.0             │
       │        │   │     = 367.5 ✅                 │
       │        │   │                                │
       │        │   │   y = top - offset.y           │
       │        │   │     = 195.2 - 30.0             │
       │        │   │     = 165.2 ✅                 │
       │        │   │                                │
       │        │   │ Audit Trail:                   │
       │        │   │   "Offset Compensation"        │
       │        │   │   from: (417.5, 195.2)         │
       │        │   │   to:   (367.5, 165.2)         │
       │        │   │                                │
       │        │   │ position = {x: 367.5, y: 165.2}│ ◄─── SUBTRACTED!
       │        │   └────────────────────────────────┘
       │        │
       │        ├─► Canvas Rendering
       │        │   ctx.drawImage(..., 367.5, 165.2)
       │        │
       └─► ✅ RESULT: Logo rendered at (367.5, 165.2)
            ┌──────────────────────────────────────┐
            │ DB STORED:  (417.5, 195.2) [OFFSET]  │
            │ EXPECTED:   (367.5, 165.2)           │
            │ ACTUAL:     (367.5, 165.2)           │
            │ DELTA:      (0, 0)                   │
            │ STATUS:     ✅ LEGACY CORRECTED!     │
            └──────────────────────────────────────┘
```

---

## 📊 SCENARIO 3: v2.1 DESIGN (Mit explizitem designer_offset)

```
┌─────────────────────────────────────────────────────────────────────┐
│                    FRONTEND - PREVIEW PHASE                          │
└─────────────────────────────────────────────────────────────────────┘

   Preview Page                   Code Execution                   Data State
   ────────────                   ──────────────                   ──────────
       │
       ├─► Preview loads v2.1 design
       │        │
       │        ├─► Backend sends v2.1 JSON              ┌────────────────┐
       │        │   {                                    │ v2.1 Data      │
       │        │     "objects": [                       │ {              │
       │        │       {"left": 417.5, "top": 195.2}    │   left: 417.5  │ ◄─ OFFSET!
       │        │     ],                                 │   top:  195.2  │ ◄─ OFFSET!
       │        │     "metadata": {                      │   metadata: {  │
       │        │       "capture_version": "2.1",        │     version:   │
       │        │       "designer_offset": {             │     "2.1"      │
       │        │         "x": 50, "y": 30               │     offset: {  │
       │        │       }                                │       x: 50    │ ◄─ METADATA!
       │        │     }                                  │       y: 30    │ ◄─ METADATA!
       │        │   }                                    │     }          │
       │        │                                        │   }            │
       │        │                                        └────────────────┘
       │        │
       │        ▼
       │   admin-canvas-renderer.js:673
       │   extractDesignerOffset(designData)
       │        │
       │        ├─► Line 684-698: Golden Standard Check
       │        │   ┌────────────────────────────────┐
       │        │   │ captureVersion = "2.1"         │
       │        │   │ parseFloat("2.1") = 2.1        │
       │        │   │ 2.1 >= 3.0 → FALSE ❌          │
       │        │   │ isGoldenStandard = false       │
       │        │   └────────────────────────────────┘
       │        │   → Skip this branch
       │        │
       │        ├─► Line 722-736: Metadata Check
       │        │   ┌────────────────────────────────┐
       │        │   │ designData.metadata            │
       │        │   │   .designer_offset = {x:50...} │
       │        │   │   !== undefined → TRUE ✅      │
       │        │   │                                │
       │        │   │ Extract from metadata:         │
       │        │   │   designerOffset.x = 50        │
       │        │   │   designerOffset.y = 30        │
       │        │   │                                │
       │        │   │ Check non-zero:                │
       │        │   │   50 !== 0 || 30 !== 0         │
       │        │   │   → TRUE ✅                    │
       │        │   │                                │
       │        │   │ Set flags:                     │
       │        │   │   designerOffset.detected=TRUE │ ◄─── CRITICAL!
       │        │   │   designerOffset.source=       │
       │        │   │     "metadata"                 │
       │        │   │                                │
       │        │   │ MUTEX Activation:              │
       │        │   │   correctionStrategy           │
       │        │   │     .offsetApplied = true      │
       │        │   │     .active = "modern_metadata"│
       │        │   │                                │
       │        │   │ Console.log: "🎯 HIVE MIND:   │
       │        │   │ Designer offset extracted from │
       │        │   │ metadata..."                   │
       │        │   │                                │
       │        │   │ RETURN; ◄──────────────────────┼──── EARLY EXIT!
       │        │   └────────────────────────────────┘
       │        │
       │        │   ❌ Heuristic Detection NOT RUN
       │        │
       │        ▼
       │   admin-canvas-renderer.js:1856
       │   renderImageElement(imageData)
       │        │
       │        ├─► Line 1884-1888: Extract coordinates
       │        │   left = 417.5
       │        │   top = 195.2
       │        │
       │        ├─► Line 1918-1945: Offset Compensation
       │        │   ┌────────────────────────────────┐
       │        │   │ x = left  (417.5)              │
       │        │   │ y = top   (195.2)              │
       │        │   │                                │
       │        │   │ IF (designerOffset.detected    │
       │        │   │     && (x !== 0 || y !== 0))   │
       │        │   │   ↓                            │
       │        │   │ TRUE && TRUE → TRUE ✅         │ ◄─── detected=true!
       │        │   │   ↓                            │
       │        │   │ IF branch taken:               │
       │        │   │   x = left - offset.x          │
       │        │   │     = 417.5 - 50               │
       │        │   │     = 367.5 ✅                 │
       │        │   │                                │
       │        │   │   y = top - offset.y           │
       │        │   │     = 195.2 - 30               │
       │        │   │     = 165.2 ✅                 │
       │        │   │                                │
       │        │   │ Audit Trail:                   │
       │        │   │   "Offset Compensation"        │
       │        │   │   from: (417.5, 195.2)         │
       │        │   │   to:   (367.5, 165.2)         │
       │        │   │                                │
       │        │   │ position = {x: 367.5, y: 165.2}│ ◄─── SUBTRACTED!
       │        │   └────────────────────────────────┘
       │        │
       │        ├─► Canvas Rendering
       │        │   ctx.drawImage(..., 367.5, 165.2)
       │        │
       └─► ✅ RESULT: Logo rendered at (367.5, 165.2)
            ┌──────────────────────────────────────┐
            │ DB STORED:  (417.5, 195.2) [OFFSET]  │
            │ EXPECTED:   (367.5, 165.2)           │
            │ ACTUAL:     (367.5, 165.2)           │
            │ DELTA:      (0, 0)                   │
            │ STATUS:     ✅ v2.1 CORRECTED!       │
            └──────────────────────────────────────┘
```

---

## 🎯 KRITISCHE DECISION POINTS

### Decision Point 1: Golden Standard Check (Line 684-698)
```
                     extractDesignerOffset()
                              │
                              ▼
                  ┌─────────────────────┐
                  │ capture_version     │
                  │ defined?            │
                  └─────────┬───────────┘
                            │
                ┌───────────┴───────────┐
                │                       │
              YES                      NO
                │                       │
                ▼                       ▼
    ┌─────────────────────┐   ┌─────────────────────┐
    │ parseFloat(version) │   │ Skip Golden         │
    │      >= 3.0?        │   │ Standard check      │
    └──────────┬──────────┘   └──────────┬──────────┘
               │                          │
       ┌───────┴───────┐                 │
       │               │                 │
     TRUE            FALSE               │
       │               │                 │
       ▼               └─────────────────┘
┌─────────────┐                          │
│ SET:        │                          ▼
│ detected=   │                    Check Metadata
│   false     │                    designer_offset
│ RETURN      │
└─────────────┘
```

### Decision Point 2: Offset Application Check (Line 1922)
```
                    renderImageElement()
                              │
                              ▼
                  ┌─────────────────────┐
                  │ designerOffset.     │
                  │ detected == true?   │
                  └─────────┬───────────┘
                            │
                ┌───────────┴───────────┐
                │                       │
              TRUE                    FALSE
                │                       │
                ▼                       ▼
    ┌─────────────────────┐   ┌─────────────────────┐
    │ offset.x !== 0      │   │ x = left            │
    │   OR                │   │ y = top             │
    │ offset.y !== 0?     │   │ (NO SUBTRACTION)    │
    └──────────┬──────────┘   └─────────────────────┘
               │
       ┌───────┴───────┐
       │               │
     TRUE            FALSE
       │               │
       ▼               ▼
┌─────────────┐ ┌─────────────┐
│ x = left -  │ │ x = left    │
│   offset.x  │ │ y = top     │
│ y = top -   │ │ (NO SUB)    │
│   offset.y  │ └─────────────┘
│ (SUBTRACT)  │
└─────────────┘
```

---

## 📊 VERGLEICH DER 3 STRATEGIEN

| Strategie | Priorität | Trigger | detected Flag | Offset Applied | Use Case |
|-----------|-----------|---------|---------------|----------------|----------|
| **Golden Standard** | 1 (Highest) | `capture_version >= 3.0` | **FALSE** | NO | Neue Designs (v3.0+) |
| **Metadata** | 2 (Medium) | `metadata.designer_offset` exists | **TRUE** | YES | v2.1 Designs mit explizitem Offset |
| **Heuristic** | 3 (Lowest) | Legacy data (avgX > threshold) | **TRUE** | YES | Alte Designs (kein capture_version) |

### Strategie-Auswahl Flow:
```
extractDesignerOffset()
        │
        ▼
┌───────────────────┐
│ Golden Standard?  │──► TRUE ──► detected=FALSE ──► NO OFFSET
└─────────┬─────────┘
          │
         FALSE
          │
          ▼
┌───────────────────┐
│ Metadata Offset?  │──► TRUE ──► detected=TRUE ──► APPLY OFFSET
└─────────┬─────────┘
          │
         FALSE
          │
          ▼
┌───────────────────┐
│ Heuristic Match?  │──► TRUE ──► detected=TRUE ──► APPLY OFFSET
└───────────────────┘
          │
         FALSE
          │
          ▼
    detected=FALSE ──► NO OFFSET
```

---

## ✅ FINALE ERFOLGS-MATRIX

| Scenario | Input | Strategy | Offset Detected | Offset Value | Calculation | Final Output | Status |
|----------|-------|----------|-----------------|--------------|-------------|--------------|--------|
| **v3.0.0** | (367.5, 165.2) | Golden Standard | ❌ FALSE | {0, 0} | 367.5 - 0 = 367.5 | (367.5, 165.2) | ✅ |
| **Legacy** | (417.5, 195.2) | Heuristic | ✅ TRUE | {50, 30} | 417.5 - 50 = 367.5 | (367.5, 165.2) | ✅ |
| **v2.1** | (417.5, 195.2) | Metadata | ✅ TRUE | {50, 30} | 417.5 - 50 = 367.5 | (367.5, 165.2) | ✅ |

**🎯 ALLE 3 SCENARIOS KONVERGIEREN ZU: (367.5, 165.2)** ✅

---

**Erstellt:** 2025-10-04
**Agent:** AGENT 6 - Visual Flow Diagram
**Visualisiert:** 3 komplette User-Flows mit 30+ Decision Points
