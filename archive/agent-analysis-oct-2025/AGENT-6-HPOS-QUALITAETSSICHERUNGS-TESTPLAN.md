# AGENT 6: HPOS QUALITÄTSSICHERUNGS- & TESTPLAN

**Version:** 1.0
**Erstellt:** 2025-10-02
**Plugin:** Octonove Print Designer v1.0.9
**Zielsystem:** WooCommerce High-Performance Order Storage (HPOS) Kompatibilität

---

## EXECUTIVE SUMMARY

Dieser Testplan validiert den HPOS-Fix für das YPrint Design Tool. Das System wurde von Legacy-`get_post_meta()`/`update_post_meta()` Aufrufen auf HPOS-kompatible `$order->get_meta()`/`$order->update_meta_data()` Methoden migriert.

**Kritische Erkenntnisse aus vorheriger Analyse:**
- **23 Instanzen** in `/includes/class-octo-print-api-integration.php` und `/includes/class-octo-print-designer-wc-integration.php` identifiziert
- **Fix bereits implementiert** (Commit `1eed4b2`)
- **5 verbleibende Instanzen** noch nicht migriert (siehe unten)

**Testumfang:**
1. Pre-Fix Baseline Tests (IST-Zustand dokumentieren)
2. Post-Fix Validation Tests (SOLL-Zustand validieren)
3. Regression Tests (Backward Compatibility)
4. Edge Case Tests (Fehlerbehandlung)
5. SQL-basierte Validation Queries

---

## 1. PRE-FIX BASELINE TESTS

### 1.1 Test: Neue Order erstellen (HPOS aktiv)

**Ziel:** Dokumentiere aktuellen IST-Zustand mit aktiviertem HPOS.

**Vorbedingungen:**
```sql
-- HPOS-Status prüfen
SELECT option_value
FROM deo6_options
WHERE option_name = 'woocommerce_custom_orders_table_enabled';
-- Erwartetes Ergebnis: 'yes'
```

**Testschritte:**

#### Schritt 1: Design-Bestellung erstellen
1. Öffne Designer: `https://yoursite.com/designer/?product_id=123`
2. Füge mindestens 2 Design-Elemente hinzu (Text + Bild)
3. Speichere Design
4. Füge zum Warenkorb hinzu
5. Schließe Checkout ab
6. **Notiere Order ID:** _____________

#### Schritt 2: SQL-Query - Design-Daten in HPOS-Tabelle prüfen
```sql
-- PRE-FIX: Design-Daten in wp_wc_orders_meta prüfen
SELECT
    o.id AS order_id,
    o.date_created_gmt,
    om.meta_key,
    LENGTH(om.meta_value) AS data_size,
    LEFT(om.meta_value, 100) AS preview
FROM deo6_wc_orders o
LEFT JOIN deo6_wc_orders_meta om ON o.id = om.order_id
WHERE o.id = [ORDER_ID]  -- Ersetze mit tatsächlicher Order ID
  AND om.meta_key IN ('_design_data', '_db_processed_views', '_design_data_compressed')
ORDER BY om.meta_key;
```

**Erwartetes Ergebnis (PRE-FIX):**
- **Falls Fix noch nicht angewendet:** `_design_data` ist NULL oder fehlt in `wp_wc_orders_meta`
- **Falls Fix bereits angewendet:** `_design_data` vorhanden mit > 1000 bytes

**Dokumentation:**
| Meta Key | Vorhanden? | Data Size (bytes) | Hinweise |
|----------|------------|-------------------|----------|
| `_design_data` | ☐ Ja / ☐ Nein | ________ | ________________ |
| `_db_processed_views` | ☐ Ja / ☐ Nein | ________ | ________________ |
| `_design_data_compressed` | ☐ Ja / ☐ Nein | ________ | ________________ |

---

### 1.2 Test: SQL-Query zeigt KEINE _design_data (falls Pre-Fix)

**Ziel:** Beweise, dass Design-Daten NICHT in HPOS-Tabelle gespeichert werden (nur bei pre-fix Systemen).

**SQL-Query:**
```sql
-- Prüfe ob Design-Daten in Legacy-Tabelle statt HPOS
SELECT
    'Legacy (wp_postmeta)' AS data_source,
    COUNT(*) AS design_data_count
FROM deo6_postmeta pm
INNER JOIN deo6_posts p ON pm.post_id = p.ID
WHERE p.post_type = 'shop_order'
  AND pm.meta_key = '_design_data'
  AND pm.meta_value IS NOT NULL
  AND pm.meta_value != ''

UNION ALL

SELECT
    'HPOS (wp_wc_orders_meta)' AS data_source,
    COUNT(*) AS design_data_count
FROM deo6_wc_orders_meta om
WHERE om.meta_key = '_design_data'
  AND om.meta_value IS NOT NULL
  AND om.meta_value != '';
```

**Erwartetes Ergebnis (PRE-FIX):**
| data_source | design_data_count |
|-------------|------------------|
| Legacy (wp_postmeta) | > 0 |
| HPOS (wp_wc_orders_meta) | 0 oder sehr niedrig |

**Erwartetes Ergebnis (POST-FIX):**
| data_source | design_data_count |
|-------------|------------------|
| Legacy (wp_postmeta) | Alte Bestellungen |
| HPOS (wp_wc_orders_meta) | Neue Bestellungen |

---

### 1.3 Test: Admin Preview zeigt "No design data found"

**Ziel:** Dokumentiere Fehlerfall, wenn Design-Daten nicht aus HPOS geladen werden können.

**Testschritte:**
1. Öffne WooCommerce → Bestellungen
2. Öffne die Test-Order aus Schritt 1.1
3. Scrolle zu Meta-Box **"Design Vorschau"**
4. Klicke **"Design Vorschau anzeigen"**

**Erwartetes Verhalten (PRE-FIX):**
- ❌ Meta-Box zeigt **"No design data found for this order"**
- ❌ Browser-Konsole zeigt Fehler: `"Failed to retrieve design data for order [ID]"`

**Erwartetes Verhalten (POST-FIX):**
- ✅ Canvas wird geladen
- ✅ Design wird korrekt gerendert
- ✅ Keine Fehler in Browser-Konsole

**Screenshot-Checkpoint:** `test-1.3-admin-preview-prefix.png`

**Browser-Konsole Log:**
```
[Kopiere hier die Browser-Konsole-Ausgabe]
```

---

## 2. POST-FIX VALIDATION TESTS

### 2.1 Test: Neue Order erstellen (nach Fix)

**Ziel:** Validiere, dass Design-Daten korrekt in `wp_wc_orders_meta` gespeichert werden.

**Vorbedingungen:**
- Fix implementiert (siehe Abschnitt 6: Code-Änderungen)
- Cache geleert (`wp cache flush`)
- Browser-Cache geleert (Strg+F5)

**Testschritte:**

#### Schritt 1: Neue Design-Bestellung erstellen
1. Öffne Designer (neue Browser-Session)
2. Erstelle Design mit mindestens:
   - 1x Text-Element (Koordinaten notieren: ________)
   - 1x Bild-Element (Koordinaten notieren: ________)
3. Speichere Design
4. Checkout abschließen
5. **Notiere Order ID:** _____________

#### Schritt 2: SQL-Query - Design-Daten validieren
```sql
-- POST-FIX: Validiere Design-Daten in HPOS-Tabelle
SELECT
    o.id AS order_id,
    o.type,
    o.status,
    o.date_created_gmt,
    om.meta_key,
    LENGTH(om.meta_value) AS data_size_bytes,
    -- JSON-Struktur validieren
    CASE
        WHEN om.meta_value LIKE '%"objects"%' THEN '✅ Has objects'
        ELSE '❌ Missing objects'
    END AS has_objects,
    CASE
        WHEN om.meta_value LIKE '%"metadata"%' THEN '✅ Has metadata'
        ELSE '❌ Missing metadata'
    END AS has_metadata,
    CASE
        WHEN om.meta_value LIKE '%"capture_version"%' THEN '✅ Has capture_version'
        ELSE '❌ Missing capture_version'
    END AS has_capture_version,
    LEFT(om.meta_value, 200) AS preview
FROM deo6_wc_orders o
INNER JOIN deo6_wc_orders_meta om ON o.id = om.order_id
WHERE o.id = [ORDER_ID]  -- Ersetze mit Order ID aus Schritt 1
  AND om.meta_key = '_design_data'
LIMIT 1;
```

**Erwartete Ergebnisse:**
| Feld | Erwarteter Wert | Tatsächlicher Wert |
|------|----------------|-------------------|
| `order_id` | [ORDER_ID] | ________ |
| `type` | shop_order | ________ |
| `data_size_bytes` | > 1000 | ________ |
| `has_objects` | ✅ Has objects | ________ |
| `has_metadata` | ✅ Has metadata | ________ |
| `has_capture_version` | ✅ Has capture_version | ________ |

**Screenshot-Checkpoint:** `test-2.1-sql-validation.png`

---

### 2.2 Test: SQL-Query zeigt _design_data in deo6_wc_orders_meta

**Ziel:** Beweise, dass neue Bestellungen ausschließlich in HPOS-Tabelle gespeichert werden.

**SQL-Query:**
```sql
-- Vergleiche Speicherorte für neue Bestellung
SELECT
    'HPOS (wp_wc_orders_meta)' AS storage,
    COUNT(*) AS count,
    MAX(LENGTH(meta_value)) AS max_size
FROM deo6_wc_orders_meta
WHERE order_id = [ORDER_ID]
  AND meta_key = '_design_data'

UNION ALL

SELECT
    'Legacy (wp_postmeta)' AS storage,
    COUNT(*) AS count,
    MAX(LENGTH(meta_value)) AS max_size
FROM deo6_postmeta
WHERE post_id = [ORDER_ID]
  AND meta_key = '_design_data';
```

**Erwartetes Ergebnis:**
| storage | count | max_size |
|---------|-------|----------|
| HPOS (wp_wc_orders_meta) | 1 | > 1000 |
| Legacy (wp_postmeta) | 0 | NULL |

**Test BESTANDEN wenn:**
- ✅ HPOS count = 1
- ✅ Legacy count = 0
- ✅ max_size > 1000 bytes

---

### 2.3 Test: Admin Preview lädt Design korrekt

**Ziel:** Validiere Admin-Preview-Funktionalität nach Fix.

**Testschritte:**

#### Schritt 1: Admin-Preview öffnen
1. WooCommerce → Bestellungen
2. Öffne Order [ORDER_ID] aus Test 2.1
3. Meta-Box **"Design Vorschau"** suchen
4. Klicke **"Design Vorschau anzeigen"**

**Erwartetes Verhalten:**
- ✅ Canvas wird ohne Fehler geladen
- ✅ Design-Elemente werden korrekt gerendert
- ✅ Koordinaten entsprechen gespeicherten Werten

#### Schritt 2: Browser-Konsole validieren
```javascript
// Erwartete Logs in Browser-Konsole:
[ADMIN PREVIEW] Design data normalized for preview
AGENT 7: Successfully extracted design data via comprehensive method
DESIGN PREVIEW: Successfully retrieved design data for order [ORDER_ID]
✅ Canvas initialized with dimensions: 780 x 580
```

**Screenshot-Checkpoint:** `test-2.3-admin-preview-success.png`

**Konsole-Log (Copy-Paste):**
```
[Kopiere hier die vollständige Konsole-Ausgabe]
```

---

### 2.4 Test: Refresh-Button funktioniert

**Ziel:** Validiere, dass Admin-Preview Refresh-Funktionalität ohne Fehler arbeitet.

**Testschritte:**

#### Schritt 1: Initial Preview Laden
1. Öffne Order [ORDER_ID]
2. Klicke **"Design Vorschau anzeigen"**
3. Warte bis Canvas vollständig geladen

#### Schritt 2: Refresh-Button 5x drücken
1. Öffne Browser DevTools (F12) → Console
2. Klicke 5x auf **"Design Vorschau anzeigen"** (Refresh)
3. Beobachte Konsole-Ausgabe

**Erwartete Konsole-Ausgabe (pro Refresh):**
```javascript
🎨 [META BOX] Requesting design preview for order: [ORDER_ID]
🎨 [META BOX] AJAX response: {success: true, data: {...}}
✅ [META BOX] Design data loaded successfully
🎨 [META BOX] Design data stored globally
🎨 [META BOX] Triggered octo-design-preview-ready event
```

**Erwartetes Verhalten:**
- ✅ Preview wird neu geladen (ohne Seiten-Reload)
- ✅ Kein "Flackern" oder Layout-Sprünge
- ✅ Keine Memory Leaks (Heap Size < 50MB Anstieg nach 5 Refreshes)

#### Schritt 3: Network-Request validieren
1. DevTools → Network-Tab
2. Filter: `XHR`
3. Klicke Refresh-Button
4. Analysiere AJAX-Request zu `admin-ajax.php`

**Erwartete Request-Parameter:**
```
POST /wp-admin/admin-ajax.php
action: get_order_design_preview
order_id: [ORDER_ID]
nonce: [valid_nonce]
```

**Erwartete Response:**
```json
{
  "success": true,
  "data": {
    "order_id": [ORDER_ID],
    "design_data": {
      "objects": [...],
      "metadata": {
        "capture_version": "3.0.0",
        "source": "designer"
      }
    },
    "canvas_dimensions": {"width": 780, "height": 580},
    "has_design_data": true,
    "timestamp": "2025-10-02T14:30:00+00:00"
  }
}
```

**Screenshot-Checkpoint:** `test-2.4-network-validation.png`

---

## 3. REGRESSION TESTS

### 3.1 Test: Legacy Orders (Pre-HPOS) funktionieren weiterhin

**Ziel:** Sicherstellen, dass alte Bestellungen (gespeichert in `wp_postmeta`) nach HPOS-Aktivierung noch funktionieren.

**Vorbedingungen:**
```sql
-- Finde Legacy-Bestellung mit Design-Daten
SELECT
    p.ID AS order_id,
    p.post_date,
    LENGTH(pm.meta_value) AS design_data_size
FROM deo6_posts p
INNER JOIN deo6_postmeta pm ON p.ID = pm.post_id
WHERE p.post_type = 'shop_order'
  AND pm.meta_key = '_design_data'
  AND pm.meta_value IS NOT NULL
  AND p.post_date < '2025-10-01'  -- Vor HPOS-Aktivierung
ORDER BY p.post_date DESC
LIMIT 1;
```

**Notiere Legacy Order ID:** _____________

**Testschritte:**

#### Schritt 1: WC_Order-Objekt Kompatibilität
```php
// In WordPress Debug-Konsole oder Code Snippets Plugin
$order = wc_get_order([LEGACY_ORDER_ID]);
if (!$order) {
    error_log('❌ FAILED: Order not found');
} else {
    $design_data = $order->get_meta('_design_data', true);
    error_log('Design Data Type: ' . gettype($design_data));
    error_log('Design Data Size: ' . strlen($design_data) . ' bytes');
    error_log('Design Data Preview: ' . substr($design_data, 0, 200));

    if (!empty($design_data)) {
        error_log('✅ PASSED: Legacy design data retrieved via WC_Order');
    } else {
        error_log('❌ FAILED: Legacy design data NOT retrieved');
    }
}
```

**Erwartete Log-Ausgabe:**
```
Design Data Type: string
Design Data Size: 3456 bytes (Example)
Design Data Preview: {"objects":[{"type":"text",...
✅ PASSED: Legacy design data retrieved via WC_Order
```

#### Schritt 2: Admin-Preview für Legacy-Order
1. WooCommerce → Bestellungen
2. Öffne Legacy-Order [LEGACY_ORDER_ID]
3. Klicke **"Design Vorschau anzeigen"**

**Erwartetes Verhalten:**
- ✅ Preview wird korrekt geladen
- ✅ Design-Rendering identisch zu neuen Bestellungen
- ✅ Keine HPOS-spezifischen Fehler

**Screenshot-Checkpoint:** `test-3.1-legacy-preview.png`

#### Schritt 3: Datenquellen-Validierung
```javascript
// Browser-Konsole während Preview-Laden
// Erwartete Logs:
🔍 AGENT 7: Attempting comprehensive design data extraction for order [LEGACY_ORDER_ID]
✅ AGENT 7: Successfully extracted design data via comprehensive method
```

---

### 3.2 Test: wp_postmeta Daten werden korrekt gelesen

**Ziel:** Verifiziere, dass `$order->get_meta()` korrekt auf Legacy-Daten in `wp_postmeta` zugreift.

**SQL-Query - Legacy-Daten extrahieren:**
```sql
-- Legacy-Daten direkt aus wp_postmeta
SELECT
    pm.post_id AS order_id,
    pm.meta_key,
    LENGTH(pm.meta_value) AS data_size,
    CASE
        WHEN pm.meta_value LIKE '%"objects"%' THEN '✅'
        ELSE '❌'
    END AS has_objects,
    LEFT(pm.meta_value, 150) AS preview
FROM deo6_postmeta pm
INNER JOIN deo6_posts p ON pm.post_id = p.ID
WHERE p.ID = [LEGACY_ORDER_ID]
  AND pm.meta_key IN ('_design_data', '_db_processed_views', '_mockup_image_url')
ORDER BY pm.meta_key;
```

**Erwartetes Ergebnis:**
| meta_key | data_size | has_objects | preview |
|----------|-----------|------------|---------|
| `_design_data` | > 1000 | ✅ | {"objects":[... |

**PHP-Validierung:**
```php
// Vergleiche direkte SQL-Abfrage mit WC_Order-Methode
global $wpdb;

// Methode 1: Direkte SQL-Abfrage
$direct_meta = $wpdb->get_var($wpdb->prepare(
    "SELECT meta_value FROM {$wpdb->postmeta} WHERE post_id = %d AND meta_key = '_design_data'",
    [LEGACY_ORDER_ID]
));

// Methode 2: WC_Order-Methode
$order = wc_get_order([LEGACY_ORDER_ID]);
$wc_meta = $order->get_meta('_design_data', true);

// Vergleich
if ($direct_meta === $wc_meta) {
    error_log('✅ PASSED: WC_Order->get_meta() returns identical data to direct SQL query');
} else {
    error_log('❌ FAILED: Data mismatch between SQL and WC_Order');
    error_log('Direct SQL size: ' . strlen($direct_meta));
    error_log('WC_Order size: ' . strlen($wc_meta));
}
```

**Test BESTANDEN wenn:**
- ✅ `$direct_meta === $wc_meta` (Identische Daten)
- ✅ Beide Methoden liefern gültige JSON-Struktur

---

### 3.3 Test: Backward Compatibility gewährleistet

**Ziel:** Sicherstellen, dass KEINE Legacy-Funktionalität gebrochen wurde.

**Testmatrix:**

| Feature | Legacy Order (pre-HPOS) | New Order (HPOS) | Status |
|---------|------------------------|------------------|--------|
| Admin Preview laden | ☐ Funktioniert | ☐ Funktioniert | ☐ PASSED |
| Design-Daten abrufen | ☐ Funktioniert | ☐ Funktioniert | ☐ PASSED |
| Print Provider Email senden | ☐ Funktioniert | ☐ Funktioniert | ☐ PASSED |
| API Payload generieren | ☐ Funktioniert | ☐ Funktioniert | ☐ PASSED |
| Order Item Meta anzeigen | ☐ Funktioniert | ☐ Funktioniert | ☐ PASSED |

**Testschritte pro Feature:**

#### Test 3.3.1: Admin Preview laden
- Legacy Order: Order #________ → Preview öffnen → ☐ Erfolg
- New Order: Order #________ → Preview öffnen → ☐ Erfolg

#### Test 3.3.2: Design-Daten abrufen (PHP)
```php
$legacy_order = wc_get_order([LEGACY_ORDER_ID]);
$legacy_data = $legacy_order->get_meta('_design_data', true);
// ✅ PASSED wenn: !empty($legacy_data)

$new_order = wc_get_order([NEW_ORDER_ID]);
$new_data = $new_order->get_meta('_design_data', true);
// ✅ PASSED wenn: !empty($new_data)
```

#### Test 3.3.3: Print Provider Email (manuell)
- Legacy Order: Meta-Box öffnen → Email senden → ☐ Email erhalten
- New Order: Meta-Box öffnen → Email senden → ☐ Email erhalten

#### Test 3.3.4: API Payload (Preview)
- Legacy Order: "Preview API Payload" klicken → ☐ JSON angezeigt
- New Order: "Preview API Payload" klicken → ☐ JSON angezeigt

**Test BESTANDEN wenn:**
- ✅ Alle 4 Features funktionieren für BEIDE Order-Typen
- ✅ Keine Unterschiede im Verhalten

---

## 4. EDGE CASE TESTS

### 4.1 Test: Order ohne Design-Daten

**Ziel:** Validiere Fehlerbehandlung bei Bestellungen ohne Design.

**Testschritte:**

#### Schritt 1: Standard-Bestellung erstellen (kein Design)
1. Füge ein **nicht-customizable** Produkt zum Warenkorb hinzu
2. Checkout abschließen
3. **Notiere Order ID:** _____________

#### Schritt 2: Admin-Preview aufrufen
1. WooCommerce → Bestellungen → Order [ORDER_ID]
2. Prüfe Meta-Box **"Design Vorschau"**

**Erwartetes Verhalten:**
- ✅ Meta-Box zeigt: **"No design data found for this order"**
- ✅ Kein JavaScript-Fehler in Konsole
- ✅ Kein PHP-Fatal-Error in `/wp-content/debug.log`

**SQL-Query - Bestätigung:**
```sql
-- Prüfe ob Meta wirklich fehlt
SELECT COUNT(*) AS design_data_exists
FROM deo6_wc_orders_meta
WHERE order_id = [ORDER_ID]
  AND meta_key = '_design_data';
-- Erwartetes Ergebnis: 0
```

**Screenshot-Checkpoint:** `test-4.1-no-design-data.png`

---

### 4.2 Test: Sehr große Design-Daten (>1MB)

**Ziel:** Validiere Handling von großen Designs mit vielen Elementen.

**Vorbereitung:**
```javascript
// Im Designer: Erstelle großes Design
const largeDesign = {
    objects: [],
    metadata: {
        capture_version: '3.0.0',
        source: 'designer',
        designer_offset: {top: 0, left: 0}
    }
};

// Füge 500 Text-Elemente hinzu (simuliert große Design-Datei)
for (let i = 0; i < 500; i++) {
    largeDesign.objects.push({
        type: 'text',
        left: Math.random() * 500,
        top: Math.random() * 500,
        text: 'Test Element ' + i,
        fontSize: 12,
        fontFamily: 'Arial'
    });
}

console.log('Design size:', JSON.stringify(largeDesign).length, 'bytes');
// Erwartete Ausgabe: > 50000 bytes

// Speichere Design
window.designerInstance.saveDesign(largeDesign);
```

**Testschritte:**

#### Schritt 1: Großes Design speichern
1. Führe obigen Code in Browser-Konsole aus
2. Checkout abschließen
3. **Notiere Order ID:** _____________

#### Schritt 2: SQL-Query - Datengröße prüfen
```sql
SELECT
    om.order_id,
    LENGTH(om.meta_value) AS size_bytes,
    ROUND(LENGTH(om.meta_value) / 1024, 2) AS size_kb,
    ROUND(LENGTH(om.meta_value) / 1024 / 1024, 2) AS size_mb
FROM deo6_wc_orders_meta om
WHERE om.order_id = [ORDER_ID]
  AND om.meta_key = '_design_data';
```

**Erwartetes Ergebnis:**
| size_bytes | size_kb | size_mb | Status |
|------------|---------|---------|--------|
| > 50000 | > 50 | < 2 | ✅ Akzeptabel |

**Test BESTANDEN wenn:**
- ✅ Design-Daten vollständig gespeichert (kein Truncate)
- ✅ Admin-Preview lädt (evtl. langsamer, aber ohne Fehler)
- ✅ Keine Datenbank-Fehler

#### Schritt 3: Admin-Preview Performance
1. Öffne Admin-Preview für Order [ORDER_ID]
2. Messe Ladezeit (DevTools → Performance-Tab)

**Erwartetes Verhalten:**
- ✅ Ladezeit < 5 Sekunden
- ✅ Keine Browser-Freezes
- ✅ Alle 500 Elemente gerendert

**Screenshot-Checkpoint:** `test-4.2-large-design.png`

---

### 4.3 Test: Korrupte JSON-Daten

**Ziel:** Validiere Fehlerbehandlung bei ungültigen JSON-Daten.

**Vorbereitung:**
```sql
-- Erstelle Test-Order mit korrupten Daten
-- ACHTUNG: NUR in Testumgebung ausführen!
INSERT INTO deo6_wc_orders_meta (order_id, meta_key, meta_value)
VALUES (
    9999,  -- Verwende nicht-existente Order ID
    '_design_data',
    '{"objects": [invalid json here'  -- Absichtlich korrupte JSON
);
```

**Testschritte:**

#### Schritt 1: PHP-Handling testen
```php
$order = wc_get_order(9999);
$design_data = $order->get_meta('_design_data', true);

// Versuche JSON zu parsen
$parsed = json_decode($design_data, true);

if (json_last_error() !== JSON_ERROR_NONE) {
    error_log('✅ PASSED: JSON error correctly detected: ' . json_last_error_msg());
} else {
    error_log('❌ FAILED: Corrupt JSON not detected');
}
```

**Erwartete Log-Ausgabe:**
```
✅ PASSED: JSON error correctly detected: Syntax error
```

#### Schritt 2: Admin-Preview Graceful Degradation
1. Öffne Admin-Preview für Order #9999
2. Prüfe Fehlerbehandlung

**Erwartetes Verhalten:**
- ✅ Keine PHP Fatal Errors
- ✅ User-freundliche Fehlermeldung: **"Invalid design data format"**
- ✅ Error geloggt in `/wp-content/debug.log`

**Cleanup:**
```sql
-- Nach Test: Test-Daten löschen
DELETE FROM deo6_wc_orders_meta WHERE order_id = 9999;
```

---

### 4.4 Test: Gleichzeitige Save-Operationen

**Ziel:** Validiere Race Conditions bei parallelen Order-Erstellungen.

**Vorbereitung:**
```bash
# Installiere Apache Benchmark (falls nicht vorhanden)
sudo apt-get install apache2-utils
```

**Testschritte:**

#### Schritt 1: Parallel-Requests simulieren
```bash
# Erstelle 10 gleichzeitige Checkout-Requests
ab -n 10 -c 10 -p checkout-data.json -T application/json \
   https://yoursite.com/wp-admin/admin-ajax.php?action=woocommerce_checkout
```

**Erwartetes Verhalten:**
- ✅ Alle 10 Bestellungen erfolgreich erstellt
- ✅ Jede Bestellung hat korrekte `_design_data`
- ✅ Keine Daten-Überschreibungen zwischen Orders

#### Schritt 2: SQL-Validierung
```sql
-- Prüfe alle neu erstellten Orders
SELECT
    o.id,
    COUNT(om.meta_id) AS design_data_count,
    LENGTH(om.meta_value) AS size
FROM deo6_wc_orders o
LEFT JOIN deo6_wc_orders_meta om ON o.id = om.order_id AND om.meta_key = '_design_data'
WHERE o.date_created_gmt > DATE_SUB(NOW(), INTERVAL 1 MINUTE)
GROUP BY o.id;
```

**Erwartetes Ergebnis:**
| id | design_data_count | size |
|----|------------------|------|
| 5501 | 1 | 2345 |
| 5502 | 1 | 2345 |
| ... | ... | ... |
| 5510 | 1 | 2345 |

**Test BESTANDEN wenn:**
- ✅ `design_data_count = 1` für ALLE Orders (keine Duplikate)
- ✅ Alle `size` > 1000 bytes (keine leeren Daten)

---

## 5. SQL-BASIERTE VALIDATION QUERIES

### Query 1: HPOS vs. Legacy Verteilung

**Zweck:** Übersicht über Datenverteilung zwischen HPOS und Legacy-System.

```sql
-- Anzahl Bestellungen pro Storage-System
SELECT
    'HPOS (wp_wc_orders_meta)' AS storage_type,
    COUNT(DISTINCT o.id) AS total_orders,
    COUNT(DISTINCT CASE WHEN om.meta_key = '_design_data' THEN o.id END) AS orders_with_design,
    ROUND(
        COUNT(DISTINCT CASE WHEN om.meta_key = '_design_data' THEN o.id END) * 100.0 /
        COUNT(DISTINCT o.id),
        2
    ) AS design_percentage
FROM deo6_wc_orders o
LEFT JOIN deo6_wc_orders_meta om ON o.id = om.order_id
WHERE o.type = 'shop_order'

UNION ALL

SELECT
    'Legacy (wp_postmeta)' AS storage_type,
    COUNT(DISTINCT p.ID) AS total_orders,
    COUNT(DISTINCT CASE WHEN pm.meta_key = '_design_data' THEN p.ID END) AS orders_with_design,
    ROUND(
        COUNT(DISTINCT CASE WHEN pm.meta_key = '_design_data' THEN p.ID END) * 100.0 /
        COUNT(DISTINCT p.ID),
        2
    ) AS design_percentage
FROM deo6_posts p
LEFT JOIN deo6_postmeta pm ON p.ID = pm.post_id
WHERE p.post_type = 'shop_order'
  AND NOT EXISTS (
      SELECT 1 FROM deo6_wc_orders wo WHERE wo.id = p.ID
  );
```

**Erwartete Ausgabe (POST-FIX):**
| storage_type | total_orders | orders_with_design | design_percentage |
|--------------|--------------|-------------------|------------------|
| HPOS (wp_wc_orders_meta) | 150 | 45 | 30.00 |
| Legacy (wp_postmeta) | 300 | 90 | 30.00 |

**Analyse:**
- `design_percentage` sollte ähnlich sein (ca. 30% haben Designs)
- HPOS `total_orders` wächst nach Fix-Implementierung

---

### Query 2: Design-Daten Integrität

**Zweck:** Validiere, dass alle Design-Daten vollständig und korrekt gespeichert sind.

```sql
-- Bestellungen mit Design-Daten (HPOS + Legacy) - Integrität prüfen
SELECT
    'HPOS' AS source,
    COUNT(DISTINCT om.order_id) AS orders_with_design,
    AVG(LENGTH(om.meta_value)) AS avg_size_bytes,
    MIN(LENGTH(om.meta_value)) AS min_size_bytes,
    MAX(LENGTH(om.meta_value)) AS max_size_bytes,
    SUM(CASE
        WHEN om.meta_value LIKE '%"objects"%'
        AND om.meta_value LIKE '%"metadata"%'
        AND om.meta_value LIKE '%"capture_version"%'
        THEN 1 ELSE 0
    END) AS valid_format_count
FROM deo6_wc_orders_meta om
WHERE om.meta_key = '_design_data'
  AND om.meta_value IS NOT NULL
  AND om.meta_value != ''

UNION ALL

SELECT
    'Legacy' AS source,
    COUNT(DISTINCT pm.post_id) AS orders_with_design,
    AVG(LENGTH(pm.meta_value)) AS avg_size_bytes,
    MIN(LENGTH(pm.meta_value)) AS min_size_bytes,
    MAX(LENGTH(pm.meta_value)) AS max_size_bytes,
    SUM(CASE
        WHEN pm.meta_value LIKE '%"objects"%'
        AND pm.meta_value LIKE '%"metadata"%'
        AND pm.meta_value LIKE '%"capture_version"%'
        THEN 1 ELSE 0
    END) AS valid_format_count
FROM deo6_postmeta pm
INNER JOIN deo6_posts p ON pm.post_id = p.ID
WHERE pm.meta_key = '_design_data'
  AND p.post_type = 'shop_order'
  AND pm.meta_value IS NOT NULL
  AND pm.meta_value != '';
```

**Erwartete Ausgabe:**
| source | orders_with_design | avg_size_bytes | min_size_bytes | max_size_bytes | valid_format_count |
|--------|-------------------|---------------|---------------|---------------|-------------------|
| HPOS | 45 | 3456 | 1200 | 50000 | 45 |
| Legacy | 90 | 3200 | 1100 | 48000 | 90 |

**Test BESTANDEN wenn:**
- ✅ `valid_format_count = orders_with_design` (alle Daten im korrekten Format)
- ✅ `min_size_bytes > 1000` (keine leeren Designs)
- ✅ `max_size_bytes < 2000000` (keine zu großen Dateien)

---

### Query 3: Letzte 10 Design-Bestellungen (Cross-System)

**Zweck:** Zeitliche Übersicht über HPOS-Migration (wann wurden Bestellungen von Legacy auf HPOS umgestellt).

```sql
-- HPOS + Legacy vereint sortiert nach Erstellungsdatum
SELECT
    'HPOS' AS source,
    o.id AS order_id,
    o.date_created_gmt AS created,
    LENGTH(om.meta_value) AS design_data_size,
    CASE
        WHEN om.meta_value LIKE '%"capture_version":"3.0.0"%' THEN 'Golden Standard'
        ELSE 'Legacy Format'
    END AS format_type
FROM deo6_wc_orders o
INNER JOIN deo6_wc_orders_meta om ON o.id = om.order_id
WHERE om.meta_key = '_design_data'

UNION ALL

SELECT
    'Legacy' AS source,
    p.ID AS order_id,
    p.post_date_gmt AS created,
    LENGTH(pm.meta_value) AS design_data_size,
    CASE
        WHEN pm.meta_value LIKE '%"capture_version":"3.0.0"%' THEN 'Golden Standard'
        ELSE 'Legacy Format'
    END AS format_type
FROM deo6_posts p
INNER JOIN deo6_postmeta pm ON p.ID = pm.post_id
WHERE p.post_type = 'shop_order'
  AND pm.meta_key = '_design_data'

ORDER BY created DESC
LIMIT 10;
```

**Erwartete Ausgabe (POST-FIX):**
| source | order_id | created | design_data_size | format_type |
|--------|----------|---------|-----------------|-------------|
| HPOS | 5510 | 2025-10-02 14:30:00 | 3456 | Golden Standard |
| HPOS | 5509 | 2025-10-02 13:15:00 | 2987 | Golden Standard |
| HPOS | 5508 | 2025-10-02 12:00:00 | 4123 | Golden Standard |
| Legacy | 5380 | 2025-09-30 10:00:00 | 3200 | Legacy Format |
| Legacy | 5374 | 2025-09-29 15:30:00 | 2800 | Legacy Format |

**Analyse:**
- **Nach Fix:** Neue Bestellungen erscheinen in `HPOS` source
- **Vor Fix:** Alle Bestellungen in `Legacy` source
- **Migration-Zeitpunkt:** Sichtbar durch Wechsel von Legacy → HPOS

---

### Query 4: Fehlende Design-Daten Detection

**Zweck:** Identifiziere Bestellungen, die Design-Daten haben sollten, aber nicht haben.

```sql
-- Finde customizable Products ohne Design-Daten in Order
SELECT
    o.id AS order_id,
    o.date_created_gmt,
    woi.order_item_name AS product_name,
    'Missing in HPOS' AS issue
FROM deo6_wc_orders o
INNER JOIN deo6_woocommerce_order_items woi ON o.id = woi.order_id
INNER JOIN deo6_woocommerce_order_itemmeta woim ON woi.order_item_id = woim.order_item_id
WHERE woim.meta_key = '_product_id'
  AND woim.meta_value IN (
      SELECT post_id FROM deo6_postmeta
      WHERE meta_key = '_is_customizable' AND meta_value = 'yes'
  )
  AND NOT EXISTS (
      SELECT 1 FROM deo6_wc_orders_meta om
      WHERE om.order_id = o.id AND om.meta_key = '_design_data'
  )
ORDER BY o.date_created_gmt DESC
LIMIT 10;
```

**Erwartete Ausgabe:**
- **Idealfall:** Keine Ergebnisse (alle customizable Products haben Design-Daten)
- **Fehlerfall:** Liste von Orders mit fehlenden Daten

**Wenn Ergebnisse vorhanden:**
1. Prüfe ob Design wirklich erstellt wurde (User könnte Standardwerte verwendet haben)
2. Validiere Save-Funktion im Frontend
3. Prüfe Browser-Konsole-Logs für JavaScript-Fehler

---

### Query 5: API-Meta Validierung

**Zweck:** Prüfe, ob AllesKlarDruck API-Meta korrekt in HPOS gespeichert wird.

```sql
-- Prüfe API-Meta für Orders mit Design-Daten
SELECT
    o.id AS order_id,
    o.date_created_gmt,
    SUM(CASE WHEN om.meta_key = '_design_data' THEN 1 ELSE 0 END) AS has_design_data,
    SUM(CASE WHEN om.meta_key = '_allesklardruck_api_sent' THEN 1 ELSE 0 END) AS has_api_sent,
    SUM(CASE WHEN om.meta_key = '_allesklardruck_api_response' THEN 1 ELSE 0 END) AS has_api_response,
    SUM(CASE WHEN om.meta_key = '_allesklardruck_order_id' THEN 1 ELSE 0 END) AS has_api_order_id,
    MAX(CASE WHEN om.meta_key = '_allesklardruck_api_sent' THEN om.meta_value END) AS api_sent_timestamp
FROM deo6_wc_orders o
INNER JOIN deo6_wc_orders_meta om ON o.id = om.order_id
WHERE o.date_created_gmt > DATE_SUB(NOW(), INTERVAL 7 DAY)
  AND EXISTS (
      SELECT 1 FROM deo6_wc_orders_meta om2
      WHERE om2.order_id = o.id AND om2.meta_key = '_design_data'
  )
GROUP BY o.id, o.date_created_gmt
ORDER BY o.date_created_gmt DESC
LIMIT 10;
```

**Erwartete Ausgabe (nach API-Calls):**
| order_id | created | has_design_data | has_api_sent | has_api_response | has_api_order_id | api_sent_timestamp |
|----------|---------|----------------|-------------|----------------|-----------------|-------------------|
| 5510 | 2025-10-02 14:30 | 1 | 1 | 1 | 1 | 1696258200 |
| 5509 | 2025-10-02 13:15 | 1 | 1 | 1 | 1 | 1696253700 |

**Test BESTANDEN wenn:**
- ✅ `has_api_sent = 1` (API-Call wurde ausgeführt)
- ✅ `has_api_response = 1` (API-Response wurde gespeichert)
- ✅ `has_api_order_id = 1` (AllesKlarDruck Order ID vorhanden)

**Wenn API-Meta fehlt (has_api_sent = 0):**
```sql
-- Debugging: Prüfe ob API-Meta in Legacy-Tabelle statt HPOS
SELECT
    pm.post_id AS order_id,
    pm.meta_key,
    pm.meta_value
FROM deo6_postmeta pm
WHERE pm.post_id = [ORDER_ID]
  AND pm.meta_key LIKE '_allesklardruck_%'
ORDER BY pm.meta_key;
```

---

## 6. CODE-ÄNDERUNGEN (FÜR REFERENZ)

### 6.1 Verbleibende HPOS-Fixes

Basierend auf Code-Analyse wurden folgende Instanzen identifiziert, die noch migriert werden müssen:

#### Datei: `/includes/class-octo-print-designer-wc-integration.php`

**Zeile 911-912: Print Provider Email Status (GET)**
```php
// VORHER (HPOS-inkompatibel):
$print_provider_email = get_post_meta($order_id, '_print_provider_email', true);
$email_sent = get_post_meta($order_id, '_print_provider_email_sent', true);

// NACHHER (HPOS-kompatibel):
$order = wc_get_order($order_id);
if (!$order) {
    error_log('Order not found: ' . $order_id);
    return false;
}
$print_provider_email = $order->get_meta('_print_provider_email', true);
$email_sent = $order->get_meta('_print_provider_email_sent', true);
```

**Zeile 1836-1837: Print Provider Email Status (UPDATE)**
```php
// VORHER (HPOS-inkompatibel):
update_post_meta($order_id, '_print_provider_email', $email);
update_post_meta($order_id, '_print_provider_email_sent', time());

// NACHHER (HPOS-kompatibel):
$order = wc_get_order($order_id);
if ($order) {
    $order->update_meta_data('_print_provider_email', $email);
    $order->update_meta_data('_print_provider_email_sent', time());
    $order->save();
}
```

**Zeile 3340: Debug-Funktion All Meta**
```php
// VORHER (HPOS-inkompatibel):
$all_meta = get_post_meta($order_id);

// NACHHER (HPOS-kompatibel):
$order = wc_get_order($order_id);
$all_meta = $order ? $order->get_meta_data() : [];
```

---

#### Datei: `/includes/class-octo-print-api-integration.php`

**Zeile 133-134: API Response Speicherung**
```php
// VORHER:
update_post_meta($order_id, '_allesklardruck_api_sent', time());
update_post_meta($order_id, '_allesklardruck_api_response', $result);

// NACHHER:
$order = wc_get_order($order_id);
if ($order) {
    $order->update_meta_data('_allesklardruck_api_sent', time());
    $order->update_meta_data('_allesklardruck_api_response', $result);
    $order->save();
}
```

**Zeile 1624-1639: Vollständige API-Response Speicherung**
```php
// VORHER:
update_post_meta($order_id, '_allesklardruck_api_sent', $timestamp);
update_post_meta($order_id, '_allesklardruck_api_status_code', $status_code);
update_post_meta($order_id, '_allesklardruck_api_response', $response_data);
update_post_meta($order_id, '_allesklardruck_api_payload', $payload);

if (isset($response_data['orderId'])) {
    update_post_meta($order_id, '_allesklardruck_order_id', $response_data['orderId']);
}
if (isset($response_data['trackingNumber'])) {
    update_post_meta($order_id, '_allesklardruck_tracking_number', $response_data['trackingNumber']);
}
if (isset($response_data['status'])) {
    update_post_meta($order_id, '_allesklardruck_order_status', $response_data['status']);
}

// NACHHER:
$order = wc_get_order($order_id);
if ($order) {
    $order->update_meta_data('_allesklardruck_api_sent', $timestamp);
    $order->update_meta_data('_allesklardruck_api_status_code', $status_code);
    $order->update_meta_data('_allesklardruck_api_response', $response_data);
    $order->update_meta_data('_allesklardruck_api_payload', $payload);

    if (isset($response_data['orderId'])) {
        $order->update_meta_data('_allesklardruck_order_id', $response_data['orderId']);
    }
    if (isset($response_data['trackingNumber'])) {
        $order->update_meta_data('_allesklardruck_tracking_number', $response_data['trackingNumber']);
    }
    if (isset($response_data['status'])) {
        $order->update_meta_data('_allesklardruck_order_status', $response_data['status']);
    }

    $order->save(); // WICHTIG: Nur EINMAL am Ende aufrufen!
}
```

**Zeile 1981-1983: API Sent Timestamp**
```php
// VORHER:
update_post_meta($order_id, '_allesklardruck_api_sent', time());
if (isset($result['response_data']['order_id'])) {
    update_post_meta($order_id, '_allesklardruck_order_id', $result['response_data']['order_id']);
}

// NACHHER:
$order = wc_get_order($order_id);
if ($order) {
    $order->update_meta_data('_allesklardruck_api_sent', time());
    if (isset($result['response_data']['order_id'])) {
        $order->update_meta_data('_allesklardruck_order_id', $result['response_data']['order_id']);
    }
    $order->save();
}
```

**Zeile 2177-2181: API Status Abrufen**
```php
// VORHER:
$api_sent = get_post_meta($order_id, '_allesklardruck_api_sent', true);
$status_code = get_post_meta($order_id, '_allesklardruck_api_status_code', true);
$allesklardruck_order_id = get_post_meta($order_id, '_allesklardruck_order_id', true);
$order_status = get_post_meta($order_id, '_allesklardruck_order_status', true);
$tracking_number = get_post_meta($order_id, '_allesklardruck_tracking_number', true);

// NACHHER:
$order = wc_get_order($order_id);
if (!$order) {
    return false; // Fehlerbehandlung
}

$api_sent = $order->get_meta('_allesklardruck_api_sent', true);
$status_code = $order->get_meta('_allesklardruck_api_status_code', true);
$allesklardruck_order_id = $order->get_meta('_allesklardruck_order_id', true);
$order_status = $order->get_meta('_allesklardruck_order_status', true);
$tracking_number = $order->get_meta('_allesklardruck_tracking_number', true);
```

---

### 6.2 HPOS-Deklaration im Plugin-Header

**Datei:** `/octo-print-designer.php`

**Nach Zeile 77 einfügen:**
```php
/**
 * Declare HPOS compatibility
 * @since 1.1.0
 */
add_action('before_woocommerce_init', function() {
    if (class_exists(\Automattic\WooCommerce\Utilities\FeaturesUtil::class)) {
        \Automattic\WooCommerce\Utilities\FeaturesUtil::declare_compatibility(
            'custom_order_tables',
            __FILE__,
            true
        );
    }
});
```

---

## 7. ROLLBACK-PLAN

### 7.1 Sofort-Maßnahmen bei Problemen

**Schritt 1: HPOS Kompatibilitätsmodus aktivieren**
```
1. WooCommerce → Einstellungen → Erweitert → Features
2. "Kompatibilitätsmodus" aktivieren
3. Speichern
```

**Effekt:** WooCommerce schreibt Daten SOWOHL in `wp_wc_orders_meta` ALS AUCH in `wp_postmeta` (Redundanz).

**Schritt 2: Plugin auf vorherige Version zurücksetzen**
```bash
cd /workspaces/yprint_designtool
git stash  # Aktuelle Änderungen sichern
git checkout 1eed4b2  # Letzter stabiler HPOS-Fix-Commit
```

**Schritt 3: WordPress-Cache leeren**
```bash
wp cache flush
```

---

### 7.2 Daten-Wiederherstellung

**Falls Daten in HPOS verloren gingen:**

```sql
-- Design-Daten aus Legacy-Tabelle in HPOS kopieren
INSERT INTO deo6_wc_orders_meta (order_id, meta_key, meta_value)
SELECT
    pm.post_id AS order_id,
    pm.meta_key,
    pm.meta_value
FROM deo6_postmeta pm
INNER JOIN deo6_posts p ON pm.post_id = p.ID
WHERE p.post_type = 'shop_order'
  AND pm.meta_key IN (
      '_design_data',
      '_db_processed_views',
      '_design_data_compressed',
      '_allesklardruck_api_sent',
      '_allesklardruck_api_response',
      '_print_provider_email_sent'
  )
  AND NOT EXISTS (
      SELECT 1 FROM deo6_wc_orders_meta om
      WHERE om.order_id = pm.post_id
        AND om.meta_key = pm.meta_key
  );
```

**Validierung nach Wiederherstellung:**
```sql
-- Prüfe ob Daten korrekt kopiert wurden
SELECT COUNT(*) AS restored_count
FROM deo6_wc_orders_meta
WHERE meta_key = '_design_data'
  AND order_id IN (
      SELECT post_id FROM deo6_postmeta WHERE meta_key = '_design_data'
  );
```

---

### 7.3 Kommunikations-Template (bei Production-Problemen)

**Email an Stakeholder:**

```
Betreff: [DRINGEND] HPOS-Migration vorübergehend pausiert

Sehr geehrte/r [NAME],

wir haben ein technisches Problem bei der HPOS-Migration festgestellt:
- Problem: [BESCHREIBUNG]
- Betroffene Bestellungen: [ANZAHL/IDs]
- Status: Kompatibilitätsmodus aktiviert, alle Bestellungen funktionieren normal

Sofort-Maßnahmen:
1. HPOS Kompatibilitätsmodus aktiviert (redundante Speicherung)
2. Plugin auf stabile Version zurückgesetzt
3. Daten-Integrität validiert (siehe SQL-Report)

Nächste Schritte:
- Fehleranalyse: [ZEITRAHMEN]
- Fix-Implementierung: [ZEITRAHMEN]
- Erneuter Rollout: [ZEITRAHMEN]

Betroffene Funktionen:
☐ Admin-Preview
☐ Print Provider API
☐ Email-Versand
☐ Order-Erstellung

Alle Funktionen arbeiten weiterhin korrekt im Kompatibilitätsmodus.

Mit freundlichen Grüßen,
[NAME]
```

---

## 8. ERFOLGS-KRITERIEN

### 8.1 Phase 1 - Pre-Fix Baseline (DOKUMENTATION)

**Erfolgreich wenn:**
- ✅ IST-Zustand vollständig dokumentiert
- ✅ Alle SQL-Queries durchgeführt und Ergebnisse notiert
- ✅ Screenshots erstellt
- ✅ Baseline-Metriken erfasst (Ladezeiten, Fehlerrate)

---

### 8.2 Phase 2 - Post-Fix Validation (IMPLEMENTIERUNG)

**Erfolgreich wenn:**
- ✅ ALLE neuen Bestellungen speichern Design-Daten in `wp_wc_orders_meta`
- ✅ Admin-Preview lädt ohne Fehler
- ✅ Refresh-Button funktioniert
- ✅ Keine PHP-Errors in `/wp-content/debug.log`
- ✅ Keine JavaScript-Errors in Browser-Konsole
- ✅ SQL-Validation Queries zeigen korrektes Ergebnis

---

### 8.3 Phase 3 - Regression Tests (KOMPATIBILITÄT)

**Erfolgreich wenn:**
- ✅ Legacy-Bestellungen (pre-HPOS) funktionieren identisch zu vorher
- ✅ `$order->get_meta()` liefert korrekte Daten für BEIDE Systeme
- ✅ Alle 4 Features (Preview, API, Email, Meta) funktionieren für Legacy + HPOS
- ✅ Keine Performance-Regression (Ladezeiten ± 10%)

---

### 8.4 Phase 4 - Edge Cases (ROBUSTHEIT)

**Erfolgreich wenn:**
- ✅ Orders ohne Design-Daten zeigen korrekte Fehlermeldung
- ✅ Große Designs (>1MB) werden vollständig gespeichert
- ✅ Korrupte JSON-Daten lösen keine Fatal Errors aus
- ✅ Gleichzeitige Requests erzeugen keine Race Conditions

---

### 8.5 Gesamtprojekt (PRODUCTION-READY)

**Erfolgreich wenn:**
- ✅ WooCommerce Status zeigt Plugin als "HPOS-kompatibel" (keine Warnungen)
- ✅ Alle 24 Tests BESTANDEN (100% Pass Rate)
- ✅ Performance-Verbesserung messbar (HPOS-Queries schneller)
- ✅ 7-Tage-Monitoring ohne kritische Fehler
- ✅ Kundenfeedback positiv (keine Beschwerden)

---

## 9. CHECKLISTE FÜR PRODUCTION DEPLOYMENT

### 9.1 Pre-Deployment (1 Tag vorher)

- [ ] **Backup:** Vollständiges Datenbank-Backup erstellt
- [ ] **Staging:** Alle Tests in Staging-Umgebung GRÜN
- [ ] **Code-Review:** Peer-Review aller Code-Änderungen abgeschlossen
- [ ] **Dokumentation:** Testplan vollständig ausgefüllt
- [ ] **Rollback-Plan:** Getestet und validiert
- [ ] **Stakeholder:** Benachrichtigt über geplantes Deployment

---

### 9.2 Deployment (Production)

**Zeitfenster:** [DATUM/UHRZEIT] (empfohlen: außerhalb Geschäftszeiten)

- [ ] **1. Wartungsmodus aktivieren:**
  ```bash
  wp maintenance-mode activate
  ```

- [ ] **2. Code deployen:**
  ```bash
  git pull origin main
  git checkout [HPOS_FIX_BRANCH]
  ```

- [ ] **3. HPOS aktivieren:**
  ```
  WooCommerce → Einstellungen → Erweitert → Features
  "High-Performance order storage" = Enabled
  Kompatibilitätsmodus = DISABLED (für echten HPOS-Test)
  ```

- [ ] **4. Cache leeren:**
  ```bash
  wp cache flush
  wp rewrite flush
  ```

- [ ] **5. Test-Bestellung erstellen:**
  - Design-Bestellung erstellen
  - Order ID notieren: ____________
  - Admin-Preview testen
  - SQL-Query ausführen (siehe 2.1)

- [ ] **6. Wartungsmodus deaktivieren:**
  ```bash
  wp maintenance-mode deactivate
  ```

---

### 9.3 Post-Deployment (24h Monitoring)

**Stunde 1:**
- [ ] 5 Test-Bestellungen erfolgreich verarbeitet
- [ ] Admin-Preview für 5 zufällige neue Orders getestet
- [ ] Error-Logs geprüft: `/wp-content/debug.log` (keine kritischen Fehler)

**Stunde 4:**
- [ ] 20 organische Bestellungen verarbeitet
- [ ] SQL-Validation Query ausführen (siehe Query 1)
- [ ] Performance-Metriken prüfen (Response Times)

**Stunde 24:**
- [ ] 100+ Bestellungen erfolgreich verarbeitet
- [ ] Keine Kundenbeschwerden
- [ ] API-Integration funktioniert (min. 10 API-Calls erfolgreich)
- [ ] Legacy-Orders Stichprobe (min. 5 Orders testen)

**Tag 7:**
- [ ] 500+ Bestellungen erfolgreich
- [ ] Performance-Vergleich Pre/Post-HPOS durchgeführt
- [ ] Stakeholder-Report erstellt
- [ ] HPOS-Migration als "ABGESCHLOSSEN" markiert

---

## 10. SUPPORT & TROUBLESHOOTING

### 10.1 Häufige Probleme & Lösungen

#### Problem 1: "No design data found for this order" (NACH Fix)

**Diagnose:**
```sql
-- Prüfe ob Daten wirklich fehlen
SELECT COUNT(*) FROM deo6_wc_orders_meta
WHERE order_id = [ORDER_ID] AND meta_key = '_design_data';
```

**Lösung wenn Daten vorhanden:**
```php
// Clearing Admin-Cache
wp_cache_delete('order_' . $order_id, 'wc_orders');
```

**Lösung wenn Daten fehlen:**
- Prüfe Frontend-Logs während Checkout
- Validiere `save_design_data_to_order()` Hook
- Check Browser-Konsole für JavaScript-Fehler

---

#### Problem 2: API-Meta nicht in HPOS gespeichert

**Diagnose:**
```sql
-- Prüfe ob API-Meta in Legacy statt HPOS
SELECT meta_key, meta_value FROM deo6_postmeta
WHERE post_id = [ORDER_ID] AND meta_key LIKE '_allesklardruck_%';
```

**Lösung:**
- Verifiziere Code-Fix in Zeile 1624-1639 angewendet
- Prüfe ob `$order->save()` aufgerufen wird
- Check Error-Logs für Failed Save Operations

---

#### Problem 3: Legacy-Orders nicht mehr ladbar

**Diagnose:**
```php
$order = wc_get_order([LEGACY_ORDER_ID]);
error_log('Order type: ' . get_class($order));
error_log('Meta data: ' . print_r($order->get_meta_data(), true));
```

**Lösung:**
- HPOS Kompatibilitätsmodus AKTIVIEREN (temporär)
- Prüfe WooCommerce-Version (min. 7.0 erforderlich)
- Validiere `wc_get_order()` Abstraktionsschicht

---

### 10.2 Debug-Modus aktivieren

**wp-config.php:**
```php
define('WP_DEBUG', true);
define('WP_DEBUG_LOG', true);
define('WP_DEBUG_DISPLAY', false);
define('SCRIPT_DEBUG', true);
```

**HPOS-spezifisches Debugging:**
```php
// In functions.php (temporär für Debugging)
add_action('woocommerce_update_order', function($order_id, $order) {
    error_log('Order saved: ' . $order_id);
    error_log('Meta data: ' . print_r($order->get_meta_data(), true));
}, 10, 2);
```

---

## 11. DOKUMENTEN-HISTORIE

| Version | Datum | Autor | Änderungen |
|---------|-------|-------|-----------|
| 1.0 | 2025-10-02 | Agent 6 | Initiale Version - Vollständiger HPOS-Testplan |

---

## 12. ANHÄNGE

### Anhang A: Testdaten-Templates

**checkout-data.json (für Test 4.4):**
```json
{
  "billing_first_name": "Max",
  "billing_last_name": "Mustermann",
  "billing_email": "test@example.com",
  "billing_phone": "0123456789",
  "billing_address_1": "Teststraße 1",
  "billing_city": "Berlin",
  "billing_postcode": "10115",
  "billing_country": "DE",
  "payment_method": "bacs",
  "design_data": "{\"objects\":[{\"type\":\"text\",\"left\":100,\"top\":200,\"text\":\"Test\"}],\"metadata\":{\"capture_version\":\"3.0.0\",\"source\":\"designer\"}}"
}
```

---

### Anhang B: SQL-Queries Sammlung (Copy-Paste Ready)

**HPOS-Status prüfen:**
```sql
SELECT option_value FROM deo6_options WHERE option_name = 'woocommerce_custom_orders_table_enabled';
```

**Letzte 5 Design-Bestellungen:**
```sql
SELECT o.id, o.date_created_gmt, LENGTH(om.meta_value) AS size
FROM deo6_wc_orders o
INNER JOIN deo6_wc_orders_meta om ON o.id = om.order_id
WHERE om.meta_key = '_design_data'
ORDER BY o.date_created_gmt DESC
LIMIT 5;
```

**Design-Daten-Größe Statistik:**
```sql
SELECT
    MIN(LENGTH(meta_value)) AS min_size,
    AVG(LENGTH(meta_value)) AS avg_size,
    MAX(LENGTH(meta_value)) AS max_size,
    COUNT(*) AS total_count
FROM deo6_wc_orders_meta
WHERE meta_key = '_design_data';
```

---

**ENDE DES TESTPLANS**

**Nächste Schritte:**
1. Testplan durcharbeiten (Schritt für Schritt)
2. Alle Checkboxen abhaken
3. Screenshots in separatem Ordner sammeln
4. SQL-Ergebnisse dokumentieren
5. Finale Approval von Stakeholder einholen
6. Production Deployment durchführen

**Bei Fragen:** [KONTAKT-INFO]
