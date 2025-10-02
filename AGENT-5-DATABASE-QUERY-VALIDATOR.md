# AGENT 5: DATABASE-QUERY-VALIDATOR

**Mission:** Prüfe, ob Design-Daten tatsächlich in der Datenbank sind und wo sie gespeichert werden.

**Datum:** 2025-10-02
**Status:** FORSCHUNG (Keine Code-Änderungen)

---

## ZUSAMMENFASSUNG

Diese Analyse dokumentiert 5 SQL-Queries, um Design-Daten in der WordPress/WooCommerce-Datenbank zu lokalisieren. Das System hat nach der HPOS-Migration zwei Speicherorte:

1. **HPOS (High-Performance Order Storage):** `deo6_wc_orders_meta` (Order-Level)
2. **Legacy:** `deo6_postmeta` (Order-Level, alte Orders)
3. **Item-Level:** `deo6_woocommerce_order_itemmeta` (Line Items)

---

## CODE-ANALYSE: WIE WERDEN DATEN GESPEICHERT?

### 1. Speicher-Flow beim Checkout

**Datei:** `/workspaces/yprint_designtool/includes/class-octo-print-designer-wc-integration.php`

**Zeilen 2724-2768:** `save_design_data_to_order()`
```php
// ITEM LEVEL Speicherung
$item->add_meta_data('_design_data', $json_string, true);

// ORDER LEVEL Speicherung (HPOS-kompatibel)
$order->update_meta_data('_design_data', $json_string);
```

**Zeilen 2777-2786:** `save_order_level_design_data()`
```php
// Persist all pending meta_data updates
$result = $order->save();
```

**WICHTIG:** Daten werden SOWOHL auf Item-Level ALS AUCH auf Order-Level gespeichert!

### 2. Lese-Flow im Admin

**Zeilen 6765-6878:** `extract_design_data_with_canvas_metadata()`
```php
// Schritt 1: Prüfe ORDER-LEVEL Meta (HPOS)
$stored_design_data = $order->get_meta('_design_data', true);

// Schritt 2: Fallback auf ITEM-LEVEL Meta
$processed_views = $item->get_meta('_db_processed_views');
```

**Zeilen 6886-6932:** `has_design_data()`
```php
// Check 1: Order meta - HPOS FIX
$stored_design_data = $order->get_meta('_design_data', true);

// Check 3: Item meta - Legacy fallback
$processed_views = $item->get_meta('_db_processed_views');
```

---

## SQL-QUERIES: DATENBANK-INSPEKTION

### QUERY 1: HPOS Order-Level Meta (Primary Storage)

**Zweck:** Prüfe, ob Design-Daten in der HPOS-Tabelle `deo6_wc_orders_meta` gespeichert sind.

```sql
-- QUERY 1: HPOS Order-Level Meta
-- Findet: _design_data, _mockup_image_url, _yprint_template_id auf Order-Ebene
SELECT
    om.order_id,
    om.meta_key,
    LENGTH(om.meta_value) AS data_size_bytes,
    LEFT(om.meta_value, 200) AS preview_value,
    CASE
        WHEN om.meta_value LIKE '{%' THEN 'JSON'
        WHEN om.meta_value LIKE 'a:%' THEN 'SERIALIZED'
        WHEN om.meta_value LIKE 'http%' THEN 'URL'
        ELSE 'STRING'
    END AS data_format
FROM deo6_wc_orders_meta om
WHERE om.meta_key IN ('_design_data', '_mockup_image_url', '_yprint_template_id', '_db_processed_views')
  AND om.order_id IN (5374, 5375, 5376, 5377, 5378)  -- Letzte 5 Test-Orders
ORDER BY om.order_id DESC, om.meta_key;
```

**Erwartetes Ergebnis:**
- **WENN _design_data gefunden:** Button sollte angezeigt werden, AJAX sollte funktionieren
- **WENN NICHT gefunden:** Entweder Legacy Storage oder Item-Level prüfen

---

### QUERY 2: Legacy Order-Level Meta (Pre-HPOS)

**Zweck:** Prüfe, ob alte Orders noch in `deo6_postmeta` gespeichert sind (vor HPOS-Migration).

```sql
-- QUERY 2: Legacy Order-Level Meta (postmeta)
-- Findet: Design-Daten in alter wp_postmeta Tabelle
SELECT
    pm.post_id AS order_id,
    pm.meta_key,
    LENGTH(pm.meta_value) AS data_size_bytes,
    LEFT(pm.meta_value, 200) AS preview_value,
    CASE
        WHEN pm.meta_value LIKE '{%' THEN 'JSON'
        WHEN pm.meta_value LIKE 'a:%' THEN 'SERIALIZED'
        WHEN pm.meta_value LIKE 'http%' THEN 'URL'
        ELSE 'STRING'
    END AS data_format,
    p.post_type,
    p.post_status
FROM deo6_postmeta pm
INNER JOIN deo6_posts p ON pm.post_id = p.ID
WHERE pm.meta_key IN ('_design_data', '_mockup_image_url', '_yprint_template_id', '_db_processed_views')
  AND p.post_type = 'shop_order'
  AND pm.post_id IN (5374, 5375, 5376, 5377, 5378)
ORDER BY pm.post_id DESC, pm.meta_key;
```

**Erwartetes Ergebnis:**
- **WENN _design_data gefunden:** Alte Order, noch nicht migriert
- **WENN NICHT gefunden:** Order ist bereits HPOS-migriert

---

### QUERY 3: Item-Level Meta (Line Items)

**Zweck:** Prüfe, ob Design-Daten auf Item-Ebene in `deo6_woocommerce_order_itemmeta` gespeichert sind.

```sql
-- QUERY 3: Item-Level Meta (Order Line Items)
-- Findet: _design_data, _db_processed_views pro Line Item
SELECT
    oi.order_id,
    oi.order_item_id,
    oi.order_item_name AS product_name,
    oim.meta_key,
    LENGTH(oim.meta_value) AS data_size_bytes,
    LEFT(oim.meta_value, 200) AS preview_value,
    CASE
        WHEN oim.meta_value LIKE '{%' THEN 'JSON'
        WHEN oim.meta_value LIKE 'a:%' THEN 'SERIALIZED'
        WHEN oim.meta_value LIKE 'http%' THEN 'URL'
        ELSE 'STRING'
    END AS data_format
FROM deo6_woocommerce_order_itemmeta oim
INNER JOIN deo6_woocommerce_order_items oi ON oim.order_item_id = oi.order_item_id
WHERE oim.meta_key IN ('_design_data', '_db_processed_views', '_yprint_template_id', '_mockup_image_url', 'design_id', 'canvas_data')
  AND oi.order_id IN (5374, 5375, 5376, 5377, 5378)
ORDER BY oi.order_id DESC, oi.order_item_id, oim.meta_key;
```

**Erwartetes Ergebnis:**
- **WENN _db_processed_views gefunden:** Legacy Format, AJAX sollte konvertieren
- **WENN _design_data gefunden:** Neueres Format, direkt verwendbar

---

### QUERY 4: Vollständige Order-Übersicht (Welche Orders haben Design-Daten?)

**Zweck:** Finde alle Orders mit Design-Daten und zeige, wo sie gespeichert sind.

```sql
-- QUERY 4: Welche Orders haben Design-Daten? (Vollständige Übersicht)
-- Kombiniert alle 3 Speicherorte
SELECT
    'HPOS_ORDER_META' AS storage_location,
    om.order_id,
    om.meta_key,
    LENGTH(om.meta_value) AS data_size_bytes,
    'CURRENT' AS migration_status
FROM deo6_wc_orders_meta om
WHERE om.meta_key IN ('_design_data', '_db_processed_views')
  AND LENGTH(om.meta_value) > 10

UNION ALL

SELECT
    'LEGACY_POSTMETA' AS storage_location,
    pm.post_id AS order_id,
    pm.meta_key,
    LENGTH(pm.meta_value) AS data_size_bytes,
    'PRE_HPOS' AS migration_status
FROM deo6_postmeta pm
INNER JOIN deo6_posts p ON pm.post_id = p.ID
WHERE pm.meta_key IN ('_design_data', '_db_processed_views')
  AND p.post_type = 'shop_order'
  AND LENGTH(pm.meta_value) > 10

UNION ALL

SELECT
    'ITEM_META' AS storage_location,
    oi.order_id,
    oim.meta_key,
    LENGTH(oim.meta_value) AS data_size_bytes,
    'ITEM_LEVEL' AS migration_status
FROM deo6_woocommerce_order_itemmeta oim
INNER JOIN deo6_woocommerce_order_items oi ON oim.order_item_id = oi.order_item_id
WHERE oim.meta_key IN ('_design_data', '_db_processed_views')
  AND LENGTH(oim.meta_value) > 10

ORDER BY order_id DESC, storage_location;
```

**Erwartetes Ergebnis:**
- Zeigt ALLE Orders mit Design-Daten
- Zeigt, ob Daten in HPOS, Legacy oder Item-Level gespeichert sind
- Zeigt Daten-Duplikation (wenn Order in mehreren Tabellen vorkommt)

---

### QUERY 5: Meta-Key Varianten-Suche (Finde falsche Schreibweisen)

**Zweck:** Suche nach allen möglichen Variationen von Design-Meta-Keys (Typos, Unterstriche, etc.).

```sql
-- QUERY 5: Finde alle Design-bezogenen Meta-Keys (auch Typos)
-- Findet: design_data, _design_data, designdata, canvas_data, etc.
SELECT DISTINCT
    'HPOS_META' AS source_table,
    meta_key,
    COUNT(*) AS occurrence_count,
    SUM(LENGTH(meta_value)) AS total_data_size_bytes
FROM deo6_wc_orders_meta
WHERE meta_key LIKE '%design%'
   OR meta_key LIKE '%canvas%'
   OR meta_key LIKE '%mockup%'
   OR meta_key LIKE '%template%'
   OR meta_key LIKE '%processed%'
   OR meta_key LIKE '%yprint%'
GROUP BY meta_key

UNION ALL

SELECT DISTINCT
    'LEGACY_META' AS source_table,
    pm.meta_key,
    COUNT(*) AS occurrence_count,
    SUM(LENGTH(pm.meta_value)) AS total_data_size_bytes
FROM deo6_postmeta pm
INNER JOIN deo6_posts p ON pm.post_id = p.ID
WHERE p.post_type = 'shop_order'
  AND (pm.meta_key LIKE '%design%'
   OR pm.meta_key LIKE '%canvas%'
   OR pm.meta_key LIKE '%mockup%'
   OR pm.meta_key LIKE '%template%'
   OR pm.meta_key LIKE '%processed%'
   OR pm.meta_key LIKE '%yprint%')
GROUP BY pm.meta_key

UNION ALL

SELECT DISTINCT
    'ITEM_META' AS source_table,
    meta_key,
    COUNT(*) AS occurrence_count,
    SUM(LENGTH(meta_value)) AS total_data_size_bytes
FROM deo6_woocommerce_order_itemmeta
WHERE meta_key LIKE '%design%'
   OR meta_key LIKE '%canvas%'
   OR meta_key LIKE '%mockup%'
   OR meta_key LIKE '%template%'
   OR meta_key LIKE '%processed%'
   OR meta_key LIKE '%yprint%'
GROUP BY meta_key

ORDER BY source_table, meta_key;
```

**Erwartetes Ergebnis:**
- Zeigt ALLE verwendeten Meta-Key-Namen
- Erkennt Typos wie: `design_data` vs. `_design_data`
- Zeigt, ob alte oder neue Naming Convention verwendet wird

---

## DIAGNOSE-FRAMEWORK

### Erwartete Speicherorte (nach Code-Analyse)

| Meta-Key                | Order-Level (HPOS) | Order-Level (Legacy) | Item-Level | Beschreibung                          |
|-------------------------|--------------------|----------------------|------------|---------------------------------------|
| `_design_data`          | ✅ JA              | ✅ JA                | ✅ JA      | JSON Canvas-Daten (Primary Source)    |
| `_db_processed_views`   | ❌ NEIN            | ❌ NEIN              | ✅ JA      | Print-DB Daten (Legacy Fallback)      |
| `_mockup_image_url`     | ✅ JA              | ✅ JA                | ✅ JA      | Mockup-Bild URL                       |
| `_yprint_template_id`   | ✅ JA              | ✅ JA                | ✅ JA      | Template-ID                           |

### Diagnose-Szenarien

#### ✅ SZENARIO 1: Alles OK
**Query 1 Ergebnis:** `_design_data` in `deo6_wc_orders_meta` gefunden
**Query 3 Ergebnis:** `_design_data` in `deo6_woocommerce_order_itemmeta` gefunden
**Diagnose:** Daten korrekt gespeichert (Duplikation Order + Item ist NORMAL)
**Button-Status:** Sollte angezeigt werden
**AJAX-Status:** Sollte funktionieren

---

#### ❌ SZENARIO 2: Nur Item-Level Daten
**Query 1 Ergebnis:** KEINE `_design_data` in `deo6_wc_orders_meta`
**Query 3 Ergebnis:** `_design_data` in `deo6_woocommerce_order_itemmeta` gefunden
**Diagnose:** Order-Level Speicherung fehlgeschlagen (Bug in `save_order_level_design_data()`)
**Button-Status:** Sollte NICHT angezeigt werden
**AJAX-Status:** Würde fehlschlagen (Code prüft nur Order-Level zuerst)

**ROOT CAUSE:**
- `save_design_data_to_order()` Zeile 2757: `$order->update_meta_data()` aufgerufen
- `save_order_level_design_data()` Zeile 2779: `$order->save()` fehlgeschlagen
- **LÖSUNG:** Prüfe, ob `$order->save()` ein WP_Error zurückgibt

---

#### ❌ SZENARIO 3: Nur Legacy Storage
**Query 1 Ergebnis:** KEINE Daten in `deo6_wc_orders_meta`
**Query 2 Ergebnis:** `_design_data` in `deo6_postmeta` gefunden
**Query 3 Ergebnis:** `_design_data` in `deo6_woocommerce_order_itemmeta` gefunden
**Diagnose:** Order wurde VOR HPOS-Migration erstellt, aber nicht migriert
**Button-Status:** SOLLTE angezeigt werden (Code verwendet `$order->get_meta()`)
**AJAX-Status:** Sollte funktionieren (WC_Order API abstrahiert Legacy vs. HPOS)

**WICHTIG:** `$order->get_meta()` sollte AUTOMATISCH zwischen `postmeta` und `wc_orders_meta` wechseln!

---

#### ❌ SZENARIO 4: Typo in Meta-Key
**Query 1 Ergebnis:** KEINE `_design_data` gefunden
**Query 5 Ergebnis:** `design_data` (ohne Unterstrich) gefunden
**Diagnose:** Meta-Key Typo - Unterstrich fehlt!
**Button-Status:** Wird NICHT angezeigt
**AJAX-Status:** Funktioniert NICHT

**ROOT CAUSE:**
- Frontend sendet `design_data` statt `_design_data`
- Backend speichert mit falschem Key
- **LÖSUNG:** Suche im Frontend-Code nach `design_data` ohne Unterstrich

---

#### ❌ SZENARIO 5: Leere/Korrupte Daten
**Query 1 Ergebnis:** `_design_data` gefunden, aber `data_size_bytes = 2` (nur `{}`)
**Query 1 Ergebnis:** `preview_value = '{}'` (leeres JSON)
**Diagnose:** Daten gespeichert, aber leer - Frontend hat keine Daten gesendet
**Button-Status:** Wird NICHT angezeigt (Code prüft `$trimmed !== '{}'` Zeile 6906)
**AJAX-Status:** Funktioniert NICHT

**ROOT CAUSE:**
- Frontend `design-loader.js` sendet leeres JSON
- Oder: Designer-Canvas war leer beim Checkout
- **LÖSUNG:** Frontend-Validierung vor Checkout

---

#### ❌ SZENARIO 6: HPOS vs. Legacy Konflikt
**Query 1 Ergebnis:** `_design_data` in `deo6_wc_orders_meta` (Version A)
**Query 2 Ergebnis:** `_design_data` in `deo6_postmeta` (Version B)
**Diagnose:** Daten in BEIDEN Tabellen, aber unterschiedliche Versionen!
**Button-Status:** Wird angezeigt
**AJAX-Status:** Funktioniert, aber lädt falsche Version

**ROOT CAUSE:**
- Partial HPOS-Migration: Order wurde migriert, aber alte Daten nicht gelöscht
- `$order->get_meta()` bevorzugt HPOS-Version
- **LÖSUNG:** Laufe WooCommerce Migration erneut: `wp wc hpos sync`

---

## HYPOTHESEN: Warum findet extract_design_data_with_canvas_metadata() nichts?

### Hypothese 1: Order-Level Save schlägt fehl
**Code:** `/workspaces/yprint_designtool/includes/class-octo-print-designer-wc-integration.php:2779`
```php
$result = $order->save();
```

**Problem:** Wenn `$order->save()` fehlschlägt, wird `update_meta_data()` nicht persistiert.

**Test:** Prüfe Error-Logs nach:
```
❌ Failed to persist order-level design data for order #5374
```

**Fix:** Füge WP_Error Handling hinzu:
```php
$result = $order->save();
if (is_wp_error($result)) {
    error_log("❌ Order save failed: " . $result->get_error_message());
}
```

---

### Hypothese 2: HPOS-Migration unvollständig
**Code:** WooCommerce Core Settings > Advanced > Features > HPOS

**Problem:** Orders sind teilweise migriert, aber Meta-Daten nicht.

**Test:** Query 4 ausführen - zeigt Daten in `postmeta` aber nicht in `wc_orders_meta`.

**Fix:** WP-CLI Command:
```bash
wp wc hpos sync --batch-size=50
wp wc hpos verify
```

---

### Hypothese 3: Meta-Key Typo
**Code:** Frontend könnte falschen Key senden

**Problem:** Frontend sendet `design_data` statt `_design_data`

**Test:** Query 5 ausführen - zeigt alle Varianten von Meta-Keys.

**Fix:** Grep nach allen Speicherorten:
```bash
grep -r "design_data" public/js/*.js | grep -v "_design_data"
```

---

### Hypothese 4: Leere Daten beim Checkout
**Code:** `/workspaces/yprint_designtool/includes/class-octo-print-designer-wc-integration.php:2726`

**Problem:** `$values['_design_data_json']` ist leer, wird aber trotzdem gespeichert als `{}`

**Test:** Query 1 ausführen - `data_size_bytes < 10`

**Fix:** Füge Validierung vor Save hinzu:
```php
if (!empty($values['_design_data_json']) && count($values['_design_data_json']) > 0) {
    // Save data
}
```

---

### Hypothese 5: WooCommerce Cache-Problem
**Code:** WooCommerce Object Cache könnte veraltete Daten liefern

**Problem:** `$order->get_meta()` liest aus Cache statt Datenbank

**Test:** Temporär Cache deaktivieren:
```php
wp_cache_delete('order_meta_' . $order_id, 'orders');
```

**Fix:** Force-Reload Order:
```php
$order = wc_get_order($order_id);
$order->read_meta_data(true); // Force refresh
```

---

## NÄCHSTE SCHRITTE (für Developer)

### 1. Queries ausführen (Copy-Paste Ready)

**In MySQL Console oder phpMyAdmin:**
```bash
# Query 1: HPOS Check
SELECT om.order_id, om.meta_key, LENGTH(om.meta_value) AS data_size_bytes, LEFT(om.meta_value, 200) AS preview_value
FROM deo6_wc_orders_meta om
WHERE om.meta_key IN ('_design_data', '_mockup_image_url', '_yprint_template_id', '_db_processed_views')
  AND om.order_id IN (5374, 5375, 5376, 5377, 5378)
ORDER BY om.order_id DESC, om.meta_key;
```

### 2. Ergebnisse analysieren

**Erwartete Outputs:**

#### ✅ Idealer Output (Query 1):
```
| order_id | meta_key      | data_size_bytes | preview_value                        |
|----------|---------------|-----------------|--------------------------------------|
| 5374     | _design_data  | 4582            | {"objects":[{"type":"text","text...  |
```

#### ❌ Problematischer Output (Query 1):
```
Empty set (0.00 sec)
```
→ **DIAGNOSE:** Keine Order-Level Daten! Führe Query 2 und 3 aus.

#### ⚠️ Verdächtiger Output (Query 1):
```
| order_id | meta_key      | data_size_bytes | preview_value |
|----------|---------------|-----------------|---------------|
| 5374     | _design_data  | 2               | {}            |
```
→ **DIAGNOSE:** Leere Daten! Frontend sendet nichts.

---

### 3. Diagnose-Matrix verwenden

| Query 1 | Query 2 | Query 3 | Diagnose                           | Action                          |
|---------|---------|---------|------------------------------------|---------------------------------|
| ✅      | -       | ✅      | Alles OK                           | Keine - System funktioniert     |
| ❌      | ❌      | ✅      | Order-Level Save fehlgeschlagen    | Prüfe `$order->save()` Errors   |
| ❌      | ✅      | ✅      | HPOS Migration unvollständig       | Laufe `wp wc hpos sync`         |
| ❌      | ❌      | ❌      | Keine Daten                        | Prüfe Frontend Cart-Integration |
| 2 Bytes | 2 Bytes | 2 Bytes | Leere JSON-Objekte                 | Frontend sendet keine Daten     |

---

## KRITISCHE ERKENNTNISSE

### 1. Doppelte Speicherung ist NORMAL
- `save_design_data_to_order()` speichert SOWOHL auf Item-Level ALS AUCH Order-Level
- Dies ist ABSICHT für Kompatibilität mit `refresh_print_data`
- Zeilen 2733-2735 und 2756-2758 und 2763-2765

### 2. HPOS-Kompatibilität
- Code verwendet korrekt `$order->get_meta()` statt `get_post_meta()`
- Zeilen 6784, 6902
- WooCommerce API abstrahiert automatisch Legacy vs. HPOS

### 3. Validierung ist im LOG-ONLY Mode
- Fehlerhafte Daten werden TROTZDEM gespeichert
- Zeilen 2743-2766
- **WICHTIG:** Auch invalide Daten können in DB landen!

### 4. has_design_data() prüft NUR Order-Level zuerst
- Wenn Order-Level leer ist, wird Item-Level geprüft
- Zeilen 6901-6928
- **ABER:** `extract_design_data_with_canvas_metadata()` macht das GLEICHE!

---

## ZUSAMMENFASSUNG

**5 SQL-Queries bereitgestellt:**
1. HPOS Order-Level Meta (Primary)
2. Legacy Order-Level Meta (Pre-HPOS)
3. Item-Level Meta (Line Items)
4. Vollständige Order-Übersicht (Alle Speicherorte)
5. Meta-Key Varianten-Suche (Typos finden)

**6 Diagnose-Szenarien definiert:**
- ✅ Alles OK
- ❌ Nur Item-Level Daten
- ❌ Nur Legacy Storage
- ❌ Typo in Meta-Key
- ❌ Leere/Korrupte Daten
- ❌ HPOS vs. Legacy Konflikt

**5 Hypothesen entwickelt:**
1. Order-Level Save schlägt fehl
2. HPOS-Migration unvollständig
3. Meta-Key Typo
4. Leere Daten beim Checkout
5. WooCommerce Cache-Problem

**Nächster Schritt:** Queries in MySQL ausführen und Diagnose-Matrix verwenden!

---

## DATEIEN ANALYSIERT

- `/workspaces/yprint_designtool/includes/class-octo-print-designer-wc-integration.php`
  - Zeilen 2724-2786: Save-Funktionen
  - Zeilen 6765-6878: Extract-Funktion
  - Zeilen 6886-6932: has_design_data-Funktion

- `/workspaces/yprint_designtool/agent-1-order-5374-database-analysis.php`
  - Bestehende SQL-Queries als Referenz

---

**STATUS:** Queries dokumentiert - BEREIT FÜR DEVELOPER-AUSFÜHRUNG

**WICHTIG:** Dies ist FORSCHUNG - Keine Datenbank-Änderungen durchführen!
