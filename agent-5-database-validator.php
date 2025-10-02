<?php
/**
 * AGENT 5: DATABASE-QUERY-VALIDATOR
 *
 * Führt 5 SQL-Queries aus, um Design-Daten in der Datenbank zu lokalisieren
 *
 * USAGE:
 * wp eval-file agent-5-database-validator.php
 *
 * ODER:
 * php agent-5-database-validator.php (mit WordPress Bootstrap)
 */

// WordPress Bootstrap (falls direkt aufgerufen)
if (!defined('ABSPATH')) {
    require_once(__DIR__ . '/../../wp-load.php');
}

if (!function_exists('wc_get_order')) {
    die("❌ WooCommerce ist nicht installiert oder aktiviert!\n");
}

echo "\n";
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
echo "  AGENT 5: DATABASE-QUERY-VALIDATOR\n";
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
echo "  Mission: Prüfe, ob Design-Daten in der Datenbank sind\n";
echo "  Status: FORSCHUNG (Keine Änderungen)\n";
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
echo "\n";

global $wpdb;

// Test-Order IDs (Die letzten 5 Orders mit design-fähigen Produkten)
$test_order_ids = [5374, 5375, 5376, 5377, 5378];

echo "🔍 Test-Order IDs: " . implode(', ', $test_order_ids) . "\n";
echo "📊 Datenbank-Präfix: " . $wpdb->prefix . "\n\n";

// ============================================================================
// QUERY 1: HPOS Order-Level Meta (Primary Storage)
// ============================================================================
echo "\n";
echo "━━━ QUERY 1: HPOS Order-Level Meta (deo6_wc_orders_meta) ━━━\n\n";

$query1 = $wpdb->prepare("
    SELECT
        om.order_id,
        om.meta_key,
        LENGTH(om.meta_value) AS data_size_bytes,
        LEFT(om.meta_value, 200) AS preview_value,
        CASE
            WHEN om.meta_value LIKE '{%%' THEN 'JSON'
            WHEN om.meta_value LIKE 'a:%%' THEN 'SERIALIZED'
            WHEN om.meta_value LIKE 'http%%' THEN 'URL'
            ELSE 'STRING'
        END AS data_format
    FROM {$wpdb->prefix}wc_orders_meta om
    WHERE om.meta_key IN ('_design_data', '_mockup_image_url', '_yprint_template_id', '_db_processed_views')
      AND om.order_id IN (" . implode(',', array_fill(0, count($test_order_ids), '%d')) . ")
    ORDER BY om.order_id DESC, om.meta_key
", ...$test_order_ids);

$results1 = $wpdb->get_results($query1);

if (empty($results1)) {
    echo "❌ KEINE Daten in HPOS-Tabelle gefunden!\n";
    echo "   → Orders sind entweder PRE-HPOS oder Order-Level Save ist fehlgeschlagen\n";
    echo "   → Führe Query 2 (Legacy) und Query 3 (Item-Level) aus\n\n";
} else {
    echo "✅ HPOS-Daten gefunden: " . count($results1) . " Einträge\n\n";

    foreach ($results1 as $row) {
        echo "Order #{$row->order_id}\n";
        echo "  Meta-Key: {$row->meta_key}\n";
        echo "  Größe: {$row->data_size_bytes} Bytes\n";
        echo "  Format: {$row->data_format}\n";
        echo "  Preview: " . substr($row->preview_value, 0, 100) . "...\n";

        // Diagnose
        if ($row->meta_key === '_design_data') {
            if ($row->data_size_bytes > 50) {
                echo "  ✅ DIAGNOSE: Design-Daten korrekt gespeichert\n";
                echo "     → Button sollte angezeigt werden\n";
                echo "     → AJAX sollte funktionieren\n";
            } elseif ($row->data_size_bytes <= 2) {
                echo "  ⚠️ DIAGNOSE: Leere JSON-Daten ({})\n";
                echo "     → Frontend hat keine Daten gesendet\n";
                echo "     → Button wird NICHT angezeigt\n";
            } else {
                echo "  ⚠️ DIAGNOSE: Verdächtig kleine Datenmenge\n";
                echo "     → Möglicherweise korrupte Daten\n";
            }
        }

        echo "\n";
    }
}

// ============================================================================
// QUERY 2: Legacy Order-Level Meta (Pre-HPOS)
// ============================================================================
echo "\n";
echo "━━━ QUERY 2: Legacy Order-Level Meta (deo6_postmeta) ━━━\n\n";

$query2 = $wpdb->prepare("
    SELECT
        pm.post_id AS order_id,
        pm.meta_key,
        LENGTH(pm.meta_value) AS data_size_bytes,
        LEFT(pm.meta_value, 200) AS preview_value,
        CASE
            WHEN pm.meta_value LIKE '{%%' THEN 'JSON'
            WHEN pm.meta_value LIKE 'a:%%' THEN 'SERIALIZED'
            WHEN pm.meta_value LIKE 'http%%' THEN 'URL'
            ELSE 'STRING'
        END AS data_format,
        p.post_type,
        p.post_status
    FROM {$wpdb->prefix}postmeta pm
    INNER JOIN {$wpdb->prefix}posts p ON pm.post_id = p.ID
    WHERE pm.meta_key IN ('_design_data', '_mockup_image_url', '_yprint_template_id', '_db_processed_views')
      AND p.post_type = 'shop_order'
      AND pm.post_id IN (" . implode(',', array_fill(0, count($test_order_ids), '%d')) . ")
    ORDER BY pm.post_id DESC, pm.meta_key
", ...$test_order_ids);

$results2 = $wpdb->get_results($query2);

if (empty($results2)) {
    echo "❌ KEINE Daten in Legacy-Tabelle (postmeta) gefunden!\n";
    echo "   → Orders sind bereits HPOS-migriert oder komplett neu\n\n";
} else {
    echo "✅ Legacy-Daten gefunden: " . count($results2) . " Einträge\n\n";

    foreach ($results2 as $row) {
        echo "Order #{$row->order_id} (Legacy)\n";
        echo "  Meta-Key: {$row->meta_key}\n";
        echo "  Größe: {$row->data_size_bytes} Bytes\n";
        echo "  Format: {$row->data_format}\n";
        echo "  Post-Status: {$row->post_status}\n";
        echo "  Preview: " . substr($row->preview_value, 0, 100) . "...\n";

        // Diagnose: Prüfe, ob auch in HPOS vorhanden
        $in_hpos = false;
        foreach ($results1 as $hpos_row) {
            if ($hpos_row->order_id == $row->order_id && $hpos_row->meta_key == $row->meta_key) {
                $in_hpos = true;
                break;
            }
        }

        if ($in_hpos) {
            echo "  ⚠️ DIAGNOSE: Daten existieren in BEIDEN Tabellen (HPOS + Legacy)\n";
            echo "     → Partial Migration - WooCommerce verwendet HPOS-Version\n";
            echo "     → Legacy-Daten können gelöscht werden\n";
        } else {
            echo "  ⚠️ DIAGNOSE: Nur in Legacy-Tabelle vorhanden\n";
            echo "     → HPOS-Migration unvollständig\n";
            echo "     → Empfehlung: wp wc hpos sync\n";
        }

        echo "\n";
    }
}

// ============================================================================
// QUERY 3: Item-Level Meta (Line Items)
// ============================================================================
echo "\n";
echo "━━━ QUERY 3: Item-Level Meta (deo6_woocommerce_order_itemmeta) ━━━\n\n";

$query3 = $wpdb->prepare("
    SELECT
        oi.order_id,
        oi.order_item_id,
        oi.order_item_name AS product_name,
        oim.meta_key,
        LENGTH(oim.meta_value) AS data_size_bytes,
        LEFT(oim.meta_value, 200) AS preview_value,
        CASE
            WHEN oim.meta_value LIKE '{%%' THEN 'JSON'
            WHEN oim.meta_value LIKE 'a:%%' THEN 'SERIALIZED'
            WHEN oim.meta_value LIKE 'http%%' THEN 'URL'
            ELSE 'STRING'
        END AS data_format
    FROM {$wpdb->prefix}woocommerce_order_itemmeta oim
    INNER JOIN {$wpdb->prefix}woocommerce_order_items oi ON oim.order_item_id = oi.order_item_id
    WHERE oim.meta_key IN ('_design_data', '_db_processed_views', '_yprint_template_id', '_mockup_image_url', 'design_id', 'canvas_data')
      AND oi.order_id IN (" . implode(',', array_fill(0, count($test_order_ids), '%d')) . ")
    ORDER BY oi.order_id DESC, oi.order_item_id, oim.meta_key
", ...$test_order_ids);

$results3 = $wpdb->get_results($query3);

if (empty($results3)) {
    echo "❌ KEINE Daten auf Item-Level gefunden!\n";
    echo "   → Design-Daten wurden NUR auf Order-Level gespeichert\n";
    echo "   → ODER: Keine Design-Produkte in diesen Orders\n\n";
} else {
    echo "✅ Item-Level Daten gefunden: " . count($results3) . " Einträge\n\n";

    $current_order = null;
    foreach ($results3 as $row) {
        if ($current_order !== $row->order_id) {
            $current_order = $row->order_id;
            echo "\nOrder #{$row->order_id}\n";
        }

        echo "  Item #{$row->order_item_id}: {$row->product_name}\n";
        echo "    Meta-Key: {$row->meta_key}\n";
        echo "    Größe: {$row->data_size_bytes} Bytes\n";
        echo "    Format: {$row->data_format}\n";

        // Diagnose
        if ($row->meta_key === '_design_data') {
            // Prüfe, ob auch Order-Level vorhanden
            $has_order_level = false;
            foreach ($results1 as $hpos_row) {
                if ($hpos_row->order_id == $row->order_id && $hpos_row->meta_key == '_design_data') {
                    $has_order_level = true;
                    break;
                }
            }

            if ($has_order_level) {
                echo "    ✅ DIAGNOSE: Doppelte Speicherung (Order + Item) - NORMAL!\n";
                echo "       → save_design_data_to_order() Zeile 2733-2765\n";
            } else {
                echo "    ⚠️ DIAGNOSE: Nur Item-Level, kein Order-Level!\n";
                echo "       → save_order_level_design_data() fehlgeschlagen?\n";
                echo "       → Button wird NICHT angezeigt (Code prüft nur Order-Level)\n";
            }
        }

        if ($row->meta_key === '_db_processed_views') {
            echo "    🔄 DIAGNOSE: Legacy Format (processed_views)\n";
            echo "       → extract_design_data_with_canvas_metadata() wird konvertieren\n";
            echo "       → Zeile 6845: convert_processed_views_to_canvas_data()\n";
        }

        echo "\n";
    }
}

// ============================================================================
// QUERY 4: Vollständige Order-Übersicht
// ============================================================================
echo "\n";
echo "━━━ QUERY 4: Vollständige Order-Übersicht (ALLE Speicherorte) ━━━\n\n";

$query4 = "
    SELECT
        'HPOS_ORDER_META' AS storage_location,
        om.order_id,
        om.meta_key,
        LENGTH(om.meta_value) AS data_size_bytes,
        'CURRENT' AS migration_status
    FROM {$wpdb->prefix}wc_orders_meta om
    WHERE om.meta_key IN ('_design_data', '_db_processed_views')
      AND LENGTH(om.meta_value) > 10

    UNION ALL

    SELECT
        'LEGACY_POSTMETA' AS storage_location,
        pm.post_id AS order_id,
        pm.meta_key,
        LENGTH(pm.meta_value) AS data_size_bytes,
        'PRE_HPOS' AS migration_status
    FROM {$wpdb->prefix}postmeta pm
    INNER JOIN {$wpdb->prefix}posts p ON pm.post_id = p.ID
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
    FROM {$wpdb->prefix}woocommerce_order_itemmeta oim
    INNER JOIN {$wpdb->prefix}woocommerce_order_items oi ON oim.order_item_id = oi.order_item_id
    WHERE oim.meta_key IN ('_design_data', '_db_processed_views')
      AND LENGTH(oim.meta_value) > 10

    ORDER BY order_id DESC, storage_location
";

$results4 = $wpdb->get_results($query4);

if (empty($results4)) {
    echo "❌ KEINE Design-Daten in ALLEN Tabellen gefunden!\n";
    echo "   → Entweder wurden nie Design-Produkte bestellt\n";
    echo "   → ODER: Frontend-Integration ist fehlerhaft\n\n";
} else {
    echo "✅ Gesamt-Übersicht: " . count($results4) . " Einträge\n\n";

    // Gruppiere nach Order ID
    $orders_summary = [];
    foreach ($results4 as $row) {
        if (!isset($orders_summary[$row->order_id])) {
            $orders_summary[$row->order_id] = [];
        }
        $orders_summary[$row->order_id][] = $row;
    }

    foreach ($orders_summary as $order_id => $entries) {
        echo "Order #{$order_id}:\n";

        $locations = [];
        foreach ($entries as $entry) {
            $locations[] = $entry->storage_location;
            echo "  - {$entry->storage_location}: {$entry->meta_key} ({$entry->data_size_bytes} Bytes)\n";
        }

        // Diagnose
        $in_hpos = in_array('HPOS_ORDER_META', $locations);
        $in_legacy = in_array('LEGACY_POSTMETA', $locations);
        $in_items = in_array('ITEM_META', $locations);

        if ($in_hpos && $in_items && !$in_legacy) {
            echo "  ✅ PERFEKT: HPOS + Item-Level (kein Legacy)\n";
        } elseif ($in_hpos && $in_legacy) {
            echo "  ⚠️ WARNUNG: Daten in HPOS UND Legacy - Partial Migration\n";
        } elseif (!$in_hpos && $in_legacy) {
            echo "  ⚠️ WARNUNG: Nur Legacy - HPOS-Migration fehlgeschlagen\n";
        } elseif (!$in_hpos && !$in_legacy && $in_items) {
            echo "  ❌ FEHLER: Nur Item-Level - Order-Level Save fehlgeschlagen!\n";
        }

        echo "\n";
    }
}

// ============================================================================
// QUERY 5: Meta-Key Varianten-Suche (Typos finden)
// ============================================================================
echo "\n";
echo "━━━ QUERY 5: Meta-Key Varianten-Suche (Finde Typos) ━━━\n\n";

$query5 = "
    SELECT DISTINCT
        'HPOS_META' AS source_table,
        meta_key,
        COUNT(*) AS occurrence_count,
        SUM(LENGTH(meta_value)) AS total_data_size_bytes
    FROM {$wpdb->prefix}wc_orders_meta
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
    FROM {$wpdb->prefix}postmeta pm
    INNER JOIN {$wpdb->prefix}posts p ON pm.post_id = p.ID
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
    FROM {$wpdb->prefix}woocommerce_order_itemmeta
    WHERE meta_key LIKE '%design%'
       OR meta_key LIKE '%canvas%'
       OR meta_key LIKE '%mockup%'
       OR meta_key LIKE '%template%'
       OR meta_key LIKE '%processed%'
       OR meta_key LIKE '%yprint%'
    GROUP BY meta_key

    ORDER BY source_table, meta_key
";

$results5 = $wpdb->get_results($query5);

if (empty($results5)) {
    echo "❌ KEINE Design-bezogenen Meta-Keys gefunden!\n";
    echo "   → Entweder wurden nie Design-Daten gespeichert\n";
    echo "   → ODER: Meta-Keys verwenden komplett andere Namen\n\n";
} else {
    echo "✅ Meta-Key Varianten gefunden: " . count($results5) . " verschiedene Keys\n\n";

    $current_table = null;
    foreach ($results5 as $row) {
        if ($current_table !== $row->source_table) {
            $current_table = $row->source_table;
            echo "\n{$row->source_table}:\n";
            echo str_repeat('-', 80) . "\n";
        }

        echo sprintf(
            "  %-30s | %5d Vorkommen | %8d Bytes\n",
            $row->meta_key,
            $row->occurrence_count,
            $row->total_data_size_bytes
        );

        // Diagnose: Prüfe auf bekannte Typos
        if (strpos($row->meta_key, 'design') !== false && strpos($row->meta_key, '_design_data') === false) {
            echo "    ⚠️ WARNUNG: Unbekannte Design-Key Variante!\n";
            echo "       Erwarteter Key: _design_data\n";
            echo "       Gefundener Key: {$row->meta_key}\n";
        }
    }

    echo "\n";
}

// ============================================================================
// FINALE DIAGNOSE
// ============================================================================
echo "\n";
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
echo "  FINALE DIAGNOSE\n";
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
echo "\n";

$hpos_count = count($results1);
$legacy_count = count($results2);
$item_count = count($results3);

echo "📊 Statistik:\n";
echo "   - HPOS Order-Level: {$hpos_count} Einträge\n";
echo "   - Legacy Order-Level: {$legacy_count} Einträge\n";
echo "   - Item-Level: {$item_count} Einträge\n\n";

// Diagnose-Matrix
if ($hpos_count > 0 && $item_count > 0) {
    echo "✅ STATUS: Alles OK!\n";
    echo "   → Design-Daten korrekt auf HPOS Order-Level UND Item-Level gespeichert\n";
    echo "   → Button sollte angezeigt werden\n";
    echo "   → AJAX sollte funktionieren\n";
    echo "   → extract_design_data_with_canvas_metadata() sollte Daten finden\n\n";
} elseif ($hpos_count === 0 && $legacy_count > 0 && $item_count > 0) {
    echo "⚠️ STATUS: HPOS-Migration unvollständig!\n";
    echo "   → Daten sind nur in Legacy-Tabelle (postmeta) vorhanden\n";
    echo "   → WooCommerce sollte trotzdem funktionieren (\$order->get_meta() abstrahiert)\n";
    echo "   → EMPFEHLUNG: wp wc hpos sync ausführen\n\n";
} elseif ($hpos_count === 0 && $legacy_count === 0 && $item_count > 0) {
    echo "❌ STATUS: Order-Level Save fehlgeschlagen!\n";
    echo "   → Daten nur auf Item-Level vorhanden\n";
    echo "   → save_order_level_design_data() hat \$order->save() nicht ausgeführt\n";
    echo "   → Button wird NICHT angezeigt\n";
    echo "   → AJAX funktioniert NICHT\n";
    echo "   → ROOT CAUSE: Zeile 2779 in class-octo-print-designer-wc-integration.php\n\n";
} elseif ($hpos_count === 0 && $legacy_count === 0 && $item_count === 0) {
    echo "❌ STATUS: Keine Design-Daten gefunden!\n";
    echo "   → Entweder wurden keine Design-Produkte bestellt\n";
    echo "   → ODER: Frontend-Integration ist fehlerhaft\n";
    echo "   → ODER: Cart-Integration speichert keine Daten\n";
    echo "   → EMPFEHLUNG: Prüfe add_design_data_to_cart() Zeile 35 in WC-Integration\n\n";
} else {
    echo "⚠️ STATUS: Unklare Situation - manuelle Analyse erforderlich\n";
    echo "   → Prüfe Query-Ergebnisse oben im Detail\n\n";
}

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
echo "  AGENT 5 ABGESCHLOSSEN\n";
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
echo "\n";
