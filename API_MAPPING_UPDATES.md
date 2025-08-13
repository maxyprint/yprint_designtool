# API Mapping Updates - AllesKlarDruck Integration

## 📋 Übersicht

Diese Dokumentation beschreibt die neuen API-Mapping-Funktionen, die implementiert wurden, um die YPrint-Integration mit der AllesKlarDruck API zu verbessern und API-konforme Werte zu gewährleisten.

## 🔧 Implementierte Änderungen

### 1. Produkttyp-Mapping (`map_product_type`)

**Zweck:** Konvertiert YPrint-Produkttypen in API-konforme Werte

**Mapping-Tabelle:**
| YPrint Produkttyp | AllesKlarDruck API | Beschreibung |
|-------------------|-------------------|--------------|
| "T-Shirt" | "TSHIRT" | Standard T-Shirts |
| "Hoodie" | "HOODIE" | Kapuzenpullover |
| "Zipper" | "ZIPPER_JACKET" | Zip-Hoodies |
| "Polo" | "POLO" | Polo-Shirts |
| "Longsleeve" | "LONG_SLEEVE" | Langarm-Shirts |

**Fallback:** "TSHIRT" für unbekannte Typen

### 2. Druckmethoden-Mapping (`map_print_method`)

**Zweck:** Konvertiert YPrint-Druckmethoden in API-konforme Werte

**Mapping-Tabelle:**
| YPrint Methode | AllesKlarDruck API | Beschreibung |
|----------------|-------------------|--------------|
| "DTG" | "DTG" | Direct-to-Garment |
| "DTF" | "DTF" | Direct-to-Film |
| "Siebdruck" | "SCREEN" | Screen Printing |

**Fallback:** "DTG" für unbekannte Methoden

### 3. ReferencePoint Integration

**Zweck:** Definiert den Referenzpunkt für die Druckpositionierung

**Aktueller Wert:** "center" (Mitte des Druckbereichs)

**Weitere Optionen (je nach API-Dokumentation):**
- "top-left" - Oben links
- "top-center" - Oben mittig
- "top-right" - Oben rechts

### 4. PreviewUrl Integration

**Zweck:** Fügt Vorschau-URLs für bessere Qualitätskontrolle hinzu

**Format:** `https://yprint.de/wp-content/uploads/octo-print-designer/previews/{design_id}/{preview-filename}.png`

## 📄 Aktualisierte JSON-Struktur

```json
{
    "orderNumber": "5338",
    "orderDate": "2025-07-22T10:59:48+00:00",
    "shipping": {
        "recipient": {
            "name": "Liefer Adresse",
            "street": "Liefer Adresse",
            "city": "Schwebheim",
            "postalCode": "97525",
            "country": "DE"
        },
        "sender": {
            "name": "YPrint",
            "street": "Rottendorfer Straße 35A",
            "city": "Würzburg",
            "postalCode": "97074",
            "country": "DE"
        }
    },
    "orderPositions": [
        {
            "printMethod": "DTG",
            "manufacturer": "yprint",
            "series": "SS25",
            "color": "Black",
            "type": "TSHIRT",
            "size": "L",
            "quantity": 1,
            "printPositions": [
                {
                    "position": "front",
                    "width": 35.8,
                    "height": 36.6,
                    "unit": "cm",
                    "offsetX": 82.3,
                    "offsetY": 70,
                    "offsetUnit": "cm",
                    "referencePoint": "center",
                    "printFile": "https://yprint.de/wp-content/uploads/octo-print-designer/user-images/17/cool-profile-picture-paper-bag-head-4co57dtwk64fb7lv.jpg",
                    "previewUrl": "https://yprint.de/wp-content/uploads/octo-print-designer/previews/17/shirt-preview-front-5338.png"
                }
            ]
        }
    ]
}
```

## 🔄 Code-Änderungen

### 1. Neue Mapping-Funktionen

```php
/**
 * Map YPrint product type to AllesKlarDruck API product type
 */
private function map_product_type($yprint_type) {
    $type_mapping = array(
        'T-Shirt' => 'TSHIRT',
        'Hoodie' => 'HOODIE',
        'Zipper' => 'ZIPPER_JACKET',
        'Polo' => 'POLO',
        'Longsleeve' => 'LONG_SLEEVE'
    );
    
    return isset($type_mapping[$yprint_type]) ? $type_mapping[$yprint_type] : 'TSHIRT';
}

/**
 * Map YPrint print method to AllesKlarDruck API print method
 */
private function map_print_method($yprint_method) {
    $method_mapping = array(
        'DTG' => 'DTG',
        'DTF' => 'DTF',
        'Siebdruck' => 'SCREEN'
    );
    
    return isset($method_mapping[$yprint_method]) ? $method_mapping[$yprint_method] : 'DTG';
}
```

### 2. Aktualisierte get_product_mapping Funktion

```php
private function get_product_mapping($template_id = null, $product_id = null, $variation_id = 0) {
    // ... bestehender Code ...
    
    $template_mappings[$mapping['id']] = array(
        'print_method' => $this->map_print_method($mapping['print_method']),
        'manufacturer' => $mapping['manufacturer'],
        'series' => $mapping['series'],
        'type' => $this->map_product_type($mapping['product_type'])
    );
    
    // ... bestehender Code ...
}
```

### 3. Aktualisierte printPositions

```php
$print_positions[] = array(
    'position' => $position,
    'width' => $print_dimensions['width_mm'],
    'height' => $print_dimensions['height_mm'],
    'unit' => $print_specs['unit'],
    'offsetX' => $print_coordinates['offset_x_mm'],
    'offsetY' => $print_coordinates['offset_y_mm'],
    'offsetUnit' => $print_specs['offsetUnit'],
    'referencePoint' => $print_specs['referencePoint'],
    'printFile' => $image['url'],
    'previewUrl' => !empty($image['preview_url']) ? $image['preview_url'] : ''
);
```

## 🧪 Testing

### Test-Datei: `test_api_mapping_updates.php`

Die Test-Datei überprüft:

1. **Produkttyp-Mapping:** Alle YPrint-Produkttypen werden korrekt zu API-Werten konvertiert
2. **Druckmethoden-Mapping:** Alle YPrint-Druckmethoden werden korrekt zu API-Werten konvertiert
3. **Fallback-Verhalten:** Unbekannte Werte werden zu sinnvollen Standardwerten gemappt
4. **JSON-Struktur:** Die generierte JSON-Struktur entspricht den API-Anforderungen
5. **Integration:** Die Mapping-Funktionen sind korrekt in die bestehende Logik integriert

### Test ausführen:

```bash
php test_api_mapping_updates.php
```

## ⚠️ Wichtige Hinweise

### 1. API-Validierung
- Die AllesKlarDruck API wird jetzt Fehler zurückgeben, wenn ungültige Werte gesendet werden
- Alle Mapping-Funktionen haben Fallback-Werte für unbekannte Eingaben
- Teste alle möglichen Produkttypen in deinem System

### 2. Fallback-Werte
- **Produkttyp:** "TSHIRT" für unbekannte Typen
- **Druckmethode:** "DTG" für unbekannte Methoden
- **ReferencePoint:** "center" für zentrierte Positionierung

### 3. Erweiterte Optionen
- Überprüfe die API-Dokumentation für weitere `referencePoint`-Optionen
- Erweitere die Mapping-Tabellen bei Bedarf um neue Produkttypen oder Druckmethoden

## 🔍 Troubleshooting

### Häufige Probleme:

1. **API-Fehler bei unbekannten Produkttypen:**
   - Überprüfe die Mapping-Tabelle in `map_product_type()`
   - Füge neue Produkttypen hinzu, falls erforderlich

2. **API-Fehler bei unbekannten Druckmethoden:**
   - Überprüfe die Mapping-Tabelle in `map_print_method()`
   - Füge neue Druckmethoden hinzu, falls erforderlich

3. **Fehlende Preview-URLs:**
   - Stelle sicher, dass die Preview-Generierung korrekt funktioniert
   - Überprüfe die Dateipfade und Berechtigungen

### Debugging:

```php
// Debug-Ausgabe für Mapping-Funktionen
error_log("Product Type Mapping: " . $yprint_type . " -> " . $this->map_product_type($yprint_type));
error_log("Print Method Mapping: " . $yprint_method . " -> " . $this->map_print_method($yprint_method));
```

## 📈 Nächste Schritte

1. **Testen:** Führe den Mapping-Test aus, um alle Funktionen zu überprüfen
2. **Validieren:** Teste die API-Integration mit echten Bestellungen
3. **Erweitern:** Füge bei Bedarf weitere Produkttypen oder Druckmethoden hinzu
4. **Dokumentieren:** Aktualisiere die API-Dokumentation bei Änderungen

## ✅ Erfolgskriterien

- [ ] Alle YPrint-Produkttypen werden korrekt zu API-Werten gemappt
- [ ] Alle YPrint-Druckmethoden werden korrekt zu API-Werten gemappt
- [ ] Fallback-Werte funktionieren für unbekannte Eingaben
- [ ] JSON-Struktur entspricht den API-Anforderungen
- [ ] Preview-URLs werden korrekt integriert
- [ ] ReferencePoint wird korrekt gesetzt
- [ ] Keine API-Fehler bei gültigen Eingaben 