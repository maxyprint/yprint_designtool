# SQL-Queries für AGENT 5: Database Query Validator

Diese Queries helfen, Design-Daten in der WordPress/WooCommerce-Datenbank zu lokalisieren.

---

## SCHNELLSTART

### Option 1: Alle Queries im PHP-Skript ausführen
```bash
wp eval-file ../agent-5-database-validator.php
```

### Option 2: Einzelne Queries in MySQL ausführen
```bash
mysql -u root -p wordpress_db < query1-hpos-order-level.sql
```

### Option 3: phpMyAdmin (GUI)
1. phpMyAdmin öffnen
2. SQL-Tab wählen
3. Query-Datei Inhalt kopieren und einfügen
4. "Ausführen" klicken

---

## QUERY-ÜBERSICHT

| Query | Datei                         | Zweck                                      | Priorität |
|-------|-------------------------------|--------------------------------------------|-----------|
| 1     | query1-hpos-order-level.sql   | HPOS Order-Level Meta (Primary Storage)   | 🔴 HOCH   |
| 2     | query2-legacy-postmeta.sql    | Legacy Order-Level Meta (Pre-HPOS)         | 🟡 MITTEL |
| 3     | query3-item-level.sql         | Item-Level Meta (Line Items)               | 🟢 NIEDRIG|
| 4     | query4-full-overview.sql      | Vollständige Übersicht (Alle Speicherorte) | 🔴 HOCH   |
| 5     | query5-typo-finder.sql        | Meta-Key Varianten (Typos finden)          | 🟡 MITTEL |

---

## VERWENDUNG

### Schritt 1: Test-Order IDs anpassen
**WICHTIG:** Ersetze `5374, 5375, 5376, 5377, 5378` in allen Queries durch DEINE Order IDs!

```sql
-- Finde die letzten 5 Orders
SELECT ID, post_date, post_status
FROM deo6_posts
WHERE post_type = 'shop_order'
ORDER BY ID DESC
LIMIT 5;
```

### Schritt 2: Datenbank-Präfix prüfen
**WICHTIG:** Wenn dein Präfix NICHT `deo6_` ist, ersetze es in allen Queries!

```sql
-- Zeige WordPress-Präfix
SHOW TABLES LIKE '%posts';
-- Wenn du "wp_posts" siehst → Präfix ist "wp_"
-- Wenn du "deo6_posts" siehst → Präfix ist "deo6_"
```

**Suchen & Ersetzen in allen Dateien:**
```bash
sed -i 's/deo6_/wp_/g' query*.sql
```

### Schritt 3: Queries ausführen
```bash
# Query 1 (Wichtigste!)
mysql -u root -p wordpress_db < query1-hpos-order-level.sql > result1.txt

# Query 4 (Vollständige Übersicht)
mysql -u root -p wordpress_db < query4-full-overview.sql > result4.txt

# Query 5 (Typo-Check)
mysql -u root -p wordpress_db < query5-typo-finder.sql > result5.txt
```

---

## DIAGNOSE-WORKFLOW

### 1️⃣ Erste Diagnose (1 Minute)
```bash
# Führe Query 1 aus
mysql -u root -p wordpress_db < query1-hpos-order-level.sql

# Erwartung: Sollte _design_data zeigen
# ✅ JA → Alles OK, fertig!
# ❌ NEIN → Führe Query 2 + 3 aus
```

### 2️⃣ Tiefere Analyse (3 Minuten)
```bash
# Query 4: Wo sind die Daten?
mysql -u root -p wordpress_db < query4-full-overview.sql

# Diagnose:
# - Nur HPOS_ORDER_META → Perfekt!
# - Nur LEGACY_POSTMETA → wp wc hpos sync
# - Nur ITEM_META → Order-Level Save fehlgeschlagen
# - Leer → Keine Daten vorhanden
```

### 3️⃣ Typo-Check (1 Minute)
```bash
# Query 5: Sind die Meta-Keys korrekt?
mysql -u root -p wordpress_db < query5-typo-finder.sql

# Erwartung:
# ✅ Nur "_design_data" (mit _)
# ❌ "design_data" (ohne _) → Typo!
```

---

## ERWARTETE OUTPUTS

### ✅ Ideales Ergebnis (Query 1):
```
+----------+---------------+------------------+--------------------------------------+-------------+
| order_id | meta_key      | data_size_bytes  | preview_value                        | data_format |
+----------+---------------+------------------+--------------------------------------+-------------+
| 5374     | _design_data  | 4582             | {"objects":[{"type":"text","text":... | JSON        |
+----------+---------------+------------------+--------------------------------------+-------------+
```

### ❌ Problematisches Ergebnis (Query 1):
```
Empty set (0.00 sec)
```
→ **Action:** Query 2 + 3 ausführen!

### ⚠️ Leere Daten (Query 1):
```
+----------+---------------+------------------+---------------+-------------+
| order_id | meta_key      | data_size_bytes  | preview_value | data_format |
+----------+---------------+------------------+---------------+-------------+
| 5374     | _design_data  | 2                | {}            | JSON        |
+----------+---------------+------------------+---------------+-------------+
```
→ **Diagnose:** Frontend sendet keine Daten!

---

## TROUBLESHOOTING

### Fehler: "Table doesn't exist"
**Problem:** Datenbank-Präfix ist falsch
**Lösung:** Ersetze `deo6_` durch dein Präfix (z.B. `wp_`)

### Fehler: "Access denied"
**Problem:** MySQL-User hat keine Leserechte
**Lösung:**
```sql
GRANT SELECT ON wordpress_db.* TO 'your_user'@'localhost';
FLUSH PRIVILEGES;
```

### Keine Ergebnisse
**Problem:** Test-Order IDs existieren nicht
**Lösung:** Prüfe Order IDs:
```sql
SELECT ID FROM deo6_posts WHERE post_type = 'shop_order' ORDER BY ID DESC LIMIT 10;
```

---

## ZUSATZ-QUERIES

### Quick-Check: Einzelne Order
```sql
-- Prüfe Order 5374 (HPOS)
SELECT meta_key, LENGTH(meta_value) AS size
FROM deo6_wc_orders_meta
WHERE order_id = 5374
  AND meta_key LIKE '%design%';
```

### Quick-Check: Letzte 10 Orders mit Design-Daten
```sql
SELECT DISTINCT order_id
FROM deo6_wc_orders_meta
WHERE meta_key = '_design_data'
ORDER BY order_id DESC
LIMIT 10;
```

### Quick-Check: Daten-Größen-Statistik
```sql
SELECT
    AVG(LENGTH(meta_value)) AS avg_size,
    MIN(LENGTH(meta_value)) AS min_size,
    MAX(LENGTH(meta_value)) AS max_size,
    COUNT(*) AS total_orders
FROM deo6_wc_orders_meta
WHERE meta_key = '_design_data';
```

---

## WEITERFÜHRENDE LINKS

- **Vollständige Dokumentation:** `../AGENT-5-DATABASE-QUERY-VALIDATOR.md`
- **Quick Reference:** `../AGENT-5-QUICK-REFERENCE.md`
- **PHP-Skript:** `../agent-5-database-validator.php`

---

**Erstellt von:** AGENT 5 - Database Query Validator
**Datum:** 2025-10-02
