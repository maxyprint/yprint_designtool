# Canvas Configuration für AllesKlarDruck API

## Übersicht

Die Canvas-Konfiguration ermöglicht es, die Koordinaten-Umrechnung zwischen dem Designer-Canvas und dem tatsächlichen Druckbereich zu konfigurieren. Dies ist essentiell für die korrekte Positionierung von Bildern auf der Druckfläche.

## Problem

Die AllesKlarDruck API benötigt `offsetX` und `offsetY` Parameter in Millimetern, um zu wissen, wo genau auf der Druckfläche ein Bild positioniert werden soll. Der Designer speichert jedoch Positionen in Pixeln relativ zum Canvas.

## Lösung

### Koordinaten-Umrechnung

```php
// Canvas-Koordinaten zu Millimeter umrechnen
$pixel_to_mm_x = $print_area_width_mm / $canvas_width;
$pixel_to_mm_y = $print_area_height_mm / $canvas_height;

// Berechne Position in mm
$offset_x_mm = round($left_px * $pixel_to_mm_x, 1);
$offset_y_mm = round($top_px * $pixel_to_mm_y, 1);
```

### Beispiel

- **Canvas**: 800x600 Pixel
- **Druckbereich**: 200x250mm
- **Position**: left=100px, top=150px
- **Ergebnis**: offsetX=25.0mm, offsetY=62.5mm

## Konfiguration

### WordPress Admin-Einstellungen

Die Canvas-Konfigurationen werden in WordPress-Optionen gespeichert:

```php
// Option: octo_allesklardruck_canvas_configs
$canvas_configs = array(
    'tshirt_001_front' => array(
        'width' => 800,                    // Canvas-Breite in Pixel
        'height' => 600,                   // Canvas-Höhe in Pixel
        'print_area_width_mm' => 200,      // Druckbereich-Breite in mm
        'print_area_height_mm' => 250      // Druckbereich-Höhe in mm
    ),
    'tshirt_001_left' => array(
        'width' => 400,
        'height' => 300,
        'print_area_width_mm' => 80,       // Kleinerer Druckbereich für Ärmel
        'print_area_height_mm' => 100
    )
);
```

### Standard-Konfigurationen

Falls keine spezifische Konfiguration gefunden wird, werden Standardwerte verwendet:

#### T-Shirt Standard
- **Vorder-/Rückseite**: 800x600px → 200x250mm
- **Ärmel**: 400x300px → 80x100mm

#### Hoodie Standard
- **Vorder-/Rückseite**: 800x600px → 200x250mm
- **Ärmel**: 400x300px → 80x100mm

## API-Payload Beispiel

### Vorher (ohne Koordinaten)
```json
{
    "position": "front",
    "width": 35.8,
    "height": 36.6,
    "printFile": "https://..."
}
```

### Nachher (mit Koordinaten)
```json
{
    "position": "front",
    "width": 35.8,
    "height": 36.6,
    "offsetX": 45.2,
    "offsetY": 28.5,
    "printFile": "https://..."
}
```

## Validierung

Die Koordinaten-Umrechnung enthält Validierung:

```php
// Validierung: Position muss im Druckbereich bleiben
$offset_x_mm = max(0, min($offset_x_mm, $print_area_width_mm));
$offset_y_mm = max(0, min($offset_y_mm, $print_area_height_mm));
```

- **Negative Koordinaten**: Werden auf 0 gesetzt
- **Überlaufende Koordinaten**: Werden auf die maximale Druckbereich-Größe begrenzt

## Template-spezifische Konfiguration

Verschiedene Produkte können unterschiedliche Canvas- und Druckbereich-Dimensionen haben:

### T-Shirt
- Canvas: 800x600px
- Druckbereich: 200x250mm (Vorder-/Rückseite), 80x100mm (Ärmel)

### Hoodie
- Canvas: 800x600px
- Druckbereich: 200x250mm (Vorder-/Rückseite), 80x100mm (Ärmel)

### Tasse
- Canvas: 400x400px
- Druckbereich: 80x80mm (zylindrisch)

## Admin-Interface

Das Admin-Interface sollte folgende Einstellungen ermöglichen:

1. **Template-Auswahl**: Welches Produkt-Template
2. **Position**: front, back, left, right
3. **Canvas-Dimensionen**: Breite und Höhe in Pixeln
4. **Druckbereich-Dimensionen**: Breite und Höhe in Millimetern

### Beispiel-Interface

```
Template: T-Shirt Standard
Position: Front
Canvas: 800 x 600 Pixel
Druckbereich: 200 x 250 mm

Template: T-Shirt Standard  
Position: Left Sleeve
Canvas: 400 x 300 Pixel
Druckbereich: 80 x 100 mm
```

## Testen

Verwende die Test-Datei `test_coordinate_conversion.php` um die Koordinaten-Umrechnung zu testen:

```bash
php test_coordinate_conversion.php
```

## Fehlerbehebung

### Häufige Probleme

1. **Falsche Positionierung**: Canvas-Konfiguration überprüfen
2. **Bilder außerhalb des Druckbereichs**: Validierung aktivieren
3. **Fehlende Koordinaten**: Transform-Daten überprüfen

### Debugging

```php
// Debug-Ausgabe aktivieren
$result = $api_integration->convert_canvas_to_print_coordinates($transform_data, $template_id, $position);
error_log('Canvas conversion result: ' . print_r($result, true));
```

## Migration

Für bestehende Bestellungen ohne Koordinaten:

1. **Fallback**: Verwende Standard-Konfiguration
2. **Schätzung**: Verwende Canvas-Mitte als Position
3. **Warnung**: Logge fehlende Koordinaten

```php
// Fallback für fehlende Transform-Daten
if (empty($transform_data)) {
    $transform_data = array(
        'left' => $canvas_width / 2,  // Canvas-Mitte
        'top' => $canvas_height / 2
    );
}
``` 