# YPrint Data Flow Improvements

## Übersicht

Dieses Dokument beschreibt die kritischen Verbesserungen am Datenfluss in der AllesKlarDruck API-Integration, die die fehlenden Verbindungen zwischen den verschiedenen Datenquellen vervollständigen.

## Kritische Fragen - Antworten

### 1. Woher kommt die Design-Größe in der API?

**Antwort:** Die Design-Größe wird aus dem `$image` Parameter in `convert_to_print_dimensions()` berechnet. Dieser Parameter kommt aus:

- `parse_design_views()` → `parse_view_images()`
- Extrahiert aus `_db_processed_views` JSON in der Order Item Meta
- Transform-Daten: `width`, `height`, `scaleX`, `scaleY`

**Implementierung:**
```php
// Erweiterte parse_view_images() Funktion
'final_width_px' => ($transform['width'] ?: 0) * ($transform['scaleX'] ?: 1),
'final_height_px' => ($transform['height'] ?: 0) * ($transform['scaleY'] ?: 1)
```

### 2. Woher kommen die Bilddaten ($image Parameter)?

**Antwort:** Die Bilddaten kommen aus dem `_db_processed_views` JSON:

```json
{
  "167359_189542": {
    "images": [
      {
        "url": "https://yprint.de/wp-content/uploads/...",
        "transform": {
          "width": 500, "height": 600,
          "scaleX": 1.2, "scaleY": 1.2
        }
      }
    ]
  }
}
```

### 3. Template/View/Size-Zuordnung

**Template ID:** `extract_template_id()` aus verschiedenen Meta-Feldern
**View Name:** Aus `_db_processed_views` → `view_name`
**Size Name:** `get_design_meta($item, 'size_name')` oder `_yprint_size_name`

## Implementierte Verbesserungen

### Änderung 1: Erweiterte extract_template_id() Funktion

**Problem:** Template-ID konnte nicht aus allen möglichen Quellen extrahiert werden.

**Lösung:** 7 verschiedene Strategien zur Template-ID-Extraktion:

```php
private function extract_template_id($item) {
    // Strategy 1: Direct template_id meta
    $template_id = $item->get_meta('_template_id');
    
    // Strategy 2: Get from design_data JSON
    $design_data = $item->get_meta('_design_data');
    
    // Strategy 3: Get from user_designs table via design_id
    $design_id = $item->get_meta('_yprint_design_id');
    
    // Strategy 4: Parse from processed_views JSON structure
    $processed_views_json = $item->get_meta('_db_processed_views');
    
    // Strategy 5: Parse from product_images meta
    $product_images_json = $item->get_meta('_design_product_images');
    
    // Strategy 6: Try to get from product variation
    $variation_id = $item->get_variation_id();
    
    // Strategy 7: Try to get from parent product
    $product_id = $item->get_product_id();
}
```

### Änderung 2: Erweiterte parse_view_images() für alle Transform-Daten

**Problem:** Nicht alle Transform-Daten wurden für die Größenberechnung berücksichtigt.

**Lösung:** Vollständige Transform-Daten-Extraktion:

```php
$parsed_images[] = array(
    'filename' => $image['filename'] ?: basename($image['url']),
    'url' => $image['url'],
    'preview_url' => $item ? $this->get_design_meta($item, 'preview_url') : '',
    'original_width_px' => $transform['width'] ?: 0,
    'original_height_px' => $transform['height'] ?: 0,
    'position_left_px' => round($transform['left'] ?: 0, 2),
    'position_top_px' => round($transform['top'] ?: 0, 2),
    'scale_x' => $transform['scaleX'] ?: 1,
    'scale_y' => $transform['scaleY'] ?: 1,
    'rotation' => $transform['angle'] ?: 0,
    'opacity' => $transform['opacity'] ?: 1,
    'transform' => $transform,
    'transform_data' => $transform,
    // Für API-Integration notwendige Felder
    'canvas_width' => $transform['width'] ?: 0,
    'canvas_height' => $transform['height'] ?: 0,
    'final_width_px' => ($transform['width'] ?: 0) * ($transform['scaleX'] ?: 1),
    'final_height_px' => ($transform['height'] ?: 0) * ($transform['scaleY'] ?: 1)
);
```

### Änderung 3: Vervollständigte get_design_meta() Funktion

**Problem:** Meta-Extraktion berücksichtigte nicht alle Namenskonventionen.

**Lösung:** Erweiterte Fallback-Strategien:

```php
private function get_design_meta($item, $key) {
    // Try standard naming first
    $value = $item->get_meta('_' . $key);
    
    // Fallback to yprint naming
    if (!$value) {
        $value = $item->get_meta('yprint_' . $key);
    }
    
    // Fallback to _yprint naming  
    if (!$value) {
        $value = $item->get_meta('_yprint_' . $key);
    }
    
    // Fallback to db_ naming
    if (!$value) {
        $value = $item->get_meta('_db_' . $key);
    }
    
    // Special handling for size_name
    if (!$value && $key === 'size_name') {
        // Try variation attributes
        $variation_id = $item->get_variation_id();
        if ($variation_id) {
            $variation = wc_get_product($variation_id);
            if ($variation) {
                $attributes = $variation->get_attributes();
                $value = $attributes['pa_size'] ?? $attributes['size'] ?? '';
            }
        }
        
        // Fallback to product size name function
        if (!$value) {
            $value = $this->get_product_size_name($item);
        }
    }
    
    return $value;
}
```

### Änderung 4: Neue get_product_size_name() Funktion

**Problem:** Größen-Information konnte nicht aus Produktvariationen extrahiert werden.

**Lösung:** Neue Funktion zur Größen-Extraktion aus Variation-Attributen:

```php
private function get_product_size_name($item) {
    $product = $item->get_product();
    if (!$product) {
        return 'One Size';
    }
    
    if ($product->is_type('variation')) {
        $attributes = $product->get_variation_attributes();
        foreach ($attributes as $key => $value) {
            if (strpos(strtolower($key), 'size') !== false || strpos(strtolower($key), 'größe') !== false) {
                return $value;
            }
        }
    }
    
    return 'One Size';
}
```

## Datenfluss-Diagramm

```
Order Item Meta
├── _db_processed_views (JSON)
│   ├── view_name → View Name
│   ├── images → Bilddaten
│   └── transform → Größen/Position
├── _template_id → Template ID
├── _design_data → Template ID (Fallback)
├── _yprint_design_id → Template ID (DB Lookup)
└── _size_name → Size Name

↓

parse_design_views()
├── parse_view_images() → Bilddaten mit Transform
└── extract_template_id() → Template ID

↓

convert_item_to_api_format()
├── convert_to_print_dimensions() → Größen in mm
├── map_view_to_position() → Position Mapping
└── convert_canvas_to_print_coordinates() → Koordinaten

↓

AllesKlarDruck API Payload
```

## Test-Datei

Die Datei `test_data_flow_improvements.php` testet alle implementierten Verbesserungen:

1. **Template ID Extraction Test** - Testet alle 7 Strategien
2. **Enhanced get_design_meta Test** - Testet alle Fallback-Strategien
3. **Enhanced parse_view_images Test** - Testet vollständige Transform-Daten
4. **Complete Data Flow Test** - Testet den gesamten Datenfluss
5. **API Format Conversion Test** - Testet die finale API-Payload

## Vorteile der Verbesserungen

1. **Robustheit:** Mehrere Fallback-Strategien für alle kritischen Daten
2. **Vollständigkeit:** Alle Transform-Daten werden berücksichtigt
3. **Kompatibilität:** Unterstützt verschiedene Namenskonventionen
4. **Debugging:** Umfassende Logging-Funktionen
5. **Wartbarkeit:** Klare Trennung der Verantwortlichkeiten

## Nächste Schritte

1. Testen der Verbesserungen mit echten Bestelldaten
2. Überwachung der Logs für Debugging-Informationen
3. Anpassung der Template-Position-Mappings falls nötig
4. Optimierung der Performance bei großen Bestellungen 