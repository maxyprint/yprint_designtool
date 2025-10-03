# 🐛 Offset-Bug: Visuell korrekt platziert, aber falsch gespeichert

**Datum:** 2025-10-03
**Status:** 🔍 Investigation Required
**Symptom:** Logo wird visuell korrekt platziert, aber 20-50px verschoben gespeichert
**Auswirkung:** Vorschau zeigt nicht die Position, die im Designer sichtbar war

---

## 📋 Problembeschreibung (User Report)

### Was genau passiert

Der Benutzer zieht das kleine YPrint-Logo im Designer genau an die gewünschte Stelle, nämlich auf die **obere rechte Ecke des großen YLife-Logos**. Die visuelle Absicht ist klar und korrekt.

In dem Moment, in dem die Maustaste losgelassen wird, um das Logo zu platzieren, speichert das System aber eine Koordinate, die sagt: **"Das kleine Logo befindet sich 20-50 Pixel über dem großen Logo"**.

Das Ergebnis ist eine **exakte Speicherung einer falschen Position**. Die Vorschau zeigt dann diese falsche Position korrekt an, weshalb sie nicht mit dem übereinstimmt, was der Benutzer im Designer gesehen hat.

### Woran es liegt (User-Verständnis)

Es liegt an einem **"Messfehler"** im Programm – wie ein falsch angelegtes Maßband.

**Analogie:**
Stellen Sie sich vor, Ihr Design-Bereich (der Canvas) liegt in einem größeren Rahmen, der oben einen **5 cm breiten Rand** hat.

Wenn Sie nun etwas **15 cm vom oberen Rand des Bildes** platzieren, misst das Programm fälschlicherweise vom oberen Rand des **Rahmens** und zieht die 5 cm Rand ab. Es speichert also **10 cm** (15 cm - 5 cm).

**Genau das passiert hier:**
Die Software misst die Position des Logos nicht vom Rand des eigentlichen Design-Bereichs (Canvas), sondern vom Rand eines größeren, äußeren Containers. Den Abstand dieses Containers zieht sie fälschlicherweise von der echten Koordinate ab.

Weil dieser "Rahmen" je nach Fenstergröße mal breiter und mal schmaler ist, war der Fehler:
- Manchmal **50 Pixel** (Desktop)
- Manchmal **26,1 Pixel** (Breakpoint bei ~950px Viewport)
- Manchmal **0 Pixel** (Mobile)

---

## 🔍 Technische Analyse

### Erwartetes Verhalten

1. Benutzer platziert Logo visuell bei **Koordinate X**
2. `object:modified` Event feuert
3. Fabric.js liefert korrekte Canvas-relative Koordinate: **X**
4. System speichert: **X**
5. Vorschau lädt Koordinate **X** → Logo erscheint an gleicher Stelle ✅

### Tatsächliches Verhalten (Bug)

1. Benutzer platziert Logo visuell bei **Koordinate X**
2. `object:modified` Event feuert
3. Fabric.js liefert korrekte Canvas-relative Koordinate: **X**
4. ❌ **System berechnet:** `gespeicherte_koordinate = X - container_offset`
5. System speichert: **X - 50px** (oder X - 26.1px je nach Viewport)
6. Vorschau lädt Koordinate **X - 50px** → Logo erscheint 50px verschoben ❌

---

## 🧩 Mögliche Root Causes

### Hypothese 1: Offset-Subtraktion im Event Handler

**Verdacht:**
Der `object:modified` Event-Handler könnte immer noch eine Offset-Berechnung durchführen, obwohl SSOT v2.0 das entfernt haben sollte.

**Zu prüfen:**
- Gibt es noch alte Code-Reste, die `getCanvasOffset()` aufrufen?
- Wird `getBoundingClientRect()` irgendwo auf den falschen Container angewendet?
- Gibt es eine Transformation/Subtraktion zwischen Fabric.js-Koordinaten und gespeicherten Koordinaten?

**Dateien:**
- `public/js/dist/designer.bundle.js` → `object:modified` Handler
- Funktion `updateImageTransform()` → Zeile ~1326-1343

### Hypothese 2: Legacy-Datenkorrektur greift fälschlicherweise

**Verdacht:**
Die `applyLegacyDataCorrection()` Funktion könnte bei **neuen** Designs fälschlicherweise einen Offset subtrahieren.

**Zu prüfen:**
- Wird `applyLegacyDataCorrection()` auch bei brandneuen Designs aufgerufen?
- Erkennt die Funktion korrekt, ob Daten "alt" (SSOT v1.0) oder "neu" (SSOT v2.0) sind?
- Gibt es Konsolenlogs, die zeigen, ob die Korrektur angewendet wird?

**Dateien:**
- `public/js/dist/designer.bundle.js` → `applyLegacyDataCorrection()`
- Check: Wird Funktion nur für alte Designs aufgerufen?

### Hypothese 3: Speicherpfad verwendet andere Koordinatenquelle

**Verdacht:**
Beim Speichern wird nicht die Fabric.js-Koordinate aus dem `variationImages` Map verwendet, sondern eine zweite Datenquelle mit falschem Offset.

**Zu prüfen:**
- Von wo liest `saveDesign()` die Koordinaten?
- Gibt es mehrere Datenquellen (z.B. DOM-Attribute, versteckte Input-Felder)?
- Werden Koordinaten doppelt gespeichert (einmal korrekt, einmal falsch)?

**Dateien:**
- `public/js/dist/designer.bundle.js` → `saveDesign()` Funktion
- Check: Welche Variable wird tatsächlich an Backend gesendet?

### Hypothese 4: PHP Backend/Vorschau rechnet Offset hinzu

**Verdacht:**
Das Backend oder die Vorschau-Generierung fügt fälschlicherweise einen Offset **hinzu**, weil es annimmt, die Koordinaten seien container-relativ (SSOT v1.0 Format).

**Zu prüfen:**
- Gibt es PHP-Code, der Koordinaten transformiert?
- Wird in der Vorschau-Generierung ein Offset addiert/subtrahiert?
- Erkennt das Backend, ob Koordinaten im SSOT v1.0 oder v2.0 Format vorliegen?

**Dateien:**
- PHP Backend: Design-Speicher-Logik
- Vorschau-Generator: Koordinaten-Rendering

---

## 🧪 Debugging-Plan für morgen

### Phase 1: Console Log Verification

**Ziel:** Genau feststellen, welche Koordinaten wo gespeichert werden

1. **Im Designer platzieren:**
   - YPrint-Logo auf obere rechte Ecke von YLife-Logo ziehen
   - Console Log prüfen: "📐 SSOT: Updated native coordinates"
   - ✅ **Erwartung:** `left: X, top: Y` (z.B. 158px)

2. **Design speichern:**
   - "Speichern"-Button klicken
   - Console Log prüfen: "📐 SSOT: Stored native Fabric.js coordinates"
   - ❌ **Aktuell:** `left: X - 50, top: Y` (z.B. 108px statt 158px)
   - ✅ **Soll:** `left: X, top: Y` (gleich wie Step 1)

3. **Network Tab prüfen:**
   - Payload der AJAX-Anfrage analysieren
   - Welche Koordinaten werden tatsächlich an Backend gesendet?

### Phase 2: Code Trace

**Ziel:** Exakte Zeile finden, wo Offset subtrahiert wird

1. **Event Handler analysieren:**
   ```javascript
   // Suche nach:
   canvas.on('object:modified', function(e) {
     var img = e.target;
     updateImageTransform(img, viewKey); // ← Hier passiert Update
   });
   ```

2. **updateImageTransform() analysieren:**
   ```javascript
   // Prüfen ob hier irgendwo subtrahiert wird:
   imageData.transform.left = img.left - ???;  // ❌ Sollte nicht existieren
   imageData.transform.left = img.left;        // ✅ Sollte so sein
   ```

3. **saveDesign() analysieren:**
   ```javascript
   // Prüfen welche Datenquelle verwendet wird:
   var coordinates = ???;  // Woher kommen die Koordinaten?
   ```

### Phase 3: Legacy Correction Check

**Ziel:** Sicherstellen, dass `applyLegacyDataCorrection()` nicht fälschlicherweise greift

1. **Funktion finden und Console Logs hinzufügen:**
   ```javascript
   function applyLegacyDataCorrection(imageData, viewKey) {
     console.log('🔧 LEGACY CORRECTION APPLIED', imageData);
     // ...
   }
   ```

2. **Testen:**
   - Neues Design erstellen
   - Logo platzieren
   - Speichern
   - ❌ **Wenn Log erscheint:** Bug! Legacy-Korrektur sollte nicht bei neuen Designs laufen
   - ✅ **Wenn kein Log:** Legacy-Korrektur ist nicht die Ursache

### Phase 4: Backend/Vorschau Check

**Ziel:** Ausschließen, dass Backend die Koordinaten verändert

1. **Database Query nach Speichern:**
   ```sql
   SELECT * FROM designs WHERE id = [latest_design_id];
   ```
   - Sind Koordinaten in DB korrekt (X) oder falsch (X - 50)?

2. **Vorschau-Generator analysieren:**
   - PHP Code finden, der Koordinaten für Vorschau verwendet
   - Wird dort addiert/subtrahiert?

---

## 📊 Bekannte Informationen

### Aus vorheriger 29px-Bug-Analyse

**Root Cause (bereits gefixt in SSOT v2.0):**
- Zeile 931: `getCanvasOffset()` verwendete `.designer-editor` statt `.designer-canvas-container`
- Container hatte 50px responsive Padding (Desktop) / 0px (Mobile) / 26.1px (Breakpoint)
- **Fix:** Komplette Entfernung von `getCanvasOffset()` und Offset-Berechnungen

**Aktueller SSOT v2.0 Code sollte:**
- ✅ Fabric.js Koordinaten direkt speichern (AS-IS)
- ✅ Keine Subtraktionen/Additionen durchführen
- ✅ Keine Container-Offsets berechnen

### Warum tritt der Bug trotzdem auf?

**Möglichkeit A:** Code-Reste
Ein alter Code-Pfad wurde übersehen und führt immer noch Offset-Berechnungen durch.

**Möglichkeit B:** Doppelte Datenquelle
Es gibt zwei Speicherorte für Koordinaten, und der falsche wird beim Speichern verwendet.

**Möglichkeit C:** Backend-Problem
Das Frontend speichert korrekt, aber Backend oder Vorschau-Generator transformiert die Daten.

---

## ✅ Erfolgs-Kriterien

### Bug ist gefixt, wenn:

1. **Designer-Platzierung:**
   - Logo wird bei Koordinate `X, Y` platziert
   - Console Log zeigt: `left: X, top: Y`

2. **Speichern:**
   - Console Log zeigt: `left: X, top: Y` (exakt gleich wie #1)
   - Network Tab zeigt: Payload enthält `left: X, top: Y`
   - Database enthält: `left: X, top: Y`

3. **Vorschau:**
   - Logo erscheint an exakt gleicher Position wie im Designer
   - Kein Offset von 20-50px sichtbar

---

## 🚨 Wichtige Hinweise für morgen

1. **NICHT raten** – Nur durch Console Logs und Code-Trace arbeiten
2. **Jede Transformation dokumentieren** – Wo ändert sich die Koordinate?
3. **Beide Pfade prüfen** – Speichern UND Laden
4. **Database-Werte verifizieren** – Was steht wirklich in der DB?

---

**Next Session:** 2025-10-04
**Ziel:** Root Cause identifizieren und fixen
**Methode:** 7-Agent forensische Analyse mit Master-Prompt

---

**Status:** 📝 Dokumentiert, bereit für Investigation
