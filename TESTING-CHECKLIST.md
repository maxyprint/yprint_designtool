# TESTING-CHECKLIST: Coordinate Precision Fixes

**Datum**: 2025-10-03
**Agent**: AGENT 5 - VALIDATION & INTEGRATION TESTING
**Version**: 1.0

---

## Test-Umgebung Setup

### Browser-Matrix
- [ ] **Chrome** (Latest Stable)
- [ ] **Firefox** (Latest Stable)
- [ ] **Safari** (Latest Stable)
- [ ] **Edge** (Latest Stable)

### Test-Environment
- [ ] **Development**: http://localhost/yprint_designtool
- [ ] **Staging**: (falls vorhanden)
- [ ] **Production**: (nach Dev/Staging Tests)

### Pre-Test Setup
1. [ ] Browser-Cache vollständig löschen (Hard Refresh: Cmd+Shift+R / Ctrl+F5)
2. [ ] Console öffnen (F12 → Console Tab)
3. [ ] Network Tab öffnen (für Script-Loading-Prüfung)
4. [ ] Test-User eingeloggt mit Designer-Zugriff

---

## Phase 1: Script-Loading Validierung

### 1.1 Script-File-Existenz
**Ziel**: Verifizieren dass alle Scripts existieren und geladen werden

**Schritte**:
1. [ ] Öffne Designer-Seite mit `[ops-designer]` Shortcode
2. [ ] Öffne Chrome DevTools → Network Tab
3. [ ] Filtere nach "JS" Requests
4. [ ] Verifiziere folgende Scripts werden geladen:

**Expected Results**:
```
✅ view-switch-race-condition-fix.js (Status: 200)
✅ canvas-resize-coordinate-scaling.js (Status: 200)
✅ save-during-load-protection.js (Status: 200)
```

**Actual Results**: _________________________________

**Status**: ⬜ Pass / ⬜ Fail

---

### 1.2 Console-Logging-Check
**Ziel**: Verifizieren dass alle Scripts initialisieren

**Schritte**:
1. [ ] Öffne Browser-Console (F12)
2. [ ] Lade Designer-Seite neu (Hard Refresh)
3. [ ] Suche nach folgenden Console-Logs:

**Expected Console Logs**:
```javascript
🔧 VIEW-SWITCH RACE CONDITION FIX: Initializing...
✅ Designer widget found - applying race condition fix
✅ Race condition fix applied to loadViewImage()

📐 CANVAS-RESIZE COORDINATE SCALING: Initializing...
✅ Canvas resize coordinate scaling initialized
📐 Original canvas dimensions: { width: XXX, height: XXX }

🛡️ SAVE-DURING-LOAD PROTECTION: Initializing...
🛡️ Found X save buttons to protect
✅ Save-during-load protection initialized
```

**Actual Console Output**: _________________________________

**Status**: ⬜ Pass / ⬜ Fail

---

### 1.3 No Console Errors
**Ziel**: Sicherstellen dass keine Script-Errors auftreten

**Schritte**:
1. [ ] Prüfe Console auf rote Error-Messages
2. [ ] Dokumentiere alle gefundenen Errors

**Expected Results**:
```
✅ 0 JavaScript-Errors in Console
✅ Keine 404-Errors für Scripts
✅ Keine Uncaught ReferenceErrors
```

**Actual Results**: _________________________________

**Status**: ⬜ Pass / ⬜ Fail

---

## Phase 2: View-Switch Race Condition Fix Tests

### 2.1 Schneller View-Switch Test
**Ziel**: Verifizieren dass Race Condition behoben ist

**Schritte**:
1. [ ] Öffne Designer mit Multi-View Template (z.B. T-Shirt mit Front/Back)
2. [ ] Lade Design auf "Front" View
3. [ ] **Sofort** während Image lädt → Wechsel zu "Back" View
4. [ ] Prüfe ob Image auf "Back" erscheint (sollte NICHT passieren)

**Expected Results**:
```
✅ Image erscheint NUR auf der ursprünglichen "Front" View
✅ Kein Image auf "Back" View
✅ Console-Log: "🚫 View switched during image load - aborting"
```

**Actual Results**: _________________________________

**Status**: ⬜ Pass / ⬜ Fail

---

### 2.2 Context-Validierung Test
**Ziel**: Prüfen ob Context korrekt gecaptured wird

**Schritte**:
1. [ ] Öffne Designer mit Multi-View Template
2. [ ] Lade mehrere Images auf verschiedene Views
3. [ ] Prüfe Console-Logs für Context-Capture

**Expected Console Logs**:
```javascript
🔍 Loading view image: {
    viewKey: "front",
    variationId: 123,
    capturedContext: { view: "front", variation: 123 }
}
✅ Image loaded and added to canvas: {
    view: "front",
    imageUrl: "..."
}
```

**Actual Console Output**: _________________________________

**Status**: ⬜ Pass / ⬜ Fail

---

### 2.3 Custom Event Dispatch Test
**Ziel**: Verifizieren dass Custom Event gefeuert wird

**Schritte**:
1. [ ] Öffne Console
2. [ ] Führe aus:
```javascript
window.addEventListener('viewSwitchRaceConditionFixed', (e) => {
    console.log('✅ EVENT RECEIVED:', e.detail);
});
```
3. [ ] Lade Designer-Seite neu
4. [ ] Prüfe ob Event in Console erscheint

**Expected Results**:
```
✅ EVENT RECEIVED: {
    widget: [object Object],
    timestamp: "2025-10-03T..."
}
```

**Actual Results**: _________________________________

**Status**: ⬜ Pass / ⬜ Fail

---

## Phase 3: Canvas-Resize Coordinate Scaling Tests

### 3.1 Window-Resize Test
**Ziel**: Prüfen ob Koordinaten bei Resize skaliert werden

**Schritte**:
1. [ ] Öffne Designer mit Canvas
2. [ ] Platziere mehrere Objekte auf Canvas (Text, Shapes, Images)
3. [ ] Notiere Original-Positionen in Console:
```javascript
canvas.getObjects().forEach(obj => {
    console.log(obj.type, 'left:', obj.left, 'top:', obj.top);
});
```
4. [ ] Resize Browser-Window (z.B. von 1920px → 1200px Breite)
5. [ ] Prüfe neue Positionen (sollten proportional skaliert sein)

**Expected Results**:
```
✅ Console-Log: "📐 Canvas resize detected"
✅ Console-Log: "📐 Scaling factors: { scaleX: 0.625, scaleY: 1.0 }"
✅ Console-Log: "✅ Scaled X objects"
✅ Objekt-Positionen proportional angepasst
```

**Actual Results**: _________________________________

**Status**: ⬜ Pass / ⬜ Fail

---

### 3.2 ResizeObserver Test
**Ziel**: Verifizieren dass ResizeObserver aktiv ist (moderne Browser)

**Schritte**:
1. [ ] Öffne Console
2. [ ] Suche nach Log: "👁️ ResizeObserver monitoring canvas resize"
3. [ ] Falls nicht vorhanden → Prüfe ob Fallback aktiv ist

**Expected Results**:
```
✅ "👁️ ResizeObserver monitoring canvas resize" (Chrome/Firefox/Edge)
ODER
✅ Window resize event listener als Fallback (Safari/ältere Browser)
```

**Actual Results**: _________________________________

**Status**: ⬜ Pass / ⬜ Fail

---

### 3.3 Scaling-Metadata Test
**Ziel**: Prüfen ob Scaling-Metadata verfügbar ist

**Schritte**:
1. [ ] Öffne Console
2. [ ] Führe aus:
```javascript
if (window.canvasResizeScaling) {
    const metadata = window.canvasResizeScaling.getScalingMetadata();
    console.log('Scaling Metadata:', metadata);
} else {
    console.error('❌ canvasResizeScaling not exposed');
}
```

**Expected Results**:
```javascript
✅ Scaling Metadata: {
    original_dimensions: { width: XXX, height: XXX },
    current_dimensions: { width: XXX, height: XXX },
    scaling_applied: true/false
}
```

**Actual Results**: _________________________________

**Status**: ⬜ Pass / ⬜ Fail

---

### 3.4 Font-Size Scaling Test
**Ziel**: Verifizieren dass Font-Size bei Text-Objekten skaliert wird

**Schritte**:
1. [ ] Füge Text-Objekt auf Canvas hinzu (z.B. Font-Size: 24px)
2. [ ] Notiere Original Font-Size in Console:
```javascript
const text = canvas.getObjects('i-text')[0];
console.log('Original fontSize:', text.fontSize);
```
3. [ ] Resize Browser-Window
4. [ ] Prüfe neue Font-Size (sollte proportional skaliert sein)

**Expected Results**:
```
✅ Font-Size proportional skaliert (z.B. 24px → 15px bei 0.625x Scale)
✅ Text bleibt lesbar
```

**Actual Results**: _________________________________

**Status**: ⬜ Pass / ⬜ Fail

---

## Phase 4: Save-During-Load Protection Tests

### 4.1 Save-Button-Deaktivierung Test
**Ziel**: Verifizieren dass Save-Buttons während Load deaktiviert werden

**Schritte**:
1. [ ] Öffne Designer-Seite
2. [ ] Triggere Load-Operation (z.B. View-Switch mit großem Image)
3. [ ] **Sofort** versuche auf "Save" / "In Warenkorb" Button zu klicken
4. [ ] Prüfe Button-Status

**Expected Results**:
```
✅ Save-Button disabled während Load (grau ausgegraut)
✅ Button-Text ändert sich zu "Laden..."
✅ Console-Log: "🛡️ Loading started: loadViewImage"
✅ Console-Log: "🛡️ X save buttons disabled"
```

**Actual Results**: _________________________________

**Status**: ⬜ Pass / ⬜ Fail

---

### 4.2 Save-Button-Reaktivierung Test
**Ziel**: Prüfen ob Save-Buttons nach Load wieder aktiviert werden

**Schritte**:
1. [ ] Warte bis Load-Operation abgeschlossen ist
2. [ ] Prüfe Save-Button-Status
3. [ ] Prüfe Console-Logs

**Expected Results**:
```
✅ Save-Button wieder enabled (normal klickbar)
✅ Button-Text zurück zu Original (z.B. "Speichern")
✅ Console-Log: "🛡️ Loading ended: loadViewImage (XXXXms)"
✅ Console-Log: "🛡️ X save buttons enabled"
```

**Actual Results**: _________________________________

**Status**: ⬜ Pass / ⬜ Fail

---

### 4.3 Warning-Message Test
**Ziel**: Prüfen ob User-Warning erscheint bei Save-Versuch während Load

**Schritte**:
1. [ ] Öffne Designer-Seite
2. [ ] Triggere langsame Load-Operation (z.B. großes Image)
3. [ ] **Während Load** → Klicke auf Save-Button
4. [ ] Prüfe ob Warning-Message erscheint

**Expected Results**:
```
✅ Orange Warning-Box erscheint (Top-Right)
✅ Warning-Text: "⚠️ Bitte warten - Das Design wird noch geladen."
✅ Warning verschwindet nach 3 Sekunden automatisch
✅ Console-Log: "🛡️ Save blocked - design is still loading"
```

**Actual Results**: _________________________________

**Status**: ⬜ Pass / ⬜ Fail

---

### 4.4 Global-API Test
**Ziel**: Verifizieren dass Protection-API verfügbar ist

**Schritte**:
1. [ ] Öffne Console
2. [ ] Führe aus:
```javascript
if (window.saveDuringLoadProtection) {
    console.log('✅ Protection API available');
    const isSafe = window.saveDuringLoadProtection.isSafeToSave();
    console.log('Safe to save?', isSafe);
} else {
    console.error('❌ saveDuringLoadProtection not exposed');
}
```

**Expected Results**:
```
✅ Protection API available
Safe to save? true (wenn nicht loading) / false (wenn loading)
```

**Actual Results**: _________________________________

**Status**: ⬜ Pass / ⬜ Fail

---

## Phase 5: Integration Tests

### 5.1 Designer-Widget Initialization Test
**Ziel**: Sicherstellen dass Designer Widget korrekt initialisiert wird

**Schritte**:
1. [ ] Öffne Designer-Seite
2. [ ] Prüfe Console für Widget-Initialization-Logs
3. [ ] Prüfe ob `window.designerWidgetInstance` verfügbar ist

**Expected Results**:
```
✅ Console-Log: "✅ window.fabric ready"
✅ Console-Log: "✅ Designer widget found - applying race condition fix"
✅ window.designerWidgetInstance existiert
```

**Actual Results**: _________________________________

**Status**: ⬜ Pass / ⬜ Fail

---

### 5.2 Fabric.js Availability Test
**Ziel**: Prüfen ob Fabric.js korrekt geladen ist

**Schritte**:
1. [ ] Öffne Console
2. [ ] Führe aus:
```javascript
console.log('Fabric available?', typeof window.fabric !== 'undefined');
console.log('Fabric.Canvas?', typeof window.fabric.Canvas !== 'undefined');
console.log('Fabric.Image?', typeof window.fabric.Image !== 'undefined');
```

**Expected Results**:
```
✅ Fabric available? true
✅ Fabric.Canvas? true
✅ Fabric.Image? true
```

**Actual Results**: _________________________________

**Status**: ⬜ Pass / ⬜ Fail

---

### 5.3 Complete Designer Workflow Test
**Ziel**: End-to-End Test des kompletten Designer-Workflows

**Schritte**:
1. [ ] Öffne Designer mit Template
2. [ ] Füge Text hinzu
3. [ ] Füge Image hinzu
4. [ ] Wechsel View (bei Multi-View Template)
5. [ ] Resize Browser-Window
6. [ ] Speichere Design
7. [ ] Prüfe ob alle Koordinaten korrekt sind

**Expected Results**:
```
✅ Text hinzufügen funktioniert
✅ Image hinzufügen funktioniert
✅ View-Switch ohne Race Condition
✅ Resize skaliert Koordinaten korrekt
✅ Save funktioniert (keine "Invalid input data" Error)
✅ Geladene Design hat korrekte Koordinaten
```

**Actual Results**: _________________________________

**Status**: ⬜ Pass / ⬜ Fail

---

## Phase 6: Regressions-Tests

### 6.1 Existing Designer Functionality Test
**Ziel**: Sicherstellen dass keine bestehende Funktionalität kaputt ist

**Schritte**:
- [ ] Designer lädt korrekt
- [ ] Canvas wird initialisiert
- [ ] Fabric.js funktioniert
- [ ] Text-Tools funktionieren
- [ ] Image-Upload funktioniert
- [ ] Shape-Tools funktionieren
- [ ] Color-Picker funktioniert
- [ ] Undo/Redo funktioniert (falls vorhanden)
- [ ] Zoom funktioniert (falls vorhanden)
- [ ] Layer-Management funktioniert (falls vorhanden)

**Status**: ⬜ Pass / ⬜ Fail

---

### 6.2 No New Console Errors Test
**Ziel**: Prüfen dass keine neuen Errors eingeführt wurden

**Schritte**:
1. [ ] Öffne Designer-Seite
2. [ ] Nutze Designer für 5 Minuten (normale Workflows)
3. [ ] Prüfe Console auf neue Errors

**Expected Results**:
```
✅ 0 neue JavaScript-Errors
✅ 0 neue 404-Errors
✅ 0 neue Uncaught Exceptions
```

**Actual Results**: _________________________________

**Status**: ⬜ Pass / ⬜ Fail

---

### 6.3 Performance Test
**Ziel**: Verifizieren dass Performance nicht degradiert ist

**Schritte**:
1. [ ] Öffne Chrome DevTools → Performance Tab
2. [ ] Starte Recording
3. [ ] Führe typischen Designer-Workflow aus (Add Text, Add Image, Move, Save)
4. [ ] Stoppe Recording
5. [ ] Analysiere Performance-Metrics

**Expected Results**:
```
✅ Page Load Time: < 3 Sekunden
✅ Script Execution Time: < 500ms zusätzlich
✅ Rendering Time: Keine Lags/Stutters
✅ Memory Usage: Kein Memory Leak
```

**Actual Results**: _________________________________

**Status**: ⬜ Pass / ⬜ Fail

---

## Phase 7: Cross-Browser Compatibility Tests

### 7.1 Chrome Test
**Browser**: Google Chrome (Latest Stable)

**Schritte**:
- [ ] Alle Phase 2-6 Tests wiederholen

**Status**: ⬜ Pass / ⬜ Fail

**Notes**: _________________________________

---

### 7.2 Firefox Test
**Browser**: Mozilla Firefox (Latest Stable)

**Schritte**:
- [ ] Alle Phase 2-6 Tests wiederholen

**Status**: ⬜ Pass / ⬜ Fail

**Notes**: _________________________________

---

### 7.3 Safari Test
**Browser**: Apple Safari (Latest Stable)

**Schritte**:
- [ ] Alle Phase 2-6 Tests wiederholen
- [ ] Besonders ResizeObserver Fallback testen (Safari hat späte Unterstützung)

**Status**: ⬜ Pass / ⬜ Fail

**Notes**: _________________________________

---

### 7.4 Edge Test
**Browser**: Microsoft Edge (Latest Stable)

**Schritte**:
- [ ] Alle Phase 2-6 Tests wiederholen

**Status**: ⬜ Pass / ⬜ Fail

**Notes**: _________________________________

---

## Acceptance Criteria

### Must-Have (Blocking)
- [ ] ✅ Alle 3 Scripts laden ohne 404-Errors
- [ ] ✅ Keine JavaScript-Console-Errors
- [ ] ✅ View-Switch Race Condition behoben
- [ ] ✅ Canvas-Resize skaliert Koordinaten korrekt
- [ ] ✅ Save-Buttons werden während Load deaktiviert
- [ ] ✅ Keine Regressions in existierender Designer-Funktionalität

### Should-Have (Nice-to-Have)
- [ ] ✅ Custom Events funktionieren korrekt
- [ ] ✅ Global APIs (window.canvasResizeScaling, etc.) verfügbar
- [ ] ✅ Warning-Messages bei Save-Versuch während Load
- [ ] ✅ Performance nicht degradiert

### Could-Have (Optional)
- [ ] ✅ ResizeObserver funktioniert in allen Browsern
- [ ] ✅ Font-Size Scaling perfekt proportional
- [ ] ✅ Save-Button Selektoren finden alle möglichen Buttons

---

## Test-Zusammenfassung

**Test-Datum**: _________________________________

**Getestet von**: _________________________________

**Browser**: _________________________________

**Gesamt-Status**:
- [ ] ✅ **PASS** - Alle Tests bestanden
- [ ] ⚠️ **PASS WITH WARNINGS** - Tests bestanden mit kleineren Issues
- [ ] ❌ **FAIL** - Kritische Tests fehlgeschlagen

**Gefundene Issues**: _________________________________

**Blocking Issues**: _________________________________

**Action Items**: _________________________________

---

## Sign-Off

**Tester**: _________________________ Datum: _____________

**Technical Lead**: _________________________ Datum: _____________

**Product Owner**: _________________________ Datum: _____________

---

**Status**: ⬜ Ready for Production / ⬜ Needs Fixes / ⬜ Blocked
