# AGENT 7: AUTOMATISIERTER HPOS-TESTPLAN

**Dokumentversion:** 1.0
**Erstellungsdatum:** 2025-10-02
**Zielsystem:** YPrint Design Tool - WooCommerce HPOS-Kompatibilität

---

## EXECUTIVE SUMMARY

Dieser Testplan validiert die vollständige HPOS-Kompatibilität (High-Performance Order Storage) des YPrint Design Tools. Das System wurde bereits auf HPOS-kompatible Methoden migriert (`$order->get_meta()` / `$order->update_meta_data()` statt `get_post_meta()` / `update_post_meta()`).

**Kritische Testbereiche:**
- Neue Bestellungen mit HPOS-aktiviertem System
- Abwärtskompatibilität mit Legacy-Bestellungen (pre-HPOS)
- Admin-Preview-Funktionalität (Order #5380 Refresh-Button)
- Print Provider API-Integration mit vollständigen Design-Daten

---

## TEST 1: NEUE BESTELLUNG (HPOS AKTIV)

### 1.1 TESTZIEL
Validierung, dass Design-Daten bei HPOS-aktiviertem System korrekt in `wp_wc_orders_meta` gespeichert werden.

### 1.2 VORBEDINGUNGEN
```sql
-- HPOS-Status überprüfen
SELECT option_value
FROM wp_options
WHERE option_name = 'woocommerce_custom_orders_table_enabled';
-- Erwartetes Ergebnis: 'yes'
```

### 1.3 TESTSCHRITTE

#### Schritt 1: Neue Design-Bestellung erstellen
1. Navigiere zu einem customizable Product (z.B. T-Shirt)
2. Öffne den Designer
3. Füge mindestens 2 Design-Elemente hinzu (Text + Bild)
4. Speichere das Design
5. Füge zum Warenkorb hinzu
6. Schließe Checkout ab

**Erwartetes Ergebnis:**
- Bestellung erfolgreich erstellt
- Bestellnummer notieren (z.B. #5500)

#### Schritt 2: Design-Daten in HPOS-Tabelle validieren
```sql
-- Design-Daten aus HPOS-Tabelle extrahieren
SELECT
    o.id AS order_id,
    o.type,
    om.meta_key,
    LENGTH(om.meta_value) AS data_size_bytes,
    LEFT(om.meta_value, 200) AS preview
FROM wp_wc_orders o
INNER JOIN wp_wc_orders_meta om ON o.id = om.order_id
WHERE o.id = 5500  -- Ersetze mit tatsächlicher Order ID
  AND om.meta_key IN ('_design_data', '_design_data_compressed', '_db_processed_views')
ORDER BY om.meta_key;
```

**Erwartete Ergebnisse:**
| meta_key | Vorhanden | data_size_bytes | Hinweise |
|----------|-----------|-----------------|----------|
| `_design_data` | ✓ | > 1000 | JSON-String mit Design-Daten |
| `_design_data_compressed` | ✓ (optional) | > 500 | Base64-encoded gzip |
| `_db_processed_views` | ✓ | > 500 | Design-Views-Array |

#### Schritt 3: Admin-Preview funktioniert
1. Navigiere zu **WooCommerce → Bestellungen**
2. Öffne die neue Bestellung (#5500)
3. Scrolle zur Meta-Box **"Design Vorschau"**
4. Klicke auf **"Design Vorschau anzeigen"**

**Erwartetes Ergebnis:**
- Canvas wird geladen ohne JavaScript-Fehler
- Design wird korrekt gerendert
- Alle Design-Elemente sind sichtbar (Text + Bild)

**Screenshot-Checkpoint:** `test1-admin-preview.png`

#### Schritt 4: Browser-Konsole validieren
```javascript
// Öffne Browser DevTools (F12)
// Erwartete Logs:
✅ [ADMIN PREVIEW] Design data normalized for preview
✅ AGENT 7: Successfully extracted design data via comprehensive method
✅ DESIGN PREVIEW: Successfully retrieved design data for order 5500
```

**Erwartetes Ergebnis:**
- Keine Fehler in der Konsole
- Alle drei Success-Messages vorhanden

### 1.4 FEHLERBEHEBUNG

**Problem:** Meta-Box nicht sichtbar
```php
// Debugging-Query ausführen
SELECT COUNT(*) as design_data_exists
FROM wp_wc_orders_meta
WHERE order_id = 5500
  AND meta_key = '_design_data'
  AND meta_value IS NOT NULL
  AND meta_value != '';
-- Erwartetes Ergebnis: 1
```

**Lösung:** Wenn `design_data_exists = 0`, wurde Design nicht korrekt gespeichert. Prüfe:
- Frontend-Logs während Checkout
- WooCommerce Error-Logs: `/wp-content/debug.log`

---

## TEST 2: ALTE BESTELLUNG (PRE-HPOS)

### 2.1 TESTZIEL
Validierung der Abwärtskompatibilität mit Legacy-Bestellungen aus `wp_postmeta`.

### 2.2 VORBEDINGUNGEN
```sql
-- Legacy-Bestellung identifizieren (pre-HPOS Migration)
SELECT
    p.ID AS order_id,
    p.post_type,
    p.post_date
FROM wp_posts p
INNER JOIN wp_postmeta pm ON p.ID = pm.post_id
WHERE p.post_type = 'shop_order'
  AND pm.meta_key = '_design_data'
  AND p.post_date < '2024-01-01'  -- Vor HPOS-Migration
ORDER BY p.post_date DESC
LIMIT 1;
```

**Notiere Order ID:** _____________

### 2.3 TESTSCHRITTE

#### Schritt 1: Legacy-Daten in wp_postmeta validieren
```sql
-- Design-Daten aus Legacy-Tabelle extrahieren
SELECT
    post_id AS order_id,
    meta_key,
    LENGTH(meta_value) AS data_size,
    LEFT(meta_value, 200) AS preview
FROM wp_postmeta
WHERE post_id = [LEGACY_ORDER_ID]
  AND meta_key IN ('_design_data', '_db_processed_views', '_mockup_image_url')
ORDER BY meta_key;
```

**Erwartetes Ergebnis:**
- Mindestens `_design_data` vorhanden
- `data_size` > 1000 bytes

#### Schritt 2: WC_Order-Objekt Kompatibilität testen
```php
// In WordPress Debug-Konsole oder Plugin ausführen
$order = wc_get_order([LEGACY_ORDER_ID]);
$design_data = $order->get_meta('_design_data', true);

error_log('Legacy Order Design Data Type: ' . gettype($design_data));
error_log('Legacy Order Design Data Size: ' . strlen($design_data));
error_log('Legacy Order Design Data Preview: ' . substr($design_data, 0, 200));
```

**Erwartete Log-Ausgabe:**
```
Legacy Order Design Data Type: string
Legacy Order Design Data Size: 3456  (Example)
Legacy Order Design Data Preview: {"objects":[{"type":"text",...
```

#### Schritt 3: Admin-Preview für Legacy-Bestellung
1. Navigiere zu **WooCommerce → Bestellungen**
2. Öffne Legacy-Bestellung
3. Prüfe Meta-Box **"Design Vorschau"**
4. Klicke **"Design Vorschau anzeigen"**

**Erwartetes Ergebnis:**
- Preview wird korrekt geladen
- Keine HPOS-spezifischen Fehler
- Design-Rendering identisch zu neuen Bestellungen

**Screenshot-Checkpoint:** `test2-legacy-preview.png`

#### Schritt 4: Datenquellen-Validierung
```javascript
// Browser-Konsole während Preview-Laden
// Erwartete Logs:
🔍 AGENT 7: Attempting comprehensive design data extraction for order [ID]
✅ AGENT 7: Successfully extracted design data via comprehensive method
```

### 2.4 FEHLERBEHEBUNG

**Problem:** Legacy-Daten nicht abrufbar
```sql
-- Manuelle Datenextraktion testen
SELECT
    p.ID,
    pm.meta_value
FROM wp_posts p
INNER JOIN wp_postmeta pm ON p.ID = pm.post_id
WHERE p.ID = [LEGACY_ORDER_ID]
  AND pm.meta_key = '_design_data'
LIMIT 1;
```

**Analyse:**
- Wenn Daten vorhanden aber nicht abrufbar: WC_Order Kompatibilitätsschicht prüfen
- Wenn Daten fehlen: Bestellung hat kein Design (korrekt)

---

## TEST 3: REFRESH-BUTTON (ORDER #5380)

### 3.1 TESTZIEL
Validierung, dass der Refresh-Button in der Admin-Preview ohne Fehler funktioniert.

### 3.2 VORBEDINGUNGEN
```sql
-- Order #5380 Design-Daten validieren
SELECT
    o.id,
    om.meta_key,
    LENGTH(om.meta_value) AS size
FROM wp_wc_orders o
LEFT JOIN wp_wc_orders_meta om ON o.id = om.order_id
WHERE o.id = 5380
  AND om.meta_key IN ('_design_data', '_db_processed_views')
ORDER BY om.meta_key;
```

**Erwartetes Ergebnis:** Mindestens ein Meta-Key vorhanden

### 3.3 TESTSCHRITTE

#### Schritt 1: Initial Preview Laden
1. Öffne Order #5380 in WooCommerce Admin
2. Klicke **"Design Vorschau anzeigen"**
3. Warte bis Canvas vollständig geladen

**Erwartetes Ergebnis:**
- Canvas zeigt Design korrekt an
- Keine Fehler in Browser-Konsole

#### Schritt 2: Refresh-Button Test
1. Öffne Browser DevTools (F12) → Console-Tab
2. Klicke erneut auf **"Design Vorschau anzeigen"** (Refresh)

**Erwartete Konsole-Ausgabe:**
```javascript
🎨 [META BOX] Requesting design preview for order: 5380
🎨 [META BOX] AJAX response: {success: true, data: {...}}
✅ [META BOX] Design data loaded successfully
🎨 [META BOX] Design data stored globally
🎨 [META BOX] Triggered octo-design-preview-ready event
```

**Erwartetes Verhalten:**
- Preview wird neu geladen
- Kein "Flackern" oder Layout-Sprünge
- Canvas wird sauber neu gerendert

#### Schritt 3: Memory Leak Test
1. Drücke Refresh-Button 5x hintereinander
2. Öffne DevTools → Performance Monitor
3. Beobachte **JS Heap Size**

**Erwartetes Ergebnis:**
- Heap Size steigt nicht linear an
- Nach 5 Refreshes < 50MB Anstieg
- Garbage Collector räumt alte Canvas-Instanzen auf

**Screenshot-Checkpoint:** `test3-memory-profile.png`

#### Schritt 4: Network-Request Validierung
1. Öffne DevTools → Network-Tab
2. Filter: `XHR`
3. Klicke Refresh-Button
4. Analysiere AJAX-Request zu `admin-ajax.php`

**Erwartete Request-Parameter:**
```
action: get_order_design_preview
order_id: 5380
nonce: [valid_nonce]
```

**Erwartete Response:**
```json
{
  "success": true,
  "data": {
    "order_id": 5380,
    "design_data": {...},
    "canvas_dimensions": {"width": 780, "height": 580},
    "has_design_data": true,
    "timestamp": "2025-10-02T14:30:00+00:00"
  }
}
```

### 3.4 FEHLERBEHEBUNG

**Problem:** Refresh lädt nicht neu
```javascript
// Browser-Konsole ausführen
console.log('Button Listener:', $('#wc-order-preview-button').data('events'));
```

**Lösung:** Wenn `events = undefined`, jQuery-Listener nicht registriert. Cache leeren + Seite neu laden.

---

## TEST 4: PRINT PROVIDER API

### 4.1 TESTZIEL
Validierung, dass Print Provider API vollständige und korrekte Design-Daten erhält.

### 4.2 VORBEDINGUNGEN
```php
// API-Credentials konfiguriert?
$app_id = get_option('octo_allesklardruck_app_id', '');
$api_key = get_option('octo_allesklardruck_api_key', '');

if (empty($app_id) || empty($api_key)) {
    die('ERROR: API-Credentials nicht konfiguriert!');
}
```

### 4.3 TESTSCHRITTE

#### Schritt 1: API Payload Preview
1. Öffne eine Design-Bestellung (z.B. #5500 aus Test 1)
2. Scrolle zu **"AllesKlarDruck API"** Meta-Box
3. Klicke **"Preview API Payload"**

**Erwartetes Ergebnis:**
- Popup zeigt JSON-Payload
- Payload enthält vollständige Design-Daten

**Screenshot-Checkpoint:** `test4-api-payload-preview.png`

#### Schritt 2: Payload-Struktur validieren
```json
// Erwartete Payload-Struktur
{
  "orderNumber": "5500",
  "orderDate": "2025-10-02T12:00:00+00:00",
  "shipping": {
    "recipient": {
      "name": "Max Mustermann",
      "street": "Teststraße 1",
      "city": "Berlin",
      "postalCode": "10115",
      "country": "DE"
    },
    "sender": {...}
  },
  "orderPositions": [
    {
      "position": "front",
      "width": 250,
      "height": 300,
      "offsetX": 265,
      "offsetY": 140,
      "printFile": "https://example.com/design.png",
      "printSpecifications": {
        "resolution": 300,
        "colorProfile": "CMYK",
        "printQuality": "high"
      }
    }
  ]
}
```

**Validierungs-Checkliste:**
- ✓ `orderPositions` Array nicht leer
- ✓ `width` und `height` > 0
- ✓ `offsetX` und `offsetY` sind Zahlen
- ✓ `printFile` ist valide URL
- ✓ `printSpecifications` vollständig

#### Schritt 3: Design-Daten Vollständigkeit
```sql
-- Vergleiche Payload mit gespeicherten Design-Daten
SELECT
    om.meta_key,
    JSON_LENGTH(om.meta_value, '$.objects') AS design_elements_count
FROM wp_wc_orders_meta om
WHERE om.order_id = 5500
  AND om.meta_key = '_design_data';
```

**Erwartetes Ergebnis:**
- `design_elements_count` entspricht Anzahl in `orderPositions`

#### Schritt 4: API-Request ausführen (OPTIONAL - nur mit gültigen Credentials)
```bash
# Testmodus API-Call (ohne tatsächliche Bestellung)
curl -X POST https://api.allesklardruck.de/order \
  -H "Content-Type: application/json" \
  -H "X-App-ID: [APP_ID]" \
  -H "X-API-Key: [API_KEY]" \
  -d @payload.json
```

**Erwartete Response:**
```json
{
  "success": true,
  "orderId": "AKD-12345",
  "status": "pending"
}
```

#### Schritt 5: API Response in Order Meta validieren
```sql
-- Nach erfolgreicher API-Übertragung
SELECT
    om.meta_key,
    om.meta_value
FROM wp_wc_orders_meta om
WHERE om.order_id = 5500
  AND om.meta_key IN ('_allesklardruck_api_sent', '_allesklardruck_api_response', '_allesklardruck_order_id')
ORDER BY om.meta_key;
```

**Erwartete Meta-Keys:**
| meta_key | Erwarteter Wert | Beschreibung |
|----------|----------------|--------------|
| `_allesklardruck_api_sent` | Unix Timestamp | Zeitstempel der Übertragung |
| `_allesklardruck_api_response` | JSON-String | Vollständige API-Response |
| `_allesklardruck_order_id` | `AKD-12345` | AllesKlarDruck Order ID |

### 4.4 FEHLERBEHEBUNG

**Problem:** Payload unvollständig
```php
// Debug: Design-Daten extrahieren
$order = wc_get_order(5500);
$wc_integration = Octo_Print_Designer_WC_Integration::get_instance();
$extracted_data = $wc_integration->extract_design_data_with_canvas_metadata(5500);

error_log('Extracted Design Data: ' . print_r($extracted_data, true));
```

**Analyse:**
- Wenn `$extracted_data = null`: Design-Daten fehlen in Order Meta
- Wenn `$extracted_data` vorhanden aber Payload leer: Conversion-Fehler in `convert_item_to_api_format()`

---

## SQL-VALIDIERUNGS-QUERIES

### Query 1: HPOS vs. Legacy Verteilung
```sql
-- Anzahl Bestellungen pro Storage-System
SELECT
    'HPOS' AS storage_type,
    COUNT(DISTINCT o.id) AS order_count
FROM wp_wc_orders o
WHERE o.type = 'shop_order'

UNION ALL

SELECT
    'Legacy (postmeta)' AS storage_type,
    COUNT(DISTINCT p.ID) AS order_count
FROM wp_posts p
WHERE p.post_type = 'shop_order'
  AND NOT EXISTS (
      SELECT 1 FROM wp_wc_orders wo WHERE wo.id = p.ID
  );
```

### Query 2: Design-Daten Integrität
```sql
-- Bestellungen mit Design-Daten (HPOS + Legacy)
SELECT
    'HPOS' AS source,
    COUNT(DISTINCT om.order_id) AS orders_with_design
FROM wp_wc_orders_meta om
WHERE om.meta_key = '_design_data'
  AND om.meta_value IS NOT NULL
  AND om.meta_value != ''

UNION ALL

SELECT
    'Legacy' AS source,
    COUNT(DISTINCT pm.post_id) AS orders_with_design
FROM wp_postmeta pm
INNER JOIN wp_posts p ON pm.post_id = p.ID
WHERE pm.meta_key = '_design_data'
  AND p.post_type = 'shop_order'
  AND pm.meta_value IS NOT NULL
  AND pm.meta_value != '';
```

### Query 3: Letzte 10 Design-Bestellungen (Cross-System)
```sql
-- HPOS + Legacy vereint sortiert
SELECT
    'HPOS' AS source,
    o.id AS order_id,
    o.date_created_gmt AS created,
    LENGTH(om.meta_value) AS design_data_size
FROM wp_wc_orders o
INNER JOIN wp_wc_orders_meta om ON o.id = om.order_id
WHERE om.meta_key = '_design_data'

UNION ALL

SELECT
    'Legacy' AS source,
    p.ID AS order_id,
    p.post_date_gmt AS created,
    LENGTH(pm.meta_value) AS design_data_size
FROM wp_posts p
INNER JOIN wp_postmeta pm ON p.ID = pm.post_id
WHERE p.post_type = 'shop_order'
  AND pm.meta_key = '_design_data'

ORDER BY created DESC
LIMIT 10;
```

---

## AUTOMATISIERUNGS-SCRIPT (OPTIONAL)

```php
<?php
/**
 * Automatisierter HPOS-Kompatibilitäts-Test
 * Datei: /wp-content/plugins/octo-print-designer/tests/hpos-compatibility-test.php
 */

class HPOS_Compatibility_Test {

    private $results = [];

    public function run_all_tests() {
        echo "<h1>HPOS Compatibility Test Suite</h1>";

        $this->test_hpos_enabled();
        $this->test_new_order_storage();
        $this->test_legacy_order_compatibility();
        $this->test_admin_preview_functionality();
        $this->test_api_payload_generation();

        $this->display_results();
    }

    private function test_hpos_enabled() {
        $hpos_enabled = get_option('woocommerce_custom_orders_table_enabled') === 'yes';

        $this->results['HPOS Enabled'] = [
            'status' => $hpos_enabled ? 'PASS' : 'FAIL',
            'message' => $hpos_enabled
                ? 'HPOS is enabled (woocommerce_custom_orders_table_enabled = yes)'
                : 'HPOS is NOT enabled! Enable in WooCommerce > Settings > Advanced > Features'
        ];
    }

    private function test_new_order_storage() {
        global $wpdb;

        // Get latest design order
        $latest_order_id = $wpdb->get_var("
            SELECT o.id
            FROM {$wpdb->prefix}wc_orders o
            INNER JOIN {$wpdb->prefix}wc_orders_meta om ON o.id = om.order_id
            WHERE om.meta_key = '_design_data'
            ORDER BY o.date_created_gmt DESC
            LIMIT 1
        ");

        if (!$latest_order_id) {
            $this->results['New Order Storage'] = [
                'status' => 'SKIP',
                'message' => 'No design orders found in wp_wc_orders_meta (Create test order first)'
            ];
            return;
        }

        $order = wc_get_order($latest_order_id);
        $design_data = $order->get_meta('_design_data', true);

        $this->results['New Order Storage'] = [
            'status' => !empty($design_data) ? 'PASS' : 'FAIL',
            'message' => !empty($design_data)
                ? "Order #{$latest_order_id}: Design data retrieved successfully (" . strlen($design_data) . " bytes)"
                : "Order #{$latest_order_id}: Design data retrieval FAILED",
            'order_id' => $latest_order_id
        ];
    }

    private function test_legacy_order_compatibility() {
        global $wpdb;

        // Find legacy order in wp_postmeta
        $legacy_order_id = $wpdb->get_var("
            SELECT p.ID
            FROM {$wpdb->posts} p
            INNER JOIN {$wpdb->postmeta} pm ON p.ID = pm.post_id
            WHERE p.post_type = 'shop_order'
              AND pm.meta_key = '_design_data'
              AND p.post_date < '2024-01-01'
            ORDER BY p.post_date DESC
            LIMIT 1
        ");

        if (!$legacy_order_id) {
            $this->results['Legacy Order Compatibility'] = [
                'status' => 'SKIP',
                'message' => 'No legacy orders found in wp_postmeta (OK for new installations)'
            ];
            return;
        }

        $order = wc_get_order($legacy_order_id);
        $design_data = $order->get_meta('_design_data', true);

        $this->results['Legacy Order Compatibility'] = [
            'status' => !empty($design_data) ? 'PASS' : 'FAIL',
            'message' => !empty($design_data)
                ? "Legacy Order #{$legacy_order_id}: Design data retrieved via WC_Order abstraction (" . strlen($design_data) . " bytes)"
                : "Legacy Order #{$legacy_order_id}: Design data retrieval FAILED",
            'order_id' => $legacy_order_id
        ];
    }

    private function test_admin_preview_functionality() {
        // Test if WC Integration class has HPOS-compatible methods
        if (!class_exists('Octo_Print_Designer_WC_Integration')) {
            $this->results['Admin Preview'] = [
                'status' => 'FAIL',
                'message' => 'Octo_Print_Designer_WC_Integration class not found'
            ];
            return;
        }

        $wc_integration = Octo_Print_Designer_WC_Integration::get_instance();

        // Check if has_design_data method exists
        $has_method = method_exists($wc_integration, 'has_design_data');

        $this->results['Admin Preview'] = [
            'status' => $has_method ? 'PASS' : 'FAIL',
            'message' => $has_method
                ? 'has_design_data() method exists for admin preview detection'
                : 'has_design_data() method MISSING - admin preview may not work'
        ];
    }

    private function test_api_payload_generation() {
        global $wpdb;

        // Get any design order
        $test_order_id = $wpdb->get_var("
            SELECT o.id
            FROM {$wpdb->prefix}wc_orders o
            INNER JOIN {$wpdb->prefix}wc_orders_meta om ON o.id = om.order_id
            WHERE om.meta_key = '_design_data'
            LIMIT 1
        ");

        if (!$test_order_id) {
            $this->results['API Payload Generation'] = [
                'status' => 'SKIP',
                'message' => 'No test order available'
            ];
            return;
        }

        $order = wc_get_order($test_order_id);

        if (!class_exists('Octo_Print_API_Integration')) {
            $this->results['API Payload Generation'] = [
                'status' => 'FAIL',
                'message' => 'Octo_Print_API_Integration class not found'
            ];
            return;
        }

        $api_integration = Octo_Print_API_Integration::get_instance();
        $payload = $api_integration->build_api_payload($order);

        $payload_valid = !is_wp_error($payload) &&
                        isset($payload['orderPositions']) &&
                        !empty($payload['orderPositions']);

        $this->results['API Payload Generation'] = [
            'status' => $payload_valid ? 'PASS' : 'FAIL',
            'message' => $payload_valid
                ? "Order #{$test_order_id}: API payload generated successfully (" . count($payload['orderPositions']) . " positions)"
                : "Order #{$test_order_id}: API payload generation FAILED - " . (is_wp_error($payload) ? $payload->get_error_message() : 'Unknown error'),
            'order_id' => $test_order_id
        ];
    }

    private function display_results() {
        echo "<h2>Test Results</h2>";
        echo "<table border='1' cellpadding='10' style='border-collapse: collapse; width: 100%;'>";
        echo "<tr><th>Test</th><th>Status</th><th>Message</th></tr>";

        foreach ($this->results as $test_name => $result) {
            $color = match($result['status']) {
                'PASS' => '#28a745',
                'FAIL' => '#dc3545',
                'SKIP' => '#ffc107',
                default => '#6c757d'
            };

            echo "<tr>";
            echo "<td><strong>{$test_name}</strong></td>";
            echo "<td style='background-color: {$color}; color: white; text-align: center;'><strong>{$result['status']}</strong></td>";
            echo "<td>{$result['message']}</td>";
            echo "</tr>";
        }

        echo "</table>";

        $passed = count(array_filter($this->results, fn($r) => $r['status'] === 'PASS'));
        $total = count(array_filter($this->results, fn($r) => $r['status'] !== 'SKIP'));

        echo "<h3>Summary: {$passed}/{$total} tests passed</h3>";
    }
}

// Execute test suite (only for administrators)
if (current_user_can('administrator')) {
    $test = new HPOS_Compatibility_Test();
    $test->run_all_tests();
}
```

**Ausführung:**
1. Datei speichern unter: `/wp-content/plugins/octo-print-designer/tests/hpos-compatibility-test.php`
2. Browser: `https://yoursite.com/?hpos_test=1`
3. Füge in `functions.php` hinzu:
```php
add_action('init', function() {
    if (isset($_GET['hpos_test']) && current_user_can('administrator')) {
        require_once WP_PLUGIN_DIR . '/octo-print-designer/tests/hpos-compatibility-test.php';
        exit;
    }
});
```

---

## CHECKLISTE FÜR PRODUKTIONS-DEPLOYMENT

### Pre-Deployment
- [ ] HPOS in Staging-Umgebung aktiviert
- [ ] Alle 4 Testkategorien erfolgreich durchlaufen
- [ ] Mindestens 10 Test-Bestellungen erstellt und validiert
- [ ] API-Integration mit Testmodus getestet
- [ ] Performance-Tests durchgeführt (Memory Leaks, Load Times)

### Deployment
- [ ] Backup der Datenbank erstellt
- [ ] HPOS in Produktion aktivieren: **WooCommerce → Settings → Advanced → Features → "High-Performance order storage" = Enabled**
- [ ] Nach Aktivierung: 5 neue Design-Bestellungen überwachen
- [ ] Legacy-Bestellungen Stichproben-Check (min. 5 Orders)

### Post-Deployment
- [ ] Error-Logs 24h überwachen: `/wp-content/debug.log`
- [ ] Admin-Preview bei 10 zufälligen Bestellungen testen
- [ ] API-Übertragungen validieren (min. 3 Orders)
- [ ] Performance-Metriken mit Pre-Deployment vergleichen

---

## SUPPORT-KONTAKTE

**Bei Problemen:**
1. **Database Issues:** Führe SQL-Validierungs-Queries aus (siehe Abschnitt oben)
2. **JavaScript Errors:** Browser-Konsole Screenshot + `/wp-content/debug.log` bereitstellen
3. **API Failures:** `_allesklardruck_api_response` Meta-Key aus fehlgeschlagener Order extrahieren

**Debug-Modus aktivieren:**
```php
// wp-config.php
define('WP_DEBUG', true);
define('WP_DEBUG_LOG', true);
define('WP_DEBUG_DISPLAY', false);
```

---

## DOKUMENTEN-HISTORIE

| Version | Datum | Änderungen |
|---------|-------|------------|
| 1.0 | 2025-10-02 | Initiale Version - 4 Haupttests definiert |

---

**Ende des Testplans**
