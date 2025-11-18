# Preview-URL Integration in API

## 🎯 Übersicht

Die Preview-URL Integration ermöglicht es, visuelle Vorschauen der Designs zusammen mit den Druckdateien an den Print Provider zu senden. Dies verbessert die Kommunikation und Qualitätskontrolle erheblich.

## ✅ Implementierte Änderungen

### 1. API Integration (`includes/class-octo-print-api-integration.php`)

#### `parse_view_images()` Methode erweitert
- **Neuer Parameter:** `$item = null` hinzugefügt
- **Neues Feld:** `'preview_url' => $item ? $this->get_design_meta($item, 'preview_url') : ''`

#### `parse_design_views()` Methode aktualisiert
- **Übergabe:** `$item` Parameter an `parse_view_images()` weitergegeben

#### `convert_item_to_api_format()` Methode erweitert
- **Neues Feld:** `'previewUrl' => !empty($image['preview_url']) ? $image['preview_url'] : ''`

### 2. JSON-Struktur erweitert

**Vorher:**
```json
{
    "printPositions": [
        {
            "position": "front",
            "width": 35.8,
            "height": 36.6,
            "unit": "cm",
            "offsetX": 82.3,
            "offsetY": 70,
            "offsetUnit": "cm",
            "printFile": "https://yprint.de/wp-content/uploads/octo-print-designer/user-images/17/cool-profile-picture-paper-bag-head-4co57dtwk64fb7lv.jpg"
        }
    ]
}
```

**Nachher:**
```json
{
    "printPositions": [
        {
            "position": "front",
            "width": 35.8,
            "height": 36.6,
            "unit": "cm",
            "offsetX": 82.3,
            "offsetY": 70,
            "offsetUnit": "cm",
            "printFile": "https://yprint.de/wp-content/uploads/octo-print-designer/user-images/17/cool-profile-picture-paper-bag-head-4co57dtwk64fb7lv.jpg",
            "previewUrl": "https://yprint.de/wp-content/uploads/octo-print-designer/previews/17/shirt-preview-front-5338.png"
        }
    ]
}
```

## 🎯 Vorteile für den Print Provider

### Visueller Kontext
- **Was:** Sieht das fertige Shirt mit Design
- **Warum:** Besseres Verständnis des Endprodukts

### Qualitätskontrolle
- **Was:** Kann Position und Größe besser einschätzen
- **Warum:** Weniger Fehler bei der Produktion

### Fehlervermeidung
- **Was:** Weniger Missverständnisse bei der Produktion
- **Warum:** Klare visuelle Referenz

### Kommunikation
- **Was:** Bei Rückfragen kann er sich auf die Vorschau beziehen
- **Warum:** Effizientere Problemlösung

## 🔧 Technische Details

### Meta-Daten Quellen
Die Preview-URL wird aus folgenden Order-Meta-Daten extrahiert:
- `_yprint_preview_url` (Hauptquelle)
- `_design_preview_url` (Fallback)
- `yprint_preview_url` (Fallback)

### Fallback-Mechanismus
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
    return $value;
}
```

## 🧪 Testing

### Test-Skript
Verwende `test_preview_url_integration.php` um die Integration zu testen:

```bash
php test_preview_url_integration.php
```

### Was wird getestet:
1. ✅ API Payload Generierung
2. ✅ Preview-URL Extraktion aus Meta-Daten
3. ✅ Preview-URL Integration in JSON-Struktur
4. ✅ Vollständige Payload Validierung

## 📋 Nächste Schritte

### 1. Testen der Integration
- [ ] Test-Skript ausführen
- [ ] Überprüfen der Preview-URLs in der Payload
- [ ] Validierung der JSON-Struktur

### 2. Print Provider Kommunikation
- [ ] API-Übertragung testen
- [ ] Print Provider über neue Struktur informieren
- [ ] Feedback vom Print Provider einholen

### 3. Monitoring
- [ ] Logs überwachen
- [ ] Fehlerbehandlung testen
- [ ] Performance-Impact messen

## 🔍 Troubleshooting

### Keine Preview-URLs gefunden?
1. Überprüfe Order-Meta-Daten: `_yprint_preview_url`
2. Stelle sicher, dass Preview-URLs beim Design-Speichern generiert werden
3. Teste mit einer neuen Bestellung

### API-Fehler?
1. Überprüfe die JSON-Struktur
2. Validiere die Preview-URLs (müssen gültige URLs sein)
3. Teste mit dem Test-Skript

## 📞 Support

Bei Fragen oder Problemen:
1. Test-Skript ausführen
2. Logs überprüfen
3. Preview-URLs in Order-Meta-Daten validieren
4. API-Payload manuell testen 