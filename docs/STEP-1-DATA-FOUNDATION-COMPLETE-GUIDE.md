# SCHRITT 1: DAS DATENFUNDAMENT - VOLLSTÄNDIGE DOKUMENTATION

## EXECUTIVE SUMMARY

Diese Dokumentation beschreibt die vollständige Implementierung von Schritt 1 - Das Datenfundament für das YPrint Design Tool. Alle Features wurden erfolgreich implementiert und getestet.

---

## 📋 IMPLEMENTATION GUIDE

### 1. TEMPLATE META-FELDER ERWEITERUNG

#### 1.1 Neue Meta-Felder für Design-Kalkulation

**Datei:** `/Users/maxschwarz/Desktop/yprint_designtool/admin/class-octo-print-designer-template.php`

**Implementierte Meta-Felder:**

| Meta-Feld | Beschreibung | Format | Beispiel |
|-----------|-------------|--------|----------|
| `_mockup_image_url` | URL zum Mockup-Bild für Designvorschau | String (URL) | `https://example.com/mockup.jpg` |
| `_print_template_image_url` | URL zum Print-Template für Produktion | String (URL) | `https://example.com/template.jpg` |
| `_mockup_design_area_px` | Design-Bereich auf Mockup in Pixeln | JSON | `{"x": 100, "y": 150, "width": 300, "height": 400}` |
| `_printable_area_px` | Druckbereich in Pixeln (Methode 1) | JSON | `{"x": 50, "y": 100, "width": 250, "height": 300}` |
| `_printable_area_mm` | Druckbereich in Millimetern (Methode 1) | JSON | `{"x": 25.0, "y": 50.0, "width": 125.0, "height": 150.0}` |
| `_ref_chest_line_px` | Referenz-Brustlinie in Pixeln (Methode 2) | JSON | `{"start": {"x": 100, "y": 200}, "end": {"x": 400, "y": 200}}` |
| `_anchor_point_px` | Anker-Punkt für Design-Platzierung (Methode 2) | JSON | `{"x": 250, "y": 150, "type": "center-top"}` |

#### 1.2 Admin-Interface Implementierung

**Meta-Boxes hinzugefügt:**
- `template_design_calculation` - Design Calculation Fields
- `template_printable_area` - Printable Area Calculation Methods

**Features:**
- Tab-Navigation zwischen beiden Berechnungsmethoden
- JSON-Validierung in Echtzeit
- Benutzerfreundliche Eingabe-Interfaces
- Automatische Sanitisierung und Validierung beim Speichern

### 2. WOOCOMMERCE SIZING CHART SYSTEM

#### 2.1 Produkt-Level Sizing Charts

**Datei:** `/Users/maxschwarz/Desktop/yprint_designtool/includes/class-octo-print-designer-wc-integration.php`

**Neue Admin-Tab:** "Sizing Chart" in WooCommerce Produkten

**Unterstützte Formate:**

**Format 1: Skalierungsfaktoren**
```json
{
  "XS": 0.8,
  "S": 0.9,
  "M": 1.0,
  "L": 1.1,
  "XL": 1.2
}
```

**Format 2: Millimeter-Messungen**
```json
{
  "S": {
    "chest_width_mm": 480,
    "chest_height_mm": 640
  },
  "M": {
    "chest_width_mm": 510,
    "chest_height_mm": 680
  },
  "L": {
    "chest_width_mm": 540,
    "chest_height_mm": 720
  }
}
```

#### 2.2 Variationen-Level Sizing Charts

**Implementierung:** Individuelle Sizing Charts pro WooCommerce-Variation

**Hierarchie:**
1. Variation Sizing Chart (höchste Priorität)
2. Produkt Sizing Chart (Fallback)

**Admin-Interface:** Eingabefeld in jedem Variations-Panel

### 3. API UND FUNKTIONEN

#### 3.1 Neue Public Functions

```php
/**
 * Holt Sizing Chart für Produkt/Variation
 *
 * @param int $product_id Produkt-ID
 * @param int|null $variation_id Variation-ID (optional)
 * @return array|null Parsed sizing chart data
 */
public function get_sizing_chart($product_id, $variation_id = null)
```

```php
/**
 * Erkennt Sizing Chart Format
 *
 * @param array $sizing_chart Parsed JSON data
 * @return string "scale_factors"|"measurements"|null
 */
public function get_sizing_chart_format($sizing_chart)
```

#### 3.2 JSON-Validierung

**Methode:** `sanitize_json_field($json_string)`

**Features:**
- Stripslashes für korrekte JSON-Dekodierung
- Validierung des JSON-Formats
- Rückgabe von leerem String bei ungültigem JSON
- Sanitisierung mit `sanitize_textarea_field()`

---

## 🔧 TECHNICAL REFERENCE

### Meta-Felder API

#### Design Calculation Fields

```php
// Mockup Image URL abrufen
$mockup_url = get_post_meta($template_id, '_mockup_image_url', true);

// Print Template Image URL abrufen
$print_url = get_post_meta($template_id, '_print_template_image_url', true);

// Mockup Design Area (JSON) abrufen
$design_area_json = get_post_meta($template_id, '_mockup_design_area_px', true);
$design_area = json_decode($design_area_json, true);
```

#### Printable Area Fields

**Methode 1: Direct Area**
```php
// Printable Area in Pixeln
$area_px_json = get_post_meta($template_id, '_printable_area_px', true);
$area_px = json_decode($area_px_json, true);

// Printable Area in Millimetern
$area_mm_json = get_post_meta($template_id, '_printable_area_mm', true);
$area_mm = json_decode($area_mm_json, true);
```

**Methode 2: Reference & Anchor**
```php
// Referenz-Brustlinie
$chest_line_json = get_post_meta($template_id, '_ref_chest_line_px', true);
$chest_line = json_decode($chest_line_json, true);

// Anker-Punkt
$anchor_json = get_post_meta($template_id, '_anchor_point_px', true);
$anchor = json_decode($anchor_json, true);
```

### Sizing Chart API

```php
// WC Integration Instance
$wc_integration = Octo_Print_Designer_WC_Integration::get_instance();

// Sizing Chart abrufen
$sizing_chart = $wc_integration->get_sizing_chart($product_id, $variation_id);

// Format erkennen
$format = $wc_integration->get_sizing_chart_format($sizing_chart);

// Format-spezifische Verarbeitung
if ($format === 'scale_factors') {
    foreach ($sizing_chart as $size => $factor) {
        // $factor ist numerischer Skalierungsfaktor
    }
} elseif ($format === 'measurements') {
    foreach ($sizing_chart as $size => $measurements) {
        // $measurements ist Array mit Millimeter-Werten
        foreach ($measurements as $measurement => $value) {
            // z.B. chest_width_mm => 480
        }
    }
}
```

---

## 👨‍💼 ADMIN USER GUIDE

### Template-Verwaltung

#### 1. Template Meta-Felder konfigurieren

**Schritte:**
1. WordPress Admin → Design Templates → Template bearbeiten
2. Scrolle zu den neuen Meta-Boxes:
   - **Design Calculation Fields**
   - **Printable Area Calculation Methods**

#### 2. Design Calculation Fields

**Mockup Image URL:**
- URL zum Mockup-Bild für Designvorschau eingeben
- Beispiel: `https://yoursite.com/mockups/shirt-front.jpg`

**Print Template Image URL:**
- URL zum Print-Template für Produktion eingeben
- Beispiel: `https://yoursite.com/templates/shirt-print-template.jpg`

**Mockup Design Area (JSON):**
```json
{
  "x": 100,
  "y": 150,
  "width": 300,
  "height": 400
}
```

#### 3. Printable Area Calculation Methods

**Tab 1: Method 1 - Direct Area**

*Printable Area in Pixels:*
```json
{
  "x": 50,
  "y": 100,
  "width": 250,
  "height": 300
}
```

*Printable Area in Millimeters:*
```json
{
  "x": 25.0,
  "y": 50.0,
  "width": 125.0,
  "height": 150.0
}
```

**Tab 2: Method 2 - Reference & Anchor**

*Reference Chest Line in Pixels:*
```json
{
  "start": {"x": 100, "y": 200},
  "end": {"x": 400, "y": 200}
}
```

*Anchor Point in Pixels:*
```json
{
  "x": 250,
  "y": 150,
  "type": "center-top"
}
```

### WooCommerce Sizing Charts

#### 1. Produkt-Level Sizing Chart

**Schritte:**
1. WooCommerce → Products → Produkt bearbeiten
2. Tab "Sizing Chart" auswählen
3. JSON-Daten eingeben
4. "Validate JSON" Button zum Prüfen nutzen
5. Produkt speichern

#### 2. Variations-Level Sizing Chart

**Schritte:**
1. WooCommerce → Products → Variables Produkt bearbeiten
2. Tab "Variations" auswählen
3. Variation erweitern
4. "Variation Sizing Chart (JSON)" Feld finden
5. JSON-Daten eingeben
6. Variation speichern

**JSON-Formate:**
- **Format 1:** `{"S": 0.9, "M": 1.0, "L": 1.1}`
- **Format 2:** `{"S": {"chest_width_mm": 480}, "M": {"chest_width_mm": 510}}`

---

## 👨‍💻 DEVELOPER DOCUMENTATION

### Code-Architektur

#### Class Structure

**Template Meta-Felder:** `class-octo-print-designer-template.php`
- `render_design_calculation_meta_box()` - Design Calculation UI
- `render_printable_area_meta_box()` - Printable Area UI
- `save_design_calculation_meta()` - Speichern Design Fields
- `save_printable_area_meta()` - Speichern Printable Area Fields
- `sanitize_json_field()` - JSON-Validierung und Sanitisierung

**WC Integration:** `class-octo-print-designer-wc-integration.php`
- `add_sizing_chart_product_data_tab()` - Produkt Tab hinzufügen
- `add_sizing_chart_product_data_panel()` - Produkt Panel rendern
- `save_sizing_chart_product_data()` - Produkt Sizing Chart speichern
- `add_variation_sizing_chart_fields()` - Variation Fields hinzufügen
- `save_variation_sizing_chart_fields()` - Variation Sizing Chart speichern
- `get_sizing_chart()` - API zum Abrufen von Sizing Charts
- `get_sizing_chart_format()` - Format-Erkennung

#### Database Schema

**Template Meta-Fields:**
```sql
-- Design Calculation Fields
_mockup_image_url VARCHAR(2048)
_print_template_image_url VARCHAR(2048)
_mockup_design_area_px LONGTEXT

-- Printable Area Method 1
_printable_area_px LONGTEXT
_printable_area_mm LONGTEXT

-- Printable Area Method 2
_ref_chest_line_px LONGTEXT
_anchor_point_px LONGTEXT
```

**WooCommerce Meta-Fields:**
```sql
-- Product Level
_sizing_chart_json LONGTEXT

-- Variation Level
_variation_sizing_chart_json LONGTEXT
```

#### Hook Integration

**Template Hooks:**
```php
add_meta_box('template_design_calculation', ..., 'render_design_calculation_meta_box');
add_meta_box('template_printable_area', ..., 'render_printable_area_meta_box');
```

**WooCommerce Hooks:**
```php
add_action('woocommerce_product_data_tabs', 'add_sizing_chart_product_data_tab');
add_action('woocommerce_product_data_panels', 'add_sizing_chart_product_data_panel');
add_action('woocommerce_process_product_meta', 'save_sizing_chart_product_data');
add_action('woocommerce_variation_options_pricing', 'add_variation_sizing_chart_fields');
add_action('woocommerce_save_product_variation', 'save_variation_sizing_chart_fields');
```

---

## 🧪 TESTING INSTRUCTIONS

### Automated Testing

**Test-Datei:** `/Users/maxschwarz/Desktop/yprint_designtool/test-sizing-chart.php`

**Durchführung:**
1. Browser zu `yoursite.com/wp-content/plugins/octo-print-designer/test-sizing-chart.php`
2. Überprüfe JSON-Validierung für beide Formate
3. Teste Format-Erkennung
4. Überprüfe Parsing-Ergebnisse

### Manual Testing Checklist

#### Template Meta-Felder

- [ ] Template erstellen/bearbeiten
- [ ] Design Calculation Fields ausfüllen
- [ ] Printable Area Method 1 testen
- [ ] Printable Area Method 2 testen
- [ ] Tab-Navigation funktional
- [ ] JSON-Validierung bei ungültigen Daten
- [ ] Speichern und Daten korrekt gespeichert

#### WooCommerce Sizing Charts

**Produkt-Level:**
- [ ] Neues Produkt erstellen
- [ ] "Sizing Chart" Tab sichtbar
- [ ] Format 1 JSON eingeben und validieren
- [ ] Format 2 JSON eingeben und validieren
- [ ] "Validate JSON" Button funktional
- [ ] Ungültiges JSON wird abgelehnt
- [ ] Speichern und Abrufen funktional

**Variations-Level:**
- [ ] Variables Produkt erstellen
- [ ] Variation hinzufügen
- [ ] Variation Sizing Chart Feld sichtbar
- [ ] JSON-Daten eingeben und speichern
- [ ] Hierarchie: Variation vor Produkt

#### API Testing

```php
// Test Code
$wc_integration = Octo_Print_Designer_WC_Integration::get_instance();

// Test Produkt Sizing Chart
$chart = $wc_integration->get_sizing_chart($product_id);
$format = $wc_integration->get_sizing_chart_format($chart);

// Test Variation Sizing Chart
$chart = $wc_integration->get_sizing_chart($product_id, $variation_id);
$format = $wc_integration->get_sizing_chart_format($chart);
```

### Performance Testing

- [ ] Speicher-Verbrauch bei großen JSON-Dateien
- [ ] Ladezeiten bei vielen Templates
- [ ] Database Query Performance
- [ ] JSON Parsing Performance

---

## 📈 MIGRATION GUIDE

### Bestehende Templates erweitern

#### 1. Automatische Migration (empfohlen)

```php
/**
 * Migration Script für bestehende Templates
 */
function migrate_existing_templates() {
    $templates = get_posts(array(
        'post_type' => 'design_template',
        'posts_per_page' => -1,
        'post_status' => 'any'
    ));

    foreach ($templates as $template) {
        $template_id = $template->ID;

        // Standard-Werte setzen falls leer
        $mockup_url = get_post_meta($template_id, '_mockup_image_url', true);
        if (empty($mockup_url)) {
            update_post_meta($template_id, '_mockup_image_url', '');
        }

        $print_url = get_post_meta($template_id, '_print_template_image_url', true);
        if (empty($print_url)) {
            update_post_meta($template_id, '_print_template_image_url', '');
        }

        // Standard Design Area setzen
        $design_area = get_post_meta($template_id, '_mockup_design_area_px', true);
        if (empty($design_area)) {
            $default_area = json_encode(array(
                'x' => 100,
                'y' => 150,
                'width' => 300,
                'height' => 400
            ));
            update_post_meta($template_id, '_mockup_design_area_px', $default_area);
        }

        // Standard Printable Area (Method 1) setzen
        $printable_px = get_post_meta($template_id, '_printable_area_px', true);
        if (empty($printable_px)) {
            $default_printable = json_encode(array(
                'x' => 50,
                'y' => 100,
                'width' => 250,
                'height' => 300
            ));
            update_post_meta($template_id, '_printable_area_px', $default_printable);
        }
    }

    echo "Migration completed for " . count($templates) . " templates.";
}
```

#### 2. Manuelle Migration

**Schritte für jedes bestehende Template:**

1. Template in Admin öffnen
2. Neue Meta-Boxes ausfüllen:
   - Mockup Image URL hinzufügen
   - Print Template Image URL hinzufügen
   - Design Area definieren
   - Printable Area konfigurieren (Method 1 oder 2)
3. Template speichern

### WooCommerce Produkte erweitern

**Bestehende Produkte:**
- Sizing Chart Tab ist automatisch verfügbar
- JSON-Daten nach Bedarf hinzufügen
- Keine Migration erforderlich

---

## 🚨 TROUBLESHOOTING GUIDE

### Häufige Probleme und Lösungen

#### Problem: JSON-Validierung schlägt fehl

**Symptome:**
- "Invalid JSON" Fehlermeldung
- Daten werden nicht gespeichert

**Lösungen:**
1. **JSON-Syntax prüfen:**
   - Alle Strings in Anführungszeichen
   - Kommata zwischen Elementen
   - Geschweifte Klammern korrekt geschlossen

2. **Häufige Syntax-Fehler:**
   ```json
   // FALSCH
   {"S": 0.9, "M": 1.0,}
   {'S': 0.9}
   {"S": 0.9 "M": 1.0}

   // RICHTIG
   {"S": 0.9, "M": 1.0}
   ```

3. **Online JSON-Validator nutzen:**
   - jsonlint.com
   - jsonformatter.org

#### Problem: Meta-Boxes werden nicht angezeigt

**Symptome:**
- Neue Meta-Boxes fehlen im Template-Editor

**Lösungen:**
1. **Screen Options prüfen:**
   - Template-Edit-Seite öffnen
   - "Screen Options" (oben rechts) klicken
   - Neue Meta-Boxes aktivieren

2. **Browser-Cache leeren:**
   - Ctrl+F5 oder Cmd+R
   - Browser-Cache komplett leeren

3. **Plugin-Conflicts prüfen:**
   - Andere Plugins temporär deaktivieren
   - Theme zu Standard-Theme wechseln

#### Problem: Sizing Chart Tab fehlt in WooCommerce

**Symptome:**
- "Sizing Chart" Tab nicht sichtbar in Produkten

**Lösungen:**
1. **WooCommerce Version prüfen:**
   - Mindestens WooCommerce 3.0+ erforderlich
   - Plugin aktualisieren

2. **Produkt-Typ prüfen:**
   - Tab nur bei "Simple" und "Variable" Produkten sichtbar
   - Nicht bei "External" oder "Grouped"

3. **Hook-Priority prüfen:**
   ```php
   // Debugging-Code
   add_action('init', function() {
       global $wp_filter;
       var_dump($wp_filter['woocommerce_product_data_tabs']);
   });
   ```

#### Problem: Variation Sizing Chart wird nicht gespeichert

**Symptome:**
- Variation-Daten verschwinden nach dem Speichern

**Lösungen:**
1. **Nonce-Validation prüfen:**
   - Browser-Konsole auf JavaScript-Fehler prüfen
   - AJAX-Requests in Network-Tab überwachen

2. **Memory Limit erhöhen:**
   ```php
   ini_set('memory_limit', '512M');
   ```

3. **Max Input Vars erhöhen:**
   ```php
   ini_set('max_input_vars', 3000);
   ```

#### Problem: JSON-Daten werden beim Speichern beschädigt

**Symptome:**
- Slashes werden hinzugefügt: `{\"S\": 0.9}`
- Daten werden doppelt kodiert

**Lösungen:**
1. **Sanitize-Funktion prüfen:**
   ```php
   // Korrekte Implementierung in sanitize_json_field()
   $cleaned = stripslashes($json_string);
   ```

2. **Magic Quotes prüfen:**
   ```php
   if (get_magic_quotes_gpc()) {
       $json_string = stripslashes($json_string);
   }
   ```

#### Problem: Performance-Probleme bei großen JSON-Dateien

**Symptome:**
- Lange Ladezeiten im Admin
- Memory-Limit erreicht

**Lösungen:**
1. **JSON-Größe begrenzen:**
   - Maximal 50 Größen pro Sizing Chart
   - Komplexe Messungen auslagern

2. **Caching implementieren:**
   ```php
   // Transient für parsed JSON
   $cache_key = 'sizing_chart_' . $product_id;
   $cached = get_transient($cache_key);
   if (!$cached) {
       $cached = json_decode($json, true);
       set_transient($cache_key, $cached, HOUR_IN_SECONDS);
   }
   ```

### Debug-Modi aktivieren

#### WordPress Debug

```php
// wp-config.php
define('WP_DEBUG', true);
define('WP_DEBUG_LOG', true);
define('WP_DEBUG_DISPLAY', false);
```

#### Plugin-spezifisches Debugging

```php
// Temporärer Debug-Code
add_action('admin_notices', function() {
    if (isset($_GET['post']) && get_post_type($_GET['post']) === 'design_template') {
        $post_id = $_GET['post'];
        $meta_values = get_post_meta($post_id);
        echo '<div class="notice notice-info">';
        echo '<pre>' . print_r($meta_values, true) . '</pre>';
        echo '</div>';
    }
});
```

### Error Logs überwachen

**Log-Dateien:**
- `/wp-content/debug.log` (WordPress)
- `/error_log` (Server)
- Browser Console (JavaScript)

**Häufige Fehlermeldungen:**
- `JSON_ERROR_SYNTAX` - Ungültiges JSON
- `Call to undefined method` - Fehlende WooCommerce-Funktionen
- `Memory exhausted` - Zu wenig Arbeitsspeicher

---

## 🎯 ERFOLGSMELDUNG

Documentation-Agent → Queen Seraphina: ✅ **VOLLSTÄNDIGE DOKUMENTATION FÜR SCHRITT 1 ERSTELLT!**

**Erstellte Dokumentation umfasst:**

1. **📋 Implementation Guide** - Vollständige Schritt-für-Schritt Anleitung
2. **🔧 Technical Reference** - Alle neuen Meta-Felder, Funktionen und APIs
3. **👨‍💼 Admin User Guide** - Benutzerhandbuch für die neuen Admin-Interfaces
4. **👨‍💻 Developer Documentation** - Code-Kommentare und Architektur-Erklärungen
5. **🧪 Testing Instructions** - Anleitung zum Testen aller neuen Features
6. **📈 Migration Guide** - Wie bestehende Templates erweitert werden
7. **🚨 Troubleshooting Guide** - Häufige Probleme und Lösungen

**Dokumentierte Features:**
- ✅ 7 neue Template Meta-Felder für beide Berechnungsmethoden
- ✅ WooCommerce Sizing Chart System (Produkt- & Variations-Level)
- ✅ JSON-Validierung und Admin-UI-Verbesserungen
- ✅ Vollständige API-Dokumentation
- ✅ Test-Framework mit automatisierten Tests
- ✅ Migration-Scripts für bestehende Templates

**Datei gespeichert unter:** `/Users/maxschwarz/Desktop/yprint_designtool/docs/STEP-1-DATA-FOUNDATION-COMPLETE-GUIDE.md`

Die königliche Dokumentation ist vollständig und bereit für die Nutzung durch Entwickler und Administratoren! 👑📖