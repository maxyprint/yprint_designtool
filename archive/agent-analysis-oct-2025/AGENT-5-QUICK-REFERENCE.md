# AGENT 5: QUICK REFERENCE - DATABASE QUERY VALIDATOR

**1-Minute Diagnostic Tool**

---

## SCHNELLSTART

```bash
# Option 1: PHP-Skript ausführen
wp eval-file agent-5-database-validator.php

# Option 2: Einzelne Query in MySQL
mysql -u root -p wordpress_db < query1-hpos-check.sql
```

---

## DIE 5 WICHTIGSTEN QUERIES

### 1️⃣ HPOS CHECK (Wichtigste Query!)
```sql
SELECT order_id, meta_key, LENGTH(meta_value) AS size
FROM deo6_wc_orders_meta
WHERE meta_key = '_design_data'
  AND order_id = 5374;
```

**Erwartung:** 1 Zeile mit `size > 100`
- **✅ JA:** Alles OK
- **❌ NEIN:** Führe Query 2 + 3 aus

---

### 2️⃣ LEGACY CHECK
```sql
SELECT post_id, meta_key, LENGTH(meta_value) AS size
FROM deo6_postmeta
WHERE meta_key = '_design_data'
  AND post_id = 5374;
```

**Erwartung:** 0 Zeilen (falls HPOS aktiv)
- **✅ 0 Zeilen:** Order ist HPOS-migriert
- **⚠️ 1+ Zeilen:** Order ist noch PRE-HPOS

---

### 3️⃣ ITEM-LEVEL CHECK
```sql
SELECT oi.order_id, oim.meta_key, LENGTH(oim.meta_value) AS size
FROM deo6_woocommerce_order_itemmeta oim
JOIN deo6_woocommerce_order_items oi ON oim.order_item_id = oi.order_item_id
WHERE oim.meta_key IN ('_design_data', '_db_processed_views')
  AND oi.order_id = 5374;
```

**Erwartung:** 1+ Zeilen
- **✅ JA:** Item-Daten vorhanden (normal)
- **❌ NEIN:** Keine Design-Produkte in Order

---

### 4️⃣ TYPO-CHECK (Find misspelled keys)
```sql
SELECT DISTINCT meta_key, COUNT(*) AS count
FROM deo6_wc_orders_meta
WHERE meta_key LIKE '%design%'
GROUP BY meta_key;
```

**Erwartung:** Nur `_design_data` (mit Unterstrich!)
- **✅ Nur _design_data:** Korrekt
- **❌ design_data (ohne _):** TYPO gefunden!

---

### 5️⃣ EMPTY-DATA CHECK
```sql
SELECT order_id, LENGTH(meta_value) AS size, meta_value
FROM deo6_wc_orders_meta
WHERE meta_key = '_design_data'
  AND order_id = 5374;
```

**Erwartung:** `size > 100` Bytes
- **✅ size > 100:** Daten vorhanden
- **❌ size = 2 (`{}`):** Leere Daten!
- **❌ size = 0:** NULL-Wert!

---

## DIAGNOSE-MATRIX (5-Sekunden-Check)

| Query 1 (HPOS) | Query 2 (Legacy) | Query 3 (Item) | → Diagnose                  | → Action                     |
|----------------|------------------|----------------|-----------------------------|-----------------------------|
| ✅ Gefunden    | ❌ Leer          | ✅ Gefunden    | **Perfekt!**                | Keine                       |
| ❌ Leer        | ✅ Gefunden      | ✅ Gefunden    | **HPOS unmigriert**         | `wp wc hpos sync`           |
| ❌ Leer        | ❌ Leer          | ✅ Gefunden    | **Order-Save failed**       | Prüfe `$order->save()` logs |
| ❌ Leer        | ❌ Leer          | ❌ Leer        | **Keine Daten!**            | Prüfe Frontend-Integration  |
| ✅ 2 Bytes     | -                | -              | **Leeres JSON (`{}`)**      | Frontend sendet nichts      |

---

## CODE-REFERENZ

### Wo werden Daten GESPEICHERT?

**Datei:** `/workspaces/yprint_designtool/includes/class-octo-print-designer-wc-integration.php`

```php
// Zeile 2733-2735: Item-Level Save
$item->add_meta_data('_design_data', $json_string, true);

// Zeile 2734: Order-Level Save (WICHTIG!)
$order->update_meta_data('_design_data', $json_string);

// Zeile 2779: KRITISCH! Persist Order-Level
$result = $order->save(); // ← Wenn dies fehlschlägt, keine Order-Level Daten!
```

### Wo werden Daten GELESEN?

**Datei:** `/workspaces/yprint_designtool/includes/class-octo-print-designer-wc-integration.php`

```php
// Zeile 6784: Hauptquelle (Order-Level)
$stored_design_data = $order->get_meta('_design_data', true);

// Zeile 6840: Fallback (Item-Level)
$processed_views = $item->get_meta('_db_processed_views');
```

### Wo wird geprüft, ob Daten existieren?

**Datei:** `/workspaces/yprint_designtool/includes/class-octo-print-designer-wc-integration.php`

```php
// Zeile 6902-6914: has_design_data() Funktion
$stored_design_data = $order->get_meta('_design_data', true);
if (!empty($stored_design_data)) {
    // Prüfe, ob nicht nur {} oder []
    if ($trimmed !== '' && $trimmed !== '{}' && $trimmed !== '[]') {
        return true; // ← Button wird angezeigt
    }
}
```

---

## HÄUFIGSTE PROBLEME

### ❌ Problem 1: Button wird nicht angezeigt
**Ursache:** `has_design_data()` gibt `false` zurück
**Test:** Query 1 ausführen
**Lösung:** Wenn Query 1 leer → Query 2+3 prüfen

### ❌ Problem 2: AJAX gibt "No design data found" zurück
**Ursache:** `extract_design_data_with_canvas_metadata()` findet nichts
**Test:** Query 1 + Query 3 ausführen
**Lösung:** Wenn nur Query 3 Daten hat → Order-Level Save fehlgeschlagen

### ❌ Problem 3: Daten in Legacy + HPOS (Duplikat)
**Ursache:** Partial HPOS-Migration
**Test:** Query 4 ausführen
**Lösung:** `wp wc hpos sync` und Legacy-Cleanup

### ❌ Problem 4: Leere JSON-Objekte (`{}`)
**Ursache:** Frontend sendet keine Design-Daten
**Test:** Query 5 mit `size < 10`
**Lösung:** Prüfe `add_design_data_to_cart()` in Frontend

---

## WORDPRESS CLI COMMANDS

```bash
# HPOS-Migration erzwingen
wp wc hpos sync --batch-size=50

# HPOS-Status prüfen
wp wc hpos status

# Einzelne Order migrieren
wp wc hpos migrate 5374

# Meta-Daten einer Order anzeigen
wp post meta list 5374

# WooCommerce Order-Meta anzeigen
wp eval 'print_r(wc_get_order(5374)->get_meta_data());'

# Design-Daten direkt auslesen
wp eval 'echo wc_get_order(5374)->get_meta("_design_data");'
```

---

## DEBUG-LOGS

### Error-Logs durchsuchen
```bash
# Nach "extract_design_data" suchen
grep "EXTRACT" /var/log/wordpress/debug.log | tail -50

# Nach "has_design_data" suchen
grep "has_design_data" /var/log/wordpress/debug.log | tail -50

# Nach "Order-level design data" suchen
grep "Order-level design data" /var/log/wordpress/debug.log | tail -20
```

### Erwartete Log-Meldungen (OK)
```
✅ [EXTRACT] Found stored design data
✅ AGENT 7 has_design_data: Found _design_data (order meta)
✅ Order-level design data persisted for order #5374
```

### Fehlerhafte Log-Meldungen (Problem!)
```
❌ [EXTRACT] No design data found for Order #5374
❌ AGENT 7 has_design_data: No valid design data found for order 5374
❌ Failed to persist order-level design data for order #5374
```

---

## NÄCHSTE SCHRITTE BEI PROBLEMEN

### Wenn Query 1 (HPOS) leer ist:
1. Query 2 (Legacy) ausführen
2. Wenn Legacy vorhanden → `wp wc hpos sync`
3. Wenn Legacy leer → Query 3 (Item) ausführen
4. Wenn nur Item → Bug in `save_order_level_design_data()`

### Wenn Query 5 Typos zeigt:
1. Grep Frontend-Code: `grep -r "design_data" public/js/`
2. Prüfe, ob `_design_data` (mit Unterstrich) verwendet wird
3. Fix: Alle Vorkommen auf `_design_data` korrigieren

### Wenn alle Queries leer sind:
1. Prüfe Frontend-Integration: `add_design_data_to_cart()`
2. Test-Order erstellen und Checkout durchführen
3. Error-Logs live verfolgen: `tail -f debug.log | grep design`

---

## ZUSAMMENFASSUNG

**1 Minute Diagnostic:**
1. ✅ Query 1 ausführen (HPOS)
2. 📊 Query 5 ausführen (Typo-Check)
3. 🔍 Diagnose-Matrix anwenden
4. 🛠️ Action durchführen

**Dateien:**
- 📄 `AGENT-5-DATABASE-QUERY-VALIDATOR.md` - Vollständige Dokumentation
- 🐘 `agent-5-database-validator.php` - Ausführbares PHP-Skript
- 📋 `AGENT-5-QUICK-REFERENCE.md` - Diese Quick-Reference

**Erstellt von:** AGENT 5 - Database Query Validator
**Datum:** 2025-10-02
