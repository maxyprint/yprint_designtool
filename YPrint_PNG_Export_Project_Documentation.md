# YPrint PNG-Export System - Projektdokumentation und Aktionsplan

## 1. Statusbericht (2025-10-29)

### 1.1 Aktuelle Systemstabilität
* **Prozesskette:** 100% stabil. AJAX, Server-Speicherung und Fallback-Trigger funktionieren.
* **Aktueller Fehler:** **Inhalt-Pipeline defekt.** Der Export enthält das View-Bild/Mockup und ignoriert den Druckbereich.

### 1.2 Verbleibende Kritische Mängel
| Mangel | Ursache | Zuständige Logik | Priorität |
| :--- | :--- | :--- | :--- |
| **A: View-Bild-Kontamination** | Filter-Heuristik greift beim Mockup nicht. | `save-only-png-generator.js` (Objekt-Filter-Loop) | Hoch |
| **B: Falscher Druckbereich** | Koordinaten des geklonten Objekts werden nicht relativ zum Druckbereich gesetzt. | `save-only-png-generator.js` (Klon-Callback-Logik) | Hoch |

## 2. Aktionsplan: Finale Behebung

| ID | Beschreibung | Verantwortliche Funktion | Ziel-Ergebnis |
| :--- | :--- | :--- | :--- |
| **A-1** | **Filter-Verbesserung:** Mockup-Objekte durch **Größen-/SRC-Prüfung** ausschließen. | `forEach` Filter-Loop | View-Bild im Export eliminiert. |
| **B-1** | **Koordinaten-Relativierung:** Klon-Objekt-Position korrigieren, um es relativ zum Nullpunkt des Druckbereichs zu positionieren. | `obj.clone(callback)` | Exaktes Cropping auf den Druckbereich. |

## 3. Change Log (Ab 2025-10-29)

**AB SOFORT MUSS JEDE ÄNDERUNG HIER PROTOKOLLIERT WERDEN, BEVOR SIE DEPLOYED WIRD.**

| Datum | ID | Datei | Beschreibung der Änderung | Ergebnis / Status |
| :--- | :--- | :--- | :--- | :--- |
| 2025-10-29 | DOC-1 | YPrint_PNG_Export_Project_Documentation.md | Erstellung der Projektdokumentation und Change Log Struktur | ✅ Erstellt |
| 2025-10-29 | A-1 | save-only-png-generator.js | **Filter-Verbesserung**: Mockup-Objekte durch Größen-/SRC-Prüfung ausschließen. Erweiterte Heuristik mit Canvas-Größenverhältnis (80%+), Oversized-Filter (1000x1000+) und Source-basierten Checks (mockup/shirt/view/template). | ✅ Implementiert |
| 2025-10-29 | B-1 | save-only-png-generator.js | **Koordinaten-Relativierung**: Temporary Canvas auf Print-Area-Dimensionen gesetzt. Klon-Objekt-Position korrigiert durch Relativierung zum Print-Area-Nullpunkt (newLeft = obj.left - printArea.x). | ✅ Implementiert |
| 2025-10-29 | A-1-V2 | save-only-png-generator.js | **VALIDIERTE Filter-Logik**: Kontextuelle 4-Schicht-Filterung implementiert. Layer 1: Explicit flags, Layer 2: Position-based (außerhalb Design-Area), Layer 3: Smart filename analysis, Layer 4: Adaptive size filter. Eliminiert False Positives für legitime Designs. | ✅ Implementiert |
| 2025-10-29 | B-1-V2 | save-only-png-generator.js | **VALIDIERTE Transformation**: Vollständige Objekt-Zustand-Erhaltung mit scaleX/Y, angle, flip, skew, opacity. Transformationen werden vor Koordinaten-Relativierung kopiert. | ✅ Implementiert |
| 2025-10-29 | VAL-1 | save-only-png-generator.js | **PrintArea-Validierung**: validatePrintAreaCoordinates() Funktion implementiert. Prüft numerische Korrektheit, positive Werte und Canvas-Grenzen-Compliance. Verhindert systematische Export-Verschiebungen. | ✅ Implementiert |
| 2025-10-29 | RACE-1 | save-only-png-generator.js | **Race Condition Fix**: Queue-System für mehrfache Save-Requests implementiert. SaveQueue verhindert parallele Generierungen und verarbeitet Anfragen sequenziell. Timeout von 5s auf 10s erhöht für komplexe Designs. | ✅ Implementiert |