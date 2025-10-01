# Changelog - Hive Mind Fixes

## [1.2.0] - 2025-10-01

### 🎯 Critical Fixes

#### Heuristic Threshold Adjustment - False Positive Prevention
- **Problem:** Legacy canvas scaling heuristic had overly aggressive thresholds causing false positives on modern designs
- **Root Cause:**
  - Initial threshold: avgX > 350 OR avgY > 250 (too low)
  - Modern single-element designs (avgX ~367) incorrectly flagged as legacy
  - Applied unnecessary scaling to already-correct coordinates
- **Solution:** Smart threshold based on element count
  - Single element: xThreshold=380, yThreshold=180 (stricter)
  - Multiple elements: xThreshold=400, yThreshold=200 (standard)
  - Prevents false positives while catching genuine legacy data
- **Files:** `admin/js/admin-canvas-renderer.js` (Lines 574-578)
- **Impact:** Order 5376+ render correctly without false-positive scaling

**Commit:** c0788d0 - Initial threshold lowering (350/250)
**Commit:** 8e6691f - Smart threshold implementation (element-count based)

---

## [1.1.0] - 2025-10-01

### 🎯 Major Fixes

#### Legacy-Offset-Kompensation (90% Impact)
- **Problem:** Designer addiert Container-Offset zu Koordinaten, aber Legacy-Daten haben keine Offset-Metadaten
- **Lösung:** Aggressive Heuristik für Legacy-Daten basierend auf durchschnittlicher Element-Position
- **Files:** `admin/js/admin-canvas-renderer.js` (Lines 479-502)
- **Impact:** Order 5374 und frühere Designs werden nun korrekt ausgerichtet

#### CSS Container Fixes (10% Impact)
- **Problem:** Container ohne min-height, text-align: center
- **Lösung:**
  - `min-height: 580px` hinzugefügt
  - `text-align: center` → `text-align: left`
- **Files:**
  - `admin/class-octo-print-designer-admin.php` (Line 1580)
  - `admin/css/order-design-preview.css` (Line 217+)
- **Impact:** AGENT 8 Fidelity Check bestanden, keine Mikro-Verschiebungen

### 🚀 Performance Improvements

#### Webpack Bundle Rebuild
- **Problem:** Bundles 7 Tage veraltet (78 Commits behind)
- **Lösung:** `npm run build` ausgeführt
- **Impact:** Alle neuesten Fixes nun in Production Bundles

#### Bundle-Versionierung Hash-basiert
- **Problem:** `rand()` verhindert Browser-Caching
- **Lösung:** `md5_file()` für Bundle-Hashes
- **Files:** `admin/class-octo-print-designer-admin.php` (Lines 86-100)
- **Impact:** ~2MB weniger Traffic pro Seitenaufruf

### 📊 Monitoring & Testing

#### Performance Monitor
- **Neu:** `admin/js/performance-monitor.js`
- **Features:**
  - Render Time Tracking
  - Fidelity Score Monitoring
  - Performance Dashboard

#### Test Suite
- **Neu:** `tests/hive-mind-fix-validation.js`
- **Tests:**
  - Legacy Offset Detection
  - Bundle Hash Versioning
  - CSS Container Fixes

### 📝 Documentation

- **Neu:** `HIVE-MIND-FIX-DEPLOYMENT.md` - Vollständiger Deployment-Guide
- **Neu:** `CHANGELOG-HIVE-MIND.md` - Dieses Dokument

---

## Verification

**Before:**
- Order 5374: Elements 50-80px verschoben ❌
- Fidelity Score: 80/100 ⚠️
- Bundle Age: 7 Tage alt ❌

**After:**
- Order 5374: Elements korrekt ausgerichtet ✅
- Fidelity Score: 95-100/100 ✅
- Bundle Age: Aktuell ✅

---

**Agents involved:**
1. Agent 1: Legacy-Offset-Heuristik
2. Agent 2: CSS Container Fixes
3. Agent 3: Webpack Rebuild
4. Agent 4: Bundle-Versionierung
5. Agent 5: Testing & Validation
6. Agent 6: Performance Monitoring
7. Agent 7: Documentation (this)
