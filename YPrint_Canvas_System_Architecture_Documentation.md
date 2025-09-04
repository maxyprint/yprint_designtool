# YPrint Canvas-System Architektur

## 🎯 Übersicht

Diese Dokumentation beschreibt die neue Canvas-System Architektur, die das fundamentale Canvas/Responsiveness Problem löst. Das System implementiert relative Koordinaten, Canvas-Kontextualisierung und zweistufige Skalierung.

## ❌ Gelöste Probleme

### 1. Canvas-Agnostic Pixel-Messungen
**Problem**: Absolute Pixel-Werte variieren je nach Device
- Desktop: 800x600px Canvas → Messung: 154px
- Tablet: 600x450px Canvas → Gleiche Messung: ~115px  
- Mobile: 300x225px Canvas → Gleiche Messung: ~58px

**Lösung**: Relative Koordinaten (0.0-1.0)
- Desktop: 154px / 800px = 0.1925 (19.25% der Canvas-Breite)
- Tablet: 115px / 600px = 0.1917 (≈19.25% der Canvas-Breite)
- Mobile: 58px / 300px = 0.1933 (≈19.25% der Canvas-Breite)

### 2. Fehlende Design-Zeit Referenz
**Problem**: System kennt nicht die Canvas-Größe zur Messzeit
**Lösung**: Canvas-Kontext als Template-Metadaten speichern

### 3. Runtime-Canvas ignoriert
**Problem**: Aktueller Browser-Canvas wird nicht berücksichtigt
**Lösung**: Dynamische Canvas-Skalierung berechnen

### 4. Produktdimensionen-Context verloren
**Problem**: Daten existieren aber erreichen Berechnungslogik nicht
**Lösung**: Master-Measurement System mit physischen Referenzen

## 🏗️ System-Architektur

### 1. Canvas-Kontextualisierung

#### Backend: `store_design_canvas_context()`
```php
public function store_design_canvas_context($template_id, $canvas_width, $canvas_height) {
    $canvas_context = array(
        'design_canvas_width' => $canvas_width,
        'design_canvas_height' => $canvas_height,
        'timestamp' => current_time('mysql'),
        'device_type' => $this->detect_device_type($canvas_width, $canvas_height)
    );
    
    return update_post_meta($template_id, '_design_canvas_context', $canvas_context);
}
```

#### Frontend: `getCurrentCanvasDimensions()`
```javascript
getCurrentCanvasDimensions() {
    const canvas = document.querySelector('.fabric-canvas-wrapper canvas') || 
                  document.querySelector('canvas') ||
                  document.querySelector('.design-canvas');
    
    if (canvas) {
        const width = canvas.offsetWidth || canvas.width || 800;
        const height = canvas.offsetHeight || canvas.height || 600;
        return { width, height, element: canvas };
    }
    
    return { width: 800, height: 600, element: null };
}
```

### 2. Relative Koordinaten-Normalisierung

#### Pixel → Relativ
```php
public function normalize_coordinates_to_relative($pixel_x, $pixel_y, $canvas_width, $canvas_height) {
    $relative_x = round($pixel_x / $canvas_width, 6);
    $relative_y = round($pixel_y / $canvas_height, 6);
    
    // Sicherheitsclipping auf 0.0-1.0 Bereich
    $relative_x = max(0.0, min(1.0, $relative_x));
    $relative_y = max(0.0, min(1.0, $relative_y));
    
    return array('x' => $relative_x, 'y' => $relative_y);
}
```

#### Relativ → Pixel
```php
public function denormalize_coordinates_to_pixels($relative_x, $relative_y, $current_canvas_width, $current_canvas_height) {
    $pixel_x = round($relative_x * $current_canvas_width, 2);
    $pixel_y = round($relative_y * $current_canvas_height, 2);
    
    return array('x' => $pixel_x, 'y' => $pixel_y);
}
```

### 3. Master-Measurement System

#### Konzept
- **Eine Referenz-Messung pro Template** definiert den Grundmaßstab
- Alle anderen Messungen als Verhältnisse zur Master-Measurement
- Größenspezifische Anpassung über Produktdimensionen-Multiplikatoren

#### Implementation
```php
public function set_master_measurement($template_id, $measurement_type, $relative_distance, $physical_distance_cm) {
    $master_measurement = array(
        'measurement_type' => $measurement_type,
        'relative_distance' => $relative_distance,
        'physical_distance_cm' => $physical_distance_cm,
        'pixels_per_cm_ratio' => $relative_distance > 0 ? ($physical_distance_cm / $relative_distance) : 0,
        'timestamp' => current_time('mysql'),
        'status' => 'active'
    );
    
    return update_post_meta($template_id, '_master_measurement', $master_measurement);
}
```

### 4. Zweistufige Skalierung

#### Stufe 1: Canvas-Normalisierung
- Pixel-Koordinaten → Relative Koordinaten (0.0-1.0)
- Device-unabhängiger Speicherformat

#### Stufe 2: Physische Skalierung  
- Relative Koordinaten → Physische mm-Werte
- Größenspezifische Anpassung basierend auf Produktdimensionen

```php
public function convert_measurement_with_two_stage_scaling($measurement_data, $template_id, $size_name) {
    // Stufe 1: Canvas-Normalisierung
    $relative_coords = $this->normalize_measurement_coordinates($measurement_data);
    
    // Stufe 2: Physische Skalierung
    $physical_coords = $this->apply_physical_scaling($relative_coords, $template_id, $size_name);
    
    return $physical_coords;
}
```

### 5. Canvas-Skalierung

#### Design-Canvas vs. Runtime-Canvas
```php
public function calculate_canvas_scaling_ratio($template_id, $current_canvas_width, $current_canvas_height) {
    $canvas_context = get_post_meta($template_id, '_design_canvas_context', true);
    
    $design_width = $canvas_context['design_canvas_width'];
    $design_height = $canvas_context['design_canvas_height'];
    
    $width_ratio = $current_canvas_width / $design_width;
    $height_ratio = $current_canvas_height / $design_height;
    
    return array(
        'width_ratio' => $width_ratio,
        'height_ratio' => $height_ratio,
        'design_canvas' => array('width' => $design_width, 'height' => $design_height),
        'current_canvas' => array('width' => $current_canvas_width, 'height' => $current_canvas_height)
    );
}
```

## 📊 Datenstrukturen

### Canvas-Kontext (Meta: `_design_canvas_context`)
```json
{
    "design_canvas_width": 800,
    "design_canvas_height": 600,
    "timestamp": "2024-12-19 15:30:00",
    "device_type": "desktop"
}
```

### Master-Measurement (Meta: `_master_measurement`)
```json
{
    "measurement_type": "chest",
    "relative_distance": 0.25,
    "physical_distance_cm": 96,
    "pixels_per_cm_ratio": 384,
    "timestamp": "2024-12-19 15:30:00",
    "status": "active"
}
```

### Erweiterte Messungsdaten
```json
{
    "measurement_type": "chest",
    "pixel_distance": 200,
    "start_point": {"x": 100, "y": 150},
    "end_point": {"x": 300, "y": 150},
    "relative_start_point": {"x": 0.125, "y": 0.25},
    "relative_end_point": {"x": 0.375, "y": 0.25},
    "relative_distance": 0.25,
    "physical_distance_cm": 96,
    "size_adjustment_factor": 1.0625,
    "canvas_context": {
        "canvas_width": 800,
        "canvas_height": 600,
        "device_type": "desktop",
        "timestamp": "2024-12-19 15:30:00"
    }
}
```

## 🔄 Datenfluss

### Speichern (Frontend → Backend)
1. **Frontend**: Erfasse Canvas-Dimensionen
2. **Frontend**: Konvertiere Pixel → Relative Koordinaten
3. **Frontend**: Erweitere Messung mit Canvas-Kontext
4. **Backend**: Speichere Canvas-Kontext als Template-Meta
5. **Backend**: Speichere Messung mit relativen Koordinaten

### Laden (Backend → Frontend)
1. **Backend**: Lade gespeicherte relative Koordinaten
2. **Frontend**: Erfasse aktuelle Canvas-Dimensionen
3. **Frontend**: Konvertiere Relative → Pixel Koordinaten
4. **Frontend**: Zeige Messungen auf aktuellem Canvas an

### API-Übertragung (Bestellung → Druckerei)
1. **Backend**: Lade relative Koordinaten
2. **Backend**: Hole Master-Measurement für Referenz
3. **Backend**: Berechne physische Dimensionen
4. **Backend**: Wende größenspezifische Anpassung an
5. **API**: Übertrage mm-Werte an AllesKlarDruck

## 🧪 Test-System

### Test-Datei: `test_canvas_system_architecture.php`

#### Test-Bereiche:
1. **Canvas-Kontextualisierung**: Verschiedene Device-Größen
2. **Koordinaten-Normalisierung**: Pixel ↔ Relativ Konvertierung
3. **Master-Measurement**: Referenz-System
4. **Zweistufige Skalierung**: Canvas + Physische Skalierung
5. **Device-Responsiveness**: Cross-Device Konsistenz
6. **System-Integration**: End-to-End Validierung

#### Ausführung:
```bash
php test_canvas_system_architecture.php
```

## 📋 AJAX-Endpunkte

### Neue Endpunkte:
- `set_master_measurement`: Master-Measurement setzen
- `debug_canvas_system`: Canvas-System Debug-Info

### Erweiterte Endpunkte:
- `save_measurement_to_database`: Jetzt mit Canvas-Kontextualisierung
- `load_saved_measurements`: Jetzt mit Display-Konvertierung

## 🔧 Frontend-Integration

### Canvas-Kontext erfassen:
```javascript
const canvasInfo = this.getCurrentCanvasDimensions();
measurementData.canvas_width = canvasInfo.width;
measurementData.canvas_height = canvasInfo.height;
```

### Koordinaten normalisieren:
```javascript
measurementData.relative_start_point = this.pixelToRelativeCoordinates(
    measurementData.start_point.x,
    measurementData.start_point.y,
    canvasInfo.width,
    canvasInfo.height
);
```

### Display-Messungen laden:
```javascript
const displayMeasurements = this.loadMeasurementsForCurrentCanvas(savedMeasurements);
```

## ✅ Erwartete Ergebnisse

### Vor der Implementierung:
- Skalierungsfaktoren: `[]` (leer)
- Koordinaten: Absolute Pixel-Werte
- Device-Inkonsistenz: Verschiedene Pixel-Werte für gleiche Messung

### Nach der Implementierung:
- Skalierungsfaktoren: Basierend auf Master-Measurement
- Koordinaten: Relative Werte (0.0-1.0)
- Device-Konsistenz: Gleiche relative Werte auf allen Devices

### System-Status:
- ✅ Canvas-Kontextualisierung: Aktiv
- ✅ Relative Koordinaten: Implementiert
- ✅ Master-Measurement: Verfügbar
- ✅ Zweistufige Skalierung: Funktional
- ✅ Device-Responsiveness: Gelöst

## 🚀 Nächste Schritte

1. **Test ausführen**: `php test_canvas_system_architecture.php`
2. **Frontend testen**: Canvas-Dimensionen und Normalisierung
3. **Master-Measurement setzen**: Für bestehende Templates
4. **Migration**: Bestehende Messungen zu relativem Format
5. **Produktions-Deployment**: Nach erfolgreichen Tests

---

**Datum**: 2024-12-19
**Version**: 1.0.0
**Status**: Implementiert und bereit für Tests
